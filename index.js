
module.exports = function(game, opts) {
  return new Fly(game, opts)
}

module.exports.pluginInfo = {
  loadAfter: ['voxel-keys']
}

function Fly(game, opts) {
  this.game = game
  this.physical = opts.physical
  if (!this.game) throw new Error('voxel-fly requires game parameter');
  if (!this.game.isClient) return;
  this.keys = game.plugins.get('voxel-keys');
  if (!this.keys) throw new Error('voxel-fly requires voxel-keys plugin');
  this.flySpeed = opts.flySpeed || 0.8

  this.enable()
}

Fly.prototype.enable = function() {
  var self = this
  var counter = 0
  var spaceUpAfterFirstDown = false
  var first = Date.now()

  if (!this.physical) this.physical = this.game.controls.target()

  this.keys.down.on('jump', this.onJumpDown = function() {
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
  });
 
  this.keys.up.on('jump', this.onJumpUp = function() {
    if (counter === 1) {
      spaceUpAfterFirstDown = true
    }
  });
}

Fly.prototype.disable = function() {
  if (this.flying)
    this.stopFlying()

  this.keys.down.removeListener('jump', this.onJumpDown);
  this.keys.up.removeListener('jump', this.onJumpUp);
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
    physical.velocity.y = 0
    if (press['jump']) physical.velocity.y += 0.01
    if (press['crouch']) physical.velocity.y -= 0.01
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
