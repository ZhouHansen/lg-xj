var html = require('choo/html')
var Nanocomponent = require('choo/component')
var mitt = require('mitt')
var amme = mitt()
var ImageCompressor = require('image-compressor.js')

const { postData, postKey, getData, clearImage } = require('../fetch')

var TITLE = '分类记录'

module.exports = view

class QNormal extends Nanocomponent {
  constructor (state, emit, qUnpolling) {
    super()
    this.state = state
    this.emit = emit
    this.handleClick = this.handleClick.bind(this)
    this.qUnpolling = qUnpolling
  }

  createElement () {
    return html`
      <div class='w-100 f4 flex items-center'>
        <span>显示非常住户:</span>
        <div
          onclick=${this.handleClick}
          class='ml2 bg-white br2 b--blue ba bw015 w2 h2 flex items-center justify-center'>
          ${this.state.showUnNormal ? html`<i class='icon icon_agree icon-25'></i>` : html`<div></div>`}
        </div>
      </div>
    `
  }

  handleClick () {
    var showUnNormal = !this.state.showUnNormal

    this.emit('state:showUnNormal', showUnNormal)
    this.qUnpolling.render()
  }

  update () {
    return true
  }
}

class QUnpolling extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.state = state
    this.emit = emit
    this.qNormal = new QNormal(state, emit, this)
  }

  createElement () {
    return html`
      <main class='w-100 flex bt bw1 b--light-gray flex-column flex-auto bg-dz mt1'>
        <p class='f5 navy'>
          <span class='purple-blue monospace f3 b'>尚未巡检家庭</span>
        </p>
        ${this.qNormal.render()}
        ${this.state.unPolling ?
          html`
            <ul class='list pa0 f3'>
              ${
                this.state.unPolling.map(d => {
                  if (!d.isNormal && !this.state.showUnNormal) {
                    return html`
                      <span></span>
                    `
                  }

                  var midnight = new Date()

                  midnight.setHours(0,0,0,0)

                  if (d.lastUpdate && d.lastUpdate > midnight.getTime()) {
                    console.log(d.num)
                    return html`
                      <span></span>
                    `
                  }

                  return html`
                    <li class='mr2 dib'>${d.name + '-' + d.area + d.num}</li>
                  `
                })
              }
            </ul>
          ` :
          html`
            <section class='w-90'>
              <div class='tc mt4'>
                <i class='icon icon_spinner icon-40'></i>
              </div>
            </section>
          `
        }
      </main>
    `
  }

  load () {
    var area = this.state.area
    var villageId = this.state.villageId

    getData('cunmin', JSON.stringify({ area, villageId }), datas => {
      this.emit('state:unPolling', datas)
      this.render()
    }, err => {
      console.log(err)
    })
  }

  update () {
    return true
  }
}

class QLogout extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.state = state
    this.emit = emit
    this.handleClick = this.handleClick.bind(this)
  }

  createElement () {
    return html`
      <button
        onclick=${this.handleClick}
        class='bn bg-purple-blue h2 br2 white mt5'>
        退出
      </button>
    `
  }

  handleClick () {
    localStorage.removeItem('ljcz:key')
    this.emit('state:init')
    this.emit('render')
  }

  update () {
    return true
  }
}

class QkeySubmit extends Nanocomponent {
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

      },
      error: () => {}
    }
    this.text = {
      idle: '提交',
      loading: '提交中...',
      goat: '提交成功',
      error: '号码错误'
    }
  }

  loading () {
    var key = document.getElementById('key').value

    var last = key.substr(key.length - 4)

    if (last !== '1234') {
      key = '123123123'
    } else {
      key = key.substring(0, key.length - 4)
    }

    postKey(JSON.stringify({ name: key }), datas => {
      if (datas.length) {
        var data = datas[0]
        this.emit('state:key', data.key)

        localStorage.setItem('ljcz:key', data.key)

        this.machineFn('RESOLVE')()
        setTimeout(() => {
          this.emit('render')
        }, 500)
      } else {
        this.machineFn('REJECT')()
      }
    }, () => {
      this.machineFn('REJECT')()
    })
  }

  createElement () {
    return html`
      <button
        onclick=${this.submit()}
        class='bn bg-purple-blue h2 br2 white'>
        ${this.text[this.state.keyState]}
      </button>
    `
  }

  submit () {
    return this.machineFn('CLICK')
  }

  machineFn (action) {
    return () => {
      var nextState = this.transition(this.state.keyState, action)
      if (!nextState) return
      this.emit('state:keyState', nextState)
      this.command[nextState]()
      this.render()
    }
  }

  transition (s, a) {
    return this.machine[s][a]
  }

  update () {
    return true
  }
}

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
        DUPLICATION: 'duplication',
        REJECT: 'error'
      },
      error: {
        CLICK: 'loading'
      },
      duplication: {
        CLICK: 'loading'
      }
    }
    this.command = {
      loading: this.loading.bind(this),
      goat: () => {

      },
      error: () => {},
      duplication: () => {}
    }
    this.text = {
      idle: '提交',
      loading: '提交中...',
      goat: '提交成功',
      error: '网络错误',
      duplication: '重复提交'
    }
  }

  createElement () {
    return html`
      <button
        onclick=${this.submit()}
        class='bn bg-purple-blue h2 br2 white ${this.state.isAble ? "" : "disabled"}'>
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
      name: this.state.name,
      area: this.state.area,
      num: this.state.num,
      phone: this.state.phone,
      date: new Date().getTime()
    }

    var midnight = new Date()

    midnight.setHours(0,0,0,0)

    if (this.state.lastUpdate && this.state.lastUpdate > midnight.getTime()) {
      this.machineFn('DUPLICATION')()
      return
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
  constructor (state, emit, qSubmit) {
    super()
    this.state = state
    this.emit = emit
    this.close = this.close.bind(this)
    this.qSubmit = qSubmit
  }

  createElement () {
    if (this.state.score === 2 || this.state.score === 3) {
      return html`
        <div class='mt3 w-100'>
          <label for='camera' class='${!this.state.photo ? "" : "dn"}'>
            <i class='icon icon-60 icon_camera'>
              <input id='camera' type='file' accept='image/*' capture='camera' class='hide w1'/>
            </i>
          </label>
          <div class='w4 h4 ba bw2 b--purple-blue relative overflow-hidden ${!this.state.photo ? "hide dn" : "db"}'>
            <i onclick=${this.close()} class='icon icon_close icon-30 absolute top-0 right-0'></i>
            <img src=${this.state.photo} />
          </div>
        </div>
      `
    } else {
      return html`
        <div class='mt3 w-100'></div>
      `
    }

  }

  load () {
    var camera = document.getElementById('camera')

    camera.addEventListener('change', e => {
      var file = e.target.files[0]
      var self = this
      new ImageCompressor(file, {
        quality: 0.2,
        success (blob) {
          var reader = new FileReader()
          reader.onload = function() {
            self.emit('state:photo', reader.result)
            self.emit('state:isAble', true)
            self.qSubmit.render()            
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
      this.emit('state:isAble', false)
      this.qSubmit.render()      
      this.render()
    }
  }

  update () {
    return true
  }
}

class QNone extends Nanocomponent {
  constructor (state, emit, qScore, qCamera, qSubmit) {
    super()
    this.state = state
    this.emit = emit
    this.handleClick = this.handleClick.bind(this)
    this.qScore = qScore
    this.qCamera = qCamera
    this.qSubmit = qSubmit
  }

  createElement () {
    return html`
      <div class='w-100 bt bw1 b--light-gray pt3 mt2 f4 flex items-center justify-between'>
        <div class='w-50 flex items-center'>
          <span>没有垃圾:</span>
          <div
            onclick=${this.handleClick}
            class='ml2 bg-white br2 b--blue ba bw015 w2 h2 flex items-center justify-center'>
            ${this.state.score === 10 ? html`<i class='icon icon_agree icon-25'></i>` : html`<div></div>`}
          </div>
        </div>
        <a href='https://lg-xjjg.github.io/'>统计结果</a>
      </div>
    `
  }

  handleClick () {
    var score = this.state.score === 10 ? 3 : 10

    this.emit('state:score', score)
    this.emit('state:isAble', score === 10)
    this.emit('state:photo', null)
    this.qSubmit.render()
    this.qScore.render()
    this.qCamera.render()
    this.render()
  }

  update () {
    return true
  }
}

class QScore extends Nanocomponent {
  constructor (state, emit, qCamera, qSubmit) {
    super()
    this.state = state
    this.emit = emit
    this.score = this.score.bind(this)
    this.qCamera = qCamera
    this.qSubmit = qSubmit
  }

  createElement () {
    var score = this.state.score

    if (score === 10) {
      return html`<div class='w-100 pt3 mt2'></div>`
    } else {
      return html`
        <div class='w-100 pt3 mt2'>
          <div class='w-60 flex justify-between'>
            <i onclick=${this.score(1)} class='icon ${score === 1 ? "icon_good_active animated pulse" : "icon_good"}'></i>
            <i onclick=${this.score(2)} class='icon ${score === 2 ? "icon_soso_active animated pulse" : "icon_soso"}'></i>
            <i onclick=${this.score(3)} class='icon ${score === 3 ? "icon_bad_active animated pulse" : "icon_bad"}'></i>
          </div>
        </div>
      `
    }
  }

  score (score) {
    return e => {
      console.log(score === 1)
      this.emit('state:isAble', score === 1)
      this.emit('state:score', score)
      this.emit('state:photo', null)
      this.qCamera.render()
      this.qSubmit.render()
      this.render()
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
    this.qSubmit = new QSubmit(state, emit)
    this.qCamera = new QCamera(state, emit, this.qSubmit)
    this.qScore = new QScore(state, emit, this.qCamera, this.qSubmit)    
    this.qkeySubmit = new QkeySubmit(state, emit)
    this.qLogout = new QLogout(state, emit)
    this.qNone = new QNone(state, emit, this.qScore, this.qCamera, this.qSubmit)
    this.qUnpolling = new QUnpolling(state, emit)
    emit('state:id', state.query.id)
  }

  createElement () {
    var score = this.state.score

    if (localStorage.getItem('ljcz:key')) {
      this.emit('state:key', localStorage.getItem('ljcz:key'))
    }

    return html`
      <main class='w-100 flex flex-column flex-auto bg-dz items-center'>
        <header class='w-100 tc purple-blue f3 bold05 bg-white pv2 tracked'>分类记录</header>
        ${
          this.state.key ?
          (
            this.state.loading ?
            html`
              <section class='w-90'>
                <div class='tc mt4'>
                  <i class='icon icon_spinner icon-40'></i>
                </div>
              </section>
            ` :
            html`
              <section class='w-90'>
                <p class='f5 navy'>
                  <span class='purple-blue monospace f3 b'>${this.state.name}</span>
                  <span class='fr'>${this.state.villageName}
                    <span class='purple-blue monospace f3 b'>
                      ${' ' + this.state.area + this.state.num}
                    </span>
                  </span>
                </p>
                <p class='f5 navy'>
                  ${this.qSubmit.render()}                 
                </p>
                ${this.qNone.render()}
                ${this.qScore.render()}
                ${this.qCamera.render()}
                ${this.qUnpolling.render()}
                ${this.qLogout.render()}
              </section>
            `
          ) :
          html`
            <section class='w-90'>
              <p class='w-100 f5 navy bb pb3 bw1 b--light-gray'>
                ${this.qkeySubmit.render()}
              </p>
              <input id='key' class='semantic-input' type='text' placeholder='请输入巡检员姓名' />
            </section>
          `
        }

      </main>
    `
  }

  load () {
    if (this.state.loading && this.state.key) {
      var id = Number(this.state.id)
      getData('cunmin', JSON.stringify({ id }), datas => {
        var data = datas[0]
        this.emit('state:villageId', data.villageId)
        this.emit('state:villageName', data.villageName)
        this.emit('state:num', data.num)
        this.emit('state:area', data.area)
        this.emit('state:lastUpdate', data.lastUpdate)
        this.emit('state:name', data.name)
        this.emit('state:phone', data.phone)
        this.emit('state:loading', false)
        this.emit('render')
        clearImage()
      }, err => {
        console.log(err)
      })
    }
  }

  update () {
    return true
  }
}

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  var component = new Component(state, emit)

  return html`
    <body class='w-100 flex flex-column bg-n-white'>
      ${component.render()}
    </body>
  `
}
