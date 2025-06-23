import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';

export const Button = ({
  children,
  type = 'default',
  size = 'medium',
  htmlType = 'button',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  ...rest
}) => {
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      type={htmlType}
      className={`ui-button ui-button-${type} ui-button-${size} ${loading ? 'is-loading' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...rest}
    >
      {loading && (
        <span className="ui-button-loading-icon">
          <svg viewBox="0 0 1024 1024" focusable="false" className="ui-icon ui-icon-loading" data-icon="loading">
            <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
          </svg>
        </span>
      )}
      <span>{children}</span>
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['default', 'primary', 'danger', 'link', 'text']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  htmlType: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func
};
