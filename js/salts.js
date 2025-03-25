// -----------------------------------------------------------------------------
// salts.js : JavaScript for AlchemyOverlord web page, salts sub-page
// Written by John-Paul Hosom
// Copyright © 2023-2025 by John-Paul Hosom, all rights reserved.
// To license this software, please contact John-Paul Hosom, for example at
//    alchemyoverlord © yahoo · com
// In many cases (at the sole discretion of John-Paul Hosom) a license
// is provided free of charge, but a written license is required for
// legal use of this code.
//
// Version 1.0.0 : June 23, 2023 -- November 23, 2023
//         Initial version.
// todo: thorough testing
//
// -----------------------------------------------------------------------------

//==============================================================================

var salts = salts || {};

// Declare a "namespace" called "salts"
// This namespace contains functions that are specific to salts method.
//
//    public functions:
//    . initialize_salts()
//    . compute_salts()
//

salts._construct = function() {

"use strict";

//------------------------------------------------------------------------------
// initialize

this.initialize_salts = function() {
  var idx = 0;
  var keys;
  var updateFunction = this.compute_salts;

  // color options
  this.defaultColor = "#94476b"; // greyish red

  //----------------------------------------------------------------------------
  // create data for all variables

  this.units = new Object();
  this.outputs = new Object();
  this.waterVolume = new Object();
  this.CaCl2form = new Object();
  this.ratioCl = new Object();
  this.ratioSO = new Object();
  this.currentCa = new Object();
  this.targetCa = new Object();
  this.currentSO4 = new Object();
  this.maxSO4 = new Object();
  this.currentCl = new Object();
  this.maxCl = new Object();

  this.units.id = "salts.units";
  this.units.inputType = "radioButton";
  this.units.value = "imperial";
  this.units.userSet = 0;
  this.units.defaultValue = "imperial";
  this.units.additionalFunction = setUnits;
  this.units.additionalFunctionArgs = "";
  this.units.updateFunction = salts.compute_salts;
  this.units.parent = "salts";

  this.outputs.id = "salts.outputs";
  this.outputs.inputType = "radioButton";
  this.outputs.value = "tsp";
  this.outputs.userSet = 0;
  this.outputs.defaultValue = "tsp";
  this.outputs.updateFunction = salts.compute_salts;
  this.outputs.parent = "salts";

  this.waterVolume.id = "salts.waterVolume";
  this.waterVolume.inputType = "float";
  this.waterVolume.value = 23.0;
  this.waterVolume.userSet = 0;
  this.waterVolume.convertToMetric = common.convertGallonsToLiters;
  this.waterVolume.convertToImperial = common.convertLitersToGallons;
  this.waterVolume.precision = 2;
  this.waterVolume.minPrecision = 1;
  this.waterVolume.display = "";
  this.waterVolume.min = 0.01;
  this.waterVolume.max = 10000.0;
  this.waterVolume.description = "volume of water to which salts are added";
  this.waterVolume.defaultValue = 23.0;
  this.waterVolume.updateFunction = salts.compute_salts;
  this.waterVolume.parent = "salts";

  this.CaCl2form.id = "salts.CaCl2form";
  this.CaCl2form.inputType = "radioButton";
  this.CaCl2form.value = "dihydrate";
  this.CaCl2form.userSet = 0;
  this.CaCl2form.defaultValue = "dihydrate";
  this.CaCl2form.updateFunction = salts.compute_salts;
  this.CaCl2form.parent = "salts";

  this.ratioCl.id = "salts.ratioCl";
  this.ratioCl.inputType = "int";
  this.ratioCl.value = 0;
  this.ratioCl.userSet = 0;
  this.ratioCl.display = "";
  this.ratioCl.min = 0;
  this.ratioCl.max = 100;
  this.ratioCl.description = "ratio of CaCl2 to other salts";
  this.ratioCl.defaultValue = 2;
  this.ratioCl.updateFunction = salts.compute_salts;
  this.ratioCl.parent = "salts";

  this.ratioSO.id = "salts.ratioSO";
  this.ratioSO.inputType = "int";
  this.ratioSO.value = 0;
  this.ratioSO.userSet = 0;
  this.ratioSO.display = "";
  this.ratioSO.min = 0;
  this.ratioSO.max = 100;
  this.ratioSO.description = "ratio of CaSO4 to other salts";
  this.ratioSO.defaultValue = 1;
  this.ratioSO.updateFunction = salts.compute_salts;
  this.ratioSO.parent = "salts";

  this.currentCa.id = "salts.currentCa";
  this.currentCa.inputType = "int";
  this.currentCa.value = 0;
  this.currentCa.userSet = 0;
  this.currentCa.display = "";
  this.currentCa.min = 0;
  this.currentCa.max = 10000;
  this.currentCa.description = "current concentration of calcium";
  this.currentCa.defaultValue = 0;
  this.currentCa.updateFunction = salts.compute_salts;
  this.currentCa.parent = "salts";

  this.targetCa.id = "salts.targetCa";
  this.targetCa.inputType = "int";
  this.targetCa.value = 0;
  this.targetCa.userSet = 0;
  this.targetCa.display = "";
  this.targetCa.min = 0;
  this.targetCa.max = 10000;
  this.targetCa.description = "target concentration of calcium";
  this.targetCa.defaultValue = 100;
  this.targetCa.updateFunction = salts.compute_salts;
  this.targetCa.parent = "salts";

  this.currentSO4.id = "salts.currentSO4";
  this.currentSO4.inputType = "int";
  this.currentSO4.value = 0;
  this.currentSO4.userSet = 0;
  this.currentSO4.display = "";
  this.currentSO4.min = 0;
  this.currentSO4.max = 10000;
  this.currentSO4.description = "current concentration of sulfate";
  this.currentSO4.defaultValue = 0;
  this.currentSO4.updateFunction = salts.compute_salts;
  this.currentSO4.parent = "salts";

  this.maxSO4.id = "salts.maxSO4";
  this.maxSO4.inputType = "int";
  this.maxSO4.value = 0;
  this.maxSO4.userSet = 0;
  this.maxSO4.display = "";
  this.maxSO4.min = 0;
  this.maxSO4.max = 10000;
  this.maxSO4.description = "maximum concentration of sulfate";
  this.maxSO4.defaultValue = 250;
  this.maxSO4.updateFunction = salts.compute_salts;
  this.maxSO4.parent = "salts";

  this.currentCl.id = "salts.currentCl";
  this.currentCl.inputType = "int";
  this.currentCl.value = 0;
  this.currentCl.userSet = 0;
  this.currentCl.display = "";
  this.currentCl.min = 0;
  this.currentCl.max = 10000;
  this.currentCl.description = "current concentration of chloride";
  this.currentCl.defaultValue = 0;
  this.currentCl.updateFunction = salts.compute_salts;
  this.currentCl.parent = "salts";

  this.maxCl.id = "salts.maxCl";
  this.maxCl.inputType = "int";
  this.maxCl.value = 0;
  this.maxCl.userSet = 0;
  this.maxCl.display = "";
  this.maxCl.min = 0;
  this.maxCl.max = 10000;
  this.maxCl.description = "maximum concentration of chloride";
  this.maxCl.defaultValue = 175;
  this.maxCl.updateFunction = salts.compute_salts;
  this.maxCl.parent = "salts";

  common.set(salts.outputs, 0);
  common.set(salts.CaCl2form, 0);
  common.set(salts.ratioCl, 0);
  common.set(salts.ratioSO, 0);
  common.set(salts.currentCa, 0);
  common.set(salts.targetCa, 0);
  common.set(salts.currentSO4, 0);
  common.set(salts.maxSO4, 0);
  common.set(salts.currentCl, 0);
  common.set(salts.maxCl, 0);
  common.set(salts.units, 0);

  this.verbose = 1;
  this.compute_salts();

  return;
}

//==============================================================================

//------------------------------------------------------------------------------
// set units to metric or U.S. Customary

function setUnits() {

  if (salts.units.value == "metric") {
    // update displayed units
    if (document.getElementById('waterVolumeUnits')) {
      document.getElementById('waterVolumeUnits').innerHTML = "L";
    }

    // update variables
    common.set(salts.waterVolume, 0);
  } else {
    // update displayed units
    if (document.getElementById('waterVolumeUnits')) {
      document.getElementById('waterVolumeUnits').innerHTML = "G";
    }

    // update variables
    common.set(salts.waterVolume, 0);
  }

  return true;
}

//==============================================================================

//------------------------------------------------------------------------------
// compute cooling temperature, and plot cooling as a function of time.
// compute evaporation rate, and plot this rate as a function of temperature.

this.compute_salts = function() {
  // simple variables:
  var adjust = 0.0;
  var alertStr = "";
  var CaCl2form = salts.CaCl2form.value;
  var idx = 0;
  var outputUnitsStr = salts.outputs.value;
  var pro_Ca_CaSO4_2H2O = 0.0;  // proportion of Ca in CaSO4_2H2O per liter
  var pro_SO4_CaSO4_2H2O = 0.0; // proportion of SO4 in CaSO4_2H2O per liter
  var pro_Ca_CaCl = 0.0;        // proportion of Ca in CaCl per liter
  var pro_Cl_CaCl = 0.0;        // proportion of Cl in CaCl per liter
  var ratioCl = salts.ratioCl.value;
  var ratioSO = salts.ratioSO.value;
  var targetRatio = 0.0;
  var targetCa = salts.targetCa.value;
  var total_Cl = 0.0;
  var total_SO4 = 0.0;
  var waterVolume = salts.waterVolume.value;

  // objects:
  var amount = {};      // amount of each salt (output), in grams or tsp
  var baseline = {};    // amount of each ion (in ppm) before adding salts
  var fontColor = {};   // font color for each ion
  var max = {};         // maximum concentration of SO4 and Cl, in ppm
  var outputClass = {}; // all HTML elements with class 'outputUnits'
  var ppm_perSalt = {}; // ppm of the specified ion in the specified salt
  var totalPPM = {};    // ppm of the specified ion in all salts
  var weight = {};      // weight of each salt, in grams

  // gpt = grams per teaspooon
  var CaCl2_gpt      = 4.462;     // grams per tsp
  var CaCl2_2H2O_gpt = 5.035;     // grams per tsp
  var CaSO4_2H2O_gpt = 3.266;     // grams per tsp

  // mw = molecular weight, grams per mole
  var Ca_mw          = 40.078;    // molecular weight of Ca
  var Cl_mw          = 35.453;    // molecular weight of Cl
  var H_mw           =  1.00794;  // molecular weight of H
  var O_mw           = 15.9994;   // molecular weight of O
  var C_mw           = 12.0107;   // molecular weight of C
  var S_mw           = 32.065;    // molecular weight of S
  var H2O_mw         = (2.0 * H_mw + O_mw);

  if (salts.verbose > 0) {
    console.log("==================================");
  }

  // initialize variables
  ppm_perSalt.CaCl2 = {};
  ppm_perSalt.CaSO4_2H2O = {};

  max.SO4 = salts.maxSO4.value;
  max.Cl = salts.maxCl.value;
  baseline.Ca = salts.currentCa.value;
  baseline.SO4 = salts.currentSO4.value;
  baseline.Cl = salts.currentCl.value;

  fontColor.Ca = "black";
  fontColor.SO4 = "black";
  fontColor.Cl = "black";


  // compute molecular weights of each salt and the proportion of each ion
  // in that salt
  var CaCl2_mw  = Ca_mw + (2.0 * Cl_mw);
  var Cl_in_CaCl2 = (2.0 * Cl_mw) / CaCl2_mw;
  var Ca_in_CaCl2 = Ca_mw / CaCl2_mw;

  var CaCl2_2H2O_mw  = Ca_mw + (2.0 * Cl_mw) + (2.0 * H2O_mw);
  var Cl_in_CaCl2_2H2O = (2.0 * Cl_mw) / CaCl2_2H2O_mw;
  var Ca_in_CaCl2_2H2O = Ca_mw / CaCl2_2H2O_mw;

  var CaSO4_2H2O_mw = Ca_mw + S_mw + (4.0 * O_mw) + (2.0 * H2O_mw);
  var Ca_in_CaSO4_2H2O = Ca_mw / CaSO4_2H2O_mw;
  var SO4_in_CaSO4_2H2O = (S_mw + (4.0 * O_mw)) / CaSO4_2H2O_mw;


  // If using dihydrate form, then set variables Ca_in_Cl2 and Cl_in_Cl2
  // to be the anhydrous form, just to simplify keeping track of variables.
  if (CaCl2form != "anhydrous") {
    Ca_in_CaCl2 = Ca_in_CaCl2_2H2O;
    Cl_in_CaCl2 = Cl_in_CaCl2_2H2O;
  }

  targetRatio = -1.0;
  if (ratioCl > 0 && ratioSO > 0) {
    targetRatio = ratioSO / ratioCl;
    // pro_Ca_CaSO4_2H2O * weight of CaSO4 = ppm of Ca in CaSO4 (by definition)
    // pro_SO4_CaSO4_2H2O * weight of CaSO4 = ppm of SO4 in CaSO4
    // pro_Ca_CaCl * weight of CaCl = ppm Ca in CaCl
    // pro_Cl_CaCl * weight of CaCl = ppm Cl in CaCl
    pro_Ca_CaSO4_2H2O =  Ca_in_CaSO4_2H2O * 1000.0 / waterVolume;
    pro_SO4_CaSO4_2H2O =  SO4_in_CaSO4_2H2O * 1000.0 / waterVolume;
    pro_Ca_CaCl =  Ca_in_CaCl2 * 1000.0 / waterVolume;
    pro_Cl_CaCl =  Cl_in_CaCl2 * 1000.0 / waterVolume;
    // now solve for two unknowns (weight of CaCl2, weight of CaSO4_2H2O)
    // using two equations (target Ca concentration, sulfate-to-chloride ratio)
    weight.CaCl2 = ((targetRatio * baseline.Cl) - baseline.SO4 -
        ((pro_SO4_CaSO4_2H2O/pro_Ca_CaSO4_2H2O) * (targetCa - baseline.Ca))) /
        ((-1.0 * pro_SO4_CaSO4_2H2O * pro_Ca_CaCl / pro_Ca_CaSO4_2H2O) -
         (targetRatio * pro_Cl_CaCl));
    weight.CaSO4_2H2O = (targetCa - baseline.Ca - (weight.CaCl2*pro_Ca_CaCl)) /
         pro_Ca_CaSO4_2H2O;
    // If solution yields negative weight, warn the user and change the
    // negative weight to zero.  This seems to provide a compromise
    // between reaching the target Ca ppm and reaching the target ratio;
    // neither one is correct, but each one is off less than it would
    // be if the other target were reached.
    if (weight.CaCl2 < 0.0 || weight.CaSO4_2H2O < 0.0) {
      alertStr = "I can't meet requirements of both sulfate-to-chloride " +
                 "ratio and target calcium concentration.  Please change " +
                 "one of these.  In the meantime, I'm setting the weight of ";
      if (weight.CaCl2 < 0.0 && weight.CaSO4_2H2O < 0.0) {
        alertStr += "both ";
        weight.CaSO4_2H2O = 0.0;
        weight.CaCl2 = 0.0;
      } else if (weight.CaCl2 < 0.0) {
        alertStr += "calcium chloride ";
        weight.CaCl2 = 0.0;
        // weight.CaSO4_2H2O = targetCa / pro_Ca_CaSO4_2H2O;
      } else {
        alertStr += "calcium sulfate ";
        weight.CaSO4_2H2O = 0.0;
        // weight.CaCl2 = targetCa / pro_Ca_CaCl;
      }
      // alertStr += "to zero and meeting the target calcium concentration.";
      alertStr += "to zero as a compromise.";
      window.alert(alertStr);
    }
  } else {
    weight.CaCl2 = 0.0;
    weight.CaSO4_2H2O = 0.0;
    if (ratioSO > 0) {
      pro_Ca_CaSO4_2H2O =  Ca_in_CaSO4_2H2O * 1000.0 / waterVolume;
      weight.CaSO4_2H2O = (targetCa - baseline.Ca) / pro_Ca_CaSO4_2H2O;
      if (weight.CaSO4_2H2O < 0.0) {
        weight.CaSO4_2H2O = 0.0;
      }
    }
    if (ratioCl > 0) {
      pro_Ca_CaCl =  Ca_in_CaCl2 * 1000.0 / waterVolume;
      weight.CaCl2 = (targetCa - baseline.Ca) / pro_Ca_CaCl;
      if (weight.CaCl2 < 0.0) {
        weight.CaCl2 = 0.0;
      }
    }
  }

  // from weight of each salt, compute ppm of each ion
  ppm_perSalt.CaCl2.Ca =
       weight.CaCl2 * Ca_in_CaCl2 * 1000.0 / waterVolume;
  ppm_perSalt.CaCl2.Cl =
       weight.CaCl2 * Cl_in_CaCl2 * 1000.0 / waterVolume;
  ppm_perSalt.CaSO4_2H2O.Ca =
       weight.CaSO4_2H2O * Ca_in_CaSO4_2H2O * 1000.0 / waterVolume;
  ppm_perSalt.CaSO4_2H2O.SO4 =
       weight.CaSO4_2H2O * SO4_in_CaSO4_2H2O * 1000.0 / waterVolume;

  // dump info to console for debugging
  if (salts.verbose > 0) {
    console.log("weights = CaSO4: " + weight.CaSO4_2H2O +
                ", CaCl2: " + weight.CaCl2);
    console.log("ppm per salt = CaSO4: " + ppm_perSalt.CaSO4_2H2O.SO4 +
                ", CaCl2: " + ppm_perSalt.CaCl2.Cl);
    console.log("ppm total = CaSO4: " +
                 Number(baseline.SO4 + ppm_perSalt.CaSO4_2H2O.SO4) +
                 ", CaCl2: " + Number(baseline.Cl + ppm_perSalt.CaCl2.Cl));
  }

  // next, check the Cl limit; if exeed, keep the ratio and adjust Ca as needed
  if (ppm_perSalt.CaCl2.Cl + baseline.Cl > max.Cl &&
      ppm_perSalt.CaCl2.Cl > 0.0) {
    adjust = (max.Cl - baseline.Cl) / ppm_perSalt.CaCl2.Cl;
    if (adjust < 0.0) adjust = 0.0;
    weight.CaCl2 *= adjust;
    ppm_perSalt.CaCl2.Ca = weight.CaCl2 * Ca_in_CaCl2 * 1000.0 / waterVolume;
    ppm_perSalt.CaCl2.Cl = weight.CaCl2 * Cl_in_CaCl2 * 1000.0 / waterVolume;
    if (targetRatio >= 0.0) {
      total_SO4 = ppm_perSalt.CaCl2.Cl * targetRatio;
      ppm_perSalt.CaSO4_2H2O.SO4 = total_SO4 - baseline.SO4;
      if (ppm_perSalt.CaSO4_2H2O.SO4 > 0) {
        weight.CaSO4_2H2O = ppm_perSalt.CaSO4_2H2O.SO4 * waterVolume /
                            (SO4_in_CaSO4_2H2O * 1000.0);
      } else {
        weight.CaSO4_2H2O = 0.0;
        ppm_perSalt.CaSO4_2H2O.SO4 = 0.0;
      }
      ppm_perSalt.CaSO4_2H2O.Ca =
           weight.CaSO4_2H2O * Ca_in_CaSO4_2H2O * 1000.0 / waterVolume;
    }
  }

  // next, check the SO4 limit; if exeed, keep the ratio and adjust Ca as needed
  if (ppm_perSalt.CaSO4_2H2O.SO4 + baseline.SO4 > max.SO4 &&
      ppm_perSalt.CaSO4_2H2O.SO4 > 0.0) {
    adjust = (max.SO4  - baseline.SO4) / ppm_perSalt.CaSO4_2H2O.SO4;
    if (adjust < 0.0) adjust = 0.0;
    weight.CaSO4_2H2O *= adjust;
    ppm_perSalt.CaSO4_2H2O.Ca =
         weight.CaSO4_2H2O * Ca_in_CaSO4_2H2O * 1000.0 / waterVolume;
    ppm_perSalt.CaSO4_2H2O.SO4 =
         weight.CaSO4_2H2O * SO4_in_CaSO4_2H2O * 1000.0 / waterVolume;
    if (targetRatio >= 0.0) {
      total_Cl = ppm_perSalt.CaSO4_2H2O.SO4 / targetRatio;
      ppm_perSalt.CaCl2.Cl = total_Cl - baseline.Cl;
      if (ppm_perSalt.CaCl2.Cl > 0) {
        weight.CaCl2 = ppm_perSalt.CaCl2.Cl * waterVolume /
                            (Cl_in_CaCl2 * 1000.0);
      } else {
        weight.CaCl2 = 0.0;
        ppm_perSalt.CaCl2.Cl = 0.0;
      }
      ppm_perSalt.CaCl2.Ca =
           weight.CaCl2 * Ca_in_CaCl2 * 1000.0 / waterVolume;
    }
  }

  // Get total PPM of each ion to determine which ions are at their limits.
  // If any ion is near its limit or not near target, set color to dark red
  totalPPM.Ca = baseline.Ca + ppm_perSalt.CaSO4_2H2O.Ca + ppm_perSalt.CaCl2.Ca;
  totalPPM.SO4 = baseline.SO4 + ppm_perSalt.CaSO4_2H2O.SO4;
  totalPPM.Cl = baseline.Cl + ppm_perSalt.CaCl2.Cl;
  if (totalPPM.Ca < Number(targetCa - 0.5) ||
      totalPPM.Ca > Number(targetCa + 0.5)) {
    fontColor.Ca = "darkred";
  }
  if (totalPPM.SO4 > Number(max.SO4 - 0.5)) {
    fontColor.SO4 = "darkred";
  }
  if (totalPPM.Cl > Number(max.Cl - 0.5)) {
    fontColor.Cl = "darkred";
  }
  if (targetRatio >= 0.0) {
    if (1.1 * (totalPPM.SO4 / totalPPM.Cl) < targetRatio ||
        0.9 * (totalPPM.SO4 / totalPPM.Cl) > targetRatio) {
      fontColor.SO4 = "darkred";
      fontColor.Cl = "darkred";
    }
  }

  // get the output units and set HTML output to specified type
  outputClass = document.getElementsByClassName('outputUnits');
  for (idx = 0; idx < outputClass.length; idx++) {
    outputClass[idx].innerHTML = outputUnitsStr;
  }

  // The amount of each salt to output is, by default, the weight.
  // If the user wants the amount in teaspons, convert the amount now.
  amount.CaCl2 = weight.CaCl2;
  amount.CaSO4_2H2O = weight.CaSO4_2H2O;
  if (outputUnitsStr == "tsp") {
    if (CaCl2form == "anhydrous") {
      amount.CaCl2 = weight.CaCl2 / CaCl2_gpt;
    } else {
      amount.CaCl2 = weight.CaCl2 / CaCl2_2H2O_gpt;
    }
    amount.CaSO4_2H2O = weight.CaSO4_2H2O / CaSO4_2H2O_gpt;
  }

  // set amounts and ppm in HTML
  document.getElementById('salts.CaCl2_tsp').innerHTML =
      amount.CaCl2.toFixed(2);
  document.getElementById('salts.CaCl2_Ca_ppm').innerHTML =
      ppm_perSalt.CaCl2.Ca.toFixed(1);
  document.getElementById('salts.CaCl2_Cl_ppm').innerHTML =
      ppm_perSalt.CaCl2.Cl.toFixed(1);
  if (CaCl2form == "anhydrous") {
    document.getElementById('salts.CaCl2formEnglish').innerHTML =
        "(Anhydrous)";
    document.getElementById('salts.CaCl2formFormula').innerHTML =
        "CaCl<sub>2</sub>";
  } else {
    document.getElementById('salts.CaCl2formEnglish').innerHTML =
        "(Dihydrate)";
    document.getElementById('salts.CaCl2formFormula').innerHTML =
        "CaCl<sub>2</sub>&middot;2H<sub>2</sub>O";
  }
  document.getElementById('salts.CaCl2_Ca_ppm').style.color = fontColor.Ca;
  document.getElementById('salts.CaCl2_Cl_ppm').style.color = fontColor.Cl;


  document.getElementById('salts.CaSO4_2H2O_tsp').innerHTML =
      amount.CaSO4_2H2O.toFixed(2);
  document.getElementById('salts.CaSO4_2H2O_Ca_ppm').innerHTML =
      ppm_perSalt.CaSO4_2H2O.Ca.toFixed(1);
  document.getElementById('salts.CaSO4_2H2O_SO4_ppm').innerHTML =
      ppm_perSalt.CaSO4_2H2O.SO4.toFixed(1);
  document.getElementById('salts.CaSO4_2H2O_Ca_ppm').style.color = fontColor.Ca;
  document.getElementById('salts.CaSO4_2H2O_SO4_ppm').style.color =
                                                                  fontColor.SO4;

  document.getElementById('salts.totalPPM_Ca').innerHTML =
      totalPPM.Ca.toFixed(1);
  document.getElementById('salts.totalPPM_SO4').innerHTML =
      totalPPM.SO4.toFixed(1);
  document.getElementById('salts.totalPPM_Cl').innerHTML =
      totalPPM.Cl.toFixed(1);
  document.getElementById('salts.totalPPM_Ca').style.color = fontColor.Ca;
  document.getElementById('salts.totalPPM_SO4').style.color = fontColor.SO4;
  document.getElementById('salts.totalPPM_Cl').style.color = fontColor.Cl;

  if (salts.verbose > 0) {
    console.log("==================================");
  }

  return;
}


// close the "namespace" and call the function to construct it.
}
salts._construct();
