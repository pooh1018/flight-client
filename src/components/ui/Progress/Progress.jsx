import React from 'react';
import PropTypes from 'prop-types';
import './Progress.scss';

const Progress = ({
  type = 'line',
  percent = 0,
  showInfo = true,
  status,
  strokeColor,
  strokeWidth = 8,
  trailColor = '#f3f3f3',
  width = 120,
  format,
  size = 'default',
  className = '',
  style = {},
  ...props
}) => {
  // 确保百分比在0-100之间
  const validPercent = Math.max(0, Math.min(percent, 100));

  // 获取状态
  const getStatus = () => {
    if (status) {
      return status;
    }
    if (validPercent >= 100) {
      return 'success';
    }
    return 'normal';
  };

  // 获取进度文本
  const getProgressText = () => {
    if (!showInfo) {
      return null;
    }

    const currentStatus = getStatus();

    if (format) {
      return format(validPercent);
    }

    if (currentStatus === 'success') {
      return <span className="custom-progress__icon custom-progress__icon--success">✓</span>;
    }

    if (currentStatus === 'exception') {
      return <span className="custom-progress__icon custom-progress__icon--exception">✗</span>;
    }

    return `${validPercent}%`;
  };

  // 获取进度条颜色
  const getStrokeColor = () => {
    const currentStatus = getStatus();

    if (strokeColor) {
      return strokeColor;
    }

    if (currentStatus === 'success') {
      return '#52c41a';
    }

    if (currentStatus === 'exception') {
      return '#ff4d4f';
    }

    return '#1890ff';
  };

  // 构建类名
  const baseClass = 'custom-progress';
  const classes = [
    baseClass,
    `${baseClass}--${type}`,
    `${baseClass}--${getStatus()}`,
    `${baseClass}--${size}`,
    className
  ].filter(Boolean).join(' ');

  // 渲染线性进度条
  const renderLine = () => {
    const outerStyle = {
      height: strokeWidth,
      backgroundColor: trailColor,
    };

    const innerStyle = {
      width: `${validPercent}%`,
      height: strokeWidth,
      backgroundColor: getStrokeColor(),
      transition: 'width 0.3s ease',
    };

    return (
      <div className={`${baseClass}__outer`} style={outerStyle}>
        <div className={`${baseClass}__inner`} style={innerStyle}></div>
      </div>
    );
  };

  // 渲染环形进度条
  const renderCircle = () => {
    const circleSize = width;
    const strokeWidth = Math.max(strokeWidth, 6);
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - validPercent / 100);

    const circleStyle = {
      width: circleSize,
      height: circleSize,
    };

    const pathStyle = {
      stroke: getStrokeColor(),
      strokeWidth,
      strokeDasharray: `${circumference} ${circumference}`,
      strokeDashoffset,
      transition: 'stroke-dashoffset 0.3s ease',
    };

    const trailStyle = {
      stroke: trailColor,
      strokeWidth,
    };

    return (
      <div className={`${baseClass}__circle`} style={circleStyle}>
        <svg viewBox={`0 0 ${circleSize} ${circleSize}`}>
          <circle
            className={`${baseClass}__circle-trail`}
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            style={trailStyle}
          />
          <circle
            className={`${baseClass}__circle-path`}
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            style={pathStyle}
          />
        </svg>
        {showInfo && (
          <span className={`${baseClass}__circle-text`}>
            {getProgressText()}
          </span>
        )}
      </div>
    );
  };

  // 渲染进度信息
  const renderInfo = () => {
    if (!showInfo || type === 'circle') {
      return null;
    }

    return (
      <span className={`${baseClass}__text`}>
        {getProgressText()}
      </span>
    );
  };

  return (
    <div className={classes} style={style} {...props}>
      {type === 'line' ? renderLine() : renderCircle()}
      {type === 'line' && renderInfo()}
    </div>
  );
};

Progress.propTypes = {
  type: PropTypes.oneOf(['line', 'circle']),
  percent: PropTypes.number,
  showInfo: PropTypes.bool,
  status: PropTypes.oneOf(['success', 'exception', 'normal', 'active']),
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  trailColor: PropTypes.string,
  width: PropTypes.number,
  format: PropTypes.func,
  size: PropTypes.oneOf(['default', 'small']),
  className: PropTypes.string,
  style: PropTypes.object
};

export default Progress;
