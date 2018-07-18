// -----------------------------------------------------------------------------
// common.js : JavaScript for AlchemyOverlord web page, common functions
// Written by John-Paul Hosom
// Version 1.2.0 : Jul 15, 2018 : complete re-write under hood; add save/load
// Version 1.2.1 : Jul 18, 2018 : add support for checkbox
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
//
//   FUNCTIONS FOR SAVING AND LOADING PARAMETERS:
//   . clearSavedValues()
//   . setSavedValue()
//   . unsetSavedValue()
//   . getSavedValue()
//   . existsSavedValue()

common._construct = function() {

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

  if (!check.valid) {
    window.alert("For " + variable.description + ", input '" + input +
                 "' is not valid.");
  }

  return check;
}

//------------------------------------------------------------------------------

this.getPrecision = function(valueString) {
  var dotIndex = valueString.indexOf(".");
  var precision = 0;

  if (dotIndex >= 0) {
    precision = valueString.length - dotIndex - 1;
    if (precision > 6) {
      precision = 6;
    }
    return precision;
  } else {
    return 0;
  }
}

//------------------------------------------------------------------------------

this.set = function(variable, haveUserInput) {
  var savedValueExists;
  var savedValue;
  var inputString = "";
  var defaultValue;
  var check = new Object();
  var idx = 0;

  console.log("\n");
  console.log("------------------- SET " + variable.id + " ------------------");

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
      // var query = "input[name='"+variable.id+"']:checked";
      // check.value = document.querySelector(query).value;
      check.value = document.getElementById(variable.id).checked;
      console.log("CHECKBOX VALUE : " + check.value);
      } else {
      inputString = document.getElementById(variable.id).value;
      console.log("  input = " + inputString);
      check = validate(variable, inputString);
      console.log("  validate = " + check.valid + ", " + check.useDefaultValue);
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
    variable.precision = saved.precision;
    variable.userSet = 1;
    console.log("SETTING VALUE TO OLD VALUE: " + variable.value);
  } else if (!haveUserInput ||
             (haveUserInput && (check.useDefaultValue || !check.valid))) {
    console.log("SETTING VALUE TO DEFAULT");
    if ("defaultFunction" in variable) {
      defaultValue = variable.defaultFunction(variable.defaultArgs);
      console.log("  default is " + defaultValue);
    } else {
      defaultValue = variable.defaultValue;
    }
    variable.value = defaultValue;
    variable.userSet = 0;
    variable.precision = variable.minPrecision;
  } else {
    variable.value = check.value;
    console.log("SET VALUE TO INPUT: " + variable.value);
    // get and set the precision
    variable.precision = common.getPrecision(inputString);
    // convert to metric, so that 'value' is always in metric
    if (("convertToMetric" in variable) &&
        window[variable.parent]["units"].value == "imperial") {
      console.log("  converting " + variable.value + " to metric");
      variable.value = variable.convertToMetric(variable.value);
      console.log("  metric value is " + variable.value);
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
    console.log("(done with dependents)");
  }

  // update HTML
  if (variable.inputType == "radioButton") {
    console.log("setting radiobutton " + variable.id + " to be " +
                variable.value);
    document.getElementById(variable.value).checked = true;
    } else if (variable.inputType == "checkbox") {
    console.log("setting checkbox " + variable.id + " to be " +
                variable.value);
    document.getElementById(variable.id).checked = variable.value;
    } else {
    common.updateHTML(variable);
    }

  // save or unset value
  if (variable.userSet) {
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
    if (typeof variable.additionalFunctionArgs != "function") {
      console.log("args = " + variable.additionalFunctionArgs);
    }
    variable.additionalFunction(variable.additionalFunctionArgs);
  }

  // if we have user input, then update now
  if (haveUserInput) {
    variable.updateFunction();
  }
}

//------------------------------------------------------------------------------

this.updateHTML = function(variable) {
  var outputNumber = 0.0;

  // console.log("UPDATING HTML for " + variable.id);
  outputNumber = variable.value;

  // convert output to imperial units, if necessary
  if (("convertToImperial" in variable) &&
      window[variable.parent]["units"].value == "imperial") {
    outputNumber = variable.convertToImperial(outputNumber);
  }

  // format the output properly: set precision, variable precision, int,
  // or nothing specific.  Convert to string.
  if ("precision" in variable && variable.precision >= 0) {
    // console.log("setting precision to " + variable.precision);
    variable.display = outputNumber.toFixed(variable.precision);
  } else if ("precision" in variable && variable.precision < 0) {
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
  } else {
    variable.display = outputNumber.toString();
  }

  // update HTML (and font color)
  if (document.getElementById(variable.id)) {
    console.log("UPDATING " + variable.id + " HTML to be " + variable.display +
                " with precision " + variable.precision);
    document.getElementById(variable.id).value = variable.display;

    if (("inputType" in variable) && variable.inputType != "radioButton" &&
        variable.inputType != "checkbox") {
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
// UNIT CONVERSION

this.convertCmToInches = function(input) {
  var output = input / 2.54;
  return output;
}

this.convertInchesToCm = function(input) {
  var output = input * 2.54;
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

//------------------------------------------------------------------------------
// SAVE AND LOAD VALUES

this.clearSavedValues = function() {
  if (typeof(Storage) == "undefined") {
    return true;
  }
  console.log("CLEARING LOCAL STORAGE:");
  for (var a in localStorage) {
   console.log("  variable " + a + " = " + localStorage[a]);
  }
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

// close the "namespace" and call the function to construct it.
}
common._construct();
