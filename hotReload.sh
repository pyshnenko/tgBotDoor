#!/bin/bash
i=0
echo "Hello"
cat /home/pi/bot/system.txt | while read y
do
  fullDate=$(date)
  if [[ "$i" == "0" ]]; then
    y=$((y+300))
    ndate=$(date +%s)
    if (( $ndate > $y )); 
      then echo "date > 5"
      echo "false" > /home/pi/bot/system.txt
      fidate=$(date +%s)
      fidate=$((fidate+90000))
      echo "$fidate" >> /home/pi/bot/system.txt
      echo "autoreboot at $fullDate" >> /home/pi/bot/timeReboot.txt
      /sbin/reboot
    else
      echo "date < 5"
    fi
  fi
  if [[ "$y" == "pull"* ]]; then
    echo "git pull"
  fi
  if [[ "$y" == "push"* ]]; then
    echo "git push"
  fi
  i=$((i+1))
done
