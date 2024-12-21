#!/bin/bash
echo "git push"
cd /home/pi/bot
git add .
git commit -m "$(date)"
git push origin main
echo "push done"