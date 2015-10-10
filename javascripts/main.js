requirejs(["myJs/config"], function () {
	requirejs(["myJs/examples-data", "myJs/properties", "jquery", "handlebars", "text!templates/examples.html", "text!templates/properties.html"],
		function(dataExamples, dataProp, $, Handlebars, examples, properties) {		
			var compiledExamples = Handlebars.compile(examples),
				compiledProp = Handlebars.compile(properties);
			$(function () {
				$("#properties").html(compiledProp(dataProp));
				$("#examples").html(compiledExamples(dataExamples));
			});
	}); 
});