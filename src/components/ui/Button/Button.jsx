import React from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

const Button = ({
  children,
  type = 'default',
  size = 'middle',
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  className = '',
  htmlType = 'button',
  block, // 解构但不使用，防止传递给DOM
  ...restProps // 只传递合法的DOM属性
}) => {
  const baseClass = 'custom-button';
  const classes = [
    baseClass,
    `${baseClass}--${type}`,
    `${baseClass}--${size}`,
    disabled ? `${baseClass}--disabled` : '',
    loading ? `${baseClass}--loading` : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  return (
    <button
      type={htmlType}
      className={classes}
      disabled={disabled}
      onClick={handleClick}
      {...restProps}
    >
      {loading && (
        <span className={`${baseClass}__loading-icon`}>
          <svg viewBox="0 0 50 50" className="loading-spinner">
            <circle cx="25" cy="25" r="20" fill="none" className="loading-spinner__circle" />
          </svg>
        </span>
      )}
      {icon && <span className={`${baseClass}__icon`}>{icon}</span>}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['default', 'primary', 'ghost', 'dashed', 'link', 'text', 'danger']),
  size: PropTypes.oneOf(['small', 'middle', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
  htmlType: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default Button;
