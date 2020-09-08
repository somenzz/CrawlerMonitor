const Mock = require('mockjs')
const { Random } = require('mockjs')

const data = Mock.mock({
  'items|30': [{
    id: '@id',
    url: '@url',
    latest_date: '@datetime',
    docs_num_crawled: '@integer(1,100)',
    'status|1': ['running', 'exception'],
    'path': '/home/aaron/download/'+'@string("lower",10)'
  }]
})

module.exports = [
  {
    url: '/vue-admin-template/table/list',
    type: 'get',
    response: config => {
      const items = data.items
      return {
        code: 20000,
        data: {
          total: items.length,
          items: items
        }
      }
    }
  }
]
