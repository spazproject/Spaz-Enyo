/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that displays a scrolling list of views.  VirtualCarousel is optimized such that only
3 views are created even if the actual number of views is infinite.  VirtualCarousel doesn't employ
flyweight strategy but takes the same fact that object creation is expensive so instead
of creating new view old view is being reused.

To initialize VirtualCarousel, use <code>renderViews</code>.  The <code>onSetupView</code> event
allows for updating view for a given view index.  The view returned in the event could contain
old view that is not suitable for the given index, so is the user's responsiblitiy to update
the view.  Here's a simple example:
  
	{name: "carousel", kind: "VirtualCarousel", flex: 1, onSetupView: "setupView"}

	rendered: function() {
		this.inherited(arguments);
		var selectedViewIndex = 5;
		this.$.carousel.renderViews(selectedViewIndex);
	},
	setupView: function(inSender, inView, inViewIndex) {
		if (inViewIndex > 0 && inViewIndex < 30) {
			inView.setHeader("Hello " + inViewIndex);
			return true;
		}
	}
	
An <code>onSetupView</code> handler must return true to indicate that the given view should be rendered.

The <code>onSnap</code> event fires when the user finishes dragging and snapping occurs.
And the <code>onSnapFinish</code> fires when snapping and scroller animation completes.

To get a handle of the currently displayed view, use <code>fetchCurrentView()</code>.
For example, to get the current displayed view after snapping is completed:

	{name: "carousel", kind: "VirtualCarousel", flex: 1, onSetupView: "setupView", onSnapFinish: "snapFinish"}
	
	snapFinish: function(inSender) {
		var view = this.$.carousel.fetchCurrentView();
	}

To move the view programmatically, use <code>next()</code> or <code>previous()</code>.
*/
enyo.kind({
	name: "enyo.VirtualCarousel",
	kind: enyo.CarouselInternal,
	events: {
		onSetupView: ""
	},
	viewControl: {kind: enyo.Control},
	viewIndex: 0,
	renderViews: function(inIndex, inForceCreate) {
		this.viewIndex = inIndex || 0;
		this.index = this.centerIndex;
		this.createViewsFromViewControl(inForceCreate);
		this.updateView(this.$.left, this.viewIndex-1, true);
		this.updateView(this.$.center, this.viewIndex, true);
		this.updateView(this.$.right, this.viewIndex+1, true);
	},
	//* @protected
	createViewsFromViewControl: function(inForce) {
		if (!this._viewsCreated || inForce) {
			this.newView(this.$.left, this.viewControl);
			this.newView(this.$.center, this.viewControl);
			this.newView(this.$.right, this.viewControl);
			if (this.hasNode()) {
				this.render();
			}
			this._viewsCreated = true;
		}
	},
	updateView: function(inViewHolder, inViewIndex, inSetup) {
		var show = this.doSetupView(this.findView(inViewHolder), inViewIndex);
		inSetup && inViewHolder.setShowing(show ? true : false);
		return show;
	},
	adjustViews: function() {
		var goRight = this.index > this.oldIndex;
		var vh1 = goRight ? this.$.right : this.$.left;
		var vh2 = goRight ? this.$.left : this.$.right;
		goRight ? ++this.viewIndex : --this.viewIndex;
		if (this.index != this.centerIndex) {
			if (this.updateView(vh2, (goRight ? this.viewIndex+1 : this.viewIndex-1))) {
				var v = this.findView(this.$.center);
				this.moveView(this.$.center, this.findView(vh1));
				this.moveView(vh1, this.findView(vh2))
				this.moveView(vh2, v);
				this.setIndex(this.centerIndex);
			}
		}
	}
});
