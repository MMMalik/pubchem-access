# pubchem-access
JavaScript wrapper for PubChem API

# About
Pubchem-access is a light-weight module enabling communication with [PubChem](https://pubchem.ncbi.nlm.nih.gov/) database in JavaScript. In the browser, it is designed to work with an AMD module loader, e.g. [require.js](http://requirejs.org/) and has Ajax API [SuperAgent](https://github.com/visionmedia/superagent) as its sole dependency.

# Getting started
In node:
```
npm install pubchem-access
```
In browser, just use pubchem-acces.js (works best with AMD module loader, tested with require.js).

#### Quick example in Node
```javascript
var pubchem = require("./pubchem-access").domain("compound");

pubchem
	.setName("acetic acid")
	.getCas()
	.execute(function (data, status) {
		console.log(data + ", status: " + status);
});
```

#### Quick example for browsers
```javascript
/*
 * First, configure require.js.
 * jQuery is NOT a dependency in pubchem-acccess,
 * just a utility for the sake of this example.
 */
requirejs(["config"], function(config) {
  requirejs(["jquery", "pubchem"], function ($, pbc) {
	var pubchem = pbc.domain("compound");
    $(function () {
      pubchem
        .setName("acetic acid")
        .getExactMass()
        .execute(function (data, status) {
          $("#content").html(data + ", status: " + status);
        });
    });
  });
});
```

# Detailed Tutorial
Check out the project [page](http://mmmalik.github.io/pubchem-access/).