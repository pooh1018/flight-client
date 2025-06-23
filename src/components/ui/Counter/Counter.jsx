import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../Button';
import './Counter.scss';

const Counter = ({ initialValue = 0, min, max, onChange }) => {
  const [count, setCount] = useState(initialValue);

  const handleIncrement = () => {
    if (max !== undefined && count >= max) return;

    const newValue = count + 1;
    setCount(newValue);
    if (onChange) onChange(newValue);
  };

  const handleDecrement = () => {
    if (min !== undefined && count <= min) return;

    const newValue = count - 1;
    setCount(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <div className="counter">
      <Button
        className="counter__button"
        onClick={handleDecrement}
        disabled={min !== undefined && count <= min}
      >
        -
      </Button>
      <div className="counter__value">{count}</div>
      <Button
        className="counter__button"
        onClick={handleIncrement}
        disabled={max !== undefined && count >= max}
      >
        +
      </Button>
    </div>
  );
};

Counter.propTypes = {
  initialValue: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func
};

export default Counter;
