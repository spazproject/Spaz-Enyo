/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.ReverseLookupService",
	kind: enyo.DbService,
	method: "find",
	dbKind: "com.palm.person:1",
	call: function(inParams, inProps) {
		inProps = inProps || {};
		var params = {query: {
			where: [{
				prop: inParams.type + ".normalizedValue",
				op: "=",
				val: inParams.address
			}]
		}};
		// forward to request so we can process results
		inProps.type = inParams.type;
		inProps.address = inParams.address;
		return this.inherited(arguments, [params, inProps]);
	},
	responseSuccess: function(inRequest) {
		inRequest.response.results = this.filterResults(inRequest.response.results, inRequest.type, inRequest.address);
		this.inherited(arguments);
	},
	filterResults: function(inResults, inType, inAddress) {
		for (var i=0, results=[], r, a; r=inResults[i]; i++) {
			a = this.filterResult(inAddress, inType, r);
			if (a) {
				results.push(a);
			}
		}
		return results;
	},
	// return the first matching address
	filterResult: function(inAddress, inType, inPerson) {
		var addresses = inPerson[inType];
		for (var i=0, a; a=addresses[i]; i++) {
			if (a.normalizedValue == inAddress) {
				return enyo.addressing.formatAddress(a, inType, inPerson);
			}
		}
	}
});
