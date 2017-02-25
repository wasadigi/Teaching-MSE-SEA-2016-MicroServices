FROM jenkins:2.32.2

#
# Install the collection of pipeline plugins on top of the default jenkins installation
#
#COPY plugins.txt /usr/share/jenkins/ref/
#RUN /usr/local/bin/plugins.sh /usr/share/jenkins/ref/plugins.txt

RUN /usr/local/bin/install-plugins.sh nodejs workflow-aggregator github-organization-folder pipeline-stage-view blueocean

#
# Install Docker
#
USER root
RUN curl -fsSL https://get.docker.com/ | sh
RUN usermod -aG docker jenkins
RUN curl -L https://github.com/docker/compose/releases/download/1.6.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
RUN chmod +x /usr/local/bin/docker-compose
RUN usermod -aG users jenkins
USER jenkins

#
# Install our job configuration
#
COPY jobs /usr/share/jenkins/ref/jobs/
USER jenkins

#
# Ask Jenkins to execute a groovy script
#
