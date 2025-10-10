/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/formatterCharts.js   	        				*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides charts formatters   						*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ°...........  : 										*
 * Project ................... : 										*
 * Author .................... : 										*
 *----------------------------------------------------------------------*
 * Modification date ......... : 										* 
 * Transport order ........... : 										* 			
 * Change Request ............ : 										* 			
 * Description ............... : 										* 
 ************************************************************************/
/**
 * @fileOverview Provides charts formatters functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/viz/ui5/format/ChartFormatter",
    "sap/viz/ui5/api/env/Format",
    "cus/fi/timi/rel/model/formatterFormat"
], function(ChartFormatter, Format, formatterFormat) {
    "use strict";

    var oChartFormatters = {

        FIORI_LABEL_AMOUNTFORMAT: "FIORI_LABEL_AMOUNTFORMAT",
        FIORI_LABEL_INTEGERFORMAT_SHORT: "FIORI_LABEL_INTEGERFORMAT_SHORT",

        chartFormatter: null,
        registerChartFormatters: function() {

            var chartFormatter = this.chartFormatter = ChartFormatter.getInstance();

            chartFormatter.registerCustomFormatter(this.FIORI_LABEL_AMOUNTFORMAT, formatterFormat.formatAmount);

            chartFormatter.registerCustomFormatter(this.FIORI_LABEL_INTEGERFORMAT_SHORT, formatterFormat.formatIntegerShort);

            Format.numericFormatter(chartFormatter);
        }

    };

    return oChartFormatters;

});