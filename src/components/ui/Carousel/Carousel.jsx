import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import CarouselItem from './CarouselItem';
import './Carousel.scss';

const Carousel = ({
  children,
  autoplay = false,
  interval = 3000,
  dots = true,
  arrows = true,
  effect = 'slide',
  easing = 'ease',
  initialSlide = 0,
  beforeChange,
  afterChange,
  className = '',
  style = {},
  ...props
}) => {
  // 状态管理
  const [activeIndex, setActiveIndex] = useState(initialSlide);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // 引用
  const carouselRef = useRef(null);
  const autoplayTimerRef = useRef(null);

  // 获取子项数量
  const itemCount = React.Children.count(children);

  // 清除自动播放定时器
  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  // 设置自动播放
  const setAutoplay = useCallback(() => {
    if (autoplay && itemCount > 1 && !isHovering) {
      clearAutoplayTimer();
      autoplayTimerRef.current = setInterval(() => {
        goToSlide((activeIndex + 1) % itemCount);
      }, interval);
    }
  }, [autoplay, itemCount, interval, activeIndex, isHovering]);

  // 切换到指定幻灯片
  const goToSlide = useCallback((index) => {
    if (isAnimating || index === activeIndex) {
      return;
    }

    if (beforeChange) {
      beforeChange(activeIndex, index);
    }

    setIsAnimating(true);
    setActiveIndex(index);

    // 动画结束后的回调
    setTimeout(() => {
      setIsAnimating(false);
      if (afterChange) {
        afterChange(index);
      }
    }, 300); // 动画持续时间
  }, [activeIndex, isAnimating, beforeChange, afterChange]);

  // 上一张幻灯片
  const prevSlide = useCallback(() => {
    const prevIndex = activeIndex === 0 ? itemCount - 1 : activeIndex - 1;
    goToSlide(prevIndex);
  }, [activeIndex, itemCount, goToSlide]);

  // 下一张幻灯片
  const nextSlide = useCallback(() => {
    const nextIndex = (activeIndex + 1) % itemCount;
    goToSlide(nextIndex);
  }, [activeIndex, itemCount, goToSlide]);

  // 鼠标悬停处理
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    if (autoplay) {
      clearAutoplayTimer();
    }
  }, [autoplay, clearAutoplayTimer]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (autoplay) {
      setAutoplay();
    }
  }, [autoplay, setAutoplay]);

  // 设置自动播放
  useEffect(() => {
    setAutoplay();
    return clearAutoplayTimer;
  }, [setAutoplay, clearAutoplayTimer]);

  // 构建类名
  const baseClass = 'custom-carousel';
  const classes = [
    baseClass,
    `${baseClass}--${effect}`,
    className
  ].filter(Boolean).join(' ');

  // 渲染指示器
  const renderDots = () => {
    if (!dots || itemCount <= 1) {
      return null;
    }

    return (
      <ul className={`${baseClass}__dots`}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <li
            key={index}
            className={`${baseClass}__dot ${index === activeIndex ? `${baseClass}__dot--active` : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </ul>
    );
  };

  // 渲染箭头
  const renderArrows = () => {
    if (!arrows || itemCount <= 1) {
      return null;
    }

    return (
      <>
        <button
          type="button"
          className={`${baseClass}__arrow ${baseClass}__arrow--prev`}
          onClick={prevSlide}
          aria-label="Previous"
        >
          <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
            <path d="M724.4 896c-6.4 0-12.8-2.4-17.6-7.2L348.4 530.4c-9.6-9.6-9.6-25.6 0-35.2l358.4-358.4c9.6-9.6 25.6-9.6 35.2 0s9.6 25.6 0 35.2L406.8 512l335.2 340.8c9.6 9.6 9.6 25.6 0 35.2-4.8 4.8-11.2 8-17.6 8z" />
          </svg>
        </button>
        <button
          type="button"
          className={`${baseClass}__arrow ${baseClass}__arrow--next`}
          onClick={nextSlide}
          aria-label="Next"
        >
          <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
            <path d="M299.6 896c6.4 0 12.8-2.4 17.6-7.2l358.4-358.4c9.6-9.6 9.6-25.6 0-35.2L317.2 136.8c-9.6-9.6-25.6-9.6-35.2 0s-9.6 25.6 0 35.2L617.2 512 282 852.8c-9.6 9.6-9.6 25.6 0 35.2 4.8 4.8 11.2 8 17.6 8z" />
          </svg>
        </button>
      </>
    );
  };

  // 渲染子项
  const renderItems = () => {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      return React.cloneElement(child, {
        isActive: index === activeIndex,
        effect,
        easing,
        style: {
          ...child.props.style,
          transition: `transform 300ms ${easing}, opacity 300ms ${easing}`
        }
      });
    });
  };

  return (
    <div
      ref={carouselRef}
      className={classes}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div className={`${baseClass}__container`}>
        <div className={`${baseClass}__track`}>
          {renderItems()}
        </div>
      </div>
      {renderDots()}
      {renderArrows()}
    </div>
  );
};

Carousel.propTypes = {
  children: PropTypes.node,
  autoplay: PropTypes.bool,
  interval: PropTypes.number,
  dots: PropTypes.bool,
  arrows: PropTypes.bool,
  effect: PropTypes.oneOf(['slide', 'fade']),
  easing: PropTypes.string,
  initialSlide: PropTypes.number,
  beforeChange: PropTypes.func,
  afterChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

Carousel.Item = CarouselItem;

export default Carousel;
