// -----------------------------------------------------------------------------
// ibu_rager.js : JavaScript for AlchemyOverlord web page, Rager sub-page
// Written by John-Paul Hosom
// Copyright © 2021 by John-Paul Hosom, all rights reserved.
//
// Version 1.0.0 : Aug. 21, 2021
//         Initial version.
//
// -----------------------------------------------------------------------------

//==============================================================================

var Rager = Rager || {};

// Declare a "namespace" called "Rager"
// This namespace contains functions that are specific to the Rager method.
//
//    public functions:
//    . initialize_Rager()
//    . computeIBU_Rager()
//

Rager._construct = function() {


//------------------------------------------------------------------------------
// initialize for performing Rager calculations

this.initialize_Rager = function() {
  var idx = 0;
  var keys = Object.keys(ibu);

  // add function to call when using set() function with ibu namespace
  for (idx = 0; idx < keys.length; idx++) {
    if (!ibu[keys[idx]].id) {
      continue;
    }
    ibu[keys[idx]].updateFunction = Rager.computeIBU_Rager;
  }
  ibu.numAdditions.additionalFunctionArgs = Rager.computeIBU_Rager;
  ibu.hopTableSize = 3; // compact: AA%, weight, boilTime

  // don't need to set() any variables that change with unit conversion;
  // when we call set(units), those dependent variables will also be set.
  common.set(ibu.boilTime, 0);
  common.set(ibu.preOrPostBoilVol, 0);
  common.set(ibu.OG, 0);
  common.set(ibu.scalingFactor, 0);
  common.set(ibu.numAdditions, 0);
  common.set(ibu.units, 0);

  this.verbose = 1;

  Rager.computeIBU_Rager();

  return;
}

//------------------------------------------------------------------------------
// compute IBUs and utilization for all hops additions

this.computeIBU_Rager = function() {
  var AA = 0.0;
  var addIBU = 0.0;
  var addIBUoutput = 0.0;
  var addUtilOutput = 0.0;
  var idx = 0;
  var idxP1 = 0;
  var boilTime = ibu.boilTime.value;
  var OGpoints = 0.0;
  var postBoilVolume = 0.0;
  var SG = 0.0;
  var SGpoints = 0.0;
  var steepTime = 0.0;
  var totalIBU = 0.0;
  var totalIBUoutput = 0.0;
  var weight = 0.0;

  if (ibu.numAdditions.value < 1) {
    return false;
  }

  if (Rager.verbose > 0) {
    console.log("============================================================");
  }

  postBoilVolume = ibu.getPostBoilVolume();

  if (Rager.verbose > 0) {
    console.log("evaporation rate = " + ibu.evaporationRate.value +
              ", post-boil volume = " + postBoilVolume +
              ", OG = " + ibu.OG.value);
    console.log("wort loss volume = " + ibu.wortLossVolume.value +
              ", topoff volume = " + ibu.topoffVolume.value);
  }

  // initialize outputs from each hop addition to zero
  if (Rager.verbose > 0) {
    console.log("number of hops additions: " + ibu.add.length);
  }
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    if (Rager.verbose > 0) {
      console.log("  addition " + hopIdx+1 + ": AA=" +
                ibu.add[hopIdx].AA.value +
                ", weight=" + ibu.add[hopIdx].weight.value +
                ", time=" + ibu.add[hopIdx].steepTime.value);
    }
    ibu.add[hopIdx].AAinit = 0.0;
    ibu.add[hopIdx].AAcurr = 0.0;
    ibu.add[hopIdx].IBU = 0.0;
    ibu.add[hopIdx].U = 0.0;
  }

  // in Rager's formula, the gravity is the pre-boil (starting) gravity.
  // get initial volume from post-boil volume, evaporation rate, and boil time;
  // then get initial gravity.
  initVolume = postBoilVolume + (ibu.evaporationRate.value/60.0 * boilTime);
  OGpoints = (ibu.OG.value - 1.0) * 1000.0;
  SGpoints = OGpoints * postBoilVolume / initVolume;
  SG = (SGpoints / 1000.0) + 1.0;
  if (Rager.verbose > 0) {
    console.log("OG is " + ibu.OG.value + ", post-boil volume is " +
              postBoilVolume + " and initial volume is " +
              initVolume.toFixed(4) + ", so *starting* gravity is " +
              SG.toFixed(4));
  }

  totalIBU = 0.0;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    if (ibu.add[hopIdx].kettleOrDryHop &&
        ibu.add[hopIdx].kettleOrDryHop.value != "kettle") {
      continue;
    }
    AA = ibu.add[hopIdx].AA.value / 100.0;
    weight = ibu.add[hopIdx].weight.value;
    steepTime = ibu.add[hopIdx].steepTime.value;
    // Rager formula doesn't allow for post-flameout utilization
    if (steepTime < 0) {
      steepTime = 0.0;
    }

    addIBU = computeIBUsingleAddition_Rager(postBoilVolume,
                ibu.wortLossVolume.value, ibu.topoffVolume.value,
                SG, AA, weight, steepTime, ibu.scalingFactor.value);
    totalIBU += addIBU.IBU;

    ibu.add[hopIdx].IBU = addIBU.IBU;
    ibu.add[hopIdx].U = addIBU.util;
  }

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

  totalIBUoutput = totalIBU.toFixed(2);
  ibu.IBU = totalIBU;
  if (document.getElementById("totalIBUvalue")) {
    document.getElementById('totalIBUvalue').innerHTML = totalIBUoutput;
  }
  return true;
}

//------------------------------------------------------------------------------
// compute IBUs and utilization for a single addition

function computeIBUsingleAddition_Rager(postBoilVolume, wortLossVolume,
                   topoffVolume, SG, AA, weight, steepTime, scalingFactor) {
  var finalVolume = 0.0;
  var GA = 0.0;
  var topoffScaling = 0.0;
  var U = 0.0;
  var IBUresult = {
            util: 0,
            IBU: 0
            }

  IBUresult.IBU = 0.0;
  IBUresult.utilization = 0.0;

  // This utilization formula comes from Norm Pyle's Hops FAQ,
  //      https://realbeer.com/hops/FAQ.html
  U = 18.11 + (13.86 * Math.tanh((steepTime - 31.32) / 18.27));
  U /= 100.0; // convert to 0...1
  if (Rager.verbose > 0) {
    console.log("U = " + U);
  }
  IBUresult.util = scalingFactor * U;

  GA = (SG - 1.050) / 0.2;
  if (GA < 0.0) {
    GA = 0.0;
  }

  if (postBoilVolume > 0) {
    IBUresult.IBU = scalingFactor * U * AA * weight * 1000.0 /
                    (postBoilVolume * (1.0 + GA));
  } else {
    IBUresult.IBU = 0.0;
  }
  finalVolume = postBoilVolume - wortLossVolume;
  if (finalVolume > 0.0) {
    topoffScaling = finalVolume / (finalVolume + topoffVolume);
    if (Rager.verbose > 0) {
      console.log("finalVol = " + finalVolume + ", topoff = " +
                topoffVolume + ", scaling factor = " + topoffScaling);
    }
  } else {
    topoffScaling = 0.0;
  }
  IBUresult.IBU = IBUresult.IBU * topoffScaling;

  return IBUresult;
}

// close the "namespace" and call the function to construct it.
}
Rager._construct();
