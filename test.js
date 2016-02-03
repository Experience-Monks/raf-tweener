var rafTweener = require('./');
var eases = require('eases');
var target = {
	x: 0,
	y: 0
};

rafTweener.start();

rafTweener.to(
	target,
	10,
	{
		x: 100,
		y: 50,
		ease: eases.expoInOut,
		onUpdate: function() {
			console.log(this.x.toFixed(2), this.y.toFixed(2));
		},
		onUpdateScope: target,
		onComplete: function() {
			console.log('done!');
		}
	}
);

console.log('TEST!');