/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
parseQuery = function(inQuery) {
	var query = {};
	var rx = /(where .*)?(orderBy .*)?/i;
	var m = inQuery.match(rx);
	//console.dir(m);
	if (m && m[1]) {
		var wm = m[1].slice(6).split(" and ");
		//console.dir(wm);
		var wmx = /(.*)([=<>%])(.*)/;
		query.where = [];
		for (var i=0, e; e=wm[i]; i++) {
			//console.log(e);
			var mm = e.match(wmx);
			if (mm) {
				//console.log(mm[1], mm[2], mm[3]);
				query.where.push({
					prop: mm[1],
					op: mm[2],
					val: enyo.json.parse(enyo.string.trim(mm[3]))
				});
			}
		}
	}
	if (m && m[2]) {
		query.orderBy = m[2].slice(8);
	}
	return query;
};