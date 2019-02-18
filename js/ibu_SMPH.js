// -----------------------------------------------------------------------------
// ibu_SMPH.js : JavaScript for AlchemyOverlord web page, SMPH sub-page
// Written by John-Paul Hosom
// Copyright © 2018 by John-Paul Hosom, all rights reserved.
// To license this software, please contact John-Paul Hosom, for example at
//    alchemyoverlord © yahoo · com
//
// Version 1.0.1 : November 22, 2018 -- xxx xx, 2019
//         This version is based on the mIBU javascript code in this project,
//         which has then been modified to implement the SMPH method.
//
// TODO:
// 1. IBU as a function of wort/beer color?
// 2. pellets: adjustment from cones
// 3. pellets: oAA percent init for pellets (and oBA percent init for pellets)
// 4. add hop variety via pulldown menu
// z. final: check indentation, change tabs to spaces, alphabetize variables,
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
  ibu.hopTableSize = 6;   // number of inputs to specify each addition of hops

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
  common.set(ibu.applySolubilityLimitCheckbox, 0);
  common.set(ibu.pHCheckbox, 0);
  common.set(ibu.pH, 0);
  common.set(ibu.preOrPostBoilpH, 0);
  common.set(ibu.numAdditions, 0);
  common.set(ibu.flocculation, 0);
  common.set(ibu.filtering, 0);
  common.set(ibu.beerAge_days, 0);

  // set parameters of the SMPH model here:
  this.verbose            = 5;
  this.integrationTime    = 0.1;   // minutes

  this.AA_limit_func_A    = -31800.0;  // from experiment
  this.AA_limit_minLimit  = 180.0; // from experiment
  this.AA_limit_roomTemp  = 90.0;  // AA solubility limit, ppm, from Malowicki

  this.hop_nonExtract     = 1.0;   // some say higher, some say lower than 1.0
  this.hop_pelletFactor   = 1.20;
  this.hop_baggingFactor  = 1.00;  // from experiment

  this.icebathBaseTemp    = 314.00;       // 40.85'C = 105.53'F
  this.immersionChillerBaseTemp = 293.15; // 20'C = 68'F = room temp
  this.immersionMinTempC  = 60.0;         // must be > immersionChillerBaseTemp

  this.fermentationFactor = 0.85;   // from lit., e.g. Garetz, Fix, Nielsen
  this.LF_boil            = 0.57;   // SEARCH

  this.oAA_storageFactor  = 0.022;  // estimate from Maye data
  this.oAA_boilFactor     = 0.22;   // SEARCH
  this.scale_oAAloss      = 0.21;   // SEARCH
  this.scale_oAA          = 1.093;  // from Maye, Figure 7

  this.oBA_storageFactor  = 0.00;   // SEARCH
  this.oBA_boilFactor     = 0.10;   // from Stevens p. 500 max 10%
  this.scale_oBAloss      = 0.70;   // SEARCH
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
  var hopPP_beer = 0.0;
  var hopIdx = 0;
  var IAA_beer = 0.0;
  var IAA_concent_wort = 0.0;
  var IAA_result = [];
  var IBU = 0.0;
  var idxP1 = 0;
  var LF_IAA = 0.0;
  var LF_oAA = 0.0;
  var LF_oBA = 0.0;
  var maltPP_beer = 0.0;
  var oAA_beer = 0.0;
  var oAA_concent_boil = 0.0;
  var oBA_beer = 0.0;
  var oBA_concent_boil = 0.0;
  var RF_IAA = 0.0;
  var totalAA = 0.0;
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
  }

  // initialize outputs from each hop addition to zero
  if (SMPH.verbose > 0)
    console.log("number of hops additions: " + ibu.add.length);
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    ibu.add[hopIdx].AA_init_concent = 0.0;
    ibu.add[hopIdx].AA_dis = 0.0;
    ibu.add[hopIdx].IAA_dis = 0.0;
    ibu.add[hopIdx].IAA_xfer = 0.0;
    ibu.add[hopIdx].IAA_concent_wort = 0.0;
    ibu.add[hopIdx].IBU = 0.0;
    ibu.add[hopIdx].U = 0.0;
    ibu.add[hopIdx].oAA_concent_boil = 0.0;
    ibu.add[hopIdx].oBA_concent_boil = 0.0;
    ibu.add[hopIdx].PP_beer = 0.0;
    ibu.add[hopIdx].tempK = 0.0;
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

  U = 0.0;
  IBU = 0.0;
  IAA_result = compute_IAA_concent_wort(ibu);
  IAA_concent_wort = IAA_result[0];
  totalAA          = IAA_result[1];
  FCT              = IAA_result[2];

  RF_IAA = compute_RF_IAA(ibu);
  LF_IAA = compute_LF_IAA(ibu);
  IAA_beer = compute_IAA_beer(IAA_concent_wort, RF_IAA, LF_IAA);
  if (SMPH.verbose > 2) {
    console.log("    IAA SUMMARY: [IAA]_wort = " + IAA_concent_wort.toFixed(2) +
              ", RF_IAA = " + RF_IAA.toFixed(2),
              ", LF_IAA = " + LF_IAA.toFixed(2),
              ", IAA_beer = " + IAA_beer.toFixed(2));
  }

  if (SMPH.verbose > 2) {
    console.log(">>>> oAA:");
  }
  oAA_concent_boil = compute_oAA_concent_boil(ibu);
  LF_oAA = compute_LF_oAA(ibu);
  oAA_beer = compute_oAA_beer(oAA_concent_boil, LF_oAA);

  if (SMPH.verbose > 2) {
    console.log(">>>> oBA:");
  }
  oBA_concent_boil = compute_oBA_concent_boil(ibu);
  LF_oBA = compute_LF_oBA(ibu);
  oBA_beer = compute_oBA_beer(oBA_concent_boil, LF_oBA);

  if (SMPH.verbose > 2) {
    console.log(">>>> PP:");
  }
  hopPP_beer = compute_hopPP_beer(ibu);
  maltPP_beer = compute_maltPP_beer(ibu);

  if (SMPH.verbose > 1) {
    console.log(">>>> FINAL:");
  }
  IBU = (51.2/69.68) * (IAA_beer + ((oAA_beer * SMPH.scale_oAA) +
                                    (oBA_beer * SMPH.scale_oBA) +
                                    (hopPP_beer * SMPH.scale_hopPP) +
                                    maltPP_beer));
  if (SMPH.verbose > 2) {
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
  }

  U = IAA_beer / totalAA;
  ibu.IBU = IBU * ibu.scalingFactor.value;
  ibu.AA = totalAA;
  ibu.IAA = IAA_beer;
  ibu.U = U * ibu.scalingFactor.value;
  ibu.IAApercent = ((51.2 / 69.68) * IAA_beer) / IBU;
  ibu.oAA = oAA_beer;
  ibu.oBA = oBA_beer;
  ibu.hopPP = hopPP_beer;
  ibu.maltPP = maltPP_beer;
  ibu.FCT = FCT;

  if (SMPH.verbose > 0) {
    console.log("IBU = " + ibu.IBU.toFixed(2) + ", U = " + ibu.U.toFixed(3) +
                ", [IAA] = " + IAA_beer.toFixed(3) +
                ", [AA] = " + totalAA.toFixed(3) +
                ", IAA% = " + ibu.IAApercent.toFixed(3));
    }

  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    IAA_beer = compute_IAA_beer(ibu.add[hopIdx].IAA_concent_wort,
                                RF_IAA, LF_IAA);
    oAA_beer = compute_oAA_beer(ibu.add[hopIdx].oAA_concent_boil, LF_oAA);
    oBA_beer = compute_oBA_beer(ibu.add[hopIdx].oBA_concent_boil, LF_oBA);
    hopPP_beer = ibu.add[hopIdx].PP_beer;
    ibu.add[hopIdx].U = IAA_beer / ibu.add[hopIdx].AA_init_concent;
    IBU = (51.2/69.68) * (IAA_beer + ((oAA_beer * SMPH.scale_oAA) +
                                    (oBA_beer * SMPH.scale_oBA) +
                                    (hopPP_beer * SMPH.scale_hopPP)));
    ibu.add[hopIdx].IBU = IBU;
    if (SMPH.verbose > 3)
      console.log("  addition " + Number(hopIdx+1) + ": AA_init=" +
                  ibu.add[hopIdx].AA_init_concent.toFixed(3) +
                ", IAA = " + ibu.add[hopIdx].IAA_dis.toFixed(3) +
        ", IBU = " + ibu.add[hopIdx].IBU.toFixed(3) +
        ", U = " + (100.0 * ibu.add[hopIdx].U).toFixed(3));
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
      // JPH DEBUG : where did this formula come from?  Peacock? Daniels?
      LF_filtering = (0.017 * ibu.filtering.value) + 0.934
    }
  }

  // Loss based on exponential fit to first 13 weeks of data; after 15 weeks,
  // losses seem to stabilize.
  // This is an average of IAA and nonIAA losses, but doesn't include maltPP
  // Formula from blog post 'Four Experiments on Alpha Acid Utilization and IBUs
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

//------------------------------------------------------------------------------
// Compute overall loss factor (LF) for IAA, given loss factors caused by
// the boil, gravity, fermentation, flocculation, filtering, and age of beer.

function compute_LF_IAA(ibu) {
  var LF_IAA = 0.0;

  if (SMPH.verbose > 4) {
    console.log("    IAA LF: LF_boil=" + SMPH.LF_boil.toFixed(4) +
              ", LF_OG=" + compute_LF_OG_Noonan(ibu).toFixed(4) +
              ", LF_ferment=" + compute_LF_ferment(ibu).toFixed(4) +
              ", LF_package=" + compute_LF_package(ibu).toFixed(4));
  }
  LF_IAA = SMPH.LF_boil * compute_LF_OG_Noonan(ibu) *
           compute_LF_ferment(ibu) *
           compute_LF_package(ibu);
  if (SMPH.verbose > 3) {
    console.log("      LF IAA : " + LF_IAA.toFixed(4));
  }
  return LF_IAA;
}

//------------------------------------------------------------------------------
// Compute IAA levels in the finished beer, given IAA concentration in the wort,
// the IAA rate factor, and the IAA loss factor.

function compute_IAA_beer(IAA_concent_wort, RF_IAA, LF_IAA) {
  var IAA_beer = 0.0;

  IAA_beer = IAA_concent_wort * RF_IAA * LF_IAA;
  if (SMPH.verbose > 2) {
    console.log(">>> IAA in finished beer: " + IAA_beer.toFixed(4));
    }
  return IAA_beer;
}



//------------------------------------------------------------------------------
// compute concentration of IAA produced during the boil


function compute_IAA_concent_wort(ibu) {
  var AA_dis = 0.0;
  var AA_dis_concent = 0.0;
  var AA_init_concent = 0.0; // [AA]_init
  var AA_init_mg = 0.0;
  var AA_limit = 0.0;
  var AA_limit_func_A = 0.0;
  var AA_limit_func_A_orig = SMPH.AA_limit_func_A;
  var AA_limit_func_B = 0.0;
  var AA_limit_minLimit = 0.0;
  var AA_limit_minLimit_orig = SMPH.AA_limit_minLimit;
  var AA_percent_boil = 0.0;
  var AA_xfer  = 0.0;
  var additionTime = 0.0;
  var boilTime = ibu.boilTime.value;
  var chillingTime = 0.0;
  var coolingMethod = ibu.forcedDecayType.value;
  var currVolume = 0.0;
  var dAA_dis = 0.0;
  var decayRate = 0.0;
  var dIAA_dis = 0.0;
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
  var IAA_concent_wort = 0.0;
  var IAA_dis = 0.0;
  var IAA_dis_concent = 0.0;
  var IAA_xfer = 0.0;
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
  var t = 0.0;
  var tempC = 0.0;
  var tempK = 0.0;
  var tempNoBase = 0.0;
  var topoffScale = 0.0;
  var total_AA_concent = 0.0;
  var totalXferTime = 0.0;
  var useSolubilityLimit = ibu.applySolubilityLimitCheckbox.value;
  var volumeChange = 0.0;
  var whirlpoolTime = 0.0;
  var xferRate = 0.0;

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
  AA_dis   = 0.0;  // mg of AA dissolved, not ppm to account for volume changes
  IAA_dis  = 0.0;  // mg of IAA dissolved, not ppm to account for volume changes
  AA_xfer  = 0.0;  // mg of AA transferred (and cooled) via counterflow
  IAA_xfer = 0.0;  // mg of IAA transferred via counterflow
  total_AA_concent  = 0.0;  // total concentration of alpha acids added to wort

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
        newAA = (AA_dis / currVolume) * (currVolume - volumeChange);
        AA_xfer += AA_dis - newAA;
        AA_dis = newAA;

        newIAA = (IAA_dis / currVolume) * (currVolume - volumeChange);
        IAA_xfer += IAA_dis - newIAA;
        IAA_dis = newIAA;

        if (AA_dis < 0.0)  AA_dis  = 0.0;
        if (IAA_dis < 0.0) IAA_dis = 0.0;

        // adjust AA and IAA levels of each separate addition
        for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
          newAA = (ibu.add[hopIdx].AA_dis / currVolume) *
                  (currVolume - volumeChange);
          ibu.add[hopIdx].AA_dis = newAA;
          newIAA = (ibu.add[hopIdx].IAA_dis / currVolume) *
                   (currVolume - volumeChange);
          ibu.add[hopIdx].IAA_xfer += ibu.add[hopIdx].IAA_dis - newIAA;
          ibu.add[hopIdx].IAA_dis = newIAA;
          if (ibu.add[hopIdx].AA_dis < 0.0) ibu.add[hopIdx].AA_dis = 0.0;
          if (ibu.add[hopIdx].IAA_dis < 0.0) ibu.add[hopIdx].IAA_dis = 0.0;
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
        AA_percent_boil = (ibu.add[hopIdx].AA.value / 100.0) *
                           ibu.add[hopIdx].freshnessFactor.value;
        AA_init_mg = AA_percent_boil * ibu.add[hopIdx].weight.value * 1000.0;
        AA_init_concent = AA_init_mg / currVolume;
        ibu.add[hopIdx].AA_init_concent = AA_init_concent;
        ibu.add[hopIdx].AA_dis = AA_init_mg;
        total_AA_concent += AA_init_concent;

        if (SMPH.verbose > 2) {
          console.log("ADDING HOPS ADDITION " + hopIdx + ":");
          console.log("  AA=" + ibu.add[hopIdx].AA.value + "%, weight=" +
                      ibu.add[hopIdx].weight.value.toFixed(3) + " grams " +
                      " and [AA]_init = " + AA_init_concent.toFixed(2));
          console.log("  at time " + t.toFixed(2) +
                    " with volume " + currVolume.toFixed(3) +
                    ", adding AA " + AA_init_mg.toFixed(3) +
                    " (mg) to existing AA = " + AA_dis.toFixed(3) + " (mg)");
        }
        preAdd_AA = AA_dis;
        AA_dis += AA_init_mg;

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
          AA_dis_concent = AA_dis / currVolume;
          AA_limit = (AA_limit_func_A / (AA_dis_concent)) + AA_limit_func_B;

          if (SMPH.verbose > 2) {
            console.log("    AA_limit = " + AA_limit.toFixed(4) + " = " +
                  AA_limit_func_A.toFixed(4) + "/" + AA_dis_concent.toFixed(4) +
                  " + " + AA_limit_func_B.toFixed(4));
            console.log("    AA_limit_minLimit = " + AA_limit_minLimit);
          }

          if (AA_limit < AA_limit_minLimit) {
            AA_limit = AA_limit_minLimit;
          }

          if (AA_dis_concent > AA_limit) {
            AA_dis = AA_limit * currVolume;
            AA_dis_concent = AA_limit;
          }

          // get dissolved AA in mg for this addition of hops
          ibu.add[hopIdx].AA_dis = AA_dis - preAdd_AA;

          // AA_dis can be negative if already above saturation limit and
          // add a smaller amount of AA than previous addition, in which
          // case AA_dis can be (before adjustment) smaller than it was
          // in the previous adjustment, which lowers AA_limit, which
          // lowers the adjusted AA concentration, which makes AA_dis negative.
          // The adjustment of AA_limit in this way can vary the predicted
          // IBU by about 1 in the case of 'Xtra IPA Ju. 2016', from 32.16 to
          // 31.29.  If collapse the final four hop additions into one averaged
          // value, then get 32.55.  Dealing with this effect would require
          // significant code changes and doesn't seem to be worth it.
          // Ordering the hops in order of increasing AA may be best approach.
          if (ibu.add[hopIdx].AA_dis < 0) {
            // console.log("Warning: adding negative AA: " +
                        // ibu.add[hopIdx].AA_dis.toFixed(4));
            ibu.add[hopIdx].AA_dis = 0.0;
          }

          // record the temperature at which hops were added, for later
          // oAA and oBA estimates
          ibu.add[hopIdx].tempK = tempK;

          if (SMPH.verbose > 2) {
            console.log("    [AA]_init = " + AA_init_concent.toFixed(4) +
                        ", [AA]_limit = " + AA_limit.toFixed(4) +
                        " at " + tempC.toFixed(2) +
                        "'C, [AA]_dis = "+ AA_dis_concent.toFixed(4));
          }
        } // use solubility limit?
      } // check for hop addition at this time
    } // evaluate all hop additions


    // -------------------------------------------------------------------------
    // change concentrations of dissolved AA and dissolved IAA

    // decrease levels of dissolved AA via conversion to IAA
    dAA_dis = -1.0 * k1 * AA_dis;
    AA_dis = AA_dis + (dAA_dis * integrationTime);
    if (AA_dis < 0.0) AA_dis = 0.0;

    // change levels of dissolved IAA
    dIAA_dis = (k1 * AA_dis) - (k2 * IAA_dis);
    IAA_dis = IAA_dis + (dIAA_dis * integrationTime);
    if (IAA_dis < 0.0) IAA_dis = 0.0;

    // compute AA and IAA levels for each separate addition
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      dAA_dis = -1.0 * k1 * ibu.add[hopIdx].AA_dis;
      ibu.add[hopIdx].AA_dis += dAA_dis * integrationTime;
      if (ibu.add[hopIdx].AA_dis < 0.0) ibu.add[hopIdx].AA_dis = 0.0;
      dIAA_dis = (k1 * ibu.add[hopIdx].AA_dis) -
                 (k2 * ibu.add[hopIdx].IAA_dis);
      ibu.add[hopIdx].IAA_dis += dIAA_dis * integrationTime;
      if (ibu.add[hopIdx].IAA_dis < 0.0) ibu.add[hopIdx].IAA_dis = 0.0;
    }

    // every 5 minutes, print out some information to the console
    if (SMPH.verbose > 3 && Math.round(t * 1000) % 5000 == 0) {
      AA_dis_concent  = AA_dis  / currVolume;
      IAA_dis_concent = IAA_dis / currVolume;
      console.log("time = " + t.toFixed(3));
      console.log("       temp = " + tempC.toFixed(2));
      console.log("       volume = " + currVolume.toFixed(4));
      console.log("       AA = " + AA_dis_concent.toFixed(4) + " ppm " +
                          "with delta " + dAA_dis.toFixed(6) + " mg/min");
      console.log("       IAA = " + IAA_dis_concent.toFixed(4) + " ppm " +
                          "with delta " + dIAA_dis.toFixed(6) + " mg/min");
      if (t == 0) {
        console.log("    -------- end of boil --------");
      }
    }


    // adjust current volume due to evaporation during the boil
    if (t >= 0) {
      currVolume -= ibu.evaporationRate.value/60.0 * integrationTime;
    }

    // prevent floating-point drift in 'time' variable
    t = Number(t.toFixed(4));
  }

  // ---------------------------------------------------------------------------
  // FINALIZE


  // compute forced cooling time (FCT)
  FCT = (-1.0 * t) - whirlpoolTime;

  // adjust IBUs based on wort/trub loss and topoff volume added
  finalVolume = postBoilVolume;
  if (ibu.wortLossVolume.value > 0) {
    // if wort loss after boil, adjust final volume and final mg of IAA
    // keeping overall [IAA] the same
    finalVolume = postBoilVolume - ibu.wortLossVolume.value;
    IAA_dis *= (1.0 - (ibu.wortLossVolume.value / postBoilVolume));
    console.log("FINAL VOL = " + postBoilVolume.toFixed(4) + " minus loss " +
                ibu.wortLossVolume.value.toFixed(4));
    for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
      ibu.add[hopIdx].IAA_dis *=
          (1.0 - (ibu.wortLossVolume.value / postBoilVolume));
    }
  }
  if (finalVolume > 0) {
    topoffScale = finalVolume / (finalVolume + ibu.topoffVolume.value);
  } else {
    topoffScale = 0.0;
  }

  IAA_concent_wort = (IAA_dis + IAA_xfer) / finalVolume;
  if (SMPH.verbose > 3) {
    console.log("before topoff, IAA = " + IAA_concent_wort.toFixed(4) +
                ", scaling = " + topoffScale);
    console.log("IAA = " + IAA_dis.toFixed(4) +
                ", vol = " + finalVolume.toFixed(4));
    }
  IAA_concent_wort *= topoffScale;

  // add back in the IAA transferred for each addition, then normalize by
  // volume and topoffScale.
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    ibu.add[hopIdx].IAA_concent_wort =
      ((ibu.add[hopIdx].IAA_dis + ibu.add[hopIdx].IAA_xfer)/finalVolume) *
       topoffScale;
    if (SMPH.verbose > 0) {
      console.log("  addition " + hopIdx + " has [IAA] = " +
                ibu.add[hopIdx].IAA_dis.toFixed(4) + " ppm");
    }
  }


  // print out summary information to console when done
  if (SMPH.verbose > 0) {
    console.log(" >> temperature at end = " + tempC.toFixed(2) + "'C after ");
    if (coolingMethod == "forcedDecayCounterflow") {
      console.log("     transfer time " + totalXferTime.toFixed(2) + " min");
    } else {
      chillingTime = -1 * (t + whirlpoolTime);
      console.log("     time after flameout = " + (-1*t).toFixed(3) +
                  " (whirlpool = " + whirlpoolTime +
                  " min, chilling time " + chillingTime.toFixed(2) + " min)");
    }
    console.log(">>> IAA in wort = " + IAA_concent_wort.toFixed(4));
  }

  return [IAA_concent_wort, total_AA_concent, FCT];
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

  // If pre-boil pH, estimate the post-boil pH which is the
  // one we want to base losses on.  Estimate that the pH drops by
  // about 0.1 units per hour... this is a ballpark estimate.
  if (preOrPostBoilpH == "preBoilpH") {
    if (SMPH.verbose > 2) {
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

  return LF_pH;
}

// -----------------------------------------------------------------------------
// compute temperature at IBU addition, relative to boiling 

function compute_relativeTemp(ibu, hopIdx) {
  var relativeTemp = 0.0;
  var minEffectiveTempK = 0.0;  // room temperature, degrees Kelvin

  relativeTemp = 1.0;
  if (!ibu.add[hopIdx].tempK) {
    console.log("ERROR: temperature at hop addition not known");
    return relativeTemp;
  }

  minEffectiveTempK = 20.0 + (ibu.boilTemp.value + 273.15 - 100.0); // room temp
  relativeTemp = (ibu.add[hopIdx].tempK - minEffectiveTempK) /
                 ((ibu.boilTemp.value + 273.15) - minEffectiveTempK);

  if (SMPH.verbose > 3) {
    console.log("    relative temp: " + relativeTemp.toFixed(4));
  }
  return relativeTemp;
}

// ----------- oAA -------------------------------------------------------------
// -----------------------------------------------------------------------------
// compute oxidized alpha acid (oAA) concentration

function compute_oAA_concent_boil(ibu) {
  var AAloss_percent = 0.0;
  var hopIdx = 0;
  var k = 0.0;
  var oAA_addition = 0.0;
  var oAA_concent_boil = 0.0;
  var oAA_fresh = 0.0;
  var oAA_percent_boilFactor = 0.0;
  var oAA_percent_init = 0.0;
  var postBoilVolume = 0.0;
  var ratio = 0.0;
  var relativeTemp = 0.0;

  // note: solubility limit of oAA is very large, so we don't need
  // to worry about that.
  postBoilVolume = ibu.getPostBoilVolume();
  oAA_concent_boil = 0.0;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    relativeTemp = compute_relativeTemp(ibu, hopIdx);
    // if relativeTemp < 0, then hops were never added
    if (relativeTemp < 0) {
      continue;
    }

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
        console.log("    [oAA] factors: fresh=" + oAA_fresh.toFixed(5) +
                  ", loss=" + AAloss_percent.toFixed(5) +
                  ", %init=" + oAA_percent_init.toFixed(5));
      }
    }
    oAA_percent_boilFactor = (ibu.add[hopIdx].AA.value / 100.0) *
                             ibu.add[hopIdx].freshnessFactor.value *
                             SMPH.oAA_boilFactor * relativeTemp;
    oAA_addition = (oAA_percent_init + oAA_percent_boilFactor) *
                         ibu.add[hopIdx].weight.value * 1000.0 /
                         postBoilVolume;
    ibu.add[hopIdx].oAA_concent_boil = oAA_addition;
    oAA_concent_boil += oAA_addition;
    if (SMPH.verbose > 3) {
      console.log("    [oAA] boil " + oAA_concent_boil.toFixed(4));
    }
  }
  return oAA_concent_boil;
}

// -----------------------------------------------------------------------------
// compute loss factor (LF) for oxidized alpha acids (oAA), using
// loss factor for IAA, non-IAA loss factor for pH, and an oAA-specific 
// relative scaling factor.  Maximum value is 1.0 (no loss)

function compute_LF_oAA(ibu) {
  var LF_oAA = 0.0;

  LF_oAA = compute_LF_IAA(ibu) * compute_LF_nonIAA_pH(ibu) * SMPH.scale_oAAloss;
  if (LF_oAA > 1.0) LF_oAA = 1.0;
  if (SMPH.verbose > 3) {
    console.log("    LF oAA " + LF_oAA.toFixed(4));
  }
  return(LF_oAA);
}

// -----------------------------------------------------------------------------
// compute concentration of oxidized alpha acids (oAA) in finished beer,
// given oAA concentration and oAA loss factors.

function compute_oAA_beer(oAA_concent_boil, LF_oAA) {
  var oAA_beer = 0.0;

  oAA_beer = oAA_concent_boil * LF_oAA;
  if (SMPH.verbose > 3) {
    console.log("    oAA in finished beer = " + oAA_beer.toFixed(4));
  }
  return(oAA_beer);
}

// -----------------------------------------------------------------------------
// ----------- oBA -------------------------------------------------------------
// compute oxidized beta acid (oBA) concentration

function compute_oBA_concent_boil(ibu) {
  var BAloss_percent = 0.0;
  var hopIdx = 0;
  var k = 0.0;
  var oBA_addition = 0.0;
  var oBA_concent_boil = 0.0;
  var oBA_percent_init = 0.0;
  var oBA_percent_boilFactor = 0.0;
  var oBA_fresh = 0.0;
  var postBoilVolume = 0.0;
  var ratio = 0.0;
  var relativeTemp = 0.0;

  // note: solubility limit of oBA is very large, so we don't need
  // to worry about that.
  postBoilVolume = ibu.getPostBoilVolume();
  oBA_concent_boil = 0.0;
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    relativeTemp = compute_relativeTemp(ibu, hopIdx);
    // if relativeTemp < 0, then hops were never added
    if (relativeTemp < 0) {
      continue;
    }

    if (ibu.add[hopIdx].hopForm.value == "pellets") {
      // JPH DEBUG fix this
      oBA_percent_init = -10.0;
      // oBA_percent_init = 0.014;
    } else {
      // k is from Garetz
      ratio = 1.0 - (ibu.add[hopIdx].percentLoss.value / 100.0);
      k = Math.log(1.0 / ratio) / (365.0 / 2.0);
      // oBA_fresh is oBA per weight of hops, modeled as 0.5 days decay at 20'C
      // estimate obtained by analysis of Maye paper and assume oBA same as oAA
      oBA_fresh = 1.0 - (1.0 / Math.exp(k * 1.0 * 1.0 * 0.5));
      BAloss_percent = 1.0 - ibu.add[hopIdx].freshnessFactor.value;
      // 0.022 estimated from analysis of Maye paper; see oAA.tcl
      oBA_percent_init = (BAloss_percent * SMPH.oBA_storageFactor) + oBA_fresh;
    }
    oBA_percent_boilFactor = (ibu.add[hopIdx].BA.value/100.0) *
                             ibu.add[hopIdx].freshnessFactor.value *
                             SMPH.oBA_boilFactor * relativeTemp;
    if (SMPH.verbose > 5) {
      console.log("    oBA % boilF = " + ibu.add[hopIdx].BA.value.toFixed(4) +
                  " / 100) * " +
                  ibu.add[hopIdx].freshnessFactor.value.toFixed(4) +
                  " * " + SMPH.oBA_boilFactor.toFixed(4) +
                  " * " + relativeTemp.toFixed(4));
    }
    oBA_addition = (oBA_percent_init + oBA_percent_boilFactor) *
                         ibu.add[hopIdx].weight.value * 1000.0 /
                          postBoilVolume;
    ibu.add[hopIdx].oBA_concent_boil = oBA_addition;
    oBA_concent_boil += oBA_addition;
    if (SMPH.verbose > 4) {
      console.log("    OBA >> %init = " + oBA_percent_init.toFixed(6) +
                  ", boilFactor = " + oBA_percent_boilFactor.toFixed(6) +
                  ": concent_boil = " + oBA_concent_boil.toFixed(6));
    }
  }
  if (SMPH.verbose > 3) {
    console.log("    [oBA] in boil = " + oBA_concent_boil.toFixed(4));
  }
  return oBA_concent_boil;
}

// -----------------------------------------------------------------------------
// compute loss factor (LF) for oxidized beta acids (oBA), using
// loss factor for IAA, non-IAA loss factor for pH, and an oBA-specific 
// relative scaling factor.  Maximum value is 1.0 (no loss)

function compute_LF_oBA(ibu) {
  var LF_oBA = 0.0;

  LF_oBA = compute_LF_IAA(ibu) * compute_LF_nonIAA_pH(ibu) * SMPH.scale_oBAloss;
  if (LF_oBA > 1.0) LF_oBA = 1.0;
  if (SMPH.verbose > 3) {
    console.log("    LF oBA = " + LF_oBA.toFixed(4));
  }
  return(LF_oBA);
}

// -----------------------------------------------------------------------------
// compute concentration of oxidized beta acids (oBA) in finished beer,
// given oBA concentration and oBA loss factors.

function compute_oBA_beer(oBA_concent_boil, LF_oBA) {
  var oBA_beer = 0.0;
  oBA_beer = oBA_concent_boil * LF_oBA;
  if (SMPH.verbose > 3) {
    console.log("    [oBA] in finished beer = " + oBA_beer.toFixed(4));
  }
  return(oBA_beer);
}

// -----------------------------------------------------------------------------
// ------------------ PP -------------------------------------------------------
// compute concentration of hop and malt polyphenols in finished beer

function compute_hopPP_beer(ibu) {
  var hopIdx = 0;
  var postBoilVolume = 0.0;
  var PP_addition = 0.0;
  var PP_beer = 0.0;
  var PP_wort_add = 0.0;
  var relativeTemp = 0.0;

  // assume very high solubility limit for PP, so each addition is additive
  PP_beer = 0.0;
  postBoilVolume = ibu.getPostBoilVolume();
  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    relativeTemp = compute_relativeTemp(ibu, hopIdx);
    // if relativeTemp < 0, then hops for this addition were never added
    if (relativeTemp < 0) {
      continue;
    }

    PP_wort_add = SMPH.hopPPrating * ibu.add[hopIdx].weight.value * 1000.0 /
                          postBoilVolume;
    PP_addition = PP_wort_add * SMPH.LF_hopPP * compute_LF_nonIAA_pH(ibu) *
               compute_LF_ferment(ibu) * compute_LF_package(ibu);
    ibu.add[hopIdx].PP_beer = PP_addition;
    PP_beer += PP_addition;
  }
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


// close the "namespace" and call the function to construct it.
}
SMPH._construct();

