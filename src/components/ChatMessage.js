import React from 'react';
import '../styles/ChatMessage.scss';

const ChatMessage = ({ message }) => {
  const { sender, message: text, sources, timestamp } = message;
  const isBot = sender === 'bot';

  return (
    <div className={`message ${isBot ? 'bot-message' : 'user-message'}`}>
      <div className="message-content">
        <div className="message-text">{text}</div>
        {isBot && sources && sources.length > 0 && (
          <div className="message-sources">
            <h4>Sources:</h4>
            <ul>
              {sources.map((source, index) => (
                <li key={index}>
                  <a href={source.link} target="_blank" rel="noopener noreferrer">
                    {source.title} - {source.source}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {timestamp && (
          <div className="message-timestamp">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
