  
  
  ## Spaz Enyo ##


Spaz. In Enyo.

If you want on the commits email list, sign up for <https://groups.google.com/d/topic/spaz-enyo-commits/>

### Spaz Enyo Team ###

* Daniel Cousineau
* Ed Finkler
* Paddy Foran
* Nicholas Guarracino
* Clay Hinson
* Will Honey
* Daniel Weigh

### Targeted Platforms ###

While the primary intial target is the HP TouchPad, Enyo is capable of running in any Webkit browser. If HP licenses Enyo liberally, the potential is there for Spaz Enyo to run on the following platforms:

* webOS
* Desktop Browsers (we may be limited by same-origin issues, though)
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


### Packaging for install on webOS ###

I made a short PHP script to do my packaging for me. You could certainly rewrite it in some other language if you like. It strips out the .git data and the included Enyo libraries, as they are provided on device/emulator. You'll need to adjust for the paths on your own machine.

```` php
#!/usr/bin/env php
<?php

function docmd($cmd) {
	echo $cmd."\n";
	shell_exec($cmd);
}

chdir("/Users/coj/Sites/spaz-enyo/vendors");
docmd("cp spazcore-standard.js spazcore.js");
chdir("/Users/coj/Sites/spaz-enyo");
docmd("git checkout master");
docmd("rm -rf ~/Desktop/spaz-enyo");
docmd("cp -r ~/Sites/spaz-enyo ~/Desktop/");
docmd("rm -rf ~/Desktop/spaz-enyo/.git");
docmd("rm -rf ~/Desktop/spaz-enyo/enyo");
docmd("rm -rf ~/Desktop/spaz-enyo/0.10");
chdir("/Users/coj/Desktop");
docmd("palm-package ./spaz-enyo/");

$appinfo = json_decode(file_get_contents('./spaz-enyo/appinfo.json'));

$filename = "{$appinfo->id}_{$appinfo->version}"."_all.ipk";


docmd("palm-install {$filename}");
docmd("palm-launch {$appinfo->id}");
````


### Packaging for Titanium Desktop ###

Building for Titanium Desktop is a bit more involved, as it requires a standard Titanium project folder with the following files and folder

	CHANGELOG.txt
	LICENSE.txt (symlink to Resources/LICENSE.md)
	Resources/
	build.sh
	manifest
	tiapp.xml
	timanifest

The interesting file is `build.sh`, which juggles files around and builds the .app and .dmg files. This may have some OS X-specific stuff in it.

```` bash
#!/bin/bash

SRCPATH='~/Applications/Projects/Spaz HD'
BLDPATH='/Users/coj/Desktop/SpazHD_Titanium'
TIPATH='/Users/coj/Library/Application Support/Titanium'
SDKPATH='/Library/Application Support/Titanium/sdk/osx/1.2.0.RC1'

BLDDATE=`date +%Y%m%d-%H%M%S%Z`

# let user know where we'll be working
echo "Source Path: ${SRCPATH}"
echo "Temp Path: ${TMPPATH}"
echo "Build Path:  ${BLDPATH}"
echo "--------------------------------------"

rm -rf $BLDPATH
mkdir -p $BLDPATH

echo "Copying source code..."
rm -rf /Users/coj/Applications/Projects/Spaz\ HD/Resources/*
cp -r /Users/coj/Sites/spaz-enyo/* /Users/coj/Applications/Projects/Spaz\ HD/Resources
rm -rf /Users/coj/Applications/Projects/Spaz\ HD/Resources/.git


echo "Swapping in spazcore-titanium.js"
cp "/Users/coj/Applications/Projects/Spaz HD/Resources/vendors/spazcore-titanium.js" \
        "/Users/coj/Applications/Projects/Spaz HD/Resources/vendors/spazcore.js"

ls -al "/Users/coj/Applications/Projects/Spaz HD/Resources/vendors/spazcore.js" 

echo "Building..."
echo "${SDKPATH}/tibuild.py" -r -v -p PACKAGE --type=bundle -d "${BLDPATH}" "${SRCPATH}"
"${SDKPATH}/tibuild.py" -r -v -p PACKAGE --type=bundle -d "${BLDPATH}" "${SRCPATH}"

open $BLDPATH

echo "Restoring spazcore-standard.js"
cp "/Users/coj/Applications/Projects/Spaz HD/Resources/vendors/spazcore-standard.js" \
        "/Users/coj/Applications/Projects/Spaz HD/Resources/vendors/spazcore.js"

ls -al "/Users/coj/Applications/Projects/Spaz HD/Resources/vendors/spazcore*.js"
````

