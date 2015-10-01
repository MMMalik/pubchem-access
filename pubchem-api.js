if (typeof exports === 'object' && typeof exports.nodeName !== 'string' && typeof define !== 'function') {
    var define = function (factory) {
        factory(require, exports, module);
    };
}

define(function (require, exports, module) {

    /*
     * A module that is built upon PubChem API.
     * Facilitates the use of PubChem API for JS environments.
     * Suitable for front-end and Node development.
     * @module pubchem-api
     */

    // Dependencies
	var request = require("superagent");
    
    // Base of the Pubchem API
    var baseUrl = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
    
    /**
     * Defines Find constructor.
     * @class Find
     * @param {string} prop - param associated with passed property
     * @param {string} [optionGet] - Additional option associated with CmpdOps obj.
     */
    var Find = function (prop, optionGet) {
        this.prop = prop;
        this.optionGet = optionGet;
    };
    
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
        var that = this;
        return {
            find: function (callback, dataFormat, optionF) {
                execSearch(url, callback, {
                    prop: that.prop,
                    optionF: optionF,
                    optionGet: that.optionGet,
                    dF: dataFormat
                });
            }
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
        
        return request
            .get(url.append(obj.dF))
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
                    callback(errObj.info, errObj.status);
                }                
            });
    }
    
    /**
     * Defines ClientError constructor.
     * @class ClientError
     * @param {Object} body - response body to be parsed accordingly.
     */
    var ClientError = function (body) {
        this.messagesFromServer = ["Missing CID list", "No CID found", "Expected a property list"];
        this.responses = ["Wrong CID number.", "Compound not found.", "Invalid properties."];
        this.message = body.Fault.Message;
        this.status = this.messagesFromServer.indexOf(this.message) + 3;
        this.info = this.responses[this.status - 3];
    };
    
    /**
     * Checks if the passed parameter is a valid CAS number.
     * @function
     * @param {string} toVerify - input to verify
     */
    function checkElement (toVerify) {
		var reg = new RegExp(/^(\d{1,8})-(\d{1,8})-(\d{1})$/);				
		var match = toVerify.match(reg);
		if (match === null) return false;
		var part1 = match[1];
		var part2 = match[2];
		var checkDigit = match[3].charAt(0);
		var sum = 0;
		var totalLength = part1.length + part2.length;
		for(i = 0; i < part1.length; i++) {
			sum += part1.charAt(i) * totalLength;
			totalLength--;
		}
		for(i = 0; i < part2.length; i++) {
			sum += part2.charAt(i) * totalLength;
			totalLength--;
		}
		return (sum % 10) == checkDigit;
	}
    
    /**
     * Appends a slash and a string.
     * @param {string} toAppend - fragment to append to the string on which this method is called
     * @returns {string} newUrl
     */
    String.prototype.append = function (toAppend) {
        return this + "/" + toAppend;
    };
    
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
            if (typeof optionGet === "undefined") {
                return body.InformationList.Information[0][prop];
            } else if (typeof optionGet === "number") {
                return body.InformationList.Information[0][prop].slice(0, optionGet);
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
    var CmpdSpace = function (url) {
        // Properties that can be requested according to PubChem API.
        this.properties = ["name", "name", "smiles", "cid", "inchi", "inchikey"];
        // Slightly changed names of those properties.
        this.alias = ["Name", "Cas", "Smiles", "Cid", "Inchi", "InchiKey"];
        this.url = url;
        
        // Generates all setters.
        var that = this;
        var i = 0;
        this.properties.forEach(function (property) {            
            that["set" + that.alias[i++]] = function (toFind) {
                var newUrl = that.url.append(property).append(toFind);
                return new CmpdOps(newUrl);
            };
        });
    };
    
    /**
     * Defines CmpdOps ("Compound Operations") constructor.
     * @class CmpdOps
     * @param {string} url - base Pubchem url with the already passed data appended to it
     */
    var CmpdOps = function (url) {
        // Array of properties according to PubChem API.
        this.properties = ["IUPACName", "MolecularFormula", "MolecularWeight",
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
        this.url = url;
        
        // Generates all getters.
        var that = this;
        this.properties.forEach(function (property) {            
            that["get" + property] = function () {
                var newUrl = that.url.append("property").append(property);
                return new Find(property).exec(newUrl);
            };            
        });
        this.getProperties = function (toFind) {
            if (!Array.isArray(toFind)) {
                throw new Error("Only array is accepted.");
            } else {
                var newUrl = that.url.append("property") + "/";
                toFind.forEach(function (element) {
                    if (that.properties.indexOf(element) >= 0) {
                        newUrl += element + ",";
                    }
                });
                return new Find("propertyArray").exec(newUrl);
            }
        };
        this.getCas = function () {
            var that = this;
            return {
                find: function (callback) {
                    that.getNames()
                        .find(function (allNames) {
                            for (var i = 0; i < allNames.length; i++) {
                                var el = allNames[i];
                                var found = checkElement(el);
                                if (found) {
                                    callback(el);
                                    break;
                                }
                            }
                        });
                }    
            };
        };
        this.getNames = function (number) {
            var newUrl = url.append("synonyms");
            return new Find("Synonym", number).exec(newUrl);
        };
    };
    
    /** Sets domain and exports. */
	exports.domain = function (domain, method) {
        var newUrl = baseUrl.append(domain);        
        if (domain === "compound") {  
            return typeof method === undefined ? new CmpdSpace(newUrl): new CmpdSpace(newUrl, "post");
        } else {
            throw new Error("Unknown domain.");
        }
    };
});