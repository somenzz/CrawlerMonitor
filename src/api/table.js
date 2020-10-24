import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/api/cbrcdoc/crawler/',
    method: 'get',
    params: params
  })
}

export function download(id, flag) {
  return request({
    url: `/api/cbrcdoc/download/${id}/${flag}/`,
    method: 'get',
    responseType: 'blob'
  })
}

export function execute(id) {
  return request({
    url: `/api/cbrcdoc/execute/${id}/`,
    method: 'post',
  })
}


export function receivers(receiver_data) {
  return request({
    url: '/api/cbrcdoc/receivers/',
    method: 'post',
    data: receiver_data
  })
}
