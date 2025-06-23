import React, { createContext, useState, useContext } from 'react';
import Modal from '@/components/ui/Modal/Modal';

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
    const { onConfirm, onCancel, ...otherProps } = options;
    
    setModalTitle(title);
    setModalContent(content);
    setModalConfirm(onConfirm);
    setModalCancel(onCancel);
    setModalProps(otherProps);
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
        onClose={hideModal}
        onConfirm={modalConfirm ? handleConfirm : null}
        onCancel={modalCancel ? handleCancel : null}
        {...modalProps}
      >
        {modalContent}
      </Modal>
    </ModalContext.Provider>
  );
};
