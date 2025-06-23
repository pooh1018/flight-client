import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Slider.scss';

/**
 * 滑块组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.range - 是否为范围滑块
 * @param {number|number[]} props.value - 滑块的值，单滑块为数字，范围滑块为数组
 * @param {number} props.min - 最小值
 * @param {number} props.max - 最大值
 * @param {number} props.step - 步长
 * @param {Object} props.marks - 标记点
 * @param {Function} props.onChange - 值变化时的回调
 * @param {Function} props.onChangeComplete - 值变化结束时的回调
 * @param {string} props.className - 自定义类名
 * @returns {JSX.Element} 滑块组件
 */
const Slider = ({
  range = false,
  value = range ? [0, 100] : 0,
  min = 0,
  max = 100,
  step = 1,
  marks = {},
  onChange,
  onChangeComplete,
  className = '',
}) => {
  // 转换为内部状态
  const [internalValue, setInternalValue] = useState(range ? [...value] : value);
  // 是否正在拖动
  const [isDragging, setIsDragging] = useState(false);
  // 当前拖动的滑块索引（范围滑块时使用）
  const [activeThumb, setActiveThumb] = useState(null);
  // 滑块轨道引用
  const trackRef = useRef(null);

  // 当外部value变化时，更新内部状态
  useEffect(() => {
    setInternalValue(range ? [...value] : value);
  }, [value, range]);

  // 计算滑块位置百分比
  const calculatePercentage = (val) => {
    return ((val - min) / (max - min)) * 100;
  };

  // 从鼠标位置计算值
  const calculateValueFromPosition = (clientX) => {
    if (!trackRef.current) return min;

    const { left, width } = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - left) / width));
    const rawValue = min + percentage * (max - min);

    // 应用步长
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };

  // 处理鼠标按下事件
  const handleMouseDown = (e, thumbIndex = null) => {
    e.preventDefault();
    setIsDragging(true);
    setActiveThumb(thumbIndex);

    // 添加全局鼠标事件监听
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newValue = calculateValueFromPosition(e.clientX);

    if (range) {
      const newValues = [...internalValue];

      if (activeThumb === 0) {
        // 左滑块不能超过右滑块
        newValues[0] = Math.min(newValues[1], newValue);
      } else if (activeThumb === 1) {
        // 右滑块不能小于左滑块
        newValues[1] = Math.max(newValues[0], newValue);
      } else {
        // 点击轨道时，确定移动哪个滑块
        const distToLower = Math.abs(newValue - internalValue[0]);
        const distToUpper = Math.abs(newValue - internalValue[1]);

        if (distToLower <= distToUpper) {
          newValues[0] = Math.min(internalValue[1], newValue);
          setActiveThumb(0);
        } else {
          newValues[1] = Math.max(internalValue[0], newValue);
          setActiveThumb(1);
        }
      }

      setInternalValue(newValues);
      if (onChange) onChange(newValues);
    } else {
      setInternalValue(newValue);
      if (onChange) onChange(newValue);
    }
  };

  // 处理鼠标抬起事件
  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveThumb(null);

    // 移除全局鼠标事件监听
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // 触发变化完成回调
    if (onChangeComplete) {
      onChangeComplete(internalValue);
    }
  };

  // 处理轨道点击事件
  const handleTrackClick = (e) => {
    if (isDragging) return;

    const newValue = calculateValueFromPosition(e.clientX);

    if (range) {
      // 确定移动哪个滑块
      const distToLower = Math.abs(newValue - internalValue[0]);
      const distToUpper = Math.abs(newValue - internalValue[1]);
      const newValues = [...internalValue];

      if (distToLower <= distToUpper) {
        newValues[0] = newValue;
      } else {
        newValues[1] = newValue;
      }

      setInternalValue(newValues);
      if (onChange) onChange(newValues);
      if (onChangeComplete) onChangeComplete(newValues);
    } else {
      setInternalValue(newValue);
      if (onChange) onChange(newValue);
      if (onChangeComplete) onChangeComplete(newValue);
    }
  };

  // 渲染标记点
  const renderMarks = () => {
    return Object.entries(marks).map(([value, label]) => {
      const percentage = calculatePercentage(Number(value));

      return (
        <div
          key={value}
          className="slider-mark"
          style={{ left: `${percentage}%` }}
        >
          <div className="slider-mark-dot"></div>
          {label && <div className="slider-mark-label">{label}</div>}
        </div>
      );
    });
  };

  // 计算填充轨道的样式
  const getTrackFillStyle = () => {
    if (range) {
      const lowerPercentage = calculatePercentage(internalValue[0]);
      const upperPercentage = calculatePercentage(internalValue[1]);

      return {
        left: `${lowerPercentage}%`,
        width: `${upperPercentage - lowerPercentage}%`,
      };
    } else {
      return {
        width: `${calculatePercentage(internalValue)}%`,
      };
    }
  };

  return (
    <div className={`slider-container ${className}`}>
      <div
        className="slider-track"
        ref={trackRef}
        onClick={handleTrackClick}
      >
        <div
          className="slider-track-fill"
          style={getTrackFillStyle()}
        ></div>

        {range ? (
          <>
            <div
              className={`slider-thumb ${activeThumb === 0 ? 'active' : ''}`}
              style={{ left: `${calculatePercentage(internalValue[0])}%` }}
              onMouseDown={(e) => handleMouseDown(e, 0)}
            ></div>
            <div
              className={`slider-thumb ${activeThumb === 1 ? 'active' : ''}`}
              style={{ left: `${calculatePercentage(internalValue[1])}%` }}
              onMouseDown={(e) => handleMouseDown(e, 1)}
            ></div>
          </>
        ) : (
          <div
            className={`slider-thumb ${isDragging ? 'active' : ''}`}
            style={{ left: `${calculatePercentage(internalValue)}%` }}
            onMouseDown={handleMouseDown}
          ></div>
        )}

        {Object.keys(marks).length > 0 && renderMarks()}
      </div>
    </div>
  );
};

Slider.propTypes = {
  range: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
  ]),
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  marks: PropTypes.object,
  onChange: PropTypes.func,
  onChangeComplete: PropTypes.func,
  className: PropTypes.string,
};

export default Slider;
