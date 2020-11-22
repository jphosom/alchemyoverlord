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
                "default":  0.40,
                "low":      0.00,
                "high":     0.60,
                "inc":      0.20,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  175.0,
                "low":      200.0,
                "high":     300.0,
                "inc":      25.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  500.0,
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
                "param":    "AA_limit_minLimit",
                "default":  225.0,
                "low":      175.0,
                "high":     250.0,
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
                "low":      0.08,
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
                "param":    "AA_limit_minLimit",
                "default":  175.0,
                "low":      160.0,
                "high":     220.0,
                "inc":      20.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  600.0,
                "low":      500.0,
                "high":     700.0,
                "inc":      50.0,
            },

        ],

        "veryfine": [
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
                "low":      0.36,
                "high":     0.44,
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
                "low":      460.0,
                "high":     640.0,
                "inc":      20.0,
            },

        ],

        "superfine": [
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
                "inc":      0.01,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.42,
                "low":      0.40,
                "high":     0.44,
                "inc":      0.01,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  200.0,
                "low":      180.0,
                "high":     220.0,
                "inc":      10.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  540.0,
                "low":      520.0,
                "high":     560.0,
                "inc":      10.0,
            },
        ],

        "none": [
            {
                "param":    "IAA_LF_boil",
                "default":  0.50,
                "low":      0.50,
                "high":     0.50,
                "inc":      0.01,
            },

            {
                "param":    "oAA_boilFactor",
                "default":  0.12,
                "low":      0.12,
                "high":     0.12,
                "inc":      0.01,
            },

            {
                "param":    "oAA_storageFactor",
                "default":  0.41,
                "low":      0.41,
                "high":     0.41,
                "inc":      0.01,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  190.0,
                "low":      190.0,
                "high":     190.0,
                "inc":      1.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  560.0,
                "low":      560.0,
                "high":     560.0,
                "inc":      1.0,
            },

        ]
};

