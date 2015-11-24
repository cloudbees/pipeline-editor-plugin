# WIP - avert your eyes

This is the https://www.youtube.com/watch?v=CGAZOrXlEU0 editor work in progress. Using jenkins-js-lib and js tomfoolery.

To install: 

`npm install`
`npm install -g gulp`
`gulp bundle && gulp rebundle`

This will set up the js tooling needed and automatically build the changes to the source
js which is stored in main/js to the plugin directory (just reload the browser after that).

The magic happens in src/main/js/ (pipelineeditor.js is the main entry point for the plugin).
