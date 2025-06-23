import React from 'react';
import { Card, Button, Divider, Space, Typography } from '@/components/ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFlightById } from '@/services/flightService';
import './index.scss';

const { Title, Text } = Typography;

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const flightId = searchParams.get('flightId');
  const [flight, setFlight] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFlight = async () => {
      try {
        const data = await getFlightById(flightId);
        setFlight(data);
      } catch (error) {
        console.error('获取航班信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (flightId) {
      fetchFlight();
    }
  }, [flightId]);

  const handleConfirmBooking = () => {
    // 处理预定确认逻辑
    console.log('确认预定:', flight);
    navigate('/booking/success');
  };

  if (loading) {
    return <div className="loading-container">加载中...</div>;
  }

  if (!flight) {
    return <div className="error-container">未找到航班信息</div>;
  }

  return (
    <div className="booking-confirmation">
      <Card className="confirmation-card">
        <Title level={3} className="confirmation-title">
          预定确认
        </Title>

        <Divider />

        <Space direction="vertical" size="large" className="flight-info">
          <div className="flight-header">
            <Title level={4}>航班信息</Title>
          </div>

          <div className="flight-details">
            <div className="flight-row">
              <Text strong>航班号:</Text>
              <Text>{flight.flightNumber}</Text>
            </div>
            <div className="flight-row">
              <Text strong>航空公司:</Text>
              <Text>{flight.airline?.name || '未知'}</Text>
            </div>
            <div className="flight-row">
              <Text strong>出发:</Text>
              <Text>
                {flight.departureCity} ({flight.departureAirport}) -
                {flight.departureTime}
              </Text>
            </div>
            <div className="flight-row">
              <Text strong>到达:</Text>
              <Text>
                {flight.arrivalCity} ({flight.arrivalAirport}) -
                {flight.arrivalTime}
              </Text>
            </div>
            <div className="flight-row">
              <Text strong>舱位:</Text>
              <Text>{flight.cabinClass || '经济舱'}</Text>
            </div>
            <div className="flight-row">
              <Text strong>价格:</Text>
              <Text className="price">¥{flight.price}</Text>
            </div>
          </div>
        </Space>

        <Divider />

        <div className="passenger-info">
          <Title level={4}>乘客信息</Title>
          {/* 这里可以添加乘客信息表单 */}
          <div className="passenger-form">
            <Text>乘客信息表单将在这里显示</Text>
          </div>
        </div>

        <Divider />

        <div className="payment-info">
          <Title level={4}>支付信息</Title>
          {/* 这里可以添加支付信息 */}
          <div className="payment-options">
            <Text>支付选项将在这里显示</Text>
          </div>
        </div>

        <Divider />

        <div className="confirmation-actions">
          <Space size="large">
            <Button onClick={() => navigate(-1)}>返回</Button>
            <Button
              type="primary"
              onClick={handleConfirmBooking}
            >
              确认预定
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
