#!/bin/sh

node /home/tyt03538/FanTravelBackEnd/server.js > /home/tyt03538/logs/stdout.log 2> /home/tyt03538/logs/stderr.log &

status="$(curl -Is http://23.251.157.86:8080/api/_health | head -n 1)"
echo "$status"

