import api from '@/services/http';
import service from "@/services/http";

export function getAll() {
    return service({
        url: 'users/getAll',
        method: 'get'
    })
}

// 通过邮箱查询用户
export function findByEmail(email) {
    return service({
        url: 'users/findByEmail',
        method: 'get',
        params: { email }
    })
}

// 重置密码
export function resetPassword(ids) {
    return service({
        url: 'users/resetPwd',
        method: 'put',
        data: ids
    })
}

// 邮箱重置密码
export function resetPasswordByEmail(params) {
    return service({
        url: 'users/resetPwdByEmail',
        method: 'post',
        data: params
    })
}
// 修改密码
export function updatePassword(params) {
    return service({
        url: 'users/updatePass',
        method: 'post',
        data: params
    })
}

// 发送重置密码邮件
// export function sendResetPasswordEmail(email) {
//     return service({
//         url: 'users/sendResetEmail',
//         method: 'post',
//         data: { email }
//     })
// }
