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
	    dragHoldTrigger: 300,
    },
    events: {
		onPullToRefresh: ""
    },
    
    mousewheelHandler: function(inSender, inEvent) {
        if (this.mousewheel) {
                //if at top, don't let you scroll up.
            //if(this.$.scroller.pageTop < 0 || inEvent.delta.y < 0){

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
           //}
           
        }
    },
    mousedownHandler: function(e) {
    	dragPoller = window.setTimeout(function() {
			if(this.$.scroller.$.scroll.isInOverScroll()) {
				if(this.dragHoldTime > this.dragHoldInterval*4) {
					this.owner.$.pulltoRefreshTextTeaser.setShowing(true);
				}
				this.owner.$.pulltoRefreshTextTeaser.content = 'Release to Refresh ';//+(this.dragHoldTrigger-this.dragHoldTime).toString();
				this.owner.$.pulltoRefreshTextTeaser.render();
				this.dragHoldTime+=this.dragHoldInterval;
				dragPoller = window.setTimeout(this.mousedownHandler.bind(this),this.dragHoldInterval);
			}
    	}.bind(this),this.dragHoldInterval);
    },
    mouseupHandler: function(e) {
		this.owner.$.pulltoRefreshTextTeaser.setShowing(false);
    	window.clearTimeout(dragPoller);
    	if(this.$.scroller.$.scroll.isInOverScroll() && this.dragHoldTime > this.dragHoldTrigger) {
			this.doPullToRefresh();	
    	}
    	this.dragHoldTime = 0;
    }
});