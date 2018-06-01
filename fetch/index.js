var host = 'https://api.mlab.com/api/1/databases/my-db1/collections/'
var apiKey = 'q4vsE-BwyJnqZDJSC_d1240H82QBoKVv'

module.exports = {
  postData (data, resolve, reject) {
    resolve = resolve ? resolve : function (){}
    reject = reject ? reject : function (){}
    fetch(url('polling'), {
      method: 'post',
      headers: {
        'Content-type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data)
    })
    .then(() => {
      return fetch(url('cunmin', JSON.stringify({ 'id': data.id })))
    })
    .then(res => res.json())
    .then(datas => {
      var cunmin = datas[0]

      if (!cunmin.score) {
        cunmin.score = 0
      }

      cunmin.score += data.score

      return fetch(url('cunmin', JSON.stringify({ 'id': data.id })), {
        method: 'put',
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(cunmin)
      })
    })
    .then(() => {
      return fetch(url('village', JSON.stringify({ 'id': data.villageId })))
    })
    .then(res => res.json())
    .then(datas => {
      var village = datas[0]

      if (!village.score) {
        village.score = 0
      }

      village.score += data.score

      return fetch(url('village', JSON.stringify({ 'id': data.villageId })), {
        method: 'put',
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(village)
      })
    })
    .then(resolve)
    .catch(reject)
  }
}

function url(collection, q) {
  if (q) {
    return `${host}${collection}?apiKey=${apiKey}&q=${q}`
  }
  return `${host}${collection}?apiKey=${apiKey}`
}
