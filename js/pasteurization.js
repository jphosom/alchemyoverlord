// -----------------------------------------------------------------------------
// pasteurization.js : JavaScript for AlchemyOverlord web page,
//                     pasteurization sub-page
// Written by John-Paul Hosom
// Copyright © 2024-2025 by John-Paul Hosom, all rights reserved.
// To license this software, please contact John-Paul Hosom, for example at
//    alchemyoverlord © yahoo · com
// In many cases (at the sole discretion of John-Paul Hosom) a license
// is provided free of charge, but a written license is required for
// legal use of this code.
//
//
// Version 0.0.0 : Nov. 10, 2024 -- Nov. 15, 2025 : Initial version.
//
// -----------------------------------------------------------------------------

//==============================================================================

var pasteurization = pasteurization || {};

// Declare a "namespace" called "pasteurization"
// This namespace contains functions that are specific to pasteurization method.
//
//    public functions:
//    . initialize_pasteurization()
//    . updateAll()
//    . updateFocus()
//    . switchView()
//

pasteurization._construct = function() {

"use strict";

//------------------------------------------------------------------------------
// initialize

this.initialize_pasteurization = function() {
  var batchHTML = "";
  var bIdx = 0;
  var defaultColor = "#94476b"; // greyish red
  var dependentList = [];
  var idx = 0;
  var keys;
  var maxBatchRows = 0;
  var maxNumBatches = 5;
  var previousEntry = {};
  var prevTime = {};
  var rIdx = 0;
  var timeTempOb = {};

  //----------------------------------------------------------------------------
  // create and set initial variables

  this.view = common.createRadioButton("pasteurization.view", "dataEntry",
                             "", "", "", "", "", pasteurization.switchView, "");
  this.title = common.createString("pasteurization.title", "",
                             "description of this pasteurization session",
                             "", "", "", "", "", "", "");
  this.day = common.createInt("pasteurization.day", 1, "day of the month",
                                1, 31,
                                "", "", "", "", "", "", "", "");
  this.month = common.createSelection("pasteurization.month", "Jan",
                                      "month", "", "", "", "", "", "", "");
  this.year = common.createInt("pasteurization.year", 25, "year",
                                0, 99,
                                "", "", "", "", "", "", "", "");

  this.units = common.createRadioButton("pasteurization.units", "imperial",
                              "", "", setUnits, "", "",
                              pasteurization.updateAll, "");
  this.model = common.createRadioButton("pasteurization.model", "smart",
                              "", "", "", "", "",
                              pasteurization.updateAll, "");
  this.timeUnits = common.createRadioButton("pasteurization.timeUnits", "12",
                             "", "", "", "", "",
                             pasteurization.updateAll, "");
  this.timeDivision = common.createTime("pasteurization.timeDivision",
                         "8.50000000", pasteurization.timeUnits, "", "", "", 0,
                         "onlyAM", "time division", "", "", "", "", "", "", "");

  this.refTemp = common.createFloat("pasteurization.refTemp", 60.0,
                         "reference temperature for z value", 20.0, 100.0,
                         0, 0, "", "", "", "", "",
                         "", "", "", pasteurization.updateAll, "");
  this.minTemp = common.createFloat("pasteurization.minTemp", 55.0,
                         "minimum effective temperature", 20.0, 100.0,
                         0, 0, common.convertFahrenheitToCelsius,
                               common.convertCelsiusToFahrenheit,
                         "", "", "",
                         "", "", "", pasteurization.updateAll, "");
  this.zValue = common.createFloat("pasteurization.zValue", 6.94,
                         "z value", 0.0, 30.0, 2, 0, "", "", "", "", "",
                         "", "", "", pasteurization.updateAll, "");
  this.DValue = common.createFloatOrString("pasteurization.DValue", "",
                         "D value", 0.0, 60.0, 2, 0, [""], "", "", "", "", "",
                         "", "", "", pasteurization.updateAll, "");

  this.numBatches = common.createInt("pasteurization.numBatches", maxNumBatches,
                         "number of batches", 1, maxNumBatches, "", "", "",
                         "", "", "", pasteurization.updateAll, "");

  this.hotTemp = common.createFloat("pasteurization.hotTemp", 85.0,
                         "temperature of hot-water bath", 0.0, 100.0, 0, 0,
                         common.convertFahrenheitToCelsius,
                         common.convertCelsiusToFahrenheit,
                         "", "", "",
                         "", "", "", pasteurization.updateAll, "");

  this.startTime = common.createTime("pasteurization.startTime", "",
                         pasteurization.timeUnits, pasteurization.timeDivision,
                         "", "", 1, "", "start time", "", "", "", "", "",
                         pasteurization.updateAll, "");
  this.heatWaterTime = common.createTime("pasteurization.heatWaterTime", "",
                         pasteurization.timeUnits, pasteurization.timeDivision,
                         pasteurization.startTime, 1, 1, "",
                         "time at which start heating water",
                         "", "", "", "", "",
                         pasteurization.updateAll, "");
  this.finishTime = common.createTime("pasteurization.finishTime", "",
                         pasteurization.timeUnits, pasteurization.timeDivision,
                         pasteurization.heatWaterTime, 1, 1, "",
                         "finish cleanup time", "", "", "", "", "",
                         pasteurization.updateAll, "");

  common.set(pasteurization.view,  0);
  common.set(pasteurization.title,  0);
  common.set(pasteurization.day,  0);
  common.set(pasteurization.month,  0);
  common.set(pasteurization.year,  0);

  common.set(pasteurization.units,  0);
  common.set(pasteurization.model,  0);
  common.set(pasteurization.timeUnits,  0);
  common.set(pasteurization.timeDivision,  0);

  common.set(pasteurization.refTemp,  0);
  common.set(pasteurization.minTemp,  0);
  common.set(pasteurization.zValue,  0);
  common.set(pasteurization.DValue,  0);

  common.set(pasteurization.numBatches,  0);
  common.set(pasteurization.hotTemp,  0);

  common.set(pasteurization.startTime,  0);
  common.set(pasteurization.heatWaterTime,  0);
  common.set(pasteurization.finishTime,  0);

  //---------------------------------------------------------------------------
  // create and set variables in the columns

  // at most 20 rows of timing information in warming, heating, or cooling
  this.maxWHCTimes = 20;

  // total number of rows is max in each times 3 (W,H,C) plus 10 more for
  // rows that are not timing information (e.g. Batch #1, bottles, Plot, etc)
  maxBatchRows = (this.maxWHCTimes * 3) + 10;

  // Create variables within each batch: an array with one element per batch
  pasteurization.batchInfo = [];
  for (bIdx = 0; bIdx < maxNumBatches; bIdx++) {
    // create the item in the array for this batch
    pasteurization.batchInfo.push();
    pasteurization.batchInfo[bIdx] =
       {numBottles: {}, preMixBoil: {}, postMix: {}, xferWarm: {}, warm: [],
        xferHot: {}, hot: [], xferCool: {}, cool: [], plot: {}};

    // create the numBottles, preMixBoil, and postMix, and xferWarm variables
    pasteurization.batchInfo[bIdx].numBottles =
      common.createInt("pasteurization.batchInfo["+bIdx+"].numBottles",
        10, "number of bottles", 1, 50,
        "", "", "",
        "", "", "", pasteurization.updateAll, "");
    common.set(pasteurization.batchInfo[bIdx].numBottles, 0);

    pasteurization.batchInfo[bIdx].preMixBoil =
      common.createFloat("pasteurization.batchInfo["+bIdx+"].preMixBoil",
        0.0, "temperature of warm water before mixing in boiling water",
        0.0, 100.0, 0, 0, common.convertFahrenheitToCelsius,
        common.convertCelsiusToFahrenheit, defaultPreMixBoil,
        "", defaultColor, "", "", "", pasteurization.updateAll, "");
    common.set(pasteurization.batchInfo[bIdx].preMixBoil, 0);

    pasteurization.batchInfo[bIdx].postMix =
      common.createFloat("pasteurization.batchInfo["+bIdx+"].postMix",
        0.0, "temperature of warm water after mixing in boiling water",
        0.0, 100.0, 0, 0, common.convertFahrenheitToCelsius,
        common.convertCelsiusToFahrenheit, defaultPostMix,
        "", defaultColor, "", "", "", pasteurization.updateAll, "");
    common.set(pasteurization.batchInfo[bIdx].postMix, 0);

    prevTime = pasteurization.heatWaterTime;
    if (bIdx > 0 && pasteurization.batchInfo[bIdx-1].xferWarm) {
      prevTime = pasteurization.batchInfo[bIdx-1].xferWarm;
    }
    pasteurization.batchInfo[bIdx].xferWarm =
      common.createTime("pasteurization.batchInfo["+bIdx+"].xferWarm",
         -1.0, pasteurization.timeUnits, pasteurization.timeDivision,
         prevTime, 1, 1, "",
         "time when transfer bottles into warm water",
         "", "", "", "", "", pasteurization.updateAll, "");
    common.set(pasteurization.batchInfo[bIdx].xferWarm, 0);

    // create entries for list of "warm" times and temperatures
    for (rIdx = 0; rIdx < this.maxWHCTimes; rIdx++) {
      if (rIdx == 0) {
        previousEntry = pasteurization.batchInfo[bIdx].xferWarm;
      } else {
        previousEntry = pasteurization.batchInfo[bIdx].warm[rIdx-1].time;
      }
      timeTempOb = createTimeTempOb(bIdx, rIdx, "warm", -1.0, "",previousEntry);
      pasteurization.batchInfo[bIdx].warm.push(timeTempOb);
      common.set(pasteurization.batchInfo[bIdx].warm[rIdx].time, 0);
      common.set(pasteurization.batchInfo[bIdx].warm[rIdx].temp, 0);
    }

    // create time at which bottles are transferred into hot water
    pasteurization.batchInfo[bIdx].xferHot =
      common.createTime("pasteurization.batchInfo["+bIdx+"].xferHot",
         -1.0, pasteurization.timeUnits, pasteurization.timeDivision,
         pasteurization.batchInfo[bIdx].xferWarm, 1, 1, "",
         "time when transfer bottles into warm water",
         "", "", "", "", "", pasteurization.updateAll, "");
    common.set(pasteurization.batchInfo[bIdx].xferHot, 0);

    // create entries for list of "hot" times and temperatures
    for (rIdx = 0; rIdx < this.maxWHCTimes; rIdx++) {
      if (rIdx == 0) {
        previousEntry = pasteurization.batchInfo[bIdx].xferHot;
      } else {
        previousEntry = pasteurization.batchInfo[bIdx].hot[rIdx-1].time;
      }
      timeTempOb = createTimeTempOb(bIdx, rIdx, "hot", -1.0, "",previousEntry);
      pasteurization.batchInfo[bIdx].hot.push(timeTempOb);
      common.set(pasteurization.batchInfo[bIdx].hot[rIdx].time, 0);
      common.set(pasteurization.batchInfo[bIdx].hot[rIdx].temp, 0);
    }

    // create time at which bottles are transferred to cool (room temp) air
    pasteurization.batchInfo[bIdx].xferCool =
      common.createTime("pasteurization.batchInfo["+bIdx+"].xferCool",
         -1.0, pasteurization.timeUnits, pasteurization.timeDivision,
         pasteurization.batchInfo[bIdx].xferHot, 1, 1, "",
         "time when transfer bottles to room-temperature air",
         "", "", "", "", "", pasteurization.updateAll, "");
    common.set(pasteurization.batchInfo[bIdx].xferCool, 0);

    // create entries for list of "cool" times and temperatures
    for (rIdx = 0; rIdx < this.maxWHCTimes; rIdx++) {
      if (rIdx == 0) {
        previousEntry = pasteurization.batchInfo[bIdx].xferCool;
      } else {
        previousEntry = pasteurization.batchInfo[bIdx].cool[rIdx-1].time;
      }
      timeTempOb = createTimeTempOb(bIdx, rIdx, "cool", -1.0, "",previousEntry);
      pasteurization.batchInfo[bIdx].cool.push(timeTempOb);
      common.set(pasteurization.batchInfo[bIdx].cool[rIdx].time, 0);
      common.set(pasteurization.batchInfo[bIdx].cool[rIdx].temp, 0);
    }

    // create plot checkbox
    pasteurization.batchInfo[bIdx].plot =
      common.createCheckbox("pasteurization.batchInfo["+bIdx+"].plot",
         true, "", "", "", "", "", pasteurization.updateAll, "");
    common.set(pasteurization.batchInfo[bIdx].plot, 0);

  }

  // warmTemp must be set after batchInfo, since dependents depend on batchInfo
  dependentList = [];
  for (bIdx = 0; bIdx < maxNumBatches; bIdx++) {
    if (pasteurization.batchInfo[bIdx]) {
      dependentList.push(pasteurization.batchInfo[bIdx].preMixBoil);
      dependentList.push(pasteurization.batchInfo[bIdx].postMix);
    }
  }
  this.warmTemp = common.createFloat("pasteurization.warmTemp", 54.5,
                         "temperature of warm-water bath", 0.0, 100.0, 0, 0,
                         common.convertFahrenheitToCelsius,
                         common.convertCelsiusToFahrenheit,
                         "", "", "", "", "", dependentList,
                         pasteurization.updateAll, "");
  common.set(pasteurization.warmTemp,  0);

  // create batch HTML info
  batchHTML = "<table style=\"margin-left:0em\" class=\"pasteurizationInputTableName\"><tbody>";
  for (rIdx = 0; rIdx < maxBatchRows; rIdx++) {
    batchHTML += "<tr id=\"batchRow"+rIdx+"\"></tr>";
  }
  batchHTML += "</tbody></table>";
  document.getElementById("batchInfo").innerHTML = batchHTML;

  // set previous and next focus for static information (not batch info)
  this.view.nextFocus = this.title.id;
  this.title.nextFocus = this.day.id;
  this.day.prevFocus = this.title.id;
  this.day.nextFocus = this.month.id;
  this.month.prevFocus = this.day.id;
  this.month.nextFocus = this.year.id;
  this.year.prevFocus = this.month.id;
  this.year.nextFocus = this.timeDivision.id;
  this.timeDivision.prevFocus = this.year.id;
  this.timeDivision.nextFocus = this.numBatches.id;

  this.numBatches.prevFocus    = this.timeDivision.id;
  this.numBatches.nextFocus    = this.warmTemp.id
  this.warmTemp.prevFocus      = this.numBatches.id;
  this.warmTemp.nextFocus      = this.hotTemp.id;
  this.hotTemp.prevFocus       = this.warmTemp.id;
  this.hotTemp.nextFocus       = this.startTime.id;
  this.startTime.prevFocus     = this.hotTemp.id;
  this.startTime.nextFocus     = this.heatWaterTime.id;
  this.heatWaterTime.prevFocus = this.startTime.id;
  this.heatWaterTime.nextFocus = this.refTemp.id;

  this.refTemp.prevFocus       = this.heatWaterTime.id;
  this.refTemp.nextFocus       = this.zValue.id;
  this.zValue.prevFocus        = this.refTemp.id;
  this.zValue.nextFocus        = this.minTemp.id;
  this.minTemp.prevFocus       = this.zValue.id;
  this.minTemp.nextFocus       = this.DValue.id;
  this.DValue.prevFocus        = this.minTemp.id;
  this.DValue.nextFocus        = this.batchInfo[0].numBottles.id;

  // initialize for focus
  common.initFocus(this, this.updateFocus);

  // update HTML and plots with the latest values
  this.verbose = 1;
  this.updateAll("");

  // switch the view to data entry or printing, depending on user preferences
  this.switchView();

  return;
}

//==============================================================================

//------------------------------------------------------------------------------
// create time and temperature variables for one row in one batch

function createTimeTempOb(bIdx, tIdx, category, time, temp, previousEntry) {
  var batchInfoStr = "pasteurization.batchInfo";
  var timeTempOb = new Object();

  timeTempOb.time =
    common.createTime(batchInfoStr+"["+bIdx+"]."+category+"["+tIdx+"].time",
         time, pasteurization.timeUnits, pasteurization.timeDivision,
         previousEntry, 1, 1, "", "time at which temperature is recorded",
         "", "", "", "", "", pasteurization.updateAll, "");

  timeTempOb.temp =
    common.createFloatOrString(batchInfoStr+"["+bIdx+"]."+category+"["+tIdx+"].temp",
          temp, "temperature", 0.0, 100.0, 0, 0, [ "" ],
          common.convertFahrenheitToCelsius, common.convertCelsiusToFahrenheit,
          "", "", "", "", "", "", pasteurization.updateAll, "");

  return timeTempOb;
}

//------------------------------------------------------------------------------
// set units to metric or US Customary

function setUnits() {
  var uIdx = 0;
  var uList = [];

  if (pasteurization.units.value == "metric") {
    // update displayed units
    if (document.getElementsByClassName("pasteurization.TUnits")) {
      uList = document.getElementsByClassName("pasteurization.TUnits");
      for (uIdx = 0; uIdx < uList.length; uIdx++) {
        uList[uIdx].innerHTML = "&deg;C";
      }
    }

    // update variables; warmTemp may not exist at first initialization
    common.set(pasteurization.minTemp, 0);
    if (pasteurization.warmTemp) {
      common.set(pasteurization.warmTemp, 0);
    }
    common.set(pasteurization.hotTemp, 0);
  } else {
    // update displayed units
    if (document.getElementsByClassName("pasteurization.TUnits")) {
      uList = document.getElementsByClassName("pasteurization.TUnits");
      for (uIdx = 0; uIdx < uList.length; uIdx++) {
        uList[uIdx].innerHTML = "&deg;F";
      }
    }

    // update variables; warmTemp may not exist at first initialization
    common.set(pasteurization.minTemp, 0);
    if (pasteurization.warmTemp) {
      common.set(pasteurization.warmTemp, 0);
    }
    common.set(pasteurization.hotTemp, 0);
  }

  return true;
}

//------------------------------------------------------------------------------

function defaultPreMixBoil() {
  if (pasteurization.warmTemp) {
    return pasteurization.warmTemp.value - 7.0;
  } else {
    return 54.5 - 7.0;
  }
}

function defaultPostMix() {
  if (pasteurization.warmTemp) {
    return pasteurization.warmTemp.value;
  } else {
    return 54.5;
  }
}

//==============================================================================
// FOCUS FUNCTIONS

function doFocus(functionName) {
  if (functionName) {
    console.log("SETTING FOCUS TO " + functionName.id);
    window.setTimeout(functionName.focus(), 0);
  }
  return;
}

//------------------------------------------------------------------------------
// updateFocus needs to be defined (we can't just use common.js focus functions)
// because when we update everything we re-generate the HTML and that loses
// any focus.  So we call this function after updating the HTML.

this.updateFocus = function(activeElementName) {
  var activeElement;
  var clickElement;

  console.log("pasteurization updateFocus: " + activeElementName);

  // if the user clicks somewhere, that takes precedence
  if (pasteurization.action == -1 &&
      pasteurization.mouseX > 0 && pasteurization.mouseY > 0) {
    clickElement =
      document.elementFromPoint(pasteurization.mouseX, pasteurization.mouseY);
    doFocus(clickElement);
    return;
  }

  if (!activeElementName) {
    return;
  }

  activeElement = eval(activeElementName);
  if (!activeElement) {
    window.alert("Internal error: no active element for " + activeElementName);
  }

  if (true) {
    console.log(">> in update focus: " + activeElementName);
    console.log(">>    action = " + pasteurization.action);
    console.log(">>    prev = " + activeElement.prevFocus);
    console.log(">>    next = " + activeElement.nextFocus);
  }

  if (pasteurization.action == -3 && activeElement.upFocus &&
      document.getElementById(activeElement.upFocus)) {
    doFocus(document.getElementById(activeElement.upFocus));
    return;
  }
  if (pasteurization.action == -4 && activeElement.downFocus &&
      document.getElementById(activeElement.downFocus)) {
    doFocus(document.getElementById(activeElement.downFocus));
    return;
  }
  if ((pasteurization.action == 9 || pasteurization.action == 13 ||
      pasteurization.action == -4) && activeElement.nextFocus &&
      document.getElementById(activeElement.nextFocus)) {
    doFocus(document.getElementById(activeElement.nextFocus));
    return;
  }
  if ((pasteurization.action == -2 || pasteurization.action == -3) &&
      activeElement.prevFocus &&
      document.getElementById(activeElement.prevFocus)) {
    doFocus(document.getElementById(activeElement.prevFocus));
    return;
  }

  // if no action on mouse or keyboard, set focus to the active element
  if (pasteurization.action == 0 &&
      document.getElementById(activeElementName)) {
    doFocus(document.getElementById(activeElementName));
  }
  return;
}

//==============================================================================
// PASTEURIZATION UNITS COMPUTATIONS

//------------------------------------------------------------------------------
// Fit a model to times and temperatures from the hot-water bath
// or the cooling rack.
// For the hot-water bath, temperatures that are increasing are
// fit to a "hot-water heating" model.  Once the temperature in the
// hot-water bath has peaked, then subsequent temperatures are fit
// to a "hot-water cooling" model.
// All times are in minutes, with the start of the hot-water bath
// at time 0 and the start of the cooling-rack period also at time 0.
// For the hot-water heating model:
//   model = a * (1.0 - Math.exp(-1.0 * b * time)) + c;
//   where at time=0, c is the minimum temperature
//         at time=maximum (start cooling), a+c is the maximum temperature
// For the hot-water cooling model and the cooling-rack model:
//   model = a * Math.exp(-1.0 * b * time) + c;
//   where at time=0, a+c is the maximum temperature
//         at time=maximum (finish cooling), c is the minimum temperature
// Initial parameters are set based on observed limits, and a brute-force
// search is performed to find the best values of a, b, and c.

function fitModel(timeTempList, whichPhase, peakTime, peakTemp) {
  var a = 0.0;
  var b = 0.0;
  var c = 0.0;
  var beforePeak = 0;
  var bestA = 0.0;
  var bestB = 0.0;
  var bestC = 0.0;
  var diff = 0.0;
  var err = 0.0;
  var errSum = 0.0;
  var firstTime = 0;  // set to 1 for debugging
  var guessC = 0.0;
  var guessA = 0.0;
  var idx = 0;
  var incA = 0.0;
  var incB = 0.0;
  var incC = 0.0;
  var maxA = 0.0;
  var maxB = 0.0;
  var maxC = 0.0;
  var minA = 0.0;
  var minB = 0.0;
  var minC = 0.0;
  var minErr = 0.0;
  var model = 0.0;
  var N = 0.0;
  var printResultsToConsole = 1;
  var tempVal = 0.0;
  var timeVal = 0.0;

  console.log("Estimating model for " + whichPhase);

  if (timeTempList.length == 0) {
    return [];
  }

  if (whichPhase == "hotWater-heating") {
    guessC = timeTempList[0][1];
    guessA = peakTemp - guessC;
    console.log("  guessA = " + guessA);
    console.log("  guessC = " + guessC);
    minA = guessA - 0.0;
    maxA = guessA + 20.0;
    incA = 0.5;

    minB = 0.10;
    maxB = 0.50;
    incB = 0.01;

    minC = guessC - 20.0;
    maxC = guessC + 10.0;
    incC = 0.5;
  } else if (whichPhase == "hotWater-cooling") {
    guessC = timeTempList[timeTempList.length-1][1];
    guessA = peakTemp - guessC;  // a + c is the max temp. at t=0
    console.log("  guessA = " + guessA);
    console.log("  guessC = " + guessC);
    minA = guessA - 0.0;  // we want to reach exactly the max temp at t=peakTime
    maxA = guessA + 0.0;  // we want to reach exactly the max temp at t=peakTime
    incA = 0.25;

    minB = 0.000;
    maxB = 0.50;
    incB = 0.001;

    minC = guessC - 0.0;  // we want to reach exactly the min temp at end
    maxC = guessC + 0.0;  // we want to reach exactly the min temp at end
    incC = 2.0;
  } else {
    guessC = 20.0;   // eventually it reaches close to room temperature
    guessA = timeTempList[0][1] - guessC;  // a + c is the max temp. at t=0
    console.log("  guessA = " + guessA);
    console.log("  guessC = " + guessC);
    minA = guessA - 0.0;  // we want to reach exactly the max temp at t=0
    maxA = guessA + 0.0;  // we want to reach exactly the max temp at t=0
    incA = 0.25;

    minB = 0.010;
    maxB = 0.050;
    incB = 0.001;

    minC = guessC - 4.0;
    maxC = guessC + 4.0;
    incC = 2.0;
  }
  if (whichPhase == "cooling" && timeTempList.length == 1) {
    minB = 0.0165;
    maxB = 0.0165;
    minC = 20.0;
    maxC = 20.0;
  }

  minErr = 1.0e10;
  for (a = minA; a <= maxA; a += incA) {
    a = Number(a.toFixed(3));
    for (b = minB; b <= maxB; b += incB) {
      b = Number(b.toFixed(4));
      // If hot-water bath and getting hotter, and if we have a peak time
      // after which it cools down in the hot water, set C so that
      // we are guaranteed to reach that peak temperature at that peak time.
      if (whichPhase == "hotWater-heating" && peakTime != 1.0e10) {
        minC = peakTemp - (a * (1.0 - Math.exp(-1.0 * b * peakTime)));
        maxC = minC;
      }
      for (c = minC; c <= maxC; c += incC) {
        c = Number(c.toFixed(3));
        N = 0.0;
        errSum = 0.0;
        for (idx = 0; idx < timeTempList.length; idx++) {
          timeVal = timeTempList[idx][0];
          tempVal = timeTempList[idx][1];
          beforePeak = 1;
          if (timeVal > peakTime) beforePeak = 0;
          if ((whichPhase == "hotWater-heating" && !beforePeak) ||
              (whichPhase == "hotWater-cooling" && beforePeak)) {
            continue;
          }
          if (whichPhase == "hotWater-heating" && beforePeak) {
            model = a * (1.0 - Math.exp(-1.0 * b * timeVal)) + c;
          } else if (whichPhase == "hotWater-cooling" && !beforePeak) {
            model = a * Math.exp(-1.0 * b * (timeVal-peakTime)) + c;
          } else {
            model = a * Math.exp(-1.0 * b * timeVal) + c;
          }
          diff = (model - tempVal);
          if (0 && firstTime) {
            console.log("  model = " + model + " vs value = " + tempVal);
          }
          err = diff * diff;
          errSum += err;
          N += 1.0;
        }
        err = errSum / N;  // minimize the average squared error
        if (0 && firstTime) {
          console.log("err = " + err + " = " + errSum + " / " + N);
        }
        firstTime = 0;
        if (err < minErr) {
          minErr = err;
          bestA = a;
          bestB = b;
          bestC = c;
        }
      }
    }
  }
  a = bestA;
  b = bestB;
  c = bestC;

  if (printResultsToConsole) {
    minErr = Math.sqrt(minErr);  // compute the root-mean-square error
    console.log("  best " + whichPhase + " with error " + minErr);
    console.log("    A = " + a);
    console.log("    B = " + b);
    console.log("    C = " + c);
    for (idx = 0; idx < timeTempList.length; idx++) {
      timeVal = timeTempList[idx][0];
      tempVal = timeTempList[idx][1];
      beforePeak = 1;
      if (timeVal > peakTime) beforePeak = 0;
      if (whichPhase == "hotWater-heating" && beforePeak) {
        model = a * (1.0 - Math.exp(-1.0 * b * timeVal)) + c;
      } else if (whichPhase == "hotWater-cooling" && !beforePeak) {
        model = a * Math.exp(-1.0 * b * (timeVal-peakTime)) + c;
      } else {
        model = a * Math.exp(-1.0 * b * timeVal) + c;
      }
      diff = (model - tempVal);
      // console.log("  " + timeVal + " : " + tempVal.toFixed(3) +
      //             "'C, model = " + model.toFixed(3));
    }
  }

  return [a, b, c];
}

//------------------------------------------------------------------------------

function computePU(batchInfo, bIdx) {
  var allTimeTempList = [];
  var coolingModel = [];
  var coolTimeTempList = [];
  var datapointTime = 0.0;
  var dataRefTime = 0.0;
  var firstTime = 0.0;
  var heatOffTime = 0.0;
  var hotModelHeating = [];
  var hotModelCooling = [];
  var hotTimeTempList = [];
  var idx = 0;
  var lastHotTemp = 0.0;
  var minTemp = 0.0;
  var modelTemp = 0.0;
  var modelTimeTempList = [];
  var pasteurizationInfo = {};
  var peakTemp = 0;
  var peakTime = 0;
  var prevIdx = 0;
  var PU = 0.0;
  var PUperMinuteList = [];
  var referenceTime = 0.0;
  var rIdx = 0;
  var startTimeHHMM = "";
  var startTimeHrs = 0.0;
  var t = 0.0;
  var T_ref = 0.0;
  var tempVal = 0.0;
  var timeInc = 0.0;
  var totalPU = 0.0;
  var totalPUList = [];
  var Z = 0.0;

  console.log("-------- COMPUTING PU for batch " + Number(bIdx+1) + " -------");

  // initialize outputs
  pasteurizationInfo.PU = 0.0;
  pasteurizationInfo.hotTimeTempList = [];
  pasteurizationInfo.coolTimeTempList = [];
  pasteurizationInfo.modelTimeTempList = [];
  pasteurizationInfo.PUperMinuteList = [];
  pasteurizationInfo.totalPUList = [];
  pasteurizationInfo.maxTime = 0;
  pasteurizationInfo.plot = batchInfo.plot.value;
  pasteurizationInfo.heatOffTime = 0.0;
  pasteurizationInfo.startTimeHHMM = "";
  pasteurizationInfo.hotModelHeating = [];
  pasteurizationInfo.hotModelCooling = [];
  pasteurizationInfo.coolingModel = [];

  // get list of temperatures and times for heating (hotTimeTempList)
  // variables and their meanings:
  //   startTimeHrs = start time for this batch, in hours, floating point value
  //   firstTime    = time, in minutes, at which heating or cooling data begins
  //   heatOffTime  = data point time (offset by firstTime) at which
  //                  we switch from heating to cooling, in minutes
  //   lastHotTemp  = last recorded temperature from heating
  hotTimeTempList = [];
  startTimeHrs = -1.0;
  firstTime = -1.0;
  referenceTime = -1.0;
  heatOffTime = -1.0;
  if (batchInfo.xferHot.value >= 0) {
    firstTime = Number(batchInfo.xferHot.value * 60.0);
    referenceTime = Number(batchInfo.xferHot.value * 60.0);
    heatOffTime = 0.0;
  }
  lastHotTemp = -1.0;
  for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
    tempVal = Number(batchInfo.hot[rIdx].temp.value);
    if (Number(batchInfo.hot[rIdx].time.value) >= 0 && tempVal > 0) {
      if (firstTime < 0) {
        firstTime = Number(batchInfo.hot[rIdx].time.value * 60.0);
      }
      if (referenceTime < 0) {
        referenceTime = Number(batchInfo.hot[rIdx].time.value * 60.0);
      }
      datapointTime = (batchInfo.hot[rIdx].time.value * 60.0) - firstTime;
      hotTimeTempList.push([datapointTime, tempVal]);

      dataRefTime = (batchInfo.hot[rIdx].time.value * 60.0) - referenceTime;
      var timeTemp = { time:dataRefTime, temp:tempVal };
      allTimeTempList.push(timeTemp);

      heatOffTime = datapointTime;
      lastHotTemp = tempVal;
    }
  }

  // if no values in hot[], then ignore xferHot timing information
  if (hotTimeTempList.length == 0) {
    firstTime = -1;
    heatOffTime = -1;
  }

  // if firstTime is valid, save it in startTimeHrs
  if (firstTime >= 0) {
    startTimeHrs = Number(firstTime/60.0);
  }

  // find the peak time and temperature in the list of hot values
  peakTemp = -1;
  peakTime = -1;
  for (idx = 0; idx < hotTimeTempList.length; idx++) {
    if (hotTimeTempList[idx][1] > peakTemp) {
      peakTime = hotTimeTempList[idx][0];
      peakTemp = hotTimeTempList[idx][1];
    }
  }
  // if peak time is the last time in the list, set it to a very large number
  idx -= 1;
  if (idx >= 0 && peakTime == hotTimeTempList[idx][0]) {
    peakTime = 1.0e10;
  }
  if (peakTime != 1.0e10) {
    console.log("peak at " + peakTime + " min, with temp " + peakTemp);
  }

  // compute the model of heating temperature as a function of time,
  hotModelHeating = fitModel(hotTimeTempList, "hotWater-heating",
                             peakTime, peakTemp);
  if (peakTime != 1.0e10) {
    hotModelCooling = fitModel(hotTimeTempList, "hotWater-cooling",
                             peakTime, peakTemp);
  }

  // if xferCool time is set, adjust heatOffTime and/or firstTime,
  // and if startTimeHrs not yet set, set it to xfer time.
  if (batchInfo.xferCool.value >= 0) {
    if (firstTime >= 0) {
      heatOffTime = Number((batchInfo.xferCool.value * 60.0) - firstTime);
    } else {
      firstTime = Number(batchInfo.xferCool.value * 60.0);
      heatOffTime = 0.0;
    }
    if (startTimeHrs < 0) {
      startTimeHrs = Number(batchInfo.xferCool.value);
    }
  }

  // find the model temp. at the time when bottles are transferred for cooling
  modelTemp = -1.0;
  if (hotModelCooling.length == 3 && heatOffTime >= 0) {
    modelTemp = hotModelCooling[0] *
                Math.exp(-1.0*hotModelCooling[1]*(heatOffTime-peakTime)) +
                hotModelCooling[2];
  } else if (hotModelHeating.length == 3 && heatOffTime >= 0) {
    modelTemp = hotModelHeating[0] *
                (1.0-Math.exp(-1.0*hotModelHeating[1]*heatOffTime)) +
                hotModelHeating[2];
  }

  // If we have a heat-off time, add it to (valid) firstTime for cooling model,
  // essentially resetting firstTime to heatOffTime in hours.
  // (if heatOffTime is valid, we must also have a valid value for firstTime)
  // If there is no data or model for heating, then set up model for cooling
  if (heatOffTime >= 0) {
    firstTime += heatOffTime;
  } else {
    firstTime = -1;
    heatOffTime = -1;
  }

  // get list of temperatures and times for cooling (coolTimeTempList)

  // if we have a model, the first data point in the list of cooling temp is
  // the final time and temperature for the heating temperature model
  coolTimeTempList = [];
  if (modelTemp >= 0) {
    coolTimeTempList.push([0.0, modelTemp]);
  }

  // now add observed cooling times and temperatures to coolTimeTempList
  for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
    tempVal = Number(batchInfo.cool[rIdx].temp.value);
    if (Number(batchInfo.cool[rIdx].time.value) >= 0.0 && tempVal > 0.0) {
      if (firstTime < 0) {
        firstTime = Number(batchInfo.cool[rIdx].time.value * 60.0);
        heatOffTime = 0;
      }
      if (startTimeHrs < 0.0) {
        startTimeHrs = Number(batchInfo.cool[rIdx].time.value);
      }
      if (referenceTime < 0) {
        referenceTime = Number(batchInfo.hot[rIdx].time.value * 60.0);
      }
      datapointTime = (batchInfo.cool[rIdx].time.value * 60.0) - firstTime;
      coolTimeTempList.push([datapointTime, tempVal]);

      dataRefTime = (batchInfo.cool[rIdx].time.value * 60.0) - referenceTime;
      var timeTemp = { time:dataRefTime, temp:tempVal };
      allTimeTempList.push(timeTemp);
    }
  }

  // if no data points, return with no useful information
  if (hotTimeTempList.length == 0 && coolTimeTempList.length == 0) {
    return pasteurizationInfo;
  }

  // if we are not using the model, then sort the list of all times and temps
  allTimeTempList.sort(function(a,b) { return a.time - b.time; });

  // fit the cooling times and temperatures to a model
  coolingModel = fitModel(coolTimeTempList, "cooling", -1.0, -1.0);

  // compute model value of temperature at each minute and pasteurization units
  // based on this model, up to two hours
  totalPU = 0.0;
  Z = pasteurization.zValue.value;
  T_ref = pasteurization.refTemp.value;
  minTemp = pasteurization.minTemp.value;
  timeInc = 0.1;
  for (t = 0.0; t < 120; t = t + timeInc) {
    t = Number(t.toFixed(3));
    if (pasteurization.model.value == "smart") {
      if (hotModelCooling.length == 3 && t > peakTime && t <= heatOffTime) {
        modelTemp = hotModelCooling[0] *
                    Math.exp(-1.0*hotModelCooling[1]*(t-peakTime)) +
                    hotModelCooling[2];
      } else if (hotModelHeating.length == 3 && t <= heatOffTime) {
        modelTemp = hotModelHeating[0] *
                    (1.0 - Math.exp(-1.0*hotModelHeating[1]*t)) +
                    hotModelHeating[2];
      } else if (coolingModel.length == 3) {
        modelTemp =
          coolingModel[0] * Math.exp(-1.0*coolingModel[1]*(t-heatOffTime)) +
                            coolingModel[2];
      } else {
        continue;
      }
    } else {
      for (idx = 1; idx < allTimeTempList.length; idx++) {
        if (t <= Number(allTimeTempList[idx].time.toFixed(3))) {
          break;
        }
      }
      if (t < Number(allTimeTempList[0].time.toFixed(3)) ||
          idx >= allTimeTempList.length) {
        modelTemp = -1.0;
      } else {
        prevIdx = idx-1;
        modelTemp = mathLibrary.interpolate(allTimeTempList[prevIdx].time,
                    allTimeTempList[prevIdx].temp,
                    allTimeTempList[idx].time,
                    allTimeTempList[idx].temp, t);
      }
    }
    if (modelTemp > 20.0) {
      modelTimeTempList.push([t, modelTemp]);
    }

    if (modelTemp >= minTemp) {
      PU = Math.pow(10.0, (modelTemp-T_ref)/Z);
      totalPU += PU * timeInc;
      // print values, but only every minute
      if (Number.isInteger(t)) {
        console.log("t = " + t + " : temp = " + modelTemp.toFixed(3) +
                  "'C : PU = " + PU.toFixed(2));
      }
      PUperMinuteList.push([t, PU]);
      totalPUList.push([t, totalPU]);
    }
    if (t > heatOffTime && modelTemp < minTemp) {
      break;
    }
  }
  console.log("TOTAL PU: " + totalPU.toFixed(3));

  if (startTimeHrs >= 0.0) {
    startTimeHHMM = common.convertTimeToStr(startTimeHrs.toFixed(8),
            pasteurization.timeUnits.value, "");
  }

  // set final outputs
  pasteurizationInfo.PU = totalPU;
  pasteurizationInfo.hotTimeTempList = hotTimeTempList;
  pasteurizationInfo.coolTimeTempList = coolTimeTempList;
  pasteurizationInfo.modelTimeTempList = modelTimeTempList;
  pasteurizationInfo.PUperMinuteList = PUperMinuteList;
  pasteurizationInfo.totalPUList = totalPUList;
  pasteurizationInfo.heatOffTime = heatOffTime;
  pasteurizationInfo.startTimeHHMM = startTimeHHMM;
  pasteurizationInfo.maxTime = t;
  pasteurizationInfo.hotModelHeating = hotModelHeating;
  pasteurizationInfo.hotModelCooling = hotModelCooling;
  pasteurizationInfo.coolingModel = coolingModel;

  return pasteurizationInfo;
}

//==============================================================================
// PLOTTING FUNCTIONS

//------------------------------------------------------------------------------

function getXLabelStr(batchIdxList, PD) {
  var bIdx = 0;
  var xLabelStr = "";

  xLabelStr = "Time (minutes after ";
  for (bIdx = 0; bIdx < batchIdxList.length; bIdx++) {
    if (PD[bIdx].startTimeHHMM != "") {
      xLabelStr += PD[batchIdxList[bIdx]].startTimeHHMM;
      if (bIdx < batchIdxList.length-2) {
        xLabelStr += ", ";
      } else if (bIdx == batchIdxList.length-2) {
        if (batchIdxList.length == 2) {
          xLabelStr += " or ";
        } else {
          xLabelStr += ", or ";
        }
      }
    }
  }
  xLabelStr += ")";
  return xLabelStr;
}

//------------------------------------------------------------------------------

function plotTemperature(PD, numBatches) {
  var batchIdxList = [];
  var bIdx = 0;
  var canvas = {};
  var canvasName = "temp";
  var coolTime = 0.0;
  var ctx = {};
  var hue = 0;
  var idx = 0;
  var lastIdx = 0;
  var lineColor = "";
  var markColor = "";
  var maxTempValue = 0.0;
  var maxTimeValue = 0.0;
  var minTempValue = 0.0;
  var modelCoord = [];
  var plot = {};
  var symbol = "";
  var temp = 0.0;
  var tempCoord = [];
  var widthCoor = 0;
  var widthPx = 0;
  var xLabelStr = "";


  // initialize measured-temperature coordinates and model-temperature
  // coordinates for each batch
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    tempCoord.push([]);
    modelCoord.push([]);
  }

  // get the end time, and min and max temperature values
  minTempValue = 1.0e10;
  maxTempValue = 0.0;
  maxTimeValue = 0.0;
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    console.log(bIdx + " HEAT OFF at " + PD[bIdx].heatOffTime);
    // keep a list of the batch index values that we will plot
    if (PD[bIdx].hotTimeTempList.length > 0 ||
        PD[bIdx].coolTimeTempList.length > 0) {
      if (PD[bIdx].plot) {
        batchIdxList.push(bIdx);
      }
    }
    // check for the maximum time over all batches
    if (PD[bIdx].maxTime > maxTimeValue) {
      maxTimeValue = PD[bIdx].maxTime;
    }
    // add the times and temperatures during heating, get max/min temp values
    lastIdx = -1;
    for (idx = 0; idx < PD[bIdx].hotTimeTempList.length; idx++) {
      temp = PD[bIdx].hotTimeTempList[idx][1];
      if (temp < minTempValue) {
        minTempValue = temp;
      }
      if (temp > maxTempValue) {
        maxTempValue = temp;
      }
      if (pasteurization.units.value != "metric") {
        temp = common.convertCelsiusToFahrenheit(temp);
      }
      lastIdx = idx;
      tempCoord[bIdx].push([PD[bIdx].hotTimeTempList[idx][0], temp]);
    }
    // Add the time and temperatures during cooling.
    for (idx = 0; idx < PD[bIdx].coolTimeTempList.length; idx++) {
      // for the first point in coolTimeTempList, we do not want
      // to plot a marker if it's the same as the last value
      // and (actual) time in hotTimeTempList.
      if (idx == 0 && lastIdx >= 0) {
        if (PD[bIdx].coolTimeTempList[0][0] == 0.0) {
          continue;
        }
      }
      // the times for cooling need to be offset by heatOffTime for plotting
      coolTime = Number(PD[bIdx].coolTimeTempList[idx][0]) +
                 Number(PD[bIdx].heatOffTime);
      // add the times and temperatures during heating, get max/min temp values
      temp = PD[bIdx].coolTimeTempList[idx][1];
      if (temp < minTempValue) {
        minTempValue = temp;
      }
      if (temp > maxTempValue) {
        maxTempValue = temp;
      }
      if (pasteurization.units.value != "metric") {
        temp = common.convertCelsiusToFahrenheit(temp);
      }
      tempCoord[bIdx].push([coolTime, temp]);
    }

    // add the model values to the list of model coordinates, and
    // continue checking for min/max temperature values
    for (idx = 0; idx < PD[bIdx].modelTimeTempList.length; idx++) {
      temp = PD[bIdx].modelTimeTempList[idx][1];
      if (temp < minTempValue) {
        minTempValue = temp;
      }
      if (temp > maxTempValue) {
        maxTempValue = temp;
      }
      if (pasteurization.units.value != "metric") {
        temp = common.convertCelsiusToFahrenheit(temp);
      }
      modelCoord[bIdx].push([PD[bIdx].modelTimeTempList[idx][0], temp]);
    }
  }

  // if not metric, convert max and min temps
  if (pasteurization.units.value != "metric") {
    minTempValue = common.convertCelsiusToFahrenheit(minTempValue);
    maxTempValue = common.convertCelsiusToFahrenheit(maxTempValue);
  }

  // round minTempValue and maxTempValue, make sure extreme points not too close
  // to the plot boundary
  temp = Math.floor(minTempValue/5.0) * 5.0;
  if (minTempValue - temp < 2.0) {
    temp -= 5.0;
  }
  minTempValue = temp;
  temp = Math.ceil(maxTempValue/5.0) * 5.0;
  if (temp - maxTempValue < 2.0) {
    temp += 5.0;
  }
  maxTempValue = temp;

  // create and initialize the plot
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth * 0.93; // fit the plot to the window

  plot = createPlotObject();
  plot.title = "";
  plot.font = "16px Arial";
  plot.upperRightBoundsWidthPx = 0.5;

  xLabelStr = getXLabelStr(batchIdxList, PD);
  plot.xLabel = xLabelStr;

  plot.xMin = 0.0;
  plot.xMax = maxTimeValue;
  if (pasteurization.units.value == "metric") {
    plot.yLabel = "Temperature (°C)"
  } else {
    plot.yLabel = "Temperature (°F)"
  }
  plot.yMin = minTempValue;
  plot.yMax = maxTempValue;
  plot.yRotate = 0;

  plot.xMajor = 5.00;
  plot.xMinor = 1.00;
  plot.xPrecision = 0;
  plot.yMajor = 5.0;
  plot.yMinor = 2.5;
  plot.yPrecision = 0;
  createPlot(ctx, plot);

  plot.legend = [["temp0", "measured temperatures, batch #1"],
                 ["model0", "model temperatures, batch #1"],
                 ["temp1", "measured temperatures, batch #2"],
                 ["model1", "model temperatures, batch #2"],
                 ["temp2", "measured temperatures, batch #3"],
                 ["model2", "model temperatures, batch #3"],
                 ["temp3", "measured temperatures, batch #4"],
                 ["model3", "model temperatures, batch #4"],
                 ["temp4", "measured temperatures, batch #5"],
                 ["model4", "model temperatures, batch #5"]];
  // position the legend so that the end of the text is 20 px from right edge
  widthPx = ctx.measureText(plot.legend[0]).width + 20;
  widthCoor = unmapX(plot, widthPx);
  plot.legendPosition = [maxTimeValue-widthCoor, maxTempValue * 1.0];
  plot.legendBorderPx = 0;


  // plot the data
  symbol = "";
  hue = 0;
  for (bIdx = 0; bIdx < batchIdxList.length; bIdx++) {
    if (batchIdxList[bIdx] == 0) { symbol = "filledCircle"; }
    if (batchIdxList[bIdx] == 1) { symbol = "X"; }
    if (batchIdxList[bIdx] == 2) { symbol = "openSquare"; }
    if (batchIdxList[bIdx] == 3) { symbol = "asterix"; }
    if (batchIdxList[bIdx] == 4) { symbol = "filledTriangle"; }
    if (batchIdxList[bIdx] > 4)  { symbol = "openCircle"; }
    // for HSL, hue : 0 = red, 120 = green, 240 = blue.  We shift by
    // 72 to get five equally-spaced colors. Offset by 20 for aesthetics.
    hue = (batchIdxList[bIdx] * 72) + 20;
    markColor = "hsl(" + hue + " 100% 35)";
    lineColor = "hsl(" + hue + " 100% 35)";
    plotLinearData(ctx, plot, "temp"+batchIdxList[bIdx],
                   tempCoord[batchIdxList[bIdx]],
                   "none", symbol, markColor, 6, 1.0);
    plotLinearData(ctx, plot, "model"+batchIdxList[bIdx],
                   modelCoord[batchIdxList[bIdx]],
                   "solid", "none", lineColor, 0, 1.0);
  }

  plotUpdate(ctx, plot, [], []);

  return;
}

//------------------------------------------------------------------------------

function plotPUperMinute(PD, numBatches) {
  var batchIdxList = [];
  var bIdx = 0;
  var canvas = {};
  var canvasName = "PUperMinute";
  var ctx = {};
  var hue = 0;
  var idx = 0;
  var lineColor = "";
  var maxPUValue = 0.0;
  var maxTime = 0.0;
  var minPUValue = 0.0;
  var plot = {};
  var PU = 0.0;
  var tempCoord = [];
  var time = 0.0;
  var widthCoor = 0;
  var widthPx = 0;
  var xLabelStr = "";

  // keep a list of the batch index values that we will plot, and
  // get the max PU value over all time points and batches, and max time
  minPUValue = 0.0;
  maxPUValue = 0.0;
  maxTime = 0.0;
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (PD[bIdx].hotTimeTempList.length > 0 ||
        PD[bIdx].coolTimeTempList.length > 0) {
      if (PD[bIdx].plot) {
        batchIdxList.push(bIdx);
      }
    }
    for (idx = 0; idx < PD[bIdx].PUperMinuteList.length; idx++) {
      time = PD[bIdx].PUperMinuteList[idx][0];
      PU = PD[bIdx].PUperMinuteList[idx][1];
      if (PU > maxPUValue) {
        maxPUValue = PU;
      }
      if (time > maxTime) {
        maxTime = time;
      }
    }
  }

  // round maxPUValue, make sure extreme points not too close to plot boundary
  PU = Math.ceil(maxPUValue/5.0) * 5.0;
  if (PU - maxPUValue < 2.0) {
    PU += 5.0;
  }
  maxPUValue = PU;

  // create and initialize the plot
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth * 0.93; // fit the plot to the window

  plot = createPlotObject();
  plot.title = "";
  plot.font = "16px Arial";
  plot.upperRightBoundsWidthPx = 0.5;

  xLabelStr = getXLabelStr(batchIdxList, PD);
  plot.xLabel = xLabelStr;

  plot.xMin = 0.0;
  plot.xMax = maxTime;
  plot.yLabel = "Pasteurization Units per minute"
  plot.yMin = minPUValue;
  plot.yMax = maxPUValue;
  plot.yRotate = 0;

  plot.xMajor = 5.00;
  plot.xMinor = 1.00;
  plot.xPrecision = 0;
  plot.yMajor = 5.0;
  plot.yMinor = 2.5;
  plot.yPrecision = 0;

  createPlot(ctx, plot);

  plot.legend = [["pu0", "PU/min, batch #1"],
                 ["pu1", "PU/min, batch #2"],
                 ["pu2", "PU/min, batch #3"],
                 ["pu3", "PU/min, batch #4"],
                 ["pu4", "PU/min, batch #5"]]
  // position the legend so that the end of the text is 40 px from right edge
  widthPx = ctx.measureText(plot.legend[0]).width + 40;
  widthCoor = unmapX(plot, widthPx);
  plot.legendPosition = [maxTime-widthCoor, maxPUValue * 0.95];
  plot.legendBorderPx = 0;

  // plot the data
  for (bIdx = 0; bIdx < batchIdxList.length; bIdx++) {
    // for HSL, hue : 0 = red, 120 = green, 240 = blue.  We shift by
    // 72 to get five equally-spaced colors. Offset by 20 for aesthetics.
    hue = (batchIdxList[bIdx] * 72) + 20;
    lineColor = "hsl(" + hue + " 100% 35";
    plotLinearData(ctx, plot, "pu"+batchIdxList[bIdx],
                   PD[batchIdxList[bIdx]].PUperMinuteList,
                   "solid", "none", lineColor, 0, 1.0);
  }

  plotUpdate(ctx, plot, [], []);

  return;
}

//------------------------------------------------------------------------------

function plotTotalPU(PD, numBatches) {
  var batchIdxList = [];
  var bIdx = 0;
  var canvas = {};
  var canvasName = "totalPU";
  var ctx = {};
  var hue = 0;
  var idx = 0;
  var lineColor = "";
  var minPUValue = 0.0;
  var maxPUValue = 0.0;
  var maxPUValue = 0.0;
  var maxTime = 0.0;
  var plot = {};
  var PU = 0.0;
  var tempCoord = [];
  var time = 0.0;
  var widthPx = 0;
  var widthCoor = 0;
  var xLabelStr = "";

  // keep a list of the batch index values that we will plot, and
  // get the max PU value over all time points and batches, and max time
  minPUValue = 0.0;
  maxPUValue = 0.0;
  maxTime = 0.0;
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (PD[bIdx].hotTimeTempList.length > 0 ||
        PD[bIdx].coolTimeTempList.length > 0) {
      if (PD[bIdx].plot) {
        batchIdxList.push(bIdx);
      }
    }
    for (idx = 0; idx < PD[bIdx].totalPUList.length; idx++) {
      time = PD[bIdx].totalPUList[idx][0];
      PU = PD[bIdx].totalPUList[idx][1];
      if (PU > maxPUValue) {
        maxPUValue = PU;
      }
      if (time > maxTime) {
        maxTime = time;
      }
    }
  }

  // round maxPUValue, make sure extreme points not too close to plot boundary
  PU = Math.ceil(maxPUValue/5.0) * 5.0;
  if (PU - maxPUValue < 2.0) {
    PU += 5.0;
  }
  maxPUValue = PU;

  // create and initialize the plot
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth * 0.93; // fit the plot to the window

  plot = createPlotObject();
  plot.title = "";
  plot.font = "16px Arial";
  plot.upperRightBoundsWidthPx = 0.5;

  xLabelStr = "Time (minutes after ";
  for (bIdx = 0; bIdx < batchIdxList.length; bIdx++) {
    if (PD[bIdx].startTimeHHMM != "") {
      xLabelStr += PD[batchIdxList[bIdx]].startTimeHHMM;
      if (bIdx < batchIdxList.length-2) {
        xLabelStr += ", ";
      } else if (bIdx == batchIdxList.length-2) {
        if (batchIdxList.length == 2) {
          xLabelStr += " or ";
        } else {
          xLabelStr += ", or ";
        }
      }
    }
  }
  xLabelStr += ")";
  plot.xLabel = xLabelStr;

  plot.xMin = 0.0;
  plot.xMax = maxTime;
  plot.yLabel = "Total Pasteurization Units"
  plot.yMin = minPUValue;
  plot.yMax = maxPUValue;
  plot.yRotate = 0;

  plot.xMajor = 5.00;
  plot.xMinor = 1.00;
  plot.xPrecision = 0;
  plot.yMajor = 50.0;
  plot.yMinor = 10.0;
  plot.yPrecision = 0;

  createPlot(ctx, plot);

  plot.legend = [["pu0", "total PU, batch #1"],
                 ["pu1", "total PU, batch #2"],
                 ["pu2", "total PU, batch #3"],
                 ["pu3", "total PU, batch #4"],
                 ["pu4", "total PU, batch #5"]]
  // position the legend so that the end of the text is 40 px from right edge
  widthPx = ctx.measureText(plot.legend[0]).width + 40;
  widthCoor = unmapX(plot, widthPx);
  plot.legendPosition = [maxTime-widthCoor, maxPUValue * 0.3];
  plot.legendBorderPx = 0;

  // plot the data
  for (bIdx = 0; bIdx < batchIdxList.length; bIdx++) {
    // for HSL, hue : 0 = red, 120 = green, 240 = blue.  We shift by
    // 72 to get five equally-spaced colors. Offset by 20 for aesthetics.
    hue = (batchIdxList[bIdx] * 72) + 20;
    lineColor = "hsl(" + hue + " 100% 35";
    plotLinearData(ctx, plot, "pu"+batchIdxList[bIdx],
                   PD[batchIdxList[bIdx]].totalPUList,
                   "solid", "none", lineColor, 0, 1.0);
  }

  plotUpdate(ctx, plot, [], []);

  return;
}

//==============================================================================

// update all information: compute and display the rows in the table,
// and compute and display Pasteurization Units.

this.updateAll = function(changeID) {
  var batchIdx = 0;
  var bIdx = 0;
  var checked = "";
  var firstTime = 0.0;
  var lastTime = 0.0;
  var maxCoolRows = -1;
  var maxHotRows = -1;
  var maxWarmRows = 0;
  var numBatches = pasteurization.numBatches.value;
  var oneRow = "";
  var pasteurizationData = [];
  var prevTimeEntry = {};
  var prevTempEntry = {};
  var nextTimeEntry = {};
  var nextTempEntry = {};
  var rIdx = 0;
  var row = 0;
  var tIdx = 0;

  if (pasteurization.verbose > 0) {
    if (!changeID) {
      console.log("============== Updating ALL ====================");
    } else {
      console.log("============== " + changeID + " ====================");
    }
  }

  // find the first entered time
  firstTime = 1.0e10;
  if (pasteurization.startTime.value > 0.0) {
    firstTime = Number(pasteurization.startTime.value);
  }
  if (firstTime == 1.0e10 && pasteurization.heatWaterTime.value > 0.0) {
    firstTime = Number(pasteurization.heatWaterTime.value);
  }
  if (firstTime == 1.0e10) {
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (pasteurization.batchInfo[bIdx].xferWarm.value < firstTime) {
        firstTime = Number(pasteurization.batchInfo[bIdx].xferWarm.value);
      }
      for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
        if (pasteurization.batchInfo[bIdx].warm[rIdx].time.value < firstTime) {
          firstTime =
              Number(pasteurization.batchInfo[bIdx].warm[rIdx].time.value);
        }
      }
      if (pasteurization.batchInfo[bIdx].xferHot.value < firstTime) {
        firstTime = Number(pasteurization.batchInfo[bIdx].xferHot.value);
      }
      for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
        if (pasteurization.batchInfo[bIdx].hot[rIdx].time.value < firstTime) {
          firstTime =
              Number(pasteurization.batchInfo[bIdx].hot[rIdx].time.value);
        }
      }
      if (pasteurization.batchInfo[bIdx].xferCool.value < firstTime) {
        firstTime = Number(pasteurization.batchInfo[bIdx].xferCool.value);
      }
      for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
        if (pasteurization.batchInfo[bIdx].cool[rIdx].time.value < firstTime) {
          firstTime =
              Number(pasteurization.batchInfo[bIdx].cool[rIdx].time.value);
        }
      }
    }
  }
  if (firstTime == 1.0e10) {
    firstTime = -1.0;
  }

  // find the last entered time, and set finishTimes's previous entry
  // to this last time input.
  lastTime = -1.0;
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (pasteurization.batchInfo[bIdx]) {
      if (pasteurization.batchInfo[bIdx].xferWarm.value > lastTime) {
        lastTime = Number(pasteurization.batchInfo[bIdx].xferWarm.value);
        pasteurization.finishTime.previousEntry =
            pasteurization.batchInfo[bIdx].xferWarm;
      }
      for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
        if (pasteurization.batchInfo[bIdx].warm[rIdx].time.value > lastTime) {
          lastTime =
              Number(pasteurization.batchInfo[bIdx].warm[rIdx].time.value);
          pasteurization.finishTime.previousEntry =
              pasteurization.batchInfo[bIdx].warm[rIdx].time;
        }
      }
      if (pasteurization.batchInfo[bIdx].xferHot.value > lastTime) {
        lastTime = Number(pasteurization.batchInfo[bIdx].xferHot.value);
        pasteurization.finishTime.previousEntry =
            pasteurization.batchInfo[bIdx].xferHot;
      }
      for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
        if (pasteurization.batchInfo[bIdx].hot[rIdx].time.value > lastTime) {
          lastTime =
              Number(pasteurization.batchInfo[bIdx].hot[rIdx].time.value);
          pasteurization.finishTime.previousEntry =
              pasteurization.batchInfo[bIdx].hot[rIdx].time;
        }
      }
      if (pasteurization.batchInfo[bIdx].xferCool.value > lastTime) {
        lastTime = Number(pasteurization.batchInfo[bIdx].xferCool.value);
        pasteurization.finishTime.previousEntry =
            pasteurization.batchInfo[bIdx].xferCool;
      }
      for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
        if (pasteurization.batchInfo[bIdx].cool[rIdx].time.value > lastTime) {
          lastTime =
              Number(pasteurization.batchInfo[bIdx].cool[rIdx].time.value);
          pasteurization.finishTime.previousEntry =
              pasteurization.batchInfo[bIdx].cool[rIdx].time;
        }
      }
    }
  }
  if (pasteurization.finishTime.value > lastTime) {
    lastTime = Number(pasteurization.finishTime.value);
  }
  if (lastTime < 0 && pasteurization.heatWaterTime.value > 0.0) {
    lastTime = pasteurization.heatWaterTime.value;
  }
  console.log("LAST TIME = " + lastTime);

  // compute total duration between first time and last time.
  // make this variable available outside of this function.
  if (firstTime >= 0.0 && lastTime >= 0.0) {
    pasteurization.duration = lastTime - firstTime;
    pasteurization.durationH = Math.floor(pasteurization.duration);
    pasteurization.durationM =
        Math.round((pasteurization.duration - pasteurization.durationH) * 60.0);
  }


  // create HTML of each row in the table, one column per batch
  // row 1: headers
  oneRow = "";
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    oneRow += "<td><b>Batch #" + Number(bIdx+1) + "</b></td> ";
  }
  document.getElementById("batchRow0").innerHTML = oneRow;
  document.getElementById("batchRow0").style.display = "table-row";

  // row 2: number of bottles per batch
  oneRow = "";
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    oneRow += "<td>bottles: <input type=\"text\" style=\"width:2.25em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].numBottles\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].numBottles, 1)\"><small> +1 (meas)</small></td> ";
  }
  document.getElementById("batchRow1").innerHTML = oneRow;
  document.getElementById("batchRow1").style.display = "table-row";

  // row 3: "warm water temp:"
  oneRow = "";
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    oneRow += "<td>warm water temp:</td> ";
  }
  document.getElementById("batchRow2").innerHTML = oneRow;
  document.getElementById("batchRow2").style.display = "table-row";

  // row 4: either "when add" for batch #1 or "pre mix" for other batches
  oneRow = "";
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (bIdx == 0) {
      oneRow += "<td>&nbsp;&nbsp;when add: <input type=\"text\" style=\"width:3em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].postMix\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].postMix, 1)\"><span class='pasteurization.TUnits'>X<span></td> ";
    } else {
      oneRow += "<td>&nbsp;&nbsp;pre mix: <input type=\"text\" style=\"width:3em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].preMixBoil\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].preMixBoil, 1)\"><span class='pasteurization.TUnits'>X</span></td> ";
    }
  }
  document.getElementById("batchRow3").innerHTML = oneRow;
  document.getElementById("batchRow3").style.display = "table-row";

  // row 5: either blank for batch #1 or "post mix" for other batches
  oneRow = "";
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (bIdx == 0) {
      oneRow += "<td></td> ";
    } else {
      oneRow += "<td>&nbsp;&nbsp;post mix: <input type=\"text\" style=\"width:3em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].postMix\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].postMix, 1)\"><span class='pasteurization.TUnits'>X</span></td> ";
    }
  }
  document.getElementById("batchRow4").innerHTML = oneRow;
  document.getElementById("batchRow4").style.display = "table-row";

  // row 6: time when transfer to warm water
  oneRow = "";
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    oneRow += "<td>xfer to warm: <input type=\"text\" style=\"width:4.2em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].xferWarm\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].xferWarm, 1)\" placeholder=\"--:--\"></td> ";
  }
  document.getElementById("batchRow5").innerHTML = oneRow;
  document.getElementById("batchRow5").style.display = "table-row";

  // create list of rows for warm time and temp; first find number of rows
  maxWarmRows = -1;
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (pasteurization.batchInfo[bIdx]) {
      for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
        if (rIdx > maxWarmRows &&
          pasteurization.batchInfo[bIdx].warm[rIdx].time.value > 0.0) {
          // console.log("  found " +
              // pasteurization.batchInfo[bIdx].warm[rIdx].time.value);
          maxWarmRows = rIdx;
        }
      }
    }
  }
  // if the last possible entry is filled, we can't make a new entry, so adjust
  if (maxWarmRows == pasteurization.maxWHCTimes - 1) {
    maxWarmRows = pasteurization.maxWHCTimes - 2;
  }
  // create rows of times and temperatures for warming
  row = 6;
  for (rIdx = 0; rIdx <= maxWarmRows + 1; rIdx++) {
    oneRow = "";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      oneRow += "<td>"
      oneRow += "&nbsp;&nbsp;<input type=\"text\" style=\"width:4.2em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].warm["+rIdx+"].time\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].warm["+rIdx+"].time, 1)\" placeholder=\"--:--\">";
      oneRow += " = ";
      oneRow += "<input type=\"text\" style=\"width:3.5em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].warm["+rIdx+"].temp\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].warm["+rIdx+"].temp, 1)\">";
      oneRow += "<span class='pasteurization.TUnits'>X</span>";
      oneRow += "</td> ";
    }
    document.getElementById("batchRow"+row).innerHTML = oneRow;
    document.getElementById("batchRow"+row).style.display = "table-row";
    row += 1;
  }

  // create row for time when transfer to hot water
  oneRow = "";
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    oneRow += "<td>xfer to hot: <input type=\"text\" style=\"width:4.2em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].xferHot\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].xferHot, 1)\" placeholder=\"--:--\"></td> ";
  }
  document.getElementById("batchRow"+row).innerHTML = oneRow;
  document.getElementById("batchRow"+row).style.display = "table-row";
  row += 1;

  // create list of rows for hot time and temp; first find number of rows
  maxHotRows = -1;
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (pasteurization.batchInfo[bIdx]) {
      for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
        if (rIdx > maxHotRows &&
          pasteurization.batchInfo[bIdx].hot[rIdx].time.value > 0.0) {
          maxHotRows = rIdx;
        }
      }
    }
  }
  // if the last entry is filled, we can't make a new entry, so adjust limit
  if (maxHotRows == pasteurization.maxWHCTimes - 1) {
    maxHotRows = pasteurization.maxWHCTimes - 2;
  }
  // create rows of times and temperatures for heating
  for (rIdx = 0; rIdx <= maxHotRows + 1; rIdx++) {
    oneRow = "";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      oneRow += "<td>"
      oneRow += "&nbsp;&nbsp;<input type=\"text\" style=\"width:4.2em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].hot["+rIdx+"].time\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].hot["+rIdx+"].time, 1)\" placeholder=\"--:--\">";
      oneRow += " = ";
      oneRow += "<input type=\"text\" style=\"width:3.5em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].hot["+rIdx+"].temp\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].hot["+rIdx+"].temp, 1)\">";
      oneRow += "<span class='pasteurization.TUnits'>X</span>";
      oneRow += "</td> ";
    }
    document.getElementById("batchRow"+row).innerHTML = oneRow;
    document.getElementById("batchRow"+row).style.display = "table-row";
    row += 1;
  }

  // create row for time when transfer to cool air
  oneRow = "";
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    oneRow += "<td>xfer to cool: <input type=\"text\" style=\"width:4.2em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].xferCool\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].xferCool, 1)\" placeholder=\"--:--\"></td> ";
  }
  document.getElementById("batchRow"+row).innerHTML = oneRow;
  document.getElementById("batchRow"+row).style.display = "table-row";
  row += 1;

  // create list of rows for cool time and temp; first find number of rows
  maxCoolRows = -1;
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (pasteurization.batchInfo[bIdx]) {
      for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
        if (rIdx > maxCoolRows &&
          pasteurization.batchInfo[bIdx].cool[rIdx].time.value > 0.0) {
          maxCoolRows = rIdx;
        }
      }
    }
  }
  // if the last entry is filled, we can't make a new entry, so adjust limit
  if (maxCoolRows == pasteurization.maxWHCTimes - 1) {
    maxCoolRows = pasteurization.maxWHCTimes - 2;
  }
  // create rows of times and temperatures for cooling
  for (rIdx = 0; rIdx <= maxCoolRows + 1; rIdx++) {
    oneRow = "";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      oneRow += "<td>"
      oneRow += "&nbsp;&nbsp;<input type=\"text\" style=\"width:4.2em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].cool["+rIdx+"].time\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].cool["+rIdx+"].time, 1)\" placeholder=\"--:--\">";
      oneRow += " = ";
      oneRow += "<input type=\"text\" style=\"width:3.5em;text-align:center\" id=\"pasteurization.batchInfo["+bIdx+"].cool["+rIdx+"].temp\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].cool["+rIdx+"].temp, 1)\">";
      oneRow += "<span class='pasteurization.TUnits'>X</span>";
      oneRow += "</td> ";
    }
    document.getElementById("batchRow"+row).innerHTML = oneRow;
    document.getElementById("batchRow"+row).style.display = "table-row";
    row += 1;
  }

  // create a row that shows total computed Pasteurization Units
  oneRow = "";
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    oneRow += "<td><b>Total PU: &nbsp;<span id=\"totalPU"+Number(bIdx+1)+"\">N/A</span></b></td> ";
  }
  document.getElementById("batchRow"+row).innerHTML = oneRow;
  document.getElementById("batchRow"+row).style.display = "table-row";
  row += 1;

  // create a row of checkboxes to plot or not plot each batch
  oneRow = "";
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (pasteurization.batchInfo[bIdx].plot.value) {
      checked = " checked";
    } else {
      checked = "";
    }
    oneRow += "<td>Plot:<input type=\"checkbox\" id=\"pasteurization.batchInfo["+bIdx+"].plot\" onchange=\"common.set(pasteurization.batchInfo["+bIdx+"].plot, 1)\""+checked+"></td> ";
  }
  document.getElementById("batchRow"+row).innerHTML = oneRow;
  document.getElementById("batchRow"+row).style.display = "table-row";
  row += 1;


  // update the temperature units in the new HTML
  setUnits();


  // change HTML to show total duration
  if (document.getElementById("pasteurization.totalHours")) {
    if (!pasteurization.durationH) {
      document.getElementById("pasteurization.totalHours").innerHTML =
        "N/A";
    } else if (pasteurization.durationH != 1) {
      document.getElementById("pasteurization.totalHours").innerHTML =
         pasteurization.durationH + " hours and";
    } else {
      document.getElementById("pasteurization.totalHours").innerHTML =
         pasteurization.durationH + " hour and";
    }
  }
  if (document.getElementById("pasteurization.totalMinutes")) {
    if (!pasteurization.durationM) {
      document.getElementById("pasteurization.totalMinutes").innerHTML = "";
    } else if (pasteurization.durationM != 1) {
      document.getElementById("pasteurization.totalMinutes").innerHTML =
        pasteurization.durationM + " minutes";
    } else {
      document.getElementById("pasteurization.totalMinutes").innerHTML =
        pasteurization.durationM + " minute";
    }
  }

  // now update the variables in the new HTML
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (pasteurization.batchInfo[bIdx]) {
      common.updateHTML(pasteurization.batchInfo[bIdx].numBottles, 0);
      common.updateHTML(pasteurization.batchInfo[bIdx].preMixBoil, 0);
      common.updateHTML(pasteurization.batchInfo[bIdx].postMix, 0);
      common.updateHTML(pasteurization.batchInfo[bIdx].xferWarm, 0);
      common.updateHTML(pasteurization.batchInfo[bIdx].xferHot, 0);
      common.updateHTML(pasteurization.batchInfo[bIdx].xferCool, 0);
    }
  }
  for (rIdx = 0; rIdx <= maxWarmRows + 1; rIdx++) {
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (pasteurization.batchInfo[bIdx]) {
        common.updateHTML(pasteurization.batchInfo[bIdx].warm[rIdx].time, 0);
        common.updateHTML(pasteurization.batchInfo[bIdx].warm[rIdx].temp, 0);
      }
    }
  }
  for (rIdx = 0; rIdx <= maxHotRows + 1; rIdx++) {
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (pasteurization.batchInfo[bIdx]) {
        common.updateHTML(pasteurization.batchInfo[bIdx].hot[rIdx].time, 0);
        common.updateHTML(pasteurization.batchInfo[bIdx].hot[rIdx].temp, 0);
      }
    }
  }
  for (rIdx = 0; rIdx <= maxCoolRows + 1; rIdx++) {
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (pasteurization.batchInfo[bIdx]) {
        common.updateHTML(pasteurization.batchInfo[bIdx].cool[rIdx].time, 0);
        common.updateHTML(pasteurization.batchInfo[bIdx].cool[rIdx].temp, 0);
      }
    }
  }

  // set previous and next focus for batch-related information.
  // must do this dynamically because number of rows changes.
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (bIdx == 0) {
      pasteurization.batchInfo[bIdx].numBottles.prevFocus =
          pasteurization.DValue.id;
      pasteurization.batchInfo[bIdx].numBottles.nextFocus =
          pasteurization.batchInfo[bIdx].postMix.id;
    } else {
      pasteurization.batchInfo[bIdx].numBottles.prevFocus =
          pasteurization.batchInfo[bIdx-1].cool[maxCoolRows+1].time.id;
      pasteurization.batchInfo[bIdx].numBottles.nextFocus =
          pasteurization.batchInfo[bIdx].preMixBoil.id;
    }

    pasteurization.batchInfo[bIdx].preMixBoil.prevFocus =
        pasteurization.batchInfo[bIdx].numBottles.id;
    pasteurization.batchInfo[bIdx].preMixBoil.nextFocus =
        pasteurization.batchInfo[bIdx].postMix.id;

    pasteurization.batchInfo[bIdx].postMix.prevFocus =
        pasteurization.batchInfo[bIdx].preMixBoil.id;
    pasteurization.batchInfo[bIdx].postMix.nextFocus =
        pasteurization.batchInfo[bIdx].xferWarm.id;
    if (bIdx == 0) {
      pasteurization.batchInfo[bIdx].postMix.prevFocus =
          pasteurization.batchInfo[bIdx].numBottles.id;
    }

    pasteurization.batchInfo[bIdx].xferWarm.prevFocus =
        pasteurization.batchInfo[bIdx].postMix.id;
    pasteurization.batchInfo[bIdx].xferWarm.nextFocus =
        pasteurization.batchInfo[bIdx].warm[0].time.id;

    pasteurization.batchInfo[bIdx].xferHot.prevFocus =
        pasteurization.batchInfo[bIdx].warm[maxWarmRows+1].time.id;
    pasteurization.batchInfo[bIdx].xferHot.nextFocus =
        pasteurization.batchInfo[bIdx].hot[0].time.id;

    pasteurization.batchInfo[bIdx].xferCool.prevFocus =
        pasteurization.batchInfo[bIdx].hot[maxHotRows+1].time.id;
    pasteurization.batchInfo[bIdx].xferCool.nextFocus =
        pasteurization.batchInfo[bIdx].cool[0].time.id;

    for (rIdx = 0; rIdx < pasteurization.maxWHCTimes-1; rIdx++) {
      if (rIdx == 0) {
        // prevEntry = pasteurization.batchInfo[bIdx].xferWarm;
        prevTimeEntry = pasteurization.batchInfo[bIdx].xferWarm;
        prevTempEntry = pasteurization.batchInfo[bIdx].xferWarm;
      } else {
        // prevEntry = pasteurization.batchInfo[bIdx].warm[rIdx-1].temp;
        prevTimeEntry = pasteurization.batchInfo[bIdx].warm[rIdx-1].time;
        prevTempEntry = pasteurization.batchInfo[bIdx].warm[rIdx-1].temp;
      }
      // nextEntry = pasteurization.batchInfo[bIdx].warm[rIdx+1].time;
      nextTimeEntry = pasteurization.batchInfo[bIdx].warm[rIdx+1].time;
      nextTempEntry = pasteurization.batchInfo[bIdx].warm[rIdx+1].temp;
      if (rIdx == maxWarmRows + 1) {
        // nextEntry = pasteurization.batchInfo[bIdx].xferHot;
        nextTimeEntry = pasteurization.batchInfo[bIdx].xferHot;
        nextTempEntry = pasteurization.batchInfo[bIdx].xferHot;
      }
      pasteurization.batchInfo[bIdx].warm[rIdx].time.upFocus =
          prevTimeEntry.id;
      pasteurization.batchInfo[bIdx].warm[rIdx].time.prevFocus =
          prevTempEntry.id;
      pasteurization.batchInfo[bIdx].warm[rIdx].time.nextFocus =
          pasteurization.batchInfo[bIdx].warm[rIdx].temp.id;
      pasteurization.batchInfo[bIdx].warm[rIdx].time.downFocus =
          nextTimeEntry.id;

      pasteurization.batchInfo[bIdx].warm[rIdx].temp.upFocus =
          prevTempEntry.id;
      pasteurization.batchInfo[bIdx].warm[rIdx].temp.prevFocus =
          pasteurization.batchInfo[bIdx].warm[rIdx].time.id;
      pasteurization.batchInfo[bIdx].warm[rIdx].temp.nextFocus =
          nextTimeEntry.id;
      pasteurization.batchInfo[bIdx].warm[rIdx].temp.downFocus =
          nextTempEntry.id;

      if (rIdx == 0) {
        // prevEntry = pasteurization.batchInfo[bIdx].xferHot;
        prevTimeEntry = pasteurization.batchInfo[bIdx].xferHot;
        prevTempEntry = pasteurization.batchInfo[bIdx].xferHot;
      } else {
        // prevEntry = pasteurization.batchInfo[bIdx].hot[rIdx-1].temp;
        prevTimeEntry = pasteurization.batchInfo[bIdx].hot[rIdx-1].time;
        prevTempEntry = pasteurization.batchInfo[bIdx].hot[rIdx-1].temp;
      }
      // nextEntry = pasteurization.batchInfo[bIdx].hot[rIdx+1].time;
      nextTimeEntry = pasteurization.batchInfo[bIdx].hot[rIdx+1].time;
      nextTempEntry = pasteurization.batchInfo[bIdx].hot[rIdx+1].temp;
      if (rIdx == maxHotRows + 1) {
        // nextEntry = pasteurization.batchInfo[bIdx].xferCool;
        nextTimeEntry = pasteurization.batchInfo[bIdx].xferCool;
        nextTempEntry = pasteurization.batchInfo[bIdx].xferCool;
      }
      pasteurization.batchInfo[bIdx].hot[rIdx].time.upFocus =
          prevTimeEntry.id;
      pasteurization.batchInfo[bIdx].hot[rIdx].time.prevFocus =
          prevTempEntry.id;
      pasteurization.batchInfo[bIdx].hot[rIdx].time.nextFocus =
          pasteurization.batchInfo[bIdx].hot[rIdx].temp.id;
      pasteurization.batchInfo[bIdx].hot[rIdx].time.downFocus =
          nextTimeEntry.id;

      pasteurization.batchInfo[bIdx].hot[rIdx].temp.upFocus =
          prevTempEntry.id;
      pasteurization.batchInfo[bIdx].hot[rIdx].temp.prevFocus =
          pasteurization.batchInfo[bIdx].hot[rIdx].time.id;
      pasteurization.batchInfo[bIdx].hot[rIdx].temp.nextFocus =
          nextTimeEntry.id;
      pasteurization.batchInfo[bIdx].hot[rIdx].temp.downFocus =
          nextTempEntry.id;

      if (rIdx == 0) {
        // prevEntry = pasteurization.batchInfo[bIdx].xferCool;
        prevTimeEntry = pasteurization.batchInfo[bIdx].xferCool;
        prevTempEntry = pasteurization.batchInfo[bIdx].xferCool;
      } else {
        // prevEntry = pasteurization.batchInfo[bIdx].cool[rIdx-1].temp;
        prevTimeEntry = pasteurization.batchInfo[bIdx].cool[rIdx-1].time;
        prevTempEntry = pasteurization.batchInfo[bIdx].cool[rIdx-1].temp;
      }
      // nextEntry = pasteurization.batchInfo[bIdx].cool[rIdx+1].time;
      nextTimeEntry = pasteurization.batchInfo[bIdx].cool[rIdx+1].time;
      nextTempEntry = pasteurization.batchInfo[bIdx].cool[rIdx+1].temp;
      if (rIdx == maxCoolRows + 1) {
        if (bIdx < numBatches-1) {
          nextTimeEntry = pasteurization.batchInfo[bIdx+1].numBottles;
          nextTempEntry = pasteurization.batchInfo[bIdx+1].numBottles;
        } else {
          nextTimeEntry = pasteurization.finishTime;
          nextTempEntry = pasteurization.finishTime;
        }
      }
      pasteurization.batchInfo[bIdx].cool[rIdx].time.upFocus =
          prevTimeEntry.id;
      pasteurization.batchInfo[bIdx].cool[rIdx].time.prevFocus =
          prevTempEntry.id;
      pasteurization.batchInfo[bIdx].cool[rIdx].time.nextFocus =
          pasteurization.batchInfo[bIdx].cool[rIdx].temp.id;
      pasteurization.batchInfo[bIdx].cool[rIdx].time.downFocus =
          nextTimeEntry.id;

      pasteurization.batchInfo[bIdx].cool[rIdx].temp.upFocus =
          prevTempEntry.id
      pasteurization.batchInfo[bIdx].cool[rIdx].temp.prevFocus =
          pasteurization.batchInfo[bIdx].cool[rIdx].time.id;
      pasteurization.batchInfo[bIdx].cool[rIdx].temp.nextFocus =
          nextTimeEntry.id;
      pasteurization.batchInfo[bIdx].cool[rIdx].temp.downFocus =
          nextTempEntry.id;
    }
  }
  pasteurization.finishTime.prevFocus =
    pasteurization.batchInfo[numBatches-1].cool[maxCoolRows+1].time.id;

  // compute Pasteurization Units for each batch
  pasteurizationData = [];
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    if (pasteurization.batchInfo[bIdx]) {
      pasteurizationData.push(computePU(pasteurization.batchInfo[bIdx], bIdx));
      if (pasteurizationData[bIdx].PU > 0) {
        document.getElementById("totalPU"+Number(bIdx+1)).innerHTML =
          pasteurizationData[bIdx].PU.toFixed(0);
      } else {
        document.getElementById("totalPU"+Number(bIdx+1)).innerHTML = "N/A";
      }
    } else {
      document.getElementById("totalPU"+Number(bIdx+1)).innerHTML = "N/A";
    }
  }


  // create plots of temperature, PU per minute, and total PU over time
  if (pasteurizationData.length > 0) {
    document.getElementById("plotTemperature").innerHTML =
             "<canvas id=\"temp\" width=\"800\" height=\"400\"></canvas>";
    document.getElementById("plotPUperMinute").innerHTML =
             "<canvas id=\"PUperMinute\" width=\"800\" height=\"400\"></canvas>";
    document.getElementById("plotTotalPU").innerHTML =
             "<canvas id=\"totalPU\" width=\"800\" height=\"400\"></canvas>";
    plotTemperature(pasteurizationData, numBatches);
    plotPUperMinute(pasteurizationData, numBatches);
    plotTotalPU(pasteurizationData, numBatches);
    } else {
    document.getElementById("plotTemperature").innerHTML = "";
    document.getElementById("plotPUperMinute").innerHTML = "";
    document.getElementById("plotTotalPU").innerHTML = "";
    }

  // print debugging information for each batch to the console
  for (bIdx = 0; bIdx < numBatches; bIdx++) {
    console.log("For batch " + Number(bIdx+1) + ": hot model heating = " +
                 pasteurizationData[bIdx].hotModelHeating +
                 ", hot model cooling = " +
                 pasteurizationData[bIdx].hotModelCooling +
                 ", cooling model = " +
                 pasteurizationData[bIdx].coolingModel);
  }

  console.log("UPDATE FOCUS: " + pasteurization.activeElementName);
  if (!pasteurization.activeElementName) {
    pasteurization.activeElementName = "pasteurization.title";
  }
  pasteurization.updateFocus(pasteurization.activeElementName);

  return;
}

//==============================================================================

this.switchView = function() {
  var arg = pasteurization.view.value;
  var bIdx = 0;
  var cStr = "";
  var dataEntry = document.getElementsByClassName("DATAENTRY");
  var divIdx = 0;
  var hotTemp = 0.0;
  var maxRows = 0;
  var minTemp = 0.0;
  var month = "";
  var monthMap = {
       "Jan": "January",
       "Feb": "February",
       "Mar": "March",
       "Apr": "April",
       "May": "May",
       "Jun": "June",
       "Jul": "July",
       "Aug": "August",
       "Sep": "September",
       "Oct": "October",
       "Nov": "November",
       "Dec": "December"
       };
  var numBatches = 0;
  var printing = document.getElementsByClassName("PRINTING");
  var rIdx = 0;
  var target;
  var temp = 0.0;
  var tempUnits = "";
  var timeStr = "";
  var value = 0.0;
  var warmTemp = 0.0;

  if (pasteurization.units.value == "metric") {
    tempUnits = "&deg;C";
  } else {
    tempUnits = "&deg;F";
  }

  numBatches = pasteurization.numBatches.value;

  if (arg == "dataEntry") {
    for (divIdx = 0; divIdx < dataEntry.length; divIdx++) {
      dataEntry[divIdx].style.display = "block";
    }
    for (divIdx = 0; divIdx < printing.length; divIdx++) {
      printing[divIdx].style.display = "none";
    }
  } else {
    document.getElementById("pasteurization.print.title").innerHTML =
        pasteurization.title.value;
    document.getElementById("pasteurization.print.day").innerHTML =
        pasteurization.day.value;
    month = monthMap[pasteurization.month.value] || pasteurization.month.value;
    document.getElementById("pasteurization.print.month").innerHTML = month;
    document.getElementById("pasteurization.print.year").innerHTML =
        pasteurization.year.value;

    if (pasteurization.model.value == "smart") {
      document.getElementById("pasteurization.print.model").innerHTML =
          "\"smart\"";
    } else {
      document.getElementById("pasteurization.print.model").innerHTML =
          "linear interpolation";
    }

    document.getElementById("pasteurization.print.refTemp").innerHTML =
        pasteurization.refTemp.value;

    document.getElementById("pasteurization.print.numBatches").innerHTML =
        numBatches;
    document.getElementById("pasteurization.print.zValue").innerHTML =
        pasteurization.zValue.value;

    warmTemp = pasteurization.warmTemp.value;
    if (pasteurization.units.value != "metric") {
      warmTemp = common.convertCelsiusToFahrenheit(warmTemp);
    }
    document.getElementById("pasteurization.print.warmTemp").innerHTML =
        warmTemp.toFixed(pasteurization.warmTemp.precision);
    minTemp = pasteurization.minTemp.value;
    if (pasteurization.units.value != "metric") {
      minTemp = common.convertCelsiusToFahrenheit(minTemp);
    }
    document.getElementById("pasteurization.print.minTemp").innerHTML =
        minTemp.toFixed(pasteurization.minTemp.precision);

    hotTemp = pasteurization.hotTemp.value;
    if (pasteurization.units.value != "metric") {
      hotTemp = common.convertCelsiusToFahrenheit(hotTemp);
    }
    document.getElementById("pasteurization.print.hotTemp").innerHTML =
        hotTemp.toFixed(pasteurization.hotTemp.precision);
    if (pasteurization.DValue.value != "") {
      document.getElementById("pasteurization.print.DValue").innerHTML =
          pasteurization.DValue.value + " minutes";
    } else {
      document.getElementById("pasteurization.print.DValue").innerHTML = "";
    }

    document.getElementById("pasteurization.print.startTime").innerHTML =
        common.convertTimeToStr(pasteurization.startTime.value,
                                pasteurization.timeUnits.value, "");

    document.getElementById("pasteurization.print.heatWaterTime").innerHTML =
        common.convertTimeToStr(pasteurization.heatWaterTime.value,
                                pasteurization.timeUnits.value, "");


    cStr = "<br>";
    cStr += "<table style='margin-left:3em' class='pasteurizationPrintTableName' style='width:90%'>";
    cStr += "<tbody>";

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      cStr += "<td><b>Batch #" + Number(bIdx+1) + "</b></td> ";
    }
    cStr += "</tr>";

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      cStr += "<td>bottles: " + pasteurization.batchInfo[bIdx].numBottles.value +
              "<small> +1 (measure)</small></td> ";
    }
    cStr += "</tr>";

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      cStr += "<td>warm water temp:</td> ";
    }
    cStr += "</tr>";

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (bIdx == 0) {
        value = pasteurization.batchInfo[bIdx].postMix.value;
        if (pasteurization.units.value != "metric") {
          value = common.convertCelsiusToFahrenheit(value);
        }
        value = value.toFixed(pasteurization.batchInfo[bIdx].postMix.precision);
        cStr += "<td>&nbsp;&nbsp;when add: " + value + tempUnits + "</td>";
      } else {
        value = pasteurization.batchInfo[bIdx].preMixBoil.value;
        if (pasteurization.units.value != "metric") {
          value = common.convertCelsiusToFahrenheit(value);
        }
        value = value.toFixed(pasteurization.batchInfo[bIdx].preMixBoil.precision);
        cStr += "<td>&nbsp;&nbsp;pre mix: " + value + tempUnits + "</td>";
      }
    }
    cStr += "</tr>";

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (bIdx == 0) {
        cStr += "<td></td>";
      } else {
        value = pasteurization.batchInfo[bIdx].postMix.value;
        if (pasteurization.units.value != "metric") {
          value = common.convertCelsiusToFahrenheit(value);
        }
        value = value.toFixed(pasteurization.batchInfo[bIdx].postMix.precision);
        cStr += "<td>&nbsp;&nbsp;post mix: " + value + tempUnits + "</td>";
      }
    }
    cStr += "</tr>";

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      cStr += "<td>&nbsp;</td>";
    }
    cStr += "</tr>";

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (pasteurization.batchInfo[bIdx].xferWarm.value > 0) {
        timeStr =
          common.convertTimeToStr(pasteurization.batchInfo[bIdx].xferWarm.value,
                                  pasteurization.timeUnits.value, "");
        cStr += "<td>transfer to warm: " + timeStr + "</td>";
      } else {
        cStr += "<td></td>";
      }
    }
    cStr += "</tr>";

    // create list of rows for warm time and temp; first find number of rows
    maxRows = -1;
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (pasteurization.batchInfo[bIdx]) {
        for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
          if (rIdx > maxRows &&
            pasteurization.batchInfo[bIdx].warm[rIdx].time.value > 0.0) {
            maxRows = rIdx;
          }
        }
      }
    }
    // create rows of times and temperatures for warming
    for (rIdx = 0; rIdx <= maxRows; rIdx++) {
      cStr += "<tr>";
      for (bIdx = 0; bIdx < numBatches; bIdx++) {
        if (pasteurization.batchInfo[bIdx].warm[rIdx].time.value >= 0 &&
            pasteurization.batchInfo[bIdx].warm[rIdx].temp.value > 0) {
          timeStr =
            common.convertTimeToStr(pasteurization.batchInfo[bIdx].warm[rIdx].time.value,
                                    pasteurization.timeUnits.value, "");
          value = Number(pasteurization.batchInfo[bIdx].warm[rIdx].temp.value);
          if (pasteurization.units.value != "metric") {
            value = common.convertCelsiusToFahrenheit(value);
          }
          value = value.toFixed(pasteurization.batchInfo[bIdx].warm[rIdx].temp.precision);
          cStr += "<td>&nbsp;&nbsp;" + timeStr + " = " + value + tempUnits + "</td>";
        } else {
          cStr += "<td></td>";
        }
      }
      cStr += "</tr>";
    }


    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      cStr += "<td>&nbsp;</td>";
    }
    cStr += "</tr>";

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (pasteurization.batchInfo[bIdx].xferHot.value > 0) {
        timeStr =
          common.convertTimeToStr(pasteurization.batchInfo[bIdx].xferHot.value,
                                  pasteurization.timeUnits.value, "");
        cStr += "<td>transfer to hot: " + timeStr + "</td>";
      } else {
        cStr += "<td></td>";
      }
    }
    cStr += "</tr>";

    // create list of rows for hot time and temp; first find number of rows
    maxRows = -1;
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (pasteurization.batchInfo[bIdx]) {
        for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
          if (rIdx > maxRows &&
            pasteurization.batchInfo[bIdx].hot[rIdx].time.value > 0.0) {
            maxRows = rIdx;
          }
        }
      }
    }
    // create rows of times and temperatures for heating
    for (rIdx = 0; rIdx <= maxRows; rIdx++) {
      cStr += "<tr>";
      for (bIdx = 0; bIdx < numBatches; bIdx++) {
        if (pasteurization.batchInfo[bIdx].hot[rIdx].time.value > 0 &&
            pasteurization.batchInfo[bIdx].hot[rIdx].temp.value > 0) {
          timeStr =
            common.convertTimeToStr(pasteurization.batchInfo[bIdx].hot[rIdx].time.value,
                                    pasteurization.timeUnits.value, "");
          value = Number(pasteurization.batchInfo[bIdx].hot[rIdx].temp.value);
          if (pasteurization.units.value != "metric") {
            value = common.convertCelsiusToFahrenheit(value);
          }
          value = value.toFixed(pasteurization.batchInfo[bIdx].hot[rIdx].temp.precision);
          cStr += "<td>&nbsp;&nbsp;" + timeStr + " = " + value + tempUnits + "</td>";
        } else {
          cStr += "<td></td>";
        }
      }
      cStr += "</tr>";
    }

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      cStr += "<td>&nbsp;</td>";
    }
    cStr += "</tr>";

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (pasteurization.batchInfo[bIdx].xferCool.value > 0) {
        timeStr =
          common.convertTimeToStr(pasteurization.batchInfo[bIdx].xferCool.value,
                                  pasteurization.timeUnits.value, "");
        cStr += "<td>transfer to cool: " + timeStr + "</td>";
      } else {
        cStr += "<td></td>";
      }
    }
    cStr += "</tr>";

    // create list of rows for cool time and temp; first find number of rows
    maxRows = -1;
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      if (pasteurization.batchInfo[bIdx]) {
        for (rIdx = 0; rIdx < pasteurization.maxWHCTimes; rIdx++) {
          if (rIdx > maxRows &&
            pasteurization.batchInfo[bIdx].cool[rIdx].time.value > 0.0) {
            maxRows = rIdx;
          }
        }
      }
    }
    // create rows of times and temperatures for heating
    for (rIdx = 0; rIdx <= maxRows; rIdx++) {
      cStr += "<tr>";
      for (bIdx = 0; bIdx < numBatches; bIdx++) {
        if (pasteurization.batchInfo[bIdx].cool[rIdx].time.value > 0 &&
            pasteurization.batchInfo[bIdx].cool[rIdx].temp.value > 0) {
          timeStr =
            common.convertTimeToStr(pasteurization.batchInfo[bIdx].cool[rIdx].time.value,
                                    pasteurization.timeUnits.value, "");
          value = Number(pasteurization.batchInfo[bIdx].cool[rIdx].temp.value);
          if (pasteurization.units.value != "metric") {
            value = common.convertCelsiusToFahrenheit(value);
          }
          value = value.toFixed(pasteurization.batchInfo[bIdx].cool[rIdx].temp.precision);
          cStr += "<td>&nbsp;&nbsp;" + timeStr + " = " + value + tempUnits + "</td>";
        } else {
          cStr += "<td></td>";
        }
      }
      cStr += "</tr>";
    }

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      cStr += "<td>&nbsp;</td>";
    }
    cStr += "</tr>";

    cStr += "<tr>";
    for (bIdx = 0; bIdx < numBatches; bIdx++) {
      value = document.getElementById("totalPU"+Number(bIdx+1)).innerHTML;
      if (value > 0 && value != "") {
        cStr += "<td><b>Total PU:</b> " + value + "</td>";
      } else {
        cStr += "<td></td>";
      }
    }
    cStr += "</tr>";


    cStr += "</tbody>";
    cStr += "</table>";

    document.getElementById("pasteurization.print.table").innerHTML = cStr;

    document.getElementById("pasteurization.print.finishTime").innerHTML =
        common.convertTimeToStr(pasteurization.finishTime.value,
                                pasteurization.timeUnits.value, "");

    if (document.getElementById("pasteurization.print.totalHours")) {
      if (!pasteurization.durationH) {
        document.getElementById("pasteurization.print.totalHours").innerHTML =
          "N/A";
      } else if (pasteurization.durationH != 1) {
        document.getElementById("pasteurization.print.totalHours").innerHTML =
           pasteurization.durationH + " hours and";
      } else {
        document.getElementById("pasteurization.print.totalHours").innerHTML =
           pasteurization.durationH + " hour and";
      }
    }
    if (document.getElementById("pasteurization.print.totalMinutes")) {
      if (!pasteurization.durationM) {
        document.getElementById("pasteurization.print.totalMinutes").innerHTML = "";
      } else if (pasteurization.durationM != 1) {
        document.getElementById("pasteurization.print.totalMinutes").innerHTML =
          pasteurization.durationM + " minutes";
      } else {
        document.getElementById("pasteurization.print.totalMinutes").innerHTML =
          pasteurization.durationM + " minute";
      }
    }

    for (divIdx = 0; divIdx < dataEntry.length; divIdx++) {
      dataEntry[divIdx].style.display = "none";
    }
    for (divIdx = 0; divIdx < printing.length; divIdx++) {
      printing[divIdx].style.display = "block";
    }
  }
  return;
}

// close the "namespace" and call the function to construct it.
}
pasteurization._construct();
