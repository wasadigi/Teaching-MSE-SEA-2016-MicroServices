#!/bin/bash

mkdir tmp || true

mvn clean package -f ../../microservices/ClockService/pom.xml
cp ../../microservices/ClockService/target/*SNAPSHOT.jar ./tmp/

docker build -t sea/service_clock .
