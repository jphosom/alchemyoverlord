// -----------------------------------------------------------------------------
// ibu_tinseth.js : JavaScript for AlchemyOverlord web page, Tinseth sub-page
// Written by John-Paul Hosom
//
// Copyright © 2018 John-Paul Hosom, all rights reserved.
//
// Version 1.0.0 : January 30, 2017
//         Initial version.  Complete but no-frills implementation of the
//         Tinseth formula.
//
// Version 1.0.1 : May 6, 2018
//         . Add evaporation rate, losses, topoff volume, global scaling factor
//
// Version 1.2.0 : July 15, 2018
//         . complete re-write under the hood
//         . add boil time parameter
//         . bug fix in computing average specific gravity
//         . add saving and loading of settings
//
// -----------------------------------------------------------------------------

//==============================================================================

var Tinseth = Tinseth || {};

// Declare a "namespace" called "Tinseth"
// This namespace contains functions that are specific to the Tinseth method.
//
//    public functions:
//    . initialize_Tinseth()
//    . computeIBU_Tinseth()
//

Tinseth._construct = function() {


//------------------------------------------------------------------------------
// initialize for performing Tinseth calculations

this.initialize_Tinseth = function() {
  var idx = 0;
  var keys = Object.keys(ibu);

  // add function to call when using set() function with ibu namespace
  for (idx = 0; idx < keys.length; idx++) {
    if (keys[idx] == "_construct") {
      continue;
    }
    ibu[keys[idx]].updateFunction = Tinseth.computeIBU_Tinseth;
  }
  ibu.numAdditions.additionalFunctionArgs = Tinseth.computeIBU_Tinseth;

  // don't need to set() any variables that change with unit conversion;
  // when we call set(units), those dependent variables will also be set.
  common.set(ibu.units, 0);
  common.set(ibu.boilTime, 0);
  common.set(ibu.OG, 0);
  common.set(ibu.scalingFactor, 0);
  common.set(ibu.numAdditions, 0);

  Tinseth.computeIBU_Tinseth();

  return;
}

//------------------------------------------------------------------------------
// compute IBUs and utilization for all hops additions

this.computeIBU_Tinseth = function() {
  var AA = 0.0;
  var addIBU = 0.0;
  var addIBUoutput = 0.0;
  var addUtilOutput = 0.0;
  var idx = 0;
  var idxP1 = 0;
  var maxBoilTime = ibu.boilTime.value;
  var OGpoints = 0.0;
  var SG = 0.0;
  var SGpoints = 0.0;
  var steepTime = 0.0;
  var totalIBU = 0.0;
  var totalIBUoutput = 0.0;
  var weight = 0.0;

  // if no IBU outputs exist (no table yet), then just return
  if (!document.getElementById("AA1")) {
    return false;
  }
  console.log("==============================================================");
  console.log("evaporation rate = " + ibu.evaporationRate.value +
              ", post-boil volume = " + ibu.postBoilVolume.value +
              ", OG = " + ibu.OG.value);
  console.log("wort loss volume = " + ibu.wortLossVolume.value +
              ", topoff volume = " + ibu.topoffVolume.value);

  // initialize outputs from each hop addition to zero
  console.log("number of hops additions: " + ibu.add.length);
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    console.log("  addition " + hopIdx+1 + ": AA=" + ibu.add[hopIdx].AA.value +
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

  totalIBU = 0.0;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    AA = ibu.add[hopIdx].AA.value / 100.0;
    weight = ibu.add[hopIdx].weight.value;
    steepTime = ibu.add[hopIdx].boilTime.value;
    // Tinseth formula doesn't allow for post-flameout utilization
    if (steepTime < 0) {
      steepTime = 0.0;
    }

    addIBU = computeIBUsingleAddition_Tinseth(ibu.postBoilVolume.value,
                ibu.wortLossVolume.value, ibu.topoffVolume.value,
                SG, AA, weight, steepTime, ibu.scalingFactor.value);
    totalIBU += addIBU.IBU;

    ibu.add[hopIdx].IBU = addIBU.IBU;
    ibu.add[hopIdx].U = addIBU.util;
  }

  // set output values in HTML
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    idxP1 = hopIdx + 1;
    addIBUoutput = ibu.add[hopIdx].IBU.toFixed(2);
    document.getElementById('addIBUvalue'+idxP1).innerHTML = addIBUoutput;

    addUtilOutput = (ibu.add[hopIdx].U * 100.0).toFixed(2);
    document.getElementById('addUtilValue'+idxP1).innerHTML = addUtilOutput;
  }

  totalIBUoutput = totalIBU.toFixed(2);
  document.getElementById('totalIBUvalue').innerHTML = totalIBUoutput;
  return true;
}

//------------------------------------------------------------------------------
// compute IBUs and utilization for a single addition

function computeIBUsingleAddition_Tinseth(postBoilVolume, wortLossVolume,
                   topoffVolume, SG, AA, weight, steepTime, scalingFactor) {
  var scaledTime = 0.0;
  var wgm1 = 0.0;
  var bignessFactor = 0.0;
  var steepTimeFactor = 0.0;
  var decimalAArating = 0.0;
  var AAcon = 0.0;
  var finalVolume = 0.0;
  var topoffScaling = 0.0;
  var U = 0.0;
  var IBU = 0.0;
  var IBUresult = {
            util: 0,
            IBU: 0
            }

  IBUresult.IBU = 0.0;
  IBUresult.utilization = 0.0;

  scaledTime = -0.04 * steepTime;
  wgm1 = SG - 1.0;
  bignessFactor = 1.65 * Math.pow(0.000125, wgm1);
  steepTimeFactor = (1.0 - Math.exp(scaledTime)) / 4.15;
  decimalAArating = bignessFactor * steepTimeFactor;
  U = decimalAArating;
  IBUresult.util = scalingFactor * U;
  if (postBoilVolume > 0) {
    IBUresult.IBU = scalingFactor * U * AA * weight * 1000.0 / postBoilVolume;
    } else {
    IBUresult.IBU = 0.0;
    }
  finalVolume = postBoilVolume - wortLossVolume;
  if (finalVolume > 0.0) {
    topoffScaling = finalVolume / (finalVolume + topoffVolume);
    console.log("finalVol = " + finalVolume + ", topoff = " +
                topoffVolume + ", scaling factor = " + topoffScaling);
  } else {
    topoffScaling = 0.0;
  }
  IBUresult.IBU = IBUresult.IBU * topoffScaling;
  AAcon = AA * weight * 1000.0 / postBoilVolume;
  console.log("[AA] = " + AAcon + ", U = " + U + ", IBU = " + IBU);

  return IBUresult;
}

// close the "namespace" and call the function to construct it.
}
Tinseth._construct();
