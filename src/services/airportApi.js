import service from "@/services/http";

// 获取所有机场
export function getAllAirports() {
    return service({
        url: 'airports',
        method: 'get'
    })
}

// 根据ID获取机场
export function getAirportById(id) {
    return service({
        url: 'airports/get',
        method: 'get',
        params: { id }
    })
}

// 根据机场code获取机场
export function getAirportByCode(id) {
    return service({
        url: 'airports/code',
        method: 'get',
        params: { code: id }
    })
}

// 根据机场code获取机场
export function getAirportByAirportId(id) {
    return service({
        url: 'airports/airId',
        method: 'get',
        params: { airportId: id }
    })
}
