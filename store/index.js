module.exports = (state, emitter) => {
  const INIT_DATA = {
    photo: null,
    fetchState: 'idle',
    keyState: 'idle',
    id: null,
    key: null,
    score: 3
  }

  Object.assign(state, INIT_DATA)

  emitter.on('state:id', id => {
    state.id = id
  })

  emitter.on('state:villageId', villageId => {
    state.villageId = villageId
  })

  emitter.on('state:score', score => {
    state.score = score
  })

  emitter.on('state:key', key => {
    state.key = key
  })

  emitter.on('state:fetchState', fetchState => {
    state.fetchState = fetchState
  })

  emitter.on('state:keyState', keyState => {
    state.keyState = keyState
  })  

  emitter.on('state:photo', photo => {
    state.photo = photo
  })
}
