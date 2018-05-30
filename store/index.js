module.exports = (state, emitter) => {
  const INIT_DATA = {
    photo: null,
    fetchState: 'idle',
    num: null,
    score: 3
  }

  Object.assign(state, INIT_DATA)

  emitter.on('state:num', num => {
    state.num = num
  })

  emitter.on('state:score', score => {
    state.score = score
  })

  emitter.on('state:fetchState', fetchState => {
    state.fetchState = fetchState
  })

  emitter.on('state:photo', photo => {
    state.photo = photo
  })
}
