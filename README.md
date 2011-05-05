## Spaz Enyo

Spaz. In Enyo.

If you want on the commits email list, sign up for <https://groups.google.com/d/topic/spaz-enyo-commits/>

### Targeted Platforms ###

While the primary intial target is the HP TouchPad, Enyo is capable of running in any Webkit browser. If HP licenses Enyo liberally, the potential is there for Spaz Enyo to run on the following platforms:

* webOS
* Desktop Browsers
* Desktop web runtimes (AIR/Titanium)
* iOS
* Android

In other words, this could be one codebase to do all versions of Spaz. That's pretty exciting.

This means that as much as possible, **we should avoid webOS-specific functionality**. Certain webOS functionality like cross-app launching will definitely happen, but we should strive to degrade gracefully, and/or architect solutions that allow swapping of platform-specific code.


### Getting it running ###

You should be able to run Spaz Enyo within Chrome or Safari – Enyo is designed to work in any WebKit browser. We want to do as much development as possible within a desktop browser, and hopefully avoid webOS-specific functionality whenever possible.

**Safari** on OS X should run perfectly out of the box. Just open the `index.html` file in Safari, and it should load.

**Chrome** enforces more restrictions on local files and cross-domain requests, so you need to disable those on the command line. I wrote a short shell script called `chrometest` to do this on OS X:

    #!/bin/bash

    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
     --disable-web-security \
     --allow-file-access-from-files \
     --allow-file-access \
     --log-level 3 \
     $@

With this, I can type `chrometest index.html` and open Spaz Enyo in Chrome. *This won't work if Chrome is already open, though.*

This should work for OS X, and Linux if you modify the path to the binary. You should be able to do something similar on Windows without too much effort.