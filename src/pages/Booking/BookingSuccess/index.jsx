import React, { useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDate } from '@/utils/formatters';
import './index.scss';

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 从location.state中获取订单信息
  const { order, flightInfo } = location.state || {};

  // 如果没有订单信息，重定向到首页
  useEffect(() => {
    if (!order || !flightInfo) {
      navigate('/home');
    }
  }, [order, flightInfo, navigate]);

  // 如果没有订单信息，显示加载中
  if (!order || !flightInfo) {
    return null;
  }

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
            <p>订单号: {order.reference}</p>
            <p>航班号: {flightInfo.flightNumber}</p>
            <p>出发: {flightInfo.departureLabel} - {formatDate(flightInfo.departureTime)}</p>
            <p>到达: {flightInfo.arrivalLabel} - {formatDate(flightInfo.arrivalTime)}</p>
            <p>乘客: {order.passengers.length || '未知'}</p>
            <p>舱位: {flightInfo.CabinsClass.name}</p>
            <p>支付金额: ¥{order.totalPrice}</p>
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
