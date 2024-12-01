#!/bin/sh

docker run -p 4000:3000 --name chess3000 --env-file ./.env chess3000