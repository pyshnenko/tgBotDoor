#!/bin/bash
i=0
echo "Hello"
cat /home/pi/tgBotDoor/system.txt | while read y
do
  fullDate=$(date)
  if [[ "$i" == "0" ]]; then
    y=$((y+300))
    ndate=$(date +%s)
    if (( $ndate > $y )); 
      then echo "date > 5"
      fidate=$(date +%s)
      fidate=$((fidate+90000))
      echo "$fidate" > /home/pi/tgBotDoor/system.txt
      echo "autoreboot at $fullDate" >> /home/pi/tgBotDoor/timeReboot.txt
      /sbin/reboot
    else
      echo "date < 5"
    fi
  fi
  if [[ "$y" == "pull"* ]]; then
    echo "git pull"
    cd /home/pi/bot
    git fetch --all
    git reset --hard origin/main
    git pull origin main
    fidate=$(date +%s)
    fidate=$((fidate+90000))
    echo "$fidate" > /home/pi/tgBotDoor/system.txt
    /sbin/reboot
  fi
  if [[ "$y" == "push"* ]]; then
    echo "git push"
    cd /home/pi/tgBotDoor
    git add .
    git commit -m "$(date)"
    git push origin main
    fidate=$(date +%s)
    fidate=$((fidate+90000))
    echo "$fidate" > /home/pi/tgBotDoor/system.txt
  fi
  if [[ "$y" == "restart"* ]]; then
    echo "restart"
    sudo systemctl restart myAvtostart
    echo "done"
    echo "$fidate" > /home/pi/tgBotDoor/system.txt
  fi
  i=$((i+1))
done
