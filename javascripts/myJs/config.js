requirejs.config({
    baseUrl: 'javascripts/vendors',
    paths: {
        myJs: '../myJs',
		templates: "../templates",
		text: "text",
		jquery: 'jquery.min',
		superagent: "https://cdnjs.cloudflare.com/ajax/libs/superagent/1.2.0/superagent",
		pubchem: "pubchem-access",
		handlebars: "handlebars.amd.min"
    }
});