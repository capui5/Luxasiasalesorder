/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/luxasia/salesorder/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("com.luxasia.salesorder.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
           
                if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
                    // Reloaded the page
                    window.location.href = "index.html"; // Redirect to index.html
                  } else {
                    // Normal load or other conditions
                    // Your app's usual routing or functionality
                    if(window.location.host.indexOf("luxasia") != (-1))
                    window.location.hash = "#SalesOrder-Managed?sap-ui-app-id-hint=saas_approuter_com.luxasia.salesorder";
                  }
                  
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            },
            
        });
    }
);