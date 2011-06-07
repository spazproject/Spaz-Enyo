enyo.kind({
	name: "Spaz.Entry",
	kind: "HFlexBox",
	flex: 1, 
	events: {
		onEntryClick: ""	
	},
	published: {
		entry: ""
	},
	components: [
		{className: "entry", kind: "Item", onclick: "entryClick", flex: 1, tapHighlight: true, style: "padding-right: 5px;", components: [
			{kind: "HFlexBox", components: [
				{kind: "VFlexBox", components: [
					{name: "authorAvatar", kind: "Image", width: "50px", height: "50px", className: "avatar"},
					{name: "reposterAvatar", kind: "Image", width: "25px", height: "25px", className: "small-avatar", showing: false}
				]},
				{kind: "VFlexBox", flex: 1, components: [
					{kind: "HFlexBox", height: "18px", components: [
						{name: "username", className: "text username author"},
						{name: "recipientContainer", showing:false, kind: "HFlexBox", components:[
							{name: "receipientArrow", allowHtml: true, className: "entryHeaderIcon", content:"&rarr;", style:"position: relative; bottom: 5px; padding: 0px 3px;"},
							{name: "recipientUsername", className: "text username recipient author"}
						]},
						{name: "reposterIcon", kind: "Image", height: "13px", src: "source/images/reposted.png", style: "position: relative; bottom: 5px; padding: 0px 3px;", showing: false},
						{name: "reposterUsername", className: "text username author", showing: false},
						{name: "favoriteIcon", kind: "Image", height: "13px", src: "source/images/favorited.png", style: "position: relative; bottom: 5px; padding: 0px 3px;", showing: false},
						{kind: "Spacer"},
						{name: "unreadIcon", kind: "Image", height: "13px", src: "source/images/unread.png", style: "position: relative; bottom: 5px; padding: 0px;", showing: false}
					]},
					{name: "text", allowHtml: true, className: "entrytext text"},
					{name: "timeFrom", allowHtml: true, className: "small"},
				]},		
			]}
		]}
	],
	entryChanged: function(){
		this.$.username.setContent(this.entry.author_username);
		
		if (this.entry.recipient_username && this.entry.is_private_message) {
			this.$.recipientUsername.setContent(this.entry.recipient_username);
			this.$.recipientContainer.show();
		} else {
			this.$.recipientContainer.hide();
		}
		
		this.$.text.setContent(AppUtils.makeItemsClickable(enyo.string.runTextIndexer(this.entry.text)));
		if (this.entry._orig.source) {
			this.$.timeFrom.setContent(sch.getRelativeTime(this.entry.publish_date) + " from <span class='link'>" + this.entry._orig.source + "</span>");
		} else {
			this.$.timeFrom.setContent(sch.getRelativeTime(this.entry.publish_date));
		}		
		this.$.authorAvatar.setSrc(this.entry.author_avatar);

		this.$.reposterUsername.setShowing(this.entry.is_repost);
		this.$.reposterIcon.setShowing(this.entry.is_repost);
		this.$.reposterAvatar.setShowing(this.entry.is_repost);
		if(this.entry.is_repost === true){
			this.$.reposterUsername.setContent(this.entry.reposter_username);
			this.$.reposterAvatar.setSrc(this.entry.reposter_avatar);
		}
		if(this.entry.is_private_message === true){
			this.applyStyle("background-color", "rgba(255, 0, 0, .1)");
		} else if(this.entry.is_mention === true){
			this.applyStyle("background-color", "rgba(0, 95, 200, .1)");
		} else if(this.entry.is_author === true){
			this.applyStyle("background-color", "rgba(0, 255, 0, .1)");
		} else {
			this.applyStyle("background-color", null);			
		}
		
		if(this.entry.is_favorite){
			this.$.favoriteIcon.setShowing(true);
		} else {
			this.$.favoriteIcon.setShowing(false);
		}
		
		if (this.entry.read === true) {
			this.$.unreadIcon.setShowing(false);
			//this.$.item.addClass('read');
		} else {
			this.$.unreadIcon.setShowing(true);
			//this.$.item.removeClass('read');
		}
			
	},
	entryClick: function(inSender, inEvent, inRowIndex) {
		var className = inEvent.target.className;
		if(_.includes(className, "username")){
			var username = inEvent.target.getAttribute('data-user-screen_name') || inEvent.target.innerText.replace("@", "");
			AppUI.viewUser(username, this.entry.service, this.entry.account_id);
		} else if(className === "avatar"){
			AppUI.viewUser(this.entry.author_username, this.entry.service, this.entry.account_id);
		} else if(className === "small-avatar"){
			AppUI.viewUser(this.entry.reposter_username, this.entry.service, this.entry.account_id);
		} else if(_.includes(className, "hashtag")){
			AppUI.search(inEvent.target.innerText, this.entry.account_id);
		} else if(!inEvent.target.getAttribute("href")){ //if not a link, send out a general tap event
			this.doEntryClick(inEvent, inRowIndex);
		}
	},
})
