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
                "low":      0.20,
                "high":     0.60,
                "inc":      0.20,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  200.0,
                "low":      100.0,
                "high":     300.0,
                "inc":      50.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  500.0,
                "low":      300.0,
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
                "default":  200.0,
                "low":      150.0,
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
                "param":    "AA_limit_minLimit",
                "default":  200.0,
                "low":      160.0,
                "high":     240.0,
                "inc":      20.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  600.0,
                "low":      500.0,
                "high":     700.0,
                "inc":      100.0,
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
                "default":  180.0,
                "low":      170.0,
                "high":     220.0,
                "inc":      10.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  600.0,
                "low":      500.0,
                "high":     650.0,
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
                "default":  0.42,
                "low":      0.41,
                "high":     0.43,
                "inc":      0.01,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  210.0,
                "low":      200.0,
                "high":     230.0,
                "inc":      5.0,
            },

            {
                "param":    "AA_limit_maxLimit",
                "default":  550.0,
                "low":      520.0,
                "high":     580.0,
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
                "default":  0.42,
                "low":      0.42,
                "high":     0.42,
                "inc":      0.01,
            },

            {
                "param":    "AA_limit_minLimit",
                "default":  215.0,
                "low":      215.0,
                "high":     215.0,
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

