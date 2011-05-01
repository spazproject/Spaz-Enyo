enyo.kind({
	name: "Spaz.Timeline",
	flex: 1,
	kind: "SlidingView",
	height: "100%",
	peekWidth: 50,
	events: {
		onTweetClick: ""
	},
	components: [
		{kind: "SnapScroller", flex: 1, vertical: false, autoVertical: false, style: "background: black", components: [
			{name: "Home", kind: "Spaz.Column", onTweetClick: "tweetClick"},
			{name: "Replies", kind: "Spaz.Column", onTweetClick: "tweetClick"},
			{name: "Direct Messages", kind: "Spaz.Column", onTweetClick: "tweetClick"},
			{name: "Search", kind: "Spaz.Column", onTweetClick: "tweetClick"},
			{name: "Search 2", kind: "Spaz.Column", onTweetClick: "tweetClick"}
		]},		
	],
	tweets: [
		{username: "Tibfib", 	realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "9 minutes ago", 	message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et"},
		{username: "Tibfib", 	realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "10 minutes ago", message: "dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
		{username: "Funkatron", realname: "Ed Finkler", from: "Spaz", avatar: "http://a2.twimg.com/profile_images/1132376312/TheyLiveObey.jpg", 	time: "11 minutes ago", message: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."},
		{username: "Funkatron", realname: "Ed Finkler", from: "Spaz", avatar: "http://a2.twimg.com/profile_images/1132376312/TheyLiveObey.jpg", 	time: "12 minutes ago", message: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"},
		{username: "Tibfib", 	realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "15 minutes ago", message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et"},
		{username: "Tibfib", 	realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "20 minutes ago", message: "dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
		{username: "Funkatron", realname: "Ed Finkler", from: "Spaz", avatar: "http://a2.twimg.com/profile_images/1132376312/TheyLiveObey.jpg", 	time: "30 minutes ago", message: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."},
		{username: "Funkatron", realname: "Ed Finkler", from: "Spaz", avatar: "http://a2.twimg.com/profile_images/1132376312/TheyLiveObey.jpg", 	time: "1 hour ago", 	message: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"}
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
		_.each(this.$.snapScroller.components, function(kind){
			//this.$[kind.name].setupHeight();
		}, this);
		//this.$.list.refresh();
	},
	tweetClick: function(inSender, inTweet) {
		this.doTweetClick(inTweet);
		//this.$.list.select(inRowIndex);
	},
	resizeHandler: function() {
		_.each(this.$.snapScroller.components, function(kind){
			this.$[kind.name].resizeHandler();
		}, this);
	}
});