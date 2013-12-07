var ever = require('ever')
var vkey = require('vkey')
var events = require('events')

module.exports = function(game, opts) {
  return new Fly(game, opts)

}

function Fly(game, opts) {
  this.game = game
  this.physical = opts.physical
  if (!this.game || !this.physical) throw "voxel-fly requires game parameter and option 'physical'"
  this.noKeyEvents = opts.noKeyEvents || false
  this.flySpeed = opts.flySpeed || 0.8
  this.enabled = opts.enabled || true
  if (!this.noKeyEvents) this.bindKeyEvents()
}

Fly.prototype.bindKeyEvents = function(el) {
  if (!el) el = document.body
  var self = this
  var counter = 0
  var spaceUpAfterFirstDown = false
  var first = Date.now()
  ever(el)
    .on('keydown', onKeyDown)
    .on('keyup', onKeyUp)
  
  function onKeyDown(ev) {
    if (!self.enabled) return

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
    if (!self.enabled) return

    var key = vkey[ev.keyCode] || ev.char
    if (key === '<space>' && counter === 1) {
      spaceUpAfterFirstDown = true
    }
  }
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
