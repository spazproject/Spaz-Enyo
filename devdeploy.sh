#!/bin/sh
REMOVE=$1
if [ "$REMOVE" = "-r" ]; then
  palm-install -r com.funkatron.app.spaz-hd
fi
./package.sh
VERSION=`cat appinfo.json | egrep -o '"version":\s"([^"]*)"' | sed -r 's/"version":\s"([^"]*)"/\1/'`
PACKAGE_NAME="com.funkatron.app.spaz-hd_"$VERSION"_all.ipk"
palm-install packages/$PACKAGE_NAME
palm-launch com.funkatron.app.spaz-hd