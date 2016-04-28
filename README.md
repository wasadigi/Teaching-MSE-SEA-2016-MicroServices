# Teaching-MSE-SEA-2016-MicroServices

This repository provides information about a semester project, which objective is to learn how to build a Continuous Delivery (CD) pipeline for a distributed application based on the micro-services architecture. 

It is part of the Software Engineering and Architecture (SEA) module of the Master of Science and Engineering (MSE), taught at the HES-SO University of Applied Sciences of Western Switzerland.

## Technologies and tools

The project is an opportunity to present and experiment with a number of technologies, frameworks and tools:

* Some of them are used to **implement the micro-services**: Spring Boot, etc.
* Others are used to **test** and **validate** them: JUnit, Cucumber, Selenium, Probe Dock, SonarQuebe, etc.
* Yet others are used to **implement and control the CD pipeline**: Docker, Jenkins, etc.

## Micro services

We will introduce the notion of micro services during the lectures. One thing that we will see is that has a lot to do with the recommended way to organize development teams. In other words, the current debate around micro services shows that the architectural and organizational aspects of software engineering are related. Autonomy, responsibility, whole-team approach, multi-disciplinary teams: these are all notions that we often talk about in the context of agile approches. Adopting a micro services architecture has the promise to facilitate them.

For now, let us just say that a micro service is a small independent service, which is responsible for managing its own data. A distributed application consists of a set of micro service. Use cases are implemented by invoking multiple micro services and aggregating their output. In technical terms, micro services can be implemented on any programming platforms. Today, they very often expose a REST API. In other words, HTTP is often used to invoke the services and collect their responses.

To illustrate this idea, consider a blog management system. We could imagine a User Management micro service, which we would use to register new users, to authenticate users, to manage user details and to block users. We could imagine a Blog Management micro service, which we would use to create new blog posts, to manage comments, etc. We could implement a Web UI, which would make calls both to the User Management micro service and to the Blog Management micro service to render the pages of the application.

In this project, we will implement a couple of micro services. Given the time constraints, they will be very simple. The goal is to show that there are now frameworks that facilitate the implementation of these services. It is also to show that these frameworks also take care of non functional aspects (e.g. monitoring).

## Docker

We will use Docker in different ways to deliver the project. We have already seen that we can use this lightweight virtualization technology to run the Jenkins CI/CD server. We will later see that we can package every micro service in a Docker image, which makes it easy to instantiate the services in various environments. We will also various testing tools in Docker containers.

## File system layout

| directory | description |
|-----------| ------------|
| cd-pipeline | This folder will contain the groovy script (Jenkinsfile) that defines our pipeline. It will also contain supporting files (mostly scripts).
| docker-images | This folder will contain one sub-folder for every image that we define; one our Jenkins, one for every packaged micro-service, etc.
| docker-topologies | This folder will contain Docker Compose description files, which can be used to declare relationships between multiple containers and manage them as a whole.
| microservices | This folder will contain one sub-folder for every implemented micro service. 

