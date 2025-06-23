import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import TimelineItem from './TimelineItem';
import './Timeline.scss';

const Timeline = ({
  children,
  mode = 'left',
  reverse = false,
  pending = false,
  pendingDot,
  className = '',
  style = {},
  ...props
}) => {
  // 处理子元素
  const items = useMemo(() => {
    const childrenArray = React.Children.toArray(children);
    const itemsArray = reverse ? [...childrenArray].reverse() : childrenArray;

    // 添加pending项
    if (pending) {
      const pendingItem = (
        <TimelineItem
          key="pending"
          pending={true}
          dot={pendingDot}
        >
          {typeof pending === 'boolean' ? null : pending}
        </TimelineItem>
      );

      itemsArray.push(pendingItem);
    }

    // 为每个子元素添加位置属性
    return itemsArray.map((item, idx) => {
      if (!React.isValidElement(item)) {
        return item;
      }

      const position =
        mode === 'alternate' ? (idx % 2 === 0 ? 'left' : 'right') :
        mode === 'right' ? 'right' : 'left';

      return React.cloneElement(item, {
        position,
        key: item.key || idx,
        last: idx === itemsArray.length - 1
      });
    });
  }, [children, mode, pending, pendingDot, reverse]);

  // 构建类名
  const baseClass = 'custom-timeline';
  const classes = [
    baseClass,
    mode === 'alternate' ? `${baseClass}--alternate` : '',
    mode === 'right' ? `${baseClass}--right` : '',
    mode === 'left' ? `${baseClass}--left` : '',
    reverse ? `${baseClass}--reverse` : '',
    pending ? `${baseClass}--pending` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <ul className={classes} style={style} {...props}>
      {items}
    </ul>
  );
};

Timeline.propTypes = {
  children: PropTypes.node,
  mode: PropTypes.oneOf(['left', 'right', 'alternate']),
  reverse: PropTypes.bool,
  pending: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
  pendingDot: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object
};

Timeline.Item = TimelineItem;

export default Timeline;
