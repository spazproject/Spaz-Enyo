enyo.kind({
	name: "ekl.Layout.SlidingView",
	kind: enyo.SlidingView,
	
	published: {
	    nodragleft: false,
	},
	
	calcSlideMin: function() {        
        if (this.nodragleft) {
            return 0;
        } else {
            var x = -this.getLeftOffset();
            return this.peekWidth + x;
        }
	}
});