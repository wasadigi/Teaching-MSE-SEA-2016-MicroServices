#!/bin/bash

#docker run --rm --net=host sea/validation-api-tests validation-api-tests-container
docker run --rm -e CLOCK_API_PREFIX=http://192.168.99.100:28001 sea/validation-api-tests