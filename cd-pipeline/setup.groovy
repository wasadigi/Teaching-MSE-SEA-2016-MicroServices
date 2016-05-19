/*
 * This script creates a Maven and a NodeJS installations on jenkins, so that they can be
 * referenced in the pipeline. To run the script, use the following command:
 *
 *   curl --data-urlencode script@setup.groovy http://localhost:8080/scriptText
 */
import hudson.tools.*
import jenkins.plugins.nodejs.tools.*

def MAVEN_TOOL_NAME = "M3"
def NODE_TOOL_NAME = "N1"
def MAVEN_VERSION = "3.3.9"
def NODE_VERSION = "4.4.1"
  
def jenkins = Jenkins.getInstance()
println "Jenkins version: ${jenkins.getVersion()}"

def pluginMaven = jenkins.getDescriptor(hudson.tasks.Maven.MavenInstallation)
def pluginNode = jenkins.getDescriptor(jenkins.plugins.nodejs.tools.NodeJSInstallation)

def mavenInstallations = (pluginMaven.installations as List)
def nodeInstallations = (pluginNode.installations as List)

println "There are ${mavenInstallations.size} maven installation(s)"
println "There are ${nodeInstallations.size} node installation(s)"

def mavenProp = new InstallSourceProperty([new hudson.tasks.Maven.MavenInstaller(MAVEN_VERSION)])
def mavenInstallation = new hudson.tasks.Maven.MavenInstallation(MAVEN_TOOL_NAME, null, [mavenProp])
/* we could add a new installation, but we rather make sure there is only one
mavenInstallations.add(mavenInstallation)
pluginMaven.installations = mavenInstallations
*/
pluginMaven.installations = mavenInstallation
pluginMaven.save()
    
def nodeInstaller = new NodeJSInstaller(NODE_VERSION, "npm bower grunt-cli", 72)
def nodeProp = new InstallSourceProperty([nodeInstaller])
def nodeInstallation = new NodeJSInstallation(NODE_TOOL_NAME, "", [nodeProp])
/* we could add a new installation, but we rather make sure there is only one
nodeInstallations.add(nodeInstallation)
pluginNode.installations = nodeInstallations
*/
pluginNode.installations = nodeInstallation
pluginNode.save()


println "There are now ${pluginMaven.installations.length} maven installation(s)"
println "There are now ${pluginNode.installations.length} node installation(s)"

