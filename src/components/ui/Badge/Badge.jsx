import React from 'react';
import PropTypes from 'prop-types';
import './Badge.scss';

const Badge = ({
  count = 0,
  showZero = false,
  overflowCount = 99,
  dot = false,
  status,
  color,
  text,
  offset,
  title,
  children,
  className = '',
  style = {},
  ...props
}) => {
  // 判断是否显示徽标
  const showBadge = dot || (count > 0) || (count === 0 && showZero) || status || color;

  // 处理徽标内容
  const renderCount = () => {
    if (dot) {
      return null;
    }

    if (status || color) {
      return null;
    }

    if (count > overflowCount) {
      return `${overflowCount}+`;
    }

    return count;
  };

  // 处理徽标样式
  const getBadgeStyle = () => {
    const badgeStyle = {};

    if (color) {
      badgeStyle.backgroundColor = color;
    }

    if (offset && Array.isArray(offset) && offset.length === 2) {
      const [right, top] = offset;
      badgeStyle.right = -right;
      badgeStyle.marginTop = top;
    }

    return { ...badgeStyle, ...style };
  };

  // 构建类名
  const baseClass = 'custom-badge';
  const badgeClasses = [
    `${baseClass}__badge`,
    dot && `${baseClass}__badge--dot`,
    status && `${baseClass}__badge--${status}`,
    !children && `${baseClass}__badge--no-wrapper`,
    className
  ].filter(Boolean).join(' ');

  // 构建包装器类名
  const wrapperClass = children ? baseClass : '';

  // 渲染状态文本
  const renderText = () => {
    if (!text) {
      return null;
    }

    return <span className={`${baseClass}__text`}>{text}</span>;
  };

  // 渲染徽标
  const renderBadge = () => {
    if (!showBadge) {
      return null;
    }

    return (
      <sup
        className={badgeClasses}
        style={getBadgeStyle()}
        title={title || (typeof count === 'number' && count > overflowCount ? count.toString() : undefined)}
        {...props}
      >
        {renderCount()}
      </sup>
    );
  };

  // 如果没有子元素，只渲染徽标和文本
  if (!children) {
    return (
      <span className={wrapperClass}>
        <span className={`${baseClass}__status-dot`} style={{ backgroundColor: color }} />
        {renderText()}
        {renderBadge()}
      </span>
    );
  }

  // 渲染带有子元素的徽标
  return (
    <span className={wrapperClass}>
      {children}
      {renderBadge()}
    </span>
  );
};

Badge.propTypes = {
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showZero: PropTypes.bool,
  overflowCount: PropTypes.number,
  dot: PropTypes.bool,
  status: PropTypes.oneOf(['success', 'processing', 'default', 'error', 'warning']),
  color: PropTypes.string,
  text: PropTypes.node,
  offset: PropTypes.arrayOf(PropTypes.number),
  title: PropTypes.string,
  children: PropTypes.
node,
  className: PropTypes.string,
  style: PropTypes.object
};

export default Badge;
