// math library
//
// Copyright (C) 2021  John-Paul Hosom, all rights reserved.
// Contact information: alchemyoverlord © yahoo · com
//
// Version 1.0.1 : January 28, 2021   (JPH)
//                 Initial version.
//


"use strict";

var mathLibrary = mathLibrary || {};

mathLibrary._construct = function() {

this.randX = 0|0;  // represent as 32-bit integer

var sqrtTwoPi = Math.sqrt(2.0 * Math.PI);
var sqrt2 = Math.sqrt(2.0);
var sqrt3 = Math.sqrt(3.0);
var sqrtTwoThirds = Math.sqrt(2.0/3.0);


//------------------------------------------------------------------------------
// compute maximum relative probability of x using normal distribution

this.normalDistributionMax = function(sigma) {
  var norm = 0.0;

  if (sigma == 0.0) sigma = 0.0001;
  norm = 1.0 / (sigma * sqrtTwoPi);

  return norm;
}

//------------------------------------------------------------------------------
// compute probability of x using normal distribution with
// mean = param[0] and standard deviation = param[1]

this.normalDistribution = function(x, param) {
  var exponent = 0.0;
  var mu = param[0];
  var norm = 0.0;
  var prob = 0.0;
  var relProb = 0.0;
  var sigma = param[1];

  if (sigma == 0.0) sigma = 0.0001;
  exponent = -1.0 * (x - mu) * (x - mu) / (2.0 * sigma * sigma);
  norm = 1.0 / (sigma * sqrtTwoPi);
  prob = norm * Math.exp(exponent);

  return prob;
}

//------------------------------------------------------------------------------
// estimate integral of normal distribution up to value x.
// formula from:
//      https://www.hindawi.com/journals/mpe/2012/124029/

this.phi = function(x) {
  var arg1 = -358.0 * x / 23.0;
  var arg2 = 111.0 * Math.atan(37.0 * x / 294.0);
  var ooy  = Math.exp(arg1 + arg2) + 1.0;
  var y    = 1.0 / ooy
  return y;
}

//------------------------------------------------------------------------------
// estimate probability of correctly answering a 2AFC test given d'.
// From Harvey 2003, p. 13, equation [13]
//   http://psych.colorado.edu/~lharvey/P4165/P4165_2003_1_Spring/2003_Spring_pdf/P4165_SDT.pdf
// Formula from Christensen 2020, p. 5. Equation [6]:
//   https://cran.r-project.org/web/packages/sensR/vignettes/methodology.pdf
// Formula DeCarlo 2012, p. 199
//   http://www.columbia.edu/~ld208/jmp12.pdf

this.probCorrect2AFC = function(d_prime) {
  var z_score = d_prime / sqrt2;
  var y = mathLibrary.phi(z_score);

  return y;
}

//------------------------------------------------------------------------------
// estimate probability of correctly answering a triangle test given d'.
// Formula from Christensen 2020, p. 5. Equation [7]:
//   https://cran.r-project.org/web/packages/sensR/vignettes/methodology.pdf

this.probCorrectTriangle = function(d_prime) {
  var cdf1 = 0.0;
  var cdf2 = 0.0;
  var delta = 0.001;
  var integral = 0.0;
  var prob_z = 0.0;
  var x = 0.0;
  var z = 0.0;

  // in theory, integrate to infinity; in practice, integrating up to 5.0
  // is fine up to d'=10, and if d' is greater than 10, accuracy is 100%
  if  (d_prime > 10.0) {
    return 1.0;
  }
  for (z = 0.0; z <= 5.0; z += delta) {
    prob_z = mathLibrary.normalDistribution(z, [0.0, 1.0]);
    cdf1 = mathLibrary.phi(-1.0*z*sqrt3 + d_prime*sqrtTwoThirds);
    cdf2 = mathLibrary.phi(-1.0*z*sqrt3 - d_prime*sqrtTwoThirds);
    x = (cdf1 + cdf2) * prob_z;
    integral += x * delta;
  }
  integral *= 2.0;

  return integral;
}

//------------------------------------------------------------------------------
// estimate probability of correctly answering a 3AFC test given d'.
// Formula DeCarlo 2012, equation [5]:
//   http://www.columbia.edu/~ld208/jmp12.pdf
// Formula from Christensen 2020, p. 5. Equation [5]:
//   https://cran.r-project.org/web/packages/sensR/vignettes/methodology.pdf

this.probCorrect3AFC = function(d_prime) {
  var cdf = 0.0;
  var delta = 0.001;
  var integral = 0.0;
  var prob_z = 0.0;
  var x = 0.0;
  var z = 0.0;

  // in theory, integrate from and to infinity; in practice, -16 to 16 is fine
  // up to d' of 10.  If d' is greater than 10, then the integration range
  // needs to be larger, but the accuracy is 100% so don't bother.
  if (d_prime > 10.0) {
    return 1.0;
  }
  for (z = -16.0; z <= 16.0; z += delta) {
    prob_z = mathLibrary.normalDistribution(z - d_prime, [0.0, 1.0]);
    cdf = mathLibrary.phi(z);
    x = prob_z * cdf * cdf;
    integral += x * delta;
  }

  return integral;
}

//------------------------------------------------------------------------------
// set the random-number generator seed

this.seedRandom = function(x) {
  this.randX = x;
  return;
}

//------------------------------------------------------------------------------
// get a pseudo-random number

this.pseudoRandom = function() {
  var r = 0.0;
  var maxF = Math.pow(2,31)-1;
  var max = maxF | 0;

  // several approaches are implemented here
  if (true) {
    this.randX = (Math.imul((1664525|0),(this.randX|0) |0) + (1013904223|0) |0);
    r = Math.abs(this.randX / max);
    // console.log(" " + this.randX + " / " + max + " = " + r);
  } else {
    // undo first line for more standard approach
    this.randX = (((1664525|0) * (this.randX|0) |0) + (1013904223|0) |0);
    this.randX = Math.imul(48271, this.randX) | 0 % 2147483647;
    r = (this.randX & 2147483647) / 2147483648;
    // console.log(" " + this.randX + " => " + r);
  }
  return r;
}

//------------------------------------------------------------------------------
// pick one sample from a normal distribution

this.pickSampleFromNormalDistribution = function(mean, sigma) {
  var sample = 0.0;
  var U1 = 0.0;
  var U2 = 0.0;
  var x = 0.0;

  // Box-Muller transform
  U1 = this.pseudoRandom();  // range 0 to 1
  U2 = this.pseudoRandom();  // range 0 to 1

  x = Math.sqrt(-2.0 * Math.log(U1)) * Math.cos(2.0 * Math.PI * U2);
  sample = x * sigma + mean;

  return sample;
}

//------------------------------------------------------------------------------
// return the k-combination of a set N

this.combination = function(N, k) {
  var idx = 0|0;
  var denominator = 0.0;
  var numerator = 0.0;
  var result = 0.0;

  // process a few easy combinations of N and k
  if (k > N)  { return 0.0; }
  if (k == 0) { return 1.0; }
  if (k == N) { return 1.0; }

  // now process less-easy combinations of N and k; use log domain
  // to avoid overflow
  numerator = Math.log(N);
  for (idx = (N - 1)|0; idx >= (N - k + 1)|0; idx -= 1|0) {
    numerator += Math.log(idx);
  }
  denominator = Math.log(k);
  for (idx = (k - 1)|0; idx >= 1|0; idx -= 1|0) {
    denominator += Math.log(idx);
  }
  result = Math.exp(numerator - denominator);
  return result;
}

//------------------------------------------------------------------------------
// compute the binomial probability of result corr with N subjects and pCorr
// probability of a correct result.

this.binomial = function(N, pCorr, corr) {
  var x = 0.0;
  var y = 0.0;
  var z = 0.0;
  var result = 0.0;
  var mu = 0.0;
  var sigma = 0.0;

  // if the number of subjects is less than 1000, use the exact binomial
  // distribution.  If the number of subjects is larger, then use the
  // normal distribution as an approximation.
  if (N < 1000) {
    x = this.combination(N, corr);
    y = Math.pow(pCorr, corr);
    z = Math.pow(1.0 - pCorr, N - corr);
    result = x * y * z;
  } else {
    mu = N * pCorr;
    sigma = Math.sqrt(N * pCorr * (1-pCorr));
    result = mathLibrary.normalDistribution(corr, [mu, sigma]);
  }

  return result;
}

//------------------------------------------------------------------------------
// compute the confidence interval using the bootstrap method

this.bootstrapCI_binomial = function(corr, N, CI, seed=0, reps=5000) {
  var bsMean = 0.0;
  var deltaResults = [];
  var lowerBound = 0.0;
  var low = 0.0;
  var lowIdx = 0;
  var high = 0.0;
  var highIdx = 0;
  var mean = 0.0;
  var nIdx = 0;
  var OMCI = 0.0;  // one minus confidence interval
  var origResult = [];
  var randIdx = 0;
  var repIdx = 0;
  var sum = 0.0;
  var upperBound = 0.0;

  OMCI = 1.0 - CI;

  // if corr == 0 or corr == N, then approximate CI using 'rule of three'
  if (corr == 0 || corr == N) {
    if (OMCI == 0) OMCI = 0.001;
    if (corr == 0) {
      low = 0;
      high = -1.0 * Math.log(OMCI);
    } else {
      low = N + Math.log(OMCI);
      high = N;
    }
    // console.log("low = " + low + ", high = " + high);
    return [low, high];
  }

  mean = corr / N;
  this.seedRandom(seed);

  // create list of binary results
  for (nIdx = 0; nIdx < N; nIdx++) {
    if (nIdx < corr) origResult.push(1);
    else origResult.push(0);
  }
  // console.log("ORIG RESULT " + origResult);

  for (repIdx = 0; repIdx < reps; repIdx++) {
    sum = 0.0;
    for (nIdx = 0; nIdx < N; nIdx++) {
      randIdx = parseInt(this.pseudoRandom() * N);
      sum += origResult[randIdx];
    }
    bsMean = sum / N;
    deltaResults.push(bsMean - mean);
  }
  // sort delta values in increasing order
  deltaResults.sort(function(a,b){return a-b});
  lowIdx = parseInt(reps * (OMCI/2.0));
  highIdx = parseInt(reps * (1.0-(OMCI/2.0)));
  if (highIdx >= reps) highIdx = reps-1;
  // console.log("low = " + lowIdx + ", high = " + highIdx);
  lowerBound = mean + deltaResults[lowIdx];
  upperBound = mean + deltaResults[highIdx];
  // console.log("  lower bound = " + lowerBound);
  // console.log("  upper bound = " + upperBound);
  low  = parseInt(lowerBound * N + 0.5);
  high = parseInt(upperBound * N + 0.5);
  return [low, high];
}

//------------------------------------------------------------------------------


} // close the "namespace" and call the function to construct it
mathLibrary._construct();
