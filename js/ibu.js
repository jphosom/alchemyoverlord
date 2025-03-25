// -----------------------------------------------------------------------------
// ibu.js : JavaScript for AlchemyOverlord web page, IBU-related functions
//          but not specific estimation methods.
// Written by John-Paul Hosom
// Copyright � 2018-2025 by John-Paul Hosom, all rights reserved.
// To license this software, please contact John-Paul Hosom, for example at
//    alchemyoverlord � yahoo � com
// In many cases (at the sole discretion of John-Paul Hosom) a license
// is provided free of charge, but a written license is required for
// legal use of this code.
//
// Version 1.0.0 : January 30, 2017
// Version 1.0.1 : May 6, 2018
// Version 1.1.0 : May 23, 2018 : additional functions in support of mIBU
// Version 1.2.0 : Jul 15, 2018 : complete re-write under hood; add save/load
// Version 1.2.1 : Jul 18, 2018 : add support for hop stand constant temp.
// Version 1.2.2 : Sep  3, 2018 : add pH adjustment, pre- or post-boil volume,
//                                and minor adjustments.
// Version 1.2.3 : Dec 29, 2018 : add 'select' and 'floatOrString' input types,
//                                and the variables boilTemp, preOrPostBoilpH,
//                                flocculation, filtering, and beerAge_days.
//                                In hop additions array, add variety, beta
//                                acids, hop form, freshness factor, and
//                                percent loss after 6 months at room temp.
// Version 1.2.4 : Jan 21, 2019 : increase diameter and counterflow rate limits.
//                                If hold a constant temperature during
//                                whirlpool, use immersion chiller to reach
//                                this target temperature.
// Version 1.2.5 : Jun 18, 2019 : add krausen loss factor
// Version 1.2.6 : Jul 12, 2019 : add hop variety selection, hop form default
// Version 1.2.7 : Oct 10, 2020 : add wort clarity and (gelatin) finings
// Version 1.2.8 : Nov  7, 2020 : add hop addition variables for mIBU
// Version 1.2.9 : Nov 22, 2020 : make sure wortLossVolume < post-boil vol
//                                make sure post-boil volume never negative
//                                if added water is 0, show wortLossVol in gray
//                                make sure holdTemp is never more than boiling
//                                lots of minor formatting cleanup
// Version 1.2.10: Jun 11, 2021 : change boilTime to steepTime,
//                                add kettleOrDryHop, modify steepTime units,
//                                add fermentorVolume, dry-hop options,
//                                and more possible output values,
//                                lower the defaults freshness factors
// Version 1.2.11: Aug 10, 2021 : add storage conditions to each hop addition
// Version 1.2.12: Oct  5, 2021 : change "steep time" to "boil or steep time"
//                                or just "boil time" depending on method
// Version 1.2.13: Nov 25, 2021 : change href targets from _parent to _blank
// Version 1.2.14: May 18, 2022 : storage duration of 0 months is valid
// Version 1.2.15: Jan 29, 2023 : limit default immersion decay factor
// Version 1.2.16: Feb 12, 2023 : better defaults for forced cooling
// Version 1.2.17: Jul 30, 2023 : change storageDuration maximum to 120 months
// Version 1.2.18: Aug  6, 2023 : change 'onclick' to 'onchange' because
//                                onclick has been overloaded and doesn't
//                                behave the same way on Firefox,Chrome,Safari
// Version 1.3.0 : Sep 24, 2023 : change beta acid default to scale with
//                                the alpha-acid value set by the user.
// Version 1.3.1 : Oct 22, 2023 : debug scaling beta acid default
// Version 1.3.2 : Nov  9, 2023 : bug fix: check if fermentorVolume is saved val
// Version 1.3.3 : Mar  4, 2024 : increase topoffVolume max to 10,000 liters
// -----------------------------------------------------------------------------

//==============================================================================

var ibu = ibu || {};

// Declare a "namespace" called "ibu"
// This namespace contains variables and private functions that are specific
// to *any* IBU method.
// "Variables", in this case, are objects that *may* contain the following:
//    . id = HTML id
//    . inputType = "float", "int", "radioButton", "checkbox",
//                  "select", or "floatOrString"
//    . inputStrings = a list of valid input strings, if input can be string
//    . value = current value of this variable, in metric
//    . userSet = 0 if value was not set by user, 1 if value was set by user
//    . convertToMetric = a function to convert to metric, if needed
//    . convertToImperial = a function to convert to Imperial units, if needed
//    . precision = the current precision of the floating-point value;
//                  if negative then the precision may be increased
//    . minPrecision = minimum precision to display
//    . display = the string of the displayed value, in correct units and prec.
//    . min = minimum allowed value for variable
//    . max = maximum allowed value for variable
//    . description = description of variable if fail validation check
//    . defaultValue = the default value if user clears all saved values
//    . defaultColor = color to use if value is the default
//    . userColor = color to use if user has set the value (default black)
//    . defaultFunction = function to use to compute the default value
//    . defaultArgs = arguments to pass in to defaultFunction
//    . dependents = array of variables that have defaults that depend on this
//    . parent = name of variable's 'parent', i.e. the namespace, as string
//
//    public variables:
//    . units = "metric" or "imperial"
//    . boilTemp = temperature at which water boils
//    . kettleDiameter = diameter of the kettle, used for temp decay factor
//    . kettleOpening = diameter of the opening in the kettle
//    . boilTime = amount of time for which the wort is boiled
//    . evaporationRate = rate at which wort evaporates during the boil
//    . wortVolume = the volume of the wort in the kettle, pre- or post-boil
//    . preOrPostBoilVol = whether the wort volume is measured pre- or post-boil
//    . OG = original gravity (specific gravity at the end of the boil)
//    . wortLossVolume = amount of wort left behind after post-boil transfer
//    . topoffVolume = amount of water added when doing a partial boil
//    . tempLinParamA = temperature decay parameter: linear formula, slope
//    . tempLinParamB = temperature decay parameter: linear formula, intercept
//    . tempExpParamA = temperature decay parameter: exponential formula, scale
//    . tempExpParamB = temperature decay parameter: exponential formula, const
//    . tempExpParamC = temperature decay parameter: exponential formula, offset
//    . tempDecayType = "tempDecayLinear" or "tempDecayExponential"
//    . whirlpoolTime = number of minutes for hop stand or whirlpool
//    . holdTempCheckbox = whether or not to hold hop stand at constant temp.
//    . holdTemp = temperature at which to hold hop stand, if any
//    . forcedDecayType = method of cooling: immersion, counterflow, icebath
//    . immersionDecayFactor = rate constant for forced cooling with immersion
//    . counterflowRate = rate of transfer when using counterflow chiller
//    . icebathDecayFactor = rate constant for forced cooling with ice bath
//    . numAdditions = number of hop additions
//    . scalingFactor = global scaling factor to increase or decrease IBUs
//    . defaultHopForm = default form of hop additions (cones, pellets)
//    . applySolubilityLimitCheckbox = whether or not to use AA solubility limit
//    . pHCheckbox = whether or not to adjust IBUs based on wort pH
//    . pH = the wort pH, if applying pH correction
//    . preOrPostBoilpH = if the pH is pre- or post-boil
//    . useDryHopModelCheckbox = whether or not to use dry-hop model of IBUs
//    . hopDecayMethod = specify storage conditions or use freshness factor
//    . add = array of hop additions, containing:
//        . variety = hop variety, if known
//        . hopForm = form of the hops (cones, pellets, or default)
//        . AA = alpha acid, in percent (scale 0 to 100)
//        . BA = beta acid, in percent (scale 0 to 100)
//        . percentLoss = percent loss of AA when stored 6 mos at room temp
//        . freshnessFactor = how fresh are the hops? e.g. using Garetz formula
//        . hopPackaging = how the hops have been stored since harvest
//        . storageTemp = at what temperature hops have been stored
//        . storageDuration = how long the hops have been stored
//        . pelletFactor = increase in oAA boil factor when using pellets
//        . weight = weight of hops added
//        . kettleOrDryHop = are hops added to the kettle or for dry hopping?
//        . steepTime = amount of time that hops spend in the kettle (in
//          minutes, may be negative) or dry hopped (in days)
//    . fermentorVolume = the volume of the wort in the fermentor
//    . wortClarity = general description of how clear/cloudy the wort is
//    . krausen = krausen loss factor for IAA
//    . flocculation = degree of yeast flocculation (low, medium, high)
//    . finingsAmount = amount of finings added
//    . finingsType = type of finings
//    . filtering = micron rating of the filter, or no filtering
//    . beerAge_days = age of the beer, in days, measured from start of ferment.
//
//    public functions:
//      checkHoldTempCheckbox = check if the 'hold' temp on hop stand is valid
//      getPostBoilVolume = get post-boil volume from wort volume and other info
//

ibu._construct = function() {
  "use strict";
  var idx = 0;

  // color option and maximum forced-cooling time
  this.defaultColor = "#94476b"; // greyish red
  this.maxCoolTime  = 180.0;   // max time to cool to target temp with immersion

  //----------------------------------------------------------------------------
  // declare objects that are input variables

  this.units                = new Object();
  this.boilTemp             = new Object();

  this.kettleDiameter       = new Object();
  this.kettleOpening        = new Object();

  this.boilTime             = new Object();
  this.evaporationRate      = new Object();
  this.wortVolume           = new Object();
  this.preOrPostBoilVol     = new Object();
  this.OG                   = new Object();
  this.wortLossVolume       = new Object();
  this.topoffVolume         = new Object();

  this.tempLinParamA        = new Object();
  this.tempLinParamB        = new Object();
  this.tempExpParamA        = new Object();
  this.tempExpParamB        = new Object();
  this.tempExpParamC        = new Object();
  this.tempDecayType        = new Object();

  this.whirlpoolTime        = new Object();

  this.holdTempCheckbox     = new Object();
  this.holdTemp             = new Object();

  this.immersionDecayFactor = new Object();
  this.counterflowRate      = new Object();
  this.icebathDecayFactor   = new Object();
  this.forcedDecayType      = new Object();

  this.numAdditions         = new Object();
  this.scalingFactor        = new Object();
  this.defaultHopForm       = new Object();
  this.applySolubilityLimitCheckbox = new Object();
  this.pHCheckbox           = new Object();
  this.pH                   = new Object();
  this.preOrPostBoilpH      = new Object();
  this.useDryHopModelCheckbox = new Object();
  this.hopDecayMethod       = new Object();

  this.add = [];        // array of hops additions
  this.letterList = []; // array of hop variety first letters

  this.fermentorVolume      = new Object();
  this.wortClarity          = new Object();
  this.krausen              = new Object();
  this.flocculation         = new Object();
  this.filtering            = new Object();
  this.finingsAmount        = new Object();
  this.finingsType          = new Object();
  this.beerAge_days         = new Object();

  //----------------------------------------------------------------------------
  // add name of parent to all variables, so we can access 'units' as needed
  var keys = Object.keys(this);
  for (idx = 0; idx < keys.length; idx++) {
    if (keys[idx] == "_construct") {
      continue;
    }
    if (keys[idx] == "defaultColor" || keys[idx] == "maxCoolTime") {
      continue;
    }
    this[keys[idx]].parent = "ibu";
  }

  //----------------------------------------------------------------------------
  // create data for all variables

  // units
  this.units.id = "ibu.units";
  this.units.inputType = "radioButton";
  this.units.value = "imperial";
  this.units.userSet = 0;
  this.units.defaultValue = "imperial";
  this.units.additionalFunction = setUnits;
  this.units.additionalFunctionArgs = "";

  // boilTemp
  this.boilTemp.id = "ibu.boilTemp";
  this.boilTemp.inputType = "float";
  this.boilTemp.value = 100.0;
  this.boilTemp.userSet = 0;
  this.boilTemp.convertToMetric = common.convertFahrenheitToCelsius;
  this.boilTemp.convertToImperial = common.convertCelsiusToFahrenheit;
  this.boilTemp.precision = 1;
  this.boilTemp.minPrecision = 1;
  this.boilTemp.display = "";
  this.boilTemp.min = 50.0;
  this.boilTemp.max = 250.0;
  this.boilTemp.description = "temperature at which water boils";
  this.boilTemp.defaultValue = 100.0;
  this.boilTemp.dependents = [ ibu.tempLinParamB, ibu.tempExpParamC ];
  this.boilTemp.additionalFunction = checkHoldTemp;
  this.boilTemp.additionalFunctionArgs = ibu.forcedDecayType;

  // kettleDiameter
  this.kettleDiameter.id = "ibu.kettleDiameter";
  this.kettleDiameter.inputType = "float";
  this.kettleDiameter.value = 0.0;
  this.kettleDiameter.userSet = 0;
  this.kettleDiameter.convertToMetric = common.convertInchesToCm;
  this.kettleDiameter.convertToImperial = common.convertCmToInches;
  this.kettleDiameter.precision = 1;
  this.kettleDiameter.minPrecision = 1;
  this.kettleDiameter.display = "";
  this.kettleDiameter.min = 0.0;
  this.kettleDiameter.max = 1000.0;
  this.kettleDiameter.description = "kettle diameter";
  this.kettleDiameter.defaultValue = 36.83;
  this.kettleDiameter.dependents = [ ibu.tempLinParamA, ibu.tempExpParamB ];
  this.kettleDiameter.additionalFunction = checkDiameterAndOpening;
  this.kettleDiameter.additionalFunctionArgs = ibu.kettleDiameter;

  // kettleOpening
  this.kettleOpening.id = "ibu.kettleOpening";
  this.kettleOpening.inputType = "float";
  this.kettleOpening.value = 0.0;
  this.kettleOpening.userSet = 0;
  this.kettleOpening.convertToMetric = common.convertInchesToCm;
  this.kettleOpening.convertToImperial = common.convertCmToInches;
  this.kettleOpening.precision = 1;
  this.kettleOpening.minPrecision = 1;
  this.kettleOpening.display = "";
  this.kettleOpening.min = 0.0;
  this.kettleOpening.max = 1000.0;
  this.kettleOpening.description = "kettle opening";
  this.kettleOpening.defaultValue = 36.83;
  this.kettleOpening.dependents = [ ibu.tempLinParamA, ibu.tempExpParamB ];
  this.kettleOpening.additionalFunction = checkDiameterAndOpening;
  this.kettleOpening.additionalFunctionArgs = ibu.kettleOpening;

  // boilTime
  this.boilTime.id = "ibu.boilTime";
  this.boilTime.inputType = "float";
  this.boilTime.value = 0.0;
  this.boilTime.userSet = 0;
  this.boilTime.precision = 0;
  this.boilTime.minPrecision = 0;
  this.boilTime.display = "";
  this.boilTime.min = 0.0;
  this.boilTime.max = 200.0;
  this.boilTime.description = "boil time";
  this.boilTime.defaultValue = 60.0;
  this.boilTime.additionalFunction = checkBoilTime;
  this.boilTime.additionalFunctionArgs = "";
  this.boilTime.dependents = [ ibu.fermentorVolume ];

  // evaporationRate
  this.evaporationRate.id = "ibu.evaporationRate";
  this.evaporationRate.inputType = "float";
  this.evaporationRate.value = 0.0;
  this.evaporationRate.userSet = 0;
  this.evaporationRate.convertToMetric = common.convertGallonsToLiters;
  this.evaporationRate.convertToImperial = common.convertLitersToGallons;
  this.evaporationRate.precision = 1;
  this.evaporationRate.minPrecision = 1;
  this.evaporationRate.display = "";
  this.evaporationRate.min = 0.0;
  this.evaporationRate.max = 500.0;
  this.evaporationRate.additionalFunction = checkWortLossVolumeAndColor;
  this.evaporationRate.additionalFunctionArgs = "";
  this.evaporationRate.description = "evaporation rate";
  this.evaporationRate.defaultValue = 3.78541;
  this.evaporationRate.dependents = [ ibu.fermentorVolume ];

  // wortVolume
  this.wortVolume.id = "ibu.wortVolume";
  this.wortVolume.inputType = "float";
  this.wortVolume.value = 0.0;
  this.wortVolume.userSet = 0;
  this.wortVolume.convertToMetric = common.convertGallonsToLiters;
  this.wortVolume.convertToImperial = common.convertLitersToGallons;
  this.wortVolume.precision = 2;
  this.wortVolume.minPrecision = 2;
  this.wortVolume.display = "";
  this.wortVolume.min = 0.0;
  this.wortVolume.max = 10000.0;
  this.wortVolume.description = "wort volume in kettle";
  this.wortVolume.defaultValue = 19.8734025;
  this.wortVolume.additionalFunction = checkWortLossVolumeAndColor;
  this.wortVolume.additionalFunctionArgs = "";
  this.wortVolume.dependents = [ ibu.tempLinParamA, ibu.tempExpParamB,
                                 ibu.immersionDecayFactor,
                                 ibu.icebathDecayFactor,
                                 ibu.fermentorVolume ];

  // preOrPostBoilVol
  this.preOrPostBoilVol.id = "ibu.preOrPostBoilVol";
  this.preOrPostBoilVol.inputType = "radioButton";
  this.preOrPostBoilVol.value = "postBoilVol";
  this.preOrPostBoilVol.userSet = 0;
  this.preOrPostBoilVol.defaultValue = "postBoilVol";
  this.preOrPostBoilVol.additionalFunction = checkWortLossVolumeAndColor;
  this.preOrPostBoilVol.additionalFunctionArgs = "";
  this.preOrPostBoilVol.dependents = [ ibu.tempLinParamA, ibu.tempExpParamB,
                                       ibu.immersionDecayFactor,
                                       ibu.icebathDecayFactor,
                                       ibu.fermentorVolume ];

  // OG
  this.OG.id = "ibu.OG";
  this.OG.inputType = "float";
  this.OG.value = 0.0;
  this.OG.userSet = 0;
  this.OG.precision = 3;
  this.OG.minPrecision = 3;
  this.OG.display = "";
  this.OG.min = 1.00;
  this.OG.max = 1.20;
  this.OG.description = "post-boil original gravity";
  this.OG.defaultValue = 1.055;

  // wortLossVolume
  this.wortLossVolume.id = "ibu.wortLossVolume";
  this.wortLossVolume.inputType = "float";
  this.wortLossVolume.value = 0.0;
  this.wortLossVolume.userSet = 0;
  this.wortLossVolume.convertToMetric = common.convertGallonsToLiters;
  this.wortLossVolume.convertToImperial = common.convertLitersToGallons;
  this.wortLossVolume.precision = 2;
  this.wortLossVolume.minPrecision = 2;
  this.wortLossVolume.display = "";
  this.wortLossVolume.min = 0.0;
  this.wortLossVolume.max = 1000.0;
  this.wortLossVolume.description = "volume of wort and trub left in kettle";
  this.wortLossVolume.defaultValue = 0.9463525;
  this.wortLossVolume.additionalFunction = checkWortLossVolumeAndColor;
  this.wortLossVolume.additionalFunctionArgs = "";
  this.wortLossVolume.greyColor = "#b1b1cd";

  // topoffVolume
  this.topoffVolume.id = "ibu.topoffVolume";
  this.topoffVolume.inputType = "float";
  this.topoffVolume.value = 0.0;
  this.topoffVolume.userSet = 0;
  this.topoffVolume.convertToMetric = common.convertGallonsToLiters;
  this.topoffVolume.convertToImperial = common.convertLitersToGallons;
  this.topoffVolume.precision = 2;
  this.topoffVolume.minPrecision = 2;
  this.topoffVolume.display = "";
  this.topoffVolume.min = 0.0;
  this.topoffVolume.max = 10000.0;
  this.topoffVolume.description = "added water";
  this.topoffVolume.defaultValue = 0.0;
  this.topoffVolume.additionalFunction = checkWortLossVolumeAndColor;
  this.topoffVolume.additionalFunctionArgs = "";

  // temperature decay linear : param A
  this.tempLinParamA.id = "ibu.tempLinParamA";
  this.tempLinParamA.inputType = "float";
  this.tempLinParamA.value = "";
  this.tempLinParamA.userSet = 0;
  this.tempLinParamA.convertToMetric = common.convertFahrenheitToCelsiusSlope;
  this.tempLinParamA.convertToImperial = common.convertCelsiusToFahrenheitSlope;
  this.tempLinParamA.precision = 2;
  this.tempLinParamA.minPrecision = 2;
  this.tempLinParamA.display = "";
  this.tempLinParamA.min = -100.0;
  this.tempLinParamA.max = 0.0;
  this.tempLinParamA.description = "linear temperature decay parameter 'A'";
  this.tempLinParamA.defaultColor = this.defaultColor;
  this.tempLinParamA.defaultFunction = get_tempLinParamA_default;
  this.tempLinParamA.defaultArgs = "";

  // temperature decay linear : param B
  this.tempLinParamB.id = "ibu.tempLinParamB";
  this.tempLinParamB.inputType = "float";
  this.tempLinParamB.value = 0.0;
  this.tempLinParamB.userSet = 0;
  this.tempLinParamB.convertToMetric = common.convertFahrenheitToCelsius;
  this.tempLinParamB.convertToImperial = common.convertCelsiusToFahrenheit;
  this.tempLinParamB.precision = 2;
  this.tempLinParamB.minPrecision = 2;
  this.tempLinParamB.display = "";
  this.tempLinParamB.min = 0.0;
  this.tempLinParamB.max = 300.0;
  this.tempLinParamB.description = "linear temperature decay parameter 'B'";
  this.tempLinParamB.defaultColor = this.defaultColor;
  this.tempLinParamB.defaultFunction = get_tempLinParamB_default;
  this.tempLinParamB.defaultArgs = "";

  // temperature decay exponential : param A
  this.tempExpParamA.id = "ibu.tempExpParamA";
  this.tempExpParamA.inputType = "float";
  this.tempExpParamA.value = 0.0;
  this.tempExpParamA.userSet = 0;
  this.tempExpParamA.convertToMetric = common.convertFahrenheitToCelsiusSlope;
  this.tempExpParamA.convertToImperial = common.convertCelsiusToFahrenheitSlope;
  this.tempExpParamA.precision = 2;
  this.tempExpParamA.minPrecision = 2;
  this.tempExpParamA.display = "";
  this.tempExpParamA.min = 0.0;
  this.tempExpParamA.max = 300.0;
  this.tempExpParamA.description = "linear temperature decay parameter 'A'";
  this.tempExpParamA.defaultColor = this.defaultColor;
  this.tempExpParamA.defaultValue = 53.7;
  this.tempExpParamA.dependents = [ ibu.tempLinParamB, ibu.tempExpParamC ];

  // temperature decay exponential : param B
  this.tempExpParamB.id = "ibu.tempExpParamB";
  this.tempExpParamB.inputType = "float";
  this.tempExpParamB.value = 0.0;
  this.tempExpParamB.userSet = 0;
  this.tempExpParamB.precision = -3;
  this.tempExpParamB.minPrecision = -3;
  this.tempExpParamB.display = "";
  this.tempExpParamB.min = 0.0;
  this.tempExpParamB.max = 200.0;
  this.tempExpParamB.description = "linear temperature decay parameter 'B'";
  this.tempExpParamB.defaultColor = this.defaultColor;
  this.tempExpParamB.defaultFunction = get_tempExpParamB_default;
  this.tempExpParamB.defaultArgs = "";

  // temperature decay exponential : param C
  this.tempExpParamC.id = "ibu.tempExpParamC";
  this.tempExpParamC.inputType = "float";
  this.tempExpParamC.value = 0.0;
  this.tempExpParamC.userSet = 0;
  this.tempExpParamC.convertToMetric = common.convertFahrenheitToCelsius;
  this.tempExpParamC.convertToImperial = common.convertCelsiusToFahrenheit;
  this.tempExpParamC.precision = 2;
  this.tempExpParamC.minPrecision = 2;
  this.tempExpParamC.display = "";
  this.tempExpParamC.min = 0.0;
  this.tempExpParamC.max = 300.0;
  this.tempExpParamC.description = "linear temperature decay parameter 'C'";
  this.tempExpParamC.defaultColor = this.defaultColor;
  this.tempExpParamC.defaultFunction = get_tempExpParamC_default;
  this.tempExpParamC.defaultArgs = "";

  // tempDecayType
  this.tempDecayType.id = "ibu.tempDecayType";
  this.tempDecayType.inputType = "radioButton";
  this.tempDecayType.value = "tempDecayExponential";
  this.tempDecayType.userSet = 0;
  this.tempDecayType.defaultValue = "tempDecayExponential";
  this.tempDecayType.additionalFunction = setTempDecayType;
  this.tempDecayType.additionalFunctionArgs = "";

  // whirlpool time
  this.whirlpoolTime.id = "ibu.whirlpoolTime";
  this.whirlpoolTime.inputType = "float";
  this.whirlpoolTime.value = 0.0;
  this.whirlpoolTime.userSet = 0;
  this.whirlpoolTime.precision = 0;
  this.whirlpoolTime.minPrecision = 0;
  this.whirlpoolTime.display = "";
  this.whirlpoolTime.min = 0.0;
  this.whirlpoolTime.max = 180.0;
  this.whirlpoolTime.description = "whirlpool time";
  this.whirlpoolTime.defaultValue = 0.0;

  // holdTempCheckbox
  this.holdTempCheckbox.id = "ibu.holdTempCheckbox";
  this.holdTempCheckbox.inputType = "checkbox";
  this.holdTempCheckbox.value = false;
  this.holdTempCheckbox.userSet = 0;
  this.holdTempCheckbox.defaultValue = false;
  this.holdTempCheckbox.additionalFunction = checkHoldTemp;
  this.holdTempCheckbox.additionalFunctionArgs = ibu.forcedDecayType;

  // holdTemp
  this.holdTemp.id = "ibu.holdTemp";
  this.holdTemp.inputType = "float";
  this.holdTemp.value = 0.0;
  this.holdTemp.userSet = 0;
  this.holdTemp.convertToMetric = common.convertFahrenheitToCelsius;
  this.holdTemp.convertToImperial = common.convertCelsiusToFahrenheit;
  this.holdTemp.precision = 1;
  this.holdTemp.minPrecision = 1;
  this.holdTemp.display = "";
  this.holdTemp.min = 0.0;
  this.holdTemp.max = 300.0;
  this.holdTemp.description = "hop-stand fixed temperature";
  this.holdTemp.defaultValue = 76.66667;
  this.holdTemp.defaultColor = "#b1b1cd";
  this.holdTemp.additionalFunction = checkHoldTemp;
  this.holdTemp.additionalFunctionArgs = ibu.forcedDecayType;

  // immersionDecayFactor
  this.immersionDecayFactor.id = "ibu.immersionDecayFactor";
  this.immersionDecayFactor.inputType = "float";
  this.immersionDecayFactor.value = "";
  this.immersionDecayFactor.userSet = 0;
  this.immersionDecayFactor.precision = -4;
  this.immersionDecayFactor.minPrecision = -4;
  this.immersionDecayFactor.display = "";
  this.immersionDecayFactor.min = 1.0e-8;
  this.immersionDecayFactor.max = 200.0;
  this.immersionDecayFactor.description = "immersion chiller rate constant";
  this.immersionDecayFactor.defaultColor = this.defaultColor;
  this.immersionDecayFactor.defaultFunction = get_immersionDecayFactor_default;
  this.immersionDecayFactor.defaultArgs = "";

  // counterflowRate
  this.counterflowRate.id = "ibu.counterflowRate";
  this.counterflowRate.inputType = "float";
  this.counterflowRate.value = "";
  this.counterflowRate.userSet = 0;
  this.counterflowRate.convertToMetric = common.convertGallonsToLiters;
  this.counterflowRate.convertToImperial = common.convertLitersToGallons;
  this.counterflowRate.precision = 1;
  this.counterflowRate.minPrecision = 1;
  this.counterflowRate.display = "";
  this.counterflowRate.min = 0.01;
  this.counterflowRate.max = 500.0;
  this.counterflowRate.description = "counterflow chiller flow rate";
  this.counterflowRate.defaultColor = this.defaultColor;
  this.counterflowRate.defaultFunction = get_counterflowRate_default;
  this.counterflowRate.defaultArgs = "";

  // icebathDecayFactor
  this.icebathDecayFactor.id = "ibu.icebathDecayFactor";
  this.icebathDecayFactor.inputType = "float";
  this.icebathDecayFactor.value = "";
  this.icebathDecayFactor.userSet = 0;
  this.icebathDecayFactor.precision = -3;
  this.icebathDecayFactor.minPrecision = -3;
  this.icebathDecayFactor.display = "";
  this.icebathDecayFactor.min = 1.0e-8;
  this.icebathDecayFactor.max = 200.0;
  this.icebathDecayFactor.description = "ice bath rate constant";
  this.icebathDecayFactor.defaultColor = this.defaultColor;
  this.icebathDecayFactor.defaultFunction = get_icebathDecayFactor_default;
  this.icebathDecayFactor.defaultArgs = "";

  // forcedDecayType
  this.forcedDecayType.id = "ibu.forcedDecayType";
  this.forcedDecayType.inputType = "radioButton";
  this.forcedDecayType.value = "forcedDecayImmersion";
  this.forcedDecayType.userSet = 0;
  this.forcedDecayType.defaultValue = "forcedDecayImmersion";
  this.forcedDecayType.additionalFunction = checkHoldTemp;
  this.forcedDecayType.additionalFunctionArgs = ibu.forcedDecayType;

  // scalingFactor
  this.scalingFactor.id = "ibu.scalingFactor";
  this.scalingFactor.inputType = "float";
  this.scalingFactor.value = 0.0;
  this.scalingFactor.userSet = 0;
  this.scalingFactor.precision = 1;
  this.scalingFactor.minPrecision = 1;
  this.scalingFactor.display = "";
  this.scalingFactor.min = 0.01;
  this.scalingFactor.max = 5.0;
  this.scalingFactor.description = "IBU global scaling factor";
  this.scalingFactor.defaultValue = 1.0;

  // defaultHopForm
  this.defaultHopForm.id = "ibu.defaultHopForm";
  this.defaultHopForm.inputType = "select";
  this.defaultHopForm.value = "pellets";
  this.defaultHopForm.userSet = 0;
  this.defaultHopForm.display = "pellets";
  this.defaultHopForm.description = "default form of hop additions";
  this.defaultHopForm.defaultValue = "pellets";
  this.defaultHopForm.additionalFunction = checkHopFormDefaults;

  // numAdditions
  this.numAdditions.id = "ibu.numAdditions";
  this.numAdditions.inputType = "int";
  this.numAdditions.value = 0;
  this.numAdditions.userSet = 0;
  this.numAdditions.display = "";
  this.numAdditions.min = 0;
  this.numAdditions.max = 20;
  this.numAdditions.description = "number of hops additions";
  this.numAdditions.defaultValue = 1;
  this.numAdditions.additionalFunction = hopAdditionsSet;
  this.numAdditions.additionalFunctionArgs = "";

  // applySolubilityLimitCheckbox
  this.applySolubilityLimitCheckbox.id = "ibu.applySolubilityLimitCheckbox";
  this.applySolubilityLimitCheckbox.inputType = "checkbox";
  this.applySolubilityLimitCheckbox.value = true;
  this.applySolubilityLimitCheckbox.userSet = 0;
  this.applySolubilityLimitCheckbox.defaultValue = true;
  this.applySolubilityLimitCheckbox.additionalFunction = checkSolubilityLimit;

  // pHCheckbox
  this.pHCheckbox.id = "ibu.pHCheckbox";
  this.pHCheckbox.inputType = "checkbox";
  this.pHCheckbox.value = true;
  this.pHCheckbox.userSet = 0;
  this.pHCheckbox.defaultValue = true;
  this.pHCheckbox.additionalFunction = checkpH;

  // pH
  this.pH.id = "ibu.pH";
  this.pH.inputType = "float";
  this.pH.value = 0.0;
  this.pH.userSet = 0;
  this.pH.precision = 2;
  this.pH.minPrecision = 2;
  this.pH.display = "";
  this.pH.min = 4.0;
  this.pH.max = 7.0;
  this.pH.description = "wort pH";
  this.pH.defaultValue = 5.75;
  this.pH.defaultColor = "#b1b1cd";
  this.pH.additionalFunction = checkpH;

  // preOrPostBoilpH
  this.preOrPostBoilpH.id = "ibu.preOrPostBoilpH";
  this.preOrPostBoilpH.inputType = "radioButton";
  this.preOrPostBoilpH.value = "postBoilpH";
  this.preOrPostBoilpH.userSet = 0;
  this.preOrPostBoilpH.defaultValue = "postBoilpH";
  this.preOrPostBoilpH.additionalFunction = setPreOrPostBoilpH;
  this.preOrPostBoilpH.additionalFunctionArgs = "";

  // useDryHopModelCheckbox
  this.useDryHopModelCheckbox.id = "ibu.useDryHopModelCheckbox";
  this.useDryHopModelCheckbox.inputType = "checkbox";
  this.useDryHopModelCheckbox.value = true;
  this.useDryHopModelCheckbox.userSet = 0;
  this.useDryHopModelCheckbox.defaultValue = true;

  // hopDecayMethod
  this.hopDecayMethod.id = "ibu.hopDecayMethod";
  this.hopDecayMethod.inputType = "radioButton";
  this.hopDecayMethod.value = "decayFactor";
  this.hopDecayMethod.userSet = 0;
  this.hopDecayMethod.defaultValue = "decayFactor";
  this.hopDecayMethod.additionalFunction = hopAdditionsSet;
  this.hopDecayMethod.additionalFunctionArgs = "";

  // fermentorVolume
  this.fermentorVolume.id = "ibu.fermentorVolume";
  this.fermentorVolume.inputType = "float";
  this.fermentorVolume.value = 0.0;
  this.fermentorVolume.userSet = 0;
  this.fermentorVolume.convertToMetric = common.convertGallonsToLiters;
  this.fermentorVolume.convertToImperial = common.convertLitersToGallons;
  this.fermentorVolume.precision = 2;
  this.fermentorVolume.minPrecision = 2;
  this.fermentorVolume.display = "";
  this.fermentorVolume.min = 0.0;
  this.fermentorVolume.max = 10000.0;
  this.fermentorVolume.description = "volume of wort in fermentor";
  this.fermentorVolume.additionalFunction = checkFermentorVolume;
  this.fermentorVolume.additionalFunctionArgs = "";
  this.fermentorVolume.defaultColor = this.defaultColor;
  this.fermentorVolume.defaultFunction = get_fermentorVolume_default;
  this.fermentorVolume.defaultArgs = "";

  // wortClarity
  this.wortClarity.id = "ibu.wortClarity";
  this.wortClarity.inputType = "select";
  this.wortClarity.value = "average (default)";
  this.wortClarity.userSet = 0;
  this.wortClarity.display = "average (default)";
  this.wortClarity.description = "wort clarity IAA loss factor";
  this.wortClarity.defaultValue = "average (default)";

  // krausen
  this.krausen.id = "ibu.krausen";
  this.krausen.inputType = "select";
  this.krausen.value = "medium krausen deposits on FV (default)";
  this.krausen.userSet = 0;
  this.krausen.display = "medium krausen deposits on FV (default)";
  this.krausen.description = "krausen loss factor";
  this.krausen.defaultValue = "medium krausen deposits on FV (default)";

  // flocculation
  this.flocculation.id = "ibu.flocculation";
  this.flocculation.inputType = "select";
  this.flocculation.value = "medium";
  this.flocculation.userSet = 0;
  this.flocculation.display = "medium";
  this.flocculation.description = "yeast flocculation";
  this.flocculation.defaultValue = "medium";

  // filtering
  this.filtering.id = "ibu.filtering";
  this.filtering.inputType = "floatOrString";
  this.filtering.inputStrings = [ "none", "no", "off" ];
  this.filtering.value = 0.0;
  this.filtering.userSet = 0;
  this.filtering.precision = 2;
  this.filtering.minPrecision = 2;
  this.filtering.display = "";
  this.filtering.min = 0.0;
  this.filtering.max = 100.0;
  this.filtering.description = "filtering";
  this.filtering.defaultValue = "none";

  // finingsAmount
  this.finingsAmount.id = "ibu.finingsAmount";
  this.finingsAmount.inputType = "float";
  this.finingsAmount.convertToMetric = common.convertTspToMl;
  this.finingsAmount.convertToImperial = common.convertMlToTsp;
  this.finingsAmount.value = 0.0;
  this.finingsAmount.userSet = 0;
  this.finingsAmount.precision = 1;
  this.finingsAmount.minPrecision = 0;
  this.finingsAmount.display = "";
  this.finingsAmount.min = 0.0;
  this.finingsAmount.max = 5000.0;
  this.finingsAmount.description = "amount of finings added";
  this.finingsAmount.defaultValue = 0.0;
  this.finingsAmount.additionalFunction = setFiningsUnits;

  // finingsType
  this.finingsType.id = "ibu.finingsType";
  this.finingsType.inputType = "select";
  this.finingsType.value = "nothing";
  this.finingsType.userSet = 0;
  this.finingsType.display = "nothing";
  this.finingsType.description = "type of fining agent";
  this.finingsType.defaultValue = "nothing";

  // beerAge_days
  this.beerAge_days.id = "ibu.beerAge_days";
  this.beerAge_days.inputType = "int";
  this.beerAge_days.value = 0;
  this.beerAge_days.userSet = 0;
  this.beerAge_days.display = "";
  this.beerAge_days.min = 0;
  this.beerAge_days.max = 1000;
  this.beerAge_days.description = "age of the beer, in days";
  this.beerAge_days.defaultValue = 7;



//==============================================================================
// FUNCTION RELATED TO UNITS

//------------------------------------------------------------------------------
// set units to metric or British Imperial

function setUnits() {

  if (ibu.units.value == "metric") {
    // update displayed units
    if (document.getElementById('boilTempUnits')) {
      document.getElementById('boilTempUnits').innerHTML = "&deg;C";
    }
    if (document.getElementById('wortVolumeUnits')) {
      document.getElementById('wortVolumeUnits').innerHTML = "litres";
    }
    if (document.getElementById('weightUnits')) {
      document.getElementById('weightUnits').innerHTML = "g";
    }
    if (document.getElementById('tempUnits')) {
      document.getElementById('tempUnits').innerHTML = "&deg;C";
    }
    if (document.getElementById('rateUnits')) {
      document.getElementById('rateUnits').innerHTML = "litres/min";
    }
    if (document.getElementById('wortLossUnits')) {
      document.getElementById('wortLossUnits').innerHTML = "litres";
    }
    if (document.getElementById('evaporationUnits')) {
      document.getElementById('evaporationUnits').innerHTML = "litres/hr";
    }
    if (document.getElementById('topoffUnits')) {
      document.getElementById('topoffUnits').innerHTML = "litres";
    }
    if (document.getElementById('kettleDiameterUnits')) {
      document.getElementById('kettleDiameterUnits').innerHTML = "cm";
    }
    if (document.getElementById('kettleOpeningUnits')) {
      document.getElementById('kettleOpeningUnits').innerHTML = "cm";
    }
    if (document.getElementById('holdTempUnits')) {
      document.getElementById('holdTempUnits').innerHTML = "&deg;C";
    }
    if (document.getElementById('fermentorVolumeUnits')) {
      document.getElementById('fermentorVolumeUnits').innerHTML = "litres";
    }

    // update variables
    common.set(ibu.boilTemp, 0);
    common.set(ibu.kettleDiameter, 0);
    common.set(ibu.kettleOpening, 0);
    common.set(ibu.evaporationRate, 0);
    common.set(ibu.wortVolume, 0);
    common.set(ibu.wortLossVolume, 0);
    common.set(ibu.topoffVolume, 0);
    common.set(ibu.tempLinParamA, 0);
    common.set(ibu.tempLinParamB, 0);
    common.set(ibu.tempExpParamA, 0);
    common.set(ibu.tempExpParamB, 0);
    common.set(ibu.tempExpParamC, 0);
    common.set(ibu.holdTemp, 0);
    common.set(ibu.counterflowRate, 0);
    common.set(ibu.finingsAmount, 0);
    common.set(ibu.fermentorVolume, 0);
    for (idx = 0; idx < ibu.add.length; idx++) {
      common.set(ibu.add[idx].weight, 0);
    }
  } else {
    // update displayed units
    if (document.getElementById('boilTempUnits')) {
      document.getElementById('boilTempUnits').innerHTML = "&deg;F";
     }
    if (document.getElementById('wortVolumeUnits')) {
      document.getElementById('wortVolumeUnits').innerHTML = "G";
     }
    if (document.getElementById('weightUnits')) {
      document.getElementById('weightUnits').innerHTML = "oz";
    }
    if (document.getElementById('tempUnits')) {
      document.getElementById('tempUnits').innerHTML = "&deg;F";
    }
    if (document.getElementById('rateUnits')) {
      document.getElementById('rateUnits').innerHTML = "gallons/min";
    }
    if (document.getElementById('wortLossUnits')) {
      document.getElementById('wortLossUnits').innerHTML = "G";
    }
    if (document.getElementById('evaporationUnits')) {
      document.getElementById('evaporationUnits').innerHTML = "G/hr";
    }
    if (document.getElementById('topoffUnits')) {
      document.getElementById('topoffUnits').innerHTML = "G";
    }
    if (document.getElementById('kettleDiameterUnits')) {
      document.getElementById('kettleDiameterUnits').innerHTML = "inches";
    }
    if (document.getElementById('kettleOpeningUnits')) {
      document.getElementById('kettleOpeningUnits').innerHTML = "inches";
    }
    if (document.getElementById('holdTempUnits')) {
      document.getElementById('holdTempUnits').innerHTML = "&deg;F";
    }
    if (document.getElementById('fermentorVolumeUnits')) {
      document.getElementById('fermentorVolumeUnits').innerHTML = "G";
     }

    // update variables
    common.set(ibu.boilTemp, 0);
    common.set(ibu.kettleDiameter, 0);
    common.set(ibu.kettleOpening, 0);
    common.set(ibu.evaporationRate, 0);
    common.set(ibu.wortVolume, 0);
    common.set(ibu.wortLossVolume, 0);
    common.set(ibu.topoffVolume, 0);
    common.set(ibu.tempLinParamA, 0);
    common.set(ibu.tempLinParamB, 0);
    common.set(ibu.tempExpParamA, 0);
    common.set(ibu.tempExpParamB, 0);
    common.set(ibu.tempExpParamC, 0);
    common.set(ibu.holdTemp, 0);
    common.set(ibu.counterflowRate, 0);
    common.set(ibu.finingsAmount, 0);
    common.set(ibu.fermentorVolume, 0);
    for (idx = 0; idx < ibu.add.length; idx++) {
      common.set(ibu.add[idx].weight, 0);
    }
  }

  return true;
}

//==============================================================================
// FUNCTIONS RELATED TO VALIDATING INPUTS

//------------------------------------------------------------------------------
// check the kettle diameter and opening sizes

function checkDiameterAndOpening(variable) {

  if (ibu.kettleDiameter.value < ibu.kettleOpening.value) {
    var display = variable.value;
    console.log("kettle diam = " + ibu.kettleDiameter.value +
                ", kettle opening = " + ibu.kettleOpening.value);
    if (ibu.units.value == "imperial") {
      display = variable.convertToImperial(display);
    }
    display = display.toFixed(variable.precision);
    if (variable.id == "kettleDiameter") {
      window.alert("Opening diameter (" + ibu.kettleOpening.display +
               ") can't be greater than kettle diameter (" +
               display + "). " +
               "Setting opening diameter to kettle diameter.");
    } else {
      window.alert("Opening diameter (" + display +
               ") can't be greater than kettle diameter (" +
               ibu.kettleDiameter.display + "). " +
               "Setting opening diameter to kettle diameter.");
    }
    ibu.kettleOpening.value = ibu.kettleDiameter.value;
    ibu.kettleOpening.precision = ibu.kettleDiameter.precision;
    ibu.kettleOpening.userSet = 1;
    common.updateHTML(ibu.kettleOpening);
    common.setSavedValue(ibu.kettleOpening, 0);
  }

  return true;
}

//------------------------------------------------------------------------------
// check if wort loss volume is valid or not

function checkWortLossVolumeAndColor() {
  var addedWater = ibu.topoffVolume.value;
  var postBoilVol = 0.0;
  var lossVariable = ibu.wortLossVolume;
  var fermentorVariable = ibu.fermentorVolume;

  postBoilVol = get_postBoilVolume();
  if (lossVariable.value > postBoilVol) {
    window.alert("Wort loss volume can't be greater than post-boil volume. " +
                 "Setting wort loss volume to post-boil volume.");
    lossVariable.value = postBoilVol;
    lossVariable.precision = ibu.wortVolume.precision;
    lossVariable.userSet = 1;
    common.updateHTML(lossVariable);
    common.setSavedValue(lossVariable, 0);
  }
  if (!fermentorVariable.userSet &&
      !common.existsSavedValue(fermentorVariable)) {
    fermentorVariable.value = get_fermentorVolume_default();
    fermentorVariable.userSet = 0;
    common.updateHTML(fermentorVariable);
    common.unsetSavedValue(fermentorVariable, 0);
  } else if (fermentorVariable.value > Number(postBoilVol) + addedWater) {
    window.alert("Fermentor volume can't be greater than post-boil volume " +
               "plus added water. Setting fermentor volume to default value.");
    fermentorVariable.value = get_fermentorVolume_default();
    fermentorVariable.userSet = 0;
    common.updateHTML(fermentorVariable);
    common.unsetSavedValue(fermentorVariable, 0);
  }

  if (document.getElementById(lossVariable.id)) {
    if (addedWater > 0) {
      document.getElementById(lossVariable.id).style.color = "black";
    } else {
      document.getElementById(lossVariable.id).style.color =
              ibu.wortLossVolume.greyColor;
    }
  }

  return true;
}

//------------------------------------------------------------------------------
// check that the specified boil time matches the hop additions

function checkBoilTime() {
  var doneAlert = false;
  var idx = 0;
  var kettleHops = true;

  for (idx = 0; idx < ibu.add.length; idx++) {
    kettleHops = true;
    if (ibu.add[idx].kettleOrDryHop) {
      if (ibu.add[idx].kettleOrDryHop.value != "kettle") {
        kettleHops = false;
      }
    }
    if (kettleHops && ibu.add[idx].steepTime.value > 
        (ibu.boilTime.value + ibu.whirlpoolTime.value) && !doneAlert) {
      window.alert("Hop steep time must be less than or equal to " +
                   "wort boil time.  Setting hop steep time to " +
                   "wort boil time as needed.");
      doneAlert = true;
    }
    if (kettleHops && ibu.add[idx].steepTime.value > 
        ibu.boilTime.value + ibu.whirlpoolTime.value) {
      ibu.add[idx].steepTime.value = ibu.boilTime.value;
      ibu.add[idx].steepTime.userSet = 1;
      common.updateHTML(ibu.add[idx].steepTime);
      common.setSavedValue(ibu.add[idx].steepTime, 0);
    }
  }
}

//------------------------------------------------------------------------------
// update the units for hop steep time

function updateSteepUnits(idx) {
  var arrayIdx = 0;
  var steepUnitsID = "";

  steepUnitsID = "ibu.add"+idx+".steepUnits";
  if (!document.getElementById(steepUnitsID))
    return;
  arrayIdx = Number(idx-1);

  if (ibu.add[arrayIdx].kettleOrDryHop.value == "kettle") {
    document.getElementById(steepUnitsID).innerHTML = "min";
  } else if (ibu.add[arrayIdx].kettleOrDryHop.value == "dryHop") {
    document.getElementById(steepUnitsID).innerHTML = "days";
  } else {
    document.getElementById(steepUnitsID).innerHTML = "min";
  }
}

//------------------------------------------------------------------------------
// check if the 'hold' temperature of the hop stand is valid; depending
// on the result, set the color of this field.

function checkHoldTemp(forcedDecayType) {
  var checked = ibu.holdTempCheckbox.value;
  var idx = 0;

  if (ibu.holdTemp.value > ibu.boilTemp.value) {
    window.alert("maximum temperature of hop stand is boiling.");
    ibu.holdTemp.value = ibu.boilTemp.value;
    ibu.holdTemp.userSet = 1;
    common.updateHTML(ibu.holdTemp);
    common.setSavedValue(ibu.holdTemp, 1);
    ibu.holdTemp.updateFunction();
  }

  if (document.getElementById(ibu.holdTempCheckbox.id)) {
    if (checked) {
      document.getElementById("holdTempColor").style.color = "black";
      document.getElementById("ibu.holdTemp").style.color = "black";
    } else {
      document.getElementById("holdTempColor").style.color = "#b1b1cd";
      document.getElementById("ibu.holdTemp").style.color = "#b1b1cd";
    }
  }

  // if using default immersion decay factor, set the default for new hold temp.
  common.set(ibu.immersionDecayFactor, 0);

  return;
}

//------------------------------------------------------------------------------
// the public version of the private function... we need both forms because
// we check it both internally and externally.

this.checkHoldTempCheckbox = function(forcedDecayType) {
  checkHoldTemp(forcedDecayType);
  return;
}

//------------------------------------------------------------------------------
// check if the solubility-limit checkbox is checked; change the color
// depending on the value.  Change both the text color and the link color.
// If checked, revert to the default color.

function checkSolubilityLimit() {
  var checked = ibu.applySolubilityLimitCheckbox.value;
  var idx = 0;
  var linkElements;

  if (!document.getElementById("solubilityLimitColor")) {
    return;
  }

  linkElements  =
    document.getElementById("solubilityLimitColor").getElementsByTagName("a");

  if (document.getElementById(ibu.applySolubilityLimitCheckbox.id)) {
    if (checked) {
      document.getElementById("solubilityLimitColor").style.color = "";
      for (var i = 0; i < linkElements.length; i++) {
        linkElements[i].style.color = "";
      }
    } else {
      document.getElementById("solubilityLimitColor").style.color = "#b1b1cd";
      for (var i = 0; i < linkElements.length; i++) {
        linkElements[i].style.color = "#b1b1cd";
      }
    }
  }

  return;
}

//------------------------------------------------------------------------------
// check if the pH checkbox is checked; change the color
// depending on the value.  Change both the text color and the link color.
// If checked, revert to the default color.

function checkpH() {
  var checked = ibu.pHCheckbox.value;
  var idx = 0;
  var linkElements;

  if (!document.getElementById("pHColor")) {
    return;
  }

  linkElements  =
    document.getElementById("pHColor").getElementsByTagName("a");

  if (document.getElementById(ibu.pHCheckbox.id)) {
    if (checked) {
      document.getElementById("pHColor").style.color = "";
      document.getElementById("ibu.pH").style.color = "";
      for (var i = 0; i < linkElements.length; i++) {
        linkElements[i].style.color = "";
      }
    } else {
      document.getElementById("pHColor").style.color = "#b1b1cd";
      document.getElementById("ibu.pH").style.color = "#b1b1cd";
      for (var i = 0; i < linkElements.length; i++) {
        linkElements[i].style.color = "#b1b1cd";
      }
    }
  }

  return;
}

//------------------------------------------------------------------------------
// check if fermentor volume is valid or not

function checkFermentorVolume() {
  var addedWater = ibu.topoffVolume.value;
  var postBoilVol = 0.0;
  var variable = ibu.fermentorVolume;

  postBoilVol = get_postBoilVolume();
  if (variable.value > postBoilVol + addedWater) {
    window.alert("Fermentor volume can't be greater than post-boil volume " +
               "plus added water. Setting fermentor volume to default value.");
    variable.value = get_fermentorVolume_default();
    variable.userSet = 0;
    common.updateHTML(variable);
    common.unsetSavedValue(variable, 0);
  }

  return true;
}

//==============================================================================
// FUNCTIONS TO SET TEMPERATURE DECAY TYPE AND FUNCTION

//------------------------------------------------------------------------------
// construct HTML for temperature decay input field

function construct_tempParam(variable, fieldName, value, valueName,
                             fnName) {
  if (!document.getElementById(fieldName)) {
    return;
    }
  // temperature decay function: input field description
  var formStrP1 = "<span id=\"";
  var formStrP2 = "\"> <input type=\"text\" STYLE=\"text-align:right\" size=5 value=\"";
  var formStrP3 = "\" autocomplete=\"off\" id=\"";
  var formStrP4 = "\" onchange=\"";
  var formStrP5 = "\"></span>";

  var htmlString = formStrP1+fieldName+formStrP2+value+
                     formStrP3+valueName+formStrP4+fnName+formStrP5;
  document.getElementById(fieldName).innerHTML = htmlString;

  if (("userSet" in variable) && ("defaultColor" in variable) &&
      !variable.userSet)
    document.getElementById(valueName).style.color = variable.defaultColor;
  else
    document.getElementById(valueName).style.color = "black";

  return;
}

//------------------------------------------------------------------------------
// set type of temperature decay function (linear or exponential)
// Construct a "dummy" innerHTML for tempDecayFormula that at least contains the
// spans that we want to construct, with some bogus values.
// Then, replace the bogus span contents for each variable with real information

function setTempDecayType() {
  var isExp = false;

  if (ibu.tempDecayType.value == "tempDecayExponential") {
    isExp = true;
    }

  if (isExp) {
    console.log(" ----- SETTING TEMP DECAY TO EXPONENTIAL -----");
    if (document.getElementById("tempDecayFormula")) {
      document.getElementById('tempDecayFormula').innerHTML =
       "<span id=\"tempExpParamA_field\">xxx</span>"+
       "  &times; exp(-1 &times; <span id=\"tempExpParamB_field\">"+
       "xxx</span> &times; time) + <span id=\"tempExpParamC_field\">xxx</span>";
    }
    common.set(ibu.tempExpParamA, 0);
    common.set(ibu.tempExpParamB, 0);
    common.set(ibu.tempExpParamC, 0);
    construct_tempParam(ibu.tempExpParamA, "tempExpParamA_field",
      ibu.tempExpParamA.display, "ibu.tempExpParamA",
      "common.set(ibu.tempExpParamA, 1)");
    construct_tempParam(ibu.tempExpParamB, "tempExpParamB_field",
      ibu.tempExpParamB.display, "ibu.tempExpParamB",
      "common.set(ibu.tempExpParamB, 1)");
    construct_tempParam(ibu.tempExpParamC, "tempExpParamC_field",
      ibu.tempExpParamC.display, "ibu.tempExpParamC",
      "common.set(ibu.tempExpParamC, 1)");
  } else {
    console.log(" ----- SETTING TEMP DECAY TO LINEAR -----");
    if (document.getElementById("tempDecayFormula")) {
      document.getElementById('tempDecayFormula').innerHTML =
        "<span id=\"tempLinParamA_field\">xxx</span> &times; time + "+
        "<span id=\"tempLinParamB_field\">xxx</span>";
    }
    common.set(ibu.tempLinParamA, 0);
    common.set(ibu.tempLinParamB, 0);
    construct_tempParam(ibu.tempLinParamA, "tempLinParamA_field",
      ibu.tempLinParamA.display, "ibu.tempLinParamA",
      "common.set(ibu.tempLinParamA, 1)");
    construct_tempParam(ibu.tempLinParamB, "tempLinParamB_field",
      ibu.tempLinParamB.display, "ibu.tempLinParamB",
      "common.set(ibu.tempLinParamB, 1)");
  }

  return true;
}

//==============================================================================
// FUNCTIONS TO SET and GET VARIOUS VALUES

//------------------------------------------------------------------------------
// set wort pH to be pre-boil or post-boil

function setPreOrPostBoilpH() {
  var idx = 0;
  var value = ibu.preOrPostBoilpH.value;

  console.log("SET PRE- or POST-BOIL pH TO " + value);

  return;
}

//------------------------------------------------------------------------------
// set the units of finings

function setFiningsUnits() {
  if (!document.getElementById('finingsUnits')) {
    return;
  }

  if (ibu.units.value == "metric") {
    document.getElementById('finingsUnits').innerHTML = "ml";
  } else {
    document.getElementById('finingsUnits').innerHTML = "tsp";
  }
  return;
}

//------------------------------------------------------------------------------
// map wortClarity description to numerical value

this.getWortClarityValue = function(description) {
  var value = 1.0;

  if (description == "very clear")
    value = 1.30;
  else if (description == "clear")
    value = 1.20;
  else if (description == "somewhat clear")
    value = 1.10;
  else if (description == "average (default)")
    value = 1.00;
  else if (description == "somewhat cloudy")
    value = 0.90;
  else if (description == "cloudy")
    value = 0.80;
  else if (description == "very cloudy")
    value = 0.70;
  else if (description == "extremely cloudy")
    value = 0.60;
  else if (!isNaN(parseFloat(description)))
    value = parseFloat(description);
  else {
    console.log("ERROR: can't find suitable description for wort clarity: " +
                 description);
  }
  return value;
}

//------------------------------------------------------------------------------
// map krausen description to numerical value

this.getKrausenValue = function(description) {
  var value = 1.0;

  if (description == "mix krausen back in; no loss")
    value = 1.1268; // see beer64/analyze.tcl = 1.0/0.8875
  else if (description == "minor krausen deposits on FV")
    value = 1.0500; // 'medium' * 1.05
  else if (description == "medium krausen deposits on FV (default)")
    value = 1.0000; // see beer64/analyze.tcl, normalize 0.8875 to 1.0
  else if (description == "heavy krausen deposits on FV")
    value = 0.9500; // 'medium' * 0.95
  else if (description == "very heavy krausen deposits on FV")
    value = 0.9000; // 'medium' * 0.90
  else if (description == "blow off krausen with slow fermentation")
    value = 0.9380;  // 'medium' * 0.938;
  else if (description == "blow off krausen with normal fermentation")
    value = 0.8330;  // 'medium' * 0.833;
  else if (description == "blow off krausen with vigorous fermentation")
    value = 0.7290;  // 'medium' * 0.729;
  else if (!isNaN(parseFloat(description)))
    value = parseFloat(description);
  else {
    console.log("ERROR: can't find suitable description for krausen loss: " +
                 description);
  }
  return value;
}

//------------------------------------------------------------------------------
// get post-boil volume

function get_postBoilVolume() {
  var boilTime = ibu.boilTime.value;
  var evapRate = ibu.evaporationRate.value;
  var postBoilVolume = 0.0;
  var preBoilVol = false;
  var wortVolume = ibu.wortVolume.value;

  if (ibu.preOrPostBoilVol.value == "preBoilVol") {
    preBoilVol = true;
  }
  // if volume is not pre-boil, it is post-boil, which is what we want
  if (!preBoilVol) {
    return wortVolume;
  }
  // otherwise, it is pre-boil, so we convert from pre- to post-boil volume
  // NOTE: this does not take into account evaporation that happens while
  //       the wort is heated but not yet boiling.  This could be fixed,
  //       but it would mean yet another parameter.  For now, keep it simple.
  postBoilVolume = wortVolume - (evapRate * boilTime/60.0);

  // make sure volume is never negative
  if (postBoilVolume < 0.0) {
    postBoilVolume = 0.0;
  }

  return postBoilVolume;
}

//------------------------------------------------------------------------------
// the public version of the private function... we need both forms because
// we check it both internally and externally.

this.getPostBoilVolume = function() {
  var postBoilVolume;
  postBoilVolume = get_postBoilVolume();
  return postBoilVolume;
}


//==============================================================================
// FUNCTIONS RELATED TO HOPS

//------------------------------------------------------------------------------
// functions for handling selection of hop variety

//------------------------------------------------------------------------------
// check if the hop form defaults within each addition are the current default.
// If they are, set to the (new) default value and update freshness factor
// and pellet factor.

function checkHopFormDefaults() {
  var arrayIdx = 0;
  var idx = 0;
  var numAdd = ibu.add.length;
  var userSet = 0;

  // console.log("CHECKING HOP FORM DEFAULTS FOR EACH ADDITION");
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    // check hop form
    userSet = ibu.add[arrayIdx].hopForm.userSet;
    // console.log("addition " + idx + " = " + userSet);
    if (!userSet) {
      ibu.add[arrayIdx].hopForm.defaultValue = ibu.defaultHopForm.value;
      common.set(ibu.add[arrayIdx].hopForm,0);
    }
    // check packaging
    userSet = ibu.add[arrayIdx].hopPackaging.userSet;
    if (!userSet) {
      ibu.add[arrayIdx].hopPackaging.defaultValue =
          get_hopPackaging_default(arrayIdx);
      common.set(ibu.add[arrayIdx].hopPackaging,0);
    }
    // check freshness factor
    userSet = ibu.add[arrayIdx].freshnessFactor.userSet;
    if (!userSet) {
      ibu.add[arrayIdx].freshnessFactor.defaultValue =
          get_freshnessFactor_default(arrayIdx);
      common.set(ibu.add[arrayIdx].freshnessFactor,0);
    }
    // check pellet factor
    userSet = ibu.add[arrayIdx].pelletFactor.userSet;
    if (!userSet) {
      ibu.add[arrayIdx].pelletFactor.defaultValue =
          get_pelletFactor_default(arrayIdx);
      common.set(ibu.add[arrayIdx].pelletFactor,0);
    }
  }

  return;
}

//------------------------------------------------------------------------------
// if the user selects a hop form, and if that form is "(default)",
// immediately change the value to the current default.
// Also, update freshness factor and pellet factor if not already set by user.

function checkHopFormDefaults2(arrayIdx) {
  var value = "";
  var variable = ibu.add[arrayIdx].hopForm;

  value = variable.value;
  if (value == "(default)") {
    variable.defaultValue = ibu.defaultHopForm.value;
    variable.value = ibu.defaultHopForm.value;
    variable.userSet = 0;
    if (document.getElementById(variable.id)) {
      document.getElementById(variable.id).value = variable.value;
      if (!variable.userSet && ("defaultColor" in variable)) {
        document.getElementById(variable.id).style.color=variable.defaultColor;
      } else {
        document.getElementById(variable.id).style.color = "black";
      }
    }
  }
  if (!ibu.add[arrayIdx].hopPackaging.userSet) {
    ibu.add[arrayIdx].hopPackaging.defaultValue =
        get_hopPackaging_default(arrayIdx);
    common.set(ibu.add[arrayIdx].hopPackaging,0);
  }
  if (!ibu.add[arrayIdx].freshnessFactor.userSet) {
    ibu.add[arrayIdx].freshnessFactor.defaultValue =
        get_freshnessFactor_default(arrayIdx);
    common.set(ibu.add[arrayIdx].freshnessFactor,0);
  }
  if (!ibu.add[arrayIdx].pelletFactor.userSet) {
    ibu.add[arrayIdx].pelletFactor.defaultValue =
        get_pelletFactor_default(arrayIdx);
    common.set(ibu.add[arrayIdx].pelletFactor,0);
  }
  return;
}

//------------------------------------------------------------------------------
// get default alpha-acid rating (either general or variety-specific)

function get_AA_default(arrayIdx) {
  var defaultValue = 8.75;  // average value over many varieties
  var value = 0.0;
  var variety = "";

  variety = ibu.add[arrayIdx].variety.value;
  value = defaultValue;
  console.log("VARIETY = " + variety);
  if (variety != "(unspecified)") {
    if (hops[variety].AA) {
      value = hops[variety].AA;
    }
  }

  return value;
}

//------------------------------------------------------------------------------
// get default beta-acid rating (either general or variety-specific)

function get_BA_default(param) {
  var AA = 0.0;
  var arrayIdx = param[0];
  var defaultAA = 0.0;
  var defaultValue = 5.0;  // approximate value over many varieties
  var scaling = 0.0;
  var source = param[1];
  var value = 0.0;
  var variety = "";

  variety = ibu.add[arrayIdx].variety.value;
  value = defaultValue;
  if (variety != "(unspecified)") {
    if (hops[variety].BA) {
      if (hops[variety].AA) {
        // The beta-acid percent varies with the alpha-acid percent.
        // Adjust the default BA by the known AA%.
        defaultAA = hops[variety].AA;
        AA = ibu.add[arrayIdx].AA.value;
        scaling = AA / defaultAA;
        value = scaling * hops[variety].BA;
        console.log(">>> orig BA = " + hops[variety].BA + "; with AA set to " +
                  AA + " and default AA of " + defaultAA + ", scaling is " +
                  scaling);
      } else {
        value = hops[variety].BA;
      }
    }
  }

  if (source == "AA") {
    common.set(ibu.add[arrayIdx].BA, 0);
  }

  return value;
}

//------------------------------------------------------------------------------
// get default percent loss over 6 months (either general or variety-specific)

function get_percentLoss_default(arrayIdx) {
  var defaultValue = 32.0;  // average value over many varieties
  var value = 0.0;
  var variety = "";

  variety = ibu.add[arrayIdx].variety.value;
  value = defaultValue;
  if (variety != "(unspecified)") {
    if (hops[variety].loss) {
      value = hops[variety].loss;
    }
  }

  return value;
}

//------------------------------------------------------------------------------
// get default storage duration

function get_storageDuration_default(arrayIdx) {
  var defaultValue = 9.0;  // random guess... somewhere between fresh and 18mo?
  return defaultValue;
}

//------------------------------------------------------------------------------
// get default storage conditions

function get_hopPackaging_default(arrayIdx) {
  var defaultValue = "";
  var tableID = "";

  if (ibu.add[arrayIdx].hopForm.value == "cones") {
    defaultValue = "vacuum seal";
  } else {
    defaultValue = "pro. nitrogen";
  }

  return defaultValue;
}

//------------------------------------------------------------------------------
// get default freshness factor
// This is a direct implementation of the Garetz method.
// It is assumed that cones are stored fairly well, but not in
//    professional nitrogen-flushed packaging.
// It is assumed that pellets may be stored in professional nitrogen-flushed
//    packaging and so have a higher likelihood of being fresh.

function get_freshnessFactor_default(arrayIdx) {
  var addIdx = arrayIdx + 1;
  var days = 0.0;
  var defaultValue = 0.90;
  var freshnessFactor = 0.0;
  var form = "";
  var HSI = 0.0;
  var k = 0.0;
  var loss = ibu.add[arrayIdx].percentLoss.value;
  var lossFactor = 0.0;
  var precision = 0;
  var SF = 0.0;
  var hopPackaging = ibu.add[arrayIdx].hopPackaging.value;
  var storageDuration_months = ibu.add[arrayIdx].storageDuration.value;
  var storageTemp = ibu.add[arrayIdx].storageTemp.value;
  var storageTempC = 0.0;
  var TF = 0.0;
  var value = 0.0;

  // if we have all the information needed for a decent estimate, use it.
  if (loss && hopPackaging && storageDuration_months >= 0 && storageTemp) {
    lossFactor = loss / 100.0;
    if (lossFactor >= 1.0) lossFactor = 0.99; // prevent divide by zero, ln(neg)
    k = Math.log(1.0/(1.0-lossFactor)) / 182.5;

    if (hopPackaging == "pro. nitrogen") {
      SF = 0.05;
    }
    else if (hopPackaging == "inert flush") {
      SF = 0.5;
    }
    else if (hopPackaging == "vacuum seal") {
      SF = 0.5;
    }
    else if (hopPackaging == "wrapped") {
      SF = 0.75;
    }
    else if (hopPackaging == "loose") {
      SF = 1.0;
    }

    days = storageDuration_months * 30.5;

    if (storageTemp == "room temp") {
      storageTempC = 20.0;
    }
    else if (storageTemp == "refrigerator") {
      storageTempC = 3.0;
    }
    else if (storageTemp == "freezer") {
      storageTempC = -20.0;
    }
    TF = 0.39685026299204984 * Math.exp(0.04620981203732968*storageTempC);

    freshnessFactor = 1.0 / Math.exp(k * TF * SF * days);
    HSI = Math.pow(10.0, (1.0 - freshnessFactor)/1.10) * 0.25;
    console.log("freshness: lossFactor=" + lossFactor.toFixed(2) +
                ", k=" + k.toFixed(5) +
                ", conditions='" + hopPackaging +
                "'=" + SF.toFixed(3) +
                ", duration=" + days.toFixed(1) + " days" +
                ", temp=" + storageTempC + "'C with factor=" + TF.toFixed(4));
    console.log("freshness: freshnessFactor = " + freshnessFactor.toFixed(3) +
                ", HSI = ", HSI.toFixed(4));
    value = freshnessFactor;
  // otherwise, pick a default value based on if it's cones or pellets
  } else {
    form = ibu.add[arrayIdx].hopForm.value;
    value = defaultValue;
    if (form == "cones") {
      value = 0.85;
    }
    if (form == "pellets") {
      value = 0.95;
    }
  }

  return value;
}

//------------------------------------------------------------------------------
// set freshness factor from the specified storage conditions

function set_freshnessFactor(arrayIdx) {
  var freshnessFactor = 0.0;

  freshnessFactor = get_freshnessFactor_default(arrayIdx);
  ibu.add[arrayIdx].freshnessFactor.defaultValue = freshnessFactor;
  common.set(ibu.add[arrayIdx].freshnessFactor, 0);

  return;
}

//------------------------------------------------------------------------------
// set storage conditions and freshness factor

function set_storageAndFreshnessFactor(arrayIdx) {
  var addIdx = Number(arrayIdx+1);
  var tableID = "ibu.add"+addIdx+".hopPackaging";
  var variable = ibu.add[arrayIdx].hopPackaging;

  // if user selected '(default)', change values based on form of hops
  if (variable.value == "(default)") {
    variable.userSet = 0;
    if (ibu.add[arrayIdx].hopForm.value == "cones") {
      variable.value = "vacuum seal";
      variable.defaultValue = "vacuum seal";
    } else {
      variable.value = "pro. nitrogen";
      variable.defaultValue = "pro. nitrogen";
    }
  }

  // change the value in the table and the color
  if (document.getElementById(tableID)) {
    if (document.getElementById(tableID).value == "(default)") {
      if (ibu.add[arrayIdx].hopForm.value == "cones") {
        document.getElementById(tableID).value = "vacuum seal";
        document.getElementById(tableID).style.color = ibu.defaultColor;
      } else {
        document.getElementById(tableID).value = "pro. nitrogen";
        document.getElementById(tableID).style.color = ibu.defaultColor;
      }
    } else {
    document.getElementById(tableID).style.color = "black";
    }
  }

  set_freshnessFactor(arrayIdx);

  return;
}

//------------------------------------------------------------------------------
// get the default scaling for pellets

function get_pelletFactor_default(arrayIdx) {
  var defaultValue = 1.0;  // do nothing
  var form = "";
  var value = 0.0;

  form = ibu.add[arrayIdx].hopForm.value;
  value = defaultValue;
  if (form == "cones") {
    value = 1.00;
  }
  if (form == "pellets") {
    if (ibu.defaultPelletFactor) {
      value = ibu.defaultPelletFactor;
    } else {
      value = 2.00;
    }
  }

  return value;
}

//------------------------------------------------------------------------------
// if user has set the hop variety, update the AA, BA, and percent loss
// values, if they are default values, to the variety-specific values

function setHopVariety(arrayIdx) {
  var AA = ibu.add[arrayIdx].AA;
  var BA = ibu.add[arrayIdx].BA;
  var loss = ibu.add[arrayIdx].percentLoss;
  if (AA) {
    common.set(AA, 0);
  }
  if (BA) {
    common.set(BA, 0);
  }
  if (loss) {
    common.set(loss, 0);
  }
  return;
}

//------------------------------------------------------------------------------
// build HTML table for hop varieties

function buildHops(tableID, addIdx, selection) {
  var count = 0;
  var countAA = 0.0;
  var countBA = 0.0;
  var countLoss = 0.0;
  var endIdx = 0;
  var firstLetter = "";
  var firstLetterInfo = [];
  var hIdx = 0;
  var hopVarieties = Object.keys(hops);
  var lIdx = 0;
  var limit = 15;
  var letter = "";
  var midIdx = 0;
  var menu = "";
  var origEndIdx = 0;
  var origStartIdx = 0;
  var secondLetter = "";
  var sIdx = 0;
  var splitCount = 0;
  var splitIdx = 0;
  var startIdx = 0;
  var submenu = "";
  var sumAA = 0.0;
  var sumBA = 0.0;
  var sumLoss = 0.0;
  var verbose = 0;

  // if list of hop variety letters hasn't been constructed yet, do so now
  if (ibu.letterList.length == 0) {
    // sort the hop varieties using case-insensitive sorting
    hopVarieties.sort((a,b) =>
        a.localeCompare(b, undefined, {sensitivity:'base'}));
    // get all of the first letters from all varieties, creating initial list
    sumAA = 0.0;
    sumBA = 0.0;
    sumLoss = 0.0;
    for (hIdx = 0; hIdx < hopVarieties.length; hIdx++) {
      firstLetter = hopVarieties[hIdx].charAt(0).toUpperCase();
      if (hops[hopVarieties[hIdx]].AA) {
        sumAA += hops[hopVarieties[hIdx]].AA;
        countAA += 1.0;
      }
      if (hops[hopVarieties[hIdx]].BA) {
        sumBA += hops[hopVarieties[hIdx]].BA;
        countBA += 1.0;
      }
      if (hops[hopVarieties[hIdx]].loss) {
        sumLoss += hops[hopVarieties[hIdx]].loss;
        countLoss += 1.0;
      }
      // search for first letter in current variety
      for (lIdx = 0; lIdx < ibu.letterList.length; lIdx++) {
        if (firstLetter == ibu.letterList[lIdx].letter) {
          break;
        }
      }
      if (lIdx >= ibu.letterList.length) {
        // if letter doesn't exist yet, create a new entry in letterList
        firstLetterInfo =
            { letter:firstLetter, count:1, startIdx:hIdx, endIdx:hIdx };
        ibu.letterList.push(firstLetterInfo);
      } else {
        // if letter does exist, update the count and end index of letterList
        count = ibu.letterList[lIdx].count;
        count += 1;
        endIdx = ibu.letterList[lIdx].endIdx;
        endIdx += 1;
        firstLetterInfo = { letter:firstLetter, count:count,
                            startIdx:ibu.letterList[lIdx].startIdx, endIdx };
        ibu.letterList[lIdx] = firstLetterInfo;
      }
    }
    if (verbose) {
      console.log("Have data on " + countAA + " varieties of hops");
      console.log("Average AA  = " + (sumAA / countAA).toFixed(2) + "%");
      console.log("Average BA  = " + (sumBA / countBA).toFixed(2) + "%");
      console.log("Average Loss = " + (sumLoss / countLoss).toFixed(2) + "%");
      console.log("ORIGINAL LETTER LIST: ");
      for (lIdx = 0; lIdx < ibu.letterList.length; lIdx++) {
        console.log("  " + ibu.letterList[lIdx].letter +
                    " count=" + ibu.letterList[lIdx].count +
                    " start=" + ibu.letterList[lIdx].startIdx +
                    " end=" + ibu.letterList[lIdx].endIdx);
      }
    }

    // revise the list, breaking up a letter with too many varieties
    // into two or more groupings (based on the second letter)
    for (lIdx = 0; lIdx < ibu.letterList.length; lIdx++) {
      if (ibu.letterList[lIdx].count > limit) {
        origStartIdx = ibu.letterList[lIdx].startIdx;
        origEndIdx = ibu.letterList[lIdx].endIdx;
        splitCount = parseInt((ibu.letterList[lIdx].count / limit) + 1);
        ibu.letterList.splice(lIdx, 1);  // remove item with too many varieties
        startIdx = origStartIdx;
        for (splitIdx = 0; splitIdx < splitCount; splitIdx++) {
          // get the index partway into the complete list
          midIdx = parseInt((origEndIdx - origStartIdx)*((splitIdx+1)/
                             splitCount) + origStartIdx);
          firstLetter = hopVarieties[midIdx].charAt(0).toUpperCase();
          // search the varieties for a change in the second letter
          secondLetter = hopVarieties[midIdx].charAt(1).toLowerCase();
          for (sIdx = midIdx + 1; sIdx <= origEndIdx; sIdx++) {
            if (secondLetter != hopVarieties[sIdx].charAt(1).toLowerCase()) {
              break;
            }
          }
          // get the second letter of the variety at the start of the list
          secondLetter = hopVarieties[startIdx].charAt(1).toLowerCase();
          count = sIdx - startIdx;
          if (count == 0) {
            continue;
          }
          // update letterList with small grouping
          firstLetterInfo =
              { letter:firstLetter+secondLetter,
                count:count, startIdx:startIdx, endIdx:sIdx-1 };
          ibu.letterList.splice(lIdx+splitIdx, 0, firstLetterInfo);
          startIdx = sIdx;
        }
      }
    }
    if (verbose) {
      console.log("REVISED LETTER LIST: ");
      for (lIdx = 0; lIdx < ibu.letterList.length; lIdx++) {
        console.log("  " + ibu.letterList[lIdx].letter +
                    " count=" + ibu.letterList[lIdx].count +
                    " start=" + ibu.letterList[lIdx].startIdx +
                    " end=" + ibu.letterList[lIdx].endIdx);
      }
    }
  }

  // construct dropdown menu of first letters

  // specify highest level dropdown menu button
  menu = "<div id='"+tableID+"' class='dropdown'> <button id='ibu.add"+addIdx+".variety' onclick='ibu.varietySelect1(\""+addIdx+"\")' class='dropbtn' value='"+selection+"'>"+selection+"</button><div id='varietyDropdown"+addIdx+"' class='dropdown-content'>";

  // first dropdown item is always '(unspecified)'
  submenu = "<div id=unspecified class='dropdown'><button onclick='ibu.varietySelect3(\""+addIdx+"\",\"(unspecified)\")' class='dropbtn'>(unspecified)</button></div><br>";
  menu += submenu;

  // for each first letter in varities, construct dropdown menu
  for (lIdx = 0; lIdx < ibu.letterList.length; lIdx++) {
    letter = ibu.letterList[lIdx].letter;
    submenu = "<div id=letter"+letter+" class='dropdown'><button onclick='ibu.varietySelect2(\""+addIdx+"\",\""+letter+"\")' class='dropbtn'>"+letter+"...</button><div id='varietyDropdown"+addIdx+letter+"'></div></div>";
    menu += submenu;
  }

  return menu;
}

//------------------------------------------------------------------------------
// function to select hop variety at first level

this.varietySelect1 = function(addIdx) {
  var dropdownMenu = "varietyDropdown" + addIdx;
  var origClassList = document.getElementById(dropdownMenu).classList;
  var selection = "";

  // user clicked on top-level dropdown menu button, so show the menu
  console.log("clicked on first-level dropdown for addition " + addIdx);

  // get the current selection associated with the hop addition
  selection = document.getElementById("ibu.add"+addIdx+".variety").innerHTML;

  // rebuild the first-level menu in case the user selected a letter
  // and then changed their mind and selected the original item.
  document.getElementById("ibu.add"+addIdx+".varietyMenu").innerHTML =
        buildHops("ibu.add"+addIdx+".varietyMenu", addIdx, selection);

  // note: simply toggling 'show' doesn't work; need to know if the
  //       menu *was* being shown when we entered this routine, before
  //       rebuilding the first-level menu.
  if (origClassList.contains('show')) {
    document.getElementById(dropdownMenu).classList.remove('show');
    // set the current selection to black (otherwise it remains gray)
    document.getElementById("ibu.add"+addIdx+".variety").style.color = "black";
  } else {
    document.getElementById(dropdownMenu).classList.add('show');
  }


  return;
}

//------------------------------------------------------------------------------
// function to select hop variety at second level

this.varietySelect2 = function(addIdx, letter) {
  var endIdx = 0;
  var hIdx = 0;
  var hopVarieties = Object.keys(hops);
  var lIdx = 0;
  var startIdx = 0;
  var submenu = "";
  var varietyId1 = "";  // ID of first-level dropdown for variety
  var varietyId2 = "";  // ID of second-level dropdown for variety (letter)

  // user clicked on second-level dropdown menu button, so show the
  // specific varieties associated with this letter
  console.log("clicked on second-level dropdown");

  // change the submenu to the list of specific varieties
  submenu = "<div id=letter"+letter+" class='dropdown'><div id='varietyDropdown"+addIdx+""+letter+"' class='dropdown-content'>";
  for (lIdx = 0; lIdx < ibu.letterList.length; lIdx++) {
    if (letter == ibu.letterList[lIdx].letter) {
      startIdx = ibu.letterList[lIdx].startIdx;
      endIdx = ibu.letterList[lIdx].endIdx;
      break
    }
  }

  for (hIdx = startIdx; hIdx <= endIdx; hIdx++) {
    submenu += "<button class='dropbtn' onclick='ibu.varietySelect3(\""+addIdx+"\",\""+hopVarieties[hIdx]+"\")'>"+hopVarieties[hIdx]+"</button><br>";
  }
  submenu += "</div></div>";

  varietyId1 = "varietyDropdown" + addIdx;
  varietyId2 = "varietyDropdown" + addIdx + letter;
  console.log("varietyId1 = " + varietyId1 + "; varietyId2 = " + varietyId2);

  // set the menu to the list of varieties, and show this list
  document.getElementById(varietyId1).innerHTML = submenu;
  document.getElementById(varietyId2).classList.toggle('show');

  return;
}

//------------------------------------------------------------------------------
// function to select hop variety at third level

this.varietySelect3 = function(addIdx, variety) {
  // user clicked on third-level (final) dropdown menu button, so
  // set the hop variety
  var arrayIdx = 0;
  var tableID = "";

  console.log("clicked on third-level dropdown, addIdx = " +
                addIdx + " variety : " + variety);
  tableID = "ibu.add"+addIdx+".variety";
  // document.getElementById(tableID).innerHTML = variety;

  // rebuild pulldown menu to choose any letter (and set the variety in ibu)
  tableID = "ibu.add"+addIdx+".varietyMenu";
  document.getElementById(tableID).innerHTML =
      buildHops(tableID, addIdx, variety);

  arrayIdx = Number(addIdx-1);
  console.log("setting to " + variety);
  console.log("id = " + ibu.add[arrayIdx].variety.id);
  ibu.add[arrayIdx].variety.value = variety;
  ibu.add[arrayIdx].variety.userSet = 1;
  common.set(ibu.add[arrayIdx].variety, 1);

  return;
}

//------------------------------------------------------------------------------
// hide hop-selection dropdown buttons if click on something else

window.onclick = function(event) {
  var addIdx = "";
  var allDropdowns = null;
  var idx = 0;
  var openDropdown = null;
  var selection = "";

  // if click not on dropdown menu button, hide all dropdown menu(s)
  if (!event.target.matches('.dropbtn')) {
    allDropdowns = document.getElementsByClassName("dropdown-content");
    for (idx = 0; idx < allDropdowns.length; idx++) {
      openDropdown = allDropdowns[idx];
      // if dropdown is currently shown, hide it
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
        // get the addition index of the dropdown menu
        addIdx = openDropdown.id.match('(?:Dropdown)([0-9]+)')[1];
        // get the current selection associated with the hop addition
        selection = document.getElementById("ibu.add"+addIdx+".variety").innerHTML;
        // rebuild the top-level hop-selection menu and set the selection
        // to the current selection
        document.getElementById("ibu.add"+addIdx+".varietyMenu").innerHTML =
            buildHops("ibu.add"+addIdx+".varietyMenu", addIdx, selection);
        // set the current selection to black (otherwise it remains gray)
        document.getElementById("ibu.add"+addIdx+".variety").style.color = "black";
      }
    }
  }
  return;
}

//==============================================================================
// FUNCTION TO INITIALIZE TABLE HOP HOP ADDITIONS AND OUTPUTS

//------------------------------------------------------------------------------
// set table of hops additions, using either already-set values or defaults,
// and set table of output values

function hopAdditionsSet(param) {
  var arrayIdx = 0;
  var constructInputTable = false;
  var constructOutputTable = false;
  var currentVariety = "";
  var hopDecayMethod = "decayFactor";
  var idx = 1;
  var numAdd = ibu.numAdditions.value;
  var steepUnitsID = "";
  var table = "";
  var tableID = "";
  var units = "";
  var updateFunctionName = param[0];
  var updateFunction = param[1];
  var varietyDefault = "(unspecified)";
  var varietyMenu = "";
  var weightDefault = 0.0;
  var weightUnits = 0;

  console.log(" ------ SETTING HOPS ADDITIONS ------ ");

  // if calling function was unable to specify the update function,
  // get it from a different variable.  Assume scalingFactor already set.
  if (updateFunction == "" || typeof updateFunction == "undefined") {
    if (ibu.scalingFactor) {
      updateFunction = ibu.scalingFactor.updateFunction;
      } else {
      window.alert("Internal error: can't determine update function");
      }
    }

  if (ibu.hopDecayMethod) {
    hopDecayMethod = ibu.hopDecayMethod.value;
  }
  if (ibu.hopTableSize == null) {
    ibu.hopTableSize = 3;
  }
  console.log("  HOP TABLE SIZE: " + ibu.hopTableSize);
  // remove any existing array items
  while (ibu.add.length > 0) {
    ibu.add.pop();
  }

  units = ibu.units.value;
  if (units == "metric") {
    weightUnits = "g";
    weightDefault = common.convertOuncesToGrams(weightDefault);
  } else {
    weightUnits = "oz";
  }

  constructInputTable = false;
  if (document.getElementById("hopsAdditionsTableDiv")) {
    constructInputTable = true;
  }
  constructOutputTable = false;
  if (document.getElementById("outputTableDiv")) {
    constructOutputTable = true;
  }
  console.log("CONSTRUCT: " + constructInputTable +
              " and " + constructOutputTable);

  if (constructInputTable) {
    table += "<table style='margin-left:2em' id='hopsAdditionsTable'> "
    table += "<tbody> "
    table += "<tr> "
    table += "<td> </td>"
    for (idx = 1; idx <= numAdd; idx++) {
      if (numAdd <= 1) {
        table += "<td> </td> "
      } else {
        table += "<td>Addition "+idx+" </td> "
      }
    }
  }

  // set up array of hops additions
  for (idx = 1; idx <= numAdd; idx++) {
    var hops = new Object;
    ibu.add.push(hops);
  }

  if (constructInputTable && ibu.hopTableSize >= 6) {
    table += "</tr> "
    table += "<tr> "
    table += "<td> Variety:</td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".varietyMenu";
    // create the object and then build the table so that we can get
    // any existing value or the default if none yet exists
    ibu.add[arrayIdx].variety = new Object;
    ibu.add[arrayIdx].variety.id = "ibu.add"+idx+".variety";
    ibu.add[arrayIdx].variety.inputType = "select";
    ibu.add[arrayIdx].variety.userSet = 0;
    ibu.add[arrayIdx].variety.display = varietyDefault;
    ibu.add[arrayIdx].variety.description = "hop variety";
    ibu.add[arrayIdx].variety.defaultValue = varietyDefault;
    ibu.add[arrayIdx].variety.updateFunction = updateFunction;
    ibu.add[arrayIdx].variety.additionalFunction = setHopVariety;
    ibu.add[arrayIdx].variety.additionalFunctionArgs = arrayIdx;
    ibu.add[arrayIdx].variety.parent = "ibu";
    // now that we have 'variety', build the table of hop varieties
    if (constructInputTable && ibu.hopTableSize >= 6) {
      common.set(ibu.add[arrayIdx].variety,0);  // get saved value if any
      currentVariety = ibu.add[arrayIdx].variety.value;
      varietyMenu = buildHops(tableID, idx, currentVariety);
      table += "<td>"+varietyMenu+"</td>";
    }
  }

  if (constructInputTable && ibu.hopTableSize >= 4) {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> Form of Hops: </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".hopForm";
    if (constructInputTable && ibu.hopTableSize >= 4) {
      table += "<td> <select style='width:7.4em;' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].hopForm,1)'> <option value='cones'>cones</option> <option value='pellets'>pellets</option> <option value='(default)'>(default)</option></td> "
    }
    ibu.add[arrayIdx].hopForm = new Object;
    ibu.add[arrayIdx].hopForm.id = tableID;
    ibu.add[arrayIdx].hopForm.inputType = "select";
    ibu.add[arrayIdx].hopForm.userSet = 0;
    ibu.add[arrayIdx].hopForm.description = "form of hops";
    ibu.add[arrayIdx].hopForm.defaultValue = ibu.defaultHopForm.value;
    ibu.add[arrayIdx].hopForm.defaultColor = ibu.defaultColor;
    ibu.add[arrayIdx].hopForm.updateFunction = updateFunction;
    ibu.add[arrayIdx].hopForm.additionalFunction = checkHopFormDefaults2;
    ibu.add[arrayIdx].hopForm.additionalFunctionArgs = arrayIdx;
    ibu.add[arrayIdx].hopForm.parent = "ibu";
  }

  if (constructInputTable) {
    table += "</tr> "
    table += "<tr> "
    table += "<td> Alpha Acid (%):</td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".AA";
    if (constructInputTable) {
      table += "<td> <input type='text' size='6' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].AA,1)'></td> "
    }
    ibu.add[arrayIdx].AA = new Object;
    ibu.add[arrayIdx].AA.id = tableID;
    ibu.add[arrayIdx].AA.inputType = "float";
    ibu.add[arrayIdx].AA.userSet = 0;
    ibu.add[arrayIdx].AA.precision = 1;
    ibu.add[arrayIdx].AA.minPrecision = 1;
    ibu.add[arrayIdx].AA.display = "";
    ibu.add[arrayIdx].AA.min = 0.0;
    ibu.add[arrayIdx].AA.max = 100.0;
    ibu.add[arrayIdx].AA.description = "hops AA rating";
    ibu.add[arrayIdx].AA.defaultFunction = get_AA_default;
    ibu.add[arrayIdx].AA.defaultArgs = arrayIdx;
    ibu.add[arrayIdx].AA.defaultColor = ibu.defaultColor;
    ibu.add[arrayIdx].AA.updateFunction = updateFunction;
    ibu.add[arrayIdx].AA.additionalFunction = get_BA_default;
    ibu.add[arrayIdx].AA.additionalFunctionArgs = [arrayIdx, "AA"];
    ibu.add[arrayIdx].AA.parent = "ibu";
  }

  if (constructInputTable && ibu.hopTableSize >= 13) {
    table += "</tr> "
    table += "<tr> "
    table += "<td> Beta Acid (%):</td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".BA";
    if (constructInputTable && ibu.hopTableSize >= 13) {
      table += "<td> <input type='text' size='6' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].BA,1)'> </td> "
    }
    ibu.add[arrayIdx].BA = new Object;
    ibu.add[arrayIdx].BA.id = tableID;
    ibu.add[arrayIdx].BA.inputType = "float";
    ibu.add[arrayIdx].BA.userSet = 0;
    ibu.add[arrayIdx].BA.precision = 1;
    ibu.add[arrayIdx].BA.minPrecision = 1;
    ibu.add[arrayIdx].BA.display = "";
    ibu.add[arrayIdx].BA.min = 0.0;
    ibu.add[arrayIdx].BA.max = 100.0;
    ibu.add[arrayIdx].BA.description = "hops beta acid rating";
    ibu.add[arrayIdx].BA.defaultFunction = get_BA_default;
    ibu.add[arrayIdx].BA.defaultArgs = [arrayIdx, "BA"];
    ibu.add[arrayIdx].BA.defaultColor = ibu.defaultColor;
    ibu.add[arrayIdx].BA.updateFunction = updateFunction;
    ibu.add[arrayIdx].BA.parent = "ibu";
  }

  if (constructInputTable && ibu.hopTableSize >= 7 &&
      hopDecayMethod == "decaySpecify") {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> % Loss (6mos,RT): </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".percentLoss";
    if (constructInputTable && ibu.hopTableSize >= 7 &&
        hopDecayMethod == "decaySpecify") {
      table += "<td> <input type='text' size='6' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].percentLoss,1)'> </td> "
    }
    ibu.add[arrayIdx].percentLoss = new Object;
    ibu.add[arrayIdx].percentLoss.id = tableID;
    ibu.add[arrayIdx].percentLoss.inputType = "float";
    ibu.add[arrayIdx].percentLoss.userSet = 0;
    ibu.add[arrayIdx].percentLoss.precision = 2;
    ibu.add[arrayIdx].percentLoss.minPrecision = 1;
    ibu.add[arrayIdx].percentLoss.display = "";
    ibu.add[arrayIdx].percentLoss.min = 0.0;
    ibu.add[arrayIdx].percentLoss.max = 100.0;
    ibu.add[arrayIdx].percentLoss.description = "percent loss of alpha acids after six months at room temperature";
    ibu.add[arrayIdx].percentLoss.defaultFunction = get_percentLoss_default;
    ibu.add[arrayIdx].percentLoss.defaultArgs = arrayIdx;
    ibu.add[arrayIdx].percentLoss.defaultColor = ibu.defaultColor;
    ibu.add[arrayIdx].percentLoss.additionalFunction = set_freshnessFactor;
    ibu.add[arrayIdx].percentLoss.additionalFunctionArgs = arrayIdx;
    ibu.add[arrayIdx].percentLoss.updateFunction = updateFunction;
    ibu.add[arrayIdx].percentLoss.parent = "ibu";
  }

  if (constructInputTable && ibu.hopTableSize >= 8 &&
      hopDecayMethod == "decaySpecify") {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> Packaging: </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".hopPackaging";
    if (constructInputTable && ibu.hopTableSize >= 8 &&
        hopDecayMethod == "decaySpecify") {
      table += "<td> <select style='width:8.4em;' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].hopPackaging,1)'> <option value='pro. nitrogen'>pro. nitrogen</option> <option value='inert flush'>inert flush</option> <option value='vacuum seal'>vacuum seal</option> <option value='wrapped'>wrapped</option> <option value='loose'>loose</option> <option value='(default)'>(default)</option></td> "
    }
    ibu.add[arrayIdx].hopPackaging = new Object;
    ibu.add[arrayIdx].hopPackaging.id = tableID;
    ibu.add[arrayIdx].hopPackaging.inputType = "select";
    ibu.add[arrayIdx].hopPackaging.userSet = 0;
    ibu.add[arrayIdx].hopPackaging.description = "storage conditions";
    ibu.add[arrayIdx].hopPackaging.defaultFunction =
                      get_hopPackaging_default;
    ibu.add[arrayIdx].hopPackaging.defaultArgs = arrayIdx;
    ibu.add[arrayIdx].hopPackaging.additionalFunction =
                      set_storageAndFreshnessFactor;
    ibu.add[arrayIdx].hopPackaging.additionalFunctionArgs = arrayIdx;
    ibu.add[arrayIdx].hopPackaging.updateFunction = updateFunction;
    ibu.add[arrayIdx].hopPackaging.parent = "ibu";
  }

  if (constructInputTable && ibu.hopTableSize >= 9 &&
      hopDecayMethod == "decaySpecify") {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> Storage Duration: </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".storageDuration";
    if (constructInputTable && ibu.hopTableSize >= 9 &&
        hopDecayMethod == "decaySpecify") {
      table += "<td> <input type='text' size='3.0' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].storageDuration,1)'> <small>months</small></td> "
    }
    ibu.add[arrayIdx].storageDuration = new Object;
    ibu.add[arrayIdx].storageDuration.id = tableID;
    ibu.add[arrayIdx].storageDuration.inputType = "float";
    ibu.add[arrayIdx].storageDuration.userSet = 0;
    ibu.add[arrayIdx].storageDuration.precision = 1;
    ibu.add[arrayIdx].storageDuration.minPrecision = 0;
    ibu.add[arrayIdx].storageDuration.display = "";
    ibu.add[arrayIdx].storageDuration.min = 0.0;
    ibu.add[arrayIdx].storageDuration.max = 120.0;
    ibu.add[arrayIdx].storageDuration.description = "storage duration (months)";
    ibu.add[arrayIdx].storageDuration.defaultFunction = get_storageDuration_default;
    ibu.add[arrayIdx].storageDuration.defaultArgs = arrayIdx;
    ibu.add[arrayIdx].storageDuration.defaultColor = ibu.defaultColor;
    ibu.add[arrayIdx].storageDuration.additionalFunction = set_freshnessFactor;
    ibu.add[arrayIdx].storageDuration.additionalFunctionArgs = arrayIdx;
    ibu.add[arrayIdx].storageDuration.updateFunction = updateFunction;
    ibu.add[arrayIdx].storageDuration.parent = "ibu";
  }

  if (constructInputTable && ibu.hopTableSize >= 10 &&
      hopDecayMethod == "decaySpecify") {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> Storage Temperature: </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".storageTemp";
    if (constructInputTable && ibu.hopTableSize >= 10 &&
        hopDecayMethod == "decaySpecify") {
      table += "<td> <select style='width:8.4em;' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].storageTemp,1)'> <option value='room temp'>room temp</option> <option value='refrigerator'>refrigerator</option> <option value='freezer'>freezer</option></td> "
    }
    ibu.add[arrayIdx].storageTemp = new Object;
    ibu.add[arrayIdx].storageTemp.id = tableID;
    ibu.add[arrayIdx].storageTemp.inputType = "select";
    ibu.add[arrayIdx].storageTemp.userSet = 0;
    ibu.add[arrayIdx].storageTemp.description = "storage temperature";
    ibu.add[arrayIdx].storageTemp.defaultValue = "room temp";
    ibu.add[arrayIdx].storageTemp.additionalFunction = set_freshnessFactor;
    ibu.add[arrayIdx].storageTemp.additionalFunctionArgs = arrayIdx;
    ibu.add[arrayIdx].storageTemp.updateFunction = updateFunction;
    ibu.add[arrayIdx].storageTemp.parent = "ibu";
  }

  if (constructInputTable &&
      (ibu.hopTableSize >= 7 && hopDecayMethod == "decayFactor") ||
      (ibu.hopTableSize >= 11 && hopDecayMethod == "decaySpecify")) {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> <a href='hop_freshness.html'>Freshness Factor</a>: </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".freshnessFactor";
    if (constructInputTable &&
        (ibu.hopTableSize >= 7 && hopDecayMethod == "decayFactor") ||
        (ibu.hopTableSize >= 11 && hopDecayMethod == "decaySpecify")) {
      table += "<td> <input type='text' size='6' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].freshnessFactor,1)'> </td> "
    }
    ibu.add[arrayIdx].freshnessFactor = new Object;
    ibu.add[arrayIdx].freshnessFactor.id = tableID;
    ibu.add[arrayIdx].freshnessFactor.inputType = "float";
    ibu.add[arrayIdx].freshnessFactor.userSet = 0;
    ibu.add[arrayIdx].freshnessFactor.precision = 2;
    ibu.add[arrayIdx].freshnessFactor.minPrecision = 2;
    ibu.add[arrayIdx].freshnessFactor.display = "";
    ibu.add[arrayIdx].freshnessFactor.min = 0.0;
    ibu.add[arrayIdx].freshnessFactor.max = 1.0;
    ibu.add[arrayIdx].freshnessFactor.description = "hops freshness factor";
    ibu.add[arrayIdx].freshnessFactor.defaultFunction = get_freshnessFactor_default;
    ibu.add[arrayIdx].freshnessFactor.defaultArgs = arrayIdx;
    ibu.add[arrayIdx].freshnessFactor.defaultColor = ibu.defaultColor;
    ibu.add[arrayIdx].freshnessFactor.updateFunction = updateFunction;
    ibu.add[arrayIdx].freshnessFactor.parent = "ibu";
  }

  if (constructInputTable && ibu.hopTableSize >= 5) {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> Pellet Factor: </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".pelletFactor";
    if (constructInputTable && ibu.hopTableSize >= 5) {
      table += "<td> <input type='text' size='6' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].pelletFactor,1)'> </td> "
    }
    ibu.add[arrayIdx].pelletFactor = new Object;
    ibu.add[arrayIdx].pelletFactor.id = tableID;
    ibu.add[arrayIdx].pelletFactor.inputType = "float";
    ibu.add[arrayIdx].pelletFactor.userSet = 0;
    ibu.add[arrayIdx].pelletFactor.precision = 2;
    ibu.add[arrayIdx].pelletFactor.minPrecision = 2;
    ibu.add[arrayIdx].pelletFactor.display = "";
    ibu.add[arrayIdx].pelletFactor.min = 1.0;
    ibu.add[arrayIdx].pelletFactor.max = 10.0;
    ibu.add[arrayIdx].pelletFactor.description = "hops pellet factor";
    ibu.add[arrayIdx].pelletFactor.defaultFunction = get_pelletFactor_default;
    ibu.add[arrayIdx].pelletFactor.defaultArgs = arrayIdx;
    ibu.add[arrayIdx].pelletFactor.defaultColor = ibu.defaultColor;
    ibu.add[arrayIdx].pelletFactor.updateFunction = updateFunction;
    ibu.add[arrayIdx].pelletFactor.parent = "ibu";
  }

  if (constructInputTable) {
    table += "</tr> "
    table += "<tr> "
    table += "<td> Weight (<span id='weightUnits'>"+weightUnits+"</span>):</td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".weight";
    if (constructInputTable) {
      table += "<td> <input type='text' size='6' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].weight,1)'> </td> "
    }
    ibu.add[arrayIdx].weight = new Object;
    ibu.add[arrayIdx].weight.id = tableID;
    ibu.add[arrayIdx].weight.inputType = "float";
    ibu.add[arrayIdx].weight.userSet = 0;
    ibu.add[arrayIdx].weight.convertToMetric = common.convertOuncesToGrams;
    ibu.add[arrayIdx].weight.convertToImperial = common.convertGramsToOunces;
    ibu.add[arrayIdx].weight.precision = 1;
    ibu.add[arrayIdx].weight.minPrecision = 1;
    ibu.add[arrayIdx].weight.display = "";
    ibu.add[arrayIdx].weight.min = 0.0;
    ibu.add[arrayIdx].weight.max = 1000.0;
    ibu.add[arrayIdx].weight.description = "hops weight";
    ibu.add[arrayIdx].weight.defaultValue = weightDefault;
    ibu.add[arrayIdx].weight.updateFunction = updateFunction;
    ibu.add[arrayIdx].weight.parent = "ibu";
  }

  if (constructInputTable && ibu.hopTableSize >= 12) {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> Kettle <small>or</small> Dry Hop: </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".kettleOrDryHop";
    if (constructInputTable && ibu.hopTableSize >= 12) {
      table += "<td> <select style='width:7.4em;' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].kettleOrDryHop,1)'> <option value='kettle'>kettle</option> <option value='dryHop'>dry hop</option></td> "
    }
    arrayIdx = Number(idx-1);
    ibu.add[arrayIdx].kettleOrDryHop = new Object;
    ibu.add[arrayIdx].kettleOrDryHop.id = tableID;
    ibu.add[arrayIdx].kettleOrDryHop.inputType = "select";
    ibu.add[arrayIdx].kettleOrDryHop.userSet = 0;
    ibu.add[arrayIdx].kettleOrDryHop.description = "kettle or dry hop";
    ibu.add[arrayIdx].kettleOrDryHop.defaultValue = "kettle";
    ibu.add[arrayIdx].kettleOrDryHop.additionalFunction = updateSteepUnits;
    ibu.add[arrayIdx].kettleOrDryHop.additionalFunctionArgs = idx;
    ibu.add[arrayIdx].kettleOrDryHop.updateFunction = updateFunction;
    ibu.add[arrayIdx].kettleOrDryHop.parent = "ibu";
  }

  if (constructInputTable) {
    table += "</tr> ";
    table += "<tr> ";
    // change description depending on if model accounts for post-boil additions
    if (updateFunctionName == "mIBU" || updateFunctionName == "SMPH") {
      table += "<td> Boil <small>or</small> Steep Time: </td> "
    } else {
      table += "<td> Boil Time: </td> "
    }
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    tableID = "ibu.add"+idx+".steepTimeTable";
    steepUnitsID = "ibu.add"+idx+".steepUnits";
    if (constructInputTable) {
      table += "<td> <input type='text' size='4' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].steepTime,1)'> <small><span id='"+steepUnitsID+"'>min</span></small> </td> "
    }
    arrayIdx = Number(idx-1);
    ibu.add[arrayIdx].steepTime = new Object;
    ibu.add[arrayIdx].steepTime.id = tableID;
    ibu.add[arrayIdx].steepTime.inputType = "float";
    ibu.add[arrayIdx].steepTime.userSet = 0;
    ibu.add[arrayIdx].steepTime.precision = 0;
    ibu.add[arrayIdx].steepTime.minPrecision = 0;
    ibu.add[arrayIdx].steepTime.display = "";
    ibu.add[arrayIdx].steepTime.min = -120.0;
    ibu.add[arrayIdx].steepTime.max = 360.0;
    ibu.add[arrayIdx].steepTime.description = "hops steep time";
    ibu.add[arrayIdx].steepTime.defaultValue = 0.0;
    ibu.add[arrayIdx].steepTime.additionalFunction = checkBoilTime;
    ibu.add[arrayIdx].steepTime.additionalFunctionArgs = "";
    ibu.add[arrayIdx].steepTime.updateFunction = updateFunction;
    ibu.add[arrayIdx].steepTime.parent = "ibu";
  }


  if (constructInputTable) {
    table += "</tr> ";
    table += "</tbody> ";
    table += "</table> ";
    document.getElementById('hopsAdditionsTableDiv').innerHTML = table;
  }


  // get correct values for table, either defaults or set values
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    common.set(ibu.add[arrayIdx].variety,0);
    common.set(ibu.add[arrayIdx].hopForm,0);
    common.set(ibu.add[arrayIdx].AA,0);
    common.set(ibu.add[arrayIdx].BA,0);
    common.set(ibu.add[arrayIdx].freshnessFactor,0);
    common.set(ibu.add[arrayIdx].percentLoss,0);
    common.set(ibu.add[arrayIdx].hopPackaging,0);
    common.set(ibu.add[arrayIdx].storageDuration,0);
    common.set(ibu.add[arrayIdx].storageTemp,0);
    common.set(ibu.add[arrayIdx].pelletFactor,0);
    common.set(ibu.add[arrayIdx].weight,0);
    common.set(ibu.add[arrayIdx].kettleOrDryHop,0);
    common.set(ibu.add[arrayIdx].steepTime,0);
  }

  // initialize some outputs to zero
  // each method (mIBU, SMPH) has additional variables
  for (idx = 1; idx <= numAdd; idx++) {
    ibu.add[arrayIdx].IBU = 0.0;
    ibu.add[arrayIdx].U = 0.0;
  }
  ibu.IBU = 0.0;
  ibu.U = 0.0;

  if (constructOutputTable) {
    table = "";
    table += "<table style='margin-left:3em' id='outputTable'> "
    table += "<tr> "
    table += "<td class='outputTableCellName'> </td>"
    for (idx = 1; idx <= numAdd; idx++) {
      if (numAdd <= 1) {
        table += "<td> </td> "
      } else {
        table += "<td>Addition "+idx+" </td> "
      }
    }
    // add spaces so that 'perceived bitterness' doesn't wrap around
    if (numAdd < 7) {
      for (idx = numAdd; idx < 7; idx++) {
        table += "<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>"
      }
    }
    table += "</tr> "

    table += "<tr> "
    table += "<td class='outputTableCellName'>Utilization (%):</td> "
    for (idx = 1; idx <= numAdd; idx++) {
      table += "<td class='outputTableCellValue' id='addUtilValue"+idx+"'>0.00</td> "
    }
    table += "</tr> "

    if (ibu.detailedOutput) {
      table += "<tr> "
      table += "<td class='outputTableCellName'>IAA (ppm):</td> "
      for (idx = 1; idx <= numAdd; idx++) {
        table += "<td class='outputTableCellValue' id='addIAAValue"+idx+"'>0.00</td> "
      }
      table += "</tr> "

      table += "<tr> "
      table += "<td class='outputTableCellName'><em>&alpha;</em> acids <small>(IAA<sub>eq</sub>)</small>:</td> "
      for (idx = 1; idx <= numAdd; idx++) {
        table += "<td class='outputTableCellValue' id='addAAValue"+idx+"'>0.00</td> "
      }
      table += "</tr> "

      table += "<tr> "
      table += "<td class='outputTableCellName'>oxidized <em>&alpha;</em> acids <small>(IAA<sub>eq</sub>)</small>:</td> "
      for (idx = 1; idx <= numAdd; idx++) {
        table += "<td class='outputTableCellValue' id='addoAAValue"+idx+"'>0.00</td> "
      }
      table += "</tr> "

      table += "<tr> "
      table += "<td class='outputTableCellName'>oxidized <em>&beta;</em> acids <small>(IAA<sub>eq</sub>)</small>:</td> "
      for (idx = 1; idx <= numAdd; idx++) {
        table += "<td class='outputTableCellValue' id='addoBAValue"+idx+"'>0.00</td> "
      }
      table += "</tr> "

      table += "<tr> "
      table += "<td class='outputTableCellName'>polyphenols <small>(IAA<sub>eq</sub>)</small>:</td> "
      for (idx = 1; idx <= numAdd; idx++) {
        table += "<td class='outputTableCellValue' id='addPPValue"+idx+"'>0.00</td> "
      }
      table += "</tr> "
    }

    table += "<tr> "
  if (numAdd > 1) {
      table += "<td class='outputTableCellName'>IBUs from each:</td> "
    } else {
      table += "<td class='outputTableCellName'>IBUs:</td> "
    }
    for (idx = 1; idx <= numAdd; idx++) {
      table += "<td class='outputTableCellValue' id='addIBUvalue"+idx+"'>0.00</td> "
    }
    table += "</tr> ";
    table += "<tr> ";
    table += "<td class='outputTableTotalName'>--------------</td> ";
    table += "</tr> ";
    table += "<tr> ";
    table += "<td class='outputTableTotalName'>Total IBUs:</td>"
    table += "<td class='outputTableTotalValue' id='totalIBUvalue'>0.00</td>"
    table += "</tr> ";

    if (ibu.detailedOutput) {
      table += "<tr> ";
      table += "<td class='outputTableTotalName'><a href='https://www.researchgate.net/publication/323690039_A_Comprehensive_Evaluation_of_the_Nonvolatile_Chemistry_Affecting_the_Sensory_Bitterness_Intensity_of_Highly_Hopped_Beers' target='_blank'>Bitterness Intensity</a>:</td>"
      table += "<td class='outputTableTotalValue' id='BIvalue'>0.00</td>"
      table += "<td colspan=100 class='outputTableTotalName'><small>(perceived bitterness, scale 0 to 20";
      // table += "<sup>&dagger;</sup>";
      table += ")</small></td>";
      table += "</tr> ";
      table += "<tr><td>&nbsp;</td></tr>";
      table += "<tr> ";
      // table += "</table>";
      // table += "<table style='margin-left:3em'> ";
      // table += "<td>"
      // table += "<sup>&dagger;</sup><small>C.D. Hahn, S.R. Lafontaine, C.B. Pereira, and T.H. Shellhammer, \"Evaluation of Nonvolatile Chemistry Affecting the Sensory Bitterness Intensity of Highly Hopped Beers\", <em>J. Agric. Food Chem.</em>, 2018, 66 (13), pp. 3505-3513</small>";
      // table += "</td> ";
      // table += "</tr>";
      }
    table += "</table>";
    table += "<table style='margin-left:3em' id='outputFootnote'> "
    table += "<td> </td>";
    table += "</table>";
    document.getElementById('outputTableDiv').innerHTML = table;
  }

  return true;
}


//==============================================================================
// FUNCTIONS FOR COMPUTING DEFAULT VALUES

//------------------------------------------------------------------------------
// get default for immersion chiller

function get_immersionDecayFactor_default() {
  var A = 0.0;
  var C = 0.0;
  var immersionDefault = 0.0;
  var postBoilVolume = 0.0;
  var requiredTime = 0.0;
  var targetT = 0.0;

  postBoilVolume = get_postBoilVolume();
  immersionDefault = 0.6075 * Math.exp(-0.0704 * postBoilVolume);

  // check for lower bound on decay factor
  if (immersionDefault < 1.0e-8) {
    immersionDefault = 1.0e-8;
  }

  // make sure the default decay factor yields a reasonable cooling time.
  // Use "standard" values for the immersion-chiller decay function parameters
  // A and C, where A is (boiling - C) and C is 20'C.  It doesn't matter
  // if these are not the same values used elsewhere, this is just a check.
  C = 20.0;
  A = 100.0 - C;
  // Get the time required to reach target temperature.
  // If using hold temperature, check for that; else, set target temp to 60'C
  if (ibu.holdTempCheckbox && ibu.holdTemp &&
      ibu.holdTempCheckbox.value && ibu.holdTemp.value) {
    targetT = ibu.holdTemp.value;
  } else {
    targetT = 60.0;
  }
  requiredTime = Math.log((targetT - C) / A) / (-1.0 * immersionDefault);
  // if time required to reach target temp is greater than maxCoolTime, limit it
  if (requiredTime > ibu.maxCoolTime) {
    immersionDefault = Math.log((targetT - C) / A) /
                       (-1.0 * (ibu.maxCoolTime + .01));
  }

  return immersionDefault;
}

//------------------------------------------------------------------------------
// get default for counterflow chiller

function get_counterflowRate_default() {
  var counterflowRateDefault = 0.0;

  counterflowRateDefault = 2.082;

  // make sure that the approximate time is less than maxCoolTime
  if (get_postBoilVolume() / counterflowRateDefault > ibu.maxCoolTime) {
    counterflowRateDefault = get_postBoilVolume() / ibu.maxCoolTime;
  }

  return counterflowRateDefault;
}

//------------------------------------------------------------------------------
// get default for ice bath

function get_icebathDecayFactor_default() {
  var A = 0.0;
  var C = 0.0;
  var icebathDefault = 0.0;
  var postBoilVolume = 0.0;
  var requiredTime = 0.0;
  var targetT = 0.0;

  postBoilVolume = get_postBoilVolume();
  icebathDefault = 0.4071 * Math.exp(-0.0754 * postBoilVolume);

  // check for lower bound on decay factor
  if (icebathDefault < 1.0e-8) {
    icebathDefault = 1.0e-8;
  }

  // make sure the default decay factor yields a reasonable cooling time.
  // Use "standard" values for the icebath decay function parameters
  // A and C, where A is (boiling - C) and C is 40'C.  It doesn't matter
  // if these are not the same values used elsewhere, this is just a check.
  C = 40.0;
  A = 100.0 - C;
  targetT = 60.0;
  requiredTime = Math.log((targetT - C) / A) / (-1.0 * icebathDefault);
  // if time required to reach target temp is greater than twice maxCoolTime,
  // limit it
  if (requiredTime > 2.0 * ibu.maxCoolTime) {
    icebathDefault = Math.log((targetT - C) / A) /
                       (-1.0 * (2.0 * ibu.maxCoolTime + .01));
  }

  return icebathDefault;
}

//------------------------------------------------------------------------------
// get default for linear temperature-decay, parameter B (base temp.)

function get_tempLinParamB_default() {
  var value = 0.0;

  value = ibu.boilTemp.value;

  return value;
}

//------------------------------------------------------------------------------
// get default for exponential temperature-decay, parameter B (rate constant)

function get_tempExpParamB_default() {
  var AVR = 0.0;
  var effective_area = 0.0;
  var opening_area = 0.0;
  var postBoilVolume = 0.0;
  var radius = 0.0;
  var surface_area = 0.0;
  var value = 0.0;

  postBoilVolume = get_postBoilVolume();

  radius = ibu.kettleDiameter.value / 2.0;
  surface_area = Math.PI * radius * radius;

  radius = ibu.kettleOpening.value / 2.0;
  opening_area = Math.PI * radius * radius;

  effective_area = Math.sqrt(surface_area * opening_area);

  AVR = 0.0;
  if (postBoilVolume > 0.0) {
    AVR = effective_area / postBoilVolume;
  }
  value = (0.0002925 * AVR) + 0.0053834;

  return value;
}

//------------------------------------------------------------------------------
// get default for exponential temperature-decay, parameter C (base temp.)

function get_tempExpParamC_default() {
  var value = 0.0;

  value = ibu.boilTemp.value - ibu.tempExpParamA.value;

  return value;
}

//------------------------------------------------------------------------------
// get default for linear temperature-decay, parameter A (slope)

function get_tempLinParamA_default() {
  var AVR = 0.0;
  var effective_area = 0.0;
  var opening_area = 0.0;
  var postBoilVolume = 0.0;
  var radius = 0.0;
  var surface_area = 0.0;
  var value = 0.0;

  postBoilVolume = get_postBoilVolume();

  radius = ibu.kettleDiameter.value / 2.0;
  surface_area = Math.PI * radius * radius;

  radius = ibu.kettleOpening.value / 2.0;
  opening_area = Math.PI * radius * radius;

  effective_area = Math.sqrt(surface_area * opening_area);

  AVR = 0.0;
  if (postBoilVolume > 0.0) {
    AVR = effective_area / postBoilVolume;
  }
  value = (3.055 * (1.0 - Math.exp(-0.0051 * AVR))) + 0.238;
  value *= -1.0;

  return value;
}

//------------------------------------------------------------------------------
// get default for fermentor volume.

function get_fermentorVolume_default() {
  var absorbVol = 0.0;
  var addedWater = ibu.topoffVolume.value;
  var arrayIdx = 0;
  var kettleHops = true;
  var numAdd = ibu.add.length;
  var postBoilVol = 0.0;
  var totalWeight = 0.0;
  var value = 0.0;

  postBoilVol = get_postBoilVolume();

  totalWeight = 0.0;
  for (arrayIdx = 0; arrayIdx < numAdd; arrayIdx++) {
    kettleHops = true;
    if (ibu.add[arrayIdx].kettleOrDryHop) {
      if (ibu.add[arrayIdx].kettleOrDryHop.value != "kettle") {
        kettleHops = false;
      }
    }
    if (!kettleHops) {
      continue;
    }
    totalWeight += ibu.add[arrayIdx].weight.value;
  }
  absorbVol = totalWeight * 0.0084;  // hops absorb 0.0084 liters per gram
  // console.log(totalWeight.toFixed(3) + " g of hops absorbs " +
              // absorbVol.toFixed(2) + " liters of wort");

  // wort going into fermentor is the post-boil volume, plus any top-off water,
  // minus wort absorbed by hops, minus volume of trub left behind
  value = postBoilVol + addedWater - absorbVol - ibu.wortLossVolume.value;
  if (value < 0.0) {
    value = 0.0;
  }

  return value;
}

}
ibu._construct();

