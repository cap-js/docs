# CDS Plugin Packages



The `cds-plugin` technique allows to provide extension packages with auto-configuration. 

[[toc]]



## Add a `cds-plugin.js`

Simply add a file `cds-plugin.js` next to the `package.json` of your package to have this detected and loaded automatically when bootstrapping CAP Node.js servers through `cds serve`, or other CLI commands. 

Within such `cds-plugin.js` modules you can use [the `cds` facade](cds-facade) object, to register to lifecycle events or plugin to other parts of the framework.

### Plugin to Lifecycle Events

### Plugin to Services

### Plugin to `cds.compile`



## Auto-Configuration

### Adding Required Services

### Adding Presets

### Using Profiles



## cds. plugins {.property}

This property refers to a module that fetches and loads installed plugins 

