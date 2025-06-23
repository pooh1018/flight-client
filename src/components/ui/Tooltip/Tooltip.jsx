import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './Tooltip.scss';

const Tooltip = ({
  children,
  title,
  placement = 'top',
  trigger = 'hover',
  visible,
  onVisibleChange,
  className = '',
  overlayClassName = '',
  style = {},
  overlayStyle = {},
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(visible || false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const childRef = useRef(null);
  const tooltipRef = useRef(null);
  const delayTimerRef = useRef(null);

  // 处理受控和非受控模式
  const isControlled = visible !== undefined;
  const tooltipVisible = isControlled ? visible : isVisible;

  // 计算tooltip位置
  const updatePosition = () => {
    if (!childRef.current || !tooltipRef.current) return;

    const childRect = childRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    let left = 0;
    let top = 0;

    switch (placement) {
      case 'top':
        left = childRect.left + childRect.width / 2 - tooltipRect.width / 2 + scrollLeft;
        top = childRect.top - tooltipRect.height - 8 + scrollTop;
        break;
      case 'bottom':
        left = childRect.left + childRect.width / 2 - tooltipRect.width / 2 + scrollLeft;
        top = childRect.bottom + 8 + scrollTop;
        break;
      case 'left':
        left = childRect.left - tooltipRect.width - 8 + scrollLeft;
        top = childRect.top + childRect.height / 2 - tooltipRect.height / 2 + scrollTop;
        break;
      case 'right':
        left = childRect.right + 8 + scrollLeft;
        top = childRect.top + childRect.height / 2 - tooltipRect.height / 2 + scrollTop;
        break;
      default:
        break;
    }

    // 确保tooltip不超出视口
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) {
      left = 0;
    } else if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width;
    }

    if (top < 0) {
      top = 0;
    } else if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height;
    }

    setPosition({ left, top });
  };

  // 处理显示/隐藏
  const handleVisibleChange = (visible) => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    const delay = visible ? mouseEnterDelay : mouseLeaveDelay;

    delayTimerRef.current = setTimeout(() => {
      if (!isControlled) {
        setIsVisible(visible);
      }
      if (onVisibleChange) {
        onVisibleChange(visible);
      }
      if (visible) {
        // 当显示时更新位置
        updatePosition();
      }
    }, delay * 1000);
  };

  // 事件处理
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      handleVisibleChange(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      handleVisibleChange(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      handleVisibleChange(!tooltipVisible);
    }
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        trigger === 'click' &&
        tooltipVisible &&
        childRef.current &&
        !childRef.current.contains(event.target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target)
      ) {
        handleVisibleChange(false);
      }
    };

    if (trigger === 'click' && tooltipVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [trigger, tooltipVisible]);

  // 窗口大小变化时更新位置
  useEffect(() => {
    const handleResize = () => {
      if (tooltipVisible) {
        updatePosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [tooltipVisible]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, []);

  // 渲染tooltip
  const renderTooltip = () => {
    if (!tooltipVisible || !title) return null;

    const baseClass = 'custom-tooltip';
    const tooltipClasses = [
      baseClass,
      `${baseClass}--${placement}`,
      overlayClassName
    ].filter(Boolean).join(' ');

    const tooltipStyle = {
      ...overlayStyle,
      left: `${position.left}px`,
      top: `${position.top}px`
    };

    return ReactDOM.createPortal(
      <div
        ref={tooltipRef}
        className={tooltipClasses}
        style={tooltipStyle}
      >
        <div className={`${baseClass}__content`}>{title}</div>
        <div className={`${baseClass}__arrow`} />
      </div>,
      document.body
    );
  };

  // 克隆子元素并添加事件处理
  const child = React.Children.only(children);
  const childProps = {
    ref: childRef,
    className: `${child.props.className || ''} ${className}`.trim(),
    style: { ...child.props.style, ...style },
    ...props
  };

  if (trigger === 'hover') {
    childProps.onMouseEnter = (e) => {
      handleMouseEnter();
      child.props.onMouseEnter?.(e);
    };
    childProps.onMouseLeave = (e) => {
      handleMouseLeave();
      child.props.onMouseLeave?.(e);
    };
  } else if (trigger === 'click') {
    childProps.onClick = (e) => {
      handleClick();
      child.props.onClick?.(e);
    };
  }

  return (
    <>
      {React.cloneElement(child, childProps)}
      {renderTooltip()}
    </>
  );
};

Tooltip.propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.node,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  trigger: PropTypes.oneOf(['hover', 'click']),
  visible: PropTypes.bool,
  onVisibleChange: PropTypes.func,
  className: PropTypes.string,
  overlayClassName: PropTypes.string,
  style: PropTypes.object,
  overlayStyle: PropTypes.object,
  mouseEnterDelay: PropTypes.number,
  mouseLeaveDelay: PropTypes.number
};

export default Tooltip;
