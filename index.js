var lerp = require('lerp');
var defaults = require('lodash.defaults');

var animations = [];
var ticking = false;
var requestStop = false;

function linear(v) {
	return v;
}

var paramWhiteList = [
	'onComplete',
	'onCompleteScope',
	'onUpdate',
	'onUpdateScope',
	'delay',
	'ease',
	'animatedProperties'
];

function to(target, duration, params) {
	params = params || {};
	defaults(params, {
		delay: 0,
		duration: duration * 1000,
		ease: linear
	});
	params.target = target;
	var animatedProperties = Object.keys(params).filter(function(key){
		return paramWhiteList.indexOf(key) === -1;
	}).map(function(key){
		return {
			key:key,
			valueStart: target[key],
			valueEnd: params[key]
		};
	});
	params.animatedProperties = animatedProperties;
	params.startTime = Date.now() + params.delay;
	params.endTime = params.startTime + params.duration;
	animations.push(params);	
}

var now = Date.now();
function tick() {
	now = Date.now();
	animations.forEach(function(animation) {
		var target = animation.target;
		if(now > animation.startTime) {
			var progress = animation.ease(Math.min(1, (now - animation.startTime) / animation.duration));
			// if(isNaN(progress) || progress < 0 || progress > 1) throw new Error('Should not happen.');
			animation.animatedProperties.forEach(function(property) {
				target[property.key] = lerp(property.valueStart, property.valueEnd, progress);
			});
			if(animation.onUpdate) {
				animation.onUpdate.call(animation.onUpdateScope);
			}
			if(now >= animation.endTime) {
				if(animation.onComplete) {
					animation.onComplete.call(animation.onCompleteScope);
				}
				killTweensOf(animation.target);
			}
		}
	});
}

function killTweensOf(target) {
	for (var i = animations.length - 1; i >= 0; i--) {
		if(animations[i].target === target) {
			animations.splice(i, 1);
		}
	}
}

function rafTick() {
	if(requestStop) {
		requestStop = false;
		return;
	}
	tick();
	window.requestAnimationFrame(rafTick);
}

function start() {
	if(ticking) return;
	ticking = true;
	window.requestAnimationFrame(rafTick);
}

function stop() {
	if(!ticking || requestStop) return;
	requestStop = true;
	ticking = false;
}

var rafTweener = {
	to: to,
	killTweensOf: killTweensOf,
	tick: tick,
	start: start,
	stop: stop
};

module.exports = rafTweener;