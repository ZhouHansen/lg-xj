var host = 'https://api.mlab.com/api/1/databases/my-db1/collections/'
var apiKey = 'q4vsE-BwyJnqZDJSC_d1240H82QBoKVv'

module.exports = {
  postData (data, resolve, reject) {
    resolve = resolve ? resolve : function (){}
    reject = reject ? reject : function (){}
    var villageId = data.villageId
    delete data.villageId
    fetch(url('polling'), {
      method: 'post',
      headers: {
        "Content-type": "application/json;charset=utf-8"
      },
      body: JSON.stringify(data)
    })
    .then(() => {
      return fetch(url('cunmin', JSON.stringify({ 'villageId': villageId })))
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      resolve()
    })
    .catch(reject)
  }
}

function url(collection, q) {
  if (q) {
    return `${host}${collection}?apiKey=${apiKey}&q=${q}`
  }
  return `${host}${collection}?apiKey=${apiKey}`
}
