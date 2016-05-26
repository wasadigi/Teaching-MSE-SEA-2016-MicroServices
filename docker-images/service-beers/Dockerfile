FROM java:8

COPY tmp/*.jar microservice.jar
ENTRYPOINT ["java","-jar","-Djava.security.egd=file:/dev/./urandom", "microservice.jar"]
