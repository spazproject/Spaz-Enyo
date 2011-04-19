/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.test = {
	//* @protected
	defaultGroup: "Tests",
	multiplier: window.PalmSystem ? 1 : 50,
	_tests: {},
	//* @public
	add: function(inName, inConfig, inGroup) {
		var g = inGroup || enyo.test.defaultGroup;
		var group = this._tests[g] || (this._tests[g] = []);
		group.push({name: inName, config: inConfig});
	},
	// inConfig: {setup, test, cleanup} or test function
	run: function(inName, inConfig) {
		var m = "";
		var p = false;
		var t = 0;
		var config = enyo.isFunction(inConfig) ? {test: inConfig} : inConfig;
		try {
			if (config.setup) {
				config.setup();
			}
			//
			enyo.time(inName);
			m = config.test();
			t = enyo.timeEnd(inName);
			//
			p = Boolean(m);
		} catch(x) {
			m = x;
			console.log(x);
		} finally {
			if (config.cleanup) {
				config.cleanup();
			}
			var result = {
				name: inName,
				pass: p,
				message: m
			};
			result.count = inConfig.count;
			if (config.time) {
				result.time = t;
				if (result.count) {
					result.timePer = Math.round(1e4 * t / config.count) / 1e4;
				}
			}
			return result;
		}
	},
	getTests: function() {
		return this._tests;
	}
};