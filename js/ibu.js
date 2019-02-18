// -----------------------------------------------------------------------------
// ibu.js : JavaScript for AlchemyOverlord web page, IBU-related functions
//          but not specific estimation methods.
// Written by John-Paul Hosom
// Copyright © 2018 by John-Paul Hosom, all rights reserved.
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
//    . wortVolume = the volume of the wort, either pre- or post-boil
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
//    . applySolubilityLimitCheckbox = whether or not to use AA solubility limit
//    . pHCheckbox = whether or not to adjust IBUs based on wort pH
//    . pH = the wort pH, if applying pH correction
//    . preOrPostBoilpH = if the pH is pre- or post-boil
//    . add = array of hop additions, containing:
//        . AA = alpha acid, in percent (scale 0 to 100)
//        . weight = weight of hops added
//        . boilTime = amount of time that hops spend in the boil (may be neg.)
//    . flocculation = degree of yeast flocculation (low, medium, high)
//    . filtering = micron rating of the filter, or no filtering
//    . beerAge_days = age of the beer, in days, measured from start of ferment.
//
//    public functions:
//      checkHoldTempCheckbox = check if the 'hold' temp on hop stand is valid
//      getPostBoilVolume = get post-boil volume from wort volume and other info
//

"use strict";

ibu._construct = function() {

  // color options
  defaultColor = "#94476b"; // greyish red

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
  this.applySolubilityLimitCheckbox = new Object();
  this.pHCheckbox           = new Object();
  this.pH                   = new Object();
  this.preOrPostBoilpH      = new Object();

  this.add = [];  // array of hops additions

  this.flocculation         = new Object();
  this.filtering            = new Object();
  this.beerAge_days         = new Object();

  //----------------------------------------------------------------------------
  // add name of parent to all variables, so we can access 'units' as needed
  var keys = Object.keys(this);
  for (idx = 0; idx < keys.length; idx++) {
    if (keys[idx] == "_construct") {
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
  this.kettleDiameter.max = 500.0;
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
  this.kettleOpening.max = 500.0;
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
  this.evaporationRate.description = "evaporation rate";
  this.evaporationRate.defaultValue = 3.78541;

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
  this.wortVolume.max = 5000.0;
  this.wortVolume.description = "wort volume";
  this.wortVolume.defaultValue = 19.8734025;
  this.wortVolume.dependents = [ ibu.tempLinParamA, ibu.tempExpParamB,
                                 ibu.immersionDecayFactor,
                                 ibu.icebathDecayFactor ];

  // preOrPostBoilVol
  this.preOrPostBoilVol.id = "ibu.preOrPostBoilVol";
  this.preOrPostBoilVol.inputType = "radioButton";
  this.preOrPostBoilVol.value = "postBoilVol";
  this.preOrPostBoilVol.userSet = 0;
  this.preOrPostBoilVol.defaultValue = "postBoilVol";
  this.preOrPostBoilVol.additionalFunction = setPreOrPostBoilVol;
  this.preOrPostBoilVol.additionalFunctionArgs = "";
  this.preOrPostBoilVol.dependents = [ ibu.tempLinParamA, ibu.tempExpParamB,
                                       ibu.immersionDecayFactor,
                                       ibu.icebathDecayFactor ];

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
  this.wortLossVolume.max = 500.0;
  this.wortLossVolume.description = "volume of wort and trub left in kettle";
  this.wortLossVolume.defaultValue = 0.9463525;

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
  this.topoffVolume.max = 500.0;
  this.topoffVolume.description = "added water";
  this.topoffVolume.defaultValue = 0.0;

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
  this.tempLinParamA.defaultColor = defaultColor;
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
  this.tempLinParamB.defaultColor = defaultColor;
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
  this.tempExpParamA.defaultColor = defaultColor;
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
  this.tempExpParamB.defaultColor = defaultColor;
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
  this.tempExpParamC.defaultColor = defaultColor;
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
  this.whirlpoolTime.max = 120.0;
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
  this.immersionDecayFactor.precision = -3;
  this.immersionDecayFactor.minPrecision = -3;
  this.immersionDecayFactor.display = "";
  this.immersionDecayFactor.min = 0.00001;
  this.immersionDecayFactor.max = 200.0;
  this.immersionDecayFactor.description = "immersion chiller rate constant";
  this.immersionDecayFactor.defaultColor = defaultColor;
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
  this.counterflowRate.defaultColor = defaultColor;
  this.counterflowRate.defaultValue = 2.082;

  // icebathDecayFactor
  this.icebathDecayFactor.id = "ibu.icebathDecayFactor";
  this.icebathDecayFactor.inputType = "float";
  this.icebathDecayFactor.value = "";
  this.icebathDecayFactor.userSet = 0;
  this.icebathDecayFactor.precision = -3;
  this.icebathDecayFactor.minPrecision = -3;
  this.icebathDecayFactor.display = "";
  this.icebathDecayFactor.min = 0.00001;
  this.icebathDecayFactor.max = 200.0;
  this.icebathDecayFactor.description = "ice bath rate constant";
  this.icebathDecayFactor.defaultColor = defaultColor;
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
      document.getElementById('wortVolumeUnits').innerHTML = "liters";
    }
    if (document.getElementById('weightUnits')) {
      document.getElementById('weightUnits').innerHTML = "g";
    }
    if (document.getElementById('tempUnits')) {
      document.getElementById('tempUnits').innerHTML = "&deg;C";
    }
    if (document.getElementById('rateUnits')) {
      document.getElementById('rateUnits').innerHTML = "liters/min";
    }
    if (document.getElementById('wortLossUnits')) {
      document.getElementById('wortLossUnits').innerHTML = "liters";
    }
    if (document.getElementById('evaporationUnits')) {
      document.getElementById('evaporationUnits').innerHTML = "liters/hr";
    }
    if (document.getElementById('topoffUnits')) {
      document.getElementById('topoffUnits').innerHTML = "liters";
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
    for (idx = 0; idx < ibu.add.length; idx++) {
      common.set(ibu.add[idx].weight, 0);
    }
  }

  return true;
}

//==============================================================================
// FUNCTION RELATED TO VALIDATING INPUTS

//------------------------------------------------------------------------------

function checkDiameterAndOpening(variable) {

  if (ibu.kettleDiameter.value < ibu.kettleOpening.value) {
    console.log("kettle diam = " + ibu.kettleDiameter.value +
                ", kettle opening = " + ibu.kettleOpening.value);
    var display = variable.value;
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
// check if wort volume is pre-boil or post-boil.

function setPreOrPostBoilVol() {
  var idx = 0;
  var value = ibu.preOrPostBoilVol.value;

  console.log("SET PRE- or POST-BOIL VOLUME TO " + value);

  return;
}

//------------------------------------------------------------------------------

function checkBoilTime() {
  var doneAlert = false;
  var idx = 0;

  for (idx = 0; idx < ibu.add.length; idx++) {
    if (ibu.add[idx].boilTime.value > ibu.boilTime.value && !doneAlert) {
      window.alert("Hop boil time must be less than or equal to " +
                   "wort boil time.  Setting hop boil time to " +
                   "wort boil time as needed.");
      doneAlert = true;
    }
    if (ibu.add[idx].boilTime.value > ibu.boilTime.value) {
      ibu.add[idx].boilTime.value = ibu.boilTime.value;
      ibu.add[idx].boilTime.userSet = 1;
      common.updateHTML(ibu.add[idx].boilTime);
      common.setSavedValue(ibu.add[idx].boilTime, 0);
    }
  }
}

//------------------------------------------------------------------------------
// check if the 'hold' temperature of the hop stand is valid; depending
// on the result, set the color of this field.

function checkHoldTemp(forcedDecayType) {
  var idx = 0;
  var checked = ibu.holdTempCheckbox.value;

  if (ibu.holdTemp.value > 100.0) {
    window.alert("maximum temperature of hop stand temperature is boiling.");
    ibu.holdTemp.value = 100.0;
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

  return;
}

//------------------------------------------------------------------------------
// the public version of the private function... we need both forms because
// we check it both internally and externally.

this.checkHoldTempCheckbox = function(forcedDecayType) {
  checkHoldTemp(forcedDecayType);
  return;
}

//==============================================================================
// FUNCTIONS TO SET TEMPERATURE DECAY TYPE AND FUNCTION

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
        "  x exp(-1 &times; <span id=\"tempExpParamB_field\">"+
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
    console.log("tempLinParamA.value = " + ibu.tempLinParamA.value);
    construct_tempParam(ibu.tempLinParamA, "tempLinParamA_field",
      ibu.tempLinParamA.display, "ibu.tempLinParamA",
      "common.set(ibu.tempLinParamA, 1)");
    construct_tempParam(ibu.tempLinParamB, "tempLinParamB_field",
      ibu.tempLinParamB.display, "ibu.tempLinParamB",
      "common.set(ibu.tempLinParamB, 1)");
  }

  return true;
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
// check if wort pH is pre-boil or post-boil.

function setPreOrPostBoilpH() {
  var idx = 0;
  var value = ibu.preOrPostBoilpH.value;

  console.log("SET PRE- or POST-BOIL pH TO " + value);

  return;
}

//------------------------------------------------------------------------------

//==============================================================================
// FUNCTION TO INITIALIZE TABLE HOP HOP ADDITIONS AND OUTPUTS

//------------------------------------------------------------------------------
// set table of hops additions, using either already-set values or defaults,
// and set table of output values

function hopAdditionsSet(updateFunction) {
  var aaDefault = 8.4;
  var arrayIdx = 0;
  var boilTimeDefault = 0.0;
  var baDefault = 5.0;
  var constructInputTable = false;
  var constructOutputTable = false;
  var currElement = 0;
  var currValue = "";
  var freshnessFactorDefault = 1.0;
  var hopFormDefault = "cones"; // in future, default should be "pellets"
  var idx = 1;
  var numAdd = ibu.numAdditions.value;
  var percentLoss6MosDefault = 38.2;  // average value over many varieties
  var table = "";
  var tableID = "";
  var units = 0;
  var varietyDefault = "(unspecified)";
  var weightDefault = 0.0;
  var weightUnits = 0;

  console.log(" ------ SETTING HOPS ADDITIONS ------ ");
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
    table += "<table style='margin-left:3em' id='hopsAdditionsTable'> "
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

  if (constructInputTable && ibu.hopTableSize >= 7) {
    table += "</tr> "
    table += "<tr> "
    table += "<td> Variety:</td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    currValue = varietyDefault;
    tableID = "variety"+idx;
    if (constructInputTable && ibu.hopTableSize >= 7) {
      currElement = document.getElementById(tableID);
      if (currElement != null) {
        currValue = document.getElementById(tableID).value;
      }
    table += "<td><button id='" + tableID +
             "' class='button'>(unspecified)</button></td>"
    }
    arrayIdx = Number(idx-1);
    ibu.add[arrayIdx].variety = new Object;
    ibu.add[arrayIdx].variety.id = tableID;
    ibu.add[arrayIdx].variety.inputType = "select";
    ibu.add[arrayIdx].variety.value = currValue;
    ibu.add[arrayIdx].variety.userSet = 0;
    ibu.add[arrayIdx].variety.display = varietyDefault;
    ibu.add[arrayIdx].variety.description = "hop variety";
    ibu.add[arrayIdx].variety.defaultValue = varietyDefault;
    ibu.add[arrayIdx].variety.updateFunction = updateFunction;
    ibu.add[arrayIdx].variety.parent = "ibu";
  }


  if (constructInputTable) {
    table += "</tr> "
    table += "<tr> "
    table += "<td> Alpha Acid (%):</td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    currValue = aaDefault;
    tableID = "AA"+idx;
    if (constructInputTable) {
      currElement = document.getElementById(tableID);
      if (currElement != null) {
        currValue = document.getElementById(tableID).value;
      }
      table += "<td> <input type='text' size='12' value='"+currValue+"' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].AA,1)'></td> "
    }
    ibu.add[arrayIdx].AA = new Object;
    ibu.add[arrayIdx].AA.id = tableID;
    ibu.add[arrayIdx].AA.inputType = "float";
    ibu.add[arrayIdx].AA.value = Number(currValue);
    ibu.add[arrayIdx].AA.userSet = 0;
    ibu.add[arrayIdx].AA.precision = 1;
    ibu.add[arrayIdx].AA.minPrecision = 1;
    ibu.add[arrayIdx].AA.display = "";
    ibu.add[arrayIdx].AA.min = 1.0;
    ibu.add[arrayIdx].AA.max = 100.0;
    ibu.add[arrayIdx].AA.description = "hops AA rating";
    ibu.add[arrayIdx].AA.defaultValue = aaDefault;
    ibu.add[arrayIdx].AA.updateFunction = updateFunction;
    ibu.add[arrayIdx].AA.parent = "ibu";
  }

  if (constructInputTable && ibu.hopTableSize >= 5) {
    table += "</tr> "
    table += "<tr> "
    table += "<td> Beta Acid (%):</td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    currValue = baDefault;
    tableID = "BA"+idx;
    if (constructInputTable && ibu.hopTableSize >= 5) {
      currElement = document.getElementById(tableID);
      if (currElement != null) {
        currValue = document.getElementById(tableID).value;
      }
      table += "<td> <input type='text' size='12' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].BA,1)'> </td> "
    }
    arrayIdx = Number(idx-1);
    ibu.add[arrayIdx].BA = new Object;
    ibu.add[arrayIdx].BA.id = tableID;
    ibu.add[arrayIdx].BA.inputType = "float";
    ibu.add[arrayIdx].BA.value = Number(currValue);
    ibu.add[arrayIdx].BA.userSet = 0;
    ibu.add[arrayIdx].BA.precision = 1;
    ibu.add[arrayIdx].BA.minPrecision = 1;
    ibu.add[arrayIdx].BA.display = "";
    ibu.add[arrayIdx].BA.min = 1.0;
    ibu.add[arrayIdx].BA.max = 100.0;
    ibu.add[arrayIdx].BA.description = "hops beta acid rating";
    ibu.add[arrayIdx].BA.defaultValue = baDefault;
    ibu.add[arrayIdx].BA.updateFunction = updateFunction;
    ibu.add[arrayIdx].BA.parent = "ibu";
  }

  if (constructInputTable && ibu.hopTableSize >= 4) {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> Form of Hops: </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    currValue = hopFormDefault;
    tableID = "hopForm"+idx;
    if (constructInputTable && ibu.hopTableSize >= 4) {
      currElement = document.getElementById(tableID);
      if (currElement != null) {
        currValue = document.getElementById(tableID).value;
      }
      table += "<td> <select style='width:7.4em;' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].hopForm,1)'> <option value='cones'>cones</option> <option value='pellets'>pellets</option> </td> "
    }
    arrayIdx = Number(idx-1);
    ibu.add[arrayIdx].hopForm = new Object;
    ibu.add[arrayIdx].hopForm.id = tableID;
    ibu.add[arrayIdx].hopForm.inputType = "select";
    ibu.add[arrayIdx].hopForm.value = currValue;
    ibu.add[arrayIdx].hopForm.userSet = 0;
    ibu.add[arrayIdx].hopForm.display = hopFormDefault;
    ibu.add[arrayIdx].hopForm.description = "form of hops";
    ibu.add[arrayIdx].hopForm.defaultValue = hopFormDefault;
    ibu.add[arrayIdx].hopForm.updateFunction = updateFunction;
    ibu.add[arrayIdx].hopForm.parent = "ibu";
  }

  if (constructInputTable && ibu.hopTableSize >= 6) {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> Freshness Factor: </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    currValue = freshnessFactorDefault;
    tableID = "freshnessFactor"+idx;
    if (constructInputTable && ibu.hopTableSize >= 6) {
      currElement = document.getElementById(tableID);
      if (currElement != null) {
        currValue = document.getElementById(tableID).value;
      }
      table += "<td> <input type='text' size='12' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].freshnessFactor,1)'> </td> "
    }
    arrayIdx = Number(idx-1);
    ibu.add[arrayIdx].freshnessFactor = new Object;
    ibu.add[arrayIdx].freshnessFactor.id = tableID;
    ibu.add[arrayIdx].freshnessFactor.inputType = "float";
    ibu.add[arrayIdx].freshnessFactor.value = Number(currValue);
    ibu.add[arrayIdx].freshnessFactor.userSet = 0;
    ibu.add[arrayIdx].freshnessFactor.precision = 2;
    ibu.add[arrayIdx].freshnessFactor.minPrecision = 2;
    ibu.add[arrayIdx].freshnessFactor.display = "";
    ibu.add[arrayIdx].freshnessFactor.min = 0.0;
    ibu.add[arrayIdx].freshnessFactor.max = 1.0;
    ibu.add[arrayIdx].freshnessFactor.description = "hops freshness factor";
    ibu.add[arrayIdx].freshnessFactor.defaultValue = freshnessFactorDefault;
    ibu.add[arrayIdx].freshnessFactor.updateFunction = updateFunction;
    ibu.add[arrayIdx].freshnessFactor.parent = "ibu";
  }

  if (constructInputTable && ibu.hopTableSize >= 7) {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> % Loss (6mos,RT): </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    currValue = percentLoss6MosDefault;
    tableID = "percentLoss"+idx;
    if (constructInputTable && ibu.hopTableSize >= 7) {
      currElement = document.getElementById(tableID);
      if (currElement != null) {
        currValue = document.getElementById(tableID).value;
      }
      table += "<td> <input type='text' size='12' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].percentLoss,1)'> </td> "
    }
    arrayIdx = Number(idx-1);
    ibu.add[arrayIdx].percentLoss = new Object;
    ibu.add[arrayIdx].percentLoss.id = tableID;
    ibu.add[arrayIdx].percentLoss.inputType = "float";
    ibu.add[arrayIdx].percentLoss.value = Number(currValue);
    ibu.add[arrayIdx].percentLoss.userSet = 0;
    ibu.add[arrayIdx].percentLoss.precision = 2;
    ibu.add[arrayIdx].percentLoss.minPrecision = 1;
    ibu.add[arrayIdx].percentLoss.display = "";
    ibu.add[arrayIdx].percentLoss.min = 0.0;
    ibu.add[arrayIdx].percentLoss.max = 100.0;
    ibu.add[arrayIdx].percentLoss.description = "percent loss of alpha acids after six months at room temperature";
    ibu.add[arrayIdx].percentLoss.defaultValue = percentLoss6MosDefault;
    ibu.add[arrayIdx].percentLoss.updateFunction = updateFunction;
    ibu.add[arrayIdx].percentLoss.parent = "ibu";
  }

  if (constructInputTable) {
    table += "</tr> "
    table += "<tr> "
    table += "<td> Weight (<span id='weightUnits'>"+weightUnits+"</span>):</td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    currValue = weightDefault;
    tableID = "weight"+idx;
    if (constructInputTable) {
      currElement = document.getElementById(tableID);
      if (currElement != null) {
        currValue = document.getElementById(tableID).value;
      }
      table += "<td> <input type='text' size='12' value='"+currValue+"' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].weight,1)'> </td> "
    }
    ibu.add[arrayIdx].weight = new Object;
    ibu.add[arrayIdx].weight.id = tableID;
    ibu.add[arrayIdx].weight.inputType = "float";
    ibu.add[arrayIdx].weight.value = Number(currValue);
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

  if (constructInputTable) {
    table += "</tr> ";
    table += "<tr> ";
    table += "<td> Boil Time (min): </td> "
  }
  for (idx = 1; idx <= numAdd; idx++) {
    arrayIdx = Number(idx-1);
    currValue = boilTimeDefault;
    tableID = "boilTimeTable"+idx;
    if (constructInputTable) {
      currElement = document.getElementById(tableID);
      if (currElement != null) {
        currValue = document.getElementById(tableID).value;
      }
      table += "<td> <input type='text' size='12' value='' autocomplete='off' id='"+tableID+"' onchange='common.set(ibu.add["+arrayIdx+"].boilTime,1)'> </td> "
    }
    arrayIdx = Number(idx-1);
    ibu.add[arrayIdx].boilTime = new Object;
    ibu.add[arrayIdx].boilTime.id = tableID;
    ibu.add[arrayIdx].boilTime.inputType = "float";
    ibu.add[arrayIdx].boilTime.value = Number(currValue);
    ibu.add[arrayIdx].boilTime.userSet = 0;
    ibu.add[arrayIdx].boilTime.precision = 0;
    ibu.add[arrayIdx].boilTime.minPrecision = 0;
    ibu.add[arrayIdx].boilTime.display = "";
    ibu.add[arrayIdx].boilTime.min = -120.0;
    ibu.add[arrayIdx].boilTime.max = 360.0;
    ibu.add[arrayIdx].boilTime.description = "hops boil time";
    ibu.add[arrayIdx].boilTime.defaultValue = 0.0;
    ibu.add[arrayIdx].boilTime.additionalFunction = checkBoilTime;
    ibu.add[arrayIdx].boilTime.additionalFunctionArgs = "";
    ibu.add[arrayIdx].boilTime.updateFunction = updateFunction;
    ibu.add[arrayIdx].boilTime.parent = "ibu";
  }


  // initialize outputs to zero
  for (idx = 1; idx <= numAdd; idx++) {
    ibu.add[arrayIdx].AA_init_concent = 0.0;
    ibu.add[arrayIdx].AA_dis = 0.0;
    ibu.add[arrayIdx].IBU = 0.0;
    ibu.add[arrayIdx].U = 0.0;
    ibu.add[arrayIdx].IAA_dis = 0.0;
    ibu.add[arrayIdx].IAA_xfer = 0.0;
    ibu.add[arrayIdx].IAA_concent_wort = 0.0;
	  ibu.add[arrayIdx].oAA_concent_boil = 0.0;
	  ibu.add[arrayIdx].oBA_concent_boil = 0.0;
	  ibu.add[arrayIdx].PP_beer = 0.0;
    ibu.add[arrayIdx].tempK = 0.0;
  }
  ibu.IBU = 0.0;
  ibu.U = 0.0;

  if (constructInputTable) {
    table += "</tr> ";
    table += "</tbody> ";
    table += "</table> ";
    document.getElementById('hopsAdditionsTableDiv').innerHTML = table;
  }


  for (idx = 1; idx <= numAdd; idx++) {
    var AA_percent_boil = 0.0;
    arrayIdx = Number(idx-1);
    common.set(ibu.add[arrayIdx].AA,0);
    common.set(ibu.add[arrayIdx].BA,0);
    common.set(ibu.add[arrayIdx].hopForm,0);
    common.set(ibu.add[arrayIdx].freshnessFactor,0);
    common.set(ibu.add[arrayIdx].percentLoss,0);
    common.set(ibu.add[arrayIdx].weight,0);
    common.set(ibu.add[arrayIdx].boilTime,0);
  }

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
    table += "</tr> "

    table += "<tr> "
    table += "<td class='outputTableCellName'>Utilization (%):</td> "
    for (idx = 1; idx <= numAdd; idx++) {
      table += "<td class='outputTableCellValue' id='addUtilValue"+idx+"'>0.00</td> "
    }
    table += "</tr> "
    table += "<tr> "
	if (numAdd > 1) {
      table += "<td class='outputTableCellName'>IBUs from each:</td> "
	  } else {
      table += "<td class='outputTableCellName'>IBUs from hops:</td> "
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
    table += "</table> ";
    document.getElementById('outputTableDiv').innerHTML = table;
  }

  return true;
}


//==============================================================================
// FUNCTIONS FOR COMPUTING DEFAULT VALUES

function get_postBoilVolume() {
  var boilTime = ibu.boilTime.value;
  var evapRate = ibu.evaporationRate.value;
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

//------------------------------------------------------------------------------
// get default for immersion chiller

function get_immersionDecayFactor_default() {
  var immersionDefault = 0.0;
  var postBoilVolume = 0.0;

  postBoilVolume = get_postBoilVolume();
  immersionDefault = 0.6075 * Math.exp(-0.0704 * postBoilVolume);
  if (immersionDefault < 1.0e-10) {
    immersionDefault = 1.0e-10;
  }
  return immersionDefault;
}

//------------------------------------------------------------------------------
// get default for ice bath

function get_icebathDecayFactor_default() {
  var icebathDefault = 0.0;
  var postBoilVolume = 0.0;

  postBoilVolume = get_postBoilVolume();
  icebathDefault = 0.4071 * Math.exp(-0.0754 * postBoilVolume);
  if (icebathDefault < 1.0e-10) {
    icebathDefault = 1.0e-10;
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

}
ibu._construct();


