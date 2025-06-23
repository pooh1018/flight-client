import React from 'react';
import './index.scss';

const Loading = ({ size = 'default', text = '加载中...' }) => {
  const sizeClass = {
    small: 'loading-small',
    default: '',
    large: 'loading-large'
  }[size];

  return (
    <div className={`loading-container ${sizeClass}`}>
      <div className="loading-spinner">
        <svg viewBox="0 0 50 50" className="circular">
          <circle
            className="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
        </svg>
      </div>
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};

export default Loading;
