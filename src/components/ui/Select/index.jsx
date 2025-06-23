import React, { forwardRef, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const Select = forwardRef(({
  options = [],
  value,
  onChange,
  placeholder,
  showSearch = false,
  filterOption,
  className = '',
  noMatchText = 'No matches found',
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const selectRef = useRef(null);
  const inputRef = useRef(null);

  // 合并外部传入的ref和内部ref
  const mergedRef = (node) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
    selectRef.current = node;
  };

  // 获取当前选中项的标签
  const getSelectedLabel = () => {
    if (!value) return '';
    const selectedOption = options.find(option => option.value === value);
    return selectedOption ? selectedOption.label : '';
  };

  // 初始化输入框的值
  useEffect(() => {
    if (value) {
      setInputValue(getSelectedLabel());
    } else if (!showSearch || !isOpen) {
      setInputValue('');
    }
  }, [value, options, isOpen]);

  // 处理选项过滤
  useEffect(() => {
    if (!showSearch || !inputValue) {
      setFilteredOptions(options);
      return;
    }

    if (filterOption) {
      setFilteredOptions(options.filter(option => filterOption(inputValue, option)));
    } else {
      setFilteredOptions(options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      ));
    }
  }, [inputValue, options, showSearch, filterOption]);

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        if (showSearch && !value) {
          setInputValue('');
        } else if (!showSearch) {
          setInputValue(getSelectedLabel());
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value, showSearch]);

  // 处理输入变化
  const handleInputChange = (e) => {
    if (showSearch) {
      setInputValue(e.target.value);
      setIsOpen(true);
    }
  };

  // 处理选项点击
  const handleOptionClick = (option) => {
    onChange?.(option.value);
    setInputValue(option.label);
    setIsOpen(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 处理输入框点击
  const handleInputClick = () => {
    setIsOpen(true);
    if (showSearch && inputRef.current) {
      inputRef.current.select();
    }
  };

  // 处理键盘事件
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [isOpen, inputValue]);

  const scrollHighlightedOptionIntoView = (index) => {
    if (index === -1) return;

    const dropdown = document.getElementById('select-dropdown');
    const option = dropdown?.children[index + (filteredOptions.length === 0 ? 0 : 1)];

    if (dropdown && option) {
      const dropdownRect = dropdown.getBoundingClientRect();
      const optionRect = option.getBoundingClientRect();

      if (optionRect.bottom > dropdownRect.bottom) {
        dropdown.scrollTop += optionRect.bottom - dropdownRect.bottom;
      } else if (optionRect.top < dropdownRect.top) {
        dropdown.scrollTop += optionRect.top - dropdownRect.top;
      }
    }
  };

  useEffect(() => {
    if (isOpen && highlightedIndex !== -1) {
      scrollHighlightedOptionIntoView(highlightedIndex);
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // 处理输入框失去焦点
  const handleBlur = () => {
    setTimeout(() => {
      if (!selectRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        if (showSearch && !value) {
          setInputValue('');
        } else if (!showSearch) {
          setInputValue(getSelectedLabel());
        }
      }
    }, 200);
  };

  return (
    <div
      ref={mergedRef}
      className={`ui-select-container ${isOpen ? 'is-open' : ''} ${className}`}
      {...rest}
    >
      <input
        ref={inputRef}
        type="text"
        className={`ui-select ${isOpen ? 'is-active' : ''} ${value ? 'has-value' : ''} ${showSearch ? 'is-searchable' : ''}`}
        value={inputValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        readOnly={!showSearch}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? 'select-dropdown' : undefined}
      />

      {isOpen && (
        <div
          id="select-dropdown"
          className="ui-select-dropdown"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <div className="ui-select-empty">{noMatchText}</div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = value === option.value;
              const isHighlighted = index === highlightedIndex;
              return (
                <div
                  key={option.value}
                  className={`ui-select-option ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                  onClick={() => handleOptionClick(option)}
                  role="option"
                  aria-selected={isSelected}
                >
                  {option.label}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired
    })
  ),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  showSearch: PropTypes.bool,
  filterOption: PropTypes.func,
  className: PropTypes.string,
  noMatchText: PropTypes.string
};

Select.displayName = 'Select';

export { Select };
