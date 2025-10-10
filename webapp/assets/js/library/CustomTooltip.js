/************************************************************************
 * Project            : TIMI	                                 		*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                			        *
 * Technical document :                                    	           	*
 *----------------------------------------------------------------------*
 * File       	 : assets/js/library/CustomTooltip.js					*   				                      	
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 11/10/2018                                           *
 *----------------------------------------------------------------------*
 * Description   : CustomTooltip extends from sap.ui.core.TooltipBase	*
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
 * @fileOverview Custom Tooltip
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
  "sap/ui/core/TooltipBase",
  "sap/m/Text",
  "sap/ui/core/library",
  "sap/ui/core/Control",
  "cus/fi/timi/rel/assets/js/library/CustomTooltipRenderer",
], function(TooltipBase, Text, sapUiCore, Control) {
  "use strict";

  return TooltipBase.extend("cus.fi.timi.rel.assets.js.library.CustomTooltip", {
    metadata: {
      properties: {
        "maxWidth": {
          type: sapUiCore.CSSSize.getName(),
          group: "Dimension",
          defaultValue: "20rem"
        },
        "height": {
          type: sapUiCore.CSSSize.getName(),
          group: "Dimension",
          defaultValue: "auto"
        },
        "width": {
          type: sapUiCore.CSSSize.getName(),
          group: "Dimension",
          defaultValue: "auto"
        }
      },
      defaultAggregation: "content",
      aggregations: {
        "content": {
          type: Control.getMetadata().getName(),
          multiple: false,
          bindable: true,
        },
        "_text": {
          type: Text.getMetadata().getName(),
          multiple: false,
          hidden: true,
        }
      },
    },
    
    init: function() {
      if (typeof TooltipBase.prototype.init === "function") {
        TooltipBase.prototype.init.apply(this, arguments);
      }
      this._validateRendering();
    },
    
    setText: function(text) {
      if (typeof TooltipBase.prototype.setText === "function") {
        TooltipBase.prototype.setText.call(this, text);
      }
      if (!this.getAggregation("_text")) {
        const textControl = new Text();
        this.setAggregation("_text", textControl);
      }
      this.getAggregation("_text").setText(text);
      this.setProperty("text", text, true);
      return this._validateRendering();
    },

    setContent: function(control) {
      this.setAggregation("content", control, true);
      this._validateRendering();
    },

    destroyContent: function() {
      this.destroyAggregation("content", true);
      this._validateRendering();
    },

    _validateRendering: function() {
      const contentToRender = this.getContent() || this.getText().trim();
      return this.setVisible(!!contentToRender);
      // TooltipBase disallows rending this control when it's invisible.
    },

  });
});