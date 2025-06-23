import React from 'react';
import PropTypes from 'prop-types';

const CollapsePanel = ({
  children,
  header,
  panelKey,
  isActive = false,
  disabled = false,
  showArrow = true,
  extra,
  expandIconPosition = 'left',
  onPanelClick,
  className = '',
  style = {},
  ...props
}) => {
  // 构建类名
  const baseClass = 'custom-collapse-panel';
  const classes = [
    baseClass,
    isActive ? `${baseClass}--active` : '',
    disabled ? `${baseClass}--disabled` : '',
    className
  ].filter(Boolean).join(' ');

  // 处理面板点击
  const handlePanelClick = (e) => {
    e.preventDefault();
    if (!disabled && onPanelClick) {
      onPanelClick(panelKey);
    }
  };

  // 渲染箭头图标
  const renderArrow = () => {
    if (!showArrow) {
      return null;
    }

    return (
      <div className={`${baseClass}__arrow ${isActive ? `${baseClass}__arrow--active` : ''}`}>
        <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
          <path d="M512 714.6L95.2 297.8c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L512 623.9l371.5-371.5c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L512 714.6z" />
        </svg>
      </div>
    );
  };

  // 渲染额外内容
  const renderExtra = () => {
    if (!extra) {
      return null;
    }

    return (
      <div
        className={`${baseClass}__extra`}
        onClick={(e) => e.stopPropagation()}
      >
        {extra}
      </div>
    );
  };

  // 渲染头部
  const renderHeader = () => {
    const headerCls = `${baseClass}__header`;

    return (
      <div
        className={headerCls}
        onClick={handlePanelClick}
        aria-expanded={isActive}
        aria-disabled={disabled}
      >
        {expandIconPosition === 'left' && renderArrow()}
        <div className={`${baseClass}__header-text`}>{header}</div>
        {renderExtra()}
        {expandIconPosition === 'right' && renderArrow()}
      </div>
    );
  };

  // 渲染内容
  const renderContent = () => {
    const contentStyle = {
      display: isActive ? 'block' : 'none'
    };

    return (
      <div
        className={`${baseClass}__content`}
        style={contentStyle}
      >
        <div className={`${baseClass}__content-box`}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className={classes} style={style} {...props}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
};

CollapsePanel.propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  panelKey: PropTypes.string,
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
  showArrow: PropTypes.bool,
  extra: PropTypes.node,
  expandIconPosition: PropTypes.oneOf(['left', 'right']),
  onPanelClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

export default CollapsePanel;
