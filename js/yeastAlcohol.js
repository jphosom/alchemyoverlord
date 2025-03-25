// -----------------------------------------------------------------------------
// yeastAlcohol.js : JavaScript for AlchemyOverlord web page, yeast/ABV sub-page
// Written by John-Paul Hosom
// Copyright © 2022-2025 by John-Paul Hosom, all rights reserved.
// To license this software, please contact John-Paul Hosom, for example at
//    alchemyoverlord © yahoo · com
// In many cases (at the sole discretion of John-Paul Hosom) a license
// is provided free of charge, but a written license is required for
// legal use of this code.
//
// Version 1.0.0 : September 3, 2022
//         Initial version.
// Version 1.0.1 : February 26, 2023
//         Yeast decay rate is 4% annually (refrigerated), not 4% per month
// Version 1.1.0 : February 28, 2023
//         Add storage temperature, affecting yeast decay rate
//
// -----------------------------------------------------------------------------

//==============================================================================

var yeastAlcohol = yeastAlcohol || {};

// Declare a "namespace" called "yeastAlcohol"
// This namespace contains functions that are specific to yeastAlcohol method.
//
//    public functions:
//    . initialize_yeastAlcohol()
//    . compute_yeastAlcohol()
//

yeastAlcohol._construct = function() {

"use strict";

//------------------------------------------------------------------------------
// initialize

this.initialize_yeastAlcohol = function() {
  var idx = 0;
  var keys;
  var updateFunction = this.compute_yeastAlcohol;

  // color options
  this.defaultColor = "#94476b"; // greyish red

  //----------------------------------------------------------------------------
  // create data for all variables

  this.units = new Object();
  this.units.id = "yeastAlcohol.units";
  this.units.inputType = "radioButton";
  this.units.value = "imperial";
  this.units.userSet = 0;
  this.units.defaultValue = "imperial";
  this.units.additionalFunction = setUnits;
  this.units.additionalFunctionArgs = "";

  this.type = new Object();
  this.type.id = "yeastAlcohol.type";
  this.type.inputType = "radioButton";
  this.type.value = "ale";
  this.type.userSet = 0;
  this.type.defaultValue = "ale";
  this.type.updateFunction = yeastAlcohol.compute_yeastAlcohol;

  this.SG = new Object;
  this.SG.id = "yeastAlcohol.SG";
  this.SG.inputType = "float";
  this.SG.userSet = 0;
  this.SG.precision = 3;
  this.SG.minPrecision = 3;
  this.SG.display = "1.050";
  this.SG.min = 0.9;
  this.SG.max = 2.0;
  this.SG.description = "original gravity";
  this.SG.defaultValue = 1.050;
  this.SG.defaultColor = this.defaultColor;
  this.SG.updateFunction = yeastAlcohol.compute_yeastAlcohol;

  this.volume = new Object;
  this.volume.id = "yeastAlcohol.volume";
  this.volume.inputType = "float";
  this.volume.userSet = 0;
  this.volume.convertToMetric = common.convertGallonsToLiters;
  this.volume.convertToImperial = common.convertLitersToGallons;
  this.volume.precision = 2;
  this.volume.minPrecision = 2;
  this.volume.display = "20.0";
  this.volume.min = 0.01;
  this.volume.max = 2000.0;
  this.volume.description = "wort volume";
  this.volume.defaultValue = 20.0;
  this.volume.defaultColor = this.defaultColor;
  this.volume.updateFunction = yeastAlcohol.compute_yeastAlcohol;

  this.yeastAge = new Object;
  this.yeastAge.id = "yeastAlcohol.yeastAge";
  this.yeastAge.inputType = "float";
  this.yeastAge.userSet = 0;
  this.yeastAge.precision = 2;
  this.yeastAge.minPrecision = 0;
  this.yeastAge.display = "12";
  this.yeastAge.min = 0.0;
  this.yeastAge.max = 60.0;
  this.yeastAge.description = "age of yeast (in months)";
  this.yeastAge.defaultValue = 12.0;
  this.yeastAge.defaultColor = this.defaultColor;
  this.yeastAge.updateFunction = yeastAlcohol.compute_yeastAlcohol;

  this.storageTemp = new Object;
  this.storageTemp.id = "yeastAlcohol.storageTemp";
  this.storageTemp.inputType = "float";
  this.storageTemp.userSet = 0;
  this.storageTemp.convertToMetric = common.convertFahrenheitToCelsius;
  this.storageTemp.convertToImperial = common.convertCelsiusToFahrenheit;
  this.storageTemp.precision = 1;
  this.storageTemp.minPrecision = 0;
  this.storageTemp.display = "2.5";
  this.storageTemp.min = 0.0;
  this.storageTemp.max = 104.0;
  this.storageTemp.description = "storage temperature";
  this.storageTemp.defaultValue = 2.5;
  this.storageTemp.defaultColor = this.defaultColor;
  this.storageTemp.updateFunction = yeastAlcohol.compute_yeastAlcohol;

  this.OG = new Object;
  this.OG.id = "yeastAlcohol.OG";
  this.OG.inputType = "float";
  this.OG.userSet = 0;
  this.OG.precision = 3;
  this.OG.minPrecision = 3;
  this.OG.display = "1.050";
  this.OG.min = 0.9;
  this.OG.max = 2.0;
  this.OG.description = "original gravity";
  this.OG.defaultValue = 1.050;
  this.OG.defaultColor = this.defaultColor;
  this.OG.updateFunction = yeastAlcohol.compute_yeastAlcohol;

  this.FG = new Object;
  this.FG.id = "yeastAlcohol.FG";
  this.FG.inputType = "float";
  this.FG.userSet = 0;
  this.FG.precision = 3;
  this.FG.minPrecision = 3;
  this.FG.display = "1.010";
  this.FG.min = 0.9;
  this.FG.max = 2.0;
  this.FG.description = "final gravity";
  this.FG.defaultValue = 1.010;
  this.FG.defaultColor = this.defaultColor;
  this.FG.updateFunction = yeastAlcohol.compute_yeastAlcohol;

  //----------------------------------------------------------------------------
  // add name of parent to all variables, so we can access 'units' as needed
  keys = Object.keys(this);
  for (idx = 0; idx < keys.length; idx++) {
    if (keys[idx] == "_construct" || keys[idx] == "defaultColor") {
      continue;
    }
    console.log(keys[idx]);
    this[keys[idx]].parent = "yeastAlcohol";
  }

  //----------------------------------------------------------------------------
  // set variables
  common.set(yeastAlcohol.units,      0);
  common.set(yeastAlcohol.type,       0);
  common.set(yeastAlcohol.SG,         0);
  common.set(yeastAlcohol.volume,     0);
  common.set(yeastAlcohol.yeastAge,   0);
  common.set(yeastAlcohol.storageTemp, 0);
  common.set(yeastAlcohol.OG,         0);
  common.set(yeastAlcohol.FG,         0);

  //----------------------------------------------------------------------------
  // set verbosity and compute (initial) results
  this.verbose = 1;
  this.compute_yeastAlcohol();

  return;
}

//------------------------------------------------------------------------------
// set units to metric or US Customary

function setUnits() {

  if (yeastAlcohol.units.value == "metric") {
    // update displayed units
    if (document.getElementById('yeastAlcohol.volumeUnits')) {
      document.getElementById('yeastAlcohol.volumeUnits').innerHTML = "litres";
    }
    if (document.getElementById('yeastAlcohol.tempUnits')) {
      document.getElementById('yeastAlcohol.tempUnits').innerHTML = "C";
    }
    // update variables
    common.set(yeastAlcohol.volume, 0);
    common.set(yeastAlcohol.storageTemp, 0);
  } else {
    // update displayed units
    if (document.getElementById('yeastAlcohol.volumeUnits')) {
      document.getElementById('yeastAlcohol.volumeUnits').innerHTML = "gallons";
     }
    if (document.getElementById('yeastAlcohol.tempUnits')) {
      document.getElementById('yeastAlcohol.tempUnits').innerHTML = "F";
     }
    // update variables
    common.set(yeastAlcohol.volume, 0);
    common.set(yeastAlcohol.storageTemp, 0);
  }

  return true;
}

//==============================================================================

//------------------------------------------------------------------------------
// compute amount of yeast to pitch and/or alcohol content (ABV)

this.compute_yeastAlcohol = function() {
  var ABV = 0.0;
  var ABW = 0.0;
  var AE = 0.0;
  var attritionPerMonth = 0.0; // loss of yeast cells per *month*
  var attritionPerYear = 0.0;  // loss of yeast cells per *year*
  var billionCells = 0.0;
  var cellsPerGram = 20.0; // billion cells per gram
  var FG = yeastAlcohol.FG.value;
  var numCellsRecommended = 0.0;
  var OE = 0.0;
  var OG = yeastAlcohol.OG.value;
  var plato = 0.0;
  // var q = 0.0;
  // var RE = 0.0;
  var SG = yeastAlcohol.SG.value;
  var storageTemp = yeastAlcohol.storageTemp.value;
  var type = yeastAlcohol.type.value;
  var viability = 0.0;
  var viabilityBase = 0.0;
  var viableCellsPerGram = 0.0;
  var volume = yeastAlcohol.volume.value;
  var volumeMl = 0.0;
  var yeastAge = yeastAlcohol.yeastAge.value;
  var yeastWeightGrams = 0.0;

  if (yeastAlcohol.verbose > 0) {
    console.log("==============================================");
    console.log("yeast type = " + type);
    console.log("yeast OG   = " + SG);
    console.log("yeast vol. = " + volume);
    console.log("yeast age  = " + yeastAge);
    console.log("storage temp  = " + storageTemp);
    console.log("alcohol OG = " + OG);
    console.log("alcohol FG = " + FG);
  }

  if (storageTemp <= 40.0) {
    // limit the storage temp to not below freezing.
    if (storageTemp < 0.0) {
      storageTemp = 0.0;
    }
    // convert from SG to degress Plato using formula from DeClerck
    plato = 668.72 * SG - 463.37 - 205.347 * SG * SG;
    volumeMl = volume * 1000.0;
    // Fix and Fix: for ales, 0.75 x 10^6 per ml and degree plato, 2x for lagers
    numCellsRecommended = 750000.0 * plato * volumeMl;
    if (type == "lager") {
      numCellsRecommended *= 2.0;
    }
    billionCells = numCellsRecommended / 1000000000.0;
  
    // Attrition is 4% per year at refrigeration temperatures (e.g. 2.5'C)
    // and 20% per year at 75'F or 23.89'C.  Source:
    // https://koehlerbeer.wordpress.com/2008/06/07/rehydrating-dry-yeast-with-dr-clayton-cone/
    // Assume that if stored at 40'C (104'F) for one year, none of the yeast
    // remain viable.  This can be modeled with an exponential increase
    // in attrition.  The parameters were fit to the data points
    // (2.5, 0.04), (23.89, 0.20), (40.0, 1.0).
    attritionPerYear = 0.0143362 * Math.exp(0.1055835 * storageTemp) + 0.0214;
    attritionPerMonth = attritionPerYear / 12.0;
    viabilityBase = 1.0 - attritionPerMonth;
    viability = Math.pow(viabilityBase, yeastAge);
    viableCellsPerGram = cellsPerGram * viability;
    yeastWeightGrams = billionCells / viableCellsPerGram;
  
    if (yeastAlcohol.verbose > 0) {
      console.log("Attrition per year = " + attritionPerYear.toFixed(2));
      console.log("recommended cells = " + numCellsRecommended.toFixed(2));
      console.log("yeast viability   = " + viability.toFixed(4));
      console.log("viable cells/gram = " + viableCellsPerGram.toFixed(4));
    }
  
    document.getElementById('yeastAlcohol.yeastWeight').innerHTML = 
                            yeastWeightGrams.toFixed(2) + " grams";
    } else {
    document.getElementById('yeastAlcohol.yeastWeight').innerHTML = 
        "no viable yeast when stored at this temperature";
    }

  // compute original extract and apparent extract using formulae from DeClerck
  OE = 668.72 * OG - 463.37 - 205.347 * OG * OG;
  AE = 668.72 * FG - 463.37 - 205.347 * FG * FG;

  // older method, not used here
  // q = 0.22 + 0.001 * OE;
  // RE = ((q * OE) + AE) / (1.0 + q);
  // ABW = (0.459 + 0.00469 * OE) * (OE - RE);

  // use (recommended) formula 3b from Cutaia, Reid, and Speers (2009)
  ABW = (0.372 + 0.00357 * OE) * (OE - AE);

  if (yeastAlcohol.verbose > 0) {
    console.log("OE  = " + OE.toFixed(4) + " degress Plato");
    console.log("AE  = " + AE.toFixed(4) + " degress Plato");
    console.log("ABW = " + ABW.toFixed(2) + "%");
  }

  // convert from ABW to ABV using the density of ethanol at 20'C
  ABV = ABW * FG / 0.78934;

  document.getElementById('yeastAlcohol.ABV').innerHTML = ABV.toFixed(2);

  return;
}

// close the "namespace" and call the function to construct it.
}
yeastAlcohol._construct();
