// -----------------------------------------------------------------------------
// ibu_tinseth.js : JavaScript for AlchemyOverlord web page, Tinseth sub-page
// Written by John-Paul Hosom 
// Version 1.0 : January 30, 2017 
// -----------------------------------------------------------------------------

//------------------------------------------------------------------------------
// set units to metric or British Imperial

function setUnits() {
	var isMetric = document.getElementById("unitsMetric").checked;
	var numAdd = document.getElementById("numAdd").value;
	var volume = 0.0;
	var weight = 0.0;

	if (isMetric) {
	  document.getElementById('volumeUnits').innerHTML = "liters";
	  document.getElementById('weightUnits').innerHTML = "g";

		volume = document.getElementById('volume').value;
		volume = convertVolumeToLiters(volume);
		document.getElementById('volume').value = volume;

		for (idx = 1; idx <= numAdd; idx++) {
		  weight = document.getElementById('weight'+idx).value;
		  weight = convertWeightToGrams(weight);
		  document.getElementById('weight'+idx).value = weight;
		  }
	  }
	else {
	  document.getElementById('volumeUnits').innerHTML = "G";
	  document.getElementById('weightUnits').innerHTML = "oz";

		volume = document.getElementById('volume').value;
		volume = convertVolumeToGallons(volume);
		document.getElementById('volume').value = volume;

		for (idx = 1; idx <= numAdd; idx++) {
		  weight = document.getElementById('weight'+idx).value;
		  weight = convertWeightToOunces(weight);
		  document.getElementById('weight'+idx).value = weight;
		  }
	  }
  return true;
}

//------------------------------------------------------------------------------
// validate number input

function validateNumber(value, min, max, defaultValue, parameterName, element) {
	if (isNaN(value) || value < min || value > max) {
		window.alert("For "+parameterName+", input '"+value+"' is not valid. Changing to default value.");
		if (element != null) {
		  element.value = defaultValue;
	    }
	  return defaultValue;
	  }
	return value;
  }

//------------------------------------------------------------------------------
// set table of hops additions, using either already-set values or defaults,
// and set table of output values

function hopAdditionsSet() {
	var idx = 1;
	// var units = document.querySelector('input[name="units"]:checked').value;
	var numAdd = document.getElementById("numAdd").value;
  var aaDefault = 8.4;
	var weightDefault = 1.0; 
	var boilTimeDefault = 0.0;
	var table = "";
	var currValue = "";
	var tableID = "";
	var currElement;
	var isMetric;
	var weightUnits;

	numAdd = validateNumber(numAdd, 0, 20, 1, "number of hop additions", 
		                     document.getElementById("numAdd"));

	isMetric = document.getElementById("unitsMetric").checked;
	if (isMetric) {
		weightUnits = "g";
		weightDefault = convertWeightToGrams(weightDefault);
	  }
	else {
		weightUnits = "oz";
	  }

	table += "<table id='hopsAdditionsTable'> "
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
	table += "<table id='outputTable'> "
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
// compute IBUs and utilization for all hops additions

function computeIBU () {
	var isMetric = document.getElementById('unitsMetric').checked;
	var volume = document.getElementById('volume').value;
	var SG = document.getElementById('SG').value;
	var numAdd = document.getElementById('numAdd').value;
	var AA;
	var weight;
	var boilTime;
	var tableID;
	var idx = 0;
	var addIBU;
	var addIBUoutput;
	var addUtilOutput;
	var totalIBU;
	var totalIBUoutput = 0.0;
	var volumeDefault = 5.25;
	var weightDefault = 1.0;

	if (isMetric) {
		volumeDefault = 20.0;
		weightDefault = 30.0;
	  }
	volume = validateNumber(volume, 0, 5000, volumeDefault, "volume", 
		                     document.getElementById('volume'));
	SG = validateNumber(SG, 1.0, 1.150, 1.055, "specific gravity", 
		                     document.getElementById('SG'));

	totalIBU = 0.0;
	for (idx = 1; idx <= numAdd; idx++) {
		tableID = "AA"+idx;
    AA = document.getElementById(tableID).value;
    AA = validateNumber(AA, 0.5, 100.0, 8.34, "alpha acid (%)",
			                   document.getElementById(tableID));

		tableID = "weight"+idx;
    weight = document.getElementById(tableID).value;
    weight = validateNumber(weight, 0.0, 5000.0, weightDefault, "hops weight",
			                   document.getElementById(tableID));

		tableID = "boilTimeTable"+idx;
    boilTime = document.getElementById(tableID).value;
    boilTime = validateNumber(boilTime, 0.0, 360.0, 0.0, "boil time (min)",
			                   document.getElementById(tableID));

		addIBU = computeIBUsingleAddition(isMetric, volume, SG, AA, 
			                                weight, boilTime);
		totalIBU += addIBU.IBU;

	  addIBUoutput = addIBU.IBU.toFixed(2);
	  document.getElementById('addIBUvalue'+idx).innerHTML = addIBUoutput;

	  addUtilOutput = (addIBU.util * 100.0).toFixed(2);
	  document.getElementById('addUtilValue'+idx).innerHTML = addUtilOutput;
	  }

	totalIBUoutput = totalIBU.toFixed(2);
	document.getElementById('totalIBUvalue').innerHTML = totalIBUoutput;
	return true;
  }

//------------------------------------------------------------------------------
// compute IBUs and utilization for a single addition

function computeIBUsingleAddition(isMetric, volume, SG, AA, weight, boilTime) {
	var scaledTime = 0.0;
	var wgm1 = 0.0;
	var bignessFactor = 0.0;
	var boilTimeFactor = 0.0;
	var decimalAArating = 0.0;
	var U = 0.0;
	var IBU = 0.0;
	var IBUresult = { 
		        util: 0,
		        IBU: 0
	          }

	IBUresult.IBU = 0.0;
	IBUresult.utilization = 0.0;

  // convert to metric if needed
	if (!isMetric) {
		volume = convertVolumeToLiters(volume);
		weight = convertWeightToGrams(weight);
	  }

	// convert AA from percent to 0...1 range
	AA /= 100.0;

	scaledTime = -0.04 * boilTime;
	wgm1 = SG - 1.0;
	bignessFactor = 1.65 * Math.pow(0.000125, wgm1);
	boilTimeFactor = (1.0 - Math.exp(scaledTime)) / 4.15;
	decimalAArating = bignessFactor * boilTimeFactor;
	U = decimalAArating;
	IBUresult.util = U;
	IBUresult.IBU = U * AA * weight * 1000.0 / volume;

	return IBUresult;
  }

//------------------------------------------------------------------------------
// various unit-conversion functions

function convertVolumeToLiters(volume_gallons) {
	var volume_liters = volume_gallons * 3.78541;
	return volume_liters.toFixed(2);
  }

function convertVolumeToGallons(volume_liters) {
	var volume_gallons = volume_liters / 3.78541;
	return volume_gallons.toFixed(2);
  }

function convertWeightToGrams(weight_ounces) {
	var weight_grams = weight_ounces * 28.3496;
	return weight_grams.toFixed(2);
  }

function convertWeightToOunces(weight_grams) {
	var weight_ounces = weight_grams / 28.3496;
	return weight_ounces.toFixed(2);
  }

