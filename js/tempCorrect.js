// -----------------------------------------------------------------------------
// tempCorrect.js : JavaScript for AlchemyOverlord web page,
//                  temperature correction sub-page
// Written by John-Paul Hosom
// Copyright © 2021 by John-Paul Hosom, all rights reserved.
//
// Version 1.0.0 : August 21, 2021
//         Initial version.
//
// specific-gravity correction comes from:
//     https://www.homebrewersassociation.org/attachments/0000/2497/Math_in_Mash_SummerZym95.pdf
// pH correction comes from my blog post "Some Observations of Mash and Wort pH"
// Volume conversion comes from a NIST publication by F. E. Jones and
//     G. L. Harris (vol. 97, no. 3, 1992).
// Conversion between SG and °Plato comes from Jean De Clerck's
//     A Textbook of Brewing (1957).
//
// -----------------------------------------------------------------------------

//==============================================================================

var tempCorrect = tempCorrect || {};

// Declare a "namespace" called "tempCorrect"
// This namespace contains functions that are specific to tempCorrect method.
//
//    public functions:
//    . initialize_tempCorrect()
//    . compute_tempCorrect()
//

tempCorrect._construct = function() {

"use strict";

//------------------------------------------------------------------------------
// initialize

this.initialize_tempCorrect = function() {
  var idx = 0;
  var keys;
  var updateFunction = this.compute_tempCorrect;

  //----------------------------------------------------------------------------
  // create data for all variables

  // units
  this.units = new Object();
  this.units.id = "tempCorrect.units";
  this.units.inputType = "radioButton";
  this.units.value = "imperial";
  this.units.userSet = 0;
  this.units.defaultValue = "imperial";
  this.units.additionalFunction = setUnits;
  this.units.additionalFunctionArgs = "";

  this.SG1 = new Object;
  this.SG1.id = "tempCorrect.SG1";
  this.SG1.inputType = "float";
  this.SG1.userSet = 0;
  this.SG1.precision = 3;
  this.SG1.minPrecision = 3;
  this.SG1.display = "1.000";
  this.SG1.min = 0.8;
  this.SG1.max = 2.0;
  this.SG1.description = "specific gravity";
  this.SG1.defaultValue = 1.050;
  this.SG1.updateFunction = tempCorrect.compute_tempCorrect;
  this.SG1.updateFunctionArgs = this.SG1.id;

  this.SGtemp1 = new Object;
  this.SGtemp1.id = "tempCorrect.SGtemp1";
  this.SGtemp1.inputType = "float";
  this.SGtemp1.userSet = 0;
  this.SGtemp1.convertToMetric = common.convertFahrenheitToCelsius;
  this.SGtemp1.convertToImperial = common.convertCelsiusToFahrenheit;
  this.SGtemp1.precision = 1;
  this.SGtemp1.minPrecision = 0;
  this.SGtemp1.display = "20.0";
  this.SGtemp1.min = 0;
  this.SGtemp1.max = 250.0;
  this.SGtemp1.description = "measured temperature";
  this.SGtemp1.defaultValue = 20.0;
  this.SGtemp1.updateFunction = tempCorrect.compute_tempCorrect;
  this.SGtemp1.updateFunctionArgs = this.SGtemp1.id;

  this.SGtemp2 = new Object;
  this.SGtemp2.id = "tempCorrect.SGtemp2";
  this.SGtemp2.inputType = "float";
  this.SGtemp2.userSet = 0;
  this.SGtemp2.convertToMetric = common.convertFahrenheitToCelsius;
  this.SGtemp2.convertToImperial = common.convertCelsiusToFahrenheit;
  this.SGtemp2.precision = 1;
  this.SGtemp2.minPrecision = 0;
  this.SGtemp2.display = "15.5";
  this.SGtemp2.min = 0;
  this.SGtemp2.max = 250.0;
  this.SGtemp2.description = "measured temperature";
  this.SGtemp2.defaultValue = 15.5556;
  this.SGtemp2.updateFunction = tempCorrect.compute_tempCorrect;
  this.SGtemp2.updateFunctionArgs = this.SGtemp2.id;

  this.pH1 = new Object;
  this.pH1.id = "tempCorrect.pH1";
  this.pH1.inputType = "float";
  this.pH1.userSet = 0;
  this.pH1.precision = 2;
  this.pH1.minPrecision = 2;
  this.pH1.display = "5.75";
  this.pH1.min = 3.0;
  this.pH1.max = 7.0;
  this.pH1.description = "pH";
  this.pH1.defaultValue = 5.75;
  this.pH1.updateFunction = tempCorrect.compute_tempCorrect;
  this.pH1.updateFunctionArgs = this.pH1.id;

  this.pHtemp1 = new Object;
  this.pHtemp1.id = "tempCorrect.pHtemp1";
  this.pHtemp1.inputType = "float";
  this.pHtemp1.userSet = 0;
  this.pHtemp1.convertToMetric = common.convertFahrenheitToCelsius;
  this.pHtemp1.convertToImperial = common.convertCelsiusToFahrenheit;
  this.pHtemp1.precision = 1;
  this.pHtemp1.minPrecision = 0;
  this.pHtemp1.display = "20.0";
  this.pHtemp1.min = 0;
  this.pHtemp1.max = 250.0;
  this.pHtemp1.description = "measured temperature";
  this.pHtemp1.defaultValue = 20.0;
  this.pHtemp1.updateFunction = tempCorrect.compute_tempCorrect;
  this.pHtemp1.updateFunctionArgs = this.pHtemp1.id;

  this.pHtemp2 = new Object;
  this.pHtemp2.id = "tempCorrect.pHtemp2";
  this.pHtemp2.inputType = "float";
  this.pHtemp2.userSet = 0;
  this.pHtemp2.convertToMetric = common.convertFahrenheitToCelsius;
  this.pHtemp2.convertToImperial = common.convertCelsiusToFahrenheit;
  this.pHtemp2.precision = 1;
  this.pHtemp2.minPrecision = 0;
  this.pHtemp2.display = "21.1";
  this.pHtemp2.min = 0;
  this.pHtemp2.max = 250.0;
  this.pHtemp2.description = "measured temperature";
  this.pHtemp2.defaultValue = 21.11111;
  this.pHtemp2.updateFunction = tempCorrect.compute_tempCorrect;
  this.pHtemp2.updateFunctionArgs = this.pHtemp2.id;

  this.vol1 = new Object;
  this.vol1.id = "tempCorrect.vol1";
  this.vol1.inputType = "float";
  this.vol1.userSet = 0;
  this.vol1.convertToMetric = common.convertGallonsToLiters;
  this.vol1.convertToImperial = common.convertLitersToGallons;
  this.vol1.precision = 2;
  this.vol1.minPrecision = 2;
  this.vol1.display = "20.0";
  this.vol1.min = 0.0;
  this.vol1.max = 10000.0;
  this.vol1.description = "volume";
  this.vol1.defaultValue = 20.0;
  this.vol1.updateFunction = tempCorrect.compute_tempCorrect;
  this.vol1.updateFunctionArgs = this.vol1.id;

  this.voltemp1 = new Object;
  this.voltemp1.id = "tempCorrect.voltemp1";
  this.voltemp1.inputType = "float";
  this.voltemp1.userSet = 0;
  this.voltemp1.convertToMetric = common.convertFahrenheitToCelsius;
  this.voltemp1.convertToImperial = common.convertCelsiusToFahrenheit;
  this.voltemp1.precision = 1;
  this.voltemp1.minPrecision = 0;
  this.voltemp1.display = "100.0";
  this.voltemp1.min = 0;
  this.voltemp1.max = 250.0;
  this.voltemp1.description = "measured temperature";
  this.voltemp1.defaultValue = 100.0;
  this.voltemp1.updateFunction = tempCorrect.compute_tempCorrect;
  this.voltemp1.updateFunctionArgs = this.voltemp1.id;

  this.voltemp2 = new Object;
  this.voltemp2.id = "tempCorrect.voltemp2";
  this.voltemp2.inputType = "float";
  this.voltemp2.userSet = 0;
  this.voltemp2.convertToMetric = common.convertFahrenheitToCelsius;
  this.voltemp2.convertToImperial = common.convertCelsiusToFahrenheit;
  this.voltemp2.precision = 1;
  this.voltemp2.minPrecision = 0;
  this.voltemp2.display = "21.1";
  this.voltemp2.min = 0;
  this.voltemp2.max = 250.0;
  this.voltemp2.description = "measured temperature";
  this.voltemp2.defaultValue = 21.11111;
  this.voltemp2.updateFunction = tempCorrect.compute_tempCorrect;
  this.voltemp2.updateFunctionArgs = this.voltemp2.id;

  this.SG = new Object;
  this.SG.id = "tempCorrect.SG";
  this.SG.inputType = "float";
  this.SG.userSet = 0;
  this.SG.precision = 3;
  this.SG.minPrecision = 3;
  this.SG.display = "1.050";
  this.SG.min = 0.8;
  this.SG.max = 1.63;
  this.SG.description = "specific gravity";
  this.SG.defaultValue = 1.050;
  this.SG.updateFunction = tempCorrect.compute_tempCorrect;
  this.SG.updateFunctionArgs = this.SG.id;

  this.Plato = new Object;
  this.Plato.id = "tempCorrect.Plato";
  this.Plato.inputType = "float";
  this.Plato.userSet = 0;
  this.Plato.precision = 2;
  this.Plato.minPrecision = 1;
  this.Plato.display = "12.39";
  this.Plato.min = -60.0;
  this.Plato.max = 81.0;
  this.Plato.description = "degrees Plato";
  this.Plato.defaultValue = 12.39093;
  this.Plato.updateFunction = tempCorrect.compute_tempCorrect;
  this.Plato.updateFunctionArgs = this.Plato.id;

  //----------------------------------------------------------------------------
  // add name of parent to all variables, so we can access 'units' as needed
  keys = Object.keys(this);
  for (idx = 0; idx < keys.length; idx++) {
    if (keys[idx] == "_construct") {
      continue;
    }
    this[keys[idx]].parent = "tempCorrect";
  }

  this.vol2 = 0.0;

  common.set(tempCorrect.units,  0);

  common.set(tempCorrect.SG1,  0);
  common.set(tempCorrect.SGtemp1,  0);
  common.set(tempCorrect.SGtemp2,  0);

  common.set(tempCorrect.pH1,  0);
  common.set(tempCorrect.pHtemp1,  0);
  common.set(tempCorrect.pHtemp2,  0);

  common.set(tempCorrect.vol1,  0);
  common.set(tempCorrect.voltemp1,  0);
  common.set(tempCorrect.voltemp2,  0);

  common.set(tempCorrect.SG,  0);
  common.set(tempCorrect.Plato,  0);

  this.verbose = 1;
  this.compute_tempCorrect();

  return;
}


//==============================================================================

//------------------------------------------------------------------------------
// set units to metric or British Imperial

function setUnits() {
  var vol2G = 0.0;

  if (tempCorrect.units.value == "metric") {
    // update displayed units
    if (document.getElementById('tempCorrectSGtemp1Units')) {
      document.getElementById('tempCorrectSGtemp1Units').innerHTML = "&deg;C";
    }
    if (document.getElementById('tempCorrectSGtemp2Units')) {
      document.getElementById('tempCorrectSGtemp2Units').innerHTML = "&deg;C";
    }

    if (document.getElementById('tempCorrectpHtemp1Units')) {
      document.getElementById('tempCorrectpHtemp1Units').innerHTML = "&deg;C";
    }
    if (document.getElementById('tempCorrectpHtemp2Units')) {
      document.getElementById('tempCorrectpHtemp2Units').innerHTML = "&deg;C";
    }

    if (document.getElementById('tempCorrectvol1Units')) {
      document.getElementById('tempCorrectvol1Units').innerHTML = "L";
    }
    if (document.getElementById('tempCorrectvoltemp1Units')) {
      document.getElementById('tempCorrectvoltemp1Units').innerHTML = "&deg;C";
    }
    if (document.getElementById('tempCorrectvoltemp2Units')) {
      document.getElementById('tempCorrectvoltemp2Units').innerHTML = "&deg;C";
    }
    if (document.getElementById('tempCorrectvol2Units')) {
      document.getElementById('tempCorrectvol2Units').innerHTML = "L";
    }
    if (document.getElementById("tempCorrect.vol2")) {
      document.getElementById("tempCorrect.vol2").innerHTML =
               tempCorrect.vol2.toFixed(tempCorrect.vol1.precision);
    }

    // update variables
    common.set(tempCorrect.SGtemp1, 0);
    common.set(tempCorrect.SGtemp2, 0);

    common.set(tempCorrect.pHtemp1, 0);
    common.set(tempCorrect.pHtemp2, 0);

    common.set(tempCorrect.vol1, 0);
    common.set(tempCorrect.voltemp1, 0);
    common.set(tempCorrect.voltemp2, 0);
  } else {
    // update displayed units
    if (document.getElementById('tempCorrectSGtemp1Units')) {
      document.getElementById('tempCorrectSGtemp1Units').innerHTML = "&deg;F";
     }
    if (document.getElementById('tempCorrectSGtemp2Units')) {
      document.getElementById('tempCorrectSGtemp2Units').innerHTML = "&deg;F";
     }

    if (document.getElementById('tempCorrectpHtemp1Units')) {
      document.getElementById('tempCorrectpHtemp1Units').innerHTML = "&deg;F";
     }
    if (document.getElementById('tempCorrectpHtemp2Units')) {
      document.getElementById('tempCorrectpHtemp2Units').innerHTML = "&deg;F";
     }

    if (document.getElementById('tempCorrectvol1Units')) {
      document.getElementById('tempCorrectvol1Units').innerHTML = "G";
     }
    if (document.getElementById('tempCorrectvoltemp1Units')) {
      document.getElementById('tempCorrectvoltemp1Units').innerHTML = "&deg;F";
     }
    if (document.getElementById('tempCorrectvoltemp2Units')) {
      document.getElementById('tempCorrectvoltemp2Units').innerHTML = "&deg;F";
     }
    if (document.getElementById('tempCorrectvol2Units')) {
      document.getElementById('tempCorrectvol2Units').innerHTML = "G";
     }

    if (document.getElementById("tempCorrect.vol2")) {
      vol2G = common.convertLitersToGallons(tempCorrect.vol2);
      document.getElementById("tempCorrect.vol2").innerHTML =
               vol2G.toFixed(tempCorrect.vol1.precision);
    }

    // update variables
    common.set(tempCorrect.SGtemp1, 0);
    common.set(tempCorrect.SGtemp2, 0);

    common.set(tempCorrect.pHtemp1, 0);
    common.set(tempCorrect.pHtemp2, 0);

    common.set(tempCorrect.vol1, 0);
    common.set(tempCorrect.voltemp1, 0);
    common.set(tempCorrect.voltemp2, 0);
  }

  return true;
}

//------------------------------------------------------------------------------
// compute multiplication factor for volume of water at temperature T ('C)

function waterVolumeFactorAtTemp (T) {
  var rho = 0.0;
  var volFactor = 0.0;

  // formula from Jones and Harris, NIST vol 97 number 3, May-Jun 1992
  var x1 = 999.83952;
  var x2 = 16.945176 * T;
  var x3 = -7.9870401e-3 * T * T;
  var x4 = -46.170461e-6 * T * T * T;
  var x5 = 105.56302e-9 * T * T * T * T;
  var x6 = -280.54253e-12 * T * T * T * T * T;
  var x7 = (1.0 + 16.897850e-3 * T);

  rho = (x1 + x2 + x3 + x4 + x5 + x6 ) / x7;

  // density (in kg/m3) * 1e-6 kg/ml * 1e3 ml/L = kg/L
  rho = rho / 1000.0;

  // volumeFactor is 1/density
  volFactor = 1.0 / rho;

	return volFactor;
}

//------------------------------------------------------------------------------
// compute correction(s) based on temperature

this.compute_tempCorrect = function(changeID) {
  var factor1 = 0.0;
  var factor2 = 0.0;
  var intercept = 0.0;
  var pH1 = 0.0;
  var pH2 = 0.0;
  var plato = 0.0;
  var ratio = 0.0;
  var SG = 0.0;
  var SG2 = 0.0;
  var slope = 0.0;
  var T1 = 0.0;
  var T2 = 0.0;
  var T1F = 0.0;
  var T2F = 0.0;
  var vol1 = 0.0;
  var vol2 = 0.0;
  var volFactor1 = 0.0;
  var volFactor2 = 0.0;


  if (tempCorrect.verbose > 0) {
    console.log("============== " + changeID + " ====================");
  }

  if (!changeID ||
      changeID == "tempCorrect.SG1" ||
      changeID == "tempCorrect.SGtemp1" ||
      changeID == "tempCorrect.SGtemp2") {
    console.log("calculating SG2");
    // convert stored temperatures from 'C to 'F
    T1F = common.convertCelsiusToFahrenheit(tempCorrect.SGtemp1.value);
    T2F = common.convertCelsiusToFahrenheit(tempCorrect.SGtemp2.value);
    console.log("T1F = " + T1F + ", T2F = " + T2F);
    factor1 = 1.00130346 - (0.000134722124 * T1F) +
                           (0.00000204052596 * T1F * T1F) -
                           (0.00000000232820948 * T1F * T1F * T1F);
    factor2 = 1.00130346 - (0.000134722124 * T2F) +
                           (0.00000204052596 * T2F * T2F) -
                           (0.00000000232820948 * T2F * T2F * T2F);
    ratio = factor1 / factor2;
    SG2 = tempCorrect.SG1.value * ratio;
    if (document.getElementById("tempCorrect.SG2")) {
      document.getElementById("tempCorrect.SG2").innerHTML =
               SG2.toFixed(tempCorrect.SG1.precision);
    }
  }

  if (!changeID ||
      changeID == "tempCorrect.pH1" ||
      changeID == "tempCorrect.pHtemp1" ||
      changeID == "tempCorrect.pHtemp2") {
    console.log("calculating pH2");
    slope =     -0.003815818;
    intercept =  0.016567183;
    pH1 = tempCorrect.pH1.value;
    T1 = tempCorrect.pHtemp1.value;
    T2 = tempCorrect.pHtemp2.value;
    pH2 = (pH1 + (intercept * (T2 - T1))) / ((slope * (T1 - T2)) + 1.0);
    if (document.getElementById("tempCorrect.pH2")) {
      document.getElementById("tempCorrect.pH2").innerHTML =
               pH2.toFixed(tempCorrect.pH1.precision);
    }
  }

  if (!changeID ||
      changeID == "tempCorrect.vol1" ||
      changeID == "tempCorrect.voltemp1" ||
      changeID == "tempCorrect.voltemp2") {
    console.log("calculating vol2");
    vol1 = tempCorrect.vol1.value;
    T1 = tempCorrect.voltemp1.value;
    T2 = tempCorrect.voltemp2.value;
    volFactor1 = waterVolumeFactorAtTemp(T1);
    volFactor2 = waterVolumeFactorAtTemp(T2);
    ratio = volFactor2 / volFactor1;
    vol2 = vol1 * ratio;
    tempCorrect.vol2 = vol2;
    if (tempCorrect.units.value != "metric") {
      vol2 = common.convertLitersToGallons(vol2);
    }
    if (document.getElementById("tempCorrect.vol2")) {
      document.getElementById("tempCorrect.vol2").innerHTML =
               vol2.toFixed(tempCorrect.vol1.precision);
    }
  }

  if (!changeID || changeID == "tempCorrect.SG" ||
      changeID == "tempCorrect.Plato") {
    console.log("calculating SG/Plato");
    if (!changeID || changeID == "tempCorrect.SG") {
      SG = tempCorrect.SG.value;
      plato = common.convertSGToPlato(SG);
      tempCorrect.Plato.defaultValue = plato;
      tempCorrect.Plato.precision = tempCorrect.SG.precision - 1;
      tempCorrect.Plato.userSet = 0;
      common.unsetSavedValue(tempCorrect.Plato,  0);
      common.set(tempCorrect.Plato,  0);
    }
    if (changeID == "tempCorrect.Plato") {
      plato = tempCorrect.Plato.value;
      SG = common.convertPlatoToSG(plato)
      tempCorrect.SG.defaultValue = SG;
      tempCorrect.SG.precision = tempCorrect.Plato.precision + 1;
      tempCorrect.SG.userSet = 0;
      common.unsetSavedValue(tempCorrect.SG,  0);
      common.set(tempCorrect.SG,  0);
    }
  }
  return;
}

// close the "namespace" and call the function to construct it.
}
tempCorrect._construct();
