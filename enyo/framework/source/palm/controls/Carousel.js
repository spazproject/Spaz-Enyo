/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.CarouselInternal",
	kind: enyo.BasicCarousel,
	components: [
		{name: "left", kind: "Control"},
		{name: "center", kind: "Control"},
		{name: "right", kind: "Control"}
	],
	centerIndex: 1,
	/**
	 Fetches the view corresponding to the view position "center", "left" or "right".
	 "center" would always refer to the view currently displayed.  "left" and "right" would be the left/right of currently displayed.
	 Use this function to update the view already being shown.
	 @param {String} position of the view to be fetched.  Possible values are "center", "left" or "right".
	 */
	fetchView: function(inViewPos) {
		var vm = {left: 0, center: 1, right: 2};
		var i = vm[inViewPos];
		i = this.index === 0 ? i-1 : (this.index == 2 ? i+1 : i);
		var c = this.getControls()[i];
		return c ? this.findView(c) : null;
	},
	/**
	 Returns the currently displayed view.
	 */
	fetchCurrentView: function() {
		return this.fetchView("center");
	},
	//* @protected
	newView: function(inViewHolder, inInfo, inRender) {
		inViewHolder.setShowing(inInfo ? true : false);
		if (inInfo) {
			inViewHolder.destroyControls();
			this.createView(inViewHolder, inInfo, {
				kind: inInfo.kind || this.defaultKind, owner: this.owner, width: "100%", height: "100%", accelerated: this.accelerated
			});
			inRender && inViewHolder.render();
		}
	},
	moveView: function(inViewHolder, inView) {
		if (!inViewHolder.showing) {
			inViewHolder.show();
		}
		inView.setContainer(inViewHolder);
		inView.setParent(inViewHolder);
	},
	findView: function(inControl) {
		var c = inControl.getControls();
		if (c.length) {
			return c[0];
		}
	},
	scrollStop: function() {
		this.inherited(arguments);
		if (!this._controlSize) {
			return;
		}
		var s = this.scrollH ? this._controlSize.w : this._controlSize.h;
		if (this.startPos && (this.pos >= this.startPos + s || this.pos <= this.startPos - s) && this.index == 1 && this.oldIndex == this.index) {
			// scroll pass the next view so need to trigger snapFinish manually
			this.index = this.index + (this.startPos < this.pos ? 1 : -1);
			this.snapFinish();
		}
	},
	snapFinish: function() {
		this.adjustViews();
		this.inherited(arguments);
	},
	previous: function() {
		if (this.index !== 1 || this.$.left.showing) {
			this.inherited(arguments);
		}
	},
	next: function() {
		if (this.index !== 1 || this.$.right.showing) {
			this.inherited(arguments);
		}
	}
});

/**
A control that provides the ability to slide back and forth between different views without having to load all the views initially.

A single carousel could contain thousands of views/images.  Loading all of them into memory at once would not be feasible.
Carousel solves this problem by only holding onto the center view (C), the previous view (P), and the next view (N).
Additional views are loaded as the user flips through the items in the Carousel.

	| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
	              P   C   N

To initialize a carousel:

	{kind: "Carousel", flex: 1, onGetLeft: "getLeft", onGetRight: "getRight"}

Use <code>setCenterView</code> to set the center view, and the <code>onGetLeft</code> and <code>onGetRight</code> events to build a scrolling list of views.

	create: function() {
		this.inherited(arguments);
		this.$.carousel.setCenterView(this.getView(this.index));
	},
	getView: function(inIndex) {
		return {kind: "HFlexBox", align: "center", pack: "center", content: inIndex};
	},
	getLeft: function(inSender, inSnap) {
		inSnap && this.index--;
		return this.getView(this.index-1);
	},
	getRight: function(inSender, inSnap) {
		inSnap && this.index++;
		return this.getView(this.index+1);
	}
*/
enyo.kind({
	name: "enyo.Carousel",
	kind: enyo.CarouselInternal,
	events: {
		/**
		 Gets the left view and also indicates if it is fired after a left transition.
		 */
		onGetLeft: "",
		/**
		 Gets the right view and also indicates if it is fired after a right transition.
		 */
		onGetRight: ""
	},
	/**
	 Sets the view to be used as the center view.
	 This function will create the center view and fires events onGetLeft and onGetRight to get the view infos
	 for creating left and right views.
	 @param {Object} inInfo A config block describing the view control.
	 */
	setCenterView: function(inInfo) {
		this.newView(this.$.left, this.doGetLeft(false));
		this.newView(this.$.center, inInfo);
		this.newView(this.$.right, this.doGetRight(false));
		this.index = this.centerIndex;
		if (this.hasNode()) {
			this.render();
		}
	},
	//* @protected
	adjustViews: function() {
		var goRight = this.index > this.oldIndex, src;
		if (this.index != this.centerIndex || !this._info) {
			this._info = this["doGet" + (goRight ? "Right" : "Left")](true);
		}
		if (this.index != this.centerIndex) {
			if (this._info) {
				var vh1 = goRight ? this.$.right : this.$.left;
				var vh2 = goRight ? this.$.left : this.$.right;
				var v = this.findView(this.$.center);
				this.moveView(this.$.center, this.findView(vh1));
				this.newView(vh1, this._info, true);
				vh2.destroyControls();
				this.moveView(vh2, v);
				this.setIndex(this.centerIndex);
			}
		}
	}
});