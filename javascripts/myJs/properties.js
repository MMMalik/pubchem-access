define([], function () {
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
	
	var templ = {}, len = Math.ceil(properties.length / 3);
	
	templ.properties1 = properties.slice(0, len);
	templ.properties2 = properties.slice(len, 2 * len);
	templ.properties3 = properties.slice(2 * len);
	
	return templ;
});