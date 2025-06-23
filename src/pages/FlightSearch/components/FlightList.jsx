import React from 'react';
import { Table } from '@/components/ui/Table';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

const FlightList = ({ 
  flights, 
  onBook, 
  currentPage, 
  pageSize, 
  totalElements, 
  onPageChange, 
  onPageSizeChange,
  loading 
}) => {
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return format(date, 'HH:mm, MMM dd');
  };

  const formatDate = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return format(date, 'yyyy-MM-dd');
  };

  const calculateDuration = (departureTime, arrivalTime) => {
    const start = new Date(departureTime);
    const end = new Date(arrivalTime);
    const durationInHours = (end - start) / (1000 * 60 * 60);
    return `${Math.floor(durationInHours)}h ${Math.round((durationInHours % 1) * 60)}m`;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'scheduled': 'blue',
      'delayed': 'orange',
      'cancelled': 'red',
      'boarding': 'green',
      'departed': 'purple',
      'arrived': 'cyan'
    };
    return statusColors[status] || 'default';
  };

  const columns = [
    {
      key: 'flightNumber',
      title: 'Flight Number',
      width: 150,
      render: (text, record) => (
        <div>
          <div className="font-semibold">{record.flight.flightNumber}</div>
          <div className="text-xs text-gray-500">
            {record.flight.airline?.name || 'Unknown Airline'}
          </div>
          {record.flight.status && (
            <Tag color={getStatusColor(record.flight.status.toLowerCase())}>
              {record.flight.status}
            </Tag>
          )}
        </div>
      )
    },
    {
      key: 'route',
      title: 'Route',
      render: (text, record) => (
        <div>
          <div className="font-medium">
            {record.flight.departureAirport?.code || record.flight.departureAirportId} → 
            {record.flight.destinationAirport?.code || record.flight.destinationAirportId}
          </div>
          <div className="text-sm">
            <span className="font-semibold">{formatDateTime(record.flight.departureTime)}</span> - 
            <span className="font-semibold">{formatDateTime(record.flight.arrivalTime)}</span>
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(record.flight.departureTime)}
          </div>
          <div className="text-xs text-gray-400">
            Duration: {calculateDuration(record.flight.departureTime, record.flight.arrivalTime)}
          </div>
        </div>
      )
    },
    {
      key: 'cabins',
      title: 'Available Classes',
      width: 300,
      render: (text, record) => (
        <div className="flex flex-col gap-1">
          {record.cabins.map(cabin => (
            <div key={cabin.id} className="flex justify-between items-center p-1 hover:bg-gray-50 rounded">
              <span className="text-sm font-medium">{cabin.name}</span>
              <div className="flex items-center gap-2">
                <Tag color={cabin.availableSeats > 5 ? 'green' : cabin.availableSeats > 0 ? 'orange' : 'red'}>
                  {cabin.availableSeats} seats
                </Tag>
                <span className="text-sm font-semibold">
                  ¥{cabin.price.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (text, record) => (
        <Button
          type="primary"
          size="small"
          disabled={record.cabins.every(cabin => cabin.availableSeats <= 0)}
          onClick={() => onBook(record)}
        >
          Book
        </Button>
      )
    }
  ];

  return (
    <div className="flight-list">
      <Table
        columns={columns}
        dataSource={flights}
        striped
        empty="No flights found. Try adjusting your search criteria."
        loading={loading}
        rowKey={record => record.flight.id}
        pagination={{
          current: currentPage + 1, // 后端从0开始，前端从1开始
          pageSize: pageSize,
          total: totalElements,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} flights`,
          onChange: (page, size) => {
            if (size !== pageSize) {
              onPageSizeChange(size);
            }
            onPageChange(page - 1); // 转换回后端的页码（从0开始）
          }
        }}
      />
    </div>
  );
};

FlightList.defaultProps = {
  flights: [],
  currentPage: 0,
  pageSize: 10,
  totalElements: 0,
  loading: false,
  onPageChange: () => {},
  onPageSizeChange: () => {},
  onBook: () => {}
};

export default FlightList;
