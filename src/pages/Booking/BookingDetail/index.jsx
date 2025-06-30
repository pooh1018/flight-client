import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {Card, Button, Form, Select, Input, Message, Modal, Tag} from '@/components/ui';
import { DecorativeIcon } from '@/components/ui/Icon';
import PhoneIcon from '@/components/ui/Icon/PhoneIcon';
import EmailIcon from '@/components/ui/Icon/EmailIcon';
import { formatDate } from '@/utils/formatters';
import { getPassengersByUserId, addPassenger, updatePassenger, deletePassenger } from '@/services/passengerApi';
import { createBooking } from '@/services/bookingApi';
import './index.scss';

const BookingDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const flightInfo = location.state?.flightInfo;
  // console.log('flightInfo', flightInfo);
  const [passengerList, setPassengerList] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState(
    Array(9).fill({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    })
  );
  const [totalPrice, setTotalPrice] = useState(flightInfo?.price || 0);
  const [form] = Form.useForm();
  const [passengerForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPassenger, setCurrentPassenger] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [passengerToDelete, setPassengerToDelete] = useState(null);

  useEffect(() => {
    if (flightInfo?.price) {
      setTotalPrice(flightInfo.CabinsClass.price * passengerCount);
    }
  }, [passengerCount, flightInfo?.price]);

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index] = {
      ...newPassengers[index],
      [field]: value
    };
    setPassengers(newPassengers);
  };

  const removePassenger = (index) => {
    if (passengerCount > 1) {
      const newPassengers = [...passengers];
      newPassengers.splice(index, 1);
      newPassengers.push({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
      setPassengers(newPassengers);
      setPassengerCount(passengerCount - 1);
      setTotalPrice(flightInfo.CabinsClass.price * (passengerCount - 1));
    }
  };

  useEffect(() => {
    if (!flightInfo) {
      Message.error('未找到航班信息');
      navigate('/flightSearch');
      return;
    }
    loadPassengerList();

    // 自动填充联系人信息
    if (flightInfo.user) {
      form.setFieldsValue({
        contactPhone: flightInfo.user.phone,
        contactEmail: flightInfo.user.email
      });
    }
  }, []);

  const loadPassengerList = async () => {
    try {
      const response = await getPassengersByUserId();
      setPassengerList(response.data || []);
    } catch (error) {
      Message.error('获取乘客列表失败');
    }
  };

  const togglePassengerSelection = (passengerId) => {
    setSelectedPassengers(prev => {
      if (prev.includes(passengerId)) {
        const newSelected = prev.filter(id => id !== passengerId);
        setTotalPrice(flightInfo.CabinsClass.price * newSelected.length);
        return newSelected;
      } else {
        if (prev.length >= 9) {
          Message.warning('最多只能选择9位乘客');
          return prev;
        }
        if (prev.length >= flightInfo?.CabinsClass.availableSeats) {
          Message.warning('余票不足，只能选择'+flightInfo?.CabinsClass.availableSeats+'位乘客');
          return prev;
        }
        const newSelected = [...prev, passengerId];
        setTotalPrice(flightInfo.CabinsClass.price * newSelected.length);
        return newSelected;
      }
    });
  };

  const handleEditPassenger = (passenger) => {
    setIsEditing(true);
    setCurrentPassenger(passenger);
    passengerForm.setFieldsValue({
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      email: passenger.email,
      phone: passenger.phone,
      idType: passenger.idType,
      idNumber: passenger.idNumber
    });
    setIsModalVisible(true);
  };

  const handleDeletePassenger = (passengerId) => {
    setPassengerToDelete(passengerId);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deletePassenger(passengerToDelete);
      if (res.success) {
        Message.success('删除乘客成功');
        const newPassengerList = passengerList.filter(p => p.id !== passengerToDelete);
        const newSelectedPassengers = selectedPassengers.filter(id => id !== passengerToDelete);
        setPassengerList(newPassengerList);
        setSelectedPassengers(newSelectedPassengers);
        setTotalPrice(flightInfo.CabinsClass.price * newSelectedPassengers.length);
      } else {
        Message.error('删除乘客失败');
      }
    } catch (error) {
      Message.error('删除乘客失败');
    }
    setIsDeleteModalVisible(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setPassengerToDelete(null);
  };

  const handleAddPassenger = () => {
    setIsEditing(false);
    setCurrentPassenger(null);
    passengerForm.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await passengerForm.validateFields();
      if (isEditing && currentPassenger) {
        // 调用更新乘客API
        const res = await updatePassenger({
          ...values,
          id: currentPassenger.id
        });

        if (res.success) {
          Message.success('乘客信息更新成功');
          // 刷新乘客列表
          const response = await getPassengersByUserId();
          if (response.success){
            setPassengerList(response.data || []);
          } else {
            console.error(response.message || '获取乘客列表失败');
          }
        } else{
          Message.error(res.message || '更新乘客失败');
          return;
        }
      } else {
        // 调用新增乘客API
        const res = await addPassenger(values);

        if (res.success) {
          Message.success('新乘客添加成功');
          // 刷新乘客列表
          const response = await getPassengersByUserId();
          if (response.success){
            setPassengerList(response.data || []);
          } else {
            console.error(response.message || '获取乘客列表失败');
          }
        } else{
          Message.error(res.message || '新增乘客失败');
          return;
        }
      }
      setIsModalVisible(false);
      passengerForm.resetFields();
    } catch (error) {
      console.error('操作失败:', error);
      Message.error(error.message || (isEditing ? '更新乘客失败' : '添加乘客失败'));
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    passengerForm.resetFields();
  };

  const handlePassengerSelect = (value) => {
    if (value.length > 9) {
      Message.warning('最多只能选择9位乘客');
      return;
    }
    setSelectedPassengers(value);
  };

  const handleSubmit = async (values) => {

    const allPassengers = [
      ...selectedPassengers.map(passenger => ({
        passengerId: passenger,
        seatNumber: ""
      }))
    ];

    // console.log("allPassengers", allPassengers.length);
    if (allPassengers.length === 0) {
      Message.error('请至少添加一位乘客');
      return;
    }

    const bookingData = {
      flightId: flightInfo?.flightId || '',
      passengers: allPassengers,
      totalPrice: totalPrice.toFixed(2),
      status: 'PENDING',
      paymentMethod: 'CREDIT_CARD',
      cabinClassType: flightInfo?.CabinsClass.cabinClassType || 1,
      contactEmail: values.contactEmail || '',
      contactPhone: values.contactPhone || ''
    };
    // console.log("bookingData", bookingData);
    const response = await createBooking(bookingData);
    // console.log("response", response);
    if (response.success) {
      Message.success('预订成功');

      // 导航到成功页面并传递订单信息
      navigate('/my-bookings/success', {
        state: {
          order: response.data,
          flightInfo: flightInfo
        }
      });
    } else {
      Message.error('预订失败，请重试');
    }
  };

  return (
    <div className="booking-detail">
      <Card className="booking-detail-card">
        <h1>预订详情</h1>

        <div className="flight-info">
          <h2 className="section-title">航班信息</h2>
          <div className="flight-card">
            <div className="flight-header">
              <div className="flight-number">
                <span className="label">航班号</span>
                <span className="value">{flightInfo?.flightNumber}</span>
              </div>
              <div className="cabin-class">
                <span className="label">舱位
                  {flightInfo?.CabinsClass.availableSeats < 10 && flightInfo?.CabinsClass.classType === 1 && (
                      <span className="cabin-class-tags" style={{display: 'inline-flex', gap: '8px', marginLeft: '8px' }}>
                        <Tag
                            type="danger"
                            size="default"
                        >
                          余票紧张
                        </Tag>
                      </span>
                  )}
                </span>
                <span className="value">
                  {flightInfo?.CabinsClass.name}
                </span>
                <span style={{ fontSize: '14px', display: 'inline-flex', gap: '8px', marginLeft: '8px' }}>
                  (剩余: {flightInfo?.CabinsClass.availableSeats}张)
                </span>
              </div>
              <div className="price-item">
                <span className="label">票价</span>
                <span className="value">¥{flightInfo?.CabinsClass.price}</span>
              </div>
            </div>

            <div className="flight-route">
              <div className="departure">
                <div className="city">{flightInfo?.departure}</div>
                <div className="time">{formatDate(flightInfo?.departureTime, 'HH:mm')}</div>
                <div className="date">{formatDate(flightInfo?.departureTime, 'YYYY-MM-DD')}</div>
              </div>

              <div className="route-line">
                <div className="arrow">⟶</div>
              </div>

              <div className="arrival">
                <div className="city">{flightInfo?.arrival}</div>
                <div className="time">{formatDate(flightInfo?.arrivalTime, 'HH:mm')}</div>
                <div className="date">{formatDate(flightInfo?.arrivalTime, 'YYYY-MM-DD')}</div>
              </div>
            </div>

            <div className="flight-price">
              <div className="price-item total">
                <span className="label">总价</span>
                <span className="value">¥{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flight-input">
          <div className="passenger-section">
            <div className="section-header">
              <h4>乘客信息</h4>
            </div>

            <div className="passenger-cards">
              {passengerList.map((passenger) => (
                  <div
                      key={passenger.id}
                      className={`passenger-card ${selectedPassengers.includes(passenger.id) ? 'selected' : ''}`}
                      onClick={() => togglePassengerSelection(passenger.id)}
                  >
                    <div className="card-header">
                      {passenger.passengerUserId === flightInfo.user.userId && (
                        <span className="self-tag">本人</span>
                      )}
                      <div className="name-container">
                        <h5>{passenger.firstName} {passenger.lastName}</h5>
                      </div>
                      <div className="card-actions">
                        <Button
                            type="text"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPassenger(passenger);
                            }}
                        >
                          编辑
                        </Button>
                        <Button
                            type="danger"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePassenger(passenger.id);
                            }}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                    <div className="card-body">
                      <p><strong>邮箱:</strong> {passenger.email}</p>
                      <p><strong>电话:</strong> {passenger.phone}</p>
                    </div>
                  </div>
              ))}

              {/* 新增乘客按钮 */}
              <div
                  className="passenger-card add-card"
                  onClick={handleAddPassenger}
              >
                <div className="add-icon">+</div>
                <div className="add-text">添加新乘客</div>
              </div>
            </div>
          </div>
        </div>

        <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className="booking-form"
        >
          <div className="contact-info-section">
            <h2 className="section-title">联系人信息</h2>
            <div className="contact-info-container">
              <div className="contact-info-item">
                <DecorativeIcon>
                  <PhoneIcon />
                </DecorativeIcon>
                <Form.Item
                    name="contactPhone"
                    rules={[{required: true, message: '请输入联系电话'}]}
                >
                  <Input placeholder="请输入联系电话"/>
                </Form.Item>
              </div>

              <div className="contact-info-item">
                <DecorativeIcon>
                  <EmailIcon />
                </DecorativeIcon>
                <Form.Item
                    name="contactEmail"
                    rules={[{required: true, message: '请输入联系邮箱'}]}
                >
                  <Input placeholder="请输入联系邮箱"/>
                </Form.Item>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button type="primary" htmlType="submit">
              确认预订
            </Button>
            <Button
              onClick={() => navigate('/flightSearch')}
            >
              返回航班搜索
            </Button>
          </div>
        </Form>

        {/* 删除确认对话框 */}
        <Modal
            visible={isDeleteModalVisible}
            title="确认删除"
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            confirmText="确定"
            cancelText="取消"
        >
          <p>您确定要删除这位乘客吗？</p>
        </Modal>

        <Modal
          title={isEditing ? "编辑乘客信息" : "添加新乘客"}
          visible={isModalVisible}
          onConfirm={handleModalOk}
          onCancel={handleModalCancel}
          confirmText="确定"
          cancelText="取消"
          width={600}
          className="enhanced-modal"
        >
          <Form
            form={passengerForm}
            layout="vertical"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={{
              idType: 'ID_CARD' // 默认选择身份证
            }}
            className="passenger-form"
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item
                name="firstName"
                label="名"
                rules={[{ required: true, message: '请输入名字' }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="请输入名字" />
              </Form.Item>
              <Form.Item
                name="lastName"
                label="姓"
                rules={[{ required: true, message: '请输入姓氏' }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="请输入姓氏" />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              {/*<DecorativeIcon>*/}
              {/*  <EmailIcon />*/}
              {/*</DecorativeIcon>*/}
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>

              {/*<DecorativeIcon>*/}
              {/*  <PhoneIcon />*/}
              {/*</DecorativeIcon>*/}
              <Form.Item
                name="phone"
                label="电话"
                rules={[
                  { required: true, message: '请输入电话号码' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="请输入电话号码" />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item
                name="idType"
                label="证件类型"
                rules={[{ required: true, message: '请选择证件类型' }]}
                style={{ flex: 1 }}
              >
                <Select>
                  <Select.Option value="ID_CARD">身份证</Select.Option>
                  <Select.Option value="PASSPORT">护照</Select.Option>
                  <Select.Option value="OTHER">其他</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="idNumber"
                label="证件号码"
                rules={[{ required: true, message: '请输入证件号码' }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="请输入证件号码" />
              </Form.Item>
            </div>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default BookingDetail;
