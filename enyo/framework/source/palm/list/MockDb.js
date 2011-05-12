/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.MockDb",
	kind: enyo.Service,
	components: [
		{kind: "WebService", sync: true, onSuccess: "gotData", onFailure: "failData"}
	],
	events: {
		onSuccess: "",
		onWatch: ""
	},
	methodHandlers: {
		find: "query",
		del: "del",
		put: "put",
		merge: "merge"
	},
	minLatency: 10,
	maxLatency: 200,
	create: function() {
		this.data = [];
		this.cursors = {};
		this.inherited(arguments);
		// As implemented here, we need to have the backing data
		// right away (synchronously), before any queries are performed
		// we have no facility to stack queries until this data
		// is available.
		// Mock data is only used on PalmSystem to populate a proper
		// db, so this data is not required until that feature
		// is employed.
		if (!window.PalmSystem) {
			this.getData();
		}
	},
	generateId: function(inRecord) {
		return ("00000" + enyo.irand(1e5)).slice(-5);
	},
	getData: function() {
		this.file = (this.dbKind || this.id).replace(":", "-");
		this.data = enyo.MockDb.dataSets[this.file];
		if (!this.data) {
			this.$.webService.call(null, {url: "mock/" + this.file + ".json"});
		}
	},
	failData: function(inSender, inResponse, inRequest) {
		this.log("expected mock data at:", inRequest.url);
	},
	gotData: function(inSender, inResponse, inRequest) {
		this.log("got mock data from:", inRequest.url);
		this.data = enyo.MockDb.dataSets[this.file] = inResponse.results;
		for (var i=0, r; r=this.data[i]; i++) {
			r._id = this.generateId();
		}
		//this.log(enyo.json.stringify(inResponse));
	},
	sort: function() {
		var record = this.data[0];
		if (record) {
			for (var n in record) {
				if (n) {
					break;
				}
			}
			this.data.sort(function(inA, inB) {
				var a = inA[n], b = inB[n];
				return (a < b) ? -1 : (a > b) ? 1 : 0;
			});
		}
	},
	latency: function() {
		return enyo.irand(this.maxLatency - this.minLatency) + this.minLatency;
	},
	latent: function(inMethod) {
		// simulate varying server latency
		setTimeout(enyo.bind(this, inMethod), this.latency());
	},
	query: function(inProps) {
		var query = inProps.params.query || {};
		// if we do a query with no handle, it implies the users has discarded
		// all handles and we can empty the cursors array.
		if (query.page === undefined) {
			this.cursors = {};
		}
		var start = this.cursors[query.page] || (query.desc ? this.data.length - 1 : 0);
		var end = query.limit ? start + query.limit : -1;
		var next = end;
		if (query.desc) {
			end = start;
			start = Math.max(0, start - query.limit);
			next = start;
		}
		var results = query.limit ? this.data.slice(start, end) : this.data.slice(start);
		// FIXME: we should clone these records
		if (query.desc) {
			results.reverse();
		}
		var response = {
			results: results
		};
		if (results.length == query.limit) {
			var handle;
			do {
				 handle = enyo.irand(10000) + 10000;
			} while (this.cursors[handle] !== undefined);
			this.cursors[handle] = next;
			response.next = handle;
		}
		enyo.vizLog && enyo.vizLog.log("MockDb.query: " + query.page + ": " + start + "/" + end + (query.desc ? " (desc) " : "" + " next: ") + next + " (" + handle + ")");
		var destroyed = false;
		var request = {
			params: {query: query},
			destroy: function() { destroyed = true},
			isWatch: enyo.nop
		};
		setTimeout(enyo.bind(this, function() {
			if (!destroyed) {
				this.doSuccess(response, request);
			}
		}), this.latency());
		return request;
	},
	watch: function(inCursor) {
		this.doWatch();
	},
	findById: function(inId) {
		for (var i=0, r; r=this.data[i]; i++) {
			if (r._id == inId) {
				return i;
			}
		}
		return -1;
	},
	put: function(inArgs) {
		this.latent(function() {
			for (var i=0, o=inArgs.params.objects, r; r=o[i]; i++) {
				this.data.push(r);
			}
			this.sort();
			this.watch();
		});
	},
	_merge: function(inRecord) {
		var i = this.findById(inRecord._id);
		if (i >= 0) {
			enyo.mixin(this.data[i], inRecord);
		}
	},
	merge: function(inArgs) {
		this.latent(function() {
			for (var i=0, o=inArgs.params.objects, r; r=o[i]; i++) {
				this._merge(r);
			}
			this.sort();
			this.watch();
		});
	},
	_remove: function(inId) {
		var i = this.findById(inId);
		if (i >= 0) {
			this.log(inId);
			this.data.splice(i, 1);
		}
	},
	remove: function(inRecord) {
		this._remove(inRecord._id);
	},
	del: function(inArgs) {
		this.latent(function() {
			for (var i=0, ids=inArgs.params.ids, id; id=ids[i]; i++) {
				this._remove(id);
			}
			this.watch();
		});
	}
});

enyo.kind({
	name: "enyo.DbInstaller",
	kind: enyo.Component,
	events: {
		onFailure: "",
		onSuccess: ""
	},
	components: [
		{kind: "WebService", sync: true, onSuccess: "gotData", onFailure: "failure"},
		{kind: "DbService", onFailure: "failure", components: [
			{name: "delKind", onResponse: "putKind", failure: ""},
			{name: "putKind", onSuccess: "putRecords"},
			{name: "put", onSuccess: "putSuccess"}
		]}
	],
	install: function(inDbKind, inDbOwner, inData) {
		this.dbKind = inDbKind;
		this.dbOwner = inDbOwner;
		this.$.dbService.setDbKind(inDbKind);
		this.getData();
	},
	getData: function() {
		var file = (this.dbKind || this.id).replace(":", "-");
		this.$.webService.call(null, {url: "mock/" + file + ".json"});
	},
	gotData: function(inSender, inResponse) {
		this.prepareRecords(inResponse.results);
		this.delKind();
	},
	prepareRecords: function(inData) {
		this.records = [];
		for (var i=0, d, r; d=inData[i]; i++) {
			r = enyo.clone(d);
			r._kind = this.dbKind;
			delete r._id;
			this.records.push(r);
		}
	},
	delKind: function() {
		// this.log();
		this.$.delKind.call();
	},
	putKind: function() {
		// By convention, we create an index on the name of the
		// first property of the first record
		// this.log();
		var record = this.records[0];
		for (var n in record) {
			if (n) {
				break;
			}
		}
		var index = {
			name: n + "Idx",
			props: [{
				name: n
			}]
		};
		// this.log(enyo.json.stringify(index));
		var r = this.$.putKind.call({
			owner: this.dbOwner,
			indexes: [index]
		});
		// this.log(r.json);
	},
	putRecords: function() {
		var l = this.records.length;
		for (var r = 0; r<l;) {
			var a = [];
			for (var i=0; i<10 && r<l; i++, r++) {
				a.push(this.records[r]);
			}
			this.$.put.call({objects: a});
		}
	},
	putSuccess: function(inSender, inResponse) {
		this.doSuccess();
	},
	failure: function(inSender, inResponse) {
		this.doFailure(enyo.json.stringify(inResponse));
	}
});

// backing-data cache
enyo.MockDb.dataSets = [];