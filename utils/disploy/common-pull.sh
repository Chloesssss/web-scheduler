#!/bin/sh
echo "start"
cd ./
pwd;
git subtree pull --prefix=common http://lipengpeng:abc12345_@223.71.0.246:9000/frontend-dev/common.git master --squash
echo "success"
