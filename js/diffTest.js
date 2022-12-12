//==============================================================================
//
// diffTest.js : code for illustrating same/different comparison
//               perceptual testing, significance, likelihood ratios, etc.
//
// Copyright (C) 2021  John-Paul Hosom, all rights reserved.
// Contact information: alchemyoverlord © yahoo · com
//
// Version 1.0.1 : January 10, 2021 -- April 11, 2021  (JPH)
//                 Initial version.
//

"use strict";

var diffTest = diffTest || {};

diffTest._construct = function() {

this.initialize_diffTest = function() {

  // user variables used throughout this namespace
  this.showOrHideText = new Object();
  this.showOrHideText.id = "diffTest.showOrHideText";
  this.showOrHideText.inputType = "radioButton";
  this.showOrHideText.value = "showText";
  this.showOrHideText.userSet = 0;
  this.showOrHideText.defaultValue = "showText";
  this.showOrHideText.additionalFunction = diffTest.showOrHideTextFunction;
  this.showOrHideText.additionalFunctionArgs = "";

  this.randSeed = new Object();
  this.randSeed.id = "diffTest.randSeed";
  this.randSeed.inputType = "int";
  this.randSeed.value = 0;
  this.randSeed.userSet = 0;
  this.randSeed.display = "";
  this.randSeed.min = 0;
  this.randSeed.max = 10000;
  this.randSeed.description = "random number seed";
  this.randSeed.defaultValue = 0;
  this.randSeed.updateFunction = diffTest.initPlotAll;
  this.randSeed.updateFunctionArgs = [true, true];

  this.d_prime = new Object();
  this.d_prime.id = "diffTest.d_prime";
  this.d_prime.inputType = "float";
  this.d_prime.value = 1.0;
  this.d_prime.userSet = 0;
  this.d_prime.precision = 2;
  this.d_prime.minPrecision = 2;
  this.d_prime.display = "";
  this.d_prime.min = 0.0;
  this.d_prime.max = 100.0;
  this.d_prime.description = "d prime";
  this.d_prime.defaultValue = 1.0;
  this.d_prime.updateFunction = diffTest.initPlotPerceptualMeasurement;
  this.d_prime.updateFunctionArgs = [true, true];

  this.N = new Object();
  this.N.id = "diffTest.N";
  this.N.inputType = "int";
  this.N.value = 20;
  this.N.userSet = 0;
  this.N.display = "";
  this.N.min = 1;
  this.N.max = 10000;
  this.N.description = "number of test cases in one trial";
  this.N.defaultValue = 20;
  this.N.updateFunction = diffTest.initPlotPerceptualTestOneTrial;
  this.N.updateFunctionArgs = [true, true];

  this.testType = new Object();
  this.testType.id = "diffTest.testType";
  this.testType.inputType = "radioButton";
  this.testType.value = "3-AFC";
  this.testType.userSet = 0;
  this.testType.defaultValue = "3-AFC";
  this.testType.updateFunction = diffTest.initPlotPerceptualTestOneTrial;
  this.testType.updateFunctionArgs = [true, true];

  this.alpha = new Object();
  this.alpha.id = "diffTest.alpha";
  this.alpha.inputType = "float";
  this.alpha.value = 0.05;
  this.alpha.userSet = 0;
  this.alpha.precision = 2;
  this.alpha.minPrecision = 2;
  this.alpha.display = "";
  this.alpha.min = 0;
  this.alpha.max = 1.0;
  this.alpha.description = "alpha value for H0"
  this.alpha.defaultValue = 0.05;
  this.alpha.updateFunction = diffTest.initPlotPerceptualTestH0;
  this.alpha.updateFunctionArgs = [true, true];


  // user variables specific to perceptual measurement
  this.sim2AFC_N = new Object();
  this.sim2AFC_N.id = "diffTest.sim2AFC_N";
  this.sim2AFC_N.inputType = "int";
  this.sim2AFC_N.value = 10;
  this.sim2AFC_N.userSet = 0;
  this.sim2AFC_N.display = "";
  this.sim2AFC_N.min = 0;
  this.sim2AFC_N.max = 10000;
  this.sim2AFC_N.description = "number of simulations of 2-AFC";
  this.sim2AFC_N.defaultValue = 10;
  this.sim2AFC_N.updateFunction = diffTest.initPlotPerceptualMeasurement;
  this.sim2AFC_N.updateFunctionArgs = [true, false];

  this.sim2AFC_delay = new Object();
  this.sim2AFC_delay.id = "diffTest.sim2AFC_delay";
  this.sim2AFC_delay.inputType = "float";
  this.sim2AFC_delay.value = 1.0;
  this.sim2AFC_delay.userSet = 0;
  this.sim2AFC_delay.display = "";
  this.sim2AFC_delay.min = -1.0;
  this.sim2AFC_delay.max = 60.0;
  this.sim2AFC_delay.description = "simulation delay for 2-AFC";
  this.sim2AFC_delay.defaultValue = 1.0;
  this.sim2AFC_delay.updateFunction = diffTest.initPlotPerceptualMeasurement;
  this.sim2AFC_delay.updateFunctionArgs = [true, false];

  // user variables specific to perceptual measurement, one trial
  this.simTestOneTrial_delay = new Object();
  this.simTestOneTrial_delay.id = "diffTest.simTestOneTrial_delay";
  this.simTestOneTrial_delay.inputType = "float";
  this.simTestOneTrial_delay.value = 1.0;
  this.simTestOneTrial_delay.userSet = 0;
  this.simTestOneTrial_delay.display = "";
  this.simTestOneTrial_delay.min = -1.0;
  this.simTestOneTrial_delay.max = 60.0;
  this.simTestOneTrial_delay.description ="simulation delay for one-trial test";
  this.simTestOneTrial_delay.defaultValue = 1.0;
  this.simTestOneTrial_delay.updateFunction =
       diffTest.initPlotPerceptualTestOneTrial;
  this.simTestOneTrial_delay.updateFunctionArgs = [true, false];

  // user variables specific to perceptual measurement, multiple trials
  this.simTestMultiTrial_T = new Object();
  this.simTestMultiTrial_T.id = "diffTest.simTestMultiTrial_T";
  this.simTestMultiTrial_T.inputType = "int";
  this.simTestMultiTrial_T.value = 200;
  this.simTestMultiTrial_T.userSet = 0;
  this.simTestMultiTrial_T.display = "";
  this.simTestMultiTrial_T.min = 0;
  this.simTestMultiTrial_T.max = 10000;
  this.simTestMultiTrial_T.description = "number of test cases in one trial";
  this.simTestMultiTrial_T.defaultValue = 200;
  this.simTestMultiTrial_T.updateFunction =
       diffTest.initPlotPerceptualTestMultiTrial;
  this.simTestMultiTrial_T.updateFunctionArgs = [true, false];

  this.simTestMultiTrial_delay = new Object();
  this.simTestMultiTrial_delay.id = "diffTest.simTestMultiTrial_delay";
  this.simTestMultiTrial_delay.inputType = "float";
  this.simTestMultiTrial_delay.value = 0.0;
  this.simTestMultiTrial_delay.userSet = 0;
  this.simTestMultiTrial_delay.display = "";
  this.simTestMultiTrial_delay.min = -1.0;
  this.simTestMultiTrial_delay.max = 60.0;
  this.simTestMultiTrial_delay.description =
       "simulation delay for multiple-trial test";
  this.simTestMultiTrial_delay.defaultValue = 0.0;
  this.simTestMultiTrial_delay.updateFunction =
       diffTest.initPlotPerceptualTestMultiTrial;
  this.simTestMultiTrial_delay.updateFunctionArgs = [true, false];

  // user variables specific to H0 testing
  this.simTestH0_T = new Object();
  this.simTestH0_T.id = "diffTest.simTestH0_T";
  this.simTestH0_T.inputType = "int";
  this.simTestH0_T.value = 200;
  this.simTestH0_T.userSet = 0;
  this.simTestH0_T.display = "";
  this.simTestH0_T.min = 0;
  this.simTestH0_T.max = 10000;
  this.simTestH0_T.description = "number of test cases in one trial";
  this.simTestH0_T.defaultValue = 200;
  this.simTestH0_T.updateFunction = diffTest.initPlotPerceptualTestH0;
  this.simTestH0_T.updateFunctionArgs = [true, false];

  this.simTestH0_delay = new Object();
  this.simTestH0_delay.id = "diffTest.simTestH0_delay";
  this.simTestH0_delay.inputType = "float";
  this.simTestH0_delay.value = 0.0;
  this.simTestH0_delay.userSet = 0;
  this.simTestH0_delay.display = "";
  this.simTestH0_delay.min = -1.0;
  this.simTestH0_delay.max = 60.0;
  this.simTestH0_delay.description =
       "simulation delay for multiple-trial test";
  this.simTestH0_delay.defaultValue = 0.0;
  this.simTestH0_delay.updateFunction = diffTest.initPlotPerceptualTestH0;
  this.simTestH0_delay.updateFunctionArgs = [true, false];

  // user variables specific to H0 and H1 testing
  this.simTestH0H1_T = new Object();
  this.simTestH0H1_T.id = "diffTest.simTestH0H1_T";
  this.simTestH0H1_T.inputType = "int";
  this.simTestH0H1_T.value = 200;
  this.simTestH0H1_T.userSet = 0;
  this.simTestH0H1_T.display = "";
  this.simTestH0H1_T.min = 0;
  this.simTestH0H1_T.max = 10000;
  this.simTestH0H1_T.description = "number of test cases in one trial";
  this.simTestH0H1_T.defaultValue = 200;
  this.simTestH0H1_T.updateFunction = diffTest.initPlotPerceptualTestH0H1;
  this.simTestH0H1_T.updateFunctionArgs = [true, false];

  this.simTestH0H1_delay = new Object();
  this.simTestH0H1_delay.id = "diffTest.simTestH0H1_delay";
  this.simTestH0H1_delay.inputType = "float";
  this.simTestH0H1_delay.value = 0.0;
  this.simTestH0H1_delay.userSet = 0;
  this.simTestH0H1_delay.display = "";
  this.simTestH0H1_delay.min = -1.0;
  this.simTestH0H1_delay.max = 60.0;
  this.simTestH0H1_delay.description =
       "simulation delay for multiple-trial test";
  this.simTestH0H1_delay.defaultValue = 0.0;
  this.simTestH0H1_delay.updateFunction = diffTest.initPlotPerceptualTestH0H1;
  this.simTestH0H1_delay.updateFunctionArgs = [true, false];

  // user variables specific to likelihood ratios
  this.LR_numCorr = new Object();
  this.LR_numCorr.id = "diffTest.LR_numCorr";
  this.LR_numCorr.inputType = "int";
  this.LR_numCorr.value = 0;
  this.LR_numCorr.userSet = 0;
  this.LR_numCorr.display = "";
  this.LR_numCorr.min = 0;
  this.LR_numCorr.max = 10000;
  this.LR_numCorr.description = "number of correct responses from test"
  this.LR_numCorr.defaultValue = 0;
  this.LR_numCorr.updateFunction = diffTest.initPlotPerceptualTestLR;
  this.LR_numCorr.updateFunctionArgs = [true, false];

  // user variables specific to large d'
  this.largeDPrime_numCorr = new Object();
  this.largeDPrime_numCorr.id = "diffTest.largeDPrime_numCorr";
  this.largeDPrime_numCorr.inputType = "int";
  this.largeDPrime_numCorr.value = 0;
  this.largeDPrime_numCorr.userSet = 0;
  this.largeDPrime_numCorr.display = "";
  this.largeDPrime_numCorr.min = 0;
  this.largeDPrime_numCorr.max = 10000;
  this.largeDPrime_numCorr.description = "number of correct responses from test"
  this.largeDPrime_numCorr.defaultValue = 0;
  this.largeDPrime_numCorr.updateFunction =
       diffTest.initPlotPerceptualTestLargeDPrime;
  this.largeDPrime_numCorr.updateFunctionArgs = [true, false];

  // user variables specific to estimating d'
  this.estDPrime_numCorr = new Object();
  this.estDPrime_numCorr.id = "diffTest.estDPrime_numCorr";
  this.estDPrime_numCorr.inputType = "int";
  this.estDPrime_numCorr.value = 0;
  this.estDPrime_numCorr.userSet = 0;
  this.estDPrime_numCorr.display = "";
  this.estDPrime_numCorr.min = 0;
  this.estDPrime_numCorr.max = 10000;
  this.estDPrime_numCorr.description = "number of correct responses from test"
  this.estDPrime_numCorr.defaultValue = 0;
  this.estDPrime_numCorr.updateFunction =
       diffTest.initPlotPerceptualTestEstDPrime;
  this.estDPrime_numCorr.updateFunctionArgs = [true, false];

  this.estDPrime_CI = new Object();
  this.estDPrime_CI.id = "diffTest.estDPrime_CI";
  this.estDPrime_CI.inputType = "float";
  this.estDPrime_CI.value = 95;
  this.estDPrime_CI.userSet = 0;
  this.estDPrime_CI.precision = 0;
  this.estDPrime_CI.minPrecision = 0;
  this.estDPrime_CI.display = "";
  this.estDPrime_CI.min = 0;
  this.estDPrime_CI.max = 100;
  this.estDPrime_CI.description = "confidence interval (percent)"
  this.estDPrime_CI.defaultValue = 95;
  this.estDPrime_CI.updateFunction =
       diffTest.initPlotPerceptualTestEstDPrime;
  this.estDPrime_CI.updateFunctionArgs = [true, false];

  // user variables specific to final worksheet
  this.final_d_prime = new Object();
  this.final_d_prime.id = "diffTest.final_d_prime";
  this.final_d_prime.inputType = "float";
  this.final_d_prime.value = 1.0;
  this.final_d_prime.userSet = 0;
  this.final_d_prime.precision = 2;
  this.final_d_prime.minPrecision = 2;
  this.final_d_prime.display = "";
  this.final_d_prime.min = 0.0;
  this.final_d_prime.max = 100.0;
  this.final_d_prime.description = "d prime";
  this.final_d_prime.defaultValue = 1.0;
  this.final_d_prime.updateFunction = diffTest.initPlotPerceptualTestFinal;

  this.final_testType = new Object();
  this.final_testType.id = "diffTest.final_testType";
  this.final_testType.inputType = "radioButton";
  this.final_testType.value = "final_3-AFC";
  this.final_testType.userSet = 0;
  this.final_testType.defaultValue = "final_3-AFC";
  this.final_testType.updateFunction = diffTest.initPlotPerceptualTestFinal;

  this.final_N = new Object();
  this.final_N.id = "diffTest.final_N";
  this.final_N.inputType = "int";
  this.final_N.value = 20;
  this.final_N.userSet = 0;
  this.final_N.display = "";
  this.final_N.min = 1;
  this.final_N.max = 10000;
  this.final_N.description = "number of test cases in one trial";
  this.final_N.defaultValue = 20;
  this.final_N.updateFunction = diffTest.initPlotPerceptualTestFinal;

  this.final_alpha = new Object();
  this.final_alpha.id = "diffTest.final_alpha";
  this.final_alpha.inputType = "float";
  this.final_alpha.value = 0.05;
  this.final_alpha.userSet = 0;
  this.final_alpha.precision = 2;
  this.final_alpha.minPrecision = 2;
  this.final_alpha.display = "";
  this.final_alpha.min = 0;
  this.final_alpha.max = 1.0;
  this.final_alpha.description = "alpha value for H0"
  this.final_alpha.defaultValue = 0.05;
  this.final_alpha.updateFunction = diffTest.initPlotPerceptualTestFinal;

  this.final_numCorr = new Object();
  this.final_numCorr.id = "diffTest.final_numCorr";
  this.final_numCorr.inputType = "int";
  this.final_numCorr.value = 0;
  this.final_numCorr.userSet = 0;
  this.final_numCorr.display = "";
  this.final_numCorr.min = 0;
  this.final_numCorr.max = 10000;
  this.final_numCorr.description = "number of correct responses from test"
  this.final_numCorr.defaultValue = 0;
  this.final_numCorr.updateFunction = diffTest.initPlotPerceptualTestFinal;

  this.final_CI = new Object();
  this.final_CI.id = "diffTest.final_CI";
  this.final_CI.inputType = "float";
  this.final_CI.value = 95;
  this.final_CI.userSet = 0;
  this.final_CI.precision = 0;
  this.final_CI.minPrecision = 0;
  this.final_CI.display = "";
  this.final_CI.min = 0;
  this.final_CI.max = 100;
  this.final_CI.description = "confidence interval (percent)"
  this.final_CI.defaultValue = 95;
  this.final_CI.updateFunction = diffTest.initPlotPerceptualTestFinal;

  // initialize variables not set by user
  this.sim2AFC = new Object();
  this.sim2AFC.running = false;
  this.sim2AFC.simIdx = 0;
  this.sim2AFC.xA = 0;
  this.sim2AFC.xB = 0;
  this.sim2AFC.total = 0;
  this.sim2AFC.corr = 0;

  this.simTestOneTrial = new Object();
  this.simTestOneTrial.running = false;
  this.simTestOneTrial.simIdx = 0;
  this.simTestOneTrial.total = 0;
  this.simTestOneTrial.corr = 0;
  this.simTestOneTrial.xAList = [];
  this.simTestOneTrial.xBList = [];
  this.simTestOneTrial.yAList = [];
  this.simTestOneTrial.yBList = [];
  this.simTestOneTrial.testData = {};

  this.simTestMultiTrial = new Object();
  this.simTestMultiTrial.running = false;
  this.simTestMultiTrial.simIdx = 0;
  this.simTestMultiTrial.simResults = {}
  this.simTestMultiTrial.N = 0.0
  this.simTestMultiTrial.theory_pCorr = 0.0

  this.simTestH0 = new Object();
  this.simTestH0.running = false;
  this.simTestH0.simIdx = 0;
  this.simTestH0.regionLEE_max = 0.0;
  this.simTestH0.reject = 0;
  this.simTestH0.numTrials = 0;

  this.simTestH0H1 = new Object();
  this.simTestH0H1.running = false;
  this.simTestH0H1.simIdx = 0;
  this.simTestH0H1.inconclusive = 0.0;

  this.runningPerceptualMeasurementID = undefined;
  this.runningPerceptualTestOneTrialID = undefined;
  this.runningPerceptualTestMultiTrialID = undefined;
  this.runningPerceptualTestH0ID = undefined;
  this.runningPerceptualTestH0H1ID = undefined;

  this.beta = 0.0;
  this.thresholdN_H0 = 0;
  this.thresholdN_H1 = 0;
  this.pRej_H0 = 0.0;
  this.pRej_H1 = 0.0;
  this.pCorr_H0 = 0.0;
  this.pCorr_H1 = 0.0;
  this.H0Obj = {};
  this.H1Obj = {};

  // initialize user-set variables
  common.set(this.showOrHideText, 0);
  common.set(this.randSeed, 0);
  common.set(this.d_prime, 0);
  common.set(this.N, 0);
  common.set(this.testType, 0);
  common.set(this.alpha, 0);
  common.set(this.sim2AFC_N, 0);
  common.set(this.sim2AFC_delay, 0);
  common.set(this.simTestOneTrial_delay, 0);
  common.set(this.simTestMultiTrial_T, 0);
  common.set(this.simTestMultiTrial_delay, 0);
  common.set(this.simTestH0_T, 0);
  common.set(this.simTestH0_delay, 0);
  common.set(this.simTestH0H1_T, 0);
  common.set(this.simTestH0H1_delay, 0);
  common.set(this.LR_numCorr, 0);
  common.set(this.largeDPrime_numCorr, 0);
  common.set(this.estDPrime_numCorr, 0);
  common.set(this.estDPrime_CI, 0);

  common.set(this.final_d_prime, 0);
  common.set(this.final_N, 0);
  common.set(this.final_testType, 0);
  common.set(this.final_alpha, 0);
  common.set(this.final_numCorr, 0);
  common.set(this.final_CI, 0);

  // initialize all plots
  this.plotObjectiveStimuli("canvas1");
  this.initPlotAll([true, true]);

  return;
  }

//==============================================================================

function createBinomialPlot(canvas, sigma_H0, sigma_H1, N) {
  var ctx = {};
  var factor = 0.0;
  var minSigma = 1.0e17;
  var plot = {};
  var plotObj = {};
  var yMajor = 0.0;
  var yMax = 0.0;

  ctx = canvas.getContext("2d");
  // set canvas width to be a good size for the window
  ctx.canvas.width = window.innerWidth * 0.55;

  // create the plot
  plot = createPlotObject();

  // set up and create the plot
  plot.xMin = -0.5;
  plot.xMax = N + 0.5;
  plot.yMin = 0.0;
  if (sigma_H0 >= 0.0) {
    minSigma = sigma_H0;
  }
  if (sigma_H1 >= 0.0 && sigma_H1 < minSigma) {
    minSigma = sigma_H1;
  }
  yMax = mathLibrary.normalDistributionMax(minSigma) * 1.5;
  // difference between normal and binomial is that binomial maxes out at 1
  if (yMax > 1.2) {
    yMax = 1.2;
  }
  plot.yMax =  yMax;

  plot.xLabel = "number of subjects with correct result (or)";
  plot.xMajor = Number.parseInt(N * 0.1 + 0.5);
  if (plot.xMajor < 1) plot.xMajor = 1;
  plot.xMinor = 0.0;
  plot.xGridWidthPx = 0;
  plot.xAxisWidthPx = 0;
  plot.xPrecision = 0;

  plot.yLabel = "prob. of X subjects having correct result";
  factor = 1.0;
  yMajor = Number.parseInt(yMax * 2.0 * factor + 0.5) * 0.1 / factor;
  while (yMajor == 0) {
    factor *= 10.0;
    yMajor = Number.parseInt(yMax * 2.0 * factor + 0.5) * 0.1 / factor;
  }
  plot.yMajor = yMajor;
  plot.yMinor = 0.0;
  plot.yGridWidthPx = 0;
  plot.yAxisWidthPx = 0;
  plot.yPrecision = 2;

  plot.title = "";
  plot.font = "18px Arial";

  function x2function(x) { return x/diffTest.N.value; }
  plot.x2Precision = 1;
  plot.x2function = x2function;
  plot.x2Label = "probability of any one subject having a correct result";

  //plot.upperRightBoundsWidthPx = 1;
  createPlot(ctx, plot);

  plotObj.plot = plot;
  plotObj.yMax = yMax;
  return(plotObj);
}

//------------------------------------------------------------------------------

function createBinomialData(N, pCorr, thresholdN_H0, correct) {
  var bar = [];
  var beta = 0.0;
  var binObj = {};
  var binomial = [];
  var likelihood = 0.0;
  var nCorr = 0;
  var prob = 0.0;
  var pValue = 0.0;

  // create binomial plot data
  binomial = [];
  pValue = 0.0;
  beta = 0.0;
  for (nCorr = 0; nCorr <= N; nCorr++) {
    prob = mathLibrary.binomial(N, pCorr, nCorr);
    // console.log("corr = " + nCorr + ", prob = " + prob);
    bar = [nCorr-0.5, nCorr+0.5, 0.0, prob];
    binomial.push(bar);
    if (nCorr < thresholdN_H0) {
      beta += prob;
    }
    if (nCorr >= correct) {
      pValue += prob;
    }
    if (nCorr == correct) {
      likelihood = prob;
    }
  }
  binObj.binomial = binomial;
  binObj.pValue = pValue;
  binObj.likelihood = likelihood;
  binObj.beta = beta;
  return(binObj);
}

//------------------------------------------------------------------------------

function getPValueLikelihood(binomialData, correct) {
  var dataObj = {};
  var likelihood = 0.0;
  var nCorr = 0;
  var prob = 0.0;
  var pValue = 0.0;

  pValue = 0.0;
  likelihood = 0.0;
  for (nCorr = 0; nCorr < binomialData.length; nCorr++) {
    prob = binomialData[nCorr][3];
    if (nCorr >= correct) {
      pValue += prob;
    }
    if (nCorr == correct) {
      likelihood = prob;
    }
  }

  dataObj.pValue = pValue;
  dataObj.likelihood = likelihood;
  return dataObj;
}

//------------------------------------------------------------------------------

function computeSimStats(data) {
  var avg = 0.0;
  var cIdx = 0;
  var sigma = 0.0;
  var statsObj = {};
  var sum = 0.0;
  var sumSq = 0.0;
  var total = 0.0;

  for (cIdx = 0; cIdx < data.length; cIdx++) {
    sum = sum + cIdx * data[cIdx];
    sumSq = sumSq + (cIdx*cIdx) * data[cIdx];
    total = total + data[cIdx];
  }
  if (total > 0.0) {
    avg = sum / total;
    if (total > 1.0) {
      sigma = Math.sqrt((sumSq - (sum * sum / total)) / (total - 1.0));
    }
  }
  statsObj.sigma = sigma;
  statsObj.avg = avg;
  return statsObj;
}

//------------------------------------------------------------------------------
// find the best value of d' for a given number of correct responses,
// number of subjects, and test type.  This algorithm is NOT the most
// efficient, but it's easy to program and requires at most 22 calls
// to the appropriate probCorrectX() function; on average, maybe 11 calls.

function findBestDPrime(correct, N, testType) {
  var bestDPrime = 0.0;
  var bestEst = 0.0;
  var bestPCorr = 0.0;
  var estDPrime = 0.0;
  var highDPrime = 0.0;
  var lowDPrime = 0.0;
  var MLPCorr = 0.0;
  var pCorr = 0.0;
  var pCorrLow = 0.0;
  var pCorrHigh = 0.0;
  // prob. associated with each d' are only accurate to a few places past dec.
  var initProbTriangle =
                     [0.3333333333333333,
                      0.41840305544544515,
                      0.6052150813222491,
                      0.7818370915720877,
                      0.8980780975622561,
                      0.9591940339741549,
                      0.9861037607872926,
                      0.9961375383317548,
                      0.9993103695420879,
                      1.0];
  var initProb3AFC = [0.3333333333333333,
                      0.6337526446868693,
                      0.8658135355731752,
                      0.9688253542331329,
                      0.9955117867629218,
                      0.9996037546705552,
                      0.999978714674274,
                      0.999999310458364,
                      0.9999999866548419,
                      1.0];

  MLPCorr = correct / N;
  // if all correct, then use additive smoothing to get approximate prob.
  // using Jeffreys prior approach for conservative (large) estimate
  if (correct == N) {
    MLPCorr = (correct + 0.5) / (N + 1.0);
  }

  // console.log("maximum likelihood pCorr = " + MLPCorr);
  for (estDPrime = 0.0; estDPrime <= 9.0; estDPrime += 1.0) {
    if (testType == "triangle") {
      pCorr = initProbTriangle[parseInt(estDPrime)];
    } else {
      pCorr = initProb3AFC[parseInt(estDPrime)];
    }
    // console.log("   " + parseInt(estDPrime) + " -> " + pCorr);
    if (pCorr >= MLPCorr) {
      lowDPrime = estDPrime - 1.0;
      highDPrime = estDPrime;
      break;
    }
  }
  if (lowDPrime < 0.0) lowDPrime = 0.0;

  for (estDPrime = lowDPrime; estDPrime <= highDPrime; estDPrime += 0.1) {
    if (testType == "triangle") {
      pCorr = mathLibrary.probCorrectTriangle(estDPrime);
    } else {
      pCorr = mathLibrary.probCorrect3AFC(estDPrime);
    }
    // console.log("   " + estDPrime + " -> " + pCorr);
    if (pCorr >= MLPCorr) {
      lowDPrime = estDPrime - 0.1;
      highDPrime = estDPrime;
      break;
    }
  }
  if (lowDPrime < 0.0) lowDPrime = 0.0;

  for (estDPrime = lowDPrime; estDPrime <= highDPrime; estDPrime += 0.01) {
    if (testType == "triangle") {
      pCorr = mathLibrary.probCorrectTriangle(estDPrime);
    } else {
      pCorr = mathLibrary.probCorrect3AFC(estDPrime);
    }
    // console.log("   " + estDPrime + " -> " + pCorr);
    if (pCorr >= MLPCorr) {
      lowDPrime = estDPrime - 0.01;
      highDPrime = estDPrime;
      pCorrHigh = pCorr;
      break;
    }
    pCorrLow = pCorr;
  }
  if (lowDPrime < 0.0) lowDPrime = 0.0;
  // console.log("d'Low = " + lowDPrime + ", d'high = " + highDPrime);
  // interpolate between low and high points
  bestDPrime = lowDPrime + (MLPCorr - pCorrLow) *
               (highDPrime - lowDPrime) / (pCorrHigh - pCorrLow);

  return bestDPrime;
}

//==============================================================================

//------------------------------------------------------------------------------
// plotObjectiveStimuli()
// plot one sample each of two objective stimuli.
// The X axis has been normalized to 'objective units', and so the stimuli are,
// by our definition of objective units, always 1.0 units apart.
// The Y axis is a count of the number of stimuli from each, i.e. always 1

this.plotObjectiveStimuli = function(canvasName) {
  var canvas = {};
  var ctx = {};
  var dataA = [];
  var dataB = [];
  var plot = {};

  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // set up and create the plot
  plot = createPlotObject();

  plot.xMin = -1.5;
  plot.xMax =  2.5;
  plot.yMin =  0.0;
  plot.yMax =  1.25;

  plot.xLabel = "objective units (normalized)";
  plot.yLabel = "samples"

  plot.xMajor = 1.0;
  plot.xMinor = 0.0;
  plot.xGridWidthPx = 0;
  plot.xAxisWidthPx = 0;
  plot.xPrecision = 1;

  plot.yMajor = 1.0;
  plot.yMinor = 0.0;
  plot.yGridWidthPx = 0;
  plot.yAxisWidthPx = 0;
  plot.yPrecision = 0;

  plot.title = "";
  plot.font = "18px Arial";

  createPlot(ctx, plot);

  // plot data for stimulus A
  dataA.push([0.0, 0.0]);
  dataA.push([0.0, 1.0]);
  plotLinearData(ctx, plot, "A", dataA, "solid", "none", "blue", 0, 4);

  // plot data for stimulus B
  dataB.push([1.0, 0.0]);
  dataB.push([1.0, 1.0]);
  plotLinearData(ctx, plot, "B", dataB, "solid", "none", "green", 0, 4);

  // create and plot the legend
  plot.legend = [["A", "A"],
                 ["B", "B"]];
  plot.legendPosition = [-1.4, 1.20];
  plot.legendBorderPx = 0;
  plotUpdate(ctx, plot, [], []);

  return;
}

//==============================================================================

this.showOrHideTextFunction = function() {
  var divIdx = 0;
  var nonFinalOnly = document.getElementsByClassName("NONFINAL");
  var textRegions = document.getElementsByClassName("TEXT");

  if (diffTest.showOrHideText.value === "showText") {
    for (divIdx = 0; divIdx < nonFinalOnly.length; divIdx++) {
      nonFinalOnly[divIdx].style.display = "block";
    }
    for (divIdx = 0; divIdx < textRegions.length; divIdx++) {
      textRegions[divIdx].style.display = "block";
    }
  } else if (diffTest.showOrHideText.value == "hideText") {
    for (divIdx = 0; divIdx < nonFinalOnly.length; divIdx++) {
      nonFinalOnly[divIdx].style.display = "block";
    }
    for (divIdx = 0; divIdx < textRegions.length; divIdx++) {
      textRegions[divIdx].style.display = "none";
    }
  } else {
    for (divIdx = 0; divIdx < nonFinalOnly.length; divIdx++) {
      nonFinalOnly[divIdx].style.display = "none";
    }
    for (divIdx = 0; divIdx < textRegions.length; divIdx++) {
      textRegions[divIdx].style.display = "none";
    }
  }
  return;
}

//==============================================================================

this.initPlotAll = function(argList = [true, true]) {
  var cascade = argList[1];
  var initOnly = argList[0];

  // call initPlotPerceptualMeasurement; that will call the next
  // initialization function, which will call the next, etc.
  // if cascade is true, then set any *subsequent* simulations back to the start
  diffTest.initPlotPerceptualMeasurement([initOnly, cascade]);

  // call the final worksheet, which doesn't depend on other worksheets
  diffTest.initPlotPerceptualTestFinal();
  return;
}

//==============================================================================

//------------------------------------------------------------------------------

function plotSigma(ctx, plot, name, mu, sigma, yMax) {
  // plot sigma range over maximum of stimulus A
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(mapX(plot, mu), mapY(plot, yMax*0.90)-6);
  ctx.lineTo(mapX(plot, mu), mapY(plot, yMax*0.90)+6);
  ctx.moveTo(mapX(plot, mu), mapY(plot, yMax*0.90));
  ctx.lineTo(mapX(plot, mu + sigma), mapY(plot, yMax*0.90));
  ctx.moveTo(mapX(plot, mu + sigma)-8, mapY(plot, yMax*0.90)-4);
  ctx.lineTo(mapX(plot, mu + sigma), mapY(plot, yMax*0.90));
  ctx.moveTo(mapX(plot, mu + sigma)-8, mapY(plot, yMax*0.90)+4);
  ctx.lineTo(mapX(plot, mu + sigma), mapY(plot, yMax*0.90));
  ctx.stroke();
  plotTextLeftMiddle(ctx, plot, "\u03C3<sub>"+name+"</sub>", mu, yMax*0.9);
  return;
}

//------------------------------------------------------------------------------

function plotAlpha(ctx, plot, label, thresholdN_H0, yMax) {
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 4]);
  ctx.strokeStyle = "darkorange";
  ctx.font = plot.font;
  ctx.beginPath();
  ctx.moveTo(mapX(plot, thresholdN_H0-0.5), mapY(plot, 0));
  ctx.lineTo(mapX(plot, thresholdN_H0-0.5), mapY(plot, yMax*0.94));
  ctx.stroke();
  ctx.fillStyle = "darkorange";
  plotTextMiddleTop(ctx, plot, "\u03B1<sub>"+label+"</sub>",
                    thresholdN_H0-0.5, yMax*0.96, "italic");
  ctx.fillStyle = plot.defaultColor;
  ctx.strokeStyle = plot.defaultColor;
  return;
}

//------------------------------------------------------------------------------

function plotRegion(ctx, plot, range, label, yMax, thresholdN_H1 = -1) {
  var labelXMax = 0;
  var labelXMin = 0;
  var max = range[1];
  var min = range[0];
  var origCtxFont = "";
  var origHeight = 0;
  var origPlotFont = "";
  var plotLabelRes = [];

  if (max <= min) {
    return;
  }

  origCtxFont = ctx.font;
  origPlotFont = plot.font;
  origHeight = plot.fontHeightPx;
  ctx.font = "13px Arial";
  plot.font = "13px Arial";
  plot.fontHeightPx = 13;

  ctx.fillStyle = "darkorange";
  plotLabelRes = plotTextMiddleTop(ctx, plot, label, (min+max)*0.5, 
                                   yMax*0.97, "italic");
  labelXMin = plotLabelRes[0];
  labelXMax = plotLabelRes[1];

  ctx.lineWidth = 1.5;
  ctx.setLineDash([0]);
  ctx.strokeStyle = "darkorange";
  ctx.beginPath();
  ctx.moveTo(mapX(plot, min) + 8, mapY(plot, yMax*0.99));
  ctx.lineTo(mapX(plot, min),     mapY(plot, yMax*0.98));
  ctx.lineTo(mapX(plot, min) + 8, mapY(plot, yMax*0.97));

  ctx.moveTo(mapX(plot, min),     mapY(plot, yMax*0.98));
  ctx.lineTo(labelXMin-3,         mapY(plot, yMax*0.98));
  ctx.moveTo(labelXMax+3,         mapY(plot, yMax*0.98));
  ctx.lineTo(mapX(plot, max),     mapY(plot, yMax*0.98));

  ctx.moveTo(mapX(plot, max) - 8, mapY(plot, yMax*0.99));
  ctx.lineTo(mapX(plot, max),     mapY(plot, yMax*0.98));
  ctx.lineTo(mapX(plot, max) - 8, mapY(plot, yMax*0.97));
  ctx.stroke();

  ctx.font = origCtxFont;
  plot.font = origPlotFont;
  plot.fontHeightPx = origHeight;

  if (thresholdN_H1 >= 0) {
    plotAlpha(ctx, plot, "H1", thresholdN_H1, yMax*0.94);
  } else {
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 2]);
    ctx.moveTo(mapX(plot, max),     mapY(plot, yMax*1.00));
    ctx.lineTo(mapX(plot, max),     mapY(plot, 0.0));
    ctx.stroke();
  }

  ctx.setLineDash([0]);
  ctx.strokeStyle = plot.defaultColor;
  ctx.fillStyle = plot.defaultColor;

  return;
}

//------------------------------------------------------------------------------
// function to hack in the legend for the combination of H0 and H1

function plotLegendH0andH1(ctx, plot, name, xPos, yPos) {
  var fillColor = "";
  var graphicsWidthPx = 0;
  var xPx = 0;
  var x1Px = 0;
  var x2Px = 0;
  var yPx = 0;
  var y1Px = 0;
  var y2Px = 0;

  // plot legend for combined H0 and H1
  graphicsWidthPx = plot.fontHeightPx * 2;
  xPx = mapX(plot, xPos) + plot.paddingPx/2;
  yPx = mapY(plot, yPos) + plot.paddingPx/2;
  fillColor = "rgb(92,138,37,1.00)";  // approximate match to combined color
  x1Px = xPx + plot.paddingPx + (graphicsWidthPx/8);
  x2Px = x1Px + (6.0*graphicsWidthPx/8.0);
  y1Px = yPx;
  y2Px = yPx - (3.0*plot.fontHeightPx/4.0);
  plotBar(ctx, plot, x1Px, x2Px, y1Px, y2Px, fillColor, undefined,
               "black", 1, 0);
  ctx.fillStyle = plot.defaultColor;
  ctx.fillText(name, xPx + 2*plot.paddingPx + graphicsWidthPx, yPx);

}

//------------------------------------------------------------------------------
// function to plot a gray vertical bar at the number of correct responses

function plotCorrectBar(ctx, plot, correct) {
  var fillColor = "";
  var fillPattern = {};
  var x1Px = 0;
  var x2Px = 0;
  var y1Px = 0;
  var y2Px = 0;


  // plot legend for combined H0 and H1
  //fillColor = "none";
  //fillPattern = {spacing:5, angleUp:1, angleDown:1, horizontal:0, vertical:0},
  fillColor = "rgb(128,128,128,0.4)";  // light gray, transparent
  x1Px = mapX(plot, correct-0.5);
  x2Px = mapX(plot, correct+0.5);
  y1Px = mapY(plot, 0.0);
  y2Px = mapY(plot, plot.yMax * 0.88);
  plotBar(ctx, plot, x1Px, x2Px, y1Px, y2Px, fillColor, fillPattern,
               "gray", 1, 0, false);
  ctx.fillStyle = plot.defaultColor;
}

//------------------------------------------------------------------------------
// function to plot a light-gray rectangle outlining the confidence interval

function plotCIBar(ctx, plot, low, high) {
  var fillColor = "";
  var fillPattern = {};
  var x1Px = 0;
  var x2Px = 0;
  var y1Px = 0;
  var y2Px = 0;


  // plot legend for combined H0 and H1
  //fillColor = "none";
  //fillPattern = {spacing:5, angleUp:1, angleDown:1, horizontal:0, vertical:0},
  fillColor = "rgb(128,128,128,0.25)";  // light gray, transparent
  x1Px = mapX(plot, low-0.5);
  x2Px = mapX(plot, high+0.5);
  y1Px = mapY(plot, 0.0);
  y2Px = mapY(plot, plot.yMax * 0.88);
  plotBar(ctx, plot, x1Px, x2Px, y1Px, y2Px, fillColor, fillPattern,
               "gray", 0, 0);
  ctx.fillStyle = plot.defaultColor;
}

//------------------------------------------------------------------------------
// plotSimulationResults()
// plot results from a simulation as shapes on the graph

function plotSimulationResults(ctx, plot, iteration, dataName,
                               xList, yList, shape, color) {
  var data = [];
  var idx = 0;

  for (idx = 0; idx < xList.length; idx++) {
    if (xList[idx] < plot.xMin) {
      xList[idx] = plot.xMin;
    }
    if (xList[idx] > plot.xMax) {
      xList[idx] = plot.xMax;
    }
    data.push([xList[idx], yList[idx]]);
  }
  plotLinearData(ctx, plot, dataName, data, "none", shape, color, 16, 4);

  return;
}

//------------------------------------------------------------------------------
// initPlotPerceptualMeasurement()
// initialize the plot of perceptual measurement, d', and 2AFC simulation

this.initPlotPerceptualMeasurement = function(argList = [false, false]) {
  var canvas = {};
  var canvasName = "canvas2";
  var cascade = argList[1];
  var ctx = {};
  var d_prime = 0.0;
  var factor = 0.0;
  var initOnly = argList[0];
  var mu = 0.0;
  var pGuess = 0.50;
  var plot = {};
  var probabilityOfDiscrimination = 0.0;
  var sigma = 0.0;
  var theoreticalCorr = 0.0;
  var yMajor = 0.0;
  var yMax = 0.0;

  // change the status of the simulation start/stop button
  if (initOnly || (!initOnly && diffTest.sim2AFC.running)) {
    diffTest.sim2AFC.running = false;
    if (initOnly) {
      document.getElementById('startStop2AFC').innerHTML = "START";
      diffTest.sim2AFC.simIdx = 2*diffTest.sim2AFC_N.value;
    } else {
      document.getElementById('startStop2AFC').innerHTML =
               ((diffTest.sim2AFC.simIdx+1)/2).toFixed(0) + ": CONT.";
    }
    if (diffTest.runningPerceptualMeasurementID) {
      clearTimeout(diffTest.runningPerceptualMeasurementID);
    }
    if (!initOnly) {
      return;
    }
  } else {
    diffTest.sim2AFC.running = true;
    // if had been stopped, then start over; else if paused, just keep going
    if (diffTest.sim2AFC.simIdx >= 2*diffTest.sim2AFC_N.value) {
      // initialize variables
      diffTest.sim2AFC.simIdx = 0;
      mathLibrary.seedRandom(diffTest.randSeed.value);
      diffTest.sim2AFC.total = 0;
      diffTest.sim2AFC.corr = 0;
      document.getElementById('sim2AFCcorr').innerHTML = "N/A";
    }
  }

  // get the canvas and context (ctx)
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // set canvas width to be a good size for the window
  ctx.canvas.width = window.innerWidth * 0.60;

  // create the plot
  plot = createPlotObject();

  d_prime = diffTest.d_prime.value;
  if (d_prime <= 0.0) {
    d_prime = 0.001;
  }

  // compute (and set in HTML) sigma, percent correct, and probability
  // of discrimination
  sigma = 1.0 / d_prime;
  document.getElementById('sigma').innerHTML = sigma.toFixed(2);

  theoreticalCorr = mathLibrary.probCorrect2AFC(d_prime);
  document.getElementById('theoretical2AFCcorrect').innerHTML =
               (100.0 * theoreticalCorr).toFixed(1)+"%";

  probabilityOfDiscrimination = (theoreticalCorr - pGuess) / (1.0 - pGuess);
  if (d_prime <= 0.001) {
    probabilityOfDiscrimination = 0.0;
  }
  document.getElementById('sim2AFC_pd').innerHTML =
               (100.0 * probabilityOfDiscrimination).toFixed(1)+"%";

  // set up and create the plot
  plot.xMin = -2.5 * sigma;
  plot.xMax =  2.5 * sigma + 1;
  plot.yMin =  0.0;
  yMax = mathLibrary.normalDistributionMax(sigma) * 1.2;
  plot.yMax =  yMax;

  plot.xLabel = "perceptual units";
  if (sigma >= 0.10) {
    plot.xMajor = sigma;
  } else {
    plot.xMajor = 0.1;
  }
  plot.xMinor = 0.0;
  plot.xGridWidthPx = 0;
  plot.xAxisWidthPx = 0;
  plot.xPrecision = 1;

  plot.yLabel = "relative probability of perceptual unit";
  factor = 1.0;
  yMajor = Number.parseInt(yMax * 2.0 * factor + 0.5) * 0.1 / factor;
  while (yMajor == 0) {
    factor *= 10.0;
    yMajor = Number.parseInt(yMax * 2.0 * factor + 0.5) * 0.1 / factor;
  }
  plot.yMajor = yMajor;
  plot.yMinor = 0.0;
  plot.yGridWidthPx = 0;
  plot.yAxisWidthPx = 0;
  plot.yPrecision = 2;

  plot.title = "";
  plot.font = "18px Arial";

  createPlot(ctx, plot);

  // plot function for stimulus A
  mu = 0.0;
  plotFunction(ctx, plot, "A", mathLibrary.normalDistribution,
               "blue", 2, mu, sigma);

  // plot function for stimulus B
  mu = 1.0;
  plotFunction(ctx, plot, "B", mathLibrary.normalDistribution,
               "green", 2, mu, sigma);

  // create and position the plot legend
  plot.legend = [["A", "A"],
                 ["B", "B"]];
  if (plot.xMin > 0) {
    plot.legendPosition = [plot.xMin * 1.15, yMax * 0.96];
  } else {
    plot.legendPosition = [plot.xMin * 0.85, yMax * 0.96];
  }
  plot.legendBorderPx = 0;

  // must initialize other plots before this one so that random
  // seed is correct
  if (initOnly && cascade) {
    diffTest.initPlotPerceptualTestOneTrial([initOnly, cascade]);
  }

  // if only initializing, then update plot and return; else start simulation
  if (initOnly) {
    // update the plot to include the legend
    plotUpdate(ctx, plot, [], []);

    // plot sigma range over maximum of A
    plotSigma(ctx, plot, "", 0.0, sigma, yMax);
  } else {
    // begin simulation
    perceptualMeasurement2AFC_simulation(ctx, plot, yMax, sigma);
  }

  return;
}

//------------------------------------------------------------------------------
// perceptualMeasurement2AFC_simulation()
// internal function to compute and plot simulation of perceptual
// measurement using 2AFC
//
// The simulation is either in 'generate' mode (in which two data points
// are selected and plotted) or 'test' mode (in which the two
// data points from the previous 'generate' mode are evaluated
// and the results are plotted).

function perceptualMeasurement2AFC_simulation(ctx, plot, yMax, sigma) {
  var delay = 0.0;
  var generateOrTest = 0;
  var percentCorrect = 0.0;
  var sIdx = diffTest.sim2AFC.simIdx;
  var sim2AFC_N = diffTest.sim2AFC_N.value;
  var xA = 0.0;
  var xB = 0.0;
  var xPx = 0.0;
  var yPx = 0.0;

  // if stopped running simulation, then return
  if (diffTest.sim2AFC.running == false) {
    return;
  }

  document.getElementById('startStop2AFC').innerHTML =
        ((sIdx+1)/2).toFixed(0) + ": PAUSE";

  // if 'generate', then generateOrTest is 0;
  // if 'test', then generateOrTest is 1.
  generateOrTest = diffTest.sim2AFC.simIdx % 2;

  // compute the delay for each phase of the simulation, in milliseconds
  delay = diffTest.sim2AFC_delay.value * 1000.0 / 2.0;

  // if generate, remove any simulation points from previous iteration
  if (generateOrTest == 0) {
    plotRemoveData(ctx, plot, "simA");
    plotRemoveData(ctx, plot, "simB");
  }
  plotUpdate(ctx, plot, [], []);

  // plot sigma range over maximum of stimulus A
  plotSigma(ctx, plot, "", 0.0, sigma, yMax);

  // plot symbols for A and B on top of legend
  xPx = mapX(plot, plot.legendPosition[0]) + plot.paddingPx/2 -
             plot.paddingPx;
  yPx = mapY(plot, plot.legendPosition[1]) + plot.paddingPx/2 +
             plot.fontHeightPx/2 + 4;
  plotSymbol(ctx, plot, "openSquare", xPx, yPx, 12, "blue", 3);
  yPx += plot.fontHeightPx + 2;
  plotSymbol(ctx, plot, "openCircle", xPx, yPx, 12, "green", 3);


  if (sim2AFC_N > 0) {
    if (generateOrTest == 0) {
      // pick point in A, store it in diffTest.sim2AFC.xA, and plot it
      xA = mathLibrary.pickSampleFromNormalDistribution(0.0, sigma);
      diffTest.sim2AFC.xA = xA;
      if (delay >= 0) {
        plotSimulationResults(ctx, plot, sIdx, "simA", [xA], [yMax*0.1],
                              "openSquare", "blue");
      }
      // pick point in B, store it in diffTest.sim2AFC.xB, and plot it
      xB = mathLibrary.pickSampleFromNormalDistribution(1.0, sigma);
      diffTest.sim2AFC.xB = xB;
      if (delay >= 0) {
        plotSimulationResults(ctx, plot, sIdx, "simB", [xB], [yMax*0.1],
                              "openCircle", "green");
      }
    } else {
      // score and optionally plot the results by filling in the symbols
      // with the original color (if correct) or with red (if incorrect)
      xA = diffTest.sim2AFC.xA;
      xB = diffTest.sim2AFC.xB;
      diffTest.sim2AFC.total += 1;
      if (xB > xA) {
        diffTest.sim2AFC.corr += 1;
        if (delay >= 0) {
          plotSimulationResults(ctx, plot, sIdx, "simA", [xA], [yMax*0.1],
                                "filledSquare", "blue");
          plotSimulationResults(ctx, plot, sIdx, "simB", [xB], [yMax*0.1],
                                "filledCircle", "green");
        }
      } else {
        if (delay >= 0) {
          plotSimulationResults(ctx, plot, sIdx, "simA", [xA], [yMax*0.1],
                                "filledSquare", "red");
          plotSimulationResults(ctx, plot, sIdx, "simB", [xB], [yMax*0.1],
                                "filledCircle", "red");
        }
      }
    }
  }

  // compute and display on HTML the percent correct so far
  percentCorrect = diffTest.sim2AFC.corr / diffTest.sim2AFC.total;
  if (generateOrTest == 1) {
    document.getElementById('sim2AFCcorr').innerHTML =
               (100.0 * percentCorrect).toFixed(1)+"%";
  }

  // if we're not done yet, call this function again after specified delay.
  // alternate between generating points and testing them.
  if (sIdx < 2*sim2AFC_N-1) {
    diffTest.sim2AFC.simIdx += 1;
    diffTest.runningPerceptualMeasurementID =
          setTimeout(perceptualMeasurement2AFC_simulation, delay, ctx, plot,
                         yMax, sigma);
  } else {
    // stop
    diffTest.sim2AFC.running = false;
    diffTest.sim2AFC.total = 0;
    diffTest.sim2AFC.corr = 0;
    diffTest.sim2AFC.simIdx = 2*diffTest.sim2AFC_N.value;
    mathLibrary.seedRandom(diffTest.randSeed.value);
    document.getElementById('startStop2AFC').innerHTML = "START";
  }

  return;
}


//==============================================================================

//------------------------------------------------------------------------------
// initPlotPerceptualTestOneTrial()
// initialize the plot of perceptual test with one trial, N subjects

this.initPlotPerceptualTestOneTrial = function(argList = [false, false]) {
  var canvas = {};
  var canvasName = "canvas3";
  var cascade = argList[1];
  var cIdx = 0;
  var classList = {};
  var ctx = {};
  var d_prime = 0.0;
  var factor = 0.0;
  var initOnly = argList[0];
  var mu = 0.0;
  var pGuess = 1.0 / 3.0;
  var plot = {};
  var probabilityOfDiscrimination = 0.0;
  var sigma = 0.0;
  var theoreticalCorr = 0.0;
  var yMajor = 0.0;
  var yMax = 0.0;

  // console.log("in ONE TRIAL : " + initOnly + " and " + cascade);
  // console.log("IN : " + initOnly + ", "  + diffTest.simTestOneTrial.running +
              // ", " + diffTest.simTestOneTrial.simIdx);

  // update the name of the test type in the results section
  classList = document.getElementsByClassName('testType');
  for (cIdx = 0; cIdx < classList.length; cIdx++) {
    classList[cIdx].textContent = diffTest.testType.value;
  }

  document.getElementById('oneTrialD_prime').innerHTML = diffTest.d_prime.value;

  // update the test type in the multi-trial case
  if (document.getElementById('multiTrialTest')) {
    document.getElementById('multiTrialTest').innerHTML =
      diffTest.testType.value;
  }
  // update the number of subjects in the multi-trial case
  if (document.getElementById('multiTrialN')) {
    document.getElementById('multiTrialN').innerHTML = diffTest.N.value;
  }

  // change the status of the simulation start/stop button
  if (initOnly || (!initOnly && diffTest.simTestOneTrial.running)) {
    diffTest.simTestOneTrial.running = false;
    if (initOnly) {
      document.getElementById('simTestOneTrialCorr').innerHTML = "N/A";
      document.getElementById('startStopTestOneTrial').innerHTML = "START";
      diffTest.simTestOneTrial.simIdx = 2*diffTest.N.value;
    } else {
      document.getElementById('startStopTestOneTrial').innerHTML =
              ((diffTest.simTestOneTrial.simIdx+1)/2).toFixed(0) + ": CONT.";
    }
    if (diffTest.runningPerceptualTestOneTrialID) {
      clearTimeout(diffTest.runningPerceptualTestOneTrialID);
    }
    if (!initOnly) {
      return;
    }
  } else {
    diffTest.simTestOneTrial.running = true;
    // if had been stopped, then start over; else if paused, just keep going
    if (diffTest.simTestOneTrial.simIdx >= 2*diffTest.N.value) {
      // initialize variables
      diffTest.simTestOneTrial.simIdx = 0;
      mathLibrary.seedRandom(diffTest.randSeed.value);
      diffTest.simTestOneTrial.total = 0;
      diffTest.simTestOneTrial.corr = 0;
      document.getElementById('simTestOneTrialCorr').innerHTML = "N/A";
    }
  }

  // get the canvas and context (ctx)
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // set canvas width to be a good size for the window
  ctx.canvas.width = window.innerWidth * 0.60;

  // create the plot
  plot = createPlotObject();

  d_prime = diffTest.d_prime.value;
  if (d_prime <= 0.0) {
    d_prime = 0.001;
  }

  // compute (and set in HTML) sigma, percent correct, and probability
  // of discrimination
  sigma = 1.0 / d_prime;
  document.getElementById('sigmaOneTrial').innerHTML = sigma.toFixed(2);

  if (diffTest.testType.value == "triangle") {
    theoreticalCorr = mathLibrary.probCorrectTriangle(d_prime);
  } else {
    theoreticalCorr = mathLibrary.probCorrect3AFC(d_prime);
  }
  document.getElementById('theoreticalTestOneTrialcorrect').innerHTML =
               (100.0 * theoreticalCorr).toFixed(1)+"%";

  probabilityOfDiscrimination = (theoreticalCorr - pGuess) / (1.0 - pGuess);
  if (d_prime <= 0.001) {
    probabilityOfDiscrimination = 0.0;
  }
  // document.getElementById('simTestOneTrial_pd').innerHTML =
               // (100.0 * probabilityOfDiscrimination).toFixed(1)+"%";


  // set up and create the plot
  plot.xMin = -2.5 * sigma;
  plot.xMax =  2.5 * sigma + 1;
  plot.yMin =  0.0;
  yMax = mathLibrary.normalDistributionMax(sigma) * 1.2;
  plot.yMax =  yMax;

  plot.xLabel = "perceptual units";
  if (sigma >= 0.10) {
    plot.xMajor = sigma;
  } else {
    plot.xMajor = 0.1;
  }
  plot.xMinor = 0.0;
  plot.xGridWidthPx = 0;
  plot.xAxisWidthPx = 0;
  plot.xPrecision = 1;

  plot.yLabel = "relative probability of perceptual unit";
  factor = 1.0;
  yMajor = Number.parseInt(yMax * 2.0 * factor + 0.5) * 0.1 / factor;
  while (yMajor == 0) {
    factor *= 10.0;
    yMajor = Number.parseInt(yMax * 2.0 * factor + 0.5) * 0.1 / factor;
  }
  plot.yMajor = yMajor;
  plot.yMinor = 0.0;
  plot.yGridWidthPx = 0;
  plot.yAxisWidthPx = 0;
  plot.yPrecision = 2;

  plot.title = "";
  plot.font = "18px Arial";

  createPlot(ctx, plot);

  // plot function for stimulus A
  mu = 0.0;
  plotFunction(ctx, plot, "A", mathLibrary.normalDistribution,
               "blue", 2, mu, sigma);

  // plot function for stimulus B
  mu = 1.0;
  plotFunction(ctx, plot, "B", mathLibrary.normalDistribution,
               "green", 2, mu, sigma);

  // create and position the plot legend
  plot.legend = [["A", "A"],
                 ["B", "B"]];
  if (plot.xMin > 0) {
    plot.legendPosition = [plot.xMin * 1.15, yMax * 0.96];
  } else {
    plot.legendPosition = [plot.xMin * 0.85, yMax * 0.96];
  }
  plot.legendBorderPx = 0;

  if (initOnly && cascade) {
    diffTest.initPlotPerceptualTestMultiTrial([initOnly, cascade]);
  }

  // if only initializing, then update plot and return; else start simulation
  if (initOnly) {
    // update the plot to include the legend
    plotUpdate(ctx, plot, [], []);

    // plot sigma range over maximum of A
    plotSigma(ctx, plot, "", 0.0, sigma, yMax);
  } else {
    // begin simulation
    perceptualTestOneTrial_simulation(ctx, plot, yMax, sigma, d_prime);
  }

  return;
}

//------------------------------------------------------------------------------

function generatePerceptualTestData(d_prime, testType) {
  var randValue = 0.0;
  var sigma = 0.0;
  var testData = {};
  var trueDifferent = "";
  var xA = 0.0;
  var xAList = [];
  var xB = 0.0;
  var xBList = [];
  var xX = 0.0;

  if (d_prime < 0.001) d_prime = 0.001;

  sigma = 1.0 / d_prime;
  // console.log("sigma = " + sigma + ", testType = " + testType);
  randValue = mathLibrary.pseudoRandom();
  if (randValue < 0.5 || testType == "3-AFC") {
    trueDifferent = "B";
    xX = mathLibrary.pickSampleFromNormalDistribution(0.0, sigma);
    xAList.push(xX);
  } else {
    trueDifferent = "A";
    xX = mathLibrary.pickSampleFromNormalDistribution(1.0, sigma);
    xBList.push(xX);
  }

  // pick point in A, store it in xAList
  xA = mathLibrary.pickSampleFromNormalDistribution(0.0, sigma);
  xAList.push(xA);

  // pick point in B, store it in xBList
  xB = mathLibrary.pickSampleFromNormalDistribution(1.0, sigma);
  xBList.push(xB);

  testData.A = xAList;
  testData.B = xBList;
  testData.trueDifferent = trueDifferent;
  testData.testType = testType;

  return testData;
}

//------------------------------------------------------------------------------

function scoreTestData(testData) {
  var distanceAB = 0.0;
  var distanceAX = 0.0;
  var distanceBX = 0.0;
  var minDist = 0.0;
  var mostDifferent = "";
  var success = true;
  var xX = 0.0;
  var xA = 0.0;
  var xB = 0.0;

  if (testData.A.length > 1) {
    xX = testData.A[0];
    xA = testData.A[1];
    xB = testData.B[0];
    // console.log("A = " + xA + " and " + xX + ", B = " + xB);
  } else {
    xX = testData.B[0];
    xA = testData.A[0];
    xB = testData.B[1];
    // console.log("A = " + xA + ", B = " + xB + " and " + xX);
  }
  if (testData.testType == "triangle") {
    distanceAB = Math.abs(xA - xB);
    distanceAX = Math.abs(xA - xX);
    distanceBX = Math.abs(xB - xX);
    // console.log("true different = " + testData.trueDifferent);
    // console.log("AB = " + distanceAB + ", AX = " + distanceAX +
                // ", BX = " + distanceBX);
    minDist = distanceAB;
    mostDifferent = "X";
    if (distanceAX < minDist) {
      minDist = distanceAX;
      mostDifferent = "B";
    }
    if (distanceBX < minDist) {
      minDist = distanceBX;
      mostDifferent = "A";
    }
    success = false;
    if (testData.trueDifferent == mostDifferent) {
      success = true;
    }
  } else {
    success = false;
    if (xB > xA && xB > xX) {
      success = true;
    }
  }
  return success;
}

//------------------------------------------------------------------------------
// perceptualTestOneTrial_simulation()
// internal function to compute and plot simulation of perceptual
// measurement using user-selected test type
//
// The simulation is either in 'generate' mode (in which two data points
// are selected and plotted) or 'test' mode (in which the two
// data points from the previous 'generate' mode are evaluated
// and the results are plotted).
// if 'generate', then generateOrTest is positive;
// if 'test', then generateOrTest is negative.

function perceptualTestOneTrial_simulation(ctx, plot, yMax, sigma, d_prime) {
  var delay = 0.0;
  var distanceAB = 0.0;
  var distanceAX = 0.0;
  var distanceBX = 0.0;
  var duplicate = "";
  var generateOrTest = 0;
  var minDist = 0.0;
  var mostDifferent = "";
  var N = diffTest.N.value;
  var percentCorrect = 0.0;
  var randValue = 0.0;
  var sIdx = diffTest.simTestOneTrial.simIdx;
  var success = true;
  var testData = {};
  var trueDifferent = "";
  var xA = 0.0;
  var xAList = [];
  var xBList = [];
  var xB = 0.0;
  var xIdx = 0;
  var xPx = 0.0;
  var xX = 0.0;
  var yAList = [];
  var yBList = [];
  var yPx = 0.0;

  // if stopped running simulation, then return
  if (diffTest.simTestOneTrial.running == false) {
    return;
  }

  document.getElementById('startStopTestOneTrial').innerHTML =
        ((sIdx+1)/2).toFixed(0) + ": PAUSE";

  // if 'generate', then generateOrTest is 0;
  // if 'test', then generateOrTest is 1.
  generateOrTest = diffTest.simTestOneTrial.simIdx % 2;

  // compute the delay for each phase of the simulation, in milliseconds
  delay = diffTest.simTestOneTrial_delay.value * 1000.0 / 2.0;

  // if generate, remove any simulation points from previous iteration
  if (generateOrTest == 0) {
    plotRemoveData(ctx, plot, "simA");
    plotRemoveData(ctx, plot, "simB");
  }
  plotUpdate(ctx, plot, [], []);

  // plot sigma range over maximum of stimulus A
  plotSigma(ctx, plot, "", 0.0, sigma, yMax);

  // plot symbols for A and B on top of legend
  xPx = mapX(plot, plot.legendPosition[0]) + plot.paddingPx/2 -
             plot.paddingPx;
  yPx = mapY(plot, plot.legendPosition[1]) + plot.paddingPx/2 +
             plot.fontHeightPx/2 + 4;
  plotSymbol(ctx, plot, "openSquare", xPx, yPx, 12, "blue", 3);
  yPx += plot.fontHeightPx + 2;
  plotSymbol(ctx, plot, "openCircle", xPx, yPx, 12, "green", 3);


  if (N > 0) {
    if (generateOrTest == 0) {
      testData = generatePerceptualTestData(d_prime, diffTest.testType.value);
      xAList = testData.A;
      xBList = testData.B;
      trueDifferent = testData.trueDifferent;

      yAList = [];
      for (xIdx = 0; xIdx < xAList.length; xIdx++) {
        yAList.push(yMax*0.1);
      }
      yBList = [];
      for (xIdx = 0; xIdx < xBList.length; xIdx++) {
        yBList.push(yMax*0.1);
      }

      diffTest.simTestOneTrial.xAList = xAList;
      diffTest.simTestOneTrial.xBList = xBList;
      diffTest.simTestOneTrial.yAList = yAList;
      diffTest.simTestOneTrial.yBList = yBList;
      diffTest.simTestOneTrial.testData = testData;
      if (delay >= 0) {
        plotSimulationResults(ctx, plot, sIdx, "simA", xAList, yAList,
                              "openSquare", "blue");
        plotSimulationResults(ctx, plot, sIdx, "simB", xBList, yBList,
                              "openCircle", "green");
      }
    } else {
      // score and optionally plot the results by filling in the symbols
      // with the original color (if correct) or with red (if incorrect)
      testData = diffTest.simTestOneTrial.testData;
      success = scoreTestData(testData);

      xAList = diffTest.simTestOneTrial.xAList;
      xBList = diffTest.simTestOneTrial.xBList;
      yAList = diffTest.simTestOneTrial.yAList;
      yBList = diffTest.simTestOneTrial.yBList;


      // console.log("most different = " + mostDifferent);
      diffTest.simTestOneTrial.total += 1;
      if (success) {
        diffTest.simTestOneTrial.corr += 1;
        if (delay >= 0) {
          plotSimulationResults(ctx, plot, sIdx, "simA", xAList, yAList,
                                "filledSquare", "blue");
          plotSimulationResults(ctx, plot, sIdx, "simB", xBList, yBList,
                                "filledCircle", "green");
        }
      } else {
        if (delay >= 0) {
          plotSimulationResults(ctx, plot, sIdx, "simA", xAList, yAList,
                                "filledSquare", "red");
          plotSimulationResults(ctx, plot, sIdx, "simB", xBList, yBList,
                                "filledCircle", "red");
        }
      }
    }
  }

  // compute and display on HTML the percent correct so far
  percentCorrect = diffTest.simTestOneTrial.corr/diffTest.simTestOneTrial.total;
  if (generateOrTest == 1) {
    document.getElementById('simTestOneTrialCorr').innerHTML =
               (100.0 * percentCorrect).toFixed(1)+"%";
  }

  // if we're not done yet, call this function again after specified delay.
  // alternate between generating points and testing them.
  if (sIdx < 2*N-1) {
    diffTest.simTestOneTrial.simIdx += 1;
    diffTest.runningPerceptualTestOneTrialID =
            setTimeout(perceptualTestOneTrial_simulation, delay, ctx, plot,
                         yMax, sigma, d_prime);
  } else {
    // stop
    diffTest.simTestOneTrial.running = false;
    diffTest.simTestOneTrial.total = 0;
    diffTest.simTestOneTrial.corr = 0;
    diffTest.simTestOneTrial.simIdx = 2*diffTest.N.value;
    mathLibrary.seedRandom(diffTest.randSeed.value);
    document.getElementById('startStopTestOneTrial').innerHTML = "START";
  }

  return;
}


//==============================================================================

//------------------------------------------------------------------------------
// initPlotPerceptualTestMultiTrial()
// initialize the plot of perceptual test with multiple trials, N subjects

this.initPlotPerceptualTestMultiTrial = function(argList = [false, false]) {
  var bar = [];
  var barLineWidth = 0;
  var binomialObj = {};
  var canvas = {};
  var canvasName = "canvas4";
  var cascade = argList[1];
  var cIdx = 0;
  var classList = {};
  var ctx = {};
  var d_prime = 0.0;
  var expect = 0.0;
  var factor = 0.0;
  var initOnly = argList[0];
  var mu = 0.0;
  var N = 0;
  var pGuess = 1.0 / 3.0;
  var plot = {};
  var plotObj = {};
  var prob = 0.0;
  var sigma_p = 0.0;
  var sub = 0;
  var testType = "";
  var theoreticalCorr = 0.0;
  var theory_binomial = [];
  var theory_pCorr = 0.0;
  var theory_sigma = 0.0;
  var yMajor = 0.0;
  var yMax = 0.0;

  // console.log("in MULTI TRIAL : " + initOnly + " and " + cascade);
  // update the number of subjects (from one trial)
  document.getElementById('multiTrialD_prime').innerHTML =
    diffTest.d_prime.value;
  document.getElementById('multiTrialTest').innerHTML =
    diffTest.testType.value;
  document.getElementById('multiTrialN').innerHTML =
    diffTest.N.value;

  // change the status of the simulation start/stop button
  if (initOnly || (!initOnly && diffTest.simTestMultiTrial.running)) {
    diffTest.simTestMultiTrial.running = false;
    if (initOnly) {
      document.getElementById('simMulti_nCorr').innerHTML = "N/A";
      document.getElementById('simMulti_pCorr').innerHTML = "N/A";
      document.getElementById('simMulti_sigma').innerHTML = "N/A";
      document.getElementById('startStopTestMultiTrial').innerHTML = "START";
      diffTest.simTestMultiTrial.simIdx = diffTest.simTestMultiTrial_T.value;
    } else {
      document.getElementById('startStopTestMultiTrial').innerHTML =
              (diffTest.simTestMultiTrial.simIdx+1).toFixed(0) + ": CONT.";
    }
    if (diffTest.runningPerceptualTestMultiTrialID) {
      clearTimeout(diffTest.runningPerceptualTestMultiTrialID);
    }
    if (!initOnly) {
      return;
    }
  } else {
    diffTest.simTestMultiTrial.running = true;
    // if had been stopped, then start over; else if paused, just keep going
    if (diffTest.simTestMultiTrial.simIdx>=diffTest.simTestMultiTrial_T.value) {
      // initialize variables
      diffTest.simTestMultiTrial.simIdx = 0;
      mathLibrary.seedRandom(diffTest.randSeed.value);
      diffTest.simTestMultiTrial.simResults = [];
      for (cIdx = 0; cIdx <= diffTest.N.value; cIdx++) {
        diffTest.simTestMultiTrial.simResults.push(0);
      }
      document.getElementById('simMulti_nCorr').innerHTML = "N/A";
      document.getElementById('simMulti_pCorr').innerHTML = "N/A";
      document.getElementById('simMulti_sigma').innerHTML = "N/A";
    }
  }

  // get the relevant parameter values
  d_prime = diffTest.d_prime.value;
  if (d_prime <= 0.0) {
    d_prime = 0.001;
  }
  N = diffTest.N.value;
  testType = diffTest.testType.value;

  // compute parameters for binomial distribution
  if (testType == "triangle") {
    theory_pCorr = mathLibrary.probCorrectTriangle(d_prime);
  } else {
    theory_pCorr = mathLibrary.probCorrect3AFC(d_prime);
  }
  theory_sigma = Math.sqrt(N * theory_pCorr * (1.0 - theory_pCorr));

  // set in HTML the percent correct and sigma for each hypothesis
  expect = N * theory_pCorr;
  sigma_p = theory_sigma / N;
  document.getElementById('theory_nCorr').innerHTML = expect.toFixed(1);
  document.getElementById('theory_pCorr').innerHTML = theory_pCorr.toFixed(3);
  document.getElementById('theory_sigma').innerHTML = sigma_p.toFixed(2);

  // get the canvas and context (ctx)
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  plotObj = createBinomialPlot(canvas, -1.0, theory_sigma, N);
  plot = plotObj.plot;
  yMax = plotObj.yMax;

  // create and plot model (binomial) data
  binomialObj = createBinomialData(N, theory_pCorr, -1, 0);
  theory_binomial = binomialObj.binomial;
  barLineWidth = 1;
  if (N > 50) {
    barLineWidth = 0;
  }
  plotBarData(ctx, plot, "theory", theory_binomial, "rgb(0,200,0,0.60)", {},
              "black", "solid", barLineWidth);


  // create and position the plot legend
  plot.legend = [ ["theory", "binomial distribution"],
                  ["simulation", "simulation"] ];
  plot.legendPosition = [plot.xMin * 1.00, yMax * 1.03];
  plot.legendBorderPx = 0;

  diffTest.simTestMultiTrial.N = N;
  diffTest.simTestMultiTrial.theory_pCorr = theory_pCorr;

  if (initOnly && cascade) {
    diffTest.initPlotPerceptualTestH0([initOnly, cascade]);
  }

  // if only initializing, then update plot and return; else start simulation
  if (initOnly) {
    // update the plot to include the legend
    plotUpdate(ctx, plot, [], []);

    // plot sigma range over maximum of distribution
    plotSigma(ctx, plot, "p", theory_pCorr*N, theory_sigma, yMax);
  } else {
    // begin simulation
    perceptualTestMultiTrial_simulation(ctx, plot, yMax, theory_sigma, d_prime);
  }

  return;
}

//------------------------------------------------------------------------------

function perceptualTestMultiTrial_simulation(ctx, plot, yMax, theory_sigma,
                   d_prime) {
  var avg = 0.0;
  var bar = [];
  var barLineWidth = 0;
  var C = 0;
  var cIdx = 0;
  var delay = 0.0;
  var distanceAB = 0.0;
  var distanceAX = 0.0;
  var distanceBX = 0.0;
  var duplicate = "";
  var minDist = 0.0;
  var mostDifferent = "";
  var N = 0;
  var nIdx = 0;
  var percentCorrect = 0.0;
  var randValue = 0.0;
  var sIdx = diffTest.simTestMultiTrial.simIdx;
  var simTestMultiTrial_T = diffTest.simTestMultiTrial_T.value;
  var simulationData = [];
  var sim_sigma = 0.0;
  var statsObj = {};
  var success = true;
  var sum = 0.0;
  var sumSq = 0.0;
  var testData = {};
  var theory_pCorr = 0.0;
  var total = 0.0;
  var trueDifferent = "";
  var xA = 0.0;
  var xAList = [];
  var xBList = [];
  var xB = 0.0;
  var xPx = 0.0;
  var xX = 0.0;
  var yAList = [];
  var yBList = [];
  var yPx = 0.0;

  // if stopped running simulation, then return
  if (diffTest.simTestMultiTrial.running == false) {
    return;
  }

  document.getElementById('startStopTestMultiTrial').innerHTML =
        (sIdx+1).toFixed(0) + ": PAUSE";

  // compute the delay for each phase of the simulation, in milliseconds
  delay = diffTest.simTestMultiTrial_delay.value * 1000.0;

  // set variables
  N = diffTest.simTestMultiTrial.N;
  theory_pCorr = diffTest.simTestMultiTrial.theory_pCorr;

  // remove any simulation points from previous iteration, then update the plot
  plotRemoveData(ctx, plot, "simulation");

  if (simTestMultiTrial_T > 0) {
    C = 0;
    for (nIdx = 0; nIdx < N; nIdx++) {
      testData = generatePerceptualTestData(d_prime,
                         diffTest.testType.value);
      success = scoreTestData(testData);
      if (success) C += 1;
    }

    cIdx = C;
    diffTest.simTestMultiTrial.simResults[cIdx] += 1;
    // console.log(sIdx + " : " + C + " / " + N + " : " +
         // diffTest.simTestMultiTrial.simResults);

    if (delay >= 0) {
      simulationData = [];
      for (cIdx = 0; cIdx <= N; cIdx++) {
        bar = [cIdx-0.5, cIdx+0.5, 0.0,
              diffTest.simTestMultiTrial.simResults[cIdx]/simTestMultiTrial_T];
        simulationData.push(bar);
      }
      barLineWidth = 1;
      if (N > 50) {
        barLineWidth = 0;
      }
      plotBarData(ctx, plot, "simulation", simulationData, "none",
                {spacing:4, angleUp:1, angleDown:1, horizontal:0, vertical:0},
                "blue", "solid", barLineWidth);
    }
    statsObj = computeSimStats(diffTest.simTestMultiTrial.simResults);
    sim_sigma = statsObj.sigma;
    avg = statsObj.avg;
  }

  // update the plot to show the legend, then plot sigma
  plotUpdate(ctx, plot, [], []);
  plotSigma(ctx, plot, "p", theory_pCorr*N, theory_sigma, yMax);

  // compute and display on HTML the percent correct so far
  document.getElementById('simMulti_nCorr').innerHTML = avg.toFixed(1);
  document.getElementById('simMulti_pCorr').innerHTML = (avg/N).toFixed(3);
  document.getElementById('simMulti_sigma').innerHTML = (sim_sigma/N).toFixed(2);

  // if we're not done yet, call this function again after specified delay.
  if (sIdx < simTestMultiTrial_T-1) {
    diffTest.simTestMultiTrial.simIdx += 1;
    diffTest.runningPerceptualTestMultiTrialID =
            setTimeout(perceptualTestMultiTrial_simulation, delay, ctx, plot,
                         yMax, theory_sigma, d_prime);
  } else {
    // stop
    diffTest.simTestMultiTrial.running = false;
    diffTest.simTestMultiTrial.simIdx = diffTest.simTestMultiTrial_T.value;
    mathLibrary.seedRandom(diffTest.randSeed.value);
    diffTest.simTestMultiTrial.simResults = [];
    for (cIdx = 0; cIdx <= N; cIdx++) {
      diffTest.simTestMultiTrial.simResults.push(0);
    }
    document.getElementById('startStopTestMultiTrial').innerHTML = "START";
  }

}

//==============================================================================

//------------------------------------------------------------------------------
// initPlotPerceptualTestH0()
// initialize the plot of perceptual test with hypothesis H0

this.initPlotPerceptualTestH0 = function(argList = [false, false]) {
  var alpha = 0.0;
  var bar = [];
  var barLineWidth = 0;
  var cascade = argList[1];
  var canvas = {};
  var canvasName = "canvas5";
  var cIdx = 0;
  var ctx = {};
  var d_prime = 0.0;
  var H0_binomial = [];
  var H0_binomial_inconclusive = [];
  var H0_binomial_reject = [];
  var initOnly = argList[0];
  var N = 0;
  var pCorr_H0 = 0.0;
  var plot = {};
  var plotObj = {};
  var prob = 0.0;
  var regionLEE_max = 0.0;
  var sigma_H0 = 0.0;
  var sigma_H0_p = 0.0;
  var sumProb = 0.0;
  var sub = 0;
  var testType = "";
  var thresholdN_H0 = 0.0;
  var yMax = 0.0;

  // console.log("in H0 : " + initOnly + " and " + cascade);
  // update the number of subjects (from one trial)
  document.getElementById('H0_D_prime').innerHTML = d_prime;
  document.getElementById('H0_Test').innerHTML = diffTest.testType.value;
  document.getElementById('H0_N').innerHTML = diffTest.N.value;

  // change the status of the simulation start/stop button
  if (initOnly || (!initOnly && diffTest.simTestH0.running)) {
    diffTest.simTestH0.running = false;
    if (initOnly) {
      document.getElementById('simTestH0_nCorr_H0').innerHTML = "N/A";
      document.getElementById('simTestH0_pCorr_H0').innerHTML = "N/A";
      document.getElementById('simTestH0_sigma_H0').innerHTML = "N/A";
      document.getElementById('simTestH0_reject_H0').innerHTML = "N/A";
      document.getElementById('startStopTestH0').innerHTML = "START";
      diffTest.simTestH0.simIdx = diffTest.simTestH0_T.value;
    } else {
      document.getElementById('startStopTestH0').innerHTML =
              (diffTest.simTestH0.simIdx+1).toFixed(0) + ": CONT.";
    }
    if (diffTest.runningPerceptualTestH0ID) {
      clearTimeout(diffTest.runningPerceptualTestH0ID);
    }
    if (!initOnly) {
      return;
    }
  } else {
    diffTest.simTestH0.running = true;
    // if had been stopped, then start over; else if paused, just keep going
    if (diffTest.simTestH0.simIdx >= diffTest.simTestH0_T.value) {
      // initialize variables
      diffTest.simTestH0.simIdx = 0;
      mathLibrary.seedRandom(diffTest.randSeed.value);
      diffTest.simTestH0.simResults = [];
      for (cIdx = 0; cIdx <= diffTest.simTestH0_T.value; cIdx++) {
        diffTest.simTestH0.simResults.push(0);
      }
      diffTest.simTestH0.reject = 0;
      diffTest.simTestH0.numTrials = 0;
      document.getElementById('simTestH0_nCorr_H0').innerHTML = "N/A";
      document.getElementById('simTestH0_pCorr_H0').innerHTML = "N/A";
      document.getElementById('simTestH0_sigma_H0').innerHTML = "N/A";
      document.getElementById('simTestH0_reject_H0').innerHTML = "N/A";
    }
  }

  // get the relevant parameter values
  if (d_prime <= 0.0) {
    d_prime = 0.001;
  }
  N = diffTest.N.value;
  testType = diffTest.testType.value;

  // compute parameters for binomial distribution for H0
  pCorr_H0 = 1.0 / 3.0;
  sigma_H0 = Math.sqrt(N * pCorr_H0 * (1.0 - pCorr_H0));
  sigma_H0_p = sigma_H0 / N;

  // set in HTML the percent correct and sigma for each hypothesis
  diffTest.pCorr_H0 = pCorr_H0;
  document.getElementById('H0_nCorr_H0').innerHTML = (N * pCorr_H0).toFixed(1);
  document.getElementById('H0_pCorr_H0').innerHTML = pCorr_H0.toFixed(3);
  document.getElementById('H0_sigma_H0').innerHTML = sigma_H0_p.toFixed(2);

  // get the canvas and context (ctx)
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // create the plot
  plotObj = createBinomialPlot(canvas, sigma_H0, -1.0, N);
  plot = plotObj.plot;
  yMax = plotObj.yMax;

  // create the binomial distribution
  diffTest.H0Obj = createBinomialData(N, pCorr_H0, -1, 0);
  H0_binomial = diffTest.H0Obj.binomial;

  // find the threshold at which p(reject H0 | H0) <= alpha
  alpha = diffTest.alpha.value;
  sumProb = 0.0;
  for (sub = N; sub >= 0; sub -= 1) {
    prob = H0_binomial[sub][3];
    sumProb += prob;
    if (sumProb.toFixed(8) > alpha.toFixed(8)) {
      // we went too far; go back one subject
      // (limit to N places past the decimal to avoid rounding errors)
      thresholdN_H0 = sub + 1;
      sumProb -= prob;
      break;
    }
  }
  if (sub < 0) {
    // alpha must be 1.0
    if (alpha < 1.0) {
      console.log("\n**** ERROR!! sub < 0 but alpha is " + alpha);
    }
    thresholdN_H0 = 0;
    sumProb = 1.0;
  }
  thresholdN_H0 = parseInt(thresholdN_H0);
  document.getElementById('H0_threshN_H0').innerHTML = thresholdN_H0;
  document.getElementById('H0_pRej_H0').innerHTML = sumProb.toFixed(3);
  diffTest.thresholdN_H0 = thresholdN_H0;
  diffTest.pRej_H0 = sumProb;

  // find the threshold at which p(accept H0 | H0) <= alpha
  sumProb = 0.0;
  for (sub = 0; sub <= N; sub += 1) {
    prob = H0_binomial[sub][3];
    sumProb += prob;
    // console.log("n = " + sub + ", p(n) = " + prob + ", sum p = " + sumProb);
    if (sumProb.toFixed(8) > alpha.toFixed(8)) {
      // we went too far; go back one subject
      // (limit to N places past the decimal to avoid rounding errors)
      regionLEE_max = sub - 1;
      sumProb -= prob;
      break;
    }
  }
  if (sub > N) {
    regionLEE_max = N;
  }
  regionLEE_max = parseInt(regionLEE_max);
  diffTest.simTestH0.regionLEE_max = regionLEE_max;

  // plot the data
  for (sub = 0; sub <= N; sub++) {
    bar = [sub-0.5, sub+0.5, 0.0, H0_binomial[sub][3]];
    if (sub < thresholdN_H0) {
      H0_binomial_inconclusive.push(bar);
    } else {
      H0_binomial_reject.push(bar);
    }
  }
  barLineWidth = 1;
  if (N > 50) {
    barLineWidth = 0;
  }
  plotBarData(ctx, plot, "H0_inconclusive", H0_binomial_inconclusive,
              "rgb(220,0,0,0.80)", {}, "black", "solid", barLineWidth);
  plotBarData(ctx, plot, "H0_reject", H0_binomial_reject,
              "rgb(128,14,37,1.0)", {}, "black", "solid", barLineWidth);

  // create and position the plot legend
  plot.legend = [["H0_inconclusive", "H0 inconclusive"],
                 ["H0_reject", "H0 reject"],
                 ["simulation", "simulation"]];
  plot.legendPosition = [plot.xMin * 1.00, yMax * 0.97];
  plot.legendBorderPx = 0;


  if (initOnly && cascade) {
    diffTest.initPlotPerceptualTestH0H1([initOnly, cascade]);
  }

  // if only initializing, then update plot and return; else start simulation
  if (initOnly) {
    // update the plot to include the legend
    plotUpdate(ctx, plot, [], []);

    // plot sigma range over maximum of H0, and indicate alpha with vert. line
    plotSigma(ctx, plot, "H0", pCorr_H0*N, sigma_H0, yMax*0.86);
    plotAlpha(ctx, plot, "H0", thresholdN_H0, yMax*0.94);
    regionLEE_max = diffTest.simTestH0.regionLEE_max;
    plotRegion(ctx, plot, [-0.5, regionLEE_max+0.5], "R<sub>L(EE)</sub>", yMax);
  } else {
    // begin simulation
    perceptualTestH0_simulation(ctx, plot, yMax, sigma_H0);
  }

  return;
}

//------------------------------------------------------------------------------

function perceptualTestH0_simulation(ctx, plot, yMax, sigma_H0) {
  var avg = 0.0;
  var bar = [];
  var barLineWidth = 0;
  var C = 0;
  var cIdx = 0;
  var delay = 0.0;
  var N = 0;
  var nIdx = 0;
  var regionLEE_max = 0.0;
  var sIdx = diffTest.simTestH0.simIdx;
  var sim_sigma = 0.0;
  var simTestH0_T = diffTest.simTestH0_T.value;
  var simulationData = [];
  var statsObj = {};
  var success = true;
  var testData = {};

  // if stopped running simulation, then return
  if (diffTest.simTestH0.running == false) {
    return;
  }
  document.getElementById('startStopTestH0').innerHTML =
        (sIdx+1).toFixed(0) + ": PAUSE";

  // set variables
  N = diffTest.N.value;
  delay = diffTest.simTestH0_delay.value * 1000.0;

  // remove any simulation points from previous iteration, then update the plot
  plotRemoveData(ctx, plot, "simulation");

  if (simTestH0_T > 0) {
    C = 0;
    for (nIdx = 0; nIdx < N; nIdx++) {
      testData = generatePerceptualTestData(0.0, diffTest.testType.value);
      success = scoreTestData(testData);
      if (success) C += 1;
    }

    diffTest.simTestH0.simResults[C] += 1;

    diffTest.simTestH0.numTrials += 1;
    if (parseInt(C) >= diffTest.thresholdN_H0) {
      diffTest.simTestH0.reject += 1;
    }

    if (delay >= 0) {
      simulationData = [];
      for (cIdx = 0; cIdx <= N; cIdx++) {
        bar = [cIdx-0.5, cIdx+0.5, 0.0,
              diffTest.simTestH0.simResults[cIdx]/simTestH0_T];
        simulationData.push(bar);
      }
      barLineWidth = 1;
      if (N > 40) {
        barLineWidth = 0;
      }
      plotBarData(ctx, plot, "simulation", simulationData, "none",
                {spacing:4, angleUp:1, angleDown:0, horizontal:0, vertical:0},
                "blue", "solid", barLineWidth);
    }
    statsObj = computeSimStats(diffTest.simTestH0.simResults);
    sim_sigma = statsObj.sigma;
    avg = statsObj.avg;
  }

  // update the plot to show the legend; plot sigma, alpha, etc
  plotUpdate(ctx, plot, [], []);
  plotSigma(ctx, plot, "H0", diffTest.pCorr_H0*N, sigma_H0, yMax*0.94);
  plotAlpha(ctx, plot, "H0", diffTest.thresholdN_H0, yMax*0.94);
  regionLEE_max = diffTest.simTestH0.regionLEE_max;
  plotRegion(ctx, plot, [-0.5, regionLEE_max+0.5], "R<sub>L(EE)</sub>", yMax);

  // compute and display on HTML the results so far
  document.getElementById('simTestH0_nCorr_H0').innerHTML = avg.toFixed(1);
  document.getElementById('simTestH0_pCorr_H0').innerHTML = (avg/N).toFixed(3);
  document.getElementById('simTestH0_sigma_H0').innerHTML =
                          (sim_sigma/N).toFixed(2);
  document.getElementById('simTestH0_reject_H0').innerHTML =
                          (100.0*diffTest.simTestH0.reject /
                           diffTest.simTestH0.numTrials).toFixed(2);

  // if we're not done yet, call this function again after specified delay.
  if (sIdx < simTestH0_T-1) {
    diffTest.simTestH0.simIdx += 1;
    diffTest.runningPerceptualTestH0ID =
            setTimeout(perceptualTestH0_simulation, delay, ctx, plot,
                         yMax, sigma_H0);
  } else {
    // stop
    diffTest.simTestH0.running = false;
    diffTest.simTestH0.simIdx = diffTest.simTestH0_T.value;
    mathLibrary.seedRandom(diffTest.randSeed.value);
    diffTest.simTestH0.simResults = [];
    for (cIdx = 0; cIdx <= N; cIdx++) {
      diffTest.simTestH0.simResults.push(0);
    }
    diffTest.simTestH0.reject = 0;
    diffTest.simTestH0.numTrials = 0;
    document.getElementById('startStopTestH0').innerHTML = "START";
  }

  return;
}

//==============================================================================

//------------------------------------------------------------------------------
// initPlotPerceptualTestH0H1()
// initialize the plot of perceptual test with hypothesis H0 and H1

this.initPlotPerceptualTestH0H1 = function(argList = [false, false]) {
  var bar = [];
  var barLineWidth = 0;
  var beta = 0.0;
  var canvas = {};
  var canvasName = "canvas6";
  var cascade = argList[1];
  var cIdx = 0;
  var ctx = {};
  var d_prime = 0.0;
  var H0_binomial = [];
  var H1_binomial = [];
  var initOnly = argList[0];
  var N = 0;
  var pCorr_H0 = 0.0;
  var pCorr_H1 = 0.0;
  var plot = {};
  var plotObj = {};
  var power = 0.0;
  var regionLEE_max = 0.0;
  var sigma_H0 = 0.0;
  var sigma_H1 = 0.0;
  var yMax = 0.0;

  // console.log("in H0 and H1 : " + initOnly + " and " + cascade);
  // update the number of subjects (from one trial)
  document.getElementById('H0H1_D_prime').innerHTML = diffTest.d_prime.value;
  document.getElementById('H0H1_Test').innerHTML = diffTest.testType.value;
  document.getElementById('H0H1_N').innerHTML = diffTest.N.value;
  document.getElementById('H0H1_alpha').innerHTML = diffTest.alpha.value;

  //--------------------------------------------------------------
  // change the status of the simulation start/stop button
  if (initOnly || (!initOnly && diffTest.simTestH0H1.running)) {
    diffTest.simTestH0H1.running = false;
    if (initOnly) {
      document.getElementById('simTestH0H1_nCorr_H1').innerHTML = "N/A";
      document.getElementById('simTestH0H1_pCorr_H1').innerHTML = "N/A";
      document.getElementById('simTestH0H1_sigma_H1').innerHTML = "N/A";
      document.getElementById('simTestH0H1_inconclusive_H1').innerHTML = "N/A";
      document.getElementById('startStopTestH0H1').innerHTML = "START";
      diffTest.simTestH0H1.simIdx = diffTest.simTestH0H1_T.value;
    } else {
      document.getElementById('startStopTestH0H1').innerHTML =
              (diffTest.simTestH0H1.simIdx+1).toFixed(0) + ": CONT.";
    }
    if (diffTest.runningPerceptualTestH0H1ID) {
      clearTimeout(diffTest.runningPerceptualTestH0H1ID);
    }
    if (!initOnly) {
      return;
    }
  } else {
    diffTest.simTestH0H1.running = true;
    // if had been stopped, then start over; else if paused, just keep going
    if (diffTest.simTestH0H1.simIdx >= diffTest.simTestH0H1_T.value) {
      // initialize variables
      diffTest.simTestH0H1.simIdx = 0;
      diffTest.simTestH0H1.inconclusive = 0;
      mathLibrary.seedRandom(diffTest.randSeed.value);
      diffTest.simTestH0H1.simResults = [];
      for (cIdx = 0; cIdx <= diffTest.N.value; cIdx++) {
        diffTest.simTestH0H1.simResults.push(0);
      }
      document.getElementById('simTestH0H1_nCorr_H1').innerHTML = "N/A";
      document.getElementById('simTestH0H1_pCorr_H1').innerHTML = "N/A";
      document.getElementById('simTestH0H1_sigma_H1').innerHTML = "N/A";
      document.getElementById('simTestH0H1_inconclusive_H1').innerHTML = "N/A";
    }
  }

  //--------------------------------------------------------------
  // we need to do some computations now in order to show beta
  d_prime = diffTest.d_prime.value;
  if (d_prime <= 0.0) {
    d_prime = 0.001;
  }
  N = diffTest.N.value;

  // compute parameters for binomial distribution for H0 and H1
  pCorr_H0 = diffTest.pCorr_H0;
  sigma_H0 = Math.sqrt(N * pCorr_H0 * (1.0 - pCorr_H0));
  if (diffTest.testType.value == "triangle") {
    pCorr_H1 = mathLibrary.probCorrectTriangle(d_prime);
  } else {
    pCorr_H1 = mathLibrary.probCorrect3AFC(d_prime);
  }
  diffTest.pCorr_H1 = pCorr_H1;
  sigma_H1 = Math.sqrt(N * pCorr_H1 * (1.0 - pCorr_H1));

  // create data for H1; determine beta
  diffTest.H1Obj = createBinomialData(N, pCorr_H1, diffTest.thresholdN_H0, 0);
  H1_binomial = diffTest.H1Obj.binomial;
  beta = diffTest.H1Obj.beta;
  power = 1.0 - beta;

  diffTest.beta = beta;
  document.getElementById('H0H1_beta').innerHTML = beta.toFixed(2);
  document.getElementById('H0H1_power').innerHTML = power.toFixed(2);

  //--------------------------------------------------------------
  // get the canvas and context (ctx)
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // create the plot
  plotObj = createBinomialPlot(canvas, sigma_H0, sigma_H1, N);
  plot = plotObj.plot;
  yMax = plotObj.yMax;

  // set the HTML for H0 and H1 information
  document.getElementById('H0H1_pCorr_H0').innerHTML = pCorr_H0.toFixed(3);
  document.getElementById('H0H1_threshN_H0').innerHTML =
                          diffTest.thresholdN_H0.toFixed(0);
  document.getElementById('H0H1_pRej_H0').innerHTML =
                          diffTest.pRej_H0.toFixed(3);

  document.getElementById('H0H1_nCorr_H1').innerHTML =
                          (N * pCorr_H1).toFixed(1);
  document.getElementById('H0H1_pCorr_H1').innerHTML = pCorr_H1.toFixed(3);
  document.getElementById('H0H1_sigma_H1').innerHTML = sigma_H1.toFixed(2);
  document.getElementById('H0H1_beta_H1').innerHTML = beta.toFixed(3);

  // get data for H0
  H0_binomial = diffTest.H0Obj.binomial;

  // plot the binomial distributions
  barLineWidth = 1;
  if (N > 50) {
    barLineWidth = 0;
  }
  plotBarData(ctx, plot, "H0", H0_binomial, "rgb(220,0,0,0.80)", {},
              "black", "solid", barLineWidth);
  plotBarData(ctx, plot, "H1", H1_binomial, "rgb(0,200,0,0.60)", {},
              "black", "solid", barLineWidth);

  // create and position the plot legend
  plot.legend = [["H0", "H0"],
                 ["H1", "H1"],
                 ["simulation", "simulation"]];
  plot.legendPosition = [plot.xMin * 1.00, yMax * 0.90];
  plot.legendBorderPx = 0;

  if (initOnly && cascade) {
    diffTest.initPlotPerceptualTestLR([initOnly, cascade]);
  }

  // if only initializing, then update plot and return; else start simulation
  if (initOnly) {
    // update the plot to include the legend
    plotUpdate(ctx, plot, [], []);

    // plot sigma range over maximum of H0 and H1
    plotSigma(ctx, plot, "H1", pCorr_H1*N, sigma_H1, yMax*0.94);
    plotAlpha(ctx, plot, "H0", diffTest.thresholdN_H0, yMax*0.94);
    plotLegendH0andH1(ctx, plot, "both H0 and H1", plot.xMin, plot.yMax*0.90);
    regionLEE_max = diffTest.simTestH0.regionLEE_max;
    plotRegion(ctx, plot, [-0.5, regionLEE_max+0.5], "R<sub>L(EE)</sub>", yMax);
  } else {
    // begin simulation
    perceptualTestH0H1_simulation(ctx, plot, yMax, sigma_H0, sigma_H1, d_prime);
  }

  return;
}

//------------------------------------------------------------------------------

function perceptualTestH0H1_simulation(ctx, plot, yMax, sigma_H0, sigma_H1,
                          d_prime) {
  var avg = 0.0;
  var bar = [];
  var barLineWidth = 0;
  var C = 0;
  var cIdx = 0;
  var delay = 0.0;
  var N = 0;
  var nIdx = 0;
  var regionLEE_max = 0.0;
  var sIdx = diffTest.simTestH0H1.simIdx;
  var sim_sigma = 0.0;
  var simTestH0H1_T = diffTest.simTestH0H1_T.value;
  var simulationData = [];
  var statsObj = {};
  var success = true;
  var testData = {};

  // if stopped running simulation, then return
  if (diffTest.simTestH0H1.running == false) {
    return;
  }

  document.getElementById('startStopTestH0H1').innerHTML =
        (sIdx+1).toFixed(0) + ": PAUSE";

  // set variables
  delay = diffTest.simTestH0H1_delay.value * 1000.0;
  N = diffTest.N.value;
  barLineWidth = 1;
  if (N > 40) {
    barLineWidth = 0;
  }

  // remove any simulation points from previous iteration, then update the plot
  plotRemoveData(ctx, plot, "simulation");

  if (simTestH0H1_T > 0) {
    C = 0;
    for (nIdx = 0; nIdx < N; nIdx++) {
      testData = generatePerceptualTestData(d_prime, diffTest.testType.value);
      success = scoreTestData(testData);
      if (success) C += 1;
    }

    if (C < diffTest.thresholdN_H0) {
      diffTest.simTestH0H1.inconclusive += 1;
    }
    diffTest.simTestH0H1.simResults[C] += 1;
    // console.log(sIdx + " : " + C + " / " + N + " : " +
         // diffTest.simTestH0H1.simResults);

    if (delay >= 0) {
      simulationData = [];
      for (cIdx = 0; cIdx <= N; cIdx++) {
        bar = [cIdx-0.5, cIdx+0.5, 0.0,
              diffTest.simTestH0H1.simResults[cIdx]/simTestH0H1_T];
        simulationData.push(bar);
      }
      plotBarData(ctx, plot, "simulation", simulationData, "none",
                {spacing:4, angleUp:1, angleDown:1, horizontal:0, vertical:0},
                "black", "solid", barLineWidth);
    }

    // compute statistics
    statsObj = computeSimStats(diffTest.simTestH0H1.simResults);
    sim_sigma = statsObj.sigma;
    avg = statsObj.avg;
  }

  // update the plot to show the legend; plot sigma, alpha, etc
  plotUpdate(ctx, plot, [], []);
  plotSigma(ctx, plot, "H1", diffTest.pCorr_H1*N, sigma_H1, yMax*0.94);
  plotAlpha(ctx, plot, "H0", diffTest.thresholdN_H0, yMax*0.94);
  plotLegendH0andH1(ctx, plot, "both H0 and H1", plot.xMin, plot.yMax*0.90);
  regionLEE_max = diffTest.simTestH0.regionLEE_max;
  plotRegion(ctx, plot, [-0.5, regionLEE_max+0.5], "R<sub>L(EE)</sub>", yMax);

  // compute and display on HTML the percent correct so far
  document.getElementById('simTestH0H1_nCorr_H1').innerHTML = avg.toFixed(1);
  document.getElementById('simTestH0H1_pCorr_H1').innerHTML =
                          (avg/N).toFixed(3);
  document.getElementById('simTestH0H1_sigma_H1').innerHTML =
                          sim_sigma.toFixed(2);
  if (simTestH0H1_T == 0) {
    document.getElementById('simTestH0H1_inconclusive_H1').innerHTML = "N/A";
  } else {
    document.getElementById('simTestH0H1_inconclusive_H1').innerHTML =
        (100.0 * diffTest.simTestH0H1.inconclusive / sIdx).toFixed(1);
  }

  // if we're not done yet, call this function again after specified delay.
  if (sIdx < simTestH0H1_T-1) {
    diffTest.simTestH0H1.simIdx += 1;
    diffTest.runningPerceptualTestH0H1ID =
            setTimeout(perceptualTestH0H1_simulation, delay, ctx, plot,
                         yMax, sigma_H0, sigma_H1, d_prime);
  } else {
    // stop
    diffTest.simTestH0H1.running = false;
    diffTest.simTestH0H1.simIdx = diffTest.simTestH0H1_T.value;
    mathLibrary.seedRandom(diffTest.randSeed.value);
    diffTest.simTestH0H1.simResults = [];
    for (cIdx = 0; cIdx <= N; cIdx++) {
      diffTest.simTestH0H1.simResults.push(0);
    }
    document.getElementById('startStopTestH0H1').innerHTML = "START";
  }

  return;
}

//==============================================================================

//------------------------------------------------------------------------------
// initPlotPerceptualTestLR()
// initialize the plot of perceptual test with hypothesis H0 and H1

this.initPlotPerceptualTestLR = function(argList = [false, false]) {
  var alpha = 0.0;
  var barLineWidth = 0;
  var brief_d_prime = "";
  var canvas = {};
  var canvasName = "canvas7";
  var cascade = argList[1];
  var correct = 0;
  var ctx = {};
  var d_prime = 0.0;
  var H0_binomial = [];
  var H1_binomial = [];
  var initOnly = argList[0];
  var L_H0 = 0.0;
  var L_H1 = 0.0;
  var LR = 0.0;
  var N = 0;
  var nIdx = 0;
  var pCorr_H0 = 0.0;
  var pCorr_H1 = 0.0;
  var pLObj = {};
  var plot = {};
  var plotObj = {};
  var pValue_H0 = 0.0;
  var regionBoundary = 0.0;
  var regionLEE_max = 0.0;
  var sigma_H0 = 0.0;
  var sigma_H1 = 0.0;
  var whichH = "";
  var yMax = 0.0;

  // console.log("in LR : " + initOnly + " and " + cascade);
  d_prime = diffTest.d_prime.value;
  if (d_prime <= 0.0) {
    d_prime = 0.001;
  }
  N = diffTest.N.value;
  alpha = diffTest.alpha.value;
  pCorr_H0 = diffTest.pCorr_H0;
  pCorr_H1 = diffTest.pCorr_H1;
  correct = diffTest.LR_numCorr.value;
  if (correct > N) {
    document.getElementById(diffTest.LR_numCorr.id).value = N;
    correct = N;
    // need to say that the user has set this, otherwise it doesn't change
    // common.set(diffTest.LR_numCorr, 1);
    diffTest.LR_numCorr.userSet = 1;
    diffTest.LR_numCorr.value = N;
    common.setSavedValue(diffTest.LR_numCorr, 1);
  }
  sigma_H0 = Math.sqrt(N * pCorr_H0 * (1.0 - pCorr_H0));
  sigma_H1 = Math.sqrt(N * pCorr_H1 * (1.0 - pCorr_H1));

  // set the HTML for input parameters
  document.getElementById('LR_D_prime').innerHTML = d_prime;
  document.getElementById('LR_Test').innerHTML = diffTest.testType.value;
  document.getElementById('LR_N').innerHTML = N;
  document.getElementById('LR_alpha').innerHTML = alpha;
  document.getElementById('LR_beta').innerHTML = diffTest.beta.toFixed(2);
  document.getElementById('LR_power').innerHTML =
                          (1.0 - diffTest.beta).toFixed(2);

  // get the canvas and context (ctx)
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // create plot
  plotObj = createBinomialPlot(canvas, sigma_H0, sigma_H1, N);
  plot = plotObj.plot;
  yMax = plotObj.yMax;

  // create H0 data
  H0_binomial = diffTest.H0Obj.binomial;
  pLObj = getPValueLikelihood(diffTest.H0Obj.binomial, correct);
  pValue_H0 = pLObj.pValue;
  L_H0 = pLObj.likelihood;

  // set the HTML for H0
  document.getElementById('LR_pCorr_H0').innerHTML = pCorr_H0.toFixed(3);
  document.getElementById('LR_threshN_H0').innerHTML =
                          diffTest.thresholdN_H0.toFixed(0);
  document.getElementById('LR_pRej_H0').innerHTML = diffTest.pRej_H0.toFixed(3);
  document.getElementById('LR_pValue_H0').innerHTML =
                          pValue_H0.toFixed(3);

  // create H1 data
  H1_binomial = diffTest.H1Obj.binomial;
  pLObj = getPValueLikelihood(diffTest.H1Obj.binomial, correct);
  L_H1 = pLObj.likelihood;
  for (nIdx = 0; nIdx <= N; nIdx++) {
    if (H1_binomial[nIdx][3] > H0_binomial[nIdx][3]) {
      regionBoundary = nIdx;
      break;
    }
  }

  // set the HTML for H1
  document.getElementById('LR_nCorr_H1').innerHTML = (N * pCorr_H1).toFixed(1);
  document.getElementById('LR_pCorr_H1').innerHTML = pCorr_H1.toFixed(3);
  document.getElementById('LR_beta_H1').innerHTML = diffTest.beta.toFixed(3);

  // compute likelihood ratio
  LR = 1.0;
  whichH = "Hx";
  if (L_H0 > 0.0 || L_H1 > 0.0) {
    if (L_H0 > L_H1) {
      LR = L_H0 / L_H1;
      whichH = "H0";
    } else {
      LR = L_H1 / L_H0;
      whichH = "H1";
    }
  }

  // set the HTML for likelihoods
  // console.log("LR: " + LR.toFixed(4) + " from L_H0 = " + L_H0.toFixed(4) +
              // " and L_H1 = " + L_H1.toFixed(4));
  document.getElementById('LR_L_H0').innerHTML = L_H0.toFixed(3);
  document.getElementById('LR_L_H1').innerHTML = L_H1.toFixed(3);
  document.getElementById('LR_LR').innerHTML = "200+";
  if (LR <= 200.0) {
    document.getElementById('LR_LR').innerHTML = LR.toFixed(2);
  }
  document.getElementById('LR_whichH').innerHTML = whichH;

  // plot binomial distributions
  barLineWidth = 1;
  if (N > 50) {
    barLineWidth = 0;
  }
  plotBarData(ctx, plot, "H0", H0_binomial, "rgb(220,0,0,0.80)", {},
              "black", "solid", barLineWidth);
  plotBarData(ctx, plot, "H1", H1_binomial, "rgb(0,200,0,0.60)", {},
              "black", "solid", barLineWidth);

  // create and position the plot legend, update plot to include the legend
  plot.legend = [["H0", "H0"],
                 ["H1", "H1"],
                 ["simulation", "simulation"]];
  plot.legendPosition = [plot.xMin * 1.00, yMax * 0.90];
  plot.legendBorderPx = 0;
  plotUpdate(ctx, plot, [], []);

  // plot location of alpha, legend with both H0 and H1, and region L(EE)
  plotAlpha(ctx, plot, "H0", diffTest.thresholdN_H0, yMax*0.94);
  plotLegendH0andH1(ctx, plot, "both H0 and H1", plot.xMin, plot.yMax*0.90);
  regionLEE_max = diffTest.simTestH0.regionLEE_max;
  // get d' value to 1 or 2 decimal places... use 2 if the 2nd place is a '5'
  brief_d_prime = d_prime.toFixed(2);
  if (brief_d_prime.slice(-1) != "5") {
    brief_d_prime = d_prime.toFixed(1);
  }
  plotRegion(ctx, plot, [-0.5, regionLEE_max+0.5], "R<sub>L(EE)</sub>", yMax);
  plotRegion(ctx, plot, [regionLEE_max+0.5, regionBoundary-0.5],
                         "R<sub>L(d'=0)</sub>", yMax);
  plotRegion(ctx, plot, [regionBoundary-0.5, plot.xMax],
                         "R<sub>L(d'="+brief_d_prime+")</sub>", yMax);

  // plot bar indicating number of correct results
  plotCorrectBar(ctx, plot, correct);

  if (initOnly && cascade) {
    diffTest.initPlotPerceptualTestLargeDPrime([initOnly, cascade]);
  }

  return;
}

//==============================================================================

//------------------------------------------------------------------------------
// initPlotPerceptualTestLargeDPrime()
// initialize the plot of perceptual test with hypothesis H0 and H1

this.initPlotPerceptualTestLargeDPrime = function(argList = [false, false]) {
  var alpha = 0.0;
  var barLineWidth = 0;
  var brief_d_prime = "";
  var canvas = {};
  var canvasName = "canvas8";
  var cascade = argList[1];
  var correct = 0;
  var ctx = {};
  var d_prime = 0.0;
  var H0_binomial = [];
  var H1_binomial = [];
  var initOnly = argList[0];
  var L_H0 = 0.0;
  var L_H1 = 0.0;
  var LR = 0.0;
  var N = 0;
  var nIdx = 0;
  var pLObj = {};
  var plot = {};
  var plotObj = {};
  var pCorr_H0 = 0.0;
  var pCorr_H1 = 0.0;
  var prob = 0.0;
  var pValue_H0 = 0.0;
  var pValue_H1 = 0.0;
  var regionBoundary = 0.0;
  var regionLEE_max = 0.0;
  var sigma_H0 = 0.0;
  var sigma_H1 = 0.0;
  var sumProb = 0.0;
  var thresholdN_H1 = 0;
  var whichH = "";
  var yMax = 0.0;

  // console.log("in LARGE d' : " + initOnly + " and " + cascade);
  // set local variables based on global variables
  d_prime = diffTest.d_prime.value;
  if (d_prime <= 0.0) {
    d_prime = 0.001;
  }
  N = diffTest.N.value;
  alpha = diffTest.alpha.value;
  pCorr_H0 = diffTest.pCorr_H0;
  pCorr_H1 = diffTest.pCorr_H1;
  correct = diffTest.largeDPrime_numCorr.value;
  regionLEE_max = diffTest.simTestH0.regionLEE_max;
  if (correct > N) {
    document.getElementById(diffTest.largeDPrime_numCorr.id).value = N;
    correct = N;
    // need to say that the user has set this, otherwise it doesn't change
    // common.set(diffTest.largeDPrime_numCorr, 1);
    diffTest.largeDPrime_numCorr.userSet = 1;
    diffTest.largeDPrime_numCorr.value = N;
    common.setSavedValue(diffTest.largeDPrime_numCorr, 1);
  }
  sigma_H0 = Math.sqrt(N * pCorr_H0 * (1.0 - pCorr_H0));
  sigma_H1 = Math.sqrt(N * pCorr_H1 * (1.0 - pCorr_H1));

  // set the HTML for input parameters
  document.getElementById('largeDPrime_D_prime').innerHTML = d_prime;
  document.getElementById('largeDPrime_Test').innerHTML =
                          diffTest.testType.value;
  document.getElementById('largeDPrime_N').innerHTML = N;
  document.getElementById('largeDPrime_alpha').innerHTML = alpha;
  document.getElementById('largeDPrime_beta').innerHTML =
                           diffTest.beta.toFixed(2);
  document.getElementById('largeDPrime_power').innerHTML =
                           (1.0-diffTest.beta).toFixed(2);


  // get the canvas and context (ctx)
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // create binomial plot
  plotObj = createBinomialPlot(canvas, sigma_H0, sigma_H1, N);
  plot = plotObj.plot;
  yMax = plotObj.yMax;

  // create data for H0
  H0_binomial = diffTest.H0Obj.binomial;
  pLObj = getPValueLikelihood(diffTest.H0Obj.binomial, correct);
  L_H0 = pLObj.likelihood;
  pValue_H0 = pLObj.pValue;

  // set the HTML for H0 information
  document.getElementById('largeDPrime_pCorr_H0').innerHTML =
                          pCorr_H0.toFixed(3);
  document.getElementById('largeDPrime_threshN_H0').innerHTML =
                          diffTest.thresholdN_H0.toFixed(0);
  document.getElementById('largeDPrime_pRej_H0').innerHTML =
                          diffTest.pRej_H0.toFixed(3);
  document.getElementById('largeDPrime_pValue_H0').innerHTML =
                          pValue_H0.toFixed(3);

  // create data for H1
  H1_binomial = diffTest.H1Obj.binomial;
  pLObj = getPValueLikelihood(diffTest.H1Obj.binomial, correct);
  pValue_H1 = pLObj.pValue;
  L_H1 = pLObj.likelihood;
  for (nIdx = 0; nIdx <= N; nIdx++) {
    if (H1_binomial[nIdx][3] > H0_binomial[nIdx][3]) {
      regionBoundary = nIdx;
      break;
    }
  }

  // find the threshold at which p(reject H1 | H1) <= alpha
  sumProb = 0.0;
  for (nIdx = N; nIdx >= 0; nIdx -= 1) {
    prob = H1_binomial[nIdx][3];
    sumProb += prob;
    // console.log("n = " + nIdx + ", p(n) = " + prob + ", sum p = " + sumProb);
    if (sumProb.toFixed(8) > alpha.toFixed(8)) {
      // we went too far; go back one
      // (limit to N places past the decimal to avoid rounding errors)
      thresholdN_H1 = nIdx + 1;
      sumProb -= prob;
      break;
    }
  }
  if (nIdx < 0) {
    // alpha must be 1.0
    if (alpha < 1.0) {
      console.log("\n**** ERROR!! nIdx < 0 but alpha is " + alpha);
    }
    thresholdN_H1 = 0;
    sumProb = 1.0;
  }
  thresholdN_H1 = parseInt(thresholdN_H1);
  diffTest.thresholdN_H1 = thresholdN_H1;
  diffTest.pRej_H1 = sumProb;

  // update HTML for H1
  document.getElementById('largeDPrime_pCorr_H1').innerHTML =
                          diffTest.pCorr_H1.toFixed(3);
  document.getElementById('largeDPrime_H1_thr').innerHTML = thresholdN_H1;
  document.getElementById('largeDPrime_H1_pRej').innerHTML= sumProb.toFixed(3);
  document.getElementById('largeDPrime_pValue_H1').innerHTML =
                          pValue_H1.toFixed(3);

  // compute likelihood ratio
  LR = 1.0;
  whichH = "Hx";
  if (L_H0 > 0.0 || L_H1 > 0.0) {
    if (L_H0 > L_H1) {
      LR = L_H0 / L_H1;
      whichH = "H0";
    } else {
      LR = L_H1 / L_H0;
      whichH = "H1";
    }
  }

  // set the HTML for likelihoods
  document.getElementById('largeDPrime_L_H0').innerHTML = L_H0.toFixed(3);
  document.getElementById('largeDPrime_L_H1').innerHTML = L_H1.toFixed(3);
  document.getElementById('largeDPrime_LR').innerHTML = "200+";
  if (LR <= 200.0) {
    document.getElementById('largeDPrime_LR').innerHTML = LR.toFixed(2);
  }
  document.getElementById('largeDPrime_whichH').innerHTML = whichH;

  // plot binomial distributions
  barLineWidth = 1;
  if (N > 50) {
    barLineWidth = 0;
  }
  plotBarData(ctx, plot, "H0", H0_binomial, "rgb(220,0,0,0.80)", {},
              "black", "solid", barLineWidth);

  plotBarData(ctx, plot, "H1", H1_binomial, "rgb(0,200,0,0.60)", {},
              "black", "solid", barLineWidth);


  // create and position the plot legend, update the plot to include legend
  plot.legend = [["H0", "H0"],
                 ["H1", "H1"],
                 ["simulation", "simulation"]];
  plot.legendPosition = [plot.xMin * 1.00, yMax * 0.90];
  plot.legendBorderPx = 0;
  plotUpdate(ctx, plot, [], []);

  // plot location of alpha, legend with both H0 and H1, and region L(EE)
  plotAlpha(ctx, plot, "H0", diffTest.thresholdN_H0, yMax*0.94);
  plotLegendH0andH1(ctx, plot, "both H0 and H1", plot.xMin, plot.yMax*0.90);
  // get d' value to 1 or 2 decimal places... use 2 if the 2nd place is a '5'
  brief_d_prime = d_prime.toFixed(2);
  if (brief_d_prime.slice(-1) != "5") {
    brief_d_prime = d_prime.toFixed(1);
  }
  plotRegion(ctx, plot, [-0.5, regionLEE_max+0.5], "R<sub>L(EE)</sub>", yMax);
  plotRegion(ctx, plot, [regionLEE_max+0.5, regionBoundary-0.5],
                         "R<sub>L(d'=0)</sub>", yMax);
  plotRegion(ctx, plot, [regionBoundary-0.5, thresholdN_H1-0.5],
                         "R<sub>L(d'="+brief_d_prime+")</sub>", yMax,
                         thresholdN_H1);
  plotRegion(ctx, plot, [thresholdN_H1-0.5, plot.xMax],
                         "R<sub>L(d'>"+brief_d_prime+")</sub>", yMax);

  // plot bar indicating number of correct results
  plotCorrectBar(ctx, plot, correct);

  if (initOnly && cascade) {
    diffTest.initPlotPerceptualTestEstDPrime([initOnly, cascade]);
  }

  return;
}

//==============================================================================

//------------------------------------------------------------------------------
// initPlotPerceptualTestEstDPrime()
// initialize the plot of perceptual test with hypothesis H0 and H1

this.initPlotPerceptualTestEstDPrime = function(argList = [false, false]) {
  var alpha = 0.0;
  var barLineWidth = 0;
  var bestDPrime = 0.0;
  var bestDPrimeHigh = 0.0;
  var bestDPrimeLow = 0.0;
  var brief_d_prime = "";
  var canvas = {};
  var canvasName = "canvas9";
  var cascade = argList[1];
  var CIinfo = [];
  var CI = 0.95;
  var correct = 0;
  var ctx = {};
  var d_prime = 0.0;
  var H0_binomial = [];
  var H1_binomial = [];
  var initOnly = argList[0];
  var LR = 0.0;
  var L_H0 = 0.0;
  var L_H1 = 0.0;
  var N = 0;
  var nIdx = 0;
  var pCorr_H0 = 0.0;
  var pCorr_H1 = 0.0;
  var pLObj = {};
  var plot = {};
  var plotObj = {};
  var prob = 0.0;
  var pValue_H0 = 0.0;
  var pValue_H1 = 0.0;
  var regionBoundary = 0.0;
  var regionLEE_max = 0.0;
  var sigma_H0 = 0.0;
  var sigma_H1 = 0.0;
  var sumProb = 0.0;
  var thresholdN_H1 = 0;
  var whichH = "";
  var yMax = 0.0;

  // console.log("in EST d' : " + initOnly + " and " + cascade);
  // set local variables based on global variables
  d_prime = diffTest.d_prime.value;
  if (d_prime <= 0.0) {
    d_prime = 0.001;
  }
  N = diffTest.N.value;
  alpha = diffTest.alpha.value;
  pCorr_H0 = diffTest.pCorr_H0;
  pCorr_H1 = diffTest.pCorr_H1;
  correct = diffTest.estDPrime_numCorr.value;
  regionLEE_max = diffTest.simTestH0.regionLEE_max;
  if (correct > N) {
    document.getElementById(diffTest.estDPrime_numCorr.id).value = N;
    correct = N;
    // need to say that the user has set this, otherwise it doesn't change
    // common.set(diffTest.estDPrime_numCorr, 1);
    diffTest.estDPrime_numCorr.userSet = 1;
    diffTest.estDPrime_numCorr.value = N;
    common.setSavedValue(diffTest.estDPrime_numCorr, 1);
  }
  sigma_H0 = Math.sqrt(N * pCorr_H0 * (1.0 - pCorr_H0));
  sigma_H1 = Math.sqrt(N * pCorr_H1 * (1.0 - pCorr_H1));

  // set the HTML for input parameters
  document.getElementById('estDPrime_D_prime').innerHTML = d_prime;
  document.getElementById('estDPrime_Test').innerHTML =
                          diffTest.testType.value;
  document.getElementById('estDPrime_N').innerHTML = N;
  document.getElementById('estDPrime_alpha').innerHTML = alpha;
  document.getElementById('estDPrime_beta').innerHTML =
                           diffTest.beta.toFixed(2);
  document.getElementById('estDPrime_power').innerHTML =
                           (1.0-diffTest.beta).toFixed(2);

  // get the canvas and context (ctx)
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // create binomial plot
  plotObj = createBinomialPlot(canvas, sigma_H0, sigma_H1, N);
  plot = plotObj.plot;
  yMax = plotObj.yMax;

  // create data for H0
  H0_binomial = diffTest.H0Obj.binomial;
  pLObj = getPValueLikelihood(diffTest.H0Obj.binomial, correct);
  L_H0 = pLObj.likelihood;
  pValue_H0 = pLObj.pValue;

  // set the HTML for H0 information
  document.getElementById('estDPrime_threshN_H0').innerHTML =
                          diffTest.thresholdN_H0.toFixed(0);
  document.getElementById('estDPrime_pRej_H0').innerHTML =
                          diffTest.pRej_H0.toFixed(3);
  document.getElementById('estDPrime_pValue_H0').innerHTML =
                          pValue_H0.toFixed(3);

  // create data for H1
  H1_binomial = diffTest.H1Obj.binomial;
  pLObj = getPValueLikelihood(diffTest.H1Obj.binomial, correct);
  pValue_H1 = pLObj.pValue;
  L_H1 = pLObj.likelihood;
  for (nIdx = 0; nIdx <= N; nIdx++) {
    if (H1_binomial[nIdx][3] > H0_binomial[nIdx][3]) {
      regionBoundary = nIdx;
      break;
    }
  }

  // find the threshold at which p(reject H1 | H1) <= alpha
  sumProb = 0.0;
  for (nIdx = N; nIdx >= 0; nIdx -= 1) {
    prob = H1_binomial[nIdx][3];
    sumProb += prob;
    // console.log("n = " + nIdx + ", p(n) = " + prob + ", sum p = " + sumProb);
    if (sumProb.toFixed(8) > alpha.toFixed(8)) {
      // we went too far; go back one
      // (limit to N places past the decimal to avoid rounding errors)
      thresholdN_H1 = nIdx + 1;
      sumProb -= prob;
      break;
    }
  }
  if (nIdx < 0) {
    // alpha must be 1.0
    if (alpha < 1.0) {
      console.log("\n**** ERROR!! nIdx < 0 but alpha is " + alpha);
    }
    thresholdN_H1 = 0;
    sumProb = 1.0;
  }
  thresholdN_H1 = parseInt(thresholdN_H1);
  diffTest.thresholdN_H1 = thresholdN_H1;
  diffTest.pRej_H1 = sumProb;

  // update HTML for H1
  document.getElementById('estDPrime_H1_thr').innerHTML = thresholdN_H1;
  document.getElementById('estDPrime_H1_pRej').innerHTML= sumProb.toFixed(3);
  document.getElementById('estDPrime_pValue_H1').innerHTML =
                          pValue_H1.toFixed(3);

  // compute likelihood ratio
  LR = 1.0;
  whichH = "Hx";
  if (L_H0 > 0.0 && L_H1 > 0.0) {
    if (L_H0 > L_H1) {
      LR = L_H0 / L_H1;
      whichH = "H0";
    } else {
      LR = L_H1 / L_H0;
      whichH = "H1";
    }
  }

  // set the HTML for likelihoods
  document.getElementById('estDPrime_L_H0').innerHTML = L_H0.toFixed(3);
  document.getElementById('estDPrime_L_H1').innerHTML = L_H1.toFixed(3);
  document.getElementById('estDPrime_LR').innerHTML = "200+";
  if (LR <= 200.0) {
    document.getElementById('estDPrime_LR').innerHTML = LR.toFixed(2);
  }
  document.getElementById('estDPrime_whichH').innerHTML = whichH;

  // plot binomial distributions
  barLineWidth = 1;
  if (N > 50) {
    barLineWidth = 0;
  }
  plotBarData(ctx, plot, "H0", H0_binomial, "rgb(220,0,0,0.80)", {},
              "black", "solid", barLineWidth);

  plotBarData(ctx, plot, "H1", H1_binomial, "rgb(0,200,0,0.60)", {},
              "black", "solid", barLineWidth);


  // create and position the plot legend, update the plot to include legend
  plot.legend = [["H0", "H0"],
                 ["H1", "H1"],
                 ["simulation", "simulation"]];
  plot.legendPosition = [plot.xMin * 1.00, yMax * 0.90];
  plot.legendBorderPx = 0;
  plotUpdate(ctx, plot, [], []);

  // plot location of alpha, legend with both H0 and H1, and region L(EE)
  plotAlpha(ctx, plot, "H0", diffTest.thresholdN_H0, yMax*0.94);
  plotLegendH0andH1(ctx, plot, "both H0 and H1", plot.xMin, plot.yMax*0.90);
  // get d' value to 1 or 2 decimal places... use 2 if the 2nd place is a '5'
  brief_d_prime = d_prime.toFixed(2);
  if (brief_d_prime.slice(-1) != "5") {
    brief_d_prime = d_prime.toFixed(1);
  }
  plotRegion(ctx, plot, [-0.5, regionLEE_max+0.5], "R<sub>L(EE)</sub>", yMax);
  plotRegion(ctx, plot, [regionLEE_max+0.5, regionBoundary-0.5],
                         "R<sub>L(d'=0)</sub>", yMax);
  plotRegion(ctx, plot, [regionBoundary-0.5, thresholdN_H1-0.5],
                         "R<sub>L(d'="+brief_d_prime+")</sub>", yMax,
                         thresholdN_H1);
  plotRegion(ctx, plot, [thresholdN_H1-0.5, plot.xMax],
                         "R<sub>L(d'>"+brief_d_prime+")</sub>", yMax);

  // plot bar indicating number of correct results
  plotCorrectBar(ctx, plot, correct);

  // estimate maximum-likelihood d'
  bestDPrime = findBestDPrime(correct, N, diffTest.testType.value);
  // console.log("best pCorr = " + correct/N + " with d' " + bestDPrime);

  // get confidence interval for number of correct responses
  CI = diffTest.estDPrime_CI.value / 100.0;
  CIinfo = mathLibrary.bootstrapCI_binomial(correct, N, CI,
                                   diffTest.randSeed.value);
  plotCIBar(ctx, plot, CIinfo[0], CIinfo[1]);

  // get d' associated with low and high CI
  bestDPrimeLow = findBestDPrime(CIinfo[0], N, diffTest.testType.value);
  // console.log("best pCorr = " + CIinfo[0]/N + " with d' " + bestDPrimeLow);
  bestDPrimeHigh = findBestDPrime(CIinfo[1], N, diffTest.testType.value);
  // console.log("best pCorr = " + CIinfo[1]/N + " with d' " + bestDPrimeHigh);

  document.getElementById('estDPrime_MLDPrime').innerHTML =
                          bestDPrime.toFixed(2);
  document.getElementById('estDPrime_nCorrLow').innerHTML =
                          CIinfo[0].toFixed(0);
  document.getElementById('estDPrime_dPrimeLow').innerHTML =
                          bestDPrimeLow.toFixed(2);
  document.getElementById('estDPrime_nCorrHigh').innerHTML =
                          CIinfo[1].toFixed(0);
  document.getElementById('estDPrime_dPrimeHigh').innerHTML =
                          bestDPrimeHigh.toFixed(2);

  return;
}

//==============================================================================

//------------------------------------------------------------------------------
// initPlotPerceptualTestFinal()
// initialize the plot of perceptual test with hypothesis H0 and H1

this.initPlotPerceptualTestFinal = function() {
  var alpha = 0.0;
  var barLineWidth = 0;
  var bestDPrime = 0.0;
  var bestDPrimeHigh = 0.0;
  var bestDPrimeLow = 0.0;
  var beta = 0.0;
  var brief_d_prime = "";
  var canvas = {};
  var canvasName = "canvas10";
  var CIinfo = [];
  var CI = 0.95;
  var correct = 0;
  var ctx = {};
  var d_prime = 0.0;
  var H0_binomial = [];
  var H0Obj = {};
  var H1_binomial = [];
  var H1Obj = {};
  var L_H0 = 0.0;
  var L_H1 = 0.0;
  var LR = 0.0;
  var N = 0;
  var nIdx = 0;
  var pCorr_H0 = 0.0;
  var pCorr_H1 = 0.0;
  var pLObj = {};
  var plot = {};
  var plotObj = {};
  var power = 0.0;
  var pRej_H0 = 0.0;
  var prob = 0.0;
  var pValue_H0 = 0.0;
  var pValue_H1 = 0.0;
  var regionBoundary = 0.0;
  var regionLEE_max = 0.0;
  var sigma_H0 = 0.0;
  var sigma_H1 = 0.0;
  var sub = 0;
  var sumProb = 0.0;
  var testType = "";
  var thresholdN_H0 = 0.0;
  var thresholdN_H1 = 0.0;
  var whichH = "";
  var yMax = 0.0;

  // set local variables based on global variables
  d_prime = diffTest.final_d_prime.value;
  if (d_prime <= 0.0) {
    d_prime = 0.001;
  }
  N = diffTest.final_N.value;
  alpha = diffTest.final_alpha.value;
  pCorr_H0 = 1.0/3.0;
  testType = diffTest.final_testType.value;
  if (testType == "final_triangle") {
    testType = "triangle";
  } else {
    testType = "3-AFC";
  }
  CI = diffTest.final_CI.value / 100.0;

  if (testType == "triangle") {
    pCorr_H1 = mathLibrary.probCorrectTriangle(d_prime);
  } else {
    pCorr_H1 = mathLibrary.probCorrect3AFC(d_prime);
  }
  correct = diffTest.final_numCorr.value;
  if (correct > N) {
    document.getElementById(diffTest.final_numCorr.id).value = N;
    correct = N;
    // need to say that the user has set this, otherwise it doesn't change
    // common.set(diffTest.final_numCorr, 1);
    diffTest.final_numCorr.userSet = 1;
    diffTest.final_numCorr.value = N;
    common.setSavedValue(diffTest.final_numCorr, 1);
  }
  sigma_H0 = Math.sqrt(N * pCorr_H0 * (1.0 - pCorr_H0));
  sigma_H1 = Math.sqrt(N * pCorr_H1 * (1.0 - pCorr_H1));

  // create data for H0
  H0Obj = createBinomialData(N, pCorr_H0, -1, 0);
  H0_binomial = H0Obj.binomial;
  pLObj = getPValueLikelihood(H0Obj.binomial, correct);
  L_H0 = pLObj.likelihood;
  pValue_H0 = pLObj.pValue;

  // find the threshold at which p(reject H0 | H0) <= alpha
  sumProb = 0.0;
  for (sub = N; sub >= 0; sub -= 1) {
    prob = H0_binomial[sub][3];
    sumProb += prob;
    if (sumProb.toFixed(8) > alpha.toFixed(8)) {
      // we went too far; go back one subject
      // (limit to N places past the decimal to avoid rounding errors)
      thresholdN_H0 = sub + 1;
      sumProb -= prob;
      break;
    }
  }
  if (sub < 0) {
    // alpha must be 1.0
    if (alpha < 1.0) {
      console.log("\n**** ERROR!! sub < 0 but alpha is " + alpha);
    }
    thresholdN_H0 = 0;
    sumProb = 1.0;
  }
  pRej_H0 = sumProb;
  thresholdN_H0 = parseInt(thresholdN_H0);

  // find the threshold at which p(accept H0 | H0) <= alpha
  sumProb = 0.0;
  for (sub = 0; sub <= N; sub += 1) {
    prob = H0_binomial[sub][3];
    sumProb += prob;
    // console.log("n = " + sub + ", p(n) = " + prob + ", sum p = " + sumProb);
    if (sumProb.toFixed(8) > alpha.toFixed(8)) {
      // we went too far; go back one subject
      // (limit to N places past the decimal to avoid rounding errors)
      regionLEE_max = sub - 1;
      sumProb -= prob;
      break;
    }
  }
  if (sub > N) {
    regionLEE_max = N;
  }
  regionLEE_max = parseInt(regionLEE_max);

  // create data for H1
  H1Obj = createBinomialData(N, pCorr_H1, thresholdN_H0, 0);
  H1_binomial = H1Obj.binomial;
  pLObj = getPValueLikelihood(H1Obj.binomial, correct);
  pValue_H1 = pLObj.pValue;
  L_H1 = pLObj.likelihood;
  for (nIdx = 0; nIdx <= N; nIdx++) {
    if (H1_binomial[nIdx][3] > H0_binomial[nIdx][3]) {
      regionBoundary = nIdx;
      break;
    }
  }
  beta = H1Obj.beta;
  power = 1.0 - beta;
  console.log("beta = " + beta.toFixed(3));

  // set the HTML for input parameters
  document.getElementById('final_beta').innerHTML = beta.toFixed(2);
  document.getElementById('final_power').innerHTML = power.toFixed(2);

  // get the canvas and context (ctx)
  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // create binomial plot
  plotObj = createBinomialPlot(canvas, sigma_H0, sigma_H1, N);
  plot = plotObj.plot;
  yMax = plotObj.yMax;

  // set the HTML for H0 information
  document.getElementById('final_threshN_H0').innerHTML =
                          thresholdN_H0.toFixed(0);
  document.getElementById('final_pRej_H0').innerHTML =
                          pRej_H0.toFixed(3);
  document.getElementById('final_pValue_H0').innerHTML =
                          pValue_H0.toFixed(3);


  // find the threshold at which p(reject H1 | H1) <= alpha
  sumProb = 0.0;
  for (nIdx = N; nIdx >= 0; nIdx -= 1) {
    prob = H1_binomial[nIdx][3];
    sumProb += prob;
    // console.log("n = " + nIdx + ", p(n) = " + prob + ", sum p = " + sumProb);
    if (sumProb.toFixed(8) > alpha.toFixed(8)) {
      // we went too far; go back one
      // (limit to N places past the decimal to avoid rounding errors)
      thresholdN_H1 = nIdx + 1;
      sumProb -= prob;
      break;
    }
  }
  if (nIdx < 0) {
    // alpha must be 1.0
    if (alpha < 1.0) {
      console.log("\n**** ERROR!! nIdx < 0 but alpha is " + alpha);
    }
    thresholdN_H1 = 0;
    sumProb = 1.0;
  }
  thresholdN_H1 = parseInt(thresholdN_H1);

  // update HTML for H1
  document.getElementById('final_H1_thr').innerHTML = thresholdN_H1;
  document.getElementById('final_H1_pRej').innerHTML= sumProb.toFixed(3);
  document.getElementById('final_pValue_H1').innerHTML =
                          pValue_H1.toFixed(3);

  // compute likelihood ratio
  LR = 1.0;
  whichH = "Hx";
  if (L_H0 > 0.0 && L_H1 > 0.0) {
    if (L_H0 > L_H1) {
      LR = L_H0 / L_H1;
      whichH = "H0";
    } else {
      LR = L_H1 / L_H0;
      whichH = "H1";
    }
  }

  // set the HTML for likelihoods
  document.getElementById('final_L_H0').innerHTML = L_H0.toFixed(3);
  document.getElementById('final_L_H1').innerHTML = L_H1.toFixed(3);
  document.getElementById('final_LR').innerHTML = "200+";
  if (LR <= 200.0) {
    document.getElementById('final_LR').innerHTML = LR.toFixed(2);
  }
  document.getElementById('final_whichH').innerHTML = whichH;
  console.log("LR: " + LR.toFixed(4) + " from L_H0 = " + L_H0.toFixed(4) +
              " and L_H1 = " + L_H1.toFixed(4));

  // plot binomial distributions
  barLineWidth = 1;
  if (N > 50) {
    barLineWidth = 0;
  }
  plotBarData(ctx, plot, "H0", H0_binomial, "rgb(220,0,0,0.80)", {},
              "black", "solid", barLineWidth);

  plotBarData(ctx, plot, "H1", H1_binomial, "rgb(0,200,0,0.60)", {},
              "black", "solid", barLineWidth);


  // create and position the plot legend, update the plot to include legend
  plot.legend = [["H0", "H0"],
                 ["H1", "H1"],
                 ["simulation", "simulation"]];
  plot.legendPosition = [plot.xMin * 1.00, yMax * 0.90];
  plot.legendBorderPx = 0;
  plotUpdate(ctx, plot, [], []);

  // plot location of alpha, legend with both H0 and H1, and region L(EE)
  plotAlpha(ctx, plot, "H0", thresholdN_H0, yMax*0.94);
  plotLegendH0andH1(ctx, plot, "both H0 and H1", plot.xMin, plot.yMax*0.90);
  // get d' value to 1 or 2 decimal places... use 2 if the 2nd place is a '5'
  brief_d_prime = d_prime.toFixed(2);
  if (brief_d_prime.slice(-1) != "5") {
    brief_d_prime = d_prime.toFixed(1);
  }
  plotRegion(ctx, plot, [-0.5, regionLEE_max+0.5], "R<sub>L(EE)</sub>", yMax);
  plotRegion(ctx, plot, [regionLEE_max+0.5, regionBoundary-0.5],
                         "R<sub>L(d'=0)</sub>", yMax);
  plotRegion(ctx, plot, [regionBoundary-0.5, thresholdN_H1-0.5],
                         "R<sub>L(d'="+brief_d_prime+")</sub>", yMax,
                         thresholdN_H1);
  plotRegion(ctx, plot, [thresholdN_H1-0.5, plot.xMax],
                         "R<sub>L(d'>"+brief_d_prime+")</sub>", yMax);

  // plot bar indicating number of correct results
  plotCorrectBar(ctx, plot, correct);

  // estimate maximum-likelihood d'
  bestDPrime = findBestDPrime(correct, N, testType);
  console.log("estimated pCorr = " + correct/N + " with d' " + bestDPrime);

  // get confidence interval for number of correct responses
  CIinfo = mathLibrary.bootstrapCI_binomial(correct, N, CI,
                                   diffTest.randSeed.value);
  plotCIBar(ctx, plot, CIinfo[0], CIinfo[1]);

  // get d' associated with low and high CI
  bestDPrimeLow = findBestDPrime(CIinfo[0], N, testType);
  console.log("pCorr low = " + CIinfo[0]/N + " with d' " + bestDPrimeLow);
  bestDPrimeHigh = findBestDPrime(CIinfo[1], N, testType);
  console.log("pCorr high = " + CIinfo[1]/N + " with d' " + bestDPrimeHigh);

  document.getElementById('final_MLDPrime').innerHTML =
                          bestDPrime.toFixed(2);
  document.getElementById('final_nCorrLow').innerHTML =
                          CIinfo[0].toFixed(0);
  document.getElementById('final_dPrimeLow').innerHTML =
                          bestDPrimeLow.toFixed(2);
  document.getElementById('final_nCorrHigh').innerHTML =
                          CIinfo[1].toFixed(0);
  document.getElementById('final_dPrimeHigh').innerHTML =
                          bestDPrimeHigh.toFixed(2);

  return;
}

//==============================================================================



} // close the "namespace" and call the function to construct it
diffTest._construct();

