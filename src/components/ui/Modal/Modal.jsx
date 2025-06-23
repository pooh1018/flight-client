import React from 'react';
import { Button } from '@/components/ui';
import './Modal.scss';

const Modal = ({
  visible,
  onClose,
  onConfirm,
  onCancel,
  title,
  children,
  width = '500px',
  className = '',
  showFooter = true,
  confirmText = '确定',
  cancelText = '取消'
}) => {
  if (!visible) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        className={`modal ${className}`}
        style={{ width }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <Button className="modal-close" onClick={onClose}>×</Button>
        </div>
        <div className="modal-content">
          {children}
        </div>
        {showFooter && (
          <div className="modal-footer">
            {onCancel && (
              <Button className="modal-btn modal-btn-cancel" onClick={onCancel}>
                {cancelText}
              </Button>
            )}
            {onConfirm && (
              <Button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
