(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var internal = require("./internal");
var promise = require("./promise");
var onRegisterTimeout;

/**
 * Asynchronously import/require a set of modules.
 *
 * <p>
 * Responsible for triggering the async loading of modules from plugins if
 * a given module is not already loaded.
 *
 * @param moduleQNames... A list of module "qualified" names, each containing the module name prefixed with the Jenkins plugin name
 * separated by a colon i.e. "<pluginName>:<moduleName>" e.g. "jquery:jquery2".
 *
 * @return A Promise, allowing async load of all modules. The promise is only fulfilled when all modules are loaded.
 */
exports.import = function() {
    if (arguments.length === 1) {
        return internal.import(arguments[0], onRegisterTimeout);        
    }
    
    var moduleQNames = [];    
    for (var i = 0; i < arguments.length; i++) {
        var argument = arguments[i];
        if (typeof argument === 'string') {
            moduleQNames.push(argument);
        }
    }
    
    if (moduleQNames.length == 0) {
        throw "No plugin module names specified.";
    }
    
    return promise.make(function (resolve, reject) {
        var fulfillments = [];
        
        function onFulfillment() {
            if (fulfillments.length === moduleQNames.length) {
                var modules = [];
                for (var i = 0; i < fulfillments.length; i++) {
                    if (fulfillments[i].value) {
                        modules.push(fulfillments[i].value);
                    } else {
                        // don't have everything yet so can't fulfill all.
                        return;
                    }
                }
                // If we make it here, then we have fulfilled all individual promises, which 
                // means we can now fulfill the top level import promise.
                resolve(modules);
            }
        }        
        
        // doRequire for each module
        for (var i = 0; i < moduleQNames.length; i++) {           
            function doRequire(moduleQName) {
                var promise = internal.import(moduleQName, onRegisterTimeout);
                var fulfillment = {
                    promise: promise,
                    value: undefined
                };
                fulfillments.push(fulfillment);
                promise
                    .onFulfilled(function(value) {
                        fulfillment.value = value;
                        onFulfillment();
                    })
                    .onRejected(function(error) {
                        reject(error);
                    });
            }
            doRequire(moduleQNames[i]);
        }
    }).applyArgsOnFulfill();    
};

/**
 * Synchronously "require" a module that it already loaded/registered.
 *
 * <p>
 * This function will throw an error if the module is not already loaded via an outer call to 'import'
 * (or 'import').
 *
 * @param moduleQName The module "qualified" name containing the module name prefixed with the Jenkins plugin name
 * separated by a colon i.e. "<pluginName>:<moduleName>" e.g. "jquery:jquery2".
 *
 * @return The module.
 */
exports.require = function(moduleQName) {
    var parsedModuleName = internal.parseModuleQName(moduleQName);
    var module = internal.getModule(parsedModuleName);    
    if (!module) {
        throw "Unable to perform synchronous 'require' for module '" + moduleQName + "'. This module is not pre-loaded. " +
            "The module needs to have been asynchronously pre-loaded via an outer call to 'import'.";
    }
    return module.exports;
}

/**
 * Export a module.
 * 
 * @param pluginName The Jenkins plugin in which the module resides, or "undefined" if the modules is in
 * the "global" module namespace e.g. a Jenkins core bundle.
 * @param moduleName The name of the module. 
 * @param module The CommonJS style module, or "undefined" if we just want to notify other modules waiting on
 * the loading of this module.
 * @param onError On error callback;
 */
exports.export = function(pluginName, moduleName, module, onError) {
    internal.onReady(function() {
        try {
            var moduleSpec = {pluginName: pluginName, moduleName: moduleName};
            var moduleNamespace = internal.getModuleNamespace(moduleSpec);
            
            if (moduleNamespace[moduleName]) {
                if (pluginName) {
                    throw "Jenkins plugin module '" + pluginName + ":" + moduleName + "' already registered.";
                } else {
                    throw "Jenkins global module '" + moduleName + "' already registered.";
                }
            }
            
            if (!module) {
                module = {
                    exports: {}
                };
            } else if (module.exports === undefined) {
                module = {
                    exports: module
                };
            }
            moduleNamespace[moduleName] = module;
            
            // Notify all that the module has been registered. See internal.loadModule also.
            internal.notifyModuleExported(moduleSpec, module.exports);
        } catch (e) {
            console.error(e);
            if (onError) {
                onError(e);
            }
        }
    });
};

/**
 * Add a module's CSS to the browser page.
 * 
 * <p>
 * The assumption is that the CSS can be accessed at
 * {@code <rootURL>/plugin/<pluginName>/jsmodules/<moduleName>/style.css}
 * 
 * @param pluginName The Jenkins plugin in which the module resides.
 * @param moduleName The name of the module. 
 * @param onError On error callback;
 */
exports.addModuleCSSToPage = function(pluginName, moduleName, onError) {
    internal.onReady(function() {
        try {
            internal.addModuleCSSToPage(pluginName, moduleName);
        } catch (e) {
            console.error(e);
            if (onError) {
                onError(e);
            }
        }
    });
};

/**
 * Add a plugin CSS file to the browser page.
 * 
 * @param pluginName The Jenkins plugin in which the module resides.
 * @param moduleName The name of the module. 
 * @param onError On error callback;
 */
exports.addPluginCSSToPage = function(pluginName, cssPath, onError) {
    internal.onReady(function() {
        try {
            internal.addPluginCSSToPage(pluginName, cssPath);
        } catch (e) {
            console.error(e);
            if (onError) {
                onError(e);
            }
        }
    });
};

/**
 * Add a javascript &lt;script&gt; element to the document &lt;head&gt;.
 * <p/>
 * Options:
 * <ul>
 *     <li><strong>scriptId</strong>: The script Id to use for the element. If not specified, one will be generated from the scriptSrc.</li>
 *     <li><strong>async</strong>: Asynchronous loading of the script. Default is 'true'.</li>
 *     <li><strong>success</strong>: An optional onload success function for the script element.</li>
 *     <li><strong>error</strong>: An optional onload error function for the script element. This is called if the .js file exists but there's an error evaluating the script. It is NOT called if the .js file doesn't exist (ala 404).</li>
 *     <li><strong>removeElementOnLoad</strong>: Remove the script element after loading the script. Default is 'false'.</li>
 * </ul>
 * 
 * @param scriptSrc The script src.
 * @param options Optional script load options object. See above.
 */
exports.addScript = function(scriptSrc, options) {
    internal.onReady(function() {
        internal.addScript(scriptSrc, options);
    });    
};

/**
 * Set the module registration timeout i.e. the length of time to wait for a module to load before failing.
 *
 * @param timeout Millisecond duration before onRegister times out. Defaults to 10000 (10s) if not specified.
 */
exports.setRegisterTimeout = function(timeout) {
    onRegisterTimeout = timeout;
}

/**
 * Set the Jenkins root/base URL.
 * 
 * @param rootUrl The root/base URL.
 */
exports.setRootURL = function(rootUrl) {
    internal.setRootURL(rootUrl);
};

/**
 * Manually initialise the Jenkins Global.
 * <p>
 * This should only ever be called from a test environment.
 */
exports.initJenkinsGlobal = function() {
    internal.initJenkinsGlobal();
};

internal.onJenkinsGlobalInit(function(jenkinsCIGlobal) {
    // For backward compatibility, we need to make some jenkins-js-modules
    // functions globally available e.g. to allow legacy code wait for
    // certain modules to be loaded, as with legacy adjuncts.
    if (!jenkinsCIGlobal._internal) {
        // Put the functions on an object called '_internal' as a way
        // of hinting to people to not use it.
        jenkinsCIGlobal._internal = {
            import: exports.import,
            addScript: internal.addScript
        };
    }
});
},{"./internal":2,"./promise":3}],2:[function(require,module,exports){
var promise = require("./promise");
var windowHandle = require("window-handle");
var jenkinsCIGlobal;
var globalInitListeners = [];

exports.onReady = function(callback) {
    // This allows test based initialization of jenkins-js-modules when there might 
    // not yet be a global window object.
    if (jenkinsCIGlobal) {
        callback();
    } else {
        windowHandle.getWindow(function() {
            callback();
        });
    }    
};

exports.onJenkinsGlobalInit = function(callback) {
    globalInitListeners.push(callback);
};

exports.initJenkinsGlobal = function() {
    jenkinsCIGlobal = {
    };
    if (globalInitListeners) {
        for (var i = 0; i < globalInitListeners.length; i++) {
            globalInitListeners[i](jenkinsCIGlobal);
        }
    }
};

exports.clearJenkinsGlobal = function() {    
    jenkinsCIGlobal = undefined;
};

exports.getJenkins = function() {
    if (jenkinsCIGlobal) {
        return jenkinsCIGlobal;
    }
    var window = windowHandle.getWindow();
    if (window.jenkinsCIGlobal) {
        jenkinsCIGlobal = window.jenkinsCIGlobal;
    } else {
        exports.initJenkinsGlobal();
        jenkinsCIGlobal.rootURL = getRootURL();
        window.jenkinsCIGlobal = jenkinsCIGlobal;
    }   
    return jenkinsCIGlobal;
};

exports.getModuleNamespace = function(moduleSpec) {
    if (moduleSpec.pluginName) {
        return exports.getPlugin(moduleSpec.pluginName);
    } else {
        return exports.getGlobalModules();
    }
}

exports.getPlugin = function(pluginName) {
    var plugins = exports.getPlugins();
    var pluginNamespace = plugins[pluginName];
    if (!pluginNamespace) {
        pluginNamespace = {
            globalNS: false            
        };
        plugins[pluginName] = pluginNamespace;
    }
    return pluginNamespace;
};

exports.import = function(moduleQName, onRegisterTimeout) {
    return promise.make(function (resolve, reject) {
        // getPlugin etc needs to access the 'window' global. We want to make sure that
        // exists before attempting to fulfill the require operation. It may not exists
        // immediately in a test env.
        exports.onReady(function() {
            var moduleSpec = exports.parseModuleQName(moduleQName);
            var module = exports.getModule(moduleSpec);
            
            if (module) {
                // module already loaded
                resolve(module.exports);
            } else {
                if (onRegisterTimeout === 0) {
                    if (moduleSpec.pluginName) {
                        throw 'Plugin module ' + moduleSpec.pluginName + ':' + moduleSpec.moduleName + ' require failure. Async load mode disabled.';
                    } else {
                        throw 'Global module ' + moduleSpec.moduleName + ' require failure. Async load mode disabled.';
                    }
                }

                // module not loaded. Load async, fulfilling promise once registered
                exports.loadModule(moduleSpec, onRegisterTimeout)
                    .onFulfilled(function (moduleExports) {
                        resolve(moduleExports);
                    })
                    .onRejected(function (error) {
                        reject(error);
                    });
            }
        });
    });    
};

exports.loadModule = function(moduleSpec, onRegisterTimeout) {
    var moduleNamespace = exports.getModuleNamespace(moduleSpec);
    var module = moduleNamespace[moduleSpec.moduleName];
    
    if (module) {
        // Module already loaded. This prob shouldn't happen.
        console.log("Unexpected call to 'loadModule' for a module (" + moduleSpec.moduleName + ") that's already loaded.");
        return promise.make(function (resolve) {
            resolve(module.exports);
        });
    }

    function waitForRegistration(loadingModule, onRegisterTimeout) {
        return promise.make(function (resolve, reject) {
            if (typeof onRegisterTimeout !== "number") {
                onRegisterTimeout = 10000;
            }
            
            var timeoutObj = setTimeout(function () {
                // Timed out waiting on the module to load and register itself.
                if (!loadingModule.loaded) {
                    var moduleSpec = loadingModule.moduleSpec;
                    var errorDetail;
                    
                    if (moduleSpec.pluginName) {
                        errorDetail = "Please verify that the plugin '" +
                            moduleSpec.pluginName + "' is installed, and that " +
                            "it registers a module named '" + moduleSpec.moduleName + "'";
                    } else {
                        errorDetail = "Timed out waiting on global module '" + moduleSpec.moduleName + "' to load.";
                    }                    
                    console.error('Module load failure: ' + errorDetail);

                    // Call the reject function and tell it we timed out
                    reject({
                        reason: 'timeout',
                        detail: errorDetail
                    });
                }
            }, onRegisterTimeout);
            
            loadingModule.waitList.push({
                resolve: resolve,
                timeoutObj: timeoutObj
            });                    
        });
    }
    
    var loadingModule = getLoadingModule(moduleNamespace, moduleSpec.moduleName);
    if (!loadingModule.waitList) {
        loadingModule.waitList = [];
    }
    loadingModule.moduleSpec = moduleSpec; 
    loadingModule.loaded = false;

    try {
        return waitForRegistration(loadingModule, onRegisterTimeout);
    } finally {
        // We can auto/dynamic load modules in a plugin namespace. Global namespace modules
        // need to make sure they load themselves (via an adjunct, or whatever).
        if (moduleSpec.pluginName) {
            var scriptId = exports.toPluginModuleId(moduleSpec.pluginName, moduleSpec.moduleName) + ':js';
            var scriptSrc = exports.toPluginModuleSrc(moduleSpec.pluginName, moduleSpec.moduleName);
            exports.addScript(scriptSrc, {
                scriptId: scriptId,
                scriptSrcBase: ''
            });
        }
    }
};

exports.addScript = function(scriptSrc, options) {
    if (!scriptSrc) {
        console.warn('Call to addScript with undefined "scriptSrc" arg.');
        return;
    }    
    
    var normalizedOptions;
    
    // If there's no options object, create it.
    if (typeof options === 'object') {
        normalizedOptions = options;
    } else {
        normalizedOptions = {};
    }
    
    // May want to transform/map some urls.
    if (normalizedOptions.scriptSrcMap) {
        if (typeof normalizedOptions.scriptSrcMap === 'function') {
            scriptSrc = normalizedOptions.scriptSrcMap(scriptSrc);
        } else if (Array.isArray(normalizedOptions.scriptSrcMap)) {
            // it's an array of suffix mappings
            for (var i = 0; i < normalizedOptions.scriptSrcMap.length; i++) {
                var mapping = normalizedOptions.scriptSrcMap[i];
                if (mapping.from && mapping.to) {
                    if (endsWith(scriptSrc, mapping.from)) {
                        normalizedOptions.originalScriptSrc = scriptSrc;
                        scriptSrc = scriptSrc.replace(mapping.from, mapping.to);
                        break;
                    }
                }
            }
        }
    }
    
    normalizedOptions.scriptId = getScriptId(scriptSrc, options);
    
    // set some default options
    if (normalizedOptions.async === undefined) {
        normalizedOptions.async = true;
    }
    if (normalizedOptions.scriptSrcBase === undefined) {
        normalizedOptions.scriptSrcBase = getRootURL() + '/';
    }

    var document = windowHandle.getWindow().document;
    var head = exports.getHeadElement();
    var script = document.getElementById(normalizedOptions.scriptId);

    if (script) {
        var replaceable = script.getAttribute('data-replaceable');
        if (replaceable && replaceable === 'true') {
            // This <script> element is replaceable. In this case, 
            // we remove the existing script element and add a new one of the
            // same id and with the specified src attribute.
            // Adding happens below.
            script.parentNode.removeChild(script);
        } else {
            return undefined;
        }
    }

    script = createElement('script');

    // Parts of the following onload code were inspired by how the ACE editor does it,
    // as well as from the follow SO post: http://stackoverflow.com/a/4845802/1166986
    var onload = function (_, isAborted) {
        script.setAttribute('data-onload-complete', true);
        try {
            if (isAborted) {
                console.warn('Script load aborted: ' + scriptSrc);
            } else if (!script.readyState || script.readyState === "loaded" || script.readyState === "complete") {
                // If the options contains an onload function, call it.
                if (typeof normalizedOptions.success === 'function') {
                    normalizedOptions.success(script);
                }
                return;
            }
            if (typeof normalizedOptions.error === 'function') {
                normalizedOptions.error(script, isAborted);
            }
        } finally {
            if (normalizedOptions.removeElementOnLoad) {
                head.removeChild(script);
            }
            // Handle memory leak in IE
            script = script.onload = script.onreadystatechange = null;
        }
    };
    script.onload = onload; 
    script.onreadystatechange = onload;

    script.setAttribute('id', normalizedOptions.scriptId);
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', normalizedOptions.scriptSrcBase + scriptSrc);
    if (normalizedOptions.originalScriptSrc) {
        script.setAttribute('data-referrer', normalizedOptions.originalScriptSrc);        
    }
    if (normalizedOptions.async) {
        script.setAttribute('async', normalizedOptions.async);
    }
    
    head.appendChild(script);
    
    return script;
};

exports.notifyModuleExported = function(moduleSpec, moduleExports) {
    var moduleNamespace = exports.getModuleNamespace(moduleSpec);
    var loadingModule = getLoadingModule(moduleNamespace, moduleSpec.moduleName);
    
    loadingModule.loaded = true;
    if (loadingModule.waitList) {
        for (var i = 0; i < loadingModule.waitList.length; i++) {
            var waiter = loadingModule.waitList[i];
            clearTimeout(waiter.timeoutObj);
            waiter.resolve(moduleExports);
        }
    }    
};

exports.addModuleCSSToPage = function(pluginName, moduleName) {
    var cssElId = exports.toPluginModuleId(pluginName, moduleName) + ':css';
    exports.addPluginCSSToPage(pluginName, 'jsmodules/' + moduleName + '/style.css', cssElId);
};

exports.addPluginCSSToPage = function(pluginName, cssPath, cssElId) {
    var document = windowHandle.getWindow().document;
    
    if (!cssElId) {
        cssElId = 'jenkins-plugin:' + pluginName + ':' + ':css:' + cssPath;
    }
    
    var cssEl = document.getElementById(cssElId);
    
    if (cssEl) {
        // already added to page
        return;
    }

    var cssPath = exports.getPluginPath(pluginName) + '/' + cssPath;
    var docHead = exports.getHeadElement();
    cssEl = createElement('link');
    cssEl.setAttribute('id', cssElId);
    cssEl.setAttribute('type', 'text/css');
    cssEl.setAttribute('rel', 'stylesheet');
    cssEl.setAttribute('href', cssPath);
    docHead.appendChild(cssEl);
};

exports.getGlobalModules = function() {
    var jenkinsCIGlobal = exports.getJenkins();
    if (!jenkinsCIGlobal.globals) {
        jenkinsCIGlobal.globals = {
            globalNS: true
        };
    }
    return jenkinsCIGlobal.globals;
};

exports.getPlugins = function() {
    var jenkinsCIGlobal = exports.getJenkins();
    if (!jenkinsCIGlobal.plugins) {
        jenkinsCIGlobal.plugins = {};
    }
    return jenkinsCIGlobal.plugins;
};

exports.toPluginModuleId = function(pluginName, moduleName) {
    return 'jenkins-plugin-module:' + pluginName + ':' + moduleName;
};

exports.toPluginModuleSrc = function(pluginName, moduleName) {
    return exports.getJSModulesDir(pluginName) + '/' + moduleName + '.js';
};

exports.getJSModulesDir = function(pluginName) {
    return exports.getPluginPath(pluginName) + '/jsmodules';
};

exports.getPluginPath = function(pluginName) {
    return getRootURL() + '/plugin/' + pluginName;
};

exports.getHeadElement = function() {
    var window = windowHandle.getWindow();
    var docHead = window.document.getElementsByTagName("head");
    if (!docHead || docHead.length == 0) {
        throw 'No head element found in document.';
    }
    return docHead[0];
};

exports.setRootURL = function(url) {    
    if (!jenkinsCIGlobal) {
        exports.initJenkinsGlobal();
    }
    jenkinsCIGlobal.rootURL = url;
};

exports.parseModuleQName = function(moduleQName) {
    var qNameTokens = moduleQName.split(":");    
    if (qNameTokens.length === 2) {
        return {
            pluginName: qNameTokens[0].trim(),
            moduleName: qNameTokens[1].trim()
        };
    } else {
        // The module/bundle is not in a plugin and doesn't
        // need to be loaded i.e. it will load itself and export.
        return {
            moduleName: qNameTokens[0].trim()
        };
    }
}

exports.getModule = function(moduleSpec) {
    if (moduleSpec.pluginName) {
        var plugin = exports.getPlugin(moduleSpec.pluginName);
        return plugin[moduleSpec.moduleName];
    } else {
        var globals = exports.getGlobalModules();
        return globals[moduleSpec.moduleName];
    }
}

function getScriptId(scriptSrc, config) {
    if (typeof config === 'string') {
        return config;
    } else if (typeof config === 'object' && config.scriptId) {
        return config.scriptId;
    } else {
        return 'jenkins-script:' + scriptSrc;
    }    
}

function getRootURL() {
    if (jenkinsCIGlobal && jenkinsCIGlobal.rootURL) {
        return jenkinsCIGlobal.rootURL;
    }
    
    var docHead = exports.getHeadElement();
    var resURL = getAttribute(docHead, "resURL");

    if (!resURL) {
        throw "Attribute 'resURL' not defined on the document <head> element.";
    }

    if (jenkinsCIGlobal) {
        jenkinsCIGlobal.rootURL = resURL;
    }
    
    return resURL;
}

function createElement(name) {
    var document = windowHandle.getWindow().document;
    return document.createElement(name);
}

function getAttribute(element, attributeName) {
    var value = element.getAttribute(attributeName.toLowerCase());
    
    if (value) {
        return value;
    } else {
        // try without lowercasing
        return element.getAttribute(attributeName);
    }    
}

function getLoadingModule(moduleNamespace, moduleName) {
    if (!moduleNamespace.loadingModules) {
        moduleNamespace.loadingModules = {};
    }
    if (!moduleNamespace.loadingModules[moduleName]) {
        moduleNamespace.loadingModules[moduleName] = {};
    }
    return moduleNamespace.loadingModules[moduleName];
}

function endsWith(string, suffix) {
    return (string.indexOf(suffix, string.length - suffix.length) !== -1);
}

},{"./promise":3,"window-handle":4}],3:[function(require,module,exports){
/*
 * Very simple "Promise" impl.
 * <p>
 * Intentionally not using the "promise" module/polyfill because it will add a few Kb and we 
 * only need something very simple here. We really just want to follow the main pattern
 * and don't need some of the fancy stuff.
 * <p>
 * I think so long as we stick to same interface/interaction pattern as outlined in the link
 * below, then we can always switch to the "promise" module later without breaking anything.
 * <p>
 * See https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */

exports.make = function(executor) {
    var thePromise = new APromise();
    executor.call(thePromise, function(result) {
        thePromise.resolve(result);
    }, function(reason) {
        thePromise.reject(reason);
    });
    return thePromise;
};

function APromise() {
    this.state = 'PENDING';
    this.whenFulfilled = undefined;
    this.whenRejected = undefined;
    this.applyFulfillArgs = false;
}

APromise.prototype.applyArgsOnFulfill = function() {
    this.applyFulfillArgs = true;
    return this;
}

APromise.prototype.resolve = function (result) {
    this.state = 'FULFILLED';
    
    var thePromise = this;
    function doFulfill(whenFulfilled, result) {
        if (thePromise.applyFulfillArgs) {
            whenFulfilled.apply(whenFulfilled, result);
        } else {
            whenFulfilled(result);
        }
    }
    
    if (this.whenFulfilled) {
        doFulfill(this.whenFulfilled, result);
    }
    // redefine "onFulfilled" to call immediately
    this.onFulfilled = function (whenFulfilled) {
        if (whenFulfilled) {
            doFulfill(whenFulfilled, result);
        }
        return this;
    }
};

APromise.prototype.reject = function (reason) {
    this.state = 'REJECTED';
    if (this.whenRejected) {
        this.whenRejected(reason);
    }
    // redefine "onRejected" to call immediately
    this.onRejected = function(whenRejected) {
        if (whenRejected) {
            whenRejected(reason);
        }
        return this;
    }
};

APromise.prototype.onFulfilled = function(whenFulfilled) {
    if (!whenFulfilled) {
        throw 'Must provide an "whenFulfilled" callback.';
    }
    this.whenFulfilled = whenFulfilled;
    return this;
};

APromise.prototype.onRejected = function(whenRejected) {        
    if (whenRejected) {
        this.whenRejected = whenRejected;
    }
    return this;
};

},{}],4:[function(require,module,exports){
var theWindow;
var defaultTimeout = 10000;
var callbacks = [];
var windowSetTimeouts = [];

function execCallback(callback, theWindow) {
    if (callback) {
        try {
            callback.call(callback, theWindow);                
        } catch (e) {
            console.log("Error invoking window-handle callback.");
            console.log(e);
        }
    }
}

/**
 * Get the global "window" object.
 * @param callback An optional callback that can be used to receive the window asynchronously. Useful when
 * executing in test environment i.e. where the global window object might not exist immediately. 
 * @param timeout The timeout if waiting on the global window to be initialised.
 * @returns {*}
 */
exports.getWindow = function(callback, timeout) {
    
	if (theWindow) {
        execCallback(callback, theWindow);
        return theWindow;
	} 
	
	try {
		if (window) {
            execCallback(callback, window);
			return window;
		} 
	} catch (e) {
		// no window "yet". This should only ever be the case in a test env.
		// Fall through and use callbacks, if supplied.
	}

	if (callback) {
        function waitForWindow(callback) {
            callbacks.push(callback);
            var windowSetTimeout = setTimeout(function() {
                callback.error = "Timed out waiting on the window to be set.";
                callback.call(callback);
            }, (timeout?timeout:defaultTimeout));
            windowSetTimeouts.push(windowSetTimeout);
        }
        waitForWindow(callback);
	} else {
		throw "No 'window' available. Consider providing a 'callback' and receiving the 'window' async when available. Typically, this should only be the case in a test environment.";
	}
}

/**
 * Set the global window e.g. in a test environment.
 * <p>
 * Once called, all callbacks (registered by earlier 'getWindow' calls) will be invoked.
 * 
 * @param newWindow The window.
 */
exports.setWindow = function(newWindow) {
	for (var i = 0; i < windowSetTimeouts.length; i++) {
		clearTimeout(windowSetTimeouts[i]);
	}
    windowSetTimeouts = [];
	theWindow = newWindow;
	for (var i = 0; i < callbacks.length; i++) {
		execCallback(callbacks[i], theWindow);
	}
    callbacks = [];
}

/**
 * Set the default time to wait for the global window to be set.
 * <p>
 * Default is 10 seconds (10000 ms).
 * 
 * @param millis Milliseconds to wait for the global window to be set.
 */
exports.setDefaultTimeout = function(millis) {
    defaultTimeout = millis;
}
},{}],5:[function(require,module,exports){

var $ = require('jenkins-js-modules').require('bootstrap:bootstrap3').getBootstrap();
var Belay = require('./svg'); 
var editors = require('./steps/builtin');

var pipeline = 
[
  {
    "name" : "Checkout",
    "steps" : [
      {"type": "git", "name" : "Clone webapp", "url" : "git@github.com/thing/awesome.git"},
    ]    
  },
  
  
  {
    "name" : "Prepare Test Database",
    "steps" : [
      {"type": "sh", "name" : "Install Postgress", "command" : "install_postgres"},
      {"type": "sh", "name" : "Initialise DB", "command" : "pgsql data/init.sql"},
    ]    
  },
  
  
 
  {
    "name" : "Prepare",
    "streams" : [
      {"name" : "Ruby", "steps" : [
        {"type": "sh", "name" : "Install Ruby", "command" : "/bin/ci/install_ruby version=2.0.1"},
        {"type": "stash", "name" : "Stash compiled app", "includes": "/app", "excludes" : ""} 
      ]},
      {"name" : "Python","steps" : [
        {"type": "sh", "name" : "Yeah", "command" : "exit()"},
        
      ]}
    ]    
  },
  
  {
    "name" : "Stage and Test",
    "steps" : []    
  },
  
  {
    "name" : "Approve",
    "steps" : [],
    "type" : "input"    
  },
  
  {
    "name" : "Deploy",
    "steps" : [],
    "node" : "devops-production"    
  },
  
  {
    "name" : "Party",
    "steps" : [{"type": "rick", "name" : "Awesome" } ]    
  }

  
]





/**
 * Draw the pipeline visualisation based on the pipeline data, including svg.
 * Current pipeline is stored in the "pipeline" variable assumed to be in scope. 
 */
exports.drawPipeline = function () {  
  pRow = $('#pipeline-row');
  pRow.empty();
  

  
  for (var i=0; i < pipeline.length; i++) {
    var stage = pipeline[i];
    var currentId = "stage-" + i;      
    //append a block if non parallel
    if (!isParallelStage(stage)) {      
      stageElement = normalStageBlock(currentId, stage);
      pRow.append(stageElement);
    } else {      
      subStages = "";
      var currentPils = [];
      for (j = 0; j < stage.streams.length; j++) {
        var subStage = stage.streams[j];
        var subStageId = currentId + "-" + j;                
        subStages += parStageBlock(stage['name'], subStageId, subStage);
      }      
      stageElement = '<div class="col-md-3"><ul class="list-unstyled">' + subStages + '</ul></div>';
      pRow.append(stageElement);
            
    }
  }
  autoJoinDelay();  
  addAutoJoinHooks();

  $(".open-editor").click(function(){
    openEditor($( this ).attr('data-action-id'));
  });

}

/** We will want to redraw the joins in some cases */
function addAutoJoinHooks() {
  $(".autojoin").click(function() {
    autoJoinDelay();
  });

}

/** need to give the user an option to apply the change... TODO: perhaps don't, just apply */
function addApplyChangesHooks() {
   $(".apply-pipe-changes").click(function() {
     console.log("applying changes to " + $( this ).attr('data-action-id'));
     handleEditorSave($( this ).attr('data-action-id'));
   });   
}

/**
 * parallel stages are an item in an ordered list.
 */
function parStageBlock(stageName, subStageId, subStage) {
  var subStageName = stageName + ": " +  subStage['name'];
  return '<li><div id="' + subStageId + '"  class="panel panel-default"><div class="panel-heading">' +
                  '<a role="button" class="autojoin" data-toggle="collapse" href="#' + subStageId + '_collapse">'  + 
                  subStageName + '</a>' + '<div class="collapse" id="' + subStageId + '_collapse">' +
                  stepListing(subStageId, subStage.steps) + '</div>'
                  + '</div></div></li>';
}
 
/**
 * A non parallel stage. Parallel stages are a pipeline editor construct, not an inherent workflow property.
 */
function normalStageBlock(currentId, stage) {
  return '<div class="col-md-3"><div id="' + currentId + '" class="panel panel-default"><div class="panel-heading">' 
                + '<a role="button" class="autojoin" data-toggle="collapse" href="#' + currentId + '_collapse">' + 
                stage['name'] + '</a>' + '<div class="collapse" id="' + currentId + '_collapse">' +
                stepListing(currentId, stage.steps) + '</div>' + '</div></div></div>';
}

/**
 * Take a list of steps and return a listing of steps
 */
function stepListing(stageId, steps)  {
  if (!steps) {
    return '';
  } else {
    buttons = '&nbsp;';
    for (var j=0; j < steps.length; ++j) {
        actionId = stageId + "-" + j;                
        buttons += '<a class="list-group-item open-editor" href="#" data-action-id="' + actionId + '">' + steps[j]['name'] +'</a>';      
    }  
    return '<div class="list-group">' + buttons + '</div>'    
  }
}

/**
 * Taking the actionId (co-ordinates), find the step info and load it up.
 */
function openEditor(actionId) {
  var coordinates = actionIdToStep(actionId);

  var stepInfo = fetchStep(coordinates, pipeline);
  var editorModule = editors.lookupEditor(stepInfo['type']);
   
  var editorHtml = editorModule.renderEditor(stepInfo, actionId); 
  var editPanel = $('#editor-panel');
  editPanel.empty();
  //console.log(template);
  var saveButton = '<button type="button" class="btn btn-default apply-pipe-changes" data-action-id="' + actionId + '">Save</button>';
  editPanel.append("<form>" + editorHtml + saveButton + "</form>");    
  
  var stageInfo = pipeline[coordinates[0]];
  $('#editor-heading').text(stageInfo['name'] + " / " + stepInfo['name']);
  
  addApplyChangesHooks();
}

function handleEditorSave(actionId) {
  var currentStep = fetchStep(actionIdToStep(actionId), pipeline);
  var edModule = editors.lookupEditor(currentStep['type']);
  if (edModule.readChanges(actionId, currentStep)) {
      exports.drawPipeline();
  }
  //TODO: need to render out here.
  //printDebugScript();
}

/**
 * an actionId is something like stage-1-2 or stage-1-2-3
 * This will return an array of the step co-ordinates.
 * So stage-1-2 = [1,2]
 *    stage-1-2-3 = [1,2,3]
 * the first number is the stage index, second is the step or stream index. 
 * the third number is if it is a parallel stage (so it is [stage, stream, step]) 
 */
function actionIdToStep(actionId) {
    var elements = actionId.split('-');
    switch (elements.length) {
      case 3:
        return [parseInt(elements[1]), parseInt(elements[2])];
      case 4:
        return [parseInt(elements[1]), parseInt(elements[2]), parseInt(elements[3])];  
      default: 
        console.log("ERROR: not a valid actionId");
    }
}

/**
 * Take 2 or 3 indexes and find the step out of the pipelineData.
 */
function fetchStep(coordinates, pipelineData) {
   if (coordinates.length == 2) {
     return pipelineData[coordinates[0]]['steps'][coordinates[1]];
   } else {
     return pipelineData[coordinates[0]]['streams'][coordinates[1]]['steps'][coordinates[2]];
   }
}



/**
  * Join up the pipeline elements visually allowing for parallelism.
  * 
  * from a pipeline that looks logically like: 
  * ["stage-0", ["stage-1-0", "stage-1-1"], "stage-2"]
  * 
  * Becomes: 
  * 
  *      /[]\
  * [] --    --[]
  *      \[]/
  *  
  */
function autoJoin() {  
    Belay.off();
    var previousPils = [];    
    for (var i=0; i < pipeline.length; i++) {
      var stage = pipeline[i];
      var currentId = "stage-" + i;      
      if (!isParallelStage(stage)) {      
        joinWith(previousPils, currentId);      
        previousPils = [currentId];      
      } else {      
        var currentPils = [];
        for (j = 0; j < stage.streams.length; j++) {
          currentPils[j] = currentId + "-" + j;                
        }
        for (var j=0; j < stage.streams.length; ++j) {
            joinWith(previousPils, currentPils[j]);
        }
        previousPils = currentPils;              
      }
    }    
}

/**
 * Draw the connecting lines using SVG and the div ids. 
 */
function joinWith(pilList, currentId) {
  for (i = 0; i < pilList.length; i++) {
    Belay.on("#" + pilList[i], "#" + currentId);
  }
}


/**
 * Wait until the steps are expanded before joining them together again
 */
function autoJoinDelay() {
  Belay.off();
  setTimeout(function() {
    autoJoin();
  }, 500);
}

/**
 * Before SVG can be used need to set it up. Only needed once per whole page refresh.
 */
exports.initSVG = function() {
  Belay.init({strokeWidth: 2});
  Belay.set('strokeColor', '#999');
}


/**
 * a parallel stage has to have streams
 */
function isParallelStage(stage) {
  if (stage.streams && stage.streams.length > 0) {
    return true;
  } else {
    return false;
  }
}



/**
 * Print out the workflow script using the given modules to render the steps. 
 */ 
function toWorkflow(pipelineData, modules) {
  function toStreams(streamData, modules) {
    var par = "\n    parallel (";  
    for (var i = 0; i < streamData.length; i++) {
        var stream = streamData[i];
        par += '\n     "' + stream['name'] + '" : {';
        par += toSteps(stream.steps, modules);      
        if (i == (streamData.length - 1)) {
            par += "\n     }"
        } else {
            par += "\n     },"
        }
    }
    return par + "\n    )"; 
  }

  function toSteps(stepData, modules) {
    var steps = "";
    for (var i = 0; i < stepData.length; i++) {
      var stepInfo = stepData[i];  
      var mod  = modules[stepInfo['type']];
      steps += "\n        " + mod.generateScript(stepInfo);
    }
    return steps;
  }

  var inner = "";
  for (i = 0; i < pipelineData.length; i++) {
    var stage = pipelineData[i];
    inner += '\n    stage name: "' + stage['name'] + '"';
    if (stage.streams) {      
      inner += toStreams(stage.streams, modules);
    } else {
      inner += toSteps(stage.steps, modules);
    }
  }  
  return "node {" + inner + "\n}";  
}




exports.yeah = function() {
  console.log('hey222');
  var confEditor = $('#page-body > div');
  confEditor.hide();
};

},{"./steps/builtin":7,"./svg":8,"jenkins-js-modules":1}],6:[function(require,module,exports){
require('jenkins-js-modules')
    .import('bootstrap:bootstrap3')
    .onFulfilled(function() {

var $ = require('jenkins-js-modules').require('bootstrap:bootstrap3').getBootstrap();
var h = require('./editor');
window.mic = $; //For debugging!

$(document).ready(function () {    

  var script = $("input[name='_.script']");
  var json = $("input[name='_.json']");
  var confEditor = $('#page-body > div');
  var pageBody = $('#page-body');
  
  
  if ("#pipeline-editor" === window.location.hash) {
    showEditor($, confEditor, pageBody, script, json);
  }
  
  $('#edit-pipeline').click(function() {
    showEditor($, confEditor, pageBody, script, json);
  });

});

/**
 * Clear the regular jenkins conf editor, show the pipeline editor
 */ 
function showEditor($, confEditor, pageBody, script, json) {
  confEditor.hide();    
  window.location.hash = "#pipeline-editor";
  pageBody.append("<div id='pipeline-visual-editor'>" +
                  "<div class='bootstrap-3'><p>" +
                  fixFlowCSS() +
                  pipelineEditorArea() +
                  detailContainer() +
                  "<input id='back-to-config' type=button class='btn' value='Done'></input><span class='glyphicon glyphicon-search' aria-hidden='true'></span></div></div>");
                  
  $('#back-to-config').click(function() {      
    confEditor.show();       
    $("#pipeline-visual-editor").remove();     
    window.location.hash = "";
  });
  
  console.log(script.val());
  console.log(json.val());
  
  h.initSVG();
  h.drawPipeline();
   
  script.val("yeah");

}


/** The bit that holds the pipeline visualisation */
function pipelineEditorArea() {
  return '<div class="container stage-listing">          ' +
    '<div id="pipeline-row" class="row"></div>        ' +
   '</div>';
}


/** container for holding the specific editors depending on what is clicked */
function detailContainer() {
  return '<div class="container stage-detail">' +
    '<div class="row">' +
      '<h3 class="col-md-12" id="editor-heading"></h3>' +
      '<div class="row">' +
        '<div class="col-md-12">' +
          '<div class="panel panel-default">' +
                '<div id="editor-panel" class="panel-body editor-detail"> ' +
                    'Click on a Step to view the details. ' +
                '</div>' +
          '</div>              ' +
        '</div>              ' +
      '</div>' +
    '</div>    ' +
  '</div>';
}

/** 
 * This will fix a problem with wrapping elements in bootstrap 
 * this is documented here: http://stackoverflow.com/questions/25598728/irregular-bootstrap-column-wrapping 
 * Without this, things won't wrap clearly left to right. Read it. 
 */
function fixFlowCSS() {
  return '<style>.stage-listing > .row > .col-md-3:nth-child(4n+1) {' +
    'clear: both;' +
  '}</style>;'
}

		require('jenkins-js-modules').export(undefined, 'pipelineeditor', {});
    });

},{"./editor":5,"jenkins-js-modules":1}],7:[function(require,module,exports){
/**
 * Editor modules for the build in steps.
 */

var $ = require('jenkins-js-modules').require('bootstrap:bootstrap3').getBootstrap();

var ShellModule = {
    description: "Run a shell script",        
    
    renderEditor : function(stepInfo, actionId) {          
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_command">Command</label>' +
                      '<textarea id="{{actionId}}_command" class="form-control" rows=5 style="font-family:monospace;">{{command}}</textarea>' +
                      '<p class="help-block">Run a command in the currently allocated build server. All standard shell scripting commands apply.</p>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_stepName">Step name</label>' +
                        '<input id="{{actionId}}_stepName" type="text" class="form-control" placeholder="Run a shell command" value="{{name}}">' +
                      '</div>' +
                    '</div>';      
        
        return renderTemplate(template, stepInfo, { "actionId" : actionId });
      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep["name"] = $('#' + actionId + "_stepName").val();
      currentStep["command"] = $('#' + actionId + "_command").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return 'sh "' + stepInfo['command'] + '"';
    },
};

var GitModule = {
    description: "Clone a git repository",        
    renderEditor : function(stepInfo, actionId) {      
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_url">Git repository to clone</label>' +
                      '<input id="{{actionId}}_url" type="text" class="form-control" placeholder="git@github.com:cloudbees/sample.git" value="{{url}}">' +                      
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_stepName">Step name</label>' +
                        '<input id="{{actionId}}_stepName" type="text" class="form-control" placeholder="Git clone" value="{{name}}">' +
                      '</div>' +
                    '</div>';        
      
      return renderTemplate(template, stepInfo, { "actionId" : actionId });      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep["name"] = $('#' + actionId + "_stepName").val();
      currentStep["url"] = $('#' + actionId + "_url").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return 'git ' + stepInfo['url'];
    },
};

var StashModule = {
    description: "Store output of a stage for use elsewhere",        
    renderEditor : function(stepInfo, actionId) {      
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_name">Name of stash</label>' +
                      '<input id="{{actionId}}_name" type="text" class="form-control" placeholder="Build Results" value="{{name}}">' +                      
                      '<p class="help-block">This name is used when you need to unstash onto a new node.</p>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_includes">Includes</label>' +
                        '<input id="{{actionId}}_includes" type="text" class="form-control" placeholder="./target" value="{{includes}}">' +
                        '<label for="{{actionId}}_excludes">Excludes</label>' +
                        '<input id="{{actionId}}_excludes" type="text" class="form-control" placeholder="" value="{{excludes}}">' +                        
                      '</div>' +
                    '</div>';        
      
      return renderTemplate(template, stepInfo, { "actionId" : actionId });      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep["name"] = $('#' + actionId + "_name").val();
      currentStep["includes"] = $('#' + actionId + "_includes").val();
      currentStep["excludes"] = $('#' + actionId + "_excludes").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return 'stash name: "' + stepInfo['name'] + '", includes: "' + stepInfo['includes'] + '", excludes: "' + stepInfo['excludes'] + '"';
    },
};

var RickModule = {
    description: "Never going to give you up",        
    renderEditor : function(stepInfo, actionId) {      
      // provide a form to edit
      var template = '<div class="embed-responsive embed-responsive-4by3">' +
                        '<iframe class="embed-responsive-item" src="https://www.youtube.com/embed/dQw4w9WgXcQ">' +
                        '</iframe>' +
                     '</div>';              
      return renderTemplate(template, stepInfo, { "actionId" : actionId });      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return '/* you have been rick rolled */';
    },
};


editorModules = {
  "sh" : ShellModule,
  "git" : GitModule,
  "stash" : StashModule,
  "rick" : RickModule  
};

exports.lookupEditor = function(type) {
  return editorModules[type];
}

exports.listEditors = function() {
  return editorModules;
}


/**
  * Templating in a few bytes eh.
  */
function renderTemplate(template, values, moreValues) {
  var result = template;
  for (key in values) {    
    result = result.split("{{" + key + "}}").join(values[key]);    
  }
  if (moreValues) {
    for (key in moreValues) {
      result = result.split("{{" + key + "}}").join(moreValues[key]);    
    }
  }
  return result;
}

},{"jenkins-js-modules":1}],8:[function(require,module,exports){
var $ = require('jenkins-js-modules').require('bootstrap:bootstrap3').getBootstrap();

var settings = {
                  strokeColor       : '#fff',
                  strokeWidth       : 10,
                  opacity           : 1,
                  fill              : 'none',
                  animate           : true,
                  animationDirection: 'right',
                  animationDuration : .3
               };


exports.init = function(initObj) {
    if (initObj) {
      $.each(initObj, function(index, value) {
         //TODO validation on settings
         settings[index] = value;
      });
    }
}

exports.set = function(prop, val){
  //TODO validate
  settings[prop] = val;
}

exports.on = function(el1, el2){
  var $el1 = $(el1);
  var $el2 = $(el2);
  if ($el1.length && $el2.length) {
    var svgheight
        ,p
        ,svgleft
        ,svgtop
        ,svgwidth

    var el1pos = $(el1).offset();
    var el2pos = $(el2).offset();

    var el1H = $(el1).outerHeight();
    var el1W = $(el1).outerWidth();

    var el2H = $(el2).outerHeight();
    var el2W = $(el2).outerWidth();

    svgleft = Math.round(el1pos.left + el1W);
    svgwidth = Math.round(el2pos.left - svgleft);

    var curvinessFactor, cpt;

    ////Determine which is higher/lower
    if( (el2pos.top+(el2H/2)) <= ( el1pos.top+(el1H/2))){
      // console.log("low to high");        
      svgheight = Math.round((el1pos.top+el1H/2) - (el2pos.top+el2H/2));
      svgtop = Math.round(el2pos.top + el2H/2) - settings.strokeWidth;        
      cpt = Math.round(svgwidth*Math.min(svgheight/300, 1));
      p = "M0,"+ (svgheight+settings.strokeWidth) +" C"+cpt+","+(svgheight+settings.strokeWidth)+" "+(svgwidth-cpt)+"," + settings.strokeWidth + " "+svgwidth+"," + settings.strokeWidth;          
    }else{
      // console.log("high to low");
      svgheight = Math.round((el2pos.top+el2H/2) - (el1pos.top+el1H/2));
      svgtop = Math.round(el1pos.top + el1H/2) - settings.strokeWidth;  
      cpt = Math.round(svgwidth*Math.min(svgheight/300, 1));
      p = "M0," + settings.strokeWidth + " C"+ cpt +",0 "+ (svgwidth-cpt) +","+(svgheight+settings.strokeWidth)+" "+svgwidth+","+(svgheight+settings.strokeWidth);                  
    }
    
    //ugly one-liner
    $ropebag = $('#ropebag').length ? $('#ropebag') : $('body').append($( "<div id='ropebag' />" )).find('#ropebag');

    var svgnode = document.createElementNS('http://www.w3.org/2000/svg','svg');
    var newpath = document.createElementNS('http://www.w3.org/2000/svg',"path");
    newpath.setAttributeNS(null, "d", p);
    newpath.setAttributeNS(null, "stroke", settings.strokeColor);
    newpath.setAttributeNS(null, "stroke-width", settings.strokeWidth);
    newpath.setAttributeNS(null, "opacity", settings.opacity);
    newpath.setAttributeNS(null, "fill", settings.fill);      
    svgnode.appendChild(newpath);
    //for some reason, adding a min-height to the svg div makes the lines appear more correctly.
    $(svgnode).css({left: svgleft, top: svgtop, position: 'absolute',width: svgwidth, height: svgheight + settings.strokeWidth*2, minHeight: '20px' });
    $ropebag.append(svgnode);
    if (settings.animate) {
      // THANKS to http://jakearchibald.com/2013/animated-line-drawing-svg/
      var pl = newpath.getTotalLength();
      // Set up the starting positions
      newpath.style.strokeDasharray = pl + ' ' + pl;

      if (settings.animationDirection == 'right') {
        newpath.style.strokeDashoffset = pl;
      } else {
        newpath.style.strokeDashoffset = -pl;
      }

      // Trigger a layout so styles are calculated & the browser
      // picks up the starting position before animating
      // WON'T WORK IN IE. If you want that, use requestAnimationFrame to update instead of CSS animation
      newpath.getBoundingClientRect();
      newpath.style.transition = newpath.style.WebkitTransition ='stroke-dashoffset ' + settings.animationDuration + 's ease-in-out';
      // Go!
      newpath.style.strokeDashoffset = '0';
    }
  }
}

exports.off = function(){
  $("#ropebag").empty();
}

},{"jenkins-js-modules":1}]},{},[6]);
