import service from "@/services/http";

// ==================== 预订相关 API ====================

/**
 * 创建预订
 * @param {Object} bookingData - 预订数据
 * @returns {Promise} - API 响应
 */
export function createBooking(bookingData) {
    return service({
        url: 'bookings',
        method: 'post',
        data: bookingData
    });
}

/**
 * 获取预订列表（不带分页）
 * @param {start} params.date - 开始日期
 * @param {end} params.date - 结束日期
 * @returns {Promise} - API 响应
 */
export function getBookingsByUserIdAndDateRange(start = null, end = null) {
    const params = {
        start: start,
        end: end
    };

    return service({
        url: 'bookings/my/date-range',
        method: 'get',
        params
    });
}

/**
 * 获取预订列表（带分页）
 * @param {start} params.start - 开始日期
 * @param {end} params.end - 结束日期
 * @param {number} [params.page=1] - 页码（从1开始）
 * @param {number} [params.size=10] - 每页大小
 * @param {string[]} [params.sort] - 排序字段和方向
 * @returns {Promise} - API 响应
 */
export function getBookingsByUserIdAndDateRangePaged(params) {
    const start = params?.start || null;
    const end = params?.end || null;

    // 确保页码参数存在且为数字
    const page = typeof params.page === 'number' ? params.page : 1;
    const size = typeof params.size === 'number' ? params.size : 10;
    const sort = params.sort || undefined;

    return service({
        url: 'bookings/my/date-range/paged',
        method: 'get',
        params: {
            start,
            end,
            page,
            size,
            sort
        }
    });
}
/**
 * 获取预订详情
 * @param {string} id - 预订ID
 * @returns {Promise} - API 响应
 */
export function getBookingDetail(id) {
    return service({
        url: `bookings/${id}`,
        method: 'get'
    });
}

/**
 * 取消预订
 * @param {string} id - 预订ID
 * @returns {Promise} - API 响应
 */
export function cancelBooking(id) {
    return service({
        url: `bookings/${id}/cancel`,
        method: 'put'
    });
}

/**
 * 更新预订信息
 * @param {string} id - 预订ID
 * @param {Object} bookingData - 更新的预订数据
 * @returns {Promise} - API 响应
 */
export function updateBooking(id, bookingData) {
    return service({
        url: `bookings/${id}`,
        method: 'put',
        data: bookingData
    });
}

// ==================== 乘客相关 API ====================

/**
 * 创建乘客信息
 * @param {Object} passengerData - 乘客数据
 * @returns {Promise} - API 响应
 */
export function createPassenger(passengerData) {
    return service({
        url: 'passengers',
        method: 'post',
        data: passengerData
    });
}

/**
 * 根据ID获取乘客信息
 * @param {string} id - 乘客ID
 * @returns {Promise} - API 响应
 */
export function getPassengerById(id) {
    return service({
        url: `passengers/${id}`,
        method: 'get'
    });
}

/**
 * 根据预订ID获取乘客列表
 * @param {string} bookingId - 预订ID
 * @returns {Promise} - API 响应
 */
export function getPassengersByBookingId(bookingId) {
    return service({
        url: `passengers/booking/${bookingId}`,
        method: 'get'
    });
}

/**
 * 获取所有乘客
 * @returns {Promise} - API 响应
 */
export function getAllPassengers() {
    return service({
        url: 'passengers',
        method: 'get'
    });
}

/**
 * 更新乘客信息
 * @param {string} id - 乘客ID
 * @param {Object} passengerData - 更新的乘客数据
 * @returns {Promise} - API 响应
 */
export function updatePassenger(id, passengerData) {
    return service({
        url: `passengers/${id}`,
        method: 'put',
        data: passengerData
    });
}

/**
 * 删除乘客
 * @param {string} id - 乘客ID
 * @returns {Promise} - API 响应
 */
export function deletePassenger(id) {
    return service({
        url: `passengers/${id}`,
        method: 'delete'
    });
}
