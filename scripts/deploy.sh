#!/bin/bash
cd /home/github-actioner/dentist-bot

git pull origin main

docker-compose down
docker-compose up -d --build