decanify
========

> Prepare canjs bower package for browserify's debowerify transform


This package was intended to address the very specific problem. To allow [canjs](http://canjs.com) installed via bower package to run smoothly with browserify. Period. No general purpose AMD to CommonJS converting and such.

##Why not [deamdify](https://github.com/jaredhanson/deamdify)?
Mainly three reasons:

- It seems maintainer has quit the project.
- There are critical open issues.
- It wont work with CanJS due to child dependencies.

##Requirements
- CanJS was installed via `bower install canjs`
- [debowerify](https://github.com/eugeneware/debowerify) was installed.
- Allowed file extensions: js or coffee. 
- decanify has to run before debowerify.
- coffeify has to run before decanify.

##Example

```javascript
//index.js
var can = require('can');
//-t decanify
var can = require('canjs/amd/can.js');
//-t debowerify
var can = require('../.bower_components/canjs/amd/can.js');

```

