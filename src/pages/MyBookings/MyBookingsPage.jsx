import React, { useState, useEffect } from 'react';
import { Table, Button, Message, Modal } from '@/components/ui';
import service from '@/services/http';
import './MyBookingsPage.css';

function MyBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const columns = [
        {
            label: "航班号",
            prop: "flightNumber",
            width: 120
        },
        {
            label: "出发地",
            prop: "departure"
        },
        {
            label: "目的地",
            prop: "destination"
        },
        {
            label: "出发时间",
            prop: "departureTime",
            render: (data) => {
                return new Date(data.departureTime).toLocaleString();
            }
        },
        {
            label: "状态",
            prop: "status",
            width: 100,
            render: (data) => {
                const statusMap = {
                    'confirmed': '预定成功',
                    'cancelled': '已取消',
                    'completed': '已完成'
                };
                return <span className={`status-tag ${data.status}`}>
                    {statusMap[data.status] || data.status}
                </span>;
            }
        },
        {
            label: "操作",
            width: 200,
            render: (row) => {
                return (
                    <div>
                        <Button
                            type="text"
                            size="small"
                            onClick={() => handleViewDetails(row)}
                        >
                            查看详情
                        </Button>
                        {row.status === 'confirmed' && (
                            <Button
                                type="text"
                                size="small"
                                onClick={() => handleCancelBooking(row)}
                            >
                                取消预订
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ];

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await service.get('/bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('获取预订列表失败:', error);
            Message.error('获取预订列表失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setDetailsModalVisible(true);
    };

    const handleCancelBooking = (booking) => {
        setSelectedBooking(booking);
        setCancelModalVisible(true);
    };

    const confirmCancelBooking = async () => {
        try {
            await service.post(`/bookings/${selectedBooking.id}/cancel`);
            Message.success('预订已取消');
            setCancelModalVisible(false);
            fetchBookings(); // 刷新列表
        } catch (error) {
            console.error('取消预订失败:', error);
            Message.error('取消预订失败，请稍后重试');
        }
    };

    return (
        <div className="my-bookings-page">
            <div className="bookings-container">
                <h2 className="page-title">我的预订</h2>
                <Table
                    style={{width: '100%'}}
                    columns={columns}
                    data={bookings}
                    border={true}
                    loading={loading}
                    emptyText="暂无预订记录"
                />
            </div>

            {/* 预订详情 Modal */}
            {selectedBooking && (
                <Modal
                    visible={detailsModalVisible}
                    title="预订详情"
                    onClose={() => setDetailsModalVisible(false)}
                    footer={
                        <Button type="primary" onClick={() => setDetailsModalVisible(false)}>
                            确定
                        </Button>
                    }
                >
                    <div>
                        <p><strong>航班号：</strong> {selectedBooking.flightNumber}</p>
                        <p><strong>出发地：</strong> {selectedBooking.departure}</p>
                        <p><strong>目的地：</strong> {selectedBooking.destination}</p>
                        <p><strong>出发时间：</strong> {new Date(selectedBooking.departureTime).toLocaleString()}</p>
                        <p><strong>预订时间：</strong> {new Date(selectedBooking.bookingTime).toLocaleString()}</p>
                        <p><strong>状态：</strong> {selectedBooking.status}</p>
                        {selectedBooking.price && <p><strong>价格：</strong> ￥{selectedBooking.price}</p>}
                    </div>
                </Modal>
            )}

            {/* 取消预订确认 Modal */}
            {selectedBooking && (
                <Modal
                    visible={cancelModalVisible}
                    title="提示"
                    onClose={() => setCancelModalVisible(false)}
                    footer={
                        <>
                            <Button onClick={() => setCancelModalVisible(false)}>取消</Button>
                            <Button type="primary" danger onClick={confirmCancelBooking}>
                                确定
                            </Button>
                        </>
                    }
                >
                    <p>确定要取消这个预订吗？</p>
                </Modal>
            )}
        </div>
    );
}

export default MyBookingsPage;
