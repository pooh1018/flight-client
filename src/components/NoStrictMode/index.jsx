import React from 'react';

// 这个组件用于包装会触发 findDOMNode 警告的组件
const NoStrictMode = ({ children }) => {
  return children;
};

export default NoStrictMode;
