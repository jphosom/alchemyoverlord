// -----------------------------------------------------------------------------
// ibu_garetz.js : JavaScript for AlchemyOverlord web page, Garetz sub-page
// Written by John-Paul Hosom
// Copyright © 2021 by John-Paul Hosom, all rights reserved.
//
// Version 1.0.0 : Aug. 21, 2021
//         Initial version.
//
// -----------------------------------------------------------------------------

//==============================================================================

var Garetz = Garetz || {};

// Declare a "namespace" called "Garetz"
// This namespace contains functions that are specific to the Garetz method.
//
//    public functions:
//    . initialize_Garetz()
//    . computeIBU_Garetz()
//

Garetz._construct = function() {

"use strict";

//------------------------------------------------------------------------------
// initialize for performing Garetz calculations

this.initialize_Garetz = function() {
  var idx = 0;
  var keys = Object.keys(ibu);

  // add function to call when using set() function with ibu namespace
  for (idx = 0; idx < keys.length; idx++) {
    if (!ibu[keys[idx]].id) {
      continue;
    }
    ibu[keys[idx]].updateFunction = Garetz.computeIBU_Garetz;
  }
  ibu.numAdditions.additionalFunctionArgs = Garetz.computeIBU_Garetz;
  ibu.hopTableSize = 11; // compact: AA%, weight, boilTime, hopForm, pellet fact
  ibu.defaultPelletFactor = 1.10;

  // don't need to set() any variables that change with unit conversion;
  // when we call set(units), those dependent variables will also be set.
  common.set(ibu.boilTime, 0);
  common.set(ibu.preOrPostBoilVol, 0);
  common.set(ibu.OG, 0);
  common.set(ibu.scalingFactor, 0);
  common.set(ibu.defaultHopForm, 0);
  common.set(ibu.hopDecayMethod, 0);
  common.set(ibu.numAdditions, 0);
  common.set(ibu.flocculation, 0);
  common.set(ibu.filtering, 0);
  common.set(ibu.units, 0);

  this.verbose = 1;

  Garetz.computeIBU_Garetz();

  return;
}

//------------------------------------------------------------------------------
// Compute loss factor (LF) for filtering

function compute_LF_filtering(ibu) {
  var LF_filtering = 0.0;

  LF_filtering = 1.0;
  if (!isNaN(ibu.filtering.value)) {
    if (ibu.filtering.value >= 0 && ibu.filtering.value < 9.0) {
      // 1 and 5 microns are typical filter sizes for beer; assign
      // 1 micron to "aggressive" and 5 microns to "soft" filtering.
      // according to Garetz, soft filtering yields a factor of 1.0125
      //                      aggressive filtering yields a factor of 1.025
      // so a straight-line fit has 9 microns with a factor of 1.0 (no effect)
      LF_filtering = (-0.003125 * ibu.filtering.value) + 1.028125
    }
  }
  return LF_filtering;
}

//------------------------------------------------------------------------------
// compute IBUs and utilization for all hops additions

this.computeIBU_Garetz = function() {
  var AA = 0.0;
  var addIBU = 0.0;
  var addIBUoutput = 0.0;
  var addUtilOutput = 0.0;
  var elevationF = 0.0;
  var elevationM = 0.0;
  var hopIdx = 0;
  var idxP1 = 0;
  var initVolume = 0.0;
  var boilTime = ibu.boilTime.value;
  var OGpoints = 0.0;
  var PF = 0.0;
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

  if (Garetz.verbose > 0) {
    console.log("============================================================");
  }

  // convert boiling point of water to elevation in meters;
  // then convert elevation in meters to elevation in feet
  elevationM = (100.0 - ibu.boilTemp.value) / 0.003307;
  elevationF = common.convertMetersToFeet(elevationM);
  console.log("elevation = " + elevationM.toFixed(2) + " meters, or " +
              elevationF.toFixed(2) + " feet");

  postBoilVolume = ibu.getPostBoilVolume();

  if (Garetz.verbose > 0) {
    console.log("evaporation rate = " + ibu.evaporationRate.value +
              ", post-boil volume = " + postBoilVolume +
              ", OG = " + ibu.OG.value);
    console.log("wort loss volume = " + ibu.wortLossVolume.value +
              ", topoff volume = " + ibu.topoffVolume.value);
  }

  // initialize outputs from each hop addition to zero
  if (Garetz.verbose > 0) {
    console.log("number of hops additions: " + ibu.add.length);
  }
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    if (Garetz.verbose > 0) {
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

  // in Garetz' formula, the gravity is the pre-boil (starting) gravity.
  // get initial volume from post-boil volume, evaporation rate, and boil time;
  // then get initial gravity.
  initVolume = postBoilVolume + (ibu.evaporationRate.value/60.0 * boilTime);
  OGpoints = (ibu.OG.value - 1.0) * 1000.0;
  SGpoints = OGpoints * postBoilVolume / initVolume;
  SG = (SGpoints / 1000.0) + 1.0;
  if (Garetz.verbose > 0) {
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
    AA = ibu.add[hopIdx].AA.value * ibu.add[hopIdx].freshnessFactor.value/100.0;
    weight = ibu.add[hopIdx].weight.value;
    steepTime = ibu.add[hopIdx].steepTime.value;
    // Garetz formula doesn't allow for post-flameout utilization
    if (steepTime < 0) {
      steepTime = 0.0;
    }

    // Garetz' factors are for amount of hops, not IBU, so need 1/PF
    PF = 1.0 / ibu.add[hopIdx].pelletFactor.value;

    addIBU = computeIBUsingleAddition_Garetz(postBoilVolume,
                ibu.wortLossVolume.value, ibu.topoffVolume.value, SG, PF,
                AA, weight, steepTime, elevationF, ibu.scalingFactor.value);
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

function computeIBUsingleAddition_Garetz(postBoilVolume, wortLossVolume,
                   topoffVolume, SG, PF, AA, weight, steepTime, elevationF,
                   scalingFactor) {
  var AAcon = 0.0;
  var FF = 0.0;
  var finalVolume = 0.0;
  var GF = 0.0;
  var IBU = 0.0;
  var TF = 0.0;
  var topoffScaling = 0.0;
  var U = 0.0;
  var V = postBoilVolume;
  var YF = 0.0;
  var IBUresult = {
            util: 0,
            IBU: 0
            }

  IBUresult.IBU = 0.0;
  IBUresult.utilization = 0.0;

  TF = ((elevationF / 550.0) * 0.02) + 1.0;
  console.log("Temperature factor = " + TF.toFixed(4));

  GF = ((SG - 1.050) / 0.2) + 1.0;
  if (GF < 1.0) {
    GF = 1.0;
  }
  console.log("Gravity factor = " + GF.toFixed(4));

  if (ibu.flocculation.value == "high") {
    YF = 1.05;
  } else if (ibu.flocculation.value == "medium") {
    YF = 1.00;
  } else if (ibu.flocculation.value == "low") {
    YF = 0.95;
  } else {
    console.log("ERROR: unknown flocculation value: " + ibu.flocculation.value);
    YF = 1.00;
  }
  console.log("Yeast factor = " + YF.toFixed(4));

  console.log("Pellet factor = " + PF.toFixed(4));

  FF = compute_LF_filtering(ibu);
  console.log("Filtering factor = " + FF.toFixed(4));

  // this equation has been fit to the data in Using Hops, Table 8.1, p. 138.
  U = 0.0702 + (0.1535 * Math.tanh((steepTime - 21.34)/24.85))
  if (U < 0.0) { U = 0.0; }
  console.log("Utilization (original) = " + U.toFixed(4));

  U = U / (GF * PF * TF * YF * FF);
  console.log("Utilization (modified) = " + U.toFixed(4));

  IBU = weight * AA * U * 1000.0 / V;
  console.log("IBU before hopping-rate correction = " + IBU.toFixed(2));

  IBU = 130.0 * (-1.0 + Math.sqrt(1.0 + ((weight * U * AA)/(0.065*V))));
  console.log("IBU after hopping-rate correction  = " + IBU.toFixed(2));

  IBU *= scalingFactor;
  IBUresult.util = scalingFactor * U;
  if (V > 0) {
    IBUresult.IBU = IBU;
  } else {
    IBUresult.IBU = 0.0;
  }
  finalVolume = V - wortLossVolume;
  if (finalVolume > 0.0) {
    topoffScaling = finalVolume / (finalVolume + topoffVolume);
    if (Garetz.verbose > 0) {
      console.log("finalVol = " + finalVolume + ", topoff = " +
                topoffVolume + ", scaling factor = " + topoffScaling);
    }
  } else {
    topoffScaling = 0.0;
  }
  IBUresult.IBU = IBUresult.IBU * topoffScaling;
  AAcon = AA * weight * 1000.0 / V;
  if (Garetz.verbose > 0) {
    console.log("[AA] = "+AAcon+", U = "+U+", IBU = "+IBUresult.IBU);
  }

  return IBUresult;
}

// close the "namespace" and call the function to construct it.
}
Garetz._construct();
