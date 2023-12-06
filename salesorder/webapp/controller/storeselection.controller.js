sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("com.luxasia.salesorder.controller.storeselection", {
    onInit: function () {
      var storedStoreId = localStorage.getItem("selectedStoreId");
// Function to load all stores on view initialization
const oComponent = this.getOwnerComponent();
const oModel = oComponent.getModel("mainModel");


    // If the model is already available, proceed to load stores


      var oStoreModel = new JSONModel({ selectedStoreId: storedStoreId });
      this.getOwnerComponent().setModel(oStoreModel, "StoreModel");
     
      // Ensure StoreModel always updates localStorage
      oStoreModel.attachPropertyChange(function (oEvent) {
        if (oEvent.getParameter("path") === "/selectedStoreId") {
          var sNewStoreId = oEvent.getParameter("value");
          localStorage.setItem("selectedStoreId", sNewStoreId);
        }
      });

    },
  
  
    onNextPagePress: function () {
      var oModel = this.getOwnerComponent().getModel("SelectedBrandName");
      oModel.setData({ modelData: {} });
      oModel.updateBindings(true);
      var oComboBox = this.byId("storeSelect");

      if (!oComboBox) {
        console.error("ComboBox is not available.");
        return;
      }

      var oSelectedItem = oComboBox.getSelectedItem();

      if (!oSelectedItem) {
        sap.m.MessageToast.show("Please select a store.");
        return;
      }

      var oContext = oSelectedItem.getBindingContext("mainModel");

      if (oContext) {
        var sStoreId = oContext.getProperty("StoreId");

        var oJsonModel = this.getView().getModel("StoreModel");
        if (oJsonModel) {
          oJsonModel.setProperty("/selectedStoreId", sStoreId);

          // Save selectedStoreId to localStorage
          localStorage.setItem("selectedStoreId", sStoreId);

          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("brand", { SStoreId: sStoreId });
        } else {
          console.error("Store model not found.");
        }
      } else {
        console.error("Binding context is not available.");
      }
    }
  });
});
