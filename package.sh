#!/bin/sh
cd vendors
cp spazcore-standard.js spazcore.js
cd ..
git checkout master
mkdir packages
palm-package -o ./packages -X ./.palmignore --ignore-case ./