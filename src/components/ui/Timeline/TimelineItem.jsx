import React from 'react';
import PropTypes from 'prop-types';

const TimelineItem = ({
  children,
  dot,
  color,
  label,
  position = 'left',
  pending = false,
  last = false,
  className = '',
  style = {},
  ...props
}) => {
  // 构建类名
  const baseClass = 'custom-timeline-item';
  const classes = [
    baseClass,
    position === 'right' ? `${baseClass}--right` : '',
    pending ? `${baseClass}--pending` : '',
    last ? `${baseClass}--last` : '',
    className
  ].filter(Boolean).join(' ');

  // 获取点的颜色
  const getColorClass = () => {
    if (!color) {
      return '';
    }

    const presetColors = ['blue', 'red', 'green', 'gray'];
    return presetColors.includes(color) ? `${baseClass}__dot--${color}` : '';
  };

  // 渲染自定义点或默认点
  const renderDot = () => {
    if (dot) {
      return (
        <div className={`${baseClass}__dot ${baseClass}__dot--custom`}>
          {dot}
        </div>
      );
    }

    const dotStyle = color && !getColorClass() ? { backgroundColor: color } : {};
    const dotClasses = [
      `${baseClass}__dot`,
      getColorClass()
    ].filter(Boolean).join(' ');

    return <div className={dotClasses} style={dotStyle}></div>;
  };

  // 渲染标签
  const renderLabel = () => {
    if (!label) {
      return null;
    }

    return <div className={`${baseClass}__label`}>{label}</div>;
  };

  return (
    <li className={classes} style={style} {...props}>
      {renderLabel()}
      <div className={`${baseClass}__tail`}></div>
      {renderDot()}
      <div className={`${baseClass}__content`}>{children}</div>
    </li>
  );
};

TimelineItem.propTypes = {
  children: PropTypes.node,
  dot: PropTypes.node,
  color: PropTypes.string,
  label: PropTypes.node,
  position: PropTypes.oneOf(['left', 'right']),
  pending: PropTypes.bool,
  last: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default TimelineItem;
