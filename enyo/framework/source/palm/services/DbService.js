/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.PalmService">PalmService</a> with some handy features:

<li>dbKind is a DbService published property, so 'putKind' can omit 'id' and 'find' can omit 'from'.</li>
<li>Setting the inherited subscribe property also sets watch: true on 'find' and 'search' requests.</li>

Use DbService like most PalmServices:

	{name: "findDoodads", kind: "DbService", dbKind: "com.palm.doodad:1", method: "find", onSuccess: "gotDoodads"}

To call the service:

	this.$.findDoodads.call({
		query: {
			// notice that 'from' is not needed since 'dbKind' is in the component
			where: [...],
			orderBy: "name",
			limit: 10
		}
	});
*/
enyo.kind({
	name: "enyo.DbService",
	kind: enyo.PalmService,
	requestKind: "DbService.Request",
	published: {
		/** @lends enyo.DbService.prototype */
		/**
		 * {String} Db kind for this store.
		 */
		dbKind: "",
		reCallWatches: false,
		resubscribe: true
	},
	events: {
		onWatch: ""
	},
	methodHandlers: {
		putKind: "putKind",
		delKind: "delKind",
		find: "findOrSearch",
		search: "findOrSearch",
		delByQuery: "delByQuery"
	},
	service: enyo.palmServices.database,
	//* @protected
	importProps: function(inProps) {
		this.inherited(arguments);
		this.dbKind = this.dbKind || this.masterService.dbKind;
	},
	call: function(inParams, inProps) {
		inProps = inProps || {};
		// it's convenient for method handlers to know the dbKind
		inProps.dbKind = inProps.dbKind || this.dbKind || this.masterService.dbKind;
		return this.inherited(arguments, [inParams, inProps]);
	},
	makeRequestProps: function(inProps) {
		// get a mix of inProps and delegates, service, method and params.subscribe
		var p = this.inherited(arguments);
		// remove 'subscribe' property if it was assigned (DbService uses 'watch')
		delete p.params.subscribe;
		// other default properties
		var props = {
			onWatch: this.onWatch
		};
		// return combination
		return enyo.mixin(props, p);
	},
	putKind: function(inProps) {
		var params = {
			id: inProps.dbKind
		};
		inProps.params = enyo.mixin(params, inProps.params);
		return this.request(inProps);
	},
	delKind: function(inProps) {
		inProps.params = {
			id: inProps.dbKind
		};
		return this.request(inProps);
	},
	findOrSearch: function(inProps) {
		// params (sent to the service) will be at least this
		var params = {
		};
		// setup watch, inProps.subscribe has priority over this.subscribe
		if (inProps.subscribe === true || inProps.subscribe === false) {
			params.watch = inProps.subscribe;
		} else if (this.subscribe === true || this.subscribe === false) {
			params.watch = this.subscribe;
		}
		// include inProps.params
		params = enyo.mixin(params, inProps.params);
		// query will be at least this
		var query = {
			from: inProps.dbKind
		};
		// plus any inProps.params.query
		params.query = enyo.mixin(query, params.query);
		// replace old params with new decorated params
		inProps.params = params;
		// process request
		return this.request(inProps);
	},
	delByQuery: function(inProps) {
		inProps.method = "del";
		var params = inProps.params = inProps.params || {};
		params.query = enyo.mixin({from: inProps.dbKind}, params.query || {});
		return this.request(inProps);
	},
	responseWatch: function(inRequest) {
		if (this.reCallWatches) {
			enyo.call(inRequest, "reCall");
		}
		this.dispatch(this.owner, inRequest.onWatch, [inRequest.response, inRequest]);
	}
});

enyo.kind({
	name: "enyo.DbService.Request",
	kind: enyo.PalmService.Request,
	events: {
		onRequestWatch: "responseWatch"
	},
	isWatch: function(inResponse) {
		return inResponse && inResponse.fired;
	},
	processResponse: function() {
		if (this.isWatch(this.response)) {
			this.doRequestWatch(this.response);
		} else {
			this.inherited(arguments);
		}
	}
});
