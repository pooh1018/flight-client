import service from "@/services/http";

// 添加乘客
export function addPassenger(passengerData) {
    return service({
        url: 'passengers/add',
        method: 'post',
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
export function deletePassenger(passengerId) {
    return service({
        url: `passengers/delete/${passengerId}`,
        method: 'delete'
    })
}

