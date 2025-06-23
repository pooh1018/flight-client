import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Step from './Step';
import './Steps.scss';

const Steps = ({
  children,
  current = 0,
  direction = 'horizontal',
  size = 'default',
  status = 'process',
  progressDot = false,
  initial = 0,
  onChange,
  className = '',
  style = {},
  ...props
}) => {
  // 状态管理
  const [currentStep, setCurrentStep] = useState(current);

  // 处理步骤点击
  const handleStepClick = useCallback((index) => {
    if (onChange) {
      onChange(index);
    }
    setCurrentStep(index);
  }, [onChange]);

  // 构建类名
  const baseClass = 'custom-steps';
  const classes = [
    baseClass,
    `${baseClass}--${direction}`,
    `${baseClass}--${size}`,
    progressDot ? `${baseClass}--dot` : '',
    className
  ].filter(Boolean).join(' ');

  // 计算每个步骤的状态
  const getStepStatus = (index) => {
    if (status === 'error' && index === currentStep - initial) {
      return 'error';
    }
    if (index < currentStep - initial) {
      return 'finish';
    }
    if (index === currentStep - initial) {
      return status;
    }
    return 'wait';
  };

  // 渲染步骤项
  const renderSteps = () => {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) {
        return null;
      }

      const stepNumber = initial + index + 1;
      const stepStatus = getStepStatus(index);
      const isLast = index === React.Children.count(children) - 1;

      return React.cloneElement(child, {
        stepNumber,
        status: stepStatus,
        isLast,
        onClick: () => handleStepClick(index + initial),
        progressDot,
        direction,
        ...child.props
      });
    });
  };

  return (
    <div className={classes} style={style} {...props}>
      {renderSteps()}
    </div>
  );
};

Steps.propTypes = {
  children: PropTypes.node,
  current: PropTypes.number,
  direction: PropTypes.oneOf(['horizontal', 'vertical']),
  size: PropTypes.oneOf(['default', 'small']),
  status: PropTypes.oneOf(['wait', 'process', 'finish', 'error']),
  progressDot: PropTypes.bool,
  initial: PropTypes.number,
  onChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

Steps.Step = Step;

export default Steps;
