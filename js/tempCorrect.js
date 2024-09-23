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

  this.defaultColor = "#94476b"; // greyish red

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

  this.debug1 = new Object;
  this.debug1.id = "tempCorrect.debug1";
  this.debug1.inputType = "float";
  this.debug1.userSet = 0;
  this.debug1.precision = 3;
  this.debug1.minPrecision = 1;
  this.debug1.display = "0.0";
  this.debug1.min = 0.0;
  this.debug1.max = 80.0;
  this.debug1.description = "debug value 1";
  this.debug1.defaultValue = 0.0;
  this.debug1.updateFunction = tempCorrect.compute_tempCorrect;
  this.debug1.updateFunctionArgs = this.debug1.id;

  this.debugT = new Object;
  this.debugT.id = "tempCorrect.debugT";
  this.debugT.inputType = "float";
  this.debugT.userSet = 0;
  this.debugT.convertToMetric = common.convertFahrenheitToCelsius;
  this.debugT.convertToImperial = common.convertCelsiusToFahrenheit;
  this.debugT.precision = 1;
  this.debugT.minPrecision = 0;
  this.debugT.display = "0.0";
  this.debugT.min = 10.0;
  this.debugT.max = 81.0;
  this.debugT.description = "debug temperature";
  this.debugT.defaultValue = 21.1111;
  this.debugT.updateFunction = tempCorrect.compute_tempCorrect;
  this.debugT.updateFunctionArgs = this.debugT.id;

  this.debug2 = new Object;
  this.debug2.id = "tempCorrect.debug2";
  this.debug2.inputType = "float";
  this.debug2.userSet = 0;
  this.debug2.precision = 2;
  this.debug2.minPrecision = 1;
  this.debug2.display = "0.0";
  this.debug2.min = 0.0;
  this.debug2.max = 100.0;
  this.debug2.description = "debug value 2";
  this.debug2.defaultValue = 0.0;
  this.debug2.updateFunction = tempCorrect.compute_tempCorrect;
  this.debug2.updateFunctionArgs = this.debug2.id;

  this.acorrR = new Object;
  this.acorrR.id = "tempCorrect.acorrR";
  this.acorrR.inputType = "float";
  this.acorrR.userSet = 0;
  this.acorrR.convertToMetric = common.convertFahrenheitToCelsius;
  this.acorrR.convertToImperial = common.convertCelsiusToFahrenheit;
  this.acorrR.precision = 1;
  this.acorrR.minPrecision = 1;
  this.acorrR.display = "0.0";
  this.acorrR.min = 0.0;
  this.acorrR.max = 100.0;
  this.acorrR.description = "acorr reference temp";
  this.acorrR.defaultValue = 15.55555;
  this.acorrR.updateFunction = tempCorrect.compute_tempCorrect;
  this.acorrR.updateFunctionArgs = this.acorrR.id;

  this.acorr1 = new Object;
  this.acorr1.id = "tempCorrect.acorr1";
  this.acorr1.inputType = "float";
  this.acorr1.userSet = 0;
  this.acorr1.precision = 2;
  this.acorr1.minPrecision = 1;
  this.acorr1.display = "0.0";
  this.acorr1.min = 0.0;
  this.acorr1.max = 100.0;
  this.acorr1.description = "acorr value 1";
  this.acorr1.defaultValue = 0.0;
  this.acorr1.updateFunction = tempCorrect.compute_tempCorrect;
  this.acorr1.updateFunctionArgs = this.acorr1.id;

  this.acorrT = new Object;
  this.acorrT.id = "tempCorrect.acorrT";
  this.acorrT.inputType = "float";
  this.acorrT.userSet = 0;
  this.acorrT.convertToMetric = common.convertFahrenheitToCelsius;
  this.acorrT.convertToImperial = common.convertCelsiusToFahrenheit;
  this.acorrT.precision = 1;
  this.acorrT.minPrecision = 0;
  this.acorrT.display = "0.0";
  this.acorrT.min = 0.0;
  this.acorrT.max = 104.0;
  this.acorrT.description = "acorr temperature";
  this.acorrT.defaultValue = 21.1111;
  this.acorrT.updateFunction = tempCorrect.compute_tempCorrect;
  this.acorrT.updateFunctionArgs = this.acorrT.id;

  this.acorr2 = new Object;
  this.acorr2.id = "tempCorrect.acorr2";
  this.acorr2.inputType = "float";
  this.acorr2.userSet = 0;
  this.acorr2.precision = 2;
  this.acorr2.minPrecision = 1;
  this.acorr2.display = "0.0";
  this.acorr2.min = 0.0;
  this.acorr2.max = 100.0;
  this.acorr2.description = "acorr value 2";
  this.acorr2.defaultValue = 0.0;
  this.acorr2.updateFunction = tempCorrect.compute_tempCorrect;
  this.acorr2.updateFunctionArgs = this.acorr2.id;

  this.WPA = common.createFloat("tempCorrect.WPA", 8.0, "W (%)",
                                0.0, 100.0, 1, 1, "", "",
                                "", "", this.defaultColor, "", "",
                                "", tempCorrect.compute_tempCorrect, "");
  this.WPA.updateFunctionArgs = this.WPA.id;

  this.BPT = common.createFloat("tempCorrect.BPT", 94.0, "B temperature",
                                0.0, 212.0, 1, 1,
                                common.convertFahrenheitToCelsius,
                                common.convertCelsiusToFahrenheit,
                                "", "", this.defaultColor, "", "",
                                "", tempCorrect.compute_tempCorrect, "");
  this.BPT.updateFunctionArgs = this.BPT.id;

  this.deltaT = common.createFloat("tempCorrect.deltaT", 0.0, "delta temp.",
                                0.0, 212.0, 1, 1,
                                common.convertFahrenheitToCelsiusSlope,
                                common.convertCelsiusToFahrenheitSlope,
                                "", "", this.defaultColor, "", "",
                                "", tempCorrect.compute_tempCorrect, "");
  this.deltaT.updateFunctionArgs = this.deltaT.id;

  this.HT = common.createFloat("tempCorrect.HT", 94.0, "H temp.",
                                0.0, 212.0, 1, 1,
                                common.convertFahrenheitToCelsius,
                                common.convertCelsiusToFahrenheit,
                                "", "", this.defaultColor, "", "",
                                "", tempCorrect.compute_tempCorrect, "");
  this.HT.updateFunctionArgs = this.HT.id;

  this.VPA = common.createFloat("tempCorrect.VPA", 49.0, "A (%)",
                                0.0, 100.0, 1, 1, "", "",
                                "", "", this.defaultColor, "", "",
                                "", tempCorrect.compute_tempCorrect, "");
  this.VPA.updateFunctionArgs = this.VPA.id;

  //----------------------------------------------------------------------------
  // add name of parent to all variables, so we can access 'units' as needed
  keys = Object.keys(this);
  for (idx = 0; idx < keys.length; idx++) {
    if (keys[idx] == "_construct" || keys[idx] == "defaultColor") {
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

  common.set(tempCorrect.debug1,  0);
  common.set(tempCorrect.debugT,  0);
  common.set(tempCorrect.debug2,  0);

  common.set(tempCorrect.acorrR,  0);
  common.set(tempCorrect.acorr1,  0);
  common.set(tempCorrect.acorrT,  0);
  common.set(tempCorrect.acorr2,  0);

  common.set(tempCorrect.WPA,  0);
  common.set(tempCorrect.BPT,  0);
  common.set(tempCorrect.deltaT,  0);
  common.set(tempCorrect.HT,  0);
  common.set(tempCorrect.VPA,  0);

  this.verbose = 1;
  this.compute_tempCorrect();

  return;
}


//==============================================================================

//------------------------------------------------------------------------------
// set units to metric or British Imperial

function setUnits() {
  var vol2G = 0.0;
  var uIdx = 0;

  if (tempCorrect.units.value == "metric") {
    // update displayed units
    if (document.getElementsByClassName("tempCorrectTUnits")) {
      var uList = document.getElementsByClassName("tempCorrectTUnits");
      for (uIdx = 0; uIdx < uList.length; uIdx++) {
        uList[uIdx].innerHTML = "&deg;C";
      }
    }
    if (document.getElementById('tempCorrectvol1Units')) {
      document.getElementById('tempCorrectvol1Units').innerHTML = "L";
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

    common.set(tempCorrect.debugT, 0);
    common.set(tempCorrect.acorrR, 0);
    common.set(tempCorrect.acorrT, 0);

    common.set(tempCorrect.BPT, 0);
    common.set(tempCorrect.deltaT, 0);
    common.set(tempCorrect.HT, 0);
  } else {
    // update displayed units
    if (document.getElementsByClassName("tempCorrectTUnits")) {
      var uList = document.getElementsByClassName("tempCorrectTUnits");
      console.log(uList);
      for (uIdx = 0; uIdx < uList.length; uIdx++) {
        uList[uIdx].innerHTML = "&deg;F";
      }
    }
    if (document.getElementById('tempCorrectvol1Units')) {
      document.getElementById('tempCorrectvol1Units').innerHTML = "G";
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

    common.set(tempCorrect.debugT, 0);
    common.set(tempCorrect.acorrR, 0);
    common.set(tempCorrect.acorrT, 0);

    common.set(tempCorrect.BPT, 0);
    common.set(tempCorrect.deltaT, 0);
    common.set(tempCorrect.HT, 0);
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

function computeDensityFromMFE(mfe, T) {
  var density = 0.0;
  var A = new Array(12);
  var B = new Array(6);
  var C = new Array(5);
  var k = 0;
  var i = 0;
  var n = 5;
  var m = new Array(5);

  m[0] = 11;
  m[1] = 10;
  m[2] =  9;
  m[3] =  4;
  m[4] =  2;
  C[0] = new Array(m[0]);
  C[1] = new Array(m[1]);
  C[2] = new Array(m[2]);
  C[3] = new Array(m[3]);
  C[4] = new Array(m[4]);

  A[0] =      9.982012300e2;
  A[1] =     -1.929769495e2;
  A[2] =      3.891238958e2;
  A[3] =     -1.668103923e3;
  A[4] =      1.352215441e4;
  A[5] =     -8.829278388e4;
  A[6] =      3.062874042e5;
  A[7] =     -6.138381234e5;
  A[8] =      7.470172998e5;
  A[9] =     -5.478461354e5;
  A[10] =     2.234460334e5;
  A[11] =    -3.903285426e4;
  B[0] =     -2.0618513e-1;
  B[1] =     -5.2682542e-3;
  B[2] =      3.6130013e-5;
  B[3] =     -3.8957702e-7;
  B[4] =      7.1693540e-9;
  B[5] =     -9.9739231e-11;
  C[0][0] =   1.693443461530087e-1;
  C[0][1] =  -1.046914743455169e1;
  C[0][2] =   7.196353469546523e1;
  C[0][3] =  -7.047478054272792e2;
  C[0][4] =   3.924090430035045e3;
  C[0][5] =  -1.210164659068747e4;
  C[0][6] =   2.248646550400788e4;
  C[0][7] =  -2.605562982188164e4;
  C[0][8] =   1.852373922069467e4;
  C[0][9] =  -7.420201433430137e3;
  C[0][10] =  1.285617841998974e3;
  C[1][0] =  -1.193013005057010e-2;
  C[1][1] =   2.517399633803461e-1;
  C[1][2] =  -2.170575700536933;
  C[1][3] =   1.353034988843029e1;
  C[1][4] =  -5.029988758547014e1;
  C[1][5] =   1.096355666577570e2;
  C[1][6] =  -1.422753946421155e2;
  C[1][7] =   1.080435942856230e2;
  C[1][8] =  -4.414153236817392e1;
  C[1][9] =   7.442971530188783;
  C[2][0] =  -6.802995733503803e-4;
  C[2][1] =   1.876837790289664e-2;
  C[2][2] =  -2.002561813734156e-1;
  C[2][3] =   1.022992966719220;
  C[2][4] =  -2.895696483903638;
  C[2][5] =   4.810060584300675;
  C[2][6] =  -4.672147440794683;
  C[2][7] =   2.458043105903461;
  C[2][8] =  -5.411227621436812e-1;
  C[3][0] =   4.075376675622027e-6;
  C[3][1] =  -8.763058573471110e-6;
  C[3][2] =   6.515031360099368e-6;
  C[3][3] =  -1.515784836987210e-6;
  C[4][0] =  -2.788074354782409e-8;
  C[4][1] =   1.345612883493354e-8;

  density = A[0];
  for (k = 1; k < 12; k++) {
    density += A[k] * Math.pow(mfe, k);
  }
  for (k = 0; k < 6; k++) {
    density += B[k] * Math.pow(T-20.0, k+1);
  }
  for (i = 0; i < n; i++) {
    for (k = 0; k < m[i]; k++) {
      density += C[i][k] * Math.pow(mfe, k+1) * Math.pow(T-20.0, i+1);
    }
  }

  return density;
}

//------------------------------------------------------------------------------
// for any given temperature T, the density is monotonically decreasing
// with mfe, and so we can "zoom in" on correct value with a few loops
// and then interpolate at the finest resolution.  This gives us a value
// almost always correct to within 6 decimal places with less than 30 calls 
// to computeDensityFromMFE.

function computeMFEfromDensity(density, T) {
  var testMFE = 0.0;
  var testDensity = 0.0;
  var min = 0.0;
  var max = 0.0;
  var didBreak = 0;
  var v1 = 0.0;
  var v2 = 0.0;
  var nextMFE = 0.0;
  var mfe = 0.0;

  // (max MFE is 1.1 because density of 750 is less than that of eth)
  min = 0.0;
  max = 1.1;
  for (testMFE = min; testMFE <= max; testMFE += 0.1) {
    testMFE = Number(testMFE.toFixed(2));
    testDensity = computeDensityFromMFE(testMFE, T);
    if (testDensity == density) {
      return testMFE;
    }
    if (testDensity < density) {
      break;
    }
  }
  min = testMFE - 0.1;
  max = testMFE;
  for (testMFE = min; testMFE <= max; testMFE += 0.01) {
    testMFE = Number(testMFE.toFixed(3));
    testDensity = computeDensityFromMFE(testMFE, T);
    if (testDensity == density) {
      return testMFE;
    }
    if (testDensity < density) {
      break;
    }
  }
  min = testMFE - 0.01;
  max = testMFE;
  didBreak = 0;
  for (testMFE = min; testMFE <= max; testMFE += 0.001) {
    testMFE = Number(testMFE.toFixed(4));
    testDensity = computeDensityFromMFE(testMFE, T);
    if (testDensity == density) {
      return testMFE;
    }
    if (testDensity < density) {
      didBreak = 1;
      break;
    }
  }

  v1 = testDensity;
  if (!didBreak) {
    v1 = computeDensityFromMFE(testMFE, T);
  }
  nextMFE = testMFE - 0.001;
  v2 = computeDensityFromMFE(nextMFE, T);
  mfe = mathLibrary.interpolate(v1, testMFE, v2, nextMFE, density);

  return mfe;
}

//------------------------------------------------------------------------------

function computeDensityFromA(A, Tref) {
  var density = 0.0;
  var testA = 0.0;
  var testDensity = 0.0;
  var min = 0.0;
  var max = 0.0;
  var inc = 0.0;
  var didBreak = 0;
  var v1 = 0.0;
  var v2 = 0.0;
  var nextDensity = 0.0;

  min = 750.0;
  max = 1000.0;
  inc = 25.0;
  for (testDensity = min; testDensity <= max; testDensity += inc) {
    testDensity = Number(testDensity.toFixed(2));
    testA = computeAfromDensityAndTemp(testDensity, Tref, Tref);
    if (testA == A) {
      return testDensity;
    }
    if (testA < A) {
      break;
    }
  }
  min = testDensity - 25.0;
  max = testDensity;
  inc = 5.0;
  for (testDensity = min; testDensity <= max; testDensity += inc) {
    testDensity = Number(testDensity.toFixed(2));
    testA = computeAfromDensityAndTemp(testDensity, Tref, Tref);
    if (testA == A) {
      return testDensity;
    }
    if (testA < A) {
      break;
    }
  }
  min = testDensity - 5.0;
  max = testDensity;
  inc = 1.0;
  didBreak = 0;
  for (testDensity = min; testDensity <= max; testDensity += inc) {
    testDensity = Number(testDensity.toFixed(2));
    testA = computeAfromDensityAndTemp(testDensity, Tref, Tref);
    if (testA == A) {
      return testDensity;
    }
    if (testA < A) {
      didBreak = 1;
      break;
    }
  }

  v1 = testA;
  if (!didBreak) {
    v1 = computeAfromDensityAndTemp(testDensity, Tref, Tref);
  }
  nextDensity = testDensity - 1.0;
  v2 = computeAfromDensityAndTemp(nextDensity, Tref, Tref);
  density = mathLibrary.interpolate(v1, testDensity, v2, nextDensity, A);

  return density;
}


//------------------------------------------------------------------------------

function computeAfromDensityAndTemp(density, Tmeas, Tref) {
  var A = 0.0;
  var mfe_meas = 0.0;
  var density_ref = 0.0;
  var density_eth = 0.0;

  mfe_meas = computeMFEfromDensity(density, Tmeas);
  density_ref = computeDensityFromMFE(mfe_meas, Tref);
  density_eth = computeDensityFromMFE(1.0, Tref);
  A = 100.0 * mfe_meas * density_ref / density_eth;

  return A;
}

//------------------------------------------------------------------------------
// compute temperature-corrected value from temp T ('C) and measured value

function compute_aCorrect(T, Tref, meas) {
  var density_app = 0.0;
  var density_true = 0.0;
  var A_true = 0.0;
  var alpha = 25e-6;
  density_app = computeDensityFromA(meas, Tref);
  density_true = density_app / (1 + (alpha * (T - Tref)));
  A_true = computeAfromDensityAndTemp(density_true, T, Tref);
  if (A_true < 0.0) A_true = 0.0;
  if (A_true > 100.0) A_true = 100.0;

  return A_true;
}

//------------------------------------------------------------------------------

this.estimateWPA = function(T) {
  var WPA = 0.0;
  if (T >= 99.822) {
    WPA = 0.0;
  } else if (T <= 78.5) {
    WPA = 100.0;
  } else {
    WPA =    -1.3440373015891053e+006 +
            ( 5.9613962720328593e+004 * T) +
            (-7.5269250987350642e+002 * T*T) +
            (-1.7034076262172420e+000 * T*T*T) +
            ( 7.6598502996708007e-002 * T*T*T*T) +
            ( 1.6126121050643387e-004 * T*T*T*T*T) +
            (-6.3357449695051985e-006 * T*T*T*T*T*T) +
            (-2.1895222834169147e-008 * T*T*T*T*T*T*T) +
            ( 5.9508888197547815e-010 * T*T*T*T*T*T*T*T) +
            (-2.0851105953625970e-012 * T*T*T*T*T*T*T*T*T);
    console.log("T = " + T + "; WPA = " + WPA);
  }
  return WPA;
}

//------------------------------------------------------------------------------

this.estimateBPT = function(A) {
  var BPT = 0.0;
  if (A == 0.0) {
    BPT = 100.0;
  } else if (A >= 95.5) {
    BPT = 78.5;
  } else {
    BPT =   9.9991623339999279e+001 +
          (-9.1888459382966636e-001 * A) +
          ( 2.5751426716553692e-002 * A*A) +
          (-5.1685173246938834e-004 * A*A*A) +
          ( 6.8084321608977826e-006 * A*A*A*A) +
          (-5.1115357518382922e-008 * A*A*A*A*A +
          ( 1.5988411130682282e-010 * A*A*A*A*A*A);
    console.log("A = " + A + "; BPT = " + BPT);
  }
  return BPT;
}

//------------------------------------------------------------------------------

this.estimateVPA = function(T) {
  var VPA = 0.0;
  if (T <= 78.5) {
    VPA = 95.5;
  } else if (T >= 99.994) {
    VPA = 0.0;
  } else {
    VPA =      3.4227185386155214e+005 +
             (-1.9191878972702845e+004 * T) +
             ( 4.3071917046708018e+002 * T*T) +
             (-4.8356396317931285e+000 * T*T*T) +
             ( 2.7163838507345585e-002 * T*T*T*T) +
             (-6.1101995232622114e-005 * T*T*T*T*T);
  }
  return VPA;
}

//------------------------------------------------------------------------------

this.estimateHT = function(A) {
  var HT = 0.0;
  if (A >= 95.5) {
    HT = 78.5;
  } else if (A == 0.0) {
    HT = 100.0;
  } else {
    HT  =      1.0000174639592332e+002 +
             (-8.1920437719821257e-002 * A) +
             ( 2.6314391614088036e-003 * A*A) +
             (-6.8154052733713599e-004 * A*A*A) +
             ( 6.5205737068809791e-005 * A*A*A*A) +
             (-3.4670434454447482e-006 * A*A*A*A*A) +
             ( 1.0902865716502993e-007 * A*A*A*A*A*A) +
             (-2.0298691711545613e-009 * A*A*A*A*A*A*A) +
             ( 2.0112060963562826e-011 * A*A*A*A*A*A*A*A) +
             (-4.6761391236642194e-014 * A*A*A*A*A*A*A*A*A) +
             (-1.0550727697219327e-015 * A*A*A*A*A*A*A*A*A*A) +
             ( 1.0390633647079577e-017 * A*A*A*A*A*A*A*A*A*A*A) +
             (-3.0010559425554894e-020 * A*A*A*A*A*A*A*A*A*A*A*A);
  }
  return HT;
}

//------------------------------------------------------------------------------
// compute correction(s) based on temperature

this.compute_tempCorrect = function(changeID) {
  var debug1 = 0.0;
  var debugT = 0.0;
  var debug2 = 0.0;
  var acorrR = 0.0;
  var acorr1 = 0.0;
  var acorrT = 0.0;
  var acorr2 = 0.0;
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
  var T = 0.0;
  var T1 = 0.0;
  var T2 = 0.0;
  var T1F = 0.0;
  var T2F = 0.0;
  var vol1 = 0.0;
  var vol2 = 0.0;
  var volFactor1 = 0.0;
  var volFactor2 = 0.0;
  var thresh = 0.0;
  var a = 0.0;
  var b = 0.0;
  var updateBPT = false;

  if (tempCorrect.verbose > 0) {
    console.log("============== " + changeID + " ====================");
    if (!changeID) {
      console.log("changeID is undefined; updating ALL");
    }
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

  if (!changeID || changeID == "tempCorrect.debug1" ||
      changeID == "tempCorrect.debugT" || changeID == "tempCorrect.debug2") {
    if (!changeID || changeID == "tempCorrect.debug1" ||
                     changeID == "tempCorrect.debugT") {
      debug1 = Number(tempCorrect.debug1.value);
      debugT = Number(tempCorrect.debugT.value); // in 'C
      thresh = 0.0 + ((debugT-15.55)/(21.66-15.55)) * (47.36 - 0.0);
      a =  -0.00241 + ((debugT-15.55)/(21.66-15.55)) * (-0.003372 + 0.00241);
      b =   1.00891 + ((debugT-15.55)/(21.66-15.55)) * (1.1597 - 1.00891);
      if (debug1 > thresh) {
        debug2 = a * debug1 * debug1 + b * debug1;
      } else {
        debug2 = debug1;
      }
      tempCorrect.debug2.defaultValue = debug2;
      tempCorrect.debug2.precision = tempCorrect.debug1.precision;
      tempCorrect.debug2.userSet = 0;
      common.unsetSavedValue(tempCorrect.debug2,  0);
      common.set(tempCorrect.debug2,  0);
    }
    if (changeID == "tempCorrect.debug2") {
      // no inverse function, for now
      tempCorrect.debug1.defaultValue = 0.0;
      tempCorrect.debug1.precision = tempCorrect.debug2.precision;
      tempCorrect.debug1.userSet = 0;
      common.unsetSavedValue(tempCorrect.debug1,  0);
      common.set(tempCorrect.debug1,  0);
    }
  }

  if (!changeID || changeID == "tempCorrect.acorr1" ||
      changeID == "tempCorrect.acorrR" || 
      changeID == "tempCorrect.acorrT" || changeID == "tempCorrect.acorr2") {
    if (!changeID || changeID == "tempCorrect.acorr1" ||
                     changeID == "tempCorrect.acorrR" || 
                     changeID == "tempCorrect.acorrT") {
      acorrR = Number(tempCorrect.acorrR.value); // in 'C
      acorr1 = Number(tempCorrect.acorr1.value);
      acorrT = Number(tempCorrect.acorrT.value); // in 'C
      acorr2 = compute_aCorrect(acorrT, acorrR, acorr1);
      tempCorrect.acorr2.defaultValue = acorr2;
      tempCorrect.acorr2.precision = tempCorrect.acorr1.precision;
      tempCorrect.acorr2.userSet = 0;
      common.unsetSavedValue(tempCorrect.acorr2,  0);
      common.set(tempCorrect.acorr2,  0);
    }
    if (changeID == "tempCorrect.acorr2") {
      // no inverse function, for now
      tempCorrect.acorr1.defaultValue = 0.0;
      tempCorrect.acorr1.precision = tempCorrect.acorr2.precision;
      tempCorrect.acorr1.userSet = 0;
      common.unsetSavedValue(tempCorrect.acorr1,  0);
      common.set(tempCorrect.acorr1,  0);
    }
  }


  if (!changeID || changeID == "tempCorrect.WPA" ||
      changeID == "tempCorrect.BPT" || changeID == "tempCorrect.deltaT" ||
      changeID == "tempCorrect.HT" || changeID == "tempCorrect.VPA") {
    console.log("computing WPA, BPT, deltaT, HT, and/or VPA");
    if (!changeID || changeID == "tempCorrect.WPA") {
      tempCorrect.BPT.defaultValue =
          tempCorrect.estimateBPT(tempCorrect.WPA.value);
      tempCorrect.BPT.userSet = 0;
      common.unsetSavedValue(tempCorrect.BPT,  0);
      common.set(tempCorrect.BPT,  0);

      tempCorrect.HT.defaultValue = tempCorrect.BPT.value -
                                    tempCorrect.deltaT.value;
      tempCorrect.HT.userSet = 0;
      common.unsetSavedValue(tempCorrect.HT, 0);
      common.set(tempCorrect.HT, 0);

      tempCorrect.VPA.defaultValue =
          tempCorrect.estimateVPA(tempCorrect.HT.value);
      tempCorrect.VPA.userSet = 0;
      common.unsetSavedValue(tempCorrect.VPA,  0);
      common.set(tempCorrect.VPA,  0);
    }

    if (changeID == "tempCorrect.BPT") {
      tempCorrect.WPA.defaultValue =
          tempCorrect.estimateWPA(tempCorrect.BPT.value);
      tempCorrect.WPA.userSet = 0;
      common.unsetSavedValue(tempCorrect.WPA,  0);
      common.set(tempCorrect.WPA,  0);

      tempCorrect.HT.defaultValue = tempCorrect.BPT.value -
                                    tempCorrect.deltaT.value;
      tempCorrect.HT.userSet = 0;
      common.unsetSavedValue(tempCorrect.HT, 0);
      common.set(tempCorrect.HT, 0);

      tempCorrect.VPA.defaultValue =
          tempCorrect.estimateVPA(tempCorrect.HT.value);
      tempCorrect.VPA.userSet = 0;
      common.unsetSavedValue(tempCorrect.VPA,  0);
      common.set(tempCorrect.VPA,  0);
    }

    if (changeID == "tempCorrect.deltaT") {
      tempCorrect.HT.defaultValue = tempCorrect.BPT.value -
                                    tempCorrect.deltaT.value;
      tempCorrect.HT.userSet = 0;
      common.unsetSavedValue(tempCorrect.HT, 0);
      common.set(tempCorrect.HT, 0);

      tempCorrect.VPA.defaultValue =
          tempCorrect.estimateVPA(tempCorrect.HT.value);
      tempCorrect.VPA.userSet = 0;
      common.unsetSavedValue(tempCorrect.VPA,  0);
      common.set(tempCorrect.VPA,  0);
    }

    if (changeID == "tempCorrect.HT") {
      tempCorrect.deltaT.defaultValue = tempCorrect.BPT.value -
                                        tempCorrect.HT.value;
      updateBPT = false;
      if (tempCorrect.deltaT.defaultValue < 0.0) {
        updateBPT = true;
        tempCorrect.BPT.defaultValue = tempCorrect.HT.value;
        tempCorrect.deltaT.defaultValue = 0.0;
      }
      tempCorrect.deltaT.userSet = 0;
      common.unsetSavedValue(tempCorrect.deltaT, 0);
      common.set(tempCorrect.deltaT, 0);

      if (updateBPT) {
        tempCorrect.BPT.userSet = 0;
        common.unsetSavedValue(tempCorrect.BPT, 0);
        common.set(tempCorrect.BPT, 0);

        tempCorrect.WPA.defaultValue =
            tempCorrect.estimateWPA(tempCorrect.BPT.value);
        tempCorrect.WPA.userSet = 0;
        common.unsetSavedValue(tempCorrect.WPA,  0);
        common.set(tempCorrect.WPA,  0);
      }

      tempCorrect.VPA.defaultValue =
          tempCorrect.estimateVPA(tempCorrect.HT.value);
      tempCorrect.VPA.userSet = 0;
      common.unsetSavedValue(tempCorrect.VPA,  0);
      common.set(tempCorrect.VPA,  0);
    }

    if (changeID == "tempCorrect.VPA") {
      tempCorrect.HT.defaultValue =
          tempCorrect.estimateHT(tempCorrect.VPA.value);
      tempCorrect.HT.userSet = 0;
      common.unsetSavedValue(tempCorrect.HT, 0);
      common.set(tempCorrect.HT, 0);

      tempCorrect.BPT.defaultValue =
          tempCorrect.HT.value + tempCorrect.delta.value;
      if (tempCorrect.BPT.defaultValue >= 100.0) {
        tempCorrect.BPT.defaultValue = 100.0;
      }
      tempCorrect.BPT.userSet = 0;
      common.unsetSavedValue(tempCorrect.BPT,  0);
      common.set(tempCorrect.BPT,  0);

      tempCorrect.WPA.defaultValue =
          tempCorrect.estimateWPA(tempCorrect.BPT.value);
      tempCorrect.WPA.userSet = 0;
      common.unsetSavedValue(tempCorrect.WPA,  0);
      common.set(tempCorrect.WPA,  0);
    }
  }

  return;
}

// close the "namespace" and call the function to construct it.
}
tempCorrect._construct();
