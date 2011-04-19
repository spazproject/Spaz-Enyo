/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "headers.PageHeader",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", content: "This is a multi-line header<br> without an icon", style: "text-transform: capitalize"},
		{kind: "PageHeader", components: [
			{content: "Some truncating text that extends far far far far far far beyond the header's width", flex: 1, style: "text-overflow: ellipsis; overflow: hidden; white-space: nowrap; text-transform: capitalize"}
		]},
		{kind: "PageHeader", layoutKind: "VFlexLayout", components: [
			{content: "The same, but with a subtitle and without capitalization"},
			{content: "These page headers are quite flexible and work in any orientation", style: "font-size: 14px"}
		]},
		{kind: "PageHeader", components: [
			{kind: "Image", src: "images/facebook-32x32.png"},
			{content: "This is a multi-line page header with icon", style: "text-transform: capitalize; padding-left: 10px"}
		]},
		{kind: "PageHeader", components: [
			{kind: "Image", src: "images/mypalm-32x32.png"},
			{content: "Single line with custom icon and truncating text", flex: 1, style: "text-overflow: ellipsis; overflow: hidden; white-space: nowrap; text-transform: capitalize; padding-left: 10px"}
		]}
	]
});