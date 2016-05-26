#!/bin/bash

mkdir tmp || true

cd ../../microservices/BeersService/
mvn clean package
cd ../../docker-images/service-beers
cp ../../microservices/BeersService/target/*SNAPSHOT.jar ./tmp/

docker build -t sea/service_beers .
