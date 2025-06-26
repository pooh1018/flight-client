import React, { useState, useEffect } from 'react';
import './index.scss';

const Message = {
  success: (content) => {
    showMessage('success', content);
  },
  error: (content) => {
    showMessage('error', content);
  },
  warning: (content) => {
    showMessage('warning', content);
  }
};

let messageContainer = null;

const showMessage = (type, content) => {
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    document.body.appendChild(messageContainer);
  }

  const message = document.createElement('div');
  message.className = `message message-${type}`;
  message.textContent = content;
  messageContainer.appendChild(message);

  setTimeout(() => {
    message.classList.add('fade-out');
    setTimeout(() => {
      message.remove();
      if (messageContainer && messageContainer.children.length === 0) {
        messageContainer.remove();
        messageContainer = null;
      }
    }, 300);
  }, 3000);
};

export { Message };
