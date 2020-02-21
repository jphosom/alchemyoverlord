// ==========================================================================================================================
//
// This file contains data for the experiments used to tune parameters
// of the SMPH model of IBUs.
// All data, except the 'Tinseth' and 'Peacock' experiments, were collected
// by John-Paul Hosom from June 9, 2015 to the present.
// Note: Util. Exp. #2 didn't use any hops, to estimate the contribution of malt polyphenols to IBUs
//

var evaluateTrainingExperiments = [ ];  // null list means evaluate on all
// var evaluateTrainingExperiments = [ "Tinseth" ];
// var evaluateTrainingExperiments = [ "Peacock" ];
// var evaluateTrainingExperiments = [ "mIBU Exp. #2a", "mIBU Exp. #2b" ];
// var evaluateTrainingExperiments = [ "mIBU Exp. #1", "mIBU Exp. #2a", "mIBU Exp. #2b", "mIBU Exp. #3" ];
// var evaluateTrainingExperiments = [ "mIBU Exp. #1" ];
// var evaluateTrainingExperiments = [ "Util. Exp. #1", "Util. Exp. #3", "Util. Exp. #4" ];
// var evaluateTrainingExperiments = [ "Sol. Exp. #1", "Sol. Exp. #2", "Sol. Exp. #3", "Sol. Exp. #4" ];
// var evaluateTrainingExperiments = [ "ConPel Exp. #1", "ConPel Exp. #2", "ConPel Exp. #3", "ConPel Exp. #4" ];
// var evaluateTrainingExperiments = [ "ConPel Exp. #3" ];
// var evaluateTrainingExperiments = [ "Sol. pH 5.2" ];
// var evaluateTrainingExperiments = [ "Hop Concentration Exp. #1" ];
// var evaluateTrainingExperiments = [ "pH Exp. #1" ];
// var evaluateTrainingExperiments = [ "CaCl2 Exp. #1" ];
// var evaluateTrainingExperiments = [ "OG Exp. #1", "OG Exp. #2" ];
// var evaluateTrainingExperiments = [ "IPA, Jun. 2018", "IPA, Jul. 2019" ];
// var evaluateTrainingExperiments = [ "Teamaker #1" ];

// units *must* be all metric

var trainingData = {
    "Tinseth": {
        "conditions":  [ "t=10","t=20","t=30","t=40","t=50","t=60","t=70","t=80","t=90" ],
        // time_list is the list of times after the *first* addition of hops at which
        // samples are taken.
        "time_list":   [ 10,     20,    30,    40,    50,    60,    70,    80,    90 ],
        "volume_list": [ 281.6,  281.6, 281.6, 281.6, 281.6, 281.6, 281.6, 281.6, 281.6 ],
        "OG_list":     [ 1.055,  1.055, 1.055, 1.055, 1.055, 1.055, 1.055, 1.055, 1.055 ],

        //                AA%   BA%   form    freshF  %loss  weight(g),  boil time
        "add1":        [ 8.65,  6.18, "cones", 0.95,   38.2,  283.495,   90 ],

        "timeToFirstAddition": 0,
        // assume 2-barrel pilot-brewery volume
        // www.beersmith.com/forum/index.php?topic=8073.0
        //    batch size 16 bbl has boil volume 19.00 bbl and evap rate 5.3%=1bbl/hr
        // https://brewmagic.com/products/brew-magic-2-barrel-unitank/
        //    working volume 61.8G total volume 83.2G
        //    batchSize = 62G ... boilVolume = batchSize*1.2, evapRate = boilVolume * 0.05
        //    assume 15 minutes of evaporation to reach boil; vol at start of boil = 73.47
        //    postBoilVolume = boilVolume - (evapRate * 1.5), assuming 90 minute boil
        "kettleDiameter":        70,    // brew-magic 2bbl unitank inner diam. SABCO
        "kettleOpening":         35,    // brew-magic 2bbl unitank top manway SABCO
        "evaporationRate":       14.081725,  // 234.7*1.2*0.05
        "preOrPostBoilVol":      "preBoilVol",  // will account for evaporation rate
        "immersionDecayFactor":  0.724,
        "forcedDecayType":       "forcedDecayImmersion", // each sample uses immersion chiller
        "beerAge_days":          7,

        "search": [
            {
                "param":    "AA1",
                "default":  8.65,
                "method":   "value",
                "low":      8.65,
                "high":     8.65,
                "inc":      0.50,
            },

            {
                "param":    "weight1",
                "default":  200.0,
                "method":   "relative",
                "low":      0.40,
                "high":     1.20,
                "inc":      0.10,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.95,
                "method":   "offset",
                "low":      0.0,
                "high":     .05,
                "inc":      0.05,
            }
        ]
    },

    "Peacock": {
        "conditions":  [ "-20&deg;F", "25&deg;F", "40&deg;F", "70&deg;F" ],
        "IBU_list":    [ 13.5,        12.0,       13.5,       11.0 ],
        "IAA_list":    [ 19.8,        18.1,       14.4,       2.9  ],
        "time_list":   [ 90,          90,         90,         90 ],
        "volume_list": [ 281.6,       281.6,      281.6,      281.6 ],
        "OG_list":     [ 1.035,       1.035,      1.035,      1.035 ],
        "fresh_list":  [ 0.83,        0.73,       0.54,       0.07 ],

        // Willamette hops
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 3.90,  2.89, "cones", 0.83,   37.43,  425.0,     90 ],

        "timeToFirstAddition": 0,
        // assume 2-barrel pilot-brewery volume
        // www.beersmith.com/forum/index.php?topic=8073.0
        //    batch size 16 bbl has boil volume 19.00 bbl and evap rate 5.3%=1bbl/hr
        // https://brewmagic.com/products/brew-magic-2-barrel-unitank/
        //    working volume 61.8G total volume 83.2G
        //    batchSize = 62G ... boilVolume = batchSize*1.2, evapRate = boilVolume * 0.05
        //    assume 15 minutes of evaporation to reach boil; vol at start of boil = 73.47
        //    postBoilVolume = boilVolume - (evapRate * 1.5), assuming 90 minute boil
        "kettleDiameter":        70,    // brew-magic 2bbl unitank inner diam. SABCO
        "kettleOpening":         35,    // brew-magic 2bbl unitank top manway SABCO
        "evaporationRate":       14.081725,  // 234.7*1.2*0.05
        "preOrPostBoilVol":      "preBoilVol",  // will account for evaporation rate
        "tempExpParamA":         27.66,   // 'C = 'K
        "tempExpParamB":         0.00811,
        "tempExpParamC":         71.658,  // 344.808'K
        "tempDecayType":         "tempDecayExponential",
        "whirlpoolTime":         20,
        "counterflowRate":       12.0,  // liters/min; ~20 minutes total for xfer
        "forcedDecayType":       "forcedDecayCounterflow",
        "beerAge_days":          7,

        // search parameters:  (could also search for whirlpoolTime, OG, boil time, etc)
        "search": [
            {
                "param":    "weight1",
                "default":  425.0,
                "method":   "value",
                "low":      360.0,
                "high":     560.0,
                "inc":      20.0,
            }
        ]
    },

    "mIBU Exp. #1": {
        "conditions":           [ "A",     "B",     "C",     "D" ],
        "IBU_list":             [ 35.7,    34.3,    27.1,    22.0 ],      // from AL
        "time_list":            [ 60,      40,      20,      10 ],
        // pre-boil volume:     [ 7.987,   8.063,   8.139,   8.233 ],
        // pre-boil SG:         [ 1.042,   1.0425,  1.042,   1.042 ],     // from hydrometer
        "volume_list":          [ 5.394,   5.678,   5.300,   5.205 ],     // from recorded cooled post-boil volume
        // "volume_list":       [ 5.686,   5.908,   5.604,   5.489 ],     // from pre-boil volume * change in SG
        // "OG_list":           [ 1.059,   1.058,   1.061,   1.063 ],     // from hydrometer
        "OG_list":              [ 1.0593,  1.0589,  1.0628,  1.0637 ],    // from AL

        // Cascade hops, package rating 8.0%
        //                         AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":                 [ 8.00,  6.6,  "cones", 0.72,   50.0,  17.01,     60 ],

        "timeToFirstAddition":  0,
        "boilTime":             60.0,  // *all* conditions used a boil time of 60 min
        "evaporationRate":      2.711, // estimate from average of pre- and post-boil volumes
        "preOrPostBoilVol":     "postBoilVol",
        "whirlpoolTime":        0,
        "immersionDecayFactor": 0.44,
        "pH":                   "estimate",
        "preBoilSG":            1.042,
        // "krausen":              "medium krausen deposits on FV (default)",
        "krausen":              "mix krausen back in; no loss",  // guess; no actual record
        "beerAge_days":         77,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  8.0,  // package rating.  also, measured 6.25/0.72=8.70%; meas 7.25%/0.27=10.7%
                "method":   "value",
                "low":      7.0,
                "high":     10.0,
                "inc":      0.50,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.72,  // from HSI
                "method":   "value",
                "low":      0.60,
                "high":     1.00,
                "inc":      0.10,
            }
        ]
    },

    "mIBU Exp. #2a": {
        "conditions":           [ "A",     "B",     "C",     "D",     "E" ],
        "IBU_list":             [ 33.3,    28.9,    30.8,    25.5,    35.9 ], // from AL
        // "IBU_list":          [ 35.0,    30.0,    32.0,    29.0,    39.0 ], // from OBL
        "time_list":            [ 10,      0,       0,       0,       0 ],
        "postBoil_time_list":   [ 0,       10,      10,      10,      20 ],
        "postBoil_temp_list":   [ 100.0,   92.69,   88.38,   85.23,   88.67 ],
        // pre-boil volume:     [ 4.921,   4.921,   5.035,   5.035,   5.110 ],
        // pre-boil SG:         [ 1.062,   1.062,   1.062,   1.062,   1.062 ],   // from hydrometer
        "volume_list":          [ 4.542,   4.694,   4.164,   4.542,   4.164 ],   // recorded post-boil vol
        // "volume_list":       [ 4.694,   4.694,   4.840,   4.878,   4.837 ],   // from pre-boil volume * change in SG
        "OG_list":              [ 1.0663,  1.0650,  1.0650,  1.0645,  1.0663 ],  // from AL
        // "OG_list":           [ 1.0650,  1.0650,  1.0645,  1.0640,  1.0655 ],  // from hydrometer

        // Cascade hops, package rating 8.4%
        //                        AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":                 [ 8.40,  3.5, "cones", 0.68, 50.0,  45.36,     10 ],

        "timeToFirstAddition":  0,
        "evaporationRate":      1.00,   // guess from other experiments
        "preOrPostBoilVol":     "postBoilVol",
        "tempExpParamA":        0.0,   // instantly cool for post-boil hop stand
        "tempExpParamB":        0.0,   // instantly cool for post-boil hop stand
        "tempExpParamC":        20.0,  // cool below temp of lowest hop stand
        "tempDecayType":        "tempDecayExponential",
        "whirlpoolTime":        0,
        "immersionDecayFactor": 0.44,
        "pH":                   "estimate",
        "preBoilSG":            1.062,
        "krausen":              "medium krausen deposits on FV (default)",
        "beerAge_days":         42,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  8.40,  // package rating (measured later at 5.75%, so est. freshF at 0.68)
                "method":   "value",
                "low":      7.4,   // search within 1 percentage point
                "high":     9.4,   // search within 1 percentage point
                "inc":      0.50,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.68,  // from (measured AA) / (package AA)
                "method":   "value",
                "low":      0.50,
                "high":     0.95,
                "inc":      0.05,
            }
        ]
    },

    "mIBU Exp. #2b": {
        "conditions":           [ "F",     "G",     "H",     "I",     "J" ],
        "IBU_list":             [ 40.6,    23.6,    24.5,    23.1,    21.8 ],    // from AL
        // "IBU_list":          [ 41.0,    26.0,    25.0,    23.0,    21.0 ],    // from OBL
        "time_list":            [ 10,       0,       0,       0,       0 ],
        "postBoil_time_list":   [ 0,       10,      10,      10,      10 ],
        "postBoil_temp_list":   [ 100.0,   80.2,    74.59,   68.69,   63.13 ],
        // pre-boil volume:     [ 4.883,   4.921,   4.883,   4.921,   4.921 ],
        // pre-boil SG:         [ 1.0613,  1.0613,  1.0613,  1.0613,  1.0613 ],   // from hydrometer
        "volume_list":          [ 3.975,   4.542,   4.448,   4.542,   4.448 ],    // from recorded post-boil vol
        // "volume_list":       [ 4.542,   4.773,   4.789,   4.788,   4.788 ],    // from pre-boil vol * change in SG
        "OG_list":              [ 1.0650,  1.0632,  1.0632,  1.0628,  1.0628 ],   // AL
        // "OG_list":           [ 1.0659,  1.0632,  1.0625,  1.0630,  1.0630 ],   // from hydrometer

        // Cascade hops, package rating 7.9%
        //                         AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":                 [ 7.90,  6.32, "cones", 0.79,  50.0,  45.36,     10 ],

        "timeToFirstAddition":  0,
        "evaporationRate":      1.0,   // guess from other experiments
        "preOrPostBoilVol":     "postBoilVol",
        "tempExpParamA":        0.0,   // instantly cool for post-boil hop stand
        "tempExpParamB":        0.0,   // instantly cool for post-boil hop stand
        "tempExpParamC":        20.0,  // cool below temp of lowest hop stand
        "tempDecayType":        "tempDecayExponential",
        "whirlpoolTime":        0,
        "pH":                   "estimate",
        "preBoilSG":            1.0613,
        "immersionDecayFactor": 0.44,
        "krausen":              "medium krausen deposits on FV (default)",
        "beerAge_days":         42,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  7.90,  // package rating (measured later at 6.25%, so est. freshF at 0.79)
                "method":   "value",
                "low":      6.9,
                "high":     8.9,
                "inc":      0.50,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.79,  // from (measured AA) / (package AA)
                "method":   "value",
                "low":      0.60,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "mIBU Exp. #3": {
        "conditions":           [ "A",     "B",     "C",     "D",     "E" ],
        "IBU_list":             [ 46.4,    35.4,    26.1,    21.2,    16.1 ], // from AL
        // "IBU_list":          [ 49.0,    40.0,    25.0,    21.0,    15.0 ], // from OBL
        "time_list":            [ 60,      30,      15,      7.5,     0 ],
        // pre-boil volume:     [ 4.9210,  4.8264,  4.9210,  4.9210,  4.9210 ],
        // pre-boil SG:         [ 1.062,   1.062,   1.062,   1.062,   1.062 ],  // from hydrometer
        // "volume_list":       [ 3.331,   3.785,   4.353,   3.975,   4.164 ],  // from measured post-boil volume
        "volume_list":          [ 4.084,   4.337,   4.554,   4.422,   4.694 ],  // from pre-boil vol * change in SG
        "OG_list":              [ 1.0760,  1.0720,  1.0685,  1.0689,  1.0658 ], // from AL
        // "OG_list":           [ 1.0747,  1.0690,  1.0670,  1.0690,  1.0650 ], // hydrometer

        // Cascade hops, analyzed close to harvest at AA=6.64%, BA=5.38%
        //                        AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":                 [ 6.64,  5.38, "cones", 0.95,  50.0,  22.68,     60 ],

        "timeToFirstAddition":  0,
        "evaporationRate":      0.67,    // estimate from pre-boil vol to post-boil vol for 60+15min Cond A
        "preOrPostBoilVol":     "postBoilVol",
        "kettleDiameter":       30.0,  // 5G aluminum kettle
        "kettleOpening":        30.0,  // 5G aluminum kettle
        "tempDecayType":        "tempDecayExponential",
        "whirlpoolTime":        15,
        "immersionDecayFactor": 0.44,
        "pH":                   "estimate",
        "preBoilSG":            1.062,
        "krausen":              "medium krausen deposits on FV (default)",
        "beerAge_days":         57,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  6.64,  // analysis soon after harvest
                "method":   "value",
                "low":      5.6,
                "high":     7.6,
                "inc":      0.20,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.95,
                "method":   "value",
                "low":      0.95,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "Util. Exp. #1": {
        "conditions":           [ "A",     "B",     "C",     "D",     "E",     "F" ],
        "IBU_list":             [ 45.0,    34.0,    46.0,    37.0,    48.0,    36.0 ],
        "time_list":            [ 40,      20,      40,      20,      40,      20 ],
        // pre-boil volume:     [ 6.624,   6.624,   6.624,   6.624,   6.624,   6.624 ],
        // pre-boil SG:         [ 1.0514,  1.0514,  1.0514,  1.0514,  1.0514,  1.0514 ], // from hydrometer
        "volume_list":          [ 5.973,   6.080,   5.492,   5.870,   5.405,   5.771],   // from pre-boil vol * change in SG
        "OG_list":              [ 1.057,   1.056,   1.062,   1.058,   1.063,   1.059 ],  // from hydrometer

        // cascade package rating AA 8.1%  BA 7.6%
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 8.10,  7.60, "cones", 0.95,  50.0,   21.26,     40 ],

        "timeToFirstAddition":  10,      // wait 10 minutes after start of boil
        "evaporationRate":      0.833,   // estimate from comparing volumes between A/B, C/D, and E/F
        "preOrPostBoilVol":     "postBoilVol",
        "whirlpoolTime":        0,
        "immersionDecayFactor": 0.25,
        "pH":                   "estimate",
        "preBoilSG":            1.0514,
        "krausen":              "mix krausen back in; no loss",  // guess; no actual record
        "beerAge_days":         28,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  8.10,    // from package
                "method":   "value",
                "low":      7.1,
                "high":     9.1,
                "inc":      0.25,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.95,
                "method":   "value",
                "low":      0.90,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "Util. Exp. #3": {
        "conditions":           [ "A",     "B",     "C",     "D",     "E",     "F" ],
        "IBU_list":             [ 12.84,   23.64,   29.91,   36.25,   43.19,   49.20 ],  // week 5 estimates
        "time_list":            [ 12,      12,      12,      12,      12,      12 ],
        // pre-boil volume:     [ 6.624,   6.624,   6.624,   6.624,   6.624,   6.624 ],
        // pre-boil SG:         [ 1.051,   1.051,   1.051,   1.051,   1.051,   1.051 ],  // from hydrometer
        "volume_list":          [ 6.199,   6.142,   6.142,   6.256,   6.087,   6.087 ],  // from pre-boil vol * change in SG
        "OG_list":              [ 1.0545,  1.0550,  1.0550,  1.0540,  1.0555,  1.0555 ], // from hydrometer
        "weight_list":          [ 10.49,   20.98,   31.47,   41.96,   52.45,   62.94 ],

        // cascade package rating AA=8.10%, BA=7.60%.  Measured AA=7.7%, BA=6.8%, HSI 0.231
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 8.10,  7.60, "cones", 1.00,  50.0,  0.0,     12 ],

        "timeToFirstAddition":  7,      // wait 7 minutes after start of boil
        "evaporationRate":      0.833, // estimate from Util Exp #1
        "whirlpoolTime":        0,
        "immersionDecayFactor": 0.22,
        "pH":                   "estimate",
        "preBoilSG":            1.051,
        "krausen":              "mix krausen back in; no loss",  // guess; no actual record
        "beerAge_days":         35,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  8.10,
                "method":   "value",
                "low":      7.1,
                "high":     9.1,
                "inc":      0.25,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.95,
                "method":   "value",
                "low":      0.95,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "Util. Exp. #4": {
        "conditions":           [ "A",     "B",     "C",     "D",     "E" ],
        "IBU_list":             [ 17.0,    43.0,    31.0,    56.0,    25.0 ],    // week 5
        "time_list":            [ 26.9,    26.9,    12.0,    19.0,    0.0 ],
        // pre-boil volume:     [ 6.624,   6.624,   6.624,   6.624,   6.624 ],
        // pre-boil SG:         [ 1.051,   1.051,   1.051,   1.051,   1.051 ],   // from hydrometer
        "volume_list":          [ 6.011,   6.011,   6.142,   6.011,   6.187 ],   // from pre-boil vol * change in SG
        "OG_list":              [ 1.0562,  1.05625, 1.0550,  1.0562,  1.0546 ],  // from hydrometer
        "weight_list":          [ 10.49,   31.47,   31.47,   62.94,   62.94 ],
        "postBoil_time_list":   [ 0,       0,       0,       0,       19.0 ],
        "postBoil_temp_list":   [ 0.0,     0.0,     0.0,     0.0,     63.61 ],

        // cascade package rating AA=8.10%, BA=7.60%.  Measured AA=7.7%, BA=6.8%, HSI 0.231
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 8.10,  7.60, "cones", 0.94,  50.0,  0.0,     26.9 ],

        "timeToFirstAddition":  7,      // wait 7 minutes after start of boil
        "kettleDiameter":       30.0,  // 5G enamel
        "kettleOpening":        30.0,  // 5G enamel
        "evaporationRate":      0.833, // estimate from Util Exp #1
        "preOrPostBoilVol":     "postBoilVol",
        "tempExpParamA":        0.0,   // instantly cool for post-boil hop stand
        "tempExpParamB":        0.0,   // instantly cool for post-boil hop stand
        "tempExpParamC":        20.0,  // cool below temp of lowest hop stand
        "tempDecayType":        "tempDecayExponential",
        "immersionDecayFactor": 0.87,  // JPH : CHECK THIS
        "forcedDecayType":      "forcedDecayImmersion",
        "pH":                   "estimate",
        "preBoilSG":            1.051,
        "krausen":              "mix krausen back in; no loss",  // guess; no actual record
        "beerAge_days":         35,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  8.10,
                "method":   "value",
                "low":      7.1,
                "high":     9.1,
                "inc":      0.25,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.95,
                "method":   "value",
                "low":      0.95,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "Sol. Exp. #1": {
        "conditions":           [ "t=10",  "t=20",  "t=30",  "t=40",  "t=50",
                                  "t=60",  "t=70",  "t=80",  "t=90",  "t=100"    ],
        "IBU_list":             [ 8.0,     11.0,    14.5,    16.5,    19.5,
                                  22.5,    28.0,    32.5,    33.5,    37.0    ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    50.0,
                                  60.0,    70.0,    80.0,    90.0,    100.0    ],
        // pre-boil volume:     31.987 liters
        // pre-boil SG:         1.0467
        // SG at time = 0:      1.0482 (estimate from Sol Exp #3)
        // SG at final sample:  1.0507
        "volume_list":          [ 30.832,  30.673,  30.518,  30.363,  30.208,
                                  30.056,  29.905,  29.757,  29.609,  29.461 ],
        "OG_list":              [ 1.0485,  1.0487,  1.0490,  1.0492,  1.0495,
                                  1.0497,  1.0499,  1.0502,  1.0504,  1.0507    ],

        // citra (both additions) package rating AA 13.3%  BA 3.9%
        // default freshness factor 0.58 is rough guess based on IBU results
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 13.30,  3.90, "cones", 0.58,  25.0,  32.60,   100 ],
        "add2":        [ 13.30,  3.90, "cones", 0.58,  25.0,  32.60,    45 ],

        "timeToFirstAddition":  5,      // wait 5 minutes after start of boil
        "evaporationRate":      0.914, // (V10=30.832 - V100=29.461) / (90min/60min)
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   "estimate",
        "preBoilSG":            1.0467,
        "krausen":              "medium krausen deposits on FV (default)",   // day before wipe down inside of container
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  13.30,
                "method":   "value",
                "low":      12.8,
                "high":     13.8,
                "inc":      0.5,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.58,
                "method":   "value",
                "low":      0.60,
                "high":     0.70,
                "inc":      0.05,
            },

            {
                "param":    "AA2",
                "default":  13.30,
                "method":   "value",
                "low":      12.8,
                "high":     13.8,
                "inc":      0.5,
            },

            {
                "param":    "freshnessFactor2",
                "default":  0.58,
                "method":   "value",
                "low":      0.60,
                "high":     0.70,
                "inc":      0.05,
            }
        ]
    },

    "Sol. Exp. #2": {
        "conditions":           [ "t=10",  "t=20",  "t=30",  "t=40",  "t=50",
                                  "t=60",  "t=70",  "t=80",  "t=90",  "t=100"    ],
        "IBU_list":             [ 19.5,    27.5,    32.5,    38.0,    42.5,
                                  48.0,    47.5,    50.0,    54.0,    52.5    ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    50.0,
                                  60.0,    70.0,    80.0,    90.0,    103.0    ],
        // pre-boil volume:     31.987 liters
        // pre-boil SG:         1.0475
        // SG at time = 0:      1.0490 (estimate from Sol Exp #4)
        // SG at final sample:  1.0519
        "volume_list":          [ 30.824,  30.647,  30.465,  30.291,  30.117,
                                  29.942,  29.772,  29.606,  29.439,  29.276 ],
        "OG_list":              [ 1.0493,  1.0496,  1.0499,  1.0502,  1.0505,
                                  1.0507,  1.0510,  1.0513,  1.0516,  1.0519    ],

        // citra package rating AA 13.3%  BA 3.9%
        // default freshness factor 0.58 is rough guess based on IBU results
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 13.30,  3.90, "cones", 0.58,  25.0,  82.865,    103 ],

        "timeToFirstAddition":  5,      // wait 5 minutes after start of boil
        "evaporationRate":      0.9987, // (V10=30.824 - V100=29.276) / (93min/60min)
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   "estimate",
        "preBoilSG":            1.0475,
        "krausen":              "medium krausen deposits on FV (default)",   // day before wipe down inside of container
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  13.30,
                "method":   "value",
                "low":      12.8,
                "high":     13.8,
                "inc":      0.25,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.58,
                "method":   "value",
                "low":      0.60,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "Sol. Exp. #3": {
        "conditions":           [ "t=10",  "t=20",  "t=30",  "t=40",  "t=50",
                                  "t=60",  "t=70",  "t=80" ],
        "IBU_list":             [ 34.0,    43.0,    53.0,    64.0,    68.0,
                                  75.5,    81.0,    83.0 ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    50.0,
                                  60.0,    70.0,    80.0 ],
        // pre-boil volume:     31.911 liters
        // pre-boil SG:         1.0468
        // SG at time = 0:      1.0482
        // SG at time = 80:     1.0516
        "volume_list":          [ 30.711,  30.442,  30.177,  29.916,  29.662,
                                  29.409,  29.163,  28.920 ],
        "OG_list":              [ 1.0486,  1.0491,  1.0495,  1.0499,  1.0503,
                                  1.0508,  1.0512,  1.0516 ],

        // citra package rating AA 13.3%  BA 3.9%
        // default freshness factor 0.58 is rough guess based on IBU results
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 13.30,  3.90, "cones", 0.58,  25.0,  177.1845,   80 ],

        "timeToFirstAddition":  10,     // wait 10 minutes after start of boil
        "evaporationRate":      1.535, // (V10=30.711 - V80=28.920) / (70min/60min)
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   "estimate",
        "preBoilSG":            1.0468,
        "krausen":              "medium krausen deposits on FV (default)",   // day before wipe down inside of container
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  13.30,
                "method":   "value",
                "low":      12.8,
                "high":     13.8,
                "inc":      0.25,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.58,
                "method":   "value",
                "low":      0.60,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "Sol. Exp. #4": {
        "conditions":           [ "t=10",  "t=20",  "t=30",  "t=40",  "t=50",
                                  "t=60",  "t=70",  "t=80",  "t=90",  "t=100" ],
        "IBU_list":             [ 20.5,    30.0,    39.0,    48.5,    51.5,
                                  59.0,    62.0,    66.5,    69.5,    72.5 ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    50.0,
                                  60.0,    70.0,    80.0,    90.0,    100.0 ],
        // pre-boil volume:     32.441 liters
        // pre-boil SG:         1.0465
        // SG at time = 0:      1.0475
        // SG at time = 100:    1.0521
        "volume_list":          [ 31.453,  31.154,  30.862,  30.575,  30.291,
                                  30.014,  29.742,  29.473,  29.212,  28.955 ],
        "OG_list":              [ 1.0480,  1.0484,  1.0489,  1.0493,  1.0498,
                                  1.0503,  1.0507,  1.0512,  1.0516,  1.0521 ],

        // citra package rating AA 13.3%  BA 3.9%
        // default freshness factor 0.58 is rough guess based on IBU results
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 13.30,  3.90, "cones", 0.58,  25.0,  120.4855,  100 ],

        "timeToFirstAddition":  5,      // wait 5 minutes after start of boil
        "evaporationRate":      1.67, // (V10=31.453 - V100=28.955) / (90min/60min)
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   "estimate",
        "preBoilSG":            1.0465,
        "krausen":              "medium krausen deposits on FV (default)",   // day before wipe down inside of container
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  13.30,
                "method":   "value",
                "low":      12.8,
                "high":     13.8,
                "inc":      0.25,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.58,
                "method":   "value",
                "low":      0.60,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "ConPel Exp. #1": {
        // volume and OG taken from ConPel Exp. #4, since all experiments should be identical in this regard
        "conditions":           [ "t=10",  "t=20",  "t=30",  "t=40",  "t=50",
                                  "t=60",  "t=70",  "t=80",  "t=90" ],
        "IBU_list":             [ 14.0,    18.8,    24.2,    26.6,    31.6,
                                  32.8,    36.3,    37.9,    41.6 ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    50.0,
                                  60.0,    70.0,    80.0,    90.0 ],
        "volume_list":          [ 31.22,   31.08,   30.95,   30.81,   30.68,
                                  30.55,   30.42,   30.28, 30.16 ],
        "OG_list":              [ 1.0388,  1.0390,  1.0391,  1.0393,  1.0395,
                                  1.03965, 1.0398,  1.0400, 1.0402 ],

        // citra bought soon after harvest and stored in freezer; package rating AA=14.30%
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 14.30,  3.6, "cones", 0.95,  25.0,  37.8098,   90 ],

        "timeToFirstAddition":  8,      // wait 8 minutes after start of boil
        "evaporationRate":      0.795, // (V10=31.22 - V90=30.16) / (80min/60min)
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   "estimate",
        "preBoilSG":            1.0381,
        "krausen":              "mix krausen back in; no loss",   // swirling of containers during fermentation
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  14.30,
                "method":   "value",
                "low":      13.8,
                "high":     14.8,
                "inc":      0.10,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.95,
                "method":   "value",
                "low":      0.90,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "ConPel Exp. #2": {
        // volume and OG taken from ConPel Exp. #4, since all experiments should be identical in this regard
        "conditions":           [ "t=10",  "t=20",  "t=30",  "t=40",  "t=50", "t=60" ],
        "IBU_list":             [ 13.9,    17.5,    22.3,    25.0,    27.3,   30.3 ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    50.0,   60.0 ],
        "volume_list":          [ 31.22,   31.08,   30.95,   30.81,   30.68,  30.55 ],
        "OG_list":              [ 1.0388,  1.0390,  1.0391,  1.0393,  1.0395, 1.03965 ],

        // willamette package rating AA 5.0%
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 5.00,  3.10, "cones", 0.95,  37.43,  105.573,   60 ],

        "timeToFirstAddition":  4,      // wait 4 minutes after start of boil
        "evaporationRate":      0.804, // (V10=31.22 - V60=30.55) / (50min/60min)
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   "estimate",
        "preBoilSG":            1.0381,
        "krausen":              "medium krausen deposits on FV (default)",   // NO swirling of containers during fermentation
        "beerAge_days":         13,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  5.0,
                "method":   "value",
                "low":      4.7,
                "high":     5.3,
                "inc":      0.10,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.95,
                "method":   "value",
                "low":      0.90,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "ConPel Exp. #3": {
        // volume and OG taken from ConPel Exp. #4, since all experiments should be identical in this regard
        "conditions":           [ "t=10",  "t=20",  "t=30",  "t=40",  "t=50",  "t=60",  "t=70",  "t=80" ],
        "IBU_list":             [ 14.8,    19.1,    23.7,    26.7,    30.4,    35.1,    34.8,    40.1 ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    50.0,    60.0,    70.0,    80.0 ],
        "volume_list":          [ 31.22,   31.08,   30.95,   30.81,   30.68,   30.55,   30.42,   30.28 ],
        "OG_list":              [ 1.0388,  1.0390,  1.0391,  1.0393,  1.0395,  1.03965, 1.0398,  1.0400 ],

        // willamette package rating AA 5.0%
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 5.00,  3.10, "cones", 0.95,  37.43,  105.573,   80 ],

        "timeToFirstAddition":  5,      // wait 5 minutes after start of boil
        "evaporationRate":      0.8057, // (V10=31.22 - V80=30.28) / (70min/60min)
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   "estimate",
        "preBoilSG":            1.0381,
        "krausen":              "mix krausen back in; no loss",   // swirling of containers during fermentation
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  5.0,
                "method":   "value",
                "low":      4.7,
                "high":     5.3,
                "inc":      0.10,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.95,
                "method":   "value",
                "low":      0.90,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "ConPel Exp. #4": {
        "conditions":           [ "t=10",  "t=20",  "t=30",  "t=40",  "t=50",  "t=60",  "t=70",  "t=80" ],
        "IBU_list":             [ 14.2,    19.7,    25.1,    28.6,    31.7,    35.9,    39.6,    43.3 ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    50.0,    60.0,    70.0,    80.0 ],
        "volume_list":          [ 31.22,   31.08,   30.95,   30.81,   30.68,   30.55,   30.42,   30.28 ],
        "OG_list":              [ 1.0388,  1.0390,  1.0391,  1.0393,  1.0395,  1.03965, 1.0398,  1.0400 ],

        // comet package rating AA 10.0%; analysis = AA=10.80%, BA=3.92%, HSI=0.25
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 10.00,  3.92, "cones", 1.0,  37.43,  53.312,   80 ],

        "timeToFirstAddition":  6,      // wait 6 minutes after start of boil
        "evaporationRate":      0.8057, // (V10=31.22 - V80=30.28) / (70min/60min)
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   "estimate",
        "preBoilSG":            1.0381,  // new hydrometer
        "krausen":              "mix krausen back in; no loss",   // swirling of containers during fermentation
        "beerAge_days":         8,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  10.0,
                "method":   "value",
                "low":      9.4,
                "high":     10.4,
                "inc":      0.10,
            },

            {
                "param":    "freshnessFactor1",
                "default":  1.00,
                "method":   "value",
                "low":      0.90,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "ConPel Exp. #5": {
        "conditions":           [ "t=10",  "t=20",  "t=30",  "t=40",  "t=50",  "t=60" ],
        "IBU_list":             [ 16.4,    21.2,    26.6,    31.3,    35.2,    39.0 ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    50.0,    60.0 ],
        "volume_list":          [ 30.15,   29.74,   29.34,   28.95,   28.57,   28.21 ],
        "OG_list":              [ 1.0378,  1.0383,  1.0388,  1.0394,  1.0399,  1.0404 ],

        // comet package rating AA 9.9%, measured 9.70% therefore loss factor 0.98, beta acids = 3.17/0.98
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [  9.90,  3.23, "cones", 0.98,  50.0,  54.96,     60 ],

        "timeToFirstAddition":  6,      // wait 6 minutes after start of boil
        "evaporationRate":      1.907,  // (V0=30.567 - V60=28.66) / 1.0hr
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   "estimate",
        "preBoilSG":            1.0375,  // new hydrometer
        "krausen":              "mix krausen back in; no loss",   // swirling of containers during fermentation
        "beerAge_days":         8,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  9.80,
                "method":   "value",
                "low":      9.4,
                "high":     10.4,
                "inc":      0.10,
            },

            {
                "param":    "freshnessFactor1",
                "default":  1.00,
                "method":   "value",
                "low":      0.90,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "Sol. pH 5.2": {
        "conditions":           [ "A10",   "A20",   "B10",   "B20",   "C10",   "C20",   "D10",   "D20",   "E10",   "E20" ],
        "IBU_list":             [  5.6,     8.4,    11.7,    16.3,    13.6,    19.0,    19.3,    27.4,    25.6,    36.3 ],
        "time_list":            [ 10.0,    20.0,    10.0,    20.0,    10.0,    20.0,    10.0,    20.0,    10.0,    20.0 ],
        "volume_list":          [ 5.678,   5.678,   5.685,   5.448,   5.685,   5.448,   5.678,   5.674,   5.678,   5.678 ],
        "weight_list":          [ 4.0270,  4.0270,  8.054,   8.054,   12.0811, 12.0811, 20.1351, 20.1351, 32.2162, 32.2162 ],
        "OG_list":              [ 1.0388,  1.0388,  1.0380,  1.0396,  1.0380,  1.0396,  1.0380,  1.0388,  1.0396,  1.0396 ],

        // citra bought soon after harvest and stored in freezer
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 14.30,  3.5, "cones", 0.95,  25.0,  0.0,   20 ],

        "preOrPostBoilVol":     "postBoilVol",
        "timeToFirstAddition":  0,      // wait 0 minutes after start of boil
        "evaporationRate":      0.714, // avg loss 0.119 liters in 10 minutes * (60min/10min)
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   5.19,
        "krausen":              "medium krausen deposits on FV (default)",   // NO swirling of containers during fermentation (??)
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  14.30,
                "method":   "value",
                "low":      14.3,
                "high":     14.3,
                "inc":      0.10,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.95,
                "method":   "value",
                "low":      0.90,
                "high":     1.00,
                "inc":      0.05,
            }
        ]
    },

    "Hop Concentration Exp. #1": {
        "conditions":           [ "A10",   "A20",   "A30",   "B10",   "B20",   "B30",   "C10",   "C20",   "C30",
                                  "D10",   "D20",   "D30",   "E10",   "E20",   "E30" ],
        "IBU_list":             [ 13.3,    19.3,    24.5,    13.2,    19.7,    25.2,    13.7,    20.1,    24.8,
                                  15.6,    22.9,    27.6,    16.6,    22.3,    28.7 ],
        "time_list":            [ 10.0,    20.0,    30.0,    10.0,    20.0,    30.0,    10.0,    20.0,    30.0,
                                  10.0,    20.0,    30.0,    10.0,    20.0,    30.0 ],
        "volume_list":          [ 7.571,   7.571,   7.571,   7.571,   7.571,   7.571,   7.571,   7.571,   7.571,
                                  7.571,   7.571,   7.571,   7.571,   7.571,   7.571 ],
        "weight1_list":         [ 9.064,   9.064,   9.064,   6.798,   6.798,   6.798,   4.523,   4.523,   4.523,
                                  2.266,   2.266,   2.266,   0.000,   0.000,   0.000 ],
        "weight2_list":         [ 0.000,   0.000,   0.000,   6.435,   6.435,   6.435,   12.871,  12.871,  12.871,
                                  19.306,  19.306,  19.306,  25.741,  25.741,  25.741 ],
        "OG_list":              [ 1.0425,  1.0425,  1.0425,  1.0425,  1.0425,  1.0425,  1.0425,  1.0425,  1.0425,
                                  1.0425,  1.0425,  1.0425,  1.0425,  1.0425,  1.0425 ],

        // add1: citra hops AA 14.3%
        // add2: willamette hops AA 5.0%
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 14.30,  3.5, "cones", 0.95,  25.0,  0.0,   30 ],
        "add2":        [  5.00,  3.1, "cones", 0.95,  37.43, 0.0,   30 ],

        "timeToFirstAddition":  0,      // wait 0 minutes after start of boil
        "evaporationRate":      0.0257, // (V10=31.80 - V80=31.77) / (70min/60min)
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   "estimate",
        "preBoilSG":            1.0405,
        "krausen":              "mix krausen back in; no loss",   // swirling of containers during fermentation Mar. 25-29
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  14.30,
                "method":   "value",
                "low":      14.3,
                "high":     14.3,
                "inc":      0.25,
            },

            {
                "param":    "AA2",
                "default":  5.00,
                "method":   "value",
                "low":      5.0,
                "high":     5.0,
                "inc":      0.25,
            }

        ]
    },

    "pH Exp. #1": {
        "conditions":           [ "5.65@10", "5.65@20", "5.65@30", "5.65@40", "5.50@10", "5.50@20", "5.50@30", "5.50@40",
                                  "5.35@10", "5.35@20", "5.35@30", "5.35@40", "5.20@10", "5.20@20", "5.20@30", "5.20@40" ],
        "IBU_list":             [ 13.1,      17.5,      22.0,      24.6,      12.1,      17.0,      20.6,      24.3,
                                  11.6,      15.5,      19.5,      23.0,      10.7,      14.2,      17.8,      21.6 ],
        "time_list":            [ 10.0,      20.0,      30.0,      40.0,      10.0,      20.0,      30.0,      40.0,
                                  10.0,      20.0,      30.0,      40.0,      10.0,      20.0,      30.0,      40.0    ],
        "volume_list":          [ 16.130,    15.962,    15.797,    15.635,    16.130,    15.962,    15.797,    15.635,
                                  16.130,    15.962,    15.797,    15.635,    16.130,    15.962,    15.797,    15.635    ],
        "OG_list":              [ 1.0382,    1.0385,    1.0388,    1.0391,    1.0382,    1.0385,    1.0388,    1.0391,
                                  1.0382,    1.0385,    1.0388,    1.0391,    1.0382,    1.0385,    1.0388,    1.0391    ],
        "pH_list":              [ 5.70,      5.685,     5.67,      5.65,      5.55,      5.53,      5.52,      5.50,
                                  5.39,      5.38,      5.36,      5.35,      5.27,      5.25,      5.24,      5.22 ],

        // citra bought soon after harvest and stored in freezer
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 14.30,  3.5, "cones", 0.965,  25.0,  18.285,   40 ],

        "timeToFirstAddition":  10,     // wait 10 minutes after start of boil
        "evaporationRate":      0.99, // (V10=16.130 - V40=15.635) / (30min/60min)
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "krausen":              "mix krausen back in; no loss",   // swirling of containers during fermentation
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  14.30,
                "method":   "value",
                "low":      14.3,
                "high":     14.3,
                "inc":      0.10,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.95,
                "method":   "value",
                "low":      0.90,
                "high":     1.00,
                "inc":      0.02,
            }
        ]
    },

    "CaCl2 Exp. #1": {
        "conditions":           [ "A10",   "A20",   "A30",   "A40",   "B10",   "B20",   "B30",   "B40",
                                  "C10",   "C20",   "C30",   "C40",   "D10",   "D20",   "D30",   "D40" ],
        "IBU_list":             [ 12.6,    17.3,    21.9,    28.0,    13.6,    18.4,    23.7,    28.1,
                                  13.0,    18.6,    22.6,    27.7,    14.5,    20.2,    24.0,    28.6 ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    10.0,    20.0,    30.0,    40.0,
                                  10.0,    20.0,    30.0,    40.0,    10.0,    20.0,    30.0,    40.0 ],
        "volume_list":          [ 15.1416, 14.914,  14.693,  14.479, 15.1416, 14.914,  14.693,  14.479,
                                  15.1416, 14.914,  14.693,  14.479, 15.1416, 14.914,  14.693,  14.479 ],
        "OG_list":              [ 1.03825, 1.0388,  1.0394,  1.0400,  1.03825, 1.0388,  1.0394,  1.0400,
                                  1.03825, 1.0388,  1.0394,  1.0400,  1.03825, 1.0388,  1.0394,  1.0400 ],

        // citra bought soon after harvest and stored in freezer
        //                AA%   BA%   form     freshF  %loss  weight(g), boil time
        "add1":        [ 14.3,  3.5, "cones", 0.948,  25.0,  19.675,   40 ],

        "timeToFirstAddition":  10,     // wait 10 minutes after start of boil
        "evaporationRate":      1.325, // (15.1416 - 14.479) / (30min duration) * 60
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   "estimate",
        "preBoilSG":            1.0390,
        "krausen":              "mix krausen back in; no loss",   // swirling of containers during fermentation
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  14.3,
                "method":   "value",
                "low":      13.3,
                "high":     15.3,
                "inc":      0.20,
            },

            {
                "param":    "freshnessFactor1",
                "default":  0.95,
                "method":   "value",
                "low":      0.90,
                "high":     1.00,
                "inc":      0.02,
            }

        ]
    },

    "Protein Exp. #1": {
        "conditions":           [ "A10",   "A20",   "A30",   "A40",   "B10",   "B20",   "B30",   "B40" ],
        "IBU_list":             [ 10.2,    14.2,    19.6,    24.1,    13.5,    18.8,    22.4,    27.5 ],
        "IBU_list_onlyB":       [ 13.5,    18.8,    22.4,    27.5,    13.5,    18.8,    22.4,    27.5 ],
        "IBU_list_onlyA":       [ 10.2,    14.2,    19.6,    24.1,    10.2,    14.2,    19.6,    24.1 ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    10.0,    20.0,    30.0,    40.0 ],
        "volume_list":          [ 12.23,   12.21,   12.19,   12.17,   12.23,   12.21,   12.19,   12.17 ],
        "OG_list":              [ 1.0428,  1.0429,  1.0429,  1.0430,  1.0428,  1.0429,  1.0429,  1.0430 ],

        // comet package rating AA 10.0%; analysis = AA=10.80%, BA=3.92%, HSI=0.25
        //                      analysis close to time of experiment: AA=9.70%, BA=3.71%, HSI=0.35
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 10.00,  3.92, "cones", 0.90,  37.43,  20.91,    40 ],

        "timeToFirstAddition":  5,     // wait 10 minutes after start of boil
        "evaporationRate":      0.09,  // (12.23 - 12.17) / (40min duration) * 60
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   5.65,
        "preOrPostBoilpH":      "preBoilpH",
        "preBoilSG":            1.0425,
        "krausen":              "mix krausen back in; no loss",   // swirling of containers during fermentation
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  10.0,
                "method":   "value",
                "low":      9.5,
                "high":     10.5,
                "inc":      0.10,
            },

            {
                "param":    "freshnessFactor1",
                "default":  1.00,
                "method":   "value",
                "low":      0.85,
                "high":     1.00,
                "inc":      0.05,
            }

        ]
    },

    "OG Exp. #1": {
        "conditions":           [ "A10",   "A20",   "A30",   "A40",   "B10",   "B20",   "B30",   "B40",
                                  "C10",   "C20",   "C30",   "C40",   "D10",   "D20",   "D30",   "D40" ],
        "IBU_list":             [ 13.9,    19.3,    24.6,    28.2,    12.7,    16.9,    21.9,    26.9,
                                  12.8,    17.5,    21.9,    25.3,    11.1,    16.3,    20.4,    24.6 ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    10.0,    20.0,    30.0,    40.0,
                                  10.0,    20.0,    30.0,    40.0,    10.0,    20.0,    30.0,    40.0 ],
        "volume_list":          [ 12.32,   12.28,   12.25,   12.21,   12.42,   12.39,   12.37,   12.35,
                                  12.64,   12.60,   12.57,   12.54,   12.75,   12.71,   12.68,   12.65],
        "OG_list":              [ 1.0777,  1.0780,  1.0782,  1.0785,  1.0631,  1.0633,  1.0634,  1.0635,
                                  1.0461,  1.0463,  1.0464,  1.0465,  1.0301,  1.0301,  1.0302,  1.0303],

        // cascade analysis: AA 7.05%, BA 5.66%, store 11 months @ -5.5'F SF 0.5 -> decay 0.908
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [  7.05, 5.66, "cones", 0.908,  50.0,  33.485,    40 ],

        "timeToFirstAddition":  5,     // wait 5 minutes after start of boil
        "evaporationRate":      0.345, // average of estimated evaporation rates from vol_0 to vol_40
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   5.60,  // average of 4 measured pH values at time 0
        "preOrPostBoilpH":      "preBoilpH",
        "krausen":              "mix krausen back in; no loss",   // swirling of containers during fermentation
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  7.05,
                "method":   "value",
                "low":      6.05,
                "high":     7.05,
                "inc":      0.10,
            },

            {
                "param":    "freshnessFactor1",
                "default":  1.00,
                "method":   "value",
                "low":      0.80,
                "high":     0.90,
                "inc":      0.05,
            }

        ]
    },

    "OG Exp. #2": {
        "conditions":           [ "A10",   "A20",   "A30",   "A40",   "B10",   "B20",   "B30",   "B40",
                                  "C10",   "C20",   "C30",   "C40",   "D10",   "D20",   "D30",   "D40" ],
        "IBU_list":             [ 11.2,    14.8,    19.2,    21.8,    10.2,    15.2,    19.0,    22.7,
                                   9.9,    14.4,    18.8,    23.2,     9.7,    14.0,    18.5,    23.6 ],
        "time_list":            [ 10.0,    20.0,    30.0,    40.0,    10.0,    20.0,    30.0,    40.0,
                                  10.0,    20.0,    30.0,    40.0,    10.0,    20.0,    30.0,    40.0 ],
        "volume_list":          [ 12.73,   12.66,   12.58,   12.51,   12.54,   12.46,   12.37,   12.29,
                                  12.10,   12.02,   11.93,   11.85,   11.44,   11.38,   11.31,   11.25],
        "OG_list":              [ 1.0755,  1.0759,  1.0763,  1.0768,  1.0611,  1.0615,  1.0620,  1.0624,
                                  1.0463,  1.0467,  1.0470,  1.0473,  1.0305,  1.0307,  1.0308,  1.0310],

        // cascade analysis: AA 7.05%, BA 5.66%, store 11 months @ -5.5'F SF 0.5 -> decay 0.908
        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [  7.05, 5.66, "cones", 0.908,  50.0,  33.485,    40 ],

        "timeToFirstAddition":  5,     // wait 5 minutes after start of boil
        "evaporationRate":      0.345, // average of estimated evaporation rates from vol_0 to vol_40
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   5.59,  // average of 4 measured pH values at time 0
        "preOrPostBoilpH":      "preBoilpH",
        "krausen":              "medium krausen deposits on FV (default)",   // krausen deposits on sides of FV
        "beerAge_days":         10,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  7.05,
                "method":   "value",
                "low":      6.05,
                "high":     7.05,
                "inc":      0.10,
            },

            {
                "param":    "freshnessFactor1",
                "default":  1.00,
                "method":   "value",
                "low":      0.80,
                "high":     0.90,
                "inc":      0.05,
            }

        ]
    },

    "Teamaker #1": {
        "conditions":           [  "A5",   "A10",   "A20",   "A40",   "A60",
                                   "B10",   "B20",   "B40" ],
        "IBU_list":             [  3.3,     3.6,     3.8,     3.8,     4.0,
                                   2.9,     3.2,     3.7 ],
        "time_list":            [  5.0,    10.0,    20.0,    40.0,    60.0,
                                   0.0,     0.0,     0.0 ],
        "postBoil_time_list":   [  0.0,     0.0,     0.0,    0.0,     0.0,
                                  10.0,    20.0,    40.0 ],
        "postBoil_temp_list":   [ 100.0,   100.0,   100.0,   100.0,   100.0,
                                   80.0,    80.0,    80.0 ],
        "volume_list":          [ 12.69,   12.66,   12.60,   12.49,   12.38,
                                  12.66,   12.60,   12.49 ],
        "OG_list":              [ 1.0566,  1.0568,  1.0570,  1.0575,  1.0580,
                                  1.0568,  1.0570,  1.0575 ],

        //                AA%   BA%   form    freshF  %loss  weight(g), boil time
        "add1":        [ 0.41, 11.93, "cones", 1.00,  50.0,  57.00,      60 ],

        "timeToFirstAddition":  5,     // wait 5 minutes after start of boil
        "evaporationRate":      0.336, // evaporation rates measured from vol_10 to vol_60
        "tempExpParamA":        0.0,   // instantly cool for post-boil hop stand
        "tempExpParamB":        0.0,   // instantly cool for post-boil hop stand
        "tempExpParamC":        20.0,  // cool below temp of lowest hop stand
        "tempDecayType":        "tempDecayExponential",
        "whirlpoolTime":        0,
        "immersionDecayFactor": 2.5,
        "pH":                   5.75,  // average of 5.74 and 5.76
        "preOrPostBoilpH":      "preBoilpH",
        "krausen":              "medium krausen deposits on FV (default)",   // krausen deposits on sides of FV
        "beerAge_days":         9,

        // search parameters:
        "skipSearch": false,
        "search": [
            {
                "param":    "AA1",
                "default":  0.41,
                "method":   "value",
                "low":      0.20,
                "high":     0.80,
                "inc":      0.20,
            }
        ]

    },

    "IPA, Jun. 2018": {
        "conditions":            [ "IPA" ],  // this field is needed to fit in same format as parameter search
        "IBU_list":              [ 63.7 ],

        "boilTime":              75,          // time to first addition, plus duration of longest hop steep time
        "wortVolume":            30.55,
        "preOrPostBoilVol":      "preBoilVol",
        "OG":                    1.068,
        "pH":                    5.27,
        "preOrPostBoilpH":       "postBoilpH",
        "whirlpoolTime":         10,
        "tempExpParamB":         0.0053,      // from Jul 2019, cover *ON*
        "beerAge_days":          26,

        //                AA%   BA%    form    freshF  %loss  weight(g),  boil time
        "add1":        [ 12.3,  3.75, "cones", 0.86,   25.00,    28.35,     60 ], // citra 2016; BA=guess
        "add2":        [ 9.0,   6.5,  "cones", 0.98,    4.00,    28.35,     45 ], // amarillo 2016
        "add3":        [ 13.0,  4.5,  "cones", 0.94,   25.00,    28.35,     30 ], // simcoe 2017?
        "add4":        [ 12.3,  3.75, "cones", 0.86,   25.00,    14.17,      0 ], // citra 2016; BA=guess
        "add5":        [ 8.0,   5.0,  "cones", 0.87,   50.00,    21.26,      0 ], // cascade 2017?
        "add6":        [ 9.0,   6.5,  "cones", 0.98,    4.00,    21.26,      0 ], // amarillo 2016
        "add7":        [ 11.0,  3.6,  "cones", 0.94,   25.00,    21.26,      0 ], // mosaic 2017?
        "add8":        [ 13.0,  4.5,  "cones", 0.94,   25.00,    21.26,      0 ], // simcoe 2017?

        "kettleDiameter":        37.148,
        "kettleOpening":         28.0,  // target final expected temp of 93'C after 10 minutes
        "evaporationRate":       4.10,
        "immersionDecayFactor":  0.1015,
        "forcedDecayType":       "forcedDecayImmersion",
        "krausen":               "mix krausen back in; no loss",   // swirling of containers during fermentation

        "skipSearch":   true,
        "search": [
             {
                 "param":    "AA1",
                 "default":  12.30,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.5,
             },
             {
                 "param":    "AA2",
                 "default":  9.00,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.5,
             },
             {
                 "param":    "AA3",
                 "default":  13.00,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.5,
             },
             {
                 "param":    "AA4",
                 "default":  9.00,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.5,
             },
             {
                 "param":    "AA5",
                 "default":  13.00,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.5,
             },
             {
                 "param":    "AA6",
                 "default":  12.30,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.5,
             },
             {
                 "param":    "AA7",
                 "default":  11.00,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.5,
             },
             {
                 "param":    "AA8",
                 "default":  8.00,
                 "method":   "relative",
                 "low":      0.85,
                 "high":     1.15,
                 "inc":      0.5,
             },
       ],
    },

    "IPA, Jul. 2019": {
        "conditions":            [ "IPA" ],  // this field is needed to fit in same format as parameter search
        "IBU_list":              [ 43.3 ],

        "boilTime":              72,          // time to first addition, plus duration of longest hop steep time
        "wortVolume":            29.715,
        "preOrPostBoilVol":      "preBoilVol",
        "OG":                    1.071,
        "pH":                    5.25,
        "preOrPostBoilpH":       "preBoilpH",
        "whirlpoolTime":         10,
        "tempExpParamB":         0.0053,      // from Jul 2019, cover *ON*
        "beerAge_days":          24,

        //                AA%   BA%    form    freshF  %loss  weight(g),  boil time
        "add1":        [ 14.3,  4.0,  "cones", 0.837,  25.00,    28.35,     60 ], // citra
        "add2":        [ 9.3,   6.5,  "cones", 0.959,  14.00,    28.35,     45 ], // amarillo
        "add3":        [ 12.6,  4.5,  "cones", 0.923,  25.00,    28.35,     30 ], // simcoe
        "add4":        [ 9.3,   6.5,  "cones", 0.959,  14.00,    21.26,      0 ], // amarillo
        "add5":        [ 12.6,  4.5,  "cones", 0.923,  25.00,    21.26,      0 ], // simcoe
        "add6":        [ 14.3,  4.0,  "cones", 0.837,  25.00,    19.84,      0 ], // citra
        "add7":        [ 10.3,  3.5,  "cones", 0.956,  15.00,    21.26,      0 ], // mosaic
        "add8":        [  7.05, 5.66, "cones", 0.825,  50.00,    28.30,      0 ], // cascade

        "kettleDiameter":        37.148,
        "kettleOpening":         0.0,  // should be overwritten by tempExpParamB
        "evaporationRate":       3.71,
        "immersionDecayFactor":  0.4283,  // hydra wort chiller, measured Oct 27 2018
        "forcedDecayType":       "forcedDecayImmersion",
        "krausen":               "medium krausen deposits on FV (default)",

        "skipSearch":   false,
        "search": [
             {
                 "param":    "krausen",
                 "default":  1.0,
                 "method":   "value",
                 "low":      0.90,
                 "high":     1.00,
                 "inc":      0.02,
             },
             {
                 "param":    "AA1",
                 "default":  14.30,
                 "method":   "relative",
                 "low":      0.90,
                 "high":     1.15,
                 "inc":      0.5,
             },
       ],
    },


};

