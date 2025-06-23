import service from "@/services/http";

// 添加乘客
export function addPassenger(passengerData) {
    return service({
        url: 'passenger/add',
        method: 'post',
        data: passengerData
    })
}

// 获取乘客列表
export function getPassengers() {
    return service({
        url: 'passenger/list',
        method: 'get'
    })
}
