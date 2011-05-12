enyo.kind({
	name: "Spaz.Entry",
	kind: "Item", 
	tapHighlight: true, 
	style: "padding-right: 5px;", 
	onclick: "entryClick", 
	published: {
		entry: ""
	},
	components: [
		{className: "entry", kind: "HFlexBox", components: [
			{kind: "VFlexBox", components: [
				{kind: "Image", width: "50px", height: "50px", className: "avatar"},
			]},
			{kind: "VFlexBox", flex: 1, components: [
				{name: "text", className: "text"},
				{name: "timeFrom", className: "small"},
			]},		
			//{kind: "VFlexBox", width: "24px", components: [
			//	{kind: "Image", src: "source/images/action-icon-favorite.png"},
			//	{kind: "Image", src: "source/images/action-icon-share.png"},
			//	{kind: "Image", src: "source/images/action-icon-reply.png"},
			//]}	
		]}
		
	],
	entryChanged: function(){
		
		this.$.text.setContent("<span class='username author'>" + this.entry.author_username + "</span><br>" + AppUtils.makeItemsClickable(enyo.string.runTextIndexer(this.entry.text)));
		this.$.timeFrom.setContent(sch.getRelativeTime(this.entry.publish_date) + " from <span class='link'>" + this.entry._orig.source + "</span>");
		this.$.image.setSrc(this.entry.author_avatar);
			
	}
})