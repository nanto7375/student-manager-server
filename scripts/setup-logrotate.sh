#!/bin/bash
# pm2-logrotate 설치 및 설정

pm2 install pm2-logrotate

pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
