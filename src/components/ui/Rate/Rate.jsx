import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Rate.scss';

const Rate = ({
  count = 5,
  value = 0,
  defaultValue = 0,
  allowHalf = false,
  allowClear = true,
  disabled = false,
  character = '★',
  tooltips = [],
  onChange,
  className = '',
  style = {},
  ...props
}) => {
  // 状态管理
  const [rateValue, setRateValue] = useState(value || defaultValue);
  const [hoverValue, setHoverValue] = useState(undefined);
  const [focused, setFocused] = useState(false);

  // 同步外部value变化
  useEffect(() => {
    if ('value' in props) {
      setRateValue(value);
    }
  }, [props, value]);

  // 处理鼠标悬停
  const handleMouseEnter = useCallback((event, index) => {
    if (disabled) return;

    const isHalf = allowHalf &&
      event.target.getAttribute('data-half') &&
      (event.clientX - event.target.getBoundingClientRect().left) < event.target.clientWidth / 2;

    setHoverValue(isHalf ? index + 0.5 : index + 1);
  }, [allowHalf, disabled]);

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    setHoverValue(undefined);
  }, [disabled]);

  // 处理点击
  const handleClick = useCallback((event, index) => {
    if (disabled) return;

    const isHalf = allowHalf &&
      event.target.getAttribute('data-half') &&
      (event.clientX - event.target.getBoundingClientRect().left) < event.target.clientWidth / 2;

    const newValue = isHalf ? index + 0.5 : index + 1;

    if (allowClear && newValue === rateValue) {
      setRateValue(0);
      if (onChange) {
        onChange(0);
      }
    } else {
      setRateValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  }, [allowClear, allowHalf, disabled, onChange, rateValue]);

  // 处理键盘事件
  const handleKeyDown = useCallback((event) => {
    if (disabled) return;

    const { keyCode } = event;

    if (keyCode === 37 || keyCode === 40) { // 左箭头或下箭头
      event.preventDefault();
      const newValue = Math.max(0, rateValue - (allowHalf ? 0.5 : 1));
      setRateValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    } else if (keyCode === 39 || keyCode === 38) { // 右箭头或上箭头
      event.preventDefault();
      const newValue = Math.min(count, rateValue + (allowHalf ? 0.5 : 1));
      setRateValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  }, [allowHalf, count, disabled, onChange, rateValue]);

  // 构建类名
  const baseClass = 'custom-rate';
  const classes = [
    baseClass,
    disabled ? `${baseClass}--disabled` : '',
    focused ? `${baseClass}--focused` : '',
    className
  ].filter(Boolean).join(' ');

  // 渲染星星
  const renderStars = () => {
    const stars = [];
    const currentValue = hoverValue === undefined ? rateValue : hoverValue;

    for (let i = 0; i < count; i++) {
      // 计算星星状态
      let starValue = i + 1;
      let isActive = currentValue >= starValue;
      let isHalfActive = allowHalf && currentValue === i + 0.5;

      // 获取提示文本
      const tooltip = tooltips[i] || '';

      stars.push(
        <li
          key={i}
          className={`${baseClass}__star ${isActive ? `${baseClass}__star--active` : ''}`}
          onMouseEnter={(e) => handleMouseEnter(e
, i)}
          onClick={(e) => handleClick(e, i)}
          title={tooltip}
        >
          <div className={`${baseClass}__star-first`} data-half="true">
            {isHalfActive && <span className={`${baseClass}__star-content`}>{character}</span>}

</div>
          <div className={`${baseClass}__star-second`}>
            <span className={`${baseClass}__star-content`}>{character}</span>
          </div>
        </li>
      );
    }

    return stars;
  };


return (
    <ul
      className={classes}
      style={style}
      onMouseLeave={handleMouseLeave}

      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="radiogroup"
      {...props}
    >
      {renderStars()}
    </ul>
  );
};

Rate.propTypes = {
  count: PropTypes.number,
  value: PropTypes.number,
  defaultValue: PropTypes.number,
  allowHalf: PropTypes.bool,
  allowClear: PropTypes.bool,
  disabled: PropTypes.bool,
  character: PropTypes.node,
  tooltips: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

export default Rate;
