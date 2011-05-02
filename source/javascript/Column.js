enyo.kind({
	name: "Spaz.Column",
	kind: enyo.VFlexBox,
	width: "322px",
	events: {
		onTweetClick: ""
	},
	published: {
		info: {
			//type: home/direct/search/replies
			//display: what is in the header
			//accounts: object array of accounts 
			//		{"type": "twitter", "username": "@Tibfib" etc
			//

		}
	},
	components: [
		{layoutKind: "VFlexLayout", width: "322px", style: "margin: 5px 5px;", components: [
			{kind: "Toolbar", defaultKind: "Control", content: "Home", style: "color: white; margin: 0px 3px", components: [
				//gotta do this crap to get the header title to center and not be a button. "defaultKind" in Toolbar is key.
				{kind: "Spacer"},
				{kind: "Spacer"},
				{kind: "Spacer"},
				{name: "header", content: "", style: "padding-left: 3px"},
				{kind: "Spacer"},
				{kind: "Spacer"},
				{kind: "ToolButton", icon: "source/images/icon-close.png"},
			]},
			{kind: "Scroller", autoHorizontal: false, horizontal: false, style: "background-color: #D8D8D8; margin: 0px 5px;", className: "timeline", flex: 1, components: [
				{name: "list", kind: "VirtualRepeater", flex: 1, style: "background-color: #D8D8D8; margin: 0px 0px; min-height: 400px;", className: "timeline list", onGetItem: "setupRow", components: [
					{kind: "Item", tapHighlight: true, className: "tweet", style: "padding-right: 0px;", layoutKind: "HFlexLayout", onclick: "tweetClick", components: [
						{kind: "VFlexBox", components: [
							{kind: "Image", width: "50px", height: "50px", className: "avatar"},
						]},
						{kind: "VFlexBox", flex: 1, components: [
							{name: "tweet", className: "text"},
							{name: "timeFrom", className: "small"},
						]},		
						{kind: "VFlexBox", width: "24px", components: [
							{kind: "Image", src: "source/images/action-icon-favorite.png"},
							{kind: "Image", src: "source/images/action-icon-share.png"},
							{kind: "Image", src: "source/images/action-icon-reply.png"},
						]}		
					]}
				]},
			]},	
			{kind: "Toolbar", style: "color: white; margin: 0px 3px", components: [
				{kind: "ToolButton", icon: "source/images/icon-clear.png"},
				{kind: "ToolButton", icon: "source/images/icon-refresh.png"}
			]}
		]}
	],
	tweets: [
		{username: "Tibfib", realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "9 minutes ago", message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et"},
		{username: "Tibfib", realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "10 minutes ago", message: "dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
		{username: "Funkatron", realname: "Ed Finkler", from: "Spaz", avatar: "http://a2.twimg.com/profile_images/1132376312/TheyLiveObey.jpg", time: "11 minutes ago", message: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."},
		{username: "Funkatron", realname: "Ed Finkler", from: "Spaz", avatar: "http://a2.twimg.com/profile_images/1132376312/TheyLiveObey.jpg", time: "12 minutes ago", message: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"},
		{username: "Tibfib", realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "15 minutes ago", message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et"},
		{username: "Tibfib", realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "20 minutes ago", message: "dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
		{username: "Funkatron", realname: "Ed Finkler", from: "Spaz",  avatar: "http://a2.twimg.com/profile_images/1132376312/TheyLiveObey.jpg", time: "30 minutes ago", message: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."},
		{username: "Funkatron", realname: "Ed Finkler", from: "Spaz",  avatar: "http://a2.twimg.com/profile_images/1132376312/TheyLiveObey.jpg", time: "1 hour ago", message: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"}
	],
	create: function(){
		this.inherited(arguments);
     	this.infoChanged();

     	setTimeout(enyo.bind(this, this.resizeHandler), 1);
	},
	infoChanged: function(){
		this.$.header.setContent(this.info.display);
	},
	setupRow: function(inSender, inIndex) {
		var tweet = this.tweets[inIndex];
		if (tweet) {

			this.$.tweet.setContent("<span class='username'>" + tweet.username + "</span> " + tweet.message);
			this.$.timeFrom.setContent(tweet.time + " from <span class='link'>" + tweet.from + "</span>");
			this.$.image.setSrc(tweet.avatar);
			
			//this.$.item.applyStyle("background-color", inSender.isSelected(inIndex) ? "rgba(218,235,251,0.4)" : null);

			return true;
		} 

	},
	tweetClick: function(inSender, inEvent, inRowIndex) {
		this.doTweetClick(this.tweets[inRowIndex]);
		//this.$.list.select(inRowIndex);
	},
	resizeHandler: function(inHeight) {
		this.$.scroller.applyStyle("height", window.innerHeight - 117 + "px");
	}
});