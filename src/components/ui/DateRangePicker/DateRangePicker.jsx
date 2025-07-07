import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './DateRangePicker.scss';

const DateRangePicker = ({
  value,
  onChange,
  placeholder = ['开始日期', '结束日期'],
  format = 'YYYY-MM-DD',
  disabled = false,
  allowClear = true,
  className,
  style,
  size = 'middle',
  separator = '~',
  ranges = {
    '今天': [dayjs(), dayjs()],
    '昨天': [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
    '本周': [dayjs().startOf('week'), dayjs().endOf('week')],
    '上周': [dayjs().subtract(1, 'week').startOf('week'), dayjs().subtract(1, 'week').endOf('week')],
    '本月': [dayjs().startOf('month'), dayjs().endOf('month')],
    '上月': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
  },
  showRanges = true,
}) => {
  const [visible, setVisible] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState(value || [null, null]);
  const [activeInput, setActiveInput] = useState(0); // 0: start date, 1: end date
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [nextMonth, setNextMonth] = useState(dayjs().add(1, 'month'));

  const containerRef = useRef(null);
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  useEffect(() => {
    if (value) {
      setSelectedDates(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputClick = (index) => {
    if (disabled) return;
    setActiveInput(index);
    setVisible(true);
  };

  const handleDateSelect = (date) => {
    const newSelectedDates = [...selectedDates];

    if (activeInput === 0) {
      // 选择开始日期
      if (selectedDates[1] && date > selectedDates[1]) {
        // 如果选择的开始日期大于结束日期，则同时更新结束日期
        newSelectedDates[0] = date;
        newSelectedDates[1] = null;
        setActiveInput(1); // 切换到选择结束日期
      } else {
        newSelectedDates[0] = date;
        if (selectedDates[1]) {
          // 如果已经有结束日期，完成选择
          setVisible(false);
        } else {
          // 否则切换到选择结束日期
          setActiveInput(1);
        }
      }
    } else {
      // 选择结束日期
      if (selectedDates[0] && date < selectedDates[0]) {
        // 如果选择的结束日期小于开始日期，则更新开始日期
        newSelectedDates[0] = date;
        newSelectedDates[1] = null;
        setActiveInput(1); // 继续选择结束日期
      } else {
        newSelectedDates[1] = date;
        setVisible(false); // 完成选择
      }
    }

    setSelectedDates(newSelectedDates);

    if (newSelectedDates[0] && newSelectedDates[1]) {
      onChange && onChange(newSelectedDates);
    }
  };

  const handleMouseEnter = (date) => {
    setHoverDate(date);
  };

  const handleMouseLeave = () => {
    setHoverDate(null);
  };

  const handlePrevMonth = (isFirst) => {
    if (isFirst) {
      setCurrentMonth(currentMonth.subtract(1, 'month'));
    } else {
      setNextMonth(nextMonth.subtract(1, 'month'));
    }
  };

  const handleNextMonth = (isFirst) => {
    if (isFirst) {
      setCurrentMonth(currentMonth.add(1, 'month'));
    } else {
      setNextMonth(nextMonth.add(1, 'month'));
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedDates([null, null]);
    onChange && onChange([null, null]);
  };

  const handleRangeClick = (range) => {
    setSelectedDates(range);
    onChange && onChange(range);
    setVisible(false);
  };

  const renderCalendar = (month, isFirst) => {
    const daysInMonth = month.daysInMonth();
    const firstDayOfMonth = month.startOf('month').day(); // 0 is Sunday
    const lastDayOfPrevMonth = month.subtract(1, 'month').endOf('month').date();

    const days = [];

    // 上个月的日期
    for (let i = 0; i < firstDayOfMonth; i++) {
      const date = month.subtract(1, 'month').set('date', lastDayOfPrevMonth - firstDayOfMonth + i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.isSame(dayjs(), 'day'),
      });
    }

    // 当前月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = month.set('date', i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.isSame(dayjs(), 'day'),
      });
    }

    // 下个月的日期
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const date = month.add(1, 'month').set('date', i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.isSame(dayjs(), 'day'),
      });
    }

    return (
      <div className="date-range-picker-calendar">
        <div className="date-range-picker-header">
          <button
            className="date-range-picker-prev-btn"
            onClick={() => handlePrevMonth(isFirst)}
          >
            &lt;
          </button>
          <div className="date-range-picker-month-year">
            {month.format('YYYY年MM月')}
          </div>
          <button
            className="date-range-picker-next-btn"
            onClick={() => handleNextMonth(isFirst)}
          >
            &gt;
          </button>
        </div>
        <div className="date-range-picker-weekdays">
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <div key={index} className="date-range-picker-weekday">{day}</div>
          ))}
        </div>
        <div className="date-range-picker-days">
          {days.map((day, index) => {
            const isSelected =
              (selectedDates[0] && day.date.isSame(selectedDates[0], 'day')) ||
              (selectedDates[1] && day.date.isSame(selectedDates[1], 'day'));

            const isInRange = selectedDates[0] &&
              ((hoverDate && activeInput === 1 &&
                day.date.isAfter(selectedDates[0], 'day') &&
                day.date.isBefore(hoverDate, 'day')) ||
               (selectedDates[1] &&
                day.date.isAfter(selectedDates[0], 'day') &&
                day.date.isBefore(selectedDates[1], 'day')));

            const isStartDate = selectedDates[0] && day.date.isSame(selectedDates[0], 'day');
            const isEndDate = selectedDates[1] && day.date.isSame(selectedDates[1], 'day');

            return (
              <div
                key={index}
                className={classNames('date-range-picker-day', {
                  'date-range-picker-day-other-month': !day.isCurrentMonth,
                  'date-range-picker-day-today': day.isToday,
                  'date-range-picker-day-selected': isSelected,
                  'date-range-picker-day-in-range': isInRange,
                  'date-range-picker-day-start': isStartDate,
                  'date-range-picker-day-end': isEndDate,
                })}
                onClick={() => handleDateSelect(day.date)}
                onMouseEnter={() => handleMouseEnter(day.date)}
                onMouseLeave={handleMouseLeave}
              >
                {day.date.date()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRanges = () => {
    if (!showRanges) return null;

    return (
      <div className="date-range-picker-ranges">
        {Object.entries(ranges).map(([label, range]) => (
          <div
            key={label}
            className="date-range-picker-range-item"
            onClick={() => handleRangeClick(range)}
          >
            {label}
          </div>
        ))}
      </div>
    );
  };

  const containerClass = classNames('date-range-picker', {
    [`date-range-picker-${size}`]: size,
    'date-range-picker-disabled': disabled,
    [className]: className,
  });

  return (
    <div className={containerClass} style={style} ref={containerRef}>
      <div
        className={classNames('date-range-picker-input-container', {
          'date-range-picker-input-active': visible,
        })}
        onClick={() => !visible && handleInputClick(0)}
      >
        <div className="date-range-picker-inputs">
          <input
            ref={startInputRef}
            className="date-range-picker-input"
            placeholder={placeholder[0]}
            value={selectedDates[0] ? selectedDates[0].format(format) : ''}
            readOnly
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleInputClick(0);
            }}
          />
          <span className="date-range-picker-separator">{separator}</span>
          <input
            ref={endInputRef}
            className="date-range-picker-input"
            placeholder={placeholder[1]}
            value={selectedDates[1] ? selectedDates[1].format(format) : ''}
            readOnly
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleInputClick(1);
            }}
          />
        </div>
        <div className="date-range-picker-suffix">
          {allowClear && selectedDates[0] && (
            <span
              className="date-range-picker-clear-btn"
              onClick={handleClear}
            >
              ×
            </span>
          )}
          <CalendarOutlined className="date-range-picker-icon" />
        </div>
      </div>

      {visible && (
        <div className="date-range-picker-dropdown">
          <div className="date-range-picker-panels">
            {renderCalendar(currentMonth, true)}
            {renderCalendar(nextMonth, false)}
          </div>
          {renderRanges()}
        </div>
      )}
    </div>
  );
};

DateRangePicker.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
  placeholder: PropTypes.array,
  format: PropTypes.string,
  disabled: PropTypes.bool,
  allowClear: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  size: PropTypes.oneOf(['large', 'middle', 'small']),
  separator: PropTypes.string,
  ranges: PropTypes.object,
  showRanges: PropTypes.bool,
};

export default DateRangePicker;
