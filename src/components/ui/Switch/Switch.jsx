import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Switch.scss';

const Switch = ({
  checked = false,
  defaultChecked = false,
  disabled = false,
  loading = false,
  size = 'default',
  onChange,
  checkedChildren,
  unCheckedChildren,
  className = '',
  style = {},
  ...props
}) => {
  // 内部状态
  const [innerChecked, setInnerChecked] = useState(defaultChecked);

  // 是否为受控组件
  const isControlled = 'checked' in props;
  const mergedChecked = isControlled ? checked : innerChecked;

  // 监听外部checked变化
  useEffect(() => {
    if (isControlled) {
      setInnerChecked(checked);
    }
  }, [checked, isControlled]);

  // 处理点击事件
  const handleClick = (e) => {
    if (disabled || loading) {
      return;
    }

    const newChecked = !mergedChecked;

    if (!isControlled) {
      setInnerChecked(newChecked);
    }

    if (onChange) {
      onChange(newChecked, e);
    }
  };

  // 构建类名
  const baseClass = 'custom-switch';
  const classes = [
    baseClass,
    mergedChecked ? `${baseClass}--checked` : '',
    disabled ? `${baseClass}--disabled` : '',
    loading ? `${baseClass}--loading` : '',
    size === 'small' ? `${baseClass}--small` : '',
    className
  ].filter(Boolean).join(' ');

  // 渲染加载图标
  const renderLoading = () => {
    if (!loading) {
      return null;
    }

    return <div className={`${baseClass}__loading`}></div>;
  };

  // 渲染内容
  const renderInner = () => {
    if (mergedChecked && checkedChildren) {
      return <span className={`${baseClass}__inner`}>{checkedChildren}</span>;
    }

    if (!mergedChecked && unCheckedChildren) {
      return <span className={`${baseClass}__inner`}>{unCheckedChildren}</span>;
    }

    return <span className={`${baseClass}__inner`}></span>;
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={mergedChecked}
      disabled={disabled || loading}
      className={classes}
      style={style}
      onClick={handleClick}
      {...props}
    >
      {renderInner()}
      <div className={`${baseClass}__handle`}>
        {renderLoading()}
      </div>
    </button>
  );
};

Switch.propTypes = {
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  size: PropTypes.oneOf(['default', 'small']),
  onChange: PropTypes.func,
  checkedChildren: PropTypes.node,
  unCheckedChildren: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object
};

export default Switch;
