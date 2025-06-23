import service from '../services/http'

export function login(data) {
  return service({
    url: 'auth/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return service({
    url: 'auth/info',
    method: 'get'
  })
}

export function logout() {
  return service({
    url: 'auth/logout',
    method: 'delete'
  })
}

export function register(data) {
  return service({
    url: 'auth/register',
    method: 'post',
    data
  })
}
