import React from 'react';
import PropTypes from 'prop-types';
import './DecorativeIcon.scss';

/**
 * DecorativeIcon - A decorative container for icons with gradient background and shadow
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Icon content to be displayed
 * @param {string} [props.className] - Additional CSS class names
 * @param {Object} [props.style] - Additional inline styles
 * @param {number} [props.size] - Size of the icon container (width and height)
 * @param {Function} [props.onClick] - Click event handler
 * @returns {React.ReactElement} Decorated icon component
 */
const DecorativeIcon = ({
  children,
  className = '',
  style = {},
  size = 30,
  onClick
}) => {
  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    ...style
  };

  return (
    <div
      className={`decorative-icon ${className}`}
      style={containerStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

DecorativeIcon.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  size: PropTypes.number,
  onClick: PropTypes.func
};

export default DecorativeIcon;
