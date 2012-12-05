var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Watcher = function(pids){
	EventEmitter.call(this);
	this.processes = {};
	this.pids = pids;
};

util.inherits(Watcher, EventEmitter);

module.exports = Watcher;

Watcher.prototype.resolvePids = function(pids){
	if(arguments.length === 1) {
		if(!Array.isArray(pids)) pids = [pids];
		this.pids = pids;
	}
	return this.pids;
};

Watcher.prototype.watch = function(interval){
	var self = this;
	self.resolvePids(self.pids).forEach(function(pid){
		self.checkProcess(pid, function(status){
			self.processes[pid] = status;
			self.start(pid, interval);
		});
	});
};

Watcher.prototype.start = function(pid, interval){
	var self = this;
	setInterval(function(){
		self.checkProcess(pid, function(status){
			if(status !== self.processes[pid]){
				self.processes[pid] = status;
				self.notify(pid, status);
			}
		});
	},interval);
};

Watcher.prototype.notify = function(pid, status){
	var self = this;
	var name = status ? 'start' : 'end';
	self.emit(name, pid);
};

Watcher.prototype.checkProcess = function(pid, cb){
	var result = false;
	if(!pid) {
		console.log("The process %d is not exist.", pid);
	}
	try {
		process.kill(pid, 0);
		result = true;
	}
	catch (err) {
		console.log("Cannot send message to process %d.", pid);
	}
	cb(result);
};