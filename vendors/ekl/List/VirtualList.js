enyo.kind({
	name: "ekl.List.VirtualList",
	kind: enyo.VirtualList,

	published: {
		mousewheel: true,
		//Dampens mousewheel delta strength
		mousewheelDamp: 40.0,
		// sensitivity for pull-to-refresh events
		dragHoldInterval: 50,
		dragHoldTrigger: 500,
		dragHoldTimeMax: 5000, // if a pull exceeds this time without firing, exite
		pullToRefreshThreshold: 50, // px
	},

	events: {
		onPullToRefresh: ""
	},

    dragHoldTime: 0,
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
	    console.log("HOLD POLL");
		window.clearTimeout(this.dragPoller);
		
		if (this.dragHoldTimeMax < this.dragHoldTime) {
		    this._clearPullToRefresh();
			return;
		}

		if (this.dragHoldTime >= this.dragHoldTrigger && this.pulledPastThreshold()) {
			this.owner.$.pulltoRefreshTextTeaser.applyStyle("opacity", 1);
		}
		
		if (this.$.scroller.$.scroll.y >= 0) {
			this.dragHoldTime += this.dragHoldInterval;
		} else {
		    console.log("CLEARING PULL TO REFRESH BUT CONTINUING TO LISTEN!");
		    this._clearPullToRefresh();
		}
        
		this._resetMousePoller();
	},
	
	mousedownHandler: function() {
	    console.log("MOUSEDOWN");
	    this._clearPullToRefresh();

		if (this.$.scroller.$.scroll.y < 0) {
			return;
		}
		
		this._resetMousePoller();
	},
	
	mouseupHandler: function(e) {
	    console.log("MOUSEUP");
		if(this.dragHoldTime >= this.dragHoldTrigger && this.pulledPastThreshold()) {
			this.doPullToRefresh();
		}
		
		this._clearPullToRefresh();
	},
	
	pulledPastThreshold: function(e) {
		if (this.$.scroller.$.scroll.y >= this.pullToRefreshThreshold) {
			return true;
		}
		
		return false;
	},
	
	_clearPullToRefresh: function() {
	    window.clearTimeout(this.dragPoller);
	    this.dragHoldTime = 0;
		this.owner.$.pulltoRefreshTextTeaser.applyStyle("opacity", 0);
	},
	
	_resetMousePoller: function() {
	    window.clearTimeout(this.dragPoller);
	    this.dragPoller = window.setTimeout(_.bind(this.holdMousePoller, this), this.dragHoldInterval);
	}
});
