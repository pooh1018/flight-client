import React from 'react';
import PropTypes from 'prop-types';
import SkeletonAvatar from './SkeletonAvatar';
import SkeletonTitle from './SkeletonTitle';
import SkeletonParagraph from './SkeletonParagraph';
import SkeletonButton from './SkeletonButton';
import SkeletonImage from './SkeletonImage';
import './Skeleton.scss';

const Skeleton = ({
  active = false,
  loading = true,
  avatar = false,
  title = true,
  paragraph = true,
  round = false,
  children,
  className = '',
  style = {},
  ...props
}) => {
  // 如果不是加载状态，直接显示子元素
  if (!loading) {
    return children;
  }

  // 构建类名
  const baseClass = 'custom-skeleton';
  const classes = [
    baseClass,
    active ? `${baseClass}--active` : '',
    className
  ].filter(Boolean).join(' ');

  // 处理头像配置
  const getAvatarProps = () => {
    if (avatar === true) {
      return {};
    }
    return avatar || {};
  };

  // 处理标题配置
  const getTitleProps = () => {
    if (title === true) {
      return {};
    }
    return title || {};
  };

  // 处理段落配置
  const getParagraphProps = () => {
    if (paragraph === true) {
      return {};
    }
    return paragraph || {};
  };

  return (
    <div className={classes} style={style} {...props}>
      {avatar && (
        <div className={`${baseClass}__header`}>
          <SkeletonAvatar {...getAvatarProps()} />
        </div>
      )}
      <div className={`${baseClass}__content`}>
        {title && <SkeletonTitle {...getTitleProps()} />}
        {paragraph && <SkeletonParagraph {...getParagraphProps()} />}
      </div>
    </div>
  );
};

Skeleton.propTypes = {
  active: PropTypes.bool,
  loading: PropTypes.bool,
  avatar: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  title: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  paragraph: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  round: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object
};

Skeleton.Avatar = SkeletonAvatar;
Skeleton.Title = SkeletonTitle;
Skeleton.Paragraph = SkeletonParagraph;
Skeleton.Button = SkeletonButton;
Skeleton.Image = SkeletonImage;

export default Skeleton;
