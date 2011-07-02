enyo.kind({
	name: "ekl.Layout.SlidingPane",
	kind: enyo.SlidingPane,
	defaultKind: "ekl.Layout.SlidingView",
	events: {
		onDismiss: ""	
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.dragging) {
			var b = this.dragging.dragFinish(inEvent);
			var d = this.dragStartSliding;
			inEvent.preventClick();
			this.dragging = null;
			if (b) {
				// if slide is past threshold, hide!
				if (d.slidePosition > this.dismissDistance && d.dismissible) {
					d.setShowing(false);
					this.doDismiss();
				// if we have a view to select, do it
				} else if (b.select) {
					this.selectView(b.select, true);
				// otherwise assume we animate from overscroll
				} else {
					this.animateOverSlide(d);
				}
			}
		}
	}
});