/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// dependency-loader.js

(function() {
enyo.sheet = function(a) {
document.write('<link href="' + a + '" media="screen" rel="stylesheet" type="text/css" />');
}, enyo.script = function(a) {
document.write('<script src="' + a + '" type="text/javascript" onerror="console.error(\'Error loading script ' + a + "')\"></script>");
}, enyo.path = {
pattern: /\$([^\/\\]*)(\/)?/g,
rewrite: function(a) {
var b, c = a, d = function(a, c) {
b = !0;
var d = enyo.path.paths[c];
return d ? d.charAt(d.length - 1) == "/" ? d : d + "/" : "";
};
do b = !1, c = c.replace(this.pattern, d); while (b);
return c;
},
paths: {
enyo: enyo.enyoPath
}
}, enyo.paths = function(a) {
if (a) for (var b in a) enyo.path.paths[b] = a[b];
};
var a = enyo.modules = [], b = enyo.sheets = [], c = [], d = "", e = "";
enyo.depends = function(a) {
f({
index: 0,
depends: arguments || []
});
};
var f = function(a) {
if (a) while (a.index < a.depends.length) {
var b = a.depends[a.index++];
if (typeof b == "string") {
if (b && g(b, a)) return;
} else "paths" in b && enyo.paths(b.paths);
}
var d = c.pop();
d && (e = d.folder, f(d));
}, g = function(c, f) {
var g = enyo.path.rewrite(c), i = c.slice(0, 1);
e && i != "/" && i != "\\" && i != "$" && c.slice(0, 5) != "http:" && (g = e + g);
if (g.slice(-3) == "css") b.push(g), enyo.sheet(g); else if (g.slice(-2) == "js") a.push({
"package": d,
rawPath: c,
path: g
}), enyo.script(g); else {
h(g, f);
return !0;
}
}, h = function(a, b) {
var f = a.split("/"), g = f.pop(), h = f.join("/") + (f.length ? "/" : ""), i = g ? "-" : "/", j = a + i + "depends.js";
b.folder = e, g || (g = h.slice(enyo.path.paths.enyo.length, -1).replace(/[\/]/g, "-")), e = enyo.path.paths[g] = h, b.package = d = g, c.push(b), enyo.script(j);
};
})();

// kernel/lang.js

(function() {
enyo.global = this, enyo._getProp = function(a, b, c) {
var d = c || enyo.global;
for (var e = 0, f; d && (f = a[e]); e++) d = f in d ? d[f] : b ? d[f] = {} : undefined;
return d;
}, enyo.setObject = function(a, b, c) {
var d = a.split("."), e = d.pop(), f = enyo._getProp(d, !0, c);
return f && e ? f[e] = b : undefined;
}, enyo.getObject = function(a, b, c) {
return enyo._getProp(a.split("."), b, c);
}, enyo.cap = function(a) {
return a.slice(0, 1).toUpperCase() + a.slice(1);
}, enyo.isString = function(a) {
return typeof a == "string" || a instanceof String;
}, enyo.isFunction = function(a) {
return typeof a == "function";
}, enyo.isArray = function(a) {
return Object.prototype.toString.apply(a) === "[object Array]";
}, Array.isArray && (enyo.isArray = Array.isArray), enyo.indexOf = function(a, b) {
for (var c = 0, d; d = b[c]; c++) if (d == a) return c;
return -1;
}, enyo.remove = function(a, b) {
var c = enyo.indexOf(a, b);
c >= 0 && b.splice(c, 1);
}, enyo.forEach = function(a, b, c) {
var d = [];
if (a) {
var e = c || this;
for (var f = 0, g = a.length; f < g; f++) d.push(b.call(e, a[f], f, a));
}
return d;
}, enyo.map = enyo.forEach, enyo.cloneArray = function(a, b, c) {
var d = c || [];
for (var e = b || 0, f = a.length; e < f; e++) d.push(a[e]);
return d;
}, enyo._toArray = enyo.cloneArray, enyo.clone = function(a) {
return enyo.isArray(a) ? enyo.cloneArray(a) : enyo.mixin({}, a);
};
var a = {};
enyo.mixin = function(b, c) {
b = b || {};
if (c) {
var d, e, f;
for (d in c) e = c[d], a[d] !== e && (b[d] = e);
}
return b;
}, enyo._hitchArgs = function(a, b) {
var c = enyo._toArray(arguments, 2), d = enyo.isString(b);
return function() {
var e = enyo._toArray(arguments), f = d ? (a || enyo.global)[b] : b;
return f && f.apply(a || this, c.concat(e));
};
}, enyo.bind = function(a, b) {
if (arguments.length > 2) return enyo._hitchArgs.apply(enyo, arguments);
b || (b = a, a = null);
if (enyo.isString(b)) {
a = a || enyo.global;
if (!a[b]) throw [ 'enyo.bind: scope["', b, '"] is null (scope="', a, '")' ].join("");
return function() {
return a[b].apply(a, arguments || []);
};
}
return a ? function() {
return b.apply(a, arguments || []);
} : b;
}, enyo.hitch = enyo.bind, enyo.nop = function() {}, enyo.nob = {}, enyo.setPrototype || (enyo.setPrototype = function(a, b) {
a.prototype = b;
});
var b = function() {};
enyo.delegate = function(a) {
enyo.setPrototype(b, a);
var a = new b;
return a;
};
})();

// kernel/Oop.js

enyo.kind = function(a) {
enyo._kindCtors = {};
var b = a.name || "", c = a.isa || a.kind;
if (c === undefined && "kind" in a) throw "enyo.kind: Attempt to subclass an 'undefined' kind. Check dependencies for [" + b + "].";
var d = c && enyo.constructorForKind(c), e = d && d.prototype || null, f = enyo.kind.makeCtor();
delete a.name, a.hasOwnProperty("constructor") && (a._constructor = a.constructor, delete a.constructor), enyo.setPrototype(f, e ? enyo.delegate(e) : {}), enyo.mixin(f.prototype, a), f.prototype.kindName = b, f.prototype.base = d, f.prototype.ctor = f, enyo.forEach(enyo.kind.features, function(b) {
b(f, a);
}), enyo.setObject(b, f);
return f;
}, enyo.kind.makeCtor = function() {
return function() {
this._constructor && this._constructor.apply(this, arguments), this.constructed && this.constructed.apply(this, arguments);
};
}, enyo.kind.defaultNamespace = "enyo", enyo.kind.features = [], enyo.kind.features.push(function(a, b) {
var c = a.prototype;
c.inherited || (c.inherited = enyo.kind.inherited);
if (c.base) for (var d in b) {
var e = b[d];
typeof e == "function" && (e._inherited = c.base.prototype[d], e.nom = c.kindName + "." + d + "()");
}
}), enyo.kind.inherited = function(a, b) {
return a.callee._inherited.apply(this, b || a);
}, enyo.kind.features.push(function(a, b) {
enyo.mixin(a, enyo.kind.statics), b.statics && (enyo.mixin(a, b.statics), delete a.prototype.statics);
var c = a.prototype.base;
while (c) c.subclass(a, b), c = c.prototype.base;
}), enyo.kind.statics = {
subclass: function(a, b) {},
extend: function(a) {
enyo.mixin(this.prototype, a);
}
}, enyo.kind.features.push(function(a, b) {
if (b.mixins) {
var c = a.prototype;
for (var d = 0, e; e = b.mixins[d]; d++) {
var f = e;
for (var g in f) if (f.hasOwnProperty(g) && !b.hasOwnProperty(g)) {
var h = f[g];
enyo.isFunction(h) && (h + "").indexOf("inherited") >= 0 ? c[g] = enyo.kind._wrapFn(h, c, g) : c[g] = h;
}
}
}
}), enyo.kind._wrapFn = function(a, b, c) {
var d = function(a) {
return b.base.prototype[c].apply(this, a);
};
return function() {
this.inherited = d, a.apply(this, arguments), this.inherited = enyo.kind.inherited;
};
}, enyo._kindCtors = {}, enyo.constructorForKind = function(a) {
if (typeof a == "function") var b = a; else a && (b = enyo._kindCtors[a], b || (enyo._kindCtors[a] = b = enyo.Theme[a] || enyo[a] || enyo.getObject(a, !1, enyo) || window[a] || enyo.getObject(a)));
if (!b) throw "Oop.js: Failed to find a constructor for kind [" + a + "]";
return b;
}, enyo.Theme = {}, enyo.registerTheme = function(a) {
enyo.mixin(enyo.Theme, a);
};

// kernel/Object.js

enyo.kind({
name: "enyo.Object",
constructor: function() {
enyo._objectCount++;
},
destroyObject: function(a) {
this[a] && this[a].destroy && this[a].destroy(), this[a] = null;
},
getProperty: function(a) {
return this[a];
},
setProperty: function(a, b) {
var c = this.getProperty(a);
this[a] = b, this.propertyChanged && this.propertyChanged(a, b, c), a += "Changed", this[a] && this[a](c);
},
__console: function(a, b) {
window.console && (window.PalmSystem && (b = [ b.join(" ") ]), console[a] ? console[a].apply(console, b) : console.log(b));
},
_console: function(a, b) {
var c = [];
for (var d = 0, e = b.length, f; (f = b[d]) || d < e; d++) String(f) == "[object Object]" && (f = enyo.json.stringify(f)), c.push(f);
this.__console(a, [ b.callee.caller.nom + ": " ].concat(c));
},
log: function() {
this._console("log", arguments);
},
warn: function() {
this._console("warn", arguments);
},
error: function() {
this._console("error", arguments);
}
}), enyo._objectCount = 0, enyo.Object.subclass = function(a, b) {
this.publish(a, b);
}, enyo.Object.publish = function(a, b) {
var c = b.published;
if (c) {
var d = a.prototype;
for (var e in c) enyo.Object.addGetterSetter(e, c[e], d);
}
}, enyo.Object.addGetterSetter = function(a, b, c) {
var d = a;
c[d] = b;
var e = a.slice(0, 1).toUpperCase() + a.slice(1), f = "get" + e;
c[f] || (c[f] = function() {
return this.getProperty(d);
});
var g = "set" + e;
c[g] || (c[g] = function(a) {
this.setProperty(d, a);
});
};

// kernel/Component.js

enyo.kind({
name: "enyo.Component",
kind: enyo.Object,
published: {
owner: null,
name: ""
},
defaultKind: "Component",
wantsEvents: !0,
toString: function() {
return this.kindName;
},
constructor: function() {
this._componentNameMap = {}, this.inherited(arguments), this.$ = {};
},
constructed: function(a) {
this.create(a), this.ready();
},
create: function(a) {
this.importProps(a), this.ownerChanged(), this.registerEvents(), this.initComponents();
},
initComponents: function() {
this.createComponents(this.kindComponents), this.createManagedComponents(this.components);
},
ready: function() {},
destroy: function() {
this.unregisterEvents(), this.destroyComponents(), this.setOwner(null), this.destroyed = !0;
},
destroyComponents: function() {
enyo.forEach(this.getComponents(), function(a) {
a.destroy();
});
},
importProps: function(a) {
if (a) for (var b in a) this[b] = a[b];
this.owner || (this.owner = enyo.master);
},
getId: function() {
return this.id;
},
makeId: function() {
var a = "_", b = this.owner && this.owner.getId();
return this.name ? (b ? b + a : "") + this.name : "";
},
registerEvents: function() {
this.wantsEvents && (enyo.$[this.id] = this);
},
unregisterEvents: function() {
delete enyo.$[this.id];
},
ownerChanged: function(a) {
a && a.removeComponent(this), this.owner && this.owner.addComponent(this), this.id = this.makeId();
},
nameComponent: function(a) {
var b = a.kindName || "object", c = b.lastIndexOf(".");
c >= 0 && (b = b.slice(c + 1)), b = b.charAt(0).toLowerCase() + b.slice(1);
var d = this._componentNameMap[b] || 1;
for (var e; Boolean(this.$[e = b + (d > 1 ? String(d) : "")]); d++) {}
this._componentNameMap[b] = Number(d) + 1;
return a.name = e;
},
addComponent: function(a) {
var b = a.getName();
b || (b = this.nameComponent(a)), this.$[b] && this.warn('Duplicate component name "' + b + '" violates unique-name-under-owner rule, replacing existing component in the hash and continuing, but this is an error condition and should be fixed.'), this.$[b] = a;
},
removeComponent: function(a) {
delete this.$[a.getName()];
},
getComponents: function() {
var a = [];
for (var b in this.$) a.push(this.$[b]);
return a;
},
adjustComponentProps: function(a) {
this.defaultProps && enyo.mixin(a, this.defaultProps), a.kind = a.kind || a.isa || this.defaultKind, a.owner = a.owner || this;
},
getInstanceOwner: function() {
return this.owner != enyo.master ? this.owner : this;
},
createManagedComponent: function(a) {
return this.createComponent(a, {
owner: this.getInstanceOwner()
});
},
createManagedComponents: function(a) {
this.createComponents(a, {
owner: this.getInstanceOwner()
});
},
createComponent: function(a, b) {
var c = enyo.mixin(enyo.clone(b), a);
this.adjustComponentProps(c);
return enyo.Component.create(c);
},
createComponents: function(a, b) {
if (a) for (var c = 0, d; d = a[c]; c++) this.createComponent(d, b);
},
dispatch: function(a, b, c) {
var d = a && b && a[b];
if (d) {
var e = c;
d._dispatcher || (e = e ? enyo.cloneArray(e, 0, [ this ]) : [ this ]);
return d.apply(a, e || []);
}
},
dispatchIndirectly: function(a, b) {
var c = this.owner && this.owner[this[a]];
if (c) {
var d = b;
c._dispatcher || (d = d ? enyo.cloneArray(d, 0, [ this ]) : [ this ]);
return c.apply(this.owner, d || []);
}
},
dispatchDomEvent: function(a) {
var b = a.type + "Handler";
return this[b] ? this[b](a.dispatchTarget, a) : this.dispatchIndirectly("on" + a.type, arguments);
},
fire: function(a) {
var b = enyo.cloneArray(arguments, 1);
return this.dispatch(this.owner, this[a], b);
},
propertyChanged: function(a, b, c) {
if (this.owner && this.owner.forward) {
var d = this.owner.forward[a];
if (d) {
var e = (d.forward || a) + "Changed";
this.owner[e] && this.owner[e](c);
}
}
}
}), enyo.defaultCtor = enyo.Component, enyo.create = enyo.Component.create = function(a) {
if (!a.kind && "kind" in a) throw "enyo.create: Attempt to create a null kind. Check dependencies.";
var b = a.kind || a.isa || enyo.defaultCtor, c = enyo.constructorForKind(b);
c || (console.warn('no constructor found for kind "' + b + '"'), c = enyo.Component);
return new c(a);
}, enyo.Component.subclass = function(a, b) {
b.components && (a.prototype.kindComponents = b.components, delete a.prototype.components), b.events && this.publishEvents(a, b), b.forward && this.forwardProperties(a, b);
}, enyo.Component.publishEvents = function(a, b) {
var c = b.events;
if (c) {
var d = a.prototype;
for (var e in c) this.addEvent(e, c[e], d);
}
}, enyo.Component.addEvent = function(a, b, c) {
var d, e;
enyo.isString(b) ? (a.slice(0, 2) != "on" && (console.warn("enyo.Component.addEvent: event names must start with 'on'. " + c.kindName + " event '" + a + "' was auto-corrected to 'on" + a + "'."), a = "on" + a), d = b, e = "do" + enyo.cap(a.slice(2))) : (d = b.value, e = b.caller), c[a] = d, c[e] || (c[e] = function() {
return this.dispatchIndirectly(a, arguments);
}, c[e]._dispatcher = !0);
}, enyo.Component.forwardProperties = function(a, b) {
var c = b.forward;
if (c) {
var d = a.prototype;
for (var e in c) this.addForward(e, c[e], d);
}
}, enyo.Component.addForward = function(a, b, c) {
var d = a, e, f;
enyo.isString(b) ? (e = b, f = d) : (e = b.from, f = b.as || d);
var g = f.slice(0, 1).toUpperCase() + f.slice(1), h = "get" + g;
c[h] || (c[h] = function() {
return this.$[e].getProperty(d);
});
var i = "set" + g;
c[i] || (c[i] = function(a) {
this.$[e].setProperty(d, a);
});
}, enyo.$ = {}, enyo.master = new enyo.Component;

// g11n/base/javascript/g11n.js

if (!this.enyo) {
this.enyo = {};
var empty = {};
enyo.mixin = function(a, b) {
a = a || {};
if (b) {
var c, d;
for (c in b) d = b[c], empty[c] !== d && (a[c] = d);
}
return a;
};
}

enyo.g11n = function() {}, enyo.g11n._init = function _init() {
if (!enyo.g11n._initialized) {
typeof window !== "undefined" && typeof PalmSystem === "undefined" ? (enyo.g11n._platform = "browser", enyo.g11n._enyoAvailable = !0) : typeof window !== "undefined" && typeof PalmSystem !== "undefined" ? (enyo.g11n._platform = "device", enyo.g11n._enyoAvailable = !0) : (enyo.g11n._platform = "node", enyo.g11n._enyoAvailable = !1);
if (enyo.g11n._platform === "device") enyo.g11n._locale = new enyo.g11n.Locale(PalmSystem.locale), enyo.g11n._formatLocale = new enyo.g11n.Locale(enyo.g11n._locale.getLanguage() + "_" + PalmSystem.localeRegion), enyo.g11n._phoneLocale = new enyo.g11n.Locale(enyo.g11n._locale.getLanguage() + "_" + PalmSystem.phoneRegion) || enyo.g11n._formatLocale; else if (enyo.g11n._platform === "node") {
var a = MojoLoader.require({
name: "mojoservice",
version: "1.0"
}).mojoservice;
a.locale === undefined || a.region === undefined ? console.warn('Locale._init: MojoService returned no locale. Defaulting to en_us. Do you have the "globalized":true flag set in your services.json?') : (enyo.g11n._locale = new enyo.g11n.Locale(a.locale), enyo.g11n._formatLocale = new enyo.g11n.Locale(enyo.g11n._locale.getLanguage() + "_" + a.region), enyo.g11n._phoneRegion = new enyo.g11n.Locale(enyo.g11n._locale.getLanguage() + "_" + a.phoneRegion) || enyo.g11n._formatLocale);
} else if (navigator) {
var b = (navigator.language || navigator.userLanguage).replace(/-/g, "_").toLowerCase();
enyo.g11n._locale = new enyo.g11n.Locale(b), enyo.g11n._formatLocale = enyo.g11n._locale, enyo.g11n._phoneLocale = enyo.g11n._locale;
}
enyo.g11n._locale === undefined && (console.warn("enyo.g11n._init: could not find current locale, so using default of en_us."), enyo.g11n._locale = new enyo.g11n.Locale("en_us")), enyo.g11n._formatLocale === undefined && (console.warn("enyo.g11n._init: could not find current formats locale, so using default of us."), enyo.g11n._formatLocale = new enyo.g11n.Locale("en_us")), enyo.g11n._phoneLocale === undefined && (console.warn("enyo.g11n._init: could not find current phone locale, so defaulting to the same thing as the formats locale."), enyo.g11n._phoneLocale = enyo.g11n._formatLocale), enyo.g11n._sourceLocale === undefined && (enyo.g11n._sourceLocale = new enyo.g11n.Locale("en_us")), enyo.g11n._initialized = !0;
}
}, enyo.g11n.getPlatform = function getPlatform() {
enyo.g11n._platform || enyo.g11n._init();
return enyo.g11n._platform;
}, enyo.g11n.isEnyoAvailable = function isEnyoAvailable() {
enyo.g11n._enyoAvailable || enyo.g11n._init();
return enyo.g11n._enyoAvailable;
}, enyo.g11n.currentLocale = function currentLocale() {
enyo.g11n._locale || enyo.g11n._init();
return enyo.g11n._locale;
}, enyo.g11n.formatLocale = function formatLocale() {
enyo.g11n._formatLocale || enyo.g11n._init();
return enyo.g11n._formatLocale;
}, enyo.g11n.phoneLocale = function phoneLocale() {
enyo.g11n._phoneLocale || enyo.g11n._init();
return enyo.g11n._phoneLocale;
}, enyo.g11n.sourceLocale = function sourceLocale() {
enyo.g11n._sourceLocale || enyo.g11n._init();
return enyo.g11n._sourceLocale;
}, enyo.g11n.setLocale = function setLocale(a) {
a && (enyo.g11n._init(), a.uiLocale && (enyo.g11n._locale = new enyo.g11n.Locale(a.uiLocale)), a.formatLocale && (enyo.g11n._formatLocale = new enyo.g11n.Locale(a.formatLocale)), a.phoneLocale && (enyo.g11n._phoneLocale = new enyo.g11n.Locale(a.phoneLocale)), a.sourceLocale && (enyo.g11n._sourceLocale = new enyo.g11n.Locale(a.sourceLocale)), enyo.g11n._enyoAvailable && enyo.reloadG11nResources());
};

// g11n/base/javascript/fmts.js

enyo.g11n.Fmts = function Fmts(a) {
var b;
typeof a !== "undefined" && a.locale ? typeof a.locale === "string" ? this.locale = new enyo.g11n.Locale(a.locale) : this.locale = a.locale : this.locale = enyo.g11n.formatLocale(), this.dateTimeFormatHash = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/formats",
locale: this.locale,
type: "region"
}), this.dateTimeHash = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/datetime_data",
locale: this.locale
}), this.dateTimeHash || (this.dateTimeHash = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/datetime_data",
locale: enyo.g11n.currentLocale()
})), this.dateTimeHash || (this.dateTimeHash = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/datetime_data",
locale: new enyo.g11n.Locale("en_us")
}));
}, enyo.g11n.Fmts.prototype.isAmPm = function() {
typeof this.twelveHourFormat === "undefined" && (enyo.g11n.getPlatform() === "device" ? this.twelveHourFormat = PalmSystem.timeFormat === "HH12" : this.twelveHourFormat = this.dateTimeFormatHash.is12HourDefault);
return this.twelveHourFormat;
}, enyo.g11n.Fmts.prototype.isAmPmDefault = function() {
return this.dateTimeFormatHash.is12HourDefault;
}, enyo.g11n.Fmts.prototype.getFirstDayOfWeek = function() {
return this.dateTimeFormatHash.firstDayOfWeek;
}, enyo.g11n.Fmts.prototype.getDateFieldOrder = function() {
if (!this.dateTimeFormatHash) {
console.warn("Failed to load date time format hash");
return "mdy";
}
return this.dateTimeFormatHash.dateFieldOrder;
}, enyo.g11n.Fmts.prototype.getTimeFieldOrder = function() {
if (!this.dateTimeFormatHash) {
console.warn("Failed to load date time format hash");
return "hma";
}
return this.dateTimeFormatHash.timeFieldOrder;
}, enyo.g11n.Fmts.prototype.getMonthFields = function() {
return this.dateTimeHash ? this.dateTimeHash.medium.month : [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
}, enyo.g11n.Fmts.prototype.getAmCaption = function() {
if (this.dateTimeHash) return this.dateTimeHash.am;
console.error("Failed to load dateTimeHash.");
return "AM";
}, enyo.g11n.Fmts.prototype.getPmCaption = function() {
if (this.dateTimeHash) return this.dateTimeHash.pm;
console.error("Failed to load dateTimeHash.");
return "PM";
}, enyo.g11n.Fmts.prototype.getMeasurementSystem = function() {
return this.dateTimeFormatHash && this.dateTimeFormatHash.measurementSystem || "metric";
}, enyo.g11n.Fmts.prototype.getDefaultPaperSize = function() {
return this.dateTimeFormatHash && this.dateTimeFormatHash.defaultPaperSize || "A4";
}, enyo.g11n.Fmts.prototype.getDefaultPhotoSize = function() {
return this.dateTimeFormatHash && this.dateTimeFormatHash.defaultPhotoSize || "10X15CM";
}, enyo.g11n.Fmts.prototype.getDefaultTimeZone = function() {
return this.dateTimeFormatHash && this.dateTimeFormatHash.defaultTimeZone || "Europe/London";
};

// g11n/base/javascript/locale.js

enyo.g11n.Locale = function Locale(a) {
var b = a ? a.split(/_/) : [];
this.locale = a, this.language = b[0] || undefined, this.region = b[1] ? b[1].toLowerCase() : undefined, this.variant = b[2] ? b[2].toLowerCase() : undefined;
return this;
}, enyo.g11n.Locale.prototype.getLocale = function() {
return this.locale;
}, enyo.g11n.Locale.prototype.getLanguage = function() {
return this.language;
}, enyo.g11n.Locale.prototype.getRegion = function() {
return this.region;
}, enyo.g11n.Locale.prototype.getVariant = function() {
return this.variant;
}, enyo.g11n.Locale.prototype.toString = function() {
this.locale || (this.locale = this.language + "_" + this.region, this.variant && (this.locale = this.locale + "_" + this.variant));
return this.locale;
}, enyo.g11n.Locale.prototype.toISOString = function() {
var a = this.language || "";
this.region && (a += "_" + this.region.toUpperCase()), this.variant && (a += "_" + this.variant.toUpperCase());
return a;
}, enyo.g11n.Locale.prototype.isMatch = function(a) {
if (a.language && a.region) return (!this.language || this.language === a.language) && (!this.region || this.region === a.region);
if (a.language) return !this.language || this.language === a.language;
return !this.region || this.region === a.region;
}, enyo.g11n.Locale.prototype.equals = function(a) {
return this.language === a.language && this.region === a.region && this.variant === a.variant;
};

// g11n/base/javascript/loadfile.js

enyo.g11n.Utils = enyo.g11n.Utils || function() {}, enyo.g11n.Utils._fileCache = {}, enyo.g11n.Utils._setRoot = function _setRoot(a) {
return enyo.g11n.root = a || enyo.g11n.isEnyoAvailable() && enyo.fetchAppRootPath() || ".";
}, enyo.g11n.Utils._getRoot = function _getRoot() {
return enyo.g11n.root || enyo.g11n.Utils._setRoot();
}, enyo.g11n.Utils._getEnyoRoot = function _getEnyoRoot(a) {
var b, c = "";
enyo.g11n.isEnyoAvailable() ? b = enyo.makeAbsoluteUrl(window, enyo.path.rewrite("$enyo/g11n")) : a && (c = a);
var d = enyo.g11n.isEnyoAvailable() ? b : "../../../../enyo/framework/source/g11n/";
return c + d;
}, enyo.g11n.Utils._loadFile = function _loadFile(a) {
var b, c, d = enyo.g11n.getPlatform();
if (d === "node") try {
this.fs || (this.fs = IMPORTS.require("fs")), c = this.fs.readFileSync(a, "utf8"), c && (b = JSON.parse(c));
} catch (e) {
b = undefined;
} else if (d === "device") try {
c = palmGetResource(a, "const json"), typeof c === "string" ? b = JSON.parse(c) : b = c;
} catch (f) {
b = undefined;
} else try {
b = JSON.parse(enyo.xhr.request({
url: a,
sync: !0
}).responseText);
} catch (g) {}
return b;
}, enyo.g11n.Utils.getNonLocaleFile = function getNonLocaleFile(a) {
var b, c, d;
if (!a || !a.path) return undefined;
a.path.charAt(0) !== "/" ? (c = a.root || this._getRoot(), d = c + "/" + a.path) : d = a.path;
if (enyo.g11n.Utils._fileCache[d] !== undefined) b = enyo.g11n.Utils._fileCache[d].json; else {
b = enyo.g11n.Utils._loadFile(d);
if (a.cache === undefined || a.cache !== !1) enyo.g11n.Utils._fileCache[d] = {
path: d,
json: b,
locale: undefined,
timestamp: new Date
}, this.oldestStamp === undefined && (this.oldestStamp = enyo.g11n.Utils._fileCache[d].timestamp);
}
return b;
}, enyo.g11n.Utils.getJsonFile = function getJsonFile(a) {
var b, c, d, e, f, g, h, i, j;
if (!a || !a.path || !a.locale) return undefined;
d = a.path.charAt(0) !== "/" ? a.root || this._getRoot() : "", d.slice(-1) !== "/" && (d += "/"), a.path ? (e = a.path, e.slice(-1) !== "/" && (e += "/")) : e = "", e += a.prefix || "", d += e, j = d + (a.locale + "") + ".json";
if (enyo.g11n.Utils._fileCache[j] !== undefined) b = enyo.g11n.Utils._fileCache[j].json; else {
a.merge ? (a.locale.language && (c = d + a.locale.language + ".json", f = this._loadFile(c)), a.locale.region && (c = d + a.locale.language + "_" + a.locale.region + ".json", g = this._loadFile(c), a.locale.language !== a.locale.region && (c = d + a.locale.region + ".json", h = this._loadFile(c))), a.locale.variant && (c = d + a.locale.language + "_" + a.locale.region + "_" + a.locale.variant + ".json", i = this._loadFile(c)), b = this._merge([ f, h, g, i ])) : (c = d + (a.locale + "") + ".json", b = this._loadFile(c), !b && a.type !== "region" && a.locale.language && (c = d + a.locale.language + ".json", b = this._loadFile(c)), !b && a.type !== "language" && a.locale.region && (c = d + a.locale.region + ".json", b = this._loadFile(c)), !b && a.type !== "language" && a.locale.region && (c = d + "_" + a.locale.region + ".json", b = this._loadFile(c)));
if (a.cache === undefined || a.cache !== !1) enyo.g11n.Utils._fileCache[j] = {
path: j,
json: b,
locale: a.locale,
timestamp: new Date
}, this.oldestStamp === undefined && (this.oldestStamp = enyo.g11n.Utils._fileCache[j].timestamp);
}
return b;
}, enyo.g11n.Utils._merge = function _merge(a) {
var b, c, d = {};
for (b = 0, c = a.length; b < c; b++) d = enyo.mixin(d, a[b]);
return d;
}, enyo.g11n.Utils.releaseAllJsonFiles = function releaseAllJsonFiles(a, b) {
var c = new Date, d = [], e, f, g, h;
a = a || 6e4;
if (this.oldestStamp !== undefined && this.oldestStamp.getTime() + a < c.getTime()) {
e = c;
for (f in enyo.g11n.Utils._fileCache) f && enyo.g11n.Utils._fileCache[f] && (h = enyo.g11n.Utils._fileCache[f], h.locale && !b && (enyo.g11n.currentLocale().isMatch(h.locale) || enyo.g11n.formatLocale().isMatch(h.locale) || enyo.g11n.phoneLocale().isMatch(h.locale)) ? h.timestamp.getTime() < e.getTime() && (e = h.timestamp) : h.timestamp.getTime() + a < c.getTime() ? d.push(h.path) : h.timestamp.getTime() < e.getTime() && (e = h.timestamp));
this.oldestStamp = e.getTime() < c.getTime() ? e : undefined;
for (g = 0; g < d.length; g++) enyo.g11n.Utils._fileCache[d[g]] = undefined;
}
return d.length;
}, enyo.g11n.Utils._cacheSize = function _cacheSize() {
var a = 0, b;
for (b in enyo.g11n.Utils._fileCache) enyo.g11n.Utils._fileCache[b] && a++;
return a;
};

// g11n/base/javascript/template.js

enyo.g11n.Template = function(a, b) {
this.template = a, this.pattern = b || /(.?)(#\{(.*?)\})/;
}, enyo.g11n.Template.prototype._evalHelper = function(a, b) {
function g(a, c, d) {
var e = b, g, h;
a = f(a);
if (a === "\\") return c;
g = d.split("."), h = g.shift();
while (e && h) {
e = e[h], h = g.shift();
if (!h) return a + f(e) || a || "";
}
return a || "";
}
function f(a) {
return a === undefined || a === null ? "" : a;
}
var c = [], d = this.pattern, e;
if (!b || !a) return "";
while (a.length) e = a.match(d), e ? (c.push(a.slice(0, e.index)), c.push(g(e[1], e[2], e[3])), a = a.slice(e.index + e[0].length)) : (c.push(a), a = "");
return c.join("");
}, enyo.g11n.Template.prototype.evaluate = function(a) {
return this._evalHelper(this.template, a);
}, enyo.g11n.Template.prototype.formatChoice = function(a, b) {
try {
var c = this.template ? this.template.split("|") : [], d = [], e = [], f = "", g;
b = b || {};
for (g = 0; g < c.length; g++) {
var h = c[g].indexOf("#");
if (h !== -1) {
d[g] = c[g].substring(0, h), e[g] = c[g].substring(h + 1);
if (a == d[g]) return this._evalHelper(e[g], b);
d[g] === "" && (f = e[g]);
}
}
for (g = 0; g < d.length; g++) {
var i = d[g];
if (i) {
var j = i.charAt(i.length - 1), k = parseFloat(i);
if (j === "<" && a < k || j === ">" && a > k) return this._evalHelper(e[g], b);
}
}
return this._evalHelper(f, b);
} catch (l) {
console.error("formatChoice error : ", l);
return "";
}
};

// g11n/base/javascript/resources.js

$L = function(a) {
$L._resources || ($L._resources = new enyo.g11n.Resources);
return $L._resources.$L(a);
}, $L._resources = null, enyo.g11n.Resources = function(a) {
a && a.root && (this.root = typeof window !== "undefined" ? enyo.makeAbsoluteUrl(window, enyo.path.rewrite(a.root)) : a.root), this.root = this.root || enyo.g11n.Utils._getRoot(), this.resourcePath = this.root + "/resources/", a && a.locale ? this.locale = typeof a.locale === "string" ? new enyo.g11n.Locale(a.locale) : a.locale : this.locale = enyo.g11n.currentLocale(), this.localizedResourcePath = this.resourcePath + this.locale.locale + "/", this.languageResourcePath = this.resourcePath + (this.locale.language ? this.locale.language + "/" : ""), this.regionResourcePath = this.languageResourcePath + (this.locale.region ? this.locale.region + "/" : ""), this.carrierResourcePath = this.regionResourcePath + (this.locale.variant ? this.locale.variant + "/" : "");
}, enyo.g11n.Resources.prototype.getResource = function(a) {
var b;
if (this.carrierResourcePath) try {
b = enyo.g11n.Utils.getNonLocaleFile({
path: this.carrierResourcePath + a
});
} catch (c) {
b = undefined;
}
if (!b) try {
b = enyo.g11n.Utils.getNonLocaleFile({
path: this.regionResourcePath + a
});
} catch (d) {
b = undefined;
}
if (!b) try {
b = enyo.g11n.Utils.getNonLocaleFile({
path: this.languageResourcePath + a
});
} catch (e) {
b = undefined;
}
if (!b) try {
b = enyo.g11n.Utils.getNonLocaleFile({
path: this.resourcePath + "en/" + a
});
} catch (f) {
b = undefined;
}
if (!b) try {
b = enyo.g11n.Utils.getNonLocaleFile({
path: this.root + "/" + a
});
} catch (g) {
b = undefined;
}
return b;
}, enyo.g11n.Resources.prototype.$L = function(a) {
var b, c;
if (!a) return "";
if (this.locale.equals(enyo.g11n.sourceLocale())) return typeof a === "string" ? a : a.value;
this.strings || this._loadStrings(), typeof a === "string" ? (b = a, c = a) : (b = a.key, c = a.value);
if (this.strings && typeof this.strings[b] !== "undefined") return this.strings[b];
return c;
}, enyo.g11n.Resources.prototype._loadStrings = function() {
this.strings = enyo.g11n.Utils.getJsonFile({
root: this.root,
path: "resources",
locale: this.locale,
merge: !0
}), enyo.g11n.Utils.releaseAllJsonFiles();
};

// g11n/base/javascript/character.js

enyo.g11n.Char = enyo.g11n.Char || {}, enyo.g11n.Char._strTrans = function _strTrans(a, b) {
var c = "", d, e;
for (e = 0; e < a.length; e++) d = b[a.charAt(e)], c += d || a.charAt(e);
return c;
}, enyo.g11n.Char._objectIsEmpty = function(a) {
var b;
for (b in a) if (!0) return !1;
return !0;
}, enyo.g11n.Char._isIdeoLetter = function(a) {
if (a >= 19968 && a <= 40907 || a >= 63744 && a <= 64217 || a >= 13312 && a <= 19893 || a >= 12353 && a <= 12447 || a >= 12449 && a <= 12543 || a >= 65382 && a <= 65437 || a >= 12784 && a <= 12799 || a >= 12549 && a <= 12589 || a >= 12704 && a <= 12727 || a >= 12593 && a <= 12686 || a >= 65440 && a <= 65500 || a >= 44032 && a <= 55203 || a >= 40960 && a <= 42124 || a >= 4352 && a <= 4607 || a >= 43360 && a <= 43388 || a >= 55216 && a <= 55291) return !0;
return !1;
}, enyo.g11n.Char._isIdeoOther = function(a) {
if (a >= 42125 && a <= 42191 || a >= 12544 && a <= 12548 || a >= 12590 && a <= 12591 || a >= 64218 && a <= 64255 || a >= 55292 && a <= 55295 || a >= 40908 && a <= 40959 || a >= 43389 && a <= 43391 || a >= 12800 && a <= 13055 || a >= 13056 && a <= 13183 || a >= 13184 && a <= 13311 || a === 12592 || a === 12687 || a === 12448 || a === 12352 || a === 12294 || a === 12348) return !0;
return !1;
}, enyo.g11n.Char.isIdeo = function isIdeo(a) {
var b;
if (!a || a.length < 1) return !1;
b = a.charCodeAt(0);
return enyo.g11n.Char._isIdeoLetter(b) || enyo.g11n.Char._isIdeoOther(b);
}, enyo.g11n.Char.isPunct = function isPunct(a) {
var b, c;
if (!a || a.length < 1) return !1;
b = enyo.g11n.Utils.getNonLocaleFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/character_data/chartype.punct.json"
}), c = b && a.charAt(0) in b, enyo.g11n.Utils.releaseAllJsonFiles();
return c;
}, enyo.g11n.Char._space = {
9: 1,
10: 1,
11: 1,
12: 1,
13: 1,
32: 1,
133: 1,
160: 1,
5760: 1,
6158: 1,
8192: 1,
8193: 1,
8194: 1,
8195: 1,
8196: 1,
8197: 1,
8198: 1,
8199: 1,
8200: 1,
8201: 1,
8202: 1,
8232: 1,
8233: 1,
8239: 1,
8287: 1,
12288: 1
}, enyo.g11n.Char.isSpace = function isSpace(a) {
var b;
if (!a || a.length < 1) return !1;
b = a.charCodeAt(0);
return b in enyo.g11n.Char._space;
}, enyo.g11n.Char.toUpper = function toUpper(a, b) {
var c;
if (!a) return undefined;
b || (b = enyo.g11n.currentLocale()), c = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/character_data",
locale: b
});
if (!c || !c.upperMap) c = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/character_data",
locale: new enyo.g11n.Locale("en")
});
if (c && c.upperMap !== undefined) return enyo.g11n.Char._strTrans(a, c.upperMap);
enyo.g11n.Utils.releaseAllJsonFiles();
return a;
}, enyo.g11n.Char.isLetter = function isLetter(a) {
var b, c, d, e;
if (!a || a.length < 1) return !1;
b = a.charAt(0), c = a.charCodeAt(0), d = enyo.g11n.Utils.getNonLocaleFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/character_data/chartype.letter.json"
}), e = d && b in d || enyo.g11n.Char._isIdeoLetter(c), enyo.g11n.Utils.releaseAllJsonFiles();
return e;
}, enyo.g11n.Char.getIndexChars = function getIndexChars(a) {
var b, c, d, e, f = [];
a ? typeof a === "string" ? c = new enyo.g11n.Locale(a) : c = a : c = enyo.g11n.currentLocale(), enyo.g11n.Char._resources || (enyo.g11n.Char._resources = {}), enyo.g11n.Char._resources[c.locale] || (enyo.g11n.Char._resources[c.locale] = new enyo.g11n.Resources({
root: enyo.g11n.Utils._getEnyoRoot() + "/base",
locale: c
})), d = enyo.g11n.Char._resources[c.locale], b = enyo.g11n.Char._resources[c.locale].$L({
key: "indexChars",
value: "ABCDEFGHIJKLMNOPQRSTUVWXYZ#"
});
for (e = 0; e < b.length; e++) f.push(b[e]);
return f;
}, enyo.g11n.Char.getBaseString = function getBaseString(a, b) {
var c, d;
if (!a) return undefined;
b ? typeof b === "string" ? d = new enyo.g11n.Locale(b) : d = b : d = enyo.g11n.currentLocale(), c = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/character_data",
locale: d
});
if (!c || enyo.g11n.Char._objectIsEmpty(c)) c = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/character_data",
locale: new enyo.g11n.Locale("en")
});
c && c.baseChars !== undefined && (a = enyo.g11n.Char._strTrans(a, c.baseChars)), enyo.g11n.Utils.releaseAllJsonFiles();
return a;
};

// g11n/base/javascript/timezone.js

enyo.g11n._TZ = enyo.g11n._TZ || {}, enyo.g11n.TzFmt = function(a) {
this.setTZ(), a !== undefined && a.TZ !== undefined && this.setCurrentTimeZone(a.TZ), enyo.g11n.Utils.releaseAllJsonFiles();
return this;
}, enyo.g11n.TzFmt.prototype = {
toString: function() {
return this.TZ !== undefined ? this.TZ : this._TZ;
},
setTZ: function() {
var a = new Date + "", b = a.indexOf("("), c = a.indexOf(")"), d = a.slice(b + 1, c);
d !== undefined ? this.setCurrentTimeZone(d) : this.setDefaultTimeZone();
},
getCurrentTimeZone: function() {
return this.TZ !== undefined ? this.TZ : this._TZ !== undefined ? this._TZ : "unknown";
},
setCurrentTimeZone: function(a) {
this._TZ = a, this.TZ = a;
},
setDefaultTimeZone: function() {
var a = (new Date + "").match(/\(([A-Z]+)\)/);
this._TZ = a && a[1] || "PST";
}
};

// g11n/base/javascript/datetime.js

enyo.g11n.DateFmt = function(a) {
var b, c, d, e, f;
f = this, f._normalizedComponents = {
date: {
dm: "DM",
md: "DM",
my: "MY",
ym: "MY",
d: "D",
dmy: "",
dym: "",
mdy: "",
myd: "",
ydm: "",
ymd: ""
},
time: {
az: "AZ",
za: "AZ",
a: "A",
z: "Z",
"": ""
},
timeLength: {
"short": "small",
medium: "small",
"long": "big",
full: "big"
}
}, f._normalizeDateTimeFormatComponents = function(a) {
var b = a.dateComponents, c = a.timeComponents, d, e, g, h = a.time;
a.date && b && (d = f._normalizedComponents.date[b], d === undefined && (console.log("date component error: '" + b + "'"), d = "")), h && c !== undefined && (g = f._normalizedComponents.timeLength[h], g === undefined && (console.log("time format error: " + h), g = "small"), e = f._normalizedComponents.time[c], e === undefined && console.log("time component error: '" + c + "'")), a.dateComponents = d, a.timeComponents = e;
return a;
}, f._finalDateTimeFormat = function(a, b, c) {
var d = f.dateTimeFormatHash.dateTimeFormat || f.defaultFormats.dateTimeFormat;
return a && b ? f._buildDateTimeFormat(d, "dateTime", {
TIME: b,
DATE: a
}) : b || a || "M/d/yy h:mm a";
}, f._buildDateTimeFormat = function(a, b, c) {
var d, e, g = [], h = f._getTokenizedFormat(a, b), i;
for (d = 0, e = h.length; d < e && h[d] !== undefined; ++d) i = c[h[d]], i ? g.push(i) : g.push(h[d]);
return g.join("");
}, f._getDateFormat = function(a, b) {
var c = f._formatFetch(a, b.dateComponents, "Date");
if (a !== "full" && b.weekday) {
var d = f._formatFetch(b.weekday, "", "Weekday");
c = f._buildDateTimeFormat(f.dateTimeFormatHash.weekDateFormat || f.defaultFormats.weekDateFormat, "weekDate", {
WEEK: d,
DATE: c
});
}
return c;
}, f._getTimeFormat = function(a, b) {
var c = f._formatFetch(a, "", f.twelveHourFormat ? "Time12" : "Time24");
if (b.timeComponents) {
var d = "time" + b.timeComponents, e = d + "Format";
return f._buildDateTimeFormat(f.dateTimeFormatHash[e] || f.defaultFormats[e], d, {
TIME: c,
AM: "a",
ZONE: "zzz"
});
}
return c;
}, f.ParserChunks = {
full: "('[^']+'|y{2,4}|M{1,4}|d{1,2}|z{1,3}|a|h{1,2}|H{1,2}|k{1,2}|K{1,2}|E{1,4}|m{1,2}|s{1,2}|[^A-Za-z']+)?",
dateTime: "(DATE|TIME|[^A-Za-z]+|'[^']+')?",
weekDate: "(DATE|WEEK|[^A-Za-z]+|'[^']+')?",
timeA: "(TIME|AM|[^A-Za-z]+|'[^']+')?",
timeZ: "(TIME|ZONE|[^A-Za-z]+|'[^']+')?",
timeAZ: "(TIME|AM|ZONE|[^A-Za-z]+|'[^']+')?"
}, f._getTokenizedFormat = function(a, b) {
var c = b && f.ParserChunks[b] || f.ParserChunks.full, d = a.length, e = [], g, h, i = new RegExp(c, "g");
while (d > 0) {
g = i.exec(a)[0], h = g.length;
if (h === 0) return [];
e.push(g), d -= h;
}
return e;
}, f._formatFetch = function(a, b, c, d) {
switch (a) {
case "short":
case "medium":
case "long":
case "full":
case "small":
case "big":
case "default":
return f.dateTimeFormatHash[a + (b || "") + c];
default:
return a;
}
}, f._dayOffset = function(a, b) {
var c;
b = f._roundToMidnight(b), a = f._roundToMidnight(a), c = (a.getTime() - b.getTime()) / 864e5;
return c;
}, f._roundToMidnight = function(a) {
var b = a.getTime(), c = new Date;
c.setTime(b), c.setHours(0), c.setMinutes(0), c.setSeconds(0), c.setMilliseconds(0);
return c;
}, f.inputParams = a, typeof a !== "undefined" && a.locale ? typeof a.locale === "string" ? b = new enyo.g11n.Locale(a.locale) : b = a.locale : b = enyo.g11n.formatLocale(), this.locale = b, typeof a === "string" ? f.formatType = a : typeof a === "undefined" ? (a = {
format: "short"
}, f.formatType = a.format) : f.formatType = a.format, f.dateTimeHash = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/datetime_data",
locale: b
}), f.dateTimeHash || (f.dateTimeHash = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/datetime_data",
locale: new enyo.g11n.Locale("en_us")
})), f.dateTimeFormatHash = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/formats",
locale: b
}), f.rb = new enyo.g11n.Resources({
root: enyo.g11n.Utils._getEnyoRoot() + "base",
locale: b
}), typeof a === "undefined" || typeof a.twelveHourFormat === "undefined" ? typeof PalmSystem !== "undefined" ? f.twelveHourFormat = PalmSystem.timeFormat === "HH12" : f.twelveHourFormat = f.dateTimeFormatHash.is12HourDefault : f.twelveHourFormat = a.twelveHourFormat;
if (f.formatType) switch (f.formatType) {
case "short":
case "medium":
case "long":
case "full":
case "default":
f.partsLength = f.formatType, e = f._finalDateTimeFormat(f._getDateFormat(f.formatType, a), f._getTimeFormat(f.formatType, a), a);
break;
default:
e = f.formatType;
} else a = f._normalizeDateTimeFormatComponents(a), a.time && (d = f._getTimeFormat(a.time, a), f.partsLength = a.time), a.date && (c = f._getDateFormat(a.date, a), f.partsLength = a.date), e = f._finalDateTimeFormat(c, d, a);
f.tokenized = f._getTokenizedFormat(e), f.partsLength || (f.partsLength = "full");
}, enyo.g11n.DateFmt.prototype.toString = function() {
return this.tokenized.join("");
}, enyo.g11n.DateFmt.prototype.isAmPm = function() {
return this.twelveHourFormat;
}, enyo.g11n.DateFmt.prototype.isAmPmDefault = function() {
return this.dateTimeFormatHash.is12HourDefault;
}, enyo.g11n.DateFmt.prototype.getFirstDayOfWeek = function() {
return this.dateTimeHash.firstDayOfWeek;
}, enyo.g11n.DateFmt.prototype._format = function(a, b) {
var c = this, d, e = [], f, g, h, i, j, k, l, m;
l = c.dateTimeHash;
for (j = 0, k = b.length; j < k && b[j] !== undefined; j++) {
switch (b[j]) {
case "yy":
f = "", e.push((a.getFullYear() + "").substring(2));
break;
case "yyyy":
f = "", e.push(a.getFullYear());
break;
case "MMMM":
f = "long", g = "month", h = a.getMonth();
break;
case "MMM":
f = "medium", g = "month", h = a.getMonth();
break;
case "MM":
f = "short", g = "month", h = a.getMonth();
break;
case "M":
f = "single", g = "month", h = a.getMonth();
break;
case "dd":
f = "short", g = "date", h = a.getDate() - 1;
break;
case "d":
f = "single", g = "date", h = a.getDate() - 1;
break;
case "zzz":
f = "", typeof c.timezoneFmt === "undefined" && (typeof c.inputParams === "undefined" || typeof c.inputParams.TZ === "undefined" ? c.timezoneFmt = new enyo.g11n.TzFmt : c.timezoneFmt = new enyo.g11n.TzFmt(c.inputParams)), i = c.timezoneFmt.getCurrentTimeZone(), e.push(i);
break;
case "a":
f = "", a.getHours() > 11 ? e.push(l.pm) : e.push(l.am);
break;
case "K":
f = "", e.push(a.getHours() % 12);
break;
case "KK":
f = "", d = a.getHours() % 12, e.push(d < 10 ? "0" + ("" + d) : d);
break;
case "h":
f = "", d = a.getHours() % 12, e.push(d === 0 ? 12 : d);
break;
case "hh":
f = "", d = a.getHours() % 12, e.push(d === 0 ? 12 : d < 10 ? "0" + ("" + d) : d);
break;
case "H":
f = "", e.push(a.getHours());
break;
case "HH":
f = "", d = a.getHours(), e.push(d < 10 ? "0" + ("" + d) : d);
break;
case "k":
f = "", d = a.getHours() % 12, e.push(d === 0 ? 12 : d);
break;
case "kk":
f = "", d = a.getHours() % 12, e.push(d === 0 ? 12 : d < 10 ? "0" + ("" + d) : d);
break;
case "EEEE":
f = "long", g = "day", h = a.getDay();
break;
case "EEE":
f = "medium", g = "day", h = a.getDay();
break;
case "EE":
f = "short", g = "day", h = a.getDay();
break;
case "E":
f = "single", g = "day", h = a.getDay();
break;
case "mm":
case "m":
f = "";
var n = a.getMinutes();
e.push(n < 10 ? "0" + ("" + n) : n);
break;
case "ss":
case "s":
f = "";
var o = a.getSeconds();
e.push(o < 10 ? "0" + ("" + o) : o);
break;
default:
m = /'([A-Za-z]+)'/.exec(b[j]), f = "", m ? e.push(m[1]) : e.push(b[j]);
}
f && e.push(l[f][g][h]);
}
return e.join("");
}, enyo.g11n.DateFmt.prototype.format = function(a) {
var b = this;
if (typeof a !== "object" || b.tokenized === null) return undefined;
return this._format(a, b.tokenized);
}, enyo.g11n.DateFmt.prototype.formatRelativeDate = function(a, b) {
var c, d, e, f, g = this;
if (typeof a !== "object") return undefined;
typeof b === "undefined" ? (d = !1, c = new Date) : (typeof b.referenceDate !== "undefined" ? c = b.referenceDate : c = new Date, typeof b.verbosity !== "undefined" ? d = b.verbosity : d = !1), f = g._dayOffset(c, a);
switch (f) {
case 0:
return g.dateTimeHash.relative.today;
case 1:
return g.dateTimeHash.relative.yesterday;
case -1:
return g.dateTimeHash.relative.tomorrow;
default:
if (f < 7) return g.dateTimeHash.long.day[a.getDay()];
if (f < 30) {
if (d) {
e = new enyo.g11n.Template(g.dateTimeHash.relative.thisMonth);
var h = Math.floor(f / 7);
return e.formatChoice(h, {
num: h
});
}
return g.format(a);
}
if (f < 365) {
if (d) {
e = new enyo.g11n.Template(g.dateTimeHash.relative.thisYear);
var i = Math.floor(f / 30);
return e.formatChoice(i, {
num: i
});
}
return g.format(a);
}
}
}, enyo.g11n.DateFmt.prototype.formatRange = function(a, b) {
var c, d, e, f, g, h, i = this.partsLength, j = this.dateTimeHash, k = this.dateTimeFormatHash;
if (!a && !b) return "";
if (!a || !b) return this.format(a || b);
b.getTime() < a.getTime() && (c = b, b = a, a = c);
if (a.getYear() === b.getYear()) {
g = i === "short" || i === "single" ? (a.getFullYear() + "").substring(2) : a.getFullYear();
if (a.getMonth() === b.getMonth()) {
if (a.getDate() === b.getDate()) {
f = "shortTime" + (this.twelveHourFormat ? "12" : "24"), d = this._getTokenizedFormat(k[f]), f = i + "Date", e = this._getTokenizedFormat(k[f]), h = new enyo.g11n.Template(this.rb.$L({
key: "dateRangeWithinDay",
value: "#{startTime}-#{endTime}, #{date}"
}));
return h.evaluate({
startTime: this._format(a, d),
endTime: this._format(b, d),
date: this._format(a, e)
});
}
f = i + "DDate", e = this._getTokenizedFormat(k[f]), h = new enyo.g11n.Template(this.rb.$L({
key: "dateRangeWithinMonth",
value: "#{month} #{startDate}-#{endDate}, #{year}"
}));
return h.evaluate({
month: j[i].month[a.getMonth()],
startDate: this._format(a, e),
endDate: this._format(b, e),
year: g
});
}
i === "full" ? i = "long" : i === "single" && (i = "short"), f = i + "DMDate", e = this._getTokenizedFormat(k[f]), h = new enyo.g11n.Template(this.rb.$L({
key: "dateRangeWithinYear",
value: "#{start} - #{end}, #{year}"
}));
return h.evaluate({
start: this._format(a, e),
end: this._format(b, e),
year: g
});
}
if (b.getYear() - a.getYear() < 2) {
f = i + "Date", e = this._getTokenizedFormat(k[f]), h = new enyo.g11n.Template(this.rb.$L({
key: "dateRangeWithinConsecutiveYears",
value: "#{start} - #{end}"
}));
return h.evaluate({
start: this._format(a, e),
end: this._format(b, e)
});
}
i === "full" ? i = "long" : i === "single" && (i = "short"), f = i + "MYDate", e = this._getTokenizedFormat(k[f]), h = new enyo.g11n.Template(this.rb.$L({
key: "dateRangeMultipleYears",
value: "#{startMonthYear} - #{endMonthYear}"
}));
return h.evaluate({
startMonthYear: this._format(a, e),
endMonthYear: this._format(b, e)
});
};

// g11n/base/javascript/numberfmt.js

enyo.g11n.NumberFmt = function(a) {
var b, c, d, e, f, g, h;
typeof a === "number" ? this.fractionDigits = a : a && typeof a.fractionDigits === "number" && (this.fractionDigits = a.fractionDigits), a && a.locale ? typeof a.locale === "string" ? this.locale = new enyo.g11n.Locale(a.locale) : this.locale = a.locale : this.locale = enyo.g11n.formatLocale(), this.style = a && a.style || "number", b = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/formats",
locale: this.locale
}), this.style === "currency" && (d = a && a.currency || b && b.currency && b.currency.name, d ? (d = d.toUpperCase(), this.currencyStyle = a && a.currencyStyle === "iso" ? "iso" : "common", c = enyo.g11n.Utils.getNonLocaleFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/number_data/iso4217.json"
}), c ? (e = c[d], e || (f = new enyo.g11n.Locale(d), h = enyo.g11n.Utils.getJsonFile({
root: enyo.g11n.Utils._getEnyoRoot(),
path: "base/formats",
locale: f
}), h && (d = h.currency && h.currency.name, e = c[d])), e || (d = b && b.currency && b.currency.name, e = c[d]), e ? (this.sign = this.currencyStyle !== "iso" ? e.sign : d, this.fractionDigits = a && typeof a.fractionDigits === "number" ? a.fractionDigits : e.digits) : this.style = "number") : (d = b && b.currency && b.currency.name, this.sign = d)) : (d = b && b.currency && b.currency.name, this.sign = d), d ? (g = b && b.currency && b.currency[this.currencyStyle] || "#{sign} #{amt}", this.currencyTemplate = new enyo.g11n.Template(g)) : this.style = "number"), b ? (this.decimal = b.numberDecimal || ".", this.divider = b.numberDivider || ",", b.dividerIndex ? b.dividerIndex === 4 ? this.numberGroupRegex = /(\d+)(\d{4})/ : this.numberGroupRegex = /(\d+)(\d{3})/ : this.numberGroupRegex = /(\d+)(\d{3})/, this.percentageSpace = b.percentageSpace) : (this.decimal = ".", this.divider = ",", this.numberGroupRegex = /(\d+)(\d{3})/, this.percentageSpace = !1), this.numberGroupRegex.compile(this.numberGroupRegex), enyo.g11n.Utils.releaseAllJsonFiles();
}, enyo.g11n.NumberFmt.prototype.format = function(a) {
try {
var b, c, d, e;
typeof this.fractionDigits !== "undefined" ? b = a.toFixed(this.fractionDigits) : b = a + "", c = b.split("."), d = c[0];
while (this.divider && this.numberGroupRegex.test(d)) d = d.replace(this.numberGroupRegex, "$1" + this.divider + "$2");
c[0] = d, e = c.join(this.decimal), this.style === "currency" && this.currencyTemplate ? e = this.currencyTemplate.evaluate({
amt: e,
sign: this.sign
}) : this.style === "percent" && (e += this.percentageSpace ? " %" : "%");
return e;
} catch (f) {
console.log("formatNumber error : " + f);
return (a || "0") + "." + (this.fractionDigits || "");
}
};

// g11n/base/javascript/duration.js

enyo.g11n.DurationFmt = function(a) {
typeof a === "undefined" ? (this.locale = enyo.g11n.formatLocale(), this.style = "short") : (a.locale ? typeof a.locale === "string" ? this.locale = new enyo.g11n.Locale(a.locale) : this.locale = a.locale : this.locale = enyo.g11n.formatLocale(), a.style ? (this.style = a.style, this.style !== "short" && this.style !== "medium" && this.style !== "long" && this.style !== "full" && (this.style = "short")) : this.style = "short"), this.rb = new enyo.g11n.Resources({
root: enyo.g11n.Utils._getEnyoRoot() + "/base",
locale: this.locale
}), this.style === "short" ? this.parts = {
years: new enyo.g11n.Template(this.rb.$L({
key: "yearsFormatShort",
value: "##{num}y"
})),
months: new enyo.g11n.Template(this.rb.$L({
key: "monthsFormatShort",
value: "##{num}m"
})),
weeks: new enyo.g11n.Template(this.rb.$L({
key: "weeksFormatShort",
value: "##{num}w"
})),
days: new enyo.g11n.Template(this.rb.$L({
key: "daysFormatShort",
value: "##{num}d"
})),
hours: new enyo.g11n.Template(this.rb.$L({
key: "hoursFormatShort",
value: "##{num}"
})),
minutes: new enyo.g11n.Template(this.rb.$L({
key: "minutesFormatShort",
value: "##{num}"
})),
seconds: new enyo.g11n.Template(this.rb.$L({
key: "secondsFormatShort",
value: "##{num}"
})),
separator: this.rb.$L({
key: "separatorShort",
value: " "
}),
dateTimeSeparator: this.rb.$L({
key: "dateTimeSeparatorShort",
value: " "
}),
longTimeFormat: new enyo.g11n.Template(this.rb.$L({
key: "longTimeFormatShort",
value: "#{hours}:#{minutes}:#{seconds}"
})),
shortTimeFormat: new enyo.g11n.Template(this.rb.$L({
key: "shortTimeFormatShort",
value: "#{minutes}:#{seconds}"
})),
finalSeparator: ""
} : this.style === "medium" ? this.parts = {
years: new enyo.g11n.Template(this.rb.$L({
key: "yearsFormatMedium",
value: "##{num} yr"
})),
months: new enyo.g11n.Template(this.rb.$L({
key: "monthsFormatMedium",
value: "##{num} mo"
})),
weeks: new enyo.g11n.Template(this.rb.$L({
key: "weeksFormatMedium",
value: "##{num} wk"
})),
days: new enyo.g11n.Template(this.rb.$L({
key: "daysFormatMedium",
value: "##{num} dy"
})),
hours: new enyo.g11n.Template(this.rb.$L({
key: "hoursFormatMedium",
value: "##{num}"
})),
minutes: new enyo.g11n.Template(this.rb.$L({
key: "minutesFormatMedium",
value: "##{num}"
})),
seconds: new enyo.g11n.Template(this.rb.$L({
key: "secondsFormatMedium",
value: "##{num}"
})),
separator: this.rb.$L({
key: "separatorMedium",
value: " "
}),
dateTimeSeparator: this.rb.$L({
key: "dateTimeSeparatorMedium",
value: " "
}),
longTimeFormat: new enyo.g11n.Template(this.rb.$L({
key: "longTimeFormatMedium",
value: "#{hours}:#{minutes}:#{seconds}"
})),
shortTimeFormat: new enyo.g11n.Template(this.rb.$L({
key: "shortTimeFormatMedium",
value: "#{minutes}:#{seconds}"
})),
finalSeparator: ""
} : this.style === "long" ? this.parts = {
years: new enyo.g11n.Template(this.rb.$L({
key: "yearsFormatLong",
value: "1#1 yr|1>##{num} yrs"
})),
months: new enyo.g11n.Template(this.rb.$L({
key: "monthsFormatLong",
value: "1#1 mon|1>##{num} mos"
})),
weeks: new enyo.g11n.Template(this.rb.$L({
key: "weeksFormatLong",
value: "1#1 wk|1>##{num} wks"
})),
days: new enyo.g11n.Template(this.rb.$L({
key: "daysFormatLong",
value: "1#1 day|1>##{num} dys"
})),
hours: new enyo.g11n.Template(this.rb.$L({
key: "hoursFormatLong",
value: "0#|1#1 hr|1>##{num} hrs"
})),
minutes: new enyo.g11n.Template(this.rb.$L({
key: "minutesFormatLong",
value: "0#|1#1 min|1>##{num} min"
})),
seconds: new enyo.g11n.Template(this.rb.$L({
key: "secondsFormatLong",
value: "0#|1#1 sec|1>##{num} sec"
})),
separator: this.rb.$L({
key: "separatorLong",
value: " "
}),
dateTimeSeparator: this.rb.$L({
key: "dateTimeSeparatorLong",
value: " "
}),
longTimeFormat: "",
shortTimeFormat: "",
finalSeparator: ""
} : this.style === "full" && (this.parts = {
years: new enyo.g11n.Template(this.rb.$L({
key: "yearsFormatFull",
value: "1#1 year|1>##{num} years"
})),
months: new enyo.g11n.Template(this.rb.$L({
key: "monthsFormatFull",
value: "1#1 month|1>##{num} months"
})),
weeks: new enyo.g11n.Template(this.rb.$L({
key: "weeksFormatFull",
value: "1#1 week|1>##{num} weeks"
})),
days: new enyo.g11n.Template(this.rb.$L({
key: "daysFormatFull",
value: "1#1 day|1>##{num} days"
})),
hours: new enyo.g11n.Template(this.rb.$L({
key: "hoursFormatFull",
value: "0#|1#1 hour|1>##{num} hours"
})),
minutes: new enyo.g11n.Template(this.rb.$L({
key: "minutesFormatFull",
value: "0#|1#1 minute|1>##{num} minutes"
})),
seconds: new enyo.g11n.Template(this.rb.$L({
key: "secondsFormatFull",
value: "0#|1#1 second|1>##{num} seconds"
})),
separator: this.rb.$L({
key: "separatorFull",
value: ", "
}),
dateTimeSeparator: this.rb.$L({
key: "dateTimeSeparatorFull",
value: ", "
}),
longTimeFormat: "",
shortTimeFormat: "",
finalSeparator: this.rb.$L({
key: "finalSeparatorFull",
value: " and "
})
}), this.dateParts = [ "years", "months", "weeks", "days" ], this.timeParts = [ "hours", "minutes", "seconds" ];
}, enyo.g11n.DurationFmt.prototype.format = function(a) {
var b = [], c = [], d, e, f, g;
if (!a || enyo.g11n.Char._objectIsEmpty(a)) return "";
for (e = 0; e < this.dateParts.length; e++) f = a[this.dateParts[e]] || 0, f > 0 && (g = this.parts[this.dateParts[e]].formatChoice(f, {
num: f
}), g && g.length > 0 && (b.length > 0 && b.push(this.parts.separator), b.push(g)));
if (this.style === "long" || this.style === "full") for (e = 0; e < this.timeParts.length; e++) f = a[this.timeParts[e]] || 0, f > 0 && (g = this.parts[this.timeParts[e]].formatChoice(f, {
num: f
}), g && g.length > 0 && (c.length > 0 && c.push(this.parts.separator), c.push(g))); else {
var h = {}, i = a.hours ? this.parts.longTimeFormat : this.parts.shortTimeFormat;
for (e = 0; e < this.timeParts.length; e++) {
f = a[this.timeParts[e]] || 0;
if (f < 10) switch (this.timeParts[e]) {
case "minutes":
a.hours && (f = "0" + f);
break;
case "seconds":
f = "0" + f;
break;
case "hours":
}
g = this.parts[this.timeParts[e]].formatChoice(f, {
num: f
}), g && g.length > 0 && (h[this.timeParts[e]] = g);
}
c.push(i.evaluate(h));
}
d = b, d.length > 0 && c.length > 0 && d.push(this.parts.dateTimeSeparator);
for (e = 0; e < c.length; e++) d.push(c[e]);
d.length > 2 && this.style === "full" && (d[d.length - 2] = this.parts.finalSeparator);
return d.join("") || "";
};

// dom/dom.js

enyo.requiresWindow = function(a) {
a();
}, enyo.byId = function(a, b) {
return typeof a == "string" ? (b || document).getElementById(a) : a;
}, enyo.fixEvent = function(a) {
var b = a || window.event;
b.target || (b.target = b.srcElement), b.handled = enyo._stopEvent;
return b;
}, enyo._stopEvent = function() {
enyo.stopEvent(this);
}, enyo.stopEvent = function(a) {
a.stopPropagation ? (a.stopPropagation(), a.preventDefault()) : (a.keyCode = 0, a.cancelBubble = !0, a.returnValue = !1);
}, enyo.makeElement = function(a, b) {
var c = document.createElement(a);
for (var d in b) c[d] = b[d];
return c;
}, enyo.loadSheet = function(a) {
document.head.appendChild(enyo.makeElement("link", {
rel: "stylesheet",
type: "text/css",
href: a
}));
}, enyo.loadScript = function(a) {
document.head.appendChild(enyo.makeElement("script", {
type: "text/javascript",
src: a
}));
}, enyo.getCookie = function(a) {
var b = document.cookie.match(new RegExp("(?:^|; )" + a + "=([^;]*)"));
return b ? decodeURIComponent(b[1]) : undefined;
}, enyo.setCookie = function(a, b, c) {
var d = a + "=" + encodeURIComponent(b), e = c || {}, f = e.expires;
if (typeof f == "number") {
var g = new Date;
g.setTime(g.getTime() + f * 24 * 60 * 60 * 1e3), f = g;
}
f && f.toUTCString && (e.expires = f.toUTCString());
var h, i;
for (h in e) d += "; " + h, i = e[h], i !== !0 && (d += "=" + i);
document.cookie = d;
}, enyo.dom = {
getComputedStyle: function(a) {
return window.getComputedStyle(a, null);
},
getComputedStyleValue: function(a, b, c) {
var d = c || this.getComputedStyle(a);
return d.getPropertyValue(b);
},
fetchBorderExtents: function(a) {
var b = this.getComputedStyle(a, null);
return b && {
t: parseInt(b.getPropertyValue("border-top-width")),
r: parseInt(b.getPropertyValue("border-right-width")),
b: parseInt(b.getPropertyValue("border-bottom-width")),
l: parseInt(b.getPropertyValue("border-left-width"))
};
},
calcNodeOffset: function(a, b) {
var c = a, d, e, f, g = {
top: 0,
left: 0
}, h = b, i = h && h.offsetParent;
do g.top += c.offsetTop || 0, g.left += c.offsetLeft || 0, d = c.offsetParent, d && (e = enyo.dom.fetchBorderExtents(d), g.top += e.t, g.left += e.l), c = d, c && h && d == i && (f = enyo.dom.fetchBorderExtents(i), g.top -= h.offsetTop + f.t || 0, g.left -= h.offsetLeft + f.l || 0); while (c && c != i && c != h);
return g;
},
setClipboard: function(a) {
this._clipboardTextArea || (this._clipboardTextArea = document.createElement("textarea"), this._clipboardTextArea.style.cssText = "top:-1000px;position:absolute;"), this._clipboardTextArea.value = a, document.body.appendChild(this._clipboardTextArea), this._clipboardTextArea.select(), document.execCommand("cut"), this._clipboardTextArea.blur(), document.body.removeChild(this._clipboardTextArea);
},
getClipboard: function(a) {
this._clipboardTextArea || (this._clipboardTextArea = document.createElement("textarea"), this._clipboardTextArea.style.cssText = "top:-1000px;position:absolute;"), this._clipboardTextArea.value = "", document.body.appendChild(this._clipboardTextArea), this._clipboardTextArea.select(), window.PalmSystem && (PalmSystem.paste(), enyo.asyncMethod(this, function() {
a(this._clipboardTextArea.value), this._clipboardTextArea.blur(), document.body.removeChild(this._clipboardTextArea);
}));
}
};

// dom/util.js

enyo.macroize = function(a, b, c) {
var d, e, f = a, g = c || enyo.macroize.pattern, h = function(a, c) {
e = !0, d = enyo.getObject(c, !1, b);
return d === undefined || d === null ? "{$" + c + "}" : d;
}, i = 0;
do e = !1, f = f.replace(g, h); while (e && i++ < 100);
return f;
}, enyo.macroize.pattern = /{\$([^{}]*)}/g, enyo.easing = {
cubicIn: function(a) {
return Math.pow(a, 3);
},
cubicOut: function(a) {
return Math.pow(a - 1, 3) + 1;
},
expoOut: function(a) {
return a == 1 ? 1 : -1 * Math.pow(2, -10 * a) + 1;
},
quadInOut: function(a) {
a = a * 2;
if (a < 1) return Math.pow(a, 2) / 2;
return -1 * (--a * (a - 2) - 1) / 2;
},
linear: function(a) {
return a;
}
}, enyo.easedLerp = function(a, b, c) {
var d = ((new Date).getTime() - a) / b;
return d >= 1 ? 1 : c(d);
}, enyo.objectToQuery = function(a) {
var b = encodeURIComponent, c = [], d = {};
for (var e in a) {
var f = a[e];
if (f != d[e]) {
var g = b(e) + "=";
if (enyo.isArray(f)) for (var h = 0; h < f.length; h++) c.push(g + b(f[h])); else c.push(g + b(f));
}
}
return c.join("&");
}, enyo.irand = function(a) {
return Math.floor(Math.random() * a);
}, enyo.call = function(a, b, c) {
if (a && b) {
var d = a[b];
if (d && d.apply) return d.apply(a, c || []);
}
}, enyo.asyncMethod = function(a, b) {
return setTimeout(enyo.bind.apply(enyo, arguments), 1);
}, enyo.nextTick = function(a, b) {
return setTimeout(enyo.bind.apply(enyo, arguments), 1);
}, window.postMessage && function() {
function c(b) {
b.source === window && b.data === "~~~enyo-nextTick~~~" && (b.stopPropagation && b.stopPropagation(), a.shift()());
}
function b(b, c) {
a.push(enyo.bind.apply(enyo, arguments)), window.postMessage("~~~enyo-nextTick~~~", "*");
}
var a = [];
enyo.nextTick = b, enyo.requiresWindow(function() {
window.addEventListener("message", c, !0);
});
}(), enyo.job = function(a, b, c) {
enyo.job.stop(a), enyo.job._jobs[a] = setTimeout(function() {
enyo.job.stop(a), b();
}, c);
}, enyo.job.stop = function(a) {
enyo.job._jobs[a] && (clearTimeout(enyo.job._jobs[a]), delete enyo.job._jobs[a]);
}, function() {
var a = window.webkitRequestAnimationFrame;
enyo.requestAnimationFrame = a ? enyo.bind(window, a) : function(a) {
return window.setTimeout(a, Math.round(1e3 / 60));
};
var a = window.webkitCancelRequestAnimationFrame || window.clearTimeout;
enyo.cancelRequestAnimationFrame = enyo.bind(window, a);
}(), enyo.time = function(a) {
enyo.time.timers[a] = (new Date).getTime(), enyo.time.lastTimer = a;
}, enyo.timeEnd = function(a) {
var b = a || enyo.time.lastTimer, c = enyo.time.timers[b] ? (new Date).getTime() - enyo.time.timers[b] : 0;
return enyo.time.timed[b] = c;
}, enyo.time.timers = {}, enyo.time.timed = {}, enyo.job._jobs = {}, enyo.string = {
trim: function(a) {
return a.replace(/^\s+|\s+$/g, "");
},
stripQuotes: function(a) {
var b = a.charAt(0);
if (b == '"' || b == "'") a = a.substring(1);
var c = a.length - 1, d = a.charAt(c);
if (d == '"' || d == "'") a = a.substr(0, c);
return a;
},
applyFilterHighlight: function(a, b, c) {
return a.replace(new RegExp(b, "i"), '<span class="' + c + '">$&</span>');
},
escapeHtml: function(a) {
return a ? a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
},
removeHtml: function(a) {
this.div || (this.div = document.createElement("div")), this.div.innerHTML = a;
return this.div.innerText;
},
runTextIndexer: function(a, b) {
if (a === "") return a;
if (typeof PalmSystem !== "undefined" && PalmSystem.runTextIndexer) return PalmSystem.runTextIndexer(a, b);
console.warn("enyo.string.runTextIndexer is not available on your system");
return a;
},
toBase64: function(a) {
return window.btoa(a);
},
fromBase64: function(a) {
return window.atob(a);
}
};

if (!window.btoa || !window.atob) enyo.string.toBase64 = enyo.string.fromBase64 = function(a) {
console.error("Your browser does not support native base64 operations");
return a;
};

enyo.makeAbsoluteUrl = function(a, b) {
var c = new RegExp("^([a-z]+:/)?/");
if (c.test(b)) return b;
var d = a.location.href.split("/");
d.pop(), d.push(b);
return d.join("/");
}, enyo._$L = function(a) {
this._enyoG11nResources || (this._enyoG11nResources = new enyo.g11n.Resources({
root: "$enyo"
}));
return this._enyoG11nResources.$L(a);
}, enyo.reloadG11nResources = function() {
this._enyoG11nResources = new enyo.g11n.Resources({
root: "$enyo"
});
}, enyo.getVisibleControlBounds = function(a) {
var b = enyo.mixin(a.getBounds(), a.getOffset()), c = b.top + b.height, d = enyo.getVisibleBounds().height;
b.height -= Math.max(0, c - d);
return b;
}, enyo.getVisibleBounds = function() {
return {
width: window.innerWidth,
height: window.innerHeight
};
};

// dom/json.js

enyo.json = {
tab: "  ",
_block: function(a, b) {
a = a.join(",\n");
var c = a ? "\n" + a + "\n" + b : "";
return c;
},
obj: function(a, b) {
var c = [], d, e;
for (var f in a) e = a[f], f == "isa" && e.prototype ? e = e.prototype.kindName : e = this.value(e, b + this.tab), d = b + this.tab + '"' + f + '": ' + e, c.push(d);
return "{" + this._block(c, b) + "}";
},
array: function(a, b) {
var c = [], d;
for (var e = 0, f = a.length; e < f; e++) d = b + this.tab + this.value(a[e], b + this.tab), c.push(d);
return "[" + this._block(c, b) + "]";
},
value: function(a, b) {
var c = a === null || a === undefined ? "" : typeof a;
switch (c) {
case "string":
a = a.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\"/g, '\\"');
return '"' + a + '"';
case "function":
var d = a + "";
d = d.replace(/\n*\r/g, "\n"), d = d.replace(/(^\.\.\.\.)|[\.\t]+(\.\.\.\.)/g, "\t"), d = d.split("\n");
return d.join("\n" + b);
case "object":
return enyo.isArray(a) ? this.array(a, b) : this.obj(a, b);
default:
return a;
}
},
to: function(a) {
return this.value(a, "");
},
from: function(inJson) {
return eval("(" + inJson + ")");
},
stringify: function(a) {},
parse: function(a) {}
}, window.JSON && (enyo.json.stringify = window.JSON ? JSON.stringify : enyo.json.to, enyo.json.parse = window.JSON ? JSON.parse : enyo.json.from);

// dom/xhr.js

enyo.xhr = {
request: function(a) {
var b = this.getXMLHttpRequest(), c = a.method || "GET", d = "sync" in a ? !a.sync : !0;
a.username ? b.open(c, enyo.path.rewrite(a.url), d, a.username, a.password) : b.open(c, enyo.path.rewrite(a.url), d), this.makeReadyStateHandler(b, a.callback);
if (a.headers) for (var e in a.headers) b.setRequestHeader(e, a.headers[e]);
b.send(a.body || null), d || b.onreadystatechange(b);
return b;
},
getXMLHttpRequest: function() {
try {
return new XMLHttpRequest;
} catch (a) {}
try {
return new ActiveXObject("Msxml2.XMLHTTP");
} catch (a) {}
try {
return new ActiveXObject("Microsoft.XMLHTTP");
} catch (a) {}
return null;
},
makeReadyStateHandler: function(a, b) {
a.onreadystatechange = function() {
a.readyState == 4 && (b && b.apply(null, [ a.responseText, a ]));
};
}
}, enyo.xhrGet = function(a) {
a.callback = a.load, enyo.xhr.request(a);
}, enyo.xhrPost = function(a) {
a.callback = a.load, a.method = "POST", enyo.xhr.request(a);
};

// dom/Animation.js

enyo.kind({
name: "enyo.Animation",
duration: 350,
tick: 10,
start: 0,
end: 100,
repeat: 0,
easingFunc: enyo.easing.linear,
constructed: function(a) {
enyo.mixin(this, a);
},
play: function() {
this.easingFunc = this.easingFunc || enyo.easing.linear, this.repeated = 0, this.value = this.start, this.animating && this.stop(), enyo.call(this, "onBegin", [ this.start, this.end ]), this.t0 = this.t1 = Date.now(), this.animating = setInterval(enyo.hitch(this, "animate"), this.tick), this._stepFunction = enyo.bind(this, "stepFunction"), this.animate();
return this;
},
stepFunction: function(a) {
return this.easingFunc(a, this);
},
stop: function() {
if (this.animating) {
clearInterval(this.animating), this.animating = null, enyo.call(this, "onStop", [ this.value, this.start, this.end ]);
return this;
}
},
animate: function() {
var a = Date.now();
this.dt = a - this.t1, this.t1 = a;
var b = this.shouldEnd();
b && this.shouldLoop() && (this.loop(), b = !1);
var c = enyo.easedLerp(this.t0, this.duration, this._stepFunction);
this.value = this.start + c * (this.end - this.start), b ? (enyo.call(this, "onAnimate", [ this.end, 1 ]), this.stop(), enyo.call(this, "onEnd", [ this.end ])) : enyo.call(this, "onAnimate", [ this.value, c ]);
},
shouldEnd: function() {
return this.t1 - this.t0 >= this.duration;
},
shouldLoop: function() {
return this.repeat < 0 || this.repeated < this.repeat;
},
loop: function() {
this.t0 = this.t1 = Date.now(), this.repeated++;
}
}), enyo.kind({
name: "enyo.Animator",
kind: enyo.Component,
published: {
duration: 350,
tick: 10,
repeat: 0,
easingFunc: enyo.easing.cubicOut
},
events: {
onBegin: "",
onAnimate: "",
onStop: "",
onEnd: ""
},
play: function(a, b) {
this.stop(), this._animation = new enyo.Animation({
duration: this.duration,
tick: this.tick,
repeat: this.repeat,
easingFunc: this.easingFunc,
start: a,
end: b,
onBegin: enyo.hitch(this, "doBegin"),
onAnimate: enyo.hitch(this, "doAnimate"),
onStop: enyo.hitch(this, "doStop"),
onEnd: enyo.hitch(this, "doEnd")
}), this._animation.play();
},
stop: function() {
this._animation && this._animation.stop();
},
isAnimating: function() {
return this._animation && this._animation.animating;
}
});

// dom/Dispatcher.js

enyo.$ = {}, enyo.dispatcher = {
handlerName: "dispatchDomEvent",
captureHandlerName: "captureDomEvent",
mouseOverOutEvents: {
mouseover: 1,
mouseout: 1
},
events: [ "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "click", "dblclick", "change", "keydown", "keyup", "keypress", "input" ],
windowEvents: [ "resize", "load", "unload" ],
connect: function() {
var a = enyo.dispatcher;
for (var b = 0, c; c = a.events[b]; b++) document.addEventListener(c, enyo.dispatch, !1);
for (b = 0, c; c = a.windowEvents[b]; b++) window.addEventListener(c, enyo.dispatch, !1);
},
findDispatchTarget: function(a) {
var b, c = a;
try {
while (c) {
if (b = enyo.$[c.id]) {
b.eventNode = c;
break;
}
c = c.parentNode;
}
} catch (d) {
console.log(d, c);
}
return b;
},
findDefaultTarget: function(a) {
return enyo.master.getComponents()[0];
},
dispatch: function(a) {
var b = this.findDispatchTarget(a.target) || this.findDefaultTarget(a);
a.dispatchTarget = b;
var c;
for (var d = 0, e; c = this.features[d]; d++) if (c.call(this, a)) return !0;
b = a.filterTarget || b;
if (b) {
a.filterTarget || this.dispatchCapture(a, b);
var f = this.dispatchBubble(a, b);
a.forward && (f = this.forward(a));
}
},
forward: function(a) {
var b = a.dispatchTarget;
return b && this.dispatchBubble(a, b);
},
dispatchCapture: function(a, b) {
var c = this.buildAncestorList(a.target);
for (var d = c.length - 1, e; e = c[d]; d--) if (this.dispatchToCaptureTarget(a, e) === !0) return !0;
},
buildAncestorList: function(a) {
var b = [], c = a, d;
while (c) d = enyo.$[c.id], d && b.push(d), c = c.parentNode;
return b;
},
dispatchToCaptureTarget: function(a, b) {
var c = this.captureHandlerName;
if (b[c]) {
if (b[c](a) !== !0) return !1;
return !0;
}
},
dispatchBubble: function(a, b) {
a.stopPropagation = function() {
this._handled = !0;
};
while (b) {
if (this.dispatchToTarget(a, b) === !0) return !0;
b = b.parent || b.manager || b.owner;
}
return !1;
},
dispatchToTarget: function(a, b) {
if (this.handleMouseOverOut(a, b)) return !0;
var c = this.handlerName;
if (b[c]) {
if (b[c](a) !== !0 && !a._handled) return !1;
a.handler = b;
return !0;
}
},
handleMouseOverOut: function(a, b) {
if (this.mouseOverOutEvents[a.type]) if (this.isInternalMouseOverOut(a, b)) return !0;
},
isInternalMouseOverOut: function(a, b) {
var c = b.eventNode, d = this.findDispatchTarget(a.relatedTarget);
if (b == d && c != b.eventNode) {
b.eventNode = c;
return !1;
}
return d && d.isDescendantOf(b);
}
}, enyo.dispatch = function(a) {
return enyo.dispatcher.dispatch(enyo.fixEvent(a));
}, enyo.bubble = function(a) {
a && enyo.dispatch(a);
}, enyo.bubbler = "enyo.bubble(arguments[0])", enyo.requiresWindow(enyo.dispatcher.connect), enyo.dispatcher.features = [], enyo.dispatcher.captureFeature = {
noCaptureEvents: {
load: 1,
error: 1
},
autoForwardEvents: {
mouseout: 1
},
captures: [],
capture: function(a, b) {
this.captureTarget && this.captures.push(this.captureTarget), this.captureTarget = a, this.forwardEvents = b;
},
release: function() {
this.captureTarget = this.captures.pop();
}
}, enyo.mixin(enyo.dispatcher, enyo.dispatcher.captureFeature), enyo.dispatcher.features.push(function(a) {
var b = a.dispatchTarget;
if (this.captureTarget && !this.noCaptureEvents[a.type]) if (!b || !b.isDescendantOf(this.captureTarget)) a.filterTarget = this.captureTarget, a.forward = this.autoForwardEvents[a.type] || this.forwardEvents;
}), enyo.dispatcher.keyEvents = {
keydown: 1,
keyup: 1,
keypress: 1
}, enyo.dispatcher.features.push(function(a) {
this.keyWatcher && this.keyEvents[a.type] && this.dispatchToTarget(a, this.keyWatcher);
});

// dom/Gesture.js

enyo.dispatcher.features.push(function(a) {
if (enyo.gesture[a.type]) return enyo.gesture[a.type](a);
}), enyo.gesture = {
hysteresis: 4,
holdDelay: 200,
pulseInterval: 100,
keyup: function(a) {
a.keyCode == 27 && enyo.dispatch({
type: "back",
target: null,
preventDefault: function() {
a.preventDefault();
}
});
},
focusNode: function(a) {
document.activeElement != a && (document.activeElement.blur(), a && a.focus());
},
requiresDomMousedown: function(a) {
return a.dispatchTarget.requiresDomMousedown;
},
mousedown: function(a) {
if (!a.synthetic) {
this.target = a.target, this.dispatchTarget = a.dispatchTarget;
var b = !this.requiresDomMousedown(a);
b && this.sendCustomMousedown(a), this.startTracking(a), this.startMousehold(a);
return b;
}
},
sendCustomMousedown: function(a) {
a.preventDefault(), a.preventDefault = function() {
a.prevented = !0;
}, a.synthetic = !0, enyo.dispatch(a), a.prevented || this.focusNode(a.target);
},
mousemove: function(a) {
this.tracking && (this.dx = a.pageX - this.px0, this.dy = a.pageY - this.py0, this.dragEvent ? this.sendDrag(a) : Math.sqrt(this.dy * this.dy + this.dx * this.dx) >= this.hysteresis && (this.sendDragStart(a), this.stopMousehold()));
},
mouseout: function(a) {
this.dragEvent && this.sendDragOut(a);
},
mouseup: function(a) {
if (!a.synthetic) {
this.stopTracking(), this.didDrag = this.stopDragging(a), this.stopMousehold(), a.synthetic = !0, enyo.dispatch(a), this.didDrag || this.sendCustomClick(a);
return !0;
}
},
click: function(a) {
return this.didDrag;
},
sendCustomClick: function(a) {
if (this.target !== a.target) {
var b = this._findCommonAncestor(this.dispatchTarget, a.dispatchTarget);
b && this.send("click", a, {
synthetic: !0,
target: b.hasNode()
});
}
},
_findCommonAncestor: function(a, b) {
var c = b;
while (c) {
if (a.isDescendantOf(c)) return c;
c = c.parent;
}
},
stopDragging: function(a) {
if (this.dragEvent) {
this.sendDrop(a);
var b = this.sendDragFinish(a);
this.dragEvent = null;
return b;
}
},
makeDragEvent: function(a, b, c, d) {
var e = Math.abs(this.dx) > Math.abs(this.dy);
return {
type: a,
dx: this.dx,
dy: this.dy,
pageX: c.pageX,
pageY: c.pageY,
horizontal: e,
vertical: !e,
target: b,
dragInfo: d
};
},
sendDragStart: function(a) {
this.dragEvent = this.makeDragEvent("dragstart", this.target, a), enyo.dispatch(this.dragEvent);
},
sendDrag: function(a) {
var b = this.makeDragEvent("dragover", a.target, a, this.dragEvent.dragInfo);
enyo.dispatch(b), b.type = "drag", b.target = this.dragEvent.target, enyo.dispatch(b);
},
sendDragFinish: function(a) {
var b = this.makeDragEvent("dragfinish", this.dragEvent.target, a, this.dragEvent.dragInfo);
b.preventClick = function() {
this._preventClick = !0;
}, enyo.dispatch(b);
return b._preventClick;
},
sendDragOut: function(a) {
var b = this.makeDragEvent("dragout", a.target, a, this.dragEvent.dragInfo);
enyo.dispatch(b);
},
sendDrop: function(a) {
var b = this.makeDragEvent("drop", a.target, a, this.dragEvent.dragInfo);
enyo.dispatch(b);
},
startTracking: function(a) {
this.tracking = !0, this.px0 = a.pageX, this.py0 = a.pageY;
},
stopTracking: function() {
this.tracking = !1;
},
startMousehold: function(a) {
if (this.holdpulseJob) throw "re-entrant startMousehold";
var b = {
type: "mousehold",
target: a.target,
holdStart: (new Date).getTime(),
clientX: a.clientX,
clientY: a.clientY,
pageX: a.pageX,
pageY: a.pageY
};
enyo.job("enyo.gesture.mousehold", enyo.bind(this, "sendMousehold", b), this.holdDelay);
},
sendMousehold: function(a) {
enyo.dispatch(a), this.startMouseholdPulse(a);
},
startMouseholdPulse: function(a) {
a.type = "mouseholdpulse", this.holdpulseJob = setInterval(enyo.bind(this, "sendMouseholdPulse", a), this.pulseInterval);
},
sendMouseholdPulse: function(a) {
a.holdTime = (new Date).getTime() - a.holdStart, enyo.dispatch(a);
},
stopMousehold: function(a) {
enyo.job.stop("enyo.gesture.mousehold"), this.holdpulseJob && (clearInterval(this.holdpulseJob), this.holdpulseJob = 0, this.sendMouseRelease(a));
},
sendMouseRelease: function(a) {
this.send("mouserelease", a);
},
send: function(a, b, c) {
var d = {
type: a,
pageX: b && b.pageX,
pageY: b && b.pageY,
target: this.target,
preventDefault: enyo.nop
};
enyo.mixin(d, c), enyo.dispatch(d);
return d;
}
};

// dom/Drag.js

enyo.kind({
name: "enyo.Drag",
kind: enyo.Component,
events: {
onDrag: "drag",
onDrop: "dragDrop",
onFinish: "dragFinish"
},
mode: 0,
constructor: function() {
this.dispatcher = enyo.dispatcher;
},
start: function(a) {
this.dispatcher.capture(this), this.dragging = !0, a && (this.starting = !0, this.track(a));
},
track: function(a) {
this.px = a.pageX, this.py = a.pageY, this.starting && (this.px0 = this.px, this.py0 = this.py, this.starting = !1), this.dx = this.dpx = this.px - this.px0, this.dy = this.dpy = this.py - this.py0;
},
mousemoveHandler: function(a, b) {
this.track(b), this.drag(b);
return !0;
},
mouseupHandler: function(a, b) {
this.drop(b), this.finish();
return !0;
},
drag: function(a) {
this.doDrag(a);
},
drop: function(a) {
this.doDrop(a);
},
finish: function() {
this.dragging = !1, this.dispatcher.release(this), this.dispatcher.squelchNextClick(), this.doFinish();
}
});

// dom/DomNode.js

enyo.kind({
name: "enyo.DomNode",
kind: enyo.Component,
published: {
showing: !0,
prepend: !1
},
node: null,
create: function() {
this.inherited(arguments), this.showingChanged();
},
destroy: function() {
this._remove(), this.inherited(arguments);
},
_append: function() {
if (this.node) {
var a = this.getParentNode();
a && a.appendChild(this.node);
}
},
_prepend: function() {
if (this.node) {
var a = this.getParentNode();
a && a.insertBefore(this.node, a.firstChild);
}
},
_insert: function(a) {
if (this.node) {
var b = this.getParentNode();
b && b.insertBefore(this.node, a);
}
},
_remove: function() {
this.hasNode() && this.node.parentNode && this.node.parentNode.removeChild(this.node);
},
addToParentNode: function() {
this.prepend ? this._prepend() : this._append();
},
setNode: function(a) {
this.node = a;
},
createNode: function() {
this.node = document.createElement(this.nodeTag), this.addToParentNode();
},
findNodeById: function() {
return this.id && (this.node = enyo.byId(this.id));
},
hasNode: function() {
return this.node || this.id && this.findNodeById();
},
getParentNode: function() {
return enyo.byId(this.parentNode);
},
setParentNode: function(a) {
a || this._remove(), this.parentNode = a, this._append();
},
appendChildNode: function(a) {
a && this.hasNode() && this.node.appendChild(a);
},
insertNodeAt: function(a, b) {
var c = this.node.childNodes[b];
this.node.insertBefore(a, c);
},
getBounds: function() {
var a = this.node || this.hasNode() || 0;
return {
left: a.offsetLeft,
top: a.offsetTop,
width: a.offsetWidth,
height: a.offsetHeight
};
},
addCssText: function(a) {
var b = a.replace(/; /g, ";").split(";");
for (var c = 0, d, e, f; d = b[c]; c++) d = d.split(":"), e = d.shift(), f = d.length > 1 ? d.join(":") : d[0], this.domStyles[e] = f;
},
setDomStyles: function(a) {
this.domStyles = a, this.domStylesChanged();
},
domStylesChanged: function() {
this.hasNode() && this.stylesToNode(this.domStyles);
},
addStyles: function(a) {
this.addCssText(a), this.domStylesChanged();
},
applyStyle: function(a, b) {
this.domStyles[a] = b, this.domStylesChanged();
},
setStyle: function(a) {
this.domStyles = {}, this.addStyles(a);
},
show: function() {
this.setShowing(!0);
},
hide: function() {
this.setShowing(!1);
},
showingChanged: function() {
var a = this.domStyles;
this.showing ? a.display == "none" && (a.display = this._displayStyle || "") : (this._displayStyle = a.display == "none" ? "" : a.display, a.display = "none"), this.hasNode() && (this.node.style.display = a.display);
},
setClassName: function(a) {
this.setAttribute("className", a);
},
getClassName: function() {
return this.domAttributes.className || "";
},
hasClass: function(a) {
return a && (" " + this.getClassName() + " ").indexOf(" " + a + " ") >= 0;
},
addClass: function(a) {
if (a && !this.hasClass(a)) {
var b = this.getClassName();
this.setClassName(b + (b ? " " : "") + a);
}
},
removeClass: function(a) {
if (a && this.hasClass(a)) {
var b = this.getClassName();
b = (" " + b + " ").replace(" " + a + " ", " ").slice(1, -1), this.setClassName(b);
}
},
addRemoveClass: function(a, b) {
this[b ? "addClass" : "removeClass"](a);
},
setAttribute: function(a, b) {
this.domAttributes[a] = b, this.hasNode() && this.attributeToNode(a, b);
},
attributeToNode: function(a, b) {
a == "className" && (a = "class"), b === null ? this.node.removeAttribute(a) : this.node.setAttribute(a, b);
},
attributesToNode: function(a) {
for (var b in a) this.attributeToNode(b, a[b]);
},
stylesToNode: function(a) {
this.node.style.cssText = enyo.stylesToHtml(a);
},
setBox: function(a, b) {
var c = this.domStyles, d = b || "px";
"w" in a && a.w >= 0 && (c.width = a.w + d), "h" in a && a.h >= 0 && (c.height = a.h + d), a.l !== undefined && (c.left = a.l + d), a.t !== undefined && (c.top = a.t + d), a.r !== undefined && (c.right = a.r + d), a.b !== undefined && (c.bottom = a.b + d);
},
boxToNode: function(a) {
var b = this.node.style, c = "px";
"w" in a && a.w >= 0 && (b.width = a.w + c), "h" in a && a.h >= 0 && (b.height = a.h + c), a.l !== undefined && (b.left = a.l + c), a.t !== undefined && (b.top = a.t + c);
}
});

// dom/DomNodeBuilder.js

enyo.kind({
name: "enyo.AbstractDomNodeBuilder",
kind: enyo.DomNode,
content: "",
generated: !1,
nodeTag: "div",
hasNode: function() {
return this.generated ? this.node || this.findNodeById() : null;
},
getContent: function() {
return this.content;
},
generateHtml: function() {
this.generated = !0;
if (this.canGenerate === !1) return "";
var a = this.getContent(), b = "<" + this.nodeTag + enyo.attributesToHtml(this.getDomAttributes()), c = (this.style ? this.style + ";" : "") + enyo.stylesToHtml(this.getDomStyles());
c && (b += ' style="' + c + '"'), this.nodeTag == "img" ? b += "/>" : b += ">" + a + "</" + this.nodeTag + ">";
return b;
},
renderDomAttributes: function() {
this.attributesToNode(this.getDomAttributes());
},
renderDomStyles: function() {
this.stylesToNode(this.getDomStyles());
},
renderDomContent: function() {
this.node.innerHTML = this.getContent();
},
renderDom: function() {
this.renderDomAttributes(), this.renderDomStyles(), this.renderDomContent();
},
renderNode: function() {
this.generated = !0, this.createNode(), this.renderDom(), this.rendered();
},
render: function() {
this.hasNode() ? (this.renderDom(), this.rendered()) : this.renderNode();
},
renderContent: function() {
this.hasNode() && (this.renderDomContent(), this.rendered());
},
renderInto: function(a) {
var b = enyo.byId(a), c = window.getComputedStyle(b, null);
c.height !== "auto" && c.height !== "0px" ? this.addClass(enyo.fittingClassName) : b == document.body && this.addClass(enyo.fittingClassName), b.innerHTML = this.generateHtml(), this.rendered();
return this;
},
rendered: function() {}
}), enyo.fittingClassName = "enyo-fit", enyo.kind({
name: "enyo.DomNodeBuilder",
kind: enyo.AbstractDomNodeBuilder,
constructor: function() {
this.inherited(arguments), this.domStyles = enyo.clone(this.domStyles || {}), this.domAttributes = enyo.clone(this.domAttributes || {});
},
getDomStyles: function() {
return this.domStyles;
},
getDomAttributes: function() {
return this.domAttributes;
}
}), enyo.stylesToHtml = function(a) {
var b, c, d = "";
for (b in a) {
c = a[b], b = b.replace(/_/g, "");
if (c !== null && c !== undefined && c !== "") {
if (enyo.isIE && b == "opacity") {
if (c >= .99) continue;
b = "filter", c = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + Math.floor(c * 100) + ")";
}
d += b + ":" + c + ";";
}
}
return d;
}, enyo.attributesToHtml = function(a) {
var b, c, d = "";
for (b in a) c = a[b], b == "className" && (b = "class"), c !== null && c !== "" && (d += " " + b + '="' + c + '"');
return d;
};

// dom/ManagedDomBuilder.js

enyo.kind({
name: "enyo.ManagedDomBuilder",
kind: enyo.DomNodeBuilder,
published: {
content: "",
className: "",
manager: null,
parent: null
},
style: "",
create: function(a) {
this.inherited(arguments), this.addClass(this.className), this.addCssText(this.style), this.domAttributes.id = this.id, this.width && (this.domStyles.width = this.width), this.height && (this.domStyles.height = this.height), this.managerChanged(), this.parentChanged();
},
destroy: function() {
this.setParent(null), this.setManager(null), this.inherited(arguments);
},
importProps: function(a) {
a && (a.style && (this.addCssText(a.style), delete a.style), a.domStyles && (enyo.mixin(this.domStyles, a.domStyles), delete a.domStyles), a.domAttributes && (enyo.mixin(this.domAttributes, a.domAttributes), delete a.domAttributes), a.className && this.className && (this.className += " " + a.className, delete a.className)), this.inherited(arguments);
},
managerChanged: function(a) {
a && a.removeControl(this), this.manager && this.manager.addControl(this);
},
parentChanged: function(a) {
a != this.parent && (a && a.removeChild(this), this.parent && this.parent.addChild(this));
},
isDescendantOf: function(a) {
var b = this;
while (b && b != a) b = b.parent;
return a && b == a;
},
getOffset: function() {
return this.parent ? this.parent.calcControlOffset(this) : enyo.dom.calcNodeOffset(this.hasNode());
},
calcControlOffset: function(a) {
var b = a.parent;
if (b && b != this) return b.calcControlOffset(a);
var c = this.getOffset();
if (this.hasNode() && a.hasNode()) {
var d = enyo.dom.calcNodeOffset(a.node, this.node);
c.top += d.top, c.left += d.left;
}
return c;
},
getParentNode: function() {
return this.parent ? this.parent.hasNode() : this.inherited(arguments);
},
rendered: function() {
this.node = null;
},
contentChanged: function() {
this.renderContent();
},
addContent: function(a, b) {
this.setContent((this.content ? this.content + (b || "") : "") + a);
}
});

// dom/Control.js

enyo.kind({
name: "enyo.Control",
kind: enyo.ManagedDomBuilder,
published: {
layoutKind: ""
},
events: {
onclick: "",
onmousedown: "",
onmouseup: ""
},
controlParentName: "client",
defaultKind: "Control",
constructor: function() {
this.controls = [], this.children = [], this.inherited(arguments);
},
create: function() {
this.inherited(arguments), this.layoutKindChanged();
},
destroy: function() {
this.inherited(arguments), this.destroyControls();
},
initComponents: function() {
this.createChrome(this.chrome), this.inherited(arguments);
},
discoverControlParent: function() {
this.controlParent = this.$[this.controlParentName] || this.controlParent;
},
createComponents: function() {
this.inherited(arguments), this.discoverControlParent();
},
createChrome: function(a) {
this.createComponents(a, {
isChrome: !0
});
},
adjustComponentProps: function(a) {
this.inherited(arguments), a.manager = a.manager || this;
},
addControl: function(a) {
a.parent = a.parent || this, this.controls.push(a);
},
removeControl: function(a) {
return enyo.remove(a, this.controls);
},
indexOfControl: function(a) {
return enyo.indexOf(a, this.controls);
},
getControls: function() {
var a = [];
for (var b = 0, c = this.controls, d; d = c[b]; b++) d.isChrome || a.push(d);
return a;
},
destroyControls: function() {
var a = this.getControls();
for (var b = 0, c; c = a[b]; b++) c.destroy();
},
broadcastMessage: function(a, b) {
var c = a + "Handler";
if (this[c]) return this[c].apply(this, b);
this.broadcastToChildren(a, b);
},
resized: function() {
this.broadcastMessage("resize");
},
broadcastToChildren: function(a, b) {
for (var c = 0, d = this.controls, e; e = d[c]; c++) e.broadcastMessage(a, b);
},
resizeHandler: function() {
this.broadcastToChildren("resize");
},
addChild: function(a) {
this.controlParent && !a.isChrome ? this.appendControlParentChild(a) : a.prepend ? this.prependChild(a) : this.appendChild(a);
},
appendControlParentChild: function(a) {
this.controlParent.addChild(a);
},
appendChild: function(a) {
a.parent = this, this.children.push(a), a.hasNode() && a._append();
},
prependChild: function(a) {
a.parent = this, this.children.unshift(a), a.hasNode() && a._prepend();
},
indexOfChild: function(a) {
return enyo.indexOf(a, this.children);
},
removeChild: function(a) {
return enyo.remove(a, this.children);
},
layoutKindChanged: function() {
this.layout && this.destroyObject("layout"), this.createLayoutFromKind(this.layoutKind);
},
createLayoutFromKind: function(a) {
var b = a && enyo.constructorForKind(a);
b && (this.layout = new b(this));
},
getContent: function() {
this.flow();
return this.getChildContent() || this.content;
},
getEmpiricalChildParent: function() {
var a = this.getControls()[0];
return a && a.parent || this.controlParent || this;
},
flow: function() {
this.layout && this.layout.flow(this);
},
flowControls: function() {
this.controlParent ? this.controlParent.flowControls() : this.flow();
},
getChildContent: function() {
var a = "";
for (var b = 0, c; c = this.children[b]; b++) a += c.generateHtml();
return a;
},
rendered: function() {
this.inherited(arguments), this.childrenRendered();
},
childrenRendered: function() {
for (var a = 0, b; b = this.children[a]; a++) b.rendered();
},
getPublishedList: function() {
return this.ctor.publishedList || this.makePublishedList();
},
makePublishedList: function() {
var a = {
showing: "",
className: "",
content: ""
}, b = this.ctor.prototype, c = b;
while (c && c != enyo.Control.prototype) enyo.mixin(a, c.published), c = c.base && c.base.prototype;
return this.ctor.publishedList = a;
}
}), enyo.defaultKind = enyo.defaultCtor = enyo.Control;

// compatibility/webkitGesture.js

enyo.requiresWindow(function() {
window.PalmSystem || (enyo.dispatcher.features.push(function(a) {
enyo.iphoneGesture[a.type] && enyo.iphoneGesture[a.type](a);
}), enyo.iphoneGesture = {
_send: function(a, b) {
var c = {
type: a,
preventDefault: enyo.nop
};
enyo.mixin(c, b), enyo.dispatch(c);
},
touchstart: function(a) {
this._send("mousedown", a.changedTouches[0]), a.preventDefault();
},
touchmove: function(a) {
this._send("mousemove", a.changedTouches[0]);
},
touchend: function(a) {
this._send("mouseup", a.changedTouches[0]), this._send("click", a.changedTouches[0]);
},
connect: function() {
document.ontouchstart = enyo.dispatch, document.ontouchmove = enyo.dispatch, document.ontouchend = enyo.dispatch;
}
});
});

// compatibility/webosGesture.js

window.PalmSystem && (enyo.dispatcher.features.push(function(a) {
enyo.webosGesture[a.type] && enyo.webosGesture[a.type](a);
}), enyo.webosGesture = {
mousedown: function(a) {
this.lastDownTarget = a.target;
}
}, Mojo = window.Mojo || {}, Mojo.handleGesture = function(a, b) {
var c = enyo.mixin({
type: a,
target: enyo.webosGesture.lastDownTarget
}, b);
enyo.dispatch(c);
}, Mojo.screenOrientationChanged = function() {}, enyo.requiresWindow(function() {
document.addEventListener("gesturestart", enyo.dispatch), document.addEventListener("gesturechange", enyo.dispatch), document.addEventListener("gestureend", enyo.dispatch);
}));

// base/layout/Grid.js

enyo.kind({
name: "enyo.Grid",
kind: enyo.Control,
cellClass: "",
create: function() {
this.inherited(arguments), this.addClass("enyo-grid");
},
addControl: function(a) {
this.inherited(arguments), a.addClass("enyo-grid-div " + this.cellClass);
}
});

// base/layout/HLayout.js

enyo.kind({
name: "enyo.HLayout",
layoutClass: "enyo-hlayout",
flow: function() {},
constructor: function(a) {
this.container = a, a.addClass(this.layoutClass), a.align && (a.domStyles["text-align"] = a.align);
},
destroy: function() {
this.container && this.container.removeClass(this.layoutClass);
}
});

// base/layout/FlexLayout.js

enyo.kind({
name: "enyo.FlexLayout",
pack: "start",
align: "stretch",
constructor: function(a) {
this.prefix = enyo.isMoz ? "-moz" : "-webkit", a && (this.pack = a.pack || this.pack, this.align = a.align || this.align), this.container = a;
},
destroy: function() {
this.container && (delete this.container.setFlex, this.container.removeClass(this.flexClass));
},
calcControlFlex: function(a, b, c) {
var d = a.domStyles;
if (a.flex) return a.flex;
if (d[b] == "100%" || a[c] == "fill") {
delete d[b];
return a.flex = 1;
}
return null;
},
flowExtent: function(a, b, c) {
for (var d = 0, e, f, g; e = a[d]; d++) g = this.calcControlFlex(e, b, c), f = e.domStyles, f[this.prefix + "-box-flex"] = g, g && (f[b] || (f[b] = "0px"), enyo.isMoz && b == "height" && this.align == "stretch" && (f.width = "100%"));
},
flow: function(a) {
var b = a.domStyles;
b[this.prefix + "-box-pack"] = a.pack || this.pack, b[this.prefix + "-box-align"] = a.align || this.align, a.addClass(this.flexClass), this._flow(a.children);
}
}), enyo.kind({
name: "enyo.HFlexLayout",
kind: enyo.FlexLayout,
flexClass: "enyo-hflexbox",
_flow: function(a) {
this.flowExtent(a, "width", "w");
}
}), enyo.kind({
name: "enyo.VFlexLayout",
kind: enyo.FlexLayout,
flexClass: "enyo-vflexbox",
_flow: function(a) {
this.flowExtent(a, "height", "h");
}
}), enyo.kind({
name: "enyo.HFlexBox",
kind: enyo.Control,
layoutKind: enyo.HFlexLayout
}), enyo.kind({
name: "enyo.VFlexBox",
kind: enyo.Control,
layoutKind: enyo.VFlexLayout
});

// base/scroller/ScrollMath.js

enyo.kind({
name: "enyo.ScrollMath",
kind: enyo.Component,
published: {
vertical: !0,
horizontal: !0
},
events: {
onScrollStart: "scrollStart",
onScroll: "scroll",
onScrollStop: "scrollStop"
},
kSpringDamping: .93,
kDragDamping: .5,
kFrictionDamping: .98,
kSnapFriction: .9,
kFlickScalar: .02,
kFrictionEpsilon: .01,
topBoundary: 0,
rightBoundary: 0,
bottomBoundary: 0,
leftBoundary: 0,
interval: 20,
fixedTime: !0,
x0: 0,
x: 0,
y0: 0,
y: 0,
destroy: function() {
this.stop(), this.inherited(arguments);
},
verlet: function(a) {
var b = this.x;
this.x += b - this.x0, this.x0 = b;
var c = this.y;
this.y += c - this.y0, this.y0 = c;
},
damping: function(a, b, c, d) {
var e = .5;
if (Math.abs(a - b) < e) return b;
return a * d > b * d ? c * (a - b) + b : a;
},
boundaryDamping: function(a, b, c, d) {
return this.damping(this.damping(a, b, d, 1), c, d, -1);
},
constrain: function() {
var a = this.boundaryDamping(this.y, this.topBoundary, this.bottomBoundary, this.kSpringDamping);
a != this.y && (this.y0 = a - (this.y - this.y0) * this.kSnapFriction, this.y = a);
var b = this.boundaryDamping(this.x, this.leftBoundary, this.rightBoundary, this.kSpringDamping);
b != this.x && (this.x0 = b - (this.x - this.x0) * this.kSnapFriction, this.x = b);
},
friction: function(a, b, c) {
var d = this[a] - this[b], e = Math.abs(d) > this.kFrictionEpsilon ? c : 0;
this[a] = this[b] + e * d;
},
frame: 10,
simulate: function(a) {
while (a >= this.frame) a -= this.frame, this.dragging || this.constrain(), this.verlet(), this.friction("y", "y0", this.kFrictionDamping), this.friction("x", "x0", this.kFrictionDamping);
return a;
},
animate: function() {
this.stop();
var a = (new Date).getTime(), b = 0, c, d, e = enyo.bind(this, function() {
var f = (new Date).getTime();
this.job = enyo.requestAnimationFrame(e);
var g = f - a;
a = f, this.dragging && (this.y0 = this.y = this.uy, this.x0 = this.x = this.ux), b += g, this.fixedTime && !this.isInOverScroll() && (b = this.interval), b = this.simulate(b), d != this.y || c != this.x ? this.scroll() : this.dragging || (this.stop(!0), this.scroll()), d = this.y, c = this.x;
});
this.job = enyo.requestAnimationFrame(e);
},
start: function() {
this.job || (this.animate(), this.doScrollStart());
},
stop: function(a) {
this.job = enyo.cancelRequestAnimationFrame(this.job), a && this.doScrollStop();
},
startDrag: function(a) {
this.dragging = !0, this.my = a.pageY, this.py = this.uy = this.y, this.mx = a.pageX, this.px = this.ux = this.x;
},
drag: function(a) {
if (this.dragging) {
var b = this.vertical ? a.pageY - this.my : 0;
this.uy = b + this.py, this.uy = this.boundaryDamping(this.uy, this.topBoundary, this.bottomBoundary, this.kDragDamping);
var c = this.horizontal ? a.pageX - this.mx : 0;
this.ux = c + this.px, this.ux = this.boundaryDamping(this.ux, this.leftBoundary, this.rightBoundary, this.kDragDamping), this.start();
return !0;
}
},
dragDrop: function(a) {
if (this.dragging && !window.PalmSystem) {
var b = .5;
this.y = this.uy, this.y0 = this.y - (this.y - this.y0) * b, this.x = this.ux, this.x0 = this.x - (this.x - this.x0) * b;
}
this.dragging = !1;
},
dragFinish: function() {
this.dragging = !1;
},
flick: function(a) {
this.vertical && (this.y = this.y0 + a.yVel * this.kFlickScalar), this.horizontal && (this.x = this.x0 + a.xVel * this.kFlickScalar), this.start();
},
scroll: function() {
this.doScroll();
},
isScrolling: function() {
return this.job;
},
isInOverScroll: function() {
return this.job && (this.x > this.leftBoundary || this.x < this.rightBoundary || this.y > this.topBoundary || this.y < this.bottomBoundary);
}
});

// base/scroller/ScrollFades.js

enyo.kind({
name: "enyo.ScrollFades",
kind: enyo.Control,
className: "enyo-view",
components: [ {
name: "top",
showing: !1,
className: "enyo-scrollfades-top"
}, {
name: "bottom",
showing: !1,
className: "enyo-scrollfades-bottom"
}, {
name: "left",
showing: !1,
className: "enyo-scrollfades-left"
}, {
name: "right",
showing: !1,
className: "enyo-scrollfades-right"
} ],
showHideFades: function(a) {
var b = a.scrollTop, c = a.scrollLeft, d = a.getBoundaries();
this.$.top.setShowing(a.vertical && b > d.top), this.$.bottom.setShowing(a.vertical && b < d.bottom), this.$.left.setShowing(a.horizontal && c > d.left), this.$.right.setShowing(a.horizontal && c < d.right);
}
});

// base/scroller/DragScroller.js

enyo.kind({
name: "enyo.DragScroller",
kind: enyo.Control,
preventDragPropagation: !0,
published: {
horizontal: !0,
vertical: !0
},
tools: [ {
name: "scroll",
kind: "ScrollMath"
} ],
create: function() {
this.inherited(arguments), this.horizontalChanged(), this.verticalChanged();
},
initComponents: function() {
this.createComponents(this.tools), this.inherited(arguments);
},
horizontalChanged: function() {
this.$.scroll.setHorizontal(this.horizontal);
},
verticalChanged: function() {
this.$.scroll.setVertical(this.vertical);
},
shouldDrag: function(a) {
var b = a.vertical, c = this.horizontal, d = this.vertical;
return b && d || !b && c;
},
flickHandler: function(a, b) {
var c = Math.abs(b.xVel) > Math.abs(b.yVel) ? this.horizontal : this.vertical;
if (c) {
this.$.scroll.flick(b);
return this.preventDragPropagation;
}
},
mouseholdHandler: function(a, b) {
if (this.$.scroll.isScrolling() && !this.$.scroll.isInOverScroll()) {
this.$.scroll.stop(b);
return !0;
}
},
dragstartHandler: function(a, b) {
this.dragging = this.shouldDrag(b);
if (this.dragging) {
this.$.scroll.startDrag(b);
if (this.preventDragPropagation) return !0;
}
},
dragHandler: function(a, b) {
this.dragging && this.$.scroll.drag(b);
},
dragfinishHandler: function(a, b) {
this.dragging && (b.preventClick(), this.$.scroll.dragDrop(b), this.$.scroll.dragFinish(), this.dragging = !1);
}
});

// base/scroller/BasicScroller.js

enyo.kind({
name: "enyo.BasicScroller",
kind: enyo.DragScroller,
published: {
scrollTop: 0,
scrollLeft: 0,
autoHorizontal: !0,
autoVertical: !1,
fpsShowing: !1,
accelerated: !0
},
events: {
onScrollStart: "",
onScroll: "",
onScrollStop: ""
},
className: "enyo-scroller",
chrome: [ {
name: "client"
} ],
create: function() {
this.inherited(arguments), enyo.mixin(this.domAttributes, {
onscroll: enyo.bubbler
}), this.fpsShowingChanged(), this.acceleratedChanged();
},
rendered: function() {
this.inherited(arguments), this.hasNode() && enyo.asyncMethod(this.$.scroll, "start");
},
scrollHandler: function(a, b) {
this.hasNode() && (this.node.scrollTop = 0, this.node.scrollLeft = 0);
},
resizeHandler: function() {
this.start(), this.inherited(arguments);
},
calcControlOffset: function(a) {
var b = this.inherited(arguments);
b.left -= this.scrollLeft, b.top -= this.scrollTop;
return b;
},
locateScrollee: function() {
return this.$.client;
},
setScrollee: function(a) {
this.scrollee && this.scrollee.removeClass("enyo-scroller-scrollee"), a || this.log("Setting null scrollee"), this.scrollee = a, this.scrollee.addClass("enyo-scroller-scrollee");
},
flow: function() {
this.setScrollee(this.locateScrollee()), this.layoutKindChanged(), this.inherited(arguments);
},
layoutKindChanged: function() {
this.$.client && this.$.client.setLayoutKind(this.layoutKind);
},
showingChanged: function() {
this.inherited(arguments), this.showing && enyo.asyncMethod(this, this.start);
},
fpsShowingChanged: function() {
!this.$.fps && this.fpsShowing && (this.createChrome([ {
name: "fps",
content: "stopped",
className: "enyo-scroller-fps",
parent: this
} ]), this.generated && this.$.fps.render()), this.$.fps && this.$.fps.setShowing(this.fpsShowing);
},
acceleratedChanged: function() {
var a = {
top: this.scrollTop,
left: this.scrollLeft
};
this.scrollTop = 0, this.scrollLeft = 0, this.effectScroll && this.effectScroll(), this.scrollTop = a.top, this.scrollLeft = a.left, this.effectScroll = this.accelerated ? this.effectScrollAccelerated : this.effectScrollNonAccelerated, this.effectScroll();
},
start: function() {
this.$.scroll.start();
},
stop: function() {
this.$.scroll.stop();
},
dragstartHandler: function(a, b) {
this.calcBoundaries(), this.calcAutoScrolling();
return this.inherited(arguments);
},
scrollStart: function(a) {
this.calcBoundaries(), this.doScrollStart();
},
scroll: function(a) {
this.scrollLeft = -a.x, this.scrollTop = -a.y, this.effectScroll(), this.doScroll();
},
scrollStop: function(a) {
this.fpsShowing && this.$.fps.setContent(a.fps), this.broadcastToChildren("resize"), this.doScrollStop();
},
effectScrollAccelerated: function() {
if (this.scrollee && this.scrollee.hasNode()) {
var a = this.scrollee.node.style, b = this.scrollee.domStyles, c = -this.scrollLeft + "px, " + -this.scrollTop + "px";
b["-webkit-transform"] = a.webkitTransform = "translate3d(" + c + ",0)";
}
},
effectScrollNonAccelerated: function() {
if (this.scrollee && this.scrollee.hasNode()) {
var a = this.scrollee.node.style, b = this.scrollee.domStyles;
b.top = a.top = -this.scrollTop + "px", b.left = a.left = -this.scrollLeft + "px";
}
},
calcBoundaries: function() {
var a = this.scrollee && this.scrollee.hasNode();
if (a && this.hasNode()) {
this.$.scroll.bottomBoundary = Math.min(0, this.node.clientHeight - (a.scrollHeight + a.offsetHeight - a.clientHeight)), this.$.scroll.rightBoundary = Math.min(0, this.node.clientWidth - (a.scrollWidth + a.offsetWidth - a.clientWidth));
var b = enyo.getVisibleControlBounds(this), c = this.getBounds();
this.$.scroll.bottomBoundary -= Math.max(0, c.height - b.height);
}
},
calcAutoScrolling: function() {
this.autoHorizontal && this.setHorizontal(this.$.scroll.rightBoundary !== 0), this.autoVertical && this.setVertical(this.$.scroll.bottomBoundary !== 0);
},
scrollLeftChanged: function() {
var a = this.$.scroll;
a.x = a.x0 = -this.scrollLeft, this.scrollee && a.start();
},
scrollTopChanged: function() {
var a = this.$.scroll;
a.y = a.y0 = -this.scrollTop, this.scrollee && a.start();
},
setScrollPositionDirect: function(a, b) {
this.scrollTop = b, this.scrollLeft = a;
var c = this.$.scroll;
c.y = c.y0 = -this.scrollTop, c.x = c.x0 = -this.scrollLeft, this.effectScroll();
},
getBoundaries: function() {
var a = this.$.scroll;
this.calcBoundaries();
return {
top: a.topBoundary,
right: -a.rightBoundary,
bottom: -a.bottomBoundary,
left: a.leftBoundary
};
},
scrollTo: function(a, b) {
var c = this.$.scroll;
a !== null && (c.y = c.y0 - (a + c.y0) * (1 - c.kFrictionDamping)), b !== null && (c.x = c.x0 - (b + c.x0) * (1 - c.kFrictionDamping)), c.start();
},
scrollIntoView: function(a, b) {
if (this.hasNode()) {
this.stop();
var c = this.getBoundaries(), d = this.node.clientHeight, e = this.node.clientWidth;
(a < this.scrollTop || a > this.scrollTop + d) && this.setScrollTop(Math.max(c.top, Math.min(c.bottom, a))), (b < this.scrollLeft || b > this.scrollLeft + e) && this.setScrollLeft(Math.max(c.left, Math.min(c.right, a)));
}
this.start();
},
scrollOffsetIntoView: function(a, b, c) {
if (this.hasNode()) {
this.stop();
var d = enyo.getVisibleControlBounds(this);
d.bottom = d.top + d.height, d.right = d.left + d.width;
if (a != undefined) {
var e = 10;
d.top += e, d.bottom -= (c || 0) + e, a < d.top ? this.setScrollTop(this.scrollTop + a - d.top) : a > d.bottom && this.setScrollTop(this.scrollTop + a - d.bottom);
}
b != undefined && (b < d.left ? this.setScrollLeft(this.scrollLeft + b - d.left) : b > d.right && this.setScrollLeft(this.scrollLeft + b - d.right)), this.start();
}
},
scrollToBottom: function() {
this.scrollIntoView(9e6, 0);
}
});

// base/scroller/Scroller.js

enyo.kind({
name: "enyo.Scroller",
kind: enyo.BasicScroller,
chrome: [],
monoChrome: [ {
name: "client",
className: "enyo-view"
} ],
multiChrome: [ {
name: "client",
className: "enyo-view",
components: [ {
name: "innerClient"
} ]
} ],
initComponents: function() {
this.components && this.components.length === 1 ? this.createChrome(this.monoChrome) : (this.controlParentName = "innerClient", this.createChrome(this.multiChrome)), this.inherited(arguments);
},
locateScrollee: function() {
return this.$.innerClient || this.getControls()[0];
}
});

// base/scroller/TransformScroller.js

enyo.kind({
name: "enyo.TransformScroller",
kind: enyo.Scroller,
effectScroll: function() {
if (this.scrollee && this.scrollee.hasNode()) {
var a = -this.scrollLeft + "px, " + -this.scrollTop + "px";
this.scrollee.node.style.webkitTransform = "translate3d(" + a + ",0)";
}
}
});

// base/scroller/SnapScroller.js

enyo.kind({
name: "enyo.SnapScroller",
kind: enyo.BasicScroller,
published: {
index: 0
},
events: {
onSnap: "",
onSnapFinish: ""
},
layoutKind: "HFlexLayout",
dragSnapWidth: 0,
revealAmount: 0,
create: function() {
this.inherited(arguments), this.$.scroll.kFrictionDamping = .85;
},
layoutKindChanged: function() {
this.inherited(arguments), this.scrollH = this.layoutKind == "HFlexLayout";
var a = this.revealAmount + "px";
this.$.client.applyStyle("padding", this.scrollH ? "0 " + a : a + " 0");
},
indexChanged: function() {
var a = this.calcPos(this.index);
a !== undefined && (this.calcBoundaries(), this.scrollToDirect(a));
},
scrollStart: function() {
this.inherited(arguments), this.startPos = this.scrollH ? this.getScrollLeft() : this.getScrollTop(), this._scrolling = !0;
},
scroll: function(a) {
this.inherited(arguments), this.pos = this.scrollH ? this.getScrollLeft() : this.getScrollTop(), this.goPrev = this.pos0 != this.pos ? this.pos0 > this.pos : this.goPrev;
if (this.$.scroll.dragging) this.snapStarting = !1; else if (this.snapStarting) this._scrolling || (this.snapStarting = !1); else {
var b = this.getBoundaries(), c = b[this.scrollH ? "left" : "top"], d = b[this.scrollH ? "right" : "bottom"];
this.pos > c && this.pos < d && this.snap();
}
this.pos0 = this.pos;
},
scrollStop: function() {
this._scrolling = !1, this.snapping && (this.snapping = !1, this.index != this.oldIndex && this.snapFinish()), this.inherited(arguments);
},
snapFinish: function() {
this.doSnapFinish();
},
snapScrollTo: function(a) {
this.pos = a, this.snapStarting = !0, this.snapping = !0, this.scrollH ? this.scrollTo(0, a) : this.scrollTo(a, 0);
},
scrollToDirect: function(a) {
this.pos = a, this.scrollH ? this.setScrollPositionDirect(a, 0) : this.setScrollPositionDirect(0, a);
},
calcSnapScroll: function() {
for (var a = 0, b = this.getControls(), c, d; c = b[a]; a++) {
d = c.hasNode()["offset" + (this.scrollH ? "Left" : "Top")] - this.revealAmount;
if (this.pos < d) {
var e = this.scrollH ? c.hasNode().clientWidth : c.hasNode().clientHeight, f = Math.abs(this.pos + (this.goPrev ? 0 : e) - d) > this.dragSnapWidth;
return f ? this.goPrev ? a - 1 : a : this.index;
}
}
},
calcPos: function(a) {
var b = this.getControls()[a];
if (b && b.hasNode()) return b.hasNode()["offset" + (this.scrollH ? "Left" : "Top")] - this.revealAmount;
},
snap: function() {
var a = this.calcSnapScroll();
a !== undefined && this.snapTo(a);
},
snapTo: function(a) {
this.oldIndex = this.index;
var b = this.calcPos(a);
b !== undefined && (this.index = a, this.snapScrollTo(b), this.index != this.oldIndex && this.doSnap(a));
},
previous: function() {
!this.snapping && this.snapTo(this.index - 1);
},
next: function() {
!this.snapping && this.snapTo(this.index + 1);
}
});

// base/scroller/FadeScroller.js

enyo.kind({
name: "enyo.FadeScroller",
kind: enyo.Scroller,
initComponents: function() {
this.createChrome([ {
kind: "ScrollFades"
} ]), this.inherited(arguments);
},
scroll: function(a) {
this.inherited(arguments), this.$.scrollFades.showHideFades(this);
}
});

// base/list/Flyweight.js

enyo.kind({
name: "enyo.Flyweight",
kind: enyo.Control,
events: {
onNodeChange: "",
onDecorateEvent: ""
},
captureDomEvent: function(a) {
var b = a.type;
b == "dragfinish" && (this.capturedDragging = !1), (b == "flick" || !this.capturedDragging && b != "mousemove" && b != "mouseover" && b != "mouseout") && this.setNodeByEvent(a), this.doDecorateEvent(a), b == "dragstart" && (this.capturedDragging = !0);
},
setNodeByEvent: function(a) {
var b = this.findNode(a.target);
if (b) if (b != this.node || this.needsNode) this.setNode(b), this.doNodeChange(b), this.needsNode = !1;
},
findNode: function(a) {
var b = a;
while (b) {
if (b.id == this.id) return b;
b = b.parentNode;
}
},
disableNodeAccess: function() {
this.disEnableNodeAccess(this, !0);
},
enableNodeAccess: function() {
this.disEnableNodeAccess(this);
},
disEnableNodeAccess: function(a, b) {
this._disEnableNodeAccess(a, b) && this.disEnableChildrenNodeAccess(a, b);
},
_disEnableNodeAccess: function(a, b) {
if (b) {
if (!a._hasNode) {
a._hasNode = a.hasNode, a.hasNode = enyo.nop;
return !0;
}
} else if (a._hasNode) {
a.hasNode = a._hasNode, delete a._hasNode;
return !0;
}
},
disEnableChildrenNodeAccess: function(a, b) {
for (var c = 0, d = a.children, e; e = d[c]; c++) this.disEnableNodeAccess(e, b);
},
setNode: function(a) {
this.inherited(arguments), this.assignChildrenNodes(this);
},
assignChildrenNodes: function(a) {
for (var b = 0, c = a.children, d, e; d = c[b]; b++) e = this.findControlNode(d, a.node, b), e && (d.node = e, this.assignChildrenNodes(d));
},
findControlNode: function(a, b, c) {
var d = a.id, e = b.childNodes[c];
if (e && e.id == d) return e;
return b.querySelector("[id=" + d + "]");
}
}), enyo.Flyweight.callWithoutNode = function(a, b) {
var c = a.hasNode(), d = a.hasNode;
a.node = null, a.hasNode = enyo.nop, b(), a.node = c, a.hasNode = d;
};

// base/list/StateManager.js

enyo.kind({
name: "enyo.StateManager",
kind: enyo.Component,
published: {
control: null
},
create: function() {
this.inherited(arguments), this.state = [];
},
controlChanged: function() {
this.clear(), this.defaultState = null, this.makeDefaultState();
},
makeDefaultState: function() {
var a = {};
this.read(this.control, a);
return a;
},
getDefaultState: function() {
this.defaultState || (this.defaultState = this.makeDefaultState());
return this.copyState(this.defaultState);
},
clear: function() {
this.state = [];
},
fetch: function(a) {
return this.state[a] || (this.state[a] = {});
},
save: function(a) {
this.read(this.control, this.fetch(a));
},
restore: function(a) {
this.state[a] || (this.state[a] = this.getDefaultState()), this.write(this.control, this.fetch(a));
},
read: function(a, b) {
this.readControl(a, b), this.readChildren(a, b);
},
readControl: function(a, b) {
var c, d = a.getPublishedList();
for (c in d) b[c] = a[c];
for (c in a.statified) b[c] = a[c];
b.domStyles = enyo.clone(a.domStyles), b.domAttributes = enyo.clone(a.domAttributes);
},
readChildren: function(a, b) {
var c = b.children = b.children || {};
for (var d = 0, e = a.children, f, g; f = e[d]; d++) f.captureState !== !1 && (g = c[f.id] || (c[f.id] = {}), this.read(f, g));
},
write: function(a, b) {
this.writeControl(a, b), this.writeChildren(a, b);
},
writeControl: function(a, b) {
for (var c in b) c != "children" && (a[c] = b[c]);
},
writeChildren: function(a, b) {
var c = b.children;
for (var d = 0, e = a.children, f, g; f = e[d]; d++) g = c[f.id], g && this.write(f, g);
},
copyState: function(a) {
var b = enyo.clone(a);
b.domStyles = enyo.clone(b.domStyles), b.domAttributes = enyo.clone(b.domAttributes), this.copyChildrenState(b, a);
return b;
},
copyChildrenState: function(a, b) {
a.children = {};
var c = b.children;
for (var d in c) a.children[d] = this.copyState(c[d]);
}
});

// base/list/RowServer.js

enyo.kind({
name: "enyo.RowServer",
kind: enyo.Control,
events: {
onSetupRow: ""
},
chrome: [ {
name: "client",
kind: "Flyweight",
onNodeChange: "clientNodeChanged",
onDecorateEvent: "clientDecorateEvent"
}, {
name: "state",
kind: "StateManager"
} ],
lastIndex: null,
create: function() {
this.inherited(arguments), this.$.client.generateHtml(), this.$.state.setControl(this.$.client);
},
prepareRow: function(a) {
this.transitionRow(a);
var b = this.controlsToRow(a);
b || this.disableNodeAccess();
return b;
},
generateHtml: function() {
return "";
},
generateRow: function(a) {
var b;
this.lastIndex != null && (this.saveCurrentState(), this.lastIndex = null), this._nodesDisabled || this.disableNodeAccess(), this.$.state.restore(a);
var c = this.formatRow(a);
c !== undefined && (c === null ? b = " " : c && (this.$.client.domAttributes.rowIndex = a, b = this.getChildContent(), this.$.state.save(a))), this.$.client.needsNode = !0;
return b;
},
clearState: function() {
this.lastIndex = null, this.$.state.clear();
},
saveCurrentState: function() {
this.lastIndex != null && this.$.state.save(this.lastIndex);
},
formatRow: function(a) {
return this.doSetupRow(a);
},
clientDecorateEvent: function(a, b) {
b.rowIndex = this.rowIndex;
},
clientNodeChanged: function(a, b) {
var c = this.fetchRowIndex();
this.transitionRow(c);
},
disableNodeAccess: function() {
this.$.client.disableNodeAccess(), this._nodesDisabled = !0;
},
enableNodeAccess: function() {
this.$.client.enableNodeAccess(), this._nodesDisabled = !1;
},
transitionRow: function(a) {
this.rowIndex = a, a != this.lastIndex && (this.lastIndex != null && this.$.state.save(this.lastIndex), this.lastIndex = a, this.$.state.restore(a)), this.enableNodeAccess();
},
controlsToRow: function(a) {
var b = this.fetchRowNode(a);
if (b) {
this.$.client.setNode(b);
return !0;
}
},
fetchRowNode: function(a) {
var b = this.getParentNode();
if (b) {
var c = b.querySelectorAll('[rowindex="' + a + '"]');
for (var d = 0, e; e = c[d]; d++) if (e.id == this.$.client.id) return e;
}
},
fetchRowIndex: function(a) {
var b = a || this.$.client, c = b.node;
if (c) return this.fetchRowIndexByNode(c);
},
fetchRowIndexByNode: function(a) {
var b, c = a, d = this.getParentNode();
while (c && c.getAttribute && c != d) {
b = c.getAttribute("rowIndex");
if (b !== null) return Number(b);
c = c.parentNode;
}
}
});

// base/repeaters/Repeater.js

enyo.kind({
name: "enyo.Repeater",
kind: enyo.Control,
events: {
onGetItem: ""
},
build: function() {
this.destroyControls();
for (var a = 0, b; b = this.doGetItem(a); a++) {
var c = this.createComponent({
index: a
});
c.createComponents(b, {
owner: this.owner
});
}
},
getItemByIndex: function(a) {
return this.getControls()[a];
}
});

// base/repeaters/VirtualRepeater.js

enyo.kind({
name: "enyo.VirtualRepeater",
kind: enyo.Control,
events: {
onGetItem: "",
onRowIndexChanged: ""
},
published: {
accelerated: !1,
stripSize: 10
},
chrome: [ {
name: "client",
kind: enyo.RowServer,
onSetupRow: "doGetItem",
onRowIndexChanged: "doRowIndexChanged"
} ],
getContent: function() {
this.$.client.clearState();
var a = this.accelerated ? ' class="enyo-virtual-repeater-strip"' : "", b = "", c = 0;
do {
b += "<div" + a + ">";
for (var d = 0, e; d < this.stripSize && (e = this.$.client.generateRow(c)); c++, d++) b += e;
b += "</div>";
} while (e);
return b;
},
renderRow: function(a) {
this.prepareRow(a), this.doGetItem(a);
},
prepareRow: function(a) {
return this.$.client.prepareRow(a);
},
controlsToRow: function(a) {
this.$.client.controlsToRow(a);
},
fetchRowIndex: function() {
return this.$.client.fetchRowIndex();
},
fetchRowNode: function(a) {
return this.$.client.fetchRowNode(a);
},
fetchRowIndexByNode: function(a) {
return this.$.client.fetchRowIndexByNode(a);
}
});

// base/controls/Image.js

enyo.kind({
name: "enyo.Image",
kind: enyo.Control,
published: {
src: "$base-themes-default-theme/images/blank.gif"
},
nodeTag: "img",
create: function() {
this.inherited(arguments), enyo.mixin(this.domAttributes, {
onerror: enyo.bubbler,
draggable: !1
}), this.srcChanged();
},
srcChanged: function() {
this.setAttribute("src", enyo.path.rewrite(this.src));
},
renderDomContent: function() {}
});

// base/controls/Stateful.js

enyo.kind({
name: "enyo.Stateful",
kind: enyo.Control,
published: {
cssNamespace: "enyo"
},
setState: function(a, b) {
this.addRemoveClass(this.cssNamespace + "-" + a, Boolean(b));
},
stateChanged: function(a) {
this.setState(a, this[a]);
}
});

// base/controls/CustomButton.js

enyo.kind({
name: "enyo.CustomButton",
kind: enyo.Stateful,
cssNamespace: "enyo-button",
className: "enyo-custom-button",
published: {
caption: "",
disabled: !1,
isDefault: !1,
down: !1,
depressed: !1,
hot: !1,
toggling: !1,
allowDrag: !1
},
create: function() {
this.inherited(arguments), this.caption = this.caption || this.label || this.content, this.captionChanged(), this.disabledChanged(), this.isDefaultChanged(), this.downChanged(), this.depressedChanged();
},
captionChanged: function() {
this.setContent(this.caption);
},
disabledChanged: function() {
this.stateChanged("disabled");
},
isDefaultChanged: function() {
this.stateChanged("isDefault");
},
downChanged: function() {
this.stateChanged("down");
},
hotChanged: function() {
this.stateChanged("hot");
},
depressedChanged: function() {
this.stateChanged("depressed");
},
mouseoverHandler: function(a, b) {
this.setHot(!0);
},
mouseoutHandler: function(a, b) {
this.setHot(!1), this.setDown(!1);
},
mousedownHandler: function(a, b) {
if (!this.disabled) {
this.setDown(!0);
return this.doMousedown(b);
}
},
mouseupHandler: function(a, b) {
if (!this.disabled && this.down) {
this.setDown(!1);
return this.doMouseup(b);
}
},
clickHandler: function(a, b) {
if (!this.disabled) {
this.toggling && this.setDepressed(!this.depressed);
return this.doClick(b);
}
},
dragstartHandler: function() {
if (this.allowDrag) this.setDown(!1); else {
this.drag = !this.disabled;
return !0;
}
},
dragoverHandler: function(a, b) {
this.drag && !this.down && this.setDown(!0);
},
dragfinishHandler: function(a, b) {
this.drag = !1, this.allowDrag && b.preventClick();
}
});

// base/controls/Button.js

enyo.kind({
name: "enyo.Button",
kind: enyo.CustomButton,
className: "enyo-button",
create: function() {
this.inherited(arguments), this.caption = this.caption || this.label || this.content || this.onclick || "Button", this.captionChanged();
}
});

// base/controls/AjaxContent.js

enyo.kind({
name: "enyo.AjaxContent",
kind: enyo.Control,
published: {
url: ""
},
events: {
onContentChanged: ""
},
create: function() {
this.inherited(arguments), this.urlChanged();
},
urlChanged: function() {
this.url && enyo.xhrGet({
url: this.url,
load: enyo.hitch(this, "_loaded")
});
},
_loaded: function(a, b) {
this.setContent(a);
},
contentChanged: function() {
this.doContentChanged(), this.inherited(arguments);
}
}), enyo.Html = enyo.AjaxContent;

// base/controls/HtmlContent.js

enyo.kind({
name: "enyo.HtmlContent",
kind: enyo.Control,
published: {
srcId: ""
},
events: {
onLinkClick: ""
},
create: function() {
this.inherited(arguments), this.idChanged();
},
idChanged: function() {
var a = enyo.byId(this.srcId);
a && (a.nodeType == 1 ? (this.setContent(a.innerHTML), a.style.display = "none") : this.setContent(a.textContent));
},
findLink: function(a, b) {
var c = a;
while (c && c != b) {
if (c.href) return c.href;
c = c.parentNode;
}
},
clickHandler: function(a, b) {
var c = this.findLink(b.target, this.hasNode());
if (c) {
this.doLinkClick(c, b), b.preventDefault();
return !0;
}
this.doClick();
}
});

// base/controls/BasicInput.js

enyo.kind({
name: "enyo.BasicInput",
kind: enyo.Control,
published: {
value: "",
disabled: !1,
readonly: !1,
placeholder: "",
placeholderClassName: "",
tabIndex: ""
},
events: {
onfocus: "",
onblur: "",
onchange: "",
onkeypress: ""
},
nodeTag: "input",
requiresDomMousedown: !0,
create: function() {
this.inherited(arguments), this.placeholder = this.placeholder || this.hint || "", enyo.mixin(this.domAttributes, {
onfocus: enyo.bubbler,
onblur: enyo.bubbler
}), this.disabledChanged(), this.readonlyChanged(), this.valueChanged(), this.placeholderChanged();
},
getDomValue: function() {
if (this.hasNode()) return this.node.value;
},
setDomValue: function(a) {
this.setAttribute("value", a), this.hasNode() && (this.node.value = a), this.isEmpty() || this.addRemovePlaceholderClassName(!1);
},
changeHandler: function(a, b) {
this.domAttributes.value = this.getValue(), this.doChange(b);
},
isEmpty: function() {
return !this.getValue();
},
getValue: function() {
if (this.hasNode()) {
var a = this.getDomValue();
enyo.isString(a) && (this.value = a);
}
return this.value;
},
valueChanged: function() {
this.setDomValue(this.value);
},
disabledChanged: function() {
this.setAttribute("disabled", this.disabled ? "disabled" : null);
},
readonlyChanged: function() {
this.setAttribute("readonly", this.readonly ? "readonly" : null);
},
placeholderChanged: function() {
this.setAttribute("placeholder", this.placeholder);
},
tabIndexChanged: function() {
this.setAttribute("tabindex", this.tabIndex);
},
focusHandler: function(a, b) {
this.hasNode() && (this.isEmpty() && this.updatePlaceholder(!1), this.doFocus());
},
blurHandler: function(a, b) {
this.isEmpty() && this.updatePlaceholder(!0), this.doBlur();
},
updatePlaceholder: function(a) {
this.addRemovePlaceholderClassName(a);
},
addRemovePlaceholderClassName: function(a) {
this.addRemoveClass(this.placeholderClassName, a);
},
forceFocus: function() {
this.hasNode() && enyo.asyncMethod(this, function() {
this.hasNode().focus();
});
},
forceBlur: function() {
this.hasNode() && enyo.asyncMethod(this, function() {
this.hasNode().blur();
});
},
forceSelect: function() {
this.hasNode() && enyo.asyncMethod(this, function() {
this.hasNode().select();
});
},
hasFocus: function() {
if (this.hasNode()) return Boolean(this.node.parentNode.querySelector(this.nodeTag + ":focus"));
}
});

// base/controls/Input.js

enyo.kind({
name: "enyo.Input",
kind: enyo.Control,
published: {
hint: enyo._$L("Tap Here To Type"),
value: "",
tabIndex: "",
spellcheck: !0,
autocorrect: !0,
autoKeyModifier: "",
autoCapitalize: "sentence",
autoEmoticons: !1,
autoLinking: !1,
autoWordComplete: !0,
inputType: "",
inputClassName: "",
focusClassName: "enyo-input-focus",
spacingClassName: "enyo-input-spacing",
alwaysLooksFocused: !1,
selection: null,
disabled: !1,
changeOnInput: !1,
keypressInputDelay: 0,
styled: !0,
selectAllOnFocus: !1
},
events: {
onfocus: "",
onblur: "",
onchange: "",
oninput: "",
onmousedown: "",
onkeypress: ""
},
className: "enyo-input",
chrome: [ {
name: "input",
flex: 1,
kind: enyo.BasicInput,
className: "enyo-input-input"
} ],
clientChrome: [ {
name: "client",
kind: "HFlexBox",
align: "center"
} ],
create: function() {
this.inherited(arguments), this.updateSpacingControl(), this.disabledChanged(), this.inputTypeChanged(), this.tabIndexChanged(), this.valueChanged(), this.hintChanged(), this.alwaysLooksFocusedChanged(), this.inputClassNameChanged(), this.styledChanged(), this.applySmartTextOptions();
},
destroy: function() {
this.stopInputDelayJob(), this.inherited(arguments);
},
addControl: function(a) {
!a.isChrome && !this.$.client && (this.createChrome(this.clientChrome), this.$.input.setParent(this.$.client), this.updateSpacingControl()), this.inherited(arguments);
},
selectAllHandler: function() {
document.execCommand("selectAll");
},
cutHandler: function() {
document.execCommand("cut");
},
copyHandler: function() {
document.execCommand("copy");
},
pasteHandler: function() {
PalmSystem && PalmSystem.paste && PalmSystem.paste();
},
mousedownHandler: function(a, b) {
b.dispatchTarget != this.$.input && b.preventDefault();
return this.doMousedown(b);
},
focusHandler: function(a, b) {
this.styled && !this.alwaysLooksFocused && this.addClass(this.focusClassName), this.selectAllOnFocus && this.forceSelect(), this.doFocus(b);
},
blurHandler: function(a, b) {
this.alwaysLooksFocused || this.removeClass(this.focusClassName), this.selectAllOnFocus && document.execCommand("Unselect"), this.doBlur(b);
},
clickHandler: function(a, b) {
this.forceFocus(), this.doClick(b);
},
rendered: function() {
this.inherited(arguments), this.selectionChanged();
},
inputClassNameChanged: function() {
this.$.input.addClass(this.inputClassName);
},
alwaysLooksFocusedChanged: function() {
this.alwaysLooksFocused && this.styled && this.addClass(this.focusClassName);
},
inputTypeChanged: function() {
this.$.input.domAttributes.type = this.inputType, this.hasNode() && this.$.input.render();
},
valueChanged: function() {
this.$.input.setValue(this.value);
},
getDomValue: function() {
return this.$.input.getDomValue();
},
getValue: function() {
return this.$.input.getValue();
},
tabIndexChanged: function() {
this.$.input.setTabIndex(this.tabIndex);
},
changeHandler: function(a, b) {
this.changeOnInput || (this.value = a.getValue(), this.doChange(b, this.value));
return !0;
},
inputHandler: function(a, b) {
this.value = a.getValue(), this.keypressInputDelay ? (enyo.job(this.id + "-inputDelay", enyo.bind(this, "doInput", b, this.value), Number(this.keypressInputDelay)), this.changeOnInput && enyo.job(this.id + "-inputDelay", enyo.bind(this, "doChange", b, this.value), Number(this.keypressInputDelay))) : (this.doInput(b, this.value), this.changeOnInput && this.doChange(b, this.value));
return !0;
},
keypressInputDelayChanged: function() {
this.stopInputDelayJob();
},
stopInputDelayJob: function() {
enyo.job.stop(this.id + "-inputDelay");
},
selectionChanged: function() {
var a = this.$.input.hasNode();
a && this.selection && (a.selectionStart = this.selection.start, a.selectionEnd = this.selection.end);
},
getSelection: function() {
var a = this.$.input.hasNode();
return a ? {
start: a.selectionStart,
end: a.selectionEnd
} : {
start: 0,
end: 0
};
},
disabledChanged: function() {
this.$.input.setDisabled(this.disabled);
},
hintChanged: function() {
this.$.input.setPlaceholder(this.hint);
},
autoKeyModifierChanged: function() {
this.$.input.setAttribute("x-palm-text-entry", this.autoKeyModifier ? this.autoKeyModifier : null);
},
autoCapitalizeChanged: function() {
this.autoCapitalize === "lowercase" ? (this.$.input.setAttribute("x-palm-disable-auto-cap", "true"), this.$.input.setAttribute("x-palm-title-cap", null)) : (this.$.input.setAttribute("x-palm-disable-auto-cap", null), this.$.input.setAttribute("x-palm-title-cap", this.autoCapitalize === "title" ? !0 : null));
},
autocorrectChanged: function() {
this.$.input.setAttribute("autocorrect", this.autocorrect ? "on" : "off");
},
spellcheckChanged: function() {
this.$.input.setAttribute("spellcheck", !!this.spellcheck);
},
autoLinkingChanged: function() {
this.$.input.setAttribute("x-palm-enable-linker", this.autoLinking ? this.autoLinking : null);
},
autoEmoticonsChanged: function() {
this.$.input.setAttribute("x-palm-enable-emoticons", this.autoEmoticons ? this.autoEmoticons : null);
},
autoWordCompleteChanged: function() {
this.$.input.setAttribute("x-palm-word-completions", this.autoWordComplete ? null : "disabled");
},
applySmartTextOptions: function() {
this.spellcheckChanged(), this.autoWordCompleteChanged(), this.autocorrectChanged(), this.autoLinkingChanged(), this.autoEmoticonsChanged(), this.autoCapitalizeChanged(), this.autoKeyModifierChanged();
},
updateSpacingControl: function() {
var a = this.$.client || this.$.input;
a != this.spacingControl && (this.spacingControl && this.spacingControl.removeClass(this.spacingClassName), this.spacingControl = a), this.spacingClassNameChanged();
},
spacingClassNameChanged: function(a) {
this.spacingControl && (a && this.spacingControl.removeClass(a), this.spacingControl.addClass(this.spacingClassName));
},
styledChanged: function(a) {
this.addRemoveClass(this.ctor.prototype.className, this.styled), this.spacingControl && this.spacingControl.addRemoveClass(this.spacingClassName, this.styled);
},
isEmpty: function() {
return this.$.input.isEmpty();
},
forceFocus: function() {
this.$.input.forceFocus();
},
forceBlur: function() {
this.$.input.forceBlur();
},
forceSelect: function() {
this.$.input.forceSelect();
},
hasFocus: function() {
return this.$.input.hasFocus();
}
});

// base/controls/InputBox.js

enyo.kind({
name: "enyo.InputBox",
kind: enyo.Control,
events: {
onfocus: "",
onblur: ""
},
published: {
alwaysLooksFocused: !1,
focusClassName: "enyo-input-focus",
spacingClassName: "enyo-input-spacing"
},
chrome: [ {
name: "client"
} ],
align: "center",
layoutKind: "HFlexLayout",
className: "enyo-input",
create: function() {
this.inherited(arguments), this.alwaysLooksFocusedChanged(), this.spacingClassNameChanged();
},
spacingClassNameChanged: function(a) {
a && this.$.client.removeClass(a), this.$.client.addClass(this.spacingClassName);
},
alwaysLooksFocusedChanged: function() {
this.alwaysLooksFocused && this.addClass(this.focusClassName);
},
focusHandler: function(a, b) {
this.alwaysLooksFocused || this.addClass(this.focusClassName), this.doFocus(b);
},
blurHandler: function(a, b) {
this.alwaysLooksFocused || this.removeClass(this.focusClassName), this.doBlur(b);
},
layoutKindChanged: function() {
this.$.client.align = this.align, this.$.client.pack = this.pack, this.$.client.setLayoutKind(this.layoutKind);
}
});

// base/controls/BasicRichText.js

enyo.kind({
name: "enyo.BasicRichText",
kind: enyo.BasicInput,
className: "enyo-richtext",
placeholderClassName: "enyo-richtext-hint",
published: {
richContent: !0
},
nodeTag: "div",
domAttributes: {
tabIndex: 0,
contenteditable: !0
},
requiresDomMousedown: !0,
create: function() {
this.inherited(arguments), this.richContentChanged();
},
blurHandler: function(a, b) {
this.inherited(arguments), this.doChange(b, this.getValue());
},
isEmpty: function() {
return this.generated ? !this.getValue() : !this.value;
},
placeholderChanged: function(a) {
this.inherited(arguments), (this.isEmpty() || this.getValue() == a) && !this.hasFocus() && this.updatePlaceholder(!0);
},
updatePlaceholder: function(a) {
var b = a ? this.placeholder : "";
this.setDomValue(b), this.inherited(arguments);
},
getText: function() {
var a = this.hasNode() && this.node.innerText || "";
return a == this.placeholder ? "" : a;
},
getHtml: function() {
var a = this.hasNode() && this.node.innerHTML || "";
a = a.replace(/<br>$/, "");
return a == this.placeholder ? "" : a;
},
setDomValue: function(a) {
this.richContent || (a = (a || "").replace(/\n/g, "<br>")), this.setContent(a);
},
getDomValue: function() {
return enyo.string.trim(this.richContent ? this.getHtml() : this.getText());
},
valueChanged: function() {
this.setDomValue(this.value), this.isEmpty() && !this.hasFocus() && this.updatePlaceholder(!0);
},
contentChanged: function() {
var a = this.content;
this.content = this.content || " ", this.inherited(arguments), a != this.placeholder && !this.isEmpty() && this.addRemovePlaceholderClassName(!1);
},
readonlyChanged: function() {
this.addRemoveClass("enyo-richtext-readonly", this.readonly);
},
richContentChanged: function() {
this.addRemoveClass("enyo-richtext-plaintext", !this.richContent), this.richContent || this.setDomValue(this.hasNode() ? this.getText() : this.value || this.placeholder);
},
forceSelect: function() {
this.hasNode() && enyo.asyncMethod(this, function() {
document.execCommand("selectAll");
});
}
});

// base/controls/RichText.js

enyo.kind({
name: "enyo.RichText",
kind: enyo.Input,
published: {
richContent: !0
},
events: {
onchange: ""
},
chrome: [ {
name: "input",
flex: 1,
kind: enyo.BasicRichText,
className: "enyo-input-input",
onchange: "doChange"
} ],
create: function() {
this.inherited(arguments), this.richContentChanged();
},
richContentChanged: function() {
this.$.input.setRichContent(this.richContent);
},
getHtml: function() {
return this.$.input.getHtml();
},
getText: function() {
return this.$.input.getText();
},
inputChange: function(a, b) {
if (this.changeOnKeypress) return !0;
this.value = a.getValue(), this.doChange(b, this.value);
},
inputTypeChanged: function() {
this.$.input.domAttributes["x-palm-input-type"] = this.inputType, this.hasNode() && this.$.input.render();
}
});

// base/controls/AnimatedImage.js

enyo.kind({
name: "enyo.AnimatedImage",
kind: enyo.Control,
published: {
imageCount: 0,
imageHeight: 32,
repeat: -1,
easingFunc: enyo.easing.linear
},
chrome: [ {
name: "animator",
kind: "Animator",
onAnimate: "stepAnimation"
} ],
create: function() {
this.inherited(arguments), this.repeatChanged(), this.easingFuncChanged();
},
repeatChanged: function() {
this.$.animator.setRepeat(this.repeat);
},
easingFuncChanged: function() {
this.$.animator.setEasingFunc(this.easingFunc);
},
stepAnimation: function(a, b, c) {
var d = Math.round(c * (this.imageCount - 1));
this.positionBackgroundImage(d);
},
positionBackgroundImage: function(a) {
var b = -a * this.imageHeight;
this.applyStyle("background-position", "0px " + b + "px");
},
start: function() {
this.$.animator.play();
},
stop: function() {
this.$.animator.stop();
}
});

// base/controls/Iframe.js

enyo.kind({
name: "enyo.Iframe",
kind: enyo.Control,
published: {
url: ""
},
className: "enyo-iframe",
domAttributes: {
frameborder: 0
},
nodeTag: "iframe",
create: function() {
this.inherited(arguments), this.urlChanged();
},
urlChanged: function() {
this.setAttribute("src", this.url);
},
goBack: function() {
this.hasNode() && this.node.contentWindow.history.go(-1);
},
goForward: function() {
this.hasNode() && this.node.contentWindow.history.go(1);
},
refresh: function() {
this.setUrl(this.url);
},
fetchCurrentUrl: function() {
var a = this.hasNode(), b = this.getUrl();
try {
return a ? a.contentDocument.location.href : b;
} catch (c) {
return b;
}
}
});

// base/controls/BasicPopup.js

enyo.kind({
name: "enyo.BasicPopup",
kind: enyo.Control,
showing: !1,
published: {
modal: !1,
dismissWithClick: !0,
dismissWithEscape: !0,
scrim: !1,
scrimClassName: ""
},
events: {
onOpen: "",
onClose: ""
},
defaultZ: 120,
className: "enyo-popup",
create: function() {
this.inherited(arguments), this.dispatcher = enyo.dispatcher, this.setParent(this.findRootParent());
},
destroy: function() {
this.close(), this.inherited(arguments);
},
findRootParent: function() {
var a = this;
while (a = a.owner) if (!(a.owner instanceof enyo.Control)) return a;
},
toggleOpen: function() {
this.isOpen ? this.close() : this.open();
},
open: function() {
this.isOpen || (this.isOpen = !0, this.prepareOpen(), this.renderOpen(), this.showHideScrim(this.isOpen), enyo.asyncMethod(this, "afterOpen"));
},
close: function(a, b) {
this.isOpen && (this.isOpen = !1, this.prepareClose(), this.renderClose(), this.showHideScrim(this.isOpen), this.doClose(a, b));
},
dispatchDomEvent: function(a) {
var b = this.inherited(arguments);
return this.modal ? b : !0;
},
prepareOpen: function() {
this._zIndex = ++enyo.BasicPopup.count * 2 + this.findZIndex() + 1, this.applyStyle("z-index", this._zIndex), this.generated || this.render(), this.dispatcher.capture(this, !this.modal);
},
prepareClose: function() {
this.showing && enyo.BasicPopup.count--, this.dispatcher.release(), this._zIndex = null, this.applyStyle("z-index", null);
},
afterOpen: function() {
this.resized(), this.doOpen();
},
renderOpen: function() {
this.show();
},
renderClose: function() {
this.hide();
},
showHideScrim: function(a) {
this.scrim && (a ? (this._scrimZ = this.findZIndex() - 1, enyo.scrim.showAtZIndex(this._scrimZ)) : enyo.scrim.hideAtZIndex(this._scrimZ), enyo.call(enyo.scrim, "addRemoveClass", [ this.scrimClassName, enyo.scrim.showing ]));
},
findZIndex: function() {
var a = this.defaultZ;
this._zIndex ? a = this._zIndex : this.hasNode() && (a = Number(enyo.dom.getComputedStyleValue(this.node, "z-index")) || a);
return this._zIndex = a;
},
mousedownHandler: function(a, b) {
var c = !b.dispatchTarget.isDescendantOf(this);
!this.modal && this.dismissWithClick && b.dispatchTarget != this && c ? this.close(b) : this.modal && c && b.preventDefault(), this.fire("onmousedown", b);
},
blurHandler: function(a, b) {
this.lastFocus = a;
},
focusHandler: function(a, b) {
if (this.modal && !a.isDescendantOf(this)) {
var c = this.lastFocus && this.lastFocus.hasNode() || this.hasNode();
c && c.focus();
}
},
keydownHandler: function(a, b, c) {
switch (b.keyCode) {
case 27:
this.dismissWithEscape && !this.modal && (this.close(b), enyo.stopEvent(b));
return !0;
}
},
clickHandler: function(a, b) {
var c = this.findPopupHandler(a);
c && this.close(b, c.popupHandler);
return this.doClick();
},
findPopupHandler: function(a) {
var b = a;
while (b && b.isDescendantOf(this)) {
if (b.popupHandler) return b;
b = b.parent;
}
}
}), enyo.BasicPopup.count = 0;

// base/controls/Popup.js

enyo.kind({
name: "enyo.Popup",
kind: enyo.BasicPopup,
published: {
showHideMode: "auto",
openClassName: ""
},
create: function() {
this.inherited(arguments), this.openInfo = null, this.contentControlName = this.contentControlName || this.controlParentName;
},
destroy: function() {
this.removeListeners(), this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.addListeners();
},
addListeners: function() {
this.hasNode() && (this.transitionEndListener = enyo.bind(this, "webkitTransitionEndHandler"), this.node.addEventListener("webkitTransitionEnd", this.transitionEndListener, !1));
},
removeListeners: function() {
this.hasNode() && this.node.removeEventListener("webkitTransitionEnd", this.transitionEndListener, !1);
},
webkitTransitionEndHandler: function() {
this.setShowing(this.isOpen);
},
afterOpen: function() {
this.openClassName && this.addClass(this.openClassName), this.inherited(arguments);
},
prepareClose: function() {
this.openClassName && this.removeClass(this.openClassName), this.openInfo = null, this.inherited(arguments), this.clearSizeCache();
},
renderOpen: function() {
this.showHideMode != "manual" && this.show();
},
renderClose: function() {
this.showHideMode == "auto" && this.hide();
},
resize: function() {
var a = this.openInfo;
a && (this.clearSizeCache(), this[a.method].apply(this, a.args));
},
resizeHandler: function() {
this.resize(), this.inherited(arguments);
},
openAt: function(a) {
this.setOpenInfo(arguments), this.applyPosition(a), this.applyClampedSize(a), this.open();
},
setOpenInfo: function(a) {
if (!this.openInfo) {
var b = a.callee.nom;
b = b.split(".").pop().replace("()", "");
var c = enyo.cloneArray(a);
this.openInfo = {
method: b,
args: c
};
}
},
openAtEvent: function(a, b) {
this.setOpenInfo(arguments);
var c = {
left: a.centerX || a.clientX || a.pageX,
top: a.centerY || a.clientY || a.pageY
};
b && (c.left += b.left || 0, c.top += b.top || 0), c = this.clampPosition(enyo.mixin(c, this.calcSize())), this.openAt(c);
},
openAtControl: function(a, b) {
this.setOpenInfo(arguments);
var c = enyo.mixin({
width: 0,
height: 0,
top: 0,
left: 0
}, b), d = a.getOffset();
c.top += d.top, c.left += d.left;
var e = a.hasNode();
e && (c.width += e.offsetWidth, c.height += e.offsetHeight), this.openNear(c);
},
openAroundControl: function(a) {
this.setOpenInfo(arguments);
var b = a.getOffset(), c = {}, d = a.hasNode(), e, f;
d && (f = d.offsetHeight, e = d.offsetWidth);
var g = this.calcViewport();
c.top = b.top + f, c.right = g.width - (b.left + e), c.width = e, c.height = f, this.openNear(c, !0);
},
openNear: function(a, b) {
this.setOpenInfo(arguments);
var c = a, d = enyo.clone(c);
d.width = null, d.height = null;
var e = this.calcSize(), f = this.calcViewport();
if (c.top + e.height > f.height && c.top > f.height / 2) {
var g = c.height || 0;
g = b ? -g : g, d.bottom = f.height - (c.top + g), delete d.top;
}
c.left + e.width > f.width && c.left > f.width / 2 && (d.right = f.width - (c.left - (c.width || 0)), delete d.left), this.openAt(d);
},
openAtCenter: function() {
this.setOpenInfo(arguments), this.openAt(this.calcCenterPosition());
},
calcCenterPosition: function() {
var a = this.calcSize(), b = this.calcViewport(), c = {
left: Math.max(0, (b.width - a.width) / 2),
top: Math.max(0, (b.height - a.height) / 2)
};
return c;
},
getContentControl: function() {
return this.$[this.contentControlName] || this;
},
applyMaxSize: function(a) {
var b = this.getContentControl();
b.applyStyle("max-width", a.width + "px"), b.applyStyle("max-height", a.height + "px");
},
getMaxSize: function() {
var a = this.getContentControl().domStyles, b = !this._clampedHeight && parseInt(a["max-height"]), c = !this._clampedWidth && parseInt(a["max-width"]), d = 1e9;
return {
height: b || d,
width: c || d
};
},
showingChanged: function() {
this.inherited(arguments), this.showing || this.clearClampedSize();
},
applyClampedSize: function(a) {
var b = this.clampSize(a), c = this.getMaxSize();
b.width < c.width && (this._clampedWidth = !0, c.width = b.width), b.height < c.height && (this._clampedHeight = !0, c.height = b.height), this.applyMaxSize(c);
},
clearClampedSize: function() {
var a = this.getContentControl(), b = this.getMaxSize();
this._clampedWidth && a.applyStyle("max-width", null), this._clampedHeight && a.applyStyle("max-height", null), this._clampedHeight = this._clampedWidth = !1;
},
applyPosition: function(a) {
var b = a;
b.left !== undefined ? (this.applyStyle("left", b.left + "px"), this.applyStyle("right", "auto")) : b.right !== undefined && (this.applyStyle("right", b.right + "px"), this.applyStyle("left", "auto")), b.top !== undefined ? (this.applyStyle("top", b.top + "px"), this.applyStyle("bottom", "auto")) : b.bottom !== undefined && (this.applyStyle("bottom", b.bottom + "px"), this.applyStyle("top", "auto"));
},
clampPosition: function(a) {
var b = {}, c = a, d = this.calcViewport();
c.right ? b.right = Math.max(0, Math.min(d.width - c.width, c.right)) : b.left = Math.max(0, Math.min(d.width - c.width, c.left)), c.bottom ? b.bottom = Math.max(0, Math.min(d.height - c.height, c.bottom)) : b.top = Math.max(0, Math.min(d.height - c.height, c.top));
return b;
},
clampSize: function(a) {
var b = a || {}, c = this.calcViewport(), d = {
width: c.width - (b.left || b.right || 0),
height: c.height - (b.top || b.bottom || 0)
};
b.width && (d.width = Math.min(b.width, d.width)), b.height && (d.height = Math.min(b.height, d.height));
var e = this.calcSize();
this.getContentControl() != this && (d.height -= e.offsetHeight - e.clientHeight, d.width -= e.offsetWidth - e.clientWidth);
return d;
},
calcViewport: function() {
if (this._viewport) return this._viewport;
var a;
this.parent && this.parent.hasNode() ? a = enyo.getVisibleControlBounds(this.parent) : a = enyo.getVisibleBounds();
return this._viewport = a;
},
calcSize: function() {
this.generated || this.render();
if (this._size) return this._size;
if (this.hasNode()) {
var a = {
h: 0,
w: 0
}, b = this.node.style.display == "none";
b && (this.node.style.display = "block"), a.height = a.offsetHeight = this.node.offsetHeight, a.width = a.offsetWidth = this.node.offsetWidth, a.clientHeight = this.node.clientHeight, a.clientWidth = this.node.clientWidth, b && (this.node.style.display = "none");
return this._size = a;
}
},
clearSizeCache: function() {
this._viewport = null, this._size = null;
}
});

// base/controls/LabeledContainer.js

enyo.kind({
name: "enyo.LabeledContainer",
kind: enyo.HFlexBox,
published: {
label: ""
},
chrome: [ {
name: "label",
flex: 1
}, {
name: "client"
} ],
create: function(a) {
this.inherited(arguments), this.layout.align = "center", this.label = this.label || this.caption, this.labelChanged();
},
labelChanged: function() {
this.$.label.setContent(this.label);
}
});

// base/controls/Scrim.js

enyo.kind({
name: "enyo.Scrim",
kind: enyo.Control,
showing: !1,
className: "enyo-scrim",
create: function() {
this.inherited(arguments), this.zStack = [];
},
addZIndex: function(a) {
enyo.indexOf(a, this.zStack) < 0 && this.zStack.push(a);
},
removeZIndex: function(a) {
enyo.remove(a, this.zStack);
},
showAtZIndex: function(a) {
this.addZIndex(a), a != undefined && this.setZIndex(a), this.show();
},
hideAtZIndex: function(a) {
this.removeZIndex(a);
if (this.zStack.length) {
var b = this.zStack[this.zStack.length - 1];
this.setZIndex(b);
} else this.hide();
},
setZIndex: function(a) {
this.zIndex = a, this.applyStyle("z-index", a);
}
}), enyo.scrim = {
make: function() {
var a = new enyo.Scrim({
parentNode: document.body
});
a.renderNode();
return a;
},
show: function() {
enyo.scrim = enyo.scrim.make(), enyo.scrim.show();
},
showAtZIndex: function(a) {
enyo.scrim = enyo.scrim.make(), enyo.scrim.showAtZIndex(a);
},
hideAtZIndex: enyo.nop,
hide: enyo.nop,
destroy: enyo.nop
};

// base/controls/Progress.js

enyo.kind({
name: "enyo.Progress",
kind: enyo.Control,
published: {
maximum: 100,
minimum: 0,
position: 0,
snap: 1
},
lastPosition: -1,
statified: {
lastPosition: 0
},
create: function() {
this.inherited(arguments), this.positionChanged();
},
positionChanged: function(a) {
this.position = this.calcNormalizedPosition(this.position), this.lastPosition != this.position && (this.applyPosition(), this.lastPosition = this.position);
},
applyPosition: function() {},
calcNormalizedPosition: function(a) {
a = Math.max(this.minimum, Math.min(this.maximum, a));
return Math.round(a / this.snap) * this.snap;
},
calcRange: function() {
return this.maximum - this.minimum;
},
calcPercent: function(a) {
return Math.round(100 * (a - this.minimum) / this.calcRange());
},
calcPositionByPercent: function(a) {
return a / 100 * this.calcRange() + this.minimum;
}
});

// base/controls/LazyControl.js

enyo.kind({
name: "enyo.LazyControl",
kind: enyo.Control,
config: {},
hasKind: function() {
if (this.config) {
this.log("Energizing", this.name);
var a = this.manager, b = a.indexOfControl(this);
a.name == "client" && (a = a.manager), this.destroy();
var c = this.createControl(a);
this.moveControl(c.manager, c, b), this.renderControl(a, c);
return c;
}
return this;
},
createControl: function(a) {
this.config.name = this.name;
var b = a.createComponent(this.config);
b.hasKind || (b.hasKind = function() {
return !0;
});
return b;
},
moveControl: function(a, b, c) {
enyo.Control.prototype.removeControl.apply(a, [ b ]), a.controls.splice(c, 0, b);
},
renderControl: function(a, b) {
if (this.hasNode()) {
a.layout && a.layout.flow(a), a.flow && a.flow();
var c = b.generateHtml(), d = document.createElement("div");
d.innerHTML = c;
var e = b.node = d.firstChild;
this.node.parentNode.replaceChild(e, this.node), b.rendered();
}
},
destroy: function() {
this.setManager(null);
}
}), enyo.kind({
name: "enyo.LazyControl2",
kind: enyo.Control,
createComponent: function(a, b) {
if (!a.lazy) return this.inherited(arguments);
},
findByName: function(a, b) {
for (var c = 0, d; d = b[c]; c++) if (d.name == a) return d;
},
hasComponent: function(a) {
if (!this.$[a] && !this.findByName(a, this.controls)) {
var b = this.findByName(a, this.components);
if (b) {
b.lazy = !1;
var c = this.createComponent(b);
c.parent && (c.parent.flow(), c.render());
return c;
}
}
}
});

// base/containers/Box.js

enyo.kind({
name: "enyo.Box",
kind: enyo.Control,
create: function() {
this.inherited(arguments), this.addClass("enyo-box");
},
_flow: function(a, b, c, d, e, f) {
var g, h = 0, i = {}, j = "pad" in this ? Number(this.pad) : 0, k;
i[d] = j, i[e] = j;
var l = this.children;
for (var m = 0; k = l[m]; m++) {
h += j, k.addClass(f + "-div");
if (k[a] == "fill" || k[a] == "100%") break;
i[a] = g = Number(k[a]) || 96, i[b] = h, k.setBox(i, this.unit), h += g;
}
delete i[b];
if (k) {
var n = k, o = 0;
for (m = l.length - 1; k = l[m]; m--) {
k.addClass(f + "-div"), o += j;
if (k == n) break;
i[a] = g = Number(k[a]) || 96, i[c] = o, k.setBox(i, this.unit), o += g;
}
delete i[a], i[b] = h, i[c] = o, n.setBox(i, this.unit);
}
},
flow: function() {
this.orient == "h" ? this._flow("w", "l", "r", "t", "b", "enyo-hbox") : this._flow("h", "t", "b", "l", "r", "enyo-vbox");
},
getContent: function() {
this.flow();
return this.inherited(arguments);
}
}), enyo.kind({
name: "enyo.HBox",
kind: enyo.Box,
orient: "h"
}), enyo.kind({
name: "enyo.VBox",
kind: enyo.Box,
orient: "v"
});

// base/containers/BasicDrawer.js

enyo.kind({
name: "enyo.BasicDrawer",
kind: enyo.Control,
published: {
open: !0,
canChangeOpen: !0,
animate: !0
},
events: {
onOpenChanged: "",
onOpenAnimationComplete: ""
},
chrome: [ {
name: "client"
} ],
className: "enyo-drawer",
create: function(a) {
this.inherited(arguments), this.openChanged();
},
layoutKindChanged: function() {
this.$.client.setLayoutKind(this.layoutKind);
},
openChanged: function(a) {
this.canChangeOpen ? (this.hasNode() ? this.node.style.visibility = "visible" : this.applyStyle("visibility", "visible"), this.animate && this.hasNode() ? this.playAnimation() : (this.applyStyle("height", this.open ? "auto" : "0px"), this.applyStyle("visibility", this.open ? null : "hidden")), a != undefined && this.open != a && this.doOpenChanged()) : this.open = a;
},
getOpenHeight: function() {
return this.$.client.hasNode().offsetHeight;
},
playAnimation: function() {
if (this.hasNode()) {
var a = this.node.animation;
a && a.stop();
var b = this.node.offsetHeight, c = this.open ? this.getOpenHeight() : 0, d = this.domStyles;
d.height = c + "px", d.visibility = this.open ? null : "hidden", a = this.createComponent({
kind: "Animator",
onAnimate: "stepAnimation",
onEnd: "endAnimation",
node: this.node,
style: this.node.style,
open: this.open,
s: b,
e: c
}), a.duration = this.open ? 250 : 100, a.play(b, c), this.node.animation = a;
}
},
stepAnimation: function(a, b) {
a.style.height = Math.round(b) + "px";
},
endAnimation: function(a) {
a.style.height = a.open ? "auto" : "0px", a.style.visibility = a.open ? null : "hidden", a.node.animation = null, a.destroy(), this.doOpenAnimationComplete();
},
toggleOpen: function() {
this.setOpen(!this.open);
}
});

// base/containers/Drawer.js

enyo.kind({
name: "enyo.Drawer",
kind: enyo.Control,
published: {
open: !0,
canChangeOpen: !0,
animate: !0,
captionClassName: "",
caption: ""
},
events: {
onOpenChanged: "",
onOpenAnimationComplete: ""
},
chrome: [ {
name: "caption",
kind: enyo.Control,
onclick: "toggleOpen"
}, {
name: "client",
kind: enyo.BasicDrawer,
onOpenChanged: "doOpenChanged",
onOpenAnimationComplete: "doOpenAnimationComplete"
} ],
create: function(a) {
this.inherited(arguments), this.captionContainer = this.$.caption, this.captionChanged(), this.captionClassNameChanged(), this.canChangeOpenChanged(), this.animateChanged(), this.openChanged();
},
captionChanged: function() {
this.$.caption.setContent(this.caption), this.captionContainer.applyStyle("display", this.caption ? "block" : "none");
},
captionClassNameChanged: function(a) {
a && this.$.caption.removeClass(a), this.$.caption.addClass(this.captionClassName);
},
openChanged: function(a) {
this.canChangeOpen ? this.$.client.setOpen(this.open) : this.open = a;
},
canChangeOpenChanged: function() {
this.$.client.setCanChangeOpen(this.canChangeOpen);
},
animateChanged: function() {
this.$.client.setAnimate(this.animate);
},
open: function() {
this.setOpen(!0);
},
close: function() {
this.setOpen(!1);
},
toggleOpen: function() {
this.setOpen(!this.open);
}
});

// base/containers/Pane.js

enyo.kind({
name: "enyo.Pane",
kind: enyo.Control,
layoutKind: "PaneLayout",
published: {
transitionKind: "enyo.transitions.Fade"
},
view: null,
lastView: null,
events: {
onSelectView: "",
onCreateView: ""
},
maxHistory: 40,
create: function() {
this.queue = [], this.history = [], this.views = [], this.lazyViews = this.lazyViews || [], this.inherited(arguments), this.addClass("enyo-pane"), this.transitionKindChanged(), this.view = this.findDefaultView();
},
initComponents: function() {
this._extractLazyViews("components"), this._extractLazyViews("kindComponents", this), this.inherited(arguments);
},
_extractLazyViews: function(a, b) {
var c = this[a];
if (c) {
var d = [];
for (var e = 0, f; f = c[e]; e++) f.lazy ? (b && (f = enyo.mixin(enyo.clone(f), {
owner: b
})), this.lazyViews.push(f)) : d.push(f);
this[a] = d;
}
},
addControl: function(a) {
this.inherited(arguments), this.controlIsView(a) ? this.addView(a) : this.finishTransition();
},
removeControl: function(a) {
this.controlIsView(a) && (this.finishTransition(), this.removeView(a)), this.inherited(arguments);
},
controlIsView: function(a) {
return !a.isChrome;
},
transitioneeForView: function(a) {
return a;
},
findDefaultView: function() {
return this.getViewList()[0];
},
addView: function(a) {
this.views.push(a);
},
removeView: function(a) {
enyo.remove(a, this.views), this.removeHistoryItem(a);
},
flow: function() {
var a = this.getControls();
for (var b = 0, c; c = a[b]; b++) c != this.view && !this.$.transition.isTransitioningView(c) && c.applyStyle("display", "none");
this.inherited(arguments);
},
getContent: function() {
this.finishTransition(), this.flow();
return this.inherited(arguments);
},
_selectView: function(a) {
this.lastView = this.view, this.view = a, this.transitionView(this.lastView, this.view);
},
_selectViewBack: function(a) {
this._selectView(a), this.doSelectView(this.view, this.lastView);
},
reallySelectView: function(a) {
a != this.view && (this._selectView(a), this.addHistoryItem(this.lastView)), this.view.resized(), this.doSelectView(this.view, this.lastView);
},
selectView: function(a, b) {
b ? this.reallySelectView(a) : enyo.asyncMethod(this, "reallySelectView", a);
},
selectViewByName: function(a, b) {
var c = this.viewByName(a);
c && this.selectView(c, b);
return c;
},
selectViewByIndex: function(a, b) {
var c = this.viewByIndex(a);
c && this.selectView(c, b);
return c;
},
getViewList: function() {
return this.views;
},
getViewCount: function() {
return this.getViewList().length;
},
getView: function() {
return this.view;
},
getViewIndex: function() {
return this.indexOfView(this.view);
},
getViewName: function() {
return this.view && this.view.name;
},
validateView: function(a) {
return this.viewByName(a);
},
viewByName: function(a) {
var b = this.getViewList();
for (var c = 0, d; d = b[c]; c++) if (d.name == a) return d;
return this.createView(a);
},
viewByIndex: function(a) {
return this.getViewList()[a];
},
indexOfView: function(a) {
var b = this.getViewList();
return enyo.indexOf(a, b);
},
findLazyView: function(a) {
for (var b = 0, c; c = this.lazyViews[b]; b++) if (c.name == a) return c;
},
createView: function(a) {
var b = this.findLazyView(a) || this.doCreateView(a);
if (b) {
var c = this.createManagedComponent(b);
this.flow(), c.render();
return c;
}
},
transitionView: function(a, b) {
if (this._transitioning) this.addToQueue({
from: a,
to: b
}); else if (a != b) {
var c = this.transitioneeForView(b);
c && c.start && enyo.asyncMethod(c, c.start), a && this.dispatch(this.owner, a.onHide), this.hasNode() ? (this._transitioning = !0, this.$.transition.viewChanged(a, b)) : this.transitionDone(a, b);
}
},
transitionDone: function(a, b) {
this._transitioning = !1, a && a.setShowing(!1), b && (b.setShowing(!0), this.selectNextInQueue() || this.dispatch(this.owner, b.onShow));
},
transitionKindChanged: function() {
this.$.transition && this.$.transition.destroy(), this.createComponent({
name: "transition",
kind: this.transitionKind,
pane: this
});
},
finishTransition: function() {
this._transitioning && (this.queue = [], this.$.transition.done ? this.$.transition.done() : this.transitionDone());
},
addToQueue: function(a) {
this.queue.push(a);
},
selectNextInQueue: function() {
var a = this.queue.shift();
if (a) {
this.transitionView(a.from, a.to);
return !0;
}
},
addHistoryItem: function(a) {
this.history.push(this.indexOfView(a)) > this.maxHistory && this.history.shift();
},
removeHistoryItem: function(a) {
var b = this.getViewList();
while (enyo.indexOf(a, b) > -1) enyo.remove(a, b);
a == this.lastView && (this.lastView = this.history[this.history.length - 1] || 0);
},
backHandler: function(a, b) {
this.back(b);
},
back: function(a) {
if (this.history.length) {
a && a.preventDefault();
var b = this.indexOfView(this.view);
do var c = this.history.pop(); while (c == b);
c >= 0 && this._selectViewBack(this.viewByIndex(c));
}
},
next: function() {
this.selectViewByIndex((this.indexOfView(this.view) + 1) % this.getViewCount());
}
});

// base/containers/PaneLayout.js

enyo.kind({
name: "enyo.PaneLayout",
flow: function(a) {
for (var b = 0, c = a.getViewList(), d; d = c[b]; b++) d.addClass("enyo-view");
}
});

// base/containers/Transitions.js

enyo.transitions = {}, enyo.kind({
name: "enyo.transitions.Simple",
kind: enyo.Component,
viewChanged: function(a, b) {
this.fromView = a, this.toView = b, this.begin();
},
isTransitioningView: function(a) {
return a == this.fromView || a == this.toView;
},
begin: function() {
var a = this.pane.transitioneeForView(this.fromView);
a && a.hide();
var b = this.pane.transitioneeForView(this.toView);
b && b.show(), this.done();
},
done: function() {
this.pane.transitionDone(this.fromView, this.toView);
}
}), enyo.kind({
name: "enyo.transitions.LeftRightFlyin",
kind: enyo.transitions.Simple,
duration: 300,
begin: function() {
var a, b, c = this.pane.transitioneeForView(this.fromView);
c && c.hasNode() && (b = c.node.style, b.zIndex = 1), c1 = this.pane.transitioneeForView(this.toView), c1 && c1.hasNode() && (a = c1.node.style, a.zIndex = 2, a.display = "");
var d = this.pane.hasNode().offsetWidth;
a && this.flyin("left", d, 0, this.duration, a, b);
},
flyin: function(a, b, c, d, e, f) {
var g = c - b, h = this, i = -1, j = function() {
i == -1 && (i = (new Date).getTime());
var c = enyo.easedLerp(i, d, enyo.easing.cubicOut), k = b + c * g;
e[a] = Math.max(k, 0) + "px", c < 1 ? h.handle = setTimeout(j, 30) : (f && (f.display = "none"), h.done());
};
e[a] = Math.max(b, 0) + "px", this.handle = setTimeout(j, 10);
},
done: function() {
clearTimeout(this.handle);
var a = this.pane.transitioneeForView(this.fromView);
if (a && a.hasNode()) {
var b = a.node.style;
b.left = "", b.right = "0px", b.display = "", b.zIndex = null, b.top = null;
}
this.inherited(arguments);
}
}), enyo.kind({
name: "enyo.transitions.Fade",
kind: enyo.transitions.Simple,
duration: 300,
begin: function() {
var a = this.pane.transitioneeForView(this.fromView);
if (a && a.hasNode()) {
var b = a.node.style;
b.zIndex = 1;
}
var c = this.pane.transitioneeForView(this.toView);
if (c && c.hasNode()) {
var d = c.node.style;
d.zIndex = 2, d.opacity = 0, d.display = "";
}
b && d ? this.fade(this.duration, b, d) : this.done();
},
fade: function(a, b, c) {
var d = this, e = -1, f = function() {
e == -1 && (e = (new Date).getTime());
var g = enyo.easedLerp(e, a, enyo.easing.cubicOut);
c.opacity = g, g < 1 ? d.handle = setTimeout(f, 1) : (b && (b.display = "none"), d.done());
};
this.handle = setTimeout(f, 10);
},
done: function() {
clearTimeout(this.handle);
var a = this.pane.transitioneeForView(this.toView);
if (a && a.hasNode()) {
var b = a.node.style;
b.position = null, b.display = "", b.zIndex = null, b.opacity = null, b.top = null;
}
this.inherited(arguments);
}
});

// base/containers/FloatingHeader.js

enyo.kind({
name: "enyo.FloatingHeader",
kind: enyo.Control,
className: "enyo-floating-header"
});

// base/services/BasicService.js

enyo.kind({
name: "enyo.BasicService",
kind: enyo.Component,
published: {
service: "",
timeout: 0
},
events: {
onSuccess: "",
onFailure: "",
onResponse: ""
},
requestKind: "Request",
masterService: enyo.nob,
create: function() {
this.defaultKind = this.kindName, this.inherited(arguments);
},
importProps: function(a) {
this.inherited(arguments);
var b = this.masterService;
this.service = this.service || b.service, this.onResponse = this.onResponse || b.onResponse, this.onSuccess = this.onSuccess || b.onSuccess, this.onFailure = this.onFailure || b.onFailure;
},
adjustComponentProps: function(a) {
this.inherited(arguments), a.masterService = this;
},
makeRequestProps: function(a) {
var b = {
kind: this.requestKind,
timeout: this.timeout
};
a && enyo.mixin(b, a);
return b;
},
cancel: function() {
this.destroyComponents();
},
request: function(a) {
return this.createComponent(this.makeRequestProps(a));
},
response: function(a) {
this.doResponse(a.response, a);
},
responseSuccess: function(a) {
this.doSuccess(a.response, a);
},
responseFailure: function(a) {
this.doFailure(a.response, a);
}
}), enyo.kind({
name: "enyo.Request",
kind: enyo.Component,
events: {
onRequestSuccess: "responseSuccess",
onRequestFailure: "responseFailure",
onRequestResponse: "response"
},
create: function() {
this.inherited(arguments), this.startTimer(), this.call();
},
destroy: function() {
this.endTimer(), this.inherited(arguments);
},
call: function() {},
isFailure: function(a) {
return !Boolean(a);
},
setResponse: function(a) {
this.response = a;
},
receive: function(a) {
this.destroyed || (this.endTimer(), this.setResponse(a), this.processResponse());
},
processResponse: function() {
this.isFailure(this.response) ? this.doRequestFailure() : this.doRequestSuccess(), this.doRequestResponse(), this.finish();
},
startTimer: function() {
this.startTime = Date.now(), this.timeout && (this.timeoutJob = setTimeout(enyo.bind(this, "timeoutComplete"), this.timeout));
},
endTimer: function() {
clearTimeout(this.timeoutJob), this.endTime = Date.now(), this.latency = this.endTime - this.startTime;
},
timeoutComplete: function() {
this.didTimeout = !0, this.receive();
},
finish: function() {
this.destroy();
}
});

// base/services/Service.js

enyo.kind({
name: "enyo.Service",
kind: enyo.BasicService,
methodHandlers: {},
call: function(a, b) {
var c = b || {};
c.params = c.params || a || this.params || {};
var d = this.findMethodHandler(c.method || this.method) || "request";
return this[d](c);
},
cancelCall: function(a) {
enyo.call(this.$[a], "destroy");
},
findMethodHandler: function(a) {
if (a in this.methodHandlers) return this.methodHandlers[a] || a;
},
makeRequestProps: function(a) {
var b = {
onResponse: this.onResponse,
onSuccess: this.onSuccess,
onFailure: this.onFailure
}, c = this.inherited(arguments);
return enyo.mixin(b, c);
},
dispatchResponse: function(a, b) {
this.dispatch(this.owner, a, [ b.response, b ]);
},
response: function(a) {
this.dispatchResponse(a.onResponse, a);
},
responseSuccess: function(a) {
this.dispatchResponse(a.onSuccess, a);
},
responseFailure: function(a) {
this.dispatchResponse(a.onFailure, a);
}
});

// base/services/MockService.js

enyo.kind({
name: "enyo.MockService",
kind: enyo.Service,
requestKind: "MockService.Request",
published: {
method: "",
subscribe: !1
},
importProps: function(a) {
a.method = a.method || a.name, this.inherited(arguments);
},
call: function() {
return this.request({
method: this.method,
subscribe: this.subscribe
});
}
}), enyo.kind({
name: "enyo.MockService.Request",
kind: enyo.Request,
destroy: function() {
this.inherited(arguments), clearInterval(this.job);
},
_call: function() {
setTimeout(enyo.bind(this, "receive", this.makeResponse()), enyo.irand(200) + 100);
},
call: function() {
this._call(), this.subscribe && (this.job = setInterval(enyo.bind(this, "_call"), 3e3));
},
makeResponse: function() {
return enyo.irand(1e3) + 1e3;
},
isFailure: function(a) {
return a < 1250;
},
finish: function() {
this.subscribe || this.destroy();
}
});

// base/services/WebService.js

enyo.kind({
name: "enyo.WebService",
kind: enyo.Service,
requestKind: "WebService.Request",
published: {
url: "",
method: "GET",
handleAs: "json",
contentType: "application/x-www-form-urlencoded",
sync: !1,
headers: null,
username: "",
password: ""
},
constructor: function() {
this.inherited(arguments), this.headers = {};
},
makeRequestProps: function(a) {
var b = {
params: a,
url: this.url,
method: this.method,
handleAs: this.handleAs,
contentType: this.contentType,
sync: this.sync,
headers: this.headers,
username: this.username,
password: this.password
};
return enyo.mixin(b, this.inherited(arguments));
}
}), enyo.kind({
name: "enyo.WebService.Request",
kind: enyo.Request,
call: function() {
var a = this.params || "";
a = enyo.isString(a) ? a : enyo.objectToQuery(a);
var b = this.url;
this.method == "GET" && a && (b += (b.indexOf("?") >= 0 ? "&" : "?") + a, a = null);
var c = {};
c["Content-Type"] = this.contentType, enyo.mixin(c, this.headers), enyo.xhr.request({
url: b,
method: this.method,
callback: enyo.bind(this, "receive"),
body: a,
headers: c,
sync: window.PalmSystem ? !1 : this.sync,
username: this.username,
password: this.password
});
},
isFailure: function(a) {
var b = this.xhr;
return !b || !this.isSuccess(b.status);
},
isSuccess: function(a) {
return !a || a >= 200 && a < 300;
},
receive: function(a, b) {
this.xhr = b, this.inherited(arguments, [ b ]);
},
setResponse: function(a) {
var b;
switch (this.handleAs) {
case "json":
try {
var c = a.responseText;
b = c && enyo.json.parse(c);
} catch (d) {
this.log("responseText is not in JSON format"), this.log(d), this.log(c), b = c;
}
break;
case "xml":
b = a.responseXML;
break;
default:
b = a.responseText;
}
this.response = b;
}
});

// base/media/sound.js

enyo.kind({
name: "enyo.Sound",
kind: enyo.Component,
published: {
src: "",
preload: !0
},
create: function() {
this.inherited(arguments), this.srcChanged(), this.preloadChanged();
},
srcChanged: function() {
var a = enyo.path.rewrite(this.src);
window.PhoneGap ? this.media = new Media(a) : (this.audio = new Audio, this.audio.src = a);
},
preloadChanged: function() {},
play: function() {
window.PhoneGap ? this.media.play() : this.audio.paused ? this.audio.play() : this.audio.currentTime = 0;
}
});

// base/media/video.js

enyo.kind({
name: "enyo.Video",
kind: enyo.Control,
published: {
src: "",
showControls: !0,
autoplay: !1,
loop: !1
},
nodeTag: "video",
create: function() {
this.inherited(arguments), this.srcChanged(), this.showControlsChanged(), this.autoplayChanged();
},
srcChanged: function() {
var a = enyo.path.rewrite(this.src);
this.setAttribute("src", a);
},
showControlsChanged: function() {
this.setAttribute("controls", this.showControls ? "controls" : null);
},
autoplayChanged: function() {
this.setAttribute("autoplay", this.autoplay ? "autoplay" : null);
},
loopChanged: function() {
this.setAttribute("loop", this.loop ? "loop" : null);
},
play: function() {
this.hasNode() && (this.node.paused ? this.node.play() : this.node.currentTime = 0);
},
pause: function() {
this.hasNode() && this.node.pause();
}
});

// palm/platform/startup.js

(function() {
enyo.requiresWindow = function(b) {
enyo.isBuiltin && a ? a.push(b) : b();
};
var a = [];
enyo.hasWindow = function() {
for (var b = 0, c; c = a[b]; b++) c();
a = null;
};
})();

//
// this code specially inserted by builder tool
//
enyo.requiresWindow(function(){enyo.sheet(enyo.path.rewrite("$enyo/enyo-build.css"));});
enyo.paths({"kernel":"$enyo/kernel/","g11n":"$enyo/g11n/","g11n-base":"$enyo/g11n/base/","dom":"$enyo/dom/","compatibility":"$enyo/compatibility/","base":"$enyo/base/","base-layout":"$enyo/base/layout/","base-scroller":"$enyo/base/scroller/","base-list":"$enyo/base/list/","base-repeaters":"$enyo/base/repeaters/","base-controls":"$enyo/base/controls/","base-containers":"$enyo/base/containers/","base-services":"$enyo/base/services/","base-media":"$enyo/base/media/","base-themes-default-theme":"$enyo/base/themes/default-theme/","palm":"$enyo/palm/","palm-platform":"$enyo/palm/platform/","palm-system":"$enyo/palm/system/","palm-layout":"$enyo/palm/layout/","palm-controls":"$enyo/palm/controls/","palm-containers":"$enyo/palm/containers/","palm-services":"$enyo/palm/services/","palm-list":"$enyo/palm/list/","palm-tellurium":"$enyo/palm/tellurium/","palm-themes-Onyx":"$enyo/palm/themes/Onyx/","enyo-lib":"$enyo/../lib/"});
//
//
//


// palm/system/system.js

enyo.fittingClassName = "enyo-fit", enyo.fetchConfigFile = function(a) {
if (a) {
var b = enyo.windows.getRootWindow();
if (b.enyo) return b.enyo.xhr.request({
url: a,
sync: !0
}).responseText;
}
}, enyo.logTimers = function(a) {
var b = a ? " (" + a + ")" : "";
console.log("*** Timers " + b + " ***");
var c = enyo.time.timed;
for (var d in c) console.log(d + ": " + c[d] + "ms");
console.log("***************");
}, enyo.setAllowedOrientation = function(a) {
enyo._allowedOrientation = a, window.PalmSystem && PalmSystem.setWindowOrientation(a);
}, enyo.getWindowOrientation = function() {
if (window.PalmSystem) return PalmSystem.screenOrientation;
}, enyo.sendOrientationChange = function() {
var a = enyo.getWindowOrientation();
a != enyo.lastWindowOrientation && enyo.dispatch({
type: "windowRotated",
orientation: a
}), enyo.lastWindowOrientation = a;
}, enyo.setFullScreen = function(a) {
window.PalmSystem && window.PalmSystem.enableFullScreenMode(a);
}, enyo.ready = function() {
window.PalmSystem && (setTimeout(function() {
PalmSystem.stageReady();
}, 1), enyo.setAllowedOrientation(enyo._allowedOrientation ? enyo._allowedOrientation : "free"));
}, enyo.fetchAppId = function() {
if (window.PalmSystem) return PalmSystem.identifier.split(" ")[0];
}, enyo.fetchAppRootPath = function() {
var a = enyo.windows.getRootWindow(), b = a.document, c = b.baseURI.match(new RegExp(".*://[^#]*/"));
if (c) return c[0];
}, enyo.fetchAppInfo = function() {
var a = enyo.fetchConfigFile("appinfo.json");
try {
return enyo.json.parse(a);
} catch (b) {
console.warn("Could not parse appInfo: " + b);
}
}, enyo.fetchFrameworkConfig = function() {
var a = enyo.fetchConfigFile("framework_config.json");
try {
return enyo.json.parse(a);
} catch (b) {
console.warn("Could not parse framework_config: " + b);
}
}, enyo.fetchRootFrameworkConfig = function() {
var a = enyo.fetchConfigFile("$enyo/framework_config.json");
}, enyo.fetchDeviceInfo = function() {
if (window.PalmSystem) return JSON.parse(PalmSystem.deviceInfo);
return undefined;
}, enyo.requiresWindow(function() {
window.addEventListener("load", enyo.ready, !1), window.addEventListener("resize", enyo.sendOrientationChange, !1);
});

// palm/system/keyboard.js

Mojo = window.Mojo || {}, Mojo.positiveSpaceChanged = function(a, b) {
enyo.keyboard.heightChanged(window.innerHeight - b), enyo.dispatch({
type: "resize"
});
}, enyo.dispatcher.features.push(function(a) {
if (enyo.keyboard.events[a.type]) return enyo.keyboard[a.type](a);
}), enyo.getVisibleBounds = function() {
return {
width: window.innerWidth,
height: window.innerHeight - enyo.keyboard.height
};
}, enyo.keyboard = {
height: 0,
events: {
resize: 1,
focus: 1,
keydown: 1
},
resizesWindow: !0,
heightChanged: function(a) {
this.height = a, this.scrollIntoView(), !a && this.scroller && (this.scroller.stop(), this.scroller.start(), this.scroller = null);
},
setResizesWindow: function(a) {
this.resizesWindow = a, this.resizesWindow && this.heightChanged(0), window.PalmSystem && (PalmSystem.allowResizeOnPositiveSpaceChange ? PalmSystem.allowResizeOnPositiveSpaceChange(a) : console.log("Keyboard resizing cannot be changed."));
},
scrollIntoView: function() {
enyo.job("enyo.keyboard.scrollIntoView", enyo.bind(enyo.keyboard, "_scrollIntoView"), 100);
},
_scrollIntoView: function() {
var a = this.findFocusedScroller();
if (a) {
this.scroller = a;
var b = this.getCaretPosition();
a.scrollOffsetIntoView(b.y, b.x, b.height);
} else this.scroller && this.scroller.start();
},
findFocusedScroller: function() {
var a = document.activeElement, b;
while (a) {
b = enyo.$[a.id];
if (b instanceof enyo.DragScroller) return b;
a = a.parentNode;
}
},
getCaretPosition: function() {
if (window.caretRect) {
var a = window.caretRect();
if (a.x != 0 || a.y != 0) return a;
var b = enyo.dispatcher.findDispatchTarget(document.activeElement);
(!b.caretRect || b.caretRect.x == 0 || b.caretRect.y == 0) && console.log("window.caretRect failed");
return b.caretRect;
}
return this.getSimulatedCaretPosition();
},
resize: function() {
enyo.keyboard.scrollIntoView();
},
focus: function() {
enyo.keyboard.scrollIntoView();
},
keydown: function(a) {
a.keyCode != 9 && enyo.keyboard.scrollIntoView();
},
getSimulatedCaretPosition: function() {
var a = enyo.dispatcher.findDispatchTarget(document.activeElement), b = {
x: 0,
y: 0,
height: 30,
width: 0
};
if (a) {
var c = a.getOffset();
b.x = c.left, b.y = c.top;
}
return b;
}
};

// palm/system/windows/windows.js

enyo.windows = {
openWindow: function(a, b, c, d, e) {
var f = d || {};
f.window = f.window || "card";
var g = this.getRootWindow(), h = this.fetchWindow(b);
h ? (console.warn('Window "' + b + '" already exists, activating it'), this.activateWindow(h, c)) : (h = this.agent.open(g, a, b || "", f, e), this.finishOpenWindow(h, c));
return h;
},
finishOpenWindow: function(a, b) {
a.name = enyo.windows.ensureUniqueWindowName(a, a.name), this.assignWindowParams(a, b), this.manager.addWindow(a);
},
ensureUniqueWindowName: function(a, b) {
var c = this.getWindows(), d = c[b];
return !this.agent.isValidWindowName(b) || d && d != a ? this.calcUniqueWindowName() : b;
},
calcUniqueWindowName: function() {
var a = this.getWindows(), b = "window";
for (var c = 1, d; Boolean(a[d = b + (c > 1 ? String(c) : "")]); c++) ;
return d;
},
openDashboard: function(a, b, c, d) {
d = d || {}, d.window = "dashboard";
return this.openWindow(a, b, c, d);
},
openPopup: function(a, b, c, d, e) {
var f = this.openWindow(a, b, c, {
window: "popupalert"
}, "height=" + (d || 200));
e && f.PalmSystem && f.PalmSystem.addNewContentIndicator();
return f;
},
activate: function(a, b, c, d, e) {
var f = this.fetchWindow(a);
f ? this.activateWindow(f, c) : b && (f = this.openWindow(b, a, c, d, e));
return f;
},
activateWindow: function(a, b) {
this.agent.activate(a), b && this.setWindowParams(a, b);
},
deactivate: function(a) {
var b = this.fetchWindow(a);
this.deactivateWindow(b);
},
deactivateWindow: function(a) {
a && this.agent.deactivate(a);
},
addBannerMessage: function() {
this.agent.addBannerMessage.apply(this.agent, arguments);
},
removeBannerMessage: function(a) {
this.agent.removeBannerMessage.apply(this.agent, arguments);
},
setWindowParams: function(a, b) {
a.postMessage("enyoWindowParams=" + enyo.json.stringify(b), "*");
},
assignWindowParams: function(a, b) {
var c = b && enyo.isString(b) ? enyo.json.parse(b) : b || {};
a.enyo = a.enyo || {}, a.enyo.windowParams = c || {};
},
fetchWindow: function(a) {
return this.manager.fetchWindow(a);
},
getRootWindow: function() {
return this.manager.getRootWindow();
},
getWindows: function() {
return this.manager.getWindows();
},
getActiveWindow: function() {
return this.manager.getActiveWindow();
},
renameWindow: function(a, b) {
this.manager.removeWindow(a), a.name = enyo.windows.ensureUniqueWindowName(a, b), this.manager.addWindow(a);
return a.name;
}
};

// palm/system/windows/agent.js

enyo.windows.agent = {
open: function(a, b, c, d, e) {
var f = enyo.makeAbsoluteUrl(window, b), g = d && enyo.isString(d) ? d : enyo.json.stringify(d), g = "attributes=" + g, h = e ? e + ", " : "";
return a.open(f, c, h + g);
},
activate: function(a) {
a.PalmSystem && a.PalmSystem.activate();
},
deactivate: function(a) {
a.PalmSystem && a.PalmSystem.deactivate();
},
addBannerMessage: function() {
PalmSystem.addBannerMessage.apply(PalmSystem, arguments);
},
removeBannerMessage: function(a) {
PalmSystem.removeBannerMessage.apply(removeBannerMessage, arguments);
},
isValidWindow: function(a) {
return Boolean(a && !a.closed && a.PalmSystem);
},
isValidWindowName: function(a) {
return a;
}
};

// palm/system/windows/browserAgent.js

enyo.windows.browserAgent = {
open: function(a, b, c, d, e) {
var f = enyo.makeAbsoluteUrl(window, b), g = a.document, h = g.createElement("iframe");
h.src = f, h.setAttribute("frameborder", 0);
var i = (e || "").match(/height=(.*)($|,)/), j = i && i[1] || d.window == "dashboard" && 96;
j ? h.style.cssText = "position:absolute; bottom: 0px; height: " + j + "px; width:100%" : h.style.cssText = "position:absolute; width:100%;height:100%;", g.body.appendChild(h);
var k = h.contentWindow;
k.name = c, k.close = function() {
this.frameElement.parentNode.removeChild(this.frameElement);
};
return k;
},
activate: function(a) {
var b = enyo.windows.getWindows(), c;
for (var d in b) c = b[d].frameElement, c && (c.style.display = a.name == d ? "" : "none");
a.enyo.windows.events.handleActivated();
},
deactivate: function(a) {
var b = a.frameElement;
b && (b.style.zIndex = -1), a.enyo.windows.events.handleDeactivated();
},
addBannerMessage: function() {
console.log("addBannerMessage", arguments);
},
removeBanner: function() {
console.log("removeBanner");
},
isValidWindow: function(a) {
return Boolean(a && !a.closed);
},
isValidWindowName: function(a) {
return a && a.charAt(0) != "<";
},
asyncActivate: function() {
enyo.asyncMethod(enyo.windows, "activateWindow", window);
}
}, enyo.requiresWindow(function() {
window.PalmSystem || (enyo.dispatcher.features.push(function(a) {
a.type == "keydown" && a.ctrlKey && a.keyCode == 192 && enyo.appMenu.toggle();
}), enyo.mixin(enyo.windows.agent, enyo.windows.browserAgent), window.addEventListener("unload", function() {
enyo.windows.events.handleDeactivated();
var a = window.parent;
a.enyo.windows.agent.asyncActivate();
}, !1), window.addEventListener("load", function() {
enyo.windows.activateWindow(window);
}));
});

// palm/system/windows/events.js

enyo.windows.events = {
dispatchEvent: function(a, b) {
a.enyo.dispatch(b);
},
handleAppMenu: function(a) {
var b = enyo.windows.getActiveWindow();
if (b && a["palm-command"] == "open-app-menu") if (b.enyo) {
b.enyo.appMenu.toggle();
return !0;
}
},
handleActivated: function() {
this.dispatchEvent(window, {
type: "windowActivated"
});
},
handleDeactivated: function() {
enyo.appMenu.close(), this.dispatchEvent(window, {
type: "windowDeactivated"
});
},
handleWindowHidden: function() {
this.dispatchEvent(window, {
type: "windowHidden"
});
},
handleWindowShown: function() {
this.dispatchEvent(window, {
type: "windowShown"
});
},
handleRelaunch: function() {
var a = enyo.windows.getRootWindow(), b = PalmSystem.launchParams;
b = b && enyo.json.parse(b);
if (this.handleAppMenu(b)) return !0;
enyo.windows.assignWindowParams(a, b), enyo.windows.setWindowParams(a, b);
return this.dispatchApplicationRelaunch(a);
},
dispatchWindowParamsChange: function(a) {
var b = a.enyo.windowParams, c = "windowParamsChange", d = c + "Handler";
this.dispatchEvent(a, {
type: c,
params: b
}), enyo.call(a.enyo, d, [ b ]);
},
dispatchApplicationRelaunch: function(a) {
var b = a.enyo.windowParams, c = "applicationRelaunch", d = c + "Handler", e = {
type: c,
params: b
};
this.dispatchEvent(a, e);
var f = enyo.call(a.enyo, d, [ b ]), g = enyo.call(enyo.application, d, [ b ]);
return Boolean(e.handler || f || g);
}
}, Mojo = window.Mojo || {}, Mojo.stageActivated = function() {
enyo.windows.events.handleActivated();
}, Mojo.stageDeactivated = function() {
enyo.windows.events.handleDeactivated();
}, Mojo.hide = function() {
enyo.windows.events.handleWindowHidden();
}, Mojo.show = function() {
enyo.windows.events.handleWindowShown();
}, Mojo.relaunch = function() {
return enyo.windows.events.handleRelaunch();
}, Mojo.lowMemoryNotification = function(a) {
enyo.dispatch({
type: "lowMemory",
state: a.state
});
};

// palm/system/windows/manager.js

enyo.windows.manager = {
getRootWindow: function() {
return window.opener || window.rootWindow || window.top || window;
},
getWindows: function() {
var a = this.getRootWindow(), b = a.enyo.windows.manager, c = b._windowList, d = {};
for (var e in c) this.isValidWindow(c[e]) && (d[e] = c[e]);
b._windowList = d;
return d;
},
_windowList: {},
isValidWindow: function(a) {
return enyo.windows.agent.isValidWindow(a);
},
addWindow: function(a) {
var b = this.getWindows();
b[a.name] = a;
},
removeWindow: function(a) {
var b = this.getWindows();
delete b[a.name];
},
fetchWindow: function(a) {
var b = this.getWindows();
return b[a];
},
getActiveWindow: function() {
var a = this.getWindows(), b;
for (var c in a) {
b = a[c];
if (b.PalmSystem.isActivated) return b;
}
},
resetRootWindow: function(a) {
var b = this.getWindows(), c, d = this.findRootableWindow(b);
if (d) {
this.transferRootToWindow(d, a);
for (var e in b) c = b[e], c.rootWindow = c == d ? null : d, this.setupApplication(c);
}
},
findRootableWindow: function(a) {
var b;
for (var c in a) {
b = a[c];
if (b.enyo && b.enyo.windows) return a[c];
}
},
setupApplication: function(a) {
var b = a.enyo;
b.application = (b.windows.getRootWindow().enyo || b).application || {};
},
transferRootToWindow: function(a, b) {
var c = a.enyo.windows.manager, d = b.enyo.windows.manager;
c._windowList = enyo.clone(d._windowList), c._activeWindow = d._activeWindow;
},
addUnloadListener: function() {
window.addEventListener("unload", enyo.hitch(this, function() {
this.removeWindow(window), this.getRootWindow() == window && this.resetRootWindow(window);
}), !1);
},
addLoadListener: function() {
window.addEventListener("load", function() {
enyo.windows.events.dispatchWindowParamsChange(window);
}, !1);
},
addMessageListener: function() {
window.addEventListener("message", function(a) {
var b = "enyoWindowParams=";
a.data.indexOf(b) === 0 && (enyo.windows.assignWindowParams(window, a.data.slice(b.length)), enyo.windows.events.dispatchWindowParamsChange(window));
}, !1);
}
}, enyo.requiresWindow(function() {
var a = enyo.windowParams || window.PalmSystem && PalmSystem.launchParams;
!a && enyo.args.enyoWindowParams && (a = decodeURIComponent(enyo.args.enyoWindowParams)), enyo.windows.finishOpenWindow(window, a);
var b = enyo.windows.manager;
b.addUnloadListener(), b.addLoadListener(), b.addMessageListener(), b.setupApplication(window);
});

// palm/system/Dashboard.js

enyo.kind({
name: "enyo.Dashboard",
kind: enyo.Component,
published: {
layers: null,
smallIcon: ""
},
events: {
onIconTap: "",
onMessageTap: "",
onTap: "",
onUserClose: "",
onLayerSwipe: ""
},
indexPath: "$palm-system/dashboard-window/dashboard.html",
create: function() {
this.inherited(arguments), this.layers = [];
},
destroy: function() {
this.layers.length = 0, this.updateWindow(), this.inherited(arguments);
},
push: function(a) {
a && (this.layers.push(a), this.updateWindow());
},
pop: function() {
var a = this.layers.pop();
this.updateWindow();
return a;
},
setLayers: function(a) {
this.layers = a.slice(0), this.updateWindow();
},
updateWindow: function() {
var a = this.window && this.window.closed === !1;
if (this.layers.length) {
var b = {
layers: this.layers,
docPath: document.location.pathname,
onTap: "dbTapped",
onIconTap: "iconTapped",
onMessageTap: "msgTapped",
onUserClose: "userClosed",
onLayerSwipe: "layerSwiped"
};
if (a) enyo.windows.activate(this.name, undefined, b); else {
var c = {
webosDragMode: "manual"
};
this.smallIcon && (c.icon = this.smallIcon), this.window = enyo.windows.openDashboard(enyo.path.rewrite(this.indexPath), this.name, b, c), this.window.dashboardOwner = this;
}
} else a && this.window.close(), this.window = undefined;
},
dbTapped: function(a, b, c) {
this.doTap(b, c);
},
msgTapped: function(a, b, c) {
this.doMessageTap(b, c);
},
iconTapped: function(a, b, c) {
this.doIconTap(b, c);
},
layerSwiped: function(a, b) {
this.layers.pop(), this.doLayerSwipe(b);
},
userClosed: function(a) {
this.layers.length = 0, this.doUserClose();
}
});

// palm/system/CrossAppUI.js

enyo.kind({
name: "enyo.CrossAppUI",
kind: enyo.Iframe,
published: {
app: "",
path: "",
params: null
},
events: {
onResult: ""
},
components: [ {
name: "getAppPath",
kind: "enyo.PalmService",
service: "palm://com.palm.applicationManager/",
method: "getAppInfo",
onResponse: "gotAppInfo"
} ],
className: "enyo-iframe enyo-view",
create: function() {
this.inherited(arguments), this.params = this.params || {}, this.appPath = "", this.checkLoadHitched = enyo.hitch(this, "checkLoad"), this.handleMessageHitched = enyo.hitch(this, "handleMessage"), window.addEventListener("message", this.handleMessageHitched);
},
destroy: function() {
window.removeEventListener("message", this.handleMessageHitched), this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.app ? this.appChanged() : this.path && this.pathChanged();
},
appChanged: function() {
this.appPath = "", this.app ? this.$.getAppPath.call({
appId: this.app
}) : this.pathChanged();
},
gotAppInfo: function(a, b) {
this.appPath = b && b.appInfo && b.appInfo.main, this.appPath = this.appPath || "", this.appPath && (this.appPath = this.appPath.slice(0, this.appPath.lastIndexOf("/") + 1), this.pathChanged());
},
pathChanged: function() {
var a = "";
this.path && (this.appPath ? a = this.appPath + this.path : this.app || (a = this.path), a && (console.log("CrossAppUI: Loading cross-app UI at " + a), a = a + "?enyoWindowParams=" + encodeURIComponent(enyo.json.stringify(this.params)), this._checkLoadTimerId || (this._checkLoadTimerId = window.setTimeout(this.checkLoadHitched, 1e3)))), this.setAttribute("src", a);
},
checkLoad: function() {
var a = this.node, b = a && a.contentDocument;
this._checkLoadTimerId = undefined, b && b.readyState === "complete" && b.location.href === "about:blank" && this.path ? (console.log("CrossAppUI: checkLoad: Kicking iframe."), this.pathChanged()) : console.log("CrossAppUI: checkLoad: things look okay.");
},
paramsChanged: function() {
this.path && this.node && this.node.contentWindow && enyo.windows.setWindowParams(this.node.contentWindow, this.params);
},
handleMessage: function(a) {
var b = "enyoCrossAppResult=";
a.source === (this.node && this.node.contentWindow) && a.data.indexOf(b) === 0 && this.doResult(enyo.json.parse(a.data.slice(b.length)));
}
});

// palm/system/CrossAppResult.js

enyo.kind({
name: "enyo.CrossAppResult",
kind: enyo.Component,
sendResult: function(a) {
window.parent && window.parent.postMessage("enyoCrossAppResult=" + enyo.json.stringify(a), "*");
}
});

// palm/system/FilePicker.js

enyo.kind({
name: "enyo.FilePicker",
kind: "enyo.Popup",
published: {
fileType: undefined,
previewLabel: undefined,
extensions: undefined,
allowMultiSelect: !1,
currentRingtonePath: undefined,
cropWidth: undefined,
cropHeight: undefined
},
events: {
onPickFile: ""
},
height: "480px",
width: "380px",
dismissWithClick: !1,
modal: !0,
scrim: !0,
filePickerPath: "/usr/lib/luna/system/luna-systemui/app/FilePicker/filepicker.html",
components: [ {
name: "crossapp",
kind: "CrossAppUI",
onResult: "handleResult"
} ],
pickFile: function() {
this.updateParams(), this.$.crossapp.setPath(this.filePickerPath), this.openAtCenter();
},
updateParams: function() {
var a = {}, b = this;
Object.keys(this.published).forEach(function(c) {
b[c] !== undefined && (a[c] = b[c]);
}), this.fileType && !enyo.isString(this.fileType) && (a.fileTypes = this.fileType, a.fileType = undefined), this.$.crossapp.setParams(a);
},
handleResult: function(a, b) {
this.$.crossapp.setPath(""), b.result && this.doPickFile(b.result), this.close();
}
});

// palm/layout/OrderedLayout.js

enyo.kind({
name: "enyo.OrderedLayout",
getShowingChildren: function(a) {
var b = [];
for (var c = 0, d = a.children, e; e = d[c]; c++) e.showing && b.push(e);
return b;
},
flow: function(a) {
var b = this.getShowingChildren(a), c = b.length;
for (var d = 0, e, f; e = b[d]; d++) f = c == 1 ? "single" : d == 0 ? "first" : d == c - 1 ? "last" : "middle", this.styleChild(e, "enyo-" + f);
},
styleChild: function(a, b) {
a.setOrderStyle ? a.setOrderStyle(b) : this.defaultStyleChild(a, b);
},
defaultStyleChild: function(a, b) {
var c = a._orderStyle;
c && a.removeClass(c), a.addClass(b), a._orderStyle = b;
}
});

// palm/controls/Spinner.js

enyo.kind({
name: "enyo.Spinner",
kind: enyo.AnimatedImage,
className: "enyo-spinner",
easingFunc: enyo.easing.linear,
showing: !1,
imageHeight: 32,
imageCount: 12,
repeat: -1,
create: function() {
this.inherited(arguments), this.disEnableAnimation(this.showing);
},
disEnableAnimation: function(a) {
this[a ? "start" : "stop"]();
},
showingChanged: function(a) {
this.inherited(arguments), a !== undefined && this.disEnableAnimation(this.showing);
}
}), enyo.kind({
name: "enyo.SpinnerLarge",
kind: enyo.Spinner,
className: "enyo-spinner-large",
imageHeight: 128
});

// palm/controls/RoundedBox.js

enyo.kind({
name: "enyo.RoundedBox",
kind: "VFlexBox",
className: "enyo-rounded-box",
chrome: [ {
name: "client",
kind: "HFlexBox",
align: "center",
className: "enyo-rounded-box-inner"
} ]
});

// palm/controls/button/NotificationButton.js

enyo.kind({
name: "enyo.NotificationButton",
kind: enyo.Button,
className: "enyo-button enyo-notification-button"
});

// palm/controls/button/IconButton.js

enyo.kind({
name: "enyo.IconButton",
kind: enyo.CustomButton,
className: "enyo-button",
published: {
icon: "",
iconIsClassName: !1
},
components: [ {
name: "icon",
className: "enyo-button-icon",
showing: !1
}, {
name: "caption",
className: "enyo-button-icon-text"
} ],
create: function() {
this.inherited(arguments), this.captionChanged(), this.iconChanged();
},
iconChanged: function(a) {
this.$.icon.setShowing(Boolean(this.icon)), this.iconIsClassName ? this.applyIconClassName(a) : this.applyIconImage(a);
},
applyIconImage: function() {
this.$.icon.applyStyle("background-image", "url(" + enyo.path.rewrite(this.icon) + ")"), this.$.icon.applyStyle("background-repeat", "no-repeat");
},
applyIconClassName: function(a) {
a && this.$.icon.removeClass(a), this.$.icon.addClass(this.icon);
},
captionChanged: function() {
this.$.caption.setContent(this.caption), this.$.caption.setShowing(this.caption);
}
});

// palm/controls/button/Pushable.js

enyo.kind({
name: "enyo.Pushable",
kind: enyo.Control,
events: {
ondown: "",
onup: ""
},
styleForDown: function() {
this.applyStyle("background-color", "gray");
},
styleForUp: function() {
this.applyStyle("background-color", "inherit");
},
mousedownHandler: function(a, b) {
this.styleForDown(), this.doDown();
},
mouseupHandler: function(a, b) {
this.styleForUp(), this.doUp();
}
});

// palm/controls/button/ActivityButton.js

enyo.kind({
name: "enyo.ActivityButton",
kind: enyo.Button,
published: {
active: !1
},
chrome: [ {
kind: enyo.HFlexBox,
align: "center",
className: "enyo-activity-button-inner",
components: [ {
name: "caption",
flex: 1
}, {
name: "spinner",
kind: "Spinner"
} ]
} ],
create: function() {
this.inherited(arguments), this.activeChanged();
},
activeChanged: function() {
this.$.spinner.setShowing(this.active);
},
captionChanged: function() {
this.$.caption.setContent(this.caption);
}
});

// palm/controls/button/GrabButton.js

enyo.kind({
name: "enyo.GrabButton",
kind: enyo.CustomButton,
className: "enyo-grabbutton",
slidingHandler: !0,
allowDrag: !0
});

// palm/controls/input/PasswordInput.js

enyo.kind({
name: "enyo.PasswordInput",
kind: enyo.Input,
create: function() {
this.inherited(arguments), this.$.input.setAttribute("type", "password"), this.setAutoCapitalize("lowercase"), this.setSpellcheck(!1), this.setAutocorrect(!1);
}
});

// palm/controls/input/RoundedInput.js

enyo.kind({
name: "enyo.RoundedInput",
kind: enyo.Input,
className: "enyo-rounded-input",
focusClassName: "",
chrome: [ {
kind: "RoundedBox",
components: [ {
flex: 1,
components: enyo.Input.prototype.chrome
}, {
name: "client"
} ]
} ]
});

// palm/controls/input/SearchInput.js

enyo.kind({
name: "enyo.SearchInput",
kind: enyo.RoundedInput,
events: {
onSearch: ""
},
components: [ {
kind: "Image",
src: "$palm-themes-Onyx/images/search-input-search.png",
style: "display: block",
onclick: "fireSearch"
} ],
keypressHandler: function(a, b) {
if (b.keyCode == "13") this.fireSearch(); else return this.inherited(arguments);
},
fireSearch: function() {
this.doSearch(this.getValue());
}
});

// palm/controls/input/ToolInput.js

enyo.kind({
name: "enyo.ToolInput",
kind: enyo.Input,
className: "enyo-tool-input",
inputClassName: "enyo-tool-input-input",
focusClassName: "enyo-tool-input-focus",
spacingClassName: "enyo-tool-input-spacing",
create: function() {
this.inherited(arguments), this.$.input.addClass("enyo-tool-input-input");
}
});

// palm/controls/OrderedContainer.js

enyo.kind({
name: "enyo.OrderedContainer",
kind: enyo.Control,
layoutKind: "HFlexLayout",
create: function() {
this.inherited(arguments), this.orderedLayout = new enyo.OrderedLayout(this);
},
flow: function() {
this.orderedLayout.flow(this), this.inherited(arguments);
}
});

// palm/controls/button/ToolButton.js

enyo.kind({
name: "enyo.ToolButton",
kind: enyo.IconButton,
className: "enyo-tool-button",
captionedClassName: "enyo-tool-button-captioned",
captionChanged: function() {
this.inherited(arguments), this.addRemoveClass(this.captionedClassName, this.caption);
}
});

// palm/controls/button/ButtonHeader.js

enyo.kind({
name: "enyo.ButtonHeader",
kind: enyo.Button,
style: "display: block",
className: "enyo-button enyo-button-header",
chrome: [ {
name: "client",
className: "enyo-button-header-client"
} ],
create: function() {
this.inherited(arguments), this.contentChanged();
},
layoutKindChanged: function() {
this.$.client.setLayoutKind(this.layoutKind);
},
contentChanged: function() {
this.$.client.setContent(this.content);
}
});

// palm/controls/button/ToggleButton.js

enyo.kind({
name: "enyo.ToggleButton",
kind: enyo.Control,
published: {
state: !1,
onLabel: enyo._$L("On"),
offLabel: enyo._$L("Off"),
disabled: !1
},
events: {
onChange: ""
},
className: "enyo-toggle-button",
chrome: [ {
name: "labelOn",
nodeTag: "span",
className: "enyo-toggle-label-on",
content: "On"
}, {
name: "labelOff",
nodeTag: "span",
className: "enyo-toggle-label-off",
content: "Off"
} ],
labels: {
"true": "ON&nbsp;",
"false": "OFF"
},
ready: function() {
this.stateChanged(), this.onLabelChanged(), this.offLabelChanged(), this.disabledChanged();
},
onLabelChanged: function() {
this.$.labelOn.setContent(this.onLabel);
},
offLabelChanged: function() {
this.$.labelOff.setContent(this.offLabel);
},
stateChanged: function() {
this.setClassName("enyo-toggle-button " + (this.state ? "on" : "off")), this.$.labelOn.applyStyle("display", this.state ? "inline" : "none"), this.$.labelOff.applyStyle("display", this.state ? "none" : "inline");
},
disabledChanged: function() {
this.addRemoveClass("disabled", this.disabled), this.$.labelOn.addRemoveClass("enyo-disabled", this.disabled), this.$.labelOff.addRemoveClass("enyo-disabled", this.disabled);
},
updateState: function(a) {
this.disabled || (this.setState(a), this.doChange(this.state));
},
clickHandler: function() {
this.updateState(!this.getState());
},
flickHandler: function(a, b) {
Math.abs(b.xVel) > Math.abs(b.yVel) && this.updateState(b.xVel > 0);
},
dragstartHandler: function(a, b) {
this._dx0 = b.dx;
},
dragHandler: function(a, b) {
var c = b.dx - this._dx0;
Math.abs(c) > 15 && (this.updateState(c > 0), this._dx0 = b.dx);
},
dragfinishHandler: function(a, b) {
b.preventClick();
}
});

// palm/controls/button/CheckBox.js

enyo.kind({
name: "enyo.CheckBox",
kind: enyo.Button,
cssNamespace: "enyo-checkbox",
className: "enyo-checkbox",
published: {
checked: !1
},
events: {
onChange: ""
},
create: function() {
this.inherited(arguments), this.checkedChanged();
},
captionChanged: function() {},
checkedChanged: function() {
this.stateChanged("checked");
},
mousedownHandler: function(a, b, c) {
this.disabled || (this.setChecked(!this.checked), this.doChange());
},
mouseupHandler: function(a, b, c) {},
mouseoutHandler: function(a, b, c) {
this.setHot(!1);
}
});

// palm/controls/PrevNextBanner.js

enyo.kind({
name: "enyo.PrevNextBanner",
published: {
previousDisabled: !1,
nextDisabled: !1
},
events: {
onPrevious: "",
onNext: ""
},
kind: enyo.HFlexBox,
align: "center",
chrome: [ {
name: "previous",
className: "enyo-banner-prev",
kind: enyo.CustomButton,
onclick: "doPrevious"
}, {
name: "client",
flex: 1,
kind: enyo.HFlexBox,
align: "center",
className: "enyo-banner-content"
}, {
name: "next",
className: "enyo-banner-next",
kind: enyo.CustomButton,
onclick: "doNext"
} ],
create: function() {
this.addClass("enyo-prev-next-banner"), this.inherited(arguments), this.contentChanged(), this.nextDisabledChanged(), this.previousDisabledChanged();
},
contentChanged: function() {
this.$.client.setContent(this.content);
},
_disabledChanged: function(a, b) {
a.setDisabled(b);
},
nextDisabledChanged: function() {
this._disabledChanged(this.$.next, this.nextDisabled);
},
previousDisabledChanged: function() {
this._disabledChanged(this.$.previous, this.previousDisabled);
}
});

// palm/controls/BasicWebView.js

enyo.weightedAverage = {
data: {},
count: 4,
weights: [ 1, 2, 4, 8 ],
compute: function(a, b) {
this.data[b] || (this.data[b] = []);
var c = this.data[b];
c.push(a), c.length > this.count && c.shift();
for (var d = 0, e = 0, f = 0, g, h; (g = c[d]) && (h = this.weights[d]); d++) f += g * h, e += h;
e = e || 1, f = f / e;
return f;
},
clear: function(a) {
this.data[a] = [];
}
}, enyo.sizeableMixin = {
zoom: 1,
centeredZoomStart: function(a) {
var b = enyo.dom.calcNodeOffset(this.hasNode()), c = this.fetchScrollPosition();
this._zoomStart = {
scale: a.scale,
centerX: a.centerX - (b.left + c.l),
centerY: a.centerY - (b.top + c.t),
scrollX: c.l,
scrollY: c.t,
offsetLeft: b.left + c.l,
offsetTop: b.top + c.t,
zoom: this.zoom
};
},
centeredZoomChange: function(a) {
var b = this._zoomStart;
a.scale = a.scale || b.scale;
var c = a.centerX - b.offsetLeft || b.centerX, d = a.centerY - b.offsetTop || b.centerY, e = Math.round(a.scale * 100) / 100, f = b.zoom * e;
f > this.getMaxZoom() && (e = this.getMaxZoom() / b.zoom);
var g = (e - 1) * b.centerX;
g += e * b.scrollX, g += e * (b.centerX - c);
var h = (e - 1) * b.centerY + e * b.scrollY + e * (b.centerY - d);
return {
zoom: f,
x: g,
y: h
};
},
resetZoom: function() {
this.setZoom(this.getMinZoom());
},
findScroller: function() {
if (this._scroller) return this._scroller;
var a = this.hasNode(), b;
while (a) {
b = enyo.$[a.id];
if (b && b instanceof enyo.BasicScroller) return this._scroller = b;
a = a.parentNode;
}
},
fetchScrollPosition: function() {
var a = {
t: 0,
l: 0
}, b = this.findScroller();
b && (a.l = b.getScrollLeft(), a.t = b.getScrollTop());
return a;
},
setScrollPosition: function(a, b) {
var c = this.findScroller();
c && (c.setScrollTop(b), c.setScrollLeft(a));
},
setScrollPositionDirect: function(a, b) {
var c = this.findScroller();
c && c.setScrollPositionDirect(a, b);
},
toContentOffset: function(a, b) {
var c = this.getOffset(), d = this.fetchScrollPosition();
return {
left: a - c.left - d.l,
top: b - c.top - d.t
};
}
}, enyo.kind({
name: "enyo.BasicWebView",
kind: enyo.Control,
published: {
identifier: "",
url: "",
minFontSize: 16,
enableJavascript: !0,
blockPopups: !0,
acceptCookies: !0,
redirects: [],
networkInterface: "",
ignoreMetaTags: !1
},
domAttributes: {
tabIndex: 0
},
requiresDomMousedown: !0,
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
lastUrl: "",
style: "display: block",
nodeTag: "object",
create: function() {
this.inherited(arguments), this.history = [], this.callQueue = [], this.dispatcher = enyo.dispatcher, this.domAttributes.type = "application/x-palm-browser";
},
destroy: function() {
this.callQueue = null, this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.hasNode() && (this.node.eventListener = this, this.history = [], this.lastUrl = "", this._viewInited = !1, this.connect());
},
hasView: function() {
return this.hasNode() && this.node.openURL;
},
adapterInitialized: function() {
this.log("adapterInitialized"), this._viewInited = this._serverConnected = !1, this.connect();
},
serverConnected: function() {
this.log(), this._serverConnected = !0, this._viewInited = !1, this.initView(), this.flushCallQueue(), this.doConnected();
},
connect: function() {
!this.hasView() || this._viewInited || this._serverConnected ? this._connectJob = null : (this._connect(), this._connectJob = enyo.job("browserserver-connect", enyo.hitch(this, "connect"), 500));
},
_connect: function() {
try {
this.node.setPageIdentifier(this.identifier || this.id), this.node.connectBrowserServer();
} catch (a) {}
},
initView: function() {
this.hasView() && !this._viewInited && this._serverConnected && (this.cacheBoxSize(), this.node.interrogateClicks(!1), this.node.setShowClickedLink(!0), this.node.pageFocused(!0), this.blockPopupsChanged(), this.acceptCookiesChanged(), this.enableJavascriptChanged(), this.redirectsChanged(), this.updateViewportSize(), this.urlChanged(), this.minFontSizeChanged(), this._viewInited = !0);
},
resize: function() {
var a = enyo.fetchControlSize(this);
this._boxSize && (this._boxSize.w != a.w || this._boxSize.h != a.h) && this.cacheBoxSize(), this.updateViewportSize();
},
cacheBoxSize: function() {
this._boxSize = enyo.fetchControlSize(this), this.applyStyle("width", this._boxSize.w + "px"), this.applyStyle("height", this._boxSize.h + "px");
},
updateViewportSize: function() {
var a = enyo.getVisibleControlBounds(this);
this.callBrowserAdapter("setVisibleSize", [ a.width, a.height ]);
},
urlChanged: function() {
this.url && (this.callBrowserAdapter("openURL", [ this.url ]), this.log(this.url));
},
minFontSizeChanged: function() {
this.callBrowserAdapter("setMinFontSize", [ Number(this.minFontSize) ]);
},
dragstartHandler: function() {
return !0;
},
flickHandler: function(a, b) {
this.callBrowserAdapter("handleFlick", [ b.xVel, b.yVel ]);
},
enableJavascriptChanged: function() {
this.callBrowserAdapter("setEnableJavaScript", [ this.enableJavascript ]);
},
blockPopupsChanged: function() {
this.callBrowserAdapter("setBlockPopups", [ this.blockPopups ]);
},
acceptCookiesChanged: function() {
this.callBrowserAdapter("setAcceptCookies", [ this.acceptCookies ]);
},
redirectsChanged: function(a) {
for (var b = 0, c; c = a && a[b]; b++) this.callBrowserAdapter("addUrlRedirect", [ c.regex, !1, c.cookie, 0 ]);
for (var b = 0, c; c = this.redirects[b]; b++) this.callBrowserAdapter("addUrlRedirect", [ c.regex, c.enable, c.cookie, 0 ]);
},
networkInterfaceChanged: function() {
this.networkInterface && this.callBrowserAdapter("setNetworkInterface", [ this.networkInterface ]);
},
ignoreMetaTagsChanged: function() {
this.callBrowserAdapter("ignoreMetaTags", [ this.ignoreMetaTags ]);
},
clearHistory: function() {
this.callBrowserAdapter("clearHistory");
},
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
callBrowserAdapter: function(a, b) {
this.hasNode() && this.node[a] && this._serverConnected ? (this.log(a, b), this.node[a].apply(this.node, b)) : (this.log("queued!", a, b), this.callQueue.push({
name: a,
args: b
}), this._connectJob || this.connect());
},
flushCallQueue: function() {
this.log(this.callQueue.length, "view?", this.hasView());
if (this.callQueue.length > 0) if (this.hasView()) {
var a = this.callQueue.length;
for (var b = 0, c; b < a; b++) c = this.callQueue.shift(), this.callBrowserAdapter(c.name, c.args);
} else setTimeout(enyo.hitch(this, "flushCallQueue"), 100);
},
showFlashLockedMessage: function() {
this.flashPopup == null && (this.flashPopup = this.createComponent({
kind: "Popup",
modal: !0,
style: "text-align:center",
components: [ {
content: $L("Dragging works in Flash, until you<br>pinch to zoom out")
} ]
}), this.flashPopup.render(), this.flashPopup.hasNode() && (this.flashTransitionEndHandler = enyo.bind(this, "flashPopupTransitionEndHandler"))), this.flashPopup.applyStyle("opacity", 1), this.flashPopup.openAtCenter(), enyo.job(this.id + "-hideFlashPopup", enyo.bind(this, "hideFlashLockedMessage"), 2e3);
},
hideFlashLockedMessage: function() {
this.flashPopup.addClass("enyo-webview-flashpopup-animate"), this.flashPopup.applyStyle("opacity", 0);
},
flashPopupTransitionEndHandler: function() {
this.flashPopup.removeClass("enyo-webview-flashpopup-animate"), this.flashPopup.close();
},
urlTitleChanged: function(a, b, c, d) {
this.lastUrl = this.url, this.url = a, this.doPageTitleChanged(enyo.string.escapeHtml(b), a, c, d);
},
loadStarted: function() {
this.log(), this.doLoadStarted();
},
loadProgressChanged: function(a) {
this.doLoadProgress(a);
},
loadStopped: function() {
this.log(), this.doLoadStopped();
},
documentLoadFinished: function() {
this.log(), this.doLoadComplete();
},
mainDocumentLoadFailed: function(a, b, c, d) {
this.doError(b, d + ": " + c);
},
linkClicked: function(a) {},
urlRedirected: function(a, b) {
this.doUrlRedirected(a, b);
},
updateGlobalHistory: function(a, b) {},
firstPaintCompleted: function() {},
editorFocused: function(a, b, c) {
window.PalmSystem && (a && this.node.focus(), window.PalmSystem.editorFocused(a, b, c)), this.doEditorFocusChanged(a, b, c);
},
dialogAlert: function(a) {
this.doAlertDialog(a);
},
dialogConfirm: function(a) {
this.doConfirmDialog(a);
},
dialogPrompt: function(a, b) {
this.doPromptDialog(a, b);
},
dialogSSLConfirm: function(a, b) {
this.doSSLConfirmDialog(a, b);
},
dialogUserPassword: function(a) {
this.doUserPasswordDialog(a);
},
mimeNotSupported: function(a, b) {
this.doFileLoad(a, b);
},
mimeHandoffUrl: function(a, b) {
this.doFileLoad(a, b);
},
mouseInInteractiveChange: function(a) {
this._mouseInInteractive = a;
},
mouseInFlashChange: function(a) {
this._mouseInFlash = a;
},
flashGestureLockChange: function(a) {
this._flashGestureLock = a;
},
createPage: function(a) {
this.doNewPage(a);
},
scrollTo: function(a, b) {},
metaViewportSet: function(a, b, c, d, e, f) {},
browserServerDisconnected: function() {
this.log(), this._serverConnected = !1, this._viewInited = !1, this.doDisconnected();
},
showPrintDialog: function() {
this.doPrint();
},
textCaretRectUpdate: function(a, b, c, d) {},
showPopupMenu: function(a, b) {
this.doOpenSelect(a, b);
},
didFinishDocumentLoad: function() {
this.documentLoadFinished();
},
failedLoad: function(a, b, c, d) {},
setMainDocumentError: function(a, b, c, d) {
this.mainDocumentLoadFailed(a, b, c, d);
},
firstPaintComplete: function() {
this.firstPaintCompleted();
},
loadProgress: function(a) {
this.loadProgressChanged(a);
},
pageDimensions: function(a, b) {},
smartZoomCalculateResponseSimple: function(a, b, c, d, e, f, g) {},
titleURLChange: function(a, b, c, d) {
this.urlTitleChanged(b, a, c, d);
}
});

// palm/controls/WebView.js

enyo.kind({
name: "enyo.WebView",
kind: enyo.Control,
published: {
identifier: "",
url: "",
minFontSize: 16,
enableJavascript: !0,
blockPopups: !0,
acceptCookies: !0,
redirects: [],
networkInterface: "",
ignoreMetaTags: !1
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
chrome: [ {
name: "view",
kind: enyo.BasicWebView,
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
onOpenSelect: "openSelect",
onNewPage: "doNewPage",
onPrint: "doPrint",
onEditorFocusChanged: "doEditorFocusChanged",
onConnected: "connected",
onDisconnected: "disconnected",
onError: "doError"
}, {
name: "spinnerPopup",
kind: "Popup",
className: "enyo-webview-popup-spinner",
scrim: !0,
components: [ {
name: "spinner",
kind: "SpinnerLarge"
} ]
} ],
_freeSelectPopups: [],
_cachedSelectPopups: {},
create: function() {
this.inherited(arguments), this.identifierChanged(), this.minFontSizeChanged(), this.enableJavascriptChanged(), this.blockPopupsChanged(), this.acceptCookiesChanged(), this.redirectsChanged(), this.networkInterfaceChanged(), this.ignoreMetaTagsChanged(), this.urlChanged();
},
identifierChanged: function() {
this.$.view.setIdentifier(this.identifier);
},
urlChanged: function(a) {
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
redirectsChanged: function(a) {
this.$.view.setRedirects(this.redirects);
},
networkInterfaceChanged: function() {
this.$.view.setNetworkInterface(this.networkInterface);
},
ignoreMetaTagsChanged: function() {
this.$.view.setIgnoreMetaTags(this.ignoreMetaTags);
},
openSelect: function(a, b, c) {
this._cachedSelectPopups[b] ? (this._cachedSelectPopups[b]._response = -1, this._cachedSelectPopups[b].openAtCenter()) : (this.showSpinner(), enyo.asyncMethod(this, "createSelectPopup", b, c));
},
createSelectPopup: function(a, b) {
var c = this._freeSelectPopups.pop();
c || (c = this.createComponent({
kind: "PopupList",
name: "select-" + a,
_webviewId: a,
_response: -1,
onSelect: "selectPopupSelect",
onClose: "selectPopupClose"
}));
var d = [], e = enyo.json.parse(b);
for (var f = 0, g; g = e.items[f]; f++) d.push({
caption: g.text,
disabled: !g.isEnabled
});
c.setItems(d), c.render(), this._cachedSelectPopups[a] = c, this.hideSpinner(), c.openAtCenter();
},
selectPopupSelect: function(a, b, c) {
a._response = b;
},
selectPopupClose: function(a) {
enyo.asyncMethod(this, "selectPopupReply", a);
},
selectPopupReply: function(a) {
this.callBrowserAdapter("selectPopupMenuItem", [ a._webviewId, a._response ]);
},
connected: function() {
this.hideSpinner();
},
disconnected: function() {
this._requestDisconnect ? this._requestDisconnect = !1 : (this.showSpinner(), setTimeout(enyo.hitch(this, "reinitialize"), 5e3));
},
reinitialize: function() {
this.$.view.connect();
},
showSpinner: function() {
this.$.spinner.show(), this.$.spinnerPopup.openAtCenter();
},
hideSpinner: function() {
this.$.spinnerPopup.close(), this.$.spinner.hide();
},
pageTitleChanged: function(a, b, c, d, e) {
for (var f in this._cachedSelectPopups) this._freeSelectPopups.push(this._cachedSelectPopups[f]);
this._cachedSelectPopups = {}, this.doPageTitleChanged(b, c, d, e);
},
activate: function() {
this.$.view.callBrowserAdapter("pageFocused", [ !0 ]);
},
deactivate: function() {
this.$.view.callBrowserAdapter("pageFocused", [ !1 ]);
},
disconnect: function() {
this.$.view.callBrowserAdapter("disconnectBrowserServer"), this._requestDisconnect = !0;
},
resize: function() {
this.$.view.resize();
},
deferSetUrl: function(a) {
this.setUrl(a);
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
deleteImage: function(a) {
this.$.view.callBrowserAdapter("deleteImage", [ a ]);
},
generateIconFromFile: function(a, b, c, d, e, f) {
this.$.view.callBrowserAdapter("generateIconFromFile", [ a, b, c, d, e, f ]);
},
getHistoryState: function(a) {
this.$.view.getHistoryState(a);
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
resizeImage: function(a, b, c, d) {
this.$.view.callBrowserAdapter("resizeImage", [ a, b, c, d ]);
},
saveViewToFile: function(a, b, c, d, e) {
this.$.view.callBrowserAdapter("saveViewToFile", [ a, b, c, d, e ]);
},
stopLoad: function() {
this.$.view.callBrowserAdapter("stopLoad");
},
acceptDialog: function() {
var a = [].slice.call(arguments);
a.unshift("1"), this.$.view.callBrowserAdapter("sendDialogResponse", a);
},
cancelDialog: function() {
this.$.view.callBrowserAdapter("sendDialogResponse", [ "0" ]);
},
sendDialogResponse: function(a) {
this.$.view.callBrowserAdapter("sendDialogResponse", [ a ]);
},
inspectUrlAtPoint: function(a, b, c) {
this.$.view.callBrowserAdapter("inspectUrlAtPoint", [ a, b, c ]);
},
insertStringAtCursor: function(a) {
this.$.view.callBrowserAdapter("insertStringAtCursor", [ a ]);
},
saveImageAtPoint: function(a, b, c, d) {
this.$.view.callBrowserAdapter("saveImageAtPoint", [ a, b, c, d ]);
},
getImageInfoAtPoint: function(a, b, c) {
this.$.view.callBrowserAdapter("getImageInfoAtPoint", [ a, b, c ]);
},
setHTML: function(a, b) {
this.$.view.callBrowserAdapter("setHTML", [ a, b ]);
},
printFrame: function(a, b, c, d, e, f, g) {
this.$.view.callBrowserAdapter("printFrame", [ a, b, c, d, e, f, g ]);
},
findInPage: function(a) {
this.$.view.callBrowserAdapter("findInPage", [ a ]);
},
redirectUrl: function(a, b, c) {
this.$.view.callBrowserAdapter("addUrlRedirect", [ a, c, b, 0 ]);
},
callBrowserAdapter: function(a, b) {
this.$.view.callBrowserAdapter(a, b);
}
}), window.PalmSystem || (enyo.WebView = enyo.Iframe);

// palm/controls/image/SizeableImage.js

enyo.fetchControlSize = function(a) {
var b = a.hasNode(), c = b && b.parentNode, d;
while (c) {
if (c.clientWidth && c.clientHeight) {
d = {
w: c.clientWidth,
h: c.clientHeight
};
break;
}
c = c.parentNode;
}
d = d || {
w: window.innerWidth,
h: window.innerHeight
};
return d;
}, enyo.kind({
name: "enyo.SizeableImage",
kind: enyo.VFlexBox,
align: "center",
pack: "center",
mixins: [ enyo.sizeableMixin ],
published: {
src: "",
zoom: 1,
autoSize: !0,
maxZoomRatio: 2
},
maxZoom: 2,
disableZoom: !1,
events: {
onImageLoaded: ""
},
chrome: [ {
name: "animator",
kind: "Animator",
onAnimate: "stepAnimation",
onEnd: "endAnimation"
}, {
name: "image",
kind: "Image"
} ],
create: function() {
this.bufferImage = new Image, this.bufferImage.onload = enyo.hitch(this, "imageLoaded"), this.bufferImage.onerror = enyo.hitch(this, "imageError"), this.inherited(arguments), this.srcChanged();
},
rendered: function() {
this.inherited(arguments), this.loadPendingRender && (this.imageLoaded(), this.loadPendingRender = null);
},
srcChanged: function() {
this.src && this.bufferImage.src == this.src ? this.imageLoaded() : this.src && (this.$.image.setSrc("$base-themes-default-theme/images/blank.gif"), this.bufferImage.src = this.src);
},
imageLoaded: function(a) {
this.hasNode() ? this.destroyed || (this.$.image.setSrc(this.bufferImage.src), this.adjustSize(), this.doImageLoaded()) : this.loadPendingRender = !0;
},
imageError: function(a) {
this.log(a);
},
maxZoomRatioChanged: function() {
this.maxZoom = this.minZoom * this.maxZoomRatio;
},
getMaxZoom: function() {
return this.maxZoom;
},
getMinZoom: function() {
return this.minZoom;
},
adjustSize: function() {
var a = this._imageWidth = this.bufferImage.width, b = this._imageHeight = this.bufferImage.height, c = this._boxSize = enyo.fetchControlSize(this);
if (this.autoSize) {
var d = a / b, e = this.node;
a = c.w, b = c.h, b * d > a ? b = a / d : a = b * d;
}
this.minZoom = a / this._imageWidth, this.maxZoomRatioChanged(), this.setZoom(this.minZoom);
},
zoomChanged: function() {
this.zoom = Math.max(this.minZoom, Math.min(this.zoom, this.maxZoom));
if (this._imageWidth && this._imageHeight) {
var a = this.zoom * this._imageWidth, b = this.zoom * this._imageHeight;
a && b && this.sizeImage(a, b);
}
},
sizeImage: function(a, b) {
this.$.image.applyStyle("width", a + "px"), this.$.image.applyStyle("height", b + "px");
},
isZoomIn: function() {
return Math.round((this.zoom - this.minZoom) * 100) / 100 != 0;
},
updateZoomPosition: function(a) {
this.setZoom(a.zoom);
var b = this.findScroller(), c = {};
b && (c = b.getBoundaries());
var d = a.x > c.left ? a.x < c.right ? a.x : c.right : c.left, e = a.y > c.top ? a.y < c.bottom ? a.y : c.bottom : c.bottom;
this.setScrollPositionDirect(d, e);
return {
x: d,
y: e
};
},
gesturestartHandler: function(a, b) {
this.disableZoom || this.centeredZoomStart(b);
},
gesturechangeHandler: function(a, b) {
if (!this.disableZoom) {
enyo.stopEvent(b);
var c = this.centeredZoomChange(b);
this.updateZoomPosition(c);
}
},
gestureendHandler: function(a, b) {
if (!this.disableZoom) {
enyo.stopEvent(b);
var c = this.fetchScrollPosition();
this.setScrollPosition(c.l, c.t);
}
},
clickHandler: function(a, b) {
if (this._clickMode) {
var c = this._clickMode != 1;
this._clickMode = 0;
return c;
}
this._clickMode = -1, this._clickJob = setTimeout(enyo.hitch(this, function() {
this._clickMode = 1, enyo.dispatch(b);
}), 300);
return !0;
},
dblclickHandler: function(a, b) {
if (this._clickJob && this._clickMode != -1) this._clickMode = 0, clearTimeout(this._clickJob), this._clickJob = null, this.smartZoom(b); else return !0;
},
smartZoom: function(a) {
if (!this.disableZoom) {
var b = a.clientX, c = a.clientY;
this.centeredZoomStart({
scale: 1,
centerX: b,
centerY: c
}), this.fromZoom = this.zoom, this.toZoom = Math.abs(this.zoom - this.maxZoom) > .1 ? this.maxZoom : this.minZoom, this.$.animator.play(1, this.toZoom / this.fromZoom);
}
},
stepAnimation: function(a, b, c) {
var d = this.centeredZoomChange({
scale: b
}), e = this.updateZoomPosition(d);
this.setScrollPosition(e.x, e.y);
}
}), enyo.kind({
name: "enyo.SizeableCanvas",
kind: enyo.SizeableImage,
chrome: [ {
name: "animator",
kind: "Animator",
onAnimate: "stepAnimation",
onEnd: "endAnimation"
}, {
name: "image",
nodeTag: "canvas"
} ],
create: function() {
this.inherited(arguments), this.$.image.setSrc = enyo.nop;
},
fetchContext: function() {
var a = this.$.image.hasNode();
return a && a.getContext("2d");
},
clearImage: function() {
var a = this.fetchContext();
a && this._zoomedWidth && this._zoomedHeight && a.clearRect(0, 0, this._zoomedWidth, this._zoomedHeight);
},
sizeImage: function(a, b) {
this.clearImage(), this._zoomedWidth = a, this._zoomedHeight = b;
var c = this.fetchContext();
c && (this.$.image.setAttribute("width", a), this.$.image.setAttribute("height", b), c.drawImage(this.bufferImage, 0, 0, a, b));
}
});

// palm/controls/image/ScrollingImage.js

enyo.kind({
name: "enyo.ScrollingImage",
kind: enyo.SizeableImage,
autoSize: !1,
className: "enyo-scrolling-image",
chrome: [ {
name: "animator",
kind: "Animator",
onAnimate: "stepAnimation",
onEnd: "endAnimation"
}, {
name: "scroller",
kind: "BasicScroller",
className: "enyo-fit",
components: [ {
name: "image",
kind: "Image"
} ]
} ],
create: function() {
this.inherited(arguments), this._scroller = this.$.scroller;
}
});

// palm/controls/image/CroppableImage.js

enyo.kind({
name: "enyo.CroppableImage",
kind: "enyo.ScrollingImage",
events: {
onCrop: ""
},
getCropParams: function() {
var a = this.getZoom(), b = this._imageHeight, c = this._imageWidth, d = this._scroller.getBounds(), e = this._scroller.getScrollTop(), f = this._scroller.getScrollLeft(), g = (f + d.width / 2) / (c * a), h = (e + d.height / 2) / (b * a), i = d.height / a, j = d.width / a, k = {
scale: a,
suggestedXtop: Math.max(0, Math.round(c * g - j / 2)),
suggestedYtop: Math.max(0, Math.round(b * h - i / 2)),
suggestedScale: a * 100,
suggestedXsize: Math.round(j),
suggestedYsize: Math.round(i),
sourceWidth: c,
sourceHeight: b,
sourceImage: enyo.makeAbsoluteUrl(window, this.src),
focusX: g,
focusY: h
};
this.doCrop(k);
},
autoSize: !0,
className: "enyo-croppable-image"
});

// palm/controls/BasicCarousel.js

enyo.kind({
name: "enyo.BasicCarousel",
kind: enyo.SnapScroller,
published: {
views: [],
dragSnapThreshold: .01
},
revealRatio: 0,
chrome: [ {
name: "client",
kind: "Control"
} ],
create: function(a) {
var b = [];
a && (b = a.components, delete a.components), b = b || this.kindComponents || [], this.inherited(arguments), this.$.scroll.kFrictionDamping = .75, this.$.scroll.kSpringDamping = .8, this.$.scroll.kFrictionEpsilon = .1, this.views = this.views.length ? this.views : b, this.viewsChanged();
},
rendered: function() {
this.inherited(arguments), this.resize(), this.indexChanged(), this.dragSnapThresholdChanged(), this.revealAmount = (this.scrollH ? this._controlSize.w : this._controlSize.h) * this.revealRatio;
},
layoutKindChanged: function() {
this.inherited(arguments), this.setVertical(!this.scrollH), this.setHorizontal(this.scrollH);
},
dragSnapThresholdChanged: function() {
this.dragSnapWidth = (this.scrollH ? this._controlSize.w : this._controlSize.h) * this.dragSnapThreshold;
},
dragstartHandler: function() {
if (this.snapping || this.dragging) return this.preventDragPropagation;
return this.inherited(arguments);
},
flickHandler: function(a, b) {
if (this.snapping) return this.preventDragPropagation;
return this.inherited(arguments);
},
viewsChanged: function() {
this.destroyControls(), this.createViews(this.views), this.render();
},
createViews: function(a) {
for (var b = 0, c; c = a[b]; b++) this.createView(this, c);
},
createView: function(a, b, c) {
var d = enyo.mixin(this.constructViewInfo(b), c), e = a.createComponent(d);
enyo.call(e, "setOuterScroller", [ this ]);
return e;
},
constructViewInfo: function(a) {
return enyo.isString(a) ? {
src: a
} : a;
},
addViews: function(a) {
this.views = this.views.concat(a), this.createViews(a), this.contentChanged();
},
resizeHandler: function() {
this.resize(), this.inherited(arguments);
},
resize: function() {
this.sizeControls("100%", "100%"), this._controlSize = enyo.fetchControlSize(this), this._controlSize[this.scrollH ? "w" : "h"] = this._controlSize[this.scrollH ? "w" : "h"] - 2 * this.revealAmount, this.sizeControls(this._controlSize.w + "px", this._controlSize.h + "px", !0), this.setIndex(this.index);
},
sizeControls: function(a, b, c) {
for (var d = 0, e = this.getControls(), f; f = e[d]; d++) a && f.applyStyle("width", a), b && f.applyStyle("height", b), c && this.resetView(d);
},
calcPos: function(a) {
if (this.getControls()[a]) {
var b = 0, c = this._controlSize[this.scrollH ? "w" : "h"];
for (var d = 0, e = this.getControls(), f; d < a && (f = e[d]); d++) f.showing && (b += c);
return b;
}
},
snapFinish: function() {
this.resetView(this.oldIndex), this.inherited(arguments);
},
snapTo: function(a) {
this.inherited(arguments), this.index != this.oldIndex && this.resetView(this.index);
},
findView: function(a) {
return a;
},
applyToView: function(a, b, c) {
var d = a[b] ? a : this.findView(a);
enyo.call(d, b, c);
},
resetView: function(a) {
var b = this.getControls()[a];
b && this.applyToView(b, "reset", []);
}
});

// palm/controls/Carousel.js

enyo.kind({
name: "enyo.Carousel",
kind: enyo.BasicCarousel,
events: {
onGetLeft: "",
onGetRight: ""
},
components: [ {
name: "left",
kind: "Control"
}, {
name: "center",
kind: "Control"
}, {
name: "right",
kind: "Control"
} ],
centerIndex: 1,
setCenterView: function(a) {
this.newView(this.$.left, this.doGetLeft(!1)), this.newView(this.$.center, a), this.newView(this.$.right, this.doGetRight(!1)), this.setIndex(this.centerIndex), this.snapping = !1;
},
fetchView: function(a) {
var b = {
left: 0,
center: 1,
right: 2
}, c = b[a];
c = this.index == 0 ? c - 1 : this.index == 2 ? c + 1 : c;
var d = this.getControls()[c];
return d ? this.findView(d) : null;
},
newView: function(a, b) {
a.setShowing(b ? !0 : !1), b && (a.destroyControls(), this.createView(a, b, {
kind: b.kind || this.defaultKind,
owner: this,
width: "100%",
height: "100%",
accelerated: this.accelerated
}), a.render());
},
moveView: function(a, b) {
a.setShowing(!0), b.setManager(a), b.setParent(a);
},
findView: function(a) {
var b = a.getControls();
if (b.length) return b[0];
},
scrollStop: function() {
this.inherited(arguments);
var a = this.scrollH ? this._controlSize.w : this._controlSize.h;
(this.pos >= this.startPos + a || this.pos <= this.startPos - a) && this.index == 1 && this.$.left.showing && this.startPos > 0 && (this.index = this.index + (this.startPos < this.pos ? 1 : -1), this.snapFinish());
},
snapFinish: function() {
this.adjustViews(), this.inherited(arguments);
},
adjustViews: function() {
var a = this.index > this.oldIndex, b;
if (this.index != this.centerIndex || !this._info) this._info = this["doGet" + (a ? "Right" : "Left")](!0);
if (this.index != this.centerIndex) if (this._info) {
var c = a ? this.$.right : this.$.left, d = a ? this.$.left : this.$.right, e = this.findView(this.$.center);
this.moveView(this.$.center, this.findView(c)), this.newView(c, this._info), d.destroyControls(), this.moveView(d, e), this.setIndex(this.centerIndex);
}
},
previous: function() {
(this.index != 1 || this.$.left.showing) && this.inherited(arguments);
},
next: function() {
(this.index != 1 || this.$.right.showing) && this.inherited(arguments);
}
});

// palm/controls/image/ViewImage.js

enyo.kind({
name: "enyo.ViewImageScroller",
kind: enyo.BasicScroller,
published: {
overscrollH: !0,
overscrollV: !0
},
preventDragPropagation: !1,
chrome: [ {
name: "client",
align: "center"
} ],
scroll: function(a) {
var b = this.getBoundaries(), c = b.left - 1, d = b.right + 1, e = b.top - 1, f = b.bottom + 1, g = -a.x, h = -a.y;
this.overscrollH || g >= c && g <= d ? this.scrollLeft = g : this.scrollLeft = g < 0 ? c : d, this.overscrollV || h >= e && h <= f ? this.scrollTop = h : this.scrollTop = h < 0 ? e : f, this.effectScroll(), this.doScroll();
}
}), enyo.kind({
name: "enyo.ViewImage",
kind: enyo.ScrollingImage,
autoSize: !0,
published: {
accelerated: !0
},
events: {
onImageLoaded: "imageLoaded"
},
className: "enyo-viewimage",
chrome: [ {
name: "animator",
kind: "Animator",
onAnimate: "stepAnimation",
onEnd: "endAnimation"
}, {
name: "scroller",
kind: "ViewImageScroller",
layoutKind: "HFlexLayout",
className: "enyo-fit",
autoVertical: !0,
components: [ {
name: "image",
kind: "Image",
className: "enyo-viewimage-image"
} ]
} ],
create: function() {
this.inherited(arguments), this.acceleratedChanged();
},
acceleratedChanged: function() {
this.$.scroller.setAccelerated(this.accelerated);
},
dragHandler: function(a) {
var b = this.$.scroller, c = this.outerScroller, d = c.scrollH ? b.getScrollLeft() : b.getScrollTop(), e = b.getBoundaries(), f = c.scrollH ? b.horizontal : b.vertical, g = c.scrollH ? e.left : e.top, h = c.scrollH ? e.right : e.bottom;
if (f && d >= g && d <= h) return !0;
},
flickHandler: function() {
return this.isZoomIn();
},
zoomChanged: function() {
this.inherited(arguments), this.outerScroller && this.outerScroller.setDragSnapThreshold(this.isZoomIn() ? .1 : .01);
},
setOuterScroller: function(a) {
this.outerScroller = a, this.$.scroller.setOverscrollH(!a.scrollH), this.$.scroller.setOverscrollV(a.scrollH);
},
reset: function() {
this.adjustSize();
var a = this.$.scroller;
a.$.scroll.dragging = !1, a.setScrollPositionDirect(0, 0);
}
});

// palm/controls/image/ImageView.js

enyo.kind({
name: "enyo.ImageView",
kind: enyo.Carousel,
published: {
images: [],
centerSrc: ""
},
defaultKind: "ViewImage",
create: function() {
this.inherited(arguments), this.centerSrcChanged(), this.images && this.images.length && this.imagesChanged();
},
centerSrcChanged: function() {
this.centerSrc && this.setCenterView(this.centerSrc);
},
imagesChanged: function() {
this.setViews(this.images);
},
getImages: function() {
return this.views;
},
addImages: function(a) {
this.addViews(a);
}
}), enyo.BasicImageView = enyo.ImageView;

// palm/controls/Divider.js

enyo.kind({
name: "enyo.Divider",
kind: enyo.HFlexBox,
align: "center",
published: {
icon: "",
iconBorderCollapse: !0,
caption: "Divider"
},
chrome: [ {
name: "rightCap",
className: "enyo-divider-right-cap"
}, {
name: "icon",
className: "enyo-divider-icon",
nodeTag: "img"
}, {
name: "caption",
className: "enyo-divider-caption"
}, {
className: "enyo-divider-left-cap"
}, {
name: "client",
kind: enyo.HFlexBox,
align: "center",
className: "enyo-divider-client"
} ],
create: function() {
this.inherited(arguments), this.iconChanged(), this.captionChanged();
},
iconChanged: function() {
this.$.icon.setAttribute("src", this.icon), this.icon ? (this.$.icon.show(), this.iconBorderCollapse ? (this.$.rightCap.hide(), this.$.icon.setClassName("enyo-divider-icon")) : this.$.icon.setClassName("enyo-divider-icon-collapse")) : (this.$.icon.hide(), this.$.rightCap.show());
},
captionChanged: function() {
this.$.caption.setContent(this.caption);
}
});

// palm/controls/AlphaDivider.js

enyo.kind({
name: "enyo.AlphaDivider",
kind: enyo.Control,
className: "enyo-divider-alpha",
published: {
caption: ""
},
components: [ {
name: "caption",
className: "enyo-divider-alpha-caption"
} ],
create: function() {
this.inherited(arguments), this.captionChanged();
},
captionChanged: function() {
this.$.caption.setContent(this.caption);
}
});

// palm/controls/Header.js

enyo.kind({
name: "enyo.Header",
kind: enyo.Control,
layoutKind: "HFlexLayout",
className: "enyo-header",
chrome: [ {
name: "client",
flex: 1,
align: "center",
className: "enyo-header-inner"
} ],
create: function() {
this.inherited(arguments), this.layout = new enyo.HFlexLayout, this.contentChanged();
},
layoutKindChanged: function() {
this.align && (this.$.client.align = this.align), this.pack && (this.$.client.pack = this.pack), this.$.client.setLayoutKind(this.layoutKind);
},
contentChanged: function() {
this.$.client.setContent(this.content);
}
});

// palm/controls/PageHeader.js

enyo.kind({
name: "enyo.PageHeader",
kind: enyo.Header
});

// palm/controls/Toolbar.js

enyo.kind({
name: "enyo.Toolbar",
kind: enyo.HFlexBox,
pack: "center",
align: "center",
className: "enyo-toolbar",
defaultKind: "ToolButton"
});

// palm/controls/Item.js

enyo.kind({
name: "enyo.Item",
kind: enyo.Stateful,
className: "enyo-item",
published: {
tapHighlight: !1,
held: !1,
disabled: !1
},
create: function() {
this.inherited(arguments), this.disabledChanged();
},
heldChanged: function() {
this.tapHighlight && this.stateChanged("held");
},
disabledChanged: function() {
this.stateChanged("disabled");
},
mouseholdHandler: function(a, b) {
this.disabled || (this.setHeld(!0), this.fire("onmousehold", b));
},
mousereleaseHandler: function(a, b) {
this.setHeld(!1), this.fire("onmouserelease", b);
},
clickHandler: function(a, b) {
if (!this.disabled) {
this.setHeld(!0);
var c = this.hasNode();
enyo.callWithoutNode(this, c, enyo.bind(this, "setHeld", !1));
var d = this.domAttributes.className;
setTimeout(enyo.hitch(this, function() {
c.className = d, this.doClick(b, b.rowIndex);
}), 100);
}
}
}), enyo.findFlyweight = function(a) {
var b = a, c;
while (b) {
c = enyo.$[b.id];
if (c && c.kindName.indexOf("Flyweight") >= 0) return c;
b = b.parentNode;
}
}, enyo.callWithoutNode = function(a, b, c) {
a.node = null;
var d = a.hasNode;
a.hasNode = enyo.nop, c(), a.hasNode = d, a.node = b;
}, enyo.callWithNode = function(a, b, c) {
var d = enyo.findFlyweight(a.node), e = d || a, f = e.node, g = d ? d.findNode(b) : b;
e.setNode(g);
var h = enyo._toArray(arguments, 3);
c = enyo.isString(c) ? a[c] : c, c.apply(a, h);
};

// palm/controls/SwipeableItem.js

enyo.kind({
name: "enyo.SwipeableItem",
kind: enyo.Item,
published: {
swipeable: !0,
confirmRequired: !0,
confirmCaption: enyo._$L("Delete"),
cancelCaption: enyo._$L("Cancel"),
confirmShowing: !1,
confirmWhenAutoHidden: !1,
allowLeft: !0
},
className: "enyo-item enyo-swipeableitem",
triggerDistance: 50,
lastConfirmIndex: null,
events: {
onConfirm: "",
onCancel: "",
onSwipe: "",
onConfirmShowingChanged: "",
onDrag: ""
},
chrome: [ {
name: "confirm",
canGenerate: !1,
showing: !1,
kind: "ScrimmedConfirmPrompt",
className: "enyo-fit",
onConfirm: "confirmSwipe",
onCancel: "cancelSwipe"
} ],
statified: {
confirmGenerated: !1
},
create: function() {
this.inherited(arguments), this.confirmCaptionChanged(), this.cancelCaptionChanged();
},
confirmCaptionChanged: function() {
this.$.confirm.setConfirmCaption(this.confirmCaption);
},
cancelCaptionChanged: function() {
this.$.confirm.setCancelCaption(this.cancelCaption);
},
getContent: function() {
return this.inherited(arguments);
},
clickHandler: function(a, b) {
this.confirmShowing || this.inherited(arguments);
},
flickHandler: function(a, b) {
if (this.swipeable && !this.confirmShowing && Math.abs(b.xVel) > Math.abs(b.yVel)) {
this.handlingDrag = !1, this.hasNode() && (this.node.style.webkitTransform = ""), this.handleSwipe();
return !0;
}
},
dragstartHandler: function(a, b) {
this.resetPosition();
if (this.swipeable && b.horizontal && !this.confirmShowing && this.hasNode()) {
this.index = b.rowIndex, this.handlingDrag = !0;
return !0;
}
return this.fire("ondragstart", b);
},
dragHandler: function(a, b) {
var c = this.getDx(b);
this.handlingDrag && (this.hasNode() ? (this.node.style.webkitTransform = "translate3d(" + c + "px, 0, 0)", this.doDrag(c)) : console.log("drag with no node!"));
},
dragfinishHandler: function(a, b) {
if (this.handlingDrag) {
var c = this.getDx(b);
b.preventClick(), this.handlingDrag = !1, this.resetPosition(), Math.abs(c) > this.triggerDistance && this.handleSwipe();
} else this.fire("ondragfinish", b);
},
handleSwipe: function() {
this.doSwipe(this.index), this.confirmRequired ? this.setConfirmShowing(!0) : this.doConfirm(this.index);
},
resetPosition: function() {
this.hasNode() && (this.node.style.webkitTransform = "", this.doDrag(0));
},
confirmShowingChanged: function() {
if (!this.confirmGenerated) {
var a = this.$.confirm;
this.confirmGenerated = !0, a.canGenerate = !0, a.renderNode(), this.node && (a.node = this.node.querySelector("[id=" + a.id + "]"));
}
this.$.confirm.canGenerate = this.confirmGenerated;
var b = this.confirmShowing, c;
b ? (c = this.confirmFlyweightSiblings(), this.lastConfirmIndex = this.index) : this.lastConfirmIndex = null, this.applyStyle("position", b ? "relative" : null), this.$.confirm.setShowing(b), this.doConfirmShowingChanged(b, this.index, c);
},
findRowManager: function() {
var a = this.parent;
while (a) {
if (a.prepareRow) return this.rowManager = a;
a = a.parent;
}
},
confirmFlyweightSiblings: function() {
var a, b = this.rowManager || this.findRowManager();
if (b && b.prepareRow && this.lastConfirmIndex != null) {
b.prepareRow(this.lastConfirmIndex);
if (this.confirmShowing) {
var c = this.index;
this.index = this.lastConfirmIndex, this.setConfirmShowing(!1), this.confirmWhenAutoHidden && (a = !0, this.doConfirm(this.index)), this.index = c;
}
b.prepareRow(this.index);
}
return a;
},
confirmSwipe: function(a) {
this.setConfirmShowing(!1), this.doConfirm(this.index);
return !0;
},
cancelSwipe: function(a) {
this.setConfirmShowing(!1), this.doCancel(this.index);
return !0;
},
getDx: function(a) {
return a.dx > 0 || this.allowLeft ? a.dx : 0;
}
}), enyo.kind({
name: "enyo.SwipeableItem2",
kind: enyo.SwipeableItem,
dragstartHandler: function() {
if (this.exitIntervalId) return !0;
return this.inherited(arguments);
},
dragHandler: function() {
if (this.exitIntervalId) return !0;
return this.inherited(arguments);
},
dragfinishHandler: function(a, b) {
if (this.exitIntervalId) return !0;
if (this.handlingDrag) {
var c = this.getDx(b);
this.setSwipeable(!1), this.exitPos = c, this.exitDirection = c > 0 ? 1 : -1, Math.abs(c) > this.triggerDistance ? (this.exitTarget = this.node.offsetWidth, this.exitIntervalId = window.setInterval(enyo.bind(this, "animateExit"), 33), this.exitSpeed = 40) : (this.exitDirection *= -1, this.exitTarget = 0, this.exitSpeed = 10, this.exitIntervalId = window.setInterval(enyo.bind(this, "animateReset"), 33)), this.handlingDrag = !1, b.preventClick();
return !0;
}
},
animateReset: function() {
this.animateFrame(), this.exitDirection < 0 === this.exitPos < 0 && this.animationComplete();
},
animateExit: function() {
this.animateFrame(), Math.abs(this.exitPos) > this.exitTarget && (this.animationComplete(), this.handleSwipe());
},
animateFrame: function() {
this.exitPos += this.exitSpeed * this.exitDirection, this.node.style.webkitTransform = "translate3d(" + this.exitPos + "px, 0, 0)", this.doDrag(this.exitPos);
},
animationComplete: function() {
this.resetPosition(), this.setSwipeable(!0);
},
resetPosition: function() {
this.exitIntervalId && (window.clearInterval(this.exitIntervalId), this.exitIntervalId = undefined), this.inherited(arguments);
}
});

// palm/controls/menu/Menu.js

enyo.kind({
name: "enyo.Menu",
kind: enyo.Popup,
published: {
items: [],
autoCloseSubItems: !0
},
className: "enyo-popup enyo-popup-menu",
chrome: [ {
name: "client",
className: "enyo-popup-inner",
kind: "BasicScroller",
autoVertical: !0,
vertical: !1,
layoutKind: "OrderedLayout"
} ],
defaultKind: "MenuItem",
removeControl: function(a) {
this.inherited(arguments), a == this._lastItem && (this._lastItem = null);
},
show: function() {
if (this.autoCloseSubItems) for (var a = 0, b = this.getControls(), c; c = b[a]; a++) enyo.call(c, "closeAll");
this.inherited(arguments);
},
itemsChanged: function() {
this._lastItem = null, this.destroyControls();
for (var a = 0, b, c; b = this.items[a]; a++) b = enyo.isString(b) ? {
caption: b
} : b, this.createComponent(b);
this.render();
},
fetchItemByValue: function(a) {
var b = this.getControls();
for (var c = 0, d; d = b[c]; c++) if (d.getValue && d.getValue() == a) return d;
},
scrollIntoView: function(a, b) {
this.$.client.scrollIntoView(a, b);
},
flow: function() {
this.inherited(arguments), this.styleLastItem();
},
_locateLastItem: function(a) {
if (a.getOpen && !a.getOpen()) return a;
var b = a.getControls(), c = b.length;
return c ? this._locateLastItem(b[c - 1]) : a;
},
locateLastItem: function() {
return this._locateLastItem(this);
},
styleLastItem: function() {
this._lastItem && !this._lastItem.destroyed && this._lastItem.addRemoveMenuLastStyle(!1);
var a = this.locateLastItem();
a && a.addRemoveMenuLastStyle && (a.addRemoveMenuLastStyle(!0), this._lastItem = a);
}
});

// palm/controls/menu/MenuItem.js

enyo.kind({
name: "enyo.MenuItem",
kind: enyo.Control,
published: {
caption: "",
value: undefined,
icon: "",
orderStyle: "",
open: !1,
disabled: !1,
hideIcon: !1,
tapHighlight: !0
},
indentPadding: 24,
events: {
onclick: "menuItemClick"
},
defaultKind: "MenuItem",
chrome: [ {
name: "item",
kind: enyo.Item,
layoutKind: "HFlexLayout",
tapHighlight: !0,
align: "center",
onclick: "itemClick",
components: [ {
name: "icon",
kind: enyo.Image,
className: "enyo-menuitem-icon"
}, {
name: "caption",
flex: 1,
className: "enyo-menuitem-caption"
}, {
name: "arrow",
kind: enyo.CustomButton,
toggling: !0,
showing: !1,
className: "enyo-menuitem-arrow"
} ]
} ],
_depth: 0,
create: function(a) {
this.inherited(arguments), this.value === undefined && (this.value = this.caption), this.caption = this.caption || this.content || this.value, this.captionContainer = this.$.item, this.$.item.addClass(this.itemClassName), this.captionChanged(), this.openChanged(), this.iconChanged(), this.disabledChanged(), this.tapHighlightChanged();
},
addControl: function(a) {
!a.isChrome && !this.$.client && (this.$.arrow.setShowing(!0), this.createChrome([ {
name: "client",
kind: enyo.BasicDrawer,
open: !1,
layoutKind: "OrderedLayout"
} ])), this.inherited(arguments);
},
styleDepth: function() {
this.$.item.applyStyle("padding-left", this._depth * this.indentPadding + "px");
},
hasControls: function() {
return this.getControls().length;
},
flowMenu: function() {
var a = this.getControls();
this.$.item.addRemoveClass("enyo-menu-has-items", a.length);
for (var b = 0, c; c = a[b]; b++) c.styleDepth && (c._depth = this._depth + 1, c.styleDepth());
},
flow: function() {
this.flowMenu(), this.inherited(arguments);
},
captionChanged: function() {
this.$.caption.setContent(this.caption);
},
iconChanged: function() {
this.$.icon.setSrc(enyo.path.rewrite(this.icon)), this.$.icon.setShowing(!this.hideIcon && this.icon);
},
hideIconChanged: function() {
this.$.icon.setShowing(!this.hideIcon);
},
disabledChanged: function() {
this.$.item.setDisabled(this.disabled);
},
tapHighlightChanged: function() {
this.$.item.tapHighlight = this.tapHighlight;
},
fetchMenu: function() {
var a = this.parent;
while (a) {
if (a instanceof enyo.Menu) return a;
a = a.parent;
}
},
itemClick: function(a, b) {
if (this.hasControls()) this.setOpen(!this.open); else {
var c = this.fetchMenu();
c && c.close();
}
this.doClick(b);
},
clickHandler: function() {},
isLastControl: function() {
var a = this.manager ? this.manager.getControls() : [];
return this == a[a.length - 1];
},
openChanged: function() {
this.$.item.addRemoveClass("collapsed", !this.open), this.$.arrow.setDown(this.open), this.$.client && this.$.client.setOpen(this.open);
if (this.isLastControl()) {
var a = this.fetchMenu();
a && a.styleLastItem();
}
},
closeAll: function() {
this.setOpen(!1);
for (var a = 0, b = this.getControls(), c; c = b[a]; a++) enyo.call(c, "closeAll");
},
addRemoveMenuLastStyle: function(a) {
this.$.item.addRemoveClass("enyo-menu-last", a);
},
orderStyleChanged: function(a) {
this.$.item.removeClass(a), this.$.item.addClass(this.orderStyle);
},
getItemClassName: function() {
return this.$.item.getClassName();
},
setItemClassName: function(a) {
this.$.item.setClassName(a);
}
}), enyo.kind({
name: "enyo.MenuCheckItem",
kind: enyo.MenuItem,
published: {
checked: !1
},
chrome: [ {
name: "item",
kind: enyo.Item,
tapHighlight: !0,
align: "center",
className: "enyo-menuitem",
layoutKind: "HFlexLayout",
onclick: "itemClick",
components: [ {
name: "icon",
kind: "Image",
className: "enyo-menuitem-icon"
}, {
name: "caption",
flex: 1,
className: "enyo-menucheckitem-caption"
}, {
name: "arrow",
kind: enyo.CustomButton,
toggling: !0,
className: "enyo-menucheckitem-arrow"
} ]
} ],
create: function() {
this.inherited(arguments), this.checkedChanged();
},
checkedChanged: function() {
this.$.item.checked = this.checked, this.$.item.stateChanged("checked");
},
setSelected: function(a) {
this.setChecked(a);
}
});

// palm/controls/popup/PopupSelect.js

enyo.kind({
name: "enyo.PopupSelect",
kind: enyo.Menu,
published: {
selected: null
},
events: {
onSelect: ""
},
className: "enyo-popup enyo-popup-menu enyo-popupselect",
menuItemClick: function(a) {
this.setSelected(a);
},
selectedChanged: function(a) {
this.doSelect(this.selected, a);
}
});

// palm/controls/popup/PopupList.js

enyo.kind({
name: "enyo.PopupList",
kind: enyo.PopupSelect,
components: [ {
name: "list",
kind: "VirtualRepeater",
onGetItem: "listGetItem"
} ],
create: function() {
this.inherited(arguments), this.$.list.createComponent({
name: "item",
kind: this.defaultKind,
owner: this
}), this.itemClassName = this.$.item.getItemClassName();
},
menuItemClick: function(a, b) {
this.setSelected(b.rowIndex);
},
listGetItem: function(a, b) {
var c = this.items.length;
if (b < c) {
var d = this.items[b], e = enyo.isString(d) ? d : d.caption;
this.$.item.setCaption(e);
var f = c == 1 ? "single" : b == 0 ? "first" : b == c - 1 ? "last" : "";
f = f ? " enyo-" + f : "", this.$.item.setItemClassName(this.itemClassName + f);
return !0;
}
},
itemsChanged: function() {
this.generated && this.$.list.render();
},
fetchRowNode: function(a) {
return this.$.list.fetchRowNode(a);
},
scrollToSelected: function() {
var a = this.fetchRowNode(this.selected), b = this.$.list.hasNode(), c = enyo.dom.calcNodeOffset(a, b);
this.scrollIntoView(c.top);
}
});

// palm/controls/popup/ModalDialog.js

enyo.kind({
name: "enyo.ModalDialog",
kind: enyo.Popup,
className: "enyo-popup enyo-modaldialog",
scrim: !0,
modal: !0,
published: {
caption: ""
},
chrome: [ {
className: "enyo-modaldialog-container",
components: [ {
name: "modalDialogTitle",
className: "enyo-text-ellipsis enyo-modaldialog-title"
}, {
name: "client",
className: "enyo-modaldialog-content"
} ]
} ],
create: function() {
this.inherited(arguments), this.caption = this.caption || this.label || this.content, this.captionChanged();
},
captionChanged: function() {
this.$.modalDialogTitle.setContent(this.caption);
}
});

// palm/controls/ListSelector.js

enyo.kind({
name: "enyo.ListSelector",
kind: enyo.Control,
published: {
value: "",
items: [],
label: "",
hideItem: !1,
hideArrow: !1,
disabled: !1
},
events: {
onChange: "",
onSelect: ""
},
layoutKind: "HFlexLayout",
itemKind: "MenuCheckItem",
align: "center",
chrome: [ {
kind: "HFlexBox",
flex: 1,
components: [ {
name: "itemContainer"
}, {
name: "client"
} ]
}, {
name: "label",
className: "enyo-listselector-label enyo-label"
}, {
name: "arrow",
className: "enyo-listselector-arrow"
} ],
create: function(a) {
this.inherited(arguments), this.item = this.$.itemContainer.createComponent({
kind: this.itemKind,
itemClassName: "enyo-listselector-item",
tapHighlight: !1,
owner: this
}), this.makePopup(), this.itemsChanged(), this.disabledChanged(), this.labelChanged(), this.hideArrowChanged();
},
disabledChanged: function() {
this.$.itemContainer.addRemoveClass("enyo-disabled", this.disabled);
},
hideItemChanged: function() {
this.item.setShowing(!this.hideItem);
},
labelChanged: function() {
this.$.label.setContent(this.label);
},
hideArrowChanged: function() {
this.$.arrow.setShowing(!this.hideArrow);
},
fetchDefaultItem: function() {
var a = this.popup.getControls();
if (a.length) return a[0];
},
makePopup: function() {
this.popup = this.createComponent({
kind: "PopupSelect",
onSelect: "popupSelect",
defaultKind: this.itemKind
});
},
openPopup: function(a) {
var b = this.popup.selected;
b && b.setSelected(!1), this.valueChanged(), this.popup.openAroundControl(this);
},
clickHandler: function(a, b) {
this.disabled || (this.doClick(b), this.openPopup(b));
},
itemsChanged: function() {
this.items = this.items || [], this.popup.setItems(this.items), this.item.setShowing(this.items && this.items.length), this.valueChanged();
},
valueChanged: function(a) {
var b = this.popup.fetchItemByValue(this.value);
b || (b = this.fetchDefaultItem(), this.value = b ? b.getValue() : "");
if (this.value != a) if (b === undefined) this.value = a; else {
this.hideItem || this.setItemProps(b), this.hideItemChanged(), b.setSelected(!0), this.popup.selected = this.selected = b;
var c = this.popup.fetchItemByValue(a);
c && c.setSelected(!1);
}
},
setItemProps: function(a) {
this.item.setCaption(a.getCaption()), this.item.setIcon(a.getIcon());
},
popupSelect: function(a, b, c) {
var d = this.value;
this.setValue(b.value), this.selected = b, this.doSelect(b, this.item), this.value != d && this.doChange(this.value, d);
}
});

// palm/controls/button/RadioGroup.js

enyo.kind({
name: "enyo.RadioGroup",
kind: enyo.OrderedContainer,
defaultKind: "RadioButton",
className: "enyo-radiogroup",
published: {
value: 0
},
events: {
onChange: ""
},
create: function() {
this.inherited(arguments), this.valueChanged();
},
valueChanged: function(a) {
this.setRadioDepressed(a, !1), this.setRadioDepressed(this.value, !0);
},
setRadioDepressed: function(a, b) {
var c = this.fetchControlByValue(a);
c && c.setDepressed(b);
},
fetchControlByValue: function(a) {
var b = this.controls;
for (var c = 0, d; d = b[c]; c++) if (d.getValue() == a) return d;
},
radioButtonClick: function(a) {
var b = this.value;
this.setValue(a.getValue()), this.value != b && this.doChange(this.value);
}
});

// palm/controls/button/RadioButton.js

enyo.kind({
name: "enyo.RadioButton",
kind: enyo.IconButton,
flex: 1,
className: "enyo-radiobutton",
published: {
value: "",
depressed: !1
},
events: {
onmousedown: ""
},
getValue: function() {
return this.value || this.manager.indexOfControl(this);
},
clickHandler: function(a, b) {
this.disabled || (this.dispatch(this.manager, "radioButtonClick"), this.fire("onclick", b));
}
});

// palm/controls/button/TabGroup.js

enyo.kind({
name: "enyo.TabGroup",
kind: enyo.RadioGroup,
defaultKind: "TabButton"
});

// palm/controls/button/TabButton.js

enyo.kind({
name: "enyo.TabButton",
kind: enyo.RadioButton,
className: "enyo-tabbutton"
});

// palm/controls/menu/AppMenu.js

enyo.kind({
name: "enyo.AppMenu",
kind: enyo.Menu,
className: "enyo-appmenu",
defaultKind: "AppMenuItem",
scrim: !1,
create: function() {
this.inherited(arguments), this.$.client.addClass("enyo-appmenu-inner");
},
show: function() {
this.applyMaxSize(this.clampSize()), this.inherited(arguments), enyo.appMenu.isOpen = !0;
},
hide: function() {
this.inherited(arguments), enyo.appMenu.isOpen = !1;
}
}), enyo.appMenu = {
isOpen: !1,
toggle: function() {
enyo.appMenu.isOpen ? enyo.appMenu.close() : enyo.appMenu.open();
},
open: function() {
enyo.dispatch({
type: "openAppMenu"
});
},
close: function() {
enyo.dispatch({
type: "closeAppMenu"
});
}
};

// palm/controls/menu/AppMenuItem.js

enyo.kind({
name: "enyo.AppMenuItem",
kind: enyo.MenuItem,
defaultKind: "AppMenuItem",
create: function() {
this.inherited(arguments), this.$.item.addClass("enyo-appmenu-item");
}
});

// palm/controls/menu/HelpMenu.js

enyo.kind({
name: "enyo.HelpMenu",
kind: enyo.AppMenuItem,
caption: enyo._$L("Help"),
published: {
target: ""
},
helpAppId: "com.palm.app.help",
components: [ {
name: "launchHelp",
kind: "PalmService",
service: "palm://com.palm.applicationManager/",
method: "open"
} ],
itemClick: function() {
this.inherited(arguments), this.$.launchHelp.call({
id: this.helpAppId,
params: {
target: this.target
}
});
}
});

// palm/controls/button/ToolButtonGroup.js

enyo.kind({
name: "enyo.ToolButtonGroup",
kind: enyo.OrderedContainer,
className: "enyo-menu-toolbar",
defaultKind: "GroupedToolButton"
});

// palm/controls/menu/EditMenu.js

enyo.kind({
name: "enyo.EditMenu",
kind: enyo.AppMenuItem,
caption: enyo._$L("Edit"),
published: {
selectAllDisabled: !1,
cutDisabled: !1,
copyDisabled: !1,
pasteDisabled: !1,
showShortcuts: !1
},
events: {
onSelectAll: "",
onCut: "",
onCopy: "",
onPaste: ""
},
defaultKind: "EditMenuItem",
components: [ {
name: "selectAll",
caption: enyo._$L("Select All"),
command: "selectAll",
onclick: "send",
shortcut: "A"
}, {
name: "cut",
caption: enyo._$L("Cut"),
command: "cut",
onclick: "send",
shortcut: "X"
}, {
name: "copy",
caption: enyo._$L("Copy"),
command: "copy",
onclick: "send",
shortcut: "C"
}, {
name: "paste",
caption: enyo._$L("Paste"),
command: "paste",
onclick: "send",
shortcut: "P"
} ],
create: function() {
this.inherited(arguments), this.selectAllDisabledChanged(), this.cutDisabledChanged(), this.copyDisabledChanged(), this.pasteDisabledChanged(), this.showShortcutsChanged();
},
mousedownHandler: function(a, b) {
b.preventDefault();
},
send: function(a) {
this["do" + enyo.cap(a.command)](), enyo.dispatch({
type: a.command,
target: document.activeElement
});
},
selectAllDisabledChanged: function() {
this.$.selectAll.setDisabled(this.selectAllDisabled);
},
cutDisabledChanged: function() {
this.$.cut.setDisabled(this.cutDisabled);
},
copyDisabledChanged: function() {
this.$.copy.setDisabled(this.copyDisabled);
},
pasteDisabledChanged: function() {
this.$.paste.setDisabled(this.pasteDisabled);
},
showShortcutsChanged: function() {
this.$.selectAll.setShowShortcut(this.showShortcuts), this.$.cut.setShowShortcut(this.showShortcuts), this.$.copy.setShowShortcut(this.showShortcuts), this.$.paste.setShowShortcut(this.showShortcuts);
}
});

// palm/controls/menu/EditMenuItem.js

enyo.kind({
name: "enyo.EditMenuItem",
kind: enyo.AppMenuItem,
published: {
showShortcut: !0
},
shortcutIconChrome: {
name: "shortcutIcon",
className: "enyo-editmenuitem-icon"
},
shortcutChrome: {
name: "shortcut",
className: "enyo-menuitem-caption enyo-editmenuitem-shortcut"
},
create: function() {
this.inherited(arguments), this.$.item.createComponent(this.shortcutIconChrome, {
owner: this
}), this.$.item.createComponent(this.shortcutChrome, {
owner: this
}), this.shortcutChanged(), this.showShortcutChanged();
},
shortcutChanged: function() {
this.$.shortcut.setContent("+" + this.shortcut);
},
showShortcutChanged: function() {
this.$.shortcut.setShowing(this.showShortcut), this.$.shortcutIcon.setShowing(this.showShortcut);
}
});

// palm/controls/button/GroupedToolButton.js

enyo.kind({
name: "enyo.GroupedToolButton",
kind: enyo.IconButton,
className: "enyo-grouped-toolbutton"
});

// palm/controls/button/RadioToolButton.js

enyo.kind({
name: "enyo.RadioToolButton",
kind: enyo.RadioButton,
className: "enyo-grouped-toolbutton"
});

// palm/controls/button/RadioToolButtonGroup.js

enyo.kind({
name: "enyo.RadioToolButtonGroup",
kind: enyo.RadioGroup,
className: "enyo-radio-toolbutton-group",
defaultKind: "RadioToolButton"
});

// palm/controls/picker/PickerButton.js

enyo.kind({
name: "enyo.PickerButton",
kind: enyo.CustomButton,
className: "enyo-custom-button enyo-picker-button",
published: {
focus: !1
},
events: {
onFocusChange: ""
},
chrome: [ {
name: "caption",
className: "enyo-picker-button-caption"
} ],
create: function() {
this.inherited(arguments), this.focusChanged();
},
captionChanged: function() {
this.$.caption.setContent(this.caption);
},
focusChanged: function() {
this.stateChanged("focus"), this.doFocusChange();
}
});

// palm/controls/picker/Picker.js

enyo.kind({
name: "enyo.Picker",
kind: enyo.PickerButton,
published: {
value: "",
textAlign: "center",
items: []
},
events: {
onChange: ""
},
create: function(a) {
this.inherited(arguments), this.makePopup(), this.textAlignChanged(), this.itemsChanged(), this.valueChanged();
},
makePopup: function() {
this.popup = this.createComponent({
kind: "PopupList",
className: "enyo-picker-popup",
onSelect: "popupSelect",
onClose: "popupClose",
scrim: this.scrim
});
},
scrimChanged: function() {
this.popup.scrim = this.scrim;
},
clickHandler: function(a, b) {
this.openPopup(b);
return this.doClick(b);
},
openPopup: function(a) {
this.setFocus(!0), this.dispatch(this.manager, this.managerOpenPopup);
var b = this.hasNode();
b && this.popup.applyStyle("min-width", b.offsetWidth + "px"), this.popup.openAtControl(this), this.valueChanged(), this.popup.scrollToSelected();
},
popupClose: function(a, b) {
this.setFocus(!1), this.dispatch(this.manager, this.managerClosePopup, [ b ]);
},
closePopup: function() {
this.popup.close();
},
itemsChanged: function() {
this.items = this.items || [], this.popup.setItems(this.items);
},
textAlignChanged: function() {
this.popup.applyStyle("text-align", this.textAlign);
},
fetchIndexByValue: function(a) {
for (var b = 0, c; c = this.items[b]; b++) {
var d = enyo.isString(c) ? c : c.value;
if (d == a) return b;
}
},
valueChanged: function(a) {
if (this.value != a) {
var b = this.fetchIndexByValue(this.value);
if (b === undefined) this.value = a; else {
this.popup.setSelected(b);
var c = this.items[b], d = enyo.isString(c) ? c : c.caption;
this.setCaption(d);
}
}
},
updateSelected: function(a, b) {
this.addRemoveSelectedStyle(b, !1), this.addRemoveSelectedStyle(a, !0);
},
addRemoveSelectedStyle: function(a, b) {
if (a >= 0) {
var c = this.popup.fetchRowNode(a);
c && (c.className = b ? "enyo-picker-item-selected" : "");
}
},
popupSelect: function(a, b, c) {
this.updateSelected(b, c);
var d = this.items[b], e = enyo.isString(d) ? d : d.value;
if (e !== undefined) {
var f = this.value;
this.setValue(e), this.value != f && (this.doChange(this.value), this.dispatch(this.manager, "pickerChange"));
}
}
});

// palm/controls/picker/IntegerPicker.js

enyo.kind({
name: "enyo.IntegerPicker",
kind: enyo.HFlexBox,
published: {
label: "value",
value: 0,
min: 0,
max: 9
},
events: {
onChange: ""
},
components: [ {
name: "label",
className: "enyo-picker-label enyo-label"
}, {
kind: "Picker"
} ],
create: function() {
this.inherited(arguments), this.labelChanged(), this.rangeChanged();
},
labelChanged: function() {
this.$.label.setContent(this.label);
},
minChanged: function() {
this.rangeChanged();
},
maxChanged: function() {
this.rangeChanged();
},
rangeChanged: function() {
var a = [];
for (var b = this.min; b <= this.max; b++) a.push(String(b));
this.$.picker.setItems(a), this.valueChanged();
},
valueChanged: function() {
this.value = this.value >= this.min && this.value <= this.max ? this.value : this.min, this.$.picker.setValue(String(this.value));
},
pickerChange: function() {
this.value = parseInt(this.$.picker.getValue()), this.doChange(this.value);
}
});

// palm/controls/picker/PickerGroup.js

enyo.kind({
name: "enyo.PickerGroup",
kind: enyo.HFlexBox,
published: {
label: "",
labelClass: ""
},
events: {
onChange: ""
},
defaultKind: "enyo.Picker",
chrome: [ {
name: "label",
kind: "Control",
className: "enyo-picker-label enyo-label"
}, {
name: "client",
kind: "Control",
layoutKind: "HFlexLayout"
} ],
constructor: function() {
this.inherited(arguments), this.pickers = [];
},
create: function() {
this.inherited(arguments), this.labelClassChanged(), this.labelChanged(), this.createChrome([ {
kind: "Popup",
style: "border-width: 0; -webkit-border-image: none;"
} ]);
},
addControl: function(a) {
this.inherited(arguments), a instanceof enyo.Picker && (a.scrim = !1, a.managerOpenPopup = "pickerPopupOpen", a.managerClosePopup = "pickerPopupClose", this.pickers.push(a));
},
removeControl: function(a) {
this.inherited(arguments);
},
pickerPopupOpen: function(a) {
this.applyToPickers("setFocus", [ !0 ]), this.openPopup();
},
pickerPopupClose: function(a, b) {
this.applyToPickers("setFocus", [ !1 ]), this.isEventInPicker(b) || this.closePopup();
},
isEventInPicker: function(a) {
var b = a && a.dispatchTarget;
if (b) for (var c = 0, d; d = this.pickers[c]; c++) if (b.isDescendantOf(d)) return !0;
},
openPopup: function() {
var a = this.$.popup;
a.isOpen || (a.openAtControl(this.$.client), a.setContent(this.$.client.generateHtml()));
},
closePopup: function() {
this.$.popup.setContent(""), this.$.popup.close();
},
applyToPickers: function(a, b) {
for (var c = 0, d; d = this.pickers[c]; c++) d[a].apply(d, b);
},
labelChanged: function() {
this.$.label.setContent(this.label);
},
labelClassChanged: function(a) {
a && this.$.label.removeClass(a), this.labelClass && this.$.label.addClass(this.labelClass);
},
pickerChange: function() {
this.doChange();
}
});

// palm/controls/picker/TimePicker.js

enyo.kind({
name: "enyo.TimePicker",
kind: enyo.PickerGroup,
published: {
label: enyo._$L("time"),
value: null,
minuteInterval: 1,
is24HrMode: null
},
components: [],
initComponents: function() {
this.inherited(arguments);
var a = {
h: "hour",
m: "minute",
a: "ampm"
};
this._tf = new enyo.g11n.Fmts;
var b = this._tf.getTimeFieldOrder(), c = b.split(""), d, e, f;
for (e = 0, f = c.length; e < f; e++) d = c[e], this.createComponent({
name: a[d]
});
this.$.ampm.setItems([ {
caption: this._tf.getAmCaption(),
value: 0
}, {
caption: this._tf.getPmCaption(),
value: 12
} ]), this.$.ampm.setValue(0), typeof this.is24HrMode !== "boolean" && (this.is24HrMode = !this._tf.isAmPm());
},
create: function() {
this.inherited(arguments), this.value = this.value || new Date, this.minuteIntervalChanged(), this.is24HrModeChanged();
},
minuteIntervalChanged: function() {
var a = [];
for (var b = 0; b < 60; b += this.minuteInterval) a.push(b < 10 ? "0" + b : String(b));
this.$.minute.setItems(a);
},
is24HrModeChanged: function() {
this.$.ampm.setShowing(!this.is24HrMode), this.setupHour(), this.valueChanged();
},
setupHour: function() {
var a = [];
for (var b = this.is24HrMode ? 0 : 1; b <= (this.is24HrMode ? 23 : 12); b++) a.push(String(b));
this.$.hour.setItems(a);
},
valueChanged: function() {
var a = this.value, b = a.getHours(), c = Math.floor(a.getMinutes() / this.minuteInterval) * this.minuteInterval, d = (b >= 12) * 12;
this.$.hour.setValue(this.is24HrMode ? b : b - d || 12), this.$.minute.setValue(c < 10 ? "0" + c : String(c)), this.$.ampm.setValue(d);
},
pickerChange: function() {
var a = parseInt(this.$.hour.getValue()), b = parseInt(this.$.minute.getValue(), 10), c = this.$.ampm.getValue();
a = this.is24HrMode ? a : a + (a == 12 ? -!c * 12 : c), this.value.setHours(a), this.value.setMinutes(b), this.doChange(this.value);
}
});

// palm/controls/picker/DatePicker.js

enyo.kind({
name: "enyo.DatePicker",
kind: enyo.PickerGroup,
published: {
label: enyo._$L("date"),
value: null,
hideDay: !1,
hideMonth: !1,
hideYear: !1,
minYear: 1900,
maxYear: 2099
},
components: [],
initComponents: function() {
this.inherited(arguments), this._tf = new enyo.g11n.Fmts;
var a = {};
this.hideDay || (a.d = "day"), this.hideMonth || (a.m = "month"), this.hideYear || (a.y = "year");
var b = {
d: "day",
m: "month",
y: "year"
}, c = this._tf.getDateFieldOrder(), d = c.split(""), e, f, g;
for (f = 0, g = d.length; f < g; f++) {
e = d[f];
var h = this.createComponent({
name: b[e]
});
a[e] || h.setShowing(!1);
}
},
create: function() {
this.inherited(arguments), this.value = this.value || new Date, this.setupMonth(), this.yearRangeChanged(), this.valueChanged();
},
setupMonth: function() {
var a = 0, b = this._tf.getMonthFields().map(function(b) {
return {
caption: b,
value: a++
};
});
this.$.month.setItems(b);
},
setupDay: function(a, b, c) {
var d = 32 - (new Date(a, b, 32)).getDate(), e = [];
for (var f = 1; f <= d; f++) e.push(String(f));
this.$.day.setItems(e), this.$.day.value = "", this.$.day.setValue(c > d ? d : c);
},
minYearChanged: function() {
this.yearRangeChanged();
},
maxYearChanged: function() {
this.yearRangeChanged();
},
yearRangeChanged: function() {
var a = [];
for (var b = this.minYear; b <= this.maxYear; b++) a.push(String(b));
this.$.year.setItems(a);
},
hideDayChanged: function() {
this.$.day.setShowing(!this.hideDay);
},
hideMonthChanged: function() {
this.$.month.setShowing(!this.hideMonth);
},
hideYearChanged: function() {
this.$.year.setShowing(!this.hideYear);
},
valueChanged: function() {
var a = this.value, b = a.getMonth(), c = a.getDate(), d = a.getFullYear();
this.setupDay(d, b, c), this.$.month.setValue(b), this.$.year.setValue(d);
},
pickerChange: function(a) {
var b, c, d;
this.hideDay || (b = parseInt(this.$.month.getValue()), this.value.setMonth(b)), this.hideMonth || (d = parseInt(this.$.year.getValue()), this.value.setYear(d)), this.hideYear || (c = parseInt(this.$.day.getValue()), a != this.$.day && !this.hideDay && this.setupDay(d, b, c), this.value.setDate(c)), this.doChange(this.value);
}
});

// palm/controls/progress/ProgressBar.js

enyo.kind({
name: "enyo.ProgressBar",
kind: enyo.Progress,
className: "enyo-progress-bar",
published: {
animatePosition: !0
},
events: {
onBeginAnimation: "",
onEndAnimation: ""
},
chrome: [ {
name: "animator",
kind: enyo.Animator,
onBegin: "beginAnimation",
onAnimate: "stepAnimation",
onEnd: "endAnimation",
onStop: "stopAnimation"
}, {
name: "bar",
className: "enyo-progress-bar-inner"
}, {
name: "client"
} ],
create: function() {
this.inherited(arguments), this.contentChanged();
},
contentChanged: function() {
this.$.client.setContent(this.content);
},
layoutKindChanged: function() {
this.$.client.align = this.align, this.$.client.pack = this.pack, this.$.client.setLayoutKind(this.layoutKind);
},
setPositionImmediate: function(a) {
var b = this.animatePosition;
this.animatePosition = !1, this.setPosition(a), this.animatePosition = b;
},
setPosition: function(a) {
this.$.animator.stop();
var b = this.position;
this.position = a, this.positionChanged(b);
},
applyPosition: function() {
var a = this.calcPercent(this.position);
this.lastPosition >= 0 && this.animatePosition && this.canAnimate() ? this.$.animator.play(this.calcPercent(this.lastPosition), a) : this.renderPosition(a);
},
renderPosition: function(a) {
this.$.bar.applyStyle("visibility", a <= 0 ? "hidden" : "visible"), this.$.bar.applyStyle("width", a + "%");
},
renderPositionDirect: function(a, b) {
a.visibility = b <= 0 ? "hidden" : "visible", a.width = b + "%";
},
canAnimate: function() {
return this.$.bar.hasNode();
},
beginAnimation: function(a, b, c) {
this.$.bar.domStyles.visibility = c <= 0 ? "hidden" : "visible", this.$.bar.domStyles.width = c + "%", this.$.bar.hasNode() && (a.style = this.$.bar.node.style, this.doBeginAnimation());
},
stepAnimation: function(a, b) {
this.renderPositionDirect(a.style, b);
},
endAnimation: function(a, b) {
this.completeAnimation(a, b);
},
stopAnimation: function(a, b, c, d) {
this.completeAnimation(a, d);
},
completeAnimation: function(a, b) {
this.renderPositionDirect(a.style, b), this.doEndAnimation();
},
forceBeginAnimation: function(a, b) {
this.beginAnimation(this.$.animator, a, b);
},
forceStepAnimation: function(a) {
this.stepAnimation(this.$.animator, a);
},
forceCompleteAnimation: function(a) {
this.completeAnimation(this.$.animator, a);
}
});

// palm/controls/progress/ProgressBarItem.js

enyo.kind({
name: "enyo.ProgressBarItem",
kind: enyo.ProgressBar,
className: "enyo-progress-bar-item",
create: function() {
this.inherited(arguments), this.$.bar.setClassName("enyo-progress-bar-item-inner"), this.$.client.addClass("enyo-progress-bar-item-client");
}
});

// palm/controls/progress/ProgressButton.js

enyo.kind({
name: "enyo.ProgressButton",
kind: enyo.ProgressBar,
className: "enyo-progress-button",
events: {
onCancel: ""
},
published: {
cancelable: !0
},
chrome: [ {
name: "animator",
kind: enyo.Animator,
onBegin: "beginAnimation",
onAnimate: "stepAnimation",
onEnd: "endAnimation",
onStop: "stopAnimation"
}, {
name: "bar",
className: "enyo-progress-button-inner"
}, {
className: "enyo-fit",
kind: "HFlexBox",
components: [ {
name: "client",
flex: 1,
align: "center",
layoutKind: "HFlexLayout",
className: "enyo-progress-button-client"
}, {
name: "cancelButton",
className: "enyo-progress-button-cancel",
requiresDomMousedown: !0,
onclick: "doCancel"
} ]
} ],
create: function() {
this.inherited(arguments), this.cancelableChanged();
},
cancelableChanged: function() {
this.$.cancelButton.setShowing(this.cancelable);
}
});

// palm/controls/progress/Slider.js

enyo.kind({
name: "enyo.Slider",
kind: enyo.ProgressBar,
className: "enyo-slider",
published: {
tapPosition: !0
},
events: {
onChange: "",
onChanging: ""
},
chrome: [ {
name: "animator",
kind: enyo.Animator,
onBegin: "beginAnimation",
onAnimate: "stepAnimation",
onEnd: "endAnimation",
onStop: "stopAnimation"
}, {
className: "enyo-slider-progress",
components: [ {
name: "bar",
className: "enyo-slider-inner",
components: [ {
name: "button",
kind: "CustomButton",
caption: " ",
toggle: !0,
allowDrag: !0,
className: "enyo-slider-button"
} ]
} ]
}, {
name: "client"
} ],
positionChanged: function(a) {
this.handlingDrag && !this.dragChange ? this.position = a : this.inherited(arguments);
},
renderPosition: function(a) {
this.$.button.applyStyle("left", a + "%");
},
renderPositionDirect: function(a, b) {
a.left = b + "%";
},
canAnimate: function() {
return this.$.button.hasNode();
},
beginAnimation: function(a, b, c) {
this.$.button.domStyles.left = c + "%", this.$.button.hasNode() && (a.style = this.$.button.node.style), this.doBeginAnimation();
},
calcWidth: function() {
var a = this.$.bar.hasNode();
return a.offsetWidth;
},
calcEventPosition: function(a) {
var b = this.$.bar.getOffset(), c = a - b.left;
return c / this.calcWidth() * (this.maximum - this.minimum) + this.minimum;
},
dragstartHandler: function(a, b) {
this.handlingDrag = !0, this._width = this.calcWidth(), this.$.button.setDown(!0);
return !0;
},
dragHandler: function(a, b) {
if (this.handlingDrag) {
var c = this.calcEventPosition(b.pageX);
this.dragChange = !0, this.setPositionImmediate(c), this.dragChange = !1, this.doChanging(this.position);
}
},
dragfinishHandler: function(a, b) {
this.handlingDrag && (this.toggleButtonUp(), this.doChange(this.position), this.handlingDrag = !1, b.preventClick());
},
completeAnimation: function(a, b) {
this.inherited(arguments), this._clicked && (this._clicked = !1, this.doChange(this.position));
},
clickHandler: function(a, b) {
if (this.tapPosition && b.dispatchTarget != this.$.button) {
this.$.animator.stop();
var c = this.calcEventPosition(b.pageX);
this._clicked = !0, this.setPosition(c), this.animatePosition || this.doChange(this.position);
}
},
mouseupHandler: function() {
this.toggleButtonUp();
},
toggleButtonUp: function() {
this.$.button.setDown(!1);
}
});

// palm/controls/progress/ProgressSlider.js

enyo.kind({
name: "enyo.ProgressSlider",
kind: enyo.Slider,
published: {
lockBar: !1,
barPosition: 0,
altBarPosition: 0,
barMinimum: 0,
barMaximum: 100
},
chrome: [ {
name: "animator",
kind: enyo.Animator,
onBegin: "beginAnimation",
onAnimate: "stepAnimation",
onEnd: "endAnimation",
onStop: "stopAnimation"
}, {
className: "enyo-progressslider-progress",
components: [ {
name: "bar",
kind: enyo.ProgressBar,
className: "enyo-progress-slider",
components: [ {
name: "altBar",
className: "enyo-progress-slider-alt-bar"
}, {
name: "button",
kind: "CustomButton",
caption: " ",
toggling: !0,
allowDrag: !0,
className: "enyo-slider-button"
} ]
} ]
}, {
name: "client"
} ],
create: function() {
this.inherited(arguments), this.barMinimumChanged(), this.barMaximumChanged(), this.barPositionChanged();
},
barPositionChanged: function() {
this.$.bar.setPosition(this.lockBar ? this.position : this.barPosition);
},
altBarPositionChanged: function() {
var a = this.$.bar.calcPercent(this.altBarPosition);
this.$.altBar.applyStyle("visibility", a <= 0 ? "hidden" : "visible"), this.$.altBar.applyStyle("width", a + "%");
},
barMinimumChanged: function() {
this.$.bar.setMinimum(this.lockBar ? this.minimum : this.barMinimum);
},
barMaximumChanged: function() {
this.$.bar.setMaximum(this.lockBar ? this.maximum : this.barMaximum);
},
renderPosition: function(a) {
this.inherited(arguments), this.lockBar && this.$.bar.renderPosition(a);
},
positionChanged: function(a) {
this.inherited(arguments), this.lockBar && a != undefined && !this.$.animator.isAnimating() && this.$.bar.setPositionImmediate(this.position);
},
lockBarChanged: function() {
this.lockBar && (this.$.bar.setMaximum(this.maximum), this.$.bar.setMinimum(this.minimum), this.$.bar.setPositionImmediate(this.position));
},
canAnimate: function() {
return this.inherited(arguments) && this.$.bar.canAnimate();
},
beginAnimation: function(a, b, c) {
this.inherited(arguments), this.lockBar && this.$.bar.forceBeginAnimation(b, c);
},
stepAnimation: function(a, b) {
this.inherited(arguments), this.lockBar && this.$.bar.forceStepAnimation(b);
},
completeAnimation: function(a, b) {
this.inherited(arguments), this.lockBar && this.$.bar.forceCompleteAnimation(b);
}
});

// palm/controls/ConfirmPrompt.js

enyo.kind({
name: "enyo.ConfirmPrompt",
kind: enyo.HFlexBox,
published: {
confirmCaption: enyo._$L("Confirm"),
cancelCaption: enyo._$L("Cancel")
},
className: "enyo-confirmprompt",
events: {
onConfirm: "confirmAction",
onCancel: "cancelAction"
},
defaultKind: "Button",
align: "center",
pack: "center",
chrome: [ {
name: "cancel",
onclick: "doCancel"
}, {
kind: "Control",
width: "14px"
}, {
name: "confirm",
className: "enyo-button-negative",
onclick: "doConfirm"
} ],
create: function() {
this.inherited(arguments), this.confirmCaptionChanged(), this.cancelCaptionChanged();
},
confirmCaptionChanged: function() {
this.$.confirm.setCaption(this.confirmCaption);
},
cancelCaptionChanged: function() {
this.$.cancel.setCaption(this.cancelCaption);
}
}), enyo.kind({
name: "enyo.ScrimmedConfirmPrompt",
kind: enyo.Control,
published: {
confirmCaption: enyo._$L("Confirm"),
cancelCaption: enyo._$L("Cancel")
},
events: {
onConfirm: "",
onCancel: ""
},
className: "enyo-confirmprompt",
chrome: [ {
name: "scrim",
className: "enyo-fit enyo-confirmprompt-scrim",
domStyles: {
"z-index": 1
}
}, {
name: "confirm",
kind: "ConfirmPrompt",
className: "enyo-fit",
domStyles: {
"z-index": 2
},
onConfirm: "doConfirm",
onCancel: "doCancel"
} ],
create: function() {
this.inherited(arguments), this.confirmCaptionChanged(), this.cancelCaptionChanged();
},
confirmCaptionChanged: function() {
this.$.confirm.setConfirmCaption(this.confirmCaption);
},
cancelCaptionChanged: function() {
this.$.confirm.setCancelCaption(this.cancelCaption);
}
});

// palm/controls/Spacer.js

enyo.kind({
name: "enyo.Spacer",
kind: enyo.Control,
className: "enyo-spacer",
flex: 1
});

// palm/controls/Hybrid.js

enyo.kind({
name: "enyo.Hybrid",
kind: enyo.Control,
published: {
executable: "",
params: [],
alphaBlend: !1,
height: 0,
width: 0
},
events: {
onPluginReady: "",
onPluginConnected: "",
onPluginDisconnected: ""
},
nodeTag: "object",
content: "",
requiresDomMousedown: !0,
pluginReady: !1,
deferredCalls: [],
deferredCallbacks: [],
create: function() {
this.inherited(arguments);
if (this.executable === "") throw "must set 'executable' on enyo.hybrid object";
this.widthChanged(), this.heightChanged(), (this.width === 0 || this.height === 0) && this.applyStyle("float", "left");
if (window.PalmSystem) {
this.setAttribute("type", "application/x-palm-remote"), this.setAttribute("exe", this.executable), this.setAttribute("alphablend", this.alphaBlend ? "true" : "false");
for (var a = 0; a < this.params.length; a++) this.setAttribute("param" + (a + 1), this.params[a]);
}
},
widthChanged: function() {
this.setAttribute("width", this.width);
},
heightChanged: function() {
this.setAttribute("height", this.height);
},
rendered: function() {
this.inherited(arguments), this.pluginReady = !1, this.hasNode() && (this.node.__PDL_PluginStatusChange__ = enyo.bind(this, this.pluginStatusChangedCallback), this.deferredCallbacks.forEach(function(a) {
this.node[a.name] = a.callback;
}, this));
},
pluginStatusChangedCallback: function(a) {
switch (a) {
case "ready":
this.pluginReadyCallback();
break;
case "connected":
this.pluginReady = !1, this.doPluginConnected();
break;
case "disconnected":
this.pluginReady = !1, this.doPluginDisconnected();
}
},
pluginReadyCallback: function() {
enyo.nextTick(this, function() {
this.pluginReady || (this.pluginReady = !0, this.doPluginReady(), this.deferredCalls.forEach(function(a) {
a.callback(enyo.call(this.node, a.methodName, a.args));
}, this), this.deferredCalls = []);
});
},
callPluginMethod: function(a) {
var b = Array.prototype.slice.call(arguments, 1);
if (this.pluginReady) return this.node[a].apply(this.node, b);
throw "plugin not ready";
},
callPluginMethodDeferred: function(a, b) {
var c = Array.prototype.slice.call(arguments, 2);
a === null && (a = enyo.nop), this.pluginReady ? a(this.node[b].apply(this.node, c)) : this.deferredCalls.push({
callback: a,
methodName: b,
args: c
});
},
addCallback: function(a, b, c) {
var d;
c ? d = function() {
var a = Array.prototype.slice.call(arguments);
a.unshift(b), a.unshift(this), enyo.nextTick.apply(enyo, a);
} : d = b, this.hasNode() && (this.node[a] = d), this.deferredCallbacks.push({
name: a,
callback: d
});
}
});

// palm/containers/Group.js

enyo.kind({
name: "enyo.Group",
kind: enyo.Control,
className: "enyo-group enyo-roundy",
published: {
caption: ""
},
chrome: [ {
name: "label",
kind: "Control",
className: "enyo-group-label"
}, {
name: "client",
kind: "Control",
className: "enyo-group-inner"
} ],
create: function() {
this.inherited(arguments), this.captionChanged();
},
captionChanged: function() {
this.$.label.setContent(this.caption), this.$.label.setShowing(this.caption), this.addRemoveClass("labeled", this.caption);
}
});

// palm/containers/RowGroup.js

enyo.kind({
name: "enyo.RowGroup",
kind: enyo.Group,
chrome: [ {
name: "label",
kind: "Control",
className: "enyo-group-label"
}, {
name: "client",
kind: "Control",
layoutKind: "OrderedLayout",
className: "enyo-group-inner"
} ],
defaultKind: "enyo.Item",
addChild: function(a) {
if (a.isChrome || a instanceof enyo.Item) this.inherited(arguments); else {
var b = this.createComponent({
kind: "RowItem",
tapHighlight: a.tapHighlight
});
b.addChild(a);
}
},
controlAtIndex: function(a) {
return this.getControls()[a];
},
showRow: function(a) {
var b = this.controlAtIndex(a);
b.setShowing(!0), this.$.client.flow();
},
hideRow: function(a) {
var b = this.controlAtIndex(a);
b.setShowing(!1), this.$.client.flow();
}
}), enyo.kind({
name: "enyo.RowItem",
kind: enyo.Item,
setOrderStyle: function(a) {
this.addRemoveClass(a, !this.hasClass(a));
var b = this.children[0];
b && (b.setOrderStyle ? b.setOrderStyle(a) : b.addRemoveClass(a, !b.hasClass(a)));
}
});

// palm/containers/DividerDrawer.js

enyo.kind({
name: "enyo.DividerDrawer",
kind: enyo.Drawer,
published: {
icon: "",
caption: ""
},
chrome: [ {
name: "caption",
kind: "enyo.Divider",
onclick: "toggleOpen",
components: [ {
name: "openButton",
kind: "enyo.SwitchedButton",
className: "enyo-collapsible-arrow"
} ]
}, {
name: "client",
kind: "enyo.BasicDrawer",
onOpenChanged: "doOpenChanged",
onOpenAnimationComplete: "doOpenAnimationComplete"
} ],
create: function() {
this.inherited(arguments), this.iconChanged();
},
captionChanged: function() {
this.$.caption.setCaption(this.caption), this.$.caption.applyStyle("display", this.caption ? "" : "none");
},
openChanged: function() {
this.inherited(arguments), this.$.openButton.setSwitched(!this.open);
},
iconChanged: function() {
this.$.caption.setIcon(this.icon);
}
}), enyo.kind({
name: "enyo.SwitchedButton",
kind: enyo.CustomButton,
published: {
switched: !1
},
caption: " ",
create: function() {
this.inherited(arguments), this.switchedChanged();
},
toggleSwitched: function() {
this.setSwitched(!this.switched);
},
switchedChanged: function(a) {
this.stateChanged("switched");
}
});

// palm/containers/Toaster.js

enyo.kind({
name: "enyo.Toaster",
kind: enyo.Popup,
className: "enyo-toaster",
published: {
flyInFrom: "bottom"
},
chrome: [ {
name: "animator",
kind: enyo.Animator,
onAnimate: "animate",
onEnd: "finishAnimate"
} ],
create: function() {
this.inherited(arguments), this.flyInFromChanged();
},
flyInFromChanged: function(a) {
this.applyStyle(this.flyInFrom, 0);
},
getAnimator: function() {
return this.$.animator;
},
renderOpen: function() {
this.inherited(arguments), this.startAnimate(100, 0);
},
renderClose: function() {
this.startAnimate(0, 100);
},
startAnimate: function(a, b) {
this.hasNode() && (this.$.animator.style = this.hasNode().style), this.$.animator.play(a, b);
},
animate: function(a, b) {
var c = this.domStyles, d = a.style, e = this.flyInFrom == "top" || this.flyInFrom == "bottom" ? "translateY(" : "translateX(";
e += this.flyInFrom == "top" || this.flyInFrom == "left" ? -b : b, e += "%)", c.webkitTransform = e, d && (d.webkitTransform = e);
},
finishAnimate: function(a, b) {
this.isOpen || this.hide();
},
isDraggableEvent: function(a) {
var b = a.dispatchTarget;
return b && b.slidingHandler;
},
isHorizontal: function() {
return this.flyInFrom == "right" || this.flyInFrom == "left";
},
dragstartHandler: function(a, b) {
this.isDraggableEvent(b) && (this.dragging = !0, this.dragD0 = 0);
},
dragHandler: function(a, b) {
if (this.dragging) {
var c = this.isHorizontal() ? b.dx : b.dy;
this.dragD = this.dragD0 - c, this.dragD0 = c;
if (this.dragD0 * (this.flyInFrom == "right" || this.flyInFrom == "bottom" ? 1 : -1) > 0) {
var d = "translate3d(" + (this.isHorizontal() ? this.dragD0 + "px,0,0)" : "0," + this.dragD0 + "px,0)");
this.domStyles["-webkit-transform"] = this.node.style.webkitTransform = d;
}
}
},
dragfinishHandler: function(a, b) {
if (this.dragging) {
var c = this.hasNode()["client" + (this.isHorizontal() ? "Width" : "Height")], d = Math.abs(this.dragD0 / c) * 100;
this.dragD * (this.flyInFrom == "right" || this.flyInFrom == "bottom" ? 1 : -1) > 0 ? (this.startAnimate(d, 0), this.isOpen || (this.isOpen = !0, this.prepareOpen(), this.showHideScrim(this.isOpen), enyo.asyncMethod(this, "afterOpen"))) : (this.startAnimate(d, 100), this.isOpen && (this.isOpen = !1, this.prepareClose(), this.showHideScrim(this.isOpen), this.doClose())), this.dragging = !1;
}
}
});

// palm/containers/Dialog.js

enyo.kind({
name: "enyo.Dialog",
kind: enyo.Toaster,
className: "enyo-toaster enyo-dialog",
components: [ {
name: "client",
className: "enyo-dialog-inner"
} ]
});

// palm/containers/DialogPrompt.js

enyo.kind({
name: "enyo.DialogPrompt",
kind: enyo.Dialog,
scrim: !0,
published: {
title: "",
message: "",
acceptButtonCaption: enyo._$L("OK"),
cancelButtonCaption: enyo._$L("Cancel")
},
events: {
onAccept: "",
onCancel: ""
},
components: [ {
name: "client",
className: "enyo-dialog-inner",
components: [ {
name: "title",
className: "enyo-dialog-prompt-title"
}, {
className: "enyo-dialog-prompt-content",
components: [ {
name: "message",
className: "enyo-dialog-prompt-message"
}, {
name: "acceptButton",
kind: "Button",
onclick: "acceptClick"
}, {
name: "cancelButton",
kind: "Button",
onclick: "cancelClick"
} ]
} ]
} ],
create: function() {
this.inherited(arguments), this.titleChanged(), this.messageChanged(), this.acceptButtonCaptionChanged(), this.cancelButtonCaptionChanged();
},
open: function(a, b, c, d) {
a && this.setTitle(a), b && this.setMessage(b), c && this.setAcceptButtonCaption(c), d != undefined && this.setCancelButtonCaption(d), this.inherited(arguments);
},
titleChanged: function() {
this.$.title.setContent(this.title), this.$.title.setShowing(this.title);
},
messageChanged: function() {
this.$.message.setContent(this.message);
},
acceptButtonCaptionChanged: function() {
this.$.acceptButton.setCaption(this.acceptButtonCaption);
},
cancelButtonCaptionChanged: function() {
this.$.cancelButton.setCaption(this.cancelButtonCaption), this.$.cancelButton.setShowing(this.cancelButtonCaption);
},
acceptClick: function() {
this.doAccept(), this.close();
},
cancelClick: function() {
this.doCancel(), this.close();
}
});

// palm/containers/SlidingView.js

enyo.kind({
name: "enyo.SlidingView",
kind: enyo.Control,
className: "enyo-sliding-view",
layoutKind: "VFlexLayout",
events: {
onResize: ""
},
published: {
dragAnywhere: !0,
edgeDragging: !1,
fixedWidth: !1,
minWidth: 0,
peekWidth: 0
},
chrome: [ {
name: "shadow",
className: "enyo-sliding-view-shadow"
}, {
name: "client",
className: "enyo-bg",
kind: enyo.Control,
flex: 1
}, {
name: "edgeDragger",
slidingHandler: !0,
kind: enyo.Control,
className: "enyo-sliding-view-nub"
} ],
slidePosition: 0,
create: function() {
this.inherited(arguments), this.layout = new enyo.VFlexLayout, this.edgeDraggingChanged(), this.minWidthChanged();
},
calcControlOffset: function(a) {
var b = this.inherited(arguments);
b.left += this.slidePosition;
return b;
},
layoutKindChanged: function() {
this.$.client.setLayoutKind(this.layoutKind);
},
edgeDraggingChanged: function() {
this.$.edgeDragger.setShowing(this.edgeDragging);
},
findSiblings: function() {
return this.manager.views;
},
getPreviousSibling: function() {
return this.findSiblings()[this.index - 1];
},
getNextSibling: function() {
return this.findSiblings()[this.index + 1];
},
getFirstSibling: function() {
var a = this.findSiblings();
return a[0];
},
getLastSibling: function() {
var a = this.findSiblings();
return a[a.length - 1];
},
select: function() {
this.manager.selectView(this);
},
selectPrevious: function() {
enyo.call(this.getPreviousSibling(), "select");
},
selectNext: function() {
enyo.call(this.getNextSibling(), "select");
},
toggleSelected: function() {
this == this.manager.view ? this.selectPrevious() : this.select();
},
slideFromOutOfView: function() {
this.hasNode() && !this.manager.dragging && !this.manager.isAnimating() && (this.show(), this.applySlideToNode(this.calcSlideMax() + this.node.offsetWidth), this.moveAlone = !0, this.manager.playAnimation(this));
},
calcSlide: function() {
var a = this.index, b = this.manager.view.index, c = a == b ? "Selected" : a < b ? "Before" : "After";
return this["calcSlide" + c]();
},
getLeftOffset: function() {
if (this.hasNode()) {
this._offset = undefined;
return this._offset !== undefined ? this._offset : this._offset = this.node.offsetLeft;
}
return 0;
},
calcSlideMin: function() {
var a = -this.getLeftOffset();
return this.peekWidth + a;
},
calcSlideMax: function() {
var a = this.getPreviousSibling();
return a && a.slidePosition || 0;
},
calcSlideBefore: function() {
var a = this.calcSlideMin();
if (this.manager.isAnimating() || this.manager.dragging) {
var b = this.getNextSibling();
if (this.hasNode() && b) return Math.max(a, b.slidePosition);
}
return a;
},
calcSlideSelected: function() {
return this.calcSlideMin();
},
calcSlideAfter: function() {
if (this.manager.isAnimating() || this.manager.dragging) return this.calcSlideMax();
var a = this.manager.view;
return a ? a.calcSlideMin() : 0;
},
move: function(a) {
this.applySlideToNode(a);
var b = this.getNextSibling();
b && b.validateSlide();
},
applySlideToNode: function(a) {
if (a != this.slidePosition) {
this.slidePosition = a;
if (this.hasNode()) {
var b = a !== null ? "translate3d(" + a + "px,0,0)" : "";
this.domStyles["-webkit-transform"] = this.node.style.webkitTransform = b;
}
}
},
validateSlide: function() {
this.move(this.calcSlide());
},
validateAll: function() {
var a = this.getFirstSibling() || this;
a.validateSlide(), this.manager.dragging || enyo.asyncMethod(this, "resizeLastSibling");
},
canAnimate: function() {
return this.slidePosition != this.calcSlide();
},
animateMove: function(a) {
this.move(a);
var b = this.getPreviousSibling();
while (b) b.applySlideToNode(b.calcSlideBefore()), b = b.getPreviousSibling();
},
dragstartHandler: function(a, b) {
b.sliding = this;
},
isDraggableEvent: function(a) {
var b = a.dispatchTarget;
return b && b.slidingHandler || this.dragAnywhere;
},
canDrag: function(a) {
this.dragMin = this.calcSlideMin(), this.dragMax = this.calcSlideMax();
var b = this.index, c = this.manager.view.index;
if (this.showing && b >= c) {
var d = this.dragMax != this.dragMin && (a > 0 && this.slidePosition <= this.dragMax || a < 0 && this.slidePosition > this.dragMin);
return d;
}
},
isAtDragMax: function() {
return this.slidePosition == this.dragMax;
},
isAtDragMin: function() {
return this.slidePosition == this.dragMin;
},
isAtDragBoundary: function() {
return this.isAtDragMax() || this.isAtDragMin();
},
beginDrag: function(a, b) {
this.dragStart = this.slidePosition - b;
},
drag: function(a) {
var b = a.dx + this.dragStart, c = Math.max(this.dragMin, Math.min(b, this.dragMax));
this.shouldDragSelect = b < this.slidePosition, this.move(c);
if (this.isAtDragMin() && this.shouldDragSelect || this.isAtDragMax() && !this.shouldDragSelect) return this.getDragSelect();
},
dragFinish: function() {
return this.getDragSelect();
},
getDragSelect: function() {
return this.shouldDragSelect ? this : this.getPreviousSibling();
},
fixedWidthChanged: function() {
this.fixedWidth && this.$.client.applyStyle("width", null);
},
minWidthChanged: function() {
this.$.client.applyStyle("min-width", this.minWidth || null);
},
resizeLastSibling: function() {
if (!this.manager.dragging) {
var a = this.getLastSibling();
if (a && !a.fixedWidth) {
var b = a.calcSlide();
a.adjustWidth(b);
}
}
},
adjustWidth: function(a) {
if (this.hasNode() && this.$.client.hasNode()) {
var b = this.node.offsetWidth, c = Math.max(b, b - a);
c && (this.$.client.domStyles.width = this.$.client.node.style.width = c + "px", this.doResize());
}
},
clickHandler: function(a, b) {
b.dispatchTarget.slidingHandler && this.toggleSelected(), this.doClick(b);
},
setShadowShowing: function(a) {
this.$.shadow.setShowing(a);
}
});

// palm/containers/SlidingPane.js

enyo.kind({
name: "enyo.SlidingPane",
kind: enyo.Pane,
published: {
multiView: !0,
multiViewMinWidth: 500,
canAnimate: !0
},
className: "enyo-sliding-pane",
events: {
onSlideComplete: ""
},
layoutKind: "",
defaultKind: "SlidingView",
chrome: [ {
kind: "Animator",
duration: 700,
onAnimate: "stepAnimation",
onEnd: "endAnimation"
}, {
name: "client",
flex: 1,
kind: enyo.Control,
className: "enyo-view enyo-sliding-pane-client",
layoutKind: "HFlexLayout"
} ],
constructor: function() {
this.inherited(arguments), this.slidingCache = [];
},
create: function() {
this.inherited(arguments), this.multiViewChanged(), this.selectViewImmediate(this.view);
},
rendered: function() {
this.inherited(arguments), this.resize();
},
flow: function() {
enyo.Control.prototype.flow.call(this);
},
controlIsView: function(a) {
return this.inherited(arguments) && a instanceof enyo.SlidingView;
},
addView: function(a) {
this.inherited(arguments), this.indexViews();
},
removeView: function(a) {
this.inherited(arguments), this.indexViews();
},
indexViews: function() {
for (var a = 0, b; b = this.views[a]; a++) b.index = a;
},
getAnimator: function() {
return this.$.animator;
},
selectViewImmediate: function(a) {
var b = this.canAnimate;
this.canAnimate = !1, this.selectView(a, !0), this.canAnimate = b;
},
_selectView: function(a) {
this.lastView = this.view, this.view = a, this.dragging || this.moveSelected();
},
reallySelectView: function(a) {
a == this.view ? this.dragging || this.moveSelected() : this.inherited(arguments);
},
moveSelected: function() {
var a = this.findAnimateable(this.view);
a ? this.canAnimate ? this.playAnimation(a) : a.validateAll() : this.slideComplete();
},
slideComplete: function() {
this.wideLayout || this.showHideShadows(!1), this.view.resizeLastSibling(), this.doSlideComplete(this.view);
},
findAnimateable: function(a) {
if (a.canAnimate()) return a;
var b = this.view.getLastSibling();
return b && b.canAnimate() ? b : null;
},
playAnimation: function(a) {
var b = a;
this.$.animator.sliding = b, this.wideLayout || this.showHideShadows(!0), this.$.animator.play(b.slidePosition, b.calcSlide());
},
stepAnimation: function(a, b) {
var c = Math.round(b);
a.sliding.moveAlone ? a.sliding.applySlideToNode(c) : a.sliding.animateMove(c);
},
endAnimation: function(a) {
a.sliding.moveAlone = !1, this.slideComplete();
},
isAnimating: function() {
return this.$.animator.isAnimating();
},
dragstartHandler: function(a, b) {
var c = this.dragStartSliding = b.sliding, d = c && c.isDraggableEvent(b) && this.findDraggable(b.dx);
if (d) {
this.wideLayout || this.showHideShadows(!0), this.$.animator.stop(), this.dragSliding(d, b, 0);
return !0;
}
},
findDraggable: function(a) {
var b = this.dragStartSliding.index;
for (var c = 0, d = this.views, e; c <= b && (e = d[c]); c++) if (e.canDrag(a)) return e;
},
dragSliding: function(a, b, c) {
this.dragging = a, this.dragging.beginDrag(b, c);
},
dragHandler: function(a, b) {
var c = this.dragging;
if (c) {
var d = c.drag(b);
if (d) {
this.selectView(d, !0);
var e = c.isAtDragMax() ? 1 : -1, f = this.findDraggable(e);
f && this.dragSliding(f, b, b.dx);
}
}
},
dragfinishHandler: function(a, b) {
if (this.dragging) {
var c = this.dragging.dragFinish(b);
b.preventClick(), this.dragging = null, this.selectView(c, !0);
}
},
resizeHandler: function() {
this.resize(), this.inherited(arguments);
},
resize: function() {
var a = this.multiViewMinWidth > 0 && window.innerWidth > this.multiViewMinWidth;
this.setMultiView(a), this.validate();
},
multiViewChanged: function(a) {
this.multiView != a && (this[this.multiView ? "applyMultiViewLayout" : "applySingleViewLayout"](), this.validate());
},
applyMultiViewLayout: function() {
for (var a = 0, b = this.views, c; c = b[a]; a++) this.uncacheSliding(c, a);
this.showHideShadows(!0), this.$.client.flow();
},
applySingleViewLayout: function() {
for (var a = 0, b = this.views, c; c = b[a]; a++) this.cacheSliding(c, a), c.setFixedWidth(!0), c.peekWidth = 0, c.flex = 0, c.applyStyle("width", "100.0%");
this.showHideShadows(!1);
},
showHideShadows: function(a) {},
cacheSliding: function(a, b) {
this.slidingCache[b] = {
flex: a.flex,
width: a.domStyles.width,
peekWidth: a.peekWidth,
fixedWidth: a.fixedWidth
};
},
uncacheSliding: function(a, b) {
var c = this.slidingCache[b];
c && (a.flex = c.flex, a.peekWidth = c.peekWidth, a.setFixedWidth(c.fixedWidth), a.applyStyle("width", c.width));
},
validate: function() {
this.view.validateAll();
}
});

// palm/services/PalmService.js

enyo.kind({
name: "enyo.PalmService",
kind: enyo.Service,
published: {
method: "",
subscribe: null,
resubscribe: !1,
params: null
},
resubscribeDelay: 1e4,
requestKind: "PalmService.Request",
create: function() {
this.params = {}, this.inherited(arguments);
},
destroy: function() {
this.inherited(arguments), enyo.job.stop(this.id + "-resubscribe");
},
importProps: function(a) {
this.inherited(arguments), this.method = this.method || this.name;
},
makeRequestProps: function(a) {
var b = this.inherited(arguments), c = {
service: this.service,
method: this.method
};
b = enyo.mixin(c, b), this.subscribe && (b.params.subscribe = !0, b.subscribe = !0);
return b;
},
responseFailure: function(a) {
this.inherited(arguments), this.resubscribe && this.subscribe && enyo.job(this.id + "-resubscribe", enyo.hitch(this, "reCall", a), this.resubscribeDelay);
},
reCall: function(a) {
if (!a.destroyed) {
a.call();
return a;
}
}
}), enyo.kind({
name: "enyo.PalmService.Request",
kind: enyo.Request,
create: function() {
this.inherited(arguments);
},
initComponents: function() {
this.createBridge(), this.inherited(arguments);
},
createBridge: function() {
this.bridge = new PalmServiceBridge, this.bridge.onservicecallback = this.clientCallback = enyo.bind(this, "receive");
},
call: function() {
var a = this.params || {};
this.json = enyo.isString(a) ? a : enyo.json.stringify(a), this.bridge.call(this.service + this.method, this.json);
},
destroy: function() {
this.bridge.cancel(), this.inherited(arguments);
},
setResponse: function(a) {
try {
this.response = enyo.isString(a) ? enyo.json.parse(a) : a;
} catch (b) {
this.warn("Failed to convert response from JSON:", b, " for response: [" + a + "]"), this.response = null;
}
},
isFailure: function(a) {
return !this.response || (this.response.errorCode || this.response.returnValue === !1);
},
finish: function() {
this.subscribe || this.destroy();
}
});

// palm/services/PalmServices.js

enyo.palmServices = {
system: "palm://com.palm.systemservice/",
telephony: "palm://com.palm.telephony/",
database: "luna://com.palm.db/",
application: "palm://com.palm.applicationManager/",
accounts: "palm://com.palm.service.accounts/"
};

// palm/services/SystemService.js

enyo.kind({
name: "enyo.SystemService",
kind: enyo.PalmService,
service: enyo.palmServices.system
});

// palm/services/DbService.js

enyo.kind({
name: "enyo.DbService",
kind: enyo.PalmService,
requestKind: "DbService.Request",
published: {
dbKind: "",
reCallWatches: !1,
resubscribe: !0
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
importProps: function(a) {
this.inherited(arguments), this.dbKind = this.dbKind || this.masterService.dbKind;
},
call: function(a, b) {
b = b || {}, b.dbKind = b.dbKind || this.dbKind || this.masterService.dbKind;
return this.inherited(arguments, [ a, b ]);
},
makeRequestProps: function(a) {
var b = this.inherited(arguments);
delete b.params.subscribe;
var c = {
onWatch: this.onWatch
};
return enyo.mixin(c, b);
},
putKind: function(a) {
var b = {
id: a.dbKind
};
a.params = enyo.mixin(b, a.params);
return this.request(a);
},
delKind: function(a) {
a.params = {
id: a.dbKind
};
return this.request(a);
},
findOrSearch: function(a) {
var b = {};
if (a.subscribe === !0 || a.subscribe === !1) b.watch = a.subscribe; else if (this.subscribe === !0 || this.subscribe === !1) b.watch = this.subscribe;
b = enyo.mixin(b, a.params);
var c = {
from: a.dbKind
};
b.query = enyo.mixin(c, b.query), a.params = b;
return this.request(a);
},
delByQuery: function(a) {
a.method = "del";
var b = a.params = a.params || {};
b.query = enyo.mixin({
from: a.dbKind
}, b.query || {});
return this.request(a);
},
responseWatch: function(a) {
this.reCallWatches && this.reCall(a), this.dispatch(this.owner, a.onWatch, [ a.response, a ]);
}
}), enyo.kind({
name: "enyo.DbService.Request",
kind: enyo.PalmService.Request,
events: {
onRequestWatch: "responseWatch"
},
isWatch: function(a) {
return a && a.fired;
},
processResponse: function() {
this.isWatch(this.response) ? this.doRequestWatch(this.response) : this.inherited(arguments);
}
});

// palm/services/TempDbService.js

enyo.kind({
name: "enyo.TempDbService",
kind: enyo.DbService,
service: "palm://com.palm.tempdb/"
});

// palm/services/MockPalmService.js

enyo.kind({
name: "enyo.PalmService.MockRequest",
kind: enyo.WebService.Request,
handleAs: "json",
call: function() {
"mockDataProvider" in this.owner ? this.url = this.owner.mockDataProvider(this) : this.url = "mock/" + this.owner.id + ".json", enyo.xhr.request({
url: this.url,
method: "GET",
callback: enyo.hitch(this, "receive")
});
},
isFailure: function() {
this.response || (this.response = {
returnValue: !1,
errorText: "Expected mock response at: " + this.url
}, this.log(this.response.errorText));
return !this.response.returnValue;
}
}), window.PalmSystem || (enyo.PalmService.prototype.requestKind = "PalmService.MockRequest", enyo.DbService.prototype.requestKind = "PalmService.MockRequest");

// palm/list/VirtualScroller.js

enyo.kind({
name: "enyo.VirtualScroller",
kind: enyo.DragScroller,
events: {
onScroll: ""
},
published: {
fpsShowing: !1,
accelerated: !1
},
className: "enyo-virtual-scroller",
tools: [ {
name: "scroll",
kind: "ScrollMath",
kFrictionDamping: .97,
topBoundary: 1e9,
bottomBoundary: -1e9
} ],
chrome: [ {
name: "content"
} ],
top: 0,
bottom: -1,
pageTop: 0,
pageOffset: 0,
contentHeight: 0,
constructor: function() {
this.heights = [], this.inherited(arguments);
},
create: function() {
this.inherited(arguments), this.fpsShowingChanged(), this.acceleratedChanged();
},
rendered: function() {
this.inherited(arguments), this.measure(), this.$.scroll.animate();
},
fpsShowingChanged: function() {
!this.$.fps && this.fpsShowing && (this.createChrome([ {
name: "fps",
content: "stopped",
className: "enyo-scroller-fps",
parent: this
} ]), this.generated && this.$.fps.render()), this.$.fps && this.$.fps.setShowing(this.fpsShowing);
},
acceleratedChanged: function() {
var a = this.pageTop;
this.pageTop = 0, this.effectScroll && this.effectScroll(), this.pageTop = a, this.effectScroll = this.accelerated ? this.effectScrollAccelerated : this.effectScrollNonAccelerated, this.$.content.applyStyle("margin", this.accelerated ? null : "900px 0"), this.effectScroll();
},
measure: function(a, b) {
this.unlockClipRegion(), this.viewNode = this.hasNode(), this.viewNode && (this.viewHeight = this.viewNode.clientHeight, this.$.content.hasNode() && (this.contentHeight = this.$.content.node.offsetHeight)), this.lockClipRegion();
},
lockClipRegion: function() {
this._unlockedDomStyles = enyo.clone(this.domStyles);
var a = this.getBounds();
this.addStyles("top: " + a.top + "px; left: " + a.left + "px; width: " + a.width + "px; height: " + a.height + "px; position: absolute; overflow: hidden; -webkit-box-flex: auto;");
},
unlockClipRegion: function() {
this._unlockedDomStyles && this.setDomStyles(this._unlockedDomStyles);
},
start: function() {
this.$.scroll.start();
},
adjustTop: function(a) {},
adjustBottom: function(a) {},
unshiftPage: function() {
var a = this.top - 1;
if (this.adjustTop(a) === !1) {
enyo.vizLog && enyo.vizLog.log("VirtualScroller: FAIL unshift page " + a);
return !1;
}
this.top = a, enyo.vizLog && enyo.vizLog.log("VirtualScroller: unshifted page " + a);
},
shiftPage: function() {
this.adjustTop(++this.top);
},
pushPage: function() {
var a = this.bottom + 1;
if (this.adjustBottom(a) === !1) {
enyo.vizLog && enyo.vizLog.log("VirtualScroller: FAIL push page " + a);
return !1;
}
this.bottom = a, enyo.vizLog && enyo.vizLog.log("VirtualScroller: pushed page " + a);
},
popPage: function() {
enyo.vizLog && enyo.vizLog.log("VirtualScroller: popped page " + this.bottom), this.adjustBottom(--this.bottom);
},
pushPages: function() {
while (this.contentHeight + this.pageTop < this.viewHeight) {
if (this.pushPage() === !1) {
this.$.scroll.bottomBoundary = Math.min(-this.contentHeight + this.pageOffset + this.viewHeight, -1);
break;
}
this.contentHeight += this.heights[this.bottom] || 0;
}
},
popPages: function() {
var a = this.heights[this.bottom];
while (a !== undefined && this.bottom && this.contentHeight + this.pageTop - a > this.viewHeight) this.popPage(), this.contentHeight -= a, a = this.heights[this.bottom];
},
shiftPages: function() {
var a = this.heights[this.top];
while (a !== undefined && a < -this.pageTop) enyo.vizLog && enyo.vizLog.log("VirtualScroller: shift page " + this.top + " (height: " + a + ")"), this.pageOffset -= a, this.pageTop += a, this.contentHeight -= a, this.shiftPage(), a = this.heights[this.top];
},
unshiftPages: function() {
while (this.pageTop > 0) {
if (this.unshiftPage() === !1) {
this.$.scroll.topBoundary = this.pageOffset, this.$.scroll.bottomBoundary = -9e9;
break;
}
var a = this.heights[this.top];
if (a === undefined) {
this.top++;
return;
}
this.contentHeight += a, this.pageOffset += a, this.pageTop -= a;
}
},
updatePages: function() {
enyo.vizLog && (enyo.vizLog.log("VirtualScroller: updatePages start"), enyo.vizLog.log("- top/bottom: " + this.top + "/" + this.bottom), enyo.vizLog.log("- content/pageTop: " + this.contentHeight + "/" + this.pageTop));
this.viewNode && (this.viewHeight = this.viewNode.clientHeight, this.$.scroll.topBoundary = 9e9, this.$.scroll.bottomBoundary = -9e9, this.pushPages(), this.popPages(), this.unshiftPages(), this.shiftPages(), enyo.vizLog && (enyo.vizLog.log("VirtualScroller: updatePages finish"), enyo.vizLog.log("- top/bottom: " + this.top + "/" + this.bottom), enyo.vizLog.log("- content/pageTop: " + this.contentHeight + "/" + this.pageTop), enyo.vizLog.log("- boundaries: " + this.$.scroll.topBoundary + "/" + this.$.scroll.bottomBoundary)), this.effectScroll());
},
scroll: function() {
enyo.vizLog && enyo.vizLog.startFrame("VirtualScroller: scroll");
var a = Math.round(this.$.scroll.y) - this.pageOffset;
a != this.pageTop && (this.pageTop = a, this.updatePages(), this.doScroll());
},
scrollStop: function(a) {
this.fpsShowing && this.$.fps.setContent(a.fps);
},
effectScrollNonAccelerated: function() {
this.hasNode() && (this.node.scrollTop = 900 - this.pageTop);
},
effectScrollAccelerated: function() {
var a = this.$.content.hasNode();
if (a) for (var b = 0, c = a.childNodes, d; d = c[b]; b++) d.style.webkitTransform = "translate3d(0," + this.pageTop + "px,0)";
}
});

// palm/list/Buffer.js

enyo.kind({
name: "enyo.Buffer",
kind: enyo.Component,
events: {
onAcquirePage: "",
onDiscardPage: ""
},
top: 0,
bottom: -1,
margin: 0,
overbuffer: 0,
firstPage: null,
lastPage: null,
acquirePage: function(a) {
return this.doAcquirePage(a);
},
discardPage: function(a) {
return this.doDiscardPage(a);
},
flush: function() {
while (this.bottom >= this.top) this.pop();
},
adjustTop: function(a) {
this.specTop = a;
var b = a - this.overbuffer;
if (b < this.top || b > this.top + this.margin || b > this.bottom) {
var c = b - this.margin;
while (this.top < c) this.shift();
while (this.top > b) if (this.unshift() === !1) {
this.firstPage = this.top;
return this.top <= a && this.bottom >= a;
}
}
},
adjustBottom: function(a) {
this.specBottom = a;
var b = a + this.overbuffer;
if (b < this.bottom - this.margin || b > this.bottom) {
var c = b + this.margin;
while (this.bottom > c) this.pop();
while (this.bottom < b) if (this.push() === !1) {
this.lastPage = this.bottom;
return this.bottom >= a;
}
}
},
shift: function() {
this.discardPage(this.top++);
},
unshift: function() {
if (this.acquirePage(this.top - 1) === !1) return !1;
this.top--;
},
push: function() {
if (this.acquirePage(this.bottom + 1) === !1) return !1;
this.bottom++;
},
pop: function() {
this.discardPage(this.bottom--);
},
refresh: function() {
for (var a = this.top; a <= this.bottom; a++) this.acquirePage(a);
}
}), enyo.kind({
name: "enyo.BufferView",
kind: enyo.Control,
style: "font-size: 0.7em; border: 1px solid black;",
chrome: [ {
name: "bufferName",
content: "Buffer",
style: "border-bottom: 1px dotted black; padding: 2px;"
}, {
name: "first",
content: "0",
style: "color: green; padding: 2px;"
} ],
update: function(a) {
this.$.bufferName.setContent(a.name), this.$.first.setContent(a.top + " (" + (a.specTop || "n/a") + ") - " + a.bottom + " (" + (a.specBottom || "n/a") + ")");
}
});

// palm/list/DisplayBuffer.js

enyo.kind({
name: "enyo.DisplayBuffer",
kind: enyo.Buffer,
height: 0,
acquirePage: function(a) {
var b = this.pages[a];
b && (b.style.display = "", this.heights[a] || (this.height += this.heights[a] = b.offsetHeight));
},
discardPage: function(a) {
var b = this.pages[a];
b && (b.style.display = "none"), this.height -= this.heights[a] || 0;
}
});

// palm/list/DomBuffer.js

enyo.kind({
name: "enyo.DomBuffer",
kind: enyo.Buffer,
rowsPerPage: 3,
lastPage: 0,
constructor: function() {
this.inherited(arguments), this.pool = [];
},
generateRows: function(a) {
var b = [];
for (var c = 0, d = this.rowsPerPage * a, e; c < this.rowsPerPage; c++, d++) e = this.generateRow(d), e && b.push(e);
if (!b.length) return !1;
return b.join("");
},
preparePage: function(a) {
var b = this.pages[a] = this.pages[a] || (this.pool.length ? this.pool.pop() : document.createElement("div"));
b.style.display = "none", b.className = "page", b.id = "page-" + a;
return b;
},
installPage: function(a, b) {
if (!a.parentNode) {
var c = this.pagesNode;
b < this.bottom ? c.insertBefore(a, c.firstChild) : c.appendChild(a);
}
},
acquirePage: function(a) {
var b = this.generateRows(a);
if (b === !1) return !1;
var c = this.preparePage(a);
c.innerHTML = b, this.installPage(c, a);
},
discardPage: function(a) {
var b = this.pages[a];
b ? (b.parentNode.removeChild(b), this.pool.push(b), this.pages[a] = null) : (enyo.vizLog && enyo.vizLog.log("DomBuffer.discardPage: bad page: " + a + " " + this.top + "/" + this.bottom, "background-color: orange;"), this.warn("bad page:", a));
}
});

// palm/list/BufferedScroller.js

enyo.kind({
name: "enyo.BufferedScroller",
kind: enyo.VirtualScroller,
rowsPerPage: 3,
events: {
onGenerateRow: "generateRow",
onAdjustTop: "",
onAdjustBottom: ""
},
constructor: function() {
this.pages = [], this.inherited(arguments);
},
create: function() {
this.inherited(arguments), this.createDomBuffer(), this.createDisplayBuffer();
},
createDomBuffer: function() {
this.domBuffer = this.createComponent({
kind: enyo.DomBuffer,
rowsPerPage: this.rowsPerPage,
pages: this.pages,
margin: 20,
generateRow: enyo.hitch(this, "doGenerateRow")
});
},
createDisplayBuffer: function() {
this.displayBuffer = new enyo.DisplayBuffer({
heights: this.heights,
pages: this.pages
});
},
rendered: function() {
this.domBuffer.pagesNode = this.$.content.hasNode(), this.inherited(arguments);
},
pageToTopRow: function(a) {
return a * this.rowsPerPage;
},
pageToBottomRow: function(a) {
return a * this.rowsPerPage + (this.rowsPerPage - 1);
},
adjustTop: function(a) {
this.doAdjustTop(this.pageToTopRow(a));
if (this.domBuffer.adjustTop(a) === !1) return !1;
this.displayBuffer.adjustTop(a), enyo.viz && enyo.viz.scrollerUpdate(this);
},
adjustBottom: function(a) {
this.doAdjustBottom(this.pageToBottomRow(a));
if (this.domBuffer.adjustBottom(a) === !1) return !1;
this.displayBuffer.adjustBottom(a), enyo.viz && enyo.viz.scrollerUpdate(this);
},
findBottom: function() {
while (this.pushPage() !== !1) ;
this.contentHeight = this.displayBuffer.height, this.bottomBoundary = Math.min(-this.contentHeight + this.pageOffset + this.viewHeight, -1), this.py = this.uy = this.y = this.y0 = this.bottomBoundary;
},
refreshPages: function() {
this.domBuffer.flush(), this.bottom = this.top - 1, this.displayBuffer.bottom = this.domBuffer.bottom = this.bottom, this.displayBuffer.top = this.domBuffer.top = this.top, this.contentHeight = 0, this.displayBuffer.height = 0, this.heights = this.displayBuffer.heights = [], this.updatePages();
},
punt: function() {
this.$.scroll.stop(), this.bottom = -1, this.top = 0, this.domBuffer.flush(), this.displayBuffer.bottom = this.domBuffer.bottom = this.bottom, this.displayBuffer.top = this.domBuffer.top = this.top, this.contentHeight = 0, this.displayBuffer.height = 0, this.heights = this.displayBuffer.heights = [], this.pageOffset = 0, this.pageTop = 0, this.$.scroll.y = this.$.scroll.y0 = 0, this.updatePages();
}
});

// palm/list/ScrollingList.js

enyo.kind({
name: "enyo.ScrollingList",
kind: enyo.VFlexBox,
events: {
onSetupRow: ""
},
components: [ {
name: "scroller",
kind: enyo.BufferedScroller,
flex: 1,
onGenerateRow: "generateRow",
onAdjustTop: "adjustTop",
onAdjustBottom: "adjustBottom",
components: [ {
name: "list",
kind: enyo.RowServer,
onSetupRow: "doSetupRow"
} ]
} ],
controlParentName: "list",
generateRow: function(a, b) {
return this.$.list.generateRow(b);
},
prepareRow: function(a) {
return this.$.list.prepareRow(a);
},
updateRow: function(a) {
this.prepareRow(a), this.doSetupRow(a);
},
fetchRowIndex: function() {
return this.$.list.fetchRowIndex();
},
refresh: function() {
this.$.list.saveCurrentState(), this.$.scroller.refreshPages();
},
reset: function() {
this.$.list.clearState(), this.$.scroller.$.scroll.stop(), this.refresh();
},
punt: function() {
this.$.list.clearState(), this.$.scroller.punt();
}
});

// palm/list/Selection.js

enyo.kind({
name: "enyo.Selection",
kind: enyo.Component,
published: {
multi: !1
},
events: {
onChange: ""
},
create: function() {
this.clear(), this.inherited(arguments);
},
clear: function(a) {
this.selected = [];
},
multiChanged: function() {
this.multi || this.clear(), this.doChange();
},
isSelected: function(a) {
return this.selected[a];
},
setByIndex: function(a, b) {
this.selected[a] = b;
},
deselect: function(a) {
this.setByIndex(a, !1);
},
select: function(a) {
var b = this.isSelected(a);
this.multi || this.clear(), this.setByIndex(a, !b), this.doChange();
}
});

// palm/list/VirtualList.js

enyo.kind({
name: "enyo.VirtualList",
kind: enyo.ScrollingList,
published: {
lookAhead: 2,
pageSize: 10
},
events: {
onAcquirePage: "",
onDiscardPage: ""
},
create: function() {
this.inherited(arguments), this.createComponents([ {
kind: "Selection",
onChange: "selectionChanged"
}, {
kind: "Buffer",
overbuffer: this.lookAhead,
margin: 3,
onAcquirePage: "doAcquirePage",
onDiscardPage: "doDiscardPage"
} ]);
},
select: function(a) {
return this.$.selection.select(a);
},
isSelected: function(a) {
return this.$.selection.isSelected(a);
},
setMultiSelect: function(a) {
this.$.selection.setMulti(a);
},
getSelection: function() {
return this.$.selection;
},
selectionChanged: function() {
this.refresh();
},
resizeHandler: function() {
this.hasNode() && (this.$.scroller.measure(), this.refresh(), this.$.scroller.start());
},
rowToPage: function(a) {
return Math.floor(a / this.pageSize);
},
adjustTop: function(a, b) {
var c = this.rowToPage(b);
enyo.vizLog && enyo.vizLog.log("VirtualList.adjustTop: row: " + b + " converted to page " + c), this.$.buffer.adjustTop(c), enyo.viz && enyo.viz.listUpdate(this);
},
adjustBottom: function(a, b) {
var c = this.rowToPage(b);
enyo.vizLog && enyo.vizLog.log("VirtualList.adjustBottom: row: " + b + " converted to page " + c), this.$.buffer.adjustBottom(c), enyo.viz && enyo.viz.listUpdate(this);
},
reset: function() {
this.$.buffer.bottom = this.$.buffer.top - 1, this.inherited(arguments);
}
});

// palm/list/dbUtil.js

parseQuery = function(a) {
var b = {}, c = /(where .*)?(orderBy .*)?/i, d = a.match(c);
if (d && d[1]) {
var e = d[1].slice(6).split(" and "), f = /(.*)([=<>%])(.*)/;
b.where = [];
for (var g = 0, h; h = e[g]; g++) {
var i = h.match(f);
i && b.where.push({
prop: i[1],
op: i[2],
val: enyo.json.parse(enyo.string.trim(i[3]))
});
}
}
d && d[2] && (b.orderBy = d[2].slice(8));
return b;
};

// palm/list/DbPages.js

enyo.kind({
name: "enyo.DbPages",
kind: "Component",
events: {
onQuery: "",
onReceive: ""
},
statics: {
isEOF: function(a) {
return !a.handle && !a.next;
}
},
size: 36,
desc: !1,
min: 9999,
max: 0,
create: function() {
this.pages = [], this.handles = [], this.inherited(arguments);
},
reset: function(a) {
var b = a;
while (b <= this.max && this.handles[b] === undefined && b) b++;
var c = this.handles[b];
this.handles = [], b > this.max ? (enyo.vizLog && enyo.vizLog.log("DbPages: reset: saving no handles, returning to 'special 0' page"), b = 0) : (enyo.vizLog && enyo.vizLog.log("DbPages: reset: retaining handle for page " + b), this.handles[b] = c);
},
query: function(a) {
var b = {
limit: this.size,
desc: this.desc
};
a !== undefined && a !== null && (b.page = a);
return this.doQuery(b);
},
queryBack: function(a) {
var b = {
page: a,
limit: this.size,
desc: !this.desc
};
return this.doQuery(b);
},
queryResponse: function(a, b) {
var c = b.params.query || {}, d = c.desc != this.desc;
a.results && d && (a.results.reverse(), a.handle = a.next, delete a.next), this.receivePage(a, b);
},
receivePage: function(a, b) {
var c = b.index;
a.results.length ? (this.pages[c] = {
data: a.results,
request: b
}, this.min = Math.min(this.min, c), this.max = Math.max(this.max, c), this.setHandle(c, a.handle), this.setHandle(c + 1, a.next), this.doReceive(c)) : this.pages[c] = {};
},
setHandle: function(a, b) {
if (b !== undefined) {
this.handles[a] = b;
var c = this.pages[a];
c && c.pending && (c.inflight = !0, this.acquireNext(a, b)), c = this.pages[a - 1], c && c.pending && (c.inflight = !0, this.acquirePrevious(a - 1, b));
}
},
acquireNext: function(a, b) {
var c = this.query(b);
this._acquire(c, a);
},
acquirePrevious: function(a, b) {
var c = this.queryBack(b);
this._acquire(c, a);
},
_acquire: function(a, b) {
a && (a.index = b), this.pages[b].request = a;
},
require: function(a) {
enyo.vizLog && enyo.vizLog.log("DbPages: require: " + a);
var b = this.pages[a];
if (b) return b.pending ? null : b;
b = this.pages[a] = {
pending: !0
};
if (this.handles[a] !== undefined) this.acquireNext(a, this.handles[a]); else if (this.handles[a + 1] !== undefined) this.acquirePrevious(a, this.handles[a + 1]); else if (a === 0) {
for (var c = -1; c >= this.min; c--) if (this.pages[c] && this.pages[c].inflight) return;
this.acquireNext(0, null);
}
},
dispose: function(a) {
var b = this.pages[a];
b && (enyo.vizLog && enyo.vizLog.log("DbPages: dispose: page " + a), b.request && b.request.destroy(), this.min == a && this.min++, this.max == a && this.max--, delete this.pages[a]);
},
fetch: function(a) {
var b = Math.floor(a / this.size), c = this.pages[b];
if (!c) return undefined;
if (!c.data) return undefined;
var d = a - b * this.size;
a < 0 && (d -= this.size - c.data.length);
return c.data[d] || null;
}
});

// palm/list/DbList.js

enyo.kind({
name: "enyo.DbList",
kind: enyo.VFlexBox,
published: {
pageSize: 20,
desc: !1
},
events: {
onQuery: "",
onSetupRow: ""
},
components: [ {
kind: "DbPages",
onQuery: "doQuery",
onReceive: "receiveDbPage"
}, {
flex: 1,
name: "list",
kind: "VirtualList",
onSetupRow: "setupRow",
onAcquirePage: "acquirePage",
onDiscardPage: "discardPage"
} ],
controlParentName: "list",
create: function() {
this.inherited(arguments), this.pageSizeChanged(), this.descChanged();
},
descChanged: function() {
this.$.dbPages.desc = this.desc;
},
pageSizeChanged: function() {
this.$.list.pageSize = this.pageSize, this.$.dbPages.size = this.pageSize;
},
acquirePage: function(a, b) {
this.$.dbPages.require(b);
},
discardPage: function(a, b) {
this.$.dbPages.dispose(b), enyo.viz && enyo.viz.dbListUpdate(this);
},
needs: null,
queryResponse: function(a, b) {
this.$.dbPages.queryResponse(a, b), enyo.viz && enyo.viz.dbListUpdate(this);
var c = b.index, d = this.$.list.$.buffer;
if ((c < d.specTop || c > d.specBottom) && this.needs === null) enyo.vizLog && enyo.vizLog.log("DbList: no-render queryResponse (page: " + c + ")"); else {
enyo.vizLog && enyo.vizLog.startFrame("DbList: queryResponse (page: " + c + ")");
if (this.needs === null || c >= this.needs || enyo.DbPages.isEOF(a)) this.needs !== null && this.$.list.$.list.clearState(), this.refresh(), this.needs !== null && (this.$.list.$.scroller.$.scroll.start(), this.needs = null);
}
},
fetch: function(a) {
return this.$.dbPages.fetch(a);
},
setupRow: function(a, b) {
var c = this.fetch(b);
if (c) {
this.doSetupRow(c, b);
return !0;
}
return c;
},
updateRow: function(a) {
this.$.list.updateRow(a);
},
update: function() {
this.$.list.$.scroller.updatePages(), enyo.viz && enyo.viz.dbListUpdate(this);
},
refresh: function() {
this.$.list.refresh();
},
reset: function() {
var a = this.$.list.$.buffer, b = a.specTop === undefined ? a.top : a.specTop;
this.$.dbPages.reset(b), a.flush(), a.top = b, a.bottom = b - 1, a.adjustBottom(b + 1), this.needs = b + 1;
},
punt: function() {
this.$.list.$.buffer.flush(), this.$.list.$.buffer.top = this.$.list.$.buffer.specTop = 0, this.$.list.$.buffer.bottom = this.$.list.$.buffer.specBottom = -1, this.$.dbPages.reset(0), this.$.dbPages.handles = [], this.$.list.punt(), enyo.viz && enyo.viz.dbListUpdate(this);
}
});

// palm/list/DbRepeaterList.js

enyo.kind({
name: "enyo.DbRepeaterList",
kind: enyo.VFlexBox,
published: {
pageSize: 50,
stripSize: 20
},
events: {
onQuery: "",
onSetupRow: ""
},
chrome: [ {
kind: "Scroller",
flex: 1,
accelerated: !1,
components: [ {
name: "client",
kind: enyo.VirtualRepeater,
accelerated: !0,
onGetItem: "getItem"
} ]
} ],
create: function() {
this.data = [], this.inherited(arguments), this.stripSizeChanged(), this.reset();
},
stripSizeChanged: function(a) {
this.$.client.setStripSize(this.stripSize);
},
fetch: function(a) {
return this.data[a];
},
getItem: function(a, b) {
var c = this.fetch(b);
if (c) {
this.doSetupRow(c, b);
return !0;
}
return c;
},
rendered: function() {
this.inherited(arguments), this.bottomUp && this.scrollToBottom();
},
scrollToBottom: function() {
this.$.scroller.scrollToBottom();
},
build: function() {
this.request && (this.request.destroy(), this.request = null);
var a = {
limit: this.pageSize,
desc: this.desc
};
return this.doQuery(a);
},
queryResponse: function(a, b) {
this.request = b, this.data = a.results, this.bottomUp && this.data.reverse(), this.render();
},
updateRow: function(a) {
this.$.client.renderRow(a);
},
refresh: function() {
this.render();
},
reset: function() {
this.build();
},
punt: function() {
this.$.scroller.setScrollTop(0), this.build();
}
});

// palm/list/MockDb.js

enyo.kind({
name: "enyo.MockDb",
kind: enyo.Service,
components: [ {
kind: "WebService",
sync: !0,
onSuccess: "gotData",
onFailure: "failData"
} ],
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
this.data = [], this.cursors = {}, this.inherited(arguments), window.PalmSystem || this.getData();
},
generateId: function(a) {
return ("00000" + enyo.irand(1e5)).slice(-5);
},
getData: function() {
this.file = (this.dbKind || this.id).replace(":", "-"), this.data = enyo.MockDb.dataSets[this.file], this.data || this.$.webService.call(null, {
url: "mock/" + this.file + ".json"
});
},
failData: function(a, b, c) {
this.log("expected mock data at:", c.url);
},
gotData: function(a, b, c) {
this.log("got mock data from:", c.url), this.data = enyo.MockDb.dataSets[this.file] = b.results;
for (var d = 0, e; e = this.data[d]; d++) e._id = this.generateId();
},
sort: function() {
var a = this.data[0];
if (a) {
for (var b in a) if (b) break;
this.data.sort(function(a, c) {
var d = a[b], e = c[b];
return d < e ? -1 : d > e ? 1 : 0;
});
}
},
latency: function() {
return enyo.irand(this.maxLatency - this.minLatency) + this.minLatency;
},
latent: function(a) {
setTimeout(enyo.bind(this, a), this.latency());
},
query: function(a) {
var b = a.params.query || {};
b.page === undefined && (this.cursors = {});
var c = this.cursors[b.page] || (b.desc ? this.data.length - 1 : 0), d = b.limit ? c + b.limit : -1, e = d;
b.desc && (d = c, c = Math.max(0, c - b.limit), e = c);
var f = b.limit ? this.data.slice(c, d) : this.data.slice(c);
b.desc && f.reverse();
var g = {
results: f
};
if (f.length == b.limit) {
var h;
do h = enyo.irand(1e4) + 1e4; while (this.cursors[h] !== undefined);
this.cursors[h] = e, g.next = h;
}
enyo.vizLog && enyo.vizLog.log("MockDb.query: " + b.page + ": " + c + "/" + d + (b.desc ? " (desc) " : " next: ") + e + " (" + h + ")");
var i = !1, j = {
params: {
query: b
},
destroy: function() {
i = !0;
},
isWatch: enyo.nop
};
setTimeout(enyo.bind(this, function() {
i || this.doSuccess(g, j);
}), this.latency());
return j;
},
watch: function(a) {
this.doWatch();
},
findById: function(a) {
for (var b = 0, c; c = this.data[b]; b++) if (c._id == a) return b;
return -1;
},
put: function(a) {
this.latent(function() {
for (var b = 0, c = a.params.objects, d; d = c[b]; b++) this.data.push(d);
this.sort(), this.watch();
});
},
_merge: function(a) {
var b = this.findById(a._id);
b >= 0 && enyo.mixin(this.data[b], a);
},
merge: function(a) {
this.latent(function() {
for (var b = 0, c = a.params.objects, d; d = c[b]; b++) this._merge(d);
this.sort(), this.watch();
});
},
_remove: function(a) {
var b = this.findById(a);
b >= 0 && (this.log(a), this.data.splice(b, 1));
},
remove: function(a) {
this._remove(a._id);
},
del: function(a) {
this.latent(function() {
for (var b = 0, c = a.params.ids, d; d = c[b]; b++) this._remove(d);
this.watch();
});
}
}), enyo.kind({
name: "enyo.DbInstaller",
kind: enyo.Component,
events: {
onFailure: "",
onSuccess: ""
},
components: [ {
kind: "WebService",
sync: !0,
onSuccess: "gotData",
onFailure: "failure"
}, {
kind: "DbService",
onFailure: "failure",
components: [ {
name: "delKind",
onResponse: "putKind",
failure: ""
}, {
name: "putKind",
onSuccess: "putRecords"
}, {
name: "put",
onSuccess: "putSuccess"
} ]
} ],
install: function(a, b, c) {
this.dbKind = a, this.dbOwner = b, this.$.dbService.setDbKind(a), this.getData();
},
getData: function() {
var a = (this.dbKind || this.id).replace(":", "-");
this.$.webService.call(null, {
url: "mock/" + a + ".json"
});
},
gotData: function(a, b) {
this.prepareRecords(b.results), this.delKind();
},
prepareRecords: function(a) {
this.records = [];
for (var b = 0, c, d; c = a[b]; b++) d = enyo.clone(c), d._kind = this.dbKind, delete d._id, this.records.push(d);
},
delKind: function() {
this.$.delKind.call();
},
putKind: function() {
var a = this.records[0];
for (var b in a) if (b) break;
var c = {
name: b + "Idx",
props: [ {
name: b
} ]
}, d = this.$.putKind.call({
owner: this.dbOwner,
indexes: [ c ]
});
},
putRecords: function() {
var a = this.records.length;
for (var b = 0; b < a; ) {
var c = [];
for (var d = 0; d < 10 && b < a; d++, b++) c.push(this.records[b]);
this.$.put.call({
objects: c
});
}
},
putSuccess: function(a, b) {
this.doSuccess();
},
failure: function(a, b) {
this.doFailure(enyo.json.stringify(b));
}
}), enyo.MockDb.dataSets = [];

// palm/tellurium/loader.js

var Tellurium = {};

Tellurium.identifier = "palm://com.palm.telluriumservice/", Tellurium.nubVersion = "2.1.8", Tellurium.config = {
enableUserEvents: !1
}, Tellurium.nubPath = "/usr/palm/frameworks/tellurium/", Tellurium.setup = function(a) {
window.Tellurium = Tellurium, Tellurium.enyo = a, Tellurium.extend = Tellurium.enyo.mixin, Tellurium.isActive = !0, Tellurium.topSceneName = "", Tellurium.metaDown = !1, Tellurium.inVerifyDialog = !1, Tellurium.delayedEvents = [], Tellurium.serviceAvailable = !0;
var b = Tellurium.enyo.xhr.request({
url: Tellurium.enyo.path.rewrite("$palm-tellurium/tellurium_config.json"),
sync: !0
}).responseText || "{}";
Tellurium.config = Tellurium.extend(Tellurium.config, enyo.json.parse(b)), Tellurium.stageType = "card", Tellurium.subscribeToCommands(), window.addEventListener("unload", Tellurium.cleanup, !1), window.addEventListener("resize", Tellurium.handleResize, !1), Tellurium.config.enableUserEvents && Tellurium.events.setup();
}, Tellurium.cleanup = function() {
console.log("enyo_tellurium [cleanup]"), window.removeEventListener("unload", Tellurium.cleanup, !1), window.removeEventListener("resize", Tellurium.handleResize, !1), Tellurium.subscribeRequest && Tellurium.subscribeRequest.destroy(), Tellurium.notifyRequest && Tellurium.notifyRequest.destroy(), Tellurium.replyReq && Tellurium.replyReq.destroy();
};

// palm/tellurium/service.js

Tellurium.subscribeToCommands = function() {
Tellurium.stageType = "card", console.log("Tellurium : Subscribe Service...");
var a = {
subscribe: !0,
appInfo: Tellurium.fetchAppInfo(),
baseURI: window.document.baseURI,
width: window.innerWidth,
height: window.innerHeight,
name: window.name || "",
type: Tellurium.stageType,
scene: "phone",
version: Tellurium.nubVersion
};
Tellurium.subscribeRequest = new Tellurium.enyo.PalmService({
service: Tellurium.identifier,
method: "subscribeToCommands",
subscribe: !0,
responseSuccess: Tellurium.handleCommands,
responseFailure: Tellurium.reqFailed
}), Tellurium.subscribeRequest.call(a);
}, Tellurium.fetchAppInfo = function() {
return Tellurium.enyo.fetchAppInfo();
}, Tellurium.notifyEvent = function(a) {
Tellurium.serviceAvailable && (!Tellurium.stageId || Tellurium.inVerifyDialog && a.event !== "verify" ? Tellurium.delayedEvents.push(a) : (a.stageId = Tellurium.stageId, a.appId = Tellurium.appId, Tellurium.notifyRequest = Tellurium.notifyRequest || new Tellurium.enyo.PalmService({
service: Tellurium.identifier,
method: "notifyEvent"
}), Tellurium.notifyRequest.call(a)));
}, Tellurium.reqFailed = function() {
console.log("Tellurium service not available."), Tellurium.serviceAvailable = !1;
}, Tellurium.cloneArray = function(a) {
if (!a) return [];
if (a.toArray) return a.toArray();
var b = a.length || 0, c = Array(b);
while (b--) c[b] = a[b];
return c;
}, Tellurium.handleCommands = function(a) {
var b = a.response, c = b;
if (b.command) {
try {
c.result = Tellurium[b.command].apply(this, b.args), c.returnValue = !0;
} catch (d) {
c.returnValue = !1, c.error = d.message || "Unkown error", c.errorStack = d.stack;
}
Tellurium.replyToCommand(c);
} else if (b.stageId) {
Tellurium.stageId = b.stageId, Tellurium.appId = Tellurium.enyo.fetchAppId();
if (Tellurium.delayedEvents.length > 0) {
for (var e = 0; e < Tellurium.delayedEvents.length; e++) Tellurium.notifyEvent(Tellurium.delayedEvents[e]);
Tellurium.delayedEvents = [];
}
} else c.returnValue = !1, c.error = "Invalid command payload", Tellurium.replyToCommand(c);
}, Tellurium.replyToCommand = function(a) {
Tellurium.replyReq && Tellurium.replyReq.destroy(), Tellurium.replyReq = new Tellurium.enyo.PalmService({
service: Tellurium.identifier,
method: "replyToCommand",
responseFailure: function() {
console.error("[Tellurium] replyToCommand Failure");
}
}), Tellurium.replyReq.call(a);
}, Tellurium.dumpProperties = function(a, b) {
b = b || "";
for (var c in a) typeof a[c] !== "function" && console.error(b + "[" + c + "] = " + a[c]);
};

// palm/tellurium/events.js

Tellurium.mouseTap = function(a) {
var b = {
detail: 1,
ctrlKey: !1,
altKey: !1,
shiftKey: !1,
metaKey: !1,
button: 0
};
Tellurium.mouseEvent(a, "mousedown", b), Tellurium.mouseEvent(a, "mouseup", b), Tellurium.mouseEvent(a, "click", b);
}, Tellurium.mouseEvent = function(a, b, c) {
var d = Tellurium.getMetrics(a), e = Tellurium.getElement(a), f = document.createEvent("MouseEvents");
f.initMouseEvent(b, !0, !0, window, c.detail, d.left, d.top, d.left, d.top, c.ctrlKey, c.altKey, c.shiftKey, c.metaKey, c.button, null), e.dispatchEvent(f);
}, Tellurium.fireEvent = function(a, b, c) {
var d = Tellurium.getElement(a), e = document.createEvent("HTMLEvents");
e.initEvent(b, !0, !0), d.dispatchEvent(e);
}, Tellurium.keyEvent = function(a, b, c, d, e, f, g, h) {
var i = Tellurium.getElement(a), j = document.createEvent("HTMLEvents");
j.initEvent(b, !0, !0, window), j.keyCode = c, j.charCode = j.keyCode, j.which = j.keyCode, j.shiftKey = e || !1, j.metaKey = f || !1, j.altKey = g || !1, j.ctrlKey = h || !1, j.altGraphKey = !1, j.keyIdentifier = d, j.keyLocation = 0, j.detail = 0, j.view = window, i.dispatchEvent(j);
}, Tellurium.textEvent = function(a, b) {
var c = Tellurium.getElement(a), d = document.createEvent("TextEvent");
d.initTextEvent("textInput", !0, !0, null, b), c.dispatchEvent(d);
}, Tellurium.simulatedTap = function(a) {
var b, c;
if (a === "window") b = window.innerWidth / 2, c = window.innerHeight / 2; else {
var d = Tellurium.getMetrics(a);
b = Math.round(d.left + d.width / 2), c = Math.round(d.top + d.height / 2);
}
return Tellurium.simulatedTapXY(b, c);
}, Tellurium.simulatedTapXY = function(a, b) {
window.PalmSystem.simulateMouseClick(a, b, !0), window.PalmSystem.simulateMouseClick(a, b, !1);
return !0;
}, Tellurium.mojoTap = function(a) {};

// palm/tellurium/enyo-events.js

Tellurium.events = {
setup: function() {
this.dom.setup(), this.enyo.setup();
}
}, Tellurium.events.dom = {
types: {
keyup: "key",
keydown: "key",
keypress: "key",
mouseup: "mouse",
mousedown: "mouse",
mousehold: "mouse",
mouserelease: "mouse",
click: "mouse",
flick: "flick",
dragStart: "drag"
},
setup: function() {
enyo.dispatcher.features.push(function(a) {
var b = Tellurium.events.dom.types[a.type];
b && Tellurium.events.dom.handle(b, a);
});
},
handle: function(a, b) {
var c = "make" + enyo.cap(a) + "Payload", d = this[c];
if (d) {
var e = d.call(this, b);
e.id = b.dispatchTarget && b.dispatchTarget.id, Tellurium.notifyEvent(e);
}
},
mixinPayloadDetails: function(a, b, c) {
for (var d in c) a[d] = b[d];
return a;
},
keyDetails: {
type: !0,
keyCode: !0,
keyIdentifier: !0,
ctrlKey: !0,
altKey: !0,
shiftKey: !0,
metaKey: !0
},
makeKeyPayload: function(a) {
var b = {};
a.target & a.target.getStyle && (b.lineFeed = a.target.getStyle("-webkit-user-modify") == "read-write");
return this.mixinPayloadDetails(b, a, this.keyDetails);
},
mouseDetails: {
type: !0,
detail: !0,
screenX: !0,
screenY: !0,
pageX: !0,
pageY: !0,
clientX: !0,
clientY: !0,
ctrlKey: !0,
altKey: !0,
shiftKey: !0,
metaKey: !0,
button: !0
},
makeMousePayload: function(a) {
return this.mixinPayloadDetails({}, a, this.mouseDetails);
},
makeFlickPayload: function(a) {
payload = {
velocity: a.velocity
};
return this.mixinPayloadDetails(payload, a, this.mouseDetails);
},
makeDragPayload: function(a) {
var b = enyo.clone(a);
delete b.target;
return b;
}
}, Tellurium.events.enyo = {
types: {
onSelectView: enyo.Pane
},
setup: function() {
for (var a in this.types) this.setupHandler(this.types[a].prototype, a);
},
setupHandler: function(a, b) {
var c = b.slice(2), d = "make" + c + "Payload";
fn = this[d];
var e = "do" + enyo.cap(c), f = a[e];
fn && this.wrapEvent(a, e, f, b, fn);
},
wrapEvent: function(a, b, c, d, e) {
a[b] = function() {
var a = e.apply(this, arguments);
a.type = d, Tellurium.notifyEvent(a);
return c.apply(this, arguments);
};
},
makeSelectViewPayload: function(a, b) {
return {
pane: this.id,
view: a.id,
lastView: b && b.id
};
}
};

// palm/tellurium/locator.js

Tellurium.getTopElement = function() {
return document;
}, Tellurium.getElement = function(a) {
var b = "css", c = a, d = Tellurium.getTopElement();
if (a === "document") return document;
if (a === "window") return window;
if (typeof a !== "string") return a;
var e = a.match(/^([A-Za-z]+)=(.+)/);
e && (b = e[1].toLowerCase(), c = e[2]), b = b.substr(0, 1).toUpperCase() + b.substr(1);
return Tellurium["getElementBy" + b].call(this, c, d);
}, Tellurium.getElementById = function(a, b) {
var c = b.querySelector("#" + a);
return c;
}, Tellurium.getElementByName = function(a, b) {
var c = b.querySelector('[name="' + a + '"');
return c;
}, Tellurium.getElementByDom = function(locator) {
return eval(locator);
}, Tellurium.getElementByXpath = function(a, b) {
var c = document.evaluate(a, b, null, XPathResult.ANY_TYPE, null);
return c.iterateNext();
}, Tellurium.getElementByCss = function(a, b) {
var c = b.querySelector(a);
return c;
}, Tellurium.getElementByClass = function(a, b) {
var c = b.querySelector('[class~="' + a + ']"');
return c;
}, Tellurium._isXPathUnique = function(a, b) {
var c = 0, d = document.evaluate(a, b, null, XPathResult.ANY_TYPE, null);
while (d.iterateNext()) c++;
return c === 1 ? !0 : !1;
}, Tellurium.getElementIndex = function(a) {
var b = a.parentNode.childNodes, c = 0, d = 0;
for (var e = 0; e < b.length; e++) {
var f = b[e];
f.nodeName === a.nodeName && c++, f === a && (d = c);
}
return c > 1 ? d : 0;
}, Tellurium.getElementXPath = function(a, b) {
var c = "", d = !1, e = Tellurium.getTopElement(), f = [ "id", "style", "x-mojo-tap-highlight", "width", "height" ];
b = b === undefined ? !0 : b;
for (;;) {
var g = 0, h = [];
if (a.nodeName === "#document") return c;
if (a.nodeName !== "#text") {
if (a.id && !a.id.match("palm_anon")) {
h.push("@id='" + a.id + "'");
var i = "//" + a.nodeName.toLowerCase() + "[@id='" + a.id + "']" + c;
if (Tellurium._isXPathUnique(i, e)) return i;
}
for (var j = 0; j < a.attributes.length; j++) {
var k = a.attributes[j].name, l = a.attributes[j].value;
f.indexOf(k) === -1 && k.indexOf("x-palm-") !== 0 && l.indexOf("palm_anon_") !== 0 && h.push("contains(@" + k + ",'" + l + "')");
}
if (b && a.childNodes.length === 1 && a.childNodes[0].nodeName === "#text") {
var m = a.childNodes[0].textContent.trim();
m.length > 0 && h.push("contains(child::text(),'" + m + "')");
}
g = Tellurium.getElementIndex(a), d && g !== 0 && h.push(h.length > 0 ? "position()=" + g : "" + g);
var n = a.nodeName.toLowerCase();
if (h.length > 0) {
n += "[";
for (var o = 0; o < h.length - 1; o++) n += h[o] + " and ";
n += h[h.length - 1] + "]";
}
!Tellurium._isXPathUnique("//" + n + c, e), h.length === 0 && g !== 0 && (n += "[" + g + "]"), c = "/" + n + c;
}
a = a.parentNode;
if (!a || a === e) break;
}
console.error("XPATH IS NOT UNIQUE: /" + c);
return "/" + c;
}, Tellurium.highlightElement = function(a, b) {
if (Tellurium.highlight) {
var c = Tellurium.getElement(Tellurium.highlight.locator);
c && (c.style.background = Tellurium.highlight.oldBackground, c.style.border = Tellurium.highlight.oldBorder), Tellurium.highlight = undefined;
}
if (typeof a !== "string" || a.length !== 0) if (a) {
var c = Tellurium.getElement(a), b = b || "#FF3";
Tellurium.highlight = {
locator: a,
oldBackground: c.style.background,
oldBorder: c.style.border
}, c.style.backgroundColor = b, c.style.border = "2px solid red", c.style.backgroundImage = "none";
}
};

// palm/tellurium/dom.js

function createOffset(a, b) {
var c = [ a, b ];
c.left = a, c.top = b;
return c;
}

Tellurium.getDomProperty = function(a, b) {
var c, d = document.evaluate(a, document, null, XPathResult.ANY_TYPE, null);
while (c = d.iterateNext()) return c[b];
return -1;
}, Tellurium.clickDom = function(a) {
var b, c = document.evaluate(a, document, null, XPathResult.ANY_TYPE, null);
b = c.iterateNext();
if (b == null) {
console.log("Invalid xpath");
return !1;
}
var d, e, f = {
detail: 1,
ctrlKey: !1,
altKey: !1,
shiftKey: !1,
metaKey: !1,
button: 0
}, g = document.createEvent("MouseEvents");
d = b.id, e = Tellurium.getMetrics("#" + d), g.initMouseEvent("click", !0, !0, window, f.detail, e.left, e.top, e.left, e.top, f.ctrlKey, f.altKey, f.shiftKey, f.metaKey, f.button, null), b.dispatchEvent(g);
return !0;
}, Tellurium.queryElementValue = function(selector, propertyname) {
var propertyvalue = eval("document.querySelector(selector)." + propertyname);
return propertyvalue;
}, Tellurium.queryElement = function(a) {
var b = document.querySelector(a);
return b.innerHTML;
}, Tellurium.setValue = function(a, b) {
var c = document.querySelector(a);
c.innerHTML = b;
return !0;
}, Tellurium.setElementValue = function(selector, propertyname, value) {
eval("document.querySelector(selector)." + propertyname + "='" + value + "'");
return !0;
}, Tellurium.getDimensions = function(a) {
if (a.style.display != "none") return {
width: a.offsetWidth,
height: a.offsetHeight
};
var b = a.style, c = {
visibility: b.visibility,
position: b.position,
display: b.display
};
b.visibility = "hidden", b.position = "absolute", b.display = "block";
var d = {
width: a.clientWidth,
height: a.clientHeight
};
Tellurium.enyo.mixin(b, c);
return d;
}, Tellurium.viewportOffset = function(a) {
var b = a, c = 0, d = 0, e, f = a.ownerDocument;
while (b) {
c += b.offsetTop, d += b.offsetLeft, b !== a && (c += b.clientTop, d += b.clientLeft);
if (b.style.position === "fixed") {
e = b;
break;
}
b = b.offsetParent;
}
b = a;
while (b && b !== f) {
d -= b.scrollLeft, c -= b.scrollTop;
if (b === e) break;
b = b.parentNode;
}
return createOffset(d, c);
}, Tellurium.runScript = function(script) {
var result = eval(script);
return result || !0;
}, Tellurium.focus = function(a) {
var b = Tellurium.getElement(a);
b.focus();
}, Tellurium.blur = function(a) {
var b = Tellurium.getElement(a);
b.blur();
}, Tellurium.getProperty = function(a, b) {
var c = Tellurium.getElement(a);
return c[b];
}, Tellurium.setProperty = function(a, b, c) {
var d = Tellurium.getElement(a);
d[b] = c;
}, Tellurium.getStyleProperty = function(a, b) {
var c = Tellurium.getElement(a), d = window.getComputedStyle(c, null);
return d[b];
}, Tellurium.setStyleProperty = function(a, b, c) {
var d = Tellurium.getElement(a);
d.style[b] = c;
}, Tellurium.isElementPresent = function(a) {
var b = Tellurium.getElement(a);
return b ? !0 : !1;
}, Tellurium.isElementVisible = function(a) {
var b = Tellurium.getElement(a);
if (!b) return !1;
if (b.style.display === "none") return !1;
var c = Tellurium.getElementXPath(b, !1) + "/ancestor::*", d = document.evaluate(c, document, null, XPathResult.ANY_TYPE, null);
while (b = d.iterateNext()) if (b.style.display === "none") return !1;
return !0;
}, Tellurium.revealElement = function(a) {
var b = Tellurium.getElement(a);
}, Tellurium.getWidth = function(a) {
var b = Tellurium.getElement(a);
return Tellurium.getDimensions(b).width;
}, Tellurium.getHeight = function(a) {
var b = Tellurium.getElement(a);
return Tellurium.getDimensions(b).height;
}, Tellurium.getViewportOffsetTop = function(a) {
var b = Tellurium.getElement(a);
return Tellurium.viewportOffset(b).top;
}, Tellurium.getViewportOffsetLeft = function(a) {
var b = Tellurium.getElement(a);
return Tellurium.viewportOffset(b).left;
}, Tellurium.getMetrics = function(a) {
var b = Tellurium.getElement(a), c = Tellurium.viewportOffset(b), d = Tellurium.getDimensions(b), e = {
width: d.width,
height: d.height,
left: c.left,
top: c.top
};
return e;
}, Tellurium.getDayViewEventMetrics = function(a) {
var b = Tellurium.calendarDayViewInspector.getBySubject({
bounds: a
});
{
if (b) {
var c = {
width: b.width,
height: b.height,
left: b.left,
top: b.top
};
return c;
}
console.error("\n\n\tNo event was found with subject [ %s ].\n\n", a);
}
};

// palm/tellurium/cards.js

Tellurium.getViewNameByPaneId = function(paneId) {
var viewName = eval("Tellurium.enyo.windows.getActiveWindow().enyo.$." + paneId + ".getViewName()");
return viewName;
}, Tellurium.handleResize = function() {
var a = {};
a.type = "windowResize", a.width = window.innerWidth, a.height = window.innerHeight, Tellurium.notifyEvent(a);
}, Tellurium.defaultStageActivated = Mojo.stageActivated, Mojo.stageActivated = function() {
Tellurium.defaultStageActivated();
var a = {};
a.type = "windowActivate", a.stageId = Tellurium.stageId, Tellurium.notifyEvent(a), Tellurium.isActive = !0;
}, Tellurium.defaultStageDeactivated = Mojo.stageDeactivated, Mojo.stageDeactivated = function(a) {
Tellurium.defaultStageDeactivated();
var b = {};
b.type = "windowDeactivate", b.stageId = Tellurium.stageId, Tellurium.notifyEvent(b), Tellurium.isActive = !1, Tellurium.inVerifyDialog = !1, Tellurium.metaDown = !1;
}, Tellurium.closeStage = function() {
console.log("ENYO EVENT : closeStage  "), window.close();
}, Tellurium.activateStage = function() {
Tellurium.enyo.windows.activateWindow(window);
}, Tellurium.deactivateStage = function() {
Tellurium.enyo.windows.deactivateWindow(window);
}, Tellurium.isStageActive = function() {
return Tellurium.enyo.isCardActive;
}, Tellurium.getStageYOffset = function() {
var a = 0;
switch (Tellurium.stageType) {
case "card":
case "childcard":
a = screen.height !== window.innerHeight ? 28 : 0;
break;
case "dashboard":
a = Tellurium.isActive ? screen.height - window.innerHeight : screen.height - 28;
break;
case "banneralert":
case "activebanner":
a = screen.height - 28;
break;
case "popupalert":
a = screen.height - window.innerHeight;
}
return a;
}, Tellurium.back = function() {
Tellurium.keyEvent(document, "keydown", 27, 27, !1, !1, !1, !1);
}, Tellurium.getHtmlSource = function() {
return Tellurium.getTopElement().getElementsByTagName("html")[0].innerHTML;
};

// palm/tellurium/widgets.js

Tellurium.toggleMenu = function(menu) {
return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$." + menu + ".toggleOpen()");
}, Tellurium.menuShow = function(menu) {
return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$." + menu + ".show()");
}, Tellurium.menuHide = function(menu) {
return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$." + menu + ".hide()");
}, Tellurium.isMenuVisible = function(a) {
var b = Tellurium._getTopScene();
return a === "appMenu" ? b._menu.assistant.appMenuPopup ? !0 : !1 : b.getMenuVisible(Tellurium.mojo.Menu[a]) ? !0 : !1;
}, Tellurium.toggleMenuVisible = function(a) {
var b = Tellurium._getTopScene();
a === "appMenu" ? b._menu.assistant.toggleAppMenu() : b.toggleMenuVisible(Tellurium.mojo.Menu[a]);
}, Tellurium.getMenuCommands = function(a) {
var b = [], c = [], d = Tellurium._getTopScene();
if (a === "appMenu") {
if (Tellurium.isMenuVisible(a)) {
var e = Tellurium.cloneArray(d._menu.assistant.appMenuPopup.querySelectorAll("[x-mojo-menu-cmd]"));
e.forEach(function(a) {
var c = a.getAttribute("x-mojo-menu-cmd");
c !== "" && b.push(c);
});
return b;
}
} else a === "viewMenu" ? c = Tellurium.cloneArray(d._menu.assistant.viewModel.items) : a === "commandMenu" && (c = Tellurium.cloneArray(d._menu.assistant.commandModel.items));
var f = function(a) {
a.forEach(function(a) {
a.items ? f(a.items) : a.command && b.push(a.command);
});
};
f(c);
return b;
}, Tellurium.sendMenuCommand = function(a) {
var b = Tellurium.Event.make(Tellurium.Event.command, {
command: a
});
Mojo.Controller.stageController.sendEventToCommanders(b);
}, Tellurium.getIndexFromList = function(a, b) {
var c = document.querySelectorAll(a), d;
for (var e = 0; e < c.length; e++) {
d = c[e].innerHTML;
if (d.indexOf(b) != -1) return e + 1;
}
return -1;
}, Tellurium.getListItems = function(a, b, c) {
var d = Tellurium.getElement(a);
if (d.getAttribute("x-mojo-element") === "FilterList" || d.getAttribute("x-mojo-element") === "IndexedFilterList") d = d.mojo.getList();
if (d.getAttribute("x-mojo-element") === "IndexedList") return d.mojo.getItems(b, c);
throw d.getAttribute("x-mojo-element") === "List" ? {
message: "Not yet implemented!"
} : {
message: "Not a list!"
};
}, Tellurium.getListLength = function(a) {
var b = Tellurium.getElement(a);
if (b.getAttribute("x-mojo-element") === "FilterList" || b.getAttribute("x-mojo-element") === "IndexedFilterList") b = b.mojo.getList();
if (b.getAttribute("x-mojo-element") === "IndexedList") return b.mojo.getLength();
throw b.getAttribute("x-mojo-element") === "List" ? {
message: "Not yet implemented!"
} : {
message: "Not a list!"
};
}, Tellurium.getNodeCount = function(a) {
var b, c = 0, d = document.evaluate(a, document, null, XPathResult.ANY_TYPE, null);
while (b = d.iterateNext()) c++;
return c;
}, Tellurium.revealListItem = function(a) {
var b = 200, c = Tellurium.getMetrics(a), d = Tellurium._getTopScene().getSceneScroller();
d.mojo.scrollTo(undefined, d.mojo.getState().top - (-c.top + b));
}, Tellurium.getListItemJsonObject = function(a) {
var b = Tellurium.getElement("xpath=//div[contains(@x-mojo-element,'List')]"), c = Tellurium.getElement(a);
return b.mojo.getModelFromNode(c);
}, Tellurium.getListItemMetrics = function(a, b) {
var c = Tellurium.getElement(a);
if (c.getAttribute("x-mojo-element") === "FilterList" || c.getAttribute("x-mojo-element") === "IndexedFilterList") c = c.mojo.getList();
if (c.getAttribute("x-mojo-element") === "IndexedList") c = c.mojo.getNodeByIndex(b); else throw c.getAttribute("x-mojo-element") === "List" ? {
message: "Not yet implemented!"
} : {
message: "Not a list!"
};
return Tellurium.getMetrics(c);
}, Tellurium.textFieldGetValue = function(a) {
var b = Tellurium.getElement(a);
return b.mojo.getValue();
}, Tellurium.textFieldSetValue = function(a, b) {
var c = Tellurium.getElement(a);
c.mojo.setValue ? c.mojo.setValue(b) : c.mojo.setText(b);
}, Tellurium.textFieldGetCursorPosition = function(a) {
var b = Tellurium.getElement(a);
return b.mojo.getCursorPosition();
}, Tellurium.textFieldSetCursorPosition = function(a, b, c) {
var d = Tellurium.getElement(a);
d.mojo.setCursorPosition(b, c);
}, Tellurium.scrollToBottom = function(scrollerLocator) {
var scrollerTe = Tellurium.getElement(scrollerLocator);
if (scrollerTe.id == undefined || scrollerTe.id == null || scrollerTe.id == "") throw {
message: "Scroller element has no associated 'id' property."
};
var evalText = "Tellurium.enyo.windows.getActiveWindow().enyo.$." + scrollerTe.id + ".scrollToBottom()";
eval(evalText);
}, Tellurium.scrollToTop = function(scrollerLocator) {
var scrollerTe = Tellurium.getElement(scrollerLocator);
if (scrollerTe.id == undefined || scrollerTe.id == null || scrollerTe.id == "") throw {
message: "Scroller element has no associated 'id' property."
};
var evalText = "Tellurium.enyo.windows.getActiveWindow().enyo.$." + scrollerTe.id + ".scrollTo(0,0)";
eval(evalText);
}, Tellurium.scrollToElement = function(scrollerLocator, elementLocator) {
var scrollerTe = Tellurium.getElement(scrollerLocator);
if (scrollerTe.id == undefined || scrollerTe.id == null || scrollerTe.id == "") throw {
message: "Scroller element has no associated 'id' property."
};
var elementTe = Tellurium.getElement(elementLocator);
if (elementTe.offsetTop == undefined || elementTe.offsetTop == null) throw {
message: "Unable to determine the top location of elementLocator."
};
var evalText = "Tellurium.enyo.windows.getActiveWindow().enyo.$." + scrollerTe.id + ".scrollTo(" + elementTe.offsetTop + ",0)";
eval(evalText);
};

// palm/tellurium/startup.js

enyo.requiresWindow(function() {
window.PalmSystem && window.addEventListener("load", function() {
Tellurium.setup(window.enyo), console.log("Tellurium loading...");
}, !1);
});

