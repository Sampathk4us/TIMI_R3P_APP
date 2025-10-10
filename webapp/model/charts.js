/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/charts.js   	        						*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 31/01/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides charts functions   							*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ° ........... : 										*
 * Project ................... : 										*
 * Author .................... :                                        *
 *----------------------------------------------------------------------*
 * Modification date ......... : 										*
 * Transport order ........... : 										*
 * Change Request ............ : 										*
 * Description ............... : 										*
 ************************************************************************/
/**
 * @fileOverview Charts functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/viz/ui5/data/FlattenedDataset",
    "cus/fi/timi/rel/model/parameters",
    "cus/fi/timi/rel/model/formatterText",
    "cus/fi/timi/rel/model/formatterCharts",
    "cus/fi/timi/rel/assets/js/helpers/utilities"
], function(JSONModel, FeedItem, FlattenedDataset, parameters, formatterText, formatterCharts, utilities) {
    "use strict";

    function _getStatusColorPalette(sStatusId) {

        switch (sStatusId) {
            case parameters.getStatusList().Draft:
                return parameters.getStatusReportingColorList().Draft;
            case parameters.getStatusList().Submitted:
                return parameters.getStatusReportingColorList().Submitted;
            case parameters.getStatusList().Approved:
                return parameters.getStatusReportingColorList().Approved;
            case parameters.getStatusList().RejectedIssuer:
                return parameters.getStatusReportingColorList().RejectedIssuer;
            case parameters.getStatusList().RejectedReceiver:
                return parameters.getStatusReportingColorList().RejectedReceiver;
            case parameters.getStatusList().Validated:
                return parameters.getStatusReportingColorList().Validated;
            case parameters.getStatusList().ValidatedReceiver:
                return parameters.getStatusReportingColorList().ValidatedReceiver;
            case parameters.getStatusList().Generated:
                return parameters.getStatusReportingColorList().Generated;
            default:
                return "";
        }

    };

    function _getIntercoTypeColorPalette(sIntercoTypeCode) {

        switch (sIntercoTypeCode) {
            case parameters.getIntercoTypeList().R3P:
                return parameters.getIntercoTypeReportingColorList().R3P;
            default:
                return "";
        }

    };
    
    function _getCreationModeColorPalette(sCreationMode) {

        switch (sCreationMode) {
            case parameters.getCreationModeList().Manual:
                return parameters.getCreationModeReportingColorList().Manual;
            case parameters.getCreationModeList().Upload:
                return parameters.getCreationModeReportingColorList().Upload;
            default:
                return "";
        }

    };
    
    var oCharts = {

        /** 
         * Set charts data - Requests by Status
         * @private
         */
        setChartsDataRequestsByStatus: function() {

            var fnGetStatusColorPalette = _getStatusColorPalette;
            
            var aRequests = this.getView().getModel("ReportingRequestHeaderList").getProperty("/results");
            var sAppType = this.getComponentModel("AppData").getProperty("/appType");
            var sIntercoType = this.getIntercoType();
            var oVizFrame = this.getView().byId("vfRequestsbyStatus");
            var oCCRequestsbyStatus = this.getView().byId("ccRequestsbyStatus");
            var oRequestsByStatus = {},
                aRequestsByStatus = [],
                oStatus = {},
                aColorPalette = [];

            this.iCountRequestsByStatus = aRequests.length;

            // Work on data 
            aRequestsByStatus = d3.nest().key(function(d) {
                return d.StatusId;
            }).entries(aRequests);

            // Add status order, status name and request count
            aRequestsByStatus.forEach(function(oRequest) {
                oStatus = utilities.findFirstItem(this.getView().getModel("StatusCollection").getProperty("/results"), "StatusCode", oRequest["key"]);
                if (oStatus) {
                    oRequest.StatusOrder = oStatus.Order;
                    oRequest.StatusName = formatterText.getStatusText.call(this, sIntercoType, sAppType, oRequest["key"]);
                }
                oRequest.RequestsCount = oRequest["values"].length;
            }.bind(this));

            // Sort by status order ascending
            aRequestsByStatus.sort(function(oFirstRequest, oSecondRequest) {
                return oFirstRequest["StatusOrder"] - oSecondRequest["StatusOrder"];
            })

            // Build Color palette
            aRequestsByStatus.forEach(function(oRequest) {
                aColorPalette.push(fnGetStatusColorPalette(oRequest.key))
            }.bind(this));

            // Set Container visibility
            oCCRequestsbyStatus.setVisible(aRequestsByStatus.length > 0 ? true : false).addStyleClass('charts');

            var fnLabelRenderer = function(oEvent) {

                var fPercent = 0;

                if (this.iCountRequestsByStatus && this.iCountRequestsByStatus > 0) {
                    fPercent = utilities.round(oEvent.val / this.iCountRequestsByStatus * 100, 2);
                }

                oEvent.text = oEvent.ctx[this.oBundle.getText("charts.label.status")] + " (" + fPercent + "%)";

            };

            // Set model into vizframe
            oRequestsByStatus = {
                results: aRequestsByStatus
            };
            oVizFrame.setModel(new JSONModel(oRequestsByStatus));

            oVizFrame.setVizProperties({
                plotArea: {
                    dataLabel: {
                        visible: true,
                        renderer: fnLabelRenderer.bind(this)
                    },
                    colorPalette: aColorPalette
                },
                legend: {
                    title: {
                        visible: false
                    },
                    visible: true
                },
                title: {
                    visible: true,
                    text: this.oBundle.getText("charts.title.requestsbystatus", aRequests.length.toString())
                },
                interaction: {
                    behaviorType: null,
                    selectability: {
                        mode: "SINGLE"
                    }
                },
                valueAxis: {
                    title: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: true
                    }
                },
                tooltip: {
                    visible: true,
                }
            });

        },

        /** 
         * Set charts data - Amount by Status
         * @private
         */
        setChartsDataAmountByStatus: function() {

            var aRequests = this.getView().getModel("ReportingRequestHeaderList").getProperty("/results");
            var sIntercoType = this.getIntercoType();
            var sAppType = this.getComponentModel("AppData").getProperty("/appType");
            var oVizFrame = this.getView().byId("vfAmountbyStatus");
            var oCCAmountbyStatus = this.getView().byId("ccAmountbyStatus");
            var oAmountByStatus = {},
                aAmountByStatus = [],
                oStatus = {};

            // Register charts formatter
            formatterCharts.registerChartFormatters();

            // Attached status list to the VizFrame for column color rule use
            oVizFrame.data("statusList", parameters.getStatusList());

            // Work on data 
            aAmountByStatus = d3.nest().key(function(d) {
                return d.StatusId;
            }).rollup(function(v) {
                return d3.sum(v, function(d) {
                    return d.LocalAmount;
                });
            }).entries(aRequests);

            // Add status order, status name and request count
            aAmountByStatus.forEach(function(oRequest) {
                oStatus = utilities.findFirstItem(this.getView().getModel("StatusCollection").getProperty("/results"), "StatusCode", oRequest["key"]);
                if (oStatus) {
                    oRequest.StatusOrder = oStatus.Order;
                    oRequest.StatusName = formatterText.getStatusText.call(this, sIntercoType, sAppType, oRequest["key"]);
                }
            }.bind(this));

            // Sort by status order ascending
            aAmountByStatus.sort(function(oFirstRequest, oSecondRequest) {
                return oFirstRequest["StatusOrder"] - oSecondRequest["StatusOrder"];
            })

            // Set Container visibility
            oCCAmountbyStatus.setVisible(aAmountByStatus.length > 0 ? true : false).addStyleClass('charts');

            // Store top value in AppData model for scale calculation
            if (aAmountByStatus.length > 0) {
                this.getComponentModel("AppData").setProperty("/ChartsMaxAmountByStatus", Math.max.apply(Math, aAmountByStatus.map(function(o) {
                    return o.values;
                })));
            } else {
                this.getComponentModel("AppData").setProperty("/ChartsMaxAmountByStatus", 0);
            }

            // Set model into vizframe
            oAmountByStatus = {
                results: aAmountByStatus
            };
            oVizFrame.setModel(new JSONModel(oAmountByStatus));

            var fnRuleColorStatusDraft = function(oContext) {
                var oVizFrame = this.getView().byId("vfAmountbyStatus");
                var oStatusList = oVizFrame.data("statusList");
                return (oVizFrame.getModel().getProperty("/results/" + oContext._context_row_number + "/key") === oStatusList["Draft"]) ? true : false;
            };

            var fnRuleColorStatusSubmitted = function(oContext) {
                var oVizFrame = this.getView().byId("vfAmountbyStatus");
                var oStatusList = oVizFrame.data("statusList");
                return (oVizFrame.getModel().getProperty("/results/" + oContext._context_row_number + "/key") === oStatusList["Submitted"]) ? true : false;
            };

            var fnRuleColorStatusApproved = function(oContext) {
                var oVizFrame = this.getView().byId("vfAmountbyStatus");
                var oStatusList = oVizFrame.data("statusList");
                return (oVizFrame.getModel().getProperty("/results/" + oContext._context_row_number + "/key") === oStatusList["Approved"]) ? true : false;
            };

            var fnRuleColorStatusValidated = function(oContext) {
                var oVizFrame = this.getView().byId("vfAmountbyStatus");
                var oStatusList = oVizFrame.data("statusList");
                return (oVizFrame.getModel().getProperty("/results/" + oContext._context_row_number + "/key") === oStatusList["Validated"]) ? true : false;
            };

            var fnRuleColorStatusValidatedReceiver = function(oContext) {
                var oVizFrame = this.getView().byId("vfAmountbyStatus");
                var oStatusList = oVizFrame.data("statusList");
                return (oVizFrame.getModel().getProperty("/results/" + oContext._context_row_number + "/key") === oStatusList["ValidatedReceiver"]) ? true : false;
            };


            var fnRuleColorStatusGenerated = function(oContext) {
                var oVizFrame = this.getView().byId("vfAmountbyStatus");
                var oStatusList = oVizFrame.data("statusList");
                return (oVizFrame.getModel().getProperty("/results/" + oContext._context_row_number + "/key") === oStatusList["Generated"]) ? true : false;
            };

            var fnRuleColorStatusRejectedIssuer = function(oContext) {
                var oVizFrame = this.getView().byId("vfAmountbyStatus");
                var oStatusList = oVizFrame.data("statusList");
                return (oVizFrame.getModel().getProperty("/results/" + oContext._context_row_number + "/key") === oStatusList["RejectedIssuer"]) ? true : false;
            };

            var fnRuleColorStatusRejectedReceiver = function(oContext) {
                var oVizFrame = this.getView().byId("vfAmountbyStatus");
                var oStatusList = oVizFrame.data("statusList");
                return (oVizFrame.getModel().getProperty("/results/" + oContext._context_row_number + "/key") === oStatusList["RejectedReceiver"]) ? true : false;
            };

            oVizFrame.setVizProperties({
                plotArea: {
                    dataLabel: {
                        visible: true,
                        formatString: formatterCharts.FIORI_LABEL_AMOUNTFORMAT
                    },
                    dataPointStyle: {
                        rules: [{
                            callback: fnRuleColorStatusDraft.bind(this),
                            properties: {
                                color: parameters.getStatusReportingColorList().Draft
                            }
                        }, {
                            callback: fnRuleColorStatusSubmitted.bind(this),
                            properties: {
                                color: parameters.getStatusReportingColorList().Submitted
                            }
                        }, {
                            callback: fnRuleColorStatusApproved.bind(this),
                            properties: {
                                color: parameters.getStatusReportingColorList().Approved
                            }
                        }, {
                            callback: fnRuleColorStatusValidated.bind(this),
                            properties: {
                                color: parameters.getStatusReportingColorList().Validated
                            }
                        }, {
                            callback: fnRuleColorStatusValidatedReceiver.bind(this),
                            properties: {
                                color: parameters.getStatusReportingColorList().ValidatedReceiver
                            }
                        }, {
                            callback: fnRuleColorStatusGenerated.bind(this),
                            properties: {
                                color: parameters.getStatusReportingColorList().Generated
                            }
                        }, {
                            callback: fnRuleColorStatusRejectedIssuer.bind(this),
                            properties: {
                                color: parameters.getStatusReportingColorList().RejectedIssuer
                            }
                        }, {
                            callback: fnRuleColorStatusRejectedReceiver.bind(this),
                            properties: {
                                color: parameters.getStatusReportingColorList().RejectedReceiver
                            }
                        }, ]
                    }
                },
                legend: {
                    title: {
                        visible: false
                    }
                },
                title: {
                    visible: true,
                    text: this.oBundle.getText("charts.title.amountbystatus")
                },
                interaction: {
                    behaviorType: null,
                    selectability: {
                        mode: "SINGLE"
                    }
                },
                valueAxis: {
                    title: {
                        visible: false
                    },
                    label: {
                        formatString: formatterCharts.FIORI_LABEL_INTEGERFORMAT_SHORT
                    }
                },
                categoryAxis: {
                    title: {
                        visible: false
                    }
                },
                tooltip: {
                    visible: true,
                    formatString: formatterCharts.FIORI_LABEL_AMOUNTFORMAT
                }
            });

        },

        /** 
         * Set charts data - Amount by Issuing company
         * @private
         */
        setChartsDataAmountByIssuingCompany: function() {

            var aRequests = this.getView().getModel("ReportingRequestHeaderList").getProperty("/results");
            var oVizFrame = this.getView().byId("vfAmountbyIssuingCompany");
            var oCCAmountbyIssuingCompany = this.getView().byId("ccAmountbyIssuingCompany");
            var oAmountByCompany = {},
                aAmountByCompany = [],
                aTopCompany = [];

            // Register charts formatter
            formatterCharts.registerChartFormatters();

            // Work on data 
            aAmountByCompany = d3.nest().key(function(d) {
                return d.IsCompanyCode;
            }).rollup(function(v) {
                return d3.sum(v, function(d) {
                    return d.LocalAmount;
                });
            }).entries(aRequests);

            // Sort by amount order descending
            aAmountByCompany.sort(function(oFirstRequest, oSecondRequest) {
                return oSecondRequest["values"] - oFirstRequest["values"];
            });

            // Keep top charts company
            aTopCompany = aAmountByCompany.slice(0, parseInt(this.getComponentModel("AppData").getProperty("/REP_TOP_CHARTS_NUMB"), 10));

            // Set company name
            for (var i = 0; i < aTopCompany.length; i++) {
                aTopCompany[i]["CompanyName"] = formatterText.getCompanyNameFromCompanyCode.call(this, aTopCompany[i]["key"]);
            }

            // Set Container visibility
            oCCAmountbyIssuingCompany.setVisible(aTopCompany.length > 0 ? true : false).addStyleClass('charts');

            // Store top value in AppData model for scale calculation
            this.getComponentModel("AppData").setProperty("/ChartsMaxAmountByIssuingCompany", aTopCompany.length > 0 ? aTopCompany[0].values : 0);

            var fnLabelRenderer = function(oEvent) {
                // Display company
                var sCompanyCode = oEvent.ctx[this.oBundle.getText("charts.label.company")],
                    sLegalEntityCode;

                if (sCompanyCode !== "") {
                    sLegalEntityCode = formatterText.getLegalEntityCodeFromCompanyCode.call(this, sCompanyCode);
                    oEvent.text = sLegalEntityCode + ' - ' + sCompanyCode;
                }

            };

            // Set model into vizframe
            oAmountByCompany = {
                results: aTopCompany
            };
            oVizFrame.setModel(new JSONModel(oAmountByCompany));

            oVizFrame.setVizProperties({
                plotArea: {
                    dataLabel: {
                        visible: true,
                        formatString: formatterCharts.FIORI_LABEL_AMOUNTFORMAT
                    },
                },
                legend: {
                    title: {
                        visible: false
                    }
                },
                title: {
                    visible: true,
                    text: this.oBundle.getText("charts.title.amountbyissuingcompany")
                },
                interaction: {
                    behaviorType: null,
                    selectability: {
                        mode: "SINGLE"
                    }
                },
                valueAxis: {
                    title: {
                        visible: false
                    },
                    label: {
                        formatString: formatterCharts.FIORI_LABEL_INTEGERFORMAT_SHORT
                    }
                },
                categoryAxis: {
                    title: {
                        visible: false
                    },
                    labelRenderer: fnLabelRenderer.bind(this)
                },
                tooltip: {
                    visible: true,
                    formatString: formatterCharts.FIORI_LABEL_AMOUNTFORMAT
                }
            });

        },

        /** 
         * Set charts data - Amount by Receiving company
         * @private
         */
        setChartsDataAmountByReceivingCompany: function() {

            var aRequests = this.getView().getModel("ReportingRequestHeaderList").getProperty("/results");
            var oVizFrame = this.getView().byId("vfAmountbyReceivingCompany");
            var oCCAmountbyReceivingCompany = this.getView().byId("ccAmountbyReceivingCompany");
            var oAmountByCompany = {},
                aAmountByCompany = [],
                aTopCompany = [];

            // Register charts formatter
            formatterCharts.registerChartFormatters();

            // Work on data 
            aAmountByCompany = d3.nest().key(function(d) {
                return d.RcCompanyCode;
            }).rollup(function(v) {
                return d3.sum(v, function(d) {
                    return d.LocalAmount;
                });
            }).entries(aRequests);

            // Sort by amount order descending
            aAmountByCompany.sort(function(oFirstRequest, oSecondRequest) {
                return oSecondRequest["values"] - oFirstRequest["values"];
            });

            // Keep top charts company
            aTopCompany = aAmountByCompany.slice(0, parseInt(this.getComponentModel("AppData").getProperty("/REP_TOP_CHARTS_NUMB"), 10));

            // Set company name
            for (var i = 0; i < aTopCompany.length; i++) {
                aTopCompany[i]["CompanyName"] = formatterText.getCompanyNameFromCompanyCode.call(this, aTopCompany[i]["key"]);
            }
            // Set Container visibility
            oCCAmountbyReceivingCompany.setVisible(aTopCompany.length > 0 ? true : false).addStyleClass('charts');

            // Store top value in AppData model for scale calculation
            this.getComponentModel("AppData").setProperty("/ChartsMaxAmountByReceivingCompany", aTopCompany.length > 0 ? aTopCompany[0].values : 0);

            var fnLabelRenderer = function(oEvent) {
                // Display company
                var sCompanyCode = oEvent.ctx[this.oBundle.getText("charts.label.company")],
                    sLegalEntityCode;

                if (sCompanyCode !== "") {
                    sLegalEntityCode = formatterText.getLegalEntityCodeFromCompanyCode.call(this, sCompanyCode);
                    oEvent.text = sLegalEntityCode + ' - ' + sCompanyCode;
                }

            };

            // Set model into vizframe
            oAmountByCompany = {
                results: aTopCompany
            };
            oVizFrame.setModel(new JSONModel(oAmountByCompany));

            oVizFrame.setVizProperties({
                plotArea: {
                    dataLabel: {
                        visible: true,
                        formatString: formatterCharts.FIORI_LABEL_AMOUNTFORMAT
                    }
                },
                legend: {
                    title: {
                        visible: false
                    }
                },
                title: {
                    visible: true,
                    text: this.oBundle.getText("charts.title.amountbyreceivingcompany")
                },
                interaction: {
                    behaviorType: null,
                    selectability: {
                        mode: "SINGLE"
                    }
                },
                valueAxis: {
                    title: {
                        visible: false
                    },
                    label: {
                        formatString: formatterCharts.FIORI_LABEL_INTEGERFORMAT_SHORT
                    }
                },
                categoryAxis: {
                    title: {
                        visible: false
                    },
                    labelRenderer: fnLabelRenderer.bind(this)
                },
                tooltip: {
                    visible: true,
                    formatString: formatterCharts.FIORI_LABEL_AMOUNTFORMAT
                }
            });

        },

        /** 
         * Set same max scale for charts : Amount by issuing & receiving data
         * @private
         */
        setAmountByCompanyChartsScales: function() {

            var sAmountByIssuingCompany = this.getComponentModel("AppData").getProperty("/ChartsMaxAmountByIssuingCompany"),
                sAmountByReceivingCompany = this.getComponentModel("AppData").getProperty("/ChartsMaxAmountByReceivingCompany"),
                sAmountByStatus = this.getComponentModel("AppData").getProperty("/ChartsMaxAmountByStatus"),
                oVizFrameAmountByIssuingCompany = this.getView().byId("vfAmountbyIssuingCompany"),
                oVizFrameAmountByReceivingCompany = this.getView().byId("vfAmountbyReceivingCompany"),
                oVizFrameAmountByStatus = this.getView().byId("vfAmountbyStatus"),
                sMaxScale = utilities.roundNearest(Math.max(sAmountByIssuingCompany, sAmountByReceivingCompany, sAmountByStatus), true);

            var oScale = [{
                'feed': 'valueAxis',
                'max': sMaxScale
            }];
            oVizFrameAmountByIssuingCompany.setVizScales(oScale);
            oVizFrameAmountByReceivingCompany.setVizScales(oScale);
            oVizFrameAmountByStatus.setVizScales(oScale);

        },
        
        /** 
         * Set charts data - Requests by Interco Type
         * @private
         */
        setChartsDataRequestsByIntercoType: function() {

            var fnGetIntercoTypeColorPalette = _getIntercoTypeColorPalette;
            var fnGetCreationModeColorPalette = _getCreationModeColorPalette;

            var aRequests = this.getView().getModel("ReportingRequestHeaderList").getProperty("/results");
            var sAppType = this.getComponentModel("AppData").getProperty("/appType");
            var sIntercoType = this.getIntercoType();
            var oVizFrame = this.getView().byId("vfRequestsbyIntercoType");
            var oCCRequestsbyIntercoType = this.getView().byId("ccRequestsbyIntercoType");
            var oRequestsByIntercoType = {},
                aRequestsByIntercoType = [],
                oIntercoType = {},
                aColorPalette = [];

            this.iCountRequestsByIntercoType = aRequests.length;

            // Work on data 
            aRequestsByIntercoType = d3.nest().key(function(d) {
                return d.IntercoTypeCode;
            }).entries(aRequests);

            // Add interco type name and request count
            aRequestsByIntercoType.forEach(function(oRequest) {
                oIntercoType = utilities.findFirstItem(this.getView().getModel("IntercoTypeCollection").getProperty("/results"), "IntercoTypeCode", oRequest["key"]);
                if (oIntercoType) {
                	 oRequest.IntercoType = oIntercoType.IntercoTypeName;               	
                }
                oRequest.RequestsCount = oRequest["values"].length;
            }.bind(this));

            // Build Color palette
            aRequestsByIntercoType.forEach(function(oRequest) {
                aColorPalette.push(fnGetIntercoTypeColorPalette(oRequest.key))
            }.bind(this));

            // Set Container visibility
            //oCCRequestsbyIntercoType.setVisible(aRequestsByIntercoType.length > 0 ? true : false).addStyleClass('charts');

            var fnLabelRenderer = function(oEvent) {

                var fPercent = 0;

                if (this.iCountRequestsByIntercoType && this.iCountRequestsByIntercoType > 0) {
                    fPercent = utilities.round(oEvent.val / this.iCountRequestsByIntercoType * 100, 2);
                }

                oEvent.text = oEvent.ctx[this.oBundle.getText("charts.label.intercotype")] + " (" + fPercent + "%)";

            };

            // Set model into vizframe
            oRequestsByIntercoType = {
                results: aRequestsByIntercoType
            };
            oVizFrame.setModel(new JSONModel(oRequestsByIntercoType));

            oVizFrame.setVizProperties({
                plotArea: {
                    dataLabel: {
                        visible: true,
                        renderer: fnLabelRenderer.bind(this)
                    },
                    colorPalette: aColorPalette
                },
                legend: {
                    title: {
                        visible: false
                    },
                    visible: true
                },
                title: {
                    visible: true,
                    text: this.oBundle.getText("charts.title.requestsbyintercotype", aRequests.length.toString())
                },
                interaction: {
                    behaviorType: null,
                    selectability: {
                        mode: "SINGLE"
                    }
                },
                valueAxis: {
                    title: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: true
                    }
                },
                tooltip: {
                    visible: true,
                }
            });

        },
        
        /** 
         * Set charts data - Amount by Interco Type
         * @private
         */
        setChartsDataAmountByIntercoType: function() {

            var fnGetIntercoTypeColorPalette = _getIntercoTypeColorPalette;

            var aRequests = this.getView().getModel("ReportingRequestHeaderList").getProperty("/results");
            var sAppType = this.getComponentModel("AppData").getProperty("/appType");
            var sIntercoType = this.getIntercoType();
            var oVizFrame = this.getView().byId("vfAmountbyIntercoType");
            var oCCAmountbyIntercoType = this.getView().byId("ccAmountbyIntercoType");
            var oAmountByIntercoType = {},
                aAmountByIntercoType = [],
                oIntercoType = {},
                aColorPalette = [];
            

            // Work on data 
            aAmountByIntercoType = d3.nest().key(function(d) {
                return d.IntercoTypeCode;
            }).rollup(function(v) {
                return d3.sum(v, function(d) {
                    return d.LocalAmount;
                });
            }).entries(aRequests);
            
            // Add interco type name and request count
            aAmountByIntercoType.forEach(function(oRequest) {
                oIntercoType = utilities.findFirstItem(this.getView().getModel("IntercoTypeCollection").getProperty("/results"), "IntercoTypeCode", oRequest["key"]);
                if (oIntercoType) {
                	 oRequest.IntercoType = oIntercoType.IntercoTypeName;               	
                }
                oRequest.Amount = oRequest["values"];                
            }.bind(this));

            // Build Color palette
            aAmountByIntercoType.forEach(function(oRequest) {
                aColorPalette.push(fnGetIntercoTypeColorPalette(oRequest.key))
            }.bind(this));

            // Set Container visibility
            //oCCRequestsbyIntercoType.setVisible(aRequestsByIntercoType.length > 0 ? true : false).addStyleClass('charts');

            var fnLabelRenderer = function(oEvent) {

                var fPercent = oEvent.text;

                oEvent.text = oEvent.ctx[this.oBundle.getText("charts.label.intercotype")] + " (" + fPercent + ")";

            };

            // Set model into vizframe
            oAmountByIntercoType = {
                results: aAmountByIntercoType
            };
            oVizFrame.setModel(new JSONModel(oAmountByIntercoType));

            oVizFrame.setVizProperties({
                plotArea: {
                    dataLabel: {
                        visible: true,
                        renderer: fnLabelRenderer.bind(this)
                    },
                    colorPalette: aColorPalette
                },
                legend: {
                    title: {
                        visible: false
                    },
                    visible: true
                },
                title: {
                    visible: true,
                    text: this.oBundle.getText("charts.title.amountbyintercotype")
                },
                interaction: {
                    behaviorType: null,
                    selectability: {
                        mode: "SINGLE"
                    }
                },
                valueAxis: {
                    title: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: true
                    }
                },
                tooltip: {
                    visible: true,
                }
            });

        },
        
        /** 
         * Set charts data - Requests by Creation Mode
         * @private
         */
        setChartsDataRequestsByCreationMode: function() {

            var fnGetCreationModeColorPalette = _getCreationModeColorPalette;

            var aRequests = this.getView().getModel("ReportingRequestHeaderList").getProperty("/results");
            var sAppType = this.getComponentModel("AppData").getProperty("/appType");
            var sIntercoType = this.getIntercoType();
            var oVizFrame = this.getView().byId("vfRequestsbyCreationMode");
            var oCCRequestsbyCreationMode = this.getView().byId("ccRequestsbyCreationMode");
            var oRequestsByCreationMode = {},
                aRequestsByCreationMode = [],
                oCreationMode = {},
                aColorPalette = [];

            this.iCountRequestsByCreationMode = aRequests.length;

            aRequests = aRequests.filter(function(item) {
                if (item.IntercoTypeCode == parameters.getIntercoTypeList().Major) {
                	return true 
                } else {
                    return false
                };
            });
            
            // Work on data 
            aRequestsByCreationMode = d3.nest().key(function(d) {
                return d.CreationMode;
            }).entries(aRequests);

            // Add Creation Mode name and request count
            aRequestsByCreationMode.forEach(function(oRequest) {            	
                oCreationMode = utilities.findFirstItem(this.getView().getModel("CreationModeCollection").getProperty("/results"), "CreationModeCode", oRequest["key"]);
                if (oCreationMode) {
                	 oRequest.CreationMode = oCreationMode.CreationModeName;               	
                }
                oRequest.RequestsCount = oRequest["values"].length;
            }.bind(this));

            // Build Color palette
            aRequestsByCreationMode.forEach(function(oRequest) {
                aColorPalette.push(fnGetCreationModeColorPalette(oRequest.key))
            }.bind(this));

            // Set Container visibility
            //oCCRequestsbyIntercoType.setVisible(aRequestsByIntercoType.length > 0 ? true : false).addStyleClass('charts');

            var fnLabelRenderer = function(oEvent) {

                var fPercent = oEvent.text;

                oEvent.text = oEvent.ctx[this.oBundle.getText("charts.label.creationmode")] + " (" + fPercent + ")";

//                var fPercent = 0;
//
//                if (this.iCountRequestsByCreationMode && this.iCountRequestsByCreationMode > 0) {
//                    fPercent = utilities.round(oEvent.val / this.iCountRequestsByCreationMode * 100, 2);
//                }
//
//                oEvent.text = oEvent.ctx[this.oBundle.getText("charts.label.creationmode")] + " (" + fPercent + "%)";

            };

            // Set model into vizframe
            oRequestsByCreationMode = {
                results: aRequestsByCreationMode
            };
            oVizFrame.setModel(new JSONModel(oRequestsByCreationMode));

            oVizFrame.setVizProperties({
                plotArea: {
                    dataLabel: {
                        visible: true,
                        renderer: fnLabelRenderer.bind(this)
                    },
                    colorPalette: aColorPalette
                },
                legend: {
                    title: {
                        visible: false
                    },
                    visible: true
                },
                title: {
                    visible: true,
                    text: this.oBundle.getText("charts.title.requestsbycreationmode", aRequests.length.toString())
                },
                interaction: {
                    behaviorType: null,
                    selectability: {
                        mode: "SINGLE"
                    }
                },
                valueAxis: {
                    title: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: true
                    }
                },
                tooltip: {
                    visible: true,
                }
            });

        },        

        /** 
         * Set charts data - Amount by Creation Mode
         * @private
         */
        setChartsDataAmountByCreationMode: function() {

            var fnGetCreationModeColorPalette = _getCreationModeColorPalette;

            var aRequests = this.getView().getModel("ReportingRequestHeaderList").getProperty("/results");
            var sAppType = this.getComponentModel("AppData").getProperty("/appType");
            var sIntercoType = this.getIntercoType();
            var oVizFrame = this.getView().byId("vfAmountbyCreationMode");
            var oCCAmountbyCreationMode = this.getView().byId("ccAmountbyCreationMode");
            var oAmountByCreationMode = {},
                aAmountByCreationMode = [],
                oCreationMode = {},
                aColorPalette = [];
            

            aRequests = aRequests.filter(function(item) {
                if (item.IntercoTypeCode == parameters.getIntercoTypeList().Major) {
                	return true 
                } else {
                    return false
                };                
            });            
            
            // Work on data 
            aAmountByCreationMode = d3.nest().key(function(d) {
                return d.CreationMode;
            }).rollup(function(v) {
                return d3.sum(v, function(d) {
                    return d.LocalAmount;
                });
            }).entries(aRequests);
            
            // Add creation mode name and amount count
            aAmountByCreationMode.forEach(function(oRequest) {
                oCreationMode = utilities.findFirstItem(this.getView().getModel("CreationModeCollection").getProperty("/results"), "CreationModeCode", oRequest["key"]);
                if (oCreationMode) {
                	 oRequest.CreationMode = oCreationMode.CreationModeName;               	
                }
                oRequest.Amount = oRequest["values"];                
            }.bind(this));

            // Build Color palette
            aAmountByCreationMode.forEach(function(oRequest) {
                aColorPalette.push(fnGetCreationModeColorPalette(oRequest.key))
            }.bind(this));

            // Set Container visibility
            //oCCRequestsbyIntercoType.setVisible(aRequestsByIntercoType.length > 0 ? true : false).addStyleClass('charts');

            var fnLabelRenderer = function(oEvent) {

                var fPercent = oEvent.text;

                oEvent.text = oEvent.ctx[this.oBundle.getText("charts.label.creationmode")] + " (" + fPercent + ")";

            };

            // Set model into vizframe
            oAmountByCreationMode = {
                results: aAmountByCreationMode
            };
            oVizFrame.setModel(new JSONModel(oAmountByCreationMode));

            oVizFrame.setVizProperties({
                plotArea: {
                    dataLabel: {
                        visible: true,
                        renderer: fnLabelRenderer.bind(this)
                    },
                    colorPalette: aColorPalette
                },
                legend: {
                    title: {
                        visible: false
                    },
                    visible: true
                },
                title: {
                    visible: true,
                    text: this.oBundle.getText("charts.title.amountbycreationmode")
                },
                interaction: {
                    behaviorType: null,
                    selectability: {
                        mode: "SINGLE"
                    }
                },
                valueAxis: {
                    title: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: true
                    }
                },
                tooltip: {
                    visible: true,
                }
            });

        },
    };
    
    return oCharts;

}, true);