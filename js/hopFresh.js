// -----------------------------------------------------------------------------
// hopFresh.js : JavaScript for AlchemyOverlord web page, hop freshness sub-page
// Written by John-Paul Hosom
// Copyright © 2021 by John-Paul Hosom, all rights reserved.
//
// Version 1.0.0 : August 8, 2021
//         Initial version.  This version has code that is very similar to
//         code in ibu.js, making a mockery of the concept of code reuse.
//         However, re-writing ibu.js to be more modular is too daunting.
//         If there is a bug in ibu.js, it may need to be fixed here,
//         and vice-versa.
// Version 1.1.0 : September 24, 2023
//          change beta acid default to scale with the alpha-acid value
//          that has been set by the user. Also, storage duration of 0 is valid.
//
// -----------------------------------------------------------------------------

//==============================================================================

var hopFresh = hopFresh || {};

// Declare a "namespace" called "hopFresh"
// This namespace contains functions that are specific to hopFresh method.
//
//    public functions:
//    . initialize_hopFresh()
//    . compute_hopFresh()
//

hopFresh._construct = function() {

"use strict";

//------------------------------------------------------------------------------
// initialize

this.initialize_hopFresh = function() {
  var defaultColor = "#94476b"; // greyish red
  var idx = 0;
  var keys;
  var updateFunction = this.compute_hopFresh;
  var varietyDefault = "(unspecified)";
  var varietyMenu = "";

  //----------------------------------------------------------------------------
  // create data for all variables

  // units
  this.units = new Object();
  this.units.id = "hopFresh.units";
  this.units.inputType = "radioButton";
  this.units.value = "imperial";
  this.units.userSet = 0;
  this.units.defaultValue = "imperial";
  this.units.additionalFunction = setUnits;
  this.units.additionalFunctionArgs = "";

  this.HSI = new Object;
  this.HSI.id = "hopFresh.HSI";
  this.HSI.inputType = "float";
  this.HSI.userSet = 0;
  this.HSI.precision = 3;
  this.HSI.minPrecision = 2;
  this.HSI.display = "";
  this.HSI.min = 0.0;
  this.HSI.max = 4.0;
  this.HSI.description = "hops freshness factor";
  this.HSI.defaultFunction = get_HSI_default;
  this.HSI.defaultArgs = "";
  this.HSI.defaultColor = defaultColor;

  this.variety = new Object;
  this.variety.id = "hopFresh.variety";
  this.variety.inputType = "select";
  this.variety.userSet = 0;
  this.variety.display = varietyDefault;
  this.variety.description = "hop variety";
  this.variety.defaultValue = varietyDefault;
  this.variety.additionalFunction = setHopVariety;
  this.variety.additionalFunctionArgs = "";

  this.AA = new Object;
  this.AA.id = "hopFresh.AA";
  this.AA.inputType = "float";
  this.AA.userSet = 0;
  this.AA.precision = 1;
  this.AA.minPrecision = 1;
  this.AA.display = "";
  this.AA.min = 0.0;
  this.AA.max = 100.0;
  this.AA.description = "hops AA rating";
  this.AA.defaultFunction = get_AA_default;
  this.AA.defaultArgs = "";
  this.AA.defaultColor = defaultColor;
  // this.AA.additionalFunction = get_BA_default;
  // this.AA.additionalFunctionArgs = "";

  this.BA = new Object;
  this.BA.id = "hopFresh.BA";
  this.BA.inputType = "float";
  this.BA.userSet = 0;
  this.BA.precision = 1;
  this.BA.minPrecision = 1;
  this.BA.display = "";
  this.BA.min = 0.0;
  this.BA.max = 100.0;
  this.BA.description = "hops beta acid rating";
  this.BA.defaultFunction = get_BA_default;
  this.BA.defaultColor = defaultColor;

  this.k = new Object;
  this.k.id = "hopFresh.k";
  this.k.inputType = "float";
  this.k.userSet = 0;
  this.k.precision = 5;
  this.k.minPrecision = 4;
  this.k.display = "";
  this.k.min = 0.0;
  this.k.max = 1.0;
  this.k.description = "Garetz's rate decay constant, k";
  this.k.defaultFunction = get_k_default;
  this.k.defaultArgs = "";
  this.k.defaultColor = defaultColor;
  this.k.dependents = [ hopFresh.HSI ];

  this.percentLoss = new Object;
  this.percentLoss.id = "hopFresh.percentLoss";
  this.percentLoss.inputType = "float";
  this.percentLoss.userSet = 0;
  this.percentLoss.precision = 1;
  this.percentLoss.minPrecision = 1;
  this.percentLoss.display = "";
  this.percentLoss.min = 0.0;
  this.percentLoss.max = 100.0;
  this.percentLoss.description = "percent loss of alpha acids after six months at room temperature";
  this.percentLoss.defaultFunction = get_percentLoss_default;
  this.percentLoss.defaultArgs = "";
  this.percentLoss.defaultColor = defaultColor;
  this.percentLoss.dependents = [ hopFresh.k, hopFresh.HSI ];

  this.hopPackaging = new Object;
  this.hopPackaging.id = "hopFresh.hopPackaging";
  this.hopPackaging.inputType = "select";
  this.hopPackaging.userSet = 0;
  this.hopPackaging.description = "storage conditions";
  this.hopPackaging.defaultValue = "vacuum sealed";
  this.hopPackaging.dependents = [ hopFresh.HSI ];

  this.storageDuration = new Object;
  this.storageDuration.id = "hopFresh.storageDuration";
  this.storageDuration.inputType = "float";
  this.storageDuration.userSet = 0;
  this.storageDuration.precision = 1;
  this.storageDuration.minPrecision = 0;
  this.storageDuration.display = "";
  this.storageDuration.min = 0.0;
  this.storageDuration.max = 120.0;
  this.storageDuration.description = "storage duration (months)";
  this.storageDuration.defaultValue = 6.0;
  this.storageDuration.defaultColor = defaultColor;
  this.storageDuration.dependents = [ hopFresh.HSI ];

  this.storageTemp = new Object;
  this.storageTemp.id = "hopFresh.storageTemp";
  this.storageTemp.inputType = "float";
  this.storageTemp.value = 3.0;
  this.storageTemp.userSet = 0;
  this.storageTemp.convertToMetric = common.convertFahrenheitToCelsius;
  this.storageTemp.convertToImperial = common.convertCelsiusToFahrenheit;
  this.storageTemp.precision = 1;
  this.storageTemp.minPrecision = 0;
  this.storageTemp.display = "";
  this.storageTemp.min = -120.0;
  this.storageTemp.max = 120.0;
  this.storageTemp.description = "storage temperature";
  this.storageTemp.defaultValue = 20.0;
  this.storageTemp.defaultColor = defaultColor;
  this.storageTemp.dependents = [ hopFresh.HSI ];

  //----------------------------------------------------------------------------
  // add name of parent to all variables, so we can access 'units' as needed
  keys = Object.keys(this);
  for (idx = 0; idx < keys.length; idx++) {
    if (keys[idx] == "_construct") {
      continue;
    }
    this[keys[idx]].parent = "hopFresh";
  }


  // add function to call when using set() function with hopFresh namespace
  for (idx = 0; idx < keys.length; idx++) {
    if (!hopFresh[keys[idx]].id) {
      continue;
    }
    hopFresh[keys[idx]].updateFunction = hopFresh.compute_hopFresh;
  }

  // initialize list of hop names' first letters
  this.letterList = [];

  // don't need to set() any variables that change with unit conversion;
  // when we call setUnits, those dependent variables will also be set.
  common.set(hopFresh.units, 0);
  common.set(hopFresh.variety, 0);
  common.set(hopFresh.AA, 0);
  common.set(hopFresh.BA, 0);
  common.set(hopFresh.percentLoss, 0);
  common.set(hopFresh.k, 0);
  common.set(hopFresh.hopPackaging, 0);
  common.set(hopFresh.storageDuration, 0);
  common.set(hopFresh.HSI, 0);

  varietyMenu = buildHops("hopFresh.varietyMenu", hopFresh.variety.value);
  document.getElementById('hopVariety').innerHTML = varietyMenu;

  this.verbose = 1;

  hopFresh.compute_hopFresh();

  return;
}


//==============================================================================
// FUNCTIONS RELATED TO HOPS

//------------------------------------------------------------------------------
// functions for handling selection of hop variety

//------------------------------------------------------------------------------
// get default alpha-acid rating (either general or variety-specific)

function get_AA_default() {
  var defaultValue = 8.75;  // average value over many varieties
  var value = 0.0;
  var variety = "";

  variety = hopFresh.variety.value;
  value = defaultValue;
  console.log("VARIETY = " + variety);
  if (variety != "(unspecified)") {
    if (hops[variety].AA) {
      value = hops[variety].AA;
    }
  }

  return value;
}

//------------------------------------------------------------------------------
// get default beta-acid rating (either general or variety-specific)

function get_BA_default() {
  var AA = 0.0;
  var defaultAA = 0.0;
  var defaultValue = 5.0;  // approximate value over many varieties
  var scaling = 0.0;
  var userSetAA = 0;
  var value = 0.0;
  var variety = "";

  variety = hopFresh.variety.value;
  value = defaultValue;
  if (variety != "(unspecified)") {
    if (hops[variety].BA) {
      userSetAA = hopFresh.AA.userSet;
      if (userSetAA && hops[variety].AA) {
        // The beta-acid percent varies with the alpha-acid percent.
        // If the user has set the AA%, adjust the default BA by the known AA%
        defaultAA = hops[variety].AA;
        AA = hopFresh.AA.value;
        scaling = AA / defaultAA;
        value = scaling * hops[variety].BA;
        // console.log("orig BA = " + hops[variety].BA + "; with AA set to " +
                  // AA + " and default AA of " + defaultAA + ", scaling is " +
                  // scaling);
      } else {
        value = hops[variety].BA;
      }
    }
  }

  return value;
}

//------------------------------------------------------------------------------
// get default percent loss over 6 months (either general or variety-specific)

function get_percentLoss_default() {
  var defaultValue = 32.0;  // average value over many varieties
  var value = 0.0;
  var variety = "";

  variety = hopFresh.variety.value;
  value = defaultValue;
  if (variety != "(unspecified)") {
    if (hops[variety].loss) {
      value = hops[variety].loss;
    }
  }

  return value;
}

//------------------------------------------------------------------------------
// get default value for k

function get_k_default() {
  var default_k = 0.0;
  var lossFactor = hopFresh.percentLoss.value / 100.0;

  if (lossFactor >= 1.0) lossFactor = 0.99;  // prevent divide by zero, ln(neg)
  default_k = Math.log(1.0/(1.0-lossFactor)) / 183.0;

  return default_k;
}

//------------------------------------------------------------------------------
// get default HSI
// This is a direct (reverse) implementation of the Nickerson method.

function get_HSI_default() {
  var freshnessFactor = 0.0;
  var HSI = 0.0;

  freshnessFactor = computeFreshnessFactor();
  HSI = Math.pow(10.0, (1.0 - freshnessFactor)/1.10) * 0.25;

  return HSI;
}

//------------------------------------------------------------------------------
// get freshness factor from the specified storage conditions
// This is a direct implementation of the Garetz method.

function computeFreshnessFactor() {
  var days = 0.0;
  var freshnessFactor = 0.0;
  var hopPackaging = hopFresh.hopPackaging.value;
  var k = hopFresh.k.value;
  var SF = 0.0;
  var storageDuration_months = hopFresh.storageDuration.value;
  var storageTemp = hopFresh.storageTemp.value;
  var TF = 0.0;

  // if we haven't defined some variable(s) (yet), just return some value
  if (!k || !hopPackaging || storageDuration_months < 0) {
    return 0.90;
  }

  SF = 2.0;  // if there's a bug, make it obvious with a high value of SF
  if (hopPackaging == "professionally nitrogen flushed") {
    SF = 0.05;
  }
  else if (hopPackaging == "inert-gas flush") {
    SF = 0.5;
  }
  else if (hopPackaging == "vacuum sealed") {
    SF = 0.5;
  }
  else if (hopPackaging == "wrapped") {
    SF = 0.75;
  }
  else if (hopPackaging == "loose") {
    SF = 1.0;
  }
  if (SF == 2.0) {
    console.log(" ***** ERROR **** storage factors inconsistently named");
    console.log("                  " + hopPackaging);
  }

  days = storageDuration_months * 30.5;
  TF = 0.39685026299204984 * Math.exp(0.04620981203732968*storageTemp);
  freshnessFactor = 1.0 / Math.exp(k * TF * SF * days);

  return freshnessFactor;
}

//------------------------------------------------------------------------------
// if user has set the hop variety, update the AA, BA, and percent loss
// values, if they are default values, to the variety-specific values

function setHopVariety() {
  var AA = hopFresh.AA;
  var BA = hopFresh.BA;
  var loss = hopFresh.percentLoss;

  if (AA) {
    common.set(AA, 0);
  }
  if (BA) {
    common.set(BA, 0);
  }
  if (loss) {
    common.set(loss, 0);
  }
  return;
}

//------------------------------------------------------------------------------
// build HTML table for hop varieties

function buildHops(tableID, selection) {
  var count = 0;
  var countAA = 0.0;
  var countBA = 0.0;
  var countLoss = 0.0;
  var endIdx = 0;
  var firstLetter = "";
  var firstLetterInfo = [];
  var hIdx = 0;
  var hopVarieties = Object.keys(hops);
  var lIdx = 0;
  var limit = 15;
  var letter = "";
  var midIdx = 0;
  var menu = "";
  var origEndIdx = 0;
  var origStartIdx = 0;
  var secondLetter = "";
  var sIdx = 0;
  var splitCount = 0;
  var splitIdx = 0;
  var startIdx = 0;
  var submenu = "";
  var sumAA = 0.0;
  var sumBA = 0.0;
  var sumLoss = 0.0;
  var verbose = 0;

  // if list of hop variety letters hasn't been constructed yet, do so now
  if (hopFresh.letterList.length == 0) {
    // sort the hop varieties using case-insensitive sorting
    hopVarieties.sort((a,b) =>
        a.localeCompare(b, undefined, {sensitivity:'base'}));
    // get all of the first letters from all varieties, creating initial list
    sumAA = 0.0;
    sumBA = 0.0;
    sumLoss = 0.0;
    for (hIdx = 0; hIdx < hopVarieties.length; hIdx++) {
      firstLetter = hopVarieties[hIdx].charAt(0).toUpperCase();
      if (hops[hopVarieties[hIdx]].AA) {
        sumAA += hops[hopVarieties[hIdx]].AA;
        countAA += 1.0;
      }
      if (hops[hopVarieties[hIdx]].BA) {
        sumBA += hops[hopVarieties[hIdx]].BA;
        countBA += 1.0;
      }
      if (hops[hopVarieties[hIdx]].loss) {
        sumLoss += hops[hopVarieties[hIdx]].loss;
        countLoss += 1.0;
      }
      // search for first letter in current variety
      for (lIdx = 0; lIdx < hopFresh.letterList.length; lIdx++) {
        if (firstLetter == hopFresh.letterList[lIdx].letter) {
          break;
        }
      }
      if (lIdx >= hopFresh.letterList.length) {
        // if letter doesn't exist yet, create a new entry in letterList
        firstLetterInfo =
            { letter:firstLetter, count:1, startIdx:hIdx, endIdx:hIdx };
        hopFresh.letterList.push(firstLetterInfo);
      } else {
        // if letter does exist, update the count and end index of letterList
        count = hopFresh.letterList[lIdx].count;
        count += 1;
        endIdx = hopFresh.letterList[lIdx].endIdx;
        endIdx += 1;
        firstLetterInfo = { letter:firstLetter, count:count,
                            startIdx:hopFresh.letterList[lIdx].startIdx, endIdx };
        hopFresh.letterList[lIdx] = firstLetterInfo;
      }
    }
    if (verbose) {
      console.log("Have data on " + countAA + " varieties of hops");
      console.log("Average AA  = " + (sumAA / countAA).toFixed(2) + "%");
      console.log("Average BA  = " + (sumBA / countBA).toFixed(2) + "%");
      console.log("Average Loss = " + (sumLoss / countLoss).toFixed(2) + "%");
      console.log("ORIGINAL LETTER LIST: ");
      for (lIdx = 0; lIdx < hopFresh.letterList.length; lIdx++) {
        console.log("  " + hopFresh.letterList[lIdx].letter +
                    " count=" + hopFresh.letterList[lIdx].count +
                    " start=" + hopFresh.letterList[lIdx].startIdx +
                    " end=" + hopFresh.letterList[lIdx].endIdx);
      }
    }

    // revise the list, breaking up a letter with too many varieties
    // into two or more groupings (based on the second letter)
    for (lIdx = 0; lIdx < hopFresh.letterList.length; lIdx++) {
      if (hopFresh.letterList[lIdx].count > limit) {
        origStartIdx = hopFresh.letterList[lIdx].startIdx;
        origEndIdx = hopFresh.letterList[lIdx].endIdx;
        splitCount = parseInt((hopFresh.letterList[lIdx].count / limit) + 1);
        hopFresh.letterList.splice(lIdx, 1);  // remove item with too many varieties
        startIdx = origStartIdx;
        for (splitIdx = 0; splitIdx < splitCount; splitIdx++) {
          // get the index partway into the complete list
          midIdx = parseInt((origEndIdx - origStartIdx)*((splitIdx+1)/
                             splitCount) + origStartIdx);
          firstLetter = hopVarieties[midIdx].charAt(0).toUpperCase();
          // search the varieties for a change in the second letter
          secondLetter = hopVarieties[midIdx].charAt(1).toLowerCase();
          for (sIdx = midIdx + 1; sIdx <= origEndIdx; sIdx++) {
            if (secondLetter != hopVarieties[sIdx].charAt(1).toLowerCase()) {
              break;
            }
          }
          // get the second letter of the variety at the start of the list
          secondLetter = hopVarieties[startIdx].charAt(1).toLowerCase();
          count = sIdx - startIdx;
          if (count == 0) {
            continue;
          }
          // update letterList with small grouping
          firstLetterInfo =
              { letter:firstLetter+secondLetter,
                count:count, startIdx:startIdx, endIdx:sIdx-1 };
          hopFresh.letterList.splice(lIdx+splitIdx, 0, firstLetterInfo);
          startIdx = sIdx;
        }
      }
    }
    if (verbose) {
      console.log("REVISED LETTER LIST: ");
      for (lIdx = 0; lIdx < hopFresh.letterList.length; lIdx++) {
        console.log("  " + hopFresh.letterList[lIdx].letter +
                    " count=" + hopFresh.letterList[lIdx].count +
                    " start=" + hopFresh.letterList[lIdx].startIdx +
                    " end=" + hopFresh.letterList[lIdx].endIdx);
      }
    }
  }

  // construct dropdown menu of first letters

  // specify highest level dropdown menu button
  menu = "<div id='"+tableID+"' class='dropdown'> <button id='hopFresh.variety' onclick='hopFresh.varietySelect1()' class='dropbtn' value='"+selection+"'>"+selection+"</button><div id='varietyDropdown' class='dropdown-content'>";

  // first dropdown item is always '(unspecified)'
  submenu = "<div id=unspecified class='dropdown'><button onclick='hopFresh.varietySelect3(\"(unspecified)\")' class='dropbtn'>(unspecified)</button></div><br>";
  menu += submenu;

  // for each first letter in varities, construct dropdown menu
  for (lIdx = 0; lIdx < hopFresh.letterList.length; lIdx++) {
    letter = hopFresh.letterList[lIdx].letter;
    submenu = "<div id=letter"+letter+" class='dropdown'><button onclick='hopFresh.varietySelect2(\""+letter+"\")' class='dropbtn'>"+letter+"...</button><div id='varietyDropdown"+letter+"'></div></div>";
    menu += submenu;
  }

  return menu;
}

//------------------------------------------------------------------------------
// function to select hop variety at first level

this.varietySelect1 = function() {
  var dropdownMenu = "varietyDropdown";
  var origClassList = document.getElementById(dropdownMenu).classList;
  var selection = "";

  // user clicked on top-level dropdown menu button, so show the menu
  console.log("clicked on first-level dropdown");

  // get the current selection associated with the hop addition
  selection = document.getElementById("hopFresh.variety").innerHTML;

  // rebuild the first-level menu in case the user selected a letter
  // and then changed their mind and selected the original item.
  document.getElementById("hopFresh.varietyMenu").innerHTML =
        buildHops("hopFresh.varietyMenu", selection);

  // note: simply toggling 'show' doesn't work; need to know if the
  //       menu *was* being shown when we entered this routine, before
  //       rebuilding the first-level menu.
  if (origClassList.contains('show')) {
    document.getElementById(dropdownMenu).classList.remove('show');
    // set the current selection to black (otherwise it remains gray)
    document.getElementById("hopFresh.variety").style.color = "black";
  } else {
    document.getElementById(dropdownMenu).classList.add('show');
  }


  return;
}

//------------------------------------------------------------------------------
// function to select hop variety at second level

this.varietySelect2 = function(letter) {
  var endIdx = 0;
  var hIdx = 0;
  var hopVarieties = Object.keys(hops);
  var lIdx = 0;
  var startIdx = 0;
  var submenu = "";
  var varietyId1 = "";  // ID of first-level dropdown for variety
  var varietyId2 = "";  // ID of second-level dropdown for variety (letter)

  // user clicked on second-level dropdown menu button, so show the
  // specific varieties associated with this letter
  console.log("clicked on second-level dropdown");

  // change the submenu to the list of specific varieties
  submenu = "<div id=letter"+letter+" class='dropdown'><div id='varietyDropdown"+""+letter+"' class='dropdown-content'>";
  for (lIdx = 0; lIdx < hopFresh.letterList.length; lIdx++) {
    if (letter == hopFresh.letterList[lIdx].letter) {
      startIdx = hopFresh.letterList[lIdx].startIdx;
      endIdx = hopFresh.letterList[lIdx].endIdx;
      break
    }
  }

  for (hIdx = startIdx; hIdx <= endIdx; hIdx++) {
    submenu += "<button class='dropbtn' onclick='hopFresh.varietySelect3(\""+hopVarieties[hIdx]+"\")'>"+hopVarieties[hIdx]+"</button><br>";
  }
  submenu += "</div></div>";

  varietyId1 = "varietyDropdown";
  varietyId2 = "varietyDropdown" + letter;
  console.log("varietyId1 = " + varietyId1 + "; varietyId2 = " + varietyId2);

  // set the menu to the list of varieties, and show this list
  document.getElementById(varietyId1).innerHTML = submenu;
  document.getElementById(varietyId2).classList.toggle('show');

  return;
}

//------------------------------------------------------------------------------
// function to select hop variety at third level

this.varietySelect3 = function(variety) {
  var tableID = "";

  // user clicked on third-level (final) dropdown menu button, so
  // set the hop variety
  console.log("clicked on third-level dropdown, variety : " + variety);

  // rebuild pulldown menu to choose any letter (and set the variety in hops)
  tableID = "hopFresh.varietyMenu";
  document.getElementById(tableID).innerHTML = buildHops(tableID, variety);

  console.log("setting to " + variety + ", id = " + hopFresh.variety.id);
  hopFresh.variety.value = variety;
  hopFresh.variety.userSet = 1;
  common.set(hopFresh.variety, 1);

  return;
}

//------------------------------------------------------------------------------
// hide hop-selection dropdown buttons if click on something else

window.onclick = function(event) {
  var allDropdowns = null;
  var idx = 0;
  var openDropdown = null;
  var selection = "";

  // if click not on dropdown menu button, hide all dropdown menu(s)
  if (!event.target.matches('.dropbtn')) {
    allDropdowns = document.getElementsByClassName("dropdown-content");
    for (idx = 0; idx < allDropdowns.length; idx++) {
      openDropdown = allDropdowns[idx];
      // if dropdown is currently shown, hide it
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
        // get the current selection associated with the hop addition
        selection = document.getElementById("hopFresh.variety").innerHTML;
        // rebuild the top-level hop-selection menu and set the selection
        // to the current selection
        document.getElementById("hopFresh.varietyMenu").innerHTML =
            buildHops("hopFresh.varietyMenu", selection);
        // set the current selection to black (otherwise it remains gray)
        document.getElementById("hopFresh.variety").style.color = "black";
      }
    }
  }
  return;
}


//------------------------------------------------------------------------------
// set units to metric or British Imperial

function setUnits() {
  if (hopFresh.units.value == "metric") {
    // update displayed units
    if (document.getElementById('storageTemperatureUnits')) {
      document.getElementById('storageTemperatureUnits').innerHTML = "&deg;C";
    }

    // update variables
    common.set(hopFresh.storageTemp, 0);
  } else {
    // update displayed units
    if (document.getElementById('storageTemperatureUnits')) {
      document.getElementById('storageTemperatureUnits').innerHTML = "&deg;F";
     }

    // update variables
    common.set(hopFresh.storageTemp, 0);
  }

  return true;
}

//------------------------------------------------------------------------------
// compute IBUs and utilization for all hops additions

this.compute_hopFresh = function() {
  var currentAA = 0.0;
  var currentBA = 0.0;
  var freshnessFactor = 0.0;
  var HSI = 0.0;
  var oAA = 0.0;
  var oBA = 0.0;
  var percentLost = 0.0;

  if (hopFresh.verbose > 0) {
    console.log("============================================================");
  }

  // if the user sets AA, the BA default might change.  Need to update HTML
  common.set(hopFresh.BA, 0)

  if (!hopFresh.HSI.userSet) {
    freshnessFactor =  computeFreshnessFactor();
  } else {
    HSI = hopFresh.HSI.value;
    if (HSI < 0.25) HSI = 0.25; // at 0.25, freshness is 1.0
    if (HSI > 2.50) HSI = 2.50; // at 2.50, freshness is 0.0
    freshnessFactor = 1.0 - (1.10 * Math.log10(HSI * 4.0));
    if (freshnessFactor < 0.0) freshnessFactor = 0.0;
  }

  percentLost = 100.0 * (1.0 - freshnessFactor);
  currentAA = hopFresh.AA.value * freshnessFactor;
  oAA = hopFresh.AA.value * (1.0 - freshnessFactor);
  currentBA = hopFresh.BA.value * freshnessFactor;
  oBA = hopFresh.BA.value * (1.0 - freshnessFactor);

  // set output values in HTML
  if (document.getElementById("hopFresh.freshnessFactor")) {
      document.getElementById("hopFresh.freshnessFactor").innerHTML =
               freshnessFactor.toFixed(3);
  }
  if (document.getElementById("hopFresh.percentLost")) {
      document.getElementById("hopFresh.percentLost").innerHTML =
               percentLost.toFixed(1);
  }
  if (document.getElementById("hopFresh.currentAA")) {
      document.getElementById("hopFresh.currentAA").innerHTML =
               currentAA.toFixed(1);
  }
  if (document.getElementById("hopFresh.oAA")) {
      document.getElementById("hopFresh.oAA").innerHTML =
               oAA.toFixed(1);
  }
  if (document.getElementById("hopFresh.currentBA")) {
      document.getElementById("hopFresh.currentBA").innerHTML =
               currentBA.toFixed(1);
  }
  if (document.getElementById("hopFresh.oBA")) {
      document.getElementById("hopFresh.oBA").innerHTML =
               oBA.toFixed(1);
  }

  return true;
}

// close the "namespace" and call the function to construct it.
}
hopFresh._construct();
