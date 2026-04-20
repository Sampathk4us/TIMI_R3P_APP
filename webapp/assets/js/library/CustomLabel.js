sap.ui.define([
    "sap/m/Label",
    "sap/ui/core/Icon"
], function(Label, Icon) {
    "use strict";

    return Label.extend("cus.fi.timi.rel.assets.js.library.CustomLabel", {
        metadata: {
            properties: {
                icon: { type: "sap.ui.core.URI", defaultValue: "" },
                iconColor: { type: "sap.ui.core.CSSColor", defaultValue: "" },
                iconVisible: { type: "boolean", defaultValue: true },
                iconSize: { type: "sap.ui.core.CSSSize", defaultValue: "0.75rem" }
            },
            aggregations: {
                iconTooltip: { type: "sap.ui.core.TooltipBase", multiple: false },
                // Agrégation privée pour l'icône interne
                _icon: { type: "sap.ui.core.Icon", multiple: false, visibility: "hidden" }
            }
        },

        // On initialise l'icône une seule fois
        init: function() {
            Label.prototype.init.apply(this, arguments);
            this.setAggregation("_icon", new Icon({
                useIconTooltip: false
            }).addStyleClass("customSuperscriptIcon"));
        },

        renderer: {
            apiVersion: 2,
            render: function(oRm, oControl) {
                oRm.openStart("label", oControl);
                oRm.class("sapMLabel");
                if (oControl.getRequired()) { oRm.class("sapMLabelRequired"); }
                
                // Tooltip du Label (natif)
                var sTooltip = oControl.getTooltip_AsString();
                if (sTooltip) { oRm.attr("title", sTooltip); }
                oRm.openEnd();

                oRm.text(oControl.getText());

                // Rendu de l'icône interne
                if (oControl.getIcon() && oControl.getIconVisible()) {
                    var oIcon = oControl.getAggregation("_icon");
                    var oCustomTooltip = oControl.getIconTooltip();

                    // Mise à jour dynamique de l'icône avant le rendu
                    oIcon.setSrc(oControl.getIcon());
                    oIcon.setSize(oControl.getIconSize());
                    
                    if (oControl.getIconColor()) {
                        oIcon.setColor(oControl.getIconColor());
                    }
                    
                    // On lie le tooltip personnalisé à l'icône
                    if (oCustomTooltip) {
                        oIcon.setTooltip(oCustomTooltip);
                    }

                    oRm.openStart("span");
                    oRm.style("vertical-align", "super");
                    oRm.style("font-size", oControl.getIconSize());
                    oRm.style("margin-left", "5px");
                    oRm.style("display", "inline-block");
                    oRm.openEnd();

                    oRm.renderControl(oIcon);

                    oRm.close("span");
                }
                oRm.close("label");
            }
        }
    });
});