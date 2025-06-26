import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, DescriptionItem, Tag, Loading, Message, Modal } from '@/components/ui';
import { getBookingDetail, cancelBooking, getPassengerById } from '@/services/bookingApi';
import flightApi from '@/services/flightApi';
import { getAirportByAirportId } from '@/services/airportApi';
import { formatDate } from '@/utils/formatters';
import './index.scss';

// 计算航班时长函数
const calculateFlightDuration = (departure, arrival) => {
  const diff = new Date(arrival) - new Date(departure);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}小时${minutes}分钟`;
};

const BookingDetailView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // 将解构移到useEffect之前，确保在loadBookingDetail中能正确使用
  const { id, flightId, passengers } = location.state || {};

  useEffect(() => {

    if (!location.state?.id) {
      Message.error('无效的预订参数');
      navigate('/my-bookings');
      return;
    }
    loadBookingDetail();
  }, [location.state?.id]);

  const loadBookingDetail = async () => {
    setLoading(true);
    try {
      const flightResponse = await flightApi.getFlightDetails(flightId);
      const flightData = flightResponse.data;

      // 获取机场信息
      const [
        departureAirport,
        arrivalAirport,
        bookingResponse
      ] = await Promise.all([
        getAirportByAirportId(flightData.departureAirportId),
        getAirportByAirportId(flightData.destinationAirportId),
        getBookingDetail(id)
      ]);

      console.log("departureAirport",departureAirport);
      console.log("arrivalAirport",arrivalAirport);

      // 获取所有乘客详情（添加防御性编程）
      const passengersWithDetails = bookingResponse.data.passengers?.length > 0
        ? await Promise.all(
            bookingResponse.data.passengers.map(async passenger => {
              try {
                const passengerDetail = await getPassengerById(passenger.passengerId);
                return {
                  ...passengerDetail.data,
                  seatNumber: passenger.seatNumber
                };
              } catch (error) {
                console.error(`Failed to load passenger ${passenger.passengerId}:`, error);
                return {
                  passengerId: passenger.passengerId,
                  seatNumber: passenger.seatNumber,
                  error: true
                };
              }
            })
          )
        : [];

      const bookingData = bookingResponse.data;

      setBooking({
        ...bookingData,
        // 格式化预订时间
        formattedBookingTime: bookingData?.bookingTime ? formatDate(bookingData.bookingTime, 'YYYY-MM-DD HH:mm:ss') : 'N/A',
        flightDetails: flightData ? {
          ...flightData,
          formattedDeparture: flightData.departureTime ? formatDate(flightData.departureTime, 'YYYY-MM-DD HH:mm:ss') : 'N/A',
          formattedArrival: flightData.arrivalTime ? formatDate(flightData.arrivalTime, 'YYYY-MM-DD HH:mm:ss') : 'N/A',
          departureCity: departureAirport.data?.city || 'N/A',
          arrivalCity: arrivalAirport.data?.city || 'N/A',
          duration: (flightData.departureTime && flightData.arrivalTime)
            ? calculateFlightDuration(flightData.departureTime, flightData.arrivalTime)
            : 'N/A'
        } : null,
        passengers: passengersWithDetails
      });
    } catch (error) {
      Message.error('获取预订详情失败');
      console.error('Error loading details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    Modal.confirm({
      title: '确认取消预订',
      content: '确定要取消此预订吗？取消后将无法恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await cancelBooking(id);
          Message.success('预订取消成功');
          loadBookingDetail(); // 重新加载预订详情
        } catch (error) {
          Message.error('取消预订失败');
        }
      }
    });
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'PENDING': { color: 'gold', text: '待支付' },
      'CONFIRMED': { color: 'green', text: '预定成功' },
      'CANCELLED': { color: 'red', text: '已取消' }
    };

    const statusInfo = statusMap[status] || { color: 'default', text: status };

    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  if (loading) {
    return (
      <div className="booking-detail-view loading">
        <Loading size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-detail-view not-found">
        <Card>
          <h1>预订不存在</h1>
          <p>未找到该预订信息，可能已被删除或您没有权限查看。</p>
          <Button type="primary" onClick={() => navigate('/my-bookings')}>
            返回我的预订
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="booking-detail-view">
      <Card className="booking-detail-card">
        <div className="page-header">
          <h1>预订详情</h1>
          <div className="status">
            {getStatusTag(booking.status)}
          </div>
        </div>

        <div className="section">
          <h2>航班信息</h2>
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <DescriptionItem label="航班号">{booking.flightDetails?.flightNumber}</DescriptionItem>
            <DescriptionItem label="出发城市">{booking.flightDetails?.departureCity}</DescriptionItem>
            <DescriptionItem label="目的城市">{booking.flightDetails?.arrivalCity}</DescriptionItem>
            <DescriptionItem label="出发时间">{booking.flightDetails?.formattedDeparture || 'N/A'}</DescriptionItem>
            <DescriptionItem label="到达时间">{booking.flightDetails?.formattedArrival || 'N/A'}</DescriptionItem>
            <DescriptionItem label="航班状态">{booking.flightDetails?.status}</DescriptionItem>
          </Descriptions>
        </div>

        <div className="section">
          <h2>预订信息</h2>
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <DescriptionItem label="预订编号">{booking.reference}</DescriptionItem>
            <DescriptionItem label="预订时间">{booking.formattedBookingTime || 'N/A'}</DescriptionItem>
            <DescriptionItem label="联系电话">{booking.contactPhone}</DescriptionItem>
            <DescriptionItem label="总价">¥{booking.totalPrice}</DescriptionItem>
            <DescriptionItem label="备注" span={2}>{booking?.remarks || '无'}</DescriptionItem>
          </Descriptions>
        </div>

        <div className="section">
          <h2>乘客信息</h2>
          <div className="passenger-list">
            {booking.passengers && booking.passengers.map((passenger, index) => (
              <Card key={index} className="passenger-card">
                <Descriptions column={{ xs: 1, sm: 2 }}>
                  <DescriptionItem label="姓名">{passenger.firstName+" "+passenger.lastName}</DescriptionItem>
                  <DescriptionItem label="邮箱">{passenger.email}</DescriptionItem>
                  <DescriptionItem label="电话">{passenger.phone}</DescriptionItem>
                </Descriptions>
              </Card>
            ))}
          </div>
        </div>

        <div className="actions">
          <Button type="primary" onClick={() => navigate('/my-bookings')}>
            返回我的预订
          </Button>
          {booking.status === 'CONFIRMED' && (
            <Button type="danger" onClick={handleCancelBooking}>
              取消预订
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookingDetailView;
