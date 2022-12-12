// -----------------------------------------------------------------------------
// ibu_SMPH.js : JavaScript for AlchemyOverlord web page, SMPH sub-page
// Written by John-Paul Hosom
// Copyright © 2018 - 2021 by John-Paul Hosom, all rights reserved.
// To license this software, please contact John-Paul Hosom, for example at
//    alchemyoverlord © yahoo · com
//
// Version 1.0.1 : November 22, 2018 -- August 28, 2021
//         This code was initially based on the mIBU javascript code in this
//         project.  The code was then modified to implement the SMPH method as
//         described in the blog post "A Summary of Factors Affecting IBUs".
//
// Version 1.0.2 : Sep. 4, 2021: bug fix in AA concentration when dry hopping
// Version 1.0.3 : Oct. 5, 2021: don't reduce AA sol. limit with temperature;
//                               make sure solubility limit is never exceeded;
//                               pass in "SMPH" when building hops table
//
// -----------------------------------------------------------------------------

//==============================================================================

var SMPH = SMPH || {};

// Declare a "namespace" called "SMPH"
// This namespace contains functions that are specific to the SMPH method.
//
//     public functions:
//    . initialize_SMPH()
//    . computeIBU_SMPH()
//

SMPH._construct = function() {

//------------------------------------------------------------------------------
// Initialize for performing SMPH calculations

"use strict";

this.initialize_SMPH = function() {
  var idx = 0;
  var keys = Object.keys(ibu);

  // add function to call when using set() function with ibu namespace
  for (idx = 0; idx < keys.length; idx++) {
    if (!ibu[keys[idx]].id) {
      continue;
    }
    ibu[keys[idx]].updateFunction = SMPH.computeIBU_SMPH;
  }
  ibu.numAdditions.additionalFunctionArgs = ["SMPH", SMPH.computeIBU_SMPH];
  ibu.hopDecayMethod.additionalFunctionArgs = ["SMPH", SMPH.computeIBU_SMPH];
  ibu.hopTableSize = 12;   // number of inputs to specify each addition of hops
  ibu.detailedOutput = true;

  ibu.wortLossVolume.greyColor = "black"; // don't grey-out WLV, always black

  // don't need to set() any variables that change with unit conversion;
  // when we call set(units), those dependent variables will also be set.
  common.set(ibu.boilTime, 0);
  common.set(ibu.preOrPostBoilVol, 0);
  common.set(ibu.OG, 0);
  common.set(ibu.wortClarity, 0);
  common.set(ibu.tempDecayType, 0);
  common.set(ibu.whirlpoolTime, 0);
  common.set(ibu.immersionDecayFactor, 0);
  common.set(ibu.icebathDecayFactor, 0);
  common.set(ibu.forcedDecayType, 0);
  common.set(ibu.holdTempCheckbox, 0);  // must do this after forcedDecayType
  common.set(ibu.scalingFactor, 0);
  common.set(ibu.hopDecayMethod, 0);
  common.set(ibu.defaultHopForm, 0);
  common.set(ibu.applySolubilityLimitCheckbox, 0);
  common.set(ibu.pHCheckbox, 0);
  common.set(ibu.useDryHopModelCheckbox, 0);
  common.set(ibu.pH, 0);
  common.set(ibu.preOrPostBoilpH, 0);
  common.set(ibu.numAdditions, 0);
  common.set(ibu.krausen, 0);
  common.set(ibu.flocculation, 0);
  common.set(ibu.filtering, 0);
  common.set(ibu.finingsType, 0);
  common.set(ibu.beerAge_days, 0);
  common.set(ibu.units, 0);

  // set parameters of the SMPH model here:
  this.verbose            = 5;
  this.integrationTime    = 0.01;  // minutes

  this.AA_limit_minLimit  = 200.0; // ppm of alpha acids, from SEARCH
  this.AA_limit_maxLimit  = 580.0; // ppm of alpha acids, from SEARCH
  this.AA_dryHop_saturation   = 14.0;   // ppm, at beer pH (Shellhammer, p 170)
  this.scale_AA           = 0.885; // from Maye, MBAA TQ v.53, n.3, 2016, p. 135

  this.hop_nonExtract     = 1.0;
  this.hop_baggingFactor  = 1.00;  // from "Four Experiments on AA Util."

  this.icebathBaseTemp    = 314.00;       // 314.00'K = 40.85'C = 105.53'F
  this.immersionChillerBaseTemp = 293.15; // 293.15'K = 20'C = 68'F = room temp
  this.immersionMinTempC  = 50.0;         // must be > immersionChillerBaseTemp

  this.IAA_LF_boil        = 0.51;   // SEARCH
  this.fermentationFactor = 0.85;   // from lit., e.g. Garetz, Fix, Nielsen

  this.oAA_storageFactor  = 0.33;   // estimate 0.22 from Maye data, then SEARCH
  this.oAA_boilFactor     = 0.11;   // SEARCH
  this.oAA_LF_boil        = this.IAA_LF_boil; // assume same loss factor as IAA
  this.scale_oAA          = 0.9155; // from Maye, Figure 7

  this.oBA_boilFactor     = 0.07125; // ~7% of oxidized beta acids post boil
  this.scale_oBA          = 0.85;   // from Hough p. 491: oBA 85% of absorbtion

  this.hopPPrating        = 0.04;   // approx 4% of hop is PP, from literature
  this.LF_hopPP_kettle    = 0.20;   // 20% are soluble, from the literature
  this.LF_hopPP_dryHop    = 0.07;   // 7% are soluble, from experiment
  this.ferment_hopPP      = 0.70;   // from blog post on malt PP, assume same
  // Parkin scaling factor is 0.022 from [PP] to BU, but BU is 5/7*concentration
  // so 0.022*69.68/50.0 is scaling factor from [PP] to [IAA]-equivalent=0.03066
  this.scale_hopPP        = 0.03066;  // from Parkin, p. 28, scaled

  SMPH.computeIBU_SMPH();

  return;
}


//------------------------------------------------------------------------------
// Compute IBUs and utilization for all hops additions

this.computeIBU_SMPH = function() {
  var AA_added_mg = 0.0;
  var AA_beer = 0.0;
  var addAAoutput = 0.0;
  var addIAAoutput = 0.0;
  var addIBUoutput = 0.0;
  var addoAAoutput = 0.0;
  var addoBAoutput = 0.0;
  var addPPoutput = 0.0;
  var addUtilOutput = 0.0;
  var BI = 0.0;
  var dryHop = false;
  var FCT = 0.0;
  var hopIdx = 0;
  var hopPP_beer = 0.0;
  var IAA_beer = 0.0;
  var IAA_beer_mg = 0.0;
  var IAA_LF_dryHop = 0.0;
  var IBU = 0.0;
  var idxP1 = 0;
  var maltPP_beer = 0.0;
  var oAA_beer = 0.0;
  var oBA_beer = 0.0;
  var totalAA0 = 0.0;
  var totalIBUoutput = 0.0;
  var U = 0.0;

  if (SMPH.verbose > 0)
    console.log("\n========================= BEGIN =========================");

  if (SMPH.verbose > 4) {
    console.log("kettle diameter: " + ibu.kettleDiameter.value +
                ", kettle opening: " + ibu.kettleOpening.value);
    console.log("evaporation rate: " + ibu.evaporationRate.value.toFixed(4));
    console.log("post-boil volume: " + ibu.getPostBoilVolume().toFixed(3));
    console.log("OG: " + ibu.OG.value);
    console.log("wort loss volume: " + ibu.wortLossVolume.value +
              ", topoff volume: " + ibu.topoffVolume.value);
    console.log("wort clarity: " + ibu.wortClarity.value);
    console.log("krausen: " + ibu.krausen.value);
    console.log("flocculation: " + ibu.flocculation.value);
    console.log("finings: " + ibu.finingsAmount.value.toFixed(3) + " ml of " +
                ibu.finingsType.value);
    console.log("filtering: " + ibu.filtering.value);
    console.log("beer age: " + ibu.beerAge_days.value + " days");
    console.log("pH: apply=" + ibu.pHCheckbox.value +
                " with " + ibu.preOrPostBoilpH.value + " pH = " + ibu.pH.value);
    console.log("IBU global scaling factor: " + ibu.scalingFactor.value);
  }

  // initialize outputs from each hop addition to zero
  if (SMPH.verbose > 1)
    console.log("number of hops additions: " + ibu.add.length);

  ibu.AA = 0.0;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    ibu.add[hopIdx].AA_init = 0.0;       // units: ppm
    ibu.add[hopIdx].AA_dis_mg = 0.0;     // units: mg
    ibu.add[hopIdx].AA_xfer_mg = 0.0;    // units: mg
    ibu.add[hopIdx].AA_added_mg = 0.0;   // units: mg
    ibu.add[hopIdx].AA_beer = 0.0;       // units: ppm

    ibu.add[hopIdx].IAA_dis_mg = 0.0;    // units: mg
    ibu.add[hopIdx].IAA_xfer_mg = 0.0;   // units: mg
    ibu.add[hopIdx].IAA_wort = 0.0;      // units: ppm
    ibu.add[hopIdx].IAA_wort_mg = 0.0;   // units: mg
    ibu.add[hopIdx].IAA_beer = 0.0;      // units: ppm
    ibu.add[hopIdx].IAA_beer_mg = 0.0;   // units: mg

    ibu.add[hopIdx].oAA_dis_mg = 0.0;    // units: mg
    ibu.add[hopIdx].oAA_wort = 0.0;      // units: ppm
    ibu.add[hopIdx].oAA_beer = 0.0;      // units: ppm

    ibu.add[hopIdx].oBA_dis_mg = 0.0;    // units: mg
    ibu.add[hopIdx].oBA_wort = 0.0;      // units: ppm
    ibu.add[hopIdx].oBA_beer = 0.0;      // units: ppm

    ibu.add[hopIdx].hopPP_dis_mg = 0.0;  // units: mg
    ibu.add[hopIdx].hopPP_wort = 0.0;    // units: ppm
    ibu.add[hopIdx].hopPP_beer = 0.0;    // units: ppm

    ibu.add[hopIdx].effectiveSteepTime = 0.0;
    ibu.add[hopIdx].IBU = 0.0;
    ibu.add[hopIdx].U = 0.0;

    if (SMPH.verbose > 1) {
      console.log("  addition " + Number(hopIdx+1) + ": AA=" +
                ibu.add[hopIdx].AA.value +
                ", weight=" + ibu.add[hopIdx].weight.value +
                ", usage=" + ibu.add[hopIdx].kettleOrDryHop.value +
                ", time=" + ibu.add[hopIdx].steepTime.value);
    }
  }

  if (SMPH.verbose > 1) {
    console.log("   ");
  }

  // compute concentrations of various compounds (IAA, oAA, oBA, hop_PP)
  // in wort during the boil for each hop addition.
  // FCT is amount of time required for forced cooling.
  FCT = compute_concent_wort(ibu);

  // compute loss factor for IAA when dry hopping
  IAA_LF_dryHop = 1.0;
  if (ibu.useDryHopModelCheckbox.value) {
    IAA_LF_dryHop = compute_IAA_LF_dryHop(ibu);
    if (SMPH.verbose > 0) {
      console.log("IAA loss factor from dry hopping: " +
                  IAA_LF_dryHop.toFixed(4));
    }
  }

  // compute concentrations of various compounds in the finished beer
  // for each hop addition, and compute IBUs and utilization for
  // each addition and in total.
  IAA_beer = 0.0;
  AA_beer = 0.0;
  oAA_beer = 0.0;
  oBA_beer = 0.0;
  hopPP_beer = 0.0;
  IBU = 0.0;
  totalAA0 = 0.0;
  IAA_beer_mg = 0.0;
  AA_added_mg = 0.0;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    if (SMPH.verbose > 2) {
      console.log("For hop addition " + Number(hopIdx+1) + ":");
    }
    IAA_beer += compute_IAA_beer(ibu, hopIdx, IAA_LF_dryHop);
    AA_beer += compute_AA_beer(ibu, hopIdx);
    oAA_beer += compute_oAA_beer(ibu, hopIdx);
    oBA_beer += compute_oBA_beer(ibu, hopIdx);
    hopPP_beer += compute_hopPP_beer(ibu, hopIdx);

    IBU += compute_hop_IBU_and_U(ibu, hopIdx);
    totalAA0 += ibu.add[hopIdx].AA_init;
    AA_added_mg += ibu.add[hopIdx].AA_added_mg;
    IAA_beer_mg += ibu.add[hopIdx].IAA_beer_mg;
  }

  // compute malt polyphenol contribution to IBUs
  maltPP_beer = compute_maltPP_beer(ibu);
  // even though 51.2 is more accurate, 50.0 is used to actually measure IBUs
  // IBU += (51.2/69.68) * maltPP_beer;
  IBU += (50.0/69.68) * maltPP_beer;
  if (SMPH.verbose > 3) {
    console.log("malt IBU  in finished beer = " +
                (maltPP_beer * 50.0/69.68).toFixed(4));
  }

  // print info to console
  if (SMPH.verbose > 2) {
    console.log(">>>> FINAL:");
    console.log("UNSCALED IAA = " + IAA_beer.toFixed(3) +
              ", AA = " + AA_beer.toFixed(3) +
              ", oAA = " + oAA_beer.toFixed(3) +
              ", oBA = " + oBA_beer.toFixed(3) +
              ", hopPP = " + hopPP_beer.toFixed(3) +
              ", maltPP = " + maltPP_beer.toFixed(3))
    console.log("  SCALED IAA = " + IAA_beer.toFixed(3) +
              ", AA = " + (AA_beer*SMPH.scale_AA).toFixed(3) +
              ", oAA = " + (oAA_beer*SMPH.scale_oAA).toFixed(3) +
              ", oBA = " + (oBA_beer*SMPH.scale_oBA).toFixed(3) +
              ", hopPP = " + (hopPP_beer*SMPH.scale_hopPP).toFixed(3) +
              ", maltPP = " + maltPP_beer.toFixed(3))
    console.log("IBU = " + IBU.toFixed(3) + " = " + (IBU*69.68/50.0).toFixed(3)+
                " * 50.0/69.68");
  }

  // set output variables in ibu structure
  if (AA_added_mg > 0) {
    U = IAA_beer_mg / AA_added_mg;
    if (SMPH.verbose > 2) {
      console.log("U = " + U.toFixed(4) + " from " + IAA_beer_mg.toFixed(4) +
                " / " + AA_added_mg.toFixed(4));
    }
  } else {
    U = 0.0;
  }
  ibu.AA0 = totalAA0;
  ibu.IAA = IAA_beer;
  ibu.U = U * ibu.scalingFactor.value;
  ibu.IAApercent = ((50.0 / 69.68) * IAA_beer) / IBU;
  ibu.AA = AA_beer * SMPH.scale_AA;
  ibu.oAA = oAA_beer * SMPH.scale_oAA;
  ibu.oBA = oBA_beer * SMPH.scale_oBA;
  ibu.hopPP = hopPP_beer * SMPH.scale_hopPP;
  ibu.maltPP = maltPP_beer;
  ibu.FCT = FCT;
  ibu.IBU = IBU * ibu.scalingFactor.value;

  if (SMPH.verbose > 0) {
    console.log("IBU = " + ibu.IBU.toFixed(2) + ", U = " + ibu.U.toFixed(3) +
                ", [IAA] = " + IAA_beer.toFixed(3) +
                ", [AA] = " + totalAA0.toFixed(3) +
                ", IAA% = " + ibu.IAApercent.toFixed(3));
  }

  // set output values in HTML
  // if no IBU outputs exist (no table yet), then just return
  if (document.getElementById("addIBUvalue1")) {
    dryHop = false;
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      idxP1 = hopIdx + 1;
      addIBUoutput = ibu.add[hopIdx].IBU.toFixed(2);
      if (ibu.add[hopIdx].kettleOrDryHop.value == "dryHop") {
        dryHop = true;
        document.getElementById('addIBUvalue'+idxP1).innerHTML =
               addIBUoutput + "<sup>*</sup>";
      } else {
        document.getElementById('addIBUvalue'+idxP1).innerHTML = addIBUoutput;
      }

      addUtilOutput = (ibu.add[hopIdx].U * 100.0).toFixed(2);
      document.getElementById('addUtilValue'+idxP1).innerHTML = addUtilOutput;

      if (ibu.detailedOutput) {
        addIAAoutput = (ibu.add[hopIdx].IAA_beer).toFixed(2);
        document.getElementById('addIAAValue'+idxP1).innerHTML = addIAAoutput;

        addAAoutput = (ibu.add[hopIdx].AA_beer * SMPH.scale_AA).toFixed(2);
        document.getElementById('addAAValue'+idxP1).innerHTML = addAAoutput;

        addoAAoutput = (ibu.add[hopIdx].oAA_beer * SMPH.scale_oAA).toFixed(2);
        document.getElementById('addoAAValue'+idxP1).innerHTML = addoAAoutput;

        addoBAoutput = (ibu.add[hopIdx].oBA_beer * SMPH.scale_oBA).toFixed(2);
        document.getElementById('addoBAValue'+idxP1).innerHTML = addoBAoutput;

        addPPoutput = (ibu.add[hopIdx].hopPP_beer* SMPH.scale_hopPP).toFixed(2);
        document.getElementById('addPPValue'+idxP1).innerHTML = addPPoutput;
      }
    }
    if (dryHop && ibu.useDryHopModelCheckbox.value &&
        document.getElementById('outputFootnote')) {
      document.getElementById('outputFootnote').innerHTML =
           "<td> (<sup>*</sup>IBUs from dry hopping are rough approximations. Also, total IAA concentration may be reduced when dry hopping.) </td>";
    } else if (dryHop && !ibu.useDryHopModelCheckbox.value &&
        document.getElementById('outputFootnote')) {
      document.getElementById('outputFootnote').innerHTML =
           "<td> (<sup>*</sup>Modeling of IBUs from dry hopping has been turned off.) </td>";
    } else {
      document.getElementById('outputFootnote').innerHTML = "<td></td>";
    }
  }

  if (document.getElementById("totalIBUvalue")) {
    totalIBUoutput = ibu.IBU.toFixed(2);
    document.getElementById('totalIBUvalue').innerHTML = totalIBUoutput;
  }
  if (document.getElementById("BIvalue")) {
    BI = (-0.0009 * totalIBUoutput * totalIBUoutput) +
         (0.246 * totalIBUoutput) - 0.264;
    if (BI < 0.0) BI = 0.0;
    if (totalIBUoutput > 136.667) {
      BI = 16.546;  // this equation peaks at 136.667 IBUs
    }
    document.getElementById('BIvalue').innerHTML = BI.toFixed(2);
  }

  if (ibu.forcedDecayType.value != "forcedDecayCounterflow") {
    if (document.getElementById("forcedCoolingTime")) {
      if (ibu.units.value == "metric") {
        document.getElementById("forcedCoolingTime").innerHTML =
           "Wort Forced-Cooling Time: " + ibu.FCT60.toFixed(1) +
           " minutes to reach 60&deg;C"
      } else {
        document.getElementById("forcedCoolingTime").innerHTML =
           "Wort Forced-Cooling Time: " + ibu.FCT60.toFixed(1) +
           " minutes to reach 140&deg;F"
      }
    }
  } else {
    if (document.getElementById("forcedCoolingTime")) {
      document.getElementById("forcedCoolingTime").innerHTML = ""
    }
  }

  if (SMPH.verbose > 0) {
    console.log("\n========================== END ===========================");
  }
}


//==============================================================================
// Functions and Loss Factors (LF) for both IAA and nonIAA

// -----------------------------------------------------------------------------
// compute IBUs and utilization for a specific hop addition

function compute_hop_IBU_and_U(ibu, hopIdx) {
  var AA_beer = ibu.add[hopIdx].AA_beer;
  var hop_IBU = 0.0;
  var hopPP_beer = ibu.add[hopIdx].hopPP_beer;
  var IAA_beer = ibu.add[hopIdx].IAA_beer;
  var oAA_beer = ibu.add[hopIdx].oAA_beer;
  var oBA_beer = ibu.add[hopIdx].oBA_beer;

  // even though 51.2 is more accurate, 50.0 is used to actually measure IBUs
  // hop_IBU = (51.2/69.68) * (IAA_beer + (oAA_beer * SMPH.scale_oAA) +
  hop_IBU = (50.0/69.68) * (IAA_beer + (AA_beer * SMPH.scale_AA) +
                                       (oAA_beer * SMPH.scale_oAA) +
                                       (oBA_beer * SMPH.scale_oBA) +
                                       (hopPP_beer * SMPH.scale_hopPP));
  ibu.add[hopIdx].IBU = hop_IBU;

  if (ibu.add[hopIdx].AA_added_mg > 0) {
    ibu.add[hopIdx].U = ibu.add[hopIdx].IAA_beer_mg /
                        ibu.add[hopIdx].AA_added_mg;
  } else {
    ibu.add[hopIdx].U = 0.0;
  }

  if (SMPH.verbose > 3) {
    console.log("addition " + Number(hopIdx+1) + ": [AA]_init = " +
                ibu.add[hopIdx].AA_init.toFixed(3) +
                " ppm, [IAA]_beer = " + ibu.add[hopIdx].IAA_beer.toFixed(3) +
                " ppm, IBU = " + ibu.add[hopIdx].IBU.toFixed(3) +
                ", U = " + (100.0 * ibu.add[hopIdx].U).toFixed(3) + "%");
  }

  return hop_IBU;
}

//------------------------------------------------------------------------------
// compute concentration of IAA and other compounds produced during the boil

function compute_concent_wort(ibu) {
  var AA_dis = 0.0;             // concentration of dissolved AA, in ppm
  var AA_dis_mg = 0.0;          // dissolved AA, in mg
  var AA_init = 0.0;            // [AA]_0, in ppm
  var AA_init_mg = 0.0;         // initial amount of AA added, in mg
  var AA_limit_func_A = 0.0;    // AA solubility limit, function parameter A
  var AA_limit_func_B = 0.0;    // AA solubility limit, function parameter A
  var AA_limit_minLimit = SMPH.AA_limit_minLimit;  // minimum solubility
  var AA_limit_maxLimit = SMPH.AA_limit_maxLimit;  // maximum solubility
  var AA_noLimit = 0.0;         // [AA] if there is no solubility limit
  var AA_noLimit_mg = 0.0;      // dissolved AA, in mg, if no solubility limit
  var AA_percent = 0.0;         // the percent of alpha acids added to wort
  var AA_xfer_mg  = 0.0;        // amount of AA (mg) transferred w/ counterflow
  var additionTime = 0.0;       // the time of a hop addition
  var boilTime = ibu.boilTime.value; // the total boil time
  var coolingMethod = ibu.forcedDecayType.value; // the cooling method
  var currVolume = 0.0;         // the current volume of wort at time t
  var dAA_dis_mg = 0.0;         // the change in dissolved AA at time t, in mg
  var decayRate = 0.0;          // the exponential decay factor for wort cooling
  var dIAA_dis_mg = 0.0;        // the change in dissolved IAA at time t, in mg
  var doneHoldTemp = false;     // are we done with holding temperature?
  var expParamC_Kelvin = 0.0;   // exponential decay parameter C, in Kelvin
  var FCT = 0.0;                // total amount of time spent in forced cooling
  var FCT60 = 0.0;              // amount of time to reach 60'C
  var finalVolume = 0.0;        // final volume after wort loss and added water
  var finished = false;         // are we finished with modeling IAA over time?
  var holdTemp = ibu.holdTemp.value;  // the temperature at which to hold wort
  var holdTempCheckbox = ibu.holdTempCheckbox.value;  // do we hold temp?
  var holdTempCounter = 0.0;    // the time that we've held the temperature
  var holdTempK = 0.0;          // the temperature that we hold wort, in Kelvin
  var hopIdx = 0;               // index into array of hop additions
  var IAA_dis_mg = 0.0;         // dissolved IAA, in mg
  var IAA_xfer_mg = 0.0;        // amount of IAA (mg) transferred w/ counterflow
  var initVolume = 0.0;         // initial (start of boil) volume
  var integrationTime = 0.0;    // time interval for approximating integration
  var integTimePrecision = 0;   // precision of the value of 'integrationTime'
  var isTempDecayLinear = 0;    // is post-boil temperature decay linear?
  var k1 = 0.0;                 // M. Malowicki's isomerization rate constant 1
  var k2 = 0.0;                 // M. Malowicki's isomerization rate constant 2
  var newAA_mg  = 0.0;          // amount of AA remaining after xfer at time t
  var newIAA_mg = 0.0;          // amount of IAA remaining after xfer at time t
  var origWhirlpoolTime = 0.0;  // user-specified time for whirlpool
  var postBoilTime = 0.0;       // current amount of time after stopping boil
  var postBoilVolume = 0.0;     // volume at the end of the boil, in the kettle
  var preAdd_AA_mg = 0.0;       // AA (in mg) in wort before a hop addition
  var evapRateAtBoil = 0.0;     // rough estimate of evaporation rate at boiling
  var evapRateAtTemp = 0.0;     // same estimate of evap. rate at current temp
  var relativeTemp = 0.0;       // relative temp. to get effectiveSteepTime
  var RF_IAA = 0.0;             // isomerization rate factor for IAA
  var roomTempK = 20.0+273.15;  // room temperature, in Kelvin
  var subBoilEvapRate = 0.0;    // evaporation rate, maybe at below-boiling temp
  var t = 0.0;                  // current time, in minutes
  var tempC = 0.0;              // current wort temperature, in degrees Celsius
  var tempK = 0.0;              // current wort temperature, in degrees Kelvin
  var tempNoBase = 0.0;         // temperature minus 'base' temp in temp decay
  var totalXferTime = 0.0;      // total amount of time spent transferring wort
  var useSolubilityLimit = ibu.applySolubilityLimitCheckbox.value;
  var volumeChange = 0.0;       // the change in volume at each integrationTime
  var whirlpoolTime = 0.0;      // actual whirlpool time, includes forced cool.
  var xferRate = 0.0;           // transfer rate (liter/min) using counterflow

  // ---------------------------------------------------------------------------
  // INITIALIZATION

  integrationTime = 0.01;  // just in case SMPH.integrationTime is not defined
  if (SMPH.integrationTime) {
    integrationTime = SMPH.integrationTime; // minutes
  }
  integTimePrecision = common.getPrecision("" + integrationTime);
  if (SMPH.verbose > 4) {
    console.log("integration time = " + integrationTime +
                " with precision " + integTimePrecision);
  }

  //---------------------------------------------------------
  // initialization for temperature decay and forced cooling

  // determine temperature decay type
  if (ibu.tempDecayType.value == "tempDecayLinear") {
    isTempDecayLinear = 1;
  } else if (ibu.tempDecayType.value == "tempDecayExponential") {
    isTempDecayLinear = 0;
  } else {
    console.log("ERROR: unknown temp decay type: " + ibu.tempDecayType.value);
    isTempDecayLinear = 0;
  }

  // get forced cooling function decay rate or transfer rate
  if (coolingMethod == "forcedDecayCounterflow") {
    xferRate = ibu.counterflowRate.value;
    if (SMPH.verbose > 4)
      console.log("cooling method = " + coolingMethod + ", rate = " + xferRate);
  } else if (coolingMethod == "forcedDecayImmersion") {
    decayRate = ibu.immersionDecayFactor.value;
    if (SMPH.verbose > 4)
      console.log("cooling method = " + coolingMethod + ", rate = " +decayRate);
  } else if (coolingMethod == "forcedDecayIcebath") {
    decayRate = ibu.icebathDecayFactor.value;
    if (SMPH.verbose > 4)
      console.log("cooling method = " + coolingMethod + ", rate = " +decayRate);
  }

  // if counterflow chiller, but we're holding a temperature during whirlpool,
  // use immersion chiller decay rate for initial cooling.
  if (coolingMethod == "forcedDecayCounterflow" && holdTempCheckbox) {
    decayRate = ibu.immersionDecayFactor.value;
  }

  volumeChange = xferRate * integrationTime;  // for counterflow chiller
  expParamC_Kelvin = common.convertCelsiusToKelvin(ibu.tempExpParamC.value);


  // print info for debugging
  if (SMPH.verbose > 4) {
    if (!isTempDecayLinear) {
      console.log("exponential decay: A=" + ibu.tempExpParamA.value + ", B=" +
                ibu.tempExpParamB.value + ", C=" + ibu.tempExpParamC.value);
    } else {
      console.log("linear temp decay: A=" + ibu.tempLinParamA.value + ", B=" +
                ibu.tempLinParamB.value);
    }
    console.log("hold temp during hop stand? " + holdTempCheckbox +
                ". hold temp is " + holdTemp.toFixed(3));
  }

  //---------------------------------------------------------
  // other initialization

  // check min and max solubility limits;
  // compute function parameters 'a' and 'b'
  if (AA_limit_maxLimit <= AA_limit_minLimit) {
    AA_limit_maxLimit = AA_limit_minLimit + 0.0001;  // prevent log(<=0)
  }
  AA_limit_func_A = AA_limit_maxLimit;
  AA_limit_func_B = -1.0*Math.log(1.0 - (AA_limit_minLimit/AA_limit_maxLimit)) /
                    AA_limit_minLimit;
  if (SMPH.verbose > 3) {
    console.log("    AA_minLimit = " + AA_limit_minLimit +
                   " AA_maxLimit = " + AA_limit_maxLimit);
    console.log("1-min/max = " + (1.0 - (AA_limit_minLimit/AA_limit_maxLimit)).toFixed(6));
    console.log("log(x) = " + Math.log(1.0-(AA_limit_minLimit/AA_limit_maxLimit)));
    console.log("    AA_limit_func_A = " + AA_limit_func_A.toFixed(4) +
              ", AA_limit_func_B = " + AA_limit_func_B.toFixed(6));
  }

  // get post-boil volume; if zero, then set results to zero and return
  postBoilVolume = ibu.getPostBoilVolume();
  if (postBoilVolume <= 0.0) {
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      ibu.add[hopIdx].IAA_wort = 0.0;
      ibu.add[hopIdx].oAA_wort = 0.0;
      ibu.add[hopIdx].oBA_wort = 0.0;
      ibu.add[hopIdx].hopPP_wort = 0.0;
    }
    ibu.AA0 = 0.0;
    ibu.IAA = 0.0;
    ibu.U = 0.0;
    ibu.IAApercent = 0.0;
    ibu.AA = 0.0;
    ibu.oAA = 0.0;
    ibu.oBA = 0.0;
    ibu.hopPP = 0.0;
    ibu.maltPP = 0.0;
    ibu.FCT = 0.0;
    ibu.FCT60 = 0.0;
    ibu.IBU = 0.0;
    return 0.0;
  }

  // get initial volume from post-boil volume, evaporation rate, and boil time
  initVolume = postBoilVolume + (ibu.evaporationRate.value/60.0 * boilTime);
  if (SMPH.verbose > 3) {
    console.log("volume at start of boil = " +
              postBoilVolume.toFixed(3) + " + (" +
              ibu.evaporationRate.value.toFixed(3) +
              "/60.0 * " + boilTime + ") = " + initVolume.toFixed(3));
  }

  // initialize some variables
  tempK = ibu.boilTemp.value + 273.15;
  tempC = common.convertKelvinToCelsius(tempK);
  k1 = 7.9*Math.pow(10.0,11.0)*Math.exp(-11858.0/tempK);
  k2 = 4.1*Math.pow(10.0,12.0)*Math.exp(-12994.0/tempK);
  if (SMPH.verbose > 3) {
    console.log("at temp " + tempC.toFixed(2)+ ": rate constant k1 = " +
                k1.toFixed(5) + ", k2 = " + k2.toFixed(5));
  }

  holdTempK = common.convertCelsiusToKelvin(holdTemp);
  if (!holdTempCheckbox) holdTempK = 0.0; // 'Kelvin

  // make sure that boil time doesn't have higher precision than integ. time
  if (common.getPrecision("" + boilTime) > integTimePrecision) {
    boilTime = Number(boilTime.toFixed(integTimePrecision));
  }

  // ---------------------------------------------------------------------------
  // PROCESS EACH TIME POINT

  // loop over each time point, from maximum time down until no more utilization
  // first, set initial values at start of boil
  finished = false;
  currVolume = initVolume;
  holdTempCounter = 0.0;
  whirlpoolTime = ibu.whirlpoolTime.value;
  origWhirlpoolTime = whirlpoolTime; // wpTime might be modified; keep a copy
  totalXferTime = 0.0;
  AA_dis_mg = 0.0; // mg of AA dissolved, not ppm to account for volume changes
  IAA_dis_mg= 0.0; // mg of IAA dissolved, not ppm to account for volume changes
  AA_xfer_mg  = 0.0; // mg of AA transferred (and cooled) via counterflow
  IAA_xfer_mg = 0.0; // mg of IAA transferred via counterflow
  FCT60 = -1.0;    // use negative number to indicate not yet post-whirlpool

  if (SMPH.verbose > 1) {
    console.log("\nStarting processing of each time point:");
  }
  for (t = boilTime; finished == false; t = t - integrationTime) {

    // -------------------------------------------------------------------------
    // adjust (as needed) temperature, whirlpool time, and volume during
    // counterflow. Also, check if done yet based on temp, time, and volume.

    // if post boil (t <= 0), then adjust temperature and degree of utilization
    // and if counterflow chiller and doing whirlpool, reduce volume of wort
    if (t <= 0) {
      postBoilTime = t * -1.0;
      if (postBoilTime == ibu.whirlpoolTime.value && SMPH.verbose > 1) {
        console.log("---- at " + t + ", starting use of " +
                    coolingMethod + " chiller ---");
        FCT60 = 0.0;
      }

      // if counterflow or not yet done with whirlpool, get temp from cooling fn
      if ((coolingMethod == "forcedDecayCounterflow" ||
           postBoilTime < whirlpoolTime) &&
           (!holdTempCheckbox || (holdTempCheckbox && doneHoldTemp))) {
        if (!isTempDecayLinear) {
          tempNoBase = tempK - expParamC_Kelvin;
          tempNoBase = tempNoBase +
                      (-1.0*ibu.tempExpParamB.value*tempNoBase*integrationTime);
          tempK = tempNoBase + expParamC_Kelvin;
        } else {
          tempK = tempK + (ibu.tempLinParamA.value * integrationTime);
        }
      }

      // if immersion or icebath AND done with whirlpool, adjust
      // temp with new function
      if (coolingMethod == "forcedDecayImmersion" &&
          postBoilTime >= whirlpoolTime) {
        tempNoBase = tempK - SMPH.immersionChillerBaseTemp;
        tempNoBase = tempNoBase + (-1.0*decayRate*tempNoBase*integrationTime);
        tempK = tempNoBase + SMPH.immersionChillerBaseTemp;
      }
      if (coolingMethod == "forcedDecayIcebath" &&
          postBoilTime >= whirlpoolTime) {
        tempNoBase = tempK - SMPH.icebathBaseTemp;
        tempNoBase = tempNoBase + (-1.0*decayRate*tempNoBase*integrationTime);
        tempK = tempNoBase + SMPH.icebathBaseTemp;
      }

      // prevent numerical errors at <= 0 Kelvin
      if (tempK <= 1.0) tempK = 1.0;

      // if hold temperature during hop stand, see if need to cool to target
      if (holdTempCheckbox && tempK > holdTempK && !doneHoldTemp) {
        // if cool to target, use immersion chiller decay factor
        // regardless of the post-whirlpool cooling method
        tempNoBase = tempK - SMPH.immersionChillerBaseTemp;
        tempNoBase = tempNoBase + (-1.0*decayRate*tempNoBase*integrationTime);
        tempK = tempNoBase + SMPH.immersionChillerBaseTemp;
        // however, if tempExpParamA = 0 and C < holdTemp('C), this
        // means to instantaneously cool the wort to the target temperature
        if (ibu.tempExpParamA.value==0 && ibu.tempExpParamC.value < holdTemp) {
          tempK = holdTempK;
        }
        whirlpoolTime += integrationTime;
        whirlpoolTime = Number(whirlpoolTime.toFixed(4));
        // console.log("POST-BOIL quickly cool to target " +
                    // (holdTempK-273.15).toFixed(2) +
                    // ", current temp = " + (tempK-273.15).toFixed(2) +
                    // ", WP time now " + whirlpoolTime.toFixed(2));
      }

      // if hold temperature during hop stand, and reached target temp, hold it
      if (holdTempCheckbox && tempK <= holdTempK && !doneHoldTemp) {
        holdTempCounter += integrationTime;
        tempK = holdTempK;
        if (holdTempCounter > origWhirlpoolTime) {
          doneHoldTemp = true;
          if (SMPH.verbose > 1) {
            console.log("Done with post-boil whirlpool; whirlpool time = " +
                        whirlpoolTime);
          }
        }
      }

      // stop modeling if temperature is less than minimum for isomerization
      tempC = common.convertKelvinToCelsius(tempK);
      if (FCT60 >= 0.0 && tempC >= 60.0) {
        FCT60 += integrationTime;
      }
      if (tempC < SMPH.immersionMinTempC) {
        finished = true;
      }

      // limit to whirlpool time plus two hours, just to prevent infinite loop
      // (after 2 hours, almost no increase in utilization anyway)
      if (postBoilTime > whirlpoolTime + 120.0) {
        finished = true;
      }

      // if using counterflow chiller and we've finished whirlpool/stand time,
      // do transfer and reduce volume of wort.  Check if volume reduced to 0,
      // in which case we're done.
      if (coolingMethod == "forcedDecayCounterflow" &&
          postBoilTime >= whirlpoolTime) {
        // keep concentration the same as the wort transfers. therefore,
        // AA_(t-1) / volume_(t-1) = AA_t / volume_t, so
        // AA_t = (AA_(t-1) / volume_(t-1)) * volume_t
        // AA_t = (AA_(t-1) / currVolume) * (currVolume-volumeChange)
        newAA_mg = (AA_dis_mg / currVolume) * (currVolume - volumeChange);
        AA_xfer_mg += AA_dis_mg - newAA_mg;
        AA_dis_mg = newAA_mg;

        newIAA_mg = (IAA_dis_mg / currVolume) * (currVolume - volumeChange);
        IAA_xfer_mg += IAA_dis_mg - newIAA_mg;
        IAA_dis_mg = newIAA_mg;

        if (AA_dis_mg < 0.0)  AA_dis_mg  = 0.0;
        if (IAA_dis_mg < 0.0) IAA_dis_mg = 0.0;

        // adjust AA and IAA levels of each separate addition
        for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
          newAA_mg = (ibu.add[hopIdx].AA_dis_mg / currVolume) *
                  (currVolume - volumeChange);
          ibu.add[hopIdx].AA_xfer_mg += ibu.add[hopIdx].AA_dis_mg - newAA_mg;
          ibu.add[hopIdx].AA_dis_mg = newAA_mg;

          newIAA_mg = (ibu.add[hopIdx].IAA_dis_mg / currVolume) *
                   (currVolume - volumeChange);
          ibu.add[hopIdx].IAA_xfer_mg += ibu.add[hopIdx].IAA_dis_mg - newIAA_mg;
          ibu.add[hopIdx].IAA_dis_mg = newIAA_mg;

          if (ibu.add[hopIdx].AA_dis_mg < 0.0)
            ibu.add[hopIdx].AA_dis_mg = 0.0;
          if (ibu.add[hopIdx].IAA_dis_mg < 0.0)
            ibu.add[hopIdx].IAA_dis_mg= 0.0;
        }

        // decrease the volume; check if we're done
        currVolume = currVolume - volumeChange;
        totalXferTime = totalXferTime + integrationTime;
        if (currVolume <= 0.0) {
          currVolume = 0.0;
          finished = true;
        }
      }
    }


    // -------------------------------------------------------------------------
    // add hops, as needed

    // Check to see if add any hops should be added at this time point.
    // Apply AA saturation limit, if needed.
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      if (ibu.add[hopIdx].kettleOrDryHop.value != "kettle") {
        continue;
      }
      additionTime = ibu.add[hopIdx].steepTime.value;
      // make sure that addition time doesn't have higher precision than integ.
      if (common.getPrecision("" + additionTime) > integTimePrecision) {
        additionTime = Number(additionTime.toFixed(integTimePrecision));
      }
      if (Math.round(t * 1000) == Math.round(additionTime * 1000)) {
        AA_percent = (ibu.add[hopIdx].AA.value / 100.0) *
                           ibu.add[hopIdx].freshnessFactor.value;
        AA_init_mg = AA_percent * ibu.add[hopIdx].weight.value * 1000.0;
        AA_init = AA_init_mg / currVolume;
        ibu.add[hopIdx].AA_init = AA_init;
        ibu.add[hopIdx].AA_dis_mg = AA_init_mg;
        ibu.add[hopIdx].effectiveSteepTime = 0.0;
        ibu.add[hopIdx].AA_added_mg = AA_init_mg;

        if (SMPH.verbose > 1) {
          console.log("ADDING HOPS ADDITION " + hopIdx + " at " + t + "min :");
          console.log("  AA=" + ibu.add[hopIdx].AA.value + "%, weight=" +
                      ibu.add[hopIdx].weight.value.toFixed(3) + " grams " +
                      " and [AA]_init = " + AA_init.toFixed(2));
          console.log("  at time " + t.toFixed(2) +
                    " with volume " + currVolume.toFixed(3) +
                    ", adding AA " + AA_init_mg.toFixed(3) +
                    " (mg) to existing AA = " + AA_dis_mg.toFixed(3) + " (mg)");
        }

        // get the current total of dissolved AA (in mg), before current add
        preAdd_AA_mg = AA_dis_mg;

        // if use solubility limit, see if we need to change AA concentration
        if (useSolubilityLimit) {
          // if pre-addition [AA] is above threshold, find out what [AA] would
          // be at this point in time if there was no solubility limit
          AA_dis = AA_dis_mg / currVolume;
          if (AA_dis > AA_limit_minLimit) {
            // if not yet at maximum, reverse computation of sol. limit;
            // else we're at or above the maximum, so get an [AA] that's
            // very large so that any new addition will contribute no AA.
            if (AA_dis/AA_limit_func_A < 1.0) {
              AA_noLimit = -1.0*Math.log(1.0 - (AA_dis/AA_limit_func_A)) /
                           AA_limit_func_B;
              } else {
              AA_noLimit = 1.0e10;
              }
          } else {
            AA_noLimit = AA_dis;
          }
          if (SMPH.verbose > 3) {
            console.log("    [AA] before addition, without limits = " +
                        AA_noLimit.toFixed(4) + " ppm");
            console.log("    adding " + AA_init.toFixed(4) + " ppm of AA");
          }

          // make the new AA addition to current AA *without* solubility limit
          AA_noLimit = AA_noLimit + AA_init;
          AA_noLimit_mg = AA_noLimit * currVolume;

          // and (re-)apply solubility limit, if necessary
          if (AA_noLimit > AA_limit_minLimit) {
            AA_dis = AA_limit_func_A *
                     (1.0 - Math.exp(-1.0 * AA_limit_func_B * AA_noLimit));
          } else {
            AA_dis = AA_noLimit;
          }
          AA_dis_mg = AA_dis * currVolume;

          if (SMPH.verbose > 2) {
            console.log("    final [AA]_dissolved = " + AA_dis.toFixed(4) +
              " ppm = " + AA_dis_mg.toFixed(4) + " / " + currVolume.toFixed(4));
          }

          // get dissolved AA in mg for this addition of hops
          ibu.add[hopIdx].AA_dis_mg = AA_dis_mg - preAdd_AA_mg;
        } else {
          // don't use solubility limit, just accumulate AA
          AA_dis_mg += AA_init_mg;
        }

        // compute mg of oAA added with this hop addition
        compute_oAA_dis_mg(ibu, hopIdx, currVolume);

        // compute mg of oBA added with this hop addition
        compute_oBA_dis_mg(ibu, hopIdx, currVolume);

        // compute mg of PP added with this hop addition
        compute_hopPP_dis_mg(ibu, hopIdx, currVolume);

      } // check for hop addition at this time
    } // evaluate all hop additions


    // -------------------------------------------------------------------------
    // change concentrations of dissolved AA and dissolved IAA

    // adjust isomerization rate constants based on current temperature
    k1 = 7.9*Math.pow(10.0,11.0)*Math.exp(-11858.0/tempK);
    k2 = 4.1*Math.pow(10.0,12.0)*Math.exp(-12994.0/tempK);

    // decrease levels of dissolved AA via conversion to IAA
    dAA_dis_mg = -1.0 * k1 * AA_dis_mg;
    AA_dis_mg = AA_dis_mg + (dAA_dis_mg * integrationTime);
    if (AA_dis_mg < 0.0) AA_dis_mg = 0.0;

    // change levels of dissolved IAA via conversion to degradation products
    dIAA_dis_mg = (k1 * AA_dis_mg) - (k2 * IAA_dis_mg);
    IAA_dis_mg = IAA_dis_mg + (dIAA_dis_mg * integrationTime);
    if (IAA_dis_mg < 0.0) IAA_dis_mg = 0.0;

    // compute AA and IAA levels for each separate addition
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      dAA_dis_mg = -1.0 * k1 * ibu.add[hopIdx].AA_dis_mg;
      ibu.add[hopIdx].AA_dis_mg += dAA_dis_mg * integrationTime;
      if (ibu.add[hopIdx].AA_dis_mg < 0.0) ibu.add[hopIdx].AA_dis_mg = 0.0;

      dIAA_dis_mg = (k1 * ibu.add[hopIdx].AA_dis_mg) -
                 (k2 * ibu.add[hopIdx].IAA_dis_mg);
      ibu.add[hopIdx].IAA_dis_mg += dIAA_dis_mg * integrationTime;
      if (ibu.add[hopIdx].IAA_dis_mg < 0.0) ibu.add[hopIdx].IAA_dis_mg = 0.0;

      // use IAA relative temp as proxy for everything happening at each temp.
      relativeTemp = 2.39 * Math.pow(10.0,11) * Math.exp(-9773.0/tempK);
      if (relativeTemp > 1.0) relativeTemp = 1.0;
      if (relativeTemp < 0.0) relativeTemp = 0.0;
      ibu.add[hopIdx].effectiveSteepTime += integrationTime * relativeTemp;
    }

    // every 5 minutes, print out some information to the console
    if (SMPH.verbose > 3 && Math.round(t * 1000) % 5000 == 0) {
      AA_dis  = AA_dis_mg  / currVolume;
      dAA_dis_mg = -1.0 * k1 * AA_dis_mg;
      dIAA_dis_mg = (k1 * AA_dis_mg) - (k2 * IAA_dis_mg);
      console.log("time = " + t.toFixed(3));
      console.log("       temp = " + tempC.toFixed(2));
      console.log("       volume = " + currVolume.toFixed(4));
      console.log("       AA = " + AA_dis.toFixed(4) + " ppm " +
                          "with delta " + dAA_dis_mg.toFixed(6) + " mg/min");
      console.log("       IAA = " + (IAA_dis_mg/currVolume).toFixed(4)+" ppm " +
                          "with delta " + dIAA_dis_mg.toFixed(6) + " mg/min");
      if (t == 0) {
        console.log("    -------- end of boil --------");
      }
    }


    // adjust current volume due to evaporation
    if (t >= 0) {
      // if boiling, use evaporation rate
      currVolume -= ibu.evaporationRate.value/60.0 * integrationTime;
    } else {
      // if sub-boiling, estimate evaporation rate
      // from exponential fit to 20 = 0.0, 80 = 1.36, 100 = 3.672
      evapRateAtTemp = 0.0243 * Math.exp(0.0502 * tempC); // liters/hr
      evapRateAtBoil = 3.679294682; // 0.0243 * Math.exp(0.0502*100.0); // l/hr
      if (evapRateAtTemp > evapRateAtBoil) evapRateAtTemp = evapRateAtBoil;
      subBoilEvapRate = ibu.evaporationRate.value*evapRateAtTemp/evapRateAtBoil;
      currVolume -= subBoilEvapRate/60.0 * integrationTime;
    }

    // prevent floating-point drift in 'time' variable
    t = Number(t.toFixed(4));
  }

  // ---------------------------------------------------------------------------
  // FINALIZE

  // adjust IAA based on IAA rate factor
  RF_IAA = compute_RF_IAA(ibu);
  IAA_dis_mg *= RF_IAA;
  IAA_xfer_mg *= RF_IAA;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    ibu.add[hopIdx].IAA_dis_mg *= RF_IAA;
    ibu.add[hopIdx].IAA_xfer_mg *= RF_IAA;
  }

  // compute total forced cooling time (FCT)
  FCT = (-1.0 * t) - ibu.whirlpoolTime.value;

  // adjust amount of dissolved material based on wort/trub loss and
  // topoff volume added
  finalVolume = postBoilVolume;
  if (ibu.wortLossVolume.value > 0) {
    // if wort loss after boil, adjust final volume and final mg of IAA,
    // oAA, oBA, PP, keeping overall concentrations the same
    finalVolume = postBoilVolume - ibu.wortLossVolume.value;
    if (finalVolume < 0.0) finalVolume = 0.0;
    IAA_dis_mg *= 1.0 - (ibu.wortLossVolume.value / postBoilVolume);
    if (IAA_dis_mg < 0.0) IAA_dis_mg = 0.0;
    if (SMPH.verbose > 1) {
      console.log("FINAL VOL = " + postBoilVolume.toFixed(4) + " minus loss " +
                  ibu.wortLossVolume.value.toFixed(4));
    }
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      ibu.add[hopIdx].IAA_dis_mg *=
          1.0 - (ibu.wortLossVolume.value / postBoilVolume);
      ibu.add[hopIdx].oAA_dis_mg *=
          1.0 - (ibu.wortLossVolume.value / postBoilVolume);
      ibu.add[hopIdx].oBA_dis_mg *=
          1.0 - (ibu.wortLossVolume.value / postBoilVolume);
      ibu.add[hopIdx].hopPP_dis_mg *=
          1.0 - (ibu.wortLossVolume.value / postBoilVolume);
    }
  }

  finalVolume += ibu.topoffVolume.value;
  if (finalVolume == 0) {
    finalVolume = 0.01; // prevent division by zero
  }

  // for each addition, compute IAA concentration in wort that includes
  // both IAA dissolved in the wort in the kettle and IAA that were
  // transferred out of the kettle.  Then normalize by final volume.
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    ibu.add[hopIdx].IAA_wort_mg =
         (ibu.add[hopIdx].IAA_dis_mg + ibu.add[hopIdx].IAA_xfer_mg);
    ibu.add[hopIdx].IAA_wort =
         (ibu.add[hopIdx].IAA_dis_mg + ibu.add[hopIdx].IAA_xfer_mg)/finalVolume;
    ibu.add[hopIdx].oAA_wort = ibu.add[hopIdx].oAA_dis_mg / finalVolume;
    ibu.add[hopIdx].oBA_wort = ibu.add[hopIdx].oBA_dis_mg / finalVolume;
    ibu.add[hopIdx].hopPP_wort = ibu.add[hopIdx].hopPP_dis_mg / finalVolume;
    if (SMPH.verbose > 0) {
      console.log("  hop addition " + hopIdx + " has vol=" +
                finalVolume.toFixed(4) + " liters, [IAA]=" +
                ibu.add[hopIdx].IAA_wort.toFixed(4) + " ppm, [oAA]=" +
                ibu.add[hopIdx].oAA_wort.toFixed(4) + " ppm, [oBA]=" +
                ibu.add[hopIdx].oBA_wort.toFixed(4) + " ppm, [PP]=" +
                ibu.add[hopIdx].hopPP_wort.toFixed(4));
    }
  }

  // set the cooling time to reach 60'C
  ibu.FCT60 = FCT60;

  // print out summary information to console when done
  if (SMPH.verbose > 2) {
    console.log(" >> forced cooling time = " + FCT.toFixed(2) + " minutes");
    console.log(" >> temperature at end = " + tempC.toFixed(2) + "'C after ");
    if (coolingMethod == "forcedDecayCounterflow") {
      console.log("     transfer time " + totalXferTime.toFixed(2) + " min");
    } else {
      console.log("     " + (-1*t).toFixed(3) + " minutes after flameout " +
                  " (whirlpool = " + whirlpoolTime +
                  " min, chilling time " + (-1*(t+whirlpoolTime)).toFixed(2) +
                  " min)");
    }
    console.log(">>> IAA in wort = " +
                ((IAA_dis_mg + IAA_xfer_mg)/finalVolume).toFixed(4) + " ppm");
  }

  return FCT;
}


//------------------------------------------------------------------------------
// Estimate post-boil pH from pre-boil pH

function compute_postBoil_pH(preBoilpH) {
  var pH = preBoilpH;
  // see pH_function_of_temp/fitTimeData_ORIG.tcl
  // var slopeSlope = -0.002800223086542374;
  // var slopeIntercept = 0.013184013161963867;

  // this function based on data but doesn't generalize as well
  // pH = (preBoilpH * ((slopeSlope * ibu.boilTime.value) + 1.0)) +
       // (slopeIntercept * ibu.boilTime.value);
  pH = preBoilpH - (ibu.boilTime.value * 0.10 / 60.0);
  if (SMPH.verbose > 5) {
    console.log("pre-boil pH: " + preBoilpH.toFixed(4) + " becomes " +
               pH.toFixed(4) + " after " + ibu.boilTime.value + "-minute boil");
  }
  return pH;
}

//------------------------------------------------------------------------------
// Compute IAA loss factor (LF) based on original gravity
// Assume that OG affects IAA and nonIAA equally

function compute_LF_OG_SMPH(ibu, hopIdx) {
  var LF_OG = 0.0;
  var OG = ibu.OG.value;
  var slope = 0.0;
  var t = ibu.add[hopIdx].effectiveSteepTime;

  // at 30 minutes and below, OG has no effect on IBUs.
  // at 40 minutes and above, OG affects IBUs according to the exponential
  //    equation with slope = 4.91.  This formula was fit to the data
  //    at time = 40 in the second experiment of blog post
  //    'Specific Gravity and IBUs'.
  // between 30 and 40 minutes, do a linear interpolation of 'slope'
  //    from having no effect to having full effect.

  if (OG <= 1.0) {
    return 1.0;
  }
  if (t <= 30) {
    return 1.0
  }

  slope = 4.91;
  if (t < 40) { slope = 0.391 * (t - 30.0) + 1.0; }
  LF_OG = 1.0 - 2.0*Math.exp(-1.0/(slope*(OG-1.0)));
  if (SMPH.verbose > 5) {
    console.log("LF OG : " + LF_OG.toFixed(4));
  }

  return LF_OG;
}

//------------------------------------------------------------------------------
// Compute IAA loss factor (LF) during fermentation given amount of flocculation
// Assume that fermentation affects IAA and nonIAA equally.

function compute_LF_ferment(ibu) {
  var LF_ferment = 0.0;
  var LF_flocculation = 0.0;

  // The factors here come from Garetz, p. 140
  if (ibu.flocculation.value == "high") {
    LF_flocculation = 0.95;
  } else if (ibu.flocculation.value == "medium") {
    LF_flocculation = 1.00;
  } else if (ibu.flocculation.value == "low") {
    LF_flocculation = 1.05;
  } else {
    console.log("ERROR: unknown flocculation value: " + ibu.flocculation.value);
    LF_flocculation = 1.00;
  }

  LF_ferment = SMPH.fermentationFactor * LF_flocculation;
  if (SMPH.verbose > 5) {
    console.log("LF ferment : " + LF_ferment.toFixed(4));
  }
  return LF_ferment;
}

//------------------------------------------------------------------------------
// Compute loss factor (LF) for filtering
// Assume that filtering affects IAA and nonIAA equally

function compute_LF_filtering(ibu) {
  var LF_filtering = 0.0;

  LF_filtering = 1.0;
  if (!isNaN(ibu.filtering.value)) {
    if (ibu.filtering.value >= 0 && ibu.filtering.value < 3.83) {
      // formula based on Fix & Fix page 129 Table 5.5
      LF_filtering = (0.017 * ibu.filtering.value) + 0.934
    }
  }
  if (SMPH.verbose > 5) {
    console.log("LF filtering : " + LF_filtering.toFixed(4));
  }
  return LF_filtering;
}

//------------------------------------------------------------------------------
// Compute loss factor (LF) for finings.
// Assume that finings affect IAA and nonIAA equally

function compute_LF_finings(ibu) {
  var finingsMlPerLiter = 0.0;
  var LF_finings = 0.0;
  var volume = ibu.fermentorVolume.value;

  if (volume <= 0) {
    return 0.0;
  }

  LF_finings = 1.0;
  if (!isNaN(ibu.finingsAmount.value)) {
    finingsMlPerLiter = ibu.finingsAmount.value / volume;
    if (ibu.finingsType.value == "gelatin") {
      // exponential decay factor from 'gelatin' subdirectory, data.txt
      LF_finings = Math.exp(-0.09713 * finingsMlPerLiter);
    }
  }
  if (SMPH.verbose > 5) {
    console.log("LF finings : " + LF_finings.toFixed(4) + " from " +
                ibu.finingsAmount.value.toFixed(3) + " ml of " +
                ibu.finingsType.value + " in " +
                volume.toFixed(2) + " l fermentor");
  }
  return LF_finings;
}

//------------------------------------------------------------------------------
// Compute loss factor (LF) for age of the beer at room temperature
// Assume that beer age affects IAA and nonIAA equally

function compute_LF_age(ibu) {
  var beerAge_weeks = 0.0;
  var LF_age = 1.0;

  // Formula from blog 'Four Experiments on Alpha Acid Utilization and IBUs'.
  // Loss based on exponential fit to first 13 weeks of data; after 15 weeks,
  // losses seem to stabilize.
  // This is an average of IAA and nonIAA losses, but doesn't include maltPP.
  // This assumes equal losses for IAA and nonIAA; Pellets vs Cones
  // Experiment #5 found that over 10 weeks IAA decayed by a factor
  // of 0.88 and nonIAA decayed by a factor of 0.74.  The estimate from
  // this formula (0.82) is very close to the average of 0.88 and 0.74 (0.81).
  beerAge_weeks = ibu.beerAge_days.value / 7.0;
  if (beerAge_weeks > 15.0) {
    beerAge_weeks = 15.0;
  }
  LF_age = 0.35 * Math.exp(-0.073 * beerAge_weeks) + 0.65;
  if (SMPH.verbose > 5) {
    console.log("LF age : " + LF_age.toFixed(4));
  }
  return LF_age;
}


//==============================================================================
// IAA

//------------------------------------------------------------------------------
// Rate Factors (RF) for IAA

//------------------------------------------------------------------------------
// Compute IAA rate factor (RF).
// Currently, only time and temperature affect rate of IAA production,
// and these are modeled elsewhere.

function compute_RF_IAA(ibu) {
  var RF_IAA = 1.0;
  return RF_IAA;
}

//------------------------------------------------------------------------------
// Loss Factors (LF) for IAA

//------------------------------------------------------------------------------
// Compute loss factor for IAA based on pH

function compute_LF_IAA_pH(ibu) {
  var LF_pH = 1.0;
  var pH = ibu.pH.value;
  var preBoilpH = 0.0;
  var preOrPostBoilpH = ibu.preOrPostBoilpH.value;

  if (ibu.pHCheckbox.value) {
    // If pre-boil pH, estimate the post-boil pH which is the
    // one we want to base losses on.
    if (preOrPostBoilpH == "preBoilpH") {
      preBoilpH = pH;
      pH = compute_postBoil_pH(preBoilpH);
    }

    // formula from blog post 'The Effect of pH on Utilization and IBUs'
    LF_pH = (0.071 * pH) + 0.592;
    if (SMPH.verbose > 5) {
      console.log("pH = " + pH + ", LF for IAA = " + LF_pH.toFixed(4));
    }
  }

  return LF_pH;
}

// -----------------------------------------------------------------------------
// compute loss factor for IAA components caused by wort turbidity

function compute_LF_IAA_wortClarity(ibu) {
  var description = ibu.wortClarity.value;
  var LF_wortClarity = 1.0;

  LF_wortClarity = ibu.getWortClarityValue(description);
  if (SMPH.verbose > 5) {
    console.log("LF wort clarity : " + LF_wortClarity.toFixed(4));
  }

  return LF_wortClarity;
}

// -----------------------------------------------------------------------------
// compute loss factor for IAA components caused by krausen loss

function compute_LF_IAA_krausen(ibu) {
  var description = ibu.krausen.value;
  var LF_krausen = 1.0;

  LF_krausen = ibu.getKrausenValue(description);
  if (SMPH.verbose > 5) {
    console.log("LF IAA krausen : " + LF_krausen.toFixed(4));
  }

  return LF_krausen;
}

//------------------------------------------------------------------------------
// Compute overall loss factor (LF) for IAA, given loss factors caused by
// the boil, pH, gravity, clarity, fermentation/flocculation, krausen,
// finings, filtering, and age of beer.

function compute_LF_IAA(ibu, hopIdx) {
  var LF_IAA = 0.0;

  LF_IAA = SMPH.IAA_LF_boil * compute_LF_IAA_pH(ibu) *
           compute_LF_OG_SMPH(ibu, hopIdx) *
           compute_LF_IAA_wortClarity(ibu) *
           compute_LF_ferment(ibu) * compute_LF_IAA_krausen(ibu) *
           compute_LF_finings(ibu) * compute_LF_filtering(ibu) *
           compute_LF_age(ibu);
  if (SMPH.verbose > 3) {
    console.log("    IAA LF = " + LF_IAA.toFixed(4) +
              ", from LF_boil=" + SMPH.IAA_LF_boil.toFixed(4) +
              ", LF_pH=" + compute_LF_IAA_pH(ibu).toFixed(4) +
              ", LF_OG=" + compute_LF_OG_SMPH(ibu, hopIdx).toFixed(4) +
              ", LF_clarity=" + compute_LF_IAA_wortClarity(ibu).toFixed(4) +
              ", LF_ferment=" + compute_LF_ferment(ibu).toFixed(4));
    console.log("                          " +
              "LF_kausen="+ compute_LF_IAA_krausen(ibu).toFixed(4) +
              ", LF_finings=" + compute_LF_finings(ibu).toFixed(4) +
              ", LF_filtering=" + compute_LF_filtering(ibu).toFixed(4) +
              ", LF_age=" + compute_LF_age(ibu).toFixed(4));
  }
  return LF_IAA;
}

//------------------------------------------------------------------------------
// compute overall loss factor for IAA caused by dry hopping

function compute_IAA_LF_dryHop(ibu) {
  var b = 0.0;
  var bLow = 0.0;
  var bHigh = 0.0;
  var dryHops_concent = 0.0;
  var hopIdx = 0;
  var IAA_beer = 0.0;
  var IAAhigh = 0.0;
  var IAA_LF_dryHop = 0.0;
  var IAAlow = 0.0;
  var offset = 0.0;
  var slope = 0.0;
  var volume = ibu.fermentorVolume.value;

  if (volume <= 0) {
    return 0.0;
  }

  dryHops_concent = 0.0;
  IAA_beer = 0.0;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    if (ibu.add[hopIdx].kettleOrDryHop.value == "kettle") {
      IAA_beer += ibu.add[hopIdx].IAA_wort * compute_LF_IAA(ibu, hopIdx);
    }
    if (ibu.add[hopIdx].kettleOrDryHop.value == "dryHop") {
      dryHops_concent += ibu.add[hopIdx].weight.value * 1000.0 / volume;
    }
  }
  if (SMPH.verbose > 3) {
    console.log("IAA in beer before dry hop: " + IAA_beer.toFixed(4) + " ppm");
    console.log("total [dry hops]: " + dryHops_concent.toFixed(4) + " ppm");
  }

  // if no dry hopping, then no IAA loss
  if (dryHops_concent == 0.0) {
    return 1.0;
  }

  if (false) {
    bHigh   = 0.00012;
    bLow    = 0.0;
    IAAhigh = 50.0;
    IAAlow  = 16.0;
    slope = (bHigh - bLow) / (IAAhigh - IAAlow);
    offset = bHigh - (slope * IAAhigh);
    } else {
    slope  =  0.0000035294117647058825;
    offset = -0.000056470588235294126;
    }
  b = slope * IAA_beer + offset;
  if (b < 0.0) {
    b = 0.0;
  }

  IAA_LF_dryHop = 0.50 * Math.exp(-1.0 * b * dryHops_concent) + 0.50;

  return IAA_LF_dryHop;
}

//------------------------------------------------------------------------------
// Compute IAA levels in the finished beer, given IAA concentration in the wort
// and the cumulative IAA loss factor.

function compute_IAA_beer(ibu, hopIdx, IAA_LF_dryHop) {
  var IAA_beer = 0.0;

  if (ibu.add[hopIdx].kettleOrDryHop.value == "kettle") {
    ibu.add[hopIdx].IAA_beer    = ibu.add[hopIdx].IAA_wort * IAA_LF_dryHop *
                                   compute_LF_IAA(ibu, hopIdx);
    ibu.add[hopIdx].IAA_beer_mg = ibu.add[hopIdx].IAA_wort_mg * IAA_LF_dryHop *
                                   compute_LF_IAA(ibu, hopIdx);
    IAA_beer = ibu.add[hopIdx].IAA_beer;

    if (SMPH.verbose > 2) {
      console.log("    [IAA]_wort = " + ibu.add[hopIdx].IAA_wort.toFixed(2) +
                ", [IAA]_beer = " + ibu.add[hopIdx].IAA_beer.toFixed(4));
    }
  }

  return IAA_beer;
}



//==============================================================================
// Auxiliary Bittering Compounds (nonIAA)

// -----------------------------------------------------------------------------
// compute loss factor for nonIAA based on pH
// Note: the actual effect of pH on nonIAA might be the same for all
// nonIAA (oAA, oBA, and hopPP), or it might be limited to the effect
// of pH on oAA. In other words, pH may or may not have an effect on
// oxidized beta acids or hop polyphenols.  Since the contribution of
// oBA and hop PP to the IBU is small, and since we don't have any data
// for these impact of pH on these components, we currently assume that
// pH affects only oAA, and that oBA and hop PP are not affected by pH.

function compute_LF_oAA_pH(ibu) {
  var LF_pH = 1.0;
  var pH = ibu.pH.value;
  var preBoilpH = 0.0;
  var preOrPostBoilpH = ibu.preOrPostBoilpH.value;

  if (ibu.pHCheckbox.value) {
    // If pre-boil pH, estimate the post-boil pH which is the
    // one we want to base losses on.
    if (preOrPostBoilpH == "preBoilpH") {
      preBoilpH = pH;
      pH = compute_postBoil_pH(preBoilpH);
    }

    // formula from blog post 'The Effect of pH on Utilization and IBUs'
    LF_pH = (1.178506 * pH) - 5.776411
    if (SMPH.verbose > 5) {
      console.log("pH = " + pH + ", LF for nonIAA = " + LF_pH.toFixed(4));
    }
  }

  return LF_pH;
}

// -----------------------------------------------------------------------------
// compute loss factor for nonIAA components due to krausen loss

function compute_LF_nonIAA_krausen(ibu) {
  var description = ibu.krausen.value;
  var IAA_krausenLoss = 0.0;
  var IAA_krausenLossFactor = 1.0;
  var LF_krausen = 1.0;
  var nonIAA_krausenLoss = 0.0;
  var nonIAA_krausenFactor = 0.0;

  IAA_krausenLossFactor = ibu.getKrausenValue(description);

  // krausen exp = 2.97, OG exp #1&#2 = 3.13, average is about 3.0
  // (OG exp #1, #2 : see beer64/analyze.tcl)
  nonIAA_krausenFactor = 3.0;

  IAA_krausenLoss = (1.0-IAA_krausenLossFactor); // represent loss in percent
  nonIAA_krausenLoss = IAA_krausenLoss * nonIAA_krausenFactor;
  LF_krausen = (1.0 - nonIAA_krausenLoss);

  if (SMPH.verbose > 5) {
    console.log("Krausen: IAA factor = " + IAA_krausenLossFactor +
              ", IAA loss = " + IAA_krausenLoss +
              ", nonIAA loss = " + nonIAA_krausenLoss +
              ", nonIAA loss factor = " + LF_krausen);
  }

  return LF_krausen;
}

// -----------------------------------------------------------------------------
// compute loss factor for nonIAA components when dry hopping

function compute_LF_dryHop(ibu) {
  var LF_dryHop = compute_LF_finings(ibu) * compute_LF_filtering(ibu);
  return LF_dryHop;
}


// -----------------------------------------------------------------------------
// ------------ AA -------------------------------------------------------------

// -----------------------------------------------------------------------------
// compute concentration of alpha acids (AA) in finished beer,
// for a specific hop addition, given AA concentration and AA loss factors.

function compute_AA_beer(ibu, hopIdx) {
  var AA_added = 0.0;
  var AA_concent = 0.0;
  var hops_concent = 0.0;
  var newTotal = 0.0;
  var volume = ibu.fermentorVolume.value;

  if (volume <= 0) {
    return 0.0;
  }

  // alpha acids added during the boil don't survive into finished beer
  // e.g. Lewis and Young, p. 259
  ibu.add[hopIdx].AA_beer = 0.0;

  if (ibu.add[hopIdx].kettleOrDryHop.value == "dryHop" &&
      ibu.useDryHopModelCheckbox.value) {
    hops_concent = ibu.add[hopIdx].weight.value * 1000.0 / volume;
    AA_added = hops_concent * (ibu.add[hopIdx].AA.value/100.0);
    // [AA] making it into beer is about 1% of added [AA], but nonlinear
    // See Lafontaine thesis p. 56
    AA_concent = 14.7 * (1.0 - Math.exp(-0.00109 * AA_added));
    if (SMPH.verbose > 3) {
      console.log("    Added " + AA_added.toFixed(2) + " ppm of AA; " +
                  " yielding " + AA_concent.toFixed(3) + " ppm of AA in beer");
    }

    // model saturation of AA, accounting for all dry-hop additions
    newTotal = ibu.AA + AA_concent;
    if (newTotal > SMPH.AA_dryHop_saturation) {
      AA_concent = SMPH.AA_dryHop_saturation - ibu.AA;
      if (SMPH.verbose > 3) {
        console.log("      solubility limit exceeded; yield is only " +
                    AA_concent.toFixed(3) + " ppm of AA");
      }
    }
    ibu.AA += AA_concent;

    AA_concent *= compute_LF_dryHop(ibu);
    ibu.add[hopIdx].AA_dis_mg = AA_concent * volume;
    ibu.add[hopIdx].AA_wort = 0.0;
    ibu.add[hopIdx].AA_beer = AA_concent;
    if (SMPH.verbose > 3) {
      console.log("    [AA]_beer = " + (ibu.add[hopIdx].AA_beer).toFixed(4));
    }
  }

  return AA_concent;
}

// -----------------------------------------------------------------------------
// ----------- oAA -------------------------------------------------------------

// -----------------------------------------------------------------------------
// compute the amount of dissolved oAA, in mg, for a specific hop addition

function compute_oAA_dis_mg(ibu, hopIdx, currVolume) {
  var AAloss_percent = 0.0;
  var k = 0.0;
  var oAA_addition = 0.0;
  var oAA_fresh = 0.0;
  var oAA_percent_boilFactor = 0.0;
  var oAA_percent_init = 0.0;
  var oAA_percent = 0.0;
  var ratio = 0.0;
  var relativeAA = 0.0;

  // The oAA_percent_init is for cones; the value for pellets is probably
  // higher (because more surface area), but this (hopefully) rarely comes
  // into play because oAA_boil for pellets is much larger.  So, just use the
  // cones value even if we have pellets.

  // 'k' is from Garetz
  ratio = 1.0 - (ibu.add[hopIdx].percentLoss.value / 100.0);
  k = Math.log(1.0 / ratio) / (365.0 / 2.0);
  if (SMPH.verbose > 5) {
    console.log("      %loss = " +
              ibu.add[hopIdx].percentLoss.value.toFixed(2) +
              " and so k = " + k.toFixed(6));
  }

  // oAA_fresh modeled as 3.5 days decay at 20'C, which is then multiplied
  // by AA rating.  For Maye paper, average AA of Zeus is 15.75% and SF = 50%,
  // so 1-(1/exp(0.003798*1*1*3.5) * 0.1575 = 0.002 = 0.2% of weight of hops.
  // where 0.003798 is k for SF 0.50.
  oAA_fresh = 1.0 - (1.0 / Math.exp(k * 1.0 * 1.0 * 3.5));

  AAloss_percent = 1.0 - ibu.add[hopIdx].freshnessFactor.value;
  oAA_percent_init = (AAloss_percent * SMPH.oAA_storageFactor) + oAA_fresh;
  if (SMPH.verbose > 4) {
    console.log("      [oAA] storage factors: fresh=" + oAA_fresh.toFixed(5) +
              " + (loss=" + AAloss_percent.toFixed(5) +
              " * storage=" + SMPH.oAA_storageFactor.toFixed(4) +
              "): %init=" + oAA_percent_init.toFixed(5));
  }

  // the AA available for oxidation is affected by the AA solubility limit;
  // figure out the relative impact of this solubility limit
  relativeAA = 1.0;
  if (ibu.add[hopIdx].AA_init > 0.0 && currVolume > 0.0) {
    relativeAA = ibu.add[hopIdx].AA_dis_mg/(ibu.add[hopIdx].AA_init*currVolume);
  }

  // console.log("AA: added= "+(ibu.add[hopIdx].AA_init*currVolume).toFixed(3) +
              // "mg , dissolved = " + ibu.add[hopIdx].AA_dis_mg.toFixed(3) +
              // "mg, relative = " + relativeAA.toFixed(3));
  // the AA solubility limit only applies to the oAA produced during the boil
  oAA_percent_boilFactor = ibu.add[hopIdx].freshnessFactor.value *
                           SMPH.oAA_boilFactor * relativeAA;

  // if using pellets, the boil factor is increased
  if (ibu.add[hopIdx].hopForm.value == "pellets") {
    oAA_percent_boilFactor *= ibu.add[hopIdx].pelletFactor.value;
  }

  if (SMPH.verbose > 4) {
    console.log("      [oAA] boil factor: "+ oAA_percent_boilFactor.toFixed(5) +
             " from fresh=" + ibu.add[hopIdx].freshnessFactor.value.toFixed(5) +
             ", boil=" + SMPH.oAA_boilFactor.toFixed(5) +
             ", relAA=" + relativeAA.toFixed(5),
             ", pelletFactor=" + ibu.add[hopIdx].pelletFactor.value);
  }
  // oAA_addition is oAA added to wort, in mg

  // boiling has no effect on AA that have oxidized prior to boil (FV exp #74)
  oAA_percent = oAA_percent_boilFactor;
  if (oAA_percent_init > oAA_percent_boilFactor) {
    oAA_percent = oAA_percent_init;
  }
  oAA_addition = oAA_percent * (ibu.add[hopIdx].AA.value/100.0) *
                  ibu.add[hopIdx].weight.value * 1000.0;

  // note: solubility limit of oAA is large enough so that all are dissolved
  ibu.add[hopIdx].oAA_dis_mg = oAA_addition;
  if (SMPH.verbose > 3) {
    console.log("    hop addition " + hopIdx + ": [oAA] = " +
                (ibu.add[hopIdx].oAA_dis_mg/currVolume).toFixed(4) +
                " ppm from (" + oAA_percent_init.toFixed(4) + " + " +
                oAA_percent_boilFactor.toFixed(4) +
                ") * " + (ibu.add[hopIdx].AA.value/100.0).toFixed(4) + " * " +
                ibu.add[hopIdx].weight.value.toFixed(3) + " * 1000.0 / " +
                currVolume.toFixed(4));
  }

  return;
}

// -----------------------------------------------------------------------------
// compute loss factor (LF) for oxidized alpha acids (oAA), for a specific
// hop addition, using:
// . overall loss factor during the boil (assumed same for IAA and nonIAA),
// . overall loss factor from OG (big assumption),
// . oAA loss factor for pH,
// . overall loss factor for fermentation,
// . non-IAA loss factor for krausen,
// . overall loss factor for finings,
// . overall loss factor for filtering,
// . overall loss factor for age

function compute_LF_oAA(ibu, hopIdx) {
  var LF_oAA = 0.0;
  var oAA_LF_boil = 0.0;

  // enforce that oAA_LF_boil is same as IAA loss factor
  oAA_LF_boil = SMPH.IAA_LF_boil;

  LF_oAA = oAA_LF_boil *
           compute_LF_OG_SMPH(ibu, hopIdx) *
           compute_LF_oAA_pH(ibu) *
           compute_LF_ferment(ibu) *
           compute_LF_nonIAA_krausen(ibu) *
           compute_LF_finings(ibu) *
           compute_LF_filtering(ibu) *
           compute_LF_age(ibu);
  if (SMPH.verbose > 5) {
    console.log("    LF oAA " + LF_oAA.toFixed(4));
    console.log("       from " + oAA_LF_boil + ", " +
                                 compute_LF_oAA_pH(ibu) + ", " +
                                 compute_LF_OG_SMPH(ibu, hopIdx) + ", " +
                                 compute_LF_ferment(ibu) + ", " +
                                 compute_LF_nonIAA_krausen(ibu) + ", " +
                                 compute_LF_finings(ibu) + ", " +
                                 compute_LF_filtering(ibu) + ", " +
                                 compute_LF_age(ibu));
  }
  return LF_oAA;
}

// -----------------------------------------------------------------------------
// compute concentration of oxidized alpha acids (oAA) in finished beer,
// for a specific hop addition, given oAA concentration and oAA loss factors.

function compute_oAA_beer(ibu, hopIdx) {
  var hops_concent = 0.0;
  var oAA_beer = 0.0;
  var oAA_concent = 0.0;
  var oAA_percent_of_AA = 0.0;
  var oAA_saturationFactor = 0.0;
  var volume = ibu.fermentorVolume.value;

  if (volume <= 0) {
    return 0.0;
  }

  ibu.add[hopIdx].oAA_beer = 0.0;
  oAA_beer = 0.0;

  if (ibu.add[hopIdx].kettleOrDryHop.value == "kettle") {
    ibu.add[hopIdx].oAA_beer = ibu.add[hopIdx].oAA_wort *
                               compute_LF_oAA(ibu, hopIdx);
    oAA_beer = ibu.add[hopIdx].oAA_beer;

    if (SMPH.verbose > 3) {
      console.log("    [oAA]_beer = " + oAA_beer.toFixed(4) +
                " ppm from [oAA]_wort " + ibu.add[hopIdx].oAA_wort.toFixed(4) +
                " ppm and LF " + compute_LF_oAA(ibu,hopIdx).toFixed(4));
    }
  }

  if (ibu.add[hopIdx].kettleOrDryHop.value == "dryHop" &&
      ibu.useDryHopModelCheckbox.value) {
    hops_concent = ibu.add[hopIdx].weight.value * 1000.0 / volume;
    // if freshness is 1.0, oAA is 2% of AA; if freshness is 0.75, oAA is 3.4%
    oAA_percent_of_AA = (-0.056*ibu.add[hopIdx].freshnessFactor.value) + 0.076;
    oAA_concent = hops_concent * (ibu.add[hopIdx].AA.value/100.0) *
                  oAA_percent_of_AA;
    // model saturation of oAA; data from Maye p. 25 & Lafontaine pp 55,56
    oAA_saturationFactor = 1.0;
    if (hops_concent > 2200.0) {
      oAA_saturationFactor = 1.1181 * Math.exp(-0.0000506 * hops_concent);
    }
    oAA_concent *= oAA_saturationFactor;
    oAA_concent *= compute_LF_dryHop(ibu);
    ibu.add[hopIdx].oAA_dis_mg = oAA_concent * volume;
    ibu.add[hopIdx].oAA_wort = 0.0;
    ibu.add[hopIdx].oAA_beer = oAA_concent;
    if (SMPH.verbose > 3) {
      console.log("    [hops] = " + hops_concent.toFixed(4) + " ppm");
      console.log("    oAA: "+(oAA_percent_of_AA*100.0).toFixed(4) + "% of AA");
      console.log("    fermentor VOLUME = " + volume);
      console.log("    [oAA]_beer = " + (ibu.add[hopIdx].oAA_beer).toFixed(4));
    }
  }

  return oAA_beer;
}

// -----------------------------------------------------------------------------
// ----------- oBA -------------------------------------------------------------

// -----------------------------------------------------------------------------
// compute the amount of dissolved oBA, in mg, for a specific hop addition

function compute_oBA_dis_mg(ibu, hopIdx, currVolume) {
  var oBA_addition = 0.0;
  var oBA_percent = 0.0;

  oBA_percent = 1.0 - ibu.add[hopIdx].freshnessFactor.value;
  oBA_addition = oBA_percent * SMPH.oBA_boilFactor *
                  (ibu.add[hopIdx].BA.value / 100.0) *
                  ibu.add[hopIdx].weight.value * 1000.0;

  // note: solubility limit of oBA is large enough that all is dissolved
  ibu.add[hopIdx].oBA_dis_mg = oBA_addition;
  if (SMPH.verbose > 3) {
    console.log("    hop addition " + hopIdx + ": [oBA] = " +
                (ibu.add[hopIdx].oBA_dis_mg/currVolume).toFixed(4) +
                " ppm from (" + oBA_percent.toFixed(4) + " * " +
                SMPH.oBA_boilFactor +
                " * " + (ibu.add[hopIdx].BA.value/100.0).toFixed(4) + " * " +
                ibu.add[hopIdx].weight.value.toFixed(3) + " * 1000.0 / " +
                currVolume.toFixed(4));
  }

  return;
}

// -----------------------------------------------------------------------------
// compute loss factor (LF) for oxidized beta acids (oBA), for a specific
// hop addition, using:
// . overall loss factor for fermentation,
// . nonIAA loss factor for krausen,
// . overall loss factor for finings,
// . overall loss factor for filtering,
// . overall loss factor for age
// Assume that pH and OG have little effect on oBA.

function compute_LF_oBA(ibu, hopIdx) {
  var LF_oBA = 0.0;

  LF_oBA = compute_LF_ferment(ibu) *
           compute_LF_nonIAA_krausen(ibu) *
           compute_LF_finings(ibu) *
           compute_LF_filtering(ibu) *
           compute_LF_age(ibu);
  if (SMPH.verbose > 5) {
    console.log("oBA LOSS FACTOR = " + LF_oBA +
              " from ferment=" + compute_LF_ferment(ibu) + ", krausen=" +
              compute_LF_nonIAA_krausen(ibu) + ", finings=" +
              compute_LF_finings(ibu) + ", filtering=" +
              compute_LF_filtering(ibu) + ", age=" +
              compute_LF_age(ibu));
    }

  return LF_oBA;
}

// -----------------------------------------------------------------------------
// compute concentration of oxidized beta acids (oBA) in finished beer,
// for a specific hop addition, given oBA concentration and oBA loss factors.

function compute_oBA_beer(ibu, hopIdx) {
  var oBA_beer = 0.0;
  var volume = ibu.fermentorVolume.value;

  if (volume <= 0) {
    return 0.0;
  }

  ibu.add[hopIdx].oBA_beer = 0.0;
  oBA_beer = 0.0;

  if (ibu.add[hopIdx].kettleOrDryHop.value == "kettle") {
    ibu.add[hopIdx].oBA_beer = ibu.add[hopIdx].oBA_wort *
                               compute_LF_oBA(ibu, hopIdx);
    oBA_beer = ibu.add[hopIdx].oBA_beer;

    if (SMPH.verbose > 3) {
      console.log("    [oBA]_beer = " + oBA_beer.toFixed(4) +
                " ppm from [oBA]_wort " + ibu.add[hopIdx].oBA_wort.toFixed(4) +
                " ppm and LF " + compute_LF_oBA(ibu,hopIdx).toFixed(4));
    }
  }

  if (ibu.add[hopIdx].kettleOrDryHop.value == "dryHop" &&
      ibu.useDryHopModelCheckbox.value) {
    compute_oBA_dis_mg(ibu, hopIdx, volume);
    oBA_beer *= compute_LF_dryHop(ibu);
    oBA_beer = ibu.add[hopIdx].oBA_dis_mg / volume;
    ibu.add[hopIdx].oBA_beer = oBA_beer;
    if (SMPH.verbose > 3) {
      console.log("    [oBA]_beer = " + oBA_beer.toFixed(4) +
                " ppm from [oBA]_wort " + ibu.add[hopIdx].oBA_wort.toFixed(4) +
                " ppm and LF " + compute_LF_oBA(ibu,hopIdx).toFixed(4));
    }
  }

  return oBA_beer;
}

// -----------------------------------------------------------------------------
// ----------- polyphenols -----------------------------------------------------

// -----------------------------------------------------------------------------
// compute concentration of hop polyphenols dissolved in wort, in mg,
// for a specific hop addition

function compute_hopPP_dis_mg(ibu, hopIdx, currVolume) {
  // assume very high solubility limit for PP, so each addition is additive
  ibu.add[hopIdx].hopPP_dis_mg =
          SMPH.hopPPrating * ibu.add[hopIdx].weight.value * 1000.0;
  if (SMPH.verbose > 3) {
    console.log("    hop addition " + hopIdx + ": [PP] = " +
                (ibu.add[hopIdx].hopPP_dis_mg/currVolume).toFixed(4) +
                " ppm from " + ibu.add[hopIdx].hopPP_dis_mg.toFixed(4) + " * " +
                ibu.add[hopIdx].weight.value.toFixed(3) + " * 1000.0 / " +
                currVolume.toFixed(4));
  }
  return;
}

// -----------------------------------------------------------------------------
// compute loss factor for hop polyphenols added to the kettle, using
// . overall loss factor (or solubility) of hop polyphenols
// . overall loss factor for fermentation,
// . non-IAA loss factor for krausen,
// . overall loss factor for finings,
// . overall loss factor for filtering,
// Assume hop [PP] doesn't change much with age, pH, or OG.

function compute_LF_hopPP_kettle(ibu) {
  var LF_hopPP = 0.0;

  // Assume krausen, finings, filtering affect hop PP the same as other nonIAA.
  LF_hopPP = SMPH.LF_hopPP_kettle *
             SMPH.ferment_hopPP *
             compute_LF_nonIAA_krausen(ibu) *
             compute_LF_finings(ibu) *
             compute_LF_filtering(ibu);

  return LF_hopPP;
}


// -----------------------------------------------------------------------------
// compute loss factor for hop polyphenols when dry hopping, using
// . overall loss factor (or solubility) of hop polyphenols
// . overall loss factor for finings,
// . overall loss factor for filtering,
// Assume hop [PP] doesn't change much with age, pH, or OG, ferment, krausen.

function compute_LF_hopPP_dryHop(ibu) {
  var LF_hopPP = 0.0;

  // combine the loss factor for polyphenols with general dry-hop loss factor
  LF_hopPP = SMPH.LF_hopPP_dryHop * compute_LF_dryHop(ibu);

  return LF_hopPP;
}


// -----------------------------------------------------------------------------
// compute concentration of hop polyphenols in finished beer for a
// specific hop addition

function compute_hopPP_beer(ibu, hopIdx) {
  var hops_concent = 0.0;
  var PP_beer = 0.0;
  var saturationFactor = 0.0;
  var volume = ibu.fermentorVolume.value;

  if (volume <= 0) {
    return 0.0;
  }

  ibu.add[hopIdx].beer = 0.0;
  PP_beer = 0.0;

  if (ibu.add[hopIdx].kettleOrDryHop.value == "kettle") {
    ibu.add[hopIdx].hopPP_beer = ibu.add[hopIdx].hopPP_wort *
                                 compute_LF_hopPP_kettle(ibu);
    if (SMPH.verbose > 3) {
      console.log("    [hopPP]_beer = " + ibu.add[hopIdx].hopPP_beer.toFixed(4)+
                  " ppm from [hopPP]_wort " +
                  ibu.add[hopIdx].hopPP_wort.toFixed(4) +
                  " ppm and LF " + compute_LF_hopPP_kettle(ibu).toFixed(4));
    }
  }
  if (ibu.add[hopIdx].kettleOrDryHop.value == "dryHop" &&
      ibu.useDryHopModelCheckbox.value) {
    hops_concent = ibu.add[hopIdx].weight.value * 1000.0 / volume;
    ibu.add[hopIdx].hopPP_dis_mg =
          SMPH.hopPPrating * ibu.add[hopIdx].weight.value * 1000.0;
    // apply polynomial saturation model from data in Hauser, p. 113
    saturationFactor = (-7.47e-10 * hops_concent * hops_concent) +
                       (0.00000542 * hops_concent) + 0.99733;
    if (saturationFactor > 1.0) {
      saturationFactor = 1.0;
    }
    ibu.add[hopIdx].hopPP_dis_mg *= saturationFactor;
    ibu.add[hopIdx].hopPP_wort = 0.0;
    ibu.add[hopIdx].hopPP_beer = ibu.add[hopIdx].hopPP_dis_mg *
                                 compute_LF_hopPP_dryHop(ibu) / volume;
    if (SMPH.verbose > 3) {
      console.log("    [hopPP]_beer = " + ibu.add[hopIdx].hopPP_beer.toFixed(4)+
                  " ppm, saturation = " + saturationFactor.toFixed(4) +
                  ", and LF " + compute_LF_hopPP_dryHop(ibu).toFixed(4));
    }
  }

  PP_beer = ibu.add[hopIdx].hopPP_beer;

  return PP_beer;
}

// -----------------------------------------------------------------------------
// Compute estimate of malt polyphenols in finished beer, in ppm.
// This estimate of actual polyphenols is not accurate, but it should
// be a reasonable estimate of how these malt polyphenols affect IBUs.

function compute_maltPP_beer(ibu) {
  var factor = 0.0;
  var IBU_malt = 0.0;
  var IBU1 = 0.70;
  var pH = ibu.pH.value;
  var points = 0.0;
  var PP_malt = 0.0;
  var preBoilIBU = 0.0;
  var preBoilpH = ibu.pH.value;
  var preOrPostBoilpH = ibu.preOrPostBoilpH.value;
  var slope = 1.7348;

  // If user specifies pre-boil pH, estimate the post-boil pH
  if (preOrPostBoilpH == "preBoilpH") {
    preBoilpH = pH;
    pH = compute_postBoil_pH(preBoilpH);
  }

  preBoilpH = 5.75;  // approximate value before any pH adjustment
  points = (ibu.OG.value - 1.0) * 1000.0;
  preBoilIBU = points * 0.0190;
  factor = (slope * (preBoilpH - pH) / IBU1) + 1.0;
  IBU_malt = preBoilIBU * factor;
  // console.log("computing maltPP:");
  // console.log("  gravity " + ibu.OG.value);
  // console.log("  pre-boil pH " + preBoilpH);
  // console.log("  post-boil pH " + pH);
  // console.log("  correction factor " + factor);
  // console.log("  IBU before boil " + preBoilIBU);
  // console.log("  IBU after correction " + IBU_malt);

  // the convertion from IBU to PP is not correct, but in the end we
  // want IBUs not PP and so it doesn't matter; we just need to undo
  // the Peacock conversion that we'll do later.
  PP_malt = IBU_malt * 69.68 / 50.0;

  // decrease the IBU by the amount of finings added and any filtration
  PP_malt = PP_malt * compute_LF_finings(ibu) * compute_LF_filtering(ibu);

  // console.log("  PP_malt " + PP_malt);
  return PP_malt;
}

// close the "namespace" and call the function to construct it.
}
SMPH._construct();

