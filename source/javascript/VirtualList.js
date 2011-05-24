enyo.kind({
	name: "Spaz.VirtualList",
	kind: "ekl.List.VirtualList",
	published: {
		horizontal: "",
	},
	
	mousewheelDamp: 0.25,
	
	create: function(){
		this.inherited(arguments);
		this.horizontalChanged();
	},
	horizontalChanged: function(){
		this.$.scroller.setHorizontal(this.horizontal);
		//this.$.scroller.setAutoHorizontal(this.horizontal);
	}
});