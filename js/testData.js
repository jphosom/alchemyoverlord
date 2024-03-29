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
    "Tiffany's Stout, June 2020 large FV": {
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

        //                AA%   BA%   form    freshF  %loss  weight(g),  steep time
        "add1":        [  6.0,   3.5, "cones", 0.90,   38.2,    42.52,      60 ],  // willamette
        "add2":        [  6.0,   3.5, "cones", 0.90,   38.2,    28.35,      10 ],  // willamette

        "kettleDiameter":        37.148,
        "kettleOpening":         37.148,
        "evaporationRate":       4.315,
        "immersionDecayFactor":  0.4283,
        "forcedDecayType":       "forcedDecayImmersion",
    },

    "Excellent Stout #3, Oct 2019, large FV": {
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

        //                AA%   BA%   form    freshF  %loss  weight(g),  steep time
        "add1":        [  3.9,   3.5, "cones", 0.90,   38.2,    85.05,      60 ],  // willamette
        "add2":        [  3.9,   3.5, "cones", 0.90,   38.2,    28.35,      10 ],  // willamette

        "kettleDiameter":        37.148,
        "kettleOpening":         37.148,
        "evaporationRate":       3.581,
        "immersionDecayFactor":  0.4283,
        "forcedDecayType":       "forcedDecayImmersion",
    },

    "ESB #2, Dec. 2019, large FV": {
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

        //                AA%   BA%   form    freshF  %loss  weight(g),  steep time
        "add1":        [  4.7,   3.5, "pellets", 0.95,   38.2,    63.79,      60 ],  // EKG
        "add2":        [  4.7,   3.5, "pellets", 0.95,   38.2,    28.35,      10 ],  // EKG
        "add3":        [  4.7,   3.5, "pellets", 0.95,   38.2,    21.26,      4,     2.0,    "dryHop" ],  // EKG

        "kettleDiameter":        37.148,
        "kettleOpening":         37.148,
        "evaporationRate":       3.581,
        "immersionDecayFactor":  0.4283,
        "forcedDecayType":       "forcedDecayImmersion",
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

        //                AA%   BA%   form    freshF  %loss  weight(g),  steep time
        "add1":        [  2.7,  5.0, "pellets", 1.00,   40.0,     56.70,     60 ],  // tettnang
        "add2":        [  3.8,  4.0, "pellets", 1.00,   45.0,     56.70,     10 ],  // hallertau
        "add3":        [  3.8,  4.0, "pellets", 1.00,   45.0,     28.35,     4,     2.0,   "dryHop" ],  // hallertau

        "kettleDiameter":        37.148,
        "kettleOpening":         37.148,
        "evaporationRate":       4.20,
        "immersionDecayFactor":  0.4283,
        "forcedDecayType":       "forcedDecayImmersion",
        "wortClarity":           1.10,
        "beerAge_days":          15,
    },


    "English IPA, Jan. 2021": {
        "conditions":            [ "TEST" ],  // this field is needed to fit in same format as parameter search
        "IBU_list":              [ 38.8 ],

        "boilTime":              68,          // time to first addition, plus duration of longest hop steep time
        "wortVolume":            22.71,
        "preOrPostBoilVol":      "postBoilVol",
        "OG":                    1.0645,

        "pH":                    5.29,
        "preOrPostBoilpH":       "postBoilpH",
        "whirlpoolTime":         0,

        //                AA%   BA%   form    freshF  %loss  weight(g),  steep time
        "add1":        [  5.0,  2.4, "pellets", 1.00,   34.0,     85.05,     60 ],  // EKG
        "add2":        [  3.0,  2.5, "pellets", 1.00,   25.0,     56.70,     45 ],  // fuggle
        "add3":        [  5.0,  2.4, "pellets", 1.00,   35.0,     28.35,     10 ],  // EKG
        "add4":        [  5.0,  2.4, "pellets", 1.00,   35.0,     56.70,     4,    2.0,  "dryHop" ],  // EKG

        "kettleDiameter":        37.148,
        "kettleOpening":         37.148,
        "evaporationRate":       3.80,
        "immersionDecayFactor":  0.4283,
        "forcedDecayType":       "forcedDecayImmersion",
        "wortClarity":           1.00,
        "finingsType":           "gelatin",
        "finingsAmount":         15.0,
        "beerAge_days":          18,
    },


    "West-Coast IPA, Jul. 2021": {
        "conditions":            [ "TEST" ],  // this field is needed to fit in same format as parameter search
        "IBU_list":              [ 70.0 ],

        "boilTime":              65,          // time to first addition, plus duration of longest hop steep time
        "wortVolume":            24.23,
        "preOrPostBoilVol":      "postBoilVol",
        "OG":                    1.0657,

        "pH":                    5.35,
        "preOrPostBoilpH":       "preBoilpH",
        "whirlpoolTime":         2,

        //                AA%   BA%   form    freshF  %loss  weight(g),  steep time
        "add1":        [ 13.5,  3.95, "cones", 0.88,   25.0,     42.52,     60 ], // citra
        "add2":        [  9.3,  6.50, "cones", 0.94,   14.0,     56.70,     45 ], // amarillo
        "add3":        [ 12.6,  4.50, "cones", 0.88,   25.0,     56.70,     30 ], // simcoe
        "add4":        [  9.3,  6.50, "cones", 0.94,   14.0,     28.35,      0 ], // amarillo
        "add5":        [ 12.6,  4.50, "cones", 0.88,   25.0,     28.35,      0 ], // simcoe
        "add6":        [ 13.5,  3.95, "cones", 0.88,   25.0,     28.35,      0 ], // citra
        "add7":        [ 10.3,  3.50, "cones", 0.93,   15.0,     42.52,      0 ], // mosaic

        "add8":        [ 12.6,  4.50, "cones", 0.88,   25.0,     56.70,      4,  1.0, "dryHop" ], // simcoe
        "add9":        [ 13.5,  3.95, "cones", 0.88,   25.0,     28.35,      4,  1.0, "dryHop" ], // citra
        "add10":       [ 10.3,  3.50, "cones", 0.93,   15.0,     56.70,      4,  1.0, "dryHop" ], // mosaic

        "kettleDiameter":        37.148,
        "kettleOpening":         37.148,
        "evaporationRate":       4.66,
        "immersionDecayFactor":  0.4283,
        "forcedDecayType":       "forcedDecayImmersion",
        "wortClarity":           1.00,
        "beerAge_days":          18,
        "fermentorVolume":       20.82,
    },



    "Taste Experiment #1": {
        "conditions":            [ "A",   "B",   "C",   "D"   ],
        "IBU_list":              [ 20.2,  21.4,  21.2,  18.7  ],
        "weight1_list":          [ 10.30,  7.77,  5.14,  2.71 ],
        "weight2_list":          [ 21.70, 21.70, 21.70, 21.70 ],
        "steepTime1_list":       [ 40,    40,    40,    40 ],
        "steepTime2_list":       [ 1,      5,    10,    15 ],
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
        //                AA%   BA%   form    freshF  %loss  weight(g),  steep time
        "add1":        [  9.56, 5.0, "cones", 0.98,   14.0,     0.0,      0 ],
        "add2":        [  9.56, 5.0, "cones", 0.98,   14.0,     0.0,      0 ],


        "kettleDiameter":        30.074,  // 5G aluminum kettle
        "kettleOpening":         30.074,
        "evaporationRate":       0.029,   // median from all four experiments
        "immersionDecayFactor":  0.25,    // average decay function exponential, from 0 to 5 min post boil
        "forcedDecayType":       "forcedDecayImmersion",
    },

    "Taste Experiment #2": {
        "conditions":            [ "A",   "B",   "C",   "D"   ],
        "IBU_list":              [ 23.6,  24.5,  23.0,  22.8  ],
        "weight1_list":          [ 10.75,  8.20,  5.25,  0.0  ],
        "weight2_list":          [ 24.10, 24.10, 24.10, 24.10 ],
        "steepTime1_list":       [ 40,    40,    40,    40 ],
        "steepTime2_list":       [ 1,      5,    10,    20 ],
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
        //                AA%   BA%   form    freshF  %loss  weight(g),  steep time
        "add1":        [  9.56, 5.0, "cones", 0.98,   14.0,     0.0,      0 ],
        "add2":        [  9.56, 5.0, "cones", 0.98,   14.0,     0.0,      0 ],

        "kettleDiameter":        30.074,  // 5G aluminum kettle
        "kettleOpening":         30.074,
        "evaporationRate":       0.046,   // median from all four experiments
        "immersionDecayFactor":  0.25,    // average decay function exponential, from first experiment
        "forcedDecayType":       "forcedDecayImmersion",
    },

    "More Test Data": {
        "conditions":            [ "A",    "B",    "C",    "D"   ],
        "IBU_list":              [ 46.8,   50.5,   61.8,   68.5  ],
        "time_list":             [ 30.0,   36.0,   51.0,   60.0  ],
        "volume_list":           [ 12.403, 12.308, 12.072, 11.930 ],
        "OG_list":               [ 1.0329, 1.0331, 1.0338, 1.0342 ],
        "timeToFirstAddition":   5,
        "evaporationRate":       0.9434,
        "whirlpoolTime":         0,
        "immersionDecayFactor":  2.5,
        "forcedDecayType":       "forcedDecayImmersion",
        "pH":                    5.75,
        "preOrPostBoilpH":       "preBoilpH",
        "preBoilSG":             1.0315,
        "krausen":               "medium krausen deposits on FV (default)",
        "beerAge_days":          7,
        "kettleDiameter":        27.622,  // 4G SS kettle
        "kettleOpening":         27.622,

        // 2021 Amarillo hops, package AA 9.9%. Unopened, stored for 4.5 months at -15'F with SF 0.75 -> FF 1.0
        //                AA%   BA%   form    freshF  %loss  weight(g),  steep time
        "add1":        [  8.9,   6.5, "cones", 1.00,   14.0,    61.86,      60 ],
    },


};

