import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import CollapsePanel from './CollapsePanel';
import './Collapse.scss';

const Collapse = ({
  children,
  defaultActiveKey = [],
  activeKey,
  accordion = false,
  onChange,
  bordered = true,
  expandIconPosition = 'left',
  className = '',
  style = {},
  ...props
}) => {
  // 内部状态，当activeKey未提供时使用
  const [internalActiveKey, setInternalActiveKey] = useState(
    activeKey || defaultActiveKey || (accordion ? [] : [])
  );

  // 获取当前活动的key
  const currentActiveKey = activeKey !== undefined ? activeKey : internalActiveKey;

  // 处理面板切换
  const handlePanelClick = useCallback((panelKey) => {
    let newActiveKey = [...currentActiveKey];

    if (accordion) {
      newActiveKey = newActiveKey[0] === panelKey ? [] : [panelKey];
    } else {
      const index = newActiveKey.indexOf(panelKey);
      if (index > -1) {
        newActiveKey.splice(index, 1);
      } else {
        newActiveKey.push(panelKey);
      }
    }

    if (activeKey === undefined) {
      setInternalActiveKey(newActiveKey);
    }

    if (onChange) {
      onChange(accordion ? newActiveKey[0] || null : newActiveKey);
    }
  }, [accordion, currentActiveKey, activeKey, onChange]);

  // 构建类名
  const baseClass = 'custom-collapse';
  const classes = [
    baseClass,
    bordered ? `${baseClass}--bordered` : '',
    expandIconPosition === 'right' ? `${baseClass}--icon-right` : '',
    className
  ].filter(Boolean).join(' ');

  // 渲染子面板
  const renderPanels = () => {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      // 为每个面板添加属性
      const key = child.key || String(index);
      const isActive = currentActiveKey.indexOf(key) > -1;

      return React.cloneElement(child, {
        key,
        panelKey: key,
        isActive,
        expandIconPosition,
        onPanelClick: handlePanelClick
      });
    });
  };

  return (
    <div className={classes} style={style} {...props}>
      {renderPanels()}
    </div>
  );
};

Collapse.propTypes = {
  children: PropTypes.node,
  defaultActiveKey: PropTypes.arrayOf(PropTypes.string),
  activeKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  accordion: PropTypes.bool,
  onChange: PropTypes.func,
  bordered: PropTypes.bool,
  expandIconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  style: PropTypes.object
};

Collapse.Panel = CollapsePanel;

export default Collapse;
