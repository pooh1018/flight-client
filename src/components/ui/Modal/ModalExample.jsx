import React from 'react';
import { Button } from '@/components/ui';
import { useModal } from '@/contexts/ModalContext';
import './ModalExample.css';

const ModalExample = () => {
  const { showModal } = useModal();

  const handleShowBasicModal = () => {
    showModal(
      '基本模态框',
      <p>这是一个基本的模态框内容，没有确认和取消按钮。</p>
    );
  };

  const handleShowConfirmModal = () => {
    showModal(
      '确认操作',
      '您确定要执行此操作吗？此操作不可撤销',
      {
        onConfirm: () => {
          console.log('用户确认了操作');
          // 这里可以执行确认后的逻辑
        },
        onCancel: () => {
          console.log('用户取消了操作');
          // 这里可以执行取消后的逻辑
        }
      }
    );
  };

  const handleShowCustomModal = () => {
    showModal(
      '自定义按钮文本',
      <p>这个模态框有自定义的按钮文本。</p>,
      {
        onConfirm: () => console.log('同意操作'),
        onCancel: () => console.log('不同意操作'),
        confirmText: '同意',
        cancelText: '不同意',
        width: '300px'
      }
    );
  };

  return (
    <div className="modal-example">
      <h2>模态框示例</h2>
      <div direction="vertical" size="middle" className="example-buttons">
        <Button type="primary" onClick={handleShowBasicModal}>
          显示基本模态框
        </Button>

        <Button type="primary" onClick={handleShowConfirmModal}>
          显示确认模态框
        </Button>

        <Button type="primary" onClick={handleShowCustomModal}>
          显示自定义按钮模态框
        </Button>
      </div>
    </div>
  );
};

export default ModalExample;
