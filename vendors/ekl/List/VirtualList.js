enyo.kind({
	name: "ekl.List.VirtualList",
	kind: enyo.VirtualList,

	dragHoldTime: 0,

	published: {
		mousewheel: true,
		//Dampens mousewheel delta strength
		mousewheelDamp: 40.0,
		// sensitivity for pull-to-refresh events
		dragHoldInterval: 50,
		dragHoldTrigger: 200,
		dragHoldTimeMax: 5000, // if a pull exceeds this time without firing, exite
		pullToRefreshThreshold: 50, // px
	},
	events: {
		onPullToRefresh: ""
	},
	dragPoller: null,

	mousewheelHandler: function(inSender, inEvent) {
		if (this.mousewheel) {
			//Clone event
			var dragTo = enyo.mixin({}, inEvent);
			//Apply delta to new event
			dragTo.pageX = inEvent.pageX + (inEvent.delta.x * this.mousewheelDamp);
			dragTo.pageY = inEvent.pageY + (inEvent.delta.y * this.mousewheelDamp);

			//Simulate initiating a drag
			this.$.scroller.$.scroll.startDrag(inEvent);
			//Simulate dragging to a point
			this.$.scroller.$.scroll.drag(dragTo);
			//Simulate dropping a drag at the same point (prevents flick, lets OS provide accelleration)
			this.$.scroller.$.scroll.dragDrop(dragTo);
			//Simulate ending a drag
			this.$.scroller.$.scroll.dragFinish();
		}
	},
	holdMousePoller: function() {
		// console.log('mousepoll', this.$.scroller.$.scroll.y);
		if (this.dragHoldTimeMax < this.dragHoldTime) {
			window.clearTimeout(this.dragPoller);
			// console.log("hit max; exiting");
			return;
		}

		if ((this.dragHoldTime > this.dragHoldInterval*4) && this.pulledPastThreshold()) {
			this.owner.$.pulltoRefreshTextTeaser.applyStyle("opacity", 1);
		}
		//this.owner.$.pulltoRefreshTextTeaser.render();
		if (this.$.scroller.$.scroll.y >= 0) {
			// console.log('continuing poller', this.$.scroller.$.scroll.y);
			this.dragHoldTime+=this.dragHoldInterval;
		} else {
			// console.log('cancelling poller', this.$.scroller.$.scroll.y);

			// always clear before starting timeout
			window.clearTimeout(this.dragPoller);
			//this.dragHoldInterval = 0;
			return;
		}

		// always clear before starting timeout
		window.clearTimeout(this.dragPoller);
		this.dragPoller = window.setTimeout(_.bind(this.holdMousePoller, this), this.dragHoldInterval);
	},
	mousedownHandler: function() {

		if (this.$.scroller.$.scroll.y < 0) {
			return;
		}
		// always clear before starting timeout
		window.clearTimeout(this.dragPoller);
		this.dragPoller = window.setTimeout(_.bind(this.holdMousePoller, this), this.dragHoldInterval);

		// console.log('mousedown', this.$.scroller.$.scroll.y);

	},
	mouseupHandler: function(e) {
		console.log('mouseup', this.$.scroller.$.scroll.y);

		window.clearTimeout(this.dragPoller);
		if(this.dragHoldTime >= this.dragHoldTrigger && this.pulledPastThreshold()) {
			// console.log('firing pull to refresh');
			this.doPullToRefresh();
		}
		this.dragHoldTime = 0;

		this.owner.$.pulltoRefreshTextTeaser.applyStyle("opacity", 0);
	},


	pulledPastThreshold: function(e) {
		if (this.$.scroller.$.scroll.y >= this.pullToRefreshThreshold) {
			return true;
		}
		return false;
	}
});
