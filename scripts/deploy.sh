#!/bin/bash
cd /home/nikita/dentist-bot

git pull origin main

docker-compose down
docker-compose up -d --build