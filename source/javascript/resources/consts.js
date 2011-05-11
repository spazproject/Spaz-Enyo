/*
 we use vars, not consts, because of compatibility issues
 but consts should be ALL_CAPS_ALL_THE_TIME
 we prefix them with SPAZ_ to make them easier to find in the global space
*/

var SPAZ_TIMELINE_CACHE_MAXENTRIES =      100;
var SPAZ_TIMELINE_CACHE_MAXENTRIES_DM =    30;
var SPAZ_TIMELINE_CACHE_MAXENTRIES_REPLY = 30;


var SPAZ_RELATIVE_TIME_LABELS = {
	'now':'now',
	'seconds':'s',
	'minute':'m',
	'minutes':'m',
	'hour':'hr',
	'hours':'hr',
	'day':'d',
	'days':'d'	
};

/*
 use this data to identify columns and 
 populate the columns popup
*/
var SPAZ_COLUMN_HOME     = 'home';
var SPAZ_COLUMN_MENTIONS = 'mentions';
var SPAZ_COLUMN_MESSAGES = 'messages';
var SPAZ_COLUMN_SEARCH   = 'search';


var SPAZ_COLUMN_TYPES = {};

SPAZ_COLUMN_TYPES[SPAZCORE_SERVICE_TWITTER] = [
		SPAZ_COLUMN_HOME,
		SPAZ_COLUMN_MENTIONS,
		SPAZ_COLUMN_MESSAGES,
		SPAZ_COLUMN_SEARCH
];
SPAZ_COLUMN_TYPES[SPAZCORE_SERVICE_IDENTICA] = [
	SPAZ_COLUMN_HOME,
	SPAZ_COLUMN_MENTIONS,
	SPAZ_COLUMN_MESSAGES,
	SPAZ_COLUMN_SEARCH
];
SPAZ_COLUMN_TYPES[SPAZCORE_SERVICE_CUSTOM] = [
	SPAZ_COLUMN_HOME,
	SPAZ_COLUMN_MENTIONS,
	SPAZ_COLUMN_MESSAGES,
	SPAZ_COLUMN_SEARCH
];

