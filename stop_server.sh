#!/bin/sh

ps -ef | grep "node" | awk '{print $2}' | grep -v 'grep' | xargs kill

