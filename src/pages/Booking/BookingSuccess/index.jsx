import React from 'react';
import { Result, Button, Typography, Space } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const { Title, Text } = Typography;

const BookingSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="booking-success">
      <Result
        status="success"
        title="预定成功!"
        subTitle="您的航班已成功预定，订单详情已发送至您的邮箱"
        extra={[
          <Button
            type="primary"
            key="home"
            onClick={() => navigate('/home')}
          >
            返回首页
          </Button>,
          <Button
            key="bookings"
            onClick={() => navigate('/my-bookings')}
          >
            查看我的预定
          </Button>,
        ]}
      >
        <div className="order-details">
          <Title level={5}>订单详情</Title>
          <Space direction="vertical" size="middle">
            <Text>订单号: FL20230615-001</Text>
            <Text>航班号: CA1234</Text>
            <Text>出发: 北京 (PEK) - 2023-06-15 08:00</Text>
            <Text>到达: 上海 (SHA) - 2023-06-15 10:30</Text>
            <Text>乘客: 张三</Text>
            <Text>舱位: 经济舱</Text>
            <Text>支付金额: ¥1200</Text>
          </Space>
        </div>
      </Result>
    </div>
  );
};

export default BookingSuccess;
