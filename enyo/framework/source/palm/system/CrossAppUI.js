/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A CrossAppUI control is used for displaying UI that resides outside the application itself (filepicker, people picker, etc).

	{kind: "CrossAppUI", app: "com.palm.app.statusbar", showing:false, params:...}

*/
enyo.kind({
	name: "enyo.CrossAppUI",
	kind: enyo.Iframe,
	published: {
		app: "", //* String. id of the app whose UI will be displayed.
		path: "", //* String. Relative path from the target app's main index file to the index file to be displayed.
		params: null //* Object, optional.  Window params for the target UI document.
	},
	events: {
		onResult:"" //* Sent when a result is received from the cross-app UI.
	},
	components: [
		{name: "getAppPath", kind: "enyo.PalmService", service: "palm://com.palm.applicationManager/", method: "getAppBasePath", onResponse: "gotAppInfo"}
	],
	className: "enyo-iframe enyo-view",
	create: function() {
		this.inherited(arguments);
		this.params = this.params || {};
		this.appPath = "";
		this.checkLoadHitched = enyo.hitch(this, "checkLoad");
		this.handleMessageHitched = enyo.hitch(this, "handleMessage");
		window.addEventListener('message', this.handleMessageHitched);
	},
	destroy: function() {
		window.removeEventListener('message', this.handleMessageHitched);
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		if (this.app) {
			this.appChanged();
		} else if (this.path) {
			this.pathChanged();
		}
	},
	appChanged: function() {
		this.appPath = "";
		if (this.app) {
			this.$.getAppPath.call({appId:this.app});
		} else {
			this.pathChanged(); // rebuild whole path.
		}
	},
	gotAppInfo: function(inSender, response) {
		if(!response || !response.returnValue) {
			console.error("Could not get app path: "+(response && response.errorText));
			return;
		}
		this.appPath = response.basePath;
		this.appPath = this.appPath || "";
		if (this.appPath) {
			// Chop off app's index file.
			this.appPath = this.appPath.slice(0,this.appPath.lastIndexOf('/')+1);
			this.pathChanged();
		}
	},
	pathChanged: function() {
		var targetPath = "";
		// No path means empty URL.
		if (this.path) {
			if (this.appPath) {
				// If we've loaded an app path, use it.
				targetPath = this.appPath+this.path;
			} else if (!this.app) {
				// Blank app means path is absolute.
				targetPath = this.path;
			}
			// empty app-path but truthy app means we should do nothing.
			// If we have a target, send initial params in the URL, so they are immediately available.
			if (targetPath) {
				console.log("CrossAppUI: Loading cross-app UI at "+targetPath);
				targetPath = targetPath+"?enyoWindowParams="+encodeURIComponent(enyo.json.stringify(this.params));
				// Hack to watch the document load process, since sometimes the iframe fails to load.
				if (!this._checkLoadTimerId) {
					this._checkLoadTimerId = window.setTimeout(this.checkLoadHitched, 1000);
				}
			}
		}
		this.setAttribute("src", targetPath);
	},
	// FIXME: This hack should be removed once the real cause of DFISH-6462 is resolved.
	checkLoad: function() {
		var node = this.node;
		var doc = node && node.contentDocument;
		this._checkLoadTimerId = undefined;
		if(doc && doc.readyState === "complete" && doc.location.href === "about:blank" && this.path) {
			console.log("CrossAppUI: checkLoad: Kicking iframe.");
			this.pathChanged();
		} else {
			console.log("CrossAppUI: checkLoad: things look okay.");
		}
	},
	paramsChanged: function() {
		// If we haven't been rendered yet, or are currently pointing somewhere useless, 
		// no need to send new params via message, they will go in the URL.
		if (this.path && this.node && this.node.contentWindow) {
			enyo.windows.setWindowParams(this.node.contentWindow, this.params);
		}
	},
	handleMessage: function(e) {
		var label = "enyoCrossAppResult=";
		// Only respond to cross-app result messages, and also verify that the message is from *our* iframe.
		if (e.source === (this.node && this.node.contentWindow) && e.data.indexOf(label) === 0) {
			this.doResult(enyo.json.parse(e.data.slice(label.length)));
		}
	}
});
