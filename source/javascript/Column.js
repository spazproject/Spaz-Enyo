enyo.kind({
	name: "Spaz.Column",
	//flex: 1,
	kind: "VFlexBox",
	height: "100%",
	width: "300px",
	//peekWidth: "50px",
	events: {
		onTweetClick: ""
	},
	components: [
		{height: "635px", layoutKind: "VFlexLayout", width: "300px", style: "margin: 10px 5px;", components: [
			{kind: "Toolbar", content: "Home", style: "color: white; margin: 0px 3px"},
			{kind: "Scroller", className: "timeline", style: "margin: 0px 5px;", height: "100%", flex: 1, components: [
				{name: "list", kind: "VirtualList", flex: 1, style: "background-color: #D8D8D8", className: "timeline list", onSetupRow: "setupRow", components: [
					{kind: "Item", tapHighlight: false, className: "tweet", layoutKind: "HFlexLayout", onclick: "tweetClick", components: [
						{kind: "Image", width: "50px", height: "50px", className: "avatar"},
						{kind: "VFlexBox", flex: 1, components: [
							{name: "tweet", className: "text"},
							{kind: "HFlexBox", className: "small", components: [
								{name: "timeFrom"},
								{kind: "Spacer"},
								{content: "Reply", className: "action"},
								{className: "action-separator"},
								{content: "Share", className: "action"},
								{className: "action-separator"},
								{content: "Favorite", className: "action", style: "padding-right: 5px"},
							]}	
						]},					
					]}
				]},
			]},	
			{kind: "Toolbar", style: "color: white; margin: 0px 3px", components: [
				{kind: "GrabButton"},
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
		//this.$.list.refresh();
	},
	setupRow: function(inSender, inIndex) {
		var tweet = this.tweets[inIndex];
		if (tweet) {

			this.$.tweet.setContent("<span class='username'>" + tweet.username + "</span> " + tweet.message);
			this.$.timeFrom.setContent(tweet.time + " from <span class='link'>" + tweet.from + "</span>");
			this.$.image.setSrc(tweet.avatar);
			
			this.$.item.applyStyle("background-color", inSender.isSelected(inIndex) ? "rgba(218,235,251,0.4)" : null);

			return true;
		} 

	},
	refreshList: function(){
		this.$.list.refresh();
	},
	tweetClick: function(inSender, inEvent, inRowIndex) {
		this.doTweetClick(this.tweets[inRowIndex]);
		this.$.list.select(inRowIndex);
	},
	resizeHandler: function() {
		this.$.list.refresh();//todo get this to work.
	}
});