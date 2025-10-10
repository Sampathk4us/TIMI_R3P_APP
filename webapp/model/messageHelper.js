/************************************************************************
* Project            : TIMI                                 			*
* Process            : FI                                              	*
* Task code          : FI062                                           	*
* Functional document:                                					*
* Technical document :                                    				*
*-----------------------------------------------------------------------*
* File       	: model/messageHelper.js   	        					*
* Author        : David TEA                                            	*
* Company       : Resp                                               	*
* Creation Date : 24/09/2017                                           	*
*-----------------------------------------------------------------------*
* Description   : Provides message functions   							*		
*                                                                      	*
*************************************************************************
* Modification nÂ° ...........	: 										*
* Project ...................	: 										*
* Author .................... 	:                       	 			*
*-----------------------------------------------------------------------*
* Modification date ......... 	: 	 									*
* Transport order ........... 	:  										*
* Change Request ............ 	: 	  									*
* Description ............... 	: 	 									*
*************************************************************************
/**
* @fileOverview Provides utilities for OData service 
* @author David Tea 
* @version 1.0
*/
sap.ui.define([
    "sap/ui/layout/VerticalLayout",
    "sap/ui/model/json/JSONModel",
    "sap/m/Button",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Dialog",
    "sap/m/FlexBox",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/ObjectIdentifier",
    "sap/m/Table",
    "sap/m/Text",
    "sap/m/VBox"
], function(VerticalLayout, JSONModel, Button, Column, ColumnListItem, Dialog, FlexBox, MessageToast, MessageBox, ObjectIdentifier, Table, Text, VBox) {
    'use strict';
    
    function _getResourceBundle() {
        if (this.oBundle !== undefined) {
            return this.oBundle;
        } else {
            return this.getModel("i18n").getResourceBundle();
        }
    };
    
    function _handleODataFailed(oError) {

        var sTitle = "",
            oResponseBody = {},
            aErrorDetails = [],
            aMessages = [];

        /* Title */
        try {
            if (oError && oError.statusCode !== undefined) {
                sTitle = oError.statusCode + " - " + oError.statusText;
            } else if (oError && oError.message !== undefined) {
                sTitle = oError.message;
            }
        } catch (oException) {

        } finally {
            if (sTitle === "") {
                sTitle = oError && oError.title ? oError.title : this.oBundle.getText("messagebox.error.title");
            }
        }

        /* Content */
        try {
            if (oError && oError.responseText !== undefined) {
                oResponseBody = JSON.parse(oError.responseText);
                if (oResponseBody && oResponseBody.error.innererror && oResponseBody.error.innererror.errordetails) {
                    aErrorDetails = oResponseBody.error.innererror.errordetails;
                    if (aErrorDetails.length > 0) {
                        aMessages = aErrorDetails.map(function(oMessage) {
                            return oMessage.message;
                        })
                    }
                }
                if (aMessages.length === 0) {
                    aMessages.push(oResponseBody.error.message.value);
                }
            }
            if (aMessages.length === 0) {
                aMessages.push(oError.response.body);
            }
        } catch (oException) {

        } 

        /* Content */
        try {
        	aMessages.push($(jQuery.parseXML(oError.responseText).children[0].innerHTML)[1].textContent);
        } catch (oException) {

        } 
        
        if (aMessages.length === 0) {
            if (oError && oError.messages) {
                aMessages = oError && oError.messages;
            } else if (oError && oError.message) {
                aMessages = [oError.message];
            }
        }

        return {
            "title": sTitle,
            "message": "",
            "messages": aMessages
        };

    };

    function _showErrorMessageBox(sTitle, aMessages, fnOnClose) {

        var oContent = new VerticalLayout(),
            aContent = [];

        aContent = aMessages.map(function(sMessage) {
            return new Text({
                "text": sMessage
            });
        });
        aContent.forEach(function(oItem) {
            oContent.addContent(oItem);
        });

        // Show message in message box
        MessageBox.show(oContent, {
            "icon": MessageBox.Icon.ERROR,
            "title": sTitle,
            "actions": MessageBox.Action.OK,
            "onClose": fnOnClose !== undefined ? fnOnClose : null,
            "styleClass": "sapUiSizeCompact",
        });

    };

    function _showMessageToast(sMessage, fnOnClose) {

        MessageToast.show(sMessage, {
            "onClose": fnOnClose !== undefined ? fnOnClose : null,
            "closeOnBrowserNavigation": false
        });

    };

    var oMessage = {

        getODataMessages : function(oError){
        	
        	var fnHandleODataFailed = _handleODataFailed
        	return fnHandleODataFailed.call(this, oError);
        	
        },
    		
        showMessageToast: function(sMessage, fnOnClose) {

            var fnShowMessageToast = _showMessageToast;
            fnShowMessageToast(sMessage, fnOnClose);

        },

        showErrorMessageBox: function(sTitle, aMessages, fnOnClose) {

            var fnShowErrorMessageBox = _showErrorMessageBox;
            fnShowErrorMessageBox(sTitle, aMessages, fnOnClose);

        },

        showODataFailedMessages: function(oError, fnOnClose) {

            var fnHandleODataFailed = _handleODataFailed,
                fnShowErrorMessageBox = _showErrorMessageBox,
                fnGetResourceBundle = _getResourceBundle,
                oBundle = {};
            
            oBundle = fnGetResourceBundle.apply(this);
            oMessage = fnHandleODataFailed.call(this, oError);

            if (oMessage && oMessage["messages"].length > 0) {
                //                fnShowErrorMessageBox.call(this, oMessage["title"], oMessage["messages"], fnOnClose);
                fnShowErrorMessageBox.call(this, oBundle.getText("messagebox.error.title"), oMessage["messages"], fnOnClose);
            }

        },
        
        /**
         * Clear Messages model 
         * @public
         */
        resetRequestMessagesModel: function() {

            var oModel = {
                results: []
            };

            this.setComponentModel(new JSONModel(oModel), "Messages");

        },

        /**
         * Set an array of messages into a model  
         * 
         * @param {object[]} aMessages the list of messages to set into Messages model
         * @public
         */
        setRequestMessagesModel: function(aMessages) {

            // set messages into model
            var oModel = {
                results: []
            };

            for (var i = 0; i < aMessages.length; i++) {
                oModel.results.push({
                    "message": aMessages[i].Message
                });
            }

            // Set model into component
            this.setComponentModel(new JSONModel(oModel), "Messages");

        },
        
        showRequestsActionsErrors : function(aErrorMessages){
        	
			var oDialog = {},
			    oTable = new Table({
					"columns" : [
						new Column({ "header" : new Text({"text" : this.oBundle.getText("request.table.column.request") }), "width" : "5rem", "hAlign" : "Center" }),
						new Column({ "header" : new Text({"text" : this.oBundle.getText("label.messages") }) })
					]
			    });
			
			for(var i=0;i<aErrorMessages.length; i++){
				var oVBoxMessage = new VBox().addStyleClass("sapUiTinyMarginTopBottom");
				for(var j=0; j<aErrorMessages[i]["Messages"].length; j++){
					if(aErrorMessages[i]["Messages"][j].Description !== ""){
						oVBoxMessage.addItem(new Text({"text" : aErrorMessages[i]["Messages"][j].Description }));
					}
				}
				oTable.addItem(new ColumnListItem()
									.addCell(new ObjectIdentifier({ "text" : aErrorMessages[i]["RequestId"] }))
									.addCell(oVBoxMessage));
			}
			
			oDialog = new Dialog({
				title: this.oBundle.getText("messagebox.error.title"),
				type: 'Message',
				state: 'Error',
				content: oTable,
				beginButton: new Button({
					text: this.oBundle.getText("button.confirmation.yes"),
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function() {
					oDialog.destroy();
				}
			}).setModel(new JSONModel(aErrorMessages), "ErrorMessages");

			oDialog.getModel("ErrorMessages").updateBindings();
			oDialog.open();
        	
        },
        
    };

    return oMessage;

}, true);