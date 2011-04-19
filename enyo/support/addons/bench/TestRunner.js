/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.TestRunner",
	className: "enyo-test-runner",
	kind: enyo.VFlexBox,
	defaultKind: enyo.TestItem,
	published: {
		running: false,
		shuffle: false
	},
	//* @protected
	chrome: [
		{name: "banner", kind: enyo.TestBanner, message: "Tap to Run Tests...", className: "enyo-fit", onclick: "toggleRunning"},
		{kind: "HFlexBox", className: "enyo-test-header", components: [
			{kind: "Control", flex: 1, content: "Test"},
			{name: "resultInfo", kind: "Control", content: "Result"}
		]},
		{name: "client", flex: 1, kind: "BasicScroller"}
	],
	testMessage: "Running Test {$i} of {$c}...",
	create: function() {
		this.inherited(arguments);
		this.tests = [];
		this.index = 0;
		this.testIndex = 0;
		this.count = 0;
		this.addTests();
	},
	addTests: function() {
		var tests = enyo.test.getTests();
		for (var i in tests) {
			this.addTestGroup(i, tests[i]);
		}
	},
	shuffleTests: function(inTests) {
		var s = [];
		while (inTests.length) {
			s.push(inTests.splice(enyo.irand(inTests.length), 1)[0]);
		}
		return s;
	},
	addTestGroup: function(inName, inTests) {
		this.createComponent({test: {name: inName}, showing: false});
		var tests = this.shuffle ? this.shuffleTests(inTests) : inTests;
		for (var i=0, t; t=tests[i]; i++) {
			this.tests.push(this.createComponent({test: t, showing: false}));
			this.count++;
		}
	},
	rendered: function() {
		this.inherited(arguments);
		this.runningChanged();
	},
	toggleRunning: function() {
		this.setRunning(!this.running);
	},
	runningChanged: function(inOldValue) {
		if (inOldValue != this.running) {
			if (this.running) {
				this.runNextTest();
			}
		}
	},
	runNextTest: function() {
		if (this.running) {
			this.$.banner.setMessage(enyo.macroize(this.testMessage, {i: this.testIndex+1, c: this.count}));
			this.runDividers();
			setTimeout(enyo.hitch(this, "_runNextTest"), 100);
		};
	},
	_runNextTest: function() {
		this.runTest();
		this.testIndex++;
		if (this.testIndex < this.count) {
			this.runNextTest();
		} else {
			this.finishTesting();
		}
	},
	fetchTest: function() {
		// FIXME: brittle to depends on tests being children of our client.
		return this.tests[this.index];
	},
	runTest: function() {
		//this.log(this.index);
		var t = this.fetchTest();
		t.runTest();
		t.show();
		this.index++;
	},
	// FIXME: this is wonky; process the test group dividers...
	runDividers: function() {
		var t = this.fetchTest();
		if (t && !t.test.config) {
			this.runTest();
			this.runDividers();
		}
	},
	finishTesting: function() {
		this.$.banner.hide();
		delete enyo.time.timed.enyo;
		enyo.logTimers();
	}
});