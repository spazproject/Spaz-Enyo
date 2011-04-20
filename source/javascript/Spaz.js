enyo.kind({
	name: "Spaz",
	kind: enyo.VFlexBox,
	components: [
		{kind: "SlidingPane", flex: 1, components: [
			{name: "accounts", kind: "Spaz.Accounts"},
			{name: "timeline", kind: "Spaz.Timeline", onTweetClick: "tweetClick"},
			{name: "tweetview", kind: "Spaz.TweetView"}
		]}
	],
	tweetClick: function(inSender, tweet){
		//this.$.tweetview.create();
		//this.$.slidingPane.createComponent({name: "tweetview", kind: "Spaz.TweetView"}, {owner: this});
		//this.$.slidingPane.render();
		
		this.$.tweetview.open();
		this.$.tweetview.setTweet(tweet);

		//this.$.timeline.refreshList();

		//this.$.timeline.render();
		//this.$.tweetview.render();
		//this.render();
	},
	resizeHandler: function() {
		this.$.slidingPane.resize();
	}
});