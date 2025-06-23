import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Select.scss';

const Option = ({ value, children, disabled }) => {
  // This is just a placeholder component for configuration
  // The actual rendering is handled by the Select component
  return null;
};

Option.propTypes = {
  value: PropTypes.any.isRequired,
  children: PropTypes.node,
  disabled: PropTypes.bool
};

const Select = ({
  defaultValue,
  value,
  placeholder = '请选择',
  disabled = false,
  mode,
  options = [],
  onChange,
  onSearch,
  onFocus,
  onBlur,
  showSearch = false,
  allowClear = false,
  className = '',
  style = {},
  noMatchText = 'No data',
  children,
  filterable,  // 显式声明但不使用，这样它就不会传递给 DOM
  loading = false,
  ...restProps
}) => {
  // 过滤掉loading属性，防止传递到DOM
  const { loading: _, ...filteredProps } = restProps;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [searchValue, setSearchValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const selectRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const baseClass = 'custom-select';
  const isMultiple = mode === 'multiple';

  // Controlled or uncontrolled value
  const controlledValue = value !== undefined ? value : selectedValue;

  // Parse options from children if provided
  const selectOptions = children
    ? React.Children.map(children, (child) => {
        if (!React.isValidElement(child) || child.type !== Option) {
          return null;
        }

        return {
          value: child.props.value,
          label: child.props.children,
          disabled: child.props.disabled
        };
      }).filter(Boolean)
    : options.map(option => {
        if (typeof option === 'object') {
          return option;
        }
        return { value: option, label: option };
      });

  // Filter options based on search value
  const filteredOptions = searchValue && showSearch
    ? selectOptions.filter(option =>
        String(option.label).toLowerCase().includes(searchValue.toLowerCase()))
    : selectOptions;

  // Get selected option(s) label
  const getSelectedLabel = () => {
    // console.log('Select controlledValue:', controlledValue);
    // console.log('Select options:', selectOptions);

    if (isMultiple && Array.isArray(controlledValue)) {
      const labels = controlledValue.map(val => {
        const option = selectOptions.find(opt =>
          String(opt.value).toLowerCase() === String(val).toLowerCase()
        );
        return option ? option.label : val;
      });
      // console.log('Multiple select labels:', labels);
      return labels;
    } else {
      const option = selectOptions.find(opt =>
        String(opt.value).toLowerCase() === String(controlledValue).toLowerCase()
      );
      const label = option ? option.label : controlledValue;
      // console.log('Single select label:', label);
      return label;
    }
  };

  const classes = [
    baseClass,
    isOpen ? `${baseClass}--open` : '',
    disabled ? `${baseClass}--disabled` : '',
    isMultiple ? `${baseClass}--multiple` : '',
    className
  ].filter(Boolean).join(' ');

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchValue('');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex, filteredOptions]);

  // Scroll active option into view
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && dropdownRef.current) {
      const activeElement = dropdownRef.current.children[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, isOpen]);

  const toggleDropdown = () => {
    if (disabled) return;

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (!newIsOpen) {
      setSearchValue('');
      setActiveIndex(-1);
    } else if (onFocus) {
      onFocus();
    }
  };

  const handleOptionSelect = (option) => {
    if (option.disabled) return;

    let newValue;

    if (isMultiple) {
      const currentValues = Array.isArray(controlledValue) ? [...controlledValue] : [];
      const optionIndex = currentValues.indexOf(option.value);

      if (optionIndex === -1) {
        newValue = [...currentValues, option.value];
      } else {
        currentValues.splice(optionIndex, 1);
        newValue = currentValues;
      }

      // Keep dropdown open for multiple selection
      if (showSearch && inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      newValue = option.value;
      setIsOpen(false);
    }

    if (value === undefined) {
      setSelectedValue(newValue);
    }

    if (onChange) {
      onChange(newValue, option);
    }

    setSearchValue('');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setActiveIndex(-1);

    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();

    const newValue = isMultiple ? [] : undefined;

    if (value === undefined) {
      setSelectedValue(newValue);
    }

    if (onChange) {
      onChange(newValue);
    }

    setSearchValue('');
  };

  const handleRemoveTag = (e, tagValue) => {
    e.stopPropagation();

    if (disabled) return;

    const currentValues = Array.isArray(controlledValue) ? [...controlledValue] : [];
    const newValue = currentValues.filter(v => v !== tagValue);

    if (value === undefined) {
      setSelectedValue(newValue);
    }

    if (onChange) {
      onChange(newValue);
    }
  };

  const renderSingleValue = () => {
    const selectedLabel = getSelectedLabel();

    if (showSearch) {
      return (
        <input
          ref={inputRef}
          className={`${baseClass}__search-input`}
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={selectedLabel || placeholder}
          disabled={loading || disabled}
        />
      );
    }

    if (!selectedLabel) {
      return (
        <div className={`${baseClass}__placeholder`}>
          {placeholder}
        </div>
      );
    }

    return (
      <div className={`${baseClass}__single-value`}>
        {selectedLabel}
      </div>
    );
  };

  const renderMultipleValue = () => {
    const selectedLabels = getSelectedLabel();
    const hasValue = Array.isArray(controlledValue) && controlledValue.length > 0;

    return (
      <div className={`${baseClass}__multiple-value`}>
        {hasValue && Array.isArray(selectedLabels) && selectedLabels.map((label, index) => (
          <div key={controlledValue[index]} className={`${baseClass}__tag`}>
            <span className={`${baseClass}__tag-text`}>{label}</span>
            {!disabled && (
              <span
                className={`${baseClass}__tag-close`}
                onClick={(e) => handleRemoveTag(e, controlledValue[index])}
              >
                ×
              </span>
            )}
          </div>
        ))}

        {showSearch ? (
          <input
            ref={inputRef}
            className={`${baseClass}__search-input ${baseClass}__search-input--multiple`}
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={!hasValue ? placeholder : ''}
            disabled={loading || disabled}
          />
        ) : !hasValue && (
          <div className={`${baseClass}__placeholder`}>
            {placeholder}
          </div>
        )}
      </div>
    );
  };

  const renderClearIcon = () => {
    if (!allowClear || disabled) return null;

    const hasValue = isMultiple
      ? Array.isArray(controlledValue) && controlledValue.length > 0
      : controlledValue !== undefined && controlledValue !== null;

    if (!hasValue) return null;

    return (
      <span
        className={`${baseClass}__clear-icon`}
        onClick={handleClear}
      >
        ×
      </span>
    );
  };

  const renderArrowIcon = () => {
    return (
      <span className={`${baseClass}__arrow-icon`}>
        <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
          <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z" />
        </svg>
      </span>
    );
  };

  const isOptionSelected = (optionValue) => {
    if (isMultiple) {
      return Array.isArray(controlledValue) && controlledValue.includes(optionValue);
    }
    return controlledValue === optionValue;
  };

  return (
    <div
      ref={selectRef}
      className={classes}
      style={style}
      onClick={toggleDropdown}
      {...filteredProps}
    >
      {loading && (
        <div className={`${baseClass}__loading`}>
          <span className={`${baseClass}__loading-indicator`} />
        </div>
      )}
      <div className={`${baseClass}__selector`}>
        {isMultiple ? renderMultipleValue() : renderSingleValue()}

        <span className={`${baseClass}__suffix`}>
          {renderClearIcon()}
          {renderArrowIcon()}
        </span>
      </div>

      {isOpen && (
        <div className={`${baseClass}__dropdown`}>
          <div
            ref={dropdownRef}
            className={`${baseClass}__dropdown-menu`}
          >
            {filteredOptions.length === 0 ? (
              <div className={`${baseClass}__empty`}>
                {noMatchText}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`
                    ${baseClass}__option
                    ${isOptionSelected(option.value) ? `${baseClass}__option--selected` : ''}
                    ${option.disabled ? `${baseClass}__option--disabled` : ''}
                    ${activeIndex === index ? `${baseClass}__option--active` : ''}
                  `}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

Select.propTypes = {
  defaultValue: PropTypes.any,
  value: PropTypes.any,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  mode: PropTypes.oneOf(['default', 'multiple']),
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        label: PropTypes.node,
        value: PropTypes.any,
        disabled: PropTypes.bool
      })
    ])
  ),
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  showSearch: PropTypes.bool,
  allowClear: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  noMatchText: PropTypes.string,
  filterable: PropTypes.bool,
  loading: PropTypes.bool
};


Select.Option = Option;

export default Select;
