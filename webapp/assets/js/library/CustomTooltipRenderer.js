/************************************************************************
 * Project            : TIMI	                                 		*
 * Process            : FI                                              *
 * Task code          : FI062                                           *
 * Functional document:                                			        *
 * Technical document :                                    	           	*
 *----------------------------------------------------------------------*
 * File       	 : assets/js/library/CustomTooltipRenderer.js			*   				                      	
 * Author        : David TEA                                            *
 * Company       : Resp                                               	*
 * Creation Date : 11/10/2018                                           *
 *----------------------------------------------------------------------*
 * Description   : Renderer of CustomTooltip							*
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
 * @fileOverview Custom Tooltip Renderer
 * @author David Tea 
 * @version 1.0
 */
sap.ui.define([
  "sap/ui/core/theming/Parameters",
  "sap/ui/core/library",
], function(ThemingParameters, sapCoreLib) {
  "use strict";

  const backgroundColor = ThemingParameters.get("sapUiGroupContentBackground");
  const OpenState = sapCoreLib.OpenState;
  
  return {
    render: function(renderManager, control) {
      /*Currently, render function of all TooltipBase children are called twice
        whereas rendering is only needed when the Popup is opening.*/
      if (control._getPopup().getOpenState() === OpenState.OPENING) {
        const textControl = control.getAggregation("_text");
        const alternateControl = control.getAggregation("content");
        const controlToRender = alternateControl
          ? alternateControl
          : textControl.addStyleClass("sapUiTinyMargin");
        renderManager.write("<div")
          .writeControlData(control)
          .writeClasses()
          .addStyle("max-width", control.getMaxWidth())
          .addStyle("height", control.getHeight())
          .addStyle("width", control.getWidth())
          .addStyle("background-color", backgroundColor) // theme-dependent
          .writeStyles()
          .write(">")
          .renderControl(controlToRender)
          .write("</div>");
      }
    },
  };
}, true);