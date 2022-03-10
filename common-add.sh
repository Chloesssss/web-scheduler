#!/bin/sh
echo "start"
cd ./
pwd;
git subtree add --prefix=common http://223.71.0.241:9000/frontend-dev/common.git master --squash
echo "success"
