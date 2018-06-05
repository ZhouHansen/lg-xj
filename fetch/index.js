var host = 'https://api.mlab.com/api/1/databases/my-db1/collections/'
var apiKey = 'q4vsE-BwyJnqZDJSC_d1240H82QBoKVv'

module.exports = {
  postKey (q, resolve, reject) {
    resolve = resolve ? resolve : function (){}
    reject = reject ? reject : function (){}

    fetch(url('pollingman', q))
    .then(res => res.json())
    .then(resolve)
    .catch(reject)
  },

  postData (data, resolve, reject) {
    resolve = resolve ? resolve : function (){}
    reject = reject ? reject : function (){}
    var pollingData = JSON.parse(JSON.stringify(data))

    if (pollingData.photo) {
      pollingData.photo = true
    }

    fetch(url('polling'), {
      method: 'post',
      headers: {
        'Content-type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(pollingData)
    })
    .then(() => {
      if (data.photo) {
        var obj = {
          photo: data.photo,
          id: data.id,
          date: data.date
        }
        return fetch(url('photo'), {
          method: 'post',
          headers: {
            'Content-type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify(obj)
        })
      } else {
        return true
      }
    })
    .then(() => {
      return fetch(url('cunmin', JSON.stringify({ 'id': data.id })))
    })
    .then(res => res.json())
    .then(datas => {
      var cunmin = datas[0]

      cunmin[`score${data.score}`] += 1

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

      village[`score${data.score}`] += 1

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
