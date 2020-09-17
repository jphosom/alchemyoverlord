// -----------------------------------------------------------------------------
// ibu_SMPH.js : JavaScript for AlchemyOverlord web page, SMPH sub-page
// Written by John-Paul Hosom
// Copyright © 2018, 2019, 2020 by John-Paul Hosom, all rights reserved.
// To license this software, please contact John-Paul Hosom, for example at
//    alchemyoverlord © yahoo · com
//
// Version 1.0.1 : November 22, 2018 -- xxx xx, 2020
//         This version is based on the mIBU javascript code in this project,
//         which has then been modified to implement the SMPH method as
//         described in the blog post "A Summary of Factors Affecting IBUs".
//
// TODO:
// 1. go over code:
//    - are nonIAA treated the way they should be?  e.g. LF_boil, IAA factors?
//    - clean up code
//    - double-check logic
// 2. re-run parameter estimation
// 3. update model & HTML to include effects of lautering technique
// 4. final: check indentation, change tabs to spaces, alphabetize variables,
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
  ibu.hopTableSize = 8;   // number of inputs to specify each addition of hops

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

  this.AA_limit_minLimit  = 200.0; // ppm of alpha acids, from SEARCH
  this.AA_limit_maxLimit  = 535.0; // ppm of alpha acids, from SEARCH
  this.AA_limit_min_roomTemp  = 90.0;  // Malowicki [AA] limit, ppm, minimum
  this.AA_limit_max_roomTemp  = 116.0; // Malowicki [AA] limit, ppm, maximum

  this.hop_nonExtract     = 1.0;   // some say higher, some say lower than 1.0
  this.hop_baggingFactor  = 1.00;  // from experiment

  this.icebathBaseTemp    = 314.00;       // 314.00'K = 40.85'C = 105.53'F
  this.immersionChillerBaseTemp = 293.15; // 293.15'K = 20'C = 68'F = room temp
  this.immersionMinTempC  = 60.0;         // must be > immersionChillerBaseTemp

  this.IAA_LF_boil        = 0.56;   // SEARCH
  this.fermentationFactor = 0.85;   // from lit., e.g. Garetz, Fix, Nielsen

  this.oAA_storageFactor  = 0.22;   // estimate from Maye data
  this.oAA_boilFactor     = 0.05;   // SEARCH  
  this.oAA_LF_boil        = this.IAA_LF_boil; // assume same boil loss factor as IAA
  this.scale_oAA          = 0.9155; // from Maye, Figure 7

  this.oBA_storageFactor  = 1.00;    // SEARCH
  this.oBA_boilFactor     = 0.10;   // from Stevens p. 500 max 10%
  this.oBA_LF_boil        = 0.0153; // boilFactor*LF_boil*ferment=0.0013 : Teamaker
  this.scale_oBA          = 0.85;   // from Hough p. 491: oBA 85% of absorbtion

  this.hopPPrating        = 0.04;   // approx 4% of hop is PP, from literature
  this.LF_hopPP           = 0.20;   // 20% are soluble, from the literature
  this.ferment_hopPP      = 0.70;   // from blog post on malt PP, assume same
  // Parkin scaling factor is 0.022 from [PP] to BU, but BU is 5/7*concentration
  // so 0.022 * 69.68/51.2 is scaling factor from [PP] to [IAA]-equivalent =0.30
  this.scale_hopPP        = 0.030;  // from Parkin, p. 28, corrected

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

  for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
    ibu.add[hopIdx].AA_init = 0.0;       // units: ppm
    ibu.add[hopIdx].AA_dis_mg = 0.0;     // units: mg
    ibu.add[hopIdx].AA_undis_mg = 0.0;   // units: mg
    ibu.add[hopIdx].AA_xfer_mg = 0.0;    // units: mg
    ibu.add[hopIdx].IAA_dis_mg = 0.0;    // units: mg
    ibu.add[hopIdx].IAA_undis_mg = 0.0;  // units: mg
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
// Estimate post-boil pH from pre-boil pH

function compute_postBoil_pH(preBoilpH) {
  var slopeSlope = -0.003927872518870565;
  var slopeIntercept = 0.018625896934116128;
  var pH = preBoilpH;

  pH = (preBoilpH * ((slopeSlope * ibu.boilTime.value) + 1.0)) +
       (slopeIntercept * ibu.boilTime.value);
  pH = preBoilpH - (ibu.boilTime.value * 0.10 / 60.0);
  if (SMPH.verbose > 5) {
    console.log("pre-boil pH: " + preBoilpH.toFixed(4) + " becomes " +
               pH.toFixed(4) + " after " + ibu.boilTime.value + "-minute boil");
    }
  return pH;
}

//------------------------------------------------------------------------------
// Compute loss factor for IAA based on pH

function compute_LF_IAA_pH(ibu) {
  var pH = ibu.pH.value;
  var preBoilpH = 0.0;
  var preOrPostBoilpH = ibu.preOrPostBoilpH.value;
  var LF_pH = 1.0;

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
// Compute loss factor (LF) for filtering

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
// Compute loss factor (LF) for age of the beer

function compute_LF_age(ibu) {
  var beerAge_weeks = 0.0;
  var LF_age = 1.0;

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
  if (SMPH.verbose > 5) {
    console.log("LF age : " + LF_age.toFixed(4));
  }
  return LF_age;
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
    console.log("    IAA LF: LF_boil=" + SMPH.IAA_LF_boil.toFixed(4) +
              ", LF_pH=" + compute_LF_IAA_pH(ibu).toFixed(4) + 
              ", LF_OG=" + compute_LF_OG_SMPH(ibu, hopIdx).toFixed(4) + 
              ", LF_ferment=" + compute_LF_ferment(ibu).toFixed(4) +
              ", LF_krausen=" + compute_LF_IAA_krausen(ibu).toFixed(4) +
              ", LF_filtering=" + compute_LF_filtering(ibu).toFixed(4) + 
              ", LF_age=" + compute_LF_age(ibu).toFixed(4));
  }
  LF_IAA = SMPH.IAA_LF_boil * compute_LF_IAA_pH(ibu) * 
           compute_LF_OG_SMPH(ibu, hopIdx) * 
           compute_LF_ferment(ibu) * compute_LF_IAA_krausen(ibu) * 
           compute_LF_filtering(ibu) * compute_LF_age(ibu);
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
  var AA_undis_mg = 0.0; // undissolved AA, in mg
  var AA_init = 0.0;    // [AA]_0
  var AA_init_mg = 0.0; // initial amount of AA added, in mg
  var AA_limit = 0.0;
  var AA_limit_func_A = 0.0;
  var AA_limit_func_B = 0.0;
  var AA_limit_minLimit = 0.0;
  var AA_limit_minLimit_orig = SMPH.AA_limit_minLimit;
  var AA_limit_maxLimit = 0.0;
  var AA_limit_maxLimit_orig = SMPH.AA_limit_maxLimit;
  var AA_percent_wort = 0.0;
  var AA_xfer_mg  = 0.0;
  var AA_undis_xfer_mg  = 0.0;
  var additionTime = 0.0;
  var boilTime = ibu.boilTime.value;
  var chillingTime = 0.0;
  var coolingMethod = ibu.forcedDecayType.value;
  var currVolume = 0.0;
  var dAA_dis_mg = 0.0;
  var dAA_undis_mg = 0.0;
  var dAA_xfer_mg = 0.0;
  var decayRate = 0.0;
  var dIAA_dis_mg = 0.0;
  var dIAA_xfer_mg = 0.0;
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
  var IAA_undis_mg = 0.0;
  var IAA_dis = 0.0;
  var IAA_undis = 0.0;
  var IAA_xfer_mg = 0.0;
  var IAA_undis_xfer_mg = 0.0;
  var initVolume = 0.0;
  var integrationTime = 0.0;
  var isTempDecayLinear = 0;
  var k1 = 0.0;
  var k2 = 0.0;
  var k1undis = 0.0;
  var k2undis = 0.0;
  var k_dis = 0.0;
  var linParamB_Kelvin = 0.0;
  var minLimitTempScale = 0.0;
  var newAA  = 0.0;
  var newIAA = 0.0;
  var origWhirlpoolTime = 0.0;
  var postBoilTime = 0.0;
  var postBoilVolume = 0.0;
  var preAdd_AA = 0.0;
  var preAdd_AAundis = 0.0;
  var relRate = 0.0;
  var subBoilEvapRate = 0.0;
  var t = 0.0;
  var tempC = 0.0;
  var tempK = 0.0;
  var tempNoBase = 0.0;
  var topoffScale = 0.0;
  var boilK = 0.0;
  var roomTempK = 0.0;
  var slope = 0.0;
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
  // k1undis = 7.9*Math.pow(10.0,11.0)*Math.exp(-11858.0/tempK); // FIX
  // k2undis = 4.1*Math.pow(10.0,12.0)*Math.exp(-12994.0/tempK); // FIX
  // k_dis = 2.7*6.0*7.9*Math.pow(10.0,11.0)*Math.exp(-11858.0/tempK);   // FIX
  k1undis = 0.0;
  k2undis = 0.0;
  k_dis = 0.0;
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
  origWhirlpoolTime = whirlpoolTime; // wpTime might be modified; keep a copy
  totalXferTime = 0.0;
  AA_dis_mg = 0.0; // mg of AA dissolved, not ppm to account for volume changes
  IAA_dis_mg= 0.0; // mg of IAA dissolved, not ppm to account for volume changes
  AA_xfer_mg  = 0.0; // mg of AA transferred (and cooled) via counterflow
  AA_undis_xfer_mg = 0.0; // mg of undissolved AA transferred via counterflow
  IAA_xfer_mg = 0.0; // mg of IAA transferred via counterflow
  IAA_undis_xfer_mg = 0.0; // mg of undissolved IAA transferred via counterflow

  for (t = boilTime; finished == false; t = t - integrationTime) {

    // -------------------------------------------------------------------------
    // adjust (as needed) temperature, whirlpool time, and volume during
    // counterflow. Also, check if done yet based on temp, time, and volume.

    // if post boil (t <= 0), then adjust temperature and degree of utilization
    // and if counterflow chiller and doing whirlpool, reduce volume of wort
    if (t <= 0) {
      postBoilTime = t * -1.0;
      if (postBoilTime == ibu.whirlpoolTime.value && SMPH.verbose > 0) {
        console.log("---- at " + t + ", starting use of " + 
                    coolingMethod + " chiller ---");
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
        if (holdTempCounter > origWhirlpoolTime) {
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

      // k1undis = 7.9*Math.pow(10.0,11.0)*Math.exp(-11858.0/tempK); // FIX
      // k2undis = 4.1*Math.pow(10.0,12.0)*Math.exp(-12994.0/tempK); // FIX
      // k_dis = 2.7*6.0*7.9*Math.pow(10.0,11.0)*Math.exp(-11858.0/tempK);   // FIX
      k1undis = 0.0;
      k2undis = 0.0;
      k_dis = 0.0;

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

        newAA = (AA_undis_mg / currVolume) * (currVolume - volumeChange);
        AA_undis_xfer_mg += AA_undis_mg - newAA;
        AA_undis_mg = newAA;

        newIAA = (IAA_dis_mg / currVolume) * (currVolume - volumeChange);
        IAA_xfer_mg += IAA_dis_mg - newIAA;
        IAA_dis_mg = newIAA;

        newIAA = (IAA_undis_mg / currVolume) * (currVolume - volumeChange);
        IAA_undis_xfer_mg += IAA_undis_mg - newIAA;
        IAA_undis_mg = newIAA;

        if (AA_dis_mg < 0.0)    AA_dis_mg  = 0.0;
        if (AA_undis_mg < 0.0)  AA_undis_mg = 0.0;
        if (IAA_dis_mg < 0.0)   IAA_dis_mg = 0.0;
        if (IAA_undis_mg < 0.0) IAA_undis_mg = 0.0;

        // adjust AA and IAA levels of each separate addition
        for (hopIdx = 0; hopIdx < ibu.add.length; hopIdx++) {
          newAA = (ibu.add[hopIdx].AA_dis_mg / currVolume) *
                  (currVolume - volumeChange);
          ibu.add[hopIdx].AA_xfer_mg += ibu.add[hopIdx].AA_dis_mg - newAA;
          ibu.add[hopIdx].AA_dis_mg = newAA;

          newAA = (ibu.add[hopIdx].AA_undis_mg / currVolume) *
                  (currVolume - volumeChange);
          ibu.add[hopIdx].AA_undis_xfer_mg += ibu.add[hopIdx].AA_undis_mg-newAA;
          ibu.add[hopIdx].AA_undis_mg = newAA;

          newIAA = (ibu.add[hopIdx].IAA_dis_mg / currVolume) *
                   (currVolume - volumeChange);
          ibu.add[hopIdx].IAA_xfer_mg += ibu.add[hopIdx].IAA_dis_mg - newIAA;
          ibu.add[hopIdx].IAA_dis_mg = newIAA;

          newIAA = (ibu.add[hopIdx].IAA_undis_mg / currVolume) *
                   (currVolume - volumeChange);
          ibu.add[hopIdx].IAA_undis_xfer_mg += ibu.add[hopIdx].IAA_undis_mg - 
                                               newIAA;
          ibu.add[hopIdx].IAA_undis_mg = newIAA;

          if (ibu.add[hopIdx].AA_dis_mg < 0.0) 
            ibu.add[hopIdx].AA_dis_mg = 0.0;
          if (ibu.add[hopIdx].AA_undis_mg < 0.0) 
            ibu.add[hopIdx].AA_undis_mg = 0.0;
          if (ibu.add[hopIdx].IAA_dis_mg < 0.0) 
            ibu.add[hopIdx].IAA_dis_mg= 0.0;
          if (ibu.add[hopIdx].IAA_undis_mg < 0.0) 
            ibu.add[hopIdx].IAA_undis_mg= 0.0;
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
        preAdd_AAundis = AA_undis_mg;
        AA_dis_mg += AA_init_mg;

        // if use solubility limit, see if we need to change AA concentration
        if (useSolubilityLimit) {
          AA_limit_minLimit = AA_limit_minLimit_orig;
          AA_limit_maxLimit = AA_limit_maxLimit_orig;
          // if add hops at below boiling, lower the solubility limit
          if (tempK < 373.15) {
            // change AA_limit_minLimit, AA_limit_maxLimit based on temperature
            boilK = ibu.boilTemp.value + 273.15;
            roomTempK   = 20.0 + 273.15;
            slope = (SMPH.AA_limit_minLimit - SMPH.AA_limit_min_roomTemp) / 
                    (boilK - roomTempK);
            AA_limit_minLimit = slope * (tempK - roomTempK) + 
                                SMPH.AA_limit_min_roomTemp;
            slope = (SMPH.AA_limit_maxLimit - SMPH.AA_limit_max_roomTemp) / 
                    (boilK - roomTempK);
            AA_limit_maxLimit = slope * (tempK - roomTempK) + 
                                SMPH.AA_limit_max_roomTemp;
            if (SMPH.verbose > 2) {
              console.log("   change due to low temp " + tempK.toFixed(4) +
                    ": AA_limit_maxLimit = " + AA_limit_minLimit.toFixed(4) +
                    ", AA_limit_minLimit = " + AA_limit_maxLimit.toFixed(4));
            }
          }
          if (AA_limit_maxLimit > AA_limit_minLimit) {
            AA_limit_func_A = AA_limit_maxLimit;
            AA_limit_func_B =
                 -1.0* Math.log(1.0 - (AA_limit_minLimit/AA_limit_maxLimit)) / 
                       AA_limit_minLimit;
            if (SMPH.verbose > 2) {
              console.log("    AA_limit_func_A = " + AA_limit_func_A.toFixed(4) +
                        ", AA_limit_func_B = " + AA_limit_func_B.toFixed(6));
            }
            AA_dis = AA_dis_mg / currVolume;
            AA_limit = AA_limit_func_A * 
                       (1.0 - Math.exp(-1.0 * AA_limit_func_B * AA_dis));
            if (AA_limit < AA_limit_minLimit) {
              AA_limit = AA_limit_minLimit;
            }
          } else {
            AA_limit = AA_limit_minLimit;
          }

          if (SMPH.verbose > 2) {
            console.log("    AA_limit = " + AA_limit.toFixed(4) + " = " +
                  AA_limit_func_A.toFixed(4) + " * (1 - exp(-" + 
                  AA_limit_func_B.toFixed(6) + "*" + AA_dis.toFixed(4) + "))");
          }

          AA_dis = AA_dis_mg / currVolume;
          if (AA_dis > AA_limit) {
            AA_undis_mg = (AA_dis - AA_limit) * currVolume;
            AA_dis_mg = AA_limit * currVolume;
            AA_dis = AA_limit;
          }

          // get dissolved AA in mg for this addition of hops
          ibu.add[hopIdx].AA_dis_mg = AA_dis_mg - preAdd_AA;
          ibu.add[hopIdx].AA_undis_mg = AA_undis_mg - preAdd_AAundis;

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
          if (ibu.add[hopIdx].AA_undis_mg < 0) {
            console.log("Info: correcting negative [AA] (undis) = " + 
                        ibu.add[hopIdx].AA_undis_mg.toFixed(4));
            diff = ibu.add[hopIdx].AA_undis_mg;
            for (revIdx = hopIdx-1; revIdx >= 0; revIdx--) {
              // account for negative [AA]undis by adjusting previous addition
              ibu.add[revIdx+1].AA_undis_mg = 0.0;
              ibu.add[revIdx].AA_undis_mg += diff;
              if (ibu.add[revIdx].AA_undis_mg > 0) {
                break;
              }
              diff = ibu.add[revIdx].AA_undis_mg;
            }
            if (revIdx < 0) {
              console.log("Warning: can't correct negative [AA]: " + diff);
            }
          }

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

    // decrease levels of undissolved AA via conversion to undissolved IAA
    if (AA_undis_mg > 0.0 && k1undis > 0.0) {
      dAA_undis_mg = -1.0 * k1undis * AA_undis_mg;
      AA_undis_mg += dAA_undis_mg * integrationTime;
      if (AA_undis_mg < 0.0) AA_undis_mg = 0.0;
    }

    // change levels of undissolved IAA
    if (IAA_undis_mg > 0.0 && (k1undis > 0.0 || k2undis > 0.0)) {
      dIAA_undis_mg = (k1undis * AA_undis_mg) - (k2undis * IAA_undis_mg);
      IAA_undis_mg += dIAA_undis_mg * integrationTime;
      if (IAA_undis_mg < 0.0) IAA_undis_mg = 0.0;
    }

    // undissolved AA becomes dissolved AA via first-order reaction
    if (AA_undis_mg > 0.0 && k_dis > 0.0) {
      dAA_xfer_mg = k_dis * Math.pow(AA_undis_mg, 0.667);
      if (AA_dis_mg + (dAA_xfer_mg * integrationTime) > (AA_limit*currVolume)) {
        dAA_xfer_mg = ((AA_limit*currVolume) - AA_dis_mg) / integrationTime;
      }
      if (AA_undis_mg > dAA_xfer_mg * integrationTime) {
        AA_dis_mg += dAA_xfer_mg * integrationTime;
        AA_undis_mg -= dAA_xfer_mg * integrationTime;
      } else {
        AA_dis_mg += AA_undis_mg;
        AA_undis_mg = 0.0;
      }
    }

    // undissolved IAA becomes dissolved IAA via first-order reaction
    if (IAA_undis_mg > 0.0 && k_dis > 0.0) {
      dIAA_xfer_mg = k_dis * Math.pow(IAA_undis_mg, 0.667);
      if (IAA_undis_mg > dIAA_xfer_mg * integrationTime) {
        IAA_dis_mg += dIAA_xfer_mg * integrationTime;
        IAA_undis_mg -= dIAA_xfer_mg * integrationTime;
      } else {
        IAA_dis_mg += IAA_undis_mg;
        IAA_undis_mg = 0.0;
      }
    }

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

      if (ibu.add[hopIdx].AA_undis_mg > 0.0 && k1undis > 0.0) {
        dAA_undis_mg = -1.0 * k1undis * ibu.add[hopIdx].AA_undis_mg;
        ibu.add[hopIdx].AA_undis_mg += dAA_undis_mg * integrationTime;
        if (ibu.add[hopIdx].AA_undis_mg < 0.0) 
          ibu.add[hopIdx].AA_undis_mg = 0.0;
      }

      if (ibu.add[hopIdx].IAA_undis_mg > 0.0 && 
          (k1undis > 0.0 || k2undis > 0.0)) {
        dIAA_undis_mg = (k1undis * ibu.add[hopIdx].AA_undis_mg) - 
                        (k2undis * ibu.add[hopIdx].IAA_undis_mg);
        ibu.add[hopIdx].IAA_undis_mg += dIAA_undis_mg * integrationTime;
        if (ibu.add[hopIdx].IAA_undis_mg < 0.0) 
          ibu.add[hopIdx].IAA_undis_mg = 0.0;
      }

      if (ibu.add[hopIdx].AA_undis_mg > 0.0 && k_dis > 0.0) {
        dAA_xfer_mg = k_dis * Math.pow(ibu.add[hopIdx].AA_undis_mg, 0.667);
        // JPH FIX THIS:
        // Note: this isn't quite correct, since limit applies to all additions
        if (ibu.add[hopIdx].AA_dis_mg + (dAA_xfer_mg * integrationTime) > 
            (AA_limit*currVolume)) {
          dAA_xfer_mg = ((AA_limit*currVolume) - ibu.add[hopIdx].AA_dis_mg) / 
                         integrationTime;
        }
        if (ibu.add[hopIdx].AA_undis_mg > dAA_xfer_mg * integrationTime) {
          ibu.add[hopIdx].AA_dis_mg += dAA_xfer_mg * integrationTime;
          ibu.add[hopIdx].AA_undis_mg -= dAA_xfer_mg * integrationTime;
        } else {
          ibu.add[hopIdx].AA_dis_mg += ibu.add[hopIdx].AA_undis_mg;
          ibu.add[hopIdx].AA_undis_mg = 0.0;
        }
      }

      if (ibu.add[hopIdx].IAA_undis_mg > 0.0 && k_dis > 0.0) {
        dIAA_xfer_mg = k_dis * Math.pow(ibu.add[hopIdx].IAA_undis_mg, 0.667);
        if (ibu.add[hopIdx].IAA_undis_mg > dIAA_xfer_mg * integrationTime) {
          ibu.add[hopIdx].IAA_dis_mg += dIAA_xfer_mg * integrationTime;
          ibu.add[hopIdx].IAA_undis_mg -= dIAA_xfer_mg * integrationTime;
        } else {
          ibu.add[hopIdx].IAA_dis_mg += ibu.add[hopIdx].IAA_undis_mg;
          ibu.add[hopIdx].IAA_undis_mg = 0.0;
        }
      }

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
      console.log("       AA(dis) = " + AA_dis.toFixed(4) + " ppm " +
                          "with delta " + dAA_dis_mg.toFixed(6) + " mg/min");
      console.log("       AA(undis) = " + (AA_undis_mg/currVolume).toFixed(4) + " ppm " +
                          "with delta " + dAA_undis_mg.toFixed(6) + " mg/min" +
                          ", k=" + k_dis.toFixed(8));
      console.log("       IAA(dis) = " + IAA_dis.toFixed(4) + " ppm " +
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
  FCT = (-1.0 * t) - ibu.whirlpoolTime.value;

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
    ibu.add[hopIdx].hopPP_wort = ibu.add[hopIdx].hopPP_dis_mg / finalVolume;
    if (SMPH.verbose > 0) {
      console.log("  addition " + hopIdx + " has vol=" + 
                finalVolume.toFixed(4) + " liters, [IAA]=" +
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
    // one we want to base losses on.
    if (preOrPostBoilpH == "preBoilpH") {
      preBoilpH = pH;
      pH = compute_postBoil_pH(preBoilpH);
    }

    // formula from blog post 'The Effect of pH on Utilization and IBUs'
    // LF_pH = (0.8948 * pH) - 4.145;  OLD FORMULA
    // LF_pH = (1.182936 * pH) - 5.80188; with bug in oAA_scaling
    LF_pH = (1.178506 * pH) - 5.776411
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

// ----------- oAA -------------------------------------------------------------

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

  // the oAA_percent_init is for cones; the value for pellets is probably
  // higher (because more surface area), but this (hopefully) rarely comes 
  // into play because oAA_boil for pellets is much larger.  So, just use the
  // cones value even if we have pellets.
  // 'k' is from Garetz
  ratio = 1.0 - (ibu.add[hopIdx].percentLoss.value / 100.0);
  k = Math.log(1.0 / ratio) / (365.0 / 2.0);
  if (SMPH.verbose > 5) {
    console.log("%loss = " + ibu.add[hopIdx].percentLoss.value.toFixed(2) +
              " and so k = " + k.toFixed(6));
  }
  // oAA_fresh modeled as 3.5 days decay at 20'C, which is then multiplied 
  // by AA rating.  For Maye paper, average AA of Zeus is 15.75% and SF = 50%,
  // so 1-(1/exp(0.003798*1*1*3.5) * 0.1575 = 0.002 = 0.2% of weight of hops.
  // where 0.003798 is k for SF 50%.
  oAA_fresh = 1.0 - (1.0 / Math.exp(k * 1.0 * 1.0 * 3.5));

  AAloss_percent = 1.0 - ibu.add[hopIdx].freshnessFactor.value;
  oAA_percent_init = (AAloss_percent * SMPH.oAA_storageFactor) + oAA_fresh;
  if (SMPH.verbose > 4) {
    console.log("    [oAA] storage factors: fresh=" + oAA_fresh.toFixed(5) +
              ", loss=" + AAloss_percent.toFixed(5) +
              ", storage=" + SMPH.oAA_storageFactor.toFixed(4) + 
              ", %init=" + oAA_percent_init.toFixed(5));
  }

  // the AA available for oxidation is affected by the AA solubility limit;
  // figure out the relative impact of this solubility limit
  relativeAA = 1.0;
  if (ibu.add[hopIdx].AA_init > 0.0 && currVolume > 0.0) {
    relativeAA = ibu.add[hopIdx].AA_dis_mg/(ibu.add[hopIdx].AA_init*currVolume);
  }

  // console.log("AA : added = " + (ibu.add[hopIdx].AA_init*currVolume).toFixed(3) + 
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
    console.log("    [oAA] boil factor: " + oAA_percent_boilFactor.toFixed(5) +
              " from fresh=" + ibu.add[hopIdx].freshnessFactor.value.toFixed(5) +
              ", boil=" + SMPH.oAA_boilFactor.toFixed(5) + 
              ", relAA=" + relativeAA.toFixed(5));
  }
  // oAA_addition is oAA added to wort, in mg

  // boiling has no effect on AA that have oxidized prior to boil (FV exp #74)
  // console.log("INIT = " + oAA_percent_init + ", BOIL = " + oAA_percent_boilFactor);
  oAA_percent = oAA_percent_boilFactor;
  if (oAA_percent_init > oAA_percent_boilFactor) {
    oAA_percent = oAA_percent_init;
  }
  oAA_addition = oAA_percent * (ibu.add[hopIdx].AA.value/100.0) * 
                  ibu.add[hopIdx].weight.value * 1000.0;

  // note: solubility limit of oAA is large enough so that all are dissolved
  ibu.add[hopIdx].oAA_dis_mg = oAA_addition;
  if (SMPH.verbose > 3) {
    console.log("    addition " + hopIdx + " [oAA] boil = " + 
                (ibu.add[hopIdx].oAA_dis_mg/currVolume).toFixed(4) + 
                " from (" + oAA_percent_init + " + " + oAA_percent_boilFactor +
                ") * " + ibu.add[hopIdx].AA.value/100.0 + " * " +
                ibu.add[hopIdx].weight.value + " * 1000.0 / " + 
                currVolume);
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
  var oAA_LF_boil = 0.0;

  // JPH DEBUG: enforce that oAA_LF_boil is same as IAA:
  oAA_LF_boil = SMPH.IAA_LF_boil;

  LF_oAA = oAA_LF_boil * 
           compute_LF_nonIAA_pH(ibu) *
           compute_LF_OG_SMPH(ibu, hopIdx) * 
           compute_LF_ferment(ibu) * 
           compute_LF_nonIAA_krausen(ibu) * 
           compute_LF_filtering(ibu) *
           compute_LF_age(ibu);
  if (LF_oAA > 1.0) LF_oAA = 1.0;
  if (SMPH.verbose > 5) {
    console.log("    LF oAA " + LF_oAA.toFixed(4));
    console.log("       from " + oAA_LF_boil + ", " +
                                 compute_LF_nonIAA_pH(ibu) + ", " + 
                                 compute_LF_OG_SMPH(ibu, hopIdx) + ", " + 
                                 compute_LF_ferment(ibu) + ", " + 
                                 compute_LF_nonIAA_krausen(ibu) + ", " + 
                                 compute_LF_filtering(ibu) + ", " + 
                                 compute_LF_age(ibu));
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
    console.log("    oAA in finished beer = " + oAA_beer.toFixed(4) + 
                " from add" + hopIdx + "=" + ibu.add[hopIdx].oAA_wort.toFixed(4) + 
                " in wort and LF " + compute_LF_oAA(ibu,hopIdx));
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
  var oBA_percent = 0.0;
  var ratio = 0.0;

  // the oBA_percent_init is for cones; the value for pellets is probably
  // higher (because more surface area), but this (hopefully) rarely comes 
  // into play because oBA_boil for pellets is much larger.  But even this 
  // doesn't matter, because the oxidized beta acids are almost all (??)
  // transformed into hulpinic acid.
  // So, just use the cones value even if we have pellets.
  // 'k' is from Garetz
  ratio = 1.0 - (ibu.add[hopIdx].percentLoss.value / 100.0);
  k = Math.log(1.0 / ratio) / (365.0 / 2.0);
  if (SMPH.verbose > 5) {
    console.log("%loss = " + ibu.add[hopIdx].percentLoss.value.toFixed(2) +
              " and so k = " + k.toFixed(6));
  }
  // oBA_fresh is modeled the same way as oAA_fresh
  oBA_fresh = 1.0 - (1.0 / Math.exp(k * 1.0 * 1.0 * 3.5));

  BAloss_percent = 1.0 - ibu.add[hopIdx].freshnessFactor.value;
  oBA_percent_init = (BAloss_percent * SMPH.oBA_storageFactor) + oBA_fresh;
  if (SMPH.verbose > 4) {
    console.log("    [oBA] storage factors: fresh=" + oBA_fresh.toFixed(5) +
              ", loss=" + BAloss_percent.toFixed(5) +
              ", %init=" + oBA_percent_init.toFixed(5));
  }

  oBA_percent_boilFactor = ibu.add[hopIdx].freshnessFactor.value *
                           SMPH.oBA_boilFactor;

  // the following lines might be true, but no data to evaluate either way,
  // and almost no impact on results:
  // if (ibu.add[hopIdx].hopForm.value == "pellets") {
    // oBA_percent_boilFactor *= ibu.add[hopIdx].pelletFactor;
  // }

  // oBA_addition is oBA added to wort, in mg

  // assume that boiling has no effect on BA that have oxidized prior to 
  // boil (same as AA)
  oBA_percent = oBA_percent_boilFactor;
  if (oBA_percent_init > oBA_percent_boilFactor) {
    oBA_percent = oBA_percent_init;
  }
  oBA_addition = oBA_percent * (ibu.add[hopIdx].BA.value / 100.0) * 
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

  LF_oBA = SMPH.oBA_LF_boil * 
           compute_LF_nonIAA_pH(ibu) *
           compute_LF_OG_SMPH(ibu, hopIdx) * 
           compute_LF_ferment(ibu) * 
           compute_LF_nonIAA_krausen(ibu) * 
           compute_LF_filtering(ibu) * 
           compute_LF_age(ibu);

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
  // assume pH has effect on hop PP concentration similar to other nonIAA
  // assume krausen affects hop PP the same way as other nonIAA
  // assume [PP] doesn't change much with age (or filtering)
  LF_hopPP = SMPH.LF_hopPP * 
             compute_LF_nonIAA_pH(ibu) * 
             SMPH.ferment_hopPP * 
             compute_LF_nonIAA_krausen(ibu);

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
    console.log("    from  wort " + ibu.add[hopIdx].hopPP_wort);
    console.log("    and  LF " + compute_LF_hopPP(ibu));
  }
  return PP_beer;
}

// -----------------------------------------------------------------------------

function compute_maltPP_beer(ibu) {
  var IBU_malt = 0.0;
  var points = 0.0;
  var PP_malt = 0.0;
  var pH = ibu.pH.value;
  var preBoilpH = ibu.pH.value;
  var preOrPostBoilpH = ibu.preOrPostBoilpH.value;
  var preBoilIBU = 0.0;
  var slope = 1.7348;
  var IBU1 = 0.70;
  var factor = 0.0;

  // If user specifies pre-boil pH, estimate the post-boil pH
  if (preOrPostBoilpH == "preBoilpH") {
    preBoilpH = pH;
    pH = compute_postBoil_pH(preBoilpH);
  }

  preBoilpH = 5.75;  // approximate value before pH adjustment
  points = (ibu.OG.value - 1.0) * 1000.0;
  preBoilIBU = points * 0.0190;
  factor = (slope * (preBoilpH - pH) / IBU1) + 1.0;
  IBU_malt = preBoilIBU * factor;
  // console.log("computing maltPP:");
  // console.log("  gravity " + ibu.OG.value);
  // console.log("  points " + points);
  // console.log("  pre-boil pH " + preBoilpH);
  // console.log("  post-boil pH " + pH);
  // console.log("  correction factor " + factor);
  // console.log("  IBU before boil " + preBoilIBU);
  // console.log("  IBU after correction " + IBU_malt);

  // the convertion from IBU to PP is not correct, but in the end we
  // want IBUs not PP and so it doesn't matter; we just need to undo
  // the Peacock conversion that we'll do later.
  PP_malt = IBU_malt * 69.68 / 51.2;
  // console.log("  PP_malt " + PP_malt);
  if (SMPH.verbose > 3) {
    console.log("malt IBU  in finished beer = " + IBU_malt.toFixed(4));
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

