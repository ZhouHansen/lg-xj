module.exports = (state, emitter) => {
  const INIT_DATA = {
    photo: null,
    fetchState: 'idle',
    keyState: 'idle',
    id: null,
    key: null,
    villageId: null,
    num: null,
    name: null,
    loading: true,
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

  emitter.on('state:num', num => {
    state.num = num
  })

  emitter.on('state:name', name => {
    state.name = name
  })

  emitter.on('state:photo', photo => {
    state.photo = photo
  })

  emitter.on('state:loading', loading => {
    state.loading = loading
  })

  emitter.on('state:init', () => {
    Object.assign(state, INIT_DATA)
  })
}
