import http from '@/utils/http';

export const getFlightById = async (flightId) => {
  try {
    const response = await http.get(`/api/flights/${flightId}`);
    return response.data;
  } catch (error) {
    console.error('获取航班详情失败:', error);
    throw error;
  }
};

export const searchFlights = async (params) => {
  try {
    const response = await http.get('/api/flights/search', { params });
    return response.data;
  } catch (error) {
    console.error('搜索航班失败:', error);
    throw error;
  }
};
