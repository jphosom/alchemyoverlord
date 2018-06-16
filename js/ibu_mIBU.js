// -----------------------------------------------------------------------------
// ibu_mIBU.js : JavaScript for AlchemyOverlord web page, mIBU sub-page
// Written by John-Paul Hosom
//
// Copyright © 2018 John-Paul Hosom, all rights reserved.
//
// Version 1.0.1 : May 6, 2018
//         This version is based off of the original Tinseth IBU javascript
//         code in this project, with many modifications and enhancements
//         for mIBU functionality, adjusting volume and SG over boil, adding
//         a global scaling factor, accounting for partial boils, etc.
// 
// Version 1.1.0 : May 23, 2018
//         . Add 'kettle diameter' and 'kettle opening diameter' fields to 
//           compute wort exposed surface area and opening area.
//         . Make linear and exponential post-boil temperature decrease
//           default values dependent on volume, wort exposed surface area
//           (via kettle diameter), and kettle opening area.
//         . Make exponential decay the default temperature-decrease function.
//         . Bug fix: apply relative utilization/volume to IBU, not rate const.
//
// Version 1.1.1 : June 15, 2018
//         . minor update to exponential temp decay rate constant prediction
//         . bug fix in linear temp. decay defaults
//
// TODO:
// 1. save and load settings with cookies
// 2. add correction factor for pellets
// 3. add correction factor for pH
// -----------------------------------------------------------------------------

// Global Variables

// temperature decay function: exponential parameters
var tempExpParamA = get_tempExpParamA_default();
var tempExpParamB = get_tempExpParamB_default();
var tempExpParamC = get_tempExpParamC_default();
var tempExpParamA_userSet = 0;
var tempExpParamB_userSet = 0;
var tempExpParamC_userSet = 0;
var tempExpParamA_str = "";
var tempExpParamB_str = "";
var tempExpParamC_str = "";

// temperature decay function: linear parameters
var tempLinParamA = get_tempLinParamA_default();
var tempLinParamB = get_tempLinParamB_default();
var tempLinParamA_userSet = 0;
var tempLinParamB_userSet = 0;
var tempLinParamA_str = "";
var tempLinParamB_str = "";

// temperature decay function: input field description
var formStrP1 = "<span id=\"";
var formStrP2 = "\"> <input type=\"text\" STYLE=\"text-align:right\" size=4 value=\"";
var formStrP3 = "\" autocomplete=\"off\" id=\"";
var formStrP4 = "\" onchange=\"";
var formStrP5 = "\"></span>";

var junk = 0;
var color_userSet = "black";
var color_default = "#94476b"; // greyish red

// forced-cooling temperature decay, binary flag if user set or default
var immersionDecayFactor_userSet = 0;
var counterflowRate_userSet = 0;
var icebathDecayFactor_userSet = 0;


//------------------------------------------------------------------------------
// set units to metric or British Imperial

function setUnits_mIBU() {
  var isExp = document.getElementById("tempDecayExponential").checked;
  var isMetric = document.getElementById("unitsMetric").checked;
  var numAdd = document.getElementById("numAdd").value;
  var rate = 0.0;
  var volume = 0.0;
  var kettle_diameter = 0.0;
  var opening_diameter = 0.0;
  var weight = 0.0;

  if (isMetric) {
    // update units
    document.getElementById('volumeUnits').innerHTML = "liters";
    document.getElementById('weightUnits').innerHTML = "g";
    document.getElementById('tempUnits').innerHTML = "&deg;C";
    document.getElementById('rateUnits').innerHTML = "liters/min";
    document.getElementById('topoffUnits').innerHTML = "liters";
    document.getElementById('wortLossUnits').innerHTML = "liters";
    document.getElementById('evaporationUnits').innerHTML = "liters/hr";
    document.getElementById('kettle_diameterUnits').innerHTML = "cm";
    document.getElementById('opening_diameterUnits').innerHTML = "cm";

    // convert temp decay parameters, regardless of whether
    // currently linear or exponential formula
    tempExpParamA = convert_tempExpParamA_toMetric(tempExpParamA);
    tempExpParamB = convert_tempExpParamB_toMetric(tempExpParamB);
    tempExpParamC = convert_tempExpParamC_toMetric(tempExpParamC);
    tempLinParamA = convert_tempLinParamA_toMetric(tempLinParamA);
    tempLinParamB = convert_tempLinParamB_toMetric(tempLinParamB);

    // convert and update counterflow chiller rate
    rate = Number(document.getElementById('counterflowRate').value);
    rate = convertVolumeToLiters(rate);
    document.getElementById('counterflowRate').value = rate.toFixed(2);

    // convert and update volume
    volume = Number(document.getElementById('volume').value);
    volume = convertVolumeToLiters(volume);
    document.getElementById('volume').value = volume.toFixed(2);

    // convert and update kettle diameter
    kettle_diameter = Number(document.getElementById('kettle_diameter').value);
    kettle_diameter = convertDiameterToCentimeters(kettle_diameter);
    document.getElementById('kettle_diameter').value = 
            kettle_diameter.toFixed(2);

    // convert and update opening diameter
    opening_diameter = 
            Number(document.getElementById('opening_diameter').value);
    opening_diameter = convertDiameterToCentimeters(opening_diameter);
    document.getElementById('opening_diameter').value = 
            opening_diameter.toFixed(2);

    // convert and update wort loss volume
    volume = Number(document.getElementById('wortLossVolume').value);
    volume = convertVolumeToLiters(volume);
    document.getElementById('wortLossVolume').value = volume.toFixed(2);

    // convert and update evaporation rate
    rate = Number(document.getElementById('evaporationRate').value);
    rate = convertVolumeToLiters(rate);
    document.getElementById('evaporationRate').value = rate.toFixed(2);

    // convert and update topoff volume (for partial boils)
    volume = Number(document.getElementById('topoffVolume').value);
    volume = convertVolumeToLiters(volume);
    document.getElementById('topoffVolume').value = volume.toFixed(2);

    // convert and update hops weight
    for (idx = 1; idx <= numAdd; idx++) {
      weight = Number(document.getElementById('weight'+idx).value);
      weight = convertWeightToGrams(weight);
      document.getElementById('weight'+idx).value = weight.toFixed(2);
    }
  }
  else {
    // update units
    document.getElementById('volumeUnits').innerHTML = "G";
    document.getElementById('weightUnits').innerHTML = "oz";
    document.getElementById('tempUnits').innerHTML = "&deg;F";
    document.getElementById('rateUnits').innerHTML = "gallons/min";
    document.getElementById('wortLossUnits').innerHTML = "G";
    document.getElementById('evaporationUnits').innerHTML = "G/hr";
    document.getElementById('topoffUnits').innerHTML = "G";
    document.getElementById('kettle_diameterUnits').innerHTML = "inches";
    document.getElementById('opening_diameterUnits').innerHTML = "inches";

    // convert temp decay parameters, regardless of whether
    // currently linear or exponential formula
    tempExpParamA = convert_tempExpParamA_toImperial(tempExpParamA);
    tempExpParamB = convert_tempExpParamB_toImperial(tempExpParamB);
    tempExpParamC = convert_tempExpParamC_toImperial(tempExpParamC);
    tempLinParamA = convert_tempLinParamA_toImperial(tempLinParamA);
    tempLinParamB = convert_tempLinParamB_toImperial(tempLinParamB);

    // convert and update counterflow chiller rate
    rate = Number(document.getElementById('counterflowRate').value);
    rate = convertVolumeToGallons(rate);
    document.getElementById('counterflowRate').value = rate.toFixed(2);

    // convert and update volume
    volume = Number(document.getElementById('volume').value);
    volume = convertVolumeToGallons(volume);
    document.getElementById('volume').value = volume.toFixed(2);

    // convert and update kettle diameter
    kettle_diameter = Number(document.getElementById('kettle_diameter').value);
    kettle_diameter = convertDiameterToInches(kettle_diameter);
    document.getElementById('kettle_diameter').value = 
            kettle_diameter.toFixed(2);

    // convert and update opening diameter
    opening_diameter = 
            Number(document.getElementById('opening_diameter').value);
    opening_diameter = convertDiameterToInches(opening_diameter);
    document.getElementById('opening_diameter').value = 
            opening_diameter.toFixed(2);

    // convert and update wort loss volume (for partial boils)
    volume = Number(document.getElementById('wortLossVolume').value);
    volume = convertVolumeToGallons(volume);
    document.getElementById('wortLossVolume').value = volume.toFixed(2);

    // convert and update evaporation rate
    rate = Number(document.getElementById('evaporationRate').value);
    rate = convertVolumeToGallons(rate);
    document.getElementById('evaporationRate').value = rate.toFixed(2);

    // convert and update topoff volume (for partial boils)
    volume = Number(document.getElementById('topoffVolume').value);
    volume = convertVolumeToGallons(volume);
    document.getElementById('topoffVolume').value = volume.toFixed(2);

    // convert and update hops weight
    for (idx = 1; idx <= numAdd; idx++) {
      weight = Number(document.getElementById('weight'+idx).value);
      weight = convertWeightToOunces(weight);
      document.getElementById('weight'+idx).value = weight.toFixed(2);
    }
  }

  // update temperature decay formula values on web page
  if (isExp) {
    set_tempExpParamA (1);
    set_tempExpParamB (1);
    set_tempExpParamC (1);
  } else {
    set_tempLinParamA (1);
    set_tempLinParamB (1);
  }

  return true;
}

//------------------------------------------------------------------------------
// CONSTRUCT TEMPERATURE DECAY FUNCTION PARAMETER INPUT FIELD

function construct_tempParam(userSet, fieldName, value, valueName,
                             fnName, fieldStr) {
  window[fieldStr] = formStrP1+fieldName+formStrP2+value+
                     formStrP3+valueName+formStrP4+fnName+formStrP5;
  document.getElementById(fieldName).innerHTML = window[fieldStr];

  if (userSet == 1)
    document.getElementById(valueName).style.color = color_userSet;
  else
    document.getElementById(valueName).style.color = color_default;
}

//------------------------------------------------------------------------------
// set type of temperature decay function (linear or exponential)
// Construct a "dummy" innerHTML for tempDecayFormula that at least contains the
// spans that we want to construct, with some bogus values.
// Then, replace the bogus span contents for each variable with real information

function setTempDecayType_mIBU() {
  var isExp = document.getElementById("tempDecayExponential").checked;

  if (isExp) {
    document.getElementById('tempDecayFormula').innerHTML =
      "<span id=\"tempExpParamA_field\">xxx</span>"+
      "  x exp(-1 &times; <span id=\"tempExpParamB_field\">"+
      "xxx</span> &times; time) + <span id=\"tempExpParamC_field\">xxx</span>";
    construct_tempParam(tempExpParamA_userSet, "tempExpParamA_field",
      tempExpParamA, "tempExpParamA", "set_tempExpParamA(0)",
      tempExpParamA_str);
    construct_tempParam(tempExpParamB_userSet, "tempExpParamB_field",
      tempExpParamB, "tempExpParamB", "set_tempExpParamB(0)",
      tempExpParamB_str);
    construct_tempParam(tempExpParamC_userSet, "tempExpParamC_field",
      tempExpParamC, "tempExpParamC", "set_tempExpParamC(0)",
      tempExpParamC_str);
  }
  else {
    document.getElementById('tempDecayFormula').innerHTML =
      "<span id=\"tempLinParamA_field\">xxx</span> &times; time + "+
      "<span id=\"tempLinParamB_field\">xxx</span>";
    construct_tempParam(tempLinParamA_userSet, "tempLinParamA_field",
      tempLinParamA, "tempLinParamA", "set_tempLinParamA(0)",
      tempLinParamA_str);
    construct_tempParam(tempLinParamB_userSet, "tempLinParamB_field",
      tempLinParamB, "tempLinParamB", "set_tempLinParamB(0)",
      tempLinParamB_str);
  }

  computeIBU();

  return true;
}


//------------------------------------------------------------------------------
// set the exponential decay factor for an immersion chiller

function set_immersionDecayFactor(volumeChange) {
  var immersionDecayFactor =
         document.getElementById('immersionDecayFactor').value;
  var immersionDefault = get_immersionDecayFactor_default();
  if (!volumeChange) {
    immersionDecayFactor_userSet = 1;
    immersionDecayFactor = validateNumber(immersionDecayFactor, 0.00001, 100.0,
         -1, immersionDefault, "immersion decay factor",
         document.getElementById('immersionDecayFactor'),
         "immersionDecayFactor_userSet");
  } else {
    if (immersionDecayFactor_userSet) {
      document.getElementById('immersionDecayFactor').value =
                immersionDecayFactor;
    } else {
      immersionDecayFactor = immersionDefault;
      document.getElementById('immersionDecayFactor').value = immersionDefault;
    }
  }
  if (immersionDecayFactor_userSet == 1)
    document.getElementById('immersionDecayFactor').style.color = color_userSet;
  else
    document.getElementById('immersionDecayFactor').style.color = color_default;

  if (!volumeChange) {
    computeIBU();
  }
  return true;
}

//------------------------------------------------------------------------------
// set the exponential decay factor for an icebath chiller

function set_icebathDecayFactor(volumeChange) {
  var icebathDecayFactor = document.getElementById('icebathDecayFactor').value;
  var icebathDefault = get_icebathDecayFactor_default();
  if (!volumeChange) {
    icebathDecayFactor_userSet = 1;
    icebathDecayFactor = validateNumber(icebathDecayFactor, 0.00001, 100.0,
         -1, icebathDefault, "ice-bath decay factor",
         document.getElementById('icebathDecayFactor'),
         "icebathDecayFactor_userSet");
  } else {
    if (icebathDecayFactor_userSet) {
      document.getElementById('icebathDecayFactor').value =  icebathDecayFactor;
    } else {
      icebathDecayFactor = icebathDefault;
      document.getElementById('icebathDecayFactor').value = icebathDefault;
    }
  }
  if (icebathDecayFactor_userSet == 1)
    document.getElementById('icebathDecayFactor').style.color = color_userSet;
  else
    document.getElementById('icebathDecayFactor').style.color = color_default;

  if (!volumeChange) {
    computeIBU();
  }
  return true;
}

//------------------------------------------------------------------------------
// set the flow rate for a counterflow wort chiller

function set_counterflowRate(userSet) {
  var counterflowRate = document.getElementById('counterflowRate').value;
  var counterflowRate_default = get_counterflowRate_default();
  if (userSet) {
    counterflowRate_userSet = 1;
  }
  counterflowRate = validateNumber(counterflowRate, 0.0, 100.0, 2,
     counterflowRate_default, "counterflow chiller wort transfer rate",
     document.getElementById('counterflowRate'), "counterflowRate_userSet");
  if (counterflowRate_userSet == 1)
    document.getElementById('counterflowRate').style.color = color_userSet;
  else
    document.getElementById('counterflowRate').style.color = color_default;

  computeIBU();
  return true;
}

//------------------------------------------------------------------------------

function set_volume() {
  var volumeDefault = get_volume_default();
  var volume = document.getElementById('volume').value;
  var isExp = document.getElementById("tempDecayExponential").checked;

  volume = validateNumber(volume, 0, 5000, 2, volumeDefault,
                      "volume", document.getElementById('volume'), junk);
  set_immersionDecayFactor(1);
  set_icebathDecayFactor(1);
  if (isExp) {
    set_tempExpParamB(1);
    if (!tempLinParamA_userSet) {
      tempLinParamA = get_tempLinParamA_default();
    }
  } else {
    set_tempLinParamA(1);
    if (!tempExpParamB_userSet) {
      tempExpParamB = get_tempExpParamB_default();
    }
  }
  computeIBU();
}


//------------------------------------------------------------------------------

function set_kettle_diameter() {
  var kettle_diameterDefault = get_kettle_diameter_default();
  var kettle_diameter = document.getElementById('kettle_diameter').value;
  var opening_diameter = document.getElementById('opening_diameter').value;
  var isExp = document.getElementById("tempDecayExponential").checked;

  kettle_diameter = validateNumber(kettle_diameter, 0, 500, 2, 
          kettle_diameterDefault, "kettle diameter", 
          document.getElementById('kettle_diameter'), junk);

  // make sure opening diameter is not greater than kettle diameter
  if (opening_diameter > kettle_diameter) {
    window.alert("Opening diameter (" + opening_diameter + ") can't be " + 
                 "greater than kettle diameter (" + kettle_diameter + "). " + 
                 "Setting opening diameter to kettle diameter.");
    document.getElementById('opening_diameter').value = kettle_diameter;
  }

  if (isExp) {
    set_tempExpParamB(1);
    if (!tempLinParamA_userSet) {
      tempLinParamA = get_tempLinParamA_default();
    }
  } else {
    set_tempLinParamA(1);
    if (!tempExpParamB_userSet) {
      tempExpParamB = get_tempExpParamB_default();
    }
  }
  computeIBU();
}

//------------------------------------------------------------------------------

function set_opening_diameter() {
  var opening_diameterDefault = get_opening_diameter_default();
  var opening_diameter = document.getElementById('opening_diameter').value;
  var kettle_diameter = document.getElementById('kettle_diameter').value;
  var isExp = document.getElementById("tempDecayExponential").checked;

  opening_diameter = validateNumber(opening_diameter, 0, 500, 2, 
          opening_diameterDefault, "opening diameter", 
          document.getElementById('opening_diameter'), junk);

  // make sure opening diameter is not greater than kettle diameter
  if (opening_diameter > kettle_diameter) {
    window.alert("Opening diameter (" + opening_diameter + ") can't be " + 
                 "greater than kettle diameter (" + kettle_diameter + "). " + 
                 "Setting opening diameter to kettle diameter.");
    document.getElementById('opening_diameter').value = kettle_diameter;
  }
  
  if (isExp) {
    set_tempExpParamB(1);
    if (!tempLinParamA_userSet) {
      tempLinParamA = get_tempLinParamA_default();
    }
  } else {
    set_tempLinParamA(1);
    if (!tempExpParamB_userSet) {
      tempExpParamB = get_tempExpParamB_default();
    }
  }
  computeIBU();
}


//------------------------------------------------------------------------------
// SET TEMPERATURE DECAY PARAMETER VALUES

function set_tempExpParamA (unitConversion) {
  var tempExpParamA_default = get_tempExpParamA_default();

  if (!unitConversion) {
    tempExpParamA_userSet = 1;
    tempExpParamA = document.getElementById('tempExpParamA').value;
    tempExpParamA = validateNumber(tempExpParamA, 0, 300, 2,
         tempExpParamA_default, "temp decay param A",
         document.getElementById('tempExpParamA'), "tempExpParamA_userSet");
  } else {
    if (tempExpParamA_userSet) {
      document.getElementById('tempExpParamA').value = tempExpParamA.toFixed(3);
    } else {
      tempExpParamA = tempExpParamA_default;
      document.getElementById('tempExpParamA').value =
          tempExpParamA_default.toFixed(2);
    }
  }
  if (tempExpParamA_userSet == 1)
    document.getElementById('tempExpParamA').style.color = color_userSet;
  else
    document.getElementById('tempExpParamA').style.color = color_default;

  if (!unitConversion) {
    computeIBU();
  }
  return;
}

function set_tempExpParamB (unitConversion) {
  var tempExpParamB_default = get_tempExpParamB_default();

  if (!unitConversion) {
    tempExpParamB_userSet = 1;
    tempExpParamB = document.getElementById('tempExpParamB').value;
    tempExpParamB = validateNumber(tempExpParamB, 0.0, 1.0, 3,
        tempExpParamB_default, "temp decay param B",
        document.getElementById('tempExpParamB'), "tempExpParamB_userSet");
    } else {
    if (tempExpParamB_userSet) {
      document.getElementById('tempExpParamB').value = tempExpParamB.toFixed(4);
      } else {
      tempExpParamB = tempExpParamB_default;
      document.getElementById('tempExpParamB').value =
              tempExpParamB_default.toFixed(3);
      }
    }
  if (tempExpParamB_userSet == 1)
    document.getElementById('tempExpParamB').style.color = color_userSet;
  else
    document.getElementById('tempExpParamB').style.color = color_default;

  if (!unitConversion) {
    computeIBU();
  }
  return;
  }

function set_tempExpParamC (unitConversion) {
  var tempExpParamC_default = get_tempExpParamC_default();

  if (!unitConversion) {
    tempExpParamC_userSet = 1;
    tempExpParamC = document.getElementById('tempExpParamC').value;
    tempExpParamC = validateNumber(tempExpParamC, 0.0, 300.0, 2,
        tempExpParamC_default, "temp decay param C",
        document.getElementById('tempExpParamC'), "tempExpParamC_userSet");
  } else {
    if (tempExpParamC_userSet) {
      document.getElementById('tempExpParamC').value = tempExpParamC.toFixed(3);
    } else {
      tempExpParamC = tempExpParamC_default;
      document.getElementById('tempExpParamC').value =
          tempExpParamC_default.toFixed(2);
    }
  }
  if (tempExpParamC_userSet == 1)
    document.getElementById('tempExpParamC').style.color = color_userSet;
  else
    document.getElementById('tempExpParamC').style.color = color_default;

  if (!unitConversion) {
    computeIBU();
  }
  return;
}

function set_tempLinParamA (unitConversion) {
  var tempLinParamA_default = get_tempLinParamA_default();

  if (!unitConversion) {
    tempLinParamA_userSet = 1;
    tempLinParamA = document.getElementById('tempLinParamA').value;
    tempLinParamA = validateNumber(tempLinParamA, -100, 0, 2,
        tempLinParamA_default, "temp decay param A",
        document.getElementById('tempLinParamA'), "tempLinParamA_userSet");
  } else {
    if (tempLinParamA_userSet) {
      document.getElementById('tempLinParamA').value = tempLinParamA.toFixed(3);
    } else {
      tempLinParamA = tempLinParamA_default;
      document.getElementById('tempLinParamA').value =
          tempLinParamA_default.toFixed(2);
    }
  }
  if (tempLinParamA_userSet == 1)
    document.getElementById('tempLinParamA').style.color = color_userSet;
  else
    document.getElementById('tempLinParamA').style.color = color_default;

  if (!unitConversion) {
    computeIBU();
  }
  return;
}

function set_tempLinParamB (unitConversion) {
  var tempLinParamB_default = get_tempLinParamB_default();

  if (!unitConversion) {
    tempLinParamB_userSet = 1;
    tempLinParamB = document.getElementById('tempLinParamB').value;
    tempLinParamB = validateNumber(tempLinParamB, 0.0, 300.0, 2,
        tempLinParamB_default, "temp decay param B",
        document.getElementById('tempLinParamB'), "tempLinParamB_userSet");
  } else {
    if (tempLinParamB_userSet) {
      document.getElementById('tempLinParamB').value = tempLinParamB.toFixed(3);
    } else {
      tempLinParamB = tempLinParamB_default;
      document.getElementById('tempLinParamB').value =
          tempLinParamB_default.toFixed(2);
    }
  }
  if (tempLinParamB_userSet == 1)
    document.getElementById('tempLinParamB').style.color = color_userSet;
  else
    document.getElementById('tempLinParamB').style.color = color_default;

  if (!unitConversion) {
    computeIBU();
  }
  return;
}

//-----------------------------------------------------------------------------
// various unit-conversion functions : temperature decay functions

function convert_tempExpParamA_toMetric(paramA_imperial) {
  var paramA_metric = paramA_imperial / 1.8;  // 'F to 'C slope component
  return Number(paramA_metric.toFixed(2));
}

function convert_tempExpParamA_toImperial(paramA_metric) {
  var paramA_imperial = paramA_metric * 1.8;  // 'C to 'F slope component
  return Number(paramA_imperial.toFixed(2));
}

function convert_tempExpParamB_toMetric(paramB_imperial) {
  var paramB_metric = paramB_imperial;
  return paramB_metric;
}

function convert_tempExpParamB_toImperial(paramB_metric) {
  var paramB_imperial = paramB_metric;
  return paramB_imperial;
}

function convert_tempExpParamC_toMetric(paramC_imperial) {
  var paramC_metric = convertTemperatureToCelsius(paramC_imperial);
  return Number(paramC_metric.toFixed(2));
}

function convert_tempExpParamC_toImperial(paramC_metric) {
  var paramC_imperial = convertTemperatureToFahrenheit(paramC_metric);
  return Number(paramC_imperial.toFixed(2));
}

function convert_tempLinParamA_toMetric(paramA_imperial) {
  var paramA_metric = paramA_imperial / 1.8;  // 'F to 'C slope component
  return Number(paramA_metric.toFixed(2));
}

function convert_tempLinParamA_toImperial(paramA_metric) {
  var paramA_imperial = paramA_metric * 1.8;  // 'C to 'F slope component
  return Number(paramA_imperial.toFixed(2));
}

function convert_tempLinParamB_toMetric(paramB_imperial) {
  var paramB_metric = convertTemperatureToCelsius(paramB_imperial);
  return Number(paramB_metric.toFixed(2));
}

function convert_tempLinParamB_toImperial(paramB_metric) {
  var paramB_imperial = convertTemperatureToFahrenheit(paramB_metric);
  return Number(paramB_imperial.toFixed(2));
}


//------------------------------------------------------------------------------
// compute IBUs and utilization for all hops additions

function computeIBU () {
  var AA;
  var AAconcent = 0.0;
  var AAinit = 0.0;
  var AAinitTotal = 0.0;
  var add = [];  // array of hops additions
  var addIBUoutput;
  var addUtilOutput;
  var averageVolume = 0.0;
  var boilTime;
  var chillingTime = 0.0;
  var coolingMethod =
          document.querySelector('input[name="forcedDecayType"]:checked').value;
  var currentAddition = 0.0;
  var dAA = 0.0;
  var dAAconcent = 0.0;
  var decayRate = 0.0;
  var degreeU = 0.0;
  var effectiveAA = 0.0;
  var evaporationRate = document.getElementById('evaporationRate').value;
  var evaporationRateDefault = get_evaporationRate_default();
  var expParamA = 0.0;
  var expParamB = 0.0;
  var expParamC = 0.0;
  var factor = 0.0;
  var finalVolume = 0.0;
  var finished = 0;
  var IBU = 0.0;
  var IBUscaling = 0.0;
  var icebathBaseTemp = 314.00; // 40.85'C = 105.53'F
  var idx = 0;
  var idxP1 = 0;
  var immersionChillerBaseTemp = 293.15; // 20'C = 68'F
  var integrationTime = 0.0;
  var isMetric = document.getElementById('unitsMetric').checked;
  var isTempDecayLinear = document.getElementById('tempDecayLinear').checked;
  var k = 0.0;
  var linParamA = 0.0;
  var linParamB = 0.0;
  var maxBoilTime = 0.0;
  var numAdd = document.getElementById('numAdd').value;
  var OG = document.getElementById('OG').value;
  var OGpoints = 0.0;
  var postBoilTime = 0.0;
  var postBoilVolume = document.getElementById('volume').value;
  var preAddConcent = 0.0;
  var relativeVolume = 0.0;
  var scalingFactor = document.getElementById('scalingFactor').value;
  var SG = 0.0;
  var SGpoints = 0.0;
  var solLowerThresh = 180.0;
  var solubilityLimit = 0.0;
  var t = 0.0;
  var tableID;
  var tempC = 0.0;
  var tempK = 0.0;
  var topoffVolume = document.getElementById('topoffVolume').value;
  var topoffVolumeDefault = 0.0;
  var totalIBUoutput = 0.0;
  var totalXferTime = 0.0;
  var U = 0.0;
  var useSolubilityLimit =
          document.getElementById('solubilityLimitYes').checked;
  var volume = 0.0;
  var volumeChange = 0.0;
  var volumeDefault = get_volume_default();
  var kettle_diameter = document.getElementById('kettle_diameter').value;
  var opening_diameter = document.getElementById('opening_diameter').value;
  var kettle_diameterDefault = get_kettle_diameter_default();
  var opening_diameterDefault = get_opening_diameter_default();
  var weight;
  var weightDefault = get_weight_default();
  var whirlpoolTime = document.getElementById('whirlpoolTime').value;
  var wortLossVolume = document.getElementById('wortLossVolume').value;
  var wortLossVolumeDefault = 0.0;
  var xferRate = 0.0;

  // if no IBU outputs exist (no table yet), then just return
  if (!document.getElementById("AA1")) {
    return false;
  }
  console.log("==============================================================");

  // check parameters : whirlpool/stand time, volume, cooling method,
  // OG, temperature decay parameters, transfer rate, etc.
  whirlpoolTime = Number(validateNumber(whirlpoolTime, 0, 120, 1, 0.0,
                   "whirlpool and/or hop stand time",
                    document.getElementById('whirlpoolTime'), junk));
  postBoilVolume = Number(validateNumber(postBoilVolume, 0, 5000, 3,
                    volumeDefault, "volume", document.getElementById('volume'),
                    junk));
  wortLossVolume = Number(validateNumber(wortLossVolume, 0, 500, 2,
                    wortLossVolumeDefault, "wort/trub left in kettle",
                    document.getElementById('wortLossVolume'), junk));
  evaporationRate = Number(validateNumber(evaporationRate, 0, 500, 2,
                    evaporationRateDefault, "evaporation rate",
                    document.getElementById('evaporationRate'), junk));
  topoffVolume = Number(validateNumber(topoffVolume, 0, 5000, 2,
                    topoffVolumeDefault, "topoffVolume",
                    document.getElementById('topoffVolume'), junk));
  scalingFactor = Number(validateNumber(scalingFactor, 0.001, 2.0, 2,
                    1.0, "global scaling factor",
                    document.getElementById('scalingFactor'), junk));
  OG = Number(validateNumber(OG, 1.0, 1.150, 3, 1.055, "original gravity",
                    document.getElementById('OG'), junk));
  kettle_diameter = Number(validateNumber(kettle_diameter, 0.0, 500.0, 2,
                    kettle_diameterDefault, "kettle diameter",
                    document.getElementById('kettle_diameter'), junk));
  opening_diameter = Number(validateNumber(opening_diameter, 0.0, 500.0, 2,
                    opening_diameterDefault, "opening diameter",
                    document.getElementById('opening_diameter'), junk));
  console.log("whirlpool time = " + whirlpoolTime +
              ", post-boil volume = " + postBoilVolume +
              ", wort loss volume = " + wortLossVolume + 
              ", topoff volume = " + topoffVolume);
  console.log("evaporation rate = " + evaporationRate +
              ", kettle diameter = " + kettle_diameter + 
              ", opening diameter = " + opening_diameter + 
              ", scaling factor = " + scalingFactor +
              ", OG = " + OG);

  // get stand/whirlpool temperature decay function values from global values
  expParamA = tempExpParamA;
  expParamB = tempExpParamB;
  expParamC = tempExpParamC;
  linParamA = tempLinParamA;
  linParamB = tempLinParamB;

  // get forced cooling function decay rate or transfer rate
  if (coolingMethod == "forcedDecayCounterflow") {
    xferRate = Number(document.getElementById('counterflowRate').value);
    console.log("cooling method = " + coolingMethod + ", rate = " + xferRate);
  } else if (coolingMethod == "forcedDecayImmersion") {
    decayRate = Number(document.getElementById('immersionDecayFactor').value);
    console.log("cooling method = " + coolingMethod + ", rate = " + decayRate);
  } else if (coolingMethod == "forcedDecayIcebath") {
    decayRate = Number(document.getElementById('icebathDecayFactor').value);
    console.log("cooling method = " + coolingMethod + ", rate = " + decayRate);
  }

  // convert to metric if not already
  if (!isMetric) {
    postBoilVolume = convertVolumeToLiters(postBoilVolume);
    wortLossVolume = convertVolumeToLiters(wortLossVolume);
    evaporationRate = convertVolumeToLiters(evaporationRate);
    topoffVolume = convertVolumeToLiters(topoffVolume);
    xferRate = convertVolumeToLiters(xferRate);
    expParamA = convert_tempExpParamA_toMetric(expParamA);
    expParamB = convert_tempExpParamB_toMetric(expParamB);
    expParamC = convert_tempExpParamC_toMetric(expParamC);
    linParamA = convert_tempLinParamA_toMetric(linParamA);
    linParamB = convert_tempLinParamB_toMetric(linParamB);
  }

  // convert temp decay parameters from Celsius to Kelvin
  expParamC = convertCelsiusToKelvin(expParamC);
  linParamB = convertCelsiusToKelvin(linParamB);

  // validate hops numbers, put each item into array as number for easier use
  for (idx = 1; idx <= numAdd; idx++) {
    tableID = "AA"+idx;
    AA = document.getElementById(tableID).value;
    AA = validateNumber(AA, 0.5, 100.0, 2, 8.34, "alpha acid (%)",
                         document.getElementById(tableID), junk);

    tableID = "weight"+idx;
    weight = document.getElementById(tableID).value;
    weight = validateNumber(weight, 0.0, 5000.0, 2, weightDefault,
                        "hops weight", document.getElementById(tableID), junk);

    tableID = "boilTimeTable"+idx;
    boilTime = document.getElementById(tableID).value;
    boilTime = validateNumber(boilTime, -1 * whirlpoolTime, 360.0, 1, 0.0,
                "boil time (min)", document.getElementById(tableID), junk);

    // convert weight to metric if not already
    if (!isMetric) {
      weight = convertWeightToGrams(weight);
    }

    // 'hops' is an object containing properties of the current hops addition
    var hops = new Object();
    hops.AA = Number(AA / 100.0);
    hops.weight = Number(weight);
    hops.time = Number(boilTime);
    hops.AAinit = Number(0.0);
    hops.AAcurr = Number(0.0);
    hops.IBU = Number(0.0);
    hops.U = Number(0.0);

    add.push(hops);
    // console.log("length " + add.length);
    // for (idx2 = 0; idx2 < add.length; idx2++) {
    //   console.log(Object.values(add[idx2]));
    // }
  }


  // find out how long the boil is, or at least how long the hops will steep
  maxBoilTime = 0.0;
  for (idx = 0; idx < numAdd; idx++) {
    boilTime = add[idx].time;
    if (boilTime > maxBoilTime) {
      maxBoilTime = boilTime;
    }
  }
  console.log("maximum boil time is " + maxBoilTime);

  // initialize some variables
  volume = postBoilVolume + (evaporationRate/60.0 * maxBoilTime);
  console.log("volume at first hops addition = " +
              postBoilVolume + " + (" + evaporationRate + "/60.0 * " +
              maxBoilTime + ") = " + volume);
  relativeVolume = 1.0;
  totalXferTime = 0.0;
  U = 0.0;
  IBU = 0.0;
  AAconcent = 0.0;
  AAinitTotal = 0.0;
  tempK = 373.15;
  tempC = convertKelvinToCelsius(tempK);
  degreeU = 1.0;
  integrationTime = 0.01; // minutes
  volumeChange = xferRate * integrationTime;  // for counterflow

  averageVolume = (volume + postBoilVolume) / 2.0;
  OGpoints = (OG - 1.0) * 1000.0;
  SGpoints = OGpoints * averageVolume / postBoilVolume;
  SG = (SGpoints / 1000.0) + 1.0;
  console.log("OG is " + OG.toFixed(4) + ", post-boil volume is " +
              postBoilVolume.toFixed(4) + " and initial volume is " +
              volume.toFixed(4) + ", so *average* gravity is " +
              SG.toFixed(4));


  k = -0.04; // from Tinseth model
  // factor is the conversion factor from utilization to IBU, from Tinseth
  factor = scalingFactor * 1.65 * Math.pow(0.000125,(SG-1.0)) / 4.15;

  // loop over each time point, from maximum time down until no more utilization
  finished = 0;
  for (t = maxBoilTime; finished == 0; t = t - integrationTime) {
    // check to see if add hops at this time point.
    for (idx = 0; idx < numAdd; idx++) {
      boilTime = add[idx].time;
      if (Math.round(t * 1000) == Math.round(boilTime * 1000)) {
        AA = add[idx].AA;
        weight = add[idx].weight;
        // note that AAinit is computed using postBoilVolume because
        // we base IBU off of AAinit, and IBU should be relative to final vol.
        AAinit = AA * weight * 1000 / postBoilVolume;
        console.log("AA=" + AA + ", w=" + weight + ", vol=" + postBoilVolume);
        console.log("at time " + t.toFixed(3) + ", adding hops addition " +
                    idx + " with [AA] = " + AAinit.toFixed(2) +
                    " to existing [AA] = " + AAconcent.toFixed(2));
        add[idx].AAinit = AAinit;
        AAinitTotal = AAinitTotal + AAinit;
        preAddConcent = AAconcent;

        // if use solubility limit, see if we need to change AA concentration
        if (useSolubilityLimit) {
          // if [AA] is above threshold, find out what it would be at this
          // point in time if there was no solubility limit.
          if (AAconcent > solLowerThresh) {
            effectiveAA = -31800.0 / (AAconcent - 356.67);
          } else {
            effectiveAA = AAconcent;
          }
          console.log("    from [AA]=" + AAconcent.toFixed(2) +
                      ", effectiveAA is " +
                      effectiveAA.toFixed(2), ", then adding " +
                      AAinit.toFixed(2));
          effectiveAA = effectiveAA + AAinit;
          if (effectiveAA > solLowerThresh) {
            solubilityLimit = (-31800.0/effectiveAA) + 356.67;
          } else {
            solubilityLimit = solLowerThresh;
          }
          console.log("    from new effective [AA]=" + effectiveAA.toFixed(2) +
                      ", limit is " + solubilityLimit.toFixed(2));
          // if effective [AA] after new hops addition is above threshold,
          // set [AA] to new limit; otherwise, [AA] is the effective [AA]
          if (effectiveAA > solLowerThresh && effectiveAA > solubilityLimit) {
            AAconcent = solubilityLimit;
          } else {
            AAconcent = effectiveAA;
          }
          console.log("    after addition, AAconcent = " +AAconcent.toFixed(4));
        } else {
          AAconcent = AAconcent + AAinit;
        }
        currentAddition = AAconcent - preAddConcent;
        if (currentAddition < 0) {
          console.log("ERROR!!!! ended up adding hops: " + currentAddition);
          currentAddition = 0.0;
        } else {
          console.log("    CURRENT ADDITION contributes " +
                      currentAddition.toFixed(4));
        }
        add[idx].AAcurr = currentAddition;
      }
    }

    // every 5 minutes, print out some information to the console
    if (Math.round(t * 1000) % 5000 == 0) {
      console.log("time = " + t.toFixed(3));
      console.log("       temp = " + tempC.toFixed(2) +
                          " with relative utilization " + degreeU.toFixed(4));
      console.log("       volume = " + volume.toFixed(4) +
                          ", relativeVolume = " + relativeVolume.toFixed(4));
      console.log("       AA = " + AAconcent.toFixed(4) + " ppm, " +
                          "util = " + U.toFixed(4) + ", IBU = " +
                          IBU.toFixed(4));
      if (t == 0) {
        console.log("    -------- end of boil --------");
      }
    }

    // if wort is still very hot (tempC > 90'C), then adjust volume
    // based on evaporation rate.
    if (tempC >= 90.0) {
      volume = volume - (evaporationRate/60.0 * integrationTime);
    }

    // if post boil (t < 0), then adjust temperature and degree of utilization
    if (t < 0) {
      postBoilTime = t * -1.0;
      // if counterflow or not yet done with whirlpool, get temp from cooling fn
      if (coolingMethod == "forcedDecayCounterflow" ||
          postBoilTime < whirlpoolTime) {
        if (!isTempDecayLinear) {
          tempK = (expParamA *
                     Math.exp(-1.0 * expParamB * postBoilTime)) + expParamC;
        } else {
          tempK = (linParamA * postBoilTime) + linParamB;
        }
      }
      // if immersion/icebath AND done with whirlpool, adjust
      // temp with new function
      if (coolingMethod == "forcedDecayImmersion" &&
          postBoilTime >= whirlpoolTime) {
        tempNoC = tempK - immersionChillerBaseTemp;
        tempNoC = tempNoC + (-1.0 * decayRate * tempNoC * integrationTime);
        tempK = tempNoC + immersionChillerBaseTemp;
      }
      if (coolingMethod == "forcedDecayIcebath" &&
          postBoilTime >= whirlpoolTime) {
        tempNoC = tempK - icebathBaseTemp;
        tempNoC = tempNoC + (-1.0 * decayRate * tempNoC * integrationTime);
        tempK = tempNoC + icebathBaseTemp;
      }
      // prevent numerical errors at <= 0 Kelvin
      if (tempK <= 1.0) { tempK = 1.0; }

      tempC = convertKelvinToCelsius(tempK);

      // this function from post 'an analysis of sub-boiling hop utilization'
      degreeU = 2.39 * Math.pow(10.0, 11.0) * Math.exp(-9773.0 / tempK);
      // stop modeling if degree of utilization is less than 0.001
      if (degreeU < 0.001) {
        finished = 1;
      }

      // limit to whirlpool time plus two hours, just to prevent infinite loop
      // (after 2 hours, almost no increase in utilization anyway)
      if (postBoilTime > whirlpoolTime+120.0) {
        finished = 1;
      }
    }

    // if finished whirlpool+stand time, do transfer and reduce volume of
    // wort, or use immersion chiller.  Check if volume reduced to 0, in
    // which case we're done.
    if (t * -1.0 >= whirlpoolTime &&
         coolingMethod == "forcedDecayCounterflow") {
      if (t * -1.0 == whirlpoolTime) {
        console.log("    ---- beginning transfer with counterflow chiller ---");
      }
      volume = volume - volumeChange;
      totalXferTime = totalXferTime + integrationTime;
      if (volume <= 0.0) {
        volume = 0.0;
        finished = 1;
      }
    }
    if (t * -1.0 >= whirlpoolTime &&
        coolingMethod != "forcedDecayCounterflow") {
      if (t * -1.0 == whirlpoolTime) {
        console.log("    ---- starting use of "+ coolingMethod +" chiller ---");
      }
    }

    // relative volume is used as a proxy for the relative amount of
    // alpha acids still being converted.  So maximum is 1.0
    relativeVolume = volume / postBoilVolume;
    if (relativeVolume > 1.0) relativeVolume = 1.0;

    // compute derivative of total AA concentration, and total AA concentration.
    // compute IBU from AA concentration and other factors, and utilization 
    // from IBUs and orig AA
    dAAconcent = AAconcent * k;
    AAconcent = AAconcent + (dAAconcent * integrationTime);
    IBU = IBU + (-1.0 * dAAconcent * degreeU * relativeVolume * 
                 integrationTime * factor);
    if (AAinitTotal > 0.0)
      U = IBU / AAinitTotal;
    else
      U = 0.0;
    // console.log("U = " + U + ", IBU = " + IBU);

    // compute AA concentration and IBUs for each separate addition
    for (idx = 0; idx < numAdd; idx++) {
      dAA = add[idx].AAcurr * k;
      add[idx].AAcurr = add[idx].AAcurr + (dAA * integrationTime);
      add[idx].IBU = add[idx].IBU + 
             (-1.0 * dAA * degreeU * relativeVolume * integrationTime * factor);
      if (add[idx].AAinit > 0.0)
        add[idx].U = add[idx].IBU / add[idx].AAinit;
      else
        add[idx].U = 0.0;
    }

    // prevent floating-point drift in 'time' variable
    t = Number(t.toFixed(4));
  }

  // adjust IBUs based on wort/trub loss and topoff volume added
  finalVolume = postBoilVolume - wortLossVolume;
  if (finalVolume > 0) {
    IBUscaling = finalVolume / (finalVolume + topoffVolume);
  } else {
    IBUscaling = 0.0;
  }
  console.log("before topoff, IBU = " + IBU + ", scaling = " + IBUscaling);
  IBU = IBU * IBUscaling;
  for (idx = 0; idx < numAdd; idx++) {
    add[idx].IBU = add[idx].IBU * IBUscaling;
  }

  // print out summary information to console when done
  console.log(" >> temperature at end = " + tempC.toFixed(2) + "'C after ");
  if (coolingMethod == "forcedDecayCounterflow") {
    console.log("     transfer time " + totalXferTime.toFixed(2) + " min");
  } else {
    chillingTime = -1 * (t + whirlpoolTime);
    console.log("     t = " + t.toFixed(3) + ", whirlpool = " + whirlpoolTime +
                ", chilling time " + chillingTime.toFixed(2) + " min");
  }
  console.log("U = " + U.toFixed(4) + ", IBU = " + IBU.toFixed(3));

  // set output values in HTML
  for (idx = 0; idx < numAdd; idx++) {
    idxP1 = idx + 1;
    addIBUoutput = add[idx].IBU.toFixed(2);
    document.getElementById('addIBUvalue'+idxP1).innerHTML = addIBUoutput;

    addUtilOutput = (add[idx].U * 100.0).toFixed(2);
    document.getElementById('addUtilValue'+idxP1).innerHTML = addUtilOutput;
  }

  totalIBUoutput = IBU.toFixed(2);
  document.getElementById('totalIBUvalue').innerHTML = totalIBUoutput;
  return true;
}

