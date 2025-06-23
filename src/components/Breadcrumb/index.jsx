import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import './index.scss';

/**
 * 面包屑导航项组件
 */
const BreadcrumbItem = ({ children, isLast }) => (
  <div className="breadcrumb-item">
    {children}
  </div>
);

/**
 * 面包屑导航组件
 * @param {Object} props - 组件属性
 * @param {Array} props.items - 面包屑项数组，每项包含 title 和 link
 * @param {string} props.separator - 分隔符，默认为 '/'
 * @param {string} props.className - 自定义类名
 * @param {Object} props.style - 自定义样式
 * @returns {JSX.Element} 面包屑导航组件
 */
const Breadcrumb = memo(({ items = [], separator = '/', className = '', style = {} }) => {
  // 如果没有提供items，则返回null，不渲染面包屑
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`breadcrumb-container ${className}`} style={style}>
      <nav className="breadcrumb">
        {items.map((item, index) => (
          <React.Fragment key={`${item.link}-${index}`}>
            <BreadcrumbItem isLast={index === items.length - 1}>
              {index === items.length - 1 ? (
                <span className="breadcrumb-current">{item.title}</span>
              ) : (
                <Link to={item.link} className="breadcrumb-link">
                  {item.title}
                </Link>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && (
              <span className="breadcrumb-separator">{separator}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
}, (prevProps, nextProps) => {
  // 只有在items发生变化时才重新渲染
  return JSON.stringify(prevProps.items) === JSON.stringify(nextProps.items) &&
         prevProps.separator === nextProps.separator;
});

export default Breadcrumb;
