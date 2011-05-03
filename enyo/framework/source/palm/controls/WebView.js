/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that shows web content.

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
		autoFit: true,
		fitRender: false,
		enableJavascript: true,
		blockPopups: true,
		acceptCookies: true,
		redirects: [],
		accelerated: false,
		networkInterface: ""
	},
	events: {
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
		onError: ""
	},
	chrome: [
		{name: "view", kind: enyo.BasicWebView,
			onResized: "doResized",
			onPageTitleChanged: "doPageTitleChanged",
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
			onOpenSelect: "openSelect",
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
	_cachedSelectPopups: {},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.identifierChanged();
		this.minFontSizeChanged();
		this.autoFitChanged();
		this.fitRenderChanged();
		this.enableJavascriptChanged();
		this.blockPopupsChanged();
		this.acceptCookiesChanged();
		this.redirectsChanged();
		this.acceleratedChanged();
		this.networkInterfaceChanged();
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
	autoFitChanged: function() {
		this.$.view.setAutoFit(this.autoFit);
	},
	fitRenderChanged: function() {
		this.$.view.setFitRender(this.fitRender);
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
	acceleratedChanged: function() {
		this.$.view.setAccelerated(this.accelerated);
	},
	networkInterfaceChanged: function() {
		this.$.view.setNetworkInterface(this.networkInterface);
	},
	openSelect: function(inSender, inId, inItemsJson) {
		if (this._cachedSelectPopups[inId]) {
			this._cachedSelectPopups[inId]._response = -1;
			this._cachedSelectPopups[inId].openAtCenter();
		} else {
			if (Object.keys(this._cachedSelectPopups).length > 4) {
				var del = Object.keys(this._cachedSelectPopups)[0];
				var c = this._cachedSelectPopups[del];
				c.destroy();
				delete this._cachedSelectPopups[del];
			}
			this.showSpinner();
			enyo.asyncMethod(this, "createSelectPopup", inId, inItemsJson);
		}
	},
	createSelectPopup: function(inId, inItemsJson) {
		var p = this.createComponent({kind: "PopupList", name: "select-" + inId, _webviewId: inId, _response: -1, onSelect: "selectPopupSelect", onClose: "selectPopupClose"});
		var listItems = [];
		var items = enyo.json.parse(inItemsJson);
		for (var i = 0, c; c = items.items[i]; i++) {
			listItems.push({caption: c.text, disabled: !c.isEnabled});
		}
		p.setItems(listItems);
		p.render();
		this._cachedSelectPopups[inId] = p;
		this.hideSpinner();
		p.openAtCenter();
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
		if (!this._requestDisconnect) {
			this.showSpinner();
			setTimeout(enyo.hitch(this, "reinitialize"), 5000);
		} else {
			this._requestDisconnect = false;
		}
	},
	reinitialize: function() {
		this.$.view.connect();
	},
	showSpinner: function() {
		this.$.spinner.show();
		this.$.spinnerPopup.openAtCenter();
	},
	hideSpinner: function() {
		this.$.spinnerPopup.close();
		this.$.spinner.hide();
	},
	//* @public
	activate: function() {
		this.$.view.callBrowserAdapter("pageFocused", [true]);
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
	ignoreMetaTags: function(inIgnore) {
		this.$.view.callBrowserAdapter("ignoreMetaTags", [inIgnore]);
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
	}
});

/*
On non-PalmSystem platforms, revert WebView to be an Iframe.
This allows basic use of WebView in a desktop browser.
*/
if (!window.PalmSystem) {
	enyo.WebView = enyo.Iframe;
}
