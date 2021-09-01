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
                "default":  0.30,
                "low":      0.10,
                "high":     0.50,
                "inc":      0.10,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  200.0,
                "low":      175.0,
                "high":     250.0,
                "inc":      25.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  500.0,
                "low":      400.0,
                "high":     600.0,
                "inc":      50.0,
            },

        ],

        "coarse": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.55,
                "low":      0.45,
                "high":     0.60,
                "inc":      0.05,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.10,
                "low":      0.08,
                "high":     0.14,
                "inc":      0.02,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.30,
                "low":      0.20,
                "high":     0.50,
                "inc":      0.10,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  175.0,
                "low":      150.0,
                "high":     250.0,
                "inc":      25.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  550.0,
                "low":      450.0,
                "high":     650.0,
                "inc":      50.0,
            },

        ],

        "fine": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.50,
                "low":      0.48,
                "high":     0.56,
                "inc":      0.02,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.12,
                "low":      0.08,
                "high":     0.14,
                "inc":      0.02,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.40,
                "low":      0.20,
                "high":     0.50,
                "inc":      0.10,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  200.0,
                "low":      180.0,
                "high":     240.0,
                "inc":      20.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  550.0,
                "low":      450.0,
                "high":     650.0,
                "inc":      50.0,
            },

        ],

        "veryfine": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.50,
                "low":      0.48,
                "high":     0.54,
                "inc":      0.02,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.12,
                "low":      0.10,
                "high":     0.14,
                "inc":      0.01,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.40,
                "low":      0.30,
                "high":     0.50,
                "inc":      0.02,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  200.0,
                "low":      180.0,
                "high":     220.0,
                "inc":      20.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  550.0,
                "low":      530.0,
                "high":     570.0,
                "inc":      10.0,
            },

        ],

        "superfine": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.52,
                "low":      0.50,
                "high":     0.53,
                "inc":      0.01,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.11,
                "low":      0.10,
                "high":     0.12,
                "inc":      0.01,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.32,
                "low":      0.31,
                "high":     0.34,
                "inc":      0.01,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  200.0,
                "low":      190.0,
                "high":     220.0,
                "inc":      10.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  550.0,
                "low":      540.0,
                "high":     580.0,
                "inc":      10.0,
            },
        ],

        "none": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.52,
                "low":      0.52,
                "high":     0.52,
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
                "default":  0.32,
                "low":      0.32,
                "high":     0.32,
                "inc":      0.01,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  200.0,
                "low":      200.0,
                "high":     200.0,
                "inc":      1.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  550.0,
                "low":      550.0,
                "high":     550.0,
                "inc":      1.0,
            },

        ]
};

