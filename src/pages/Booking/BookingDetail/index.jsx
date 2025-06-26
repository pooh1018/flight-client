import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Form, Select, Input, Message } from '@/components/ui';
import { getPassengersByUserId} from '@/services/passengerApi';
import { createBooking } from '@/services/bookingApi';
import './index.scss';

const BookingDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const flightInfo = location.state?.flightInfo;
  const [passengerList, setPassengerList] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!flightInfo) {
      Message.error('未找到航班信息');
      navigate('/flightSearch');
      return;
    }
    loadPassengerList();
  }, []);

  const loadPassengerList = async () => {
    try {
      const response = await getPassengersByUserId();
      setPassengerList(response.data || []);
    } catch (error) {
      Message.error('获取乘客列表失败');
    }
  };

  const handlePassengerSelect = (value) => {
    if (value.length > 9) {
      Message.warning('最多只能选择9位乘客');
      return;
    }
    setSelectedPassengers(value);
  };

  const handleSubmit = async (values) => {
    if (selectedPassengers.length === 0) {
      Message.error('请至少选择一位乘客');
      return;
    }

    try {
      // const bookingData = {
      //   flightId: flightInfo.id,
      //   passengers: selectedPassengers,
      //   ...values
      // };
      // 拼接bookingData
      console.log("selectedPassengers", selectedPassengers);
      const bookingData = {
        flightId: flightInfo?.flightId || '',
        passengers: selectedPassengers.map(passenger => ({
          passengerId: passenger.passengerId,
          seatNumber: passenger.seatNumber || ''
        })) || [],
        totalPrice: flightInfo?.totalPrice ? flightInfo.totalPrice.toString() : '0.00',
        status: flightInfo?.status || 'PENDING',
        paymentMethod: flightInfo?.paymentMethod || 'CREDIT_CARD',
        cabinClassType: flightInfo?.cabinClassType || 1,
        contactEmail: values.contactEmail || '',
        contactPhone: values.contactPhone || ''
      };
      console.log(bookingData);
      await createBooking(bookingData);
      Message.success('预订成功');
      navigate('/my-bookings/confirm');
    } catch (error) {
      Message.error('预订失败，请重试');
    }
  };

  return (
    <div className="booking-detail">
      <Card className="booking-detail-card">
        <h1>预订详情</h1>

        <div className="flight-info">
          <h2>航班信息</h2>
          <div className="flight-details">
            <p>航班号：{flightInfo?.flightNumber}</p>
            <p>出发地：{flightInfo?.departure}</p>
            <p>目的地：{flightInfo?.arrival}</p>
            <p>出发时间：{flightInfo?.departureTime}</p>
            <p>到达时间：{flightInfo?.arrivalTime}</p>
            {/*<p>舱位：¥{flightInfo?.CabinsClass}</p>*/}
            <p>票价：¥{flightInfo?.price}</p>
          </div>
        </div>

        <Form
            form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="booking-form"
        >
          <Form.Item
            label="选择乘客"
            name="passengers"
            rules={[{ required: true, message: '请选择乘客' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择乘客"
              onChange={handlePassengerSelect}
              maxTagCount={9}
              style={{ width: '100%' }}
            >
              {passengerList.map(passenger => (
                <Select.Option
                  key={passenger.id}
                  value={passenger.id}
                  className="passenger-option"
                >
                  <div className="passenger-info">
                    <div className="passenger-name">
                      {`${passenger.firstName} ${passenger.lastName}`}
                    </div>
                    <div className="passenger-details">
                      <span>{passenger.email}</span>
                      <span className="separator">|</span>
                      <span>{passenger.phone}</span>
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="联系电话"
            name="contactPhone"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item
              label="联系邮箱"
              name="contactEmail"
              rules={[{ required: true, message: '请输入联系邮箱' }]}
          >
            <Input placeholder="请输入联系邮箱" />
          </Form.Item>
          {/*<Form.Item*/}
          {/*  label="备注"*/}
          {/*  name="remarks"*/}
          {/*>*/}
          {/*  <Input.TextArea placeholder="请输入备注信息（选填）" />*/}
          {/*</Form.Item>*/}

          <div className="form-actions">
            <Button type="primary" htmlType="submit">
              确认预订
            </Button>
            <Button
              onClick={() => navigate('/flightSearch')}
              style={{ marginLeft: '10px' }}
            >
              返回航班搜索
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default BookingDetail;
