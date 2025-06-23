import React from 'react';
import PropTypes from 'prop-types';

const Step = ({
  title,
  description,
  icon,
  status = 'wait',
  stepNumber,
  isLast = false,
  onClick,
  disabled = false,
  progressDot = false,
  direction = 'horizontal',
  className = '',
  style = {},
  ...props
}) => {
  // 构建类名
  const baseClass = 'custom-step';
  const classes = [
    baseClass,
    `${baseClass}--${status}`,
    disabled ? `${baseClass}--disabled` : '',
    isLast ? `${baseClass}--last` : '',
    className
  ].filter(Boolean).join(' ');

  // 处理点击事件
  const handleClick = () => {
    if (disabled) {
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  // 渲染图标
  const renderIcon = () => {
    if (progressDot) {
      return <span className={`${baseClass}__dot`} />;
    }

    if (icon) {
      return <span className={`${baseClass}__icon`}>{icon}</span>;
    }

    if (status === 'finish') {
      return (
        <span className={`${baseClass}__icon ${baseClass}__icon--finish`}>
          <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
            <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z" />
          </svg>
        </span>
      );
    }

    if (status === 'error') {
      return (
        <span className={`${baseClass}__icon ${baseClass}__icon--error`}>
          <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
            <path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 00-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z" />
            <path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
          </svg>
        </span>
      );
    }

    return <span className={`${baseClass}__number`}>{stepNumber}</span>;
  };

  // 渲染连接线
  const renderLine = () => {
    if (isLast) {
      return null;
    }

    return <div className={`${baseClass}__line`} />;
  };

  return (
    <div
      className={classes}
      style={style}
      onClick={handleClick}
      {...props}
    >
      <div className={`${baseClass}__head`}>
        <div className={`${baseClass}__icon-container`}>
          {renderIcon()}
        </div>
        {renderLine()}
      </div>
      <div className={`${baseClass}__content`}>
        <div className={`${baseClass}__title`}>{title}</div>
        {description && (
          <div className={`${baseClass}__description`}>{description}</div>
        )}
      </div>
    </div>
  );
};

Step.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  icon: PropTypes.node,
  status: PropTypes.oneOf(['wait', 'process', 'finish', 'error']),
  stepNumber: PropTypes.number,
  isLast: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  progressDot: PropTypes.bool,
  direction: PropTypes.oneOf(['horizontal', 'vertical']),
  className: PropTypes.string,
  style: PropTypes.object
};

export default Step;
