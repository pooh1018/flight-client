import service from "@/services/http";

// 创建预订
export function createBooking(bookingData) {
    return service({
        url: 'booking/create',
        method: 'post',
        data: bookingData
    })
}

// 获取预订列表
export function getBookings() {
    return service({
        url: 'booking/list',
        method: 'get'
    })
}
