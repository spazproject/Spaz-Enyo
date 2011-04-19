/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "App",
	kind: "HFlexBox",
	components: [
		{kind: "VFlexBox", flex: 1, style: "border-right: 1px solid #333;", components: [
			{content: "Drag Here!", style: "padding: 20px; background: #ddd; text-align: center;", name: "target", ondragover: "dragOver", ondrop: "dragDrop", ondragout: "dragOut"},
			{flex: 1, kind: "Scroller", components: [
				{name: "dropList"}
			]}
		]},
		{flex: 3, kind: "VFlexBox", components: [
			{flex: 1, kind: "VirtualList", onSetupRow: "setupRow", components: [
				{kind: "Item", content: "An Item",
					onmousehold: "itemMousehold", onmouserelease: "itemMouserelease",
					ondragstart: "itemDragStart", ondrag: "itemDrag", ondragfinish: "itemDragFinish"}
			]}
		]},
		{name: "avatar", kind: "Image", src: "icon.png", className: "app-avatar", showing: false}
	],
	create: function() {
		this.makeData();
		this.inherited(arguments);
	},
	// make a simple list
	makeData: function() {
		this.data = [];
		for (var i=0; i<50; i++) {
			this.data[i] = "Item [" + i + "]";
		}
	},
	setupRow: function(inSender, inIndex) {
		var d = this.data[inIndex];
		if (d) {
			this.$.item.setContent(d);
			return true;
		}
	},
	itemMousehold: function(inSender, inEvent) {
		this.setItemHighlighted(true);
		// indicate the row that's being dragged
		this.setItemHighlighted(true);
		// show and track a drag avatar
		this.$.avatar.show();
		this.avatarTrack(inEvent);
	},
	itemMouserelease: function() {
		if (!this.dragItem) {
			this.setItemHighlighted(false);
			this.$.avatar.hide();
		}
	},
	// initiate a drag on a list item
	itemDragStart: function(inSender, inEvent) {
		// if this is a horizontal drag
		if (Math.abs(inEvent.dx) > Math.abs(inEvent.dy)) {
			// indicate we are dragging and store some drag info
			this.dragItem = true;
			inEvent.dragInfo = inEvent.rowIndex;
			// indicate the row that's being dragged
			this.setItemHighlighted(true);
			// show and track a drag avatar
			this.$.avatar.show();
			this.avatarTrack(inEvent);
			return true;
		}
	},
	itemDrag: function(inSender, inEvent) {
		if (this.dragItem) {
			this.avatarTrack(inEvent);
		}
	},
	itemDragFinish: function(inSender, inEvent) {
		if (this.dragItem) {
			// indicate the row is no longer dragging
			this.$.virtualList.prepareRow(inEvent.dragInfo);
			this.setItemHighlighted(false);
			// hide the avatar
			this.$.avatar.hide();
			this.dragItem = false;
		}
	},
	setItemHighlighted: function(inHighlight) {
		this.$.item.applyStyle("background-color", inHighlight ? "lightblue" : null);
	},
	avatarTrack: function(inEvent) {
		this.$.avatar.boxToNode({l: inEvent.pageX+20, t: inEvent.pageY - 50});
	},
	dragOver: function(inSender, inEvent) {
		// if there is drag info, indicate the target is being dragged over
		if (inEvent.dragInfo !== undefined) {
			inSender.applyStyle("background-color", "lightblue");
		}
	},
	dragOut: function(inSender, inEvent) {
		// if there is drag info, indicate the target is no longer being dragged over
		if (inEvent.dragInfo !== undefined) {
			inSender.applyStyle("background-color", null);
		}
	},
	dragDrop: function(inSender, inEvent) {
		// if there is drag info, do a drop
		if (inEvent.dragInfo !== undefined) {
			inSender.applyStyle("background-color", null);
			var row = inEvent.dragInfo;
			// add to the drop list
			this.$.dropList.createComponent({kind: "Item", content: this.data[row]}).render();
			// remove the data from the source list and refresh
			this.data.splice(row, 1);
			this.$.virtualList.refresh();
		}
	}
});