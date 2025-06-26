import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@/components/ui';
import './index.scss';

const BookingConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="booking-confirmation">
      <Card className="confirmation-card">
        <div className="confirmation-content">
          <h1 className="confirmation-title">预订确认</h1>
          <div className="confirmation-details">
            <h2>预订成功！</h2>
            <p>您的航班已成功预订。</p>
            <p>预订详情已发送到您的邮箱。</p>
          </div>
          <div className="confirmation-actions">
            <Button
              type="primary"
              onClick={() => navigate('/my-bookings')}
            >
              查看预订历史
            </Button>
            <Button
              onClick={() => navigate('/')}
              style={{ marginLeft: '10px' }}
            >
              返回首页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
