// -----------------------------------------------------------------------------
// retirement.js : JavaScript for retirement
// Written by John-Paul Hosom
// Copyright © 2023 by John-Paul Hosom, all rights reserved.
//
// Version 1.0.0 : August 12, 2023
//         Initial version.
// 
// Future Improvements:
// 1. add age when start withdrawing traditional IRA
// 2. move legend to location based on X axis and font size
//
// -----------------------------------------------------------------------------

//==============================================================================

var retire = retire || {};

// Declare a "namespace" called "retire"
// This namespace contains functions that are specific to retire method.
//
//    public functions:
//    . initialize_retire()
//    . compute_retire()
//

retire._construct = function() {

"use strict";

//------------------------------------------------------------------------------
// initialize

this.initialize_retire = function() {
  var idx = 0;
  var keys;
  var updateFunction = this.compute_retire;

  // color options
  this.defaultColor = "#94476b"; // greyish red

  //----------------------------------------------------------------------------
  // create data for all variables

  this.startYear = new Object();
  this.showDollars = new Object();

  this.name1 = new Object();
  this.birthYear1 = new Object();
  this.stopAge1 = new Object();
  this.name2 = new Object();
  this.birthYear2 = new Object();
  this.stopAge2 = new Object();

  this.basicExpensesStart = new Object();
  this.basicExpensesFinish = new Object();
  this.expensesFinishAge = new Object();

  this.preMedicare = new Object();
  this.preMedicareDeductible = new Object();
  this.medicareB = new Object();
  this.medicareDVD = new Object();

  this.federalTaxRate_income = new Object();
  this.federalTaxRate_capitalGains = new Object();
  this.stateTaxRate_income = new Object();
  this.stateTaxRate_capitalGains = new Object();
  this.SStaxRate = new Object();

  this.inflation = new Object();
  this.healthInsuranceIncrease = new Object();
  this.SS_COLA = new Object();
  this.SS_actualPercent = new Object();

  this.savings = new Object();
  this.investmentYield = new Object();

  this.jobIncome1 = new Object();
  this.jobPaysHealthcare1 = new Object();
  this.jobCOLA1 = new Object();
  this.stopJobAge1 = new Object();
  this.SS_income1 = new Object();
  this.SS_age1 = new Object();
  this.tradIRA401K1 = new Object();
  this.tradIRA401Kage1 = new Object();
  this.pension_income1 = new Object();
  this.pension_age1 = new Object();
  this.oneTimeGain1 = new Object();
  this.oneTimeGainAge1 = new Object();

  this.jobIncome2 = new Object();
  this.jobPaysHealthcare2 = new Object();
  this.jobCOLA2 = new Object();
  this.stopJobAge2 = new Object();
  this.SS_income2 = new Object();
  this.SS_age2 = new Object();
  this.tradIRA401K2 = new Object();
  this.tradIRA401Kage2 = new Object();
  this.pension_income2 = new Object();
  this.pension_age2 = new Object();
  this.oneTimeGain2 = new Object();
  this.oneTimeGainAge2 = new Object();


  // ===========================================================================
  // initialize all inputs

  // start year and show results in inflation-adjusted dollars or not
  this.startYear.id = "retire.startYear";
  this.startYear.inputType = "int";
  this.startYear.value = 0;
  this.startYear.userSet = 0;
  this.startYear.precision = 0;
  this.startYear.minPrecision = 0;
  this.startYear.display = "";
  this.startYear.min = 2023;
  this.startYear.max = 2100;
  this.startYear.description = "year at which to start calculations";
  this.startYear.defaultValue = Number(new Date().getFullYear())+1;
  this.startYear.updateFunction = retire.compute_retire;
  this.startYear.parent = "retire";

  this.showDollars.id = "retire.showDollars";
  this.showDollars.inputType = "radioButton";
  this.showDollars.value = "beginYear";
  this.showDollars.userSet = 0;
  this.showDollars.defaultValue = "beginYear";
  this.showDollars.updateFunction = retire.compute_retire;
  this.showDollars.parent = "retire";


  // name, birth year, and stop calculations for person 1
  this.name1.id = "retire.name1";
  this.name1.inputType = "string";
  this.name1.value = "";
  this.name1.userSet = 0;
  this.name1.display = "";
  this.name1.description = "name of person #1";
  this.name1.defaultValue = "Alice";
  this.name1.updateFunction = retire.compute_retire;
  this.name1.additionalFunction = retire.showOrHideTextFunction;
  this.name1.additionalFunctionArgs = "name1";
  this.name1.parent = "retire";

  this.birthYear1.id = "retire.birthYear1";
  this.birthYear1.inputType = "int";
  this.birthYear1.value = 1965;
  this.birthYear1.userSet = 0;
  this.birthYear1.precision = 0;
  this.birthYear1.minPrecision = 0;
  this.birthYear1.display = "";
  this.birthYear1.min = 1900;
  this.birthYear1.max = 2050;
  this.birthYear1.description = "year of birth for person #1"
  this.birthYear1.defaultValue = 1965;
  this.birthYear1.updateFunction = retire.compute_retire;
  this.birthYear1.parent = "retire";

  this.stopAge1.id = "retire.stopAge1";
  this.stopAge1.inputType = "int";
  this.stopAge1.value = 80;
  this.stopAge1.userSet = 0;
  this.stopAge1.precision = 0;
  this.stopAge1.minPrecision = 0;
  this.stopAge1.display = "";
  this.stopAge1.min = 20;
  this.stopAge1.max = 120;
  this.stopAge1.description = "age to stop calculations for person #1"
  this.stopAge1.defaultValue = 100;
  this.stopAge1.updateFunction = retire.compute_retire;
  this.stopAge1.parent = "retire";


  // name, birth year, and stop calculations for person 2
  this.name2.id = "retire.name2";
  this.name2.inputType = "string";
  this.name2.value = "";
  this.name2.userSet = 0;
  this.name2.display = "";
  this.name2.description = "name of person #2";
  this.name2.defaultValue = "Bob";
  this.name2.updateFunction = retire.compute_retire;
  this.name2.additionalFunction = retire.showOrHideTextFunction;
  this.name2.additionalFunctionArgs = "name2";
  this.name2.parent = "retire";

  this.birthYear2.id = "retire.birthYear2";
  this.birthYear2.inputType = "int";
  this.birthYear2.value = 1965;
  this.birthYear2.userSet = 0;
  this.birthYear2.precision = 0;
  this.birthYear2.minPrecision = 0;
  this.birthYear2.display = "";
  this.birthYear2.min = 1900;
  this.birthYear2.max = 2050;
  this.birthYear2.description = "year of birth for person #2"
  this.birthYear2.defaultValue = 1965;
  this.birthYear2.updateFunction = retire.compute_retire;
  this.birthYear2.parent = "retire";

  this.stopAge2.id = "retire.stopAge2";
  this.stopAge2.inputType = "int";
  this.stopAge2.value = 100;
  this.stopAge2.userSet = 0;
  this.stopAge2.precision = 0;
  this.stopAge2.minPrecision = 0;
  this.stopAge2.display = "";
  this.stopAge2.min = 20;
  this.stopAge2.max = 120;
  this.stopAge2.description = "age to stop calculations for person #1"
  this.stopAge2.defaultValue = 100;
  this.stopAge2.updateFunction = retire.compute_retire;
  this.stopAge2.parent = "retire";


  // basic expenses at the start, at the end, and at what age bottom out
  this.basicExpensesStart.id = "retire.basicExpensesStart";
  this.basicExpensesStart.inputType = "float";
  this.basicExpensesStart.value = 50000.0;
  this.basicExpensesStart.userSet = 0;
  this.basicExpensesStart.precision = 0;
  this.basicExpensesStart.minPrecision = 0;
  this.basicExpensesStart.display = "";
  this.basicExpensesStart.min = 0.0;
  this.basicExpensesStart.max = 1000000.0;
  this.basicExpensesStart.description = "current annual basic expenses (not healthcare or taxes)"
  this.basicExpensesStart.defaultValue = 50000.0;
  this.basicExpensesStart.updateFunction = retire.compute_retire;
  this.basicExpensesStart.parent = "retire";

  this.basicExpensesFinish.id = "retire.basicExpensesFinish";
  this.basicExpensesFinish.inputType = "float";
  this.basicExpensesFinish.value = 40000.0;
  this.basicExpensesFinish.userSet = 0;
  this.basicExpensesFinish.precision = 0;
  this.basicExpensesFinish.minPrecision = 0;
  this.basicExpensesFinish.display = "";
  this.basicExpensesFinish.min = 0.0;
  this.basicExpensesFinish.max = 1000000.0;
  this.basicExpensesFinish.description = "final basic expenses"
  this.basicExpensesFinish.defaultValue = 40000.0;
  this.basicExpensesFinish.updateFunction = retire.compute_retire;
  this.basicExpensesFinish.parent = "retire";

  this.expensesFinishAge.id = "retire.expensesFinishAge";
  this.expensesFinishAge.inputType = "int";
  this.expensesFinishAge.value = 80;
  this.expensesFinishAge.userSet = 0;
  this.expensesFinishAge.precision = 0;
  this.expensesFinishAge.minPrecision = 0;
  this.expensesFinishAge.display = "";
  this.expensesFinishAge.min = 20;
  this.expensesFinishAge.max = 120;
  this.expensesFinishAge.description = "age at which expenses bottom out"
  this.expensesFinishAge.defaultValue = 80;
  this.expensesFinishAge.updateFunction = retire.compute_retire;
  this.expensesFinishAge.parent = "retire";


  // pre-Medicare cost and expected annual expenses,
  // Medicare B and other Medicare costs
  this.preMedicare.id = "retire.preMedicare";
  this.preMedicare.inputType = "float";
  this.preMedicare.value = 650.0;
  this.preMedicare.userSet = 0;
  this.preMedicare.precision = 0;
  this.preMedicare.minPrecision = 0;
  this.preMedicare.display = "";
  this.preMedicare.min = 0.0;
  this.preMedicare.max = 10000.0;
  this.preMedicare.description = "monthly cost of healthcare before Medicare"
  this.preMedicare.defaultValue = 650.0;
  this.preMedicare.updateFunction = retire.compute_retire;
  this.preMedicare.parent = "retire";

  this.preMedicareDeductible.id = "retire.preMedicareDeductible";
  this.preMedicareDeductible.inputType = "float";
  this.preMedicareDeductible.value = 4000.0;
  this.preMedicareDeductible.userSet = 0;
  this.preMedicareDeductible.precision = 0;
  this.preMedicareDeductible.minPrecision = 0;
  this.preMedicareDeductible.display = "";
  this.preMedicareDeductible.min = 0.0;
  this.preMedicareDeductible.max = 10000.0;
  this.preMedicareDeductible.description = "monthly cost of healthcare before Medicare"
  this.preMedicareDeductible.defaultValue = 4000.0;
  this.preMedicareDeductible.updateFunction = retire.compute_retire;
  this.preMedicareDeductible.parent = "retire";

  this.medicareB.id = "retire.medicareB";
  this.medicareB.inputType = "float";
  this.medicareB.value = 250.0;
  this.medicareB.userSet = 0;
  this.medicareB.precision = 0;
  this.medicareB.minPrecision = 0;
  this.medicareB.display = "";
  this.medicareB.min = 0.0;
  this.medicareB.max = 1000.0;
  this.medicareB.description = "monthly cost of Medicare Part B or Advantage"
  this.medicareB.defaultValue = 250.0;
  this.medicareB.updateFunction = retire.compute_retire;
  this.medicareB.parent = "retire";

  this.medicareDVD.id = "retire.medicareDVD";
  this.medicareDVD.inputType = "float";
  this.medicareDVD.value = 0.0;
  this.medicareDVD.userSet = 0;
  this.medicareDVD.precision = 0;
  this.medicareDVD.minPrecision = 0;
  this.medicareDVD.display = "";
  this.medicareDVD.min = 0.0;
  this.medicareDVD.max = 10000.0;
  this.medicareDVD.description = "annual cost of dental, vision, drugs at age 65+"
  this.medicareDVD.defaultValue = 0.0;
  this.medicareDVD.updateFunction = retire.compute_retire;
  this.medicareDVD.parent = "retire";


  // federal tax rate on income, federal tax rate on capital gains,
  // state tax rate on income, state tax rate on capital gains,
  // social security tax on income during employement
  this.federalTaxRate_income.id = "retire.federalTaxRate_income";
  this.federalTaxRate_income.inputType = "float";
  this.federalTaxRate_income.value = 24.0;
  this.federalTaxRate_income.userSet = 0;
  this.federalTaxRate_income.precision = 1;
  this.federalTaxRate_income.minPrecision = 0;
  this.federalTaxRate_income.display = "";
  this.federalTaxRate_income.min = 0.0;
  this.federalTaxRate_income.max = 100.0;
  this.federalTaxRate_income.description = "expected income tax rate"
  this.federalTaxRate_income.defaultValue = 24.0;
  this.federalTaxRate_income.updateFunction = retire.compute_retire;
  this.federalTaxRate_income.parent = "retire";

  this.federalTaxRate_capitalGains.id = "retire.federalTaxRate_capitalGains";
  this.federalTaxRate_capitalGains.inputType = "float";
  this.federalTaxRate_capitalGains.value = 22.0;
  this.federalTaxRate_capitalGains.userSet = 0;
  this.federalTaxRate_capitalGains.precision = 1;
  this.federalTaxRate_capitalGains.minPrecision = 0;
  this.federalTaxRate_capitalGains.display = "";
  this.federalTaxRate_capitalGains.min = 0.0;
  this.federalTaxRate_capitalGains.max = 100.0;
  this.federalTaxRate_capitalGains.description = "expected capital gains tax rate"
  this.federalTaxRate_capitalGains.defaultValue = 22.0;
  this.federalTaxRate_capitalGains.updateFunction = retire.compute_retire;
  this.federalTaxRate_capitalGains.parent = "retire";

  this.stateTaxRate_income.id = "retire.stateTaxRate_income";
  this.stateTaxRate_income.inputType = "float";
  this.stateTaxRate_income.value = 8.75;
  this.stateTaxRate_income.userSet = 0;
  this.stateTaxRate_income.precision = 2;
  this.stateTaxRate_income.minPrecision = 0;
  this.stateTaxRate_income.display = "";
  this.stateTaxRate_income.min = 0.0;
  this.stateTaxRate_income.max = 100.0;
  this.stateTaxRate_income.description = "expected income tax rate"
  this.stateTaxRate_income.defaultValue = 8.75;
  this.stateTaxRate_income.updateFunction = retire.compute_retire;
  this.stateTaxRate_income.parent = "retire";

  this.stateTaxRate_capitalGains.id = "retire.stateTaxRate_capitalGains";
  this.stateTaxRate_capitalGains.inputType = "float";
  this.stateTaxRate_capitalGains.value = 8.75;
  this.stateTaxRate_capitalGains.userSet = 0;
  this.stateTaxRate_capitalGains.precision = 2;
  this.stateTaxRate_capitalGains.minPrecision = 0;
  this.stateTaxRate_capitalGains.display = "";
  this.stateTaxRate_capitalGains.min = 0.0;
  this.stateTaxRate_capitalGains.max = 100.0;
  this.stateTaxRate_capitalGains.description = "expected capital gains tax rate"
  this.stateTaxRate_capitalGains.defaultValue = 8.75;
  this.stateTaxRate_capitalGains.updateFunction = retire.compute_retire;
  this.stateTaxRate_capitalGains.parent = "retire";

  this.SStaxRate.id = "retire.SStaxRate";
  this.SStaxRate.inputType = "float";
  this.SStaxRate.value = 7.65;
  this.SStaxRate.userSet = 0;
  this.SStaxRate.precision = 2;
  this.SStaxRate.minPrecision = 1;
  this.SStaxRate.display = "";
  this.SStaxRate.min = 0.0;
  this.SStaxRate.max = 100.0;
  this.SStaxRate.description = "expected tax rate on earning for Social Security"
  this.SStaxRate.defaultValue = 7.65;
  this.SStaxRate.updateFunction = retire.compute_retire;
  this.SStaxRate.parent = "retire";


  // inflation: overall, healthcare specific, social security COLA,
  // and social security actual payout percent
  this.inflation.id = "retire.inflation";
  this.inflation.inputType = "float";
  this.inflation.value = 2.5;
  this.inflation.userSet = 0;
  this.inflation.precision = 2;
  this.inflation.minPrecision = 0;
  this.inflation.display = "";
  this.inflation.min = 0.0;
  this.inflation.max = 100.0;
  this.inflation.description = "average rate of future inflation"
  this.inflation.defaultValue = 2.5;
  this.inflation.updateFunction = retire.compute_retire;
  this.inflation.parent = "retire";

  this.healthInsuranceIncrease.id = "retire.healthInsuranceIncrease";
  this.healthInsuranceIncrease.inputType = "float";
  this.healthInsuranceIncrease.value = 5.0;
  this.healthInsuranceIncrease.userSet = 0;
  this.healthInsuranceIncrease.precision = 2;
  this.healthInsuranceIncrease.minPrecision = 0;
  this.healthInsuranceIncrease.display = "";
  this.healthInsuranceIncrease.min = 0.0;
  this.healthInsuranceIncrease.max = 100.0;
  this.healthInsuranceIncrease.description = "average rate of health insurance increase"
  this.healthInsuranceIncrease.defaultValue = 5.0;
  this.healthInsuranceIncrease.updateFunction = retire.compute_retire;
  this.healthInsuranceIncrease.parent = "retire";

  this.SS_COLA.id = "retire.SS_COLA";
  this.SS_COLA.inputType = "float";
  this.SS_COLA.value = 2.5;
  this.SS_COLA.userSet = 0;
  this.SS_COLA.precision = 2;
  this.SS_COLA.minPrecision = 0;
  this.SS_COLA.display = "";
  this.SS_COLA.min = 0.0;
  this.SS_COLA.max = 200.0;
  this.SS_COLA.description = "average rate of social security COLA"
  this.SS_COLA.defaultValue = 1.25;
  this.SS_COLA.updateFunction = retire.compute_retire;
  this.SS_COLA.parent = "retire";

  this.SS_actualPercent.id = "retire.SS_actualPercent";
  this.SS_actualPercent.inputType = "float";
  this.SS_actualPercent.value = 70.0;
  this.SS_actualPercent.userSet = 0;
  this.SS_actualPercent.precision = 0;
  this.SS_actualPercent.minPrecision = 0;
  this.SS_actualPercent.display = "";
  this.SS_actualPercent.min = 0.0;
  this.SS_actualPercent.max = 100.0;
  this.SS_actualPercent.description = "percent of social security actually paid"
  this.SS_actualPercent.defaultValue = 70.0;
  this.SS_actualPercent.updateFunction = retire.compute_retire;
  this.SS_actualPercent.parent = "retire";



  // total accumulated savings and expected yield on those savings
  this.savings.id = "retire.savings";
  this.savings.inputType = "float";
  this.savings.value = 500000.0;
  this.savings.userSet = 0;
  this.savings.precision = 0;
  this.savings.minPrecision = 0;
  this.savings.display = "";
  this.savings.min = 0.0;
  this.savings.max = 20000000.0;
  this.savings.description = "current savings"
  this.savings.defaultValue = 500000.0;
  this.savings.updateFunction = retire.compute_retire;
  this.savings.parent = "retire";

  this.investmentYield.id = "retire.investmentYield";
  this.investmentYield.inputType = "float";
  this.investmentYield.value = 3.5;
  this.investmentYield.userSet = 0;
  this.investmentYield.precision = 2;
  this.investmentYield.minPrecision = 0;
  this.investmentYield.display = "";
  this.investmentYield.min = 0.0;
  this.investmentYield.max = 200.0;
  this.investmentYield.description = "yield (percent income on investment)"
  this.investmentYield.defaultValue = 3.5;
  this.investmentYield.updateFunction = retire.compute_retire;
  this.investmentYield.parent = "retire";

  ///////
  // Person 1
  ///////

  // person 1 : part-time job info
  this.jobIncome1.id = "retire.jobIncome1";
  this.jobIncome1.inputType = "float";
  this.jobIncome1.value = 30000.0;
  this.jobIncome1.userSet = 0;
  this.jobIncome1.precision = 0;
  this.jobIncome1.minPrecision = 0;
  this.jobIncome1.display = "";
  this.jobIncome1.min = 0;
  this.jobIncome1.max = 100000;
  this.jobIncome1.description = "employment annual income for person #1"
  this.jobIncome1.defaultValue = 30000.0;
  this.jobIncome1.updateFunction = retire.compute_retire;
  this.jobIncome1.parent = "retire";

  this.jobPaysHealthcare1.id = "retire.jobPaysHealthcare1";
  this.jobPaysHealthcare1.inputType = "checkbox";
  this.jobPaysHealthcare1.value = true;
  this.jobPaysHealthcare1.userSet = 0;
  this.jobPaysHealthcare1.defaultValue = true;
  this.jobPaysHealthcare1.updateFunction = retire.compute_retire;
  this.jobPaysHealthcare1.parent = "retire";

  this.jobCOLA1.id = "retire.jobCOLA1";
  this.jobCOLA1.inputType = "float";
  this.jobCOLA1.value = 1.5;
  this.jobCOLA1.userSet = 0;
  this.jobCOLA1.precision = 1;
  this.jobCOLA1.minPrecision = 1;
  this.jobCOLA1.display = "";
  this.jobCOLA1.min = 0;
  this.jobCOLA1.max = 100000;
  this.jobCOLA1.description = "annual percent increase in job income";
  this.jobCOLA1.defaultValue = 1.5;
  this.jobCOLA1.updateFunction = retire.compute_retire;
  this.jobCOLA1.parent = "retire";

  this.stopJobAge1.id = "retire.stopJobAge1";
  this.stopJobAge1.inputType = "int";
  this.stopJobAge1.value = 67;
  this.stopJobAge1.userSet = 0;
  this.stopJobAge1.precision = 0;
  this.stopJobAge1.minPrecision = 0;
  this.stopJobAge1.display = "";
  this.stopJobAge1.min = 0;
  this.stopJobAge1.max = 100;
  this.stopJobAge1.description = "the age when person #1 stops employment"
  this.stopJobAge1.defaultValue = 67;
  this.stopJobAge1.updateFunction = retire.compute_retire;
  this.stopJobAge1.parent = "retire";


  // person 1: social security 
  this.SS_income1.id = "retire.SS_income1";
  this.SS_income1.inputType = "float";
  this.SS_income1.value = 2000.0;
  this.SS_income1.userSet = 0;
  this.SS_income1.precision = 0;
  this.SS_income1.minPrecision = 0;
  this.SS_income1.display = "";
  this.SS_income1.min = 0;
  this.SS_income1.max = 10000;
  this.SS_income1.description = "initial social-security income for person #1"
  this.SS_income1.defaultValue = 2500.0;
  this.SS_income1.updateFunction = retire.compute_retire;
  this.SS_income1.parent = "retire";

  this.SS_age1.id = "retire.SS_age1";
  this.SS_age1.inputType = "int";
  this.SS_age1.value = 67;
  this.SS_age1.userSet = 0;
  this.SS_age1.precision = 0;
  this.SS_age1.minPrecision = 0;
  this.SS_age1.display = "";
  this.SS_age1.min = 62;
  this.SS_age1.max = 90;
  this.SS_age1.description = "age at which person #1 takes social security"
  this.SS_age1.defaultValue = 67;
  this.SS_age1.updateFunction = retire.compute_retire;
  this.SS_age1.parent = "retire";


  // person 1: traditional IRA
  this.tradIRA401K1.id = "retire.tradIRA401K1";
  this.tradIRA401K1.inputType = "float";
  this.tradIRA401K1.value = 150000.0;
  this.tradIRA401K1.userSet = 0;
  this.tradIRA401K1.precision = 0;
  this.tradIRA401K1.minPrecision = 0;
  this.tradIRA401K1.display = "";
  this.tradIRA401K1.min = 0.0;
  this.tradIRA401K1.max = 20000000.0;
  this.tradIRA401K1.description = "amount held in traditional IRAs or 401K by person 1"
  this.tradIRA401K1.defaultValue = 150000.0;
  this.tradIRA401K1.updateFunction = retire.compute_retire;
  this.tradIRA401K1.parent = "retire";

  this.tradIRA401Kage1.id = "retire.tradIRA401Kage1";
  this.tradIRA401Kage1.inputType = "floatOrString";
  this.tradIRA401Kage1.inputStrings = [ "wait" ];
  this.tradIRA401Kage1.value = "wait";
  this.tradIRA401Kage1.userSet = 0;
  this.tradIRA401Kage1.precision = 0;
  this.tradIRA401Kage1.minPrecision = 0;
  this.tradIRA401Kage1.display = "";
  this.tradIRA401Kage1.min = 55;
  this.tradIRA401Kage1.max = 120;
  this.tradIRA401Kage1.description = "age at which person #1 starts withdrawls of IRA/401K"
  this.tradIRA401Kage1.defaultValue = "wait";
  this.tradIRA401Kage1.updateFunction = retire.compute_retire;
  this.tradIRA401Kage1.parent = "retire";


  // person 1: pension
  this.pension_age1.id = "retire.pension_age1";
  this.pension_age1.inputType = "int";
  this.pension_age1.value = 65;
  this.pension_age1.userSet = 0;
  this.pension_age1.precision = 0;
  this.pension_age1.minPrecision = 0;
  this.pension_age1.display = "";
  this.pension_age1.min = 60;
  this.pension_age1.max = 80;
  this.pension_age1.description = "age at which person #1 takes pension income"
  this.pension_age1.defaultValue = 65;
  this.pension_age1.updateFunction = retire.compute_retire;
  this.pension_age1.parent = "retire";

  this.pension_income1.id = "retire.pension_income1";
  this.pension_income1.inputType = "float";
  this.pension_income1.value = 0.0;
  this.pension_income1.userSet = 0;
  this.pension_income1.precision = 0;
  this.pension_income1.minPrecision = 0;
  this.pension_income1.display = "";
  this.pension_income1.min = 0;
  this.pension_income1.max = 10000;
  this.pension_income1.description = "monthly pension income for person #1"
  this.pension_income1.defaultValue = 0.0;
  this.pension_income1.updateFunction = retire.compute_retire;
  this.pension_income1.parent = "retire";


  // person 1: one-time gains
  this.oneTimeGain1.id = "retire.oneTimeGain1";
  this.oneTimeGain1.inputType = "float";
  this.oneTimeGain1.value = 0.0;
  this.oneTimeGain1.userSet = 0;
  this.oneTimeGain1.precision = 0;
  this.oneTimeGain1.minPrecision = 0;
  this.oneTimeGain1.display = "";
  this.oneTimeGain1.min = 0;
  this.oneTimeGain1.max = 10000000;
  this.oneTimeGain1.description = "one-time post-tax gain for person #1"
  this.oneTimeGain1.defaultValue = 0.0;
  this.oneTimeGain1.updateFunction = retire.compute_retire;
  this.oneTimeGain1.parent = "retire";

  this.oneTimeGainAge1.id = "retire.oneTimeGainAge1";
  this.oneTimeGainAge1.inputType = "int";
  this.oneTimeGainAge1.value = 75;
  this.oneTimeGainAge1.userSet = 0;
  this.oneTimeGainAge1.precision = 0;
  this.oneTimeGainAge1.minPrecision = 0;
  this.oneTimeGainAge1.display = "";
  this.oneTimeGainAge1.min = 20;
  this.oneTimeGainAge1.max = 120;
  this.oneTimeGainAge1.description = "age at which person #1 gets one-time gain"
  this.oneTimeGainAge1.defaultValue = 75;
  this.oneTimeGainAge1.updateFunction = retire.compute_retire;
  this.oneTimeGainAge1.parent = "retire";

  ///////
  // Person 2
  ///////

  // person 2 : part-time job info
  this.jobIncome2.id = "retire.jobIncome2";
  this.jobIncome2.inputType = "float";
  this.jobIncome2.value = 30000.0;
  this.jobIncome2.userSet = 0;
  this.jobIncome2.precision = 0;
  this.jobIncome2.minPrecision = 0;
  this.jobIncome2.display = "";
  this.jobIncome2.min = 0;
  this.jobIncome2.max = 100000;
  this.jobIncome2.description = "employment annual income for person #2";
  this.jobIncome2.defaultValue = 30000.0;
  this.jobIncome2.updateFunction = retire.compute_retire;
  this.jobIncome2.parent = "retire";

  this.jobPaysHealthcare2.id = "retire.jobPaysHealthcare2";
  this.jobPaysHealthcare2.inputType = "checkbox";
  this.jobPaysHealthcare2.value = false;
  this.jobPaysHealthcare2.userSet = 0;
  this.jobPaysHealthcare2.defaultValue = false;
  this.jobPaysHealthcare2.updateFunction = retire.compute_retire;
  this.jobPaysHealthcare2.parent = "retire";

  this.jobCOLA2.id = "retire.jobCOLA2";
  this.jobCOLA2.inputType = "float";
  this.jobCOLA2.value = 0.0;
  this.jobCOLA2.userSet = 0;
  this.jobCOLA2.precision = 1;
  this.jobCOLA2.minPrecision = 1;
  this.jobCOLA2.display = "";
  this.jobCOLA2.min = 0;
  this.jobCOLA2.max = 100000;
  this.jobCOLA2.description = "annual percent increase in job income";
  this.jobCOLA2.defaultValue = 1.5;
  this.jobCOLA2.updateFunction = retire.compute_retire;
  this.jobCOLA2.parent = "retire";

  this.stopJobAge2.id = "retire.stopJobAge2";
  this.stopJobAge2.inputType = "int";
  this.stopJobAge2.value = 67;
  this.stopJobAge2.userSet = 0;
  this.stopJobAge2.precision = 0;
  this.stopJobAge2.minPrecision = 0;
  this.stopJobAge2.display = "";
  this.stopJobAge2.min = 0;
  this.stopJobAge2.max = 100;
  this.stopJobAge2.description = "the age when person #2 stops employment";
  this.stopJobAge2.defaultValue = 67;
  this.stopJobAge2.updateFunction = retire.compute_retire;
  this.stopJobAge2.parent = "retire";


  // person 2: social security 
  this.SS_age2.id = "retire.SS_age2";
  this.SS_age2.inputType = "int";
  this.SS_age2.value = 67;
  this.SS_age2.userSet = 0;
  this.SS_age2.precision = 0;
  this.SS_age2.minPrecision = 0;
  this.SS_age2.display = "";
  this.SS_age2.min = 62;
  this.SS_age2.max = 90;
  this.SS_age2.description = "age at which person #2 takes social security"
  this.SS_age2.defaultValue = 67;
  this.SS_age2.updateFunction = retire.compute_retire;
  this.SS_age2.parent = "retire";

  this.SS_income2.id = "retire.SS_income2";
  this.SS_income2.inputType = "float";
  this.SS_income2.value = 2000.0;
  this.SS_income2.userSet = 0;
  this.SS_income2.precision = 0;
  this.SS_income2.minPrecision = 0;
  this.SS_income2.display = "";
  this.SS_income2.min = 0;
  this.SS_income2.max = 10000;
  this.SS_income2.description = "initial social-security income for person #2"
  this.SS_income2.defaultValue = 2500.0;
  this.SS_income2.updateFunction = retire.compute_retire;
  this.SS_income2.parent = "retire";


  // person 2: traditional IRA
  this.tradIRA401K2.id = "retire.tradIRA401K2";
  this.tradIRA401K2.inputType = "float";
  this.tradIRA401K2.value = 150000.0;
  this.tradIRA401K2.userSet = 0;
  this.tradIRA401K2.precision = 0;
  this.tradIRA401K2.minPrecision = 0;
  this.tradIRA401K2.display = "";
  this.tradIRA401K2.min = 0.0;
  this.tradIRA401K2.max = 20000000.0;
  this.tradIRA401K2.description = "amount held in traditional IRAs or 401K by person 2"
  this.tradIRA401K2.defaultValue = 150000.0;
  this.tradIRA401K2.updateFunction = retire.compute_retire;
  this.tradIRA401K2.parent = "retire";

  this.tradIRA401Kage2.id = "retire.tradIRA401Kage2";
  this.tradIRA401Kage2.inputType = "floatOrString";
  this.tradIRA401Kage2.inputStrings = [ "wait" ];
  this.tradIRA401Kage2.value = "wait";
  this.tradIRA401Kage2.userSet = 0;
  this.tradIRA401Kage2.precision = 0;
  this.tradIRA401Kage2.minPrecision = 0;
  this.tradIRA401Kage2.display = "";
  this.tradIRA401Kage2.min = 55;
  this.tradIRA401Kage2.max = 120;
  this.tradIRA401Kage2.description = "age at which person #2 starts withdrawls of IRA/401K"
  this.tradIRA401Kage2.defaultValue = "wait";
  this.tradIRA401Kage2.updateFunction = retire.compute_retire;
  this.tradIRA401Kage2.parent = "retire";


  // person 2: pension
  this.pension_income2.id = "retire.pension_income2";
  this.pension_income2.inputType = "float";
  this.pension_income2.value = 0.0;
  this.pension_income2.userSet = 0;
  this.pension_income2.precision = 0;
  this.pension_income2.minPrecision = 0;
  this.pension_income2.display = "";
  this.pension_income2.min = 0;
  this.pension_income2.max = 10000;
  this.pension_income2.description = "monthly pension income for person #2"
  this.pension_income2.defaultValue = 0.0;
  this.pension_income2.updateFunction = retire.compute_retire;
  this.pension_income2.parent = "retire";

  this.pension_age2.id = "retire.pension_age2";
  this.pension_age2.inputType = "int";
  this.pension_age2.value = 65;
  this.pension_age2.userSet = 0;
  this.pension_age2.precision = 0;
  this.pension_age2.minPrecision = 0;
  this.pension_age2.display = "";
  this.pension_age2.min = 60;
  this.pension_age2.max = 80;
  this.pension_age2.description = "age at which person #2 takes pension income"
  this.pension_age2.defaultValue = 65;
  this.pension_age2.updateFunction = retire.compute_retire;
  this.pension_age2.parent = "retire";


  // person 2: one-time gains
  this.oneTimeGain2.id = "retire.oneTimeGain2";
  this.oneTimeGain2.inputType = "float";
  this.oneTimeGain2.value = 0.0;
  this.oneTimeGain2.userSet = 0;
  this.oneTimeGain2.precision = 0;
  this.oneTimeGain2.minPrecision = 0;
  this.oneTimeGain2.display = "";
  this.oneTimeGain2.min = 0;
  this.oneTimeGain2.max = 10000000;
  this.oneTimeGain2.description = "one-time post-tax gain for person #2"
  this.oneTimeGain2.defaultValue = 0.0;
  this.oneTimeGain2.updateFunction = retire.compute_retire;
  this.oneTimeGain2.parent = "retire";

  this.oneTimeGainAge2.id = "retire.oneTimeGainAge2";
  this.oneTimeGainAge2.inputType = "int";
  this.oneTimeGainAge2.value = 75;
  this.oneTimeGainAge2.userSet = 0;
  this.oneTimeGainAge2.precision = 0;
  this.oneTimeGainAge2.minPrecision = 0;
  this.oneTimeGainAge2.display = "";
  this.oneTimeGainAge2.min = 20;
  this.oneTimeGainAge2.max = 120;
  this.oneTimeGainAge2.description = "age at which person #1 gets one-time gain"
  this.oneTimeGainAge2.defaultValue = 75;
  this.oneTimeGainAge2.updateFunction = retire.compute_retire;
  this.oneTimeGainAge2.parent = "retire";

  // ===========================================================================

  common.set(retire.startYear, 0);
  common.set(retire.showDollars, 0);

  common.set(retire.name1, 0);
  common.set(retire.birthYear1, 0);
  common.set(retire.stopAge1, 0);
  common.set(retire.name2, 0);
  common.set(retire.birthYear2, 0);
  common.set(retire.stopAge2, 0);

  common.set(retire.basicExpensesStart, 0);
  common.set(retire.basicExpensesFinish, 0);
  common.set(retire.expensesFinishAge, 0);

  common.set(retire.preMedicare, 0);
  common.set(retire.preMedicareDeductible, 0);
  common.set(retire.medicareB, 0);
  common.set(retire.medicareDVD, 0);

  common.set(retire.federalTaxRate_income, 0);
  common.set(retire.federalTaxRate_capitalGains, 0);
  common.set(retire.stateTaxRate_income, 0);
  common.set(retire.stateTaxRate_capitalGains, 0);
  common.set(retire.SStaxRate, 0);

  common.set(retire.inflation, 0);
  common.set(retire.healthInsuranceIncrease, 0);
  common.set(retire.SS_COLA, 0);
  common.set(retire.SS_actualPercent, 0);

  common.set(retire.savings, 0);
  common.set(retire.investmentYield, 0);

  common.set(retire.jobIncome1, 0);
  common.set(retire.jobPaysHealthcare1, 0);
  common.set(retire.jobCOLA1, 0);
  common.set(retire.stopJobAge1, 0);
  common.set(retire.SS_income1, 0);
  common.set(retire.SS_age1, 0);
  common.set(retire.tradIRA401K1, 0);
  common.set(retire.tradIRA401Kage1, 0);
  common.set(retire.pension_income1, 0);
  common.set(retire.pension_age1, 0);
  common.set(retire.oneTimeGain1, 0);
  common.set(retire.oneTimeGainAge1, 0);

  common.set(retire.jobIncome2, 0);
  common.set(retire.jobPaysHealthcare2, 0);
  common.set(retire.jobCOLA2, 0);
  common.set(retire.stopJobAge2, 0);
  common.set(retire.SS_income2, 0);
  common.set(retire.SS_age2, 0);
  common.set(retire.tradIRA401K2, 0);
  common.set(retire.tradIRA401Kage2, 0);
  common.set(retire.pension_income2, 0);
  common.set(retire.pension_age2, 0);
  common.set(retire.oneTimeGain2, 0);
  common.set(retire.oneTimeGainAge2, 0);

  this.verbose = 1;

  document.getElementById("name1").innerHTML = this.name1.value;
  document.getElementById("name2").innerHTML = this.name2.value;

  this.compute_retire();

  return;
}

//==============================================================================

this.computeIRAWithdrawl = function(basicExpenses, taxes, healthcare,
                            employmentIncome, SSPensionIncome, investmentIncome,
                            savings, age, tradIRA401K, tradIRA401Kage,
                            stopAge, year) {
  var totalExpenses = 0.0;
  var totalIncome = 0.0;
  var tradIRA401KWithdrawl = 0.0;
  var differencePerYear = 0.0;
  var tradIRA401K_RMD = 0.0;
  var lifeExpectancyFactor = new Array(122);
  var age1 = 0;
  var yearsRemaining = 0;
  var withdrawlSpaced = 0.0;
  var withdrawlNeeded = 0.0;

  // lifeExpectancyFactor is from the IRS "life expectancy factor"
  // used to calculate required minimum withdrawls from traditional
  // IRAs, beginning at age 72.
  for (age1 = 0; age1 < 72; age1++) {
    lifeExpectancyFactor[age1] = 1.0;
  }
  lifeExpectancyFactor[72] = 27.4;
  lifeExpectancyFactor[73] = 26.5;
  lifeExpectancyFactor[74] = 25.5;
  lifeExpectancyFactor[75] = 24.6;
  lifeExpectancyFactor[76] = 23.7;
  lifeExpectancyFactor[77] = 22.9;
  lifeExpectancyFactor[78] = 22.0;
  lifeExpectancyFactor[79] = 21.1;
  lifeExpectancyFactor[80] = 20.2;
  lifeExpectancyFactor[81] = 19.4;
  lifeExpectancyFactor[82] = 18.5;
  lifeExpectancyFactor[83] = 17.1;
  lifeExpectancyFactor[84] = 16.8;
  lifeExpectancyFactor[85] = 16.0;
  lifeExpectancyFactor[86] = 15.2;
  lifeExpectancyFactor[87] = 14.4;
  lifeExpectancyFactor[88] = 13.7;
  lifeExpectancyFactor[89] = 12.9;
  lifeExpectancyFactor[90] = 12.2;
  lifeExpectancyFactor[91] = 11.5;
  lifeExpectancyFactor[92] = 10.8;
  lifeExpectancyFactor[93] = 10.1;
  lifeExpectancyFactor[94] = 9.5;
  lifeExpectancyFactor[95] = 8.9;
  lifeExpectancyFactor[96] = 8.4;
  lifeExpectancyFactor[97] = 7.8;
  lifeExpectancyFactor[98] = 7.3;
  lifeExpectancyFactor[99] = 6.8;
  lifeExpectancyFactor[100] = 6.4;
  lifeExpectancyFactor[101] = 6.0;
  lifeExpectancyFactor[102] = 5.6;
  lifeExpectancyFactor[103] = 5.2;
  lifeExpectancyFactor[104] = 4.9;
  lifeExpectancyFactor[105] = 4.6;
  lifeExpectancyFactor[106] = 4.3;
  lifeExpectancyFactor[107] = 4.1;
  lifeExpectancyFactor[108] = 3.9;
  lifeExpectancyFactor[109] = 3.7;
  lifeExpectancyFactor[110] = 3.5;
  lifeExpectancyFactor[111] = 3.4;
  lifeExpectancyFactor[112] = 3.3;
  lifeExpectancyFactor[113] = 3.1;
  lifeExpectancyFactor[114] = 3.0;
  lifeExpectancyFactor[115] = 2.9;
  lifeExpectancyFactor[116] = 2.8;
  lifeExpectancyFactor[117] = 2.7;
  lifeExpectancyFactor[118] = 2.5;
  lifeExpectancyFactor[119] = 2.3;
  lifeExpectancyFactor[120] = 2.0;

  // if age is specified and valid, compute withdrawls spaced 
  // over specified years
  withdrawlSpaced = 0.0;
  if (tradIRA401Kage != "wait" && age >= tradIRA401Kage) {
    yearsRemaining = (stopAge + 1) - age;
    console.log(" >> in year " + year + ", age is " + age + 
                 ", stop age is " + stopAge + 
                 ", remaining is " + 
                yearsRemaining + " and total IRA is " + tradIRA401K);
    if (yearsRemaining > 0) {
      withdrawlSpaced = tradIRA401K / yearsRemaining;
    } else {
      withdrawlSpaced = tradIRA401K;
    }
  }

  // see if a widthdrawl is needed based on the difference between
  // expenses and income, and current post-tax savings.
  withdrawlNeeded = 0.0;
  totalExpenses = basicExpenses + taxes + healthcare;
  totalIncome = employmentIncome + SSPensionIncome + investmentIncome;
  // add 10% because amount required to stay above 0 is only an estimate
  // and if we drop below zero too soon it stops calculating
  differencePerYear = 1.10 * (totalIncome - totalExpenses);

  // if savings plus required differencePerYear <= 0, pull from IRA/401K
  withdrawlNeeded = 0.0;
  if (savings + differencePerYear <= 0) {
    // if tradIRA401K doesn't have enough money, take what we can, balance = 0.
    if (tradIRA401K + differencePerYear < 0) {
      differencePerYear = -1.0 * tradIRA401K;
    }
    withdrawlNeeded = -1 * differencePerYear;
  }
  
  // take the larger of "spaced" or "needed" withdrawls.
  tradIRA401KWithdrawl = withdrawlSpaced;
  if (tradIRA401KWithdrawl < withdrawlNeeded) {
    tradIRA401KWithdrawl = withdrawlNeeded;
  }

  tradIRA401K_RMD = 0.0;
  if (age >= 72 && tradIRA401K > 0.0) {
    if (age <= 120) {
      tradIRA401K_RMD = tradIRA401K / lifeExpectancyFactor[age];
    } else {
      tradIRA401K_RMD = tradIRA401K / 2.0;
    }
  }
  if (tradIRA401K_RMD > tradIRA401KWithdrawl) {
    tradIRA401KWithdrawl = tradIRA401K_RMD;
  }
  return tradIRA401KWithdrawl;
}

//------------------------------------------------------------------------------

this.compute_retire = function() {
  var year = 0;
  var age1 = 0;
  var age2 = 0;
  var employmentIncome = 0.0;
  var SSPensionIncome = 0.0;
  var investmentIncome = 0.0;
  var totalIncome = 0.0;
  var taxes = 0.0;
  var totalExpenses = 0.0;
  var healthcare = 0.0;
  var savings = retire.savings.value;
  var tradIRA401K1 = retire.tradIRA401K1.value;
  var tradIRA401K2 = retire.tradIRA401K2.value;
  var tradIRA401Kage1 = retire.tradIRA401Kage1.value;
  var tradIRA401Kage2 = retire.tradIRA401Kage2.value;
  var basicExpenses = 0.0;
  var basicExpensesStart = retire.basicExpensesStart.value;
  var basicExpensesFinish = retire.basicExpensesFinish.value;
  var expensesFinishAge = retire.expensesFinishAge.value;
  var expensesFinishYear = 0;
  var expensesInOldDollarsP = 0.0;
  var expensesInOldDollarsC = 0.0;
  var expensesRatio = 0.0;
  var inflation = retire.inflation.value / 100.0;
  var investmentYield = retire.investmentYield.value / 100.0;
  var federalTaxRate_income = retire.federalTaxRate_income.value / 100.0;
  var federalTaxRate_capitalGains = 
      retire.federalTaxRate_capitalGains.value / 100.0;
  var stateTaxRate_income = retire.stateTaxRate_income.value / 100.0;
  var stateTaxRate_capitalGains = 
      retire.stateTaxRate_capitalGains.value / 100.0;
  var SStaxRate = retire.SStaxRate.value / 100.0;
  var SS_age1 = retire.SS_age1.value;
  var SS_age2 = retire.SS_age2.value;
  var SS_income1 = retire.SS_income1.value;
  var SS_income2 = retire.SS_income2.value;
  var SS_COLA = retire.SS_COLA.value / 100.0;
  var SS_actualPercent = retire.SS_actualPercent.value / 100.0;
  var pension_age1 = retire.pension_age1.value;
  var pension_age2 = retire.pension_age2.value;
  var pension_income1 = retire.pension_income1.value;
  var pension_income2 = retire.pension_income2.value;
  var stopJobAge1 = retire.stopJobAge1.value;
  var jobIncome1 = retire.jobIncome1.value;
  var jobCOLA1 = retire.jobCOLA1.value / 100.0;
  var stopJobAge2 = retire.stopJobAge2.value;
  var jobIncome2 = retire.jobIncome2.value;
  var jobCOLA2 = retire.jobCOLA2.value / 100.0;
  var healthcare1 = 0.0;
  var healthcare2 = 0.0;
  var healthcare = 0.0
  var healthcareAccumulated = 0.0;
  var medicareB = retire.medicareB.value * 12.0;
  var medicareDVD = retire.medicareDVD.value;
  var preMedicare = retire.preMedicare.value * 12.0;
  var preMedicareDeductible = retire.preMedicareDeductible.value;
  var healthInsuranceIncrease = retire.healthInsuranceIncrease.value / 100.0;
  var inflationAdjustedDollar = 1.0;
  var computedSSPensionIncome = [];
  var computedEmploymentIncome = [];
  var computedTradIRA401KIncome = [];
  var computedInvestmentIncome = [];
  var computedTotalIncome = [];
  var computedBasicExpenses = [];
  var computedTaxes = [];
  var computedHealthcare = [];
  var computedTotalExpenses = [];
  var computedTotalSavings = [];
  var computedSavings = [];
  var computedTradIRA401KSavings = [];
  var computedInflation = [];
  var computedIncomeMinusExpenses = [];
  var moneyRunOutStr = "";
  var classList = {};
  var cIdx = 0;
  var SS_diff;
  var SS_adjust = 0.0;
  var SS_factor1 = 0.0;
  var SS_factor2 = 0.0;
  var jobPaysHealthcare1 = 0;
  var jobPaysHealthcare2 = 0;
  var jobPaysHealthcare = 0;
  var table = "";
  var showDollars = retire.showDollars.value;
  var stopYear1 = 0;
  var stopYear2 = 0;
  var endYear = 0;
  var calculate1 = 0;
  var calculate2 = 0;
  var name1 = retire.name1.value;
  var name2 = retire.name2.value;
  var startYear = retire.startYear.value;
  var tradIRA401KIncome1 = 0.0;
  var tradIRA401KIncome2 = 0.0;
  var tradIRA401KWithdrawl1 = 0.0;
  var tradIRA401KWithdrawl2 = 0.0;
  var oneTimeGain1 = 0.0;
  var oneTimeGain2 = 0.0;
  var totalSavings = 0.0;
  var pension_year1 = 0;
  var pension_year2 = 0;
  var tradIRA401KSavings = 0.0;
  var tradIRA401KIncome = 0.0;
  var qualifierStr = "";
  var stopAge1 = retire.stopAge1.value;
  var stopAge2 = retire.stopAge2.value;

  if (retire.verbose > 0) {
    console.log("==================================");
  }


  // set some HTML values
  document.getElementById("name1").innerHTML = name1;
  document.getElementById("name2").innerHTML = name2;
  document.getElementById("moneyRunOutInfo").innerHTML = "";
  classList = document.getElementsByClassName('initYear');
  for (cIdx = 0; cIdx < classList.length; cIdx++) {
    classList[cIdx].textContent = startYear;
  }

  pension_year1 = retire.birthYear1.value + pension_age1;
  classList = document.getElementsByClassName('pensionYear1');
  for (cIdx = 0; cIdx < classList.length; cIdx++) {
    classList[cIdx].textContent = pension_year1;
  }

  pension_year2 = retire.birthYear2.value + pension_age2;
  classList = document.getElementsByClassName('pensionYear2');
  for (cIdx = 0; cIdx < classList.length; cIdx++) {
    classList[cIdx].textContent = pension_year2;
  }


  // figure out adjustment to SS by retiring earlier or later
  // From ssa.gov:
  // In the case of early retirement, a benefit is reduced 5/9 of one percent 
  // for each month before normal retirement age, up to 36 months. If the 
  // number of months exceeds 36, then the benefit is further reduced 5/12 
  // of one percent per month.
  // Delayed retirement credit is generally given for retirement after the 
  // normal retirement age. No credit is given after age 69. 8% credit
  // per year if born after 1943.
  SS_factor1 = 1.0;
  if (SS_age1 < 67) {
    SS_diff = (67.0 - SS_age1) * 12.0;
    if (SS_diff <= 36) {
      SS_adjust = ((5.0/9.0) * SS_diff) / 100.0;
    } else {
      SS_adjust = (((5.0/9.0)*36.0) + ((5.0/12.0)*(SS_diff-36.0))) / 100.0;
    }
    SS_factor1 = (1.0 - SS_adjust);
  }
  if (SS_age1 > 67) {
    SS_diff = (SS_age1 - 67.0);
    SS_adjust = 0.08 * SS_diff;
    if (SS_adjust > 0.24) {
      SS_adjust = 0.24;
    }
    SS_factor1 = (1.0 + SS_adjust);
  }
  SS_factor2 = 1.0;
  if (SS_age2 < 67) {
    SS_diff = (67.0 - SS_age2) * 12.0;
    if (SS_diff <= 36) {
      SS_adjust = ((5.0/9.0) * SS_diff) / 100.0;
    } else {
      SS_adjust = (((5.0/9.0)*36.0) + ((5.0/12.0)*(SS_diff-36.0))) / 100.0;
    }
    SS_factor2 = (1.0 - SS_adjust);
  }
  if (SS_age2 > 67) {
    SS_diff = (SS_age2 - 67.0);
    SS_adjust = 0.08 * SS_diff;
    if (SS_adjust > 0.24) {
      SS_adjust = 0.24;
    }
    SS_factor2 = (1.0 + SS_adjust);
  }
  document.getElementById("SSfactor1").innerHTML = (SS_factor1*100).toFixed(0);
  document.getElementById("SSfactor2").innerHTML = (SS_factor2*100).toFixed(0);

  // convert monthly to annual income; adjust SS by specified factor per person
  SS_income1 = SS_income1 * 12.0 * SS_factor1;
  SS_income2 = SS_income2 * 12.0 * SS_factor2;
  pension_income1 = pension_income1 * 12.0;
  pension_income2 = pension_income2 * 12.0;

  // determine what year to stop calculations at
  stopYear1 = retire.birthYear1.value + stopAge1;
  stopYear2 = retire.birthYear2.value + stopAge2;
  endYear = stopYear1;
  if (stopYear2 > endYear) {
    endYear = stopYear2;
  }
  retire.endYear = endYear;
  console.log(" >> stopYear1 = " + stopYear1 + ", stopYear2 = " + stopYear2);

  // initialize variables
  healthcareAccumulated = 0.0;
  basicExpenses = retire.basicExpensesStart.value;
  if (retire.birthYear1.value >= retire.birthYear2.value) {
    expensesFinishYear = retire.birthYear1.value + expensesFinishAge;
  } else {
    expensesFinishYear = retire.birthYear2.value + expensesFinishAge;
  }
  expensesInOldDollarsP = basicExpensesStart;

  oneTimeGain1 = retire.oneTimeGain1.value;
  oneTimeGain2 = retire.oneTimeGain2.value;

  if (name1 == "") {
    tradIRA401K1 = 0.0;
  }
  if (name2 == "") {
    tradIRA401K2 = 0.0;
  }
  if (name1 == "" && name2 == "") {
    basicExpenses = 0.0;
    basicExpensesStart = 0.0;
    basicExpensesFinish = 0.0;
  }

  // start building output table
  table = "";
  table += "<font size=2>";
  table += "<table style='margin-left:2em' id='outputTable'> ";
  table += "<tbody> ";

  // ===========================================================================
  for (year = startYear; year <= endYear; year += 1) {

    // -------------------------------------------------------------------------
    // initialize for the year
    // figure out each person's age, and if we should calculate for them or not
    age1 = year - retire.birthYear1.value;
    age2 = year - retire.birthYear2.value;
    calculate1 = 1
    if (year > stopYear1 || name1 == "") {
      calculate1 = 0;
    }
    calculate2 = 1
    if (year > stopYear2 || name2 == "") {
      calculate2 = 0;
    }

    // -------------------------------------------------------------------------
    // get basic expenses for the current year, adjusted by inflation
    // for the current year: get relative change by interpolation
    expensesInOldDollarsC = basicExpensesStart + (year - startYear) *
                           (basicExpensesFinish - basicExpensesStart) / 
                           (expensesFinishYear - startYear);
    if (year > expensesFinishYear) {
      expensesInOldDollarsC = basicExpensesFinish;
    }
    // get the relative change in expenses from previous year
    expensesRatio = 1.0;
    if (expensesInOldDollarsP > 0.0) {
      expensesRatio = expensesInOldDollarsC / expensesInOldDollarsP;
    }
    expensesInOldDollarsP = expensesInOldDollarsC;

    // adjust basic expenses; inflation is accounted for later.
    basicExpenses *= expensesRatio;

    // -------------------------------------------------------------------------
    // add one-time gain to savings, if/when appropriate
    if (age1 == retire.oneTimeGainAge1.value) {
      savings += oneTimeGain1;
      oneTimeGain1 = 0.0;
    }
    if (age2 == retire.oneTimeGainAge2.value) {
      savings += oneTimeGain2;
      oneTimeGain2 = 0.0;
    }

    // -------------------------------------------------------------------------
    // income
    employmentIncome = 0.0;
    SSPensionIncome = 0.0;

    // from 2033 and on, reduce SS income by specified amount
    if (year == 2033) {
      SS_income1 *= SS_actualPercent;
      SS_income2 *= SS_actualPercent;
    }

    // determine job income and if either job is paying for healthcare
    jobPaysHealthcare1 = 0;
    jobPaysHealthcare2 = 0;
    jobPaysHealthcare = 0;
    if (calculate1 && jobIncome1 > 0.0 && age1 < stopJobAge1) {
      employmentIncome = employmentIncome + jobIncome1;
      if (document.getElementById(retire.jobPaysHealthcare1.id)) {
        var checked = retire.jobPaysHealthcare1.value;
        if (checked) {
          jobPaysHealthcare1 = 1;
        }
      }
    }
    if (calculate2 && jobIncome2 > 0.0 && age2 < stopJobAge2) {
      employmentIncome = employmentIncome + jobIncome2;
      if (document.getElementById(retire.jobPaysHealthcare2.id)) {
        var checked = retire.jobPaysHealthcare2.value;
        if (checked) {
          jobPaysHealthcare2 = 1;
        }
      }
    }
    if (jobPaysHealthcare1 || jobPaysHealthcare2) {
      jobPaysHealthcare = 1;
    }

    // add SS income to SS+pension income; adjust SS by COLA
    if (calculate1 && age1 > SS_age1) {
      SSPensionIncome += SS_income1;
      SS_income1 = SS_income1 * (1.0 + SS_COLA);
    }
    if (calculate2 && age2 > SS_age2) {
      SSPensionIncome += SS_income2;
      SS_income2 = SS_income2 * (1.0 + SS_COLA);
    }

    // assume pension plan has no cost of living adjustment
    if (calculate1 && age1 > pension_age1) {
      SSPensionIncome += pension_income1;
    }
    if (calculate2 && age2 > pension_age2) {
      SSPensionIncome += pension_income2;
    }

    investmentIncome = savings * investmentYield;

    tradIRA401KIncome1 = tradIRA401K1 * investmentYield;
    tradIRA401KIncome2 = tradIRA401K2 * investmentYield;

    // Do NOT accumulate tradIRA401KIncome* in investmentIncome.
    // That would accumulate it twice, since it accumulates
    // in tradIRA401KIncome, and it then becomes observed income 
    // during withdrawls.  Investment income and IRA/401K income
    // should be kept separate because IRA and 401K earnings are 
    // not taxed, only the withdrawls are taxed as income.
    tradIRA401K1 += tradIRA401KIncome1;
    tradIRA401KWithdrawl1 = retire.computeIRAWithdrawl(basicExpenses, taxes, 
                        healthcare, employmentIncome, SSPensionIncome, 
                        investmentIncome, savings, age1, tradIRA401K1,
                        tradIRA401Kage1, stopAge1, year);
    tradIRA401K1 -= tradIRA401KWithdrawl1;

    tradIRA401K2 += tradIRA401KIncome2;
    tradIRA401KWithdrawl2 = retire.computeIRAWithdrawl(basicExpenses, taxes, 
                        healthcare, employmentIncome, SSPensionIncome, 
                        investmentIncome, savings, age2, tradIRA401K2,
                        tradIRA401Kage2, stopAge2, year);
    tradIRA401K2 -= tradIRA401KWithdrawl2;

    tradIRA401KIncome = tradIRA401KWithdrawl1 + tradIRA401KWithdrawl2;
    tradIRA401KSavings = tradIRA401K1 + tradIRA401K2;


    totalIncome = employmentIncome + tradIRA401KIncome + 
                  SSPensionIncome + investmentIncome;

    // -------------------------------------------------------------------------
    taxes = (federalTaxRate_income * 
                (employmentIncome + SSPensionIncome + tradIRA401KIncome)) + 
            (federalTaxRate_capitalGains * investmentIncome) + 
            (stateTaxRate_income * 
                (employmentIncome + SSPensionIncome + tradIRA401KIncome)) + 
            (stateTaxRate_capitalGains * investmentIncome) + 
            (SStaxRate * employmentIncome);

    // -------------------------------------------------------------------------
    // healthcare
    healthcare1 = 0;
    if (calculate1) {
      if (age1 >= 65) {
        healthcare1 = medicareB + medicareDVD;
      } else {
        if (!jobPaysHealthcare) {
          healthcare1 = preMedicare + preMedicareDeductible;
        }
      }
    }
    healthcare2 = 0;
    if (calculate2) {
      if (age2 >= 65) {
        healthcare2 = medicareB + medicareDVD;
      } else {
        if (!jobPaysHealthcare) {
          healthcare2 = preMedicare + preMedicareDeductible;
        }
      }
    }
    healthcare = healthcare1 + healthcare2;
    healthcareAccumulated += healthcare;

    // -------------------------------------------------------------------------
    // wrap things up

    // total expenses
    totalExpenses = basicExpenses + taxes + healthcare;

    // output to console
    console.log(year + " : " + name1 + " is " + age1 + 
                ", " + name2 + " is " + age2 + 
                " : $1 in 2024 = $" + inflationAdjustedDollar.toFixed(2) + 
                " in " + year);
    console.log("    total income = " + totalIncome.toFixed(2) + 
                " (employment = $" + employmentIncome.toFixed(2) + 
                ", IRA/401K = $" + tradIRA401KIncome.toFixed(2) + 
                ", SS/Pension = $" + SSPensionIncome.toFixed(2) + 
                ", investment = $" + investmentIncome.toFixed(2) + ")");
    console.log("    healthcare = $" + healthcare.toFixed(2) +
                " (" + name1 + " = $" + healthcare1.toFixed(2) + 
                ", " + name2 + " = $" + healthcare2.toFixed(2) + 
                ", accumulated = $" + healthcareAccumulated.toFixed(2));
    console.log("    total expenses = $" + totalExpenses.toFixed(2) +
                " (basic expenses = $" + basicExpenses.toFixed(2) + 
                ", taxes = $" + taxes.toFixed(2) +
                ", healthcare = $" + healthcare.toFixed(2) + ")");
    console.log("    savings = $" + savings.toFixed(2) + " plus " +
                "$" + tradIRA401K1.toFixed(2) + " in IRA1 and " +
                "$" + tradIRA401K2.toFixed(2) + " in IRA2");

    // add to table
    table += "<tr>";
    table += "<td>" + year + " : " + "</td>";
    if (calculate1) {
      table += "<td>" + name1 + " is " + age1 + "</td>";
    } else {
      table += "<td></td>";
    }
    if (calculate2) {
      table += "<td>" + name2 + " is " + age2 + "</td>";
    } else {
      table += "<td></td>";
    }
    table += "<td>" + "$1 in " + startYear + " = $" +
                      inflationAdjustedDollar.toFixed(2) + " in " + 
                      year + "</td>";
    table += "<td>" + "</td>";
    table += "</tr>";

    table += "<tr>";
    table += "<td>" + "</td>";
    table += "<td>" + "total income = $" + totalIncome.toFixed(0) + "</td>";
    table += "<td>" + "(employment = $" + 
              (employmentIncome+tradIRA401KIncome).toFixed(0) + "</td>";
    table += "<td>" + "SS/Pension = $" + SSPensionIncome.toFixed(0) + "</td>";
    table += "<td>" + "investment = $" + investmentIncome.toFixed(0) + 
             ")" + "</td>";
    table += "</tr>";

    table += "<tr>";
    table += "<td>" + "</td>";
    table += "<td>" + "total expenses = $" + totalExpenses.toFixed(0) + "</td>";
    table += "<td>" + "(basic expenses = $" + basicExpenses.toFixed(0) + "</td>";
    table += "<td>" + "taxes = $" + taxes.toFixed(0) + "</td>";
    table += "<td>" + "healthcare = $" + healthcare.toFixed(0) + 
             ")" + "</td>";

    table += "</tr>";

    table += "<tr>";
    table += "<td>" + "</td>";
    table += "<td>" + "healthcare = $" + healthcare.toFixed(0) + "</td>";
    if (calculate1) {
      table += "<td>" + "(" + name1 + " = $" + healthcare1.toFixed(0) + ")" + "</td>";
    } else {
      table += "<td></td>";
    }
    if (calculate2) {
      table += "<td>" + "(" + name2 + " = $" + healthcare2.toFixed(0) + ")" + "</td>";
    } else {
      table += "<td></td>";
    }
    table += "<td>" + "accumulated = $" + healthcareAccumulated.toFixed(0) + 
             "</td>";
    table += "</tr>";

    table += "<tr>";
    table += "<td>" + "</td>";
    table += "<td>" + "savings = $" + savings.toFixed(0) + "</td>";
    table += "<td>" + "IRA/401K = $" + tradIRA401KSavings.toFixed(0) + "</td>";
    table += "<td>" + "</td>";
    table += "<td>" + "</td>";
    table += "</tr>";

    // add computed values to lists
    totalSavings = savings + tradIRA401KSavings;

    computedEmploymentIncome.push([year, employmentIncome]);
    computedTradIRA401KIncome.push([year, tradIRA401KIncome]);
    computedSSPensionIncome.push([year, SSPensionIncome]);
    computedInvestmentIncome.push([year, investmentIncome]);
    computedTotalIncome.push([year, totalIncome]);
    computedBasicExpenses.push([year, basicExpenses]);
    computedTaxes.push([year, taxes]);
    computedHealthcare.push([year, healthcare]);
    computedTotalExpenses.push([year, totalExpenses]);
    computedTotalSavings.push([year, totalSavings]);
    computedSavings.push([year, savings]);
    computedTradIRA401KSavings.push([year, tradIRA401KSavings]);
    computedInflation.push([year, inflationAdjustedDollar]);
    computedIncomeMinusExpenses.push([year, Number(totalIncome-totalExpenses)]);
    
    // update savings at end of year
    savings = savings - totalExpenses + totalIncome;

    // if we've run out of money, stop looping
    if (savings <= 0) {
      break;
    }

    // if show results in the initial-year dollars, adjust all
    // amounts by inflation
    if (showDollars == "beginYear") {
      SS_income1 /= (1.0 + inflation);
      SS_income2 /= (1.0 + inflation);

      if (year > pension_year1) {
        pension_income1 /= (1.0 + inflation);
      }
      if (year > pension_year2) {
        pension_income2 /= (1.0 + inflation);
      }

      jobIncome1  /= (1.0 + inflation);
      jobIncome2  /= (1.0 + inflation);

      medicareB /= (1.0 + inflation);
      medicareDVD /= (1.0 + inflation);
      preMedicare /= (1.0 + inflation);
      preMedicareDeductible /= (1.0 + inflation);

      basicExpenses /= (1.0 + inflation);
      savings /= (1.0 + inflation);
      
      oneTimeGain1 /= (1.0 + inflation);
      oneTimeGain2 /= (1.0 + inflation);

      tradIRA401K1 /= (1.0 + inflation);
      tradIRA401K2 /= (1.0 + inflation);
    }


    // adjust for inflation and COLA
    basicExpenses = basicExpenses * (1.0 + inflation);
    medicareB = medicareB * (1.0 + healthInsuranceIncrease);     // assume bad
    medicareDVD = medicareDVD * (1.0 + healthInsuranceIncrease); // same as partB
    preMedicare = preMedicare * (1.0 + healthInsuranceIncrease);
    preMedicareDeductible = preMedicareDeductible * 
                            (1.0 + healthInsuranceIncrease);
    inflationAdjustedDollar = inflationAdjustedDollar * (1.0 - inflation);
    jobIncome1 = jobIncome1 * (1.0 + jobCOLA1);
    jobIncome2 = jobIncome2 * (1.0 + jobCOLA2);
    // assume that pension income has no COLA
  }

  // if
  if (savings <= 0) {
    age1 = year - retire.birthYear1.value;
    age2 = year - retire.birthYear2.value;
    if (name1 != "" && name2 != "") {
      moneyRunOutStr = "When savings runs out in " + year +
                     ", " + name1 + " will be " + age1 + 
                     " and " + name2 + " will be " + age2;
    } else if (name1 != "") {
      moneyRunOutStr = "When savings runs out in " + year +
                     ", " + name1 + " will be " + age1;
    } else {
      moneyRunOutStr = "When savings runs out in " + year +
                     ", " + name2 + " will be " + age1;
    }
    document.getElementById("moneyRunOutInfo").innerHTML = moneyRunOutStr;
    }
  else {
    if (showDollars == "beginYear") {
      qualifierStr = "  (in " + startYear + " dollars)"
    } else {
      qualifierStr = "  (in " + retire.endYear + " dollars)"
    }
    document.getElementById("moneyRunOutInfo").innerHTML =
             "In " + retire.endYear + ", total savings will be $" + 
             (savings + tradIRA401KSavings).toFixed(2) + qualifierStr;
  }

  // plot retirement data
  retire.plotIncome("income", computedEmploymentIncome,
                      computedTradIRA401KIncome, computedSSPensionIncome,
                      computedInvestmentIncome, computedTotalIncome);
  retire.plotExpenses("expenses", computedBasicExpenses, computedTaxes,
                      computedHealthcare, computedTotalExpenses);
  retire.plotSavings("savings", computedTotalSavings, computedSavings, 
                      computedTradIRA401KSavings,
                      computedIncomeMinusExpenses);
  retire.plotInflation("inflation", computedInflation);

  // finish and generate table
  table += "</tbody>";
  table += "</table>";
  document.getElementById("outputTable").innerHTML = table;

  return;
}


//------------------------------------------------------------------------------
// plot XXXXXXXXXXXXXXXXXXXXXXXx

this.plotIncome = function(canvasName, computedEmploymentIncome,
                           computedTradIRA401KIncome,
                           computedSSPensionIncome,
                           computedInvestmentIncome, computedTotalIncome) {
  var canvas = {};
  var ctx = {};
  var dataB = [];
  var plot = {};
  var temp = 0.0;
  var xMin = 0.0;
  var xMax = 0.0;
  var yMax = 0.0;
  var idx = 0;

  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth * 0.45;

  // set up and create the plot
  plot = createPlotObject();

  xMin = retire.startYear.value;
  xMax = retire.endYear;
  yMax = 100.0;
  for (idx = 0; idx < computedTotalIncome.length; idx++) {
    if (computedTotalIncome[idx][1] > yMax) {
      yMax = computedTotalIncome[idx][1];
    }
  }
  // increase the Y range by 10%, then round to nearest thousands
  yMax *= 1.10;
  yMax /= 1000.0;
  yMax = parseInt(yMax) * 1000.0;

  plot.title = "Income";
  plot.xMin =  xMin;
  plot.xMax = xMax;
  plot.yMin =  0.0;
  plot.yMax =  yMax;

  plot.xLabel = "year";
  plot.yLabel = "amount ($)"
  plot.yRotate = 0;

  plot.xMajor = 10.0;
  plot.xMinor = 0.0;
  plot.xGridWidthPx = 1;
  plot.xAxisWidthPx = 0;
  plot.xPrecision = 0;

  plot.yMajor = parseInt(yMax / 10000.0) * 1000.0;
  plot.yMinor = 0.0;
  plot.yGridWidthPx = 1;
  plot.yAxisWidthPx = 0;
  plot.yPrecision = 0;

  plot.font = "16px Arial";

  createPlot(ctx, plot);

  plotLinearData(ctx, plot, "employmentIncome", computedEmploymentIncome, 
                 "solid", "openCircle", "darkGreen", 4, 1);
  plotLinearData(ctx, plot, "tradIRA401KIncome", computedTradIRA401KIncome, 
                 "solid", "openCircle", "teal", 4, 1);
  plotLinearData(ctx, plot, "SSPensionIncome", computedSSPensionIncome, 
                 "solid", "openCircle", "blue", 4, 1);
  plotLinearData(ctx, plot, "investmentIncome", computedInvestmentIncome, 
                 "solid", "openCircle", "purple", 4, 1);
  plotLinearData(ctx, plot, "totalIncome", computedTotalIncome, 
                 "solid", "openCircle", "black", 4, 1);

  plot.legend = [
                 ["totalIncome",       "total income"],
                 ["investmentIncome",  "investments"],
                 ["SSPensionIncome",   "SS/pension"],
                 ["employmentIncome",  "employment"],
                 ["tradIRA401KIncome", "IRA / 401K"]
                ];
  // plot.legendPosition = [(xMax-xMin) * 0.02 + xMin, yMax * 0.66];
  plot.legendPosition = [(xMax-xMin) * 0.70 + xMin, yMax * 1.10];
  plot.legendBorderPdx = 0;

  plotUpdate(ctx, plot, [], []);

  return;
}

//------------------------------------------------------------------------------
// plot XXXXXXXXXXXXXXXXXXXXXXXx

this.plotExpenses = function(canvasName, computedBasicExpenses, computedTaxes,
                             computedHealthcare, computedTotalExpenses) {
  var canvas = {};
  var ctx = {};
  var dataB = [];
  var plot = {};
  var temp = 0.0;
  var xMin = 0.0;
  var xMax = 0.0;
  var yMax = 0.0;
  var idx = 0;

  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth * 0.45;

  // set up and create the plot
  plot = createPlotObject();

  xMin = retire.startYear.value;
  xMax = retire.endYear;
  yMax = 100.0;
  for (idx = 0; idx < computedTotalExpenses.length; idx++) {
    if (computedTotalExpenses[idx][1] > yMax) {
      yMax = computedTotalExpenses[idx][1];
    }
  }
  // increase the Y range by 10%, then round to nearest thousands
  yMax *= 1.10;
  yMax /= 1000.0;
  yMax = parseInt(yMax) * 1000.0;

  plot.title = "Expenses";
  plot.font = "16px Arial";

  plot.xMin =  xMin;
  plot.xMax = xMax;
  plot.yMin =  0.0;
  plot.yMax =  yMax;

  plot.xLabel = "year";
  plot.yLabel = "amount ($)"
  plot.yRotate = 0;

  plot.xMajor = 10.0;
  plot.xMinor = 0.0;
  plot.xGridWidthPx = 1;
  plot.xAxisWidthPx = 0;
  plot.xPrecision = 0;

  plot.yMajor = parseInt(yMax / 10000.0) * 1000.0;
  plot.yMinor = 0.0;
  plot.yGridWidthPx = 1;
  plot.yAxisWidthPx = 0;
  plot.yPrecision = 0;

  createPlot(ctx, plot);

  plotLinearData(ctx, plot, "basicExpenses", computedBasicExpenses, "solid", 
                 "openCircle", "orange", 4, 1);
  plotLinearData(ctx, plot, "taxes", computedTaxes, "solid", 
                 "openCircle", "blue", 4, 1);
  plotLinearData(ctx, plot, "healthcare", computedHealthcare, "solid", 
                 "openCircle", "green", 4, 1);
  plotLinearData(ctx, plot, "totalExpenses", computedTotalExpenses, "solid", 
                 "openCircle", "red", 4, 1);

  plot.legend = [
                  ["totalExpenses", "total expenses"],
                  ["basicExpenses", "basic expenses"],
                  ["healthcare", "healthcare"],
                  ["taxes", "taxes"]
                ];
  // plot.legendPosition = [(xMax-xMin) * 0.02 + xMin, yMax * 1.1];
  plot.legendPosition = [(xMax-xMin) * 0.65 + xMin, yMax * 1.10];
  plot.legendBorderPdx = 0;

  plotUpdate(ctx, plot, [], []);

  return;
}

//------------------------------------------------------------------------------
// plot XXXXXXXXXXXXXXXXXXXXXXXx

this.plotSavings = function(canvasName, computedTotalSavings, computedSavings, 
                            computedTradIRA401KSavings,
                            computedIncomeMinusExpenses) {
  var canvas = {};
  var ctx = {};
  var dataB = [];
  var plot = {};
  var temp = 0.0;
  var yMin = 0.0;
  var xMin = 0.0;
  var xMax = 0.0;
  var yMax = 0.0;
  var idx = 0;

  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth * 0.45;

  // set up and create the plot
  plot = createPlotObject();

  xMin = retire.startYear.value;
  xMax = retire.endYear;
  yMax = 100.0;
  yMin = 0.0;
  for (idx = 0; idx < computedTotalSavings.length; idx++) {
    if (computedTotalSavings[idx][1] > yMax) {
      yMax = computedTotalSavings[idx][1];
    }
    if (computedIncomeMinusExpenses[idx][1] > yMax) {
      yMax = computedIncomeMinusExpenses[idx][1];
    }
    if (computedIncomeMinusExpenses[idx][1] < yMin) {
      yMin = computedIncomeMinusExpenses[idx][1];
    }
  }
  // increase the Y range by 10%, then round to nearest thousands
  yMax *= 1.10;
  yMax /= 1000.0;
  yMax = parseInt(yMax) * 1000.0;

  yMin *= 1.10;
  yMin /= 1000.0;
  yMin = parseInt(yMin) * 1000.0;

  plot.title = "Savings";
  plot.font = "16px Arial";

  plot.xMin =  xMin;
  plot.xMax =  xMax;
  plot.yMin =  yMin;
  plot.yMax =  yMax;

  plot.xLabel = "year";
  plot.yLabel = "amount ($)"
  plot.yRotate = 0;

  plot.xMajor = 10.0;
  plot.xMinor = 0.0;
  plot.xGridWidthPx = 1;
  plot.xAxisWidthPx = 1;
  plot.xAxisColor = "red";
  plot.xPrecision = 0;

  plot.yMajor = parseInt(yMax / 10000.0) * 1000.0;
  plot.yMinor = 0.0;
  plot.yGridWidthPx = 1;
  plot.yAxisWidthPx = 0;
  plot.yPrecision = 0;

  createPlot(ctx, plot);

  plotLinearData(ctx, plot, "totalSavings", computedTotalSavings, "solid", 
                 "openCircle", "black", 4, 1);

  plotLinearData(ctx, plot, "savings", computedSavings, "solid", 
                 "openCircle", "darkGreen", 4, 1);

  plotLinearData(ctx, plot, "tradIRA401KSavings", computedTradIRA401KSavings, 
                 "solid", "openCircle", "teal", 4, 1);

  plotLinearData(ctx, plot, "incomeMinusExpenses", 
                 computedIncomeMinusExpenses, "solid", 
                 "openCircle", "blue", 4, 1);

  plot.legend = [
                  ["totalSavings", "total savings"],
                  ["savings", "non-IRA savings"],
                  ["tradIRA401KSavings", "IRA / 401K savings"],
                  ["incomeMinusExpenses", "income - expenses"]
                ];
  plot.legendPosition = [(xMax-xMin) * 0.50 + xMin, yMax * 1.10];
  plot.legendBorderPdx = 0;

  plotUpdate(ctx, plot, [], []);

  return;
}

//------------------------------------------------------------------------------
// plot XXXXXXXXXXXXXXXXXXXXXXXx

this.plotInflation = function(canvasName, computedInflation) {
  var canvas = {};
  var ctx = {};
  var dataB = [];
  var plot = {};
  var temp = 0.0;
  var xMin = 0.0;
  var xMax = 0.0;
  var yMax = 0.0;
  var idx = 0;

  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth * 0.45;

  // set up and create the plot
  plot = createPlotObject();

  xMin = retire.startYear.value;
  xMax = retire.endYear;
  yMax = 1.0;
  for (idx = 0; idx < computedInflation.length; idx++) {
    if (computedInflation[idx][1] > yMax) {
      yMax = computedInflation[idx][1];
    }
  }
  // increase the Y range by 10%, then round to nearest one
  yMax *= 1.10;
  yMax = parseInt(yMax);

  plot.title = "Inflation-Adjusted Dollar";
  plot.font = "16px Arial";

  plot.xMin =  xMin;
  plot.xMax = xMax;
  plot.yMin =  0.0;
  plot.yMax =  yMax;

  plot.xLabel = "year";
  plot.yLabel = "amount ($)"
  plot.yRotate = 0;

  plot.xMajor = 10.0;
  plot.xMinor = 0.0;
  plot.xGridWidthPx = 1;
  plot.xAxisWidthPx = 0;
  plot.xPrecision = 0;

  plot.yMajor = 0.10;
  plot.yMinor = 0.0;
  plot.yGridWidthPx = 1;
  plot.yAxisWidthPx = 0;
  plot.yPrecision = 2;

  createPlot(ctx, plot);

  plotLinearData(ctx, plot, "inflation", computedInflation, "solid", 
                 "openCircle", "black", 4, 1);

  plotUpdate(ctx, plot, [], []);

  return;
}

this.showOrHideTextFunction = function(name) {
  var nameValue = "";
  var nameinfo = [];
  var divIdx = 0;

  if (name == "name1") {
    nameinfo = document.getElementsByClassName("NAME1INFO");
  } else {
    nameinfo = document.getElementsByClassName("NAME2INFO");
  }

  nameValue = retire[name].value;
  if (nameValue != "") {
    for (divIdx = 0; divIdx < nameinfo.length; divIdx++) {
      nameinfo[divIdx].style.display = "block";
    }
  } else {
    for (divIdx = 0; divIdx < nameinfo.length; divIdx++) {
      nameinfo[divIdx].style.display = "none";
    }
  }
  return;
}

// close the "namespace" and call the function to construct it.
}
retire._construct();
