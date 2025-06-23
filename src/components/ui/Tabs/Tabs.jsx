import React, { useState, useEffect, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import './Tabs.scss';

const Tabs = ({
  defaultActiveKey,
  activeKey,
  onChange,
  children,
  type = 'line',
  tabPosition = 'top',
  size = 'default',
  animated = true,
  className = '',
  style = {},
  ...props
}) => {
  const [currentActiveKey, setCurrentActiveKey] = useState(activeKey || defaultActiveKey);

  const baseClass = 'custom-tabs';

  // 当外部activeKey变化时更新内部状态
  useEffect(() => {
    if (activeKey !== undefined) {
      setCurrentActiveKey(activeKey);
    }
  }, [activeKey]);

  // 处理标签页切换
  const handleTabClick = (key) => {
    if (activeKey === undefined) {
      setCurrentActiveKey(key);
    }

    if (onChange) {
      onChange(key);
    }
  };

  // 获取所有TabPane子组件
  const panes = Children.map(children, (child) => {
    if (!child || child.type.displayName !== 'TabPane') {
      return null;
    }
    return child;
  }).filter(Boolean);

  // 渲染标签页头部
  const renderTabNav = () => {
    return (
      <div className={`${baseClass}__nav`}>
        {panes.map((pane) => {
          const key = pane.props.tabKey || pane.key;
          const isActive = key === currentActiveKey;
          const tabClasses = [
            `${baseClass}__tab`,
            isActive ? `${baseClass}__tab--active` : '',
            pane.props.disabled ? `${baseClass}__tab--disabled` : ''
          ].filter(Boolean).join(' ');

          return (
            <div
              key={key}
              className={tabClasses}
              onClick={() => !pane.props.disabled && handleTabClick(key)}
            >
              {pane.props.tab}
            </div>
          );
        })}
        <div className={`${baseClass}__ink-bar`} style={getInkBarStyle()}></div>
      </div>
    );
  };

  // 计算下划线样式
  const getInkBarStyle = () => {
    if (type !== 'line' || !currentActiveKey) {
      return { display: 'none' };
    }

    const activeIndex = panes.findIndex((pane) => {
      const key = pane.props.tabKey || pane.key;
      return key === currentActiveKey;
    });

    if (activeIndex === -1) {
      return { display: 'none' };
    }

    if (tabPosition === 'top' || tabPosition === 'bottom') {
      return {
        width: `${100 / panes.length}%`,
        transform: `translateX(${activeIndex * 100}%)`,
        transition: 'transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)'
      };
    }

    return {
      height: `${100 / panes.length}%`,
      transform: `translateY(${activeIndex * 100}%)`,
      transition: 'transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)'
    };
  };

  // 渲染标签页内容
  const renderTabContent = () => {
    const contentClasses = [
      `${baseClass}__content`,
      animated ? `${baseClass}__content--animated` : ''
    ].filter(Boolean).join(' ');

    return (
      <div className={contentClasses}>
        {panes.map((pane) => {
          const key = pane.props.tabKey || pane.key;
          const isActive = key === currentActiveKey;

          return cloneElement(pane, {
            key,
            active: isActive,
            animated
          });
        })}
      </div>
    );
  };

  // 计算组件类名
  const classes = [
    baseClass,
    `${baseClass}--${type}`,
    `${baseClass}--${tabPosition}`,
    `${baseClass}--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style} {...props}>
      {(tabPosition === 'top' || tabPosition === 'left') && renderTabNav()}
      {renderTabContent()}
      {(tabPosition === 'bottom' || tabPosition === 'right') && renderTabNav()}
    </div>
  );
};

Tabs.propTypes = {
  defaultActiveKey: PropTypes.string,
  activeKey: PropTypes.string,
  onChange: PropTypes.func,
  children: PropTypes.node,
  type: PropTypes.oneOf(['line', 'card']),
  tabPosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  size: PropTypes.oneOf(['default', 'small', 'large']),
  animated: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default Tabs;
