// ==========================================================================================================================
//
// This file contains data for the experiments used to test performance
// of the SMPH model of IBUs.
// All data collected by John-Paul Hosom
//

var evaluateTestExperiments = [ ];  // null list means evaluate on all
// var evaluateTestExperiments = [ "Taste Experiment #1" ];

// units *must* be all metric

var testData = {
    "Tiffany's Stout, June 2020 large fermenter": {
        "conditions":            [ "TEST" ],  // this field is needed to fit in same format as parameter search
        "IBU_list":              [ 21.8 ],

        "boilTime":              70,          // time to first addition, plus duration of longest hop steep time
        "wortVolume":            22.56,
        "preOrPostBoilVol":      "postBoilVol",
        "OG":                    1.064,
        "pH":                    5.11,
        "preOrPostBoilpH":       "postBoilpH",
        "whirlpoolTime":         0,
        "beerAge_days":          10,

        //                AA%   BA%   form    freshF  %loss  weight(g),  boil time
        "add1":        [  6.0,   3.5, "cones", 0.90,   38.2,    42.52,      60 ],  // willamette
        "add2":        [  6.0,   3.5, "cones", 0.90,   38.2,    28.35,      10 ],  // willamette

        "kettleDiameter":        37.148,
        "kettleOpening":         37.148,
        "evaporationRate":       4.315,
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

    "Excellent Stout #3, Oct 2019, large fermenter": {
        "conditions":            [ "TEST" ],  // this field is needed to fit in same format as parameter search
        "IBU_list":              [ 28.6 ],

        "boilTime":              70,          // time to first addition, plus duration of longest hop steep time
        "wortVolume":            22.220,
        "preOrPostBoilVol":      "postBoilVol",
        "OG":                    1.0745,
        "pH":                    5.14,
        "preOrPostBoilpH":       "postBoilpH",
        "whirlpoolTime":         0,
        "beerAge_days":          15,

        //                AA%   BA%   form    freshF  %loss  weight(g),  boil time
        "add1":        [  3.9,   3.5, "cones", 0.90,   38.2,    85.05,      60 ],  // willamette
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

    "ESB #2, Dec. 2019, large fermenter": {
        "conditions":            [ "TEST" ],  // this field is needed to fit in same format as parameter search
        "IBU_list":              [ 26.6 ],

        "boilTime":              70,          // time to first addition, plus duration of longest hop steep time
        "wortVolume":            22.0,
        "preOrPostBoilVol":      "postBoilVol",
        "OG":                    1.055,
        "pH":                    5.15,
        "preOrPostBoilpH":       "postBoilpH",
        "whirlpoolTime":         0,
        "beerAge_days":          15,

        //                AA%   BA%   form    freshF  %loss  weight(g),  boil time
        "add1":        [  4.7,   3.5, "cones", 0.95,   38.2,    63.79,      60 ],  // EKG
        "add2":        [  4.7,   3.5, "cones", 0.95,   38.2,    28.35,      10 ],  // EKG

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

    "Kolsch, Sep. 2020": {
        "conditions":            [ "TEST" ],  // this field is needed to fit in same format as parameter search
        "IBU_list":              [ 26.0 ],

        "boilTime":              65,          // time to first addition, plus duration of longest hop steep time
        "wortVolume":            22.33,
        "preOrPostBoilVol":      "postBoilVol",
        "OG":                    1.0533,

        "pH":                    5.25,
        "preOrPostBoilpH":       "postBoilpH",
        "whirlpoolTime":         0,

        //                AA%   BA%   form    freshF  %loss  weight(g),  boil time
        "add1":        [  2.7,  5.0, "pellets", 1.00,   40.0,     56.70,     60 ],  // tettnang
        "add2":        [  3.8,  4.0, "pellets", 1.00,   45.0,     56.70,     10 ],  // hallertau

        "kettleDiameter":        37.148,
        "kettleOpening":         37.148,
        "evaporationRate":       4.20,
        "immersionDecayFactor":  0.4283,
        "forcedDecayType":       "forcedDecayImmersion",
        "wortClarity":           1.10,
        "finingsType":           "gelatin",
        "finingsAmount":         10.0,
        "beerAge_days":          15,

        "skipSearch":   true,
        "search": [
             {
                 "param":    "AA1",
                 "default":  2.70,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.20,
             },
             {
                 "param":    "AA2",
                 "default":  3.80,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.20,
             },
       ],
    },


    "IPA, Jan. 2021": {
        "conditions":            [ "TEST" ],  // this field is needed to fit in same format as parameter search
        "IBU_list":              [ 38.8 ],

        "boilTime":              68,          // time to first addition, plus duration of longest hop steep time
        "wortVolume":            22.71,
        "preOrPostBoilVol":      "postBoilVol",
        "OG":                    1.0645,

        "pH":                    5.29,
        "preOrPostBoilpH":       "postBoilpH",
        "whirlpoolTime":         0,

        //                AA%   BA%   form    freshF  %loss  weight(g),  boil time
        "add1":        [  5.0,  2.4, "pellets", 1.00,   34.0,     85.05,     60 ],  // EKG
        "add2":        [  3.0,  2.5, "pellets", 1.00,   25.0,     56.70,     45 ],  // fuggle
        "add3":        [  5.0,  2.4, "pellets", 1.00,   35.0,     28.35,     10 ],  // EKG

        "kettleDiameter":        37.148,
        "kettleOpening":         37.148,
        "evaporationRate":       3.80,
        "immersionDecayFactor":  0.4283,
        "forcedDecayType":       "forcedDecayImmersion",
        "wortClarity":           1.00,
        "finingsType":           "gelatin",
        "finingsAmount":         5.0,
        "beerAge_days":          18,

        "skipSearch":   true,
        "search": [
             {
                 "param":    "AA1",
                 "default":  5.00,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.20,
             },
             {
                 "param":    "AA2",
                 "default":  3.00,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.20,
             },
       ],
    },


    "Taste Experiment #1": {
        "conditions":            [ "A",   "B",   "C",   "D"   ],
        "IBU_list":              [ 20.2,  21.4,  21.2,  18.7  ],
        "weight1_list":          [ 10.30,  7.77,  5.14,  2.71 ],
        "weight2_list":          [ 21.70, 21.70, 21.70, 21.70 ],
        "boilTime1_list":        [ 40,    40,    40,    40 ],
        "boilTime2_list":        [ 1,      5,    10,    15 ],
        "boilTime":              45,            // time to first addition, plus duration of longest hop steep time
        "wortVolume":            12.0,          // average post-boil volume from four experiments (see volume.tcl)
        "preOrPostBoilVol":      "postBoilVol", // since first 5 minutes have lid off, faster evaporation
        "OG":                    1.0346,        // average of four measured values
        "pH":                    5.33,          // average of four measured values
        "preOrPostBoilpH":       "postBoilpH",
        "whirlpoolTime":         0,
        "krausen":               "minor krausen deposits on FV",  // daily swirling to reduce krausen
        "wortClarity":           1.3,         // rested wort, then decanted only top layer to get as clear as possible
        "beerAge_days":          7,

        // 2019 Amarillo hops, analyzed AA 9.56%.  Stored for ~10 months at -15'F with SF 0.75 -> FF 0.98
        //                AA%   BA%   form    freshF  %loss  weight(g),  boil time
        "add1":        [  9.56, 5.0, "cones", 0.98,   14.0,     0.0,      0 ],
        "add2":        [  9.56, 5.0, "cones", 0.98,   14.0,     0.0,      0 ],


        "kettleDiameter":        30.074,  // 5G aluminum kettle
        "kettleOpening":         30.074,
        "evaporationRate":       0.029,   // median from all four experiments
        "immersionDecayFactor":  0.25,    // average decay function exponential, from 0 to 5 min post boil
        "forcedDecayType":       "forcedDecayImmersion",

        "skipSearch":   true,
        "search": [
             {
                 "param":    "AA1",
                 "default":  9.56,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
             },
       ],
    },

    "Taste Experiment #2": {
        "conditions":            [ "A",   "B",   "C",   "D"   ],
        "IBU_list":              [ 23.6,  24.5,  23.0,  22.8  ],
        "weight1_list":          [ 10.75,  8.20,  5.25,  0.0  ],
        "weight2_list":          [ 24.10, 24.10, 24.10, 24.10 ],
        "boilTime1_list":        [ 40,    40,    40,    40 ],
        "boilTime2_list":        [ 1,      5,    10,    20 ],
        "boilTime":              45,            // time to first addition, plus duration of longest hop steep time
        "wortVolume":            11.4125,       // average post-boil volume from four experiments (see volume.tcl)
        "preOrPostBoilVol":      "postBoilVol", // since first 5 minutes have lid off, faster evaporation
        "OG":                    1.0363,        // average of four measured values
        "pH":                    5.32,          // average of four measured values
        "preOrPostBoilpH":       "postBoilpH",
        "whirlpoolTime":         0,
        "krausen":               "minor krausen deposits on FV",  // daily swirling to reduce krausen
        "wortClarity":           1.3,         // rested wort, then decanted only top layer to get as clear as possible
        "beerAge_days":          8,

        // 2019 Amarillo hops, analyzed AA 9.56%.  Stored for ~10 months at -15'F with SF 0.75 -> FF 0.98
        //                AA%   BA%   form    freshF  %loss  weight(g),  boil time
        "add1":        [  9.56, 5.0, "cones", 0.98,   14.0,     0.0,      0 ],
        "add2":        [  9.56, 5.0, "cones", 0.98,   14.0,     0.0,      0 ],

        "kettleDiameter":        30.074,  // 5G aluminum kettle
        "kettleOpening":         30.074,
        "evaporationRate":       0.046,   // median from all four experiments
        "immersionDecayFactor":  0.25,    // average decay function exponential, from first experiment
        "forcedDecayType":       "forcedDecayImmersion",

        "skipSearch":   true,
        "search": [
             {
                 "param":    "AA1",
                 "default":  9.56,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
             },
       ],
    },
};

