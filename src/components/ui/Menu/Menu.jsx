import React, { useState, useEffect, createContext } from 'react';
import PropTypes from 'prop-types';
import './Menu.scss';

// 创建菜单上下文，用于在菜单组件树中共享状态
export const MenuContext = createContext({
  mode: 'vertical',
  selectedKeys: [],
  openKeys: [],
  onSelect: () => {},
  onOpenChange: () => {}
});

const Menu = ({
  mode = 'vertical',
  theme = 'light',
  defaultSelectedKeys = [],
  selectedKeys: propSelectedKeys,
  defaultOpenKeys = [],
  openKeys: propOpenKeys,
  onSelect,
  onOpenChange,
  className = '',
  style = {},
  children,
  ...props
}) => {
  // 控制选中的菜单项
  const [selectedKeys, setSelectedKeys] = useState(
    propSelectedKeys || defaultSelectedKeys || []
  );

  // 控制展开的子菜单
  const [openKeys, setOpenKeys] = useState(
    propOpenKeys || defaultOpenKeys || []
  );

  // 当外部属性变化时更新内部状态
  useEffect(() => {
    if (propSelectedKeys) {
      setSelectedKeys(propSelectedKeys);
    }
  }, [propSelectedKeys]);

  useEffect(() => {
    if (propOpenKeys) {
      setOpenKeys(propOpenKeys);
    }
  }, [propOpenKeys]);

  // 处理菜单项选择
  const handleSelect = (key, e) => {
    if (!propSelectedKeys) {
      setSelectedKeys([key]);
    }

    if (onSelect) {
      onSelect(key, e);
    }
  };

  // 处理子菜单展开/收起
  const handleOpenChange = (key, open) => {
    if (!propOpenKeys) {
      const newOpenKeys = [...openKeys];

      if (open) {
        if (!newOpenKeys.includes(key)) {
          newOpenKeys.push(key);
        }
      } else {
        const index = newOpenKeys.indexOf(key);
        if (index !== -1) {
          newOpenKeys.splice(index, 1);
        }
      }

      setOpenKeys(newOpenKeys);
    }

    if (onOpenChange) {
      onOpenChange(key, open);
    }
  };

  // 构建类名
  const baseClass = 'custom-menu';
  const classes = [
    baseClass,
    `${baseClass}--${mode}`,
    `${baseClass}--${theme}`,
    className
  ].filter(Boolean).join(' ');

  // 提供上下文值
  const contextValue = {
    mode,
    theme,
    selectedKeys,
    openKeys,
    onSelect: handleSelect,
    onOpenChange: handleOpenChange
  };

  return (
    <MenuContext.Provider value={contextValue}>
      <ul className={classes} style={style} role="menu" {...props}>
        {children}
      </ul>
    </MenuContext.Provider>
  );
};

Menu.propTypes = {
  mode: PropTypes.oneOf(['horizontal', 'vertical', 'inline']),
  theme: PropTypes.oneOf(['light', 'dark']),
  defaultSelectedKeys: PropTypes.arrayOf(PropTypes.string),
  selectedKeys: PropTypes.arrayOf(PropTypes.string),
  defaultOpenKeys: PropTypes.arrayOf(PropTypes.string),
  openKeys: PropTypes.arrayOf(PropTypes.string),
  onSelect: PropTypes.func,
  onOpenChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node
};

export default Menu;
