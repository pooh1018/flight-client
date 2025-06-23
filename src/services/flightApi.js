import service from './http';

/**
 * 格式化日期为API所需的格式，UTC时间的ISO格式
 * @param {Date|string} date - 日期对象或日期字符串
 * @returns {string} 格式化后的日期字符串，UTC时间的ISO格式 (YYYY-MM-DDT00:00:00.000Z)
 */
const formatDateForApi = (date) => {
  if (!date) return undefined;

  // 如果传入的是字符串，先转换为Date对象
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // 创建一个新的Date对象，设置为输入日期的UTC午夜时间
  const utcDate = new Date(Date.UTC(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    0, 0, 0, 0
  ));

  // 返回ISO字符串格式，自动包含Z后缀表示UTC时间
  return utcDate.toISOString();
};

/**
 * 搜索航班
 * @param {Object} params - 搜索参数
 * @param {string} params.from - 出发城市
 * @param {string} params.to - 目的城市
 * @param {Date} params.date - 出发日期
 * @param {Date} [params.returnDate] - 返回日期（往返航班）
 * @param {string} params.cabinClass - 舱位等级
 * @param {number} params.passengers - 乘客数量
 * @param {number} [params.page=0] - 页码（从0开始）
 * @param {number} [params.size=10] - 每页大小
 * @param {string[]} [params.sort] - 排序字段和方向（如 ["price,asc", "departureTime,desc"]）
 * @returns {Promise} 搜索结果
 */
const searchFlights = async (params) => {
  try {
    // 格式化日期为YYYY-MM-DD格式
    const formattedParams = {
      ...params,
      date: formatDateForApi(params.date),
      returnDate: formatDateForApi(params.returnDate),
      departureDate: formatDateForApi(params.date)
    };

    // 如果是往返航班，需要同时搜索去程和返程
    if (formattedParams.returnDate) {
      const [outboundResponse, inboundResponse] = await Promise.all([
        service.post('flights/with-cabins/search/paged', {
          departureAirportId: formattedParams.from,
          destinationAirportId: formattedParams.to,
          startDate: formattedParams.date
        }, {
          params: {
            page: formattedParams.page,
            size: formattedParams.size,
            sort: formattedParams.sort
          }
        }),
        service.post('flights/with-cabins/search/paged', {
          departureAirportId: formattedParams.to,
          destinationAirportId: formattedParams.from,
          startDate: formattedParams.returnDate
        }, {
          params: {
            page: formattedParams.page,
            size: formattedParams.size,
            sort: formattedParams.sort
          }
        })
      ]);

      return {
        success: true,
        data: {
          outbound: outboundResponse.data,
          inbound: inboundResponse.data
        }
      };
    }

    // 单程航班搜索
    const response = await service.post('flights/with-cabins/search/paged', {
      departureAirportId: formattedParams.from,
      destinationAirportId: formattedParams.to,
      startDate: formattedParams.date
    }, {
      params: {
        page: formattedParams.page,
        size: formattedParams.size,
        sort: formattedParams.sort
      }
    });
    return response;
  } catch (error) {
    console.error('搜索航班失败:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error
    };
  }
};

/**
 * 获取航班详情
 * @param {string} flightId - 航班ID
 * @returns {Promise} 航班详情
 */
const getFlightDetails = async (flightId) => {
  try {
    const response = await service.get(`/flights/${flightId}`);
    return response;
  } catch (error) {
    console.error('获取航班详情失败:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error
    };
  }
};

/**
 * 获取航班价格日历
 * @param {Object} params - 查询参数
 * @returns {Promise} 价格日历数据
 */
const getFlightPriceCalendar = async (params) => {
  try {
    // 确保日期参数使用正确的格式
    const formattedParams = {
      ...params,
      startDate: params.startDate ? formatDateForApi(params.startDate) : undefined,
      endDate: params.endDate ? formatDateForApi(params.endDate) : undefined
    };

    const response = await service.get('/flights/price-calendar', {
      params: formattedParams
    });
    return response;
  } catch (error) {
    console.error('获取航班价格日历失败:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error
    };
  }
};

/**
 * 获取航班统计信息
 * @param {Object} params - 查询参数
 * @returns {Promise} 统计信息
 */
const getFlightStats = async (params) => {
  try {
    // 确保日期参数使用正确的格式
    const formattedParams = {
      ...params,
      startDate: params.startDate ? formatDateForApi(params.startDate) : undefined,
      endDate: params.endDate ? formatDateForApi(params.endDate) : undefined
    };

    const response = await service.get('/flights/stats', {
      params: formattedParams
    });
    return response;
  } catch (error) {
    console.error('获取航班统计信息失败:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error
    };
  }
};

/**
 * 检查航班座位可用性
 * @param {string} flightId - 航班ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 座位可用性信息
 */
const checkSeatAvailability = async (flightId, params) => {
  try {
    const response = await service.get(`/flights/${flightId}/seats`, { params });
    return response;
  } catch (error) {
    console.error('检查座位可用性失败:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error
    };
  }
};

/**
 * 获取航班行程信息
 * @param {string} flightId - 航班ID
 * @returns {Promise} 行程信息
 */
const getFlightItinerary = async (flightId) => {
  try {
    const response = await service.get(`/flights/${flightId}/itinerary`);
    return response;
  } catch (error) {
    console.error('获取航班行程信息失败:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error
    };
  }
};

/**
 * 获取航班价格趋势
 * @param {Object} params - 查询参数
 * @returns {Promise} 价格趋势数据
 */
const getFlightPriceTrend = async (params) => {
  try {
    // 确保日期参数使用正确的格式
    const formattedParams = {
      ...params,
      startDate: params.startDate ? formatDateForApi(params.startDate) : undefined,
      endDate: params.endDate ? formatDateForApi(params.endDate) : undefined
    };

    const response = await service.get('/flights/price-trend', {
      params: formattedParams
    });
    return response;
  } catch (error) {
    console.error('获取航班价格趋势失败:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error
    };
  }
};

export default {
  searchFlights,
  getFlightDetails,
  getFlightPriceCalendar,
  getFlightStats,
  checkSeatAvailability,
  getFlightItinerary,
  getFlightPriceTrend
};
