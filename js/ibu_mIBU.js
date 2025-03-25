// -----------------------------------------------------------------------------
// ibu_mIBU.js : JavaScript for AlchemyOverlord web page, mIBU sub-page
// Written by John-Paul Hosom
// Copyright � 2018-2025 by John-Paul Hosom, all rights reserved.
// To license this software, please contact John-Paul Hosom, for example at
//    alchemyoverlord � yahoo � com
// In many cases (at the sole discretion of John-Paul Hosom) a license
// is provided free of charge, but a written license is required for
// legal use of this code.
//
//
// Version 1.0.1 : May 6, 2018
//         This version is based off of the original Tinseth IBU javascript
//         code in this project, with many modifications and enhancements
//         for mIBU functionality, adjusting volume and SG over boil, adding
//         a global scaling factor, accounting for partial boils, etc.
//
// Version 1.1.0 : May 23, 2018
//         . Add 'kettle diameter' and 'kettle opening diameter' fields to
//           compute wort exposed surface area and opening area.
//         . Make linear and exponential post-boil temperature decrease
//           default values dependent on volume, wort exposed surface area
//           (via kettle diameter), and kettle opening area.
//         . Make exponential decay the default temperature-decrease function.
//         . Bug fix: apply relative utilization/volume to IBU, not rate const.
//
// Version 1.1.1 : June 15, 2018
//         . minor update to exponential temp decay rate constant prediction
//         . bug fix in linear temp. decay defaults
//
// Version 1.2.0 : July 15, 2018
//         . complete re-write under the hood
//         . add boil time parameter
//         . allow negative hop boil times (e.g. whirlpool additions)
//         . bug fix in computing average specific gravity
//         . add saving and loading of settings
//
// Version 1.2.1 : July 18, 2018
//         . add option for hop stand constant temperature, minor adjustments
//
// Version 1.2.2 : Sep.  3, 2018
//         . add pH adjustment, pre- or post-boil volume, and minor adjustments.
//
// Version 1.2.3 : Dec. 29, 2018
//         . minor cleanup.
//
// Version 1.2.4 : Jan. 21, 2019
//         . increase diameter and counterflow rate limits.
//         . if hold a constant temperature during whirlpool, use immersion
//           chiller to reach this target temperature.
//
// Version 1.2.5 : Jun. 25, 2019
//         . add option for krausen loss
//
// Version 1.2.6 : Jun. 28, 2019
//         . adjust the way volume is used in IBU computations.  This change
//           primarily affects IBUs with hopping rates at around 200 ppm.
//           Also, add link to AlchemyOverlord blog page.
//
// Version 1.2.7 : Oct. 1, 2019
//         . have non-zero evaporation rate when temperature less than boiling.
//
// Version 1.2.8 : Jun. 9, 2020
//         . update the effect of pH on auxiliary bittering compounds
//
// Version 1.2.9 : Sep. 16, 2020
//         . three bug fixes, thanks to Marko Heyns at Grainfather:
//           (a) for solubility limit, [AA] needs to also be based on curr vol.
//           (b) fix temperature decay when holding hop-stand temperature
//           (c) compare holdTempCounter with original whirlpool time
//
// Version 1.2.10 : Sep. 20, 2020
//         . update the solubility limit model to be in sync with latest results
//         . update pH-related nonIAA losses to be in sync with latest results
//
// Version 1.2.11 : Oct. 10, 2020
//         . add adjustment factor for wort clarity
//
// Version 1.2.12 : Oct. 31, 2020
//         . add adjustment factor for hop pellets
//
// Version 1.2.13 : Nov. 1, 2020
//         . stop when degree of utilization reaches 0.01 instead of 0.001
//
// Version 1.2.14 : Nov. 7, 2020
//         . bug fix thanks to Marko Heyns at Grainfather:
//           apply alpha-acid solubility limit to pellet increase
//         . change pellets from a factor of 2.0 to 2.0 * 0.8
//         . make sure no division by zero
//         . minor code cleanup
//
// Version 1.2.15 : Nov. 22, 2020
//         . bug fix of evaporation rate at below-boiling temperatures
//         . implement more checking of inputs
//         . if topoff volume is 0, show wortLossVol in gray
//
// Version 1.2.16 : Oct. 7, 2021
//         . add a check for log of negative number as a precaution
//
// -----------------------------------------------------------------------------

//==============================================================================

var mIBU = mIBU || {};

// Declare a "namespace" called "mIBU"
// This namespace contains functions that are specific to the mIBU method.
//
//     public functions:
//    . initialize_mIBU()
//    . computeIBU_mIBU()
//

mIBU._construct = function() {

//------------------------------------------------------------------------------
// initialize for performing mIBU calculations

this.initialize_mIBU = function() {
  var idx = 0;
  var keys = Object.keys(ibu);

  // add function to call when using set() function with ibu namespace
  for (idx = 0; idx < keys.length; idx++) {
    if (!ibu[keys[idx]].id) {
      continue;
    }
    ibu[keys[idx]].updateFunction = mIBU.computeIBU_mIBU;
  }
  ibu.numAdditions.additionalFunctionArgs = ["mIBU", mIBU.computeIBU_mIBU];
  ibu.hopTableSize = 4; // cones/pellets, AA%, weight, steepTime

  // don't need to set() any variables that change with unit conversion;
  // when we call set(units), those dependent variables will also be set.
  common.set(ibu.boilTime, 0);
  common.set(ibu.preOrPostBoilVol, 0);
  common.set(ibu.OG, 0);
  common.set(ibu.wortClarity, 0);
  common.set(ibu.tempDecayType, 0);
  common.set(ibu.whirlpoolTime, 0);
  common.set(ibu.immersionDecayFactor, 0);
  common.set(ibu.icebathDecayFactor, 0);
  common.set(ibu.forcedDecayType, 0);
  common.set(ibu.holdTempCheckbox, 0);  // must do this after forcedDecayType
  common.set(ibu.scalingFactor, 0);
  common.set(ibu.defaultHopForm, 0);
  common.set(ibu.applySolubilityLimitCheckbox, 0);
  common.set(ibu.pHCheckbox, 0);
  common.set(ibu.pH, 0);
  common.set(ibu.preOrPostBoilpH, 0);
  common.set(ibu.numAdditions, 0);
  common.set(ibu.krausen, 0);
  common.set(ibu.flocculation, 0);
  common.set(ibu.filtering, 0);
  common.set(ibu.beerAge_days, 0);
  common.set(ibu.units, 0);

  mIBU.computeIBU_mIBU();

  return;
}

//------------------------------------------------------------------------------
// compute IBUs and utilization for all hops additions

this.computeIBU_mIBU = function() {
  var AA = 0.0;
  var AAatAdd = 0.0;
  var AAconcent = 0.0;
  var AAdis = 0.0;
  var AAinit = 0.0;
  var AAinitTotal = 0.0;
  var AA_limit_func_A = 0.0;
  var AA_limit_func_B = 0.0;
  var AA_limit_maxLimit = 490.0;
  var AA_limit_minLimit = 240.0;
  var AA_noLimit = 0.0;
  var addIBUoutput = 0.0;
  var additionTime = 0.0;
  var addUtilOutput = 0.0;
  var averageVolume = 0.0;
  var bignessFactor = 0.0;
  var boilTime = ibu.boilTime.value;
  var chillingTime = 0.0;
  var coolingMethod = ibu.forcedDecayType.value;
  var currentAddition = 0.0;
  var currVolume = 0.0;
  var dAA = 0.0;
  var dAAconcent = 0.0;
  var decayRate = 0.0;
  var degreeU = 0.0;
  var doneHoldTemp = false;
  var expParamC_Kelvin = 0.0;
  var factor = 0.0;
  var finalVolume = 0.0;
  var finished = 0;
  var holdTemp = ibu.holdTemp.value;
  var holdTempCheckbox = ibu.holdTempCheckbox.value;
  var holdTempCounter = 0.0;
  var holdTempK = 0.0;
  var hopIdx = 0;
  var iaaKrausenLoss = 0.0;
  var iaaKrausenLossFactor = 0.0;
  var iaaLossFactor = 0.0;
  var iaaUtil = 0.0;
  var iaaWortClarityLossFactor = 0.0;
  var IBU = 0.0;
  var IBUtopoffScale = 0.0;
  var icebathBaseTemp = 314.00; // 40.85'C = 105.53'F
  var idxP1 = 0;
  var immersionChillerBaseTemp = 293.15; // 20'C = 68'F
  var initVolume = 0.0;
  var integrationTime = 0.0;
  var isTempDecayLinear = 0;
  var k = 0.0;
  var linParamB_Kelvin = 0.0;
  var nonIaaLossFactor = 0.0;
  var nonIaaKrausenLoss = 0.0;
  var nonIaaKrausenLossFactor = 0.0;
  var nonIaaUtil = 0.0;
  var OGpoints = 0.0;
  var origWhirlpoolTime = 0.0;
  var pH = ibu.pH.value;
  var postBoilTime = 0.0;
  var postBoilVolume = 0.0;
  var preAddConcent = 0.0;
  var preBoilpH = 0.0;
  var preOrPostBoilpH = ibu.preOrPostBoilpH.value;
  var rateAtTemp = 0.0;
  var rateAtBoil = 0.0;
  var ratio = 0.0;
  var relativeVolume = 0.0;
  var SG = 0.0;
  var SGpoints = 0.0;
  var solubilityLimit = 0.0;
  var subBoilEvapRate = 0.0;
  var t = 0.0;
  var tempC = 0.0;
  var tempK = 0.0;
  var tempNoBase = 0.0;
  var totalIBU = 0.0;
  var totalIBUoutput = 0.0;
  var totalU = 0.0;
  var totalXferTime = 0.0;
  var U = 0.0;
  var use_pH = ibu.pHCheckbox.value;
  var useSolubilityLimit = ibu.applySolubilityLimitCheckbox.value;
  var volumeChange = 0.0;
  var weight;
  var whirlpoolTime = 0.0;
  var xferRate = 0.0;

  if (ibu.numAdditions.value < 1) {
    return false;
  }

  console.log("\n============================================================");

  postBoilVolume = ibu.getPostBoilVolume();

  console.log("kettle diameter = " + ibu.kettleDiameter.value +
              ", kettle opening = " + ibu.kettleOpening.value);

  console.log("evaporation rate = " + ibu.evaporationRate.value +
              ", post-boil volume = " + postBoilVolume);
  console.log("OG = " + ibu.OG.value +
              ", wort clarity = " + ibu.wortClarity.value);
  console.log("wort loss volume = " + ibu.wortLossVolume.value +
              ", topoff volume = " + ibu.topoffVolume.value);

  if (ibu.tempDecayType.value == "tempDecayLinear") {
    isTempDecayLinear = 1;
  } else if (ibu.tempDecayType.value == "tempDecayExponential") {
    isTempDecayLinear = 0;
  } else {
    console.log("ERROR: unknown temp decay type: " + ibu.tempDecayType.value);
    isTempDecayLinear = 0;
  }
  if (!isTempDecayLinear) {
    console.log("Exponential decay: A=" + ibu.tempExpParamA.value + ", B=" +
                ibu.tempExpParamB.value + ", C=" + ibu.tempExpParamC.value);
  } else {
    console.log("Linear temp decay: A=" + ibu.tempLinParamA.value + ", B=" +
                ibu.tempLinParamB.value);
  }

  console.log("hold temp during hop stand? " + holdTempCheckbox +
              ", hold temp is " + holdTemp.toFixed(4));
  // get forced cooling function decay rate or transfer rate
  if (coolingMethod == "forcedDecayCounterflow") {
    xferRate = ibu.counterflowRate.value;
    console.log("cooling method = " + coolingMethod + ", rate = " + xferRate);
  } else if (coolingMethod == "forcedDecayImmersion") {
    decayRate = ibu.immersionDecayFactor.value;
    console.log("cooling method = " + coolingMethod + ", rate = " + decayRate);
  } else if (coolingMethod == "forcedDecayIcebath") {
    decayRate = ibu.icebathDecayFactor.value;
    console.log("cooling method = " + coolingMethod + ", rate = " + decayRate);
  }

  // if counterflow chiller, but we're holding a temperature during whirlpool,
  // use immersion chiller decay rate for initial cooling.
  if (coolingMethod == "forcedDecayCounterflow" && holdTempCheckbox) {
    decayRate = ibu.immersionDecayFactor.value;
  }

  console.log("IBU scaling factor = " + ibu.scalingFactor.value +
              ", useSolubilityLimit = " + useSolubilityLimit);
  console.log("Use pH : " + use_pH + " with " + preOrPostBoilpH +
              " pH = " + pH);

  // initialize outputs from each hop addition to zero
  console.log("number of hops additions: " + ibu.add.length);
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    console.log("  addition " + Number(hopIdx+1) + ": AA=" +
                ibu.add[hopIdx].AA.value +
                ", weight=" + ibu.add[hopIdx].weight.value +
                ", time=" + ibu.add[hopIdx].steepTime.value);
    ibu.add[hopIdx].AAinit = 0.0;
    ibu.add[hopIdx].AAdis = 0.0;
    ibu.add[hopIdx].AAcurr = 0.0;
    ibu.add[hopIdx].IBU = 0.0;
    ibu.add[hopIdx].U = 0.0;
  }

  // get initial volume from post-boil volume, evaporation rate, and boil time;
  // then get average volume and average specific gravity
  initVolume = postBoilVolume +
               (ibu.evaporationRate.value/60.0 * boilTime);
  console.log("volume at first hops addition = " +
              postBoilVolume.toFixed(4) + " + (" + ibu.evaporationRate.value +
              "/60.0 * " + boilTime + ") = " + initVolume.toFixed(4));
  averageVolume = (initVolume + postBoilVolume) / 2.0;
  OGpoints = (ibu.OG.value - 1.0) * 1000.0;
  if (averageVolume > 0.0) {
    SGpoints = OGpoints * postBoilVolume / averageVolume;
  } else {
    SGpoints = 0.0;
  }
  SG = (SGpoints / 1000.0) + 1.0;
  console.log("OG is " + ibu.OG.value + ", post-boil volume is " +
              postBoilVolume.toFixed(4) + " and initial volume is " +
              initVolume.toFixed(4) + ", so *average* gravity is " +
              SG.toFixed(4));

  // initialize some variables
  relativeVolume = 1.0;
  totalXferTime = 0.0;
  U = 0.0;
  IBU = 0.0;
  AAconcent = 0.0;
  AAinitTotal = 0.0;
  tempK = 373.15;
  tempC = common.convertKelvinToCelsius(tempK);
  degreeU = 1.0;
  integrationTime = 0.01; // minutes
  holdTempK = common.convertCelsiusToKelvin(holdTemp);
  if (!holdTempCheckbox) holdTempK = 0.0; // 'Kelvin

  // make sure that boil time doesn't have higher precision than integ. time
  if (common.getPrecision("" + boilTime) > 2) {
    boilTime = Number(boilTime.toFixed(2));
  }

  volumeChange = xferRate * integrationTime;  // for counterflow
  k = -0.04; // from Tinseth model
  // factor is the conversion factor from utilization to IBU, from Tinseth
  factor = ibu.scalingFactor.value * 1.65 * Math.pow(0.000125,(SG-1.0)) / 4.15;
  expParamC_Kelvin = common.convertCelsiusToKelvin(ibu.tempExpParamC.value);
  linParamB_Kelvin = common.convertCelsiusToKelvin(ibu.tempLinParamB.value);


  // loop over each time point, from maximum time down until no more utilization
  finished = 0;
  currVolume = initVolume;
  holdTempCounter = 0.0;
  whirlpoolTime = ibu.whirlpoolTime.value;
  origWhirlpoolTime = whirlpoolTime; // wpTime might be increased; keep a copy
  for (t = boilTime; finished == 0; t = t - integrationTime) {
    // check to see if add hops at this time point.
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      if (ibu.add[hopIdx].kettleOrDryHop &&
          ibu.add[hopIdx].kettleOrDryHop.value != "kettle") {
        continue;
      }
      additionTime = ibu.add[hopIdx].steepTime.value;
      // make sure that addition time doesn't have higher precision than integ.
      if (common.getPrecision("" + additionTime) > 2) {
        additionTime = Number(additionTime.toFixed(2));
      }
      if (Math.round(t * 1000) == Math.round(additionTime * 1000)) {
        AA = ibu.add[hopIdx].AA.value / 100.0;
        weight = ibu.add[hopIdx].weight.value;
        if (currVolume > 0) {
          AAinit = AA * weight * 1000 / currVolume;
        } else {
          AAinit = 0.0;
        }
        console.log("AA=" + AA + ", w=" + weight + ", vol=" +
                    currVolume.toFixed(4));
        console.log("at time " + t.toFixed(3) + ", adding hops addition " +
                    hopIdx + " with [AA] = " + AAinit.toFixed(2) +
                    " to existing [AA] = " + AAconcent.toFixed(2));
        ibu.add[hopIdx].AAinit = AAinit;
        AAinitTotal = AAinitTotal + AAinit;
        preAddConcent = AAconcent;

        // if use solubility limit, see if we need to change AA concentration
        if (useSolubilityLimit) {
          // compute AA limit function parameters
          AA_limit_func_A = AA_limit_maxLimit;
          AA_limit_func_B =
               -1.0 * Math.log(1.0 - (AA_limit_minLimit/AA_limit_maxLimit)) /
               AA_limit_minLimit;
          // AAconcent is [AA] at post-boil volume.  AAatAdd is [AA] when add
          AAatAdd = AAconcent * postBoilVolume / currVolume;
          // if pre-add [AA] is above thresh, find out what it would be at this
          // point in time if there was no solubility limit.
          if (AAatAdd > AA_limit_minLimit) {
            // if not yet at maximum, reverse computation of sol. limit;
            // else we're at or above the maximum, so get an [AA] that's
            // very large so that any new addition will contribute no AA.
            if (AAatAdd/AA_limit_func_A < 1.0) {
              AA_noLimit = -1.0 * Math.log(1.0 - (AAatAdd/AA_limit_func_A)) /
                           AA_limit_func_B;
              } else {
              AA_noLimit = 1.0e10;
              }
          } else {
            AA_noLimit = AAatAdd;
          }
          console.log("    from [AA]@currTime=" + AAatAdd.toFixed(2) +
                      ", [AA] with no solubility limit is " +
                      AA_noLimit.toFixed(2), ", then adding " +
                      AAinit.toFixed(2));
          AA_noLimit = AA_noLimit + AAinit;
          if (AA_noLimit > AA_limit_minLimit) {
            solubilityLimit = AA_limit_func_A *
                              (1.0 - Math.exp(-1.0*AA_limit_func_B*AA_noLimit));
          } else {
            solubilityLimit = AA_limit_minLimit;
          }
          console.log("    from [AA] without limits=" + AA_noLimit.toFixed(2) +
                      ", limit is " + solubilityLimit.toFixed(2));
          console.log("    currV = " + currVolume.toFixed(2) + ", pbVol = " +
                      postBoilVolume.toFixed(2));
          if (postBoilVolume > 0.0) {
            // if [AA] after new hops addition (w/out limit) is above threshold,
            // set [AA] to new limit.
            // Adjust AAconcent to be the concentration at the end of the boil,
            // since that concentration is what the IBU is measuring.
            if (AA_noLimit > AA_limit_minLimit && AA_noLimit> solubilityLimit) {
              AAconcent = solubilityLimit * currVolume / postBoilVolume;
            } else {
              AAconcent = AA_noLimit * currVolume / postBoilVolume;
            }
          } else {
            AAconcent = 0.0;
          }
          console.log("    after addition, AAconcent = " +AAconcent.toFixed(4));
        } else {
          // adjust AAconcent to be the concentration at the end of the boil,
          // since that concentration is what the IBU is measuring.
          AAconcent = AAconcent + (AAinit * currVolume / postBoilVolume);
        }
        currentAddition = AAconcent - preAddConcent;
        if (currentAddition < 0) {
          console.log("ERROR!!!! ended up adding hops []: " + currentAddition);
          currentAddition = 0.0;
        } else {
          console.log("    CURRENT ADDITION contributes " +
                      currentAddition.toFixed(4));
        }
        ibu.add[hopIdx].AAcurr = currentAddition;
        if (currVolume > 0.0) {
          ibu.add[hopIdx].AAdis  = currentAddition * postBoilVolume/currVolume;
        } else {
          ibu.add[hopIdx].AAdis  = 0.0;
        }
      }
    }

    // every 5 minutes, print out some information to the console
    if (Math.round(t * 1000) % 5000 == 0) {
      console.log("time = " + t.toFixed(3));
      console.log("       temp = " + tempC.toFixed(2) +
                          " with relative utilization " + degreeU.toFixed(4));
      console.log("       volume = " + currVolume.toFixed(4) +
                          ", relativeVolume = " + relativeVolume.toFixed(4));
      console.log("       AA = " + AAconcent.toFixed(4) + " ppm, " +
                          "util = " + U.toFixed(4) + ", IBU = " +
                          IBU.toFixed(4));
      if (t == 0) {
        console.log("    -------- end of boil --------");
      }
    }

    // if post boil (t < 0), then adjust temperature and degree of utilization
    if (t < 0) {
      postBoilTime = t * -1.0;
      // if counterflow or not yet done with whirlpool, get temp from cooling fn
      if ((coolingMethod == "forcedDecayCounterflow" ||
          postBoilTime < whirlpoolTime) &&
          (!holdTempCheckbox || (holdTempCheckbox && doneHoldTemp))) {
        if (!isTempDecayLinear) {
          tempNoBase = tempK - expParamC_Kelvin;
          tempNoBase = tempNoBase +
                      (-1.0*ibu.tempExpParamB.value*tempNoBase*integrationTime);
          tempK = tempNoBase + expParamC_Kelvin;
        } else {
          tempK = tempK + (ibu.tempLinParamA.value * integrationTime);
        }
      }
      // if immersion/icebath AND done with whirlpool, adjust
      // temp with new function
      if (coolingMethod == "forcedDecayImmersion" &&
          postBoilTime >= whirlpoolTime) {
        tempNoBase = tempK - immersionChillerBaseTemp;
        tempNoBase = tempNoBase + (-1.0*decayRate*tempNoBase*integrationTime);
        tempK = tempNoBase + immersionChillerBaseTemp;
      }
      if (coolingMethod == "forcedDecayIcebath" &&
          postBoilTime >= whirlpoolTime) {
        tempNoBase = tempK - icebathBaseTemp;
        tempNoBase = tempNoBase + (-1.0*decayRate*tempNoBase*integrationTime);
        tempK = tempNoBase + icebathBaseTemp;
      }

      // if hold temperature during hop stand, see if need to cool to target
      if (holdTempCheckbox && tempK > holdTempK && !doneHoldTemp) {
        // if cool to target, use immersion chiller decay factor
        // regardless of the post-whirlpool cooling method
        tempNoBase = tempK - immersionChillerBaseTemp;
        tempNoBase = tempNoBase + (-1.0*decayRate*tempNoBase*integrationTime);
        tempK = tempNoBase + immersionChillerBaseTemp;
        // however, if tempExpParamA = 0 and C < holdTemp('C), this
        // means to instantaneously cool the wort to the target temperature
        if (ibu.tempExpParamA.value == 0 &&
            ibu.tempExpParamC.value < holdTemp) {
          tempK = holdTempK;
        }
        whirlpoolTime += integrationTime;
        whirlpoolTime = Number(whirlpoolTime.toFixed(4));
        // console.log("POST-BOIL quickly cool to target " +
                    // (holdTempK-273.15).toFixed(2) +
                    // ", current temp = " + (tempK-273.15).toFixed(2) +
                    // ", WP time now " + whirlpoolTime.toFixed(2));
      }

      // if hold temperature during hop stand, and reached target temp, hold it
      if (holdTempCheckbox && tempK <= holdTempK && !doneHoldTemp) {
        holdTempCounter += integrationTime;
        tempK = holdTempK;
        // console.log("POST-BOIL HOLDING target " +
                    // (holdTempK-273.15).toFixed(2) +
                    // "'C, current temp = " + (tempK-273.15).toFixed(2) +
                    // "'C, WP time now " + whirlpoolTime.toFixed(2) +
                    // " and holdTempCounter = " + holdTempCounter.toFixed(2));
        if (holdTempCounter > origWhirlpoolTime) {
          doneHoldTemp = true;
          console.log("Done with post-boil whirlpool; total whirlpoolTime = " +
                      whirlpoolTime);
        }
      }

      // prevent numerical errors at <= 0 Kelvin
      if (tempK <= 1.0) tempK = 1.0;
      tempC = common.convertKelvinToCelsius(tempK);

      // adjust current volume due to evaporation at below-boiling temps
      // if sub-boiling, estimate evaporation rate
      if (ibu.evaporationRate.value > 0.0) {
        rateAtTemp = 0.0243 * Math.exp(0.0502 * tempC); // liters/hr
        rateAtBoil = 3.679294682; // 0.0243 * Math.exp(0.0502*100.0); // l/hr
        if (rateAtTemp > rateAtBoil) rateAtTemp = rateAtBoil;
        subBoilEvapRate = ibu.evaporationRate.value * rateAtTemp / rateAtBoil;
      } else {
        subBoilEvapRate = 0.0;
      }
      currVolume -= subBoilEvapRate/60.0 * integrationTime;

      // this function from post 'an analysis of sub-boiling hop utilization'
      degreeU = 2.39 * Math.pow(10.0, 11.0) * Math.exp(-9773.0 / tempK);
      // stop modeling if degree of utilization is less than 0.01 (temp=41.1'C)
      if (degreeU > 1.0) {
        degreeU = 1.0;
      }
      if (degreeU < 0.01) {
        finished = 1;
      }

      // limit to whirlpool time plus two hours, just to prevent infinite loop
      // (after 2 hours, almost no increase in utilization anyway)
      if (postBoilTime > ibu.whirlpoolTime.value + 120.0) {
        finished = 1;
      }
    }

    // adjust current volume due to evaporation during the boil
    if (t >= 0) {
      currVolume -= ibu.evaporationRate.value/60.0 * integrationTime;
    }

    // if finished whirlpool+stand time, do transfer and reduce volume of
    // wort, or use immersion chiller.  Check if volume reduced to 0, in
    // which case we're done.
    if (t * -1.0 == whirlpoolTime) {
      console.log("    ---- starting use of "+ coolingMethod +" chiller ---");
    }
    if (t*-1.0 >= whirlpoolTime && coolingMethod == "forcedDecayCounterflow") {
      currVolume = currVolume - volumeChange;
      totalXferTime = totalXferTime + integrationTime;
      if (currVolume <= 0.0) {
        currVolume = 0.0;
        finished = 1;
      }
    }

    // relative volume is used as a proxy for the relative amount of
    // alpha acids still being converted.  So maximum is 1.0
    relativeVolume = 1.0;
    if (postBoilVolume > 0)
      relativeVolume = currVolume / postBoilVolume;
    if (relativeVolume > 1.0) relativeVolume = 1.0;

    // compute derivative of total AA concentration, and total AA concentration.
    // compute IBU from AA concentration and other factors, and utilization
    // from IBUs and orig AA
    dAAconcent = AAconcent * k;
    AAconcent = AAconcent + (dAAconcent * integrationTime);
    IBU = IBU + (-1.0 * dAAconcent * degreeU * relativeVolume *
                 integrationTime * factor);
    if (AAinitTotal > 0.0)
      U = IBU / AAinitTotal;
    else
      U = 0.0;
    // console.log("U = " + U + ", IBU = " + IBU);

    // compute AA concentration and IBUs for each separate addition
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      dAA = ibu.add[hopIdx].AAcurr * k;
      ibu.add[hopIdx].AAcurr = ibu.add[hopIdx].AAcurr + (dAA * integrationTime);
      ibu.add[hopIdx].IBU = ibu.add[hopIdx].IBU +
             (-1.0 * dAA * degreeU * relativeVolume * integrationTime * factor);
      if (ibu.add[hopIdx].AAinit > 0.0)
        ibu.add[hopIdx].U = ibu.add[hopIdx].IBU / ibu.add[hopIdx].AAinit;
      else
        ibu.add[hopIdx].U = 0.0;
    }

    // prevent floating-point drift in 'time' variable
    t = Number(t.toFixed(4));
  }

  // In the following adjustments, we'll assume that boil gravity
  // affects IAA and nonIAA equally, so we include "bigness factor" in
  // the utilization of nonIAA
  bignessFactor = 1.65 * Math.pow(0.000125,(SG-1.0));
  console.log("  bigness factor = " + bignessFactor.toFixed(4));
  console.log("  from average specific gravity " + SG);

  // if specified, apply pH correct to IBUs
  if (use_pH) {
    console.log("Adjusting IBUs based on pH...");
    console.log("  original util = " + U.toFixed(4));
    console.log("  original IBU  = " + IBU.toFixed(2));
    // separate utilization into IAA and nonIAA components (very approximate).
    // If pre-boil pH, estimate the post-boil pH which is the
    // one we want to base losses on.  Estimate that the pH drops by
    // about 0.1 units per hour... this is a ballpark estimate.
    if (preOrPostBoilpH == "preBoilpH") {
      console.log("mapping pre-boil pH to post-boil pH");
      preBoilpH = pH;
      pH = preBoilpH - (boilTime * 0.10 / 60.0);
    }
    // compute loss factors for IAA and nonIAA
    iaaLossFactor = (0.0710 * pH) + 0.592;
    nonIaaLossFactor = (1.178506 * pH) - 5.776411;
    console.log("  post-boil pH = " + pH.toFixed(2));
    console.log("  IAA loss factor = " + iaaLossFactor.toFixed(4));
    console.log("  nonIAA loss factor = " + nonIaaLossFactor.toFixed(4));

    // Adjust utilization and IBUs for each separate addition.
    // Accumulate separate additions for total
    totalU = 0.0;
    totalIBU = 0.0;
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      console.log("  hop addition " + hopIdx + ":");
      nonIaaUtil = 0.048 * bignessFactor;  // 0.048 from 'Summary of Factors'
      iaaUtil = ibu.add[hopIdx].U - nonIaaUtil;
      // if estimated utilization from IAA < 0, reduce nonIAA utilization.
      // another option would be to just set IAA utilization to zero.
      if (iaaUtil < 0.0) {
        nonIaaUtil += iaaUtil;
        iaaUtil = 0.0;
      }
      console.log("    before losses: iaaUtil = " + iaaUtil.toFixed(4) +
                  "; nonIaaUtil = " + nonIaaUtil.toFixed(4));
      iaaUtil *= iaaLossFactor;
      nonIaaUtil *= nonIaaLossFactor;
      console.log("    after  losses: iaaUtil = " + iaaUtil.toFixed(4) +
                  "; nonIaaUtil = " + nonIaaUtil.toFixed(4));
      ibu.add[hopIdx].U = iaaUtil + nonIaaUtil;
      ibu.add[hopIdx].IBU = ibu.add[hopIdx].U * ibu.add[hopIdx].AAinit;
      console.log("    U = " + ibu.add[hopIdx].U.toFixed(4) +
                  "; IBU = " + ibu.add[hopIdx].IBU.toFixed(2));

      totalU += ibu.add[hopIdx].U;
      totalIBU += ibu.add[hopIdx].IBU;
    }
    U = totalU;
    IBU = totalIBU;
    console.log("  modified total util = " + U.toFixed(4));
    console.log("  modified total IBU  = " + IBU.toFixed(2));
    console.log(" ");
  }

  // Adjust IBUs based on krausen loss, wort clarity, and pellets/cones.
  // The adjustment for pellets will be a bit on the high side because
  // this code only looks at IAA and nonIAA.  While the majority of nonIAA
  // are oxidized alpha acids (oAA), the scaling factor of 2.0 for oAA
  // being applied to *all* nonIAA is an overcorrection.  But the impact
  // on results is probably just 1 or 2 IBUs.
  console.log("Adjusting IBUs based on krausen loss, wort clarity, pellets...");
  // compute loss factors for IAA and nonIAA
  iaaKrausenLossFactor = ibu.getKrausenValue(ibu.krausen.value);
  iaaKrausenLoss = (1.0 - iaaKrausenLossFactor);  // in percent
  nonIaaKrausenLoss = iaaKrausenLoss * 2.27;      // from krausen blog post
  nonIaaKrausenLossFactor = (1.0 - nonIaaKrausenLoss);
  iaaWortClarityLossFactor = ibu.getWortClarityValue(ibu.wortClarity.value);
  console.log("  IAA loss factor = " + iaaKrausenLossFactor.toFixed(4));
  console.log("  nonIAA loss factor = " + nonIaaKrausenLossFactor.toFixed(4));
  console.log("  wort clarity factor = " + iaaWortClarityLossFactor.toFixed(4));

  // Adjust utilization and IBUs for each separate addition.
  // Accumulate separate additions for total
  totalU = 0.0;
  totalIBU = 0.0;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    nonIaaUtil = 0.048 * bignessFactor;  // 0.048 from 'Summary of Factors'
    iaaUtil = ibu.add[hopIdx].U - nonIaaUtil;
    // if estimated utilization from IAA < 0, reduce nonIAA utilization.
    // another option would be to just set IAA utilization to zero.
    if (iaaUtil < 0.0) {
      nonIaaUtil += iaaUtil;
      iaaUtil = 0.0;
    }
    iaaUtil *= iaaKrausenLossFactor;
    iaaUtil *= iaaWortClarityLossFactor;
    nonIaaUtil *= nonIaaKrausenLossFactor;

    if (ibu.add[hopIdx].AAinit > 0.0) {
      ratio = ibu.add[hopIdx].AAdis / ibu.add[hopIdx].AAinit;
    } else {
      ratio = 0.0;
    }
    console.log("    for hop index " + hopIdx + ": [AA]init = " +
                ibu.add[hopIdx].AAinit.toFixed(3) + ", [AA]dis = " +
                ibu.add[hopIdx].AAdis.toFixed(3) + ", ratio = " +
                ratio.toFixed(4));
    if (ibu.add[hopIdx].hopForm.value == "pellets") {
      // from post Hop Cones vs Pellets: IBU Differences oAA increase by ~2
      // and (from The Relative Contribution) oAA are roughly 80% of the nonIAA
      // and also apply alpha-acid solubility limit to the amount of increase
      nonIaaUtil *= ratio*2.0*0.80;
      console.log("  pellets increase nonIAA by " + (ratio * 1.6).toFixed(3));
    }

    ibu.add[hopIdx].U = iaaUtil + nonIaaUtil;
    ibu.add[hopIdx].IBU = ibu.add[hopIdx].U * ibu.add[hopIdx].AAinit;

    totalU += ibu.add[hopIdx].U;
    totalIBU += ibu.add[hopIdx].IBU;
  }
  U = totalU;
  IBU = totalIBU;
  console.log("  modified total util = " + U.toFixed(4));
  console.log("  modified total IBU  = " + IBU.toFixed(2));
  console.log(" ");

  // adjust IBUs based on wort/trub loss and topoff volume added
  finalVolume = postBoilVolume - ibu.wortLossVolume.value;
  if (finalVolume > 0) {
    IBUtopoffScale = finalVolume / (finalVolume + ibu.topoffVolume.value);
  } else {
    IBUtopoffScale = 0.0;
  }
  console.log("before topoff, IBU = " + IBU + ", scaling = " + IBUtopoffScale);
  IBU = IBU * IBUtopoffScale;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    ibu.add[hopIdx].IBU = ibu.add[hopIdx].IBU * IBUtopoffScale;
  }

  // print out summary information to console when done
  console.log(" >> temperature at end = " + tempC.toFixed(2) + "'C after ");
  if (coolingMethod == "forcedDecayCounterflow") {
    console.log("     transfer time " + totalXferTime.toFixed(2) + " min");
  } else {
    chillingTime = -1 * (t + ibu.whirlpoolTime.value);
    console.log("     t = " + t.toFixed(3) + ", whirlpool = " + ibu.whirlpoolTime.value +
                ", chilling time " + chillingTime.toFixed(2) + " min");
  }
  console.log("U = " + U.toFixed(4) + ", IBU = " + IBU.toFixed(3));

  // set output values in HTML
  if (document.getElementById("addIBUvalue1")) {
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      idxP1 = hopIdx + 1;
      addIBUoutput = ibu.add[hopIdx].IBU.toFixed(2);
      document.getElementById('addIBUvalue'+idxP1).innerHTML = addIBUoutput;

      addUtilOutput = (ibu.add[hopIdx].U * 100.0).toFixed(2);
      document.getElementById('addUtilValue'+idxP1).innerHTML = addUtilOutput;
    }
  }

  totalIBUoutput = IBU.toFixed(2);
  ibu.IBU = IBU; // needed if evaluating with ibu_SMPH_search.js
  if (document.getElementById("totalIBUvalue")) {
    document.getElementById('totalIBUvalue').innerHTML = totalIBUoutput;
  }

  return true;
}

// close the "namespace" and call the function to construct it.
}
mIBU._construct();
