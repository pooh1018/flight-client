import React, { useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDate } from '@/utils/formatters';
import './index.scss';

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 从location.state中获取订单信息
  const { order, orders, flightInfo, inboundFlight, isRoundTrip } = location.state || {};
  const currentOrder = order || (orders && orders[0]);

  // 如果没有订单信息，重定向到首页
  useEffect(() => {
    if (!currentOrder || !flightInfo) {
      navigate('/home');
    }
  }, [currentOrder, flightInfo, navigate]);

  // 如果没有订单信息，显示加载中
  if (!currentOrder || !flightInfo) {
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

          {/* 去程订单 */}
          <div className="trip-card outbound">
            <h3 className="trip-title">去程信息</h3>
            <div className="trip-content">
              <div className="detail-row">
                <span className="detail-label">订单号:</span>
                <span className="detail-value">{orders?.[0]?.reference || order?.reference || '未知'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">航班号:</span>
                <span className="detail-value">{flightInfo.flightNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">出发:</span>
                <span className="detail-value">{flightInfo.departureLabel} - {formatDate(flightInfo.departureTime)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">到达:</span>
                <span className="detail-value">{flightInfo.arrivalLabel} - {formatDate(flightInfo.arrivalTime)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">乘客:</span>
                <span className="detail-value">{orders?.[0]?.passengers?.length || order?.passengers?.length || '未知'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">舱位:</span>
                <span className="detail-value">{flightInfo.CabinsClass?.name || '未知'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">金额:</span>
                <span className="detail-value">¥{orders?.[0]?.totalPrice || order?.totalPrice || '未知'}</span>
              </div>
            </div>
          </div>

          {/* 回程订单 */}
          {isRoundTrip && inboundFlight && orders?.[1] && (
            <>
              <div className="divider"></div>
              <div className="trip-card inbound">
                <h3 className="trip-title">回程信息</h3>
                <div className="trip-content">
                  <div className="detail-row">
                    <span className="detail-label">订单号:</span>
                    <span className="detail-value">{orders[1]?.reference || '未知'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">航班号:</span>
                    <span className="detail-value">{inboundFlight.flightNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">出发:</span>
                    <span className="detail-value">{inboundFlight.departureLabel} - {formatDate(inboundFlight.departureTime)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">到达:</span>
                    <span className="detail-value">{inboundFlight.arrivalLabel} - {formatDate(inboundFlight.arrivalTime)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">乘客:</span>
                    <span className="detail-value">{orders[1]?.passengers?.length || '未知'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">舱位:</span>
                    <span className="detail-value">{inboundFlight.CabinsClass?.name || '未知'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">金额:</span>
                    <span className="detail-value">¥{orders[1]?.totalPrice || '未知'}</span>
                  </div>
                </div>
              </div>
            </>
          )}
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
