var ever = require('ever')
var vkey = require('vkey')
var events = require('events')

module.exports = function(game, opts) {
  return new Fly(game, opts)
}

module.exports.pluginInfo = {
  'loadAfter': ['player']
}

function Fly(game, opts) {
  this.game = game
  this.physical = opts.physical
  if (!this.game) throw 'voxel-fly requires game parameter';
  this.flySpeed = opts.flySpeed || 0.8

  this.enable()
}

Fly.prototype.enable = function() {
  var self = this
  var counter = 0
  var spaceUpAfterFirstDown = false
  var first = Date.now()

  if (!this.physical) this.physical = this.game.controls.target()

  ever(document.body)
    .on('keydown', onKeyDown)
    .on('keyup', onKeyUp)
  
  function onKeyDown(ev) {
    var key = vkey[ev.keyCode] || ev.char
    var binding = self.game.keybindings[key]
    if (binding !== "jump") return
    if (counter === 1) {
      if (Date.now() - first > 300) {
        spaceUpAfterFirstDown = false
        return first = Date.now()
      } else {
        if (spaceUpAfterFirstDown) {
          self.toggleFlying()
        }
      }
      spaceUpAfterFirstDown = false
      return counter = 0
    }
    if (counter === 0) {
      first = Date.now()
      counter += 1
    }
  }
  
  function onKeyUp(ev) {
    var key = vkey[ev.keyCode] || ev.char
    if (key === '<space>' && counter === 1) {
      spaceUpAfterFirstDown = true
    }
  }

  this.onKeyDown = onKeyDown;
  this.onKeyUp = onKeyUp;
}

Fly.prototype.disable = function() {
  if (this.flying)
    this.stopFlying()

  ever(document.body)
    .removeListener('keydown', this.onKeyDown)
    .removeListener('keyup', this.onKeyUp)
}

Fly.prototype.startFlying = function() {
  var self = this
  this.flying = true
  var physical = this.physical
  physical.removeForce(this.game.gravity)
  physical.onGameTick = function(dt) {
    if (physical.atRestY() === -1) return self.stopFlying()
    physical.friction.x = self.flySpeed
    physical.friction.z = self.flySpeed
    var press = self.game.controls.state
    if (press['crouch']) return physical.velocity.y = -0.01
    if (press['jump']) return physical.velocity.y = 0.01
    physical.velocity.y = 0
  }
  this.game.on('tick', physical.onGameTick)
}

Fly.prototype.stopFlying = function() {
  this.flying = false
  var physical = this.physical
  physical.subjectTo(this.game.gravity)
  this.game.removeListener('tick', physical.onGameTick)
}

Fly.prototype.toggleFlying = function() {
  if (this.flying) {
    this.stopFlying()
  } else {
    this.startFlying()
  }
}
