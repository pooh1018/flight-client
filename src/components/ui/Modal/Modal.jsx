import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import './Modal.scss';

const Modal = ({
  visible,
  title,
  children,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  showCancel = !!cancelText, // 当有cancelText时显示
  showConfirm = !!confirmText, // 当有confirmText时显示
  closable = true, // 控制关闭按钮的显示
  maskClosable = true, // 控制点击背景是否可以关闭
  width = 520,
}) => {
  if (!visible) return null;

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && maskClosable) {
      handleCancel();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container" style={{ width: `${width}px` }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          {closable && (
            <button className="modal-close" onClick={handleCancel}>
              &times;
            </button>
          )}
        </div>
        <div className="modal-content">{children}</div>
        <div className="modal-footer">
          {showCancel && (
            <Button
              type="default"
              onClick={handleCancel}
              className="modal-btn modal-btn-cancel"
              style={{
                minWidth: '80px',
                padding: '8px 16px',
                color: 'var(--text-color, #333) !important',
                fontSize: '14px !important'
              }}
            >
              {cancelText || '取消'}
            </Button>
          )}
          {showConfirm && (
            <Button
              type="primary"
              onClick={handleConfirm}
              className="modal-btn modal-btn-confirm"
              style={{
                minWidth: '80px',
                padding: '8px 16px',
                color: 'white !important',
                fontSize: '14px !important'
              }}
            >
              {confirmText || '确定'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  showCancel: PropTypes.bool,
  showConfirm: PropTypes.bool,
  closable: PropTypes.bool,
  width: PropTypes.number,
};

export default Modal;
