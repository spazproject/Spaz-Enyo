enyo.kind({
    name: "ekl.List.VirtualList",
    kind: enyo.VirtualList,
    
    dragHoldTime: 0,
    
    published: {
        mousewheel: true,
        //Dampens mousewheel delta strength
        mousewheelDamp: 40.0,
        // sensitivity for pull-to-refresh events
		dragHoldInterval: 100,
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
	holdMousePoller: function() {
			console.log(this.dragHoldTime);
			if(this.dragHoldTime > this.dragHoldInterval*4) {
				this.owner.$.pulltoRefreshTextTeaser.setShowing(true);
			}
			this.owner.$.pulltoRefreshTextTeaser.content = 'Release to Refresh ';//+(this.dragHoldTrigger-this.dragHoldTime).toString();
			this.owner.$.pulltoRefreshTextTeaser.render();
			if(this.$.scroller.$.scroll.isInOverScroll()) {
				this.dragHoldTime+=this.dragHoldInterval;
			} else {
				this.dragHoldInterval = 0;
			}
				
			dragPoller = window.setTimeout(this.holdMousePoller.bind(this), this.dragHoldInterval);
	},
    mousedownHandler: function() {
		dragPoller = window.setTimeout(this.holdMousePoller.bind(this), this.dragHoldInterval);
	/*
	console.log('mousedown');
		if(this.dragHoldTime == 0) {
			dragPoller = window.setTimeout(function() {
				console.log('dragpoller running');
				if(this.$.scroller.$.scroll.isInOverScroll()) {
					console.log(this.dragHoldInterval);
					if(this.dragHoldTime > this.dragHoldInterval*4) {
						this.owner.$.pulltoRefreshTextTeaser.setShowing(true);
					}
					this.owner.$.pulltoRefreshTextTeaser.content = 'Release to Refresh ';//+(this.dragHoldTrigger-this.dragHoldTime).toString();
					this.owner.$.pulltoRefreshTextTeaser.render();
					this.dragHoldTime+=this.dragHoldInterval;
					dragPoller = window.setTimeout(this,this.dragHoldInterval);
				} else {
					console.log('not in overscroll');
				}
			}.bind(this),100);
		} else {
			console.log('dragholdtime not zero');
		}
	*/
    },
    mouseupHandler: function(e) {
		console.log('mouseup');
		window.clearTimeout(dragPoller);
		if(this.dragHoldTime >= this.dragHoldTrigger && this.$.scroller.$.scroll.isInOverScroll()) {
		
		}
		this.dragHoldTime = 0;
	/*
		this.owner.$.pulltoRefreshTextTeaser.setShowing(false);
    	window.clearTimeout(dragPoller);
    	if(this.$.scroller.$.scroll.isInOverScroll() && this.dragHoldTime > this.dragHoldTrigger) {
			//this.doPullToRefresh();	
    	}
    	this.dragHoldTime = 0;
	*/
    }
});