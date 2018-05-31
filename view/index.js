var html = require('choo/html')
var Nanocomponent = require('choo/component')
var ImageCompressor = require('image-compressor.js')

const { postData } = require('../fetch')

var TITLE = '分类记录'

module.exports = view

class QSubmit extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.state = state
    this.emit = emit
    this.submit = this.submit.bind(this)
    this.machineFn= this.machineFn.bind(this)
    this.machine = {
      idle: {
        CLICK: 'loading'
      },
      loading: {
        RESOLVE: 'goat',
        REJECT: 'error'
      },
      error: {
        CLICK: 'loading'
      }
    }
    this.command = {
      loading: this.loading.bind(this),
      goat: () => {
        setTimeout(() => {
          var win = window.open('', '_self')
          win.close()
        }, 1000)
      },
      error: () => {}
    }
    this.text = {
      idle: '提交',
      loading: '提交中...',
      goat: '提交成功',
      error: '网络错误'
    }
  }

  createElement () {
    return html`
      <button
        onclick=${this.submit()}
        class='fr bn bg-purple-blue h2 br2 white'>
        ${this.text[this.state.fetchState]}
      </button>
    `
  }

  submit () {
    return this.machineFn('CLICK')
  }

  machineFn (action) {
    return () => {
      var nextState = this.transition(this.state.fetchState, action)
      if (!nextState) return
      this.emit('state:fetchState', nextState)
      this.command[nextState]()
      this.render()
    }
  }

  loading () {
    var data = {
      id: Number(this.state.id),
      villageId: Number(this.state.villageId),
      score: this.state.score,
      photo: this.state.photo,
      date: new Date().getTime()
    }

    postData(data, () => {
      this.machineFn('RESOLVE')()
    }, () => {
      this.machineFn('REJECT')()
    })
  }

  transition (s, a) {
    return this.machine[s][a]
  }

  update () {
    return true
  }
}

class QCamera extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.state = state
    this.emit = emit
    this.close = this.close.bind(this)
  }

  createElement () {
    return html`
      <div class='mt3 w-100'>
        <label for='camera' class='${!this.state.photo ? "" : "dn"}'>
          <i class='icon icon-60 icon_camera'>
            <input id='camera' type='file' accept='image/*' capture='camera' class='hide w1'/>
          </i>
        </label>
        <div class='w4 h4 db ba bw2 b--purple-blue relative overflow-hidden ${!this.state.photo ? "hide" : ""}'>
          <i onclick=${this.close()} class='icon icon_close icon-30 absolute top-0 right-0'></i>
          <img src=${this.state.photo} />
        </div>
      </div>
    `
  }

  load () {
    var camera = document.getElementById('camera')

    camera.addEventListener('change', e => {
      var file = e.target.files[0]
      var self = this
      new ImageCompressor(file, {
        quality: 0,
        success (blob) {
          var reader = new FileReader()
          reader.onload = function() {
            self.emit('state:photo', reader.result)
            self.render()
          }
          reader.readAsDataURL(blob)
        },
        error (e) {
          console.log(e.message)
        }
      })
    })
  }

  close () {
    return e => {
      this.emit('state:photo', null)
      this.render()
    }
  }

  update () {
    return true
  }
}

class QScore extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.state = state
    this.emit = emit
    this.score = this.score.bind(this)
  }

  createElement () {
    var score = this.state.score
    return html`
      <div class='w-100 bt bw1 b--light-gray pt3 mt2'>
        <div class='w-60 flex justify-between'>
          <i onclick=${this.score(1)} class='icon ${score === 1 ? "icon_good_active animated pulse" : "icon_good"}'></i>
          <i onclick=${this.score(2)} class='icon ${score === 2 ? "icon_soso_active animated pulse" : "icon_soso"}'></i>
          <i onclick=${this.score(3)} class='icon ${score === 3 ? "icon_bad_active animated pulse" : "icon_bad"}'></i>
        </div>
      </div>
    `
  }

  score (score) {
    return e => {
      this.emit('state:score', score)
      this.emit('render')
    }
  }

  update () {
    return true
  }
}

class Component extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.page = 'polling'
    this.unHeightFix = true
    this.state = state
    this.emit = emit
    this.qScore = new QScore(state, emit)
    this.qCamera = new QCamera(state, emit)
    this.qSubmit = new QSubmit(state, emit)

    this.num = state.query.num
    emit('state:id', state.query.id)
    emit('state:villageId', state.query.villageId)
  }

  createElement () {
    var score = this.state.score
    return html`
      <main class='w-100 flex flex-column flex-auto bg-dz items-center'>
        <header class='w-100 tc purple-blue f3 bold05 bg-white pv2 tracked'>分类记录</header>
        <section class='w-90'>
          <p class='f5 navy'>
            住户编号
            <span class='purple-blue monospace f3 b'>A${this.num}</span>
            ${this.qSubmit.render()}
          </p>
          ${this.qScore.render()}
          ${score !== 1 ? this.qCamera.render() : ''}
        </section>
      </main>
    `
  }

  update () {
    return true
  }
}

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  var component = new Component(state, emit)

  return html`
    <body class='w-100 h-100 overflow-hidden flex flex-column bg-n-white'>
      ${component.render()}
    </body>
  `
}
