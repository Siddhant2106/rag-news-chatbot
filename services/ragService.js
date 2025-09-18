const { QdrantClient } = require("@qdrant/js-client-rest");
const axios = require("axios");
const RssParser = require("rss-parser");
const { v4: uuidv4 } = require("uuid");

class RAGService {
  constructor() {
    this.qdrantClient = new QdrantClient({
      host: "localhost",
      port: 6333,
    });
    this.parser = new RssParser();
    this.collectionName = "news_articles";
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Create collection if it doesn't exist
      await this.createCollection();

      // Ingest news articles
      await this.ingestNewsArticles();

      this.isInitialized = true;
      console.log("RAG Service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize RAG service:", error);
      throw error;
    }
  }

  async createCollection() {
    try {
      const collections = await this.qdrantClient.getCollections();
      const exists = collections.collections.some(
        (collection) => collection.name === this.collectionName
      );

      if (!exists) {
        await this.qdrantClient.createCollection(this.collectionName, {
          vectors: {
            size: 768, // Jina embeddings dimension
            distance: "Cosine",
          },
        });
        console.log("Collection created successfully");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      throw error;
    }
  }

  async generateEmbedding(text) {
    try {
      const url = "https://api.jina.ai/v1/embeddings";
      const payload = {
        model: "jina-embeddings-v2-base-en",
        input: [text],
      }; // no "task" field

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.JINA_API_KEY}`,
          "User-Agent": "rag-news-chatbot/1.0",
        },
        timeout: 15000,
      });

      return response.data.data[0].embedding;
    } catch (err) {
      // Optional: log response detail if present
      if (err.response?.data?.detail) {
        console.error("Jina 422 detail:", err.response.data.detail);
      }
      throw err;
    }
  }

  async ingestNewsArticles() {
    const rssSources = [
      "https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/search?q=when:24h+allinurl:cnn.com&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss?pz=1&cf=all&hl=en-US&gl=US&ceid=US:en",
      "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
    ];

    let allArticles = [];

    for (const rssUrl of rssSources) {
      try {
        const feed = await this.parser.parseURL(rssUrl);
        const articles = feed.items.slice(0, 20); // Limit to 20 articles per source

        for (const article of articles) {
          const articleData = {
            id: uuidv4(),
            title: article.title,
            content: article.contentSnippet || article.content || "",
            link: article.link,
            pubDate: article.pubDate,
            source: feed.title,
          };

          const fullText = `${articleData.title} ${articleData.content}`;
          const embedding = await this.generateEmbedding(fullText);

          allArticles.push({
            ...articleData,
            embedding,
          });

          // Add delay to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error processing RSS feed ${rssUrl}:`, error);
      }
    }

    // Batch upsert to Qdrant
    if (allArticles.length > 0) {
      const points = allArticles.map((article) => ({
        id: article.id,
        vector: article.embedding,
        payload: {
          title: article.title,
          content: article.content,
          link: article.link,
          pubDate: article.pubDate,
          source: article.source,
        },
      }));

      await this.qdrantClient.upsert(this.collectionName, {
        points,
      });

      console.log(`Ingested ${allArticles.length} articles`);
    }
  }

  async searchSimilarArticles(query, limit = 5) {
    try {
      const queryEmbedding = await this.generateEmbedding(query);

      const searchResult = await this.qdrantClient.search(this.collectionName, {
        vector: queryEmbedding,
        limit,
        with_payload: true,
      });

      return searchResult;
    } catch (error) {
      console.error("Error searching articles:", error);
      throw error;
    }
  }

  async generateResponse(query, context) {
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: `Based on the following news context, please answer the user's query. 
              
              Context: ${context}
              
              User Query: ${query}
              
              Please provide a comprehensive answer based on the news articles provided. If the context doesn't contain relevant information, please say so.`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": process.env.GEMINI_API_KEY,
          },
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }

  async processQuery(query) {
    if (!this.isInitialized) {
      throw new Error("RAG service not initialized");
    }

    // Search for relevant articles
    const similarArticles = await this.searchSimilarArticles(query);

    // Prepare context from retrieved articles
    const context = similarArticles
      .map(
        (result) =>
          `Title: ${result.payload.title}
      Content: ${result.payload.content}
      Source: ${result.payload.source}
      Link: ${result.payload.link}`
      )
      .join("\n\n");

    // Generate response using Gemini
    const response = await this.generateResponse(query, context);

    return {
      response,
      sources: similarArticles.map((result) => ({
        title: result.payload.title,
        link: result.payload.link,
        source: result.payload.source,
      })),
    };
  }
}

const ragService = new RAGService();

const initializeRAG = async () => {
  await ragService.initialize();
};

const handleChatMessage = async (data) => {
  return await ragService.processQuery(data.message);
};

module.exports = {
  initializeRAG,
  handleChatMessage,
  ragService,
};
