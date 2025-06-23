import React from 'react';
import { Card, Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const BookingSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="booking-success">
      <Card className="success-card">
        <div className="success-icon">
          <div className="success-icon-inner">✓</div>
        </div>
        <h1 className="success-title">预定成功!</h1>
        <p className="success-subtitle">您的航班已成功预定，订单详情已发送至您的邮箱</p>

        <div className="order-details">
          <h2 className="details-title">订单详情</h2>
          <div className="details-content">
            <p>订单号: FL20230615-001</p>
            <p>航班号: CA1234</p>
            <p>出发: 北京 (PEK) - 2023-06-15 08:00</p>
            <p>到达: 上海 (SHA) - 2023-06-15 10:30</p>
            <p>乘客: 张三</p>
            <p>舱位: 经济舱</p>
            <p>支付金额: ¥1200</p>
          </div>
        </div>

        <div className="success-actions">
          <Button
            type="primary"
            onClick={() => navigate('/home')}
          >
            返回首页
          </Button>
          <Button
            onClick={() => navigate('/my-bookings')}
            style={{ marginLeft: '10px' }}
          >
            查看我的预定
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BookingSuccess;
