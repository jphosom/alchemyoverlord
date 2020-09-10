// search ranges for SMPH model parameters

var params = {
        "initial": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.50,
                "low":      0.40,
                "high":     0.60,
                "inc":      0.05,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.10,
                "low":      0.05,
                "high":     0.15,
                "inc":      0.05,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.22,
                "low":      0.20,
                "high":     0.60,
                "inc":      0.20,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  0.00,
                "low":      0.00,
                "high":     1.00,
                "inc":      0.50,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  220.0,
                "low":      150.0,
                "high":     300.0,
                "inc":      50.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  400.0,
                "low":      400.0,
                "high":     700.0,
                "inc":      100.0,
            },

        ],

        "coarse": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.50,
                "low":      0.45,
                "high":     0.55,
                "inc":      0.05,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.10,
                "low":      0.06,
                "high":     0.14,
                "inc":      0.02,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.40,
                "low":      0.30,
                "high":     0.50,
                "inc":      0.10,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  0.00,
                "low":      0.00,
                "high":     1.00,
                "inc":      0.25,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  250.0,
                "low":      200.0,
                "high":     300.0,
                "inc":      25.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  600.0,
                "low":      500.0,
                "high":     700.0,
                "inc":      100.0,
            },

        ],

        "fine": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.50,
                "low":      0.48,
                "high":     0.52,
                "inc":      0.02,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.12,
                "low":      0.10,
                "high":     0.14,
                "inc":      0.02,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.40,
                "low":      0.30,
                "high":     0.50,
                "inc":      0.10,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  1.00,
                "low":      0.80,
                "high":     1.00,
                "inc":      0.20,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  225.0,
                "low":      200.0,
                "high":     260.0,
                "inc":      20.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  500.0,
                "low":      400.0,
                "high":     600.0,
                "inc":      100.0,
            },

        ],

        "veryfine": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.50,
                "low":      0.48,
                "high":     0.52,
                "inc":      0.01,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.12,
                "low":      0.10,
                "high":     0.14,
                "inc":      0.02,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.40,
                "low":      0.30,
                "high":     0.50,
                "inc":      0.05,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  0.80,
                "low":      0.70,
                "high":     0.90,
                "inc":      0.05,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  240.0,
                "low":      200.0,
                "high":     280.0,
                "inc":      20.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  500.0,
                "low":      450.0,
                "high":     550.0,
                "inc":      25.0,
            },

        ],
        "superfine": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.50,
                "low":      0.49,
                "high":     0.51,
                "inc":      0.01,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.12,
                "low":      0.11,
                "high":     0.13,
                "inc":      0.01,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.40,
                "low":      0.39,
                "high":     0.41,
                "inc":      0.01,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  0.80,
                "low":      0.79,
                "high":     0.81,
                "inc":      0.01,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  220.0,
                "low":      200.0,
                "high":     240.0,
                "inc":      5.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  525.0,
                "low":      500.0,
                "high":     550.0,
                "inc":      10.0,
            },
        ],

        "none": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.51,
                "low":      0.51,
                "high":     0.51,
                "inc":      0.01,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.11,
                "low":      0.11,
                "high":     0.11,
                "inc":      0.01,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.39,
                "low":      0.39,
                "high":     0.39,
                "inc":      0.01,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  0.79,
                "low":      0.79,
                "high":     0.79,
                "inc":      0.10,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  220.0,
                "low":      220.0,
                "high":     220.0,
                "inc":      10.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  530.0,
                "low":      530.0,
                "high":     530.0,
                "inc":      20.0,
            },

        ]
};

