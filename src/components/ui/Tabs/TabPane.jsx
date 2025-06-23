import React from 'react';
import PropTypes from 'prop-types';

const TabPane = ({
  tab,
  children,
  active,
  animated,
  forceRender = false,
  tabKey,
  disabled = false,
  className = '',
  style = {},
  ...props
}) => {
  const baseClass = 'custom-tabs__pane';

  // 如果不是激活状态且不强制渲染，则不渲染内容
  if (!active && !forceRender) {
    return null;
  }

  const classes = [
    baseClass,
    active ? `${baseClass}--active` : '',
    animated ? `${baseClass}--animated` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{
        display: active ? 'block' : 'none',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

TabPane.displayName = 'TabPane';

TabPane.propTypes = {
  tab: PropTypes.node.isRequired,
  children: PropTypes.node,
  active: PropTypes.bool,
  animated: PropTypes.bool,
  forceRender: PropTypes.bool,
  tabKey: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default TabPane;
