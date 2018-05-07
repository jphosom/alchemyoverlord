// -----------------------------------------------------------------------------
// ibu_tinseth.js : JavaScript for AlchemyOverlord web page, Tinseth sub-page
// Written by John-Paul Hosom
//
// Copyright © 2018 John-Paul Hosom, all rights reserved.
//
// Version 1.0.0 : January 30, 2017
//         Initial version.  Complete but no-frills implementation of the
//         Tinseth formula.
//
// Version 1.0.1 : May 6, 2018
//         Add evaporation rate, losses, topoff volume, global scaling factor
//
// TODO:
// 1. save and load settings with cookies
// -----------------------------------------------------------------------------

// global variable needed for validateNumber() but not used in this code
var junk = 0.0;

//------------------------------------------------------------------------------
// set units to metric or British Imperial

function setUnits_Tinseth() {
  var isMetric = document.getElementById("unitsMetric").checked;
  var numAdd = document.getElementById("numAdd").value;
  var rate   = 0.0;
  var volume = 0.0;
  var weight = 0.0;

  if (isMetric) {
    // update units
    document.getElementById('volumeUnits').innerHTML = "liters";
    document.getElementById('weightUnits').innerHTML = "g";
    document.getElementById('topoffUnits').innerHTML = "liters";
    document.getElementById('wortLossUnits').innerHTML = "liters";
    document.getElementById('evaporationUnits').innerHTML = "liters/hr";

    // convert and update volume
    volume = Number(document.getElementById('volume').value);
    volume = convertVolumeToLiters(volume);
    document.getElementById('volume').value = volume.toFixed(2);

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
    document.getElementById('wortLossUnits').innerHTML = "G";
    document.getElementById('evaporationUnits').innerHTML = "G/hr";
    document.getElementById('topoffUnits').innerHTML = "G";

    // convert and update volume
    volume = Number(document.getElementById('volume').value);
    volume = convertVolumeToGallons(volume);
    document.getElementById('volume').value = volume.toFixed(2);

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
  return true;
}

//------------------------------------------------------------------------------
// compute IBUs and utilization for all hops additions

function computeIBU () {
  var isMetric = document.getElementById('unitsMetric').checked;
  var postBoilVolume = document.getElementById('volume').value;
  var wortLossVolume = document.getElementById('wortLossVolume').value;
  var wortLossVolumeDefault = 0.0;
  var OG = document.getElementById('OG').value;
  var OGpoints = 0.0;
  var SG = 0.0;
  var SGpoints = 0.0;
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
  var tableID = "";
  var idxP1 = 0;
  var weightDefault = 1.0;
  var evaporationRate = document.getElementById('evaporationRate').value;
  var evaporationRateDefault = get_evaporationRate_default();
  var topoffVolume = document.getElementById('topoffVolume').value;
  var topoffVolumeDefault = 0.0;
  var scalingFactor = document.getElementById('scalingFactor').value;

  // if no IBU outputs exist (no table yet), then just return
  if (!document.getElementById("AA1")) {
    return false;
  }
  console.log("==============================================================");

  if (isMetric) {
    volumeDefault = 20.0;
    weightDefault = 30.0;
  }
  postBoilVolume = Number(validateNumber(postBoilVolume, 0, 5000, 2,
        volumeDefault, "volume", document.getElementById('volume'), junk));
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

  // convert to metric if needed
  if (!isMetric) {
    postBoilVolume = convertVolumeToLiters(postBoilVolume);
    wortLossVolume = convertVolumeToLiters(wortLossVolume);
    evaporationRate = convertVolumeToLiters(evaporationRate);
    topoffVolume = convertVolumeToLiters(topoffVolume);
  }

  // find out how long the boil is, or at least how long the hops will steep
  maxBoilTime = 0.0;
  for (idx = 0; idx < numAdd; idx++) {
    idxP1 = idx + 1;
    tableID = "boilTimeTable"+idxP1;
    boilTime = document.getElementById(tableID).value;
    boilTime = Number(validateNumber(boilTime, 0.0, 360.0, 1, 0.0,
              "boil time (min)", document.getElementById(tableID), junk));
    if (boilTime > maxBoilTime) {
      maxBoilTime = boilTime;
    }
  }
  console.log("maximum boil time is " + maxBoilTime);

  // compute volume at beginning of boil, average volume, and adjust
  // boil gravity to be the average gravity during the boil
  volume = postBoilVolume + (evaporationRate/60.0 * maxBoilTime);
  console.log("volume at first hops addition = " +
              postBoilVolume + " + (" + evaporationRate + "/60.0 * " +
              maxBoilTime + ") = " + volume);
  averageVolume = (volume + postBoilVolume) / 2.0;
  OGpoints = (OG - 1.0) * 1000.0;
  SGpoints = OGpoints * averageVolume / postBoilVolume;
  SG = (SGpoints / 1000.0) + 1.0;
  console.log("OG is " + OG.toFixed(4) + ", post-boil volume is " +
              postBoilVolume.toFixed(4) + " and initial volume is " +
              volume.toFixed(4) + ", so *average* gravity is " +
              SG.toFixed(4));

  totalIBU = 0.0;
  for (idx = 1; idx <= numAdd; idx++) {
    tableID = "AA"+idx;
    AA = document.getElementById(tableID).value;
    AA = Number(validateNumber(AA, 0.5, 100.0, 2, 8.34, "alpha acid (%)",
                         document.getElementById(tableID), junk));

    tableID = "weight"+idx;
    weight = document.getElementById(tableID).value;
    weight = Number(validateNumber(weight, 0.0, 5000.0, 2, weightDefault,
              "hops weight", document.getElementById(tableID), junk));
    if (!isMetric) {
      weight = convertWeightToGrams(weight);
    }

    tableID = "boilTimeTable"+idx;
    boilTime = document.getElementById(tableID).value;
    boilTime = Number(validateNumber(boilTime, 0.0, 360.0, 1, 0.0,
              "boil time (min)", document.getElementById(tableID), junk));

    addIBU = computeIBUsingleAddition_Tinseth(isMetric, postBoilVolume,
                wortLossVolume, topoffVolume, SG, AA, weight, boilTime,
                scalingFactor);
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

function computeIBUsingleAddition_Tinseth(isMetric, postBoilVolume,
        wortLossVolume, topoffVolume, SG, AA, weight, boilTime, scalingFactor) {
  var scaledTime = 0.0;
  var wgm1 = 0.0;
  var bignessFactor = 0.0;
  var boilTimeFactor = 0.0;
  var decimalAArating = 0.0;
  var AAcon = 0.0;
  var finalVolume = 0.0;
  var topoffScaling = 0.0;
  var U = 0.0;
  var IBU = 0.0;
  var IBUresult = {
            util: 0,
            IBU: 0
            }

  IBUresult.IBU = 0.0;
  IBUresult.utilization = 0.0;

  // convert AA from percent to 0...1 range
  AA /= 100.0;

  scaledTime = -0.04 * boilTime;
  wgm1 = SG - 1.0;
  bignessFactor = 1.65 * Math.pow(0.000125, wgm1);
  boilTimeFactor = (1.0 - Math.exp(scaledTime)) / 4.15;
  decimalAArating = bignessFactor * boilTimeFactor;
  U = decimalAArating;
  IBUresult.util = scalingFactor * U;
  IBUresult.IBU = scalingFactor * U * AA * weight * 1000.0 / postBoilVolume;
  finalVolume = postBoilVolume - wortLossVolume;
  if (finalVolume > 0.0) {
    topoffScaling = finalVolume / (finalVolume + topoffVolume);
    console.log("finalVol = " + finalVolume + ", topoff = " +
                topoffVolume + ", scaling factor = " + topoffScaling);
  } else {
    topoffScaling = 0.0;
  }
  IBUresult.IBU = IBUresult.IBU * topoffScaling;
  AAcon = AA * weight * 1000.0 / postBoilVolume;
  console.log("[AA] = " + AAcon + ", U = " + U + ", IBU = " + IBU);

  return IBUresult;
}
