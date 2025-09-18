# RAG News Chatbot Backend

This is the backend for the **RAG News Chatbot**, an AI-powered chatbot that answers user questions about the latest news by retrieving and summarizing recent news articles using Retrieval-Augmented Generation (RAG) techniques.

## Features

- Fetches and ingests news articles from multiple RSS feeds.
- Stores article embeddings in a vector database (Qdrant) for semantic search.
- Uses Google Gemini (or other LLM) to generate answers based on retrieved news context.
- Supports chat sessions with history stored in Redis.
- REST API and real-time chat via Socket.IO.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Redis](https://redis.io/) running locally or accessible remotely
- [Qdrant](https://qdrant.tech/) vector database running locally or accessible remotely
- Google Gemini API key (or other LLM API key)

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Siddhant2106/rag-news-chatbot.git
   cd rag-news-chatbot/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the `backend` directory with the following content:

   ```
   PORT=5000
   QDRANT_URL=http://localhost:6333
   QDRANT_API_KEY=your_qdrant_api_key
   REDIS_URL=redis://localhost:6379
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   ```

   Adjust values as needed for your environment.

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000` by default.

## Usage

- The backend exposes REST endpoints under `/api/chat` for session management and messaging.
- Real-time chat is supported via Socket.IO on the same port.
- When a user sends a message, the backend:
  1. Retrieves relevant news articles using semantic search.
  2. Constructs a context from the articles.
  3. Calls the Gemini API to generate a response.
  4. Returns the answer and sources to the user.

## Project Structure

- `server.js` - Main entry point, sets up Express and Socket.IO.
- `routes/chat.js` - REST API routes for chat and session management.
- `services/ragService.js` - Core RAG logic: news ingestion, search, and LLM integration.
- `services/redisService.js` - Session and message storage in Redis.

## Troubleshooting

- **Cannot connect to Qdrant or Redis:**  
  Ensure both services are running and accessible at the URLs specified in `.env`.
- **Gemini API errors:**  
  Make sure your API key is valid and you are using the correct endpoint.
- **Network errors fetching news:**  
  Check your internet connection and DNS settings.

## License

MIT

---
```// filepath: c:\Projects\rag-news-chatbot\backend\README.md
# RAG News Chatbot Backend

This is the backend for the **RAG News Chatbot**, an AI-powered chatbot that answers user questions about the latest news by retrieving and summarizing recent news articles using Retrieval-Augmented Generation (RAG) techniques.

## Features

- Fetches and ingests news articles from multiple RSS feeds.
- Stores article embeddings in a vector database (Qdrant) for semantic search.
- Uses Google Gemini (or other LLM) to generate answers based on retrieved news context.
- Supports chat sessions with history stored in Redis.
- REST API and real-time chat via Socket.IO.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Redis](https://redis.io/) running locally or accessible remotely
- [Qdrant](https://qdrant.tech/) vector database running locally or accessible remotely
- Google Gemini API key (or other LLM API key)

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Siddhant2106/rag-news-chatbot.git
   cd rag-news-chatbot/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the `backend` directory with the following content:

   ```
   PORT=5000
   QANT_URL=http://localhost:6333
   QDRANT_API_KEY=your_qdrant_api_key
   REDIS_URL=redis://localhost:6379
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   ```

   Adjust values as needed for your environment.

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000` by default.

## Usage

- The backend exposes REST endpoints under `/api/chat` for session management and messaging.
- Real-time chat is supported via Socket.IO on the same port.
- When a user sends a message, the backend:
  1. Retrieves relevant news articles using semantic search.
  2. Constructs a context from the articles.
  3. Calls the Gemini API to generate a response.
  4. Returns the answer and sources to the user.

## Project Structure

- `server.js` - Main entry point, sets up Express and Socket.IO.
- `routes/chat.js` - REST API routes for chat and session management.
- `services/ragService.js` - Core RAG logic: news ingestion, search, and LLM integration.
- `services/redisService.js` - Session and message storage in Redis.

## Troubleshooting

- **Cannot connect to Qdrant or Redis:**  
  Ensure both services are running and accessible at the URLs specified in `.env`.
- **Gemini API errors:**  
  Make sure your API key is valid and you are using the correct endpoint.
- **Network errors fetching news:**  
  Check your internet connection and DNS settings.

##