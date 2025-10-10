/************************************************************************
 * Project            : TIMI                                 			*	
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                					*
 * Technical document :                                    				*
 *----------------------------------------------------------------------*
 * File       	 : model/tsdHelper.js   	        					*
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 23/05/2016                                           *
 *----------------------------------------------------------------------*
 * Description   : Provides functions to manage table select dialog  	*
 *				   value help											*		
 *                                                                      *
 ************************************************************************
 * Modification nï¿½ ...........	: M001									*
 * Project ...................	: TIMI									*
 * Author .................... 	: Marion Alberny                        *
 *----------------------------------------------------------------------*
 * Modification date ......... 	: 04/11/2016 							*
 * Transport order ........... 	:  										*
 * Change Request ............ 	: CR2016-273225  						*
 * Description ............... 	: SGL Indicator 						*
 *************************************************************************/
/**
 * @fileOverview Provides functions to manage table select dialog value help
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/ObjectIdentifier",
    "sap/m/Text",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "cus/fi/timi/rel/model/businessRules",
    "cus/fi/timi/rel/model/messageHelper",
    "cus/fi/timi/rel/model/odataService",
    "cus/fi/timi/rel/model/parameters",
    "cus/fi/timi/rel/assets/js/helpers/busy"
], function(JSONModel, Column, ColumnListItem, ObjectIdentifier, Text, Filter, FilterOperator, businessRules, messageHelper, odataService, parameters, busy) {
    "use strict";

    /**
     * Set Dialog title
     * 
     * @private
     */
    function _setTitle() {
        switch (this._oTSDValueHelp.data("ValueHelpType")) {
            case parameters.getDataFieldTypeList().ReceivingController:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.controller"));
                break;
            case parameters.getDataFieldTypeList().IssuingTax:
            case parameters.getDataFieldTypeList().IssuingItemTax:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.issuingtax"));
                break;
            case parameters.getDataFieldTypeList().ReceivingTax:
            case parameters.getDataFieldTypeList().ReceivingItemTax:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.receivingtax"));
                break;
            case parameters.getDataFieldTypeList().IssuingItemGMID:
            case parameters.getDataFieldTypeList().ReceivingItemGMID:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.GMID"));
                break;                
            case parameters.getDataFieldTypeList().IssuingItemCostCenter:
            case parameters.getDataFieldTypeList().ReceivingItemCostCenter:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.costcenter"));
                break;
            case parameters.getDataFieldTypeList().IssuingItemNature:
            case parameters.getDataFieldTypeList().ReceivingItemNature:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.nature"));
                break;
            case parameters.getDataFieldTypeList().IssuingItemAccount:
            case parameters.getDataFieldTypeList().ReceivingItemAccount:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.account"));
                break;
            case parameters.getDataFieldTypeList().IssuingItemInternalOrder:
            case parameters.getDataFieldTypeList().ReceivingItemInternalOrder:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.internalorder"));
                break;
            case parameters.getDataFieldTypeList().IssuingItemWBS:
            case parameters.getDataFieldTypeList().ReceivingItemWBS:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.wbs"));
                break;
            case parameters.getDataFieldTypeList().IssuingSGLInd:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.issuingsglind"));
                break;
            case parameters.getDataFieldTypeList().ReceivingSGLInd:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.receivingsglind"));
                break;
            case parameters.getDataFieldTypeList().IssuingItemUnit:
            case parameters.getDataFieldTypeList().ReceivingItemUnit:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.unit"));
                break;
            case parameters.getDataFieldTypeList().IssuingItemBusinessArea:
            case parameters.getDataFieldTypeList().ReceivingItemBusinessArea:
            case parameters.getDataFieldTypeList().IssuingBusinessAreaAlt:
            case parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.businessarea"));
                break;
            case parameters.getDataFieldTypeList().IssuingItemHsnSac:
            case parameters.getDataFieldTypeList().ReceivingItemHsnSac:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.hsnsac"));
                break;
            case parameters.getDataFieldTypeList().IssuingBusinessPlace:
            case parameters.getDataFieldTypeList().ReceivingBusinessPlace:
                this._oTSDValueHelp.setTitle(this.oBundle.getText("valuehelp.dialog.title.businessplace"));
                break;
            default:
                break;
        }

    };

    /**
     * Set search results table columns
     * 
     * @private
     */
    function _setColumns() {

        switch (this._oTSDValueHelp.data("ValueHelpType")) {
            case parameters.getDataFieldTypeList().ReceivingController:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.controller.username")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.controller.firstname")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.controller.lastname")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                break;
            case parameters.getDataFieldTypeList().IssuingTax:
            case parameters.getDataFieldTypeList().ReceivingTax:
            case parameters.getDataFieldTypeList().IssuingItemTax:
            case parameters.getDataFieldTypeList().ReceivingItemTax:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.tax.code")
                    }),
                    "width": "10px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.tax.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                break;
            case parameters.getDataFieldTypeList().IssuingItemGMID:
            case parameters.getDataFieldTypeList().ReceivingItemGMID:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.GMID.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.GMID.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                break;                
            case parameters.getDataFieldTypeList().IssuingItemCostCenter:
            case parameters.getDataFieldTypeList().ReceivingItemCostCenter:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.costcenter.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.costcenter.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.businessarea.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                break;
            case parameters.getDataFieldTypeList().IssuingItemNature:
            case parameters.getDataFieldTypeList().ReceivingItemNature:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.nature.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.nature.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                break;
            case parameters.getDataFieldTypeList().IssuingItemAccount:
            case parameters.getDataFieldTypeList().ReceivingItemAccount:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.account.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.account.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.nature.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.lcoaaccount.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                break;
            case parameters.getDataFieldTypeList().IssuingItemInternalOrder:
            case parameters.getDataFieldTypeList().ReceivingItemInternalOrder:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.internalorder.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.internalorder.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                break;
            case parameters.getDataFieldTypeList().IssuingItemWBS:
            case parameters.getDataFieldTypeList().ReceivingItemWBS:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.wbs.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.wbs.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                break;
            case parameters.getDataFieldTypeList().IssuingSGLInd:
            case parameters.getDataFieldTypeList().ReceivingSGLInd:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.sglind.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.sglind.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                break;
            case parameters.getDataFieldTypeList().IssuingItemUnit:
            case parameters.getDataFieldTypeList().ReceivingItemUnit:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.unit.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.unit.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                break;
            case parameters.getDataFieldTypeList().IssuingItemBusinessArea:
            case parameters.getDataFieldTypeList().ReceivingItemBusinessArea:
            case parameters.getDataFieldTypeList().IssuingBusinessAreaAlt:
            case parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.businessarea.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.businessarea.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                break;
            case parameters.getDataFieldTypeList().IssuingItemHsnSac:
            case parameters.getDataFieldTypeList().ReceivingItemHsnSac:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.hsnsac.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.hsnsac.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                break;
            case parameters.getDataFieldTypeList().IssuingBusinessPlace:
            case parameters.getDataFieldTypeList().ReceivingBusinessPlace:
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.businessplace.code")
                    }),
                    "width": "30px",
                    "hAlign": "Center"
                }));
                this._oTSDValueHelp.addColumn(new Column({
                    "header": new Text({
                        "text": this.oBundle.getText("valuehelp.dialog.businessplace.name")
                    }),
                    "width": "90px",
                    "hAlign": "Center"
                }));
                break;
            default:
                break;
        }

    };

    /**
     * Bind model to the items of the dialog table results
     * 
     * @private
     */
    function _bindItems() {

        var oTemplateColumnListItem = {},
            sPath;

        this._oTSDValueHelp.unbindAggregation("items");

        switch (this._oTSDValueHelp.data("ValueHelpType")) {
            case parameters.getDataFieldTypeList().ReceivingController:
                sPath = "UserCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{UserCollection>Username}"
                    }), new Text({
                        "text": "{UserCollection>Firstname}"
                    }), new Text({
                        "text": "{UserCollection>Lastname}"
                    })]
                })
                break;
            case parameters.getDataFieldTypeList().IssuingTax:
            case parameters.getDataFieldTypeList().ReceivingTax:
            case parameters.getDataFieldTypeList().IssuingItemTax:
            case parameters.getDataFieldTypeList().ReceivingItemTax:
                sPath = "TaxCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{TaxCollection>TaxCode}"
                    }), new Text({
                        "text": "{TaxCollection>TaxName}"
                    })]
                })
                break;
            case parameters.getDataFieldTypeList().IssuingItemGMID:
            case parameters.getDataFieldTypeList().ReceivingItemGMID:
                sPath = "GMIDCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{GMIDCollection>GMIDCode}"
                    }), new Text({
                        "text": "{GMIDCollection>GMIDName}"
                    })]
                })
                break;            
            case parameters.getDataFieldTypeList().IssuingItemCostCenter:
            case parameters.getDataFieldTypeList().ReceivingItemCostCenter:
                sPath = "CostCenterCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{CostCenterCollection>CostCenterCode}"
                    }), new Text({
                        "text": "{CostCenterCollection>CostCenterName}"
                    }), new Text({
                        "text": "{CostCenterCollection>BusinessAreaCode}"
                    })]
                })
                break;
            case parameters.getDataFieldTypeList().IssuingItemNature:
            case parameters.getDataFieldTypeList().ReceivingItemNature:
                sPath = "NatureCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{NatureCollection>NatureCode}"
                    }), new Text({
                        "text": "{NatureCollection>NatureName}"
                    })]
                })
                break;
            case parameters.getDataFieldTypeList().IssuingItemAccount:
            case parameters.getDataFieldTypeList().ReceivingItemAccount:
                sPath = "AccountCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{AccountCollection>AccountCode}"
                    }), new Text({
                        "text": "{AccountCollection>AccountName}"
                    }), new Text({
                        "text": "{AccountCollection>NatureCode}"
                    }), new Text({
                        "text": "{AccountCollection>LCOAAccountCode}"
                    }), ]
                })
                break;
            case parameters.getDataFieldTypeList().IssuingItemInternalOrder:
            case parameters.getDataFieldTypeList().ReceivingItemInternalOrder:
                sPath = "InternalOrderCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{InternalOrderCollection>InternalOrderCode}"
                    }), new Text({
                        "text": "{InternalOrderCollection>InternalOrderName}"
                    }), ]
                })
                break;
            case parameters.getDataFieldTypeList().IssuingItemWBS:
            case parameters.getDataFieldTypeList().ReceivingItemWBS:
                sPath = "WBSCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{WBSCollection>WBSExternalCode}"
                    }), new Text({
                        "text": "{WBSCollection>WBSName}"
                    }), ]
                })
                break;
            case parameters.getDataFieldTypeList().IssuingSGLInd:
                sPath = "SGLIndicatorIssuingCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{SGLIndicatorIssuingCollection>SGLIndicatorCode}"
                    }), new Text({
                        "text": "{SGLIndicatorIssuingCollection>SGLIndicatorDescription}"
                    }), ]
                })
                break;
            case parameters.getDataFieldTypeList().ReceivingSGLInd:
                sPath = "SGLIndicatorReceivingCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{SGLIndicatorReceivingCollection>SGLIndicatorCode}"
                    }), new Text({
                        "text": "{SGLIndicatorReceivingCollection>SGLIndicatorDescription}"
                    }), ]
                })
                break;
            case parameters.getDataFieldTypeList().IssuingItemUnit:
            case parameters.getDataFieldTypeList().ReceivingItemUnit:
                sPath = "UnitCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{UnitCollection>UnitId}"
                    }), new Text({
                        "text": "{UnitCollection>UnitDescription}"
                    }), ]
                })
                break;
            case parameters.getDataFieldTypeList().IssuingItemBusinessArea:
            case parameters.getDataFieldTypeList().ReceivingItemBusinessArea:
            case parameters.getDataFieldTypeList().IssuingBusinessAreaAlt:
            case parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt:
                sPath = "BusinessAreaCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{BusinessAreaCollection>BusinessAreaCode}"
                    }), new Text({
                        "text": "{BusinessAreaCollection>BusinessAreaName}"
                    }), ]
                })
                break;
            case parameters.getDataFieldTypeList().IssuingItemHsnSac:
            case parameters.getDataFieldTypeList().ReceivingItemHsnSac:
                sPath = "HsnSacCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{HsnSacCollection>HsnSacCode}"
                    }), new Text({
                        "text": "{HsnSacCollection>HsnSacName}"
                    }), ]
                })
                break;
            case parameters.getDataFieldTypeList().IssuingBusinessPlace:
            case parameters.getDataFieldTypeList().ReceivingBusinessPlace:
                sPath = "BusinessPlaceCollection>/results"
                oTemplateColumnListItem = new ColumnListItem({
                    "cells": [new ObjectIdentifier({
                        "title": "{BusinessPlaceCollection>BusinessPlaceCode}"
                    }), new Text({
                        "text": "{BusinessPlaceCollection>BusinessPlaceName}"
                    }), ]
                })
                break;
            default:
                break;
        };

        this._oTSDValueHelp.bindItems({
            "path": sPath,
            "template": oTemplateColumnListItem,
            "templateShareable": false
        });

    };

    /**
     * Set CSS class 
     * 
     * @private
     */
    function _setCSS() {

        switch (this._oTSDValueHelp.data("ValueHelpType")) {
            case parameters.getDataFieldTypeList().ReceivingController:
                this._oTSDValueHelp.addStyleClass("valueHelpController");
                break;
            case parameters.getDataFieldTypeList().IssuingTax:
            case parameters.getDataFieldTypeList().ReceivingTax:
            case parameters.getDataFieldTypeList().IssuingItemTax:
            case parameters.getDataFieldTypeList().ReceivingItemTax:
                this._oTSDValueHelp.addStyleClass("valueHelpTax");
                break;
            case parameters.getDataFieldTypeList().IssuingItemGMID:
            case parameters.getDataFieldTypeList().ReceivingItemGMID:
                this._oTSDValueHelp.addStyleClass("valueHelpGMID");
                break;                
            case parameters.getDataFieldTypeList().IssuingItemCostCenter:
            case parameters.getDataFieldTypeList().ReceivingItemCostCenter:
                this._oTSDValueHelp.addStyleClass("valueHelpCostCenter");
                break;
            case parameters.getDataFieldTypeList().IssuingItemNature:
            case parameters.getDataFieldTypeList().ReceivingItemNature:
                this._oTSDValueHelp.addStyleClass("valueHelpNature");
                break;
            case parameters.getDataFieldTypeList().IssuingItemAccount:
            case parameters.getDataFieldTypeList().ReceivingItemAccount:
                this._oTSDValueHelp.addStyleClass("valueHelpAccount");
                break;
            case parameters.getDataFieldTypeList().IssuingItemInternalOrder:
            case parameters.getDataFieldTypeList().ReceivingItemInternalOrder:
                this._oTSDValueHelp.addStyleClass("valueHelpInternalOrder");
                break;
            case parameters.getDataFieldTypeList().IssuingItemWBS:
            case parameters.getDataFieldTypeList().ReceivingItemWBS:
                this._oTSDValueHelp.addStyleClass("valueHelpWBS");
                break;
            case parameters.getDataFieldTypeList().IssuingSGLInd:
            case parameters.getDataFieldTypeList().ReceivingSGLInd:
                this._oTSDValueHelp.addStyleClass("valueHelpSGLInd");
                break;
            case parameters.getDataFieldTypeList().IssuingItemGMID:
            case parameters.getDataFieldTypeList().ReceivingItemGMID:
                this._oTSDValueHelp.addStyleClass("valueHelpGMID");
                break; 
            case parameters.getDataFieldTypeList().IssuingItemUnit:
            case parameters.getDataFieldTypeList().ReceivingItemUnit:
                this._oTSDValueHelp.addStyleClass("valueHelpUnit");
                break;     
            case parameters.getDataFieldTypeList().IssuingItemBusinessArea:
            case parameters.getDataFieldTypeList().ReceivingItemBusinessArea:
            case parameters.getDataFieldTypeList().IssuingBusinessAreaAlt:
            case parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt:
                this._oTSDValueHelp.addStyleClass("valueHelpUnit");
                break;        
            case parameters.getDataFieldTypeList().IssuingItemHsnSac:
            case parameters.getDataFieldTypeList().ReceivingItemHsnSac:
                this._oTSDValueHelp.addStyleClass("valueHelpHsnSac");
                break;         
            case parameters.getDataFieldTypeList().IssuingBusinessPlace:
            case parameters.getDataFieldTypeList().ReceivingBusinessPlace:
                this._oTSDValueHelp.addStyleClass("valueHelpBusinessPlace");
                break;             
            default:
                break;
        }

    };

    /**
     * Handles search event on dialog
     * 
     * @event
     * @param {eventObject}
     *                oEvent the event context data
     * @param {string} 
     * 		sItemPath the item path to the request model
     * @public
     */
    function _handleSearch(oEvent, sItemPath) {

        // Set busy indicator on before OData read
        busy.setBusyOn();

        var oRequestModel = this.getComponentModel("Request"),
            sSearchValue = oEvent.getParameter("value"),
            aFilters = [];

        switch (this._oTSDValueHelp.data("ValueHelpType")) {
            case parameters.getDataFieldTypeList().ReceivingController:
                aFilters = [
                    new Filter("Filters/IntercoType", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IntercoTypeCode")),
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")) //M0001 DTE VS
                ];
                odataService.queryUser.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().IssuingTax:
            case parameters.getDataFieldTypeList().IssuingItemTax:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("DocumentTypeCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/DocumentTypeCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("ItemType", FilterOperator.EQ, parameters.getItemTypeList().Issuing)
                ];
                odataService.queryTax.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingTax:
            case parameters.getDataFieldTypeList().ReceivingItemTax:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("DocumentTypeCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/DocumentTypeCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("ItemType", FilterOperator.EQ, parameters.getItemTypeList().Receiving)
                ];
                odataService.queryTax.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().IssuingItemGMID:
            	aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode"))
                ];
                odataService.queryGMID.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingItemGMID:
            	aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode"))
                ];            	
                odataService.queryGMID.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;                
            case parameters.getDataFieldTypeList().IssuingItemCostCenter:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode"))
                ];
                odataService.queryCostCenter.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingItemCostCenter:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode"))
                ];
                odataService.queryCostCenter.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().IssuingItemNature:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode"))
                ];
                odataService.queryNature.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingItemNature:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode"))
                ];
                odataService.queryNature.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().IssuingItemAccount:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("DocumentTypeCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/DocumentTypeCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("NatureCode", FilterOperator.EQ, oRequestModel.getProperty(sItemPath + "/AnalyticalNature")),
                    new Filter("ItemType", FilterOperator.EQ, oRequestModel.getProperty(sItemPath + "/ItemType")),
                    new Filter("Filters/IntercoType", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IntercoTypeCode"))
                ];
                odataService.queryAccount.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingItemAccount:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("DocumentTypeCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/DocumentTypeCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("NatureCode", FilterOperator.EQ, oRequestModel.getProperty(sItemPath + "/AnalyticalNature")),
                    new Filter("ItemType", FilterOperator.EQ, oRequestModel.getProperty(sItemPath + "/ItemType")),
                    new Filter("Filters/IntercoType", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IntercoTypeCode"))
                ];
                odataService.queryAccount.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().IssuingItemInternalOrder:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("CurrencyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/CurrencyCode"))
                ];
                odataService.queryInternalOrder.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingItemInternalOrder:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("CurrencyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/CurrencyCode"))
                ];
                odataService.queryInternalOrder.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().IssuingItemWBS:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("CurrencyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/CurrencyCode"))
                ];
                odataService.queryWBS.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingItemWBS:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("CurrencyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/CurrencyCode"))
                ];
                odataService.queryWBS.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().IssuingSGLInd:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode")),
                    new Filter("CustomerCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/CustomerCode"))
                ];
                odataService.querySLGIndicatorIssuing.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingSGLInd:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode")),
                    new Filter("VendorCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/VendorCode"))
                ];
                odataService.querySLGIndicatorReceiving.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().IssuingItemUnit:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode"))
                ];
                odataService.queryUnit.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingItemUnit:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode"))
                ];
                odataService.queryUnit.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().IssuingItemBusinessArea:
            case parameters.getDataFieldTypeList().IssuingBusinessAreaAlt:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode"))
                ];
                odataService.queryBusinessArea.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingItemBusinessArea:
            case parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode"))
                ];
                odataService.queryBusinessArea.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().IssuingItemHsnSac:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode"))
                ];
                odataService.queryHsnSac.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingItemHsnSac:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode"))
                ];
                odataService.queryHsnSac.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().IssuingBusinessPlace:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/IsCompanyCode"))
                ];
                odataService.queryBusinessPlace.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            case parameters.getDataFieldTypeList().ReceivingBusinessPlace:
                aFilters = [
                    new Filter("Filters/LegalEntityCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcLegalEntityCode")),
                    new Filter("CompanyCode", FilterOperator.EQ, oRequestModel.getProperty("/HeaderData/RcCompanyCode"))
                ];
                odataService.queryBusinessPlace.call(this, sSearchValue, aFilters)
                    .then(_handleODataGetValueHelpDataSuccess.bind(this))
                    .catch(messageHelper.showODataFailedMessages.bind(this))
                    .then(function() {
                        busy.setBusyOff();
                    });
                break;
            default:
                break;
        }
    };

    /**
     * Handles success on Odata Call
     * 
     * @event
     * @param {object}
     *                oData the data
     * @param {object}
     * 								response the response
     * @public
     */
    function _handleODataGetValueHelpDataSuccess(oData) {

        // Close busy indicator
        busy.setBusyOff();

        switch (this._oTSDValueHelp.data("ValueHelpType")) {
            case parameters.getDataFieldTypeList().ReceivingController:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "UserCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingTax:
            case parameters.getDataFieldTypeList().ReceivingTax:
            case parameters.getDataFieldTypeList().IssuingItemTax:
            case parameters.getDataFieldTypeList().ReceivingItemTax:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "TaxCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemCostCenter:
            case parameters.getDataFieldTypeList().ReceivingItemCostCenter:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "CostCenterCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemNature:
            case parameters.getDataFieldTypeList().ReceivingItemNature:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "NatureCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemAccount:
            case parameters.getDataFieldTypeList().ReceivingItemAccount:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "AccountCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemInternalOrder:
            case parameters.getDataFieldTypeList().ReceivingItemInternalOrder:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "InternalOrderCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemWBS:
            case parameters.getDataFieldTypeList().ReceivingItemWBS:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "WBSCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingSGLInd:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "SGLIndicatorIssuingCollection");
                break;
            case parameters.getDataFieldTypeList().ReceivingSGLInd:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "SGLIndicatorReceivingCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemGMID:
            case parameters.getDataFieldTypeList().ReceivingItemGMID:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "GMIDCollection");
                break;                
            case parameters.getDataFieldTypeList().IssuingItemUnit:
            case parameters.getDataFieldTypeList().ReceivingItemUnit:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "UnitCollection");
                break;              
            case parameters.getDataFieldTypeList().IssuingItemBusinessArea:
            case parameters.getDataFieldTypeList().ReceivingItemBusinessArea:
            case parameters.getDataFieldTypeList().IssuingBusinessAreaAlt:
            case parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "BusinessAreaCollection");  
            	break;        
            case parameters.getDataFieldTypeList().IssuingItemHsnSac:
            case parameters.getDataFieldTypeList().ReceivingItemHsnSac:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "HsnSacCollection");
                break;     
            case parameters.getDataFieldTypeList().IssuingBusinessPlace:
            case parameters.getDataFieldTypeList().ReceivingBusinessPlace:
                // Set JSON Model
                this._oTSDValueHelp.setModel(new JSONModel(oData), "BusinessPlaceCollection");
                break; 
            default:
                break;
        }
    };

    /**
     * Reset Model to null
     * 
     * @private
     */
    function _resetModel() {

        switch (this._oTSDValueHelp.data("ValueHelpType")) {
            case parameters.getDataFieldTypeList().ReceivingController:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "UserCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingTax:
            case parameters.getDataFieldTypeList().ReceivingTax:
            case parameters.getDataFieldTypeList().IssuingItemTax:
            case parameters.getDataFieldTypeList().ReceivingItemTax:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "TaxCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemCostCenter:
            case parameters.getDataFieldTypeList().ReceivingItemCostCenter:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "CostCenterCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemNature:
            case parameters.getDataFieldTypeList().ReceivingItemNature:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "NatureCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemAccount:
            case parameters.getDataFieldTypeList().ReceivingItemAccount:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "AccountCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemInternalOrder:
            case parameters.getDataFieldTypeList().ReceivingItemInternalOrder:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "InternalOrderCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemWBS:
            case parameters.getDataFieldTypeList().ReceivingItemWBS:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "WBSCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingSGLInd:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "SGLIndicatorIssuingCollection");
                break;
            case parameters.getDataFieldTypeList().ReceivingSGLInd:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "SGLIndicatorReceivingCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemUnit:
            case parameters.getDataFieldTypeList().ReceivingItemUnit:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "UnitCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemBusinessArea:
            case parameters.getDataFieldTypeList().ReceivingItemBusinessArea:
            case parameters.getDataFieldTypeList().IssuingBusinessAreaAlt:
            case parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "BusinessAreaCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingItemHsnSac:
            case parameters.getDataFieldTypeList().ReceivingItemHsnSac:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "HsnSacCollection");
                break;
            case parameters.getDataFieldTypeList().IssuingBusinessPlace:
            case parameters.getDataFieldTypeList().ReceivingBusinessPlace:
                // Set JSON Model
                this._oTSDValueHelp.setModel(null, "BusinessPlaceCollection");
                break;
            default:
                break;
        }

    };

    /**
     * Handles press confirmation item selection
     * 
     * @event
     * @param {eventObject} oEvent the event data context
     * @param {object} oParameters the parameters
     * @public
     */
    function _handleConfirm(oEvent, oParameters) {

        var oSelectedItem = {},
            aSelectedItems = [],
            sModelName,
            fnResetModel = _resetModel;

        switch (this._oTSDValueHelp.data("ValueHelpType")) {
            case parameters.getDataFieldTypeList().ReceivingController:
                sModelName = "UserCollection";
                break;
            case parameters.getDataFieldTypeList().IssuingTax:
            case parameters.getDataFieldTypeList().ReceivingTax:
            case parameters.getDataFieldTypeList().IssuingItemTax:
            case parameters.getDataFieldTypeList().ReceivingItemTax:
                sModelName = "TaxCollection";
                break;
            case parameters.getDataFieldTypeList().IssuingItemGMID:
            case parameters.getDataFieldTypeList().ReceivingItemGMID:
                sModelName = "GMIDCollection";
                break;                
            case parameters.getDataFieldTypeList().IssuingItemCostCenter:
            case parameters.getDataFieldTypeList().ReceivingItemCostCenter:
                sModelName = "CostCenterCollection";
                break;
            case parameters.getDataFieldTypeList().IssuingItemNature:
            case parameters.getDataFieldTypeList().ReceivingItemNature:
                sModelName = "NatureCollection";
                break;
            case parameters.getDataFieldTypeList().IssuingItemAccount:
            case parameters.getDataFieldTypeList().ReceivingItemAccount:
                sModelName = "AccountCollection";
                break;
            case parameters.getDataFieldTypeList().IssuingItemInternalOrder:
            case parameters.getDataFieldTypeList().ReceivingItemInternalOrder:
                sModelName = "InternalOrderCollection";
                break;
            case parameters.getDataFieldTypeList().IssuingItemWBS:
            case parameters.getDataFieldTypeList().ReceivingItemWBS:
                sModelName = "WBSCollection";
                break;
            case parameters.getDataFieldTypeList().IssuingSGLInd:
                sModelName = "SGLIndicatorIssuingCollection";
                break;
            case parameters.getDataFieldTypeList().ReceivingSGLInd:
                sModelName = "SGLIndicatorReceivingCollection";
                break;
            case parameters.getDataFieldTypeList().IssuingItemUnit:
            case parameters.getDataFieldTypeList().ReceivingItemUnit:
                sModelName = "UnitCollection";
                break;
            case parameters.getDataFieldTypeList().IssuingItemBusinessArea:
            case parameters.getDataFieldTypeList().ReceivingItemBusinessArea:
            case parameters.getDataFieldTypeList().IssuingBusinessAreaAlt:
            case parameters.getDataFieldTypeList().ReceivingBusinessAreaAlt:
                sModelName = "BusinessAreaCollection";
                break;
            case parameters.getDataFieldTypeList().IssuingItemHsnSac:
            case parameters.getDataFieldTypeList().ReceivingItemHsnSac:
                sModelName = "HsnSacCollection";
                break;
            case parameters.getDataFieldTypeList().IssuingBusinessPlace:
            case parameters.getDataFieldTypeList().ReceivingBusinessPlace:
                sModelName = "BusinessPlaceCollection";
                break;
            default:
                break;
        }

        if (oParameters["multiSelect"]) {
            oEvent.getParameter("selectedItems").forEach(function(oItem) {
                aSelectedItems.push(oItem.getBindingContext(sModelName).getObject());
            });
            oParameters.fnConfirm.call(this, aSelectedItems);
        } else {
            oSelectedItem = oEvent.getParameter("selectedItem").getBindingContext(sModelName);
            oParameters.fnConfirm.call(this, oSelectedItem.getObject());
        }

        // Reset Model
        fnResetModel.apply(this);

    };

    /**
     * Handles press cancel
     * 
     * @event
     * @param {eventObject} oEvent the event data
     * @public
     */
    function _handleCancel(oEvent) {

        var fnResetModel = _resetModel;

        // Reset Model
        fnResetModel.call(this);
    };

    var oValueHelp = {

        /**
         * Initiate table select dialog for value help request
         * @param {string} sValueHelpType the type of the value help
         * @param {string} sItemPath the item binding path
         * @param {boolean} bMultiSelect to trigger multiselection
         * @param {function} fnConfirm the confirmation function callback
         * @public
         */
        initiateTSD: function(sValueHelpType, sItemPath, bMultiSelect, fnConfirm) {

            var fnSetColumns = _setColumns;
            var fnBindItems = _bindItems;
            var fnHandleSearch = _handleSearch;
            var fnHandleConfirm = _handleConfirm;
            var fnHandleCancel = _handleCancel;
            var fnSetTitle = _setTitle;
            var fnSetCSS = _setCSS;

            if (this._oTSDValueHelp) {
                this._oTSDValueHelp.destroyColumns();
                this._oTSDValueHelp.destroyItems();
            }

            if (!this._oTSDValueHelp) {
                this._oTSDValueHelp = sap.ui.xmlfragment("cus.fi.timi.rel.view.fragment.ValueHelpTableSelectDialog", this);
                this.getView().addDependent(this._oTSDValueHelp);
            }

            this._oTSDValueHelp.data("ValueHelpType", sValueHelpType);
            this._oTSDValueHelp.setMultiSelect(bMultiSelect === true ? true : false);

            // Set Dialog title
            fnSetTitle.call(this);

            // Set results columns
            fnSetColumns.call(this);

            // Bind items
            fnBindItems.call(this);

            // AttachEvent
            this._oTSDValueHelp.detachSearch(fnHandleSearch, this);
            this._oTSDValueHelp.attachSearch(sItemPath, fnHandleSearch, this);

            // First detach event before attaching it again
            this._oTSDValueHelp.detachConfirm(fnHandleConfirm, this);
            this._oTSDValueHelp.attachConfirm({
                "multiSelect": bMultiSelect,
                "fnConfirm": fnConfirm
            }, fnHandleConfirm, this);

            // First detach event before attaching it again
            this._oTSDValueHelp.detachCancel(fnHandleCancel, this);
            this._oTSDValueHelp.attachCancel(fnHandleCancel, this);

            fnSetCSS.call(this);

            this._oTSDValueHelp.open();
        },

    };

    return oValueHelp;

}, true)