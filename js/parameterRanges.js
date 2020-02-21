// search ranges for SMPH model parameters

var params = {
        "initial": [
            {
                "param":    "LF_boil",
                "default":  0.50,
                "low":      0.40,
                "high":     0.60,
                "inc":      0.10,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.20,
                "low":      0.00,
                "high":     0.60,
                "inc":      0.20,
            },

            {
                "param":    "scale_oAAloss",
                "default":  0.50,
                "low":      0.00,
                "high":     0.80,
                "inc":      0.20,
            },

            {
                "param":    "relTempAt80_nonIAA",
                "default":  0.90,
                "low":      0.40,
                "high":     1.00,
                "inc":      0.20,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.06,
                "low":      0.00,
                "high":     0.24,
                "inc":      0.06,
            },

            {
                "param":    "AA_limit_func_A",
                "default":  -31800.0,
                "low":      -71800.0,
                "high":     -31800.0,
                "inc":      10000.0,
            },

        ],

        "coarse": [
            {
                "param":    "LF_boil",
                "default":  0.50,
                "low":      0.40,
                "high":     0.60,
                "inc":      0.05,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.40,
                "low":      0.30,
                "high":     0.50,
                "inc":      0.05,
            },

            {
                "param":    "scale_oAAloss",
                "default":  0.20,
                "low":      0.10,
                "high":     0.30,
                "inc":      0.05,
            },

            {
                "param":    "relTempAt80_nonIAA",
                "default":  1.00,
                "low":      0.90,
                "high":     1.00,
                "inc":      0.05,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.06,
                "low":      0.02,
                "high":     0.10,
                "inc":      0.04,
            },

            {
                "param":    "AA_limit_func_A",
                "default":  -51800.0,
                "low":      -61800.0,
                "high":     -41800.0,
                "inc":      10000.0,
            },

        ],

        "fine": [
            {
                "param":    "LF_boil",
                "default":  0.50,
                "low":      0.45,
                "high":     0.55,
                "inc":      0.025,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.50,
                "low":      0.45,
                "high":     0.55,
                "inc":      0.025,
            },

            {
                "param":    "scale_oAAloss",
                "default":  0.15,
                "low":      0.10,
                "high":     0.20,
                "inc":      0.025,
            },

            {
                "param":    "relTempAt80_nonIAA",
                "default":  1.00,
                "low":      0.90,
                "high":     1.00,
                "inc":      0.05,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.06,
                "low":      0.04,
                "high":     0.08,
                "inc":      0.02,
            },

            {
                "param":    "AA_limit_func_A",
                "default":  -61800.0,
                "low":      -66800.0,
                "high":     -56800.0,
                "inc":      5000.0,
            },

        ],

        "veryfine": [
            {
                "param":    "LF_boil",
                "default":  0.48,
                "low":      0.46,
                "high":     0.50,
                "inc":      0.02,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.45,
                "low":      0.39,
                "high":     0.47,
                "inc":      0.02,
            },

            {
                "param":    "scale_oAAloss",
                "default":  0.20,
                "low":      0.18,
                "high":     0.22,
                "inc":      0.02,
            },

            {
                "param":    "relTempAt80_nonIAA",
                "default":  1.00,
                "low":      0.98,
                "high":     1.00,
                "inc":      0.02,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.04,
                "low":      0.02,
                "high":     0.06,
                "inc":      0.02,
            },

            {
                "param":    "AA_limit_func_A",
                "default":  -66800.0,
                "low":      -71800.0,
                "high":     -61800.0,
                "inc":      5000.0,
            },

        ],

        "superfine": [
            {
                "param":    "LF_boil",
                "default":  0.48,
                "low":      0.46,
                "high":     0.50,
                "inc":      0.01,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.41,
                "low":      0.39,
                "high":     0.43,
                "inc":      0.01,
            },

            {
                "param":    "scale_oAAloss",
                "default":  0.20,
                "low":      0.18,
                "high":     0.22,
                "inc":      0.01,
            },

            {
                "param":    "relTempAt80_nonIAA",
                "default":  1.00,
                "low":      0.98,
                "high":     1.00,
                "inc":      0.01,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.04,
                "low":      0.02,
                "high":     0.06,
                "inc":      0.01,
            },

            {
                "param":    "AA_limit_func_A",
                "default":  -66800.0,
                "low":      -68800.0,
                "high":     -64800.0,
                "inc":      2000.0,
            },

        ],

        "none": [
            {
                "param":    "LF_boil",
                "default":  0.48,
                "low":      0.48,
                "high":     0.48,
                "inc":      0.01,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.41,
                "low":      0.41,
                "high":     0.41,
                "inc":      0.01,
            },

            {
                "param":    "scale_oAAloss",
                "default":  0.20,
                "low":      0.20,
                "high":     0.20,
                "inc":      0.01,
            },

            {
                "param":    "relTempAt80_nonIAA",
                "default":  1.00,
                "low":      1.00,
                "high":     1.00,
                "inc":      0.01,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.04,
                "low":      0.04,
                "high":     0.04,
                "inc":      0.01,
            },

            {
                "param":    "AA_limit_func_A",
                "default":  -66800.0,
                "low":      -66800.0,
                "high":     -66800.0,
                "inc":      2000.0,
            },


        ]
};

