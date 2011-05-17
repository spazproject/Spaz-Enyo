enyo.kind({
	name: "Spaz.Entry",
	kind: "HFlexBox",
	flex: 1, 
	events: {
		onUserClick: "",
		onHashtagClick: "",
		onEntryClick: ""	
	},
	published: {
		entry: ""
	},
	components: [
		{className: "entry", kind: "Item", onclick: "entryClick", flex: 1, tapHighlight: true, style: "padding-right: 5px;", components: [
			{kind: "HFlexBox", components: [
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
		]}
	],
	entryChanged: function(){
		
		this.$.text.setContent("<span class='username author'>" + this.entry.author_username + "</span><br>" + AppUtils.makeItemsClickable(enyo.string.runTextIndexer(this.entry.text)));
		if (this.entry._orig.source) {
			this.$.timeFrom.setContent(sch.getRelativeTime(this.entry.publish_date) + " from <span class='link'>" + this.entry._orig.source + "</span>");
		} else {
			this.$.timeFrom.setContent(sch.getRelativeTime(this.entry.publish_date));
		}		
		this.$.image.setSrc(this.entry.author_avatar);

		if(this.entry.is_private_message === true){
			this.applyStyle("background-color", "rgba(255, 0, 0, .1)");
		} else if(this.entry.is_mention === true){
			this.applyStyle("background-color", "rgba(0, 95, 200, .1)");
		} else {
			this.applyStyle("background-color", null);			
		}
			
	},
	entryClick: function(inSender, inEvent, inRowIndex) {
		var className = inEvent.target.className;
		if(_.includes(className, "username")){
			var username = inEvent.target.getAttribute('data-user-screen_name') || inEvent.target.innerText.replace("@", "");
			this.doUserClick(username, this.entry.service, this.entry.account_id);
		} else if(_.includes(className, "avatar")){
			this.doUserClick(this.entry.author_username, this.entry.service, this.entry.account_id);			
		} else if(_.includes(className, "hashtag")){
			this.doHashtagClick(inEvent.target.innerText);
		} else if(!inEvent.target.getAttribute("href")){
			this.doEntryClick(inEvent, inRowIndex);
		}
	},
})