var lerp = require('lerp');
var defaults = require('lodash.defaults');

function linear(v) {
	return v;
}

var __paramWhiteList = [
	'onComplete',
	'duration',
	'target',
	'onCompleteScope',
	'onUpdate',
	'onUpdateScope',
	'delay',
	'override',
	'ease',
	'animatedProperties'
];

function RawTweener() {
	this.now = 0;
	this.animations = [];
}

RawTweener.prototype.to = function(target, duration, params) {
	params = params || {};
	defaults(params, {
		delay: 0,
		duration: duration * 1000,
		ease: linear
	});
	if(typeof params.ease !== 'function') {
		throw new Error('ease must be an easing function that takes in a number (0..1) and returns a number (0..1)');
	}
	params.target = target;
	var animatedProperties = Object.keys(params).filter(function(key){
		return __paramWhiteList.indexOf(key) === -1;
	}).map(function(key){
		if(isNaN(target[key]) || isNaN(params[key])) {
			throw new Error('values must be numbers');
		}
		return {
			key:key,
			valueStart: target[key],
			valueEnd: params[key]
		};
	});
	params.animatedProperties = animatedProperties;
	params.startTime = this.now + params.delay;
	params.endTime = params.startTime + params.duration;
	params.kill = kill.bind(this, params);
	this.animations.push(params);
	return params;
};

var __animationsToComplete = [];
RawTweener.prototype.tick = function(delta) {
	this.now += delta;
	var now = this.now;
	var animations = this.animations;
	animations.forEach(function(animation, i) {
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
			if(now >= animation.endTime && animations.indexOf(animation) !== -1) {
				__animationsToComplete.push(animation);
			}
		}
	});
	if(__animationsToComplete.length > 0) {
		for (var i = __animationsToComplete.length - 1; i >= 0; i--) {
			var animation = __animationsToComplete[i];
			var index = animations.indexOf(animation);
			if(index === -1) continue;
			animations.splice(index, 1);
			var target = animation.target;
			animation.animatedProperties.forEach(function(property) {
				target[property.key] = property.valueEnd;
			});
			if(animation.onUpdate) {
				animation.onUpdate.call(animation.onUpdateScope);
			}
			if(animation && animation.onComplete) {
				animation.onComplete.call(animation.onCompleteScope);
			}
		}
		__animationsToComplete.length = 0;
	}
};

RawTweener.prototype.staggerTo = function(targets, duration, params, stagger) {
	var _this = this;
	targets.forEach(function(target, i){
		params.delay = params.delay || 0;
		var paramsClone = {};
		defaults(paramsClone, params);
		paramsClone.delay += stagger;
		_this.to(target, duration, paramsClone);
	});
};

RawTweener.prototype.killTweensOf = function(target) {
	var animations = this.animations;
	for (var i = animations.length - 1; i >= 0; i--) {
		if(animations[i].target === target) {
			animations.splice(i, 1);
		}
	}
}

RawTweener.prototype.toString = function() {
	return '[object RawTweener]';
};

function kill(animation) {
	var index = this.animations.indexOf(animation);
	if(index !== -1) {
		this.animations.splice(index, 1);
	}
}

module.exports = RawTweener;