// -----------------------------------------------------------------------------
// ibu_SMPH_search.js : JavaScript for AlchemyOverlord webpage, SMPH search page
// Written by John-Paul Hosom
// Copyright © 2018 by John-Paul Hosom, all rights reserved.
// To license this software, please contact John-Paul Hosom, for example at
//    alchemyoverlord © yahoo · com
//
// Version 1.0.1 : November 22, 2018
//         This version is based on the mIBU javascript code in this project,
//         which has then been modified to implement the SMPH method.
//
// -----------------------------------------------------------------------------

//==============================================================================

var SMPHsearch = SMPHsearch || {};

// TODO: check all variables, organize
//       check variable names for meaningfulness
//       change tabs to spaces, standardize tab indentation
//       make sure console.log() statements are meaningful and verbosity good

// This namespace contains functions that are specific to the
// SMPH searching method.
//
//     public functions:
//    . init_SMPH_search()
//    . increment_SMPH_search()
//

SMPHsearch._construct = function() {

"use strict";

//==============================================================================
// The following functions are related to computing IBU values for
// an experiment or group of experiments
//==============================================================================
//
//==============================================================================
// reset all values in ibu object to default values, except:
//  - units set to 'metric'
//  - wortLossVolume set to 0
//  - boilTime set to -1 (tells search to compute boilTime from other times)
//  - tempExpParamB set to -1 (tells search to use default exp. temp decay)
//  - tempLinParamA set to -1 (tells search to use default linear temp decay)

this.resetIBUvalues = function() {
  var idx = 0;
  var defaultValue;
  var keys = Object.keys(ibu);

  if (SMPH.verbose >= 4) {
    console.log("\n   --------- RESET --------\n");
    }

  for (idx = 0; idx < keys.length; idx++) {
    if (!ibu[keys[idx]].id) {
      continue;
    }
    if (keys[idx] == "units") {  // always use metric
      ibu[keys[idx]].value = "metric";
      continue;
    }
    if (keys[idx] == "wortLossVolume") {  // always zero
      ibu[keys[idx]].value = 0.0;
      continue;
    }
    if (keys[idx] == "boilTime") {  // -1 to indicate compute from other values
      ibu[keys[idx]].value = -1.0;
      continue;
    }
    if (keys[idx] == "tempExpParamB") { // -1 to indicate use default
      ibu[keys[idx]].value = -1.0;
      continue;
    }
    if (keys[idx] == "tempLinParamA") { // -1 to indicate use default
      ibu[keys[idx]].value = -1.0;
      continue;
    }

  if ("defaultValue" in ibu[keys[idx]]) {
    defaultValue = ibu[keys[idx]].defaultValue;
    } else if ("defaultFunction" in ibu[keys[idx]]) {
    defaultValue = ibu[keys[idx]].defaultFunction(ibu[keys[idx]].defaultArgs);
    } else {
    console.log("ERROR: can't find default value, setting to zero");
    defaultValue = 0.0;
    }

  if (SMPH.verbose >= 2) {
    console.log("resetting " + ibu[keys[idx]].id + " to " + defaultValue);
    }
  ibu[keys[idx]].value = defaultValue;
  }

  // remove any hop additions
  while (ibu.add.length > 0) {
    ibu.add.pop();
  }
  ibu.numAdditions.value = 0;

  return;
}

//==============================================================================

this.evaluateAllConditionsInExperiment = function(expName, expData,
             ibu, numAdd, timeToFirstAddition, preBoilSG) {
  var conditionsList = [];
  var IBU_list = [];
  var IAA_list = [];
  var time_list = [];
  var volume_list = [];
  var OG_list = [];
  var pH_list = [];
  var wortClarity_list = [];
  var fresh_list = [];
  var postBoil_time_list = [];
  var postBoil_temp_list = [];
  var weight_list = [];
  var weight2_list = [];
  var boilTime_list = [];
  var boilTime2_list = [];
  var cIdx = 0;
  var addIdx = 0;
  var addStr = "";
  var corrIBU = 0.0;
  var diff = 0.0;
  var IAAdiff = 0.0;
  var totalExpErr = 0.0;
  var numExpConditions = 0;
  var totalExpRMS = 0.0;
  var aIdx = 0;
  var htmlResults = "";
  var maxDiff = 0.0;
  var origBoilTime = 0.0;
  var preBoil_pH = 0.0;
  var postBoil_pH = 0.0;
  var keys = Object.keys(ibu);
  var idx = 0;
  var totalHopBoilTime = 0.0;
  var totalTime = 0.0;
  var realHopBoilTime = 0.0;
  var resetTempExpParamB = false;
  var resetTempLinParamA = false;
  var slopeSlope = -0.003927872518870565;
  var slopeIntercept = 0.018625896934116128;

  // get lists of values for each condition. All experiments must have
  // 'conditions' and 'IBU_list'; other lists are optional.
  // The code is currently set up for at most 2 hop additions, specified
  // in weight_list[] and weight2_list[], and optionally in
  // boilTime_list[] and boilTime2_list[].
  conditionsList = expData["conditions"];
  IBU_list = expData["IBU_list"];
  if (expData["IAA_list"]) {
    IAA_list = expData["IAA_list"];
  }
  if (expData["volume_list"]) {
    volume_list = expData["volume_list"];
  }
  if (expData["OG_list"]) {
    OG_list = expData["OG_list"];
  }
  if (expData["pH_list"]) {
    pH_list = expData["pH_list"];
  }
  if (expData["wortClarity_list"]) {
    wortClarity_list = expData["wortClarity_list"];
  }
  if (expData["fresh_list"]) {
    fresh_list = expData["fresh_list"];
  }
  if (expData["time_list"]) {
    time_list = expData["time_list"];
  }
  if (expData["postBoil_time_list"]) {
    postBoil_time_list = expData["postBoil_time_list"];
  }
  if (expData["postBoil_temp_list"]) {
    postBoil_temp_list = expData["postBoil_temp_list"];
  }
  if (expData["weight_list"]) {
    weight_list = expData["weight_list"];
  }
  if (expData["weight1_list"]) {
    weight_list = expData["weight1_list"];
  }
  if (expData["weight2_list"]) {
    weight2_list = expData["weight2_list"];
  }
  if (expData["boilTime_list"]) {
    boilTime_list = expData["boilTime_list"];
  }
  if (expData["boilTime1_list"]) {
    boilTime_list = expData["boilTime1_list"];
  }
  if (expData["boilTime2_list"]) {
    boilTime2_list = expData["boilTime2_list"];
  }

  // evaluate each condition, getting total error and table of all results
  htmlResults = "";
  totalExpErr = 0.0;
  for (cIdx = 0; cIdx < conditionsList.length; cIdx++) {
    // begin new row of table for outputs of this condition
    htmlResults += "<tr> "

    // set values for this condition
    if (volume_list.length > 0) {
      ibu.wortVolume.value = volume_list[cIdx];
    }
    if (OG_list.length > 0) {
      ibu.OG.value = OG_list[cIdx];
    }
    if (pH_list.length > 0) {
      ibu.pH.value = pH_list[cIdx];
    }
    if (wortClarity_list.length > 0) {
      ibu.wortClarity.value = wortClarity_list[cIdx];
    }

    // assume that freshness factor in list applies to all hop additions
    if (fresh_list.length > 0) {
      for (aIdx = 0; aIdx < ibu.numAdditions.value; aIdx++) {
        ibu.add[aIdx].freshnessFactor.value = fresh_list[cIdx];
      }
    }

    // assume that weight in weight_list applies to all hop additions
    if (weight_list.length > 0 && weight2_list.length == 0) {
      for (aIdx = 0; aIdx < ibu.numAdditions.value; aIdx++) {
        ibu.add[aIdx].weight.value = weight_list[cIdx];
      }
    }
    // otherwise, there should be weight1_list and weight2_list...
    else if (weight2_list.length > 0) {
      ibu.add[0].weight.value = weight_list[cIdx];
      ibu.add[1].weight.value = weight2_list[cIdx];
    }

    // assume that boilTime in boilTime_list applies to all additions
    if (boilTime_list.length > 0 && boilTime2_list.length == 0) {
      for (aIdx = 0; aIdx < ibu.numAdditions.value; aIdx++) {
        ibu.add[aIdx].boilTime.value = boilTime_list[cIdx];
      }
    }
    // otherwise, there should be boilTime1_list and boilTime2_list...
    else if (boilTime2_list.length > 0) {
      ibu.add[0].boilTime.value = boilTime_list[cIdx];
      ibu.add[1].boilTime.value = boilTime2_list[cIdx];
    }

    if (postBoil_time_list.length > 0) {
      ibu.whirlpoolTime.value = postBoil_time_list[cIdx];
    }
    if (postBoil_temp_list.length > 0) {
      ibu.holdTemp.value = postBoil_temp_list[cIdx];
      ibu.holdTempCheckbox.value = true;
    }

    // make copy of boil time for this experiment; possibly modify boilTime
    // for the current condition
    origBoilTime = ibu.boilTime.value;
    if (ibu.boilTime.value < 0 && time_list.length > 0) {
      ibu.boilTime.value = timeToFirstAddition + time_list[cIdx];
    }

    if (time_list.length > 0) {
      // if we have time_list[], adjust the boil times for each hop addition
      // so that the boil ends at each value in time_list[] and the hops
      // have steeped in the boil for the appropriate amount of time.
      totalHopBoilTime = expData["add1"][6];
      for (addIdx = 0; addIdx < numAdd; addIdx++) {
        addStr = "add"+(addIdx+1);
        realHopBoilTime = (expData[addStr][6] - totalHopBoilTime) +
                           time_list[cIdx];
        // if realHopBoilTime < 0, then the hops are never added in this cond.
        if (realHopBoilTime > 0) {
          ibu.add[addIdx].boilTime.value = realHopBoilTime;
          } else {
          ibu.add[addIdx].boilTime.value = 0;
          }
        // if we have more than one hop addition, but the weights for the
        // second hop addition are not specified in weight2_list[], then
        // set the weight to zero if the hops are never added to the boil
        // for this condition.
        if (addIdx > 0 && weight2_list.length == 0) {
          if (realHopBoilTime < 0.0) {
            ibu.add[addIdx].weight.value = 0.0;
            } else {
            ibu.add[addIdx].weight.value = expData[addStr][5];
            }
          }
        // console.log("  addition " + addIdx + " has boil time " +
        //             ibu.add[addIdx].boilTime.value.toFixed(2) +
        //             " based on full boil time " + expData[addStr][6] +
        //             " and weight "+ibu.add[addIdx].weight.value.toFixed(2));
      }
    } else {
      // if there is no time_list[], set hop boil time to the full boil
      // time value specified in the array of hop values, index 6.
      for (addIdx = 0; addIdx < numAdd; addIdx++) {
        addStr = "add"+(addIdx+1);
        if ((addIdx == 0 && boilTime_list.length == 0) ||
            (addIdx == 1 && boilTime2_list.length == 0) || addIdx > 1) {
          ibu.add[addIdx].boilTime.value = expData[addStr][6];
        }
      }
    }

    // if pH is "estimate" (i.e. <= 0), then set ibu.pH.value based on
    // preBoilSG, timeTofirstAddition, and boil time
    if (ibu.pH.value <= 0.0) {
      if (preBoilSG == 0.0) preBoilSG = 1.055;
      // first, estimate pre-boil pH from pre-boil specific gravity; this
      // estimate comes from blog post 'Some Observations of Mash and Wort pH'
      preBoil_pH = 0.77 * Math.exp(-28.7*(preBoilSG - 1.0)) + 5.624;
      // then, estimate reduction in (post-boil) pH due to boil time,
      totalTime = ibu.boilTime.value; // already includes time to 1st addition
      postBoil_pH = (preBoil_pH * ((slopeSlope * totalTime) + 1.0)) +
                                 (slopeIntercept * totalTime);
      // console.log("set pH to " + postBoil_pH.toFixed(4) +
                  // " from pre-boil pH " + preBoil_pH.toFixed(4) +
                  // ", based on SG=" + preBoilSG.toFixed(4) +
                  // ", and boilTime=" + ibu.boilTime.value);
      ibu.pH.value = postBoil_pH;
    }


    // if they're not explicitly specified, make sure temperature decay
    // functions are properly set to default values based on volume and kettle.
    resetTempExpParamB = false;
    if (ibu.tempExpParamB.value < 0.0) {
      // ibu.tempExpParamB.value = get_tempExpParamB_default();
      idx = keys.indexOf("tempExpParamB");
      ibu.tempExpParamB.value =
          ibu[keys[idx]].defaultFunction(ibu[keys[idx]].defaultArgs);
      resetTempExpParamB = true;
    }
    resetTempLinParamA = false;
    if (ibu.tempLinParamA.value < 0.0) {
      // ibu.tempLinParamA.value = get_tempLinParamA_default();
      idx = keys.indexOf("tempLinParamA");
      ibu.tempLinParamA.value =
          ibu[keys[idx]].defaultFunction(ibu[keys[idx]].defaultArgs);
      resetTempLinParamA = true;
    }

    // get correct IBU value
    if (expName == "Tinseth") {
      Tinseth.verbose = 0;
      Tinseth.computeIBU_Tinseth();
      corrIBU = ibu.IBU;
    } else {
      corrIBU = IBU_list[cIdx];
    }

    // compute IBU value using SMPH model (make sure no verbosity)
    SMPH.verbose = 0;
    SMPH.computeIBU_SMPH();

    // create output values and table of results
    diff = ibu.IBU - corrIBU;
    if (Math.abs(diff) > maxDiff) {
      maxDiff = Math.abs(diff);
    }
    totalExpErr += diff * diff;
    numExpConditions += 1;

    // if Peacock experiment, include IAA values in error
    if (expName == "Peacock") {
      IAAdiff = IAA_list[cIdx] - ibu.IAA;
      if (Math.abs(IAAdiff) > maxDiff) {
        maxDiff = Math.abs(IAAdiff);
      }
      totalExpErr += IAAdiff * IAAdiff;
      numExpConditions += 1;
    }

    // build up table of results for each condition
    htmlResults += "<td>"+conditionsList[cIdx]+"</td> "
    htmlResults += "<td>"+corrIBU.toFixed(2)+"</td> "
    htmlResults += "<td>"+ibu.IBU.toFixed(2)+"</td> "
    htmlResults += "<td>"+ibu.AA.toFixed(2)+"</td> "
    htmlResults += "<td>"+ibu.IAA.toFixed(2)+"</td> "
    htmlResults += "<td>"+ibu.U.toFixed(2)+"</td> "
    htmlResults += "<td>"+ibu.IAApercent.toFixed(2)+"</td> "
    htmlResults += "<td>"+ibu.oAA.toFixed(2)+"</td> "
    htmlResults += "<td>"+ibu.oBA.toFixed(2)+"</td> "
    htmlResults += "<td>"+ibu.hopPP.toFixed(2)+"</td> "
    htmlResults += "<td>"+ibu.maltPP.toFixed(2)+"</td> "
    htmlResults += "<td>"+ibu.FCT.toFixed(2)+"</td> "
    htmlResults += "<td>"+diff.toFixed(2)+"</td> "
    htmlResults += "</tr> "

    // reset boil time back to original value for this experiment
    ibu.boilTime.value = origBoilTime;
    if (resetTempExpParamB) {
      ibu.tempExpParamB.value = -1.0;
      }
    if (resetTempLinParamA) {
      ibu.tempLinParamA.value = -1.0;
      }
  }

  htmlResults += "</table> "

  return [totalExpErr, numExpConditions, htmlResults, maxDiff];
}

//==============================================================================
// recursively evaluate settings for an experiment. If list of not-yet-added
// settings is empty, evaluate list of all settings.  Otherwise, pop
// one setting off the list, and call this function with all values for
// that setting.

this.recurseExperimentSettings = function(expList, expData, ibu, numAdd,
            timeToFirstAddition, preBoilSG, searchData, res) {
  var resList = [];
  var bestResList = [];
  var pIdx = 0;
  var origCurrSettings = null;
  var currSearch = null;
  var remain = null;
  var v = 0.0;
  var addStr = "";
  var addIdx = 0;
  var low = 0.0;
  var high = 0.0;
  var inc = 0.0;

  if (searchData == "") {
    // if no other parameters to search, compute IBUs and evaluate error.
    // evaluate on all conditions in experiment, check for best error, return
    resList = this.evaluateAllConditionsInExperiment(expList, expData,
            ibu, numAdd, timeToFirstAddition, preBoilSG);
    res.numCombinations += 1;
    if (resList[0] < res.bestErr) {
      res.bestErr = resList[0];
      res.numExpConditions = resList[1];
      res.htmlResult = resList[2];
      res.maxDiff = resList[3];
      res.bestParams = res.currSettings;
      }
    return;
  } else {
  // otherwise, continue to call recurseExperimentSettings() with additional
  // search parameters
  currSearch = searchData[0];
  remain = searchData.slice(1);  // get remaining items
  // call recursive evaluation function on each point in searchData[0]
  low = currSearch.low;
  high = currSearch.high;
  if (isNaN(currSearch.inc)) currSearch.inc = 0.0;
  inc = currSearch.inc;
  if (currSearch.method == "relative") {
    low = currSearch.default * currSearch.low;
    high = currSearch.default * currSearch.high + 0.001;  // add epsilon
    inc = currSearch.default * currSearch.inc;
    if (inc == 0.0) inc = (high - low) / 10.0;
  }
  if (currSearch.method == "offset") {
    low = currSearch.default + currSearch.low;
    high = currSearch.default + currSearch.high;
    inc = currSearch.inc;
    if (inc == 0.0) inc = (high - low) / 10.0;
  }
  if (inc == 0.0) inc = 0.001;  // if high and low are same, no infinite loop
  console.log("searching " + low + " to " + high + " with inc " + inc);
  for (v = low; v <= high; v += inc) {
    // prevent floating-point drift by forcing all values to 4 decimal points
    v = Number(v.toFixed(4));

    // set value in ibu object,
    // checking to see if setting is for a hop addition (addStr)
    addStr = currSearch.param.match(/(.+)(\d+)/);
    if (addStr) {
      addIdx = parseInt(addStr[2])-1;
      ibu.add[addIdx][addStr[1]].value = v;
    } else {
      ibu[currSearch.param].value = v;
    }

    // add current search parameter and value to the list, and keep recursing
    origCurrSettings = res.currSettings;
    res.currSettings = res.currSettings + currSearch.param + "=" + v + ", ";
    this.recurseExperimentSettings(expList, expData, ibu, numAdd,
                     timeToFirstAddition, preBoilSG, remain, res);
    // remove current search parameter from the list so they don't accumulate
    res.currSettings = origCurrSettings;
    }
  }

  return;
}

//==============================================================================

this.evaluateAllExperiments = function(expIdxList, parameters,
                              expList, expData) {
  var eIdx = 0; // experiment index
  var kIdx = 0;
  var isList = 0;
  var condition = "";
  var results = "";
  var cIdx = 0;
  var expKeys;
  var expValues;
  var timeToFirstAddition = 0.0;
  var preBoilSG = 0.0;
  var addStr = "";
  var addIdx = 0;
  var addNum = 0;
  var addNumStr = "";
  var numAdd = 0;
  var corrIBU = 0.0;
  var diff = 0.0;
  var totalExpErr = 0.0;
  var totalExpRMS = 0.0;
  var numExpConditions = 0;
  var idx = 0;
  var selectIdx = 0;
  var searchData = "";
  var currSettings = "";
  var bestParams = "";
  var res = new Object();
  var d = new Date();
  var n = "";
  var resultsId = "";
  var expResults = "";
  var maxDiff = 0.0;
  var maxDiffGlobal = 0.0;
  var totalErrGlobal = 0.0;
  var numConditionsGlobal = 0.0;
  var maxDiffExp = "";
  var globalRMS = 0.0;
  var skipSearch = false;
  var globalHtmlResult = "";
  var paramList = [];

  // loop over all experiments
  maxDiffGlobal = 0.0;
  totalErrGlobal = 0.0;
  numConditionsGlobal = 0.0;
  expResults = "";
  for (idx = 0; idx < expIdxList.length; idx++) {
    eIdx = expIdxList[idx];
    totalExpErr = 0.0;
    numExpConditions = 0;
    this.resetIBUvalues();  // reset all values, for safety

    // initialize the output results for current experiment
    results = ""
    results += "<b>Experiment '" + expList[eIdx] + "'</b> <br> "
    results += "<table style='margin-left:5%;width:95%' id='resultsTable'> "
    results += "<tbody> "
    results += "<tr> "
    results += "<td><b>condition</b></td>"
    results += "<td><b>meas.</b></td> "
    results += "<td><b>estimate</b></td> "
    results += "<td><b>[AA]<sub>0</sub></b></td> "
    results += "<td><b>[IAA]</b></td> "
    results += "<td><b>util.</b></td> "
    results += "<td><b>IAA%</b></td> "
    results += "<td><b>[oAA]</b></td> "
    results += "<td><b>[oBA]</b></td> "
    results += "<td><b>[PP<sub>hops</sub>]</b></td> "
    results += "<td><b>[PP<sub>malt</sub>]</b></td> "
    results += "<td><b>FCT</b></td> "
    results += "<td><b>diff</b></td> "
    results += "</tr> "

    // process keys and values for this experiment
    // console.log("EXP = " + expList[eIdx]);
    expKeys = Object.keys(expData[eIdx]);
    expValues = Object.values(expData[eIdx]);

    timeToFirstAddition = 0.0;
    preBoilSG = 0.0;
    numAdd = 0;
    searchData = "";
    skipSearch = false;
    for (kIdx = 0; kIdx < expKeys.length; kIdx++) {
      if (expKeys[kIdx] == "skipSearch") {
        skipSearch = expValues[kIdx];
        continue;
      } else if (expKeys[kIdx] == "search") {
        searchData = expValues[kIdx];
        if (skipSearch) {
          searchData = [];
          }
        continue;
      } else if (expKeys[kIdx] == "conditions") {
        continue;
      }
      else if (expKeys[kIdx].indexOf("_list") >= 0) {
        continue;
      }
      else if (expKeys[kIdx].indexOf("add") >= 0) {
        addNumStr = expKeys[kIdx].match(/(?:add?)(\d+)/);
        addNum = parseInt(addNumStr[1]);
        // console.log("adding hops " + addNum + " with " + expValues[kIdx]);
        if (addNum > numAdd) {
          numAdd = addNum;
          }
        addIdx = addNum - 1;
        if (numAdd > ibu.numAdditions.value) {
          ibu.numAdditions.value = numAdd;
          var hops = new Object;
          ibu.add.push(hops);
          ibu.add[addIdx].AA = new Object;
          ibu.add[addIdx].AA.id = "AA"+addNum;

          ibu.add[addIdx].BA = new Object;
          ibu.add[addIdx].BA.id = "BA"+addNum;

          ibu.add[addIdx].hopForm = new Object;
          ibu.add[addIdx].hopForm.id = "hopForm"+addNum;

          ibu.add[addIdx].pelletFactor = new Object;
          ibu.add[addIdx].pelletFactor.id = "pelletFactor"+addNum;

          ibu.add[addIdx].freshnessFactor = new Object;
          ibu.add[addIdx].freshnessFactor.id = "freshnessFactor"+addNum;

          ibu.add[addIdx].percentLoss = new Object;
          ibu.add[addIdx].percentLoss.id = "percentLoss"+addNum;

          ibu.add[addIdx].weight = new Object;
          ibu.add[addIdx].weight.id = "weight"+addNum;

          ibu.add[addIdx].boilTime = new Object;
          ibu.add[addIdx].boilTime.id = "boilTimeTable"+addNum;
        }
        ibu.add[addIdx].AA.value = expValues[kIdx][0];
        ibu.add[addIdx].BA.value = expValues[kIdx][1];
        ibu.add[addIdx].hopForm.value = expValues[kIdx][2];
        if (expValues[kIdx].length > 7) {
          ibu.add[addIdx].pelletFactor.value = expValues[kIdx][7];
        } else {
          ibu.add[addIdx].pelletFactor.value = 2.0;
        }
        ibu.add[addIdx].freshnessFactor.value = expValues[kIdx][3];
        ibu.add[addIdx].percentLoss.value = expValues[kIdx][4];
        ibu.add[addIdx].weight.value = expValues[kIdx][5];
        ibu.add[addIdx].boilTime.value = 0.0;  // fix later
      } else if (expKeys[kIdx] == "timeToFirstAddition") {
        timeToFirstAddition = expValues[kIdx];
      } else if (expKeys[kIdx] == "preBoilSG") {
        preBoilSG = expValues[kIdx];
      } else if (expKeys[kIdx] == "pH") {
        if (expValues[kIdx] == "estimate") {
          ibu[expKeys[kIdx]].value = -1.0;
        } else {
          ibu[expKeys[kIdx]].value = expValues[kIdx];
        }
      } else {
      // console.log("setting " + expKeys[kIdx] + " value to " + expValues[kIdx]);
      if (ibu[expKeys[kIdx]]) {
        ibu[expKeys[kIdx]].value = expValues[kIdx];
        } else {
        throw "ERROR: " + expKeys[kIdx] + " is not defined";
        window.alert("ERROR: " + expKeys[kIdx] + "is not defined");
        }
      }
    }

    res.currSettings = "";
    res.bestErr = 1.0e20;
    res.numExpConditions = 0;
    res.maxDiff = 0.0;
    res.htmlResult = "";
    res.bestParams = "";
    res.numCombinations = 0;
    this.recurseExperimentSettings(expList[eIdx], expData[eIdx],
             ibu, numAdd, timeToFirstAddition, preBoilSG, searchData, res);
    currSettings = res.currSettings;
    bestParams = res.bestParams;
    maxDiff = res.maxDiff;
    results += res.htmlResult;
    totalExpErr = res.bestErr;
    numExpConditions = res.numExpConditions;

    if (maxDiff > maxDiffGlobal) {
      maxDiffGlobal = maxDiff;
      maxDiffExp = expList[eIdx];
    }
    totalErrGlobal += totalExpErr;
    numConditionsGlobal += numExpConditions;

    bestParams = bestParams.slice(0,-2); // remove trailing comma and space
    // console.log("best err: " + res.bestErr.toFixed(2) +
                // ", params: " + bestParams);
    results += "&nbsp;&nbsp;&nbsp;&nbsp;<u>Parameters:</u> " + bestParams +
                 " (from " + res.numCombinations + " combinations)<br>";

    totalExpRMS = Math.sqrt(totalExpErr / numExpConditions);
    results += "&nbsp;&nbsp;&nbsp;&nbsp;<u>RMS error:</u> " +
           totalExpRMS.toFixed(3) + " = sqrt(" +
           totalExpErr.toFixed(3) + " / " + numExpConditions + "); " +
           "max. difference = " + maxDiff.toFixed(2) + "<br>";
    results += "<br>"

    expResults += results;
  }

  paramList = parameters.split(':');
  paramList.shift();
  paramList = paramList.join(', ');

  globalHtmlResult = "Best Parameters: " + paramList + "<br>";
  globalRMS = Math.sqrt(totalErrGlobal / numConditionsGlobal);
  globalHtmlResult += "Total RMS Error: " + globalRMS.toFixed(2) +
                      " = sqrt(" + totalErrGlobal.toFixed(2) +
                      " / " + numConditionsGlobal + ") from " +
                      expIdxList.length + " experiments<br>";


  globalHtmlResult += "maximum difference " + maxDiffGlobal.toFixed(2) +
                      " in experiment '" + maxDiffExp + "'<p>";
  globalHtmlResult += expResults;

  this.resetIBUvalues();  // reset all values to default, for safety
  return [totalErrGlobal, globalHtmlResult];
}

//==============================================================================
// the following functions are related to the search for model parameters
//==============================================================================

//==============================================================================
// initialize the search for model parameters

this.init_SMPH_search = function() {
  var divHtml = "";
  var eIdx = 0;
  var d = new Date();
  var n = "";
  var trainExpList = Object.keys(trainingData);
  var trainExpData = Object.values(trainingData);
  var trainExpIdxList = [];
  var developmentExpIdxList = [];
  var developmentExpList = Object.keys(developmentData);
  var developmentExpData = Object.values(developmentData);
  var testExpIdxList = [];
  var testExpList = Object.keys(testData);
  var testExpData = Object.values(testData);
  var evalTrainExpList = [];
  var evalDevelopmentExpList = [];
  var evalTestExpList = [];
  var selectIdx = 0;
  var idx = 0;
  var d = new Date();
  var n = "";
  var progressText = "";
  var divHtml = "";
  var paramKeys = [];
  var paramObs = null;
  var pIdx = 0;
  var evalParamList = null;
  var kvList = null;
  var newList = [];
  var v = 0.0;
  var idx = 0;
  var kIdx = 0;
  var item = "";

  progressText = "click on a 'search type' button above " +
                 "to start the parameter search";
  document.getElementById('progress').innerHTML = progressText;

  Tinseth.initialize_Tinseth();  // need Tinseth for evaluating Tinseth model
  SMPH.initialize_SMPH();

  n = d.toLocaleTimeString();
  console.log(n);

  // create HTMLdivisions for global results and for each experiment
  // (training, development, and testing)
  divHtml = "<div id='resultsGlobal'></div> "
  for (eIdx = 0; eIdx < trainExpList.length; eIdx++) {
    divHtml += "<div id='results"+trainExpList[eIdx]+"'></div> "
    }
  for (eIdx = 0; eIdx < developmentExpList.length; eIdx++) {
    divHtml += "<div id='results"+developmentExpList[eIdx]+"'></div> "
    }
  for (eIdx = 0; eIdx < testExpList.length; eIdx++) {
    divHtml += "<div id='results"+testExpList[eIdx]+"'></div> "
    }
  document.getElementById('resultsTableDiv').innerHTML = divHtml;

  paramKeys = Object.keys(params);
  paramObs = Object.values(params);
  console.log("total searches available : " + paramKeys.length);
  pIdx = 0;

  // create list of index values of *training* experiments to evaluate
  evalTrainExpList = evaluateTrainingExperiments;
   if (evalTrainExpList.length == 0) {
    evalTrainExpList = trainExpList;
  }
  for (idx = 0; idx < evalTrainExpList.length; idx++) {
    if (evalTrainExpList[idx].search('SKIP') != -1) {
      console.log("skipping " + evalTrainExpList[idx]);
      continue;
    }
    selectIdx = trainExpList.indexOf(evalTrainExpList[idx]);
    if (selectIdx < 0) {
      console.log("ERROR: can't find experiment " + evalTrainExpList[idx] +
                  " in list of experiments: ");
      console.log("       " + trainExpList);
      return;
    }
    trainExpIdxList.push(selectIdx);
  }

  // create list of index values of *development* experiments to evaluate
  evalDevelopmentExpList = evaluateDevelopmentExperiments;
  if (evalDevelopmentExpList.length == 0) {
    evalDevelopmentExpList = developmentExpList;
  }
  for (idx = 0; idx < evalDevelopmentExpList.length; idx++) {
    if (evalDevelopmentExpList[idx].search('SKIP') != -1) {
      console.log("skipping " + evalDevelopmentExpList[idx]);
      continue;
    }
    selectIdx = developmentExpList.indexOf(evalDevelopmentExpList[idx]);
    if (selectIdx < 0) {
      console.log("ERROR: can't find experiment " +
                   evalDevelopmentExpList[idx] +
                  " in list of experiments: ");
      console.log("       " + developmentExpList);
      return;
    }
    developmentExpIdxList.push(selectIdx);
  }

  // create list of index values of *test* experiments to evaluate
  evalTestExpList = evaluateTestExperiments;
  if (evalTestExpList.length == 0) {
    evalTestExpList = testExpList;
  }
  for (idx = 0; idx < evalTestExpList.length; idx++) {
    if (evalTestExpList[idx].search('SKIP') != -1) {
      console.log("skipping " + evalTestExpList[idx]);
      continue;
    }
    selectIdx = testExpList.indexOf(evalTestExpList[idx]);
    if (selectIdx < 0) {
      console.log("ERROR: can't find experiment " + evalTestExpList[idx] +
                  " in list of experiments: ");
      console.log("       " + testExpList);
      return;
    }
    testExpIdxList.push(selectIdx);
  }

  // build list of model parameters to evaluate with low and high ranges
  // for each seach type (coarse ... fine)
  this.searchList = [];
  this.paramList = [];
  this.trainExpIdxList = [];
  this.developmentExpIdxList = [];
  this.testExpIdxList = [];
  for (pIdx = 0; pIdx < paramKeys.length; pIdx++) {
    evalParamList = paramObs[pIdx];
    kvList = new Array( new Array());
    newList = [];
    v = 0.0;
    idx = 0;
    kIdx = 0;
    for (idx = 0; idx < evalParamList.length; idx++) {
      newList = [];
      for (kIdx = 0; kIdx < kvList.length; kIdx++) {
        item = kvList[kIdx];
        for (v = evalParamList[idx].low; v <= evalParamList[idx].high;
             v += evalParamList[idx].inc) {
          v = Number(v.toFixed(3));
          newList.push(item + ":" + evalParamList[idx].param + "=" + v);
          }
        }
      kvList = newList;
      }
    console.log("PARAMETER SEARCH LIST LENGTH: " + kvList.length);
    this.searchList.push(paramKeys[pIdx]);
    this.paramList.push(kvList);
    this.trainExpIdxList.push(trainExpIdxList);
    this.developmentExpIdxList.push(developmentExpIdxList);
    this.testExpIdxList.push(testExpIdxList);
  }

  this.searchIndex = -1;  // -1 = show initial message
  SMPH.verbose = 0;

  return;
}

//==============================================================================
// increment the search for model parameters, evaluating the set of
// experiments with the next set of parameters.  The search is split into
// 'increments' in order to update the HTML output after every set
// of experiments.

this.increment_SMPH_search = function(searchType) {
  var item = "";
  var trainExpList = Object.keys(trainingData);
  var trainExpData = Object.values(trainingData);
  var developmentExpList = Object.keys(developmentData);
  var developmentExpData = Object.values(developmentData);
  var testExpList = Object.keys(testData);
  var testExpData = Object.values(testData);
  var res = null;
  var resList = [];
  var d = new Date();
  var n = "";
  var pIdx = 0;
  var progressText = "";
  var typeIdx = 0;
  var percentDone = 0;
  var expIdxList = [];
  var paramKeys = [];
  var paramValueList = [];
  var regexpRes = [];
  var elapsedSec = 0.0;
  var elapsedMin = 0.0;
  var elapsedHrs = 0.0;
  var estimate = 0.0;
  var estDate = "";

  // if searchIndex == -1, then initialize for search
  if (this.searchIndex == -1) {
    d = new Date();
    n = d.toLocaleTimeString();
    console.log(n);
    this.beginTime = n;
    this.beginDate = d.getTime();

    this.minError = 1.0e20;
    this.bestParams = "";

    progressText = "<H2>Please wait...</H2><br>";
    document.getElementById('progress').innerHTML = progressText;

    this.searchIndex += 1;
    setTimeout(function() {
        SMPHsearch.increment_SMPH_search(searchType);
     }, 0);
    return;
    }

  // find the search type (coarse, fine, etc.) index into list
  paramKeys = Object.keys(params);
  for (typeIdx = 0; typeIdx < paramKeys.length; typeIdx++) {
    if (searchType != "development" && searchType != "test" &&
        paramKeys[typeIdx] == searchType) {
      break;
      }
    if ((searchType == "development" || searchType == "test") &&
         paramKeys[typeIdx] == "none") {
      break;
      }
    }
  if (typeIdx >= paramKeys.length) {
    console.log("Error: search type not found");
    return;
    }

  // determine if done with entire search
  if (this.searchIndex >= this.paramList[typeIdx].length) {
    console.log("done");
    this.searchIndex = -1;
    return;
    }

  // get the list of index values into experiment parameters
  if (searchType == "development") {
    expIdxList = this.developmentExpIdxList[typeIdx];
    } else if (searchType == "test") {
    expIdxList = this.testExpIdxList[typeIdx];
    } else {
    expIdxList = this.trainExpIdxList[typeIdx];
    }


  // get current settings to evaluate during this increment
  item = this.paramList[typeIdx][this.searchIndex];
  // console.log("processing " + item);
  paramValueList = item.split(':'); // split into list
  paramValueList.shift(); // remove first (null) item
  for (pIdx = 0; pIdx < paramValueList.length; pIdx++) {
    regexpRes = paramValueList[pIdx].split("=");
    // console.log("    setting " + regexpRes[0] + " to " + regexpRes[1]);
    SMPH[regexpRes[0]] = Number(regexpRes[1]);
    }

  // evaluate all experiments with these parameter settings
  if (searchType == "development") {
    resList = this.evaluateAllExperiments(expIdxList, item,
                                   developmentExpList, developmentExpData);
    } else if (searchType == "test") {
    resList = this.evaluateAllExperiments(expIdxList, item,
                                   testExpList, testExpData);
    } else {
    resList = this.evaluateAllExperiments(expIdxList, item,
                                   trainExpList, trainExpData);
    }

  // update based on results
  resList.numCombinations += 1;
  console.log("err="+resList[0].toFixed(2) + " : " + item);
  if (resList[0] < this.minError) {
    this.minError = resList[0];
    this.bestParams = item;
    document.getElementById('resultsGlobal').innerHTML = resList[1];
    }

  d = new Date();
  n = d.toLocaleTimeString();
  // console.log("current time " + n);

  // create progress HTML output
  // start with when the search started and how much time has elapsed
  progressText += "search type: " + searchType + "<br>";
  progressText += "begin time = " + this.beginTime + "<br>";
  elapsedSec = (Number(d.getTime()) - Number(this.beginDate)) / 1000.0;
  elapsedMin = elapsedSec / 60.0;
  elapsedHrs = elapsedMin / 60.0;
  if (elapsedHrs > 1.0) {
    elapsedMin = (elapsedHrs - Math.floor(elapsedHrs)) * 60.0;
    elapsedHrs = Math.floor(elapsedHrs);
    progressText += "elapsed time = " + elapsedHrs.toFixed(0) +
                    " hours and " + elapsedMin.toFixed(2) + " minutes <br>";
  } else if (elapsedMin > 1.0) {
    elapsedSec = (elapsedMin - Math.floor(elapsedMin)) * 60.0;
    elapsedMin = Math.floor(elapsedMin);
    progressText += "elapsed time = " + elapsedMin.toFixed(0) +
                     " minutes and " + elapsedSec.toFixed(2) + " seconds <br>";
  } else {
    progressText += "elapsed time = " + elapsedSec.toFixed(2) + " seconds<br>";
  }

  // estimate when this will end
  elapsedSec = (Number(d.getTime()) - Number(this.beginDate)) / 1000.0;
  estimate = elapsedSec * (this.paramList[typeIdx].length+1) /
                          (this.searchIndex+1);
  if (estimate > 60 * 60) {
    progressText += "estimated duration = " +
                    (estimate/(60*60)).toFixed(2) + " hours<br>";
    } else if (estimate > 60.0) {
    progressText += "estimated duration = " +
                    (estimate/(60)).toFixed(2) + " minutes<br>";
    } else {
    progressText += "estimated duration = " +
                     estimate.toFixed(2) + " seconds<br>";
    }
  estDate = new Date((estimate*1000) + this.beginDate);
  progressText += "estimated finish at " +
                   estDate.toLocaleTimeString() + "<br>";

  // add what percent has been done to the output
  progressText += "processing " + (this.searchIndex + 1) +
                 " out of " + this.paramList[typeIdx].length;
  percentDone = 100*(this.searchIndex+1)/this.paramList[typeIdx].length;
  progressText += "; " + percentDone.toFixed(0) + "% done<br>";

  document.getElementById('progress').innerHTML = progressText;
  this.searchIndex += 1;

  // process next increment
  setTimeout(function() {
      SMPHsearch.increment_SMPH_search(searchType);
   }, 0);

  return;
}

}
SMPHsearch._construct();
