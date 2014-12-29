decanify
========

> Prepare canjs bower package for browserify's debowerify transform


This package was intended to address the very specific problem. To allow [canjs](http://canjs.com) installed via bower package to run smoothly with browserify. Period. No general purpose AMD to CommonJS converting and such.

***
Warning: Consider using [WebPack](https://github.com/webpack/webpack) instead.
***



##Why not [deamdify](https://github.com/jaredhanson/deamdify)?
Mainly three reasons:

- It seems maintainer has quit the project.
- There are critical open issues.
- It wont work with CanJS due to child dependencies.

This package was inspired by deAMDify but heavily rewritten to meet the specific requirements.
Anyway kudos goes to [Jared Hanson](https://github.com/jaredhanson).

##Requirements
- CanJS should be installed via `bower install canjs`
- [debowerify](https://github.com/eugeneware/debowerify) is required.
- Allowed file extensions: js or coffee. 
- decanify should run before debowerify.
- coffeify should run before decanify.

##Example

```javascript
//inside index.js
var can = require('canjs/amd/can');

//inside bower_components/canjs/amd/can.js
define(["can/util/library", "can/control/route", "can/model", "can/view/mustache", "can/component"], function(can) {
	return can;
});

//-t decanify
var can = require('canjs/can/util/library.js');
require('canjs/can/control/route.js');
...
require('canjs/can/component.js');
module.exports = can;

//-t debowerify
var can = require('./..\\..\\bower_components\\canjs\\amd\\can');

```

