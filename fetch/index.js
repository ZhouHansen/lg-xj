var host = 'https://api.mlab.com/api/1/databases/my-db1/collections/'
var apiKey = 'q4vsE-BwyJnqZDJSC_d1240H82QBoKVv'

module.exports = {
  postData (collection, data, resolve, reject) {
    resolve = resolve ? resolve : function (){}
    reject = reject ? reject : function (){}

    fetch(url(collection), {
      method: 'post',
      headers: {
        "Content-type": "application/json;charset=utf-8"
      },
      body: JSON.stringify(data)
    }).then(resolve)
      .catch(reject)
  }
}

function url(collection) {
  return `${host}${collection}?apiKey=${apiKey}`
}
