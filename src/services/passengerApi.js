import service from "@/services/http";

// 添加乘客
export function addPassenger(passengerData) {
    return service({
        url: 'passengers',
        method: 'post',
        data: passengerData
    })
}

// 更新乘客
export function updatePassenger(passengerData) {
    return service({
        url: 'passengers',
        method: 'put',
        data: passengerData
    })
}

// 获取乘客列表
export function getPassengersByUserId() {
    return service({
        url: 'passengers/listByUserId',
        method: 'get'
    })
}

// 删除乘客
export function deletePassenger(id) {
    return service({
        url: `passengers/${id}`,
        method: 'delete'
    })
}
