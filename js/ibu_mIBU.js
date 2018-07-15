// -----------------------------------------------------------------------------
// ibu_mIBU.js : JavaScript for AlchemyOverlord web page, mIBU sub-page
// Written by John-Paul Hosom
//
// Copyright © 2018 John-Paul Hosom, all rights reserved.
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
// TODO:
// 1. add correction factor for pH
// 2. add correction factor for pellets
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
    if (keys[idx] == "_construct") {
      continue;
    }
    ibu[keys[idx]].updateFunction = mIBU.computeIBU_mIBU;
  }
  ibu.numAdditions.additionalFunctionArgs = mIBU.computeIBU_mIBU;

  // don't need to set() any variables that change with unit conversion;
  // when we call set(units), those dependent variables will also be set.
  common.set(ibu.units, 0);
  common.set(ibu.boilTime, 0);
  common.set(ibu.OG, 0);
  common.set(ibu.tempDecayType, 0);
  common.set(ibu.whirlpoolTime, 0);
  common.set(ibu.immersionDecayFactor, 0);
  common.set(ibu.icebathDecayFactor, 0);
  common.set(ibu.forcedDecayType, 0);
  common.set(ibu.scalingFactor, 0);
  common.set(ibu.numAdditions, 0);
  common.set(ibu.useSolubilityLimit, 0);

  mIBU.computeIBU_mIBU();

  return;
}

//------------------------------------------------------------------------------
// compute IBUs and utilization for all hops additions

this.computeIBU_mIBU = function() {
  var AA = 0.0;
  var AAconcent = 0.0;
  var additionTime = 0.0;
  var AAinit = 0.0;
  var AAinitTotal = 0.0;
  var addIBUoutput = 0.0;
  var addUtilOutput = 0.0;
  var averageVolume = 0.0;
  var chillingTime = 0.0;
  var coolingMethod =
      document.querySelector('input[name="ibu.forcedDecayType"]:checked').value;
  var currentAddition = 0.0;
  var currVolume = 0.0;
  var dAA = 0.0;
  var dAAconcent = 0.0;
  var decayRate = 0.0;
  var degreeU = 0.0;
  var effectiveAA = 0.0;
  var expParamC_Kelvin = 0.0;
  var factor = 0.0;
  var finalVolume = 0.0;
  var finished = 0;
  var hopIdx = 0;
  var idxP1 = 0;
  var IBU = 0.0;
  var IBUtopoffScale = 0.0;
  var icebathBaseTemp = 314.00; // 40.85'C = 105.53'F
  var immersionChillerBaseTemp = 293.15; // 20'C = 68'F
  var initVolume = 0.0;
  var integrationTime = 0.0;
  var isTempDecayLinear = document.getElementById('tempDecayLinear').checked;
  var k = 0.0;
  var linParamB_Kelvin = 0.0;
  var maxBoilTime = ibu.boilTime.value;
  var OGpoints = 0.0;
  var postBoilTime = 0.0;
  var preAddConcent = 0.0;
  var relativeVolume = 0.0;
  var SG = 0.0;
  var SGpoints = 0.0;
  var solLowerThresh = 180.0;
  var solubilityLimit = 0.0;
  var t = 0.0;
  var tempC = 0.0;
  var tempK = 0.0;
  var tempNoBase = 0.0;
  var totalIBUoutput = 0.0;
  var totalXferTime = 0.0;
  var U = 0.0;
  var useSolubilityLimit =
          document.getElementById('solubilityLimitYes').checked;
  var volumeChange = 0.0;
  var weight;
  var xferRate = 0.0;

  // if no IBU outputs exist (no table yet), then just return
  if (!document.getElementById("AA1")) {
    return false;
  }

  console.log("\n============================================================");

  console.log("kettle diameter = " + ibu.kettleDiameter.value +
              ", kettle opening = " + ibu.kettleOpening.value);

  console.log("evaporation rate = " + ibu.evaporationRate.value +
              ", post-boil volume = " + ibu.postBoilVolume.value +
              ", OG = " + ibu.OG.value);
  console.log("wort loss volume = " + ibu.wortLossVolume.value +
              ", topoff volume = " + ibu.topoffVolume.value);
  if (!isTempDecayLinear) {
    console.log("Exponential decay: A=" + ibu.tempExpParamA.value + ", B=" +
                ibu.tempExpParamB.value + ", C=" + ibu.tempExpParamC.value);
  } else {
    console.log("Linear temp decay: A=" + ibu.tempLinParamA.value + ", B=" +
                ibu.tempLinParamB.value);
  }
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
  console.log("IBU scaling factor = " + ibu.scalingFactor.value +
              ", useSolubilityLimit = " + useSolubilityLimit);

  // initialize outputs from each hop addition to zero
  console.log("number of hops additions: " + ibu.add.length);
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    console.log("  addition " + Number(hopIdx+1) + ": AA=" +
                ibu.add[hopIdx].AA.value +
                ", weight=" + ibu.add[hopIdx].weight.value +
                ", time=" + ibu.add[hopIdx].boilTime.value);
    ibu.add[hopIdx].AAinit = 0.0;
    ibu.add[hopIdx].AAcurr = 0.0;
    ibu.add[hopIdx].IBU = 0.0;
    ibu.add[hopIdx].U = 0.0;
  }

  // get initial volume from post-boil volume, evaporation rate, and boil time;
  // then get average volume and average specific gravity
  initVolume = ibu.postBoilVolume.value +
               (ibu.evaporationRate.value/60.0 * maxBoilTime);
  console.log("volume at first hops addition = " +
              ibu.postBoilVolume.value + " + (" + ibu.evaporationRate.value +
              "/60.0 * " + maxBoilTime + ") = " + initVolume);
  averageVolume = (initVolume + ibu.postBoilVolume.value) / 2.0;
  OGpoints = (ibu.OG.value - 1.0) * 1000.0;
  SGpoints = OGpoints * ibu.postBoilVolume.value / averageVolume;
  SG = (SGpoints / 1000.0) + 1.0;
  console.log("OG is " + ibu.OG.value + ", post-boil volume is " +
              ibu.postBoilVolume.value + " and initial volume is " +
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

  // make sure that boil time doesn't have higher precision than integ. time
  if (common.getPrecision("" + maxBoilTime) > 2) {
    maxBoilTime = Number(maxBoilTime.toFixed(2));
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
  for (t = maxBoilTime; finished == 0; t = t - integrationTime) {
    // check to see if add hops at this time point.
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      additionTime = ibu.add[hopIdx].boilTime.value;
      // make sure that addition time doesn't have higher precision than integ.
      if (common.getPrecision("" + additionTime) > 2) {
        additionTime = Number(additionTime.toFixed(2));
      }
      if (Math.round(t * 1000) == Math.round(additionTime * 1000)) {
        AA = ibu.add[hopIdx].AA.value / 100.0;
        weight = ibu.add[hopIdx].weight.value;
        // note that AAinit is computed using postBoilVolume because
        // we base IBU off of AAinit, and IBU should be relative to final vol.
        if (ibu.postBoilVolume.value > 0) {
          AAinit = AA * weight * 1000 / ibu.postBoilVolume.value;
        } else {
          AAinit = 0.0;
        }
        console.log("AA=" + AA + ", w=" + weight + ", vol=" +
                    ibu.postBoilVolume.value);
        console.log("at time " + t.toFixed(3) + ", adding hops addition " +
                    hopIdx + " with [AA] = " + AAinit.toFixed(2) +
                    " to existing [AA] = " + AAconcent.toFixed(2));
        ibu.add[hopIdx].AAinit = AAinit;
        AAinitTotal = AAinitTotal + AAinit;
        preAddConcent = AAconcent;

        // if use solubility limit, see if we need to change AA concentration
        if (useSolubilityLimit) {
          // if [AA] is above threshold, find out what it would be at this
          // point in time if there was no solubility limit.
          if (AAconcent > solLowerThresh) {
            effectiveAA = -31800.0 / (AAconcent - 356.67);
          } else {
            effectiveAA = AAconcent;
          }
          console.log("    from [AA]=" + AAconcent.toFixed(2) +
                      ", effectiveAA is " +
                      effectiveAA.toFixed(2), ", then adding " +
                      AAinit.toFixed(2));
          effectiveAA = effectiveAA + AAinit;
          if (effectiveAA > solLowerThresh) {
            solubilityLimit = (-31800.0/effectiveAA) + 356.67;
          } else {
            solubilityLimit = solLowerThresh;
          }
          console.log("    from new effective [AA]=" + effectiveAA.toFixed(2) +
                      ", limit is " + solubilityLimit.toFixed(2));
          // if effective [AA] after new hops addition is above threshold,
          // set [AA] to new limit; otherwise, [AA] is the effective [AA]
          if (effectiveAA > solLowerThresh && effectiveAA > solubilityLimit) {
            AAconcent = solubilityLimit;
          } else {
            AAconcent = effectiveAA;
          }
          console.log("    after addition, AAconcent = " +AAconcent.toFixed(4));
        } else {
          AAconcent = AAconcent + AAinit;
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

    // if wort is still very hot (tempC > 90'C), then adjust volume
    // based on evaporation rate.  Consider changing this in the future;
    // rate of evaporation is not binary.
    if (tempC >= 80.0) {
      currVolume = currVolume - (ibu.evaporationRate.value/60.0 * integrationTime);
    }

    // if post boil (t < 0), then adjust temperature and degree of utilization
    if (t < 0) {
      postBoilTime = t * -1.0;
      // if counterflow or not yet done with whirlpool, get temp from cooling fn
      if (coolingMethod == "forcedDecayCounterflow" ||
          postBoilTime < ibu.whirlpoolTime.value) {
        if (!isTempDecayLinear) {
          tempK = (ibu.tempExpParamA.value *
                     Math.exp(-1.0 * ibu.tempExpParamB.value * postBoilTime)) +
                     expParamC_Kelvin;
        } else {
          tempK = (ibu.tempLinParamA.value * postBoilTime) + linParamB_Kelvin;
        }
      }
      // if immersion/icebath AND done with whirlpool, adjust
      // temp with new function
      if (coolingMethod == "forcedDecayImmersion" &&
          postBoilTime >= ibu.whirlpoolTime.value) {
        tempNoBase = tempK - immersionChillerBaseTemp;
        tempNoBase = tempNoBase + (-1.0*decayRate*tempNoBase*integrationTime);
        tempK = tempNoBase + immersionChillerBaseTemp;
      }
      if (coolingMethod == "forcedDecayIcebath" &&
          postBoilTime >= ibu.whirlpoolTime.value) {
        tempNoBase = tempK - icebathBaseTemp;
        tempNoBase = tempNoBase + (-1.0*decayRate*tempNoBase*integrationTime);
        tempK = tempNoBase + icebathBaseTemp;
      }
      // prevent numerical errors at <= 0 Kelvin
      if (tempK <= 1.0) tempK = 1.0;

      tempC = common.convertKelvinToCelsius(tempK);

      // this function from post 'an analysis of sub-boiling hop utilization'
      degreeU = 2.39 * Math.pow(10.0, 11.0) * Math.exp(-9773.0 / tempK);
      // stop modeling if degree of utilization is less than 0.001
      if (degreeU < 0.001) {
        finished = 1;
      }

      // limit to whirlpool time plus two hours, just to prevent infinite loop
      // (after 2 hours, almost no increase in utilization anyway)
      if (postBoilTime > ibu.whirlpoolTime.value + 120.0) {
        finished = 1;
      }
    }

    // if finished whirlpool+stand time, do transfer and reduce volume of
    // wort, or use immersion chiller.  Check if volume reduced to 0, in
    // which case we're done.
    if (t * -1.0 == ibu.whirlpoolTime.value) {
      console.log("    ---- starting use of "+ coolingMethod +" chiller ---");
    }
    if (t * -1.0 >= ibu.whirlpoolTime.value &&
         coolingMethod == "forcedDecayCounterflow") {
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
    if (ibu.postBoilVolume.value > 0)
      relativeVolume = currVolume / ibu.postBoilVolume.value;
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

  // adjust IBUs based on wort/trub loss and topoff volume added
  finalVolume = ibu.postBoilVolume.value - ibu.wortLossVolume.value;
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
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    idxP1 = hopIdx + 1;
    addIBUoutput = ibu.add[hopIdx].IBU.toFixed(2);
    document.getElementById('addIBUvalue'+idxP1).innerHTML = addIBUoutput;

    addUtilOutput = (ibu.add[hopIdx].U * 100.0).toFixed(2);
    document.getElementById('addUtilValue'+idxP1).innerHTML = addUtilOutput;
  }

  totalIBUoutput = IBU.toFixed(2);
  document.getElementById('totalIBUvalue').innerHTML = totalIBUoutput;

  return true;
}

// close the "namespace" and call the function to construct it.
}
mIBU._construct();
