var RawTweener = require('./raw-tweener');

function RafTweener(discreteStepDuration) {
	RawTweener.call(this);
	if(discreteStepDuration === undefined) {
		this.update = this.tick;
	} else {
		this.discreteStepDuration = discreteStepDuration;
		this.update = this.discreteStepTick;
	}
	this._rafTick = this._rafTick.bind(this);
}

RafTweener.prototype = Object.create(RawTweener.prototype);

RafTweener.prototype._rafTick = function() {
	if(this.requestStop) {
		this.requestStop = false;
		return;
	}
	var timeSnapshot = Date.now();
	var delta = timeSnapshot - this.timeSnapshot;
	if(!this.paused) {
		this.update(delta);
	}
	this.timeSnapshot = timeSnapshot;
	window.requestAnimationFrame(this._rafTick);
};

RafTweener.prototype.discreteStepTick = function(delta) {
	var newNow = this.now + delta;
	while(this.now < newNow) {
		this.tick(this.discreteStepDuration);
	}
};

RafTweener.prototype.start = function() {
	this.timeSnapshot = Date.now();
	if(this.discreteStepDuration !== undefined) {
		this.timeSnapshot -= this.timeSnapshot % this.discreteStepDuration;
	}
	this.now = this.timeSnapshot;
	if(this.ticking) return;
	this.ticking = true;
	window.requestAnimationFrame(this._rafTick);
};

RafTweener.prototype.stop = function() {
	if(!this.ticking || this.requestStop) return;
	this.requestStop = true;
	this.ticking = false;
};

RafTweener.prototype.pause = function() {
	this.paused = true;
};

RafTweener.prototype.unpause = function() {
	this.paused = false;
};

RafTweener.prototype.toString = function() {
	return '[object RafTweener]';
};

module.exports = RafTweener;