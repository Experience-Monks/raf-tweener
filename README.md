# raf-tweener

[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

An extremely minimal tweening engine based on GSAP, powered by requestAnimationFrame.

```
var rafTweener = require('raf-tweener');
var eases = require('eases');
var target = {
	x: 0,
	y: 0
};

rafTweener.start();

rafTweener.to(
	target, //tween target object
	10, //duration
	{
		x: 100, //value to tween
		y: 50, //value to tween
		ease: eases.expoInOut, //an easing method takes in a value 0..1 and returns a value 0..1
		onUpdate: function() {
			console.log(this.x.toFixed(2), this.y.toFixed(2));
		},
		onUpdateScope: target,
		onComplete: function() {
			console.log('done!');
		}
	}
);
```

## Usage

[![NPM](https://nodei.co/npm/raf-tweener.png)](https://nodei.co/npm/raf-tweener/)

## License

MIT, see [LICENSE.md](http://github.com/bunnybones1/raf-tweener/blob/master/LICENSE.md) for details.
