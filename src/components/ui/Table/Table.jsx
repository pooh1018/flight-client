import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Table.scss';

const Table = ({
  columns = [],
  dataSource = [],
  rowKey = 'key',
  loading = false,
  pagination = false,
  onChange,
  bordered = false,
  size = 'default',
  scroll = {},
  rowSelection,
  className = '',
  style = {},
  striped = false,
  ...props
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const baseClass = 'custom-table';

  // 处理选择变化
  const handleSelect = (record, selected) => {
    const key = record[rowKey];
    const newSelectedRowKeys = selected
      ? [...selectedRowKeys, key]
      : selectedRowKeys.filter(k => k !== key);

    setSelectedRowKeys(newSelectedRowKeys);

    if (rowSelection && rowSelection.onChange) {
      rowSelection.onChange(newSelectedRowKeys,
        dataSource.filter(item => newSelectedRowKeys.includes(item[rowKey])));
    }
  };

  // 处理全选
  const handleSelectAll = (selected) => {
    const newSelectedRowKeys = selected
      ? dataSource.map(record => record[rowKey])
      : [];

    setSelectedRowKeys(newSelectedRowKeys);

    if (rowSelection && rowSelection.onChange) {
      rowSelection.onChange(newSelectedRowKeys,
        dataSource.filter(item => newSelectedRowKeys.includes(item[rowKey])));
    }
  };

  // 处理排序
  const handleSort = (column) => {
    if (!column.sorter) return;

    const newOrder = sortColumn === column.key && sortOrder === 'ascend'
      ? 'descend'
      : 'ascend';

    setSortColumn(column.key);
    setSortOrder(newOrder);

    if (onChange) {
      onChange({
        current: currentPage,
        sortColumn: column.key,
        sortOrder: newOrder
      });
    }
  };

  // 处理分页
  const handlePageChange = (page) => {
    setCurrentPage(page);

    if (onChange) {
      onChange({
        current: page,
        sortColumn,
        sortOrder
      });
    }
  };

  // 渲染表头
  const renderHeader = () => {
    return (
      <thead className={`${baseClass}__header`}>
        <tr>
          {rowSelection && (
            <th key="selection" className={`${baseClass}__selection-column`}>
              <input
                type="checkbox"
                checked={
                  dataSource.length > 0 &&
                  selectedRowKeys.length === dataSource.length
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
          )}
          {columns.map((column) => {
            const isSortColumn = sortColumn === column.key;
            const headerClasses = [
              `${baseClass}__header-cell`,
              column.sorter ? `${baseClass}__header-cell--sortable` : '',
              isSortColumn ? `${baseClass}__header-cell--sorted` : ''
            ].filter(Boolean).join(' ');

            return (
              <th
                key={column.key || column.dataIndex}
                className={headerClasses}
                style={{ width: column.width }}
                onClick={() => column.sorter && handleSort(column)}
              >
                {column.title}
                {column.sorter && (
                  <span className={`${baseClass}__sorter`}>
                    <span 
                      className={`${baseClass}__sorter-up ${
                        isSortColumn && sortOrder === 'ascend' ? `${baseClass}__sorter--active` : ''
                      }`}
                    >
                      ▲
                    </span>
                    <span 
                      className={`${baseClass}__sorter-down ${
                        isSortColumn && sortOrder === 'descend' ? `${baseClass}__sorter--active` : ''
                      }`}
                    >
                      ▼
                    </span>
                  </span>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  };

  // 渲染表体
  const renderBody = () => {
    if (loading) {
      return (
        <tbody className={`${baseClass}__body`}>
          <tr>
            <td
              colSpan={rowSelection ? columns.length + 1 : columns.length}
              className={`${baseClass}__loading`}
            >
              加载中...
            </td>
          </tr>
        </tbody>
      );
    }

    if (!dataSource.length) {
      return (
        <tbody className={`${baseClass}__body`}>
          <tr>
            <td
              colSpan={rowSelection ? columns.length + 1 : columns.length}
              className={`${baseClass}__empty`}
            >
              暂无数据
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className={`${baseClass}__body`}>
        {dataSource.map((record, index) => (
          <tr
            key={record[rowKey] || index}
            className={`${baseClass}__row ${
              selectedRowKeys.includes(record[rowKey]) ? `${baseClass}__row--selected` : ''
            }`}
          >
            {rowSelection && (
              <td key="selection" className={`${baseClass}__selection-column`}>
                <input
                  type="checkbox"
                  checked={selectedRowKeys.includes(record[rowKey])}
                  onChange={(e) => handleSelect(record, e.target.checked)}
                />
              </td>
            )}
            {columns.map((column) => (
              <td
                key={column.key || column.dataIndex}
                className={`${baseClass}__cell`}
              >
                {column.render
                  ? column.render(record[column.dataIndex], record, index)
                  : record[column.dataIndex]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  // 渲染分页
  const renderPagination = () => {
    if (!pagination) return null;

    const { total = 0, pageSize = 10 } = typeof pagination === 'object' ? pagination : {};
    const totalPages = Math.ceil(total / pageSize);

    if (totalPages <= 1) return null;

    return (
      <div className={`${baseClass}__pagination`}>
        <button
          key="prev"
          className={`${baseClass}__pagination-btn`}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          上一页
        </button>
        <span key="info" className={`${baseClass}__pagination-info`}>
          {currentPage} / {totalPages}
        </span>
        <button
          key="next"
          className={`${baseClass}__pagination-btn`}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          下一页
        </button>
      </div>
    );
  };

  // 计算表格类名
  const classes = [
    baseClass,
    bordered ? `${baseClass}--bordered` : '',
    striped ? `${baseClass}--striped` : '',
    `${baseClass}--${size}`,
    className
  ].filter(Boolean).join(' ');

  // 从props中移除已处理的属性，避免将非标准属性传递给DOM
  const { striped: _, bordered: __, size: ___, ...restProps } = props;

  return (
    <div
      className={classes}
      style={{
        ...style,
        ...(scroll.x && { overflowX: 'auto' }),
        ...(scroll.y && { maxHeight: scroll.y, overflowY: 'auto' })
      }}
      {...restProps}
    >
      <table className={`${baseClass}__content`}>
        {renderHeader()}
        {renderBody()}
      </table>
      {renderPagination()}
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.node.isRequired,
    dataIndex: PropTypes.string.isRequired,
    key: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    render: PropTypes.func,
    sorter: PropTypes.oneOfType([PropTypes.bool, PropTypes.func])
  })),
  dataSource: PropTypes.array,
  rowKey: PropTypes.string,
  loading: PropTypes.bool,
  pagination: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      total: PropTypes.number,
      pageSize: PropTypes.number
    })
  ]),
  onChange: PropTypes.func,
  bordered: PropTypes.bool,
  size: PropTypes.oneOf(['default', 'small', 'large']),
  scroll: PropTypes.shape({
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    y: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }),
  rowSelection: PropTypes.shape({
    onChange: PropTypes.func
  }),
  className: PropTypes.string,
  style: PropTypes.object,
  striped: PropTypes.bool
};

export default Table;
