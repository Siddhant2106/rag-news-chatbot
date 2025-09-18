const redis = require('redis');

class RedisService {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    this.client.connect();
  }

  async saveMessage(sessionId, message) {
    try {
      const key = `chat:${sessionId}`;
      await this.client.lPush(key, JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
      
      // Set TTL to 24 hours
      await this.client.expire(key, 86400);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  async getSessionHistory(sessionId, limit = 50) {
    try {
      const key = `chat:${sessionId}`;
      const messages = await this.client.lRange(key, 0, limit - 1);
      return messages.map(msg => JSON.parse(msg)).reverse();
    } catch (error) {
      console.error('Error getting session history:', error);
      return [];
    }
  }

  async clearSession(sessionId) {
    try {
      const key = `chat:${sessionId}`;
      await this.client.del(key);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }
}

module.exports = new RedisService();
