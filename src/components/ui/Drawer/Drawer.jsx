import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './Drawer.scss';

const Drawer = ({
  visible = false,
  title,
  children,
  width = 378,
  height = 378,
  placement = 'right',
  closable = true,
  maskClosable = true,
  mask = true,
  keyboard = true,
  onClose,
  afterVisibleChange,
  className = '',
  style = {},
  bodyStyle = {},
  headerStyle = {},
  footerStyle = {},
  maskStyle = {},
  footer,
  zIndex = 1000,
  destroyOnClose = false,
  ...props
}) => {
  const [animating, setAnimating] = useState(false);
  const [internalVisible, setInternalVisible] = useState(visible);
  const [destroyChild, setDestroyChild] = useState(false);

  // 处理可见性变化
  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      setAnimating(true);
      setTimeout(() => {
        setAnimating(false);
        if (afterVisibleChange) {
          afterVisibleChange(true);
        }
      }, 300);
    } else {
      setAnimating(true);
      setTimeout(() => {
        setInternalVisible(false);
        setAnimating(false);
        if (destroyOnClose) {
          setDestroyChild(true);
        }
        if (afterVisibleChange) {
          afterVisibleChange(false);
        }
      }, 300);
    }
  }, [visible, afterVisibleChange, destroyOnClose]);

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keyboard && e.keyCode === 27 && visible) {
        onClose && onClose(e);
      }
    };

    if (keyboard && visible) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyboard, visible, onClose]);

  // 处理遮罩层点击
  const handleMaskClick = (e) => {
    if (maskClosable && onClose) {
      onClose(e);
    }
  };

  // 处理关闭按钮点击
  const handleCloseClick = (e) => {
    if (onClose) {
      onClose(e);
    }
  };

  // 如果不可见且不在动画中，不渲染
  if (!internalVisible && !animating) {
    return null;
  }

  // 计算样式
  const drawerStyle = {};
  if (placement === 'left' || placement === 'right') {
    drawerStyle.width = typeof width === 'string' ? width : `${width}px`;
  } else {
    drawerStyle.height = typeof height === 'string' ? height : `${height}px`;
  }

  // 计算类名
  const baseClass = 'custom-drawer';
  const drawerClasses = [
    baseClass,
    `${baseClass}--${placement}`,
    visible ? `${baseClass}--open` : `${baseClass}--close`,
    animating ? `${baseClass}--animating` : '',
    className
  ].filter(Boolean).join(' ');

  // 渲染内容
  const renderContent = () => {
    if (destroyOnClose && destroyChild && !visible) {
      return null;
    }

    return (
      <div className={`${baseClass}__content`} style={{ ...drawerStyle, ...style }} {...props}>
        {closable && (
          <button
            type="button"
            onClick={handleCloseClick}
            aria-label="Close"
            className={`${baseClass}__close`}
          >
            <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
              <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9c-4.4 5.2-.7 13.1 6.1 13.1h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" />
            </svg>
          </button>
        )}
        {title && (
          <div className={`${baseClass}__header`} style={headerStyle}>
            <div className={`${baseClass}__title`}>{title}</div>
          </div>
        )}
        <div className={`${baseClass}__body`} style={bodyStyle}>
          {children}
        </div>
        {footer && (
          <div className={`${baseClass}__footer`} style={footerStyle}>
            {footer}
          </div>
        )}
      </div>
    );
  };

  return ReactDOM.createPortal(
    <div className={drawerClasses} style={{ zIndex }}>
      {mask && (
        <div
          className={`${baseClass}__mask`}
          onClick={handleMaskClick}
          style={maskStyle}
        />
      )}
      {renderContent()}
    </div>,
    document.body
  );
};

Drawer.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.node,
  children: PropTypes.node,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  closable: PropTypes.bool,
  maskClosable: PropTypes.bool,
  mask: PropTypes.bool,
  keyboard: PropTypes.bool,
  onClose: PropTypes.func,
  afterVisibleChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  bodyStyle: PropTypes.object,
  headerStyle: PropTypes.object,
  footerStyle: PropTypes.object,
  maskStyle: PropTypes.object,
  footer: PropTypes.node,
  zIndex: PropTypes.number,
  destroyOnClose: PropTypes.bool
};

export default Drawer;
