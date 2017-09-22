#! /bin/bash
sudo nginx
cd /platformsvc-authenticationsvc/src
pm2 stop app.js --name="auth-service"
pm2 start app.js --name="auth-service"