/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : view/Item.controller.js   	        				*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 12/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Request item view controller   						*		
 *                                                                      *
 ************************************************************************
 * Modification nÂ° ........... : 					                    *
 * Project ................... : 					                    *
 * Author .................... :                                        *
 *----------------------------------------------------------------------*
 * Modification date ......... : 					                    *
 * Transport order ........... : 					                    *
 * Change Request ............ : 					                    *
 * Description ............... : 					                    *
 ************************************************************************/
/**
 * @fileOverview Request item view controller
 * @author David Tea
 * @version 1.0
 */
sap.ui.define([
    "cus/fi/timi/rel/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "cus/fi/timi/rel/model/businessRules",
    "cus/fi/timi/rel/model/dataValidation",
    "cus/fi/timi/rel/model/formatterFormat",
    "cus/fi/timi/rel/model/formatterState",
    "cus/fi/timi/rel/model/formatterText",
    "cus/fi/timi/rel/model/formatterVisibility",
    "cus/fi/timi/rel/model/messageHelper",
    "cus/fi/timi/rel/model/miscellaneous",
    "cus/fi/timi/rel/model/odataService",
    "cus/fi/timi/rel/model/parameters",
    "cus/fi/timi/rel/model/requestModel",
    "cus/fi/timi/rel/model/tsdHelper",
    "cus/fi/timi/rel/assets/js/helpers/utilities",
    "cus/fi/timi/rel/assets/js/helpers/busy"
], function(BaseController, JSONModel, businessRules, dataValidation, formatterFormat, formatterState, formatterText, formatterVisibility, messageHelper, miscellaneous, odataService, parameters, requestModel, tsdHelper, utilities, busy) {
    "use strict";

    return BaseController.extend("cus.fi.timi.rel.controller.Item", {

        formatterFormat: formatterFormat,
        formatterState: formatterState,
        formatterText: formatterText,
        formatterVisibility: formatterVisibility,
        businessRules: businessRules,

        /**
         * Called when a controller is instantiated and its View controls (if
         * available) are already created. Can be used to modify the View before
         * it is displayed, to bind event handlers and do other one-time
         * initialization.
         * 
         * @memberOf view.RequestItem
         */
        onInit: function() {

            /**
             * Component defined routes
             * 
             * @type {sap.ui.core.routing.Router}
             */
            this.oRouter = this.getRouter();

            /**
             * Component defined ODataModel
             * 
             * @type {sap.ui.model.odata.ODataModel}
             */
            this.oDataModel = this.getComponentModel("YWS_FI062_TIMI");

            /**
             * Component defined localization resource model
             * 
             * @type {sap.ui.model.resource.ResourceModel}
             */
            this.oBundle = this.getResourceBundle();

            /**
             * Attach on target navigation event match
             */
            this.oRouter.getTargets("item").attachDisplay(this._onTargetMatched, this);

            /**
             * Call _setStyle method
             */
            this._setStyle();

        },

        /**
         * Handles target matched function
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        _onTargetMatched: function(oEvent) {

            this._oTargetData = oEvent.getParameter("data"); // store the
            // data for
            // reuse in the
            // navback
            // function
            this._oItemInfo = this.getComponentModel("ItemInfo");

            // Bind Request item context data in the view
            this.getView().bindElement({
                path: this._oItemInfo.getProperty("/ItemContextPath"),
                model: "Request"
            });

            // Bind fields parameters
            switch (this._oItemInfo.getProperty("/ItemType")) {
                case parameters.getItemTypeList().Issuing:
                    this.getView().bindElement({
                        path: "/ISSUING_ITEMS",
                        model: "FieldsAttributes"
                    });
                    break;
                case parameters.getItemTypeList().Receiving:
                    this.getView().bindElement({
                        path: "/RECEIVING_ITEMS",
                        model: "FieldsAttributes"
                    });
                    break;
                default:
                    break;
            }

            // Set Previous & Next Button enabled status
            this.setItemNavigationButtonEnableState();

        },

        /**
         * Set view styles & css classes
         * 
         * @private
         */
        _setStyle: function() {

            // Set view compact/cosy class
            // this.getView().addStyleClass(this.getContentDensityClass());

        },

        /**
         * Set Previous & Next Button enabled status
         * 
         * @private
         */
        setItemNavigationButtonEnableState: function() {

            var sNextContextPath = this.getPrevNextItemContextPath(this._oItemInfo.getProperty("/ItemContextPath"), this._oItemInfo.getProperty("/ItemType"), "Next");
            var sPreviousContextPath = this.getPrevNextItemContextPath(this._oItemInfo.getProperty("/ItemContextPath"), this._oItemInfo.getProperty("/ItemType"), "Previous");
            var oBtnNavigateNextItem = this.getView().byId("btnNavigateNextItem");
            var oBtnNavigatePreviousItem = this.getView().byId("btnNavigatePreviousItem");

            oBtnNavigateNextItem.setEnabled(sNextContextPath === "" ? false : true);
            oBtnNavigatePreviousItem.setEnabled(sPreviousContextPath === "" ? false : true);

        },

        /**
         * Back navigation function. Override base controller
         * 
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onNavBack: function(oEvent) {
            // in some cases we could display a certain target when the back
            // button is pressed
            if (this._oTargetData && this._oTargetData.fromTarget) {
                this.getRouter().getTargets().display(this._oTargetData.fromTarget, {
                    fromTarget: "item"
                });
                return;
            }
            // call the parent's onNavBack
            BaseController.prototype.onNavBack.apply(this, arguments);
        },

        /**
         * Get the previous/next item context path with flag delete = false
         * 
         * @param {string}
         *                sCurrentContextPath the current item context path
         * @param {string}
         *                sItemType the item type (01 Issuing / 02 Receiving)
         * @param {string}
         *                sDirection the direction (next/previous)
         * @private
         * @returns {string} the next item context path
         */
        getPrevNextItemContextPath: function(sCurrentContextPath, sItemType, sDirection) {

            var aItems = [],
                iItemsCount = 0,
                aContextData = [],
                iItemIndex = 0,
                iContextSplitLength = 0,
                sNextContextPath = "",
                oRequestModel = {},
                i = 0;
            oRequestModel = this.getComponentModel("Request");
            aContextData = sCurrentContextPath.split("/");
            iItemIndex = parseInt(aContextData.pop(), 10);
            iContextSplitLength = aContextData.length;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    // Get Issuing Items
                    aItems = oRequestModel.getProperty("/IssuingItems").results;
                    break;
                case parameters.getItemTypeList().Receiving:
                    // Get Receiving Items
                    aItems = oRequestModel.getProperty("/ReceivingItems").results;
                    break;
                default:
                    return "";
            }

            iItemsCount = aItems.length;

            switch (sDirection) {
                case "Previous":
                    for (i = iItemIndex; i > 0; i--) {
                        // Set next item index into array
                        aContextData[iContextSplitLength] = i - 1;
                        // Rebuild context path
                        sNextContextPath = aContextData.join("/");
                        // Check item is not delete
                        if (oRequestModel.getProperty(sNextContextPath) && oRequestModel.getProperty(sNextContextPath).FlagDelete === false) {
                            return sNextContextPath;
                        }
                    }
                    break;
                case "Next":
                    for (i = iItemIndex; i < iItemsCount; i++) {
                        // Set previous item index into array
                        aContextData[iContextSplitLength] = i + 1;
                        // Rebuild context path
                        sNextContextPath = aContextData.join("/");
                        // Check item is not delete
                        if (oRequestModel.getProperty(sNextContextPath) && oRequestModel.getProperty(sNextContextPath).FlagDelete === false) {
                            return sNextContextPath;
                        }
                    }
                    break;
                default:
                    break;
            }
            return "";
        },

        /**
         * Handles press to navigate to next items
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressNavigateNextItem: function(oEvent) {

            var sNextContextPath = this.getPrevNextItemContextPath(this._oItemInfo.getProperty("/ItemContextPath"), this._oItemInfo.getProperty("/ItemType"), "Next");

            // Bind Request item context data in the view
            this.getView().bindElement({
                path: sNextContextPath,
                model: "Request"
            });
            // Update Item Info model
            this._oItemInfo.setProperty("/ItemContextPath", sNextContextPath);

            // Set Previous & Next Button enabled status
            this.setItemNavigationButtonEnableState();

        },

        /**
         * Handles press to navigate to previous items
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressNavigatePreviousItem: function(oEvent) {

            var sPreviousContextPath = this.getPrevNextItemContextPath(this._oItemInfo.getProperty("/ItemContextPath"), this._oItemInfo.getProperty("/ItemType"), "Previous");

            // Bind Request item context data in the view
            this.getView().bindElement({
                path: sPreviousContextPath,
                model: "Request"
            });
            // Update Item Info model
            this._oItemInfo.setProperty("/ItemContextPath", sPreviousContextPath);

            // Set Previous & Next Button enabled status
            this.setItemNavigationButtonEnableState();

        },

        /**
         * Handle change event on item amount input
         * 
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemAmount: function(oEvent) {

            var sItemPath = this._oItemInfo.getProperty("/ItemContextPath");
            var sPropertyPathPercentage = sItemPath + "/Percentage";

            // Set percentage to 0.00
            this.getComponentModel("Request").setProperty(sPropertyPathPercentage, '0.00');
            // Update Item TotalAmount
            miscellaneous.updateItemTotalAmount.call(this, sItemPath);

            // Set request change flag
            this.setRequestChangedFlag(true);

        },

        /**
         * Handle change event on item markup input
         * 
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemMarkup: function(oEvent) {

            var sItemPath = this._oItemInfo.getProperty("/ItemContextPath");

            // Update Item TotalAmount
            miscellaneous.updateItemTotalAmount.call(this, sItemPath);

            // Set request change flag
            this.setRequestChangedFlag(true);

        },

        /**
         * Handles press event on add new item
         * 
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressAddNewItem: function(oEvent) {

            var oRequestItem = {},
                iItemsCount, sItemPath;
            var oRequestModel = this.getComponentModel("Request");
            var sItemType = this._oItemInfo.getProperty("/ItemType");
            var sInvoiceType = oRequestModel.getProperty("/HeaderData/DocumentTypeCode");

            oRequestItem = odataService.createODataEntityObject(this.oDataModel, "RequestItem", []);

            oRequestItem.RequestId = oRequestModel.getProperty("/HeaderData/RequestId");
            oRequestItem.TypeId = oRequestModel.getProperty("/HeaderData/TypeId");
            oRequestItem.ItemType = sItemType;
            oRequestItem.DCIndicator = businessRules.getDefaultDCInd(sInvoiceType, sItemType);

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    iItemsCount = this.getComponentModel("Request").getProperty("/IssuingItems/results").length;
                    oRequestItem.ItemId = (iItemsCount + 1).toString();
                    this.getComponentModel("Request").getProperty("/IssuingItems/results").push(oRequestItem);
                    sItemPath = "/IssuingItems/results" + "/" + iItemsCount.toString();

                    // Set request change flag
                    this.setRequestChangedFlag(true);
                    break;
                case parameters.getItemTypeList().Receiving:
                    iItemsCount = this.getComponentModel("Request").getProperty("/ReceivingItems/results").length;
                    oRequestItem.ItemId = (iItemsCount + 1).toString();
                    this.getComponentModel("Request").getProperty("/ReceivingItems/results").push(oRequestItem);
                    sItemPath = "/ReceivingItems/results" + "/" + iItemsCount.toString();

                    // Set request change flag
                    this.setRequestChangedFlag(true);
                    break;
                default:
                    break;
            }

            // Bind Request item context data in the view
            if (sItemPath) {
                this.getView().bindElement({
                    path: sItemPath,
                    model: "Request"
                });
                // Update Item Info model
                this._oItemInfo.setProperty("/ItemContextPath", sItemPath);
                // Set Previous & Next Button enabled status
                this.setItemNavigationButtonEnableState();
            }

        },

        /**
         * Handles press event on duplicate item
         * 
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressDuplicateItem: function(oEvent) {

            var oNIInput = {},
                sItemPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType");

            // create delete request responsive popover
            if (!this._oDialogDuplicateRequestItem) {
                this._oDialogDuplicateRequestItem = sap.ui.xmlfragment(this.createId("frgtDuplicateRequestItem"), "cus.fi.timi.rel.view.fragment.RequestDuplicateItemDialog", this);
                this.getView().addDependent(this._oDialogDuplicateRequestItem);
            }

            oNIInput = this.byId(sap.ui.core.Fragment.createId("frgtDuplicateRequestItem", "niTimes"));
            oNIInput.setValue("1");

            // Add request id to the dialog
            this._oDialogDuplicateRequestItem.data("ItemPath", sItemPath);
            this._oDialogDuplicateRequestItem.data("ItemType", sItemType);

            this._oDialogDuplicateRequestItem.open();

        },

        /**
         * on press cancellation on request duplication
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressConfirmDuplicateRequestItem: function(oEvent) {

            var oNIInput = this.byId(sap.ui.core.Fragment.createId("frgtDuplicateRequestItem", "niTimes")),
                oRequestModel = this.getComponentModel("Request"),
                oRequestItem = null,
                sNewItemPath = "",
                sItemPath = this._oDialogDuplicateRequestItem.data("ItemPath"),
                sItemType = this._oDialogDuplicateRequestItem.data("ItemType"),
                iNbTimes = oNIInput.getValue(),
                i = 0;

            for (i = 0; i < iNbTimes; i++) {
                switch (sItemType) {
                    case parameters.getItemTypeList().Issuing:
                        oRequestItem = businessRules.initiateDuplicateItem.call(this, sItemType, sItemPath);
                        oRequestModel.getProperty("/IssuingItems/results").push(oRequestItem);
                        sNewItemPath = "/IssuingItems/results" + "/" + (oRequestItem.ItemId - 1);

                        // Set request change flag
                        this.setRequestChangedFlag(true);
                        break;
                    case parameters.getItemTypeList().Receiving:
                        oRequestItem = businessRules.initiateDuplicateItem.call(this, sItemType, sItemPath);
                        oRequestModel.getProperty("/ReceivingItems/results").push(oRequestItem);
                        sNewItemPath = "/ReceivingItems/results" + "/" + (oRequestItem.ItemId - 1);

                        // Set request change flag
                        this.setRequestChangedFlag(true);
                        break;
                    default:
                        break;
                }
            }

            // Bind Request item context data in the view
            if (sNewItemPath) {
                this.getView().bindElement({
                    path: sNewItemPath,
                    model: "Request"
                });
                // Update Item Info model
                this._oItemInfo.setProperty("/ItemContextPath", sNewItemPath);
                // Set Previous & Next Button enabled status
                this.setItemNavigationButtonEnableState();
            }

            // close dialog
            this._oDialogDuplicateRequestItem.close();

        },

        /**
         * on press cancellation on request duplication
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressCancelDuplicateRequestItem: function(oEvent) {
            // close dialog
            this._oDialogDuplicateRequestItem.close();
        },


        /**
         * Handles press event on add markup item
         * 
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressAddMarkupItem: function(oEvent) {

            var oRequestItem = {},
                iItemsCount;
            var sItemPath = this._oItemInfo.getProperty("/ItemContextPath");
            var oRequestModel = this.getComponentModel("Request");
            var sItemType = this._oItemInfo.getProperty("/ItemType");

            oRequestItem = odataService.createODataEntityObject(this.oDataModel, "RequestItem", []);

            // Copy properties
            utilities.copyProperties(oRequestItem, oRequestModel.getProperty(sItemPath));
            //Set Percentage to 0
            oRequestItem.Percentage = 0;
            // Calculate markup amount
            oRequestItem.Amount = businessRules.getMarkupAmount.call(this, oRequestItem.Amount);

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    iItemsCount = this.getComponentModel("Request").getProperty("/IssuingItems/results").length;
                    oRequestItem.ItemId = (iItemsCount + 1).toString();
                    this.getComponentModel("Request").getProperty("/IssuingItems/results").push(oRequestItem);
                    sItemPath = "/IssuingItems/results" + "/" + iItemsCount.toString();

                    // Set request change flag
                    this.setRequestChangedFlag(true);
                    break;
                case parameters.getItemTypeList().Receiving:
                    iItemsCount = this.getComponentModel("Request").getProperty("/ReceivingItems/results").length;
                    oRequestItem.ItemId = (iItemsCount + 1).toString();
                    this.getComponentModel("Request").getProperty("/ReceivingItems/results").push(oRequestItem);
                    sItemPath = "/ReceivingItems/results" + "/" + iItemsCount.toString();

                    // Set request change flag
                    this.setRequestChangedFlag(true);
                    break;
                default:
                    break;
            }

            // Bind Request item context data in the view
            if (sItemPath) {
                this.getView().bindElement({
                    path: sItemPath,
                    model: "Request"
                });
                // Update Item Info model
                this._oItemInfo.setProperty("/ItemContextPath", sItemPath);
                // Set Previous & Next Button enabled status
                this.setItemNavigationButtonEnableState();
            }

        },

        /**
         * Handles press event on delete item
         * 
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressDeleteItem: function(oEvent) {

            var sNextContextPath, sPreviousContextPath;
            var sItemPath = this._oItemInfo.getProperty("/ItemContextPath");
            var sItemDeleteFlagPath = sItemPath + "/FlagDelete";
            var sItemType = this._oItemInfo.getProperty("/ItemType");

            this.getComponentModel("Request").setProperty(sItemDeleteFlagPath, true);

            //Update business area collection
            businessRules.setBusinessAreaCollection.call(this, sItemType);

            // Set request change flag
            this.setRequestChangedFlag(true);

            //When deleted, nav to next item, if not nav to previous item, if not nav back
            sNextContextPath = this.getPrevNextItemContextPath(this._oItemInfo.getProperty("/ItemContextPath"), this._oItemInfo.getProperty("/ItemType"), "Next");
            sPreviousContextPath = this.getPrevNextItemContextPath(this._oItemInfo.getProperty("/ItemContextPath"), this._oItemInfo.getProperty("/ItemType"), "Previous");

            if (sNextContextPath !== "") {
                this.onPressNavigateNextItem();
            } else if (sPreviousContextPath !== "") {
                this.onPressNavigatePreviousItem();
            } else {
                this.onNavBack();
            }

        },

        /**
         * Handles press event on OK button
         * 
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onPressItemOk: function(oEvent) {
            this.onNavBack();
        },

        /**
         * Handles press on value help request nature
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onValueHelpItemNature: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemNature;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemNature;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                default:
                    break;
            }

        },

        /**
         * Handles press on value help request item gl account
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onValueHelpItemAccount: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemAccount;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemAccount;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                default:
                    break;
            }
        },

        /**
         * Handles press on value help request cost center
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onValueHelpItemCostCenter: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemCostCenter;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemCostCenter;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                default:
                    break;
            }

        },

        /**
         * Handles press on value help request internal order
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onValueHelpItemInternalOrder: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemInternalOrder;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemInternalOrder;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                default:
                    break;
            }

        },

        /**
         * Handles press on value help request WBS
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onValueHelpItemWBS: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemWBS;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemWBS;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                default:
                    break;
            }

        },

        /**
         * Handles press on value help request item tax
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onValueHelpItemTax: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemTax;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemTax;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                default:
                    break;
            }
        },

        /**
         * Handles press on value help request item tax
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onValueHelpItemHsnSac: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemHsnSac;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemHsnSac;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                default:
                    break;
            }
        },      

        /**
         * Handles press on value help request item tax
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onValueHelpItemBusinessPlace: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemBusinessPlace;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemBusinessPlace;
                    tsdHelper.initiateTSD.call(this, sDataFieldTypeId, sPath, false, function(oItem) {
                        requestModel.handleDataValidation.call(this, sDataFieldTypeId, sPath, oItem);
                        // Set request change flag
                        this.setRequestChangedFlag(true);
                    }.bind(this));
                    break;
                default:
                    break;
            }
        },          
        
        /**
         * Handles change on item cost center value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemCostCenter: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemCostCenter;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemCostCenter;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                default:
                    break;
            }

        },

        /**
         * Handles change on item internal order value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemInternalOrder: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemInternalOrder;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemInternalOrder;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                default:
                    break;
            }

        },

        /**
         * Handles change on item WBS value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemWBS: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemWBS;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemWBS;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                default:
                    break;
            }

        },

        /**
         * Handles change on item nature value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemNature: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemNature;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemNature;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                default:
                    break;
            }

        },

        /**
         * Handles change on item account value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemAccount: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemAccount;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemAccount;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                default:
                    break;
            }
        },

        /**
         * Handles change on item tax value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemTax: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemTax;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemTax;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                default:
                    break;
            }
        },



        /**
         * Handles change on item tax value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemHsnSac: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemHsnSac;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemHsnSac;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                default:
                    break;
            }
        },

        /**
         * Handles change on item tax value
         * 
         * @event
         * @param {eventObject}
         *                oEvent the event data
         * @public
         */
        onChangeItemBusinessPlace: function(oEvent) {

            var sPath = this._oItemInfo.getProperty("/ItemContextPath"),
                sItemType = this._oItemInfo.getProperty("/ItemType"),
                sValue = oEvent.getParameter("value"),
                sDataFieldTypeId;

            switch (sItemType) {
                case parameters.getItemTypeList().Issuing:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().IssuingItemBusinessPlace;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                case parameters.getItemTypeList().Receiving:
                    sDataFieldTypeId = parameters.getDataFieldTypeList().ReceivingItemBusinessPlace;
                    dataValidation.validateValue.call(this, sDataFieldTypeId, sValue, sPath)
                        .then(requestModel.handleDataValidation.bind(this, sDataFieldTypeId, sPath))
                        .catch(requestModel.handleDataValidationFailed.bind(this, sDataFieldTypeId, sPath, true))
                        .then(function() {
                            // Set request change flag
                            this.setRequestChangedFlag(true);
                        }.bind(this));
                    break;
                default:
                    break;
            }
        },
        
        onChangeGeneric: function(oEvent) {

            // Set request change flag
            this.setRequestChangedFlag(true);

        },

    });
}, true);