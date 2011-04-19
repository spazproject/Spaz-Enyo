/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.DbPages",
	kind: "Component",
	events: {
		onQuery: "",
		onReceive: ""
	},
	statics: {
		isEOF: function(inResponse) {
			return !inResponse.handle && !inResponse.next;
		}
	},
	size: 36,
	desc: false,
	min: 9999,
	max: 0,
	create: function() {
		this.pages = [];
		this.handles = [];
		this.inherited(arguments);
	},
	reset: function(inMin) {
		var m = inMin; //this.min;
		// "&& m" term because if page 0 is in range and has no handle,
		// actual min is 0 (special 0)
		while (m <= this.max && this.handles[m] == undefined && m) {
			m++;
		}
		var h = this.handles[m];
		this.handles = [];
		if (m <= this.max) {
			enyo.vizLog && enyo.vizLog.log("DbPages: reset: retaining handle for page " + m);
			this.handles[m] = h;
		} else {
			enyo.vizLog && enyo.vizLog.log("DbPages: reset: saving no handles, returning to 'special 0' page");
			m = 0;
		}
		// NOTE: pages must be flushed somewhere else
	},
	query: function(inKey) {
		var query = {
			limit: this.size,
			desc: this.desc
		};
		if (inKey !== undefined && inKey !== null) {
			query.page = inKey;
		}
		return this.doQuery(query);
	},
	queryBack: function(inKey) {
		var query = {
			page: inKey,
			limit: this.size,
			desc: !this.desc
		};
		return this.doQuery(query);
	},
	queryResponse: function(inResponse, inRequest) {
		var query = inRequest.params.query || {};
		var reverse = query.desc != this.desc;
		/*
		if (!("page" in query) && !reverse && inResponse.next) {
			this.setHandle(1, inResponse.next);
			this.log("reverse re-querying starting page 0 ", inResponse.next);
			// special page 0 is only a starting place, query it again in reverse to get it's handle
			this.pages[0] = null;
			this.require(0);
			return;
		}
		*/
		if (inResponse.results && reverse) {
			inResponse.results.reverse();
			inResponse.handle = inResponse.next;
			delete inResponse.next;
		}
		this.receivePage(inResponse, inRequest);
	},
	receivePage: function(inResponse, inRequest) {
		var index = inRequest.index;
		//
		if (!inResponse.results.length) {
			this.pages[index] = {};
			return;
		}
		//
		this.pages[index] = {
			data: inResponse.results,
			request: inRequest
		};
		//
		// update min/max pages
		this.min = Math.min(this.min, index);
		this.max = Math.max(this.max, index);
		//
		this.setHandle(index, inResponse.handle);
		this.setHandle(index+1, inResponse.next);
		//
		this.doReceive(index);
	},
	setHandle: function(inIndex, inHandle) {
		if (inHandle == undefined) {
			return;
		}
		//
		this.handles[inIndex] = inHandle;
		//
		var p = this.pages[inIndex];
		if (p && p.pending) {
			p.inflight = true;
			this.acquireNext(inIndex, inHandle);
		}
		//
		var p = this.pages[inIndex - 1];
		if (p && p.pending) {
			p.inflight = true;
			this.acquirePrevious(inIndex - 1, inHandle);
		}
	},
	acquireNext: function(inPageIndex, inKey) {
		var request = this.query(inKey);
		this._acquire(request, inPageIndex);
	},
	acquirePrevious: function(inPageIndex, inKey) {
		var request = this.queryBack(inKey);
		this._acquire(request, inPageIndex);
	},
	_acquire: function(inQuery, inPageIndex) {
		if (inQuery) {
			inQuery.index = inPageIndex;
		}
	},
	require: function(inPage) {
		enyo.vizLog && enyo.vizLog.log("DbPages: require: " + inPage);
		// if page exists, return it
		var p = this.pages[inPage];
		if (p) {
			return p.pending ? null : p;
		}
		// otherwise, create it as pending
		p = this.pages[inPage] = {pending: true};
		// try to acquire data for page by reading forward, back, or first
		if (this.handles[inPage] !== undefined) {
			this.acquireNext(inPage, this.handles[inPage]);
		} else if (this.handles[inPage+1] !== undefined) {
			this.acquirePrevious(inPage, this.handles[inPage+1]);
		} else if (inPage == 0) {
			// we shouldn't acquire keyless page 0 (special 0) if it will be acquired in a chain
			// from previous pages
			for (var i=-1; i>=this.min; i--) {
				if (this.pages[i] && this.pages[i].inflight) {
					return;
				}
			}
			this.acquireNext(0, null);
		}
	},
	dispose: function(inPage) {
		var p = this.pages[inPage];
		if (p) {
			enyo.vizLog && enyo.vizLog.log("DbPages: dispose: page " + inPage);
			if (p.request) {
				p.request.destroy();
			}
			// update min/max pages
			if (this.min == inPage) {
				this.min++;
			}
			if (this.max == inPage) {
				this.max--;
			}
			delete this.pages[inPage];
		}
	},
	fetch: function(inIndex) {
		var page = Math.floor(inIndex / this.size);
		var p = this.pages[page];
		if (!p) {
			return undefined;
		}
		if (!p.data) {
			return undefined;
		}
		var row = inIndex - (page * this.size);
		if (inIndex < 0) {
			row -= (this.size - p.data.length);
		}
		return p.data[row] || null;
	}
});