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
  this.debugT.defaultValue = 21.66;
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
  this.acorrT.max = 122.0;
  this.acorrT.description = "acorr temperature";
  this.acorrT.defaultValue = 21.66;
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
// compute temperature-corrected value from temp T ('C) and measured value

function compute_aCorrect(T, meas) {
  var corr = 0.0;
  var polyALL = [ [ 2.2898790449838389e+000, 4.7901781490878914e-001,
                 8.5041701720208224e-002, -3.4159557164397574e-003,
                 6.0093347951163266e-005, -4.9244148889173647e-007,
                 1.5350272879348652e-009 ],
               [ 2.0205455025954935e+000, 6.9071565857303185e-001,
                 5.1469993475049845e-002, -2.0167296397151113e-003,
                 3.4469351856051143e-005, -2.7456240768881766e-007,
                 8.3260695803837042e-010 ],
               [ 1.5488018353328461e+000, 8.2134200560082671e-001,
                 2.9000004520381178e-002, -1.0949526669905517e-003,
                 1.8024018293063491e-005, -1.3841926245289662e-007,
                 4.0501590456036609e-010 ],
               [ 7.8215211452394739e-001, 9.3399120158149485e-001,
                 1.2428447681107225e-002, -4.8665189317513243e-004,
                 8.2614704846608514e-006, -6.5551007917573045e-008,
                 1.9866370105311469e-010 ],
               [ 0.0000000000000000e+000, 1.0000000000000000e+000,
                 0.0000000000000000e+000, 0.0000000000000000e+000,
                 0.0000000000000000e+000, 0.0000000000000000e+000,
                 0.0000000000000000e+000 ],
               [-1.0740927096381276e+000, 1.0959436057505094e+000,
                -1.3768693814440036e-002, 5.1148890403127404e-004,
                -8.3556694709740293e-006, 6.3633976406685524e-008,
                -1.8401492840525762e-010 ],
               [-2.4767050974076490e+000, 1.1789159602658663e+000,
                -2.2598634667213090e-002, 7.7823062114111509e-004,
                -1.1852155974004187e-005, 8.4195587097995272e-008,
                -2.2622486432326253e-010 ],
               [-3.9656872827779406e+000, 1.2302619425927157e+000,
                -2.6527714785895926e-002, 8.3186445039798592e-004,
                -1.1302686795673814e-005, 6.9299163620133586e-008,
                -1.5098596463432612e-010 ],
               [-5.9027495205963456e+000, 1.3329801947827864e+000,
                -3.3186631159433391e-002, 9.6495151262021421e-004,
                -1.1996220452776387e-005, 6.4036332457246482e-008,
                -1.0467767748980046e-010 ],
               [-8.2801613223968662e+000, 1.4837918611636356e+000,
                -4.2975902505821964e-002, 1.2083053141571090e-003,
                -1.4715489555276580e-005, 7.7001278474165555e-008,
                -1.2165957619363151e-010 ],
               [-1.0836528871596656e+001, 1.6371033059974291e+000,
                -5.1002383035491275e-002, 1.3638499614272263e-003,
                -1.5781758512294187e-005, 7.6109592888140661e-008,
                -9.5279230657140223e-011 ]
               ];
  var polySM = [ [ 7.8215211452394739e-001, 9.3399120158149485e-001,
                 1.2428447681107225e-002, -4.8665189317513243e-004,
                 8.2614704846608514e-006, -6.5551007917573045e-008,
                 1.9866370105311469e-010 ],
               [ 5.3691773838633061e-001, 9.6685531477189746e-001,
                 8.3466772898707978e-003, -3.3479735948513048e-004,
                 5.7075179508002412e-006, -4.5291855458360553e-008,
                 1.3718825574859533e-010 ],
               [ 4.5762594798830458e-001, 9.6029635505741939e-001,
                 7.4015974513446815e-003, -2.9061184155667480e-004,
                 4.9714715901794154e-006, -3.9865245757813559e-008,
                 1.2232785588472642e-010 ],
               [ 3.7519903651468933e-001, 9.5609797097510396e-001,
                 6.1866119518355859e-003, -2.3408837070908723e-004,
                 3.9770232280331056e-006, -3.1937744457257464e-008,
                 9.8371113908450069e-011 ],
               [ 9.0261148152671666e-002, 9.9956110475209348e-001,
                 1.5216842533805463e-003, -6.5291214113643870e-005,
                 1.1329610129827586e-006, -9.1012505411149349e-009,
                 2.7987592648098874e-011 ],
               [ 0.0000000000000000e+000, 1.0000000000000000e+000,
                 0.0000000000000000e+000, 0.0000000000000000e+000,
                 0.0000000000000000e+000, 0.0000000000000000e+000,
                 0.0000000000000000e+000 ],
               [-2.4756913321610149e-001, 1.0299370125310181e+000,
                -3.8546796571682033e-003, 1.4482311531260753e-004,
                -2.4229605405009022e-006, 1.8961434721059547e-008,
                -5.6547405454327603e-011 ],
               [-4.3719610626541516e-001, 1.0386518542176084e+000,
                -5.8535650499889416e-003, 2.2887742015500215e-004,
                -3.9481453986860214e-006, 3.1813472025788540e-008,
                -9.7505919688601388e-011 ],
               [-6.4134028340849558e-001, 1.0609488437760317e+000,
                -9.0006500489732810e-003, 3.4501868881726895e-004,
                -5.8247609905119635e-006, 4.5921381290829249e-008,
                -1.3782354140279838e-010 ],
               [-8.8312038688028804e-001, 1.0819980064696877e+000,
                -1.1711514686977899e-002, 4.4511232399713490e-004,
                -7.4852632935657535e-006, 5.8831387691547199e-008,
                -1.7587242596232893e-010 ],
               [-1.0740927096381276e+000, 1.0959436057505094e+000,
                -1.3768693814440036e-002, 5.1148890403127404e-004,
                -8.3556694709740293e-006, 6.3633976406685524e-008,
                -1.8401492840525762e-010 ]
                ] ;
  var coeff1 = [];
  var coeff2 = [];
  var idx = 0;
  var y1 = 0.0;
  var y2 = 0.0;
  var x1 = 0.0;
  var x2 = 0.0;
  var Tint = 0;
  var multiple = 0.0;
  var offset = 0.0;

  if (T < 0.0)  T = 0.0;
  if (T > 50.0) T = 50.0;

  // select which set of coefficients to use, get index into lower temperature,
  // and set multiple and offset
  console.log("T = " + T);
  if (T >= 15.0 && T <= 25.0) {
    multiple = 1.0;
    offset = 15.0;
    Tint = parseInt((T-offset)/multiple);
    if (Tint > polySM.length - 2) {
      Tint = polySM.length - 2;
    }
    coeff1 = polySM[Tint];
    coeff2 = polySM[Tint+1];
  } else {
    multiple = 5.0;
    offset = 0.0;
    Tint = parseInt((T-offset)/multiple);
    if (Tint > polyALL.length - 2) {
      Tint = polyALL.length - 2;
    }
    coeff1 = polyALL[Tint];
    coeff2 = polyALL[Tint+1];
  }

  // get two values, one at lower temp and one at higher temp
  y1 = 0.0;
  for (idx = 0; idx < coeff1.length; idx++) {
    y1 += Math.pow(meas, idx) * coeff1[idx];
  }

  y2 = 0.0;
  for (idx = 0; idx < coeff2.length; idx++) {
    y2 += Math.pow(meas, idx) * coeff2[idx];
  }

  // interpolate between the two values
  x1 = (Tint + offset) * multiple;
  x2 = (Tint + offset + 1.0) * multiple;
  corr = y1 + (T - x1) * (y2 - y1) / (x2 - x1);
  if (corr < 0.0) corr = 0.0;
  if (corr > 100.0) corr = 100.0;

  return corr;
}

//------------------------------------------------------------------------------

this.estimateWPA = function(T) {
  var WPA = 0.0;
  if (T >= 99.7) {
    WPA = 0.0;
  } else if (T <= 78.5) {
    WPA = 100.0;
  } else {
    WPA   =  -1.1798566592889689e+006 +
             ( 5.0011149714910774e+004 * T) +
             (-5.5361274735162806e+002 * T*T) +
             (-2.8171538989168141e+000 * T*T*T) +
             ( 5.8894583361128475e-002 * T*T*T*T) +
             ( 3.9079532520632084e-004 * T*T*T*T*T) +
             (-5.2114851839856001e-006 * T*T*T*T*T*T) +
             (-5.7551273078304644e-008 * T*T*T*T*T*T*T) +
             ( 8.3314787992185959e-010 * T*T*T*T*T*T*T*T) +
             (-2.6302555900004212e-012 * T*T*T*T*T*T*T*T*T);
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
    BPT =      9.9990575876521433e+001 +
             (-9.1622304249828423e-001 * A) +
             ( 2.4976194717428804e-002 * A*A) +
             (-4.9268049580643595e-004 * A*A*A) +
             ( 6.5338038083050965e-006 * A*A*A*A) +
             (-5.0282221862797098e-008 * A*A*A*A*A) +
             ( 1.6246657152458864e-010 * A*A*A*A*A*A);
    console.log("A = " + A + "; BPT = " + BPT);
  }
  return BPT;
}

//------------------------------------------------------------------------------

this.estimateVPA = function(T) {
  var VPA = 0.0;
  if (T <= 78.5) {
    VPA = 95.5;
  } else if (T >= 99.7) {
    VPA = 0.0;
  } else {
    VPA =      3.5880716227093292e+005 +
             (-2.0094118621463876e+004 * T) +
             ( 4.5032567463419122e+002 * T*T) +
             (-5.0477834554506273e+000 * T*T*T) +
             ( 2.8306979154056434e-002 * T*T*T*T) +
             (-6.3556658386130282e-005 * T*T*T*T*T);
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
    HT  =      1.0000017907045650e+002 +
             (-7.1727749530836299e-002 * A) +
             (-1.2311646094928311e-003 * A*A) +
             (-1.1683658027684778e-004 * A*A*A) +
             ( 2.2117763322910839e-005 * A*A*A*A) +
             (-1.4700757046191325e-006 * A*A*A*A*A) +
             ( 4.7174444752591413e-008 * A*A*A*A*A*A) +
             (-6.6028464356410093e-010 * A*A*A*A*A*A*A) +
             (-2.2783675539481851e-012 * A*A*A*A*A*A*A*A) +
             ( 2.1907147843731818e-013 * A*A*A*A*A*A*A*A*A) +
             (-3.1941801439132346e-015 * A*A*A*A*A*A*A*A*A*A) +
             ( 2.0620970136148595e-017 * A*A*A*A*A*A*A*A*A*A*A) +
             (-5.1625440200858505e-020 * A*A*A*A*A*A*A*A*A*A*A*A);
  }
  return HT;
}

//------------------------------------------------------------------------------
// compute correction(s) based on temperature

this.compute_tempCorrect = function(changeID) {
  var debug1 = 0.0;
  var debugT = 0.0;
  var debug2 = 0.0;
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
      changeID == "tempCorrect.acorrT" || changeID == "tempCorrect.acorr2") {
    if (!changeID || changeID == "tempCorrect.acorr1" ||
                     changeID == "tempCorrect.acorrT") {
      acorr1 = Number(tempCorrect.acorr1.value);
      acorrT = Number(tempCorrect.acorrT.value); // in 'C
      acorr2 = compute_aCorrect(acorrT, acorr1);
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
