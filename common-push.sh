#!/bin/sh
echo "start"
cd ./
pwd;
git subtree push --prefix=common http://xxxx/common.git master
echo "success"
