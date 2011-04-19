/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.PalmServices",
	kind: enyo.VFlexBox,
	components: [
		{Xkind: enyo.HFlexBox, defaultKind: "Button", className: "button-bar", components: [
			{content: "Clear", onclick: "clearClick"},
			{content: "Init DB", onclick: "initDbClick"},
			{content: "DB WatchedFind", onclick: "watchedFindClick"},
			{content: "DB Put", onclick: "putClick"},
			{content: "Stop Watching", onclick: "stopWatchClick"},
			{content: "Emails", onclick: "emailsClick"},
			{content: "Traverse DB", onclick: "doFindDoodadsPiecewise"},
			{content: "Account Icons", onclick: "accountIconsClick"}
		]},
		{flex: 1, kind: "Scroller", components: [
			{name: "content", content: "", style: "font-size: 16px"}
		]},
		// 3 different ways of declaring a service call
		{name: "listAccounts1", kind: "PalmService", service: "palm://com.palm.service.accounts/", method: "listAccounts", onSuccess: "gotAccounts", onFailure: "genericFailure"},
		{name: "listAccounts2", kind: "SimpleAccountsService", method: "listAccounts", onSuccess: "gotAccounts", onFailure: "genericFailure"},
		{kind: "AccountsService", components: [
			{name: "listAccounts3", method: "listAccounts", onSuccess: "gotAccounts", onFailure: "genericFailure"}
		]},
		{name: "accounts", kind: "AccountsService", onSuccess: "gotAccountIcons", onFailure: "genericFailure"},
		{name: "Doodad", kind: "DbService", dbKind: "com.palm.doodad:1", onFailure: "verboseFailure", components: [
			{name: "delDoodadKind", method: "delKind", onResponse: "doPutDoodadKind"},
			{name: "putDoodadKind", method: "putKind", onSuccess: "genericSuccess"},
			{name: "watchDoodads", method: "find", onSuccess: "gotWatchResults", subscribe: true, resubscribe: true, reCallWatches: true},
			{name: "findDoodad", method: "find", onSuccess: "doPutOneDoodad"},
			{name: "putOneDoodad", method: "put", onSuccess: "putSuccess"},
			{name: "findDoodadsPiecewise", method: "find", onSuccess: "doFindDoodadsPiecewise"}
		]}
	],
	message: function(inMsg, inColor) {
		this.$.content.setContent(this.$.content.content + '<div style="padding: 1px 4px; border-bottom: 1px solid gray; background-color: ' + inColor + ';">' + inMsg + "</div>");
		this.$.scroller.scrollToBottom();
	},
	clearClick: function() {
		this.$.content.setContent("");
	},
	initDbClick: function() {
		// "dbKind" is inherited from the parent component
		this.$.delDoodadKind.call();
	},
	watchedFindClick: function() {
		if (!this.$.watchDoodads.active) {
			this.message("finding all doodads", "white");
			this.$.watchDoodads.call({
				query: {
					orderBy: "name",
					desc: true
				}
			});
			this.$.watchDoodads.active = true;
		}
	},
	stopWatchClick: function() {
		if (this.$.watchDoodads.active) {
			this.message("canceling doodad watch", "white");
			this.$.watchDoodads.cancel();
			this.$.watchDoodads.active = false;
		}
	},
	putClick: function() {
		this.$.findDoodad.call({
			query: {
				orderBy: "name",
				desc: true,
				limit: 1
			}
		});
	},
	emailsClick: function() {
		this.message("requesting device email addresses");
		this.$.listAccounts1.call({
			capability: "MAIL"
		});
	},
	accountIconsClick: function() {
		this.message("requesting icons for your accounts");
		var request = this.$.accounts.call({
			capability: "MAIL"
		}, {
			method: "getAccountIcons",
			onSuccess: "gotAccountIcons"
		});
		request.capability = "email";
	},
	gotAccountIcons: function(inSender, inResponse, inRequest) {
		var markup = inResponse.map(function(path) {
			return "<image src='" + path + "'></img>";
		});
		this.message("these are the icons for your " + inRequest.capability + " accounts (images on device only): " + markup.join(''));
	},
	gotAccounts: function(inSender, inResponse) {
		var emails = [];
		inResponse.results.forEach(function(acct) {
			emails.push(acct.username);
		});
		this.message("your device's email addresses are: " + JSON.stringify(emails), "lightgreen");
	},
	doPutDoodadKind: function() {
		this.message("putting a new doodad kind", "white");
		this.$.putDoodadKind.call({
			owner: "com.palm.palmservices",
			indexes: [{
				name: "justname",
				props: [{name: "name"}]
			}]
		});
	},
	doPutOneDoodad: function(inSender, inResponse) {
		// put a Doodad with a 'name' that is 1 more than the greatest current name
		var prev;
		var i;
		var newDoodad = {
			_kind: this.$.Doodad.dbKind,
			name: "doodad"
		};
		if (inResponse.results && inResponse.results.length > 0) {
			prev = inResponse.results[0];
			i = "00" + (parseInt(prev.name.substr(newDoodad.name.length), 10) + 1);
			if (i.length > 3) {
				i = i.substr(-3);
			}
			newDoodad.name += i;
		} else {
			newDoodad.name += "000";
		}
		this.$.putOneDoodad.call({objects: [newDoodad]});
	},
	gotWatchResults: function(inSender, inResponse) {
		var indices = [];
		var that = this;
		inResponse.results.forEach(function(doodad) {
			indices.push(doodad.name);
		});
		this.message("got these doodad names: " + JSON.stringify(indices));
	},
	doFindDoodadsPiecewise: function(inSender, inResponse, inRequest) {
		var params;
		var names = [];
		if (inRequest) {
			inResponse.results.forEach(function(doodad) {
				names.push(doodad.name);
			});
			this.message("got items: " + JSON.stringify(names) + " next=" + inResponse.next, "lightgreen");
			if (inResponse.next) {
				params = inRequest.params;
				params.query.page = inResponse.next;
			} else {
				this.message("done traversing", "lightgreen");
				return;
			}
		} else {
			this.message("traversing all Doodads, 10-at-a-time");
			params = {
				query: {
					orderBy: "name",
					limit: 10
				}
			};
		}
		this.$.findDoodadsPiecewise.call(params);
	},
	putSuccess: function(inSender, inResponse) {
		this.message("success storing doodad", "lightgreen");
	},
	verboseFailure: function(inSender, inResponse) {
		this.message(inSender.getMethod() + " FAIL: " + JSON.stringify(inResponse, undefined, 2), "#FF8080");
	},
	gotJson: function(inSender, inResponse) {
		this.message("got " + inSender.getName() + " response: ");
		this.message(JSON.stringify(inResponse));
	},
	genericSuccess: function(inSender) {
		this.message(inSender.getName() + " success", "lightgreen");
	},
	genericFailure: function(inSender, inResponse) {
		console.log("failure: " + JSON.stringify(inResponse));
		this.message(inSender.getName() + " FAIL: " + inResponse.errorText, "#FF8080");
	}
});
