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
	var now = Date.now();
	var delta = now - this.now;
	this.update(delta);
	window.requestAnimationFrame(this._rafTick);
};

RafTweener.prototype.discreteStepTick = function(delta) {
	var newNow = this.now + delta;
	while(this.now < newNow) {
		this.tick(this.discreteStepDuration);
	}
};

RafTweener.prototype.start = function() {
	this.now = Date.now();
	if(this.ticking) return;
	this.ticking = true;
	window.requestAnimationFrame(this._rafTick);
};

RafTweener.prototype.stop = function() {
	if(!this.ticking || this.requestStop) return;
	this.requestStop = true;
	this.ticking = false;
};

RafTweener.prototype.toString = function() {
	return '[object RafTweener]';
};

module.exports = RafTweener;