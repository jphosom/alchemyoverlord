// ==========================================================================================================================
//
// This file contains data for the experiments used to test performance
// of the SMPH model of IBUs.
// All data collected by John-Paul Hosom
//

var evaluateTestExperiments = [ ];  // null list means evaluate on all
// var evaluateTestExperiments = [ "Tiffany's Stout, May 2019 large fermenter" ];

// units *must* be all metric

var testData = {
    "Tiffany's Stout, May 2019 large fermenter": {
        "conditions":            [ "TEST" ],  // this field is needed to fit in same format as parameter search
        "IBU_list":              [ 21.5 ],

        "boilTime":              72,          // time to first addition, plus duration of longest hop steep time
        "wortVolume":            23.583,
        "preOrPostBoilVol":      "postBoilVol",
        "OG":                    1.0643,
        "pH":                    5.15,
        "preOrPostBoilpH":       "postBoilpH",
        "whirlpoolTime":         0,
        "beerAge_days":          20,

        //                AA%   BA%   form    freshF  %loss  weight(g),  boil time
        "add1":        [  3.9,   3.5, "cones", 0.90,   38.2,    70.87,      60 ],  // willamette
        "add2":        [  3.9,   3.5, "cones", 0.90,   38.2,    28.35,      10 ],  // willamette

        "kettleDiameter":        37.148,
        "kettleOpening":         37.148,
        "evaporationRate":       3.581,
        "immersionDecayFactor":  0.4283,
        "forcedDecayType":       "forcedDecayImmersion",

        "skipSearch":   true,
        "search": [
             {
                 "param":    "AA1",
                 "default":  3.90,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
             },
             {
                 "param":    "AA2",
                 "default":  3.90,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
             },
       ],
    },

};

