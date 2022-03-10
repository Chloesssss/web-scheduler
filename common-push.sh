#!/bin/sh
echo "start"
cd ./
pwd;
git subtree push --prefix=common http://223.71.0.241:9000/frontend-dev/common.git master
echo "success"
