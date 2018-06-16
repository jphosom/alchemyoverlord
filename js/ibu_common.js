// -----------------------------------------------------------------------------
// ibu_common.js : JavaScript for AlchemyOverlord web page, common functions
// Written by John-Paul Hosom
// Version 1.0.0 : January 30, 2017
// Version 1.0.1 : May 6, 2018
// Version 1.1.0 : May 23, 2018 : additional functions in support of mIBU
// -----------------------------------------------------------------------------

//------------------------------------------------------------------------------
// validate number input

function validateNumber(value, min, max, precision, defaultValue, parameterName,
                        element, userSet) {
  // check if it is a number and it's not an integer and it should be an integer
  if (!isNaN(value) && !Number.isInteger(Number(value)) && precision == 0) {
    window.alert("For "+parameterName+", input '"+value+"' should be an integer. Rounding to integer value.");
    var intValue = Number(value).toFixed(0);
    if (element != null) {
      element.value = intValue;
      window[userSet] = 0;
    }
    return Number(intValue);
  }

  // check for non-number or value out of range or integer error
  if (isNaN(value) || value < min || value > max) {
    if (value != "d" && value != "D" && value != "'d'" && value != "'D'") {
      window.alert("For "+parameterName+", input '"+value+"' is not valid. Changing to default value.");
    }
    if (element != null) {
      if (precision >= 0) {
        element.value = defaultValue.toFixed(precision);
      } else {
        element.value = defaultValue;
      }
      window[userSet] = 0;
    }
    return Number(defaultValue);
  }
  return Number(value);
}

//------------------------------------------------------------------------------
// set table of hops additions, using either already-set values or defaults,
// and set table of output values

function hopAdditionsSet() {
  var aaDefault = 8.4;
  var boilTimeDefault = 0.0;
  var currElement = 0;
  var currValue = "";
  var isMetric = 0;
  var idx = 1;
  var numAdd = document.getElementById("numAdd").value;
  var table = "";
  var tableID = "";
  var weightDefault = 0.0;
  var weightUnits = 0;

  numAdd = validateNumber(numAdd, 0, 20, 0, 1, "number of hop additions",
                         document.getElementById("numAdd"));

  isMetric = document.getElementById("unitsMetric").checked;
  if (isMetric) {
    weightUnits = "g";
    weightDefault = convertWeightToGrams(weightDefault);
  }
  else {
    weightUnits = "oz";
  }

  table += "<table style='margin-left:3em' id='hopsAdditionsTable'> "
  table += "<tbody> "
  table += "<tr> "
  table += "<td> </td>"
  for (idx = 1; idx <= numAdd; idx++) {
    if (numAdd <= 1) {
      table += "<td> </td> "
    } else {
      table += "<td>Addition "+idx+" </td> "
    }
  }
  table += "</tr> "

  table += "<tr> "
  table += "<td> Alpha Acid (%):</td> "
  for (idx = 1; idx <= numAdd; idx++) {
    currValue = aaDefault;
    tableID = "AA"+idx;
    currElement = document.getElementById(tableID);
    if (currElement != null) {
      currValue = document.getElementById(tableID).value;
    }
    table += "<td> <input type='text' size='12' value='"+currValue+"' autocomplete='off' id='"+tableID+"' onchange='computeIBU()'></td> "
  }
  table += "</tr> "

  table += "<tr> "
  table += "<td> Weight (<span id='weightUnits'>"+weightUnits+"</span>):</td> "
  for (idx = 1; idx <= numAdd; idx++) {
    currValue = weightDefault;
    tableID = "weight"+idx;
    currElement = document.getElementById(tableID);
    if (currElement != null) {
      currValue = document.getElementById(tableID).value;
    }
    table += "<td> <input type='text' size='12' value='"+currValue+"' autocomplete='off' id='"+tableID+"' onchange='computeIBU()'> </td> "
  }
  table += "</tr> ";

  table += "<tr> ";
  table += "<td> Boil Time (min): </td> "
  for (idx = 1; idx <= numAdd; idx++) {
    currValue = boilTimeDefault;
    tableID = "boilTimeTable"+idx;
    currElement = document.getElementById(tableID);
    if (currElement != null) {
      currValue = document.getElementById(tableID).value;
    }
    table += "<td> <input type='text' size='12' value='"+currValue+"' autocomplete='off' id='"+tableID+"' onchange='computeIBU()'> </td> "
  }
  table += "</tr> ";

  table += "</tbody> ";
  table += "</table> ";
  document.getElementById('hopsAdditionsTableDiv').innerHTML = table;

  table = "";
  table += "<table style='margin-left:3em' id='outputTable'> "
  table += "<tr> "
  table += "<td class='outputTableCellName'> </td>"
  for (idx = 1; idx <= numAdd; idx++) {
    if (numAdd <= 1) {
      table += "<td> </td> "
    } else {
      table += "<td>Addition "+idx+" </td> "
    }
  }
  table += "</tr> "

  table += "<tr> "
  table += "<td class='outputTableCellName'>Utilization (%):</td> "
  for (idx = 1; idx <= numAdd; idx++) {
    table += "<td class='outputTableCellValue' id='addUtilValue"+idx+"'>0.00</td> "
  }
  table += "</tr> "
  table += "<tr> "
  table += "<td class='outputTableCellName'>IBUs:</td> "
  for (idx = 1; idx <= numAdd; idx++) {
    table += "<td class='outputTableCellValue' id='addIBUvalue"+idx+"'>0.00</td> "
  }
  table += "</tr> ";
  table += "<tr> ";
  table += "<td class='outputTableTotalName'>--------------</td> ";
  table += "</tr> ";
  table += "<tr> ";
  table += "<td class='outputTableTotalName'>Total IBUs:</td>"
  table += "<td class='outputTableTotalValue' id='totalIBUvalue'>0.00</td>"
  table += "</tr> ";
  table += "</table> ";
  document.getElementById('outputTableDiv').innerHTML = table;

  computeIBU();

  return true;
}

//------------------------------------------------------------------------------
// various unit-conversion functions

function convertVolumeToLiters(volume_gallons) {
  var volume_liters = volume_gallons * 3.78541;
  return Number(volume_liters);
}

function convertVolumeToGallons(volume_liters) {
  var volume_gallons = volume_liters / 3.78541;
  return Number(volume_gallons);
}

function convertWeightToGrams(weight_ounces) {
  var weight_grams = weight_ounces * 28.3496;
  return Number(weight_grams);
}

function convertWeightToOunces(weight_grams) {
  var weight_ounces = weight_grams / 28.3496;
  return Number(weight_ounces);
}

function convertTemperatureToCelsius(temp_F) {
  var temp_C = (temp_F - 32.0) / 1.8;
  return Number(temp_C);
}

function convertTemperatureToFahrenheit(temp_C) {
  var temp_F = (temp_C * 1.8) + 32.0;
  return Number(temp_F);
}

function convertKelvinToCelsius(temp_K) {
  var temp_C = temp_K - 273.15;
  return Number(temp_C);
}

function convertCelsiusToKelvin(temp_C) {
  var temp_K = temp_C + 273.15;
  return Number(temp_K);
}

function convertDiameterToInches(diameter_cm) {
  var diameter_inches = diameter_cm / 2.54;
  return Number(diameter_inches);
}

function convertDiameterToCentimeters(diameter_inches) {
  var diameter_cm = diameter_inches * 2.54;
  return Number(diameter_cm);
}



//------------------------------------------------------------------------------
// DEFAULTS

function get_kettle_diameter_default() {
  var diameterDefault = 36.83;
  var opening_diameter = document.getElementById('opening_diameter').value;
  var isMetric = document.getElementById('unitsMetric').checked;

  if (!isMetric) {
    diameterDefault = convertDiameterToInches(diameterDefault);
  }

  return Number(diameterDefault);
}

function get_opening_diameter_default() {
  var diameterDefault = 36.83;
  var kettle_diameter = document.getElementById('kettle_diameter').value;
  var isMetric = document.getElementById('unitsMetric').checked;

  if (!isMetric) {
    diameterDefault = convertDiameterToInches(diameterDefault);
  }

  // make sure opening diameter is not greater than kettle diameter
  if (diameterDefault > kettle_diameter) {
    diameterDefault = kettle_diameter;
  }

  return Number(diameterDefault);
}

function get_volume_default() {
  var volumeDefault = 19.87341;
  var isMetric = document.getElementById('unitsMetric').checked;
  if (!isMetric) {
    volumeDefault = convertVolumeToGallons(volumeDefault);
  }
  return Number(volumeDefault);
}

function get_weight_default() {
  var weightDefault = 28.35;
  var isMetric = document.getElementById('unitsMetric').checked;
  if (!isMetric) {
    weightDefault = convertWeightToOunces(weightDefault);
  }
  return Number(weightDefault);
}

function get_evaporationRate_default() {
  var evaporationRateDefault = 3.78541;
  var isMetric = document.getElementById('unitsMetric').checked;
  if (!isMetric) {
    evaporationRateDefault = convertVolumeToGallons(evaporationRateDefault);
  }
  return Number(evaporationRateDefault);
}

function get_immersionDecayFactor_default() {
  var immersionDefault = 0.0;
  var volume = document.getElementById('volume').value;
  var isMetric = document.getElementById('unitsMetric').checked;
  var precision = 3;
  if (!isMetric) {
    volume = convertVolumeToLiters(volume);
  }
  immersionDefault = 0.6075 * Math.exp(-0.0704 * volume);
  while (Number(immersionDefault.toFixed(precision)) == 0) {
    precision = precision + 1;
  }
  return Number(immersionDefault.toFixed(precision));
}

function get_counterflowRate_default() {
  var value = 2.082;
  var isMetric = document.getElementById('unitsMetric').checked;
  if (!isMetric) {
    value = convertVolumeToGallons(value);
  }
  return Number(value.toFixed(3));
}

function get_icebathDecayFactor_default() {
  var icebathDefault = 0.0;
  var volume = document.getElementById('volume').value;
  var isMetric = document.getElementById('unitsMetric').checked;
  var precision = 3;
  if (!isMetric) {
    volume = convertVolumeToLiters(volume);
  }
  icebathDefault = 0.4071 * Math.exp(-0.0754 * volume);
  while (Number(icebathDefault.toFixed(precision)) == 0) {
    precision = precision + 1;
  }
  return Number(icebathDefault.toFixed(precision));
}

function get_tempExpParamA_default() {
  var value = 53.70;
  var volume = document.getElementById('volume').value;
  var isMetric = document.getElementById('unitsMetric').checked;
  if (!isMetric) {
    value = convert_tempExpParamA_toImperial(value);
  }
  return Number(value.toFixed(2));
}


function get_tempExpParamB_default() {
  var value = 0.0;
  var radius = 0.0;
  var surface_area = 0.0;
  var opening_area = 0.0;
  var effective_area = 0.0;
  var AVR = 0.0;
  var volume = document.getElementById('volume').value;
  var kettle_diameter = document.getElementById('kettle_diameter').value;
  var opening_diameter = document.getElementById('opening_diameter').value;
  var isMetric = document.getElementById('unitsMetric').checked;
  var precision = 3;
  if (!isMetric) {
    volume = convertVolumeToLiters(volume);
    kettle_diameter = convertDiameterToCentimeters(kettle_diameter);
    opening_diameter = convertDiameterToCentimeters(opening_diameter);
  }

  radius = kettle_diameter / 2.0;
  surface_area = Math.PI * radius * radius;

  radius = opening_diameter / 2.0;
  opening_area = Math.PI * radius * radius;

  effective_area = Math.sqrt(surface_area * opening_area);

  if (volume <= 0.0) volume = 0.1;
  AVR = effective_area / volume;
  value = (0.0002925 * AVR) + 0.0053834;
  while (Number(value.toFixed(precision)) == 0) {
    precision = precision + 1;
  }
  return Number(value.toFixed(precision));
}

function get_tempExpParamC_default() {
  var value = 46.40;
  var isMetric = document.getElementById('unitsMetric').checked;
  if (!isMetric) {
    value = convert_tempExpParamC_toImperial(value);
  }
  return Number(value.toFixed(2));
}

function get_tempLinParamA_default() {
  var value = 0.0;
  var radius = 0.0;
  var surface_area = 0.0;
  var opening_area = 0.0;
  var effective_area = 0.0;
  var AVR = 0.0;
  var volume = document.getElementById('volume').value;
  var kettle_diameter = document.getElementById('kettle_diameter').value;
  var opening_diameter = document.getElementById('opening_diameter').value;
  var isMetric = document.getElementById('unitsMetric').checked;
  
  if (!isMetric) {
    volume = convertVolumeToLiters(volume);
    kettle_diameter = convertDiameterToCentimeters(kettle_diameter);
    opening_diameter = convertDiameterToCentimeters(opening_diameter);
  }

  radius = kettle_diameter / 2.0;
  surface_area = Math.PI * radius * radius;

  radius = opening_diameter / 2.0;
  opening_area = Math.PI * radius * radius;

  effective_area = Math.sqrt(surface_area * opening_area);

  if (volume <= 0.0) volume = 0.1;
  AVR = effective_area / volume;
  value = (3.055 * (1.0 - Math.exp(-0.0051 * AVR))) + 0.238;
  value *= -1.0;
  if (!isMetric) {
    value = convert_tempLinParamA_toImperial(value);
  }
  return Number(value.toFixed(2));
}

function get_tempLinParamB_default() {
  var value = 100.1;
  var isMetric = document.getElementById('unitsMetric').checked;
  if (!isMetric) {
    value = convert_tempLinParamB_toImperial(value);
  }
  return Number(value.toFixed(2));
}
