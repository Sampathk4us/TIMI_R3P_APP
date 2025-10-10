/************************************************************************
 * Project            : TIMI                                 			*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/variantManagement.js   	        			*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 02/02/2017                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides variant management functions   				*		
 *                                                                      *
 ************************************************************************
 * Modification n° ........... : 										*
 * Project ................... : 										*
 * Author .................... :                                        *
 *----------------------------------------------------------------------*
 * Modification date ......... : 										*
 * Transport order ........... : 										*
 * Change Request ............ : 										*
 * Description ............... : 										*
 ************************************************************************/
/**
 * @fileOverview Variant management functions
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "cus/fi/timi/rel/model/businessRules",
    "cus/fi/timi/rel/model/formatterText",
    "cus/fi/timi/rel/model/parameters",
    "cus/fi/timi/rel/model/ushellPersonalization"
], function(JSONModel, businessRules, formatterText, parameters, ushellPersonalization) {
    "use strict";

    /**
     * Get the request items variant management control id 
     * @param {string} sItemType the item type
     * @private
     * @returns {string} the variant management id
     */
    function _getRequestItemsVariantManagementControlId(sItemType) {
        switch (sItemType) {
            case parameters.getItemTypeList().Issuing:
                return parameters.getVariantManagementControlIdList().RequestIssuingItems;
            case parameters.getItemTypeList().Receiving:
                return parameters.getVariantManagementControlIdList().RequestReceivingItems;
            default:
                return '';
                break;
        }
    };

    /**
     * Get the request items variant JSON Model name
     * @param {string} sItemType the item type
     * @private
     * @returns {string} the model name
     */
    function _getRequestItemsVariantJSONModelName(sItemType) {
        switch (sItemType) {
            case parameters.getItemTypeList().Issuing:
                return parameters.getVariantJSONModelNameList().RequestIssuingItems;
            case parameters.getItemTypeList().Receiving:
                return parameters.getVariantJSONModelNameList().RequestReceivingItems;
            default:
                return '';
                break;
        }
    };

    /**
     * Get the request items ushell personalization variant set name
     * @param {string} sItemType the item type
     * @private
     * @returns {string} the variant set name
     */
    function _getRequestItemsUShellPersonalizationVariantSetName(sItemType) {
        switch (sItemType) {
            case parameters.getItemTypeList().Issuing:
                return parameters.getUShellPersonalizationVariantSetNameList().RequestIssuingItems;
                break;
            case parameters.getItemTypeList().Receiving:
                return parameters.getUShellPersonalizationVariantSetNameList().RequestReceivingItems;
                break;
            default:
                return '';
                break;
        }
    };

    /**
     * Get the request items table id 
     * @param {string} sItemType the item type
     * @public
     * @returns {string} the table id
     */
    function _getRequestItemsTableId(sItemType) {
        switch (sItemType) {
            case parameters.getItemTypeList().Issuing:
                return parameters.getTableControlIdList().RequestIssuingItems;
                break;
            case parameters.getItemTypeList().Receiving:
                return parameters.getTableControlIdList().RequestReceivingItems;
                break;
            default:
                return '';
                break;
        }
    };
    /**
     * Get the request items column id prefix for variant default configuration data
     * @param {string} sItemType the item type
     * @private
     * @returns {string} the prefix
     */
    function _getRequestItemsColumnIdPrefix(sItemType) {
        switch (sItemType) {
            case parameters.getItemTypeList().Issuing:
                return parameters.getRequestItemsColumnIdPrefixList().RequestIssuingPrefix;
                break;
            case parameters.getItemTypeList().Receiving:
                return parameters.getRequestItemsColumnIdPrefixList().RequestReceivingPrefix;
                break;
            default:
                return '';
                break;
        }
    };

    /**
     * Get controller variant default data
     * @param {string} sItemComponentName the request item component name
     * @param {string} sItemTableId the request item table id
     * @param {string} sColumnPrefix the column prefix
     * @private
     * @returns {object} the variant data
     */
    function _getControllerDefaultVariantData(sItemComponentName, sItemTableId, sColumnPrefix) {
        var oVariantData = {};
        oVariantData = {
            "aColumns": [{
                "order": 0,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Actions",
                "group": null
            }, {
                "order": 1,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "ItemId",
                "group": null
            }, {
                "order": 2,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "DebitCredit",
                "group": null
            }, {
                "order": 3,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "ItemText",
                "group": null
            }, {
                "order": 4,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "AnalyticalNature",
                "group": null
            }, {
                "order": 5,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "GLAccount",
                "group": null
            }, {
                "order": 6,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "LCOA",
                "group": null
            }, {
                "order": 7,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "CostCenter",
                "group": null
            }, {
                "order": 8,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "InternalOrder",
                "group": null
            }, {
                "order": 9,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "WBS",
                "group": null
            }, {
                "order": 10,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Study",
                "group": null
            }, {
                "order": 11,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Product",
                "group": null
            }, {
                "order": 12,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Percentage",
                "group": null
            }, {
                "order": 13,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Amount",
                "group": null
            }, {
                "order": 14,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Markup",
                "group": null
            }, {
                "order": 15,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "TotalAmount",
                "group": null
            }, {
                "order": 16,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "TaxCode",
                "group": null
            }, {
                "order": 17,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "BusinessArea",
                "group": null
            }, {
                "order": 18,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Quantity",
                "group": null
            }, {
                "order": 19,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "UnitId",
                "group": null
            }, {
                "order": 20,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Reference2",
                "group": null
            }, {
                "order": 21,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "HsnSac",
                "group": null
            },  {
                "order": 22,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Navigate",
                "group": null
            }],
            "oHeader": {
                "text": "All",
                "visible": false,
                "id": ""
            },
            "_persoSchemaVersion": "1.0",
            "VAR_KEY": "CONTROLLER_DEFAULT",
            "VAR_NAME": this.oBundle.getText("variant.default.controller.name"),
            "readOnly": true,
            "global": true,
            "labelReadOnly": false,
            "author": "TIMI"
        }
        return oVariantData;
    };

    /**
     * Get accountant variant default data
     * @param {string} sItemComponentName the request item component name
     * @param {string} sItemTableId the request item table id
     * @param {string} sColumnPrefix the column prefix
     * @private
     * @returns {object} the variant data
     */
    function _getAccountantDefaultVariantData(sItemComponentName, sItemTableId, sColumnPrefix) {
        var oVariantData = {};
        oVariantData = {
            "aColumns": [{
                "order": 0,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Actions",
                "group": null
            }, {
                "order": 1,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "ItemId",
                "group": null
            }, {
                "order": 2,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "DebitCredit",
                "group": null
            }, {
                "order": 3,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "ItemText",
                "group": null
            }, {
                "order": 4,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "AnalyticalNature",
                "group": null
            }, {
                "order": 5,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "GLAccount",
                "group": null
            }, {
                "order": 6,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "LCOA",
                "group": null
            }, {
                "order": 7,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "CostCenter",
                "group": null
            }, {
                "order": 8,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "InternalOrder",
                "group": null
            }, {
                "order": 9,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "WBS",
                "group": null
            }, {
                "order": 10,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Study",
                "group": null
            }, {
                "order": 11,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Product",
                "group": null
            }, {
                "order": 12,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Percentage",
                "group": null
            }, {
                "order": 13,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Amount",
                "group": null
            }, {
                "order": 14,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Markup",
                "group": null
            }, {
                "order": 15,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "TotalAmount",
                "group": null
            }, {
                "order": 16,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "TaxCode",
                "group": null
            }, {
                "order": 17,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "BusinessArea",
                "group": null
            }, {
                "order": 18,
                "visible": true,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Quantity",
                "group": null
            }, {
                "order": 19,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "UnitId",
                "group": null
            }, {
                "order": 20,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Reference2",
                "group": null
            }, {
                "order": 21,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "HsnSac",
                "group": null
            }, {
                "order": 22,
                "visible": false,
                "id": sItemComponentName + "-" + sItemTableId + "-" + sColumnPrefix + "Navigate",
                "group": null
            }],
            "oHeader": {
                "text": "All",
                "visible": false,
                "id": ""
            },
            "_persoSchemaVersion": "1.0",
            "VAR_KEY": "ACCOUNTANT_DEFAULT",
            "VAR_NAME": this.oBundle.getText("variant.default.accountant.name"),
            "readOnly": true,
            "global": true,
            "labelReadOnly": false,
            "author": "TIMI"
        }
        return oVariantData;
    };

    var oVariants = {

        /**
         * Get the request items variant management control id 
         * @param {string} sItemType the item type
         * @public
         * @returns {string} the variant management id
         */
        getRequestItemsVariantManagementControlId: function(sItemType) {
            var fnGetRequestItemsVariantManagementControlId = _getRequestItemsVariantManagementControlId;
            return fnGetRequestItemsVariantManagementControlId(sItemType);
        },

        /**
         * Get the request items variant JSON Model name
         * @param {string} sItemType the item type
         * @public
         * @returns {string} the model name
         */
        getRequestItemsVariantJSONModelName: function(sItemType) {
            var fnGetRequestItemsVariantJSONModelName = _getRequestItemsVariantJSONModelName;
            return fnGetRequestItemsVariantJSONModelName(sItemType);
        },

        /**
         * Initiate request items variant data 
         * @param {string} sItemType the item type
         * @param {function} fnCallBackSuccess the success callback function
         * @param {function} fnCallBackError the error callback function
         * @public
         */
        initiateRequestItemsVariantData: function(sItemType, fnCallBackSuccess, fnCallBackError) {

            var fnGetControllerDefaultVariantData = _getControllerDefaultVariantData;
            var fnGetAccountantDefaultVariantData = _getAccountantDefaultVariantData;
            var fnGetRequestItemsTableId = _getRequestItemsTableId;
            var fnGetRequestItemsColumnIdPrefix = _getRequestItemsColumnIdPrefix;
            var fnGetRequestItemsUShellPersonalizationVariantSetName = _getRequestItemsUShellPersonalizationVariantSetName;

            var sItemTableId = fnGetRequestItemsTableId(sItemType),
                sItemComponentName = parameters.getPersonalizationComponentNameList().RequestItems,
                sItemColumnPrefix = fnGetRequestItemsColumnIdPrefix(sItemType);
            // Get Controller & Accountant Default Variant Data
            var aVariantData = [fnGetControllerDefaultVariantData.call(this, sItemComponentName, sItemTableId, sItemColumnPrefix), fnGetAccountantDefaultVariantData.call(this, sItemComponentName, sItemTableId, sItemColumnPrefix)];
            var oPersonalizationContainer = ushellPersonalization.getUShellRequestItemsPersonalizationContainer();
            var sVariantSetName = fnGetRequestItemsUShellPersonalizationVariantSetName(sItemType);
            var sVariantItemValueKey = parameters.getUShellPersonalizationVariantItemValueKeyList().RequestItems;
            var oVariantNamesAndKeys = {},
                oPersonalizationVariantSet = {},
                oVariantData = {},
                sVariantKey;

            oPersonalizationContainer.fail(function(oError) {
                // call error callback function
                fnCallBackError(oError);
            });

            oPersonalizationContainer.done(function(oPersonalizationContainer) {
                // check if the current variant set exists, If not, add the new variant set to the container
                if (!(oPersonalizationContainer.containsVariantSet(sVariantSetName))) {
                    // Create variant set
                    oPersonalizationContainer.addVariantSet(sVariantSetName);
                }
                // get the variant set
                oPersonalizationVariantSet = oPersonalizationContainer.getVariantSet(sVariantSetName);
                // Get variant set's list of variant keys 
                oVariantNamesAndKeys = oPersonalizationVariantSet.getVariantNamesAndKeys();
                for (var sVariantName in oVariantNamesAndKeys) {
                    if (oVariantNamesAndKeys.hasOwnProperty(sVariantName)) {
                        // Get variant data
                        sVariantKey = oVariantNamesAndKeys[sVariantName];
                        oVariantData = oPersonalizationVariantSet.getVariant(sVariantKey).getItemValue(sVariantItemValueKey);
                        if (oVariantData !== undefined) {
                            aVariantData.push(JSON.parse(oVariantData));
                        }
                    }
                }
                // call success callback function
                fnCallBackSuccess(aVariantData);
            }.bind(this));

        },

        /**
         * Get request item initial variant data - Depends on application type and item type
         * @param {string} sAppType the application type
         * @param {string} sItemType the item type
         * @public
         * @returns {object} the variant data
         */
        getRequestItemsInitialVariant: function(sIntercoType, sAppType, sItemType) {

            var fnGetRequestItemsTableId = _getRequestItemsTableId;
            var fnGetControllerDefaultVariantData = _getControllerDefaultVariantData;
            var fnGetAccountantDefaultVariantData = _getAccountantDefaultVariantData;
            var fnGetRequestItemsColumnIdPrefix = _getRequestItemsColumnIdPrefix;

            var sItemTableId = fnGetRequestItemsTableId(sItemType),
                sItemComponentName = parameters.getPersonalizationComponentNameList().RequestItems,
                sItemColumnPrefix = fnGetRequestItemsColumnIdPrefix(sItemType);
            
            if(businessRules.isAppR3PAccountant(sIntercoType, sAppType)){
            	return fnGetAccountantDefaultVariantData.call(this, sItemComponentName, sItemTableId, sItemColumnPrefix);
            }
            
            // Get Controller default variant data
            return fnGetControllerDefaultVariantData.call(this, sItemComponentName, sItemTableId, sItemColumnPrefix);
 
        },

        /**
         * Get request items default variant key from Ushell personalization
         * @param {string} sItemType the item type
         * @param {function} fnCallBackSuccess the success callback function
         * @param {function} fnCallBackError the error callback function
         * @public
         */
        getRequestItemsDefaultVariantKey: function(sItemType, fnCallBackSuccess, fnCallBackError) {

            // Initialize personalizer 
            var oPersonalizer = ushellPersonalization.getUShellRequestItemsDefaultVariantKeyPersonalizer(sItemType);
            var oVariantDefaultKey = {},
                sDefaultVariantKey = "";

            // Get personalization data 
            oPersonalizer.getPersData().done(function(oPersData) {
                if (oPersData && oPersData !== "") {
                    oVariantDefaultKey = JSON.parse(oPersData);
                    sDefaultVariantKey = oVariantDefaultKey["defaultKey"];
                }
                //call success callback function
                fnCallBackSuccess(sDefaultVariantKey);
            }.bind(this)).fail(function(oError) {
                //call error callback function
                fnCallBackError(oError);
            }.bind(this));

        },

        /**
         * Set request items default variant key into Ushell personalization
         * @param {string} sItemType the item type
         * @param {string} sVariantKey the variant key to save
         * @param {function} fnCallBackSuccess the success callback function
         * @param {function} fnCallBackError the error callback function
         * @public
         */
        setRequestItemsDefaultVariantKey: function(sItemType, sVariantKey, fnCallBackSuccess, fnCallBackError) {

            // Initialize personalizer 
            var oPersonalizer = ushellPersonalization.getUShellRequestItemsDefaultVariantKeyPersonalizer(sItemType);
            var oVariantDefaultKey = {
                "defaultKey": sVariantKey
            };

            oPersonalizer.setPersData(JSON.stringify(oVariantDefaultKey)).done(function() {
                //call success callback function
                fnCallBackSuccess(sVariantKey);
            }.bind(this)).fail(function(oError) {
                //call error callback function
                fnCallBackError(oError);
            }.bind(this))

        },

        /**
         * Save request items variant data
         * @param {string} sItemType the item type
         * @param {string} sVariantKey the variant key to save
         * @param {object} oVariantData the variant data to save
         * @param {function} fnCallBackSuccess the success callback function
         * @param {function} fnCallBackError the error callback function
         * @public
         */
        saveRequestItemsVariantData: function(sItemType, sVariantKey, oVariantData, fnCallBackSuccess, fnCallBackError) {

            var fnGetRequestItemsUShellPersonalizationVariantSetName = _getRequestItemsUShellPersonalizationVariantSetName;

            var oPersonalizationContainer = ushellPersonalization.getUShellRequestItemsPersonalizationContainer(),
                sVariantSetName = fnGetRequestItemsUShellPersonalizationVariantSetName(sItemType),
                sVariantItemValueKey = parameters.getUShellPersonalizationVariantItemValueKeyList().RequestItems,
                oPersonalizationVariantSet = {},
                oVariant = {},
                sVariantInternalKey;

            oPersonalizationContainer.fail(function(oError) {
                // call error callback function
                fnCallBackError(oError);
            });

            oPersonalizationContainer.done(function(oPersonalizationContainer) {
                // check if the current variant set exists, If not, add the new variant set to the container
                if (!(oPersonalizationContainer.containsVariantSet(sVariantSetName))) {
                    // Create variant set
                    oPersonalizationContainer.addVariantSet(sVariantSetName);
                };
                // get the variant set
                oPersonalizationVariantSet = oPersonalizationContainer.getVariantSet(sVariantSetName);

                //get if the variant exists or add new variant
                sVariantInternalKey = oPersonalizationVariantSet.getVariantKeyByName(sVariantKey);
                if (sVariantInternalKey) {
                    oVariant = oPersonalizationVariantSet.getVariant(sVariantInternalKey);
                } else {
                    // create variant
                    oVariant = oPersonalizationVariantSet.addVariant(sVariantKey);
                }
                if (oVariantData) {
                    // Set variant data
                    oVariant.setItemValue(sVariantItemValueKey, JSON.stringify(oVariantData));
                }
                oPersonalizationContainer.save().fail(function(oError) {
                    // call error callback function
                    fnCallBackError(oError);
                }).done(function() {
                    // call success callback function
                    fnCallBackSuccess(oVariantData);
                }.bind(this));
            }.bind(this));

        },

        /**
         * Manage request items variant data
         * @param {string} sItemType the item type
         * @param {object[]} aDeletedVariantKeys the array of deleted variant keys
         * @param {object[]} aRenamedVariants the array of renamed variants
         * @param {function} fnCallBackSuccess the success callback function
         * @param {function} fnCallBackError the error callback function
         * @public
         */
        manageRequestItemsVariantData: function(sItemType, aDeletedVariantKeys, aRenamedVariants, fnCallBackSuccess, fnCallBackError) {

            var fnGetRequestItemsUShellPersonalizationVariantSetName = _getRequestItemsUShellPersonalizationVariantSetName;
            var i = 0;

            var oPersonalizationContainer = ushellPersonalization.getUShellRequestItemsPersonalizationContainer(),
                sVariantSetName = fnGetRequestItemsUShellPersonalizationVariantSetName(sItemType),
                sVariantItemValueKey = parameters.getUShellPersonalizationVariantItemValueKeyList().RequestItems,
                oPersonalizationVariantSet = {},
                oVariant = {},
                oVariantData = {},
                sVariantInternalKey;

            oPersonalizationContainer.fail(function(oError) {
                // call back function in case of fail
                fnCallBackError(oError);
            });

            oPersonalizationContainer.done(function(oPersonalizationContainer) {
                // check if the current variant set exists, If not, add the new variant set to the container
                if (!(oPersonalizationContainer.containsVariantSet(sVariantSetName))) {
                    // Create variant set
                    oPersonalizationContainer.addVariantSet(sVariantSetName);
                };
                // get the variant set
                oPersonalizationVariantSet = oPersonalizationContainer.getVariantSet(sVariantSetName);

                // Delete variant from keys
                for (i = 0; i < aDeletedVariantKeys.length; i++) {
                    if (aDeletedVariantKeys[i]) {
                        // Get variant internal keys
                        sVariantInternalKey = oPersonalizationVariantSet.getVariantKeyByName(aDeletedVariantKeys[i])
                        if (sVariantInternalKey) {
                            // Delete variant from its internal keys
                            oPersonalizationVariantSet.delVariant(sVariantInternalKey);
                        }
                    }
                }

                //Rename variant 
                for (i = 0; i < aRenamedVariants.length; i++) {
                    if (aRenamedVariants[i]) {
                        // Get variant internal key
                        sVariantInternalKey = oPersonalizationVariantSet.getVariantKeyByName(aRenamedVariants[i].key);
                        if (sVariantInternalKey) {
                            // Get variant and its data
                            oVariant = oPersonalizationVariantSet.getVariant(sVariantInternalKey);
                            oVariantData = JSON.parse(oPersonalizationVariantSet.getVariant(sVariantInternalKey).getItemValue(sVariantItemValueKey));
                            if (oVariantData) {
                                // Update variant name and data
                                oVariantData.VAR_NAME = aRenamedVariants[i].name;
                                oVariant.setItemValue(sVariantItemValueKey, JSON.stringify(oVariantData));
                            }
                        }
                    }
                }

                oPersonalizationContainer.save().fail(function(oError) {
                    // call error callback function
                    fnCallBackError(oError);
                }).done(function() {
                    // call success callback function
                    fnCallBackSuccess();
                }.bind(this));
            }.bind(this));

        },

    };

    return oVariants;

});