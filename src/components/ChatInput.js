import React, { useState } from 'react';
import '../styles/ChatInput.scss';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about news..."
          disabled={disabled}
          className="message-input"
        />
        <button 
          type="submit" 
          disabled={!message.trim() || disabled}
          className="send-button"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
