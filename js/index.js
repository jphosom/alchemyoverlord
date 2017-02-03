// 
function compute() {
	var x = 5;
	var y = 4;
	var z = x * y;
	var text = document.getElementById('myinput1').value;
	document.getElementById('demo').innerHTML = text + z;
	return false;
}

function addit() {
	var text1 = document.getElementById('myinput1').value;
	var text2 = document.getElementById('myinput2').value;
	var table = "<b>inputvalue:</b> <input type='text' value='xx' autocomplete='off' id='table1'> <br>"
	// document.getElementById('addresult').innerHTML = text1 + text2;
	document.getElementById('addresult').innerHTML = table;
  return false;
}

//------------------------------------------------------------------------------
// set units to metric or British Imperial

function setUnits() {
	var isMetric = document.getElementById("unitsMetric").checked;
	if (isMetric) {
	  document.getElementById('volumeUnits').innerHTML = "liters";
	  document.getElementById('weightUnits').innerHTML = "g";
	  }
	else {
	  document.getElementById('volumeUnits').innerHTML = "G";
	  document.getElementById('weightUnits').innerHTML = "oz";
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
	var units = document.querySelector('input[name="units"]:checked').value;
	var numAdd = document.getElementById("numAdd").value;
  var aaDefault = 8.4;
	var weightDefault = 0.0;
	var boilTimeDefault = 0.0;
	var table = "";
	var currValue = "";
	var tableID = "";
	var currElement;
	var isMetric;
	var weightUnits;

	isMetric = document.getElementById("unitsMetric").checked;
	if (isMetric) {
		weightUnits = "g";
	  }
	else {
		weightUnits = "oz";
	  }

	numAdd = validateNumber(numAdd, 0, 20, 1, "number of hop additions", 
		                     document.getElementById("numAdd"));

	table += "<table id='hopsAdditionsTable'> "
	table += "<tbody> "
	table += "<tr> "
	table += "<td> </td>"
	for (idx = 1; idx <= numAdd; idx++) {
		table += "<td>Addition "+idx+" </td> "
	  }
	table += "</tr> "

	table += "<tr> "
	table += "<td> Alpha Acid (%):</td> "
	for (idx = 1; idx <= numAdd; idx++) {
		currValue = aaDefault;
		tableID = "aaTable"+idx;
		currElement = document.getElementById(tableID);
		if (currElement != null) {
		  currValue = document.getElementById(tableID).value;
		  }
		table += "<td> <input type='text' size='12' value='"+currValue+"' autocomplete='off' id='"+tableID+"'></td> "
	  }
  table += "</tr> "

  table += "<tr> "
  table += "<td> Weight (<span id='weightUnits'>"+weightUnits+"</span>):</td> "
	for (idx = 1; idx <= numAdd; idx++) {
		currValue = weightDefault;
		tableID = "weightTable"+idx;
		currElement = document.getElementById(tableID);
		if (currElement != null) {
		  currValue = document.getElementById(tableID).value;
		  }
		table += "<td> <input type='text' size='12' value='"+currValue+"' autocomplete='off' id='"+tableID+"'> </td> "
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
		table += "<td> <input type='text' size='12' value='"+currValue+"' autocomplete='off' id='"+tableID+"'> </td> "
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
		table += "<td>Addition "+idx+" </td> "
	  }
	table += "</tr> "

	table += "<tr> "
	table += "<td class='outputTableCellName'>Utilization:</td> "
	for (idx = 1; idx <= numAdd; idx++) {
		table += "<td class='outputTableCellValue'> 0.0 </td> "
	  }
  table += "</tr> "
  table += "<tr> "
  table += "<td class='outputTableCellName'>IBUs:</td> "
	for (idx = 1; idx <= numAdd; idx++) {
		table += "<td class='outputTableCellValue'> 0.0 </td> "
	  }
	table += "</tr> ";
	table += "<tr> ";
	table += "<td class='outputTableTotalName'>--------------</td> ";
	table += "</tr> ";
	table += "<tr> ";
	table += "<td class='outputTableTotalName'>Total IBUs:</td>"
	table += "<td class='outputTableTotalValue'>0.0</td>"
	table += "</tr> ";
	table += "</table> ";
	document.getElementById('outputTableDiv').innerHTML = table;

	return false;
}


