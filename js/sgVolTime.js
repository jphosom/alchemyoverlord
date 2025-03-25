// -----------------------------------------------------------------------------
// sgVolTime.js : JavaScript for AlchemyOverlord web page, SG/vol/time sub-page
// Written by John-Paul Hosom
// Copyright © 2021-2025 by John-Paul Hosom, all rights reserved.
// To license this software, please contact John-Paul Hosom, for example at
//    alchemyoverlord © yahoo · com
// In many cases (at the sole discretion of John-Paul Hosom) a license
// is provided free of charge, but a written license is required for
// legal use of this code.
//
// Version 1.0.0 : August 15, 2021
//         Initial version.
//
// -----------------------------------------------------------------------------

//==============================================================================

var sgVolTime = sgVolTime || {};

// Declare a "namespace" called "sgVolTime"
// This namespace contains functions that are specific to sgVolTime method.
//
//    public functions:
//    . initialize_sgVolTime()
//    . compute_sgVolTime()
//

sgVolTime._construct = function() {

"use strict";

//------------------------------------------------------------------------------
// initialize

this.initialize_sgVolTime = function() {
  var idx = 0;
  var keys;
  var updateFunction = this.compute_sgVolTime;

  // color options
  this.defaultColor = "#94476b"; // greyish red

  //----------------------------------------------------------------------------
  // create data for all variables

  this.initSG = new Object;
  this.initSG.id = "sgVolTime.initSG";
  this.initSG.inputType = "floatOrString";
  this.initSG.inputStrings = [ "" ];
  this.initSG.userSet = 0;
  this.initSG.precision = 3;
  this.initSG.minPrecision = 3;
  this.initSG.display = "";
  this.initSG.min = 0.8;
  this.initSG.max = 2.0;
  this.initSG.description = "initial specific gravity";
  this.initSG.defaultValue = "";
  this.initSG.defaultColor = this.defaultColor;
  this.initSG.updateFunction = sgVolTime.compute_sgVolTime;
  this.initSG.updateFunctionArgs = this.initSG.id;

  this.finalSG = new Object;
  this.finalSG.id = "sgVolTime.finalSG";
  this.finalSG.inputType = "floatOrString";
  this.finalSG.inputStrings = [ "" ];
  this.finalSG.userSet = 0;
  this.finalSG.precision = 3;
  this.finalSG.minPrecision = 3;
  this.finalSG.display = "";
  this.finalSG.min = 0.8;
  this.finalSG.max = 2.0;
  this.finalSG.description = "final specific gravity";
  this.finalSG.defaultValue = ""
  this.finalSG.defaultColor = this.defaultColor;
  this.finalSG.updateFunction = sgVolTime.compute_sgVolTime;
  this.finalSG.updateFunctionArgs = this.finalSG.id;

  this.initVol = new Object;
  this.initVol.id = "sgVolTime.initVol";
  this.initVol.inputType = "floatOrString";
  this.initVol.inputStrings = [ "" ];
  this.initVol.userSet = 0;
  this.initVol.precision = 1;
  this.initVol.minPrecision = 1;
  this.initVol.display = "";
  this.initVol.min = 0.01;
  this.initVol.max = 8000.0;
  this.initVol.description = "initial volume";
  this.initVol.defaultValue = "";
  this.initVol.defaultColor = this.defaultColor;
  this.initVol.updateFunction = sgVolTime.compute_sgVolTime;
  this.initVol.updateFunctionArgs = this.initVol.id;

  this.finalVol = new Object;
  this.finalVol.id = "sgVolTime.finalVol";
  this.finalVol.inputType = "floatOrString";
  this.finalVol.inputStrings = [ "" ];
  this.finalVol.userSet = 0;
  this.finalVol.precision = 1;
  this.finalVol.minPrecision = 1;
  this.finalVol.display = "";
  this.finalVol.min = 0.0;
  this.finalVol.max = 8000.0;
  this.finalVol.description = "final volume";
  this.finalVol.defaultValue = ""
  this.finalVol.defaultColor = this.defaultColor;
  this.finalVol.updateFunction = sgVolTime.compute_sgVolTime;
  this.finalVol.updateFunctionArgs = this.finalVol.id;

  this.duration = new Object;
  this.duration.id = "sgVolTime.duration";
  this.duration.inputType = "floatOrString";
  this.duration.inputStrings = [ "" ];
  this.duration.userSet = 0;
  this.duration.precision = 1;
  this.duration.minPrecision = 0;
  this.duration.display = "";
  this.duration.min = 0.0;
  this.duration.max = 240.0;
  this.duration.description = "boil duration (in minutes)";
  this.duration.defaultValue = ""
  this.duration.defaultColor = this.defaultColor;
  this.duration.updateFunction = sgVolTime.compute_sgVolTime;
  this.duration.updateFunctionArgs = this.duration.id;

  this.evapRate = new Object;
  this.evapRate.id = "sgVolTime.evapRate";
  this.evapRate.inputType = "floatOrString";
  this.evapRate.inputStrings = [ "" ];
  this.evapRate.userSet = 0;
  this.evapRate.precision = 1;
  this.evapRate.minPrecision = 1;
  this.evapRate.display = "";
  this.evapRate.min = 0.0;
  this.evapRate.max = 240.0;
  this.evapRate.description = "evaporation rate (in units per hour)";
  this.evapRate.defaultValue = ""
  this.evapRate.defaultColor = this.defaultColor;
  this.evapRate.updateFunction = sgVolTime.compute_sgVolTime;
  this.evapRate.updateFunctionArgs = this.evapRate.id;

  common.set(sgVolTime.initSG,  0);
  common.set(sgVolTime.finalSG, 0);
  common.set(sgVolTime.initVol, 0);
  common.set(sgVolTime.finalVol, 0);
  common.set(sgVolTime.duration, 0);
  common.set(sgVolTime.evapRate, 0);

  this.verbose = 1;
  this.compute_sgVolTime();

  return;
}


//==============================================================================

//------------------------------------------------------------------------------

function setValue(variable, value, precision) {
  if (value === "") {
    return false;
  }
  variable.defaultValue = value;
  variable.userSet = 0;
  variable.precision = precision;
  common.unsetSavedValue(variable, 0);
  common.set(variable, 0);
  console.log("   set " + variable.id + " to " + value.toFixed(4));
  return true;
  }

//------------------------------------------------------------------------------

function unsetValue(variable) {
  variable.defaultValue = "";
  variable.userSet = 0;
  common.unsetSavedValue(variable, 0);
  common.set(variable, 0);
  console.log("   unset " + variable.id);
  return true;
  }

//------------------------------------------------------------------------------
// compute SG, volume, and/or time, depending on available information

this.compute_sgVolTime = function(changeID) {
  var changedValue = true;
  var changeVar = [];
  var finalPoints = 0.0;
  var initPoints = 0.0;
  var precision = 0;
  var setCountBot = 0;
  var setCountTop = 0;
  var setDuration = false;
  var setEvapRate = false;
  var setInitSG   = false;
  var setInitVol  = false;
  var setFinalSG  = false;
  var setFinalVol = false;
  var tooManySet = false;
  var userSetValue = "";
  var value = 0.0;

  if (sgVolTime.verbose > 0) {
    console.log("============== " + changeID + " ====================");
  }

  // figure out which variables have been set by the user to a non-blank value
  setInitSG   = sgVolTime.initSG.userSet && (sgVolTime.initSG.value != "");
  setFinalSG  = sgVolTime.finalSG.userSet && (sgVolTime.finalSG.value != "");
  setInitVol  = sgVolTime.initVol.userSet && (sgVolTime.initVol.value != "");
  setFinalVol = sgVolTime.finalVol.userSet && (sgVolTime.finalVol.value != "");
  setDuration = sgVolTime.duration.userSet && (sgVolTime.duration.value != "");
  setEvapRate = sgVolTime.evapRate.userSet && (sgVolTime.evapRate.value != "");

  console.log("initSG:   " + sgVolTime.initSG.value +
              ",  set = " + setInitSG);
  console.log("finalSG:  " + sgVolTime.finalSG.value +
              ",  set = " + setFinalSG);
  console.log("initVol:  " + sgVolTime.initVol.value +
              ",  set = " + setInitVol);
  console.log("finalVol: " + sgVolTime.finalVol.value +
              ",  set = " + setFinalVol);
  console.log("duration: " + sgVolTime.duration.value +
              " minutes,  set = " + setDuration);
  console.log("evapRate: " + sgVolTime.evapRate.value +
              " units/hour,  set = " + setEvapRate);

  // if the user entered something for a variable, validate it
  if (document.getElementById(changeID)) {
    tooManySet = false;

    setCountTop = 0;
    if (setInitSG)   setCountTop += 1;
    if (setFinalSG)  setCountTop += 1;
    if (setInitVol)  setCountTop += 1;
    if (setFinalVol) setCountTop += 1;
    setCountBot = 0;
    if (setDuration) setCountBot += 1;
    if (setEvapRate) setCountBot += 1;
    if (setCountTop >= 3 && setCountBot == 2) {
      tooManySet = true;
    }
    if (setInitSG && setFinalSG && setInitVol && setFinalVol) {
      tooManySet = true;
    }
    if (setInitVol && setFinalVol && setDuration && setEvapRate) {
      tooManySet = true;
    }

    // if the user has entered too many values, complain and unset current value
    if (tooManySet) {
      window.alert("Not sure which value to re-compute.  " +
                   "Please delete at least one other input.");
      console.log("changeID = " + changeID);
      changeVar = window[changeID.split(".")[0]][changeID.split(".")[1]];
      unsetValue(changeVar);
    }

    // if the user set the value to '', then unset it
    userSetValue = document.getElementById(changeID).value;
    if (userSetValue === "") {
      changeVar = window[changeID.split(".")[0]][changeID.split(".")[1]];
      unsetValue(changeVar);
    }
  }

  // re-determine which variables have been set by the user to a non-blank value
  // because one might be now unset
  setInitSG   = sgVolTime.initSG.userSet && (sgVolTime.initSG.value != "");
  setFinalSG  = sgVolTime.finalSG.userSet && (sgVolTime.finalSG.value != "");
  setInitVol  = sgVolTime.initVol.userSet && (sgVolTime.initVol.value != "");
  setFinalVol = sgVolTime.finalVol.userSet && (sgVolTime.finalVol.value != "");
  setDuration = sgVolTime.duration.userSet && (sgVolTime.duration.value != "");
  setEvapRate = sgVolTime.evapRate.userSet && (sgVolTime.evapRate.value != "");

  // make sure all "set" values are treated as numbers
  if (setInitSG) {
    sgVolTime.initSG.value = Number(sgVolTime.initSG.value);
  }
  if (setFinalSG) {
    sgVolTime.finalSG.value = Number(sgVolTime.finalSG.value);
  }
  if (setInitVol) {
    sgVolTime.initVol.value = Number(sgVolTime.initVol.value);
  }
  if (setFinalVol) {
    sgVolTime.finalVol.value = Number(sgVolTime.finalVol.value);
  }
  if (setDuration) {
    sgVolTime.duration.value = Number(sgVolTime.duration.value);
  }
  if (setEvapRate) {
    sgVolTime.evapRate.value = Number(sgVolTime.evapRate.value);
  }

  console.log("CHECKING...");
  changedValue = true;
  while (changedValue) {
    changedValue = false;
    if (!setInitSG) {
      console.log("processing initSG");
      value = "";
      if (setFinalSG && setInitVol && setFinalVol) {
        finalPoints = (sgVolTime.finalSG.value - 1.0) * 1000;
        initPoints = finalPoints *
                     (sgVolTime.finalVol.value / sgVolTime.initVol.value);
        value = (initPoints / 1000.0) + 1.0;
      }
      precision = sgVolTime.finalSG.precision;
      changedValue = setValue(sgVolTime.initSG, value, precision);
      if (changedValue) {
        setInitSG = true;
      } else {
        unsetValue(sgVolTime.initSG);
      }
    }
    if (!setFinalSG) {
      console.log("processing finalSG");
      value = "";
      if (setInitSG && setInitVol && setFinalVol) {
        initPoints = (sgVolTime.initSG.value - 1.0) * 1000;
        finalPoints = initPoints /
                     (sgVolTime.finalVol.value / sgVolTime.initVol.value);
        value = (finalPoints / 1000.0) + 1.0;
      }
      precision = sgVolTime.initSG.precision;
      changedValue = setValue(sgVolTime.finalSG, value, precision);
      if (changedValue) {
        setFinalSG = true;
      } else {
        unsetValue(sgVolTime.finalSG);
      }
    }
    if (!setInitVol) {
      console.log("processing initVol");
      value = "";
      if (setInitSG && setFinalSG && setFinalVol) {
        initPoints = (sgVolTime.initSG.value - 1.0) * 1000;
        finalPoints = (sgVolTime.finalSG.value - 1.0) * 1000;
        value = sgVolTime.finalVol.value * (finalPoints / initPoints);
      }
      if (setFinalVol && setDuration && setEvapRate) {
        value = sgVolTime.finalVol.value +
                (sgVolTime.evapRate.value * (sgVolTime.duration.value/60.0));
      }
      precision = sgVolTime.finalVol.precision;
      changedValue = setValue(sgVolTime.initVol, value, precision);
      if (changedValue) {
        setInitVol = true;
      } else {
        unsetValue(sgVolTime.initVol);
      }
    }
    if (!setFinalVol) {
      console.log("processing finalVol");
      value = "";
      if (setInitSG && setFinalSG && setInitVol) {
        initPoints = (sgVolTime.initSG.value - 1.0) * 1000;
        finalPoints = (sgVolTime.finalSG.value - 1.0) * 1000;
        value = sgVolTime.initVol.value * (initPoints / finalPoints);
      }
      if (setInitVol && setDuration && setEvapRate) {
        value = sgVolTime.initVol.value -
                (sgVolTime.evapRate.value * (sgVolTime.duration.value/60.0));
      }
      precision = sgVolTime.initVol.precision;
      changedValue = setValue(sgVolTime.finalVol, value, precision);
      if (changedValue) {
        setFinalVol = true;
      } else {
        unsetValue(sgVolTime.finalVol);
      }
    }
    if (!setEvapRate) {
      console.log("processing evapRate");
      value = "";
      if (setInitVol && setFinalVol && setDuration) {
        value = (sgVolTime.initVol.value - sgVolTime.finalVol.value) /
                (sgVolTime.duration.value/60.0);
      }
      precision = sgVolTime.duration.precision;
      changedValue = setValue(sgVolTime.evapRate, value, precision);
      if (changedValue) {
        setEvapRate = true;
      } else {
        unsetValue(sgVolTime.evapRate);
      }
    }
    if (!setDuration) {
      console.log("processing duration");
      value = "";
      if (setInitVol && setFinalVol && setEvapRate) {
        value = ((sgVolTime.initVol.value - sgVolTime.finalVol.value) /
                 sgVolTime.evapRate.value) * 60.0;
      }
      precision = sgVolTime.evapRate.precision;
      changedValue = setValue(sgVolTime.duration, value, precision);
      if (changedValue) {
        setDuration = true;
      } else {
        unsetValue(sgVolTime.duration);
      }
    }
    console.log("repeating check : " + changedValue);
  }

  return;
}

// close the "namespace" and call the function to construct it.
}
sgVolTime._construct();
