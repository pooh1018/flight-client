import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Message, Pagination, Loading } from '@/components/ui';
import { DateRangePicker } from '@/components/ui';
import { useModal } from '@/contexts/ModalContext';
import {
  cancelBooking,
  getBookingsByUserIdAndDateRangePaged
} from '@/services/bookingApi';
import flightApi from '@/services/flightApi';
import { formatDate } from '@/utils/formatters';
import { CABIN_CLASSES, CABIN_CLASS_MAP } from '@/config';
import { fetchAirportData } from '@/config/index';
import './index.scss';


const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'), // 30 days ago
    dayjs()
  ]);
  const [pagination, setPagination] = useState({
    current: 0,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100']
  });
  // 移除paginationRef，因为我们现在只使用pagination状态
  const [airports, setAirports] = useState([]);

  useEffect(() => {
    // 获取所有机场数据
    const loadAirports = async () => {
      try {
        const airportsData = await fetchAirportData();
        setAirports(airportsData);
      } catch (error) {
        console.error('获取机场数据失败:', error);
      }
    };
    loadAirports();
  }, []);

  // 监听日期范围、分页变化和机场数据变化，重新加载数据
  useEffect(() => {
    console.log('useEffect triggered - dateRange, pagination or airports changed');
    // 只有当airports数据已加载时才加载预订数据
    if (airports.length > 0) {
      loadBookings();
    }
  }, [dateRange, pagination.current, pagination.pageSize, airports]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // 使用状态中的分页参数，而不是引用
      const { current, pageSize } = pagination;
      const [startDate, endDate] = dateRange;

      console.log('Loading bookings with page:', current, 'pageSize:', pageSize);

      const response = await getBookingsByUserIdAndDateRangePaged({
        start: startDate ? startDate.startOf('day').toISOString() : null,
        end: endDate ? endDate.endOf('day').toISOString() : null,
        page: current,
        size: pageSize
      });

      console.log('API response:', response);

      // 获取每个预订对应的航班详情和机场信息
      const bookingsWithDetails = await Promise.all(
        response.data?.content.map(async (booking) => {
          try {
            if (booking.flightId) {
              const flightResponse = await flightApi.getFlightDetails(booking.flightId);
              const flight = flightResponse.data;

              if (!flight) {
                console.error(`未找到航班信息，ID: ${booking.flightId}`);
                return {
                  ...booking,
                  flight: { error: "航班详情不可用" },
                  flightDetails: { error: "航班详情不可用" }
                };
              }

              // 确定正确的机场ID字段
              const departureAirportId = flight.departureAirportId || flight.departureAirport?.id;
              const arrivalAirportId = flight.destinationAirportId || flight.arrivalAirportId || flight.arrivalAirport?.id;

              // 从已获取的机场列表中查找对应的机场信息
              const departureAirport = departureAirportId ?
                airports.find(airport => airport.key === departureAirportId || airport.id === departureAirportId) : null;
              const arrivalAirport = arrivalAirportId ?
                airports.find(airport => airport.key === arrivalAirportId || airport.id === arrivalAirportId) : null;

              // console.log('找到的机场信息:', { departureAirport, arrivalAirport });

              return {
                ...booking,
                flight: flight, // 保存原始flight对象
                flightDetails: {
                  ...flight,
                  departureAirport: departureAirport || { city: '未知', name: '未知机场' },
                  arrivalAirport: arrivalAirport || { city: '未知', name: '未知机场' }
                }
              };
            }
            return booking;
          } catch (error) {
            console.error(`获取航班 ${booking.flightId} 详情或机场信息失败:`, error);
            return {
              ...booking,
              flight: { error: "加载航班详情时出错" },
              flightDetails: { error: "加载航班详情时出错" }
            };
          }
        }) || []
      );

      // console.log("bookingsWithDetails>>>>",bookingsWithDetails);
      setBookings(bookingsWithDetails);
      setPagination(prev => ({
        ...prev,
        total: response.data?.totalElements || 0
      }));
    } catch (error) {
      try {
        Message.error('获取预订列表失败');
      } catch (e) {
        console.error('Failed to show error message:', e);
        console.error('Original error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page, pageSize) => {
    console.log('Page changed to:', page, 'pageSize:', pageSize);

    // 将从1开始的页码转换为从0开始的页码
    const apiPage = page - 1;
    console.log('API page (0-based):', apiPage);

    // 更新状态
    setPagination(prev => ({
      ...prev,
      current: apiPage,
      pageSize: pageSize
    }));

    // 不需要手动调用loadBookings，因为useEffect会监听pagination的变化
  };

  const { showModal } = useModal();

  const handleCancelBooking = async (record) => {
    showModal({
      title: '确认取消预订',
      content: `确定要取消预订编号 ${record.reference} 的预订吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await cancelBooking(record.id);
          Message.success('预订取消成功');
          loadBookings(); // 重新加载数据
        } catch (error) {
          Message.error('取消预订失败');
        }
      }
    });
  };

  const handleDateChange = (dates) => {
    console.log('Date range changed to:', dates);
    setDateRange(dates);

    // 重置到第一页，不再需要更新paginationRef.current
    setPagination(prev => ({ ...prev, current: 0 }));
    // 日期变化后自动加载数据，不需要手动调用loadBookings，因为useEffect会处理
  };

  const handleViewDetail = (record) => {
    navigate('/my-bookings/detail-view', {
      state: {
        id: record.id,
        flightId: record.flightId,
        passengers: record.passengers
      }
    });
  };

  const columns = [
    {
      title: '预订编号',
      dataIndex: 'reference',
      key: 'reference'
    },
    {
      title: '航班信息',
      key: 'flightInfo',
      dataIndex: 'flightId',
      render: (_, record) => {
        // 检查是否有错误信息
        if (record.flightDetails?.error) {
          return <div className="flight-info-error">{record.flightDetails.error}</div>;
        }

        // 使用我们获取的flightDetails和机场数据
        const flightDetails = record.flightDetails || {};
        const flight = record.flight || {};
        const departureAirport = flightDetails.departureAirport || {};
        const arrivalAirport = flightDetails.arrivalAirport || {};

        return (
          <div className="flight-info-container">
            <div className="flight-number">
              <strong>航班号:</strong> {flightDetails.flightNumber || flight.flightNumber || record.flightId || '未知'}
            </div>
            <div className="flight-route">
              <div className="departure">
                <div>
                  {departureAirport.city || departureAirport.name || '未知出发地'}
                </div>
                <div>
                  {flightDetails.departureTime ? formatDate(flightDetails.departureTime, 'MM-DD HH:mm') :
                   flight.departureTime ? formatDate(flight.departureTime, 'MM-DD HH:mm') : '时间未知'}
                </div>
              </div>
              {/*<div className="flight-arrow">→</div>*/}
              <div className="arrival">
                <div>
                  {arrivalAirport.city || arrivalAirport.name || '未知目的地'}
                </div>
                <div>
                  {flightDetails.arrivalTime ? formatDate(flightDetails.arrivalTime, 'MM-DD HH:mm') :
                   flight.arrivalTime ? formatDate(flight.arrivalTime, 'MM-DD HH:mm') : '时间未知'}
                </div>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: '乘客与舱位信息',
      key: 'passengerAndCabin',
      dataIndex: 'cabinClassType',
      render: (_, record) => {


        const cabinClass = CABIN_CLASSES.find(cabin => cabin.value === String(record.cabinClassType));
        const cabinName = cabinClass ? CABIN_CLASS_MAP[cabinClass.value] : `未知(${record.cabinClassType})`;

        return (
          <div className="passenger-cabin-info">
            <div>{record.passengers.length}人</div>
            <div>{cabinName}</div>
          </div>
        );
      }
    },
    {
      title: '预订时间',
      dataIndex: 'bookingTime',
      key: 'bookingTime',
      render: (time) => {
        return new Date(time).toLocaleString();
      }
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `¥${price.toFixed(2)}`
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => {
        const methodMap = {
          'CREDIT_CARD': '信用卡',
          'PAYPAL': 'PayPal',
          'WX_PAY': '微信支付',
          'ALIPAY': '支付宝'
        };
        return methodMap[method] || method;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'PENDING': '待支付',
          'CONFIRMED': '预定成功',
          'CANCELLED': '已取消'
        };
        return statusMap[status] || status;
      }
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'id', // Add dataIndex to satisfy prop validation
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="link"
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          {record.status === 'CONFIRMED' && (
            <Button
              type="link"
              danger="true"
              onClick={() => handleCancelBooking(record)}
            >
              取消预订
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="my-bookings">
      <Loading spinning={loading} tip="正在加载订单数据..." size="large">
        <Card className="bookings-card">
          <div className="page-header">
            <h1>我的预订</h1>
            <div className="header-actions">
              <DateRangePicker
                value={dateRange}
                onChange={handleDateChange}
                format="YYYY-MM-DD"
                placeholder={['开始日期', '结束日期']}
                className="date-picker"
                style={{ marginRight: 16 }}
                allowClear={true}
              />
              <Button
                type="primary"
                onClick={() => navigate('/flightSearch')}
              >
                预订新航班
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="id"
            pagination={false}
            loading={loading}
          />

          <div className="pagination-container" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              current={pagination.current + 1}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              pageSizeOptions={pagination.pageSizeOptions}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
              showTotal={(total) => `共 ${total} 条记录`}
            />
          </div>
        </Card>
      </Loading>
    </div>
  );
};

export default MyBookings;
