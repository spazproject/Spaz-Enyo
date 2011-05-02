enyo.kind({
	name: "Spaz.Container",
	flex: 1,
	kind: "Control",
	height: "100%",
	peekWidth: 50,
	events: {
		onTweetClick: ""
	},
	components: [
		{kind: "SnapScroller", flex: 1, vertical: false, autoVertical: false, style: "background: black", components: [
			{name: "Home", info: {type: "home", display: "Home", accounts: ["@Tibfib", "@Spaz"]}, kind: "Spaz.Column", onTweetClick: "tweetClick"},
			{name: "Replies", info: {type: "replies", display: "Replies", accounts: ["@Tibfib", "@Spaz"]}, kind: "Spaz.Column", onTweetClick: "tweetClick"},
			{name: "Direct Messages", info: {type: "direct", display: "Direct Messages", accounts: ["@Tibfib", "@Spaz"]}, kind: "Spaz.Column", onTweetClick: "tweetClick"},
			{name: "Search", info: {type: "search", search: "#webOS"}, kind: "Spaz.Column", onTweetClick: "tweetClick"},
			{name: "Search 2", kind: "Spaz.Column", onTweetClick: "tweetClick"}
		]},		
	],
	create: function(){
		this.inherited(arguments);
		//this.$.list.refresh();
	},
	tweetClick: function(inSender, inTweet) {
		this.doTweetClick(inTweet);
	},
	resizeHandler: function() {
		_.each(this.$.snapScroller.components, function(kind){
			this.$[kind.name].resizeHandler();
		}, this);
	}
});