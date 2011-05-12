/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
if (Mojo && Mojo.Core && Mojo.Core.Service) { //Sets up Mojo.Core.Service - attaching methods to its prototype
  Mojo.Core.Service.setup();
}


var	libsInfo =
    [
        {
            name: "contacts",
            version: "1.0",
            location: "ContactsLib",
            property: "contacts"
        },
				{
            name: "foundations",
            version: "1.0",
            location: "Foundations",
            property: "foundations"
        },
        {
            name: "underscore",
            version: "1.0",
            location: "_",
            property: "_",
            secondaryProperty: "underscore"  // this means we are loading underscore.underscore._
        }

    ];

libsInfo.forEach(function (info) {
    try
    {
        var lib = MojoLoader.require({
            name: info.name,
            version: info.version
        });
        lib = info.secondaryProperty ? lib[info.secondaryProperty] : lib;
        this[info.location] = info.property ? lib[info.property] : lib;
    }
    catch (e)
    {
        console.log("Error: failed to load: " + info.name + ": " + e.message);
    }
});

try
{
    Assert = (Foundations.Assert);
    PalmCall = (Foundations.Comms.PalmCall);
    Future = (Foundations.Control.Future);
    DB = (Foundations.Data.DB);
		
}
catch (e)
{
    console.log("Error: " + e.message);
}
