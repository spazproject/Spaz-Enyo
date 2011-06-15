enyo.kind({
	name: "Spaz.Entry",
	kind: "HFlexBox",
	flex: 1, 
	events: {
		onEntryClick: ""	
	},
	published: {
		entry: "",
		ignoreUnread: false
	},
	components: [
		{className: "entry", kind: "Item", layoutKind: "HFlexLayout", onclick: "entryClick", flex: 1, tapHighlight: true, style: "padding-right: 5px;", components: [
			{kind: "Control", components: [
					{name: "authorAvatar", kind: "Image", width: "50px", height: "50px", className: "avatar"},
					{name: "reposterAvatar", kind: "Image", width: "25px", height: "25px", className: "small-avatar", showing: false}
			]},
			{name: "text", allowHtml: true, flex: 1, className: "entrytext text"},
		]}
	],
	entryChanged: function(){
		this.$.authorAvatar.setSrc(this.entry.author_avatar);

		var toMacroize = "<span class='text username author'>{$author_username}</span>";

		this.$.reposterAvatar.setShowing(this.entry.is_repost);
		if (this.entry.recipient_username && this.entry.is_private_message) {
			toMacroize += "<span style='padding: 0px 3px; position: relative; bottom: 1px'>&rarr;</span>";
			toMacroize += "<span class = 'text username recipient author'>{$recipient_username}</span>";			
		} else if(this.entry.is_repost === true){
			toMacroize += "<img height = '13px' class='entryHeaderIcon' src = 'source/images/reposted.png'></img>";
			toMacroize += "<span class='text username author'>{$reposter_username}</span>";
			this.$.reposterAvatar.setSrc(this.entry.reposter_avatar);
		}
		if(this.entry.is_favorite){
			toMacroize += "<img height = '13px' class='entryHeaderIcon' src = 'source/images/favorited.png'></img>";
		}

		toMacroize += "<br/>";
		toMacroize += AppUtils.makeItemsClickable(this.entry.text);
		toMacroize += "<br/>";

		if (this.entry.read === false && this.ignoreUnread === false ) {	
			toMacroize += "<img src='source/images/unread.png' height= '13px' style='padding: 0px 3px 0px 0px;' class='entryHeaderIcon'></img> ";
		}
		toMacroize += "<span class='small' height = '13px'>" 
		toMacroize += sch.getRelativeTime(this.entry.publish_date);
		if (this.entry._orig.source) {
			toMacroize += " from <span class = 'link'>{$_orig.source}</span>";
		}
		toMacroize += "</span>"			

		if(this.entry.is_private_message === true){
			this.applyStyle("background-color", "rgba(255, 0, 0, .1)");			
		} else if(this.entry.is_mention === true){
			this.applyStyle("background-color", "rgba(0, 95, 200, .1)");
		} else if(this.entry.is_author === true){
			this.applyStyle("background-color", "rgba(0, 255, 0, .1)");
		} else {
			this.applyStyle("background-color", null);		
		}

		this.$.text.applyStyle("font-size", App.Prefs.get("entry-text-size"));

		this.$.text.setContent(enyo.macroize(toMacroize, this.entry));

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
