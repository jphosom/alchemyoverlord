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
                "default":  0.06,
                "low":      0.00,
                "high":     0.15,
                "inc":      0.05,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  0.00,
                "low":      0.00,
                "high":     0.00,
                "inc":      0.10,
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
                "default":  420.0,
                "low":      350.0,
                "high":     500.0,
                "inc":      50.0,
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
                "default":  0.05,
                "low":      0.04,
                "high":     0.06,
                "inc":      0.01,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  0.00,
                "low":      0.00,
                "high":     0.00,
                "inc":      0.05,
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
                "default":  450.0,
                "low":      350.0,
                "high":     550.0,
                "inc":      25.0,
            },

        ],

        "fine": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.50,
                "low":      0.44,
                "high":     0.56,
                "inc":      0.02,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.05,
                "low":      0.04,
                "high":     0.06,
                "inc":      0.01,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  0.00,
                "low":      0.00,
                "high":     0.00,
                "inc":      0.05,
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
                "default":  450.0,
                "low":      350.0,
                "high":     550.0,
                "inc":      25.0,
            },

        ],

        "veryfine": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.52,
                "low":      0.50,
                "high":     0.54,
                "inc":      0.01,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.05,
                "low":      0.04,
                "high":     0.06,
                "inc":      0.01,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  0.00,
                "low":      0.00,
                "high":     0.00,
                "inc":      0.05,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  225.0,
                "low":      200.0,
                "high":     250.0,
                "inc":      5.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  425.0,
                "low":      400.0,
                "high":     450.0,
                "inc":      5.0,
            },

        ],
        "superfine": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.52,
                "low":      0.51,
                "high":     0.53,
                "inc":      0.01,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.05,
                "low":      0.04,
                "high":     0.06,
                "inc":      0.005,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  0.00,
                "low":      0.00,
                "high":     0.00,
                "inc":      0.05,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  220.0,
                "low":      210.0,
                "high":     230.0,
                "inc":      5.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  425.0,
                "low":      415.0,
                "high":     435.0,
                "inc":      5.0,
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
                "default":  0.06,
                "low":      0.06,
                "high":     0.06,
                "inc":      0.01,
            },

            {
                "param":    "oBA_storageFactor",
                "default":  0.00,
                "low":      0.00,
                "high":     0.00,
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
                "default":  425.0,
                "low":      425.0,
                "high":     425.0,
                "inc":      20.0,
            },

        ]
};

