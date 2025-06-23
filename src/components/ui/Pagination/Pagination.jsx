import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Pagination.scss';

const Pagination = ({
  current = 1,
  defaultCurrent = 1,
  total = 0,
  pageSize = 10,
  defaultPageSize = 10,
  onChange,
  showSizeChanger = false,
  pageSizeOptions = ['10', '20', '50', '100'],
  onShowSizeChange,
  showQuickJumper = false,
  showTotal,
  simple = false,
  disabled = false,
  className = '',
  style = {},
  hideOnSinglePage, // 解构但不使用，防止传递给DOM
  ...restProps // 只传递合法的DOM属性
}) => {
  const [currentPage, setCurrentPage] = useState(current || defaultCurrent);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize || defaultPageSize);
  const [jumpValue, setJumpValue] = useState('');

  // 当外部current或pageSize变化时更新内部状态
  useEffect(() => {
    if (current !== undefined) {
      setCurrentPage(current);
    }
  }, [current]);

  useEffect(() => {
    if (pageSize !== undefined) {
      setCurrentPageSize(pageSize);
    }
  }, [pageSize]);

  const baseClass = 'custom-pagination';

  const classes = [
    baseClass,
    disabled ? `${baseClass}--disabled` : '',
    simple ? `${baseClass}--simple` : '',
    className
  ].filter(Boolean).join(' ');

  // 计算总页数
  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));

  // 处理页码变化
  const handlePageChange = (page) => {
    if (disabled) return;

    const newPage = Math.min(Math.max(1, page), totalPages);

    if (newPage !== currentPage) {
      if (current === undefined) {
        setCurrentPage(newPage);
      }

      if (onChange) {
        onChange(newPage, currentPageSize);
      }
    }
  };

  // 处理页面大小变化
  const handlePageSizeChange = (e) => {
    if (disabled) return;

    const newSize = parseInt(e.target.value, 10);
    const newPage = Math.max(1, Math.min(currentPage, Math.ceil(total / newSize)));

    if (pageSize === undefined) {
      setCurrentPageSize(newSize);
    }

    if (current === undefined) {
      setCurrentPage(newPage);
    }

    if (onShowSizeChange) {
      onShowSizeChange(newPage, newSize);
    }

    if (onChange) {
      onChange(newPage, newSize);
    }
  };

  // 处理快速跳转
  const handleJump = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      const page = parseInt(jumpValue, 10);

      if (!isNaN(page)) {
        handlePageChange(page);
        setJumpValue('');
      }
    }
  };

  // 生成页码列表
  const generatePaginationItems = () => {
    if (simple) {
      return (
        <div className={`${baseClass}__simple-pager`}>
          <button
            className={`${baseClass}__item ${baseClass}__prev`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
          >
            &lt;
          </button>
          <div className={`${baseClass}__simple-pager-input`}>
            <input
              type="text"
              value={currentPage}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  if (current === undefined) {
                    setCurrentPage(parseInt(value) || 1);
                  }
                }
              }}
              onBlur={(e) => {
                const page = parseInt(e.target.value, 10);
                if (!isNaN(page)) {
                  handlePageChange(page);
                }
              }}
              disabled={disabled}
            />
            <span className={`${baseClass}__simple-pager-slash`}>/</span>
            {totalPages}
          </div>
          <button
            className={`${baseClass}__item ${baseClass}__next`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      );
    }

    const items = [];
    const maxVisible = 7; // 最多显示的页码数

    // 添加上一页按钮
    items.push(
      <button
        key="prev"
        className={`${baseClass}__item ${baseClass}__prev`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
      >
        &lt;
      </button>
    );

    // 计算需要显示的页码范围
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisible) {
      const halfVisible = Math.floor(maxVisible / 2);

      if (currentPage <= halfVisible + 1) {
        // 当前页靠近开始
        endPage = maxVisible - 1;
      } else if (currentPage >= totalPages - halfVisible) {
        // 当前页靠近结束
        startPage = totalPages - maxVisible + 2;
      } else {
        // 当前页在中间
        startPage = currentPage - halfVisible;
        endPage = currentPage + halfVisible;
      }

      // 添加第一页
      if (startPage > 1) {
        items.push(
          <button
            key="1"
            className={`${baseClass}__item`}
            onClick={() => handlePageChange(1)}
            disabled={disabled}
          >
            1
          </button>
        );

        // 添加省略号
        if (startPage > 2) {
          items.push(
            <button
              key="prev-ellipsis"
              className={`${baseClass}__item ${baseClass}__ellipsis`}
              onClick={() => handlePageChange(startPage - 5)}
              disabled={disabled}
            >
              ...
            </button>
          );
        }
      }
    }

    // 添加页码按钮
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <button
          key={i}
          className={`${baseClass}__item ${i === currentPage ? `${baseClass}__item--active` : ''}`}
          onClick={() => handlePageChange(i)}
          disabled={disabled}
        >
          {i}
        </button>
      );
    }

    // 添加最后的省略号和最后一页
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <button
            key="next-ellipsis"
            className={`${baseClass}__item ${baseClass}__ellipsis`}
            onClick={() => handlePageChange(endPage + 5)}
            disabled={disabled}
          >
            ...
          </button>
        );
      }

      items.push(
        <button
          key={totalPages}
          className={`${baseClass}__item`}
          onClick={() => handlePageChange(totalPages)}
          disabled={disabled}
        >
          {totalPages}
        </button>
      );
    }

    // 添加下一页按钮
    items.push(
      <button
        key="next"
        className={`${baseClass}__item ${baseClass}__next`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
      >
        &gt;
      </button>
    );

    return items;
  };

  return (
    <div className={classes} style={style} {...restProps}>
>
      {/* 显示总数 */}
      {showTotal && (
        <div className={`${baseClass}__total`}>
          {showTotal(total, [
            (currentPage - 1) * currentPageSize + 1,
            Math.min(currentPage * currentPageSize, total)
          ])}
        </div>
      )}

      {/* 页码 */}
      <div className={`${baseClass}__list`}>
        {generatePaginationItems()}
      </div>

      {/* 页面大小选择器 */}
      {showSizeChanger && !simple && (
        <div className={`${baseClass}__size-changer`}>
          <select
            value={currentPageSize.toString()}
            onChange={handlePageSizeChange}
            disabled={disabled}
          >
            {pageSizeOptions.map(option => (
              <option key={option} value={option}>
                {option} 条/页
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 快速跳转 */}
      {showQuickJumper && !simple && (
        <div className={`${baseClass}__quick-jumper`}>
          跳至
          <input
            type="text"
            value={jumpValue}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setJumpValue(value);
              }
            }}
            onKeyPress={handleJump}
            onBlur={handleJump}
            disabled={disabled}
          />
          页
        </div>
      )}
    </div>
  );
};

Pagination.propTypes = {
  current: PropTypes.number,
  defaultCurrent: PropTypes.number,
  total: PropTypes.number,
  pageSize: PropTypes.number,
  defaultPageSize: PropTypes.number,
  onChange: PropTypes.func,
  showSizeChanger: PropTypes.bool,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.string),
  onShowSizeChange: PropTypes.func,
  showQuickJumper: PropTypes.bool,
  showTotal: PropTypes.func,
  simple: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default Pagination;
