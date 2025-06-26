import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Message } from '@/components/ui';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useModal } from '@/contexts/ModalContext';
import { getBookingsByUserIdAndDateRange, cancelBooking } from '@/services/bookingApi';
import './index.scss';


const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    new Date()
  ]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    loadBookings();
  }, [pagination.current, pagination.pageSize, dateRange]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { current, pageSize } = pagination;
      const [startDate, endDate] = dateRange;

      const response = await getBookingsByUserIdAndDateRange(
        // new Date(startDate.setHours(0, 0, 0, 0)).toISOString(),
        // new Date(endDate.setHours(23, 59, 59, 999)).toISOString()
      );

      setBookings(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total
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

  const handleTableChange = (pagination) => {
    setPagination(pagination);
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
    setDateRange(dates);
    setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页
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
      title: '航班ID',
      dataIndex: 'flightId',
      key: 'flightId'
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
      title: '乘客数',
      key: 'passengerCount',
      dataIndex: 'passengers', // Add dataIndex even though we don't use it directly
      render: (_, record) => record.passengers.length
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
      title: '舱位等级',
      dataIndex: 'cabinClassType',
      key: 'cabinClassType',
      render: (type) => {
        const typeMap = {
          1: '经济舱',
          2: '商务舱',
          3: '头等舱'
        };
        return typeMap[type] || `未知(${type})`;
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
      <Card className="bookings-card">
        <div className="page-header">
          <h1>我的预订</h1>
          <div className="header-actions">
            {/*<DatePicker*/}
            {/*  selectsRange*/}
            {/*  startDate={dateRange[0]}*/}
            {/*  endDate={dateRange[1]}*/}
            {/*  onChange={handleDateChange}*/}
            {/*  minDate={new Date(2020, 0, 1)}*/}
            {/*  maxDate={new Date()}*/}
            {/*  dateFormat="yyyy-MM-dd"*/}
            {/*  placeholderText="选择日期范围"*/}
            {/*  className="date-picker"*/}
            {/*  style={{ marginRight: 16 }}*/}
            {/*  isClearable={true}*/}
            {/*  withPortal*/}
            {/*  showTimeSelect={false}*/}
            {/*/>*/}
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
          pagination={pagination}
          onChange={handleTableChange}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default MyBookings;
