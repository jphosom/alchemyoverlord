// -----------------------------------------------------------------------------
// coolEvap.js : JavaScript for AlchemyOverlord web page, cool/evap. sub-page
// Written by John-Paul Hosom
// Copyright © 2021 by John-Paul Hosom, all rights reserved.
//
// Version 1.0.0 : September 26, 2021
//         Initial version.
//
// -----------------------------------------------------------------------------

//==============================================================================

var coolEvap = coolEvap || {};

// Declare a "namespace" called "coolEvap"
// This namespace contains functions that are specific to coolEvap method.
//
//    public functions:
//    . initialize_coolEvap()
//    . compute_coolEvap()
//

coolEvap._construct = function() {

"use strict";

//------------------------------------------------------------------------------
// initialize

this.initialize_coolEvap = function() {
  var idx = 0;
  var keys;
  var updateFunction = this.compute_coolEvap;

  // color options
  this.defaultColor = "#94476b"; // greyish red

  //----------------------------------------------------------------------------
  // create data for all variables

  this.units = new Object();
  this.boilTemp = new Object();
  this.kettleDiameter = new Object();
  this.kettleOpening = new Object();
  this.volume = new Object();
  this.duration = new Object();
  this.temperature = new Object();

  this.units.id = "coolEvap.units";
  this.units.inputType = "radioButton";
  this.units.value = "imperial";
  this.units.userSet = 0;
  this.units.defaultValue = "imperial";
  this.units.additionalFunction = setUnits;
  this.units.additionalFunctionArgs = "";
  this.units.updateFunction = coolEvap.compute_coolEvap;
  this.units.updateFunctionArgs = this.units.id;
  this.units.parent = "coolEvap";

  this.boilTemp.id = "coolEvap.boilTemp";
  this.boilTemp.inputType = "float";
  this.boilTemp.value = 100.0;
  this.boilTemp.userSet = 0;
  this.boilTemp.convertToMetric = common.convertFahrenheitToCelsius;
  this.boilTemp.convertToImperial = common.convertCelsiusToFahrenheit;
  this.boilTemp.precision = 1;
  this.boilTemp.minPrecision = 1;
  this.boilTemp.display = "";
  this.boilTemp.min = 50.0;
  this.boilTemp.max = 250.0;
  this.boilTemp.description = "temperature at which water boils";
  this.boilTemp.defaultValue = 100.0;
  this.boilTemp.updateFunction = coolEvap.compute_coolEvap;
  this.boilTemp.updateFunctionArgs = this.boilTemp.id;
  this.boilTemp.parent = "coolEvap";

  this.kettleDiameter.id = "coolEvap.kettleDiameter";
  this.kettleDiameter.inputType = "float";
  this.kettleDiameter.value = 0.0;
  this.kettleDiameter.userSet = 0;
  this.kettleDiameter.convertToMetric = common.convertInchesToCm;
  this.kettleDiameter.convertToImperial = common.convertCmToInches;
  this.kettleDiameter.precision = 1;
  this.kettleDiameter.minPrecision = 1;
  this.kettleDiameter.display = "";
  this.kettleDiameter.min = 0.0;
  this.kettleDiameter.max = 1000.0;
  this.kettleDiameter.description = "kettle diameter";
  this.kettleDiameter.defaultValue = 36.83;
  this.kettleDiameter.additionalFunction = checkDiameterAndOpening;
  this.kettleDiameter.additionalFunctionArgs = coolEvap.kettleDiameter;
  this.kettleDiameter.updateFunction = coolEvap.compute_coolEvap;
  this.kettleDiameter.updateFunctionArgs = this.duration.id;
  this.kettleDiameter.parent = "coolEvap";

  this.kettleOpening.id = "coolEvap.kettleOpening";
  this.kettleOpening.inputType = "float";
  this.kettleOpening.value = 0.0;
  this.kettleOpening.userSet = 0;
  this.kettleOpening.convertToMetric = common.convertInchesToCm;
  this.kettleOpening.convertToImperial = common.convertCmToInches;
  this.kettleOpening.precision = 1;
  this.kettleOpening.minPrecision = 1;
  this.kettleOpening.display = "";
  this.kettleOpening.min = 0.0;
  this.kettleOpening.max = 1000.0;
  this.kettleOpening.description = "kettle opening";
  this.kettleOpening.defaultValue = 36.83;
  this.kettleOpening.additionalFunction = checkDiameterAndOpening;
  this.kettleOpening.additionalFunctionArgs = coolEvap.kettleOpening;
  this.kettleOpening.updateFunction = coolEvap.compute_coolEvap;
  this.kettleOpening.updateFunctionArgs = this.duration.id;
  this.kettleOpening.parent = "coolEvap";

  this.volume.id = "coolEvap.volume";
  this.volume.inputType = "float";
  this.volume.value = 0.0;
  this.volume.userSet = 0;
  this.volume.convertToMetric = common.convertGallonsToLiters;
  this.volume.convertToImperial = common.convertLitersToGallons;
  this.volume.precision = 2;
  this.volume.minPrecision = 1;
  this.volume.display = "";
  this.volume.min = 0.0;
  this.volume.max = 10000.0;
  this.volume.description = "volume of liquid";
  this.volume.defaultValue = 20.0;
  this.volume.updateFunction = coolEvap.compute_coolEvap;
  this.volume.updateFunctionArgs = this.duration.id;
  this.volume.parent = "coolEvap";

  this.duration.id = "coolEvap.duration";
  this.duration.inputType = "float";
  this.duration.userSet = 0;
  this.duration.precision = 1;
  this.duration.minPrecision = 0;
  this.duration.display = "";
  this.duration.min = 0.0;
  this.duration.max = 240.0;
  this.duration.description = "cooling duration (in minutes)";
  this.duration.defaultValue = 20.0;
  this.duration.updateFunction = coolEvap.compute_coolEvap;
  this.duration.updateFunctionArgs = this.duration.id;
  this.duration.parent = "coolEvap";

  this.temperature.id = "coolEvap.temperature";
  this.temperature.inputType = "float";
  this.temperature.convertToMetric = common.convertFahrenheitToCelsius;
  this.temperature.convertToImperial = common.convertCelsiusToFahrenheit;
  this.temperature.userSet = 0;
  this.temperature.precision = 1;
  this.temperature.minPrecision = 0;
  this.temperature.display = "";
  this.temperature.min = 0.0;
  this.temperature.max = 250.0;
  this.temperature.description = "held temperature";
  this.temperature.defaultValue = 80.0;
  this.temperature.updateFunction = coolEvap.compute_coolEvap;
  this.temperature.updateFunctionArgs = this.temperature.id;
  this.temperature.parent = "coolEvap";

  common.set(coolEvap.boilTemp, 0);
  common.set(coolEvap.kettleDiameter, 0);
  common.set(coolEvap.kettleOpening, 0);
  common.set(coolEvap.volume, 0);
  common.set(coolEvap.duration, 0);
  common.set(coolEvap.temperature, 0);
  common.set(coolEvap.units, 0);

  this.coolA = 0.0;
  this.coolB = 0.0;
  this.coolC = 0.0;

  this.evapA = 0.0;
  this.evapB = 0.0;
  this.evapC = 0.0;

  this.verbose = 1;
  this.compute_coolEvap();

  return;
}

//==============================================================================

//------------------------------------------------------------------------------
// set units to metric or British Imperial

function setUnits() {

  if (coolEvap.units.value == "metric") {
    // update displayed units
    if (document.getElementById('boilTempUnits')) {
      document.getElementById('boilTempUnits').innerHTML = "&deg;C";
    }
    if (document.getElementById('tempUnits')) {
      document.getElementById('tempUnits').innerHTML = "&deg;C";
    }
    if (document.getElementById('kettleDiameterUnits')) {
      document.getElementById('kettleDiameterUnits').innerHTML = "cm";
    }
    if (document.getElementById('kettleOpeningUnits')) {
      document.getElementById('kettleOpeningUnits').innerHTML = "cm";
    }
    if (document.getElementById('volumeUnits')) {
      document.getElementById('volumeUnits').innerHTML = "L";
    }
    if (document.getElementById('coolTempUnits')) {
      document.getElementById('coolTempUnits').innerHTML = "&deg;C";
    }
    if (document.getElementById('evapRateUnits')) {
      document.getElementById('evapRateUnits').innerHTML = "L/hr";
    }

    // update variables
    common.set(coolEvap.boilTemp, 0);
    common.set(coolEvap.kettleDiameter, 0);
    common.set(coolEvap.kettleOpening, 0);
    common.set(coolEvap.volume, 0);
    common.set(coolEvap.temperature, 0);
  } else {
    // update displayed units
    if (document.getElementById('boilTempUnits')) {
      document.getElementById('boilTempUnits').innerHTML = "&deg;F";
    }
    if (document.getElementById('tempUnits')) {
      document.getElementById('tempUnits').innerHTML = "&deg;F";
    }
    if (document.getElementById('kettleDiameterUnits')) {
      document.getElementById('kettleDiameterUnits').innerHTML = "inches";
    }
    if (document.getElementById('kettleOpeningUnits')) {
      document.getElementById('kettleOpeningUnits').innerHTML = "inches";
    }
    if (document.getElementById('volumeUnits')) {
      document.getElementById('volumeUnits').innerHTML = "G";
    }
    if (document.getElementById('coolTempUnits')) {
      document.getElementById('coolTempUnits').innerHTML = "&deg;F";
    }
    if (document.getElementById('evapRateUnits')) {
      document.getElementById('evapRateUnits').innerHTML = "G/hr";
    }

    // update variables
    common.set(coolEvap.boilTemp, 0);
    common.set(coolEvap.kettleDiameter, 0);
    common.set(coolEvap.kettleOpening, 0);
    common.set(coolEvap.volume, 0);
    common.set(coolEvap.temperature, 0);
  }

  return true;
}

//==============================================================================

//------------------------------------------------------------------------------
// check the kettle diameter and opening sizes

function checkDiameterAndOpening(variable) {

  if (coolEvap.kettleDiameter.value < coolEvap.kettleOpening.value) {
    var display = variable.value;
    console.log("kettle diam = " + coolEvap.kettleDiameter.value +
                ", kettle opening = " + coolEvap.kettleOpening.value);
    if (coolEvap.units.value == "imperial") {
      display = variable.convertToImperial(display);
    }
    display = display.toFixed(variable.precision);
    if (variable.id == "kettleDiameter") {
      window.alert("Opening diameter (" + coolEvap.kettleOpening.display +
               ") can't be greater than kettle diameter (" +
               display + "). " +
               "Setting opening diameter to kettle diameter.");
    } else {
      window.alert("Opening diameter (" + display +
               ") can't be greater than kettle diameter (" +
               coolEvap.kettleDiameter.display + "). " +
               "Setting opening diameter to kettle diameter.");
    }
    coolEvap.kettleOpening.value = coolEvap.kettleDiameter.value;
    coolEvap.kettleOpening.precision = coolEvap.kettleDiameter.precision;
    coolEvap.kettleOpening.userSet = 1;
    common.updateHTML(coolEvap.kettleOpening);
    common.setSavedValue(coolEvap.kettleOpening, 0);
  }

  return true;
}


//------------------------------------------------------------------------------
// compute temperature at time 'x' minutes after flameout

this.tempFunction = function(x, param) {
  var temp = 0.0;
  var units = param[0];

  temp = coolEvap.coolA * Math.exp(-1.0 * coolEvap.coolB * x) + coolEvap.coolC;
  if (units == "imperial") {
    temp = common.convertCelsiusToFahrenheit(temp);
  }

  return temp;
}

//------------------------------------------------------------------------------
// compute evaporation rate at temperature 'temp' degrees

this.evapFunction = function(temp, param) {
  var boilTemp = coolEvap.evapC;
  var evapRate = 0.0;
  var lossX = 0.0;
  var units = param[0];
  var x = 0.0;

  // if imperial, convert to metric before computing
  if (units == "imperial") {
    temp = (temp - 32.0) / 1.8;
  }

  // old method:
  // compute evaporation rate (using metric units), with adjustment
  // for temperatures close to boiling
  // evapRate = coolEvap.evapA * Math.exp(-1.0 * coolEvap.evapB * (boilTemp - x));
  // if (x >= boilTemp - 1.0) {
    // var correction = 1.0 - (boilTemp - x);
    // var factor = 1 + (0.5873 * correction);
    // evapRate *= factor;
  // }

  // new method, accounts for both high rate of evaporation near boiling and
  // non-zero rate of evaporation near room temperature:
  x = (boilTemp - temp);
  lossX =  -2.2280872702400492e-008 *x*x*x*x*x +
            4.6528203825461077e-006 *x*x*x*x +
           -3.6308649040405421e-004 *x*x*x +
            1.2406111039309237e-002 *x*x +
           -2.2543383130636041e-001 *x +
           -5.2550963303616971;
  evapRate = coolEvap.evapA * Math.exp(lossX); // loss in L/hr

  // if imperial, convert metric units to imperial
  if (units == "imperial") {
    evapRate = common.convertLitersToGallons(evapRate);
  }

  return evapRate;
}

//------------------------------------------------------------------------------
// compute cooling temperature, and plot cooling as a function of time.
// compute evaporation rate, and plot this rate as a function of temperature.

this.compute_coolEvap = function(changeID) {
  var AVR = 0.0;
  var boilTemp = coolEvap.boilTemp.value;
  var effective_area = 0.0;
  var evapTemp = 0.0;
  var localCoolA = 0.0;
  var localCoolC = 0.0;
  var localEvapA = 0.0;
  var opening_area = 0.0;
  var precision = 0;
  var radius = 0.0;
  var surface_area = 0.0;
  var t = coolEvap.duration.value;
  var temp = 0.0;
  var units = coolEvap.units.value;
  var value = 0.0;
  var volume = coolEvap.volume.value;

  if (coolEvap.verbose > 0) {
    console.log("============== " + changeID + " ====================");
  }

  // ---------------------------------------------------------------------
  // Cooling Temperature

  // compute cooling temperature
  radius = coolEvap.kettleDiameter.value / 2.0;
  surface_area = Math.PI * radius * radius;

  radius = coolEvap.kettleOpening.value / 2.0;
  opening_area = Math.PI * radius * radius;

  effective_area = Math.sqrt(surface_area * opening_area);
  AVR = 0.0;
  if (volume > 0.0) {
    AVR = effective_area / volume;
  }

  coolEvap.coolA = 53.70;
  coolEvap.coolB = (0.0002925 * AVR) + 0.0053834;
  coolEvap.coolC = boilTemp - coolEvap.coolA;
  console.log("A = " + coolEvap.coolA + ", B = " + coolEvap.coolB.toFixed(5) +
              ", C = " + coolEvap.coolC);

  temp = coolEvap.tempFunction(t, units);
  console.log("temp at " + t + " min. = " + temp.toFixed(2));

  // update HTML formula and temperature
  if (document.getElementById("coolParamA")) {
    localCoolA = coolEvap.coolA;
    if (units == "imperial") {
      localCoolA = common.convertCelsiusToFahrenheitSlope(localCoolA);
    }
    document.getElementById("coolParamA").innerHTML = localCoolA.toFixed(2);
  }
  if (document.getElementById("coolParamB")) {
    document.getElementById("coolParamB").innerHTML = coolEvap.coolB.toFixed(4);
  }
  if (document.getElementById("coolParamC")) {
    localCoolC = coolEvap.coolC;
    if (units == "imperial") {
      localCoolC = common.convertCelsiusToFahrenheit(localCoolC);
    }
    document.getElementById("coolParamC").innerHTML = localCoolC.toFixed(2);
  }
  if (document.getElementById("coolTemp")) {
    if (units == "imperial") {
      temp = common.convertCelsiusToFahrenheit(temp);
    }
    document.getElementById("coolTemp").innerHTML = temp.toFixed(2);
  }

  // plot cooling temperature as a function of time
  coolEvap.plotTemp("canvas1", units);

  // ---------------------------------------------------------------------
  // Evaporation

  // compute evaporation
  // old method:
  // coolEvap.evapA = 0.002522 * effective_area;
  // coolEvap.evapB = 0.0505;
  // coolEvap.evapC = boilTemp;
  // new method:
  coolEvap.evapA = effective_area;
  coolEvap.evapC = boilTemp;

  evapTemp = coolEvap.temperature.value;
  if (evapTemp >= boilTemp) {
    evapTemp = boilTemp;
  }
  evapRate = coolEvap.evapFunction(evapTemp, ["metric"]);
  console.log("evapRate = " + evapRate + " liters/hr");

  // update HTML rate
  if (document.getElementById("evapRate")) {
    if (units == "imperial") {
      evapRate = common.convertLitersToGallons(evapRate);
    }
    if (evapRate < 1.0) {
      precision = 4;
    } else {
      precision = 3;
    }
    document.getElementById("evapRate").innerHTML = evapRate.toFixed(precision);
  }

  // plot evaporation rate as a function of temperature
  coolEvap.plotEvap("canvas2", units);

  return;
}


//------------------------------------------------------------------------------
// plot temperature as a function of time; both formula and single point

this.plotTemp = function(canvasName, units) {
  var canvas = {};
  var ctx = {};
  var dataA = [];
  var dataB = [];
  var plot = {};
  var temp = 0.0;
  var xMax = 0.0;
  var yMax = 0.0;

  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // set up and create the plot
  plot = createPlotObject();

  plot.xMin =  0.0;
  xMax = coolEvap.duration.value * 1.5;
  if (xMax < 10.0) {
    xMax = 10.0;
  }
  plot.xMax = xMax;

  yMax = coolEvap.boilTemp.value;
  if (units == "imperial" && yMax < 212.0) {
    yMax = 212.0;
  }
  if (units != "imperial" && yMax < 100.0) {
    yMax = 100.0;
  }

  if (units == "imperial") {
    plot.yMin =  70.0;
    plot.yMax =  yMax;
  } else {
    plot.yMin =  20.0;
    plot.yMax =  yMax;
  }

  plot.xLabel = "time (minutes)";
  if (units == "imperial") {
    plot.yLabel = "temperature (°F)"
  } else {
    plot.yLabel = "temperature (°C)"
  }

  plot.xMajor = 10.0;
  if (xMax < 30.0) {
    plot.xMajor = 2.0;
  }
  if (xMax > 120.0) {
    plot.xMajor = 20.0;
  }
  plot.xMinor = 0.0;
  plot.xGridWidthPx = 0;
  plot.xAxisWidthPx = 0;
  plot.xPrecision = 0;

  if (plot.yMax - plot.yMin > 100) {
    plot.yMajor = 20.0;
  } else {
    plot.yMajor = 10.0;
  }
  plot.yMinor = 0.0;
  plot.yGridWidthPx = 0;
  plot.yAxisWidthPx = 0;
  plot.yPrecision = 0;

  plot.title = "";
  plot.font = "16px Arial";

  createPlot(ctx, plot);

  // plot the function
  plotFunction(ctx, plot, "A", coolEvap.tempFunction, "black", 2, units);
  temp = coolEvap.tempFunction(coolEvap.duration.value, [units]);

  // plot the single point
  dataB.push([coolEvap.duration.value, temp]);
  plotLinearData(ctx, plot, "B", dataB, "solid", "openCircle", "green", 8, 2);

  plotUpdate(ctx, plot, [], []);

  return;
}

//------------------------------------------------------------------------------
// plot evaporation rate as a function of temperature; both formula and
// single point

this.plotEvap = function(canvasName, units) {
  var canvas = {};
  var ctx = {};
  var dataA = [];
  var dataB = [];
  var localTemp = 0.0;
  var maxEvapRate = 0.0;
  var plot = {};
  var temp = 0.0;
  var xMax = 0.0;
  var yMax = 0.0;
  var yInc = 0.0;

  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // set up and create the plot
  plot = createPlotObject();

  xMax = coolEvap.boilTemp.value;
  if (units == "imperial") {
    plot.xMin =  70.0;
    xMax = common.convertCelsiusToFahrenheit(xMax);
  } else {
    plot.xMin =  20.0;
  }
  plot.xMax = xMax;

  plot.yMin = 0.0;
  maxEvapRate = coolEvap.evapFunction(xMax, [units]);
  maxEvapRate = Math.ceil(maxEvapRate);
  plot.yMax = maxEvapRate;
  if (maxEvapRate <= 1.0) {
    yInc = 0.2;
  } else if (maxEvapRate <= 2.0) {
    yInc = 0.5;
  } else if (maxEvapRate <= 5.0) {
    yInc = 1.0;
  } else if (maxEvapRate <= 10.0) {
    yInc = 2.0;
  } else if (maxEvapRate <= 20.0) {
    yInc = 4.0;
  } else if (maxEvapRate <= 25.0) {
    yInc = 5.0;
  } else if (maxEvapRate <= 40.0) {
    yInc = 10.0;
  } else if (maxEvapRate <= 80.0) {
    yInc = 20.0;
  } else {
    yInc = 40.0;
  }

  if (units == "imperial") {
    plot.xLabel = "temperature (°F)"
    plot.yLabel = "evaporation rate (G/hr)";
  } else {
    plot.xLabel = "temperature (°C)"
    plot.yLabel = "evaporation rate (L/hr)";
  }

  plot.xMinor = 0.0;
  if (plot.xMax - plot.xMin > 100) {
    plot.xMajor = 20.0;
  } else {
    plot.xMajor = 10.0;
  }
  plot.xGridWidthPx = 0;
  plot.xAxisWidthPx = 0;
  plot.xPrecision = 0;

  plot.yMinor = 0.0;
  plot.yMajor = yInc;
  plot.yGridWidthPx = 0;
  plot.yAxisWidthPx = 0;
  plot.yPrecision = 2;

  plot.title = "";
  plot.font = "16px Arial";

  createPlot(ctx, plot);

  // plot the function
  plotFunction(ctx, plot, "A", coolEvap.evapFunction, "black", 2, units);

  // plot a single point at the user's specified X value
  localTemp = coolEvap.temperature.value;
  if (units == "imperial") {
    localTemp = common.convertCelsiusToFahrenheit(localTemp);
  }
  evapRate = coolEvap.evapFunction(localTemp, [units]);
  dataB.push([localTemp, evapRate]);
  plotLinearData(ctx, plot, "B", dataB, "solid", "openCircle", "green", 8, 2);

  plotUpdate(ctx, plot, [], []);

  return;
}

// close the "namespace" and call the function to construct it.
}
coolEvap._construct();
