import React from 'react';
import PropTypes from 'prop-types';
import './Tag.scss';

const Tag = ({
  children,
  color,
  closable = false,
  onClose,
  onClick,
  icon,
  bordered = true,
  size = 'default',
  className = '',
  style = {},
  ...props
}) => {
  // 预设颜色
  const presetColors = [
    'blue',
    'red',
    'green',
    'orange',
    'yellow',
    'purple',
    'cyan',
    'gray'
  ];

  // 处理关闭事件
  const handleClose = (e) => {
    e.stopPropagation();
    onClose && onClose(e);
  };

  // 处理点击事件
  const handleClick = (e) => {
    onClick && onClick(e);
  };

  // 判断是否为预设颜色
  const isPresetColor = color && presetColors.includes(color);

  // 构建自定义样式
  const customStyle = { ...style };
  if (color && !isPresetColor) {
    customStyle.backgroundColor = color;
    customStyle.borderColor = color;
    customStyle.color = '#fff';
  }

  // 构建类名
  const baseClass = 'custom-tag';
  const classes = [
    baseClass,
    size !== 'default' && `${baseClass}--${size}`,
    color && isPresetColor && `${baseClass}--${color}`,
    !bordered && `${baseClass}--no-border`,
    onClick && `${baseClass}--clickable`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      style={customStyle}
      onClick={handleClick}
      {...props}
    >
      {icon && <span className={`${baseClass}__icon`}>{icon}</span>}
      <span className={`${baseClass}__text`}>{children}</span>
      {closable && (
        <span className={`${baseClass}__close`} onClick={handleClose}>
          <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
            <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9c-4.4 5.2-.7 13.1 6.1 13.1h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" />
          </svg>
        </span>
      )}
    </span>
  );
};

Tag.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  bordered: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  className: PropTypes.string,
  style: PropTypes.object
};

// 检查点组件
Tag.CheckableTag = ({
  children,
  checked = false,
  onChange,
  className = '',
  ...props
}) => {
  const handleClick = (e) => {
    onChange && onChange(!checked);
  };

  const classes = [
    'custom-tag',
    'custom-tag--checkable',
    checked && 'custom-tag--checked',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} onClick={handleClick} {...props}>
      {children}
    </span>
  );
};

Tag.CheckableTag.propTypes = {
  children: PropTypes.node,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string
};

export default Tag;
