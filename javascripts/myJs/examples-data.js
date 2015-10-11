define([], function () {
	return {
		examples: [
			{
				number: "1",
				description: "Retrieve CAS nr of ethanol.",
				button: "Get CAS",
				code: "$(\"#example1-btn\").click(function () {\n" +
					  "  pubchem\n" +
					  "    .setName(\"ethanol\")\n" +
					  "    .getCas()\n" +
					  "    .execute(function (data) {\n" +
					  "      $(\"#example1-result\").html(data);\n" +
					  "    });\n" +
					  "});"
			},
			{
				number: "2",
				description: "Retrieve IUPAC name from Smiles.",
				button: "Get IUPAC name",
				code: "$(\"#example2-btn\").click(function () {\n" +
					  "  pubchem\n" +
					  "    .setSmiles(\"CCCCC=O\")\n" +
					  "    .getIUPACName()\n" +
					  "    .execute(function (data) {\n" +
					  "      $(\"#example2-result\").html(data);\n" +
					  "    });\n" +
					  "});"
			},
			{
				number: "3",
				description: "Retrieve multiple properties in one call.",
				button: "Get properties",
				code: "$(\"#example3-btn\").click(function () {\n" +
					  "  pubchem\n" +
					  "    .setCas(\"50-78-2\")\n" +
					  "    .getProperties([\"IUPACName\", \"MolecularWeight\"])\n" +
					  "    .execute(function (data) {\n" +
					  "      $(\"#example3-result\").html(\n" + 
					  "        \"IUPAC name: \" + data.IUPACName +\n" +
					  "        \", MW: \" + data.MolecularWeight.toFixed(2));\n" +
					  "    });\n" +
					  "});"
			},
			{
				number: "4",
				description: "Retrieve all names and limit the results to 3. Names are lower case by default.",
				button: "Get names",
				code: "$(\"#example4-btn\").click(function () {\n" +
					  "  pubchem\n" +
					  "    .setCas(\"123-75-1\")\n" +
					  "    .getNames(3)\n" +
					  "    .execute(function (data) {\n" +
					  "      $(\"#example4-result\").html(\n" + 
					  "        data[0] +\n" +
					  "        \", \" + data[1]\n" +
					  "        \", \" + data[2]\n" +
					  "    });\n" +
					  "});"
			},
			{
				number: "5",
				description: "Tries to retrieve exact mass, but the specified compound does not exist.",
				button: "Get property of a non-existing compound",
				code: "$(\"#example5-btn\").click(function () {\n" +
					  "  pubchem\n" +
					  "    .setName(\"blablabla\")\n" +
					  "    .getExactMass()\n" +
					  "    .execute(function (data, status) {\n" +
					  "      $(\"#example5-result\").html(data + \", status code: \" + status)\n" +
					  "    });\n" +
					  "});"
			},
			{
				number: "6",
				description: "Tries to retrieve some properties, but only one of them is known by PubChem." +
							 " The unknown ones are ignored and status is OK (1).",
				button: "Get non-existing properties",
				code: "$(\"#example6-btn\").click(function () {\n" +
					  "  pubchem\n" +
					  "    .setName(\"aspirin\")\n" +
					  "    .getProperties([\"IUPACName\", \"NonExisiting1\", \"NonExisiting2\"])\n" +
					  "    .execute(function (data, status) {\n" +
					  "      $(\"#example6-result\").html(data.IUPACName + \", \" + data.NonExisiting1 + \", status: \" + status)\n" +
					  "    });\n" +
					  "});"
			},
			{
				number: "7",
				description: "Tries to retrieve some properties, but none one of them is known by PubChem." +
							 " They are ignored and status 5 is returned. You may use status code to render output conditionally.",
				button: "Check status before rendering",
				code: "$(\"#example7-btn\").click(function () {\n" +
					  "  pubchem\n" +
					  "    .setName(\"aspirin\")\n" +
					  "    .getProperties([\"NonExisiting1\", \"NonExisiting2\", \"NonExisiting2\"])\n" +
					  "    .execute(function (data, status) {\n" +
					  "      var output =\n" +
					  "        status === 1 ?\n" +
					  "          data.NonExisting1 + \", \" + data.NonExisting2 + \", \" + data.NonExisting3:\n" +
					  "          data + \", status: \" + status;\n" +
					  "      $(\"#example7-result\").html(output)\n" +
					  "    });\n" +
					  "});"
			},
			{
				number: "8",
				description: "Gets data as \"raw\" JSON. This way, you may use your own parser.",						 
				button: "Get raw data",
				code: "$(\"#example8-btn\").click(function () {\n" +
					  "  pubchem\n" +
					  "    .setName(\"THF\")\n" +
					  "    .getIUPACName()\n" +
					  "    .execute(function (data, status) {\n" +
					  "      var output =\n" +
					  "        status === 1 ?\n" +
					  "          JSON.stringify(data):\n" +
					  "          data + \", status: \" + status;\n" +
					  "      $(\"#example8-result\").html(output)\n" +
					  "    }, \"JSON\", \"raw\");\n" +
					  "});"
			}
		]
	};
});