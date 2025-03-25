// plotLibrary.js : library of functions for plotting 2D data
//
// Copyright (C) 2021  John-Paul Hosom
//
//  This file plotLibrary.js is free software: you can redistribute it and/or
//  modify it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
//  This code may NOT be used by automated processes such as large
//  language models without my explicit and written consent.
//
// Contact information: alchemyoverlord © yahoo · com
//
// See the 'testPlotLibrary' function below for an example of how this plotting
// library can be used.
//
// Version 1.0.1 : January 9, 2021   (JPH)
//                 Initial version.
//


"use strict";

// specification of different line styles:
// index: 0 = solid, 1 = dashed, 2 = small dash, 3 = dotted, 4 = dot-dash
var lineStyleList = [ [0], [8, 4], [4, 3], [2, 2], [6, 3, 1, 3] ];

//==============================================================================
// "PUBLIC" FUNCTIONS:

//------------------------------------------------------------------------------
// createPlotObject(): create a plot object with all default values
// note: x2function and y2funtion define functions to compute
//       alternate values for the X and Y axis, respectively.
//       For example, the plot might show units in both 'F and 'C.
//       if y2function is "", then the plot will be shifted as if there
//       was a set of alternate values, but none will be plotted.  This
//       is useful in order to get a sequence of plots to line up,
//       where some have alternate values and others do not.

function createPlotObject() {
  var plot = { xMin: 0.0, xMax: 10.0, xMinor: undefined, xMajor: undefined,
               xPrecision: 1, xLabel: "X axis",
               xAxisWidthPx: 1, xAxisColor: "rgb(0,0,0,0.4)",
               xGridWidthPx: 1, xGridColor: "rgb(32,32,32,0.25)",
               yMin: 0.0, yMax: 10.0, yMinor: undefined, yMajor: undefined,
               yPrecision: 1, yLabel: "Y axis", yRotate: 1,
               yAxisWidthPx: 1, yAxisColor: "rgb(0,0,0,0.4)",
               yGridWidthPx: 1, yGridColor: "rgb(32,32,32,0.25)",
               defaultColor: "black", font: "16px Arial",
               title: "Figure 1.", paddingPx: 6,
               lowerLeftBoundsWidthPx: 1, upperRightBoundsWidthPx: 0,
               canvasColor: "white", plotAreaColor: "white",
               legend: [], legendPosition: [0.0, 10.0], legendBorderPx: 0,
               x2function: undefined, x2Precision: 1, x2Label: "",
               y2function: undefined, y2Precision: 1,
               data: []};
  return plot;
}

//------------------------------------------------------------------------------
// mapX(): map from graph X coordinate to pixels

function mapX(plot, x) {
  var xPercent = 0.0;
  var xPx = 0.0;

  if (x == undefined) {
    return undefined;
  }
  xPercent = (x - plot.xMin) / (plot.xMax - plot.xMin);
  xPx = (xPercent * plot.widthPx) + plot.widthOffsetPx + 0.5;

  return xPx;
}

//------------------------------------------------------------------------------
// mapY(): map from graph Y coordinate to pixels

function mapY(plot, y) {
  var yPercent = 0.0;
  var yPx = 0.0;

  if (y == undefined) {
    return undefined;
  }
  yPercent = (y - plot.yMin) / (plot.yMax - plot.yMin);
  yPx = plot.heightOffsetPx + plot.heightPx -
                 (yPercent * plot.heightPx + 0.5);

  return yPx;
}

//------------------------------------------------------------------------------
// createPlot(): create a plot on canvas context 'ctx' using parameters
// specified in 'plot'.
//
// sample API, showing valid 'plot' parameters and example values:
//   plot.xMin = -4.0;
//   plot.xMax = 40.0;
//   plot.xMinor = 3.0;
//   plot.xMajor = 10.0;
//   plot.xPrecision = 2;
//   plot.xLabel = "X axis";
//
//   plot.xAxisWidthPx = 1;
//   plot.xAxisColor = "rgb(0,0,0,0.8)";
//   plot.xGridWidthPx = 1;
//   plot.xGridColor = "rgb(32,32,32,0.25)";
//
//   plot.yMin = -1.10;
//   plot.yMax = 1.10;
//   plot.yMinor = 0.20;
//   plot.yMajor = 0.5;
//   plot.yPrecision = 2;
//   plot.yLabel = "Y axis";
//   plot.yRotate = 1;
//
//   plot.yAxisWidthPx = 1;
//   plot.yAxisColor = "rgb(0,0,0,0.8)";
//   plot.yGridWidthPx = 1;
//   plot.yGridColor = "rgb(32,32,32,0.25)";
//
//   plot.font = "16px Arial";
//   plot.title = "Figure 1. This is a plot.";
//   plot.paddingPx = 8;
//   plot.lowerLeftBoundsWidthPx = 1;
//   plot.upperRightBoundsWidthPx = 0;
//   plot.canvasColor = "white";
//   plot.plotAreaColor = "white";
//   plot.legend = [["name1", "this is dataset 1"],
//                  ["name2", "this is dataset 2"]]
//   plot.legendPosition = [20.0, 0.4]
//   plot.legendBorderPx = 1;
//

function createPlot(ctx, plot) {
  var extraPaddingPx = 0;
  var paddingPx = 0;
  var plotSize = 0.0;
  var textWidthPx = 0;
  var x = 0.0;
  var xStr = "";
  var y = 0.0;
  var yStr = "";

  if (plot.xMinor == undefined) {
    plot.xMinor = (plot.xMax - plot.xMin) / 10.0;
  }
  if (plot.xMajor == undefined) {
    plot.xMajor = (plot.xMax - plot.xMin) / 5.0;
  }
  if (plot.yMinor == undefined) {
    plot.yMinor = (plot.yMax - plot.yMin) / 10.0;
  }
  if (plot.yMajor == undefined) {
    plot.yMajor = (plot.yMax - plot.yMin) / 5.0;
  }

  paddingPx = plot.paddingPx;

  // compute tic size (based on overall plot size)
  plotSize = Math.sqrt(ctx.canvas.width * ctx.canvas.height);
  // plot.ticSizePx = plotSize / 70;
  plot.ticSizePx = ctx.canvas.width / 100;
  if (plot.ticSizePx < 4) plot.ticSizePx = 4;
  if (plot.ticSizePx > 8) plot.ticSizePx = 8;
  // if (plot.ticSizePx > 12) plot.ticSizePx = 12;

  // get font height from font specification string
  ctx.font = plot.font;
  plot.fontHeightPx = parseInt(ctx.font.match(/\d+/));

  // compute extra padding to make sure axis label numbers are not cut off
  xStr = plot.xMax.toFixed(plot.xPrecision);
  textWidthPx = ctx.measureText(xStr).width;
  extraPaddingPx = textWidthPx / 2 - paddingPx + 0.5;
  if (plot.yRotate) {
    yStr = plot.yMax.toFixed(plot.yPrecision);
    textWidthPx = ctx.measureText(yStr).width;
    if (textWidthPx / 2 - paddingPx > extraPaddingPx) {
      extraPaddingPx = textWidthPx / 2 - paddingPx + 0.5;
    }
  }

  // compute width and height of plotting area, in pixels
  plot.widthOffsetPx = paddingPx;  // left-most padding
  if (plot.yLabel && plot.yLabel.length > 0) {
    plot.widthOffsetPx += plot.fontHeightPx + paddingPx;
  }
  if (!plot.yRotate) {
    yStr = plot.yMax.toFixed(plot.yPrecision);
    plot.widthOffsetPx += ctx.measureText(yStr).width - 5;
  }
  if (plot.yMajor > 0) {
    plot.widthOffsetPx += plot.fontHeightPx + plot.ticSizePx;
  }
  if (plot.y2function != undefined) {
    plot.widthOffsetPx += plot.fontHeightPx + paddingPx;
  }
  plot.widthPx = ctx.canvas.width - plot.widthOffsetPx -
                 (paddingPx + extraPaddingPx);

  plot.heightOffsetPx = extraPaddingPx + paddingPx;  // top-most padding
  plot.heightPx = ctx.canvas.height - plot.heightOffsetPx;
  if (plot.xMajor > 0) {
    plot.heightPx -= plot.ticSizePx + plot.fontHeightPx + paddingPx;
  }
  if (plot.x2function != undefined) {
    plot.heightPx -= plot.fontHeightPx + paddingPx;
  }
  if (plot.xLabel && plot.xLabel.length > 0) {
    plot.heightPx -= plot.fontHeightPx + paddingPx;
  }
  if (plot.x2Label && plot.x2Label.length > 0) {
    plot.heightPx -= plot.fontHeightPx + paddingPx;
  }
  if (plot.title && plot.title.length > 0) {
    plot.heightPx -= plot.fontHeightPx + paddingPx;
  }

  // set the color of the canvas
  ctx.fillStyle = plot.canvasColor;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // construct the plot background within the plotting area
  constructInnerPlotBackground(ctx, plot, true, true, true);

  // plot x-axis minor tic marks outside of plot area
  if (plot.xMinor > 0) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = plot.defaultColor;
    ctx.beginPath();
    for (x = 0; x <= plot.xMax; x += plot.xMinor) {
      if (x < plot.xMin) {
        continue;
      }
      ctx.moveTo(mapX(plot, x), mapY(plot, plot.yMin)+1);
      ctx.lineTo(mapX(plot, x), mapY(plot, plot.yMin)+(plot.ticSizePx*0.5)+1);
    }
    for (x = 0; x >= plot.xMin; x -= plot.xMinor) {
      if (x >= plot.xMax) {
        continue;
      }
      ctx.moveTo(mapX(plot, x), mapY(plot, plot.yMin)+1);
      ctx.lineTo(mapX(plot, x), mapY(plot, plot.yMin)+(plot.ticSizePx*0.5)+1);
    }
    ctx.stroke();
  }

  // plot y-axis minor tic marks outside of plot area
  if (plot.yMinor > 0) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = plot.defaultColor;
    ctx.beginPath();
    for (y = 0; y <= plot.yMax; y += plot.yMinor) {
      if (y < plot.yMin) {
        continue;
      }
      ctx.moveTo(mapX(plot, plot.xMin)-1, mapY(plot, y));
      ctx.lineTo(mapX(plot, plot.xMin)-(plot.ticSizePx*0.5)-1, mapY(plot, y));
    }
    for (y = 0; y >= plot.yMin; y -= plot.yMinor) {
      if (y >= plot.yMax) {
        continue;
      }
      ctx.moveTo(mapX(plot, plot.xMin)-1, mapY(plot, y));
      ctx.lineTo(mapX(plot, plot.xMin)-(plot.ticSizePx*0.5)-1, mapY(plot, y));
    }
    ctx.stroke();
  }

  // plot X-axis label
  ctx.strokeStyle = plot.defaultColor;
  if (plot.xLabel && plot.xLabel.length > 0) {
    textWidthPx = ctx.measureText(plot.xLabel).width;
    x = plot.widthOffsetPx + (plot.widthPx/2) - textWidthPx/2;
    y = plot.heightOffsetPx + plot.heightPx + plot.fontHeightPx;
    if (plot.xMajor > 0) {
      y += plot.ticSizePx + plot.fontHeightPx + paddingPx/2;
    }
    if (plot.x2function != undefined) {
      y += plot.fontHeightPx + paddingPx;
    }
    ctx.fillText(plot.xLabel, x, y);
  }

  // if needed, plot secondary X-axis label
  ctx.strokeStyle = plot.defaultColor;
  if (plot.x2Label && plot.x2Label.length > 0) {
    textWidthPx = ctx.measureText(plot.x2Label).width;
    x = plot.widthOffsetPx + (plot.widthPx/2) - textWidthPx/2;
    y += plot.fontHeightPx;
    ctx.fillText(plot.x2Label, x, y);
  }

  // plot Y-axis label
  if (plot.yLabel && plot.yLabel.length > 0) {
    textWidthPx = ctx.measureText(plot.yLabel).width;
    x = plot.fontHeightPx;
    y = plot.heightPx/2 + (textWidthPx/2) + paddingPx + extraPaddingPx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI/2.0);
    ctx.fillText(plot.yLabel, 0, 0);
    ctx.restore();  // revert to pre-rotated axes
  }

  // plot title
  if (plot.title && plot.title.length > 0) {
    textWidthPx = ctx.measureText(plot.title).width;
    x = plot.widthOffsetPx + (plot.widthPx/2) - textWidthPx/2;
    y = ctx.canvas.height - paddingPx;
    ctx.fillText(plot.title, x, y);
  }

  return;
}

//------------------------------------------------------------------------------
// plotLinearData() : plot a set of data using lines and/or symbols
//
// name:
//   - user-assigned name for this set of data
//
// data:
//   - array of 2-dimensional values, X and Y
//     e.g. data[0][0] = first data point, X value
//     e.g. data[0][1] = first data point, Y value
//     e.g. data[1][0] = second data point, X value
//     e.g. data[1][1] = second data point, Y value
//
// lineStyle:
//   - none
//   - solid
//   - dashed or dash
//   - small-dash or smalldash
//   - dotted or dot
//   - dot-dash or dotdash
//
// symbol:
//   - none
//   - openCircle
//   - filledCircle
//   - openSquare
//   - filledSquare
//   - openTriangle
//   - filledTriangle
//   - openNabla
//   - filledNabla
//   - openDiamond
//   - filledDiamond
//   - X or x
//   - plus or +
//   - asterix
//

function plotLinearData(ctx, plot, name, data, lineStyle = "solid",
                        symbol = "openCircle", color = "black",
                        symbolSizePx = 8, lineWidthPx = 1) {
  var dataIdx = 0;
  var dIdx = 0;
  var lineStyleIdx = 0;

  lineStyleIdx = getLineStyleIndex(lineStyle);
  if (symbol == "") {
    symbol = "none";
  }

  // find (and replace) existing data, or create new data for this plot
  dataIdx = -1;
  for (dIdx = 0; dIdx < plot.data.length; dIdx++) {
    if (plot.data[dIdx].name == name) {
      dataIdx = dIdx;
      break;
    }
  }
  if (dIdx >= plot.data.length) {
    dataIdx = plot.data.length;
    var newData = new Object;
    newData.name = name;
    newData.type = "linear";
    newData.points = [];
    plot.data.push(newData);
  }

  // set line and symbol information for this set of data
  plot.data[dataIdx].lineStyleIdx = lineStyleIdx;
  plot.data[dataIdx].symbol       = symbol;
  plot.data[dataIdx].color        = color;
  plot.data[dataIdx].symbolSizePx = symbolSizePx;
  plot.data[dataIdx].lineWidthPx  = lineWidthPx;

  // save the data as an array of pixel values; don't save redundant values
  saveDataAsPixels(data, plot, dataIdx);

  // plot this set of data
  internalPlotLinearData(ctx, plot, dataIdx);

  return;
}

//------------------------------------------------------------------------------
// plotFunction(): plot an arbitrary function on the graph
//
// name:
//   - user-assigned name for this set of data
//
// functionName:
//   - name of function to be plotted, with single argument 'x'
//     e.g. 3.0*cos(2.0*x) + 1.0
//

function plotFunction(ctx, plot, name, functionName,
                      color = "black", lineWidthPx = 1, ...rest) {
  var dataIdx = 0;
  var dIdx = 0;
  var maxYPx = 0;
  var minYPx = 0;
  var prevXPx = 0;
  var prevYPx = 0;
  var x = 0.0;
  var xPx = 0;
  var y = 0.0;
  var yPx = 0;

  // find (and replace) existing data, or create new data for this plot
  dataIdx = -1;
  for (dIdx = 0; dIdx < plot.data.length; dIdx++) {
    if (plot.data[dIdx].name == name) {
      dataIdx = dIdx;
      break;
    }
  }
  if (dIdx >= plot.data.length) {
    dataIdx = plot.data.length;
    var newData = new Object;
    newData.name = name;
    newData.type = "linear";
    newData.points = [];
    plot.data.push(newData);
  }

  // set line and symbol information for this set of data
  plot.data[dataIdx].lineStyleIdx = 0;
  plot.data[dataIdx].symbol       = "none";
  plot.data[dataIdx].color        = color;
  plot.data[dataIdx].symbolSizePx = 0;
  plot.data[dataIdx].lineWidthPx  = lineWidthPx;

  // save the data as an array of pixel values; don't save redundant values
  plot.data[dataIdx].points = [];
  prevXPx = undefined;
  prevYPx = undefined;
  minYPx = mapY(plot, plot.yMax);
  maxYPx = mapY(plot, plot.yMin);
  for (xPx = 0; xPx < plot.widthPx+1; xPx++) {
    // get coordinates of point, get function of x, map function to pixels
    x = unmapX(plot, xPx);
    y = functionName(x, rest);
    yPx = mapY(plot, y);
    // console.log("(" + xPx + "->" + x + ", fun(x)=" + y + " -> " + yPx);
    plot.data[dataIdx].points.push([xPx + plot.widthOffsetPx, yPx]);
    prevXPx = xPx;
    prevYPx = yPx;
  }

  // plot this set of data
  internalPlotLinearData(ctx, plot, dataIdx);

  return;
}

//------------------------------------------------------------------------------
// plotBarData(): plot data as a set of bars on the graph
//
// name:
//   - user-assigned name for this set of data
//
// data:
//   - array of 2-dimensional values containing X1, X2, Y1, and Y2
//     e.g. data[0][0] = first data point, first X value
//     e.g. data[0][1] = first data point, second X value
//     e.g. data[0][2] = first data point, first Y value
//     e.g. data[0][3] = first data point, second Y value
//     e.g. data[1][0] = second data point, first X value
//     e.g. data[1][1] = second data point, second X value
//     e.g. data[1][2] = second data point, first Y value
//     e.g. data[1][3] = second data point, second Y value
//
// fillColor:
//   - the color (and possibly transparancy) of the area within the bar
//     or 'none' if no color
//
// fillPattern:
//   - an object with 5 values:
//        spacing    = number of pixels between each line in the fill pattern
//        angleUp    = true/false for positive-slope hatching
//        angleDown  = true/false for negative-slope hatching
//        horizontal = true/false for horizontal lines
//        vertical   = true/false for vertical lines
//
// borderLineStyle:
//   - none
//   - solid
//   - dashed or dash
//   - small-dash or smalldash
//   - dotted or dot
//   - dot-dash or dotdash
//

function plotBarData(ctx, plot, name, data, fillColor = "rgb(32,32,32,0.25)",
                     fillPattern = {spacing:4, angleUp:1, angleDown:0,
                     horizontal:0, vertical:0}, lineColor = "black",
                     borderLineStyle = "solid", lineWidthPx = 1) {
  var dataIdx = 0;
  var dIdx = 0;
  var lineStyleIdx = 0;

  lineStyleIdx = getLineStyleIndex(borderLineStyle);

  // find (and replace) existing data, or create new data for this plot
  dataIdx = -1;
  for (dIdx = 0; dIdx < plot.data.length; dIdx++) {
    if (plot.data[dIdx].name == name) {
      dataIdx = dIdx;
      break;
    }
  }
  if (dIdx >= plot.data.length) {
    dataIdx = plot.data.length;
    var newData = new Object;
    newData.name = name;
    newData.type = "bar";
    newData.points = [];
    plot.data.push(newData);
  }

  // set line and symbol information for this set of data
  plot.data[dataIdx].fillColor    = fillColor;
  plot.data[dataIdx].fillPattern  = fillPattern;
  plot.data[dataIdx].lineStyleIdx = lineStyleIdx;
  plot.data[dataIdx].lineColor    = lineColor;
  plot.data[dataIdx].lineWidthPx  = lineWidthPx;

  // save the data as an array of pixel values; don't save redundant values
  saveDataAsPixels(data, plot, dataIdx);

  // plot this set of data
  internalPlotBarData(ctx, plot, dataIdx);

  return;
}

//------------------------------------------------------------------------------
// plotAreaData(): plot an area using data points and fill it in
//
// name:
//   - user-assigned name for this set of data
//
// data:
//   - array of 2-dimensional values, X and Y
//     e.g. data[0][0] = first data point, X value
//     e.g. data[0][1] = first data point, Y value
//     e.g. data[1][0] = second data point, X value
//     e.g. data[1][1] = second data point, Y value
//
// fillColor:
//   - the color (and possibly transparancy) of the area within the bar
//
// borderLineStyle:
//   - none
//   - solid
//   - dashed or dash
//   - small-dash or smalldash
//   - dotted or dot
//   - dot-dash or dotdash
//

function plotAreaData(ctx, plot, name, data, fillColor= "rgb(32,32,32,0.25)",
                     lineColor = "black", borderLineStyle = "solid",
                     lineWidthPx = 1) {
  var dataIdx = 0;
  var dIdx = 0;
  var lIdx = 0;
  var lineStyleIdx = 0;
  var xlPx = 0;
  var ylPx = 0;
  var x0Px = 0;
  var y0Px = 0;

  lineStyleIdx = getLineStyleIndex(borderLineStyle);

  // find (and replace) existing data, or create new data for this plot
  dataIdx = -1;
  for (dIdx = 0; dIdx < plot.data.length; dIdx++) {
    if (plot.data[dIdx].name == name) {
      dataIdx = dIdx;
      break;
    }
  }
  if (dIdx >= plot.data.length) {
    dataIdx = plot.data.length;
    var newData = new Object;
    newData.name = name;
    newData.type = "area";
    newData.points = [];
    plot.data.push(newData);
  }

  // set line and symbol information for this set of data
  plot.data[dataIdx].fillColor    = fillColor;
  plot.data[dataIdx].fillPattern  = {};
  plot.data[dataIdx].lineStyleIdx = lineStyleIdx;
  plot.data[dataIdx].lineColor    = lineColor;
  plot.data[dataIdx].lineWidthPx  = lineWidthPx;

  if (lineWidthPx <= 0) {
    plot.data[dataIdx].lineStyleIdx = 0;
  }

  // save the data as an array of pixel values; don't save redundant values
  saveDataAsPixels(data, plot, dataIdx);

  // make sure that last point equals first point
  x0Px = plot.data[dataIdx].points[0][0];
  y0Px = plot.data[dataIdx].points[0][1];
  lIdx = plot.data[dataIdx].points.length - 1;
  xlPx = plot.data[dataIdx].points[lIdx][0];
  ylPx = plot.data[dataIdx].points[lIdx][1];
  if (x0Px != xlPx || y0Px != ylPx) {
    plot.data[dataIdx].points.push([x0Px, y0Px]);
  }

  // plot this set of data
  internalPlotAreaData(ctx, plot, dataIdx);

  return;
}

//------------------------------------------------------------------------------
// plotUpdate(): update the plot with one or more sets of data
//
// Clear and re-build the area inside the graph.  Then plot new data.
// Then re-plot any data that isn't new.
//

function plotUpdate(ctx, plot, nameArray, dataArray, fromScratch=false) {
  var dataIdx = 0;
  var foundIdx = 0;
  var idx = 0;
  var newDataIdxList = [];

  // check for errors or trivial conditions
  if (nameArray.length != dataArray.length) {
    console.log("Error: plotUpdate() names and data must match");
    window.alert("Error: plotUpdate() names and data must match");
    return;
  }

  // clear and re-set the graph
  if (fromScratch) {
    createPlot(ctx, plot);
  } else {
    constructInnerPlotBackground(ctx, plot, false, true, false);
  }

  // plot new data
  newDataIdxList = [];
  for (idx = 0; idx < nameArray.length; idx++) {
    // find the dataIdx corresponding to this name
    for (dataIdx = 0; dataIdx < plot.data.length; dataIdx++) {
      if (plot.data[dataIdx].name == nameArray[idx]) {
        break;
      }
    }
    if (dataIdx >= plot.data.length) {
      console.log("Error in plotUpdate(): can't find name '" + nameArray[idx] +
                  "' in data for this plot");
      return;
    }

    // add this index to list of new data
    newDataIdxList.push(dataIdx);

    // map the new data to pixels
    saveDataAsPixels(dataArray[idx], plot, dataIdx);

    // plot the new data
    if (plot.data[dataIdx].type == "linear") {
      internalPlotLinearData(ctx, plot, dataIdx);
    } else if (plot.data[dataIdx].type == "bar") {
      internalPlotBarData(ctx, plot, dataIdx);
    } else if (plot.data[dataIdx].type == "area") {
      internalPlotAreaData(ctx, plot, dataIdx);
    }
  }

  // re-plot data that isn't new
  for (idx = 0; idx < plot.data.length; idx++) {
    foundIdx = newDataIdxList.find(element => element == idx);
    if (foundIdx == undefined) {
      if (plot.data[idx].type == "linear") {
        internalPlotLinearData(ctx, plot, idx);
      } else if (plot.data[idx].type == "bar") {
        internalPlotBarData(ctx, plot, idx);
      } else if (plot.data[idx].type == "area") {
        internalPlotAreaData(ctx, plot, idx);
      }
    }
  }

  return;
}

//------------------------------------------------------------------------------
// plotRemoveData(): remove a set of data from the plot

function plotRemoveData(ctx, plot, name) {
  var dataIdx = 0;

  // find the dataIdx corresponding to this name
  for (dataIdx = 0; dataIdx < plot.data.length; dataIdx++) {
    if (plot.data[dataIdx].name == name) {
      break;
    }
  }
  if (dataIdx >= plot.data.length) {
    return;
  }

  plotUpdate(ctx, plot, [name], [[]]);
  plot.data[dataIdx].name = "";
  plot.data[dataIdx].type = "";
  plot.data[dataIdx].data = [];

  return;
}

//------------------------------------------------------------------------------

function plotTextLeftMiddle(ctx, plot, text, x, y) {
  var valueXpx = 0.0;
  var textWidthPx = 0.0;
  var posXpx = 0.0;
  var posYpx = 0.0;
  var cIdx = 0;
  var rIdx = 0;
  var realText = "";
  var height = [];
  var offset = 0;
  var smallHeight = 0;
  var smallFont = "";

  if (0) {
    valueXpx = mapX(plot, x);
    textWidthPx = ctx.measureText(text).width;
    posXpx = valueXpx - textWidthPx - plot.paddingPx - 2;
    posYpx = mapY(plot, y) + plot.fontHeightPx/2 - 2;
    ctx.fillStyle = plot.defaultColor;
    ctx.fillText(text, posXpx, posYpx);
    // console.log(posXpx + ", " + posYpx);
    } else {
    valueXpx = mapX(plot, x);
    textWidthPx = ctx.measureText(text).width;
    realText = "";
    rIdx = 0;
    offset = 0;
    for (cIdx = 0; cIdx < text.length; cIdx++) {
      if (text.substring(cIdx).startsWith("<sub>")) {
        cIdx += 4;
        offset = plot.fontHeightPx/3 - 2;
        continue;
      }
      if (text.substring(cIdx).startsWith("</sub>")) {
        cIdx += 5;
        offset = 0;
        continue;
      }
      height[rIdx++] = offset;
      realText = realText.concat(text[cIdx]);
    }
    textWidthPx = ctx.measureText(realText).width;
    posXpx = valueXpx - textWidthPx - plot.paddingPx;
    posYpx = mapY(plot, y) + plot.fontHeightPx/2 - 2;
    smallHeight = (plot.fontHeightPx * 0.85).toFixed(1);
    smallFont = "italic " + plot.font.replace(plot.fontHeightPx, smallHeight);
    for (cIdx = 0; cIdx < realText.length; cIdx++) {
      if (height[cIdx] == 0) {
        ctx.font = "italic " + plot.font;
      } else {
        ctx.font = smallFont;
      }
      ctx.fillText(realText[cIdx], posXpx, posYpx+height[cIdx]);
      posXpx += ctx.measureText(realText[cIdx]).width;
    }
    ctx.font = plot.font;
  }
  return;
}

//------------------------------------------------------------------------------

function plotTextMiddleTop(ctx, plot, text, x, y, style, size="normal") {
  var valueXpx = 0.0;
  var textWidthPx = 0.0;
  var posXpx = 0.0;
  var posYpx = 0.0;
  var cIdx = 0;
  var rIdx = 0;
  var realText = "";
  var height = [];
  var offset = 0;
  var smallHeight = 0;
  var smallFont = "";

  valueXpx = mapX(plot, x);
  textWidthPx = ctx.measureText(text).width;
  realText = "";
  rIdx = 0;
  offset = 0;
  for (cIdx = 0; cIdx < text.length; cIdx++) {
    if (text.substring(cIdx).startsWith("<sub>")) {
      cIdx += 4;
      offset = plot.fontHeightPx/3 - 2;
      continue;
    }
    if (text.substring(cIdx).startsWith("</sub>")) {
      cIdx += 5;
      offset = 0;
      continue;
    }
    height[rIdx++] = offset;
    realText = realText.concat(text[cIdx]);
  }
  textWidthPx = ctx.measureText(realText).width;
  posXpx = valueXpx - textWidthPx/2;
  posYpx = mapY(plot, y);
  smallHeight = (plot.fontHeightPx * 0.85).toFixed(1);
  if (style.length > 0) style = style + " ";
  smallFont = style + plot.font.replace(plot.fontHeightPx, smallHeight);
  for (cIdx = 0; cIdx < realText.length; cIdx++) {
    if (height[cIdx] == 0 && size != "small") {
      ctx.font = style + plot.font;
    } else {
      ctx.font = smallFont;
    }
    ctx.fillText(realText[cIdx], posXpx, posYpx+height[cIdx]);
    posXpx += ctx.measureText(realText[cIdx]).width;
  }
  ctx.font = plot.font;
  return [valueXpx - textWidthPx/2, posXpx];
}

//------------------------------------------------------------------------------
// testPlotLibrary(): plot various sets of data to show how this library works

function testPlotLibrary(canvasName) {
  var canvas = {};
  var ctx = {};
  var dataA = [];
  var dataB = [];
  var dataC = [];
  var dataD = [];
  var plot = {};

  canvas = document.getElementById(canvasName);
  if (canvas == null || !canvas.getContext) {
    return;
  }
  ctx = canvas.getContext("2d");

  // create the plot
  plot = createPlotObject();

  plot.xMin = -4.0;
  plot.xMax = 40.0;
  plot.yMin = -1.10;
  plot.yMax = 1.10;

  plot.xMajor = 10.0;
  plot.xMinor = 5.0;
  plot.yMajor = 0.50;
  plot.yMinor = 0.125;

  plot.title = "This is a plot";
  plot.font = "16px Arial";
  plot.legend = [["C", "this is dataset C"],
                 ["A", "this is dataset A"],
                 ["X", "this is dataset X"],
                 ["B", "this is dataset B"],
                 ["D", "this is dataset D"],
                 ["E", "this is dataset E"]];
  plot.legendPosition = [22.0, 1.0];
  plot.legendBorderPx = 0;

  createPlot(ctx, plot);

  // plot some linear data, lines and symbols, set "A"
  dataA.push([0.0, 0.0]);
  dataA.push([8.0, 0.7]);
  dataA.push([12.0, -0.4]);
  plotLinearData(ctx, plot, "A", dataA, "solid", "filledCircle", "red", 6,1);

  // plot more linear data, but symbols only, set "B"
  dataB.push([-1.0, 0.2]);
  dataB.push([8.8, 0.7]);
  dataB.push([14.0, -0.3]);
  plotLinearData(ctx, plot, "B", dataB, "none", "openSquare", "green", 8,1);

  // plotRemoveData(ctx, plot, "B");

  // plot bar data, set "C"
  if (true) {
    dataC.push([2.0, 3.0, 0.0, 0.2]);
    dataC.push([3.0, 4.0, 0.0, 0.4]);
    dataC.push([4.0, 5.0, 0.0, 1.2]);
    dataC.push([6.0, 7.0, 0.0, 0.2]);
  } else {
    dataC.push([0.0, 3.0, 0.0, 0.1]);
    dataC.push([0.0, 4.0, 0.1, 0.2]);
    dataC.push([0.0, 5.0, 0.3, 0.4]);
    dataC.push([0.0, 7.0, 0.4, 0.5]);
  }
  plotBarData(ctx, plot, "C", dataC);

  // create an "area" on the plot with set "D"
  dataD.push([0.0, 0.0]);
  dataD.push([5.0, -1.2]);
  dataD.push([10.0, -0.3]);
  dataD.push([5.0, 0.1]);
  plotAreaData(ctx, plot, "D", dataD, "rgb(32,32,128,0.25)", "blue",
               "dotted", 1);

  // plot a function, labeled "E"
  function func3(x) {return 0.13*Math.cos(1.5*x) + -1.0;}
  plotFunction(ctx, plot, "E", func3, "darkred", 2);

  // add another point to the bar-graph data "C"
  dataC.push([5.0, 6.0, 0.0, 0.3]);

  // add more points to data "A"
  dataA.push([14.0, 0.0]);
  dataA.push([20.0, -1.5]);
  dataA.push([21.0, -1.5]);
  dataA.push([35.5,  0.0]);
  dataA.push([16.5, 0.0]);

  // update the plot with revised data for "A" and "C"
  plotUpdate(ctx, plot, ["A", "C"], [dataA, dataC]);

  // plot a line not restricted to the plot area
  ctx.lineWidth = 1;
  ctx.strokeStyle = "blue";
  ctx.beginPath();
  ctx.moveTo(mapX(plot, 29.0), mapY(plot, -2.0));
  ctx.lineTo(mapX(plot, 37.0), mapY(plot, 1.2));
  ctx.stroke();

  return;
}


//==============================================================================
// "PRIVATE" FUNCTIONS:

//------------------------------------------------------------------------------
// save array of data as pixels within plot object, at index dataIdx

function saveDataAsPixels(data, plot, dataIdx) {
  var maxXPx = 0;
  var maxYPx = 0;
  var minXPx = 0;
  var minYPx = 0;
  var pIdx = 0;
  var prevXPx = 0;
  var prevYPx = 0;
  var xPx = 0;
  var x1Px = 0;
  var x2Px = 0;
  var yPx = 0;
  var y1Px = 0;
  var y2Px = 0;

  prevXPx = undefined;
  prevYPx = undefined;
  plot.data[dataIdx].points = [];

  minXPx = mapX(plot, plot.xMin);
  maxXPx = mapX(plot, plot.xMax);
  maxYPx = mapY(plot, plot.yMin);
  minYPx = mapY(plot, plot.yMax);
  for (pIdx = 0; pIdx < data.length; pIdx++) {
    // validate format
    if (data[pIdx].length != 2 && data[pIdx].length != 4) {
      console.log("ERROR : coordinates should be 2 or 4 values, not " +
                  data[pIdx].length);
      window.alert("Error in plotLibrary.js: Each data point must be " +
                   " an array of 2 or 4 values; found " + data[pIdx].length);
      return;
    }

    // get coordinates of point or bar
    if (data[pIdx].length == 2) {
      xPx = mapX(plot, data[pIdx][0]);
      yPx = mapY(plot, data[pIdx][1]);

      // save coordinates if they're not at the same location as previous point
      if (xPx != prevXPx || yPx != prevYPx) {
        plot.data[dataIdx].points.push([xPx, yPx]);
      }

      prevXPx = xPx;
      prevYPx = yPx;
    } else {
      x1Px = mapX(plot, data[pIdx][0]);
      x2Px = mapX(plot, data[pIdx][1]);
      y1Px = mapY(plot, data[pIdx][2]);
      y2Px = mapY(plot, data[pIdx][3]);
      plot.data[dataIdx].points.push([x1Px, x2Px, y1Px, y2Px]);
    }
  }

  return;
}

//------------------------------------------------------------------------------
// unmapX(): map from pixels *within graph* to graph X coordinate

function unmapX(plot, xPx) {
  var x = 0.0;
  var xPercent = 0.0;

  if (xPx == undefined) {
    return undefined;
  }
  xPercent = xPx / plot.widthPx;
  x = ((plot.xMax - plot.xMin) * xPercent) + plot.xMin;

  return x;
}

//------------------------------------------------------------------------------
// set clipping region to the area within the plot

function setClippingRegion(ctx, plot) {
  var height = 0;
  var width = 0;
  var xMaxPx = 0;
  var xMinPx = 0;
  var yMaxPx = 0;
  var yMinPx = 0;

  xMinPx = mapX(plot, plot.xMin);
  yMinPx = mapY(plot, plot.yMin);
  xMaxPx = mapX(plot, plot.xMax);
  yMaxPx = mapY(plot, plot.yMax);
  width  = xMaxPx - xMinPx;
  height = yMinPx - yMaxPx;
  ctx.beginPath();
  ctx.rect(xMinPx, yMaxPx, width, height);
  ctx.clip();

  return;
}

//------------------------------------------------------------------------------
// get index into array of line styles, given name of line style

function getLineStyleIndex(lineStyle) {
  var lineStyleIdx = 0;
  var lineStyleLC = lineStyle.toLowerCase();

  if (lineStyleLC == "solid")           lineStyleIdx = 0;
  else if (lineStyleLC == "dashed")     lineStyleIdx = 1;
  else if (lineStyleLC == "dash")       lineStyleIdx = 1;
  else if (lineStyleLC == "small-dash") lineStyleIdx = 2;
  else if (lineStyleLC == "smalldash")  lineStyleIdx = 2;
  else if (lineStyleLC == "dotted")     lineStyleIdx = 3;
  else if (lineStyleLC == "dot")        lineStyleIdx = 3;
  else if (lineStyleLC == "dot-dash")   lineStyleIdx = 4;
  else if (lineStyleLC == "dotdash")    lineStyleIdx = 4;
  else if (lineStyleLC == "none")       lineStyleIdx = -1;
  else {
    console.log("Error: invalid line style: " + lineStyle);
    window.alert("Error: plotLibrary.js is called with unknown line style '" +
                 lineStyle + "'");
  }

  return lineStyleIdx;
}

//------------------------------------------------------------------------------
// plot major X-axis tic marks, grid lines, labels

function plotMajorX(ctx, plot, x, tics, grid, values) {
  var posXpx = 0;
  var posYpx = 0;
  var textWidthPx = 0.0;
  var valueXpx = 0.0;
  var x2 = 0.0;
  var xStr = "";

  //  plot tic marks
  if (tics) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = plot.defaultColor;
    ctx.moveTo(mapX(plot, x), mapY(plot, plot.yMin) + 1);
    ctx.lineTo(mapX(plot, x), mapY(plot, plot.yMin) + plot.ticSizePx);
    ctx.stroke();
  }

  // plot grid lines
  if (grid) {
    if (plot.xGridWidthPx && plot.xGridWidthPx > 0) {
      ctx.beginPath();
      ctx.lineWidth = plot.xGridWidthPx;
      if (plot.xGridColor) {
        ctx.strokeStyle = plot.xGridColor;
      }
      ctx.moveTo(mapX(plot, x), mapY(plot, plot.yMin));
      ctx.lineTo(mapX(plot, x), mapY(plot, plot.yMax));
      ctx.stroke();
    }
  }

  // plot values below tic marks
  if (values) {
    valueXpx = mapX(plot, x);
    xStr = x.toFixed(plot.xPrecision);
    textWidthPx = ctx.measureText(xStr).width;
    posXpx = valueXpx - textWidthPx/2;
    posYpx = plot.heightOffsetPx + plot.heightPx +
           plot.ticSizePx + plot.fontHeightPx;
    ctx.fillStyle = plot.defaultColor;
    ctx.fillText(xStr, posXpx, posYpx);

    if (plot.x2function != undefined) {
      valueXpx = mapX(plot, x);
      x2 = plot.x2function(x);
      xStr = x2.toFixed(plot.x2Precision);
      textWidthPx = ctx.measureText(xStr).width;
      posXpx = valueXpx - textWidthPx/2;
      posYpx = plot.heightOffsetPx + plot.heightPx +
             plot.ticSizePx + 2*plot.fontHeightPx + plot.paddingPx/2;
      ctx.fillStyle = plot.defaultColor;
      ctx.fillText(xStr, posXpx, posYpx);
    }
  }

  return;
}

//------------------------------------------------------------------------------
// plot major Y-axis tic marks, grid lines, labels

function plotMajorY(ctx, plot, y, tics, grid, values) {
  var posXpx = 0;
  var posYpx = 0;
  var textHeightPx = 0.0;
  var textWidthPx = 0.0;
  var valueYpx = 0.0;
  var yStr = "";

  // plot tic marks
  if (tics) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = plot.defaultColor;
    ctx.moveTo(mapX(plot, plot.xMin) - 1, mapY(plot, y));
    ctx.lineTo(mapX(plot, plot.xMin) - plot.ticSizePx, mapY(plot, y));
    ctx.stroke();
  }

  // plot grid lines
  if (grid) {
    if (plot.yGridWidthPx && plot.yGridWidthPx > 0) {
      ctx.beginPath();
      ctx.lineWidth = plot.yGridWidthPx;
      if (plot.yGridColor) {
        ctx.strokeStyle = plot.yGridColor;
      }
      ctx.moveTo(mapX(plot, plot.xMin), mapY(plot, y));
      ctx.lineTo(mapX(plot, plot.xMax), mapY(plot, y));
      ctx.stroke();
    }
  }

  // plot values below tic marks
  if (values) {
    valueYpx = mapY(plot, y);
    yStr = y.toFixed(plot.yPrecision);
    textWidthPx = ctx.measureText(yStr).width;
    textHeightPx = plot.fontHeightPx;
    posXpx = plot.widthOffsetPx - plot.ticSizePx - plot.paddingPx;
    if (plot.yRotate) {
      posYpx = valueYpx + textWidthPx/2.0;
    } else {
      posYpx = valueYpx + textHeightPx/2.0 - 2;
      posXpx -= ctx.measureText(yStr).width;
    }
    ctx.save();
    ctx.translate(posXpx, posYpx);
    if (plot.yRotate) {
      ctx.rotate(-Math.PI/2.0);
    }
    ctx.fillStyle = plot.defaultColor;
    ctx.fillText(yStr, 0, 0);
    ctx.restore();  // revert to pre-rotated axes

    if (plot.y2function != undefined && plot.y2function != "") {
      valueYpx = mapY(plot, y);
      var y2 = plot.y2function(y);
      yStr = y2.toFixed(plot.y2Precision);
      textWidthPx = ctx.measureText(yStr).width;
      textHeightPx = plot.fontHeightPx;

      posXpx = plot.widthOffsetPx - plot.ticSizePx - plot.paddingPx;
      if (plot.yRotate) {
        posYpx = valueYpx + textWidthPx/2.0;
        posXpx -= textHeightPx;
      } else {
        posYpx = valueYpx + textHeightPx/2.0 - 2;
        posXpx -= ctx.measureText(yStr).width;
        posXpx -= ctx.measureText(yStr).width + plot.paddingPx;
      }

      ctx.save();
      ctx.translate(posXpx, posYpx);
      if (plot.yRotate) {
        ctx.rotate(-Math.PI/2.0);
      }
      ctx.fillStyle = plot.defaultColor;
      ctx.fillText(yStr, 0, 0);
      ctx.restore();  // revert to pre-rotated axes
    }
  }

  return;
}

//------------------------------------------------------------------------------
// fill the entire plot area with specified color

function fillPlotArea(ctx, plot) {
  var xMaxPx = mapX(plot, plot.xMax);
  var xMinPx = mapX(plot, plot.xMin);
  var yMaxPx = mapY(plot, plot.yMax);
  var yMinPx = mapY(plot, plot.yMin);

  var width  = xMaxPx - xMinPx;
  var height = yMinPx - yMaxPx;
  ctx.fillStyle = plot.plotAreaColor;
  ctx.fillRect(xMinPx, yMaxPx, width, height);

  return;
}

//------------------------------------------------------------------------------
// plot the lower-left and/or upper-right bounds of the plotting area

function plotBounds(ctx, plot) {
  ctx.strokeStyle = plot.defaultColor;
  if (plot.lowerLeftBoundsWidthPx > 0) {
    ctx.lineWidth = plot.lowerLeftBoundsWidthPx;
    ctx.beginPath();
    ctx.moveTo(mapX(plot, plot.xMax), mapY(plot, plot.yMin));
    ctx.lineTo(mapX(plot, plot.xMin), mapY(plot, plot.yMin));
    ctx.lineTo(mapX(plot, plot.xMin), mapY(plot, plot.yMax));
    ctx.stroke();
  }
  if (plot.upperRightBoundsWidthPx > 0) {
    ctx.lineWidth = plot.upperRightBoundsWidthPx;
    ctx.beginPath();
    ctx.moveTo(mapX(plot, plot.xMin), mapY(plot, plot.yMax));
    ctx.lineTo(mapX(plot, plot.xMax), mapY(plot, plot.yMax));
    ctx.lineTo(mapX(plot, plot.xMax), mapY(plot, plot.yMin));
    ctx.stroke();
  }

  return;
}

//------------------------------------------------------------------------------
// plot the X and/or Y axes

function plotAxes(ctx, plot) {
  // plot X axis
  if (plot.yMin <= 0 && plot.yMax >= 0 &&
      plot.xAxisWidthPx && plot.xAxisWidthPx > 0) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    if (plot.xAxisWidthPx) {
      ctx.lineWidth = plot.xAxisWidthPx;
    }
    if (plot.xAxisColor) {
      ctx.strokeStyle = plot.xAxisColor;
    }
    ctx.moveTo(mapX(plot, plot.xMin), mapY(plot, 0.0));
    ctx.lineTo(mapX(plot, plot.xMax), mapY(plot, 0.0));
    ctx.stroke();
  }

  // plot Y axis
  if (plot.xMin <= 0 && plot.xMax >= 0 &&
      plot.yAxisWidthPx && plot.yAxisWidthPx > 0) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    if (plot.yAxisWidthPx) {
      ctx.lineWidth = plot.yAxisWidthPx;
    }
    if (plot.yAxisColor) {
      ctx.strokeStyle = plot.yAxisColor;
    }
    ctx.moveTo(mapX(plot, 0.0), mapY(plot, plot.yMin));
    ctx.lineTo(mapX(plot, 0.0), mapY(plot, plot.yMax));
    ctx.stroke();
  }

  return;
}

//------------------------------------------------------------------------------
// plot all of the things going on within the plot area except the data

function constructInnerPlotBackground(ctx, plot, tics, grid, values) {
  var color = "";
  var dataIdx = 0;
  var fillColor = "";
  var fillPattern = {};
  var graphicsWidthPx = 0;
  var lIdx = 0;
  var lineColor = "";
  var lineStyleIdx = 0;
  var lineWidthPx = 0;
  var maxWidthPx = 0;
  var symbol = "";
  var symbolSizePx = 0;
  var textWidthPx = 0;
  var type = "";
  var x = 0.0;
  var xPx = 0.0;
  var x1Px = 0;
  var x2Px = 0;
  var y = 0.0;
  var yPx = 0.0;
  var y1Px = 0;
  var y2Px = 0;

  ctx.setLineDash([0]);
  ctx.lineDashOffset = 0;

  // clear the plot area (fill with background color)
  fillPlotArea(ctx, plot);

  // plot X and/or Y axis bounds
  plotBounds(ctx, plot);

  ctx.fillStyle = plot.defaultColor;

  // plot X-axis grid lines
  if (plot.xMajor > 0) {
    for (x = 0; x <= plot.xMax; x += plot.xMajor) {
      if (x < plot.xMin) {
        continue;
      }
      plotMajorX(ctx, plot, x, tics, grid, values);
    }
    for (x = -plot.xMajor; x >= plot.xMin; x -= plot.xMajor) {
      if (x <= plot.xMin || x >= plot.xMax) {
        continue;
      }
      plotMajorX(ctx, plot, x, tics, grid, values);
    }
  }

  // plot Y-axis grid lines
  if (plot.yMajor > 0) {
    for (y = 0; y <= plot.yMax; y += plot.yMajor) {
      if (y < plot.yMin) {
        continue;
      }
      plotMajorY(ctx, plot, y, tics, grid, values);
    }
    for (y = -plot.yMajor; y >= plot.yMin; y -= plot.yMajor) {
      if (y <= plot.yMin || y >= plot.yMax) {
        continue;
      }
      plotMajorY(ctx, plot, y, tics, grid, values);
    }
  }

  // plot X and/or Y axes
  plotAxes(ctx, plot);

  // plot legend (graphics get 'graphicsWidthPx' pixels wide by font height)
  if (plot.legend.length > 0) {
    graphicsWidthPx = plot.fontHeightPx * 2;
    xPx = mapX(plot, plot.legendPosition[0]) + plot.paddingPx/2;
    yPx = mapY(plot, plot.legendPosition[1]) + plot.paddingPx/2;
    maxWidthPx = 0;
    for (lIdx = 0; lIdx < plot.legend.length; lIdx++) {
      // find name in plot
      for (dataIdx = 0; dataIdx < plot.data.length; dataIdx++) {
        type = plot.data[dataIdx].type;
        if (plot.data[dataIdx].name == plot.legend[lIdx][0]) {
          break;
        }
      }
      if (dataIdx >= plot.data.length) {
        continue;
      }
      yPx += plot.fontHeightPx + 2;
      // plot the line/symbol/bar for this dataset
      if (type == "linear") {
        lineStyleIdx = plot.data[dataIdx].lineStyleIdx;
        symbol       = plot.data[dataIdx].symbol;
        color        = plot.data[dataIdx].color;
        symbolSizePx = plot.data[dataIdx].symbolSizePx;
        lineWidthPx  = plot.data[dataIdx].lineWidthPx;
        // plot line, if needed
        if (lineStyleIdx >= 0 && lineWidthPx > 0) {
          ctx.beginPath();
          ctx.moveTo(xPx + plot.paddingPx, yPx - plot.fontHeightPx/2 + 2);
          ctx.lineWidth = lineWidthPx;
          ctx.strokeStyle = color;
          ctx.setLineDash(lineStyleList[lineStyleIdx]);
          ctx.lineDashOffset = 0;
          ctx.lineTo(xPx + plot.paddingPx + graphicsWidthPx,
                     yPx - plot.fontHeightPx/2 + 2);
          ctx.stroke();
        }
        // plot symbol, if needed
        if (symbolSizePx > 0) {
          plotSymbol(ctx, plot, symbol,
                     xPx + plot.paddingPx + graphicsWidthPx/2,
                     yPx - plot.fontHeightPx/2 + 2,
                     symbolSizePx, color, lineWidthPx);
        }
      }
      if (type == "bar" || type == "area") {
        fillColor     = plot.data[dataIdx].fillColor;
        fillPattern   = plot.data[dataIdx].fillPattern;
        lineStyleIdx  = plot.data[dataIdx].lineStyleIdx;
        lineColor     = plot.data[dataIdx].lineColor;
        lineWidthPx   = plot.data[dataIdx].lineWidthPx;
        x1Px = xPx + plot.paddingPx + (graphicsWidthPx/8);
        x2Px = x1Px + (6.0*graphicsWidthPx/8.0);
        y1Px = yPx;
        y2Px = yPx - (3.0*plot.fontHeightPx/4.0);
        plotBar(ctx, plot, x1Px, x2Px, y1Px, y2Px, fillColor, fillPattern,
                lineColor, lineWidthPx, lineStyleIdx);
      }

      // add legend description
      ctx.fillStyle = plot.defaultColor;
      ctx.fillText(plot.legend[lIdx][1],
                   xPx + 2*plot.paddingPx + graphicsWidthPx, yPx);
      textWidthPx = ctx.measureText(plot.legend[lIdx][1]).width;
      if (textWidthPx > maxWidthPx) {
        maxWidthPx = textWidthPx
      }
    }

    if (plot.legendBorderPx != undefined && plot.legendBorderPx > 0) {
      ctx.lineWidth = plot.legendBorderPx;
      ctx.strokeStyle = plot.defaultColor;
      ctx.beginPath();
      ctx.rect(mapX(plot, plot.legendPosition[0]),
               mapY(plot, plot.legendPosition[1]),
               maxWidthPx + 4*plot.paddingPx + graphicsWidthPx,
               yPx - mapY(plot, plot.legendPosition[1]) + 1.5*plot.paddingPx);
      ctx.stroke();
    }
  }

  return;
}

//------------------------------------------------------------------------------
// internal function for plotting a symbol at one location

function plotSymbol(ctx, plot, symbol, xPx, yPx, symbolSizePx,
                    color, lineWidthPx) {
  if (symbolSizePx > 0) {
    if (symbol == "openCircle") {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidthPx;
      ctx.beginPath();
      ctx.arc(xPx, yPx, symbolSizePx/2, 0, 2*Math.PI);
      ctx.stroke();
    }
    else if (symbol == "filledCircle") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.arc(xPx, yPx, symbolSizePx/2, 0, 2*Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
    }
    else if (symbol == "openSquare") {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidthPx;
      ctx.beginPath();
      ctx.rect(xPx-symbolSizePx/2, yPx-symbolSizePx/2,
               symbolSizePx, symbolSizePx);
      ctx.stroke();
    }
    else if (symbol == "filledSquare") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.rect(xPx-symbolSizePx/2, yPx-symbolSizePx/2,
               symbolSizePx, symbolSizePx);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
    }
    else if (symbol == "openTriangle") {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.lineWidth = lineWidthPx;
      ctx.moveTo(xPx-symbolSizePx/2, yPx+symbolSizePx/2);
      ctx.lineTo(xPx+symbolSizePx/2, yPx+symbolSizePx/2);
      ctx.lineTo(xPx, yPx-symbolSizePx/2);
      ctx.lineTo(xPx-symbolSizePx/2, yPx+symbolSizePx/2);
      ctx.stroke();
    }
    else if (symbol == "filledTriangle") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidthPx;
      ctx.moveTo(xPx-symbolSizePx/2, yPx+symbolSizePx/2);
      ctx.lineTo(xPx+symbolSizePx/2, yPx+symbolSizePx/2);
      ctx.lineTo(xPx, yPx-symbolSizePx/2);
      ctx.lineTo(xPx-symbolSizePx/2, yPx+symbolSizePx/2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
    }
    else if (symbol == "openNabla") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidthPx;
      ctx.moveTo(xPx-symbolSizePx/2, yPx-symbolSizePx/2);
      ctx.lineTo(xPx+symbolSizePx/2, yPx-symbolSizePx/2);
      ctx.lineTo(xPx, yPx+symbolSizePx/2);
      ctx.lineTo(xPx-symbolSizePx/2, yPx-symbolSizePx/2);
      ctx.stroke();
    }
    else if (symbol == "filledNabla") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidthPx;
      ctx.moveTo(xPx-symbolSizePx/2, yPx-symbolSizePx/2);
      ctx.lineTo(xPx+symbolSizePx/2, yPx-symbolSizePx/2);
      ctx.lineTo(xPx, yPx+symbolSizePx/2);
      ctx.lineTo(xPx-symbolSizePx/2, yPx-symbolSizePx/2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
    }
    else if (symbol == "openDiamond") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidthPx;
      ctx.moveTo(xPx, yPx+symbolSizePx/2+1);
      ctx.lineTo(xPx+symbolSizePx/2, yPx);
      ctx.lineTo(xPx, yPx-symbolSizePx/2-1);
      ctx.lineTo(xPx-symbolSizePx/2, yPx);
      ctx.lineTo(xPx, yPx+symbolSizePx/2);
      ctx.stroke();
    }
    else if (symbol == "filledDiamond") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidthPx;
      ctx.moveTo(xPx, yPx+symbolSizePx/2+1);
      ctx.lineTo(xPx+symbolSizePx/2, yPx);
      ctx.lineTo(xPx, yPx-symbolSizePx/2-1);
      ctx.lineTo(xPx-symbolSizePx/2, yPx);
      ctx.lineTo(xPx, yPx+symbolSizePx/2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
    }
    else if (symbol == "X" || symbol == "x") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidthPx;
      ctx.moveTo(xPx-symbolSizePx/2, yPx+symbolSizePx/2);
      ctx.lineTo(xPx+symbolSizePx/2, yPx-symbolSizePx/2);
      ctx.moveTo(xPx-symbolSizePx/2, yPx-symbolSizePx/2);
      ctx.lineTo(xPx+symbolSizePx/2, yPx+symbolSizePx/2);
      ctx.stroke();
    }
    else if (symbol == "plus" || symbol == "+") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidthPx;
      ctx.moveTo(xPx, yPx+symbolSizePx/2);
      ctx.lineTo(xPx, yPx-symbolSizePx/2);
      ctx.moveTo(xPx-symbolSizePx/2, yPx);
      ctx.lineTo(xPx+symbolSizePx/2, yPx);
      ctx.stroke();
    }
    else if (symbol == "asterix") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidthPx;
      ctx.moveTo(xPx-symbolSizePx/2, yPx+symbolSizePx/2);
      ctx.lineTo(xPx+symbolSizePx/2, yPx-symbolSizePx/2);
      ctx.moveTo(xPx-symbolSizePx/2, yPx-symbolSizePx/2);
      ctx.lineTo(xPx+symbolSizePx/2, yPx+symbolSizePx/2);
      ctx.moveTo(xPx, yPx+symbolSizePx/2);
      ctx.lineTo(xPx, yPx-symbolSizePx/2);
      ctx.moveTo(xPx-symbolSizePx/2, yPx);
      ctx.lineTo(xPx+symbolSizePx/2, yPx);
      ctx.stroke();
    }
    else if (symbol != "none") {
      console.log("Error: invalid symbol: " + symbol);
      window.alert("Error: plotSymbol() uses unknown symbol '" + symbol + "'");
    }
  }

  return;
}

//------------------------------------------------------------------------------
// internal function to plot bar at specified location

function plotBar(ctx, plot, x1Px, x2Px, y1Px, y2Px, fillColor, fillPattern,
                 lineColor, lineWidthPx, lineStyleIdx, closed = true) {
  var fIdx = 0;
  var height = y2Px - y1Px;
  var width = x2Px - x1Px;
  var x1fPx = 0;
  var x2fPx = 0;
  var y1fPx = 0;
  var y2fPx = 0;

  if (fillColor != "none") {
    ctx.fillStyle = fillColor;
    ctx.fillRect(x1Px, y1Px, width, height);
    ctx.fillStyle = plot.defaultColor;
  }

  if (fillPattern && fillPattern.spacing > 0) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = lineColor;
    ctx.setLineDash([0]);
    ctx.lineDashOffset = 0;
    if (fillPattern.angleUp) {
      for (fIdx = 0; fIdx < -1*(height-width); fIdx += fillPattern.spacing) {
        x1fPx = x1Px;
        y1fPx = y1Px + width - fIdx;
        if (y1fPx > y1Px) {
          x1fPx = x2Px - width + (y1fPx - y1Px);
          y1fPx = y1Px;
        }
        ctx.moveTo(x1fPx, y1fPx);
        x2fPx = x2Px;
        y2fPx = y1Px - fIdx;
        if (y2fPx < y2Px) {
          x2fPx = x2Px + (y2fPx - y2Px);
          y2fPx = y2Px;
        }
        ctx.lineTo(x2fPx, y2fPx);
      }
    }
    if (fillPattern.angleDown) {
      for (fIdx = 0; fIdx < -1*(height-width); fIdx += fillPattern.spacing) {
        x1fPx = x1Px;
        y1fPx = y1Px - fIdx;
        if (y1fPx < y2Px) {
          x1fPx = x2Px - width - (y1fPx - y2Px);
          y1fPx = y2Px;
        }
        ctx.moveTo(x1fPx, y1fPx);
        x2fPx = x2Px;
        y2fPx = y1Px + width - fIdx;
        if (y2fPx > y1Px) {
          x2fPx = x2Px - (y2fPx - y1Px);
          y2fPx = y1Px;
        }
        ctx.lineTo(x2fPx, y2fPx);
      }
    }
    if (fillPattern.horizontal) {
      for (fIdx = 0; fIdx < -1*height; fIdx += fillPattern.spacing) {
        x1fPx = x1Px;
        y1fPx = y1Px - fIdx;
        ctx.moveTo(x1fPx, y1fPx);
        x2fPx = x2Px;
        y2fPx = y1Px - fIdx;
        ctx.lineTo(x2fPx, y2fPx);
      }
    }
    if (fillPattern.vertical) {
      for (fIdx = 0; fIdx < width; fIdx += fillPattern.spacing) {
        x1fPx = x1Px + fIdx;
        y1fPx = y1Px;
        ctx.moveTo(x1fPx, y1fPx);
        x2fPx = x1Px + fIdx;
        y2fPx = y2Px;
        ctx.lineTo(x2fPx, y2fPx);
      }
    }
    ctx.stroke();
  }

  if (lineStyleIdx >= 0 && lineWidthPx > 0) {
    ctx.beginPath();
    ctx.lineWidth = lineWidthPx;
    ctx.strokeStyle = lineColor;
    ctx.setLineDash(lineStyleList[lineStyleIdx]);
    ctx.lineDashOffset = 0;
    if (closed) {
      ctx.rect(x1Px, y1Px, width, height);
      } else {
      // plot all lines except (x1Px, y2Px) to (x2Px, y2Px)
      ctx.moveTo(x1Px, y2Px);
      ctx.lineTo(x1Px, y1Px);
      ctx.lineTo(x2Px, y1Px);
      ctx.lineTo(x2Px, y2Px);
      }
    ctx.stroke();
  }

  return;
}

//------------------------------------------------------------------------------
// internal function for plotting lines and/or symbols for one set of line data

function internalPlotLinearData(ctx, plot, dataIdx) {
  var color = "";
  var lineStyleIdx = 0;
  var lineWidthPx = 0;
  var pIdx = 0;
  var prevXPx = 0;
  var prevYPx = 0;
  var symbol = "";
  var symbolSizePx = 0;
  var xPx = 0;
  var yPx = 0;

  if (dataIdx < 0 || plot.data[dataIdx].points.length <= 0) {
    return;
  }

  lineStyleIdx = plot.data[dataIdx].lineStyleIdx;
  symbol       = plot.data[dataIdx].symbol;
  color        = plot.data[dataIdx].color;
  symbolSizePx = plot.data[dataIdx].symbolSizePx;
  lineWidthPx  = plot.data[dataIdx].lineWidthPx;

  ctx.save();
  setClippingRegion(ctx, plot);

  // plot the lines and symbols (all coordinates are in pixels)
  prevXPx = undefined;
  prevYPx = undefined;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidthPx;
  for (pIdx = 0; pIdx < plot.data[dataIdx].points.length; pIdx++) {
    xPx = plot.data[dataIdx].points[pIdx][0];
    yPx = plot.data[dataIdx].points[pIdx][1];
    // console.log("plotting (" + xPx + ", " + yPx + ")");

    // plot line, if needed
    if (lineStyleIdx >= 0 && lineWidthPx > 0) {
      if (prevXPx != undefined && prevYPx != undefined &&
          xPx != undefined && yPx != undefined) {
        ctx.beginPath();
        ctx.moveTo(prevXPx, prevYPx);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidthPx;
        ctx.setLineDash(lineStyleList[lineStyleIdx]);
        ctx.lineDashOffset = 0;
        ctx.lineTo(xPx, yPx);
        ctx.stroke();
      }
    }

    // plot symbol, if needed
    if (symbolSizePx > 0) {
      plotSymbol(ctx, plot, symbol, xPx, yPx, symbolSizePx, color, lineWidthPx);
    }

    prevXPx = xPx;
    prevYPx = yPx;
  }

  // revert to no clipping area
  ctx.restore();

  return;
}

//------------------------------------------------------------------------------
// internal function for plotting one set of bar data

function internalPlotBarData(ctx, plot, dataIdx) {
  var fillColor = "";
  var fillPattern = {};
  var lineColor = "";
  var lineStyleIdx = 0;
  var lineWidthPx = 0;
  var pIdx = 0;
  var x1Px = 0;
  var x2Px = 0;
  var y1Px = 0;
  var y2Px = 0;

  if (dataIdx < 0 || plot.data[dataIdx].points.length <= 0) {
    return;
  }

  fillColor     = plot.data[dataIdx].fillColor;
  fillPattern   = plot.data[dataIdx].fillPattern;
  lineStyleIdx  = plot.data[dataIdx].lineStyleIdx;
  lineColor     = plot.data[dataIdx].lineColor;
  lineWidthPx   = plot.data[dataIdx].lineWidthPx;

  ctx.save();
  setClippingRegion(ctx, plot);

  // plot each bar (units are all in pixels)
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidthPx;
  for (pIdx = 0; pIdx < plot.data[dataIdx].points.length; pIdx++) {
    x1Px = plot.data[dataIdx].points[pIdx][0];
    x2Px = plot.data[dataIdx].points[pIdx][1];
    y1Px = plot.data[dataIdx].points[pIdx][2];
    y2Px = plot.data[dataIdx].points[pIdx][3];

    plotBar(ctx, plot, x1Px, x2Px, y1Px, y2Px, fillColor, fillPattern,
                 lineColor, lineWidthPx, lineStyleIdx);
  }

  // revert to no clipping area
  ctx.restore();

  return;
}

//------------------------------------------------------------------------------
// internal function for plotting of one set of area data

function internalPlotAreaData(ctx, plot, dataIdx) {
  var fillColor = "";
  var lineColor = "";
  var lineStyleIdx = 0;
  var lineWidthPx = 0;
  var pIdx = 0;
  var xPx = 0;
  var yPx = 0;

  if (dataIdx < 0 || plot.data[dataIdx].points.length <= 0) {
    return;
  }

  plot.data[dataIdx].fillPattern = {};
  fillColor     = plot.data[dataIdx].fillColor;
  lineStyleIdx  = plot.data[dataIdx].lineStyleIdx;
  lineColor     = plot.data[dataIdx].lineColor;
  lineWidthPx   = plot.data[dataIdx].lineWidthPx;

  ctx.save();
  setClippingRegion(ctx, plot);

  // plot the lines and symbols (all coordinates are in pixels)
  ctx.strokeStyle = lineColor;
  if (lineWidthPx < 1) {
    ctx.strokeStyle = fillColor;
  }
  ctx.fillStyle = fillColor;
  ctx.setLineDash(lineStyleList[lineStyleIdx]);
  ctx.lineDashOffset = 0;
  ctx.lineWidth = lineWidthPx;
  ctx.beginPath();
  for (pIdx = 0; pIdx < plot.data[dataIdx].points.length; pIdx++) {
    xPx = plot.data[dataIdx].points[pIdx][0];
    yPx = plot.data[dataIdx].points[pIdx][1];
    if (xPx == undefined || yPx == undefined) {
      continue;
    }
    if (pIdx == 0) {
      ctx.moveTo(xPx, yPx);
    } else {
      ctx.lineTo(xPx, yPx);
    }
  }
  ctx.fill();
  ctx.stroke();

  // revert to no clipping area
  ctx.restore();

  return;
}

