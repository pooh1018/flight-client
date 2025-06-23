import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '../Tooltip';
import { Icon } from '../Icon';
import './DatePicker.scss';

const DatePicker = ({
  value,
  defaultValue,
  onChange,
  format = 'YYYY-MM-DD',
  placeholder = 'Select date',
  disabled = false,
  allowClear = true,
  className = '',
  style = {},
  disabledDate = () => false,
  minDate = null,
  maxDate = null,
  ...restProps
}) => {
  // 过滤掉非标准HTML属性，只保留合法的DOM属性
  const domProps = Object.keys(restProps).reduce((acc, key) => {
    const validDomProps = ['id', 'name', 'title', 'aria-label', 'data-testid'];
    if (validDomProps.includes(key) || key.startsWith('data-') || key.startsWith('aria-')) {
      acc[key] = restProps[key];
    }
    return acc;
  }, {});
  // 获取当前日期
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(defaultValue || value);
  const [currentDate, setCurrentDate] = useState(selectedDate || today);
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('date'); // 'date', 'month', 'year'
  const datePickerRef = useRef(null);

  const baseClass = 'custom-datepicker';

  // 响应外部value变化
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setCurrentDate(value);
    }
  }, [value]);

  // 处理外部点击关闭日历
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
        setCurrentView('date');
        // 重置currentDate到选中日期或今天
        setCurrentDate(selectedDate || today);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 格式化日期 (用于输入显示)
  const formatDate = (date) => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  };

  // 格式化日期 (用于工具提示显示)
  const formatDisplayDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 解析日期字符串
  const parseDate = (dateString) => {
    if (!dateString) return null;

    const parts = dateString.split('-');
    if (parts.length !== 3) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    return new Date(year, month, day);
  };

  // 获取月份的天数
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 获取月份的第一天是星期几
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // 生成日历数据
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    // 上个月的日期
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }

    // 当前月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // 下个月的日期
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  // 生成月份数据
  const generateMonths = () => {
    const months = [];
    const year = currentDate.getFullYear();

    for (let i = 0; i < 12; i++) {
      months.push({
        date: new Date(year, i, 1),
        label: `${i + 1}`
      });
    }

    return months;
  };

  // 生成年份数据
  const generateYears = () => {
    const years = [];
    const currentYear = currentDate.getFullYear();
    const startYear = currentYear - 10;

    for (let i = 0; i < 20; i++) {
      years.push({
        year: startYear + i,
        label: `${startYear + i}`
      });
    }

    return years;
  };

  // 处理日期选择
  const handleDateSelect = (date) => {
    if (disabled) return;

    setSelectedDate(date);
    setIsOpen(false);
    setCurrentView('date');
    setCurrentDate(date); // 设置currentDate为选中的日期

    if (onChange) {
      onChange(date, formatDate(date));
    }
  };

  // 处理月份选择
  const handleMonthSelect = (date) => {
    setCurrentDate(date);
    setCurrentView('date');
  };

  // 处理年份选择
  const handleYearSelect = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setCurrentView('month');
  };

  // 切换月份
  const handleMonthChange = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  // 切换年份
  const handleYearChange = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + delta);
    setCurrentDate(newDate);
  };

  // 处理清除
  const handleClear = (e) => {
    e.stopPropagation();

    setSelectedDate(null);

    if (onChange) {
      onChange(null, '');
    }
  };

  // 渲染日历头部
  const renderHeader = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

    return (
      <div className={`${baseClass}__header`}>
        {currentView === 'date' && (
          <>
            <button
              type="button"
              className={`${baseClass}__header-btn`}
              onClick={(e) => {
                e.stopPropagation();
                handleMonthChange(-1);
              }}
            >
              ←
            </button>
            <span
              className={`${baseClass}__header-label`}
              onClick={() => setCurrentView('month')}
            >
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              type="button"
              className={`${baseClass}__header-btn`}
              onClick={(e) => {
                e.stopPropagation();
                handleMonthChange(1);
              }}
            >
              →
            </button>
          </>
        )}

        {currentView === 'month' && (
          <>
            <button
              type="button"
              className={`${baseClass}__header-btn`}
              onClick={(e) => {
                e.stopPropagation();
                handleYearChange(-1);
              }}
            >
              ←
            </button>
            <span
              className={`${baseClass}__header-label`}
              onClick={() => setCurrentView('year')}
            >
              {currentDate.getFullYear()}
            </span>
            <button
              type="button"
              className={`${baseClass}__header-btn`}
              onClick={(e) => {
                e.stopPropagation();
                handleYearChange(1);
              }}
            >
              →
            </button>
          </>
        )}

        {currentView === 'year' && (
          <>
            <button
              type="button"
              className={`${baseClass}__header-btn`}
              onClick={(e) => {
                e.stopPropagation();
                handleYearChange(-20);
              }}
            >
              ←
            </button>
            <span className={`${baseClass}__header-label`}>
              {currentDate.getFullYear() - 10} - {currentDate.getFullYear() + 9}
            </span>
            <button
              type="button"
              className={`${baseClass}__header-btn`}
              onClick={(e) => {
                e.stopPropagation();
                handleYearChange(20);
              }}
            >
              →
            </button>
          </>
        )}
      </div>
    );
  };

  // 渲染日历主体
  const renderBody = () => {
    if (currentView === 'date') {
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = generateCalendarDays();

      return (
        <div className={`${baseClass}__body`}>
          <div className={`${baseClass}__weekdays`}>
            {weekDays.map(day => (
              <div key={day} className={`${baseClass}__weekday`}>{day}</div>
            ))}
          </div>
          <div className={`${baseClass}__days`}>
            {days.map(({ date, isCurrentMonth }, index) => {
              const isSelected = selectedDate &&
                date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === today.toDateString();
              const isDisabled = !isDateAllowed(date);
              let disabledReason = '';
              
              if (isDisabled) {
                if (minDate && date < minDate) {
                  disabledReason = `Date is before ${formatDisplayDate(minDate)}`;
                } else if (maxDate && date > maxDate) {
                  disabledReason = `Date is after ${formatDisplayDate(maxDate)}`;
                } else if (disabledDate && disabledDate(date)) {
                  disabledReason = 'Date is disabled by custom rules';
                }
              }

              return (
                <Tooltip 
                  key={date.toISOString()}
                  content={disabledReason} 
                  disabled={!isDisabled}
                >
                  <div
                    className={`
                      ${baseClass}__day
                      ${isCurrentMonth ? '' : `${baseClass}__day--faded`}
                      ${isSelected ? `${baseClass}__day--selected` : ''}
                      ${isToday ? `${baseClass}__day--today` : ''}
                      ${isDisabled ? `${baseClass}__day--disabled` : ''}
                    `}
                    onClick={() => !isDisabled && handleDateSelect(date)}
                  >
                    {date.getDate()}
                    {isDisabled && (
                      <Icon 
                        name="block" 
                        className={`${baseClass}__disabled-icon`}
                      />
                    )}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentView === 'month') {
      const months = generateMonths();

      return (
        <div className={`${baseClass}__months`}>
          {months.map(({ date, label }) => (
            <div
              key={label}
              className={`${baseClass}__month`}
              onClick={() => handleMonthSelect(date)}
            >
              {label}
            </div>
          ))}
        </div>
      );
    }

    if (currentView === 'year') {
      const years = generateYears();

      return (
        <div className={`${baseClass}__years`}>
          {years.map(({ year, label }) => (
            <div
              key={year}
              className={`${baseClass}__year`}
              onClick={() => handleYearSelect(year)}
            >
              {label}
            </div>
          ))}
        </div>
      );
    }
  };

  const classes = [
    baseClass,
    disabled ? `${baseClass}--disabled` : '',
    className
  ].filter(Boolean).join(' ');

  // 检查日期是否在允许范围内
  const isDateAllowed = (date) => {
    if (disabledDate && disabledDate(date)) {
      return false;
    }
    if (minDate && date < minDate) {
      return false;
    }
    if (maxDate && date > maxDate) {
      return false;
    }
    return true;
  };

  return (
    <div
      ref={datePickerRef}
      className={classes}
      style={style}
      {...domProps}
    >
      <div
        className={`${baseClass}__input`}
        onClick={() => {
          if (!disabled) {
            // 打开日历时重置currentDate
            if (!isOpen) {
              setCurrentDate(selectedDate || today);
            }
            setIsOpen(!isOpen);
          }
        }}
      >
        {selectedDate ? (
          <span className={`${baseClass}__value`}>
            {formatDate(selectedDate)}
          </span>
        ) : (
          <span className={`${baseClass}__placeholder`}>
            {placeholder}
          </span>
        )}

        {allowClear && selectedDate && !disabled && (
          <span
            className={`${baseClass}__clear-btn`}
            onClick={handleClear}
          >
            ×
          </span>
        )}

        <span className={`${baseClass}__suffix`}>
          <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
            <path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className={`${baseClass}__dropdown`}>
          {renderHeader()}
          {renderBody()}
        </div>
      )}
    </div>
  );
};

DatePicker.propTypes = {
  value: PropTypes.instanceOf(Date),
  defaultValue: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
  format: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  allowClear: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  disabledDate: PropTypes.func,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date)
};

export default DatePicker;
