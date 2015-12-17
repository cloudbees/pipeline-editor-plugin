# (Experimental) Visual pipeline editor for Jenkins Workflow. 




## To try it out

This is a regular Jenkins plugin (although using various javascript tools) so you can run it using the usual 

`mvn hpi:run` or build it using `mvn install` if you want to install it in an existing Jenkins master (note the experimental status, it may blow up in your face!)

## Developing the plugin

Run `mvn hpi:run` as it is a normal plugin. 

To work with the JavaScript, you run the following: 

`npm install`
`npm install -g gulp`
`gulp bundle && gulp rebundle`

This will set up the js tooling needed and automatically build the changes to the source
js which is stored in main/js to the plugin directory (just reload the browser after that).

The magic happens in src/main/js/ (pipelineeditor.js is the main entry point for the plugin).

# How it works

Right now a json DSL is used (see `json.js`) (and stored in the jenkins config.xml) to keep the state of the UI and pipeline. On change events, a workflow script (via `toWorkflow`) is emitted and stored in the config.xml for actual execution. A longer term plan is native workflow storage support (for this quasi declarative/visual subset of the full power of workflow).

## How to I see the generated workflow script

The plugin regularly logs it to the console (in the browser), but it is also stored in the config(xml) of the Workflow Job. 

# Enabled by jenkins-js-libs

This JavaScript heavy plugin is possible because of https://github.com/tfennelly/jenkins-js-modules and libs made available by: https://github.com/tfennelly/jenkins-js-libs/

This means that namespaced, clean js libraries and css can be made available to any Jenkins plugin that needs it. Ideally, you use the common jQuery, or any library, but if you really need your own, this framework can support it. Using modern js tools like gulp and less make for a smooth development workflow (I like to call it "refresh driven development").
