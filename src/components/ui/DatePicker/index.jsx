import React, { forwardRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const DatePicker = forwardRef(({
  value,
  onChange,
  placeholder,
  format = 'YYYY-MM-DD',
  disabledDate,
  minDate,
  maxDate,
  firstDayOfWeek = 0,
  className = '',
  disabled,
  ...rest
}, ref) => {
  // 将日期对象转换为字符串
  const formatDate = (date) => {
    if (!date) return '';

    // 确保我们有一个日期对象
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) return '';

    // 根据格式字符串格式化日期
    if (format === 'YYYY-MM-DD') {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return dateObj.toISOString().split('T')[0]; // 默认返回 YYYY-MM-DD 格式
  };

  // 将字符串转换为日期对象
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr);
  };

  // 内部状态跟踪输入值
  const [inputValue, setInputValue] = useState(formatDate(value));

  // 当外部 value 改变时更新内部状态
  useEffect(() => {
    setInputValue(formatDate(value));
  }, [value]);

  // 处理输入变化
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // 尝试解析日期并调用 onChange
    try {
      const dateObj = parseDate(newValue);
      if (dateObj && !isNaN(dateObj.getTime())) {
        // 检查是否是禁用的日期
        if (disabledDate && disabledDate(dateObj)) {
          return; // 如果是禁用的日期，不调用 onChange
        }
        onChange?.(dateObj);
      }
    } catch (error) {
      console.error('Invalid date format:', error);
    }
  };

  // 计算最小和最大日期的字符串表示
  const minDateStr = minDate ? formatDate(minDate) : undefined;
  const maxDateStr = maxDate ? formatDate(maxDate) : undefined;

  // 过滤掉非标准HTML属性
  const inputProps = {
    ...rest,
    ref,
    type: 'date',
    value: inputValue,
    onChange: handleChange,
    placeholder,
    className: 'ui-datepicker-input',
    min: minDateStr,
    max: maxDateStr,
    disabled
  };

  return (
    <div className={`ui-datepicker ${className}`}>
      <input {...inputProps} />
    </div>
  );
});

DatePicker.propTypes = {
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  format: PropTypes.string,
  disabledDate: PropTypes.func,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  firstDayOfWeek: PropTypes.number,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

DatePicker.displayName = 'DatePicker';

export { DatePicker };
