/************************************************************************
* Project            : TIMI                                 			*
* Process            : FI                                              	*
* Task code          : FI062                                           	*
* Functional document:                                					*
* Technical document :                                    				*
*-----------------------------------------------------------------------*
* File       		: model/routerHelper.js   	        				*
* Author        	: David TEA                                         *
* Company       	: Resp                                              *
* Creation Date 	: 26/09/2017                                        *
*-----------------------------------------------------------------------*
* Description   : Provides custom router functions 						*		
*                                                                      	*
*************************************************************************
* Modification nÂ° ...........	: 										*
* Project ...................	: 										*
* Author .................... :                       	 				*
*-----------------------------------------------------------------------*
* Modification date ......... 	: 	 									*
* Transport order ........... 	:  										*
* Change Request ............ 	: 	  									*
* Description ............... 	: 	 									*
*************************************************************************
/**
* @fileOverview Provides sorter functions
* @author David Tea 
* @version 1.0
*/
sap.ui.define([
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/ui/core/CustomData",
	"sap/ui/core/routing/History",
    "cus/fi/timi/rel/model/businessRules",
    "cus/fi/timi/rel/model/parameters"
], function(Button, Dialog, Text, CustomData, History, businessRules, parameters) {
    'use strict';

    function _navigateToDefault() {

        var oRouter = this.getRouter(),
            sAppAction = this.getAppAction();

        switch (sAppAction) {
            case parameters.getAppActionList().Reporting:
                this.getRouter().navTo("reporting", {}, true /*no history*/ );
                break;
            case parameters.getAppActionList().Managing:
                this.getRouter().navTo("overview", {}, true /*no history*/ );
                break;
            default:
                oRouter.getTargets().display("notFound");
                break;
        }

    };

    var oRouter = {

        navToDefault: function() {

            var fnNavigateToDefault = _navigateToDefault;

            fnNavigateToDefault.apply(this);

        },

        navBack: function() {

            var oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash(),
                fnNavigateToDefault = _navigateToDefault;

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                fnNavigateToDefault.apply(this);
            }

        },

        navToOverview: function(bCheckDataHasChanged) {


            var bShowMessage = false,
                oDialog = {},
                sStatus = this.getComponentModel("Request").getProperty("/StatusId"),
                sAppType = this.getAppType(),
                fnNavigateToDefault = _navigateToDefault;

            if (bCheckDataHasChanged) {
                // Check whether request has been saved before navigating back
            	if(businessRules.isAppR3PIssuer(this.getIntercoType(), this.getAppType())){
                    switch (sStatus) {
	                    case parameters.getStatusList().Draft:
	                    case parameters.getStatusList().RejectedIssuer:
	                        bShowMessage = true;
	                        break;
	                    default:
	                        bShowMessage = false;
	                        break;
	                }
            	}
            	
            	if(businessRules.isAppR3PReceiver(this.getIntercoType(), this.getAppType())){
                    switch (sStatus) {
	                    case parameters.getStatusList().Submitted:
	                    case parameters.getStatusList().RejectedReceiver:
	                        bShowMessage = true;
	                        break;
	                    default:
	                        bShowMessage = false;
	                        break;
	                }
            	}
            	
            	if(businessRules.isAppR3PAccountant(this.getIntercoType(), this.getAppType())){
                    switch (sStatus) {
	                    case parameters.getStatusList().Approved:
	                    case parameters.getStatusList().Validated:
	                        bShowMessage = true;
	                        break;
	                    default:
	                        bShowMessage = false;
	                        break;
	                }
            	}
            	
            }

            if (bShowMessage === true) {

                oDialog = new Dialog({
                    "type": "Message",
                    "state": "Warning",
                    "class": "sapUiSizeCompact",
                    "title": this.oBundle.getText("request.leave.title"),
                    "content": new Text({
                        "text": this.oBundle.getText("request.leave.message")
                    }),
                    "beginButton": new Button({
                        "text": this.oBundle.getText("button.confirmation.yes"),
                        "press": (function() {
                            oDialog.close();
                            // if confirmed, navigate to overview page
                            fnNavigateToDefault.apply(this);
                        }).bind(this)
                    }).addCustomData(new CustomData({
                        "key": "custombuttoncolor",
                        "value": "green",
                        "writeToDom": true
                    })),
                    "endButton": new Button({
                        "text": this.oBundle.getText("button.confirmation.no"),
                        "press": function() {
                            oDialog.close();
                        }
                    }).addCustomData(new CustomData({
                        "key": "custombuttoncolor",
                        "value": "red",
                        "writeToDom": true
                    })),
                    "afterClose": function() {
                        oDialog.destroy();
                    }
                })

                oDialog.addStyleClass("timi")
                    .addStyleClass("popup")

                oDialog.open();

            } else {

                fnNavigateToDefault.apply(this);
            }

        },
    };

    return oRouter;

});