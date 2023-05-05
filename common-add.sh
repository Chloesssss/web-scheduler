#!/bin/sh
echo "start"
cd ./
pwd;
git subtree add --prefix=common http://xxxx/common.git master --squash
echo "success"
