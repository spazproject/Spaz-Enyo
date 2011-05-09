enyo.kind({
	name: "Spaz.VirtualList",
	kind: "VirtualList",
	published: {
		horizontal: "",
	},
	create: function(){
		this.inherited(arguments);
		this.horizontalChanged();
	},
	horizontalChanged: function(){
		this.$.scroller.setHorizontal(this.horizontal);
		//this.$.scroller.setAutoHorizontal(this.horizontal);
	}
});