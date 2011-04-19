/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
// FIXME: note that Control.importProps assumes that inProps are alloweed to be changed
// is that ok? It causes a wrinkle here for testing in that we much clone input configs.
// If not then, inConfig.className gets larger with each instantiation using inConfig
// and calls to enyo.create become slower and slower.
enyo.testControls = {
	make: function(inConfig, inCount) {
		enyo.testControls.madeControls = [];
		for (var i=0; i < inCount; i++) {
			enyo.testControls.madeControls.push(enyo.create(enyo.clone(inConfig)));
			//enyo.create(inConfig);
		}
		return true;
	},
	destroy: function() {
		var controls = enyo.testControls.madeControls;
		if (controls.length && controls[0].destroy) {
			for (var i=0, c; c=controls[i]; i++) {
				c.destroy();
			}
		}
		enyo.testControls.madeControls = null;
	},
	makeView: function(inConfig, inCount) {
		var view = enyo.testControls.view = enyo.create({kind: enyo.Control});
		var comps = [];
		for (var i=0; i < inCount; i++) {
			comps.push(enyo.clone(inConfig));
			//comps.push(inConfig);
		}
		view.createComponents(comps);
		return view;
	},
	renderView: function(inId, inView) {
		var view = inView || enyo.testControls.view;
		view.renderInto(inId);
		return true;
	},
	destroyView: function(inView) {
		var view = inView || enyo.testControls.view;
		view.destroy();
		delete enyo.testControls.view;
	},
	makeCreateTest: function(inName, inConfig, inCount) {
		var count = inCount || 100;
		var mcount = count * enyo.test.multiplier;
		var d = window.PalmSystem ? "" : " x" + enyo.test.multiplier;
		enyo.test.add("Create " + inName + d, {
			test: function() {
				return enyo.testControls.make(inConfig, mcount);
			},
			cleanup: enyo.testControls.destroy,
			time: true,
			count: count
		});
	},
	makeRenderTest: function(inName, inConfig, inCount, inId) {
		var count = inCount || 100;
		var mcount = count * enyo.test.multiplier;
		var d = window.PalmSystem ? "" : " x" + enyo.test.multiplier;
		enyo.test.add("Render " + inName + d, {
			setup: enyo.hitch(enyo.testControls, "makeView", inConfig, mcount),
			test: enyo.hitch(enyo.testControls, "renderView", inId || "output"),
			cleanup: enyo.testControls.destroyView,
			time: true,
			count: count
		});
	},
	makeCreateRenderTest: function(inName, inConfig, inCount, inId) {
		var count = inCount || 100;
		var mcount = count * enyo.test.multiplier;
		var d = window.PalmSystem ? "" : " x" + enyo.test.multiplier;
		enyo.test.add("Create/Render " + inName + d, {
			test: function() {
				enyo.testControls.makeView(inConfig, mcount);
				enyo.testControls.renderView(inId || "output");
				return true;
			},
			cleanup: enyo.testControls.destroyView,
			time: true,
			count: count
		});
	}
}