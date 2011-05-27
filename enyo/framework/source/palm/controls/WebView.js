/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that shows web content with built-in scroller.

	{kind: "WebView"}

The URL to load can be specified when declaring the instance, or by calling setUrl.

	{kind: "WebView", url: "http://www.google.com"}

	goToUrl: function(inUrl) {
		this.$.webview.setUrl(inUrl);
	}
*/
enyo.kind({
	name: "enyo.WebView",
	kind: enyo.Control,
	published: {
		identifier: "",
		url: "",
		minFontSize: 16,
		enableJavascript: true,
		blockPopups: true,
		acceptCookies: true,
		redirects: [],
		networkInterface: "",
		ignoreMetaTags: false
	},
	events: {
		onMousehold: "",
		onResized: "",
		onPageTitleChanged: "",
		onUrlRedirected: "",
		onSingleTap: "",
		onLoadStarted: "",
		onLoadProgress: "",
		onLoadStopped: "",
		onLoadComplete: "",
		onFileLoad: "",
		onAlertDialog: "",
		onConfirmDialog: "",
		onPromptDialog: "",
		onSSLConfirmDialog: "",
		onUserPasswordDialog: "",
		onNewPage: "",
		onPrint: "",
		onEditorFocusChanged: "",
		onError: "",
		onDisconnected: ""
	},
	chrome: [
		{name: "view", kind: enyo.BasicWebView,
			onclick: "webviewClick",
			onMousehold: "doMousehold",
			onResized: "doResized",
			onPageTitleChanged: "pageTitleChanged",
			onUrlRedirected: "doUrlRedirected",
			onSingleTap: "doSingleTap",
			onLoadStarted: "doLoadStarted",
			onLoadProgress: "doLoadProgress",
			onLoadStopped: "doLoadStopped",
			onLoadComplete: "doLoadComplete",
			onFileLoad: "doFileLoad",
			onAlertDialog: "doAlertDialog",
			onConfirmDialog: "doConfirmDialog",
			onPromptDialog: "doPromptDialog",
			onSSLConfirmDialog: "doSSLConfirmDialog",
			onUserPasswordDialog: "doUserPasswordDialog",
			onOpenSelect: "showSelect",
			onNewPage: "doNewPage",
			onPrint: "doPrint",
			onEditorFocusChanged: "doEditorFocusChanged",
			onConnected: "connected",
			onDisconnected: "disconnected",
			onError: "doError"
		},
		{name: "spinnerPopup", kind: "Popup", className: "enyo-webview-popup-spinner", scrim: true, components: [
			{name: "spinner", kind: "SpinnerLarge"}
		]}
	],
	_freeSelectPopups: [],
	_cachedSelectPopups: {},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.identifierChanged();
		this.minFontSizeChanged();
		this.enableJavascriptChanged();
		this.blockPopupsChanged();
		this.acceptCookiesChanged();
		this.redirectsChanged();
		this.networkInterfaceChanged();
		this.ignoreMetaTagsChanged();
		this.urlChanged();
	},
	identifierChanged: function() {
		this.$.view.setIdentifier(this.identifier);
	},
	urlChanged: function(inOldUrl) {
		this.$.view.setUrl(this.url);
	},
	minFontSizeChanged: function() {
		this.$.view.setMinFontSize(this.minFontSize);
	},
	enableJavascriptChanged: function() {
		this.$.view.setEnableJavascript(this.enableJavascript);
	},
	blockPopupsChanged: function() {
		this.$.view.setBlockPopups(this.blockPopups);
	},
	acceptCookiesChanged: function() {
		this.$.view.setAcceptCookies(this.acceptCookies);
	},
	redirectsChanged: function(inOldRedirects) {
		this.$.view.setRedirects(this.redirects);
	},
	networkInterfaceChanged: function() {
		this.$.view.setNetworkInterface(this.networkInterface);
	},
	ignoreMetaTagsChanged: function() {
		this.$.view.setIgnoreMetaTags(this.ignoreMetaTags);
	},
	showSelect: function(inSender, inId, inItemsJson) {
		if (this._cachedSelectPopups[inId]) {
			this._cachedSelectPopups[inId]._response = -1;
			this.openSelect(this._cachedSelectPopups[inId]);
		} else {
			this.showSpinner();
			enyo.asyncMethod(this, "createSelectPopup", inId, inItemsJson);
		}
	},
	openSelect: function(inPopup) {
		var s = this._selectRect;
		if (s) {
			var p = inPopup.calcSize();
			var o = this.getOffset();
			var l = Math.max(0, s.right - (s.right - s.left)/2 - p.width/2);
			var t = Math.max(0, s.bottom - (s.bottom - s.top)/2 - p.height/2);
			inPopup.openAt({left: l + o.left, top: t + o.top});
		} else {
			inPopup.openAtCenter();
		}
	},
	createSelectPopup: function(inId, inItemsJson) {
		var p = this._freeSelectPopups.pop();
		if (!p) {
			p = this.createComponent({kind: "PopupList", name: "select-" + inId, _webviewId: inId, _response: -1, onSelect: "selectPopupSelect", onClose: "selectPopupClose"});
		} else {
			p._webviewId = inId;
			p._response = -1;
		}
		var listItems = [];
		var items = enyo.json.parse(inItemsJson);
		for (var i = 0, c; c = items.items[i]; i++) {
			listItems.push({caption: c.text, disabled: !c.isEnabled});
		}
		p.setItems(listItems);
		p.render();
		this._cachedSelectPopups[inId] = p;
		this.hideSpinner();
		this.openSelect(p);
	},
	selectPopupSelect: function(inSender, inSelected, inOldItem) {
		inSender._response = inSelected;
	},
	selectPopupClose: function(inSender) {
		// MenuItem calls close then doSelect, so wait for the function
		// to finish before replying to get the correct value.
		enyo.asyncMethod(this, "selectPopupReply", inSender);
	},
	selectPopupReply: function(inSender) {
		this.callBrowserAdapter("selectPopupMenuItem", [inSender._webviewId, inSender._response]);
	},
	connected: function() {
		this.hideSpinner();
	},
	disconnected: function() {
		var r = this._requestDisconnect;
		if (!this._requestDisconnect) {
			this.showSpinner();
			setTimeout(enyo.hitch(this, "reinitialize"), 5000);
		} else {
			this._requestDisconnect = false;
		}
		this.doDisconnected(r);
	},
	reinitialize: function() {
		this.$.view.connect();
	},
	showSpinner: function() {
		if (!this.$.spinnerPopup.isOpen) {
			this.$.spinnerPopup.validateComponents();
			this.$.spinner.show();
			this.$.spinnerPopup.openAtCenter();
		}
	},
	hideSpinner: function() {
		this.$.spinnerPopup.validateComponents();
		this.$.spinnerPopup.close();
		this.$.spinner.hide();
	},
	pageTitleChanged: function(inSender, inTitle, inUrl, inBack, inForward) {
		for (var p in this._cachedSelectPopups) {
			this._freeSelectPopups.push(this._cachedSelectPopups[p]);
		}
		this._cachedSelectPopups = {};
		this.doPageTitleChanged(inTitle, inUrl, inBack, inForward);
	},
	//* @public
	activate: function() {
		this.$.view.callBrowserAdapter("pageFocused", [true]);
		// XXX plugin functions are not accessible when it's hidden
		// so some calls may be in queue.
		this.$.view.flushCallQueue();
	},
	deactivate: function() {
		this.$.view.callBrowserAdapter("pageFocused", [false]);
	},
	disconnect: function() {
		this.$.view.callBrowserAdapter("disconnectBrowserServer");
		this._requestDisconnect = true;
	},
	resize: function() {
		this.$.view.resize();
	},
	deferSetUrl: function(inUrl) {
		this.setUrl(inUrl);
	},
	clearCache: function() {
		this.$.view.callBrowserAdapter("clearCache");
	},
	clearCookies: function() {
		this.$.view.callBrowserAdapter("clearCookies");
	},
	clearHistory: function() {
		this.$.view.clearHistory();
	},
	deleteImage: function(inPath) {
		this.$.view.callBrowserAdapter("deleteImage", [inPath]);
	},
	generateIconFromFile: function(inPath, inIconPath, inLeft, inTop, inWidth, inHeight) {
		this.$.view.callBrowserAdapter("generateIconFromFile", [inPath, inIconPath, inLeft, inTop, inWidth, inHeight]);
	},
	getHistoryState: function(inCallback) {
		this.$.view.getHistoryState(inCallback);
	},
	goBack: function() {
		this.$.view.callBrowserAdapter("goBack");
	},
	goForward: function() {
		this.$.view.callBrowserAdapter("goForward");
	},
	reloadPage: function() {
		this.$.view.callBrowserAdapter("reloadPage");
	},
	resizeImage: function(inFromPath, inToPath, inWidth, inHeight) {
		this.$.view.callBrowserAdapter("resizeImage", [inFromPath, inToPath, inWidth, inHeight]);
	},
	saveViewToFile: function(inPath, inLeft, inTop, inWidth, inHeight) {
		this.$.view.callBrowserAdapter("saveViewToFile", [inPath, inLeft, inTop, inWidth, inHeight]);
	},
	stopLoad: function() {
		this.$.view.callBrowserAdapter("stopLoad");
	},
	acceptDialog: function() {
		var args = [].slice.call(arguments);
		args.unshift("1");
		this.$.view.callBrowserAdapter("sendDialogResponse", args);
	},
	cancelDialog: function() {
		this.$.view.callBrowserAdapter("sendDialogResponse", ["0"]);
	},
	sendDialogResponse: function(inResponse) {
		this.$.view.callBrowserAdapter("sendDialogResponse", [inResponse]);
	},
	inspectUrlAtPoint: function(inX, inY, inCallback) {
		this.$.view.callBrowserAdapter("inspectUrlAtPoint", [inX, inY, inCallback]);
	},
	insertStringAtCursor: function(inString) {
		this.$.view.callBrowserAdapter("insertStringAtCursor", [inString]);
	},
	saveImageAtPoint: function(inLeft, inTop, inDirectory, inCallback) {
		this.$.view.callBrowserAdapter("saveImageAtPoint", [inLeft, inTop, inDirectory, inCallback]);
	},
	getImageInfoAtPoint: function(inX, inY, inCallback) {
		this.$.view.callBrowserAdapter("getImageInfoAtPoint", [inX, inY, inCallback]);
	},
	setHTML: function(inUrl, inBody) {
		this.$.view.callBrowserAdapter("setHTML", [inUrl, inBody]);
	},
	printFrame: function(inName, inJobId, inWidth, inHeight, inDpi, inLandscape, inReverseOrder) {
		this.$.view.callBrowserAdapter("printFrame", [inName, inJobId, inWidth, inHeight, inDpi, inLandscape, inReverseOrder]);
	},
	findInPage: function(inString) {
		this.$.view.callBrowserAdapter("findInPage", [inString]);
	},
	//* @protected
	//* XXX removeme
	redirectUrl: function(inRegex, inCookie, inEnable) {
		this.$.view.callBrowserAdapter("addUrlRedirect", [inRegex, inEnable, inCookie, 0]);
	},
	callBrowserAdapter: function(inFuncName, inArgs) {
		this.$.view.callBrowserAdapter(inFuncName, inArgs);
	},
	webviewClick: function(inSender, inEvent, inInfo) {
		if (inInfo) {
			if (inInfo.element == "SELECT") {
				this._selectRect = inInfo.bounds;
			} else {
				this._selectRect = null;
			}
			this.doClick(inEvent, inInfo);
		}
	}
});

/*
On non-PalmSystem platforms, revert WebView to be an Iframe.
This allows basic use of WebView in a desktop browser.
*/
if (!window.PalmSystem) {
	enyo.WebView = enyo.Iframe;
}
