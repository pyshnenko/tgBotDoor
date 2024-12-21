#!/bin/bash

echo "git pull"
cd /home/pi/bot
git fetch --all
git reset --hard origin/main
git pull origin main
echo "pull done"