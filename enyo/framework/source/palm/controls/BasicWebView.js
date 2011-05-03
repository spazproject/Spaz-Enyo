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
			d += w
		}
		d = d || 1;
		o = o / d;
		return o;
	},
	clear: function(inKind) {
		this.data[inKind] = [];
	}
};

enyo.sizeableMixin = {
	zoom: 1,
	// note: we assume minZoom and maxZoom are defined
	centeredZoomStart: function(e) {
		// FIXME: this should be offset in the current scroller only.
		var o = this.getOffset();
		var s = this.fetchScrollPosition();
		this._zoomStart = {
			scale: e.scale,
			centerX: e.centerX,
			centerY: e.centerY,
			scrollX: s.l,
			scrollY: s.t,
			zoom: this.zoom
		}
	},
	centeredZoomChange: function(e) {
		var gs = this._zoomStart;
		// FIXME: fill in defaults in case we don't get a full event
		// for usage in smartZoom when only need scaling
		// what factoring does this suggest?
		e.scale = e.scale || gs.scale;
		e.centerX = e.centerX || gs.centerX;
		e.centerY = e.centerY || gs.centerY;

		// round to two decimal places to reduce jitter
		var ds = Math.round(e.scale * 100) / 100;
		// note: zoom by the initial gesture zoom multiplied by scale;
		// this ensures we zoom enough to not be annoying.
		var z = gs.zoom * ds;
		// if scales beyond max zoom, disallow scaling so we simply pan
		// and set scale to total amount we have scaled since start
		if (z > this.maxZoom) {
			ds = this.maxZoom / gs.zoom;
		}

		/*
		this.log("e", e.centerX, e.centerY, e.scale,
				"s", gs.centerX, gs.centerY, gs.scale,
				"scroll", gs.scrollX, gs.scrollY,
				"offset", gs.offsetLeft, gs.offsetTop);
		*/

		// this is the offset after scaling
		var x = (ds - 1) * gs.centerX;
		// add the scaled scroll offset
		x += ds * gs.scrollX;
		// now account for the moving center
		x += ds * (gs.centerX - e.centerX);
		// do the y direction
		var y = (ds - 1) * gs.centerY + ds * gs.scrollY
			+ ds * (gs.centerY - e.centerY);

		//this.log(ds, z, x, y);
		return {zoom: z, x: x, y: y};
	},
	resetZoom: function() {
		// reset zoom to its original value.
		// assume subclass has implemented setZoom
		this.setZoom(this.minZoom);
	},
	// FIXME: need to determine how to interact with scroller
	// NOTE: we could have a scroller with a client area and the webview below
	// but we might want controls above and below webview inside the scroller
	findScroller: function() {
		if (this._scroller) {
			return this._scroller;
		}
		var n = this.hasNode(), c;
		while (n) {
			c = enyo.$[n.id];
			if (c && c instanceof enyo.BasicScroller) {
				return this._scroller = c;
			}
			n = n.parentNode;
		}
	},
	fetchScrollPosition: function() {
		var p = {t: 0, l: 0};
		var s = this.findScroller();
		if (s) {
			p.l = s.getScrollLeft();
			p.t = s.getScrollTop();
		}
		return p;
	},
	setScrollPosition: function(inX, inY) {
		var s = this.findScroller();
		if (s) {
			s.setScrollTop(inY);
			s.setScrollLeft(inX);
		}
	},
	setScrollPositionDirect: function(inX, inY) {
		var s = this.findScroller();
		if (s) {
			s.setScrollPositionDirect(inX, inY);
		}
	},
	toContentOffset: function(inLeft, inTop) {
		var o = this.getOffset();
		var s = this.fetchScrollPosition();
		return {left: inLeft - o.left - s.l, top: inTop - o.top - s.t};
	}
}

//* @public
enyo.kind({
	name: "enyo.BasicWebView",
	kind: enyo.Control,
	//* @protected
	mixins: [
		enyo.sizeableMixin
	],
	//* @public
	published: {
		identifier: "",
		// NOTE: WebView does not appear to load relative url's.
		url: "",
		minFontSize: 16,
		autoFit: false,
		fitRender: false,
		zoom: 1,
		enableJavascript: true,
		blockPopups: true,
		acceptCookies: true,
		redirects: [],
		accelerated: false,
		networkInterface: ""
	},
	domAttributes: {
		"tabIndex": 0
	},
	requiresDomMousedown: true,
	minZoom: 1,
	maxZoom: 4,
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
	style: "display: block",
	//style: "border: 2px solid red;",
	nodeTag: "object",
	chrome: [
		{kind: "Animator", onAnimate: "stepAnimation", onEnd: "endAnimation"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.history = [];
		this.callQueue = [];
		this.gestureEvent = {};
		this.dispatcher = enyo.dispatcher;

		this.domAttributes.type = "application/x-palm-browser";

		// set the viewport dimensions
		var w = enyo.fetchControlSize(this).w;
		var h = enyo.fetchControlSize(this).h;
		this.setAttribute("viewportwidth", w);
		this.setAttribute("viewportheight", h);

		this._mouseInInteractive = false;
		this._mouseInFlash = false;
		this._flashGestureLock = false;
	},
	destroy: function() {
		this.callQueue = null;
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		if (this.hasNode()) {
			this.transitionEndHandler = enyo.bind(this, "webkitTransitionEndHandler");
			this.node.addEventListener("webkitTransitionEnd", this.transitionEndHandler, false);
			this.node.eventListener = this;
			// FIXME: determine how best to interact with scroller;
			// here we just find the scroller containing us.
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
			this.node.connectBrowserServer();
		} catch (e) {
			// eat the exception, this is expected while browserserver
			// is starting up
		}
	},
	initView: function() {
		if (this.hasView() && !this._viewInited && this._serverConnected) {
			this.cacheBoxSize();
			this.node.setPageIdentifier(this.identifier || this.id);
			this.node.interrogateClicks(false);
			this.node.setShowClickedLink(true);
			this.node.pageFocused(true);
			this.blockPopupsChanged();
			this.acceptCookiesChanged();
			this.enableJavascriptChanged();
			this.redirectsChanged();
			this.updateViewportSize();
			this.fitRenderChanged();
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
			// adjust the zoom level based on sizing change
			var zd = s.w / this._boxSize.w;
			this.cacheBoxSize();
			this.minZoom = this.calcMinZoom();
			if (this.autoFit) {
				this.log(zd * this.zoom);
				this.setZoom(zd * this.zoom);
			}
			// since all the zooms are wrong, just clear history
			this.history = {};
			if (!this.fitRender) {
				// maintain the scroll position
				var p = this.fetchScrollPosition();
				this.setScrollPositionDirect(zd * p.l, zd * p.t);
				// FIXME sync up the scroll position with the scroller
				this.setScrollPosition(zd * p.l, zd * p.t);
			}
			this.fitRenderChanged();
			this.updateViewportSize();
		}
	},
	//* @protected
	// save our current containing box size;
	// we use this to determine if we need to resize
	cacheBoxSize: function() {
		this._boxSize = enyo.fetchControlSize(this);
	},
	//* @protected
	// this tells the adapter how big the plugin is.
	updateViewportSize: function() {
		var b = this._boxSize;
		b.h = Math.min(window.innerHeight, b.h);
		this.callBrowserAdapter("setViewportSize", [b.w, b.h]);
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
	// fits the rendering width to the control width
	fitRenderChanged: function() {
		if (this._boxSize) {
			var s = enyo.fetchControlSize(this);
			if (this.fitRender) {
				this.callBrowserAdapter("setDefaultLayoutWidth", [s.w, s.h]);
			} else {
				var h = 1024 / s.w * s.h;
				this.callBrowserAdapter("setDefaultLayoutWidth", [1024, h]);
			}
		}
	},
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
	clickHandler: function(inSender, inEvent) {
		enyo.job(this.id + "-webviewClick", enyo.bind(this, "_click", inEvent), 400);
		return true;
	},
	_click: function(inEvent) {
		var left = inEvent.centerX || inEvent.clientX || inEvent.pageX;
		var top = inEvent.centerY || inEvent.clientY || inEvent.pageY;
		var o = this.toContentOffset(left, top);
		this.callBrowserAdapter("clickAt", [o.left, o.top, 1]);
	},
	gesturestartHandler: function(inSender, inEvent) {
		if (!this._metaViewport || this._metaViewport.userScalable) {
			// capture events so we get all the gesture events even if the
			// WebView moved away
			enyo.dispatcher.capture(this);
			this.callBrowserAdapter("enableFastScaling", [true]);
			this.centeredZoomStart(inEvent);
		}
	},
	gesturechangeHandler: function(inSender, inEvent) {
		if (!this._metaViewport || this._metaViewport.userScalable) {
			// stop event to prevent scrolling
			enyo.stopEvent(inEvent);
			var gi = this.centeredZoomChange(inEvent);
			this.setZoom(gi.zoom);

			// FIXME: this special function sets the scroll position directly
			if (gi.zoom == this.getZoom()) {
				this.setScrollPositionDirect(Math.round(gi.x), Math.round(gi.y));
			}
		}
	},
	gestureendHandler: function(inSender, inEvent) {
		if (!this._metaViewport || this._metaViewport.userScalable) {
			enyo.dispatcher.release(this);

			// FIXME: allow the scroller to fix up the scroll position
			var p = this.fetchScrollPosition();
			this.setScrollPosition(p.l, p.t);
			this.callBrowserAdapter("enableFastScaling", [false]);
		}
	},
	zoomChanged: function(inOldZoom) {
		if (!(this._pageWidth && this._pageHeight)) {
			return;
		}
		var max = this.maxZoom;
		var min = this.minZoom;
		if (this._metaViewport) {
			max = this.maxZoom > this._metaViewport.maximumScale ? this._metaViewport.maximumScale : this.maxZoom;
			min = this.minZoom < this._metaViewport.minimumScale ? this._metaViewport.minimumScale : this.minZoom;
		}
		this.zoom = Math.max(min, Math.min(this.zoom, max));
		var w = Math.round(this.zoom * this._pageWidth);
		var h = Math.round(this.zoom * this._pageHeight);
		this.applyStyle("width", w + "px");
		this.applyStyle("height", h + "px");

		// FIXME: notify scroller of the size change
		var s = this.findScroller();
		if (s) {
			s.calcBoundaries();
		}
		this.doResized(w, h);
	},
	fetchDefaultZoom: function() {
		return this.autoFit ? this.minZoom : 1;
	},
	calcMinZoom: function() {
		return this._boxSize.w / this._pageWidth;
	},
	// NOTE: double click causes browser to animate zooming in to a specific page location or 
	// back out to default
	// browser adapter tells us a rect into which to zoom, but the animated zooming is handled here.
	dblclickHandler: function(inSender, inEvent) {
		enyo.job.stop(this.id + "-webviewClick");
		var left = inEvent.centerX || inEvent.clientX || inEvent.pageX;
		var top = inEvent.centerY || inEvent.clientY || inEvent.pageY;
		var o = this.toContentOffset(left, top);
		this.callBrowserAdapter("smartZoom", [o.left, o.top]);
	},
	// (browser adapter callback) after smartZoom is called
	// FIXME smart zoom doesn't look good because we're animating the scale,
	// while what we really want is to animate zooming from a box to a
	// different box
	smartZoomAreaFound: function(inLeft, inTop, inRight, inBottom, inCenterX, inCenterY, inSpotlightHandle) {
		// fit by width
		var zoom = this._boxSize.w / (inRight - inLeft + 20);
		var left;
		if (zoom == this.zoom) {
			// zoom back to default
			zoom = this.fetchDefaultZoom();
			left = 0;
		} else {
			left = (inLeft - 10) * zoom;
		}
		var top = inTop - 10;
		this.log(inSpotlightHandle);
		if (!inSpotlightHandle) {
			this.log();
			top = inCenterY * zoom - this._boxSize.h / 2;
		} else {
			// zoom in on embedded object

			var targetWidth = (inRight - inLeft);
			var targetHeight = (inBottom - inTop);

			// fit by height
			var zoom2 = this._boxSize.h / (inBottom - inTop + 20);

			if (!(targetWidth * zoom <= this._boxSize.w && targetHeight * zoom <= this._boxSize.h)) {
				// Box didn't fit in visible area when zooming
				// based on width; try zoom based on height
				if (targetWidth * zoom2 <= this._boxSize.w && targetHeight * zoom2 <= this._boxSize.h) {
					//this.log('zoom2');
					zoom = zoom2;
				}
			} // else use width-based zoom

			// center
			left = inLeft * zoom - (this._boxSize.w - zoom * targetWidth) / 2;
			top = inTop * zoom - (this._boxSize.h - zoom * targetHeight) / 2;
		}

		if (top < 0) {
			top = 0;
		}
		if (left < 0) {
			left = 0;
		}
		if (this.accelerated) {
			this.smartZoomAreaFoundAccelerated(zoom, left, top, inCenterX, inCenterY);
		} else {
			this.smartZoomAreaFoundUnaccelerated(zoom, left, top);
		}
		this._spotlight = inSpotlightHandle;
	},
	smartZoomAreaFoundUnaccelerated: function(inZoom, inLeft, inTop) {
		var s = this.fetchScrollPosition();
		this.$.animator.setDuration(500);
		this.$.animator.setTick(15);
		var steps = 500 / 15;
		this._f = {
			zoom: inZoom,
		},
		this._c = {
			zoom: this.zoom,
			left: s.l,
			top: s.t
		};
		this._s = {
			zoom: (inZoom - this._c.zoom) / steps,
			left: (inLeft - this._c.left) / steps,
			top: (inTop - this._c.top) / steps
		};
		this.callBrowserAdapter("enableFastScaling", [true]);
		this.$.animator.play(0, steps);
	},
	stepAnimation: function(inSender, inValue) {
	   var zoom = this._c.zoom + this._s.zoom * inValue;
	   var left = this._c.left + this._s.left * inValue;
	   var top = this._c.top + this._s.top * inValue;
	   this.setZoom(zoom);
	   this.setScrollPositionDirect(left, top);
	},
	endAnimation: function() {
		this.setZoom(this._f.zoom);
		this.callBrowserAdapter("enableFastScaling", [false]);

		if (this._flashGestureLock) {
			this.showFlashLockedMessage();
		}
	},
	smartZoomAreaFoundAccelerated: function(inZoom, inLeft, inTop, inCenterX, inCenterY) {
		var zx = inCenterX;
		var zy = inCenterY;
		var loffs;
		var s = this.fetchScrollPosition();
		if (inZoom == this.zoom) {
			loffs = -s.l;
		} else {
			loffs = (inLeft - s.l);
		}
		var toffs = (inTop - s.t);
		var scale = inZoom / this.zoom;
		var dx = (scale - 1) * zx - loffs;
		var dy = (scale - 1) * zy - toffs;
		//this.log(dx, dy, loffs, toffs, top, left, scale);
		this.callBrowserAdapter("enableFastScaling", [true]);
		this.addClass("enyo-webview-animate");
		this.applyStyle("-webkit-transform-origin", zx + "px " + zy + "px");
		var t = "matrix3d(";
		t += scale + ",0,0,0,";
		t += "0," + scale + ",0,0,";
		t += "0,0," + scale + ",0,"
		t += dx + "," + dy + ",0,1)";
		this.node.style.webkitTransform = t;
		this._smartZoomInfo = {
			zoom: inZoom,
			zoomChanged: inZoom != this.zoom,
			left: inLeft,
			top: inTop,
			scrollChanged: inLeft != s.l || inTop != s.t
		};
	},
	webkitTransitionEndHandler: function() {
		this.removeClass("enyo-webview-animate");
		this.applyStyle("-webkit-transform-origin", null);
		// below code is mostly hacks to get around the plugin not getting
		// window change events while it's transformed with webkit transforms
		var o = enyo.dom.calcNodeOffset(this.hasNode());
		var s = this.fetchScrollPosition();
		var z = this._smartZoomInfo;
		this.callBrowserAdapter("skipPaintHack", [z.zoomChanged, z.scrollChanged, -z.left + o.left + s.l, -z.top + o.top + s.t]);
		this.setScrollPosition(z.left, z.top);
		this.setZoom(z.zoom);
		this.callBrowserAdapter("enableFastScaling", [false]);
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
		for (var i=0, r; r=this.redirects[i]; i++) {
			this.callBrowserAdapter("addUrlRedirect", [r.regex, r.enable, r.cookie, 0]);
		}
	},
	networkInterfaceChanged: function() {
		if (this.networkInterface) {
			this.callBrowserAdapter("setNetworkInterface", [this.networkInterface]);
		}
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
	// stores zoom, scroll info in a history cache for a page being unloaded 
	storeToHistory: function() {
		var url = this.lastUrl;
		//this.log(url, this.zoom);
		if (url) {
			var history = this.fetchScrollPosition();
			history.zoom = this.zoom;
			this.history[url] = history;
			//this.log(enyo.json.stringify(this.history[url]));
		}
	},
	// restores zoom, scroll info from the history cache for a page
	// currently being loaded
	restoreFromHistory: function() {
		var history = this.fetchScrollPosition();
		history.zoom = this.fetchDefaultZoom();
		history = enyo.mixin(history, this.history[this.url]);
		//this.log(this.url, h.zoom);
		this.setZoom(history.zoom);
		if (this._scroller) {
			this._scroller.setScrollTop(history.t);
		}
	},
	getTextCaret: function() {
		this.callBrowserAdapter("getTextCaret", [enyo.hitch(this, "getTextCaretResponse")]);
	},
	getTextCaretResponse: function(inLeft, inTop, inRight, inBottom) {
		this.log(inLeft, inTop, inRight, inBottom);
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
		this.log(this.callQueue.length, "view?", this.hasView());
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
			this.flashPopup = this.createComponent({kind: "Popup", modal: true, style: "text-align:center", components: [{content: $L("Dragging works in Flash, until you<br>pinch to zoom out")}]});
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
	// (browser adapter callback): tells the page dimensions in pixels:
	// * pages with explicit dimensions or a view meta tag report size
	// based on that
	// * pages without explicit dimensions render at either 960px width or 
	// the width specified in the virtualPageWidth attribute *when* the
	// adapter node is rendered.
	pageDimensionsChanged: function(width, height) {
		// FIXME: we get a spurious call with 0, 0 which we can just ignore
		if (width == 0 && height == 0) {
			return;
		}
		this.log(width, height);
		// NOTE: setting node width/height to values other than those
		// reported scales the view display (smaller than actual makes the
		// display smaller, larger than actual makes it larger)
		this._pageWidth = width;
		this._pageHeight = height;
		//
		this.minZoom = this.calcMinZoom();
		if (this._resetScroll) {
			this._resetScroll = false;
			this.setZoom(this.fetchDefaultZoom());
			this.setScrollPosition(0, 0);
		} else {
			this.setZoom(this.zoom);
		}
	},
	// (browser adapter callback) called to scroll the page
	scrollPositionChanged: function(inLeft, inTop) {
		this.setScrollPosition(inLeft, inTop);
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
		this.storeToHistory();
		this.doLoadStarted();
		this._resetScroll = true;
		this._spotlight = false;
		this._metaViewport = null;
	},
	// (browser adapter callback) generates event that can be used to show
	// load progress
	loadProgressChanged: function(inProgress) {
		this.doLoadProgress(inProgress);
	},
	// (browser adapter callback) used to restore history and generate event
	loadStopped: function() {
		this.log();
		var s = this.fetchScrollPosition();
		this.doLoadStopped();
	},
	// (browser adapter callback) generates event
	documentLoadFinished: function() {
		this.doLoadComplete();
		this.log();
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
		var n = enyo.dom.calcNodeOffset(this.node);
		var s = this.fetchScrollPosition();
		var left = inLeft;
		var top = inTop;
		if (inLeft != 0) {
			left = inLeft + s.l - n.left * -1;
		}
		if (inTop != 0) {
			top = inTop + s.t - n.top * -1;
		}
		//this.log("(" + inLeft + "," + inTop + ") -> (" + left + "," + top + ")");
		this.setScrollPosition(left, top);
	},
	/**
	(browser adapter callback) called when found a meta viewport tag
	**/
	metaViewportSet: function(inInitialScale, inMinimumScale, inMaximumScale, inWidth, inHeight, inUserScalable) {
		this._metaViewport = {initialScale: inInitialScale, minimumScale: inMinimumScale, maximumScale: inMaximumScale, userScalable: inUserScalable};
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
		this.pageDimensionsChanged(width, height);
	},
	// (browser adapter callback) renamed to smartZoomAreaFound
	smartZoomCalculateResponseSimple: function(left, top, right, bottom, centerX, centerY, spotlightHandle) {
		this.smartZoomAreaFound(left, top, right, bottom, centerX, centerY, spotlightHandle);
	},
	// (browser adapter callback) renamed to urlTitleChanged
	titleURLChange: function(inTitle, inUrl, inCanGoBack, inCanGoForward) {
		this.urlTitleChanged(inUrl, inTitle, inCanGoBack, inCanGoForward);
	},
	// unused browser adapter callbacks:
	// (browser adapter callback) not working
	urlChange: function(inUrl, inCanGoBack, inCanGoForward) {
		this.url = inUrl;
		//this.log(inUrl);
	}
});
