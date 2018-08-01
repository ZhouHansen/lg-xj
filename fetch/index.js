var host = 'https://api.mlab.com/api/1/databases/my-db1/collections/'
var apiKey = 'q4vsE-BwyJnqZDJSC_d1240H82QBoKVv'
var hasPost = false

module.exports = {
  postKey (q, resolve, reject) {
    resolve = resolve ? resolve : function (){}
    reject = reject ? reject : function (){}

    fetch(url('pollingman', q))
    .then(res => res.json())
    .then(resolve)
    .catch(reject)
  },

  getData (collection, q, resolve, reject) {
    resolve = resolve ? resolve : function (){}
    reject = reject ? reject : function (){}
    fetch(url(collection, q))
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

    if (hasPost) {
      resolve()
      return
    }

    hasPost = true

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
      cunmin.lastUpdate = new Date().getTime()

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
    .then(() => {
      hasPost = true
      resolve()
    })
    .catch(() => {
      hasPost = false
      reject()      
    })
  },

  clearImage () {
    var d = new Date()
    d.setHours(0,0,0,0)
    var yMidnight = d.getTime() - 24 * 1000 * 3600

    fetch(url('clear'))
    .then(res => res.json())
    .then(datas => new Promise((resolve, reject) => {
      var clearDate = datas[0].date
   
      if (yMidnight - clearDate < 24 * 1000 * 3600) {
        reject(false)
      } else {
        resolve()
      }
    }))
    .then(() => {
      return fetch(url('photo', JSON.stringify({ date: { $lt: yMidnight } })) + '&m=true', {
        method: 'put',
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify([])   
      })
    })
    .then(() => {
      return fetch(url('polling', JSON.stringify({ date: { $lt: yMidnight }, photo: true })) + '&m=true', {
        method: 'put',
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify( { "$set" : { "photo" : null } } )
      })
      .then(datas => {
        console.log(datas)
      })      
    })
    .then(() => {
      return fetch(url('clear'), {
        method: 'put',
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify([{date: yMidnight}])     
      })         
    })
    .catch(err => {
      console.log(err)
    })
  }
}

function url(collection, q) {
  if (q) {
    return `${host}${collection}?apiKey=${apiKey}&q=${q}`
  }
  return `${host}${collection}?apiKey=${apiKey}`
}
