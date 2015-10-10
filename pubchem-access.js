(function(root, factory) {
	if (typeof define === "function" && define.amd) {
		define(["superagent"], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("superagent"));
    } else {
        factory(request);
    }
})(this, function(request) {
	"use strict";
    /*
     * A module to communicate with PubChem.
     * Facilitates the use of PubChem API for JS environments.
     * Suitable for front-end and Node development.
     * @module pubchem-api
     */
    
    // Base of the Pubchem API
    var baseUrl = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
    
    /**
     * Defines Find constructor.
     * @param {string} prop - param associated with passed property
     * @param {string} [optionGet] - Additional option associated with CmpdOps obj.
     */
    function Find (prop, optionGet) {
        this.prop = prop;
        this.optionGet = optionGet;		 
    }
    
    /**
     * The final callback passed by user
     * @callback finalCallback
     * @param {string|Object} data - parsed response obtained from PubChem
     * @param {number} [status] - status of the response
     */
    
    /**
     * Returns object with the final "find()" function.
     * @function
     * @param {string} url - almost complete url (lacks only data format)
     * @returns {Object} obj - object containing "find()" function
     * @returns {Object} obj.find - final function calling "execSearch()"
     */
    Find.prototype.exec = function (url) {		
		function execute (callback, dataFormat, optionF) {
            execSearch(url, callback, {
				prop: this.prop,
				optionF: optionF,
				optionGet: this.optionGet,
				dF: dataFormat
            });
        }
        return {
            execute: execute.bind(this)	
        };
    };
    
    /**
     * Executes the request to PubChem.
     * @param {string} url - almost complete url (lacks only data format)
     * @param {finalCallback} callback - handles the response
     * @param {Object} obj - object that holds additional info (property, additional options, requested data format)
     * @param {string} obj.prop - param associated with passed property
     * @param {string} [obj.optionF] - option associated with "find()" function
     * @param {string} [obj.optionGet] - option associated with "get" function
     * @param {string} [obj.dF=JSON] - requested data format
     */
    function execSearch (url, callback, obj) {
        if (typeof obj.dF === "undefined") {
            obj.dF = "JSON";
        }        
        
        request
            .get(url.appendToPubchem(obj.dF))
            .end(function (err, res) {
                if (res.ok) {
                    // If response is status OK, then returns status = 1.
                    if (obj.dF !== "JSON" || obj.optionF === "raw") {
                        // Does not parse the response body if JSON is NOT requested or "raw" option is passed.
                        callback(res.body, 1);
                    } else {
                        // Parses the response body accordingly to the requested data.
                        callback(parseProperties(res.body, obj.prop, obj.optionGet), 1);
                    }                  
                } else if (res.serverError) {
                    // If server error is encountered, then returns status = 2.
                    callback("Service unavailable.", 2);
                } else if (res.clientError) {                    
                    // Handles client error. Returns status > 2, according to the encountered hindrance.
                    var errObj = new ClientError(res.body);
                    callback(errObj.getInfo(), errObj.getStatus());
                }               
        });
    }
    
    /**
     * Defines ClientError constructor.
     * @param {Object} body - response body to be parsed accordingly.
     */
    function ClientError (body) {
        this.messagesFromServer = ["Missing CID list", "No CID found", "Expected a property list"];
        this.responses = ["wrong CID number", "compound not found", "expected a property list"];
        this.message = body.Fault.Message;
    }
	
	ClientError.prototype.getInfo = function () {
		return this.responses[this.getStatus() - 3];
	};
	
	ClientError.prototype.getStatus = function () {
		return this.messagesFromServer.indexOf(this.message) + 3;
	};
    
    /**
     * Checks if the passed parameter is a valid CAS number.
     * @function
     * @param {string} toVerify - input to verify
     */
    function checkElement (toVerify) {
		var reg = new RegExp(/^(\d{1,8})-(\d{1,8})-(\d{1})$/), match = toVerify.match(reg);
		if (match === null) { return false; }
		var part1 = match[1], part2 = match[2],
			checkDigit = match[3].charAt(0),
			sum = 0,
			totalLength = part1.length + part2.length;
		for(var i = 0; i < part1.length; i += 1) {
			sum += part1.charAt(i) * totalLength;
			totalLength -= 1;
		}
		for(var j = 0; j < part2.length; j += 1) {
			sum += part2.charAt(j) * totalLength;
			totalLength -= 1;
		}
		return (sum % 10) === parseInt(checkDigit, 10);
	}
    
    /**
     * Appends a slash and a string.
     * @param {string} toAppend - fragment to appendToPubchem to the string on which this method is called
     * @returns {string} newUrl
     */
    if (!String.prototype.appendToPubchem) {
		String.prototype.appendToPubchem = function (toAppend) {
			return this + "/" + toAppend;
		};
    }
    
    /*
     * Parses the response body.
     * @function
     * @param {Object} body - response body to be parsed
     * @param {string} prop - param associated with passed property
     * @param {string} [optionGet] - option associated with "get" function
     * @returns {string|Object}
     */
    function parseProperties (body, prop, optionGet) {		
        if (prop === "Synonym") {
			var allNames = body.InformationList.Information[0][prop]; 
            if (typeof optionGet === "undefined") {
                return allNames;
			} else if (optionGet === "cas") {				
                for (var i = 0; i < allNames.length; i += 1) {
                    var el = allNames[i];
                    if (checkElement(el)) { return el; }
				}
			} else if (typeof optionGet === "number") {
                return optionGet > 0 ?
					allNames.slice(0, optionGet).map(function (element) {
						return element.toLowerCase();
					}):
					"";
            }
        } else if (prop === "propertyArray") {
            return body.PropertyTable.Properties[0];   
        } else {            
            return body.PropertyTable.Properties[0][prop];
        }
    }
    
    /**
     * Defines CmpdSpace ("Compound Space") constructor.
     * @class CmpdSpace
     * @param {string} url - base Pubchem url
     */
    function CmpdSpace (url) {
        // Properties that can be requested according to PubChem API.
        var properties = ["name", "name", "smiles", "cid", "inchi", "inchikey"];
        // Slightly changed names of those properties.
        var alias = ["Name", "Cas", "Smiles", "Cid", "Inchi", "InchiKey"];
        // Generates all setters.
		for(var i = 0; i <= properties.length; i += 1) {
			(function (j) {				
				this["set" + alias[j]] = function (toFind) {
					var newUrl = url.appendToPubchem(properties[j]).appendToPubchem(toFind);
					return new CmpdOps(newUrl);
				};
			}.call(this, i));
		}
    }
    
    /**
     * Defines CmpdOps ("Compound Operations") constructor.
     * @class CmpdOps
     * @param {string} url - base Pubchem url with the already passed data appendToPubchemed to it
     */
    var CmpdOps = function (url) {
        // Array of properties according to PubChem API.
        var properties = ["IUPACName", "MolecularFormula", "MolecularWeight",
                           "CanonicalSMILES", "IsomericSMILES", "InChI",
                           "InChIKey", "XLogP", "ExactMass",
                           "MonoisotopicMass", "TPSA", "Complexity",
                           "Charge", "HBondDonorCount", "HBondAcceptorCount",
                           "RotatableBondCount", "HeavyAtomCount", "IsotopeAtomCount",
                           "AtomStereoCount", "DefinedAtomStereoCount", "UndefinedAtomStereoCount",
                           "BondStereoCount", "DefinedBondStereoCount", "UndefinedBondStereoCount",
                           "CovalentUnitCount", "Volume3D", "XStericQuadrupole3D",
                           "YStericQuadrupole3D", "ZStericQuadrupole3D", "FeatureCount3D",
                           "FeatureAcceptorCount3D", "FeatureDonorCount3D", "FeatureAnionCount3D",
                           "FeatureCationCount3D", "FeatureRingCount3D", "FeatureHydrophobeCount3D",
                           "ConformerModelRMSD3D", "EffectiveRotorCount3D", "ConformerCount3D",
                           "Fingerprint2D"];
        
        // Generates all getters.
		for(var i = 0; i <= properties.length; i += 1) {
			(function (j) {				
				this["get" + properties[j]] = function (toFind) {
					var newUrl = url.appendToPubchem("property").appendToPubchem(properties[j]);
					return new Find(properties[j]).exec(newUrl);
				};
			}.call(this, i));
		}
		// Getter for array of properties
        this.getProperties = function (toFind) {
            if (!Array.isArray(toFind)) {
                throw new Error("Only array is accepted.");
            } else {
                var newUrl = url.appendToPubchem("property") + "/";
                toFind.forEach(function (element) {
                    if (properties.indexOf(element) >= 0) {
                        newUrl += element + ",";
                    }
                });
                return new Find("propertyArray").exec(newUrl);
            }
        };
		// Getter for Cas nr
        this.getCas = function () {
			var newUrl = url.appendToPubchem("synonyms");
            return new Find("Synonym", "cas").exec(newUrl);
        };
		/**
		 * Getter for names
		 * @param {number} number - "undefined" for all names
		 *							> 0 for specified number of names to display 
		 */
        this.getNames = function (number) {
            var newUrl = url.appendToPubchem("synonyms");
            return new Find("Synonym", number).exec(newUrl);
        };
    };
    
    /** Sets domain. */
	var pubchem = {
		domain: function (domain, method) {
			var newUrl = baseUrl.appendToPubchem(domain);        
			if (domain === "compound") {  
				return typeof method === undefined ? new CmpdSpace(newUrl): new CmpdSpace(newUrl, "post");
			} else {
				throw new Error("Unknown domain.");
			}
		}
	};
	return pubchem;
});