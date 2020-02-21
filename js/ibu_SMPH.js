// -----------------------------------------------------------------------------
// ibu_SMPH.js : JavaScript for AlchemyOverlord web page, SMPH sub-page
// Written by John-Paul Hosom
// Copyright © 2018, 2019 by John-Paul Hosom, all rights reserved.
// To license this software, please contact John-Paul Hosom, for example at
//    alchemyoverlord © yahoo · com
//
// Version 1.0.1 : November 22, 2018 -- xxx xx, 2019
//         This version is based on the mIBU javascript code in this project,
//         which has then been modified to implement the SMPH method as
//         described in the blog post "A Summary of Factors Affecting IBUs".
//
// TODO:
// 1. re-analyze best parameters
// 2. go over code:
//    - are nonIAA treated the way they should be?  e.g. LF_boil, IAA factors?
//    - clean up code
//    - double-check logic
// 3. pellets: adjustment from cones
// 4. pellets: oAA percent init for pellets (and oBA percent init for pellets)
// 5. final: check indentation, change tabs to spaces, alphabetize variables,
//           remove unused variables.
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
  ibu.numAdditions.additionalFunctionArgs = SMPH.computeIBU_SMPH;
  ibu.hopTableSize = 7;   // number of inputs to specify each addition of hops

  // don't need to set() any variables that change with unit conversion;
  // when we call set(units), those dependent variables will also be set.
  common.set(ibu.units, 0);
  common.set(ibu.boilTime, 0);
  common.set(ibu.preOrPostBoilVol, 0);
  common.set(ibu.OG, 0);
  common.set(ibu.tempDecayType, 0);
  common.set(ibu.whirlpoolTime, 0);
  common.set(ibu.immersionDecayFactor, 0);
  common.set(ibu.icebathDecayFactor, 0);
  common.set(ibu.forcedDecayType, 0);
  common.set(ibu.holdTempCheckbox, 0);  // must do this after forcedDecayType
  common.set(ibu.scalingFactor, 0);
  common.set(ibu.defaultHopForm, 0);
  common.set(ibu.applySolubilityLimitCheckbox, 0);
  common.set(ibu.pHCheckbox, 0);
  common.set(ibu.pH, 0);
  common.set(ibu.preOrPostBoilpH, 0);
  common.set(ibu.numAdditions, 0);
  common.set(ibu.krausen, 0);
  common.set(ibu.flocculation, 0);
  common.set(ibu.filtering, 0);
  common.set(ibu.beerAge_days, 0);

  // set parameters of the SMPH model here:
  this.verbose            = 5;
  this.integrationTime    = 0.1;   // minutes

  this.AA_limit_func_A    = -66800.0;  // SEARCH
  this.AA_limit_minLimit  = 180.0; // from experiment
  this.AA_limit_roomTemp  = 90.0;  // AA solubility limit, ppm, from Malowicki

  this.hop_nonExtract     = 1.0;   // some say higher, some say lower than 1.0
  this.hop_pelletFactor   = 1.20;
  this.hop_baggingFactor  = 1.00;  // from experiment

  this.icebathBaseTemp    = 314.00;       // 314.00'K = 40.85'C = 105.53'F
  this.immersionChillerBaseTemp = 293.15; // 293.15'K = 20'C = 68'F = room temp
  this.immersionMinTempC  = 60.0;         // must be > immersionChillerBaseTemp

  this.fermentationFactor = 0.85;   // from lit., e.g. Garetz, Fix, Nielsen
  this.LF_boil            = 0.48;   // SEARCH

  this.relTempAt80_nonIAA = 1.00;   // SEARCH
  // this.oAA_storageFactor  = 0.022;  // estimate from Maye data
  this.oAA_storageFactor  = 0.04;   // SEARCH
  this.oAA_boilFactor     = 0.41;   // SEARCH
  this.scale_oAAloss      = 0.20;   // SEARCH
  this.scale_oAA          = 1.093;  // from Maye, Figure 7

  this.oBA_storageFactor  = 0.00;   // SEARCH
  this.oBA_boilFactor     = 0.10;   // from Stevens p. 500 max 10%
  this.scale_oBAloss      = 0.03;   // cumulative oBA scale is 0.0013 : Teamaker
  this.scale_oBA          = 1.176;  // from Hough p. 491: 1/0.85

  this.hopPPrating        = 0.04;   // approx 4% of hop is PP, from literature
  this.LF_hopPP           = 0.20;   // 20% are soluble, from the literature
  // Parkin scaling factor is 0.022 from [PP] to BU, but BU is 5/7*concentration
  // so 0.022 * 69.68/51.2 is scaling factor from [PP] to [IAA]-equivalent =0.30
  this.scale_hopPP        = 0.030;  // from Parkin, p. 28, corrected

  this.maltPP_slope       = 0.025;  // from experiment

  SMPH.computeIBU_SMPH();

  return;
}


//------------------------------------------------------------------------------
// Compute IBUs and utilization for all hops additions

this.computeIBU_SMPH = function() {
  var addIBUoutput = 0.0;
  var addUtilOutput = 0.0;
  var FCT = 0.0;
  var hopPP_wort = 0.0;
  var hopPP_beer = 0.0;
  var hopIdx = 0;
  var IAA_beer = 0.0;
  var IAA_wort = 0.0;
  var IBU = 0.0;
  var idxP1 = 0;
  var LF_IAA = 0.0;
  var LF_oAA = 0.0;
  var LF_oBA = 0.0;
  var maltPP_beer = 0.0;
  var oAA_beer = 0.0;
  var oAA_wort = 0.0;
  var oBA_beer = 0.0;
  var oBA_wort = 0.0;
  var totalAA0 = 0.0;
  var totalIBUoutput = 0.0;
  var U = 0.0;

  if (SMPH.verbose > 0)
    console.log("\n==========================================================");

  if (SMPH.verbose > 4) {
    console.log("kettle diameter = " + ibu.kettleDiameter.value +
                ", kettle opening = " + ibu.kettleOpening.value);
    console.log("evaporation rate = " + ibu.evaporationRate.value +
              ", post-boil volume = " + ibu.getPostBoilVolume().toFixed(3) +
              ", OG = " + ibu.OG.value);
    console.log("wort loss volume = " + ibu.wortLossVolume.value +
              ", topoff volume = " + ibu.topoffVolume.value);
    console.log("krausen factor = " + ibu.krausen.value);
  }

  // initialize outputs from each hop addition to zero
  if (SMPH.verbose > 0)
    console.log("number of hops additions: " + ibu.add.length);

  // JPH FROM HERE: remove  and be specific about units in comments
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    ibu.add[hopIdx].AA_init = 0.0;       // units: ppm
    ibu.add[hopIdx].AA_dis_mg = 0.0;     // units: mg
    ibu.add[hopIdx].IAA_dis_mg = 0.0;    // units: mg
    ibu.add[hopIdx].IAA_xfer_mg = 0.0;   // units: mg
    ibu.add[hopIdx].IAA_wort = 0.0;      // units: ppm
    ibu.add[hopIdx].IAA_beer = 0.0;      // units: ppm

    ibu.add[hopIdx].oAA_dis_mg = 0.0;    // units: mg
    ibu.add[hopIdx].oAA_wort = 0.0;      // units: ppm
    ibu.add[hopIdx].oAA_beer = 0.0;      // units: ppm

    ibu.add[hopIdx].oBA_dis_mg = 0.0;    // units: mg
    ibu.add[hopIdx].oBA_wort = 0.0;      // units: ppm
    ibu.add[hopIdx].oBA_beer = 0.0;      // units: ppm

    ibu.add[hopIdx].hopPP_dis_mg = 0.0;  // units: mg
    ibu.add[hopIdx].hopPP_wort = 0.0;    // units: ppm
    ibu.add[hopIdx].hopPP_beer = 0.0;    // units: ppm

    ibu.add[hopIdx].tempK = 0.0;
    ibu.add[hopIdx].effectiveSteepTime = 0.0;
    ibu.add[hopIdx].IBU = 0.0;
    ibu.add[hopIdx].U = 0.0;

    if (SMPH.verbose > 0) {
      console.log("  addition " + Number(hopIdx+1) + ": AA=" +
                ibu.add[hopIdx].AA.value +
                ", weight=" + ibu.add[hopIdx].weight.value +
                ", time=" + ibu.add[hopIdx].boilTime.value);
      }
  }

  if (SMPH.verbose > 4) {
    console.log("IBU scaling factor = " + ibu.scalingFactor.value);
    console.log("Use pH : " + ibu.pHCheckbox.value +
                " with " + ibu.preOrPostBoilpH.value + " pH = " + ibu.pH.value);
  }

  // compute concentrations of various compounds in wort during the boil
  // for each hop addition;
  // FCT is the amount of time required for forced cooling
  FCT = compute_concent_wort(ibu);

  // compute concentrations of various compounds in the finished beer
  // for each hop addition, and compute IBUs and utilization for
  // each addition and in total.
  IAA_beer = 0.0;
  oAA_beer = 0.0;
  oBA_beer = 0.0;
  hopPP_beer = 0.0;
  IBU = 0.0;
  totalAA0 = 0.0;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    IAA_beer += compute_IAA_beer(ibu, hopIdx);
    oAA_beer += compute_oAA_beer(ibu, hopIdx);
    oBA_beer += compute_oBA_beer(ibu, hopIdx);
    hopPP_beer += compute_hopPP_beer(ibu, hopIdx);
    IBU += compute_hop_IBU(ibu, hopIdx);
    totalAA0 += ibu.add[hopIdx].AA_init;
    }

  // compute malt polyphenol contribution to IBUs
  maltPP_beer = compute_maltPP_beer(ibu);
  IBU += (51.2/69.68) * maltPP_beer;

  // print info to console
  if (SMPH.verbose > 2) {
    console.log(">>>> FINAL:");
    console.log("UNSCALED IAA = " + IAA_beer.toFixed(3) +
              ", oAA = " + oAA_beer.toFixed(3) +
              ", oBA = " + oBA_beer.toFixed(3) +
              ", hopPP = " + hopPP_beer.toFixed(3) +
              ", maltPP = " + maltPP_beer.toFixed(3))
    console.log("  SCALED IAA = " + IAA_beer.toFixed(3) +
              ", oAA = " + (oAA_beer*SMPH.scale_oAA).toFixed(3) +
              ", oBA = " + (oBA_beer*SMPH.scale_oBA).toFixed(3) +
              ", hopPP = " + (hopPP_beer*SMPH.scale_hopPP).toFixed(3) +
              ", maltPP = " + maltPP_beer.toFixed(3))
    console.log("IBU = " + IBU.toFixed(3));
  }

  // set output variables in ibu structure
  if (totalAA0 > 0)
    U = IAA_beer / totalAA0;
  else
    U = 0.0;
  ibu.IBU = IBU * ibu.scalingFactor.value;
  ibu.AA = totalAA0;
  ibu.IAA = IAA_beer;
  ibu.U = U * ibu.scalingFactor.value;
  ibu.IAApercent = ((51.2 / 69.68) * IAA_beer) / IBU;
  ibu.oAA = oAA_beer * SMPH.scale_oAA;
  ibu.oBA = oBA_beer * SMPH.scale_oBA;
  ibu.hopPP = hopPP_beer * SMPH.scale_hopPP;
  ibu.maltPP = maltPP_beer;
  ibu.FCT = FCT;

  if (SMPH.verbose > 0) {
    console.log("IBU = " + ibu.IBU.toFixed(2) + ", U = " + ibu.U.toFixed(3) +
                ", [IAA] = " + IAA_beer.toFixed(3) +
                ", [AA] = " + totalAA0.toFixed(3) +
                ", IAA% = " + ibu.IAApercent.toFixed(3));
    }

  // set output values in HTML
  // if no IBU outputs exist (no table yet), then just return
  if (document.getElementById("addIBUvalue1")) {
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      idxP1 = hopIdx + 1;
      addIBUoutput = ibu.add[hopIdx].IBU.toFixed(2);
      document.getElementById('addIBUvalue'+idxP1).innerHTML = addIBUoutput;

      addUtilOutput = (ibu.add[hopIdx].U * 100.0).toFixed(2);
      document.getElementById('addUtilValue'+idxP1).innerHTML = addUtilOutput;
    }
  }

  if (document.getElementById("resultsIBU1")) {
    document.getElementById('resultsIBU1').innerHTML = ibu.IBU.toFixed(2);
  }

  if (document.getElementById("totalIBUvalue")) {
    totalIBUoutput = ibu.IBU.toFixed(2);
    document.getElementById('totalIBUvalue').innerHTML = totalIBUoutput;
  }

  if (SMPH.verbose > 0) {
    console.log("----------------------------------------------");
  }
}


//==============================================================================
// IAA

//------------------------------------------------------------------------------
// Rate Factors (RF) for IAA

//------------------------------------------------------------------------------
// Compute rate factor for IAA based on pH

function compute_RF_IAA_pH(ibu) {
  var pH = ibu.pH.value;
  var preBoilpH = 0.0;
  var preOrPostBoilpH = ibu.preOrPostBoilpH.value;
  var RF_pH = 1.0;

  if (ibu.pHCheckbox.value) {
    // If pre-boil pH, estimate the post-boil pH which is the
    // one we want to base losses on.  Estimate that the pH drops by
    // about 0.1 units per hour... this is a ballpark estimate.
    if (preOrPostBoilpH == "preBoilpH") {
      preBoilpH = pH;
      pH = preBoilpH - (ibu.boilTime.value * 0.10 / 60.0);
    }

    // formula from blog post 'The Effect of pH on Utilization and IBUs'
    RF_pH = (0.071 * pH) + 0.592;
    if (SMPH.verbose > 5) {
      console.log("pH = " + pH + ", RF for IAA = " + RF_pH.toFixed(4));
    }
  }

  return RF_pH;
}

//------------------------------------------------------------------------------
// Compute IAA rate factor (RF).
// Currently, only the pH affects the IAA rate factor.
// (Temperature and time affect rate of IAA production, but not as an
// adjustment factor)

function compute_RF_IAA(ibu) {
  var RF_IAA = 1.0;

  RF_IAA = compute_RF_IAA_pH(ibu);
  if (SMPH.verbose > 3) {
    console.log("IAA RF : " + RF_IAA.toFixed(4));
  }

  return RF_IAA;
}

//------------------------------------------------------------------------------
// Loss Factors (LF) for IAA

//------------------------------------------------------------------------------
// Compute IAA loss factor (LF) for gravity using Noonan's data,
// given original gravity

function compute_LF_OG_Noonan(ibu) {
  var LF_OG = 0.0;

  if (ibu.OG.value <= 1.045) {
    LF_OG = 1.0;
  } else {
    LF_OG = (-4.944 * ibu.OG.value) + 6.166;
  }
  return LF_OG;
}

//------------------------------------------------------------------------------
// Compute IAA loss factor (LF) for gravity using my data,
// given original gravity

function compute_LF_OG_SMPH(ibu, hopIdx) {
  var LF_OG = 0.0;
  var t = ibu.add[hopIdx].effectiveSteepTime;
  var OG = ibu.OG.value;
  var effectOfTime = 0.0;
  var timeScale = 3.359;
  var slope = 0.0;

  // OGtimeScale can be used to adjust the effect of time on loss due to gravity
  // OLDER formula:
  // effectOfTime = (timeScale * (1.0 - Math.exp(-0.02278 * t))) + 2.30;
  // LF_OG = 1.0 - 2.0*Math.exp(-1.0/(effectOfTime*(OG-1.0)));

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

  // console.log("OG = " + OG.toFixed(4) + ", time = " + t.toFixed(2) + 
              // " -> loss factor " + LF_OG.toFixed(4));

  return LF_OG;
}

//------------------------------------------------------------------------------
// Compute IAA loss factor (LF) given the form of the hops ("looseCones",
// "baggedCones", "pellets", "extract")
// JPH DEBUG: this should be specific to each hop addition.
// JPH DEBUG: need to figure out if pellets affect IAA or nonIAA

// function compute_LF_form(ibu) {
//   var LF_hopForm = 0.0;
//
//   LF_hopForm = 1.0; // baseline: "extract", as used by Malowicki
//
//   if (ibu.hopForm.value == "looseCones" ||
//       ibu.hopForm.value == "baggedCones") {
//     LF_hopForm *= SMPH.hop_nonExtract;
//   }
//   if (ibu.hopForm.value == "baggedCones") {
//     LF_hopForm *= SMPH.hop_baggingFactor;
//   }
//   if (ibu.hopForm.value == "pellets") {
//     LF_hopForm *= SMPH.hop_pelletFactor;
//   }
//   return LF_hopForm;
// }

//------------------------------------------------------------------------------
// Compute IAA loss factor (LF) for fermentation, given amount of flocculation

function compute_LF_ferment(ibu) {
  var LF_ferment = 0.0;
  var LF_flocculation = 0.0;

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
// Compute IAA loss factor (LF) for packaging (filtering and age of the beer)

function compute_LF_package(ibu) {
  var beerAge_weeks = 0.0;
  var LF_age = 0.0;
  var LF_filtering = 0.0;
  var LF_package = 0.0;

  LF_filtering = 1.0;
  LF_age = 1.0;
  if (!isNaN(ibu.filtering.value)) {
    if (ibu.filtering.value >= 0 && ibu.filtering.value < 3.83) {
      // formula based on Fix & Fix page 129 Table 5.5
      LF_filtering = (0.017 * ibu.filtering.value) + 0.934
    }
  }

  // Loss based on exponential fit to first 13 weeks of data; after 15 weeks,
  // losses seem to stabilize.
  // This is an average of IAA and nonIAA losses, but doesn't include maltPP
  // Formula from blog post 'Four Experiments on Alpha Acid Utilization and IBUs
  // this assumes equal losses for IAA and nonIAA; pellets vs cones
  // experiment #5 found that over 10 weeks IAA decayed by a factor
  // of 0.88 and nonIAA decayed by a factor of 0.74.
  beerAge_weeks = ibu.beerAge_days.value / 7.0;
  if (beerAge_weeks > 15.0) {
    beerAge_weeks = 15.0;
  }
  LF_age = 0.35 * Math.exp(-0.073 * beerAge_weeks) + 0.65;

  LF_package = LF_filtering * LF_age;
  if (SMPH.verbose > 5) {
    console.log("LF package : " + LF_package.toFixed(4));
  }
  return LF_package;
}

// -----------------------------------------------------------------------------
// compute loss factor for IAA components caused by krausen loss

function compute_LF_IAA_krausen(ibu) {
  var description = ibu.krausen.value;
  var LF_krausen = 1.0;
  var OG = 0.0;
  var pts = 0.0;
  var scale = 0.0;

  LF_krausen = ibu.getKrausenValue(description);

  return LF_krausen;
}

//------------------------------------------------------------------------------
// Compute overall loss factor (LF) for IAA, given loss factors caused by
// the boil, gravity, fermentation, flocculation, filtering, and age of beer.

function compute_LF_IAA(ibu, hopIdx) {
  var LF_IAA = 0.0;

  if (SMPH.verbose > 4) {
    console.log("    IAA LF: LF_boil=" + SMPH.LF_boil.toFixed(4) +
              ", LF_ferment=" + compute_LF_ferment(ibu).toFixed(4) +
              ", LF_krausen=" + compute_LF_IAA_krausen(ibu).toFixed(4) +
              ", LF_package=" + compute_LF_package(ibu).toFixed(4));
  }
  LF_IAA = SMPH.LF_boil * compute_LF_OG_SMPH(ibu, hopIdx) * 
           compute_LF_ferment(ibu) * 
           compute_LF_IAA_krausen(ibu) * compute_LF_package(ibu);
  if (SMPH.verbose > 3) {
    console.log("      LF IAA : " + LF_IAA.toFixed(4));
  }
  return LF_IAA;
}

//------------------------------------------------------------------------------
// Compute IAA levels in the finished beer, given IAA concentration in the wort,
// the IAA rate factor, and the IAA loss factor.

function compute_IAA_beer(ibu, hopIdx) {
  var IAA_beer = 0.0;

  ibu.add[hopIdx].IAA_beer = ibu.add[hopIdx].IAA_wort * 
                             compute_LF_IAA(ibu, hopIdx);
  IAA_beer = ibu.add[hopIdx].IAA_beer;

  if (SMPH.verbose > 2) {
    console.log("   IAA addition " + hopIdx + ": [IAA]_wort = " + 
               ibu.add[hopIdx].IAA_wort.toFixed(2) +
              ", IAA_beer = " + ibu.add[hopIdx].IAA_beer.toFixed(4));
    }
  return IAA_beer;
}



//------------------------------------------------------------------------------
// compute concentration of IAA produced during the boil


function compute_concent_wort(ibu) {
  var AA_dis_mg = 0.0;  // dissolved AA, in mg
  var AA_dis = 0.0;     // concentration of dissolved AA
  var AA_init = 0.0;    // [AA]_0
  var AA_init_mg = 0.0; // initial amount of AA added, in mg
  var AA_limit = 0.0;
  var AA_limit_func_A = 0.0;
  var AA_limit_func_A_orig = SMPH.AA_limit_func_A;
  var AA_limit_func_B = 0.0;
  var AA_limit_minLimit = 0.0;
  var AA_limit_minLimit_orig = SMPH.AA_limit_minLimit;
  var AA_percent_wort = 0.0;
  var AA_xfer_mg  = 0.0;
  var additionTime = 0.0;
  var boilTime = ibu.boilTime.value;
  var chillingTime = 0.0;
  var coolingMethod = ibu.forcedDecayType.value;
  var currVolume = 0.0;
  var dAA_dis_mg = 0.0;
  var decayRate = 0.0;
  var dIAA_dis_mg = 0.0;
  var doneHoldTemp = false;
  var expParamC_Kelvin = 0.0;
  var FCT = 0.0; // forced cooling time
  var finalVolume = 0.0;
  var finished = false;
  var holdTemp = ibu.holdTemp.value;
  var holdTempCheckbox = ibu.holdTempCheckbox.value;
  var holdTempCounter = 0.0;
  var holdTempK = 0.0;
  var hopIdx = 0;
  var IAA_wort = 0.0;
  var IAA_dis_mg = 0.0;
  var IAA_dis = 0.0;
  var IAA_xfer_mg = 0.0;
  var initVolume = 0.0;
  var integrationTime = 0.0;
  var isTempDecayLinear = 0;
  var k1 = 0.0;
  var k2 = 0.0;
  var linParamB_Kelvin = 0.0;
  var minLimitTempScale = 0.0;
  var newAA  = 0.0;
  var newIAA = 0.0;
  var postBoilTime = 0.0;
  var postBoilVolume = 0.0;
  var preAdd_AA = 0.0;
  var relRate = 0.0;
  var subBoilEvapRate = 0.0;
  var t = 0.0;
  var tempC = 0.0;
  var tempK = 0.0;
  var tempNoBase = 0.0;
  var topoffScale = 0.0;
  var totalXferTime = 0.0;
  var useSolubilityLimit = ibu.applySolubilityLimitCheckbox.value;
  var volumeChange = 0.0;
  var whirlpoolTime = 0.0;
  var xferRate = 0.0;
  var totalAAcheck = 0.0;
  var totalIAAcheck = 0.0;
  var diff = 0.0;
  var revIdx = 0;
  var stopOnError = 0;
  var RF_IAA = 0.0;
  var relativeTemp = 0.0;
  var relativeTime = 0.0;

  // ---------------------------------------------------------------------------
  // INITIALIZATION

  // determine temperature decay type
  if (ibu.tempDecayType.value == "tempDecayLinear") {
    isTempDecayLinear = 1;
  } else if (ibu.tempDecayType.value == "tempDecayExponential") {
    isTempDecayLinear = 0;
  } else {
    console.log("ERROR: unknown temp decay type: " + ibu.tempDecayType.value);
    isTempDecayLinear = 0;
  }

  if (SMPH.verbose > 4) {
    if (!isTempDecayLinear) {
      console.log("Exponential decay: A=" + ibu.tempExpParamA.value + ", B=" +
                ibu.tempExpParamB.value + ", C=" + ibu.tempExpParamC.value);
    } else {
      console.log("Linear temp decay: A=" + ibu.tempLinParamA.value + ", B=" +
                ibu.tempLinParamB.value);
    }
    console.log("hold temp during hop stand? " + holdTempCheckbox +
                ", hold temp is " + holdTemp.toFixed(4));
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

  // get initial volume from post-boil volume, evaporation rate, and boil time
  postBoilVolume = ibu.getPostBoilVolume();
  initVolume = postBoilVolume + (ibu.evaporationRate.value/60.0 * boilTime);
  if (SMPH.verbose > 3) {
    console.log("volume at start of boil = " +
              postBoilVolume.toFixed(3) + " + (" + ibu.evaporationRate.value +
              "/60.0 * " + boilTime + ") = " + initVolume.toFixed(3));
    }

  // get rate factor for production of IAA
  RF_IAA = compute_RF_IAA(ibu);

  // initialize some variables
  tempK = ibu.boilTemp.value + 273.15;
  tempC = common.convertKelvinToCelsius(tempK);
  k1 = 7.9*Math.pow(10.0,11.0)*Math.exp(-11858.0/tempK);
  k2 = 4.1*Math.pow(10.0,12.0)*Math.exp(-12994.0/tempK);
  if (SMPH.verbose > 3) {
    console.log("at temp " + tempC.toFixed(2)+ ": k1 = " +
                k1.toFixed(5) + ", k2 = " + k2.toFixed(5));
  }

  integrationTime = 120.0;  // just in case SMPH.integrationTime is not defined
  if (SMPH.integrationTime) {
    integrationTime = SMPH.integrationTime; // minutes
  }
  holdTempK = common.convertCelsiusToKelvin(holdTemp);
  if (!holdTempCheckbox) holdTempK = 0.0; // 'Kelvin

  // make sure that boil time doesn't have higher precision than integ. time
  if (common.getPrecision("" + boilTime) > 2) {
    boilTime = Number(boilTime.toFixed(2));
  }

  volumeChange = xferRate * integrationTime;  // for counterflow chiller
  expParamC_Kelvin = common.convertCelsiusToKelvin(ibu.tempExpParamC.value);
  linParamB_Kelvin = common.convertCelsiusToKelvin(ibu.tempLinParamB.value);

  // ---------------------------------------------------------------------------
  // PROCESS EACH TIME POINT

  // loop over each time point, from maximum time down until no more utilization
  // first, set initial values at start of boil
  finished = false;
  currVolume = initVolume;
  holdTempCounter = 0.0;
  whirlpoolTime = ibu.whirlpoolTime.value;
  totalXferTime = 0.0;
  AA_dis_mg = 0.0; // mg of AA dissolved, not ppm to account for volume changes
  IAA_dis_mg= 0.0; // mg of IAA dissolved, not ppm to account for volume changes
  AA_xfer_mg  = 0.0; // mg of AA transferred (and cooled) via counterflow
  IAA_xfer_mg = 0.0; // mg of IAA transferred via counterflow

  for (t = boilTime; finished == false; t = t - integrationTime) {

    // -------------------------------------------------------------------------
    // adjust (as needed) temperature, whirlpool time, and volume during
    // counterflow. Also, check if done yet based on temp, time, and volume.

    // if post boil (t <= 0), then adjust temperature and degree of utilization
    // and if counterflow chiller and doing whirlpool, reduce volume of wort
    if (t <= 0) {
      postBoilTime = t * -1.0;
      if (postBoilTime == whirlpoolTime && SMPH.verbose > 0) {
        console.log("---- starting use of " + coolingMethod + " chiller ---");
      }

      // if counterflow or not yet done with whirlpool, get temp from cooling fn
      if ((coolingMethod == "forcedDecayCounterflow" ||
           postBoilTime < whirlpoolTime) &&
           (!holdTempCheckbox || (holdTempCheckbox && doneHoldTemp))) {
        if (!isTempDecayLinear) {
          tempK = (ibu.tempExpParamA.value *
                     Math.exp(-1.0 * ibu.tempExpParamB.value * postBoilTime)) +
                     expParamC_Kelvin;
        } else {
          tempK = (ibu.tempLinParamA.value * postBoilTime) + linParamB_Kelvin;
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
        // however, if tempExpParamA = 0, B = 0, and C < holdTemp('C), this
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
        if (holdTempCounter > whirlpoolTime) {
          doneHoldTemp = true;
          if (SMPH.verbose > 2) {
            console.log("Done with post-boil whirlpool; whirlpool time = " +
                        whirlpoolTime);
          }
        }
      }

      // adjust rate constants based on current temperature
      k1 = 7.9*Math.pow(10.0,11.0)*Math.exp(-11858.0/tempK);
      k2 = 4.1*Math.pow(10.0,12.0)*Math.exp(-12994.0/tempK);

      // stop modeling if temperature is less than minimum for isomerization
      tempC = common.convertKelvinToCelsius(tempK);
      if (tempC < SMPH.immersionMinTempC) {
        finished = true;
      }
      // limit to whirlpool time plus two hours, just to prevent infinite loop
      // (after 2 hours, almost no increase in utilization anyway)
      if (postBoilTime > whirlpoolTime + 120.0) {
        finished = true;
      }

      // if finished whirlpool+stand time, do transfer and reduce volume of
      // wort.  Check if volume reduced to 0, in which case we're done.
      if (coolingMethod == "forcedDecayCounterflow" &&
          postBoilTime >= whirlpoolTime) {
        // keep concentration the same as the wort transfers. therefore,
        // AA_(t-1) / volume_(t-1) = AA_t / volume_t, so
        // AA_t = (AA_(t-1) / volume_(t-1)) * volume_t
        // AA_t = (AA_(t-1) / currVolume) * (currVolume-volumeChange)
        newAA = (AA_dis_mg / currVolume) * (currVolume - volumeChange);
        AA_xfer_mg += AA_dis_mg - newAA;
        AA_dis_mg = newAA;

        newIAA = (IAA_dis_mg / currVolume) * (currVolume - volumeChange);
        IAA_xfer_mg += IAA_dis_mg - newIAA;
        IAA_dis_mg = newIAA;

        if (AA_dis_mg < 0.0)  AA_dis_mg  = 0.0;
        if (IAA_dis_mg < 0.0) IAA_dis_mg = 0.0;

        // adjust AA and IAA levels of each separate addition
        for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
          newAA = (ibu.add[hopIdx].AA_dis_mg / currVolume) *
                  (currVolume - volumeChange);
          ibu.add[hopIdx].AA_dis_mg = newAA;
          newIAA = (ibu.add[hopIdx].IAA_dis_mg / currVolume) *
                   (currVolume - volumeChange);
          ibu.add[hopIdx].IAA_xfer_mg += ibu.add[hopIdx].IAA_dis_mg - newIAA;
          ibu.add[hopIdx].IAA_dis_mg = newIAA;
          if (ibu.add[hopIdx].AA_dis_mg < 0.0) ibu.add[hopIdx].AA_dis_mg = 0.0;
          if (ibu.add[hopIdx].IAA_dis_mg < 0.0) ibu.add[hopIdx].IAA_dis_mg= 0.0;
        }

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

    // Check to see if add any hops at this time point.  Apply AA saturation
    // limit, if needed.
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      additionTime = ibu.add[hopIdx].boilTime.value;
      // make sure that addition time doesn't have higher precision than integ.
      if (common.getPrecision("" + additionTime) > 2) {
        additionTime = Number(additionTime.toFixed(2));
      }
      if (Math.round(t * 1000) == Math.round(additionTime * 1000)) {
        AA_percent_wort = (ibu.add[hopIdx].AA.value / 100.0) *
                           ibu.add[hopIdx].freshnessFactor.value;
        AA_init_mg = AA_percent_wort * ibu.add[hopIdx].weight.value * 1000.0;
        AA_init = AA_init_mg / currVolume;
        ibu.add[hopIdx].AA_init = AA_init;
        ibu.add[hopIdx].AA_dis_mg = AA_init_mg;
        ibu.add[hopIdx].effectiveSteepTime = 0.0;

        if (SMPH.verbose > 2) {
          console.log("ADDING HOPS ADDITION " + hopIdx + ":");
          console.log("  AA=" + ibu.add[hopIdx].AA.value + "%, weight=" +
                      ibu.add[hopIdx].weight.value.toFixed(3) + " grams " +
                      " and [AA]_init = " + AA_init.toFixed(2));
          console.log("  at time " + t.toFixed(2) +
                    " with volume " + currVolume.toFixed(3) +
                    ", adding AA " + AA_init_mg.toFixed(3) +
                    " (mg) to existing AA = " + AA_dis_mg.toFixed(3) + " (mg)");
        }
        preAdd_AA = AA_dis_mg;
        AA_dis_mg += AA_init_mg;

        // if use solubility limit, see if we need to change AA concentration
        if (useSolubilityLimit) {
          AA_limit_func_A = AA_limit_func_A_orig;
          AA_limit_minLimit = AA_limit_minLimit_orig;
          // if add hops at below boiling, lower the solubility limit
          if (tempK < 373.15) {
            // change AA_limit_func_A, AA_limit_minLimit based on temperature
            // so that we hit AA_limit_roomTemp at room temperature, and
            // scale the curve to be between a good curve at room temp and
            // a good curve at boiling.
            // 4910 = computed with AA_limit_minLimit=90ppm at 20'C and AA
            //       limit of 120 at 200 ppm and 20'C, estimated from Malowicki.
            AA_limit_func_A = (AA_limit_func_A_orig + 4910.0) * (tempK-293.15) /
                              (373.15 - 293.15);
            minLimitTempScale = -1.0*(AA_limit_minLimit-SMPH.AA_limit_roomTemp)/
                                     (373.15-293.15);
            AA_limit_minLimit = AA_limit_minLimit +
                                     (minLimitTempScale*(373.15-tempK));
            if (SMPH.verbose > 2) {
              console.log("   change due to low temp " + tempK.toFixed(4) +
                    ": AA_limit_func_A = " + AA_limit_func_A.toFixed(4) +
                    ", minLimitTempScale = " + minLimitTempScale.toFixed(4) +
                    ", AA_limit_minLimit = " + AA_limit_minLimit.toFixed(4));
            }
          }
          AA_limit_func_B = (-1.0 * AA_limit_func_A / AA_limit_minLimit) +
                                                      AA_limit_minLimit;
          AA_dis = AA_dis_mg / currVolume;
          AA_limit = (AA_limit_func_A / (AA_dis)) + AA_limit_func_B;
          if (AA_limit < AA_limit_minLimit) {
            AA_limit = AA_limit_minLimit;
          }

          if (SMPH.verbose > 2) {
            console.log("    AA_limit = " + AA_limit.toFixed(4) + " = " +
                  AA_limit_func_A.toFixed(4) + "/" + AA_dis.toFixed(4) +
                  " + " + AA_limit_func_B.toFixed(4) + 
                  " or AA_minLimit " + AA_limit_minLimit.toFixed(4));
          }


          if (AA_dis > AA_limit) {
            AA_dis_mg = AA_limit * currVolume;
            AA_dis = AA_limit;
          }

          // get dissolved AA in mg for this addition of hops
          ibu.add[hopIdx].AA_dis_mg = AA_dis_mg - preAdd_AA;

          // AA_dis_mg can be negative. If already above saturation limit and
          // add a smaller amount of AA than previous addition, then
          // AA_dis_mg can be (before adjustment) smaller than it was
          // in the previous adjustment, which lowers AA_limit, which
          // lowers the adjusted AA concentration, which makes AA_dis_mg 
          // negative.  The easiest solution is to move this negative 
          // amount into the previous hop addition(s).
          if (ibu.add[hopIdx].AA_dis_mg < 0) {
            console.log("Info: correcting negative [AA] = " + 
                        ibu.add[hopIdx].AA_dis_mg.toFixed(4));
            diff = ibu.add[hopIdx].AA_dis_mg;
            for (revIdx = hopIdx-1; revIdx >= 0; revIdx--) {
              // account for negative [AA] by adjusting previous addition
              ibu.add[revIdx+1].AA_dis_mg = 0.0;
              ibu.add[revIdx].AA_dis_mg += diff;
              if (ibu.add[revIdx].AA_dis_mg > 0) {
                break;
              }
              diff = ibu.add[revIdx].AA_dis_mg;
            }
            if (revIdx < 0) {
              console.log("Warning: can't correct negative [AA]: " + diff);
            }
          }

          // keep record of initial concentration of dissolved alpha acids
          ibu.add[hopIdx].AA_init_dis_mg = ibu.add[hopIdx].AA_dis_mg;

          if (SMPH.verbose > 2) {
            console.log("    [AA]_init = " + AA_init.toFixed(4) +
                        ", [AA]_limit = " + AA_limit.toFixed(4) +
                        " at " + tempC.toFixed(2) +
                        "'C, [AA]_dissolved = "+ AA_dis.toFixed(4));
          }
        } // use solubility limit?

        // record the temperature at which hops were added, for later
        // oAA and oBA estimates
        ibu.add[hopIdx].tempK = tempK;

        // compute mg of oAA added with this hop addition
        compute_oAA_dis_mg(ibu, hopIdx, currVolume);

        // compute mg of oBA added with this hop addition
        compute_oBA_dis_mg(ibu, hopIdx);

        // compute mg of PP added with this hop addition
        compute_hopPP_dis_mg(ibu, hopIdx);

      } // check for hop addition at this time
    } // evaluate all hop additions


    // -------------------------------------------------------------------------
    // change concentrations of dissolved AA and dissolved IAA

    // decrease levels of dissolved AA via conversion to IAA
    dAA_dis_mg = -1.0 * k1 * AA_dis_mg;
    AA_dis_mg = AA_dis_mg + (dAA_dis_mg * integrationTime);
    if (AA_dis_mg < 0.0) AA_dis_mg = 0.0;

    // change levels of dissolved IAA
    dIAA_dis_mg = (k1 * AA_dis_mg) - (k2 * IAA_dis_mg);
    IAA_dis_mg = IAA_dis_mg + (dIAA_dis_mg * integrationTime);
    if (IAA_dis_mg < 0.0) IAA_dis_mg = 0.0;

    // compute AA and IAA levels for each separate addition
    totalAAcheck = 0.0;
    totalIAAcheck = 0.0;
    // console.log("validate " + AA_dis_mg.toFixed(4));
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      dAA_dis_mg = -1.0 * k1 * ibu.add[hopIdx].AA_dis_mg;
      ibu.add[hopIdx].AA_dis_mg += dAA_dis_mg * integrationTime;
      if (ibu.add[hopIdx].AA_dis_mg < 0.0) ibu.add[hopIdx].AA_dis_mg = 0.0;
      dIAA_dis_mg = (k1 * ibu.add[hopIdx].AA_dis_mg) -
                 (k2 * ibu.add[hopIdx].IAA_dis_mg);
      ibu.add[hopIdx].IAA_dis_mg += dIAA_dis_mg * integrationTime;
      if (ibu.add[hopIdx].IAA_dis_mg < 0.0) ibu.add[hopIdx].IAA_dis_mg = 0.0;
      totalAAcheck += ibu.add[hopIdx].AA_dis_mg;
      totalIAAcheck += ibu.add[hopIdx].IAA_dis_mg;
      // console.log("     add " + hopIdx + ": AA = " + ibu.add[hopIdx].AA_dis_mg.toFixed(4) + 
                  // ", total = " + totalAAcheck.toFixed(4));
      // use IAA relative temp as proxy for everything happening at each temp.
      relativeTemp = 2.39 * Math.pow(10.0,11) * Math.exp(-9773.0/tempK);
      if (relativeTemp > 1.0) relativeTemp = 1.0;
      if (relativeTemp < 0.0) relativeTemp = 0.0;
      ibu.add[hopIdx].effectiveSteepTime += relativeTemp * integrationTime;
    }

    if (stopOnError) {
      if (AA_dis_mg.toFixed(4) != totalAAcheck.toFixed(4)) {
        console.log("AA Error: " + AA_dis_mg.toFixed(4) + 
                    " != " + totalAAcheck.toFixed(4));
        sdfkj;
        }
      if (IAA_dis_mg.toFixed(4) != totalIAAcheck.toFixed(4)) {
        console.log("IAA Error: " + IAA_dis_mg.toFixed(4) + 
                    " != " + totalIAAcheck.toFixed(4));
        sdfkj;
        }
      }

    // every 5 minutes, print out some information to the console
    if (SMPH.verbose > 3 && Math.round(t * 1000) % 5000 == 0) {
      AA_dis  = AA_dis_mg  / currVolume;
      IAA_dis = IAA_dis_mg / currVolume;
      console.log("time = " + t.toFixed(3));
      console.log("       temp = " + tempC.toFixed(2));
      console.log("       volume = " + currVolume.toFixed(4));
      console.log("       AA = " + AA_dis.toFixed(4) + " ppm " +
                          "with delta " + dAA_dis_mg.toFixed(6) + " mg/min");
      console.log("       IAA = " + IAA_dis.toFixed(4) + " ppm " +
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
      relRate = (0.0243 * Math.exp(0.0502 * 100.0)) / ibu.evaporationRate.value;
      subBoilEvapRate = relRate* 0.0243 * Math.exp(0.0502 * tempC); // liters/hr
      currVolume -= subBoilEvapRate/60.0 * integrationTime;
    }

    // prevent floating-point drift in 'time' variable
    t = Number(t.toFixed(4));
  }

  // ---------------------------------------------------------------------------
  // FINALIZE

  // adjust IAA based on IAA rate factor
  IAA_dis_mg *= RF_IAA;
  IAA_xfer_mg *= RF_IAA;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    ibu.add[hopIdx].IAA_dis_mg *= RF_IAA;
    ibu.add[hopIdx].IAA_xfer_mg *= RF_IAA;
  }

  // compute forced cooling time (FCT)
  FCT = (-1.0 * t) - whirlpoolTime;

  // adjust amount of dissolved material based on wort/trub loss and 
  // topoff volume added
  finalVolume = postBoilVolume;
  if (ibu.wortLossVolume.value > 0) {
    // if wort loss after boil, adjust final volume and final mg of IAA,
    // oAA, oBA, PP, keeping overall concentrations the same
    finalVolume = postBoilVolume - ibu.wortLossVolume.value;
    IAA_dis_mg *= (1.0 - (ibu.wortLossVolume.value / postBoilVolume));
    console.log("FINAL VOL = " + postBoilVolume.toFixed(4) + " minus loss " +
                ibu.wortLossVolume.value.toFixed(4));
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      ibu.add[hopIdx].IAA_dis_mg *=
          (1.0 - (ibu.wortLossVolume.value / postBoilVolume));
      ibu.add[hopIdx].oAA_dis_mg *=
          (1.0 - (ibu.wortLossVolume.value / postBoilVolume));
      ibu.add[hopIdx].oBA_dis_mg *=
          (1.0 - (ibu.wortLossVolume.value / postBoilVolume));
      ibu.add[hopIdx].hopPP_dis_mg *=
          (1.0 - (ibu.wortLossVolume.value / postBoilVolume));
    }
  }
  if (finalVolume > 0) {
    topoffScale = finalVolume / (finalVolume + ibu.topoffVolume.value);
  } else {
    topoffScale = 0.0;
    finalVolume = 0.01; // prevent division by zero
  }

  IAA_wort = (IAA_dis_mg + IAA_xfer_mg) / finalVolume;
  if (SMPH.verbose > 3) {
    console.log("before topoff, IAA = " + IAA_wort.toFixed(4) +
                ", scaling = " + topoffScale);
    console.log("IAA = " + IAA_dis_mg.toFixed(4) +
                ", vol = " + finalVolume.toFixed(4));
    }
  IAA_wort *= topoffScale;

  // for each addition, compute IAA concentration in wort that includes
  // both IAA dissolved in the wort in the kettle and IAA that were
  // transferred out of the kettle.  Then normalize by volume and topoffScale.
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    ibu.add[hopIdx].IAA_wort =
      ((ibu.add[hopIdx].IAA_dis_mg + ibu.add[hopIdx].IAA_xfer_mg)/finalVolume) *
       topoffScale;
    ibu.add[hopIdx].oAA_wort = ibu.add[hopIdx].oAA_dis_mg / finalVolume;
    ibu.add[hopIdx].oBA_wort = ibu.add[hopIdx].oBA_dis_mg / finalVolume;
    ibu.add[hopIdx].hopPP_wort = ibu.add[hopIdx].hopPP_dis_mg/finalVolume;
    if (SMPH.verbose > 0) {
      console.log("  addition " + hopIdx + " has [IAA]=" +
                ibu.add[hopIdx].IAA_wort.toFixed(4) + " ppm, [oAA]=" + 
                ibu.add[hopIdx].oAA_wort.toFixed(4) + " ppm, [oBA]=" + 
                ibu.add[hopIdx].oBA_wort.toFixed(4) + " ppm, [PP]=" +
                ibu.add[hopIdx].hopPP_wort.toFixed(4));
    }
  }


  // print out summary information to console when done
  if (SMPH.verbose > 0) {
    console.log(" >> forced cooling time = " + FCT.toFixed(2));
    console.log(" >> temperature at end = " + tempC.toFixed(2) + "'C after ");
    if (coolingMethod == "forcedDecayCounterflow") {
      console.log("     transfer time " + totalXferTime.toFixed(2) + " min");
    } else {
      chillingTime = -1 * (t + whirlpoolTime);
      console.log("     time after flameout = " + (-1*t).toFixed(3) +
                  " (whirlpool = " + whirlpoolTime +
                  " min, chilling time " + chillingTime.toFixed(2) + " min)");
    }
    console.log(">>> IAA in wort = " + IAA_wort.toFixed(4));
  }

  return FCT;
}

//==============================================================================
// Auxiliary Bittering Compounds (nonIAA)

// -----------------------------------------------------------------------------
// compute loss factor for nonIAA based on pH

function compute_LF_nonIAA_pH(ibu) {
  var LF_pH = 1.0;
  var pH = ibu.pH.value;
  var preBoilpH = 0.0;
  var preOrPostBoilpH = ibu.preOrPostBoilpH.value;

  if (ibu.pHCheckbox.value) {
    // If pre-boil pH, estimate the post-boil pH which is the
    // one we want to base losses on.  Estimate that the pH drops by
    // about 0.1 units per hour... this is a ballpark estimate.
    if (preOrPostBoilpH == "preBoilpH") {
      if (SMPH.verbose > 3) {
        console.log("mapping pre-boil pH to post-boil pH");
      }
      preBoilpH = pH;
      pH = preBoilpH - (ibu.boilTime.value * 0.10 / 60.0);
    }

    // formula from blog post 'The Effect of pH on Utilization and IBUs'
    LF_pH = (0.8948 * pH) - 4.145;
    if (SMPH.verbose > 5) {
      console.log("pH = " + pH + ", LF for nonIAA = " + LF_pH.toFixed(4));
    }
  }

  return LF_pH;
}

// -----------------------------------------------------------------------------
// compute loss factor for nonIAA components caused by krausen loss

function compute_LF_nonIAA_krausen(ibu) {
  var IAA_krausen_loss_factor = 1.0;
  var IAA_krausen_loss = 0.0;
  var nonIAA_krausen_loss = 0.0;
  // OG exp #1, #2 : see beer64/analyze.tcl
  var nonIaaKrausenFactor = 3.0; // krausen exp = 2.97, OG exp #1&#2 = 3.13
  var LF_krausen = 1.0;
  var OG = 0.0;
  var pts = 0.0;
  var scale = 0.0;

  IAA_krausen_loss_factor = ibu.getKrausenValue(ibu.krausen.value);

  IAA_krausen_loss = (1.0 - IAA_krausen_loss_factor); // in percent
  nonIAA_krausen_loss = IAA_krausen_loss * nonIaaKrausenFactor;
  LF_krausen = (1.0 - nonIAA_krausen_loss);
  // console.log("krausen loss factor, nonIAA: " + LF_krausen);

  if (SMPH.verbose > 5) {
    console.log("KRAUSEN: iaa factor = " + IAA_krausen_loss_factor +
              ", iaa loss = " + IAA_krausen_loss +
              ", nonIAA loss = " + nonIAA_krausen_loss +
              ", nonIAA loss factor = " + LF_krausen);
  }

  return LF_krausen;
}

// -----------------------------------------------------------------------------
// compute temperature at IBU addition, relative to boiling

function compute_relativeTemp(ibu, hopIdx) {
  var relativeTemp = 0.0;

  relativeTemp = 0.0;
  if (!ibu.add[hopIdx].tempK) {
    console.log("ERROR: temperature at hop addition not known; assuming RT");
    return relativeTemp;
  }

  // Teamaker results at 100'C and 80'C suggest nonIAA similar to 
  // temperature effect with isomerized alpha acids
  // but Util Exp #4 says that this estimate is incorrect.
  if (1) {
    // 80'C = relative temp of 0.722.  why??
    var tempC = 0.0;
    // var relAt80 = 0.722;
    // relAt80 = 0.444; // from Teamaker experiment comparing 80'C and 100'C
    // relAt80 = 0.90;  // gives best results on training data
    var relAt80 = SMPH.relTempAt80_nonIAA;
    tempC = ibu.add[hopIdx].tempK - 273.15;
    relativeTemp = ((tempC - 80.0)*(1.0 - relAt80)/(100.0 - 80.0)) + relAt80;
    } else {
    relativeTemp = 2.39 * Math.pow(10.0,11) * 
                   Math.exp(-9773.0/ibu.add[hopIdx].tempK);
    }
  if (relativeTemp > 1.0) relativeTemp = 1.0;
  if (relativeTemp < 0.0) relativeTemp = 0.0;

  if (SMPH.verbose > 3) {
    console.log("    relative temp: " + relativeTemp.toFixed(4));
  }
  return relativeTemp;
}

// ----------- oAA -------------------------------------------------------------

function compute_oAA_dis_mg(ibu, hopIdx, currVolume) {
  var AAloss_percent = 0.0;
  var k = 0.0;
  var oAA_addition = 0.0;
  var oAA_fresh = 0.0;
  var oAA_percent_boilFactor = 0.0;
  var oAA_percent_init = 0.0;
  var ratio = 0.0;
  var relativeTemp = 0.0;
  var relativeAA = 0.0;

  if (ibu.add[hopIdx].hopForm.value == "pellets") {
    // JPH DEBUG fix this
    oAA_percent_init = -10.0;
    // oAA_percent_init = 0.014;
  } else {
    // k is from Garetz
    ratio = 1.0 - (ibu.add[hopIdx].percentLoss.value / 100.0);
    k = Math.log(1.0 / ratio) / (365.0 / 2.0);
    if (SMPH.verbose > 5) {
      console.log("%loss = " + ibu.add[hopIdx].percentLoss.value.toFixed(2) +
                " and so k = " + k.toFixed(6));
    }
    // oAA_fresh is oAA per weight of hops, modeled as 0.5 days decay at 20C
    // estimate obtained by analysis of Maye paper
    oAA_fresh = 1.0 - (1.0 / Math.exp(k * 1.0 * 1.0 * 0.5));
    AAloss_percent = 1.0 - ibu.add[hopIdx].freshnessFactor.value;
    // 0.022 estimated from analysis of Maye paper; see oAA.tcl
    oAA_percent_init = (AAloss_percent * SMPH.oAA_storageFactor) + oAA_fresh;
    if (SMPH.verbose > 4) {
      console.log("    [oAA] storage factors: fresh=" + oAA_fresh.toFixed(5) +
                ", loss=" + AAloss_percent.toFixed(5) +
                ", %init=" + oAA_percent_init.toFixed(5));
    }
  }

  relativeTemp = compute_relativeTemp(ibu, hopIdx);
  relativeAA = 0.0;
  if (ibu.add[hopIdx].AA_init > 0.0 && currVolume > 0.0) {
    relativeAA = ibu.add[hopIdx].AA_dis_mg/(ibu.add[hopIdx].AA_init*currVolume);
  }
  // JPH turn on or off oAA solubility limit
  // relativeAA = 1.0;
  // console.log("AA : added = " + (ibu.add[hopIdx].AA_init*currVolume).toFixed(3) + 
              // "mg , dissolved = " + ibu.add[hopIdx].AA_dis_mg.toFixed(3) + 
              // "mg, relative = " + relativeAA.toFixed(3));
  // the AA solubility limit only applies to the oAA produced during the boil
  oAA_percent_boilFactor = (ibu.add[hopIdx].AA.value / 100.0) *
                           ibu.add[hopIdx].freshnessFactor.value *
                           SMPH.oAA_boilFactor * relativeAA * relativeTemp;
  // oAA_addition is oAA added to wort, in mg
  oAA_addition = (oAA_percent_init + oAA_percent_boilFactor) *
                  ibu.add[hopIdx].weight.value * 1000.0;

  // note: solubility limit of oAA is large enough so that all are dissolved
  ibu.add[hopIdx].oAA_dis_mg = oAA_addition;
  if (SMPH.verbose > 3) {
    console.log("    addition " + hopIdx + " [oAA] boil = " + 
                ibu.add[hopIdx].oAA_dis_mg.toFixed(4));
  }

  return;
}

// -----------------------------------------------------------------------------
// compute loss factor (LF) for oxidized alpha acids (oAA), using
// overall loss factor for OG (big assumption), 
// non-IAA loss factor for pH, overall loss factor for fermentation,
// non-IAA loss factor for krausen, 
// overall loss factor for packaging,
// and an oAA-specific relative scaling factor.  Maximum value is 1.0 (no loss)

function compute_LF_oAA(ibu, hopIdx) {
  var LF_oAA = 0.0;

  LF_oAA = SMPH.LF_boil * compute_LF_nonIAA_pH(ibu) *
           compute_LF_OG_SMPH(ibu, hopIdx) * 
           compute_LF_ferment(ibu) * 
           compute_LF_nonIAA_krausen(ibu) * 
           compute_LF_package(ibu) * SMPH.scale_oAAloss;
  if (LF_oAA > 1.0) LF_oAA = 1.0;
  if (SMPH.verbose > 3) {
    console.log("    LF oAA " + LF_oAA.toFixed(4));
  }
  return(LF_oAA);
}

// -----------------------------------------------------------------------------
// compute concentration of oxidized alpha acids (oAA) in finished beer,
// given oAA concentration and oAA loss factors.

function compute_oAA_beer(ibu, hopIdx) {
  var oAA_beer = 0.0;

  ibu.add[hopIdx].oAA_beer = ibu.add[hopIdx].oAA_wort * 
                             compute_LF_oAA(ibu, hopIdx);
  oAA_beer = ibu.add[hopIdx].oAA_beer;

  if (SMPH.verbose > 3) {
    console.log("    oAA in finished beer = " + oAA_beer.toFixed(4));
  }
  return(oAA_beer);
}

// -----------------------------------------------------------------------------
// ----------- oBA -------------------------------------------------------------

function compute_oBA_dis_mg(ibu, hopIdx) {
  var BAloss_percent = 0.0;
  var k = 0.0;
  var oBA_addition = 0.0;
  var oBA_fresh = 0.0;
  var oBA_percent_boilFactor = 0.0;
  var oBA_percent_init = 0.0;
  var ratio = 0.0;
  var relativeTemp = 0.0;

  if (ibu.add[hopIdx].hopForm.value == "pellets") {
    // JPH DEBUG fix this
    oBA_percent_init = -10.0;
    // oBA_percent_init = 0.014;
  } else {
    // k is from Garetz
    ratio = 1.0 - (ibu.add[hopIdx].percentLoss.value / 100.0);
    k = Math.log(1.0 / ratio) / (365.0 / 2.0);
    if (SMPH.verbose > 5) {
      console.log("%loss = " + ibu.add[hopIdx].percentLoss.value.toFixed(2) +
                " and so k = " + k.toFixed(6));
    }
    // oBA_fresh is oBA per weight of hops, modeled as 0.5 days decay at 20C
    // estimate obtained by analysis of Maye paper
    oBA_fresh = 1.0 - (1.0 / Math.exp(k * 1.0 * 1.0 * 0.5));
    BAloss_percent = 1.0 - ibu.add[hopIdx].freshnessFactor.value;
    // 0.022 estimated from analysis of Maye paper; see oAA.tcl
    oBA_percent_init = (BAloss_percent * SMPH.oBA_storageFactor) + oBA_fresh;
    if (SMPH.verbose > 4) {
      console.log("    [oBA] storage factors: fresh=" + oBA_fresh.toFixed(5) +
                ", loss=" + BAloss_percent.toFixed(5) +
                ", %init=" + oBA_percent_init.toFixed(5));
    }
  }

  relativeTemp = compute_relativeTemp(ibu, hopIdx);
  oBA_percent_boilFactor = (ibu.add[hopIdx].BA.value / 100.0) *
                           ibu.add[hopIdx].freshnessFactor.value *
                           SMPH.oBA_boilFactor * relativeTemp;
  // oBA_addition is oBA added to wort, in mg
  oBA_addition = (oBA_percent_init + oBA_percent_boilFactor) *
                  ibu.add[hopIdx].weight.value * 1000.0;

  // note: solubility limit of oBA is large enough so that all are dissolved
  ibu.add[hopIdx].oBA_dis_mg = oBA_addition;
  if (SMPH.verbose > 3) {
    console.log("    addition " + hopIdx + " [oBA] boil = " + 
                ibu.add[hopIdx].oBA_dis_mg.toFixed(4));
  }

  return;
}

// -----------------------------------------------------------------------------
// compute loss factor (LF) for oxidized beta acids (oBA), using
// loss factor for IAA, non-IAA loss factor for pH, and an oBA-specific
// relative scaling factor.  Maximum value is 1.0 (no loss)

function compute_LF_oBA(ibu, hopIdx) {
  var LF_oBA = 0.0;

  LF_oBA = SMPH.LF_boil * compute_LF_nonIAA_pH(ibu) *
           compute_LF_OG_SMPH(ibu, hopIdx) * 
           compute_LF_ferment(ibu) * 
           compute_LF_nonIAA_krausen(ibu) * 
           compute_LF_package(ibu) * SMPH.scale_oBAloss;

  if (LF_oBA > 1.0) LF_oBA = 1.0;
  if (SMPH.verbose > 3) {
    console.log("    LF oBA = " + LF_oBA.toFixed(4));
  }
  return(LF_oBA);
}

// -----------------------------------------------------------------------------
// compute concentration of oxidized beta acids (oBA) in finished beer,
// given oBA concentration and oBA loss factors.

function compute_oBA_beer(ibu, hopIdx) {
  var oBA_beer = 0.0;
  var LF_oBA = 0.0;

  ibu.add[hopIdx].oBA_beer = ibu.add[hopIdx].oBA_wort *
                  compute_LF_oBA(ibu, hopIdx);
  oBA_beer = ibu.add[hopIdx].oBA_beer;

  if (SMPH.verbose > 3) {
    console.log("    [oBA] in finished beer = " + oBA_beer.toFixed(4));
  }
  return(oBA_beer);
}

// -----------------------------------------------------------------------------
// ------------------ PP -------------------------------------------------------
// compute concentration of hop and malt polyphenols in wort 

function compute_hopPP_dis_mg(ibu, hopIdx) {
  // assume very high solubility limit for PP, so each addition is additive
  ibu.add[hopIdx].hopPP_dis_mg = 
          SMPH.hopPPrating * ibu.add[hopIdx].weight.value * 1000.0;
  return;
}

// -----------------------------------------------------------------------------
function compute_LF_hopPP(ibu) {
  var LF_hopPP = 0.0;

  // assume very high solubility limit for PP, so each addition is additive
  // [PP] should not change during fermentation
  LF_hopPP = SMPH.LF_hopPP * compute_LF_nonIAA_pH(ibu) *
             compute_LF_nonIAA_krausen(ibu) * compute_LF_package(ibu);

  if (LF_hopPP > 1.0) LF_hopPP = 1.0;
  if (SMPH.verbose > 3) {
    console.log("    LF hopPP = " + LF_hopPP.toFixed(4));
  }
  return(LF_hopPP);
}


// -----------------------------------------------------------------------------
// compute concentration of hop and malt polyphenols in finished beer

function compute_hopPP_beer(ibu, hopIdx) {
  var PP_beer = 0.0;

  ibu.add[hopIdx].hopPP_beer = ibu.add[hopIdx].hopPP_wort * 
                  compute_LF_hopPP(ibu);
  PP_beer = ibu.add[hopIdx].hopPP_beer;

  if (SMPH.verbose > 3) {
    console.log("hop [PP] in finished beer = " + PP_beer.toFixed(4));
  }
  return PP_beer;
}

// -----------------------------------------------------------------------------

function compute_maltPP_beer(ibu) {
  var IBU_malt = 0.0;
  var points = 0.0;
  var PP_malt = 0.0;

  points = (ibu.OG.value - 1.0) * 1000.0;
  IBU_malt = points * SMPH.maltPP_slope;
  PP_malt = IBU_malt * 69.68 / 51.2;
  if (SMPH.verbose > 3) {
    console.log("malt [PP] in finished beer = " + PP_malt.toFixed(4));
  }
  return PP_malt;
}

// -----------------------------------------------------------------------------

function compute_hop_IBU(ibu, hopIdx) {
  var hop_IBU = 0.0;
  var IAA_beer = ibu.add[hopIdx].IAA_beer;
  var oAA_beer = ibu.add[hopIdx].oAA_beer;
  var oBA_beer = ibu.add[hopIdx].oBA_beer;
  var hopPP_beer = ibu.add[hopIdx].hopPP_beer;

  hop_IBU = (51.2/69.68) * (IAA_beer + (oAA_beer * SMPH.scale_oAA) +
                                    (oBA_beer * SMPH.scale_oBA) +
                                    (hopPP_beer * SMPH.scale_hopPP));
  ibu.add[hopIdx].IBU = hop_IBU;

  if (ibu.add[hopIdx].AA_init > 0) {
    ibu.add[hopIdx].U = ibu.add[hopIdx].IAA_beer / 
                        ibu.add[hopIdx].AA_init;
    } else {
    ibu.add[hopIdx].U = 0.0;
    }

  if (SMPH.verbose > 3) {
    console.log("  addition " + Number(hopIdx+1) + ": [AA]_0=" +
                ibu.add[hopIdx].AA_init.toFixed(3) +
              ", IAA = " + ibu.add[hopIdx].IAA_dis_mg.toFixed(3) +
      ", IBU = " + ibu.add[hopIdx].IBU.toFixed(3) +
      ", U = " + (100.0 * ibu.add[hopIdx].U).toFixed(3));
    }

  return hop_IBU;
}

// close the "namespace" and call the function to construct it.
}
SMPH._construct();

