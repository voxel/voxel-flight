# voxel-flight

Double-tap jump to toggle flight mode, then use jump/crouch to adjust altitude, and land if you hit the ground

Based on [voxel-fly](https://github.com/maxogden/voxel-fly) by @maxogden,
but for [voxel-engine#ndarray](https://github.com/maxogden/voxel-engine/pull/103),
no longer controls or depends on [voxel-player](https://github.com/substack/voxel-player),
and loads as a plugin.

### install
```
npm install voxel-flight
```

### usage

Load with [voxel-plugins](https://github.com/deathcap/voxel-plugins).
Requires [voxel-keys](https://github.com/deathcap/voxel-keys).

## API

#### var fly = game.plugins.get('voxel-flight')

Get a reference to the plugin

#### fly.startFlying()

Start flight, as if the user double-tapped jump to enter flight mode

#### fly.stopFlying()

Stop flight

#### fly.toggleFlying()

Toggle flight

## License

BSD
