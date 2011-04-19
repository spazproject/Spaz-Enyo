/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*global enyo
*/

// UI kind responsible for creating test component, running tests, receiving & displaying test results.
enyo.kind({
	name: "enyo.TestReporter",
	kind: enyo.Control,
	published: {
		results: null
	},
	events: {
		onFinishAll: ""
	},
	chrome: [
		{name: "title", className: "enyo-testcase-title"},
		{name: "group", className: "enyo-testcase-group", components: []}
	],
	timeout: 3000,
	className: "enyo-testcase",
	
	create: function(callback) {
		this.inherited(arguments);
		this.$.title.setContent(this.name);
		
		this.createComponent({name:'testSuite', kind:this.name, onBegin:"testBegun", onFinish:"updateTestDisplay", onFinishAll:"suiteFinished"});
		
	},
	rendered: function() {
		this.inherited(arguments);
	},
	runTests: function() {
		this.$.testSuite.runAllTests();
	},
	
	testBegun: function(inSender, testName) {
		this.$.group.createComponent({name: testName, className: "enyo-testcase-running", content: testName + ": running"}).render();
	},
	
	suiteFinished: function() {
		this.doFinishAll();
	},
	
	updateTestDisplay: function(inSender, results) {
		var e = results.exception;
		var info = this.$.group.$[results.name];
		var content = "<b>" + results.name + "</b>: " + (results.passed ? "PASSED" : results.message);
		if(e) {
			
			// If we have an exception include the stack trace or file/line number.
			if(e.stack) {
				content += "<br/>"+e.stack.replace(/\\n/g, "<br/>");
			} else if(e.sourceURL && e.line) {
				content += "<br/>"+e.sourceURL + ":"+e.line;
			}
			
			// if fail was called with an object, show the JSON.  This is likely a service request error or somesuch.
			if(results.failValue) {
				content += "<br/>"+JSON.stringify(results.failValue).replace(/\\n/g, "<br/>");
			}
		}
		
		// Show logs if we have any.
		if(!results.passed && results.logs) {
			content += "<br/>" + results.logs.join("<br/>");
		}
		
		info.setContent(content);
		info.setClassName("enyo-testcase-" + (results.passed ? "passed" : "failed"));
	}
});
