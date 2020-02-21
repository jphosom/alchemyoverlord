// -----------------------------------------------------------------------------
// common.js : JavaScript for AlchemyOverlord web page, common functions
// Written by John-Paul Hosom
// Copyright © 2018 by John-Paul Hosom, all rights reserved.
//
// Version 1.2.0 : Jul 15, 2018 : complete re-write under hood; add save/load
// Version 1.2.1 : Jul 18, 2018 : add support for checkbox
// Version 1.2.2 : Dec 29, 2018 : add support for 'select', float or string
// Version 1.3.2 : Feb 20, 2020 : add support for saving/loading files
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
  if (!isNaN(input)) {
    inputValue = Number(input);
    check.valid = true;
    if (inputValue < variable.min || inputValue > variable.max) {
      check.valid = false;
    }
    check.value = inputValue;
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
  var check = new Object();
  var defaultValue;
  var idx = 0;
  var inputString = "";
  var savedValueExists;
  var savedValue;

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
      check.value = document.getElementById(variable.id).checked;
      console.log("CHECKBOX VALUE : " + check.value);
    } else if (variable.inputType == "select") {
      check.useDefaultValue = false;
      check.valid = true;
      check.value = document.getElementById(variable.id).value;
      console.log("SELECT VALUE : " + check.value);
    } else if (variable.inputType == "floatOrString") {
      inputString = document.getElementById(variable.id).value;
      console.log("  input = " + inputString);
      check = validateFloatOrString(variable, inputString);
      console.log("  validate = " + check.valid + ", " + check.useDefaultValue);
      if (!check.valid || check.useDefaultValue) {
        console.log("  input is not valid, or we want the default");
      }
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
    if ("precision" in variable) {
      variable.precision = saved.precision;
    }
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
    if ("precision" in variable) {
      variable.precision = variable.minPrecision;
    }
  } else {
    variable.value = check.value;
    console.log("SET VALUE TO INPUT: " + variable.value);
    // get and set the precision
    if ("precision" in variable) {
      variable.precision = common.getPrecision(inputString);
    }
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
  if (!isNaN(outputNumber)) outputNumber = parseFloat(outputNumber);

  // convert output to imperial units, if necessary
  if (("convertToImperial" in variable) && ibu.units.value == "imperial") {
    outputNumber = variable.convertToImperial(outputNumber);
  }

  // format the output properly: set precision, variable precision, int,
  // or nothing specific.  Convert to string.
  if ("precision" in variable && variable.precision >= 0) {
    // console.log("setting precision to " + variable.precision);
    if (!isNaN(outputNumber)) {
      variable.display = outputNumber.toFixed(variable.precision);
    } else {
      variable.display = variable.value;
    }
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
    if ("precision" in variable) {
      console.log("UPDATING " + variable.id + " HTML to " + variable.display +
                " with precision " + variable.precision);
    } else {
      console.log("UPDATING " + variable.id + " HTML to " + variable.display);
    }
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
// SAVE AND LOAD VALUES (without filesystem)

this.clearSavedValues = function() {
  if (typeof(Storage) == "undefined") {
    return true;
  }
  console.log("CLEARING LOCAL STORAGE:");
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
  var text = "";
  var link; // link to object URL to be downloaded
  var data; // blob data
  var varNameList = [];
  var varName = "";
  var varInfo = "";

  if (typeof(Storage) == "undefined") {
    window.alert("Can't save to file; no local storage");
    return false;
  }

  // create the text data to save by going through all of the local storage
  varNameList = Object.keys(localStorage).sort();
  // console.log("list = " + varNameList);
  text = "";
  for (varName of varNameList) {
    varInfo = varName + ' = "' + localStorage[varName] + '";\n';
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
    var keyValueList = contents.split("\n");
    var key = "";
    var formattedValue = "";
    var value = "";

    common.clearSavedValues();
    for (keyValue of keyValueList) {
      key = keyValue.split("=")[0].trim();
      if (key.length > 0) {
        formattedValue = keyValue.split("=")[1].trim();
        // get whatever is between " and "; and put it in 'value'
        value = formattedValue.match(/(")(.+)(";)/)[2];
        console.log("setting " + key + " = '" + value + "'");
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
