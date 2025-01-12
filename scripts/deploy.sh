#!/bin/bash
cd /home/github-actioner/dentist-bot

git pull origin main

sudo docker-compose down
sudo docker-compose up -d --build