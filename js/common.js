// -----------------------------------------------------------------------------
// common.js : JavaScript for AlchemyOverlord web page, common functions
// Written by John-Paul Hosom
// Copyright © 2018-2020 by John-Paul Hosom, all rights reserved.
//
// Version 1.2.0 : Jul 15, 2018 : complete re-write under hood; add save/load
// Version 1.2.1 : Jul 18, 2018 : add support for checkbox
// Version 1.2.2 : Dec 29, 2018 : add support for 'select', float or string
// Version 1.3.2 : Feb 20, 2020 : add support for saving/loading files
// Version 1.3.3 : Nov 22, 2020 : add tsp/ml conversion; minor cleanup
// Version 1.3.4 : Aug 22, 2021 : add meters/feet, Plato conversion; cleanup
// -----------------------------------------------------------------------------

//==============================================================================

var common = common || {};

// Declare a "namespace" called "common"
// This namespace contains commonly-used functions in developing web pages
// for this project.
//
//   public functions:
//
//   HTML-RELATED FUNCTIONS:
//   . getPrecision()
//   . set()
//   . updateHTML()
//
//   UNIT CONVERSION FUNCTIONS:
//   . convertMetersToFeet()
//   . convertFeetToMeters()
//   . convertCmToInches()
//   . convertInchesToCm()
//   . convertLitersToGallons()
//   . convertGallonsToLiters()
//   . convertFahrenheitToCelsiusSlope()
//   . convertCelsiusToFahrenheitSlope()
//   . convertFahrenheitToCelsius()
//   . convertCelsiusToFahrenheit()
//   . convertKelvinToCelsius()
//   . convertCelsiusToKelvin()
//   . convertOuncesToGrams()
//   . convertGramsToOunces()
//   . convertSGToPlato()
//   . convertPlatoToSG()
//   . convertTspToMl()
//   . convertMlToTsp()
//
//   FUNCTIONS FOR SAVING AND LOADING PARAMETERS:
//   . clearSavedValues()
//   . setSavedValue()
//   . unsetSavedValue()
//   . getSavedValue()
//   . existsSavedValue()
//   . saveToFile()
//   . loadFromFile()

common._construct = function() {

//------------------------------------------------------------------------------
// create various types of input fields

this.createInt = function(id, value, description, minValue, maxValue,
                        defaultFunction, defaultFunctionArgs, defaultColor,
                        additionalFunction, additionalFunctionArgs,
                        dependents, updateFunction, updateFunctionArgs) {
  entry = new Object();
  entry.id = id;
  entry.inputType = "int";
  entry.value = value;
  entry.userSet = 0;
  entry.defaultValue = value;
  if (defaultFunction != "") {
    entry.defaultFunction = defaultFunction;
    entry.defaultArgs = defaultFunctionArgs;
  }
  if (defaultColor != "") {
    entry.defaultColor = defaultColor;
  }
  entry.min = minValue;
  entry.max = maxValue;
  if (additionalFunction != "") {
    entry.additionalFunction = additionalFunction;
    entry.additionalFunctionArgs = additionalFunctionArgs;
  }
  if (dependents != "") {
    entry.dependents = dependents;
  }
  if (updateFunction != "") {
    entry.updateFunction = updateFunction;
  }
  if (updateFunctionArgs != "") {
    entry.updateFunctionArgs = updateFunctionArgs;
  }
  entry.parent = id.split(".")[0];
  return entry;
}

this.createFloat = function(id, value, description, minValue, maxValue,
                        precision, minPrecision,
                        convertToMetricFunction, convertToImperialFunction,
                        defaultFunction, defaultFunctionArgs, defaultColor,
                        additionalFunction, additionalFunctionArgs,
                        dependents, updateFunction, updateFunctionArgs) {
  entry = new Object();
  entry.id = id;
  entry.inputType = "float";
  entry.value = value;
  entry.userSet = 0;
  entry.defaultValue = value;
  if (defaultFunction != "") {
    entry.defaultFunction = defaultFunction;
    entry.defaultArgs = defaultFunctionArgs;
  }
  if (defaultColor != "") {
    entry.defaultColor = defaultColor;
  }
  entry.min = minValue;
  entry.max = maxValue;
  entry.precision = precision;
  entry.minPrecision = minPrecision;
  if (convertToMetricFunction != "") {
    entry.convertToMetric = convertToMetricFunction;
  }
  if (convertToImperialFunction != "") {
    entry.convertToImperial = convertToImperialFunction;
  }
  if (additionalFunction != "") {
    entry.additionalFunction = additionalFunction;
    entry.additionalFunctionArgs = additionalFunctionArgs;
  }
  if (dependents != "") {
    entry.dependents = dependents;
  }
  if (updateFunction != "") {
    entry.updateFunction = updateFunction;
  }
  if (updateFunctionArgs != "") {
    entry.updateFunctionArgs = updateFunctionArgs;
  }
  entry.parent = id.split(".")[0];
  return entry;
}


this.createFloatOrString = function(id, value, description, minValue, maxValue,
                        precision, minPrecision, inputStrings,
                        convertToMetricFunction, convertToImperialFunction,
                        defaultFunction, defaultFunctionArgs, defaultColor,
                        additionalFunction, additionalFunctionArgs,
                        dependents, updateFunction, updateFunctionArgs) {
  entry = new Object();
  entry.id = id;
  entry.inputType = "floatOrString";
  entry.inputStrings = inputStrings;
  entry.value = value;
  entry.userSet = 0;
  entry.defaultValue = value;
  if (defaultFunction != "") {
    entry.defaultFunction = defaultFunction;
    entry.defaultArgs = defaultFunctionArgs;
  }
  if (defaultColor != "") {
    entry.defaultColor = defaultColor;
  }
  entry.min = minValue;
  entry.max = maxValue;
  entry.precision = precision;
  entry.minPrecision = minPrecision;
  if (convertToMetricFunction != "") {
    entry.convertToMetric = convertToMetricFunction;
  }
  if (convertToImperialFunction != "") {
    entry.convertToImperial = convertToImperialFunction;
  }
  if (additionalFunction != "") {
    entry.additionalFunction = additionalFunction;
    entry.additionalFunctionArgs = additionalFunctionArgs;
  }
  if (dependents != "") {
    entry.dependents = dependents;
  }
  if (updateFunction != "") {
    entry.updateFunction = updateFunction;
  }
  if (updateFunctionArgs != "") {
    entry.updateFunctionArgs = updateFunctionArgs;
  }
  entry.parent = id.split(".")[0];
  return entry;
}




this.createRadioButton = function(id, value,
                             defaultFunction, defaultFunctionArgs,
                             additionalFunction, additionalFunctionArgs,
                             dependents, updateFunction, updateFunctionArgs) {
  entry = new Object();
  entry.id = id;
  entry.inputType = "radioButton";
  entry.value = value;
  entry.userSet = 0;
  entry.defaultValue = value;
  if (defaultFunction != "") {
    entry.defaultFunction = defaultFunction;
    entry.defaultArgs = defaultFunctionArgs;
  }
  if (additionalFunction != "") {
    entry.additionalFunction = additionalFunction;
    entry.additionalFunctionArgs = additionalFunctionArgs;
  }
  if (dependents != "") {
    entry.dependents = dependents;
  }
  if (updateFunction != "") {
    entry.updateFunction = updateFunction;
  }
  if (updateFunctionArgs != "") {
    entry.updateFunctionArgs = updateFunctionArgs;
  }
  entry.parent = id.split(".")[0];
  return entry;
}

this.createString = function(id, value, description, defaultFunction,
                        defaultFunctionArgs, additionalFunction,
                        additionalFunctionArgs, dependents,
                        updateFunction, updateFunctionArgs) {
  entry = new Object();
  entry.id = id;
  entry.inputType = "string";
  entry.value = value;
  entry.userSet = 0;
  entry.display = value;
  entry.defaultValue = value;
  if (defaultFunction != "") {
    entry.defaultFunction = defaultFunction;
    entry.defaultArgs = defaultFunctionArgs;
  }
  entry.description = description;
  if (additionalFunction != "") {
    entry.additionalFunction = additionalFunction;
    entry.additionalFunctionArgs = additionalFunctionArgs;
  }
  if (dependents != "") {
    entry.dependents = dependents;
  }
  if (updateFunction != "") {
    entry.updateFunction = updateFunction;
  }
  if (updateFunctionArgs != "") {
    entry.updateFunctionArgs = updateFunctionArgs;
  }
  entry.parent = id.split(".")[0];
  return entry;
}

this.createSelection = function(id, value, description, defaultFunction,
                        defaultFunctionArgs, additionalFunction,
                        additionalFunctionArgs, dependents,
                        updateFunction, updateFunctionArgs) {
  entry = new Object();
  entry.id = id;
  entry.inputType = "select";
  entry.value = value;
  entry.userSet = 0;
  entry.display = value;
  entry.defaultValue = value;
  if (defaultFunction != "") {
    entry.defaultFunction = defaultFunction;
    entry.defaultArgs = defaultFunctionArgs;
  }
  entry.description = description;
  if (additionalFunction != "") {
    entry.additionalFunction = additionalFunction;
    entry.additionalFunctionArgs = additionalFunctionArgs;
  }
  if (dependents != "") {
    entry.dependents = dependents;
  }
  if (updateFunction != "") {
    entry.updateFunction = updateFunction;
  }
  if (updateFunctionArgs != "") {
    entry.updateFunctionArgs = updateFunctionArgs;
  }
  entry.parent = id.split(".")[0];
  return entry;
}

this.createTime = function(id, value, overrideTimeFormat, description,
                        defaultFunction, defaultFunctionArgs,
                        additionalFunction, additionalFunctionArgs,
                        dependents, updateFunction, updateFunctionArgs) {
  entry = new Object();
  entry.id = id;
  entry.inputType = "time";
  if (overrideTimeFormat != "noAMPM" && overrideTimeFormat != "12" &&
      overrideTimeFormat != "24" && overrideTimeFormat != "") {
    window.alert("For input " + id + ", overrideTimeFormat '" +
                 overrideTimeFormat +
                 "' is not valid; must be one of {noAMPM, 12, 24}.");
    overrideTimeFormat = 24;
  }
  entry.overrideTimeFormat = overrideTimeFormat;
  entry.value = value;
  entry.userSet = 0;
  entry.display = value;
  entry.defaultValue = value;
  if (defaultFunction != "") {
    entry.defaultFunction = defaultFunction;
    entry.defaultArgs = defaultFunctionArgs;
  }
  entry.description = description;
  if (additionalFunction != "") {
    entry.additionalFunction = additionalFunction;
    entry.additionalFunctionArgs = additionalFunctionArgs;
  }
  if (dependents != "") {
    entry.dependents = dependents;
  }
  if (updateFunction != "") {
    entry.updateFunction = updateFunction;
  }
  if (updateFunctionArgs != "") {
    entry.updateFunctionArgs = updateFunctionArgs;
  }
  entry.parent = id.split(".")[0];
  return entry;
}

//------------------------------------------------------------------------------
// validate user input.
// The output 'check' contains:
//    - valid : true if the input is a valid value, else false
//    - useDefaultValue : true if we explicitly want to go back to default value
//    - value : the (numeric or other) value of the (string) input

validate = function(variable, input) {
  var check = new Object();
  var inputValue;

  check.useDefaultValue = false;
  check.valid = true;

  if (input == "D" || input == "d" || input == "'D'" || input == "'d'") {
    check.valid = false;
    check.useDefaultValue = true;
    check.value = "";
    return check;
  }

  if (variable.inputType == "float" || variable.inputType == "int") {
    check.valid = true;
    if (isNaN(input)) {
      check.valid = false;
    }
    inputValue = Number(input);
    if (inputValue < variable.min || inputValue > variable.max) {
      check.valid = false;
    }
    if (variable.inputType == "int" && !Number.isInteger(inputValue)) {
      check.valid = false;
    }
    check.value = inputValue;
  }

  if (variable.inputType == "string") {
    check.value = input;
  }

  if (!check.valid) {
    if (variable.inputType != "int") {
      window.alert("For " + variable.description + ", input '" + input +
                 "' is not valid.");
    } else {
      window.alert("For " + variable.description + ", input '" + input +
                 "' is not valid. Only integer values are allowed.");
    }
  }

  return check;
}

//------------------------------------------------------------------------------
// validate user input as either a floating point number or a default string.
// The output 'check' contains:
//    - valid : true if the input is a valid value, else false
//    - useDefaultValue : true if we explicitly want to go back to default value
//    - value : the (numeric or other) value of the (string) input

validateFloatOrString = function(variable, input) {
  var check = new Object();
  var idx;
  var inputValue;

  check.useDefaultValue = false;
  check.valid = true;

  if (input == "D" || input == "d" || input == "'D'" || input == "'d'") {
    check.valid = false;
    check.useDefaultValue = true;
    check.value = "";
    return check;
  }

  check.valid = false;
  if (!isNaN(input) && input.length != 0) {
    inputValue = Number(input);
    check.valid = true;
    if (inputValue < variable.min || inputValue > variable.max) {
      check.valid = false;
    }
    check.value = input;
  } else {
    for (idx = 0; idx < variable.inputStrings.length; idx++) {
      // console.log("checking " + variable.inputStrings[idx]);
      if (variable.inputStrings[idx] == input.toLowerCase()) {
        check.valid = true;
        check.value = input;
      }
    }
  }

  if (!check.valid) {
    window.alert("For " + variable.description + ", input '" + input +
                 "' is not valid.");
  }

  return check;
}

//------------------------------------------------------------------------------
// validate user input as a time.
// A time can be either the normal HH[:|.]MM [AM|PM], or it can be minutes only
// (in which case minutes less than 10 must be preceded by a 0)
// This validation is simple and won't catch things like 18:32am; further
// validation and processing should be done by the parent script.
// The output 'check' contains:
//    - valid : true if the input is a valid value, else false
//    - useDefaultValue : true if we explicitly want to go back to default value
//    - value : the (numeric or other) value of the (string) input

validateTime = function(variable, input) {
  var check = new Object();
  var found = [];
  var hour = 0;
  var timePattern = "^(0?[0-9]|1[0-9]|2[0-3])(:|\.)([0-5][0-9]) ?([AaPp][Mm])?$";
  var timePatternMin = "^([0-5][0-9])$";

  // if 'd' for default, then don't change a saved value; if no saved
  // value, then generate an error (no saved value should never occur)
  if (input == "D" || input == "d" || input == "'D'" || input == "'d'") {
    check.valid = false;
    check.value = "";
    return check;
  }

  if (input == "") {
    check.valid = false;
    check.useDefaultValue = true;
    check.value = "";
  }

  check.useDefaultValue = false;
  check.valid = false;

  found = input.match(timePattern);
  if (found) {
    hour = parseInt(found[1]);
    if (found[4]) {
      if (hour < 12 && found[4].toUpperCase() == "PM") {
        hour += 12;
      }
      if (hour == 12 && found[4].toUpperCase() == "AM") {
        hour -= 12;
      }
    } else {
    }
    if (hour < 24) {
      check.valid = true;
      check.value = input;
    }
  } else {
    found = input.match(timePatternMin);
    if (found) {
      check.valid = true;
      check.value = input;
    }
  }

  if (!check.valid) {
    window.alert("For " + variable.description + ", input '" + input +
                 "' is not valid.");
  }

  return check;
}

//------------------------------------------------------------------------------
// parse a (valid) time into hours

this.parseTime = function(timeStr) {
  var found = [];
  var hour = 0;
  var min = 0;
  var timePattern = "^([0-9]|1[0-9]|2[0-3])(:|\.)([0-5][0-9]) ?([AaPp][Mm])?$";
  var HHMM = 0;

  if (!timeStr || timeStr == "" || timeStr == "--:--" ||
      Number(timeStr) < 0.0) {
    return -1;
  }
  found = timeStr.match(timePattern);
  if (!found) {
    console.log("CAN'T PARSE TIME " + timeStr);
    return -1;
  }

  // console.log("hour: " + found[1]);
  // console.log("min: " + found[3]);
  // console.log("ampm: " + found[4]);
  hour = parseInt(found[1]);
  min = parseInt(found[3]);
  if (found[4]) {
    if (hour < 12 && found[4].toUpperCase() == "PM") {
      hour += 12;
    }
    if (hour == 12 && found[4].toUpperCase() == "AM") {
      hour -= 12;
    }
  }
  if (hour >= 24) {
    console.log("CAN'T PARSE TIME " + timeStr);
    return 0;
  }

  // console.log("HOUR: " + hour);
  // console.log("MIN:  " + min);
  HHMM = hour + min/60.0;

  return HHMM;
}

//------------------------------------------------------------------------------

this.getPrecision = function(value) {
  var valueString = "";
  var dotIndex = 0;
  var precision = 0;

  valueString = value.toString();  // make sure it's a string
  dotIndex = valueString.indexOf(".");
  if (dotIndex >= 0) {
    precision = valueString.length - dotIndex - 1;
    if (precision > 8) {
      precision = 8;
    }
    return precision;
  } else {
    return 0;
  }
}

//------------------------------------------------------------------------------

this.set = function(variable, haveUserInput) {
  var check = new Object();
  var defaultValue;
  var idx = 0;
  var inputString = "";
  var savedValue;
  var savedValueExists;

  console.log("\n");
  console.log("-------------- SET " + variable.id +
              " ---- (user input " + haveUserInput + ") ----");

  if (haveUserInput) {
    if (variable.inputType == "radioButton") {
      check.useDefaultValue = false;
      check.valid = true;
      var query = "input[name='"+variable.id+"']:checked";
      check.value = document.querySelector(query).value;
      console.log("RADIO BUTTON VALUE : " + check.value);
    } else if (variable.inputType == "checkbox") {
      check.useDefaultValue = false;
      check.valid = true;
      check.value = document.getElementById(variable.id).checked;
      console.log("CHECKBOX VALUE : " + check.value);
    } else if (variable.inputType == "select") {
      check.useDefaultValue = false;
      check.valid = true;
      check.value = document.getElementById(variable.id).value;
      console.log("SELECT VALUE : " + check.value);
    } else if (variable.inputType == "floatOrString") {
      inputString = document.getElementById(variable.id).value;
      // console.log("  input = " + inputString);
      check = validateFloatOrString(variable, inputString);
      // console.log("  validate = "+check.valid+", " +check.useDefaultValue);
      if (!check.valid || check.useDefaultValue) {
        console.log("  input is not valid, or we want the default");
      }
    } else if (variable.inputType == "time") {
      inputString = document.getElementById(variable.id).value;
      console.log("TIME = " + inputString);
      check = validateTime(variable, inputString);
      if (!check.valid || check.useDefaultValue) {
        console.log("  input is not valid, or we want the default");
      }
    } else {
      inputString = document.getElementById(variable.id).value;
      console.log("  input = " + inputString);
      check = validate(variable, inputString);
      console.log("  validate = "+check.valid + ", "+check.useDefaultValue);
      if (!check.valid || check.useDefaultValue) {
        console.log("  input is not valid, or we want the default");
      }
    }
  }

  savedValueExists = common.existsSavedValue(variable);
  if (savedValueExists && (!haveUserInput ||
      (haveUserInput && !check.valid && !check.useDefaultValue))) {
    saved = common.getSavedValue(variable);
    variable.value = saved.value;
    if ("precision" in variable) {
      variable.precision = saved.precision;
    }
    variable.userSet = 1;
    console.log("setting value to saved value: " + variable.value);
  } else if (!haveUserInput ||
             (haveUserInput && (check.useDefaultValue || !check.valid))) {
    if ("defaultFunction" in variable) {
      defaultValue = variable.defaultFunction(variable.defaultArgs);
    } else {
      defaultValue = variable.defaultValue;
    }
    console.log("setting value to default: " + defaultValue);
    variable.value = defaultValue;
    variable.userSet = 0;
    if ("precision" in variable) {
      if (variable.precision < variable.minPrecision) {
        variable.precision = variable.minPrecision;
      }
    } else if ("minPrecision" in variable) {
      variable.precision = variable.minPrecision;
    }
  } else {
    variable.value = check.value;
    console.log("set value to input: " + variable.value);
    // get and set the precision
    if ("precision" in variable) {
      variable.precision = common.getPrecision(inputString);
      if (variable.precision < variable.minPrecision) {
        variable.precision = variable.minPrecision;
      }
    }
    if (!isNaN(variable.value) && variable.value != "") {
      // convert to metric, so that 'value' is always in metric
      if (("convertToMetric" in variable) &&
          window[variable.parent]["units"].value == "imperial") {
        // console.log("  converting " + variable.value + " to metric");
        variable.value = variable.convertToMetric(variable.value);
        console.log("  metric value is " + variable.value);
      }
    }
    variable.userSet = 1;
  }

  // update values (and HTML, and savedString) of dependent variables
  // if they are default
  if ("dependents" in variable) {
    console.log("  updating " + variable.dependents.length +
                " dependents for " + variable.id);
    for (idx = 0; idx < variable.dependents.length; idx++) {
      var dependent = variable.dependents[idx];
      console.log("  processing dependent variable " + dependent.id);
      if (!dependent.userSet) {
        if ("defaultFunction" in dependent) {
          defaultValue = dependent.defaultFunction(dependent.defaultArgs);
          console.log("      dependent default is " + defaultValue);
        } else {
          defaultValue = dependent.defaultValue;
          console.log("      dependent default = " + defaultValue);
        }
        dependent.value = defaultValue;
        common.updateHTML(dependent);
      }
    }
    // console.log("(done with dependents)");
  }

  // update HTML
  if (variable.inputType == "radioButton") {
    console.log("setting radiobutton " + variable.id + " to be " +
                variable.value);
    if (document.getElementById(variable.value)) {
      document.getElementById(variable.value).checked = true;
    }
  } else if (variable.inputType == "checkbox") {
    console.log("setting checkbox " + variable.id + " to be " +
                variable.value);
    if (document.getElementById(variable.id)) {
      document.getElementById(variable.id).checked = variable.value;
    }
  } else if (variable.inputType == "select") {
    console.log("setting select " + variable.id + " to be " +
                variable.value);
    if (document.getElementById(variable.id)) {
      document.getElementById(variable.id).value = variable.value;
    }
    if (document.getElementById(variable.id) &&
        document.getElementById(variable.id).style) {
      if (!variable.userSet && ("defaultColor" in variable)) {
        console.log("  setting color to default for " + variable.id);
        document.getElementById(variable.id).style.color=variable.defaultColor;
      } else {
        document.getElementById(variable.id).style.color = "black";
      }
    }
  } else {
    common.updateHTML(variable);
  }

  // save or unset value
  if (variable.userSet) {
    console.log("SETTING " + variable.id);
    common.setSavedValue(variable, haveUserInput);
  } else {
    common.unsetSavedValue(variable, haveUserInput);
  }

  // process special cases, e.g. make sure kettle opening < kettle diameter
  // or setting table of number of hop additions
  // console.log(Object.keys(variable));
  if ("additionalFunction" in variable) {
    console.log("Processing additional function : " +
                variable.additionalFunction.name);
    // if (typeof variable.additionalFunctionArgs != "function") {
      // console.log("args = " + variable.additionalFunctionArgs);
    // }
    variable.additionalFunction(variable.additionalFunctionArgs);
  }

  // if we have user input, then update now
  if (haveUserInput && variable.updateFunction != undefined) {
    if (variable.updateFunctionArgs == undefined) {
      variable.updateFunction();
    } else {
      variable.updateFunction(variable.updateFunctionArgs);
    }
  }

  // if input wasn't valid, focus on this input window
  if (haveUserInput && !check.valid && document.getElementById(variable.id)) {
    document.getElementById(variable.id).focus();
  }
}

//------------------------------------------------------------------------------

this.updateHTML = function(variable) {
  var isNumber = true;
  var outputNumber = 0.0;

  // console.log("UPDATING HTML for " + variable.id +
               // " with value " + variable.value);
  isNumber = false;
  outputNumber = variable.value;
  if (!isNaN(outputNumber) && outputNumber != "") {
    outputNumber = parseFloat(outputNumber);
    isNumber = true;
    }

  // convert output to imperial units, if necessary
  if (isNumber && "convertToImperial" in variable &&
      window[variable.parent]["units"] &&
      window[variable.parent]["units"].value == "imperial") {
    outputNumber = variable.convertToImperial(outputNumber);
  }

  // format the output properly: set precision, variable precision, int,
  // or nothing specific.  Convert to string.
  if ("precision" in variable && variable.precision >= 0 && isNumber) {
    // console.log("setting precision to " + variable.precision);
    if (!isNaN(outputNumber)) {
      variable.display = outputNumber.toFixed(variable.precision);
    } else {
      variable.display = variable.value;
    }
  } else if ("precision" in variable && variable.precision < 0 && isNumber) {
    var precision = variable.precision * -1;
    // console.log("precision initially " + precision);
    while (outputNumber != 0 && outputNumber.toFixed(precision) == 0) {
      precision += 1;
      // console.log("precision is now " + precision);
    }
    precision += 1; // add one to prevent inappropriate rounding
    variable.display = outputNumber.toFixed(precision);
    // console.log("input = " + variable.value + " -> display " +
                  // variable.display);
  } else if (variable.inputType == "int") {
    variable.display = outputNumber.toFixed(0);
  } else if (variable.inputType == "string") {
    variable.display = variable.value;
  } else if (variable.inputType == "time") {
    if (window[variable.parent]["timeUnits"]) {
      variable.display = common.convertTimeToStr(variable.value,
                             window[variable.parent]["timeUnits"].value,
                             variable.overrideTimeFormat);
    } else {
      variable.display = common.convertTimeToStr(variable.value, "24",
                             variable.overrideTimeFormat);
    }
  } else {
    variable.display = outputNumber.toString();
  }

  // update HTML (and font color)
  if (document.getElementById(variable.id)) {
    // if ("precision" in variable) {
      // console.log("UPDATING "+variable.id + " HTML to " + variable.display +
                // " with precision " + variable.precision);
    // } else {
      // console.log("UPDATING "+variable.id + " HTML to " + variable.display);
    // }
    document.getElementById(variable.id).value = variable.display;

    if ("inputType" in variable) {
      if (!variable.userSet && ("defaultColor" in variable)) {
        // console.log("  setting color to default for " + variable.id);
        document.getElementById(variable.id).style.color=variable.defaultColor;
      } else {
        document.getElementById(variable.id).style.color = "black";
      }
    }
  }
  return true;
}


//------------------------------------------------------------------------------
// TIME CONVERSION
// JPH TODO : implement 24hour conversion

this.convertTimeToStr = function(timeFloat, timeUnits, overrideTimeFormat) {
  var timeStr = "";
  var ampm = "";
  var precision = 0;
  var timePatternMin = "^([0-5][0-9])$";

  // console.log("in convertTimeToStr(" + timeFloat + ", " + timeUnits +
              // ", " + overrideTimeFormat + ")");
  if (timeFloat < 0.0 || timeFloat == "") {
    return "";
  }

  // if it's not a number or only 2 digits, assume it's already in time format.
  if (isNaN(timeFloat) || timeFloat.toString().match(timePatternMin)) {
    return timeFloat;
  }

  timeStr = timeFloat.toString();
  precision = common.getPrecision(timeStr);
  // if there are only 2 places past the decimal, assume already in time format
  if (precision == 2) {
    return timeFloat;
  }

  // if there aren't 8 places past the decimal, something went wrong
  if (precision != 8) {
    console.log("Time string = '" + timeStr + "', precision = " + precision);
    window.alert("Time is in unknown format: precision neither 2 nor 8");
    return timeFloat;
  }

  // override time format if needed
  if (overrideTimeFormat == "24") {
    timeUnits = "24";
  }
  if (overrideTimeFormat == "12") {
    timeUnits = "12";
  }

  var hrs = Math.floor(timeFloat);
  var min = Math.round((timeFloat - hrs) * 60.0);
  if (min < 10) {
    min = "0" + min;
  }
  if (timeUnits == "24" && overrideTimeFormat != "noAMPM") {
    if (hrs < 10) {
      hrs = "0" + hrs;
    }
    timeStr = hrs + ":" + min;
  } else {
    ampm = "am";
    if (hrs == 12) {
      ampm = "pm";
    }
    if (hrs >= 13) {
      hrs -= 12;
      ampm = "pm";
    }
    if (overrideTimeFormat == "noAMPM") {
      ampm = "";
    }
    timeStr = hrs + ":" + min + " " + ampm;
  }
  // console.log("leaving convertTimeToStr() with " + timeStr);
  return timeStr;
}

//------------------------------------------------------------------------------
// UNIT CONVERSION

this.convertMetersToFeet = function(input) {
  var output = input * 3.280839895;
  return output;
}

this.convertFeetToMeters = function(input) {
  var output = input / 3.280839895;
  return output;
}

this.convertCmToInches = function(input) {
  var output = input / 2.54;
  return output;
}

this.convertInchesToCm = function(input) {
  var output = input * 2.54;
  return output;
}

this.convertLitersToOunces = function(input) {
  var output = 128.0 * input / 3.78541;
  return output;
}

this.convertLitersToGallons = function(input) {
  var output = input / 3.78541;
  return output;
}

this.convertGallonsToLiters = function(input) {
  var output = input * 3.78541;
  return output;
}

this.convertOuncesToLiters = function(input) {
  var output = (input/128.0) * 3.78541;
  return output;
}

this.convertFahrenheitToCelsiusSlope = function(input) {
  var output = input / 1.8; // 'F to 'C slope component
  return output;
}

this.convertCelsiusToFahrenheitSlope = function(input) {
  var output = input * 1.8; // 'C to 'F slope component
  return output;
}

this.convertFahrenheitToCelsius = function(input) {
  var output = (input - 32.0) / 1.8;
  return output;
}

this.convertCelsiusToFahrenheit = function(input) {
  var output = (input * 1.8) + 32.0;
  return output;
}

this.convertFahrenheitToCelsius = function(input) {
  var output = (input - 32.0) * 5.0/9.0;
  return output;
}

this.convertKelvinToCelsius = function(temp_K) {
  var temp_C = temp_K - 273.15;
  return Number(temp_C);
}

this.convertCelsiusToKelvin = function(temp_C) {
  var temp_K = temp_C + 273.15;
  return Number(temp_K);
}

this.convertOuncesToGrams = function(input) {
  var output = input * 28.3496;
  return output;
}

this.convertGramsToOunces = function(input) {
  var output = input / 28.3496;
  return output;
}

this.convertSGToPlato = function(input) {
  // formula from Jean De Clerck's A Textbook of Brewing (1957)
  // https://beerandbrewing.com/specific-gravity-or-just-a-matter-of-degree/
  var output = (-205.347*input*input) + (668.72*input) - 463.37;
  return output;
}

this.convertPlatoToSG = function(input) {
  // the inverse of De Clerck's formula
  var output = (-668.72 + Math.sqrt(447186.438 + (821.388*(-463.37-input)))) /
               -410.694;
  return output;
}

this.convertOzToMl = function(input) {
  var output = input * 29.5735;
  return output;
}

this.convertMlToOz = function(input) {
  var output = input / 29.5735;
  return output;
}

this.convertTspToMl = function(input) {
  var output = input * 4.92892;
  return output;
}

this.convertMlToTsp = function(input) {
  var output = input / 4.92892;
  return output;
}

//------------------------------------------------------------------------------
// SAVE AND LOAD VALUES (without filesystem)

this.clearSavedValues = function() {
  if (typeof(Storage) == "undefined") {
    return true;
  }
  console.log("CLEARING LOCAL STORAGE");
  // for (var a in localStorage) {
  //   console.log("  variable " + a + " = " + localStorage[a]);
  // }
  localStorage.clear();
  location.reload();
  return true;
}

//------------------------------------------------------------------------------

this.setSavedValue = function(variable, doSave) {
  if (typeof(Storage) == undefined) {
    return false;
  }
  localStorage.setItem(variable.id, variable.value);
  if ("precision" in variable) {
    localStorage.setItem(variable.id + ".precision", variable.precision);
  }
  return true;
}

//------------------------------------------------------------------------------

this.unsetSavedValue = function(variable, doSave) {
  if (typeof(Storage) == undefined) {
    return false;
  }
  localStorage.removeItem(variable.id);
  if ("precision" in variable) {
    localStorage.removeItem(variable.id + ".precision", variable.precision);
  }
  return true;
}

//------------------------------------------------------------------------------

this.getSavedValue = function(variable) {
  var saved = new Object();

  if (typeof(Storage) == undefined) {
    return false;
  }
  if (localStorage.getItem(variable.id) == null) {
    return false;
  }

  saved.value = localStorage.getItem(variable.id);
  if (variable.inputType == "float" || variable.inputType == "int") {
    saved.value = Number(saved.value);
  }
  if (variable.inputType == "checkbox") {
    if (saved.value === "true") {
      saved.value = true;
    } else {
      saved.value = false;
    }
  }
  if ("precision" in variable) {
    saved.precision = localStorage.getItem(variable.id + ".precision");
    saved.precision = Number(saved.precision);
  }

  return saved;
}

//------------------------------------------------------------------------------

this.existsSavedValue = function(variable) {
  if (typeof(Storage) == undefined) {
    return false;
  }

  if (localStorage.getItem(variable.id) == null) {
    return false;
  } else {
    return true;
  }
}


//------------------------------------------------------------------------------
// SAVE AND LOAD VALUES TO/FROM FILE

this.saveToFile = function(defaultFilename) {
  var data; // blob data
  var link; // link to object URL to be downloaded
  var text = "";
  var varInfo = "";
  var varName = "";
  var varNameList = [];

  if (typeof(Storage) == "undefined") {
    window.alert("Can't save to file; no local storage");
    return false;
  }

  console.log("SAVING TO FILE:");
  // create the text data to save by going through all of the local storage
  varNameList = Object.keys(localStorage).sort();
  // console.log("list = " + varNameList);
  text = "";
  for (varName of varNameList) {
    varInfo = "  " + varName + ' = "' + localStorage[varName] + '";\n';
    console.log(varInfo);
    text += varInfo;
  }

  // create a link and blob of data
  link = document.createElement('a');
  data = new Blob([text], {type: 'text/plain'});

  // set the link attribute to 'download' with default filename,
  // and set the reference in the link to the data blob.
  link.setAttribute('download', defaultFilename);
  link.href = window.URL.createObjectURL(data);

  // append a child to the document with the link to the blob
  document.body.appendChild(link);

  // virtually click on the link containing the object URL to download it
  var event = new MouseEvent('click');
  link.dispatchEvent(event);

  // free up memory used by the generted object URL, remove the link
  window.URL.revokeObjectURL(link.href);
  document.body.removeChild(link);

  return true;
}

//------------------------------------------------------------------------------

this.loadFromFile = function(files) {
  var file = files[0];
  var reader = new FileReader();

  reader.readAsText(file);

  reader.onload = function(event) {
    var contents = event.target.result;
    var formattedValue = "";
    var key = "";
    var keyValueList = contents.split("\n");
    var value = "";

    common.clearSavedValues();
    console.log("LOADING FROM FILE:");
    for (keyValue of keyValueList) {
      key = keyValue.split("=")[0].trim();
      // replace any 'boilTimeTable' with 'steepTimeTable' (backward compatible)
      key = key.replace(/boilTimeTable/, "steepTimeTable");
      if (key.length > 0) {
        formattedValue = keyValue.split(/=(.+)/)[1].trim();
        console.log("FORMATTED VALUE: " + formattedValue);
        // get whatever is between " and "; and put it in 'value'
        if (formattedValue != "\"\";") {
          value = formattedValue.match(/(")(.+)(";)/)[2];
        } else {
          value = "";
        }
        console.log("  setting " + key + " = '" + value + "'");
        localStorage.setItem(key, value);
      }
    }
    location.reload();
  }

  return true;
}

//------------------------------------------------------------------------------


// close the "namespace" and call the function to construct it.
}
common._construct();
