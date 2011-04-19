/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name locale.js
 * @fileOverview This file has conventions related to localization.
 * 
 * Copyright (c) 2010 Palm, Inc.  All rights reserved.
 *
 */

/*globals console G11n Locale enyo*/

//* @protected
enyo.g11n.Char = enyo.g11n.Char || {};

//* @protected
enyo.g11n.Char._strTrans = function _strTrans(str, table) {
	var retString = "",c,i;
	
	for ( i = 0; i < str.length; i++ ) {
		c = table[str.charAt(i)];
		retString += (c || str.charAt(i));
	}
	
	return retString;
};

enyo.g11n.Char._objectIsEmpty = function(object) {
	var property;
	for (property in object) {
		if (true) {			// To make JSLint happy
			return false;
		}
	}
	return true;
};

//* @protected
enyo.g11n.Char._isIdeoLetter = function (num)
{
	if ( (num >= 0x4E00) && (num <= 0x9FCB) ||  // Han  
		 (num >= 0xF900) && (num <= 0xFAD9) ||  // Han Compatibility
		 (num >= 0x3400) && (num <= 0x4DB5) ||  // Han Extended-A
		 (num >= 0x3041) && (num <= 0x309F) ||  // Hiragana
		 (num >= 0x30A1) && (num <= 0x30FF) ||  // Katakana
		 (num >= 0xFF66) && (num <= 0xFF9D) ||  // Halfwidth Katakana
		 (num >= 0x31F0) && (num <= 0x31FF) ||  // Katakana extended
		 (num >= 0x3105) && (num <= 0x312D) ||  // Bopomofo
		 (num >= 0x31A0) && (num <= 0x31B7) ||  // Bopomofo extended
		 (num >= 0x3131) && (num <= 0x318E) ||  // Hangul
		 (num >= 0xFFA0) && (num <= 0xFFDC) ||  // Halfwidth Hangul
		 (num >= 0xAC00) && (num <= 0xD7A3) ||  // Hangul Syllables
		 (num >= 0xA000) && (num <= 0xA48C) ||  // Yi
		 (num >= 0x1100) && (num <= 0x11FF) ||  // Jamo
		 (num >= 0xA960) && (num <= 0xA97C) ||  // Jamo Extended-A
		 (num >= 0xD7B0) && (num <= 0xD7FB) ) { // Jamo Extended-B
		return true;
	}
	
	return false;
};

//* @protected
enyo.g11n.Char._isIdeoOther = function (num)
{
	if ( (num >= 0xA48D) && (num <= 0xA4CF) ||  // Yi symbols
		 (num >= 0x3100) && (num <= 0x3104) ||  // Bopomofo
		 (num >= 0x312E) && (num <= 0x312F) ||  // Bopomofo
		 (num >= 0xFADA) && (num <= 0xFAFF) ||  // Han Compatibility
		 (num >= 0xD7FC) && (num <= 0xD7FF) ||  // Jamo Extended-B
		 (num >= 0x9FCC) && (num <= 0x9FFF) ||  // Han
		 (num >= 0xA97D) && (num <= 0xA97F) ||  // Jamo Extended-A
		 (num >= 0x3200) && (num <= 0x32FF) ||  // Enclosed CJK Letters and ideographs
		 (num >= 0x3300) && (num <= 0x337F) ||  // CJK Squared Words
		 (num >= 0x3380) && (num <= 0x33FF) ||  // CJK Squared Abbreviations
		 (num === 0x3130) || // hangul
		 (num === 0x318F) || // hangul
		 (num === 0x30A0) || // katakana
		 (num === 0x3040) || // hiragana
		 (num === 0x3006) || // IDEOGRAPHIC CLOSING MARK
		 (num === 0x303C) ) { // MASU MARK
		return true;
	}
	
	return false;			
};

//* @public
/**
Return true is the first character in the string an Asian ideographic character. 
*/
enyo.g11n.Char.isIdeo = function isIdeo(ch) {
	var num;
	
	if ( !ch || ch.length < 1 ) {
		return false;
	}
	
	num = ch.charCodeAt(0);
	
	return enyo.g11n.Char._isIdeoLetter(num) || enyo.g11n.Char._isIdeoOther(num);
};

/*
// taken from http://www.unicode.org/Public/5.2.0/ucd/PropList.txt
enyo.g11n.Char._punctChars = {
	0x002D: 1,	// HYPHEN-MINUS
	0x058A: 1,	// ARMENIAN HYPHEN
	0x05BE: 1,	// HEBREW PUNCTUATION MAQAF
	0x1400: 1,	// CANADIAN SYLLABICS HYPHEN
	0x1806: 1,	// MONGOLIAN TODO SOFT HYPHEN
	0x2010: 1,	// HYPHEN
	0x2015: 1,	// HORIZONTAL BAR
	0x2053: 1,	// SWUNG DASH
	0x207B: 1,	// SUPERSCRIPT MINUS
	0x208B: 1,	// SUBSCRIPT MINUS
	0x2212: 1,	// MINUS SIGN
	0x2E17: 1,	// DOUBLE OBLIQUE HYPHEN
	0x2E1A: 1,	// HYPHEN WITH DIAERESIS
	0x301C: 1,	// WAVE DASH
	0x3030: 1,	// WAVY DASH
	0x30A0: 1,	// KATAKANA-HIRAGANA DOUBLE HYPHEN
	0xFE31: 1,	// PRESENTATION FORM FOR VERTICAL EM DASH
	0xFE32: 1,	// PRESENTATION FORM FOR VERTICAL EN DASH
	0xFE58: 1,	// SMALL EM DASH
	0xFE63: 1,	// SMALL HYPHEN-MINUS
	0xFF0D: 1,	// FULLWIDTH HYPHEN-MINUS
	0x00AD: 1,	// SOFT HYPHEN
	0x2011: 1,	// NON-BREAKING HYPHEN
	0x30FB: 1,	// KATAKANA MIDDLE DOT
	0xFF65: 1,	// HALFWIDTH KATAKANA MIDDLE DOT

	0x0022: 1,	// QUOTATION MARK
	0x0027: 1,	// APOSTROPHE
	0x00AB: 1,	// LEFT-POINTING DOUBLE ANGLE QUOTATION MARK
	0x00BB: 1,	// RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK
	0x2018: 1,	// LEFT SINGLE QUOTATION MARK
	0x2019: 1,	// RIGHT SINGLE QUOTATION MARK
	0x201A: 1,	// SINGLE LOW-9 QUOTATION MARK
	0x201B: 1,	// SINGLE HIGH-REVERSED-9 QUOTATION MARK
	0x201C: 1,	// LEFT DOUBLE QUOTATION MARK
	0x201D: 1,	// RIGHT DOUBLE QUOTATION MARK
	0x201E: 1,	// DOUBLE LOW-9 QUOTATION MARK
	0x201F: 1,	// DOUBLE HIGH-REVERSED-9 QUOTATION MARK
	0x2039: 1,	// SINGLE LEFT-POINTING ANGLE QUOTATION MARK
	0x203A: 1,	// SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
	0x300C: 1,	// LEFT CORNER BRACKET
	0x300D: 1,	// RIGHT CORNER BRACKET
	0x300E: 1,	// LEFT WHITE CORNER BRACKET
	0x300F: 1,	// RIGHT WHITE CORNER BRACKET
	0x301D: 1,	// REVERSED DOUBLE PRIME QUOTATION MARK
	0x301E: 1,	// DOUBLE PRIME QUOTATION MARK
	0x301F: 1,	// LOW DOUBLE PRIME QUOTATION MARK
	0xFE41: 1,	// PRESENTATION FORM FOR VERTICAL LEFT CORNER BRACKET
	0xFE42: 1,	// PRESENTATION FORM FOR VERTICAL RIGHT CORNER BRACKET
	0xFE43: 1,	// PRESENTATION FORM FOR VERTICAL LEFT WHITE CORNER BRACKET
	0xFE44: 1,	// PRESENTATION FORM FOR VERTICAL RIGHT WHITE CORNER BRACKET
	0xFF02: 1,	// FULLWIDTH QUOTATION MARK
	0xFF07: 1,	// FULLWIDTH APOSTROPHE
	0xFF62: 1,	// HALFWIDTH LEFT CORNER BRACKET
	0xFF63: 1,	// HALFWIDTH RIGHT CORNER BRACKET

	0x0021: 1,	// EXCLAMATION MARK
	0x002C: 1,	// COMMA
	0x002E: 1,	// FULL STOP
	0x003A: 1,	// COLON
	0x003B: 1,	// SEMICOLON
	0x003F: 1,	// QUESTION MARK
	0x037E: 1,	// GREEK QUESTION MARK
	0x0387: 1,	// GREEK ANO TELEIA
	0x0589: 1,	// ARMENIAN FULL STOP
	0x05C3: 1,	// HEBREW PUNCTUATION SOF PASUQ
	0x060C: 1,	// ARABIC COMMA
	0x061B: 1,	// ARABIC SEMICOLON
	0x061F: 1,	// ARABIC QUESTION MARK
	0x06D4: 1,	// ARABIC FULL STOP
	0x0700: 1,	// SYRIAC END OF PARAGRAPH
	0x0701: 1,	// SYRIAC PUNCTUATION
	0x0702: 1,	// SYRIAC PUNCTUATION
	0x0703: 1,	// SYRIAC PUNCTUATION
	0x0704: 1,	// SYRIAC PUNCTUATION
	0x0705: 1,	// SYRIAC PUNCTUATION
	0x0706: 1,	// SYRIAC PUNCTUATION
	0x0707: 1,	// SYRIAC PUNCTUATION
	0x0708: 1,	// SYRIAC PUNCTUATION
	0x0709: 1,	// SYRIAC PUNCTUATION
	0x070A: 1,	// SYRIAC CONTRACTION
	0x070C: 1,	// SYRIAC HARKLEAN METOBELUS
	0x07F8: 1,	// NKO COMMA
	0x07F9: 1,	// NKO EXCLAMATION MARK
	0x0830: 1,	// SAMARITAN PUNCTUATION NEQUDAA
	0x0831: 1,	// SAMARITAN PUNCTUATION 
	0x0832: 1,	// SAMARITAN PUNCTUATION 
	0x0833: 1,	// SAMARITAN PUNCTUATION 
	0x0834: 1,	// SAMARITAN PUNCTUATION 
	0x0835: 1,	// SAMARITAN PUNCTUATION 
	0x0836: 1,	// SAMARITAN PUNCTUATION 
	0x0837: 1,	// SAMARITAN PUNCTUATION 
	0x0838: 1,	// SAMARITAN PUNCTUATION 
	0x0839: 1,	// SAMARITAN PUNCTUATION 
	0x083A: 1,	// SAMARITAN PUNCTUATION 
	0x083B: 1,	// SAMARITAN PUNCTUATION 
	0x083C: 1,	// SAMARITAN PUNCTUATION 
	0x083D: 1,	// SAMARITAN PUNCTUATION 
	0x083E: 1,	// SAMARITAN PUNCTUATION ANNAAU
	0x0964: 1,	// DEVANAGARI DANDA
	0x0965: 1,	// DEVANAGARI DOUBLE DANDA
	0x0E5A: 1,	// THAI CHARACTER ANGKHANKHU
	0x0E5B: 1,	// THAI CHARACTER KHOMUT
	0x0F08: 1,	// TIBETAN MARK SBRUL SHAD
	0x0F0D: 1,	// TIBETAN MARK SHAD
	0x0F0E: 1,	// TIBETAN PUNCTUATION
	0x0F0F: 1,	// TIBETAN PUNCTUATION
	0x0F10: 1,	// TIBETAN PUNCTUATION
	0x0F11: 1,	// TIBETAN PUNCTUATION
	0x0F12: 1,	// TIBETAN MARK RGYA GRAM SHAD
	0x104A: 1,	// MYANMAR SIGN LITTLE SECTION
	0x104B: 1,	// MYANMAR SIGN SECTION
	0x1361: 1,	// ETHIOPIC WORDSPACE
	0x1362: 1,	// ETHIOPIC PUNCTUATION
	0x1363: 1,	// ETHIOPIC PUNCTUATION
	0x1364: 1,	// ETHIOPIC PUNCTUATION
	0x1365: 1,	// ETHIOPIC PUNCTUATION
	0x1366: 1,	// ETHIOPIC PUNCTUATION
	0x1367: 1,	// ETHIOPIC PUNCTUATION
	0x1368: 1,	// ETHIOPIC PARAGRAPH SEPARATOR
	0x166D: 1,	// CANADIAN SYLLABICS CHI SIGN
	0x166E: 1,	// CANADIAN SYLLABICS FULL STOP
	0x16EB: 1,	// RUNIC SINGLE PUNCTUATION
	0x16EC: 1,	// RUNIC PUNCTUATION
	0x16ED: 1,	// RUNIC CROSS PUNCTUATION
	0x17D4: 1,	// KHMER SIGN KHAN
	0x17D5: 1,	// KHMER SIGN KHAN..KHMER SIGN CAMNUC PII KUUH
	0x17D6: 1,	// KHMER SIGN CAMNUC PII KUUH
	0x17DA: 1,	// KHMER SIGN KOOMUUT
	0x1802: 1,	// MONGOLIAN COMMA
	0x1803: 1,	// MONGOLIAN COMMA..MONGOLIAN FOUR DOTS
	0x1804: 1,	// MONGOLIAN COMMA..MONGOLIAN FOUR DOTS
	0x1805: 1,	// MONGOLIAN FOUR DOTS
	0x1808: 1,	// MONGOLIAN MANCHU COMMA
	0x1809: 1,	// MONGOLIAN MANCHU FULL STOP
	0x1944: 1,	// LIMBU EXCLAMATION MARK
	0x1945: 1,	// LIMBU QUESTION MARK
	0x1AA8: 1,	// TAI THAM SIGN KAAN
	0x1AA9: 1,	// TAI PUNCTUATION
	0x1AAA: 1,	// TAI PUNCTUATION
	0x1AAB: 1,	// TAI THAM SIGN SATKAANKUU
	0x1B5A: 1,	// BALINESE PANTI
	0x1B5B: 1,	// BALINESE PAMADA
	0x1B5D: 1,	// BALINESE CARIK PAMUNGKAH
	0x1B5E: 1,	// BALINESE PUNCTUATION
	0x1B5F: 1,	// BBALINESE CARIK PAREREN
	0x1C3B: 1,	// LEPCHA PUNCTUATION
	0x1C3C: 1,	// LEPCHA PUNCTUATION
	0x1C3D: 1,	// LEPCHA PUNCTUATION
	0x1C3E: 1,	// LEPCHA PUNCTUATION
	0x1C3F: 1,	// LEPCHA PUNCTUATION
	0x1C7E: 1,	// OL CHIKI PUNCTUATION MUCAAD
	0x1C7F: 1,	// OL CHIKI PUNCTUATION DOUBLE MUCAAD
	0x203C: 1,	// DOUBLE EXCLAMATION MARK
	0x203D: 1,	// INTERROBANG
	0x2047: 1,	// DOUBLE QUESTION MARK
	0x2048: 1,	// PUNCTUATION
	0x2049: 1,	// EXCLAMATION QUESTION MARK
	0x2E2E: 1,	// REVERSED QUESTION MARK
	0x3001: 1,	// IDEOGRAPHIC COMMA
	0x3002: 1,	// IDEOGRAPHIC FULL STOP
	0xA4FE: 1,	// LISU PUNCTUATION COMMA
	0xA4FF: 1,	// LISU PUNCTUATION FULL STOP
	0xA60D: 1,	// VAI COMMA
	0xA60E: 1,	// VAI PUNCTUATION
	0xA60F: 1,	// VAI QUESTION MARK
	0xA6F3: 1,	// BAMUM FULL STOP
	0xA6F4: 1,	// BAMUM PUNCTUATION
	0xA6F5: 1,	// BAMUM PUNCTUATION
	0xA6F6: 1,	// BAMUM PUNCTUATION
	0xA6F7: 1,	// BAMUM QUESTION MARK
	0xA876: 1,	// PHAGS-PA MARK SHAD
	0xA877: 1,	// PHAGS-PA MARK DOUBLE SHAD
	0xA8CE: 1,	// SAURASHTRA DANDA
	0xA8CF: 1,	// SAURASHTRA DOUBLE DANDA
	0xA92F: 1,	// KAYAH LI SIGN SHYA
	0xA9C7: 1,	// JAVANESE PADA PANGKAT
	0xA9C8: 1,	// JAVANESE PUNCTUATION
	0xA9C9: 1,	// JAVANESE PADA LUNGSI
	0xAA5D: 1,	// CHAM PUNCTUATION DANDA
	0xAA5E: 1,	// CHAM PUNCTUATION
	0xAA5F: 1,	// CHAM PUNCTUATION TRIPLE DANDA
	0xAADF: 1,	// TAI VIET SYMBOL KOI KOI
	0xABEB: 1,	// MEETEI MAYEK CHEIKHEI
	0xFE50: 1,	// SMALL COMMA
	0xFE51: 1,	// SMALL PUNCTUATION
	0xFE52: 1,	// SMALL FULL STOP
	0xFE53: 1,	// SMALL SEMICOLON
	0xFE54: 1,	// SMALL SEMICOLON..SMALL EXCLAMATION MARK
	0xFE55: 1,	// SMALL SEMICOLON..SMALL EXCLAMATION MARK
	0xFE56: 1,	// SMALL SEMICOLON..SMALL EXCLAMATION MARK
	0xFE57: 1,	// SMALL EXCLAMATION MARK
	0xFF01: 1,	// FULLWIDTH EXCLAMATION MARK
	0xFF0C: 1,	// FULLWIDTH COMMA
	0xFF0E: 1,	// FULLWIDTH FULL STOP
	0xFF1A: 1,	// FULLWIDTH COLON
	0xFF1B: 1,	// FULLWIDTH SEMICOLON
	0xFF1F: 1,	// FULLWIDTH QUESTION MARK
	0xFF61: 1,	// HALFWIDTH IDEOGRAPHIC FULL STOP
	0xFF64: 1	// HALFWIDTH IDEOGRAPHIC COMMA
};
*/

//* @public
/**
Returns true if the first character in the string is a punctuation character. 
*/
enyo.g11n.Char.isPunct = function isPunct(ch) {
	var punctChars, ret;
	
	if ( !ch || ch.length < 1 ) {
		return false;
	}
	
	punctChars = enyo.g11n.Utils.getNonLocaleFile({
		root: enyo.g11n.Utils._getEnyoRoot(),
		path: "base/character_data/chartype.punct.json"
	});
	
	ret = (punctChars && ch.charAt(0) in punctChars);
	
	enyo.g11n.Utils.releaseAllJsonFiles();
	
	return ret;
};

//* @protected
// taken from http://www.unicode.org/Public/5.2.0/ucd/PropList.txt
//and now, spacechars, the movie
enyo.g11n.Char._space = {
	0x0009: 1,	// tab
	0x000A: 1,	// line feed
	0x000B: 1,	// vertical tab
	0x000C: 1,	// form feed
	0x000D: 1,	// carriage return
	0x0020: 1,	// SPACE
	0x0085: 1,	// control-0085
	0x00A0: 1,	// NO-BREAK SPACE
	0x1680: 1,	// OGHAM SPACE MARK
	0x180E: 1,	// MONGOLIAN VOWEL SEPARATOR
	0x2000: 1,	// EN QUAD 
	0x2001: 1,	// spaces
	0x2002: 1,	// spaces
	0x2003: 1,	// spaces
	0x2004: 1,	// spaces
	0x2005: 1,	// spaces
	0x2006: 1,	// spaces
	0x2007: 1,	// spaces
	0x2008: 1,	// spaces
	0x2009: 1,	// spaces
	0x200A: 1,	// HAIR SPACE
	0x2028: 1,	// LINE SEPARATOR
	0x2029: 1,	// PARAGRAPH SEPARATOR
	0x202F: 1,	// NARROW NO-BREAK SPACE
	0x205F: 1,	// MEDIUM MATHEMATICAL SPACE
	0x3000: 1	// IDEOGRAPHIC SPACE
};

//* @public
/**
Returns true if the first character in the string is a whitespace character. 
*/
enyo.g11n.Char.isSpace = function isSpace(ch) {
	var num;
	if ( !ch || ch.length < 1 ) {
		return false;
	}
	
	num = ch.charCodeAt(0);
	return (num in enyo.g11n.Char._space);
};

//* @public
/**
Upper-case every character in a string.

* str (String): string to be upper-cased
* locale (String): the string is upper-cased using the rules of the given locale. If 
this parameter is not specified, the function will use the current locale

Upper-case every character in a string according to the rules of the given locale. 
If the locale is not given, the current locale is used.
 
Returns a string containing the same content as the original parameter, but with
all characters upper-cased
*/
enyo.g11n.Char.toUpper = function toUpper(str, locale) {
	var langinfo;
	
	if ( !str ) {
		return undefined;
	}

	if ( !locale ) {
		locale = enyo.g11n.currentLocale();	// can't do anything without the locale
	}
	
	langinfo = enyo.g11n.Utils.getJsonFile({
		root: enyo.g11n.Utils._getEnyoRoot(),
		path: "base/character_data", 
		locale: locale
	});

	if ( !langinfo || !langinfo.upperMap ) {
		// default to the English behaviour
		langinfo = enyo.g11n.Utils.getJsonFile({
			root: enyo.g11n.Utils._getEnyoRoot(),
			path: "base/character_data", 
			locale: new enyo.g11n.Locale("en")
		});
	}

	if ( langinfo && langinfo.upperMap !== undefined ) {
		return enyo.g11n.Char._strTrans(str, langinfo.upperMap);
	}
	
	enyo.g11n.Utils.releaseAllJsonFiles();
	
	return str;
};

//* @public
/**
Returns true if the first character in the string is a letter character. 
*/
enyo.g11n.Char.isLetter = function isLetter(ch) {
	var c, num, letterChars, ret;
	
	if ( !ch || ch.length < 1 ) {
		return false;
	}
	c = ch.charAt(0);
	num = ch.charCodeAt(0);
	
	// chars in chartype.letter.json were taken from http://www.unicode.org/Public/5.2.0/ucd/UnicodeData.txt
	letterChars = enyo.g11n.Utils.getNonLocaleFile({
		root: enyo.g11n.Utils._getEnyoRoot(),
		path: 'base/character_data/chartype.letter.json'
	});
	
	ret = (letterChars && (c in letterChars)) || enyo.g11n.Char._isIdeoLetter(num);
	
	enyo.g11n.Utils.releaseAllJsonFiles();
	
	return ret;
};

/**
- locale (String): the locale for which the alphabetic index chars are being sought.
This is a required parameter

Return an array of strings containing all of the alphabetic characters that are
used as index characters for the current locale. The characters are 
returned in the order they should appear in the index. An index character 
is a character under which multiple items in a list can be categorized. In
most languages, accented versions of a character are considered a 
variant of the base character, so list items are grouped together under
the same base character. In other locales, accented characters are
considered separate characters than the base without the accent, and
list items starting with the accented character should be grouped under
a separate header. The symbol "#" is appended to the end of the list
as the placeholder character representing all strings that do not
start with any of the alphabetic index chars.

Returns an array of strings containing all the index characters in order
*/
enyo.g11n.Char.getIndexChars = function getIndexChars(locale) {
	var indexchars, loc, rb;
	var i, arr = [];
	
	if (locale) {
		if (typeof(locale) === 'string') {
			loc = new enyo.g11n.Locale(locale);
		} else
			loc = locale;
	} else {
		loc = enyo.g11n.currentLocale();	// can't do anything without the locale
	}
	
	if (!enyo.g11n.Char._resources) {
		enyo.g11n.Char._resources = {};
	}
	
	if (!enyo.g11n.Char._resources[loc.locale]) {
		enyo.g11n.Char._resources[loc.locale] = new enyo.g11n.Resources({
			root: enyo.g11n.Utils._getEnyoRoot() + "/base",
			locale: loc
		});
	}
	
	rb = enyo.g11n.Char._resources[loc.locale];
	
	indexchars = enyo.g11n.Char._resources[loc.locale].$L({key: "indexChars", value: "ABCDEFGHIJKLMNOPQRSTUVWXYZ#"});
	
	for ( i = 0; i < indexchars.length; i++ ) {
		arr.push(indexchars[i]);
	}
	
	return arr;
};


/**
Converts every character in a string to its corresponding base character
according to the rules of the given locale.

- str (String): string to be de-accented
- locale (String/Object): if specified, the string is de-accented using 
the rules of the given locale. If the locale is not specified, this function 
uses the current UI locale.

The base character is defined to be
a version of the same character in the list of alphabetic index chars
as returned by [[getIndexChars]] that usually does not have
any accents or diacriticals unless the language considers the character
with the accent to be a distinct character from the unaccented version.  
 
Returns a string containing the same content as the original parameter, but with
all characters replaced with their base characters
**/
enyo.g11n.Char.getBaseString = function getBaseString(str, locale) {
	var langinfo, loc;
	
	if ( !str ) {
		return undefined;
	}

	if (locale) {
		if (typeof(locale) === 'string') {
			loc = new enyo.g11n.Locale(locale);
		} else
			loc = locale;
	} else {
		loc = enyo.g11n.currentLocale();	// can't do anything without the locale
	}
	
	langinfo = enyo.g11n.Utils.getJsonFile({
		root: enyo.g11n.Utils._getEnyoRoot(),
		path: "base/character_data", 
		locale: loc
	});
	
	if ( !langinfo || enyo.g11n.Char._objectIsEmpty(langinfo) ) {
		// default to the English behaviour
		langinfo = enyo.g11n.Utils.getJsonFile({
			root: enyo.g11n.Utils._getEnyoRoot(),
			path: "base/character_data", 
			locale: new enyo.g11n.Locale("en")
		});
	}
	
	if ( langinfo && langinfo.baseChars !== undefined ) {
		str = enyo.g11n.Char._strTrans(str, langinfo.baseChars);
	}
	
	enyo.g11n.Utils.releaseAllJsonFiles();
	
	return str;
};
