/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
// FIXME: experimental, NOT currently used
// in case we need to do weighted average 
// for gestures like enyo1 does
enyo.weightedAverage = {
	data: {},
	count: 4,
	weights: [1, 2, 4, 8],
	compute: function(inValue, inKind) {
		if (!this.data[inKind]) {
			this.data[inKind] = [];
		}
		var cache = this.data[inKind];
		cache.push(inValue);
		if (cache.length > this.count) {
			cache.shift();
		}
		for (var i=0, d=0, o=0, c, w; (c=cache[i]) && (w=this.weights[i]); i++) {
			o += c * w;
			d += w;
		}
		d = d || 1;
		o = o / d;
		return o;
	},
	clear: function(inKind) {
		this.data[inKind] = [];
	}
};

//* @public
enyo.kind({
	name: "enyo.BasicWebView",
	kind: enyo.Control,
	//* @public
	published: {
		/** page identifier, used to open new webviews for new window requests */
		identifier: "",
		/** url for page, updated as user navigates, relative URLs not allowed */
		url: "",
		/** smallest font size shown on the page, used to stop text from becoming unreadable */
		minFontSize: 16,
		enableJavascript: true,
		/** boolean, allow page to request new windows to be opened */
		blockPopups: true,
		/** boolean, allow webview to accept cookies from server */
		acceptCookies: true,
		/** array of URL redirections specified as {regexp: string, cookie: string, enable: boolean}. */
		redirects: [],
		networkInterface: "",
		/** boolean, if set, page ignores viewport-related meta tags */
		ignoreMetaTags: false
	},
	domAttributes: {
		"tabIndex": 0
	},
	requiresDomMousedown: true,
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
		onOpenSelect: "",
		onNewPage: "",
		onPrint: "",
		onEditorFocusChanged: "",
		onConnected: "",
		onDisconnected: "",
		onError: ""
	},
	//* @protected
	lastUrl: "",
	style: "display: block; -webkit-transform:translate3d(0,0,0)",
	//style: "border: 2px solid red;",
	nodeTag: "object",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.history = [];
		this.callQueue = [];
		this.dispatcher = enyo.dispatcher;
		this.domAttributes.type = "application/x-palm-browser";
		/*
		this._mouseInInteractive = false;
		this._mouseInFlash = false;
		*/
		this._flashGestureLock = false;
	},
	destroy: function() {
		this.callQueue = null;
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		if (this.hasNode()) {
			this.node.eventListener = this;
			this.history = [];
			this.lastUrl = "";
			this._viewInited = false;
			this.connect();
		}
	},
	// FIXME: we cannot rely on adapterInitialized 
	// so this is another potential check to see if the adapter is ready
	hasView: function() {
		return this.hasNode() && this.node.openURL;
	},
	// (browser adapter callback) we only get this if the view is initially hidden
	adapterInitialized: function() {
		this.log("adapterInitialized");
		this._viewInited = this._serverConnected = false;
		this.connect();
	},
	// (browser adapter callback) called when the server is connected
	serverConnected: function() {
		this.log();
		this._serverConnected = true;
		this._viewInited = false;
		this.initView();
		this.flushCallQueue();
		this.doConnected();
	},
	connect: function() {
		if (this.hasView() && !this._viewInited && !this._serverConnected) {
			this._connect();
			this._connectJob = enyo.job("browserserver-connect", enyo.hitch(this, "connect"), 500);
		} else {
			this._connectJob = null;
		}
	},
	_connect: function() {
		try {
			this.node.setPageIdentifier(this.identifier || this.id);
			this.node.connectBrowserServer();
		} catch (e) {
			// eat the exception, this is expected while browserserver
			// is starting up
		}
	},
	initView: function() {
		if (this.hasView() && !this._viewInited && this._serverConnected) {
			this.cacheBoxSize();
			this.node.interrogateClicks(false);
			this.node.setShowClickedLink(true);
			this.node.pageFocused(true);
			this.blockPopupsChanged();
			this.acceptCookiesChanged();
			this.enableJavascriptChanged();
			this.redirectsChanged();
			this.updateViewportSize();
			this.urlChanged();
			this.minFontSizeChanged();
			this._viewInited = true;
			
		}
	},
	//* @public
	// NOTE: to be called manually when browser should be resized.
	resize: function() {
		var s = enyo.fetchControlSize(this);
		if (this._boxSize && (this._boxSize.w != s.w || this._boxSize.h != s.h)) {
			this.cacheBoxSize();
		}
		this.updateViewportSize();
	},
	//* @protected
	// save our current containing box size;
	// we use this to determine if we need to resize
	cacheBoxSize: function() {
		this._boxSize = enyo.fetchControlSize(this);
		this.applyStyle("width", this._boxSize.w + "px");
		this.applyStyle("height", this._boxSize.h + "px");
	},
	//* @protected
	// this tells the adapter how big the plugin is.
	updateViewportSize: function() {
		var b = enyo.calcModalControlBounds(this);
		this.callBrowserAdapter("setVisibleSize", [b.width, b.height]);
	},
	urlChanged: function() {
		if (this.url) {
			this.callBrowserAdapter("openURL", [this.url]);
			this.log(this.url);
		}
	},
	minFontSizeChanged: function() {
		this.callBrowserAdapter("setMinFontSize", [Number(this.minFontSize)]);
	},
	/*
	dispatchDomEvent: function(inEvent) {
		var r = true;	
		var pass = (inEvent.type == "gesturechange" || inEvent.type == "gesturestart" || inEvent.type == "gestureend");
		var left = inEvent.centerX || inEvent.clientX || inEvent.pageX;
		var top = inEvent.centerY || inEvent.clientY || inEvent.pageY;
		if (inEvent.preventDefault && (left < 0 || top < 0)) {
			inEvent.preventDefault();
			return true;
		}
		//this.log('type: ' + inEvent.type + ' pass: ' + pass + ' flashGestureLock: ' + this._flashGestureLock + ' mouseInFlash: ' + this._mouseInFlash + ' mouseInInteractive: ' + this._mouseInInteractive);
		if (pass || (!this._flashGestureLock && !this._mouseInInteractive) || (this._flashGestureLock && !this._mouseInFlash)) {
			r = this.inherited(arguments);
		}
		return r;
	},
	*/
	dragstartHandler: function() {
		// prevent dragging event from bubbling when dragging in webview
		return true;
	},
	flickHandler: function(inSender, inEvent) {
		this.callBrowserAdapter("handleFlick", [inEvent.xVel, inEvent.yVel]);
	},
	enableJavascriptChanged: function() {
		this.callBrowserAdapter("setEnableJavaScript", [this.enableJavascript]);
	},
	blockPopupsChanged: function() {
		this.callBrowserAdapter("setBlockPopups", [this.blockPopups]);
	},
	acceptCookiesChanged: function() {
		this.callBrowserAdapter("setAcceptCookies", [this.acceptCookies]);
	},
	redirectsChanged: function(inOldRedirects) {
		for (var i=0, r; r=inOldRedirects && inOldRedirects[i]; i++) {
			this.callBrowserAdapter("addUrlRedirect", [r.regex, false, r.cookie, 0]);
		}
		for (i=0, r; r=this.redirects[i]; i++) {
			this.callBrowserAdapter("addUrlRedirect", [r.regex, r.enable, r.cookie, 0]);
		}
	},
	networkInterfaceChanged: function() {
		if (this.networkInterface) {
			this.callBrowserAdapter("setNetworkInterface", [this.networkInterface]);
		}
	},
	ignoreMetaTagsChanged: function() {
		this.callBrowserAdapter("ignoreMetaTags", [this.ignoreMetaTags]);
	},
	//* @public
	clearHistory: function() {
		this.callBrowserAdapter("clearHistory");
	},
	//* @protected
	cutHandler: function() {
		this.callBrowserAdapter("cut");
	},
	copyHandler: function() {
		this.callBrowserAdapter("copy");
	},
	pasteHandler: function() {
		this.callBrowserAdapter("paste");
	},
	selectAllHandler: function() {
		this.callBrowserAdapter("selectAll");
	},
	// attempt to call a method on the browser adapter; if the adapter is not
	// ready the call will be added to the callQueue, and start polling for
	// adapter ready.
	//* @public
	callBrowserAdapter: function(inFuncName, inArgs) {
		if (this.hasNode() && this.node[inFuncName] && this._serverConnected) {
			this.log(inFuncName, inArgs);
			this.node[inFuncName].apply(this.node, inArgs);
		} else {
			this.log("queued!", inFuncName, inArgs);
			this.callQueue.push({name: inFuncName, args: inArgs});
			if (!this._connectJob) {
				this.connect();
			}
		}
	},
	//* @protected
	flushCallQueue: function() {
		//this.log(this.callQueue.length, "view?", this.hasView());
		if (this.callQueue.length > 0) {
			if (this.hasView()) {
				var l = this.callQueue.length;
				for (var i=0, q; i<l; i++) {
					q = this.callQueue.shift();
					this.callBrowserAdapter(q.name, q.args);
				}
			} else {
				setTimeout(enyo.hitch(this, "flushCallQueue"), 100);
			}
		}
	},
	showFlashLockedMessage: function() {
		if (this.flashPopup == null) {
			// Note: the html break in the message is intentional
			// (requested by HI)
			this.flashPopup = this.createComponent({kind: "Popup", modal: true, style: "text-align:center", components: [{allowHtml: true, content: $L("Dragging works in Flash, until you<br>pinch to zoom out")}]});
			this.flashPopup.render();
			if (this.flashPopup.hasNode()) {
				this.flashTransitionEndHandler = enyo.bind(this, "flashPopupTransitionEndHandler");
				this.flashPopup.node.addEventListener("webkitTransitionEnd", this.flashTransitionEndHandler, false);
			}
		}
		this.flashPopup.applyStyle("opacity", 1);
		this.flashPopup.openAtCenter();
		enyo.job(this.id + "-hideFlashPopup", enyo.bind(this, "hideFlashLockedMessage"), 2000);
	},
	hideFlashLockedMessage: function() {
		this.flashPopup.addClass("enyo-webview-flashpopup-animate");
		this.flashPopup.applyStyle("opacity", 0);
	},
	flashPopupTransitionEndHandler: function() {
		this.flashPopup.removeClass("enyo-webview-flashpopup-animate");
		this.flashPopup.close();
	},
	// (browser adapter callback) reports page url, title and if it's possible
	// to go back/forward
	urlTitleChanged: function(inUrl, inTitle, inCanGoBack, inCanGoForward) {
		this.lastUrl = this.url;
		this.url = inUrl;
		this.doPageTitleChanged(enyo.string.escapeHtml(inTitle), inUrl, inCanGoBack, inCanGoForward);
	},
	// (browser adapter callback) used to store history and generate event
	loadStarted: function() {
		this.log();
		this.doLoadStarted();
	},
	// (browser adapter callback) generates event that can be used to show
	// load progress
	loadProgressChanged: function(inProgress) {
		this.doLoadProgress(inProgress);
	},
	// (browser adapter callback) used to restore history and generate event
	loadStopped: function() {
		this.log();
		this.doLoadStopped();
	},
	// (browser adapter callback) generates event
	documentLoadFinished: function() {
		this.log();
		this.doLoadComplete();
	},
	// (browser adapter callback) generates event
	mainDocumentLoadFailed: function(domain, errorCode, failingURL, localizedMessage) {
		this.doError(errorCode, localizedMessage + ": " + failingURL);
	},
	// (browser adapter callback) ?
	linkClicked : function(url) {
		//this.log(url);
	},
	// (browser adapter callback) called when loading a URL that should
	// be redirected
	urlRedirected: function(inUrl, inCookie) {
		this.doUrlRedirected(inUrl, inCookie);
	},
	// working
	updateGlobalHistory: function(url, reload) {
		//this.log(url);
	},
	// working
	firstPaintCompleted: function() {
		//this.log();
	},
	// (browser adapter callback) used to show/hide virtual keyboard when
	// input field is focused
	editorFocused: function(inFocused, inFieldType, inFieldActions) {
		if (window.PalmSystem) {
			if (inFocused) {
				this.node.focus();
			}
			window.PalmSystem.editorFocused(inFocused, inFieldType, inFieldActions);
		}
		this.doEditorFocusChanged(inFocused, inFieldType, inFieldActions);
	},
	// (browser adapter callback) called to close a list selector
	// gets called after we send a response, so no need to do anything
	// hideListSelector: function(inId) {
	// },
	// (browser adapter callback) called to open an alert dialog
	dialogAlert: function(inMsg) {
		this.doAlertDialog(inMsg);
	},
	// (browser adapter callback) called to open a confirm dialog
	dialogConfirm: function(inMsg) {
		this.doConfirmDialog(inMsg);
	},
	// (browser adapter callback) called to open a prompt dialog
	dialogPrompt: function(inMsg, inDefaultValue) {
		this.doPromptDialog(inMsg, inDefaultValue);
	},
	// (browser adapter callback) called to open a SSL confirm dialog
	dialogSSLConfirm: function(inHost, inCode) {
		this.doSSLConfirmDialog(inHost, inCode);
	},
	// (browser adapter callback) called to open a user/password dialog
	dialogUserPassword: function(inMsg) {
		this.doUserPasswordDialog(inMsg);
	},
	// (browser adapter callback) called when loading an unsupported MIME type
	mimeNotSupported: function(inMimeType, inUrl) {
		this.doFileLoad(inMimeType, inUrl);
	},
	// (browser adapter callback) called when loading an unsupported MIME type
	mimeHandoffUrl: function(inMimeType, inUrl) {
		this.doFileLoad(inMimeType, inUrl);
	},
	// (browser adapter callback) called when mouse moves in or out of a
	// non-flash interactive rect
	mouseInInteractiveChange: function(inInteractive) {
		//this.log(inInteractive);
		this._mouseInInteractive = inInteractive;
	},
	// (browser adapter callback) called when mouse moves in or out of a
	// flash rect 
	mouseInFlashChange: function(inFlash) {
		//this.log(inFlash);
		this._mouseInFlash = inFlash;
	},
	// (browser adapter callback) called when flash "gesture lock" state
	// changes
	flashGestureLockChange: function(enabled) {
		//this.log(enabled);
		this._flashGestureLock = enabled;

                if (this._flashGestureLock) {
                    this.showFlashLockedMessage();
                }
	},
	/**
	(browser adapter callback) called when browser needs to create
	a new card. (e.g. links with target)
	**/
	createPage: function(inIdentifier) {
		this.doNewPage(inIdentifier);
	},
	/**
	(browser adapter callback) called when the browser needs to scroll
	the page. (e.g. named anchors)
	**/
	scrollTo: function(inLeft, inTop) {
		// nop
	},
	/**
	(browser adapter callback) called when found a meta viewport tag
	**/
	metaViewportSet: function(inInitialScale, inMinimumScale, inMaximumScale, inWidth, inHeight, inUserScalable) {
		// nop
	},
	/**
	(browser adapter callback) called when browser server disconnected
	**/
	browserServerDisconnected: function() {
		this.log();
		this._serverConnected = false;
		this._viewInited = false;
		this.doDisconnected();
	},
	/**
	(browser adapter callback) called when web page  requests print
	**/
	showPrintDialog: function() {
		this.doPrint();
	},
	/**
	(browser adapter callback) called when text caret position is updated
	**/
	textCaretRectUpdate: function(inLeft, inTop, inRight, inBottom) {
		// nop
	},
	/**
	(browser adapter callback)
	**/
	eventFired: function(inEvent, inInfo) {
		var e = {type:inEvent.type, pageX:inEvent.pageX, pageY:inEvent.pageY};
		var h = {
			isNull: inInfo.isNull,
			isLink: inInfo.isLink,
			isImage: inInfo.isImage,
			x: inInfo.x,
			y: inInfo.y,
			bounds: {
				left: inInfo.bounds && inInfo.bounds.left || 0,
				top: inInfo.bounds && inInfo.bounds.top || 0,
				right: inInfo.bounds && inInfo.bounds.right || 0,
				bottom: inInfo.bounds && inInfo.bounds.bottom || 0
			},
			element: inInfo.element,
			title: inInfo.title,
			linkText: inInfo.linkText,
			linkUrl: inInfo.linkUrl,
			linkTitle: inInfo.linkTitle,
			altText: inInfo.altText,
			imageUrl: inInfo.imageUrl,
			editable: inInfo.editable,
			selected: inInfo.selected
		};
		var fn = "do" + inEvent.type.substr(0, 1).toUpperCase() + inEvent.type.substr(1);
		return this[fn].apply(this, [e, h]);
	},
	// renamed browser adapter callbacks:
	// (browser adapter callback) renamed to showListSelector
	showPopupMenu: function(inId, inItemsJson) {
		this.doOpenSelect(inId, inItemsJson);
	},
	// (browser adapter callback) renamed to documentLoadFinished
	didFinishDocumentLoad: function() {
		this.documentLoadFinished();
	},
	// (browser adapter callback) renamed to loadFailed
	failedLoad: function(domain, errorCode, failingURL, localizedMessage) {
	},
	// (browser adapter callback) renamed to mainDocumentLoadFailed
	setMainDocumentError: function(domain, errorCode, failingURL, localizedMessage) {
		this.mainDocumentLoadFailed(domain, errorCode, failingURL, localizedMessage);
	},
	// (browser adapter callback) renamed to firstPaintCompleted
	firstPaintComplete: function() {
		this.firstPaintCompleted();
	},
	// (browser adapter callback) renamed to loadProgressChanged
	loadProgress: function(inProgress) {
		this.loadProgressChanged(inProgress);
	},
	// (browser adapter callback) renamed to pageDimensionsChanged
	pageDimensions: function(width, height) {
		// nop
	},
	// (browser adapter callback) renamed to smartZoomAreaFound
	smartZoomCalculateResponseSimple: function(left, top, right, bottom, centerX, centerY, spotlightHandle) {
		// nop
	},
	// (browser adapter callback) renamed to urlTitleChanged
	titleURLChange: function(inTitle, inUrl, inCanGoBack, inCanGoForward) {
		this.urlTitleChanged(inUrl, inTitle, inCanGoBack, inCanGoForward);
	}
});
