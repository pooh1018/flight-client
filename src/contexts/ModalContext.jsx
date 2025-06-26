import React, { createContext, useState, useContext, lazy, Suspense } from 'react';
const Modal = lazy(() => import('@/components/ui/Modal/Modal'));

export const ModalContext = createContext({
  showModal: () => {},
  hideModal: () => {},
  onConfirm: () => {},
  onCancel: () => {}
});

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalConfirm, setModalConfirm] = useState(null);
  const [modalCancel, setModalCancel] = useState(null);
  const [modalProps, setModalProps] = useState({});

  const showModal = (title, content, options = {}) => {
    const {
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      maskClosable = true, // 默认允许点击遮罩层关闭
      closable = true, // 默认显示关闭按钮
      ...otherProps
    } = options;

    setModalTitle(title);
    setModalContent(content);
    setModalConfirm(onConfirm);
    setModalCancel(onCancel);
    setModalProps({
      ...otherProps,
      confirmText: confirmText || '确定',
      cancelText: cancelText || '取消',
      maskClosable,
      closable
    });
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const handleConfirm = () => {
    if (modalConfirm) {
      modalConfirm();
    }
    hideModal();
  };

  const handleCancel = () => {
    if (modalCancel) {
      modalCancel();
    }
    hideModal();
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal
        visible={modalVisible}
        title={modalTitle}
        onConfirm={modalConfirm ? handleConfirm : hideModal}
        onCancel={modalCancel ? handleCancel : hideModal}
        {...modalProps}
      >
        {modalContent}
      </Modal>
    </ModalContext.Provider>
  );
};
