import React from 'react';
import PropTypes from 'prop-types';
import './Icon.scss';
import DecorativeIcon from './DecorativeIcon';

const icons = {
  block: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  )
};

export const Icon = ({ name, className }) => {
  const icon = icons[name];
  return icon ? React.cloneElement(icon, { className }) : null;
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string
};

export { DecorativeIcon };
