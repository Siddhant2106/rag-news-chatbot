import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { socket, joinSession, sendMessage, onMessageReceived, onError } from '../services/socket';
import { createSession, getSessionHistory, clearSession, sendChatMessage } from '../services/api';
import '../styles/ChatPage.scss';

const ChatPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeSession();
    
    // Socket event listeners
    onMessageReceived((response) => {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
        message: response.response,
        sources: response.sources,
        timestamp: new Date().toISOString()
      }]);
      setLoading(false);
    });

    onError((error) => {
      setError(error.message);
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSession = async () => {
    try {
      const { sessionId: newSessionId } = await createSession();
      setSessionId(newSessionId);
      joinSession(newSessionId);
      
      // Load existing history
      const { history } = await getSessionHistory(newSessionId);
      setMessages(history);
    } catch (error) {
      setError('Failed to initialize session');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText) => {
    if (!sessionId) return;

    const userMessage = {
      id: uuidv4(),
      sender: 'user',
      message: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Send via REST API and get bot response
      const response = await sendChatMessage(sessionId, messageText);
      console.log('API response:', response); // <-- Add this line

      // Add bot response to messages (with fallback values)
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          sender: 'bot',
          message: response?.botMessage?.message || 'No response from server.',
          sources: response?.botMessage?.sources || [],
          timestamp: new Date().toISOString()
        }
      ]);
      setLoading(false);

      // Optionally, you can still send via socket if you want real-time updates elsewhere
      // sendMessage({
      //   sessionId,
      //   message: messageText,
      //   sender: 'user'
      // });
    } catch (error) {
      setError('Failed to send message');
      setLoading(false);
    }
  };

  const handleClearSession = async () => {
    if (!sessionId) return;
    
    try {
      await clearSession(sessionId);
      setMessages([]);
      // Create new session
      initializeSession();
    } catch (error) {
      setError('Failed to clear session');
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>RAG News Chatbot</h1>
        <button onClick={handleClearSession} className="clear-button">
          Clear Session
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>Welcome to News Chatbot!</h3>
            <p>Ask me anything about recent news and I'll help you find relevant information.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {loading && (
          <div className="loading-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <ChatInput onSendMessage={handleSendMessage} disabled={loading || !sessionId} />
    </div>
  );
};

export default ChatPage;
