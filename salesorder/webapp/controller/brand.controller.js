sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/BusyDialog"
], function (Controller, JSONModel, Filter, FilterOperator, BusyDialog) {
  "use strict";

  return Controller.extend("com.luxasia.salesorder.controller.brand", {
    onInit: function () {

      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

      oRouter.getRoute("brand").attachMatched(this._onRouteMatched, this);

    
     
      var oModel = this.getOwnerComponent().getModel("BrandStoreModel");
      this.getView().setModel(oModel, "BrandStoreModel");

      var aModel = this.getOwnerComponent().getModel("SelectedBrandName");
      this.getView().setModel(aModel, "SelectedBrandName");
    },
    _onRouteMatched: function (oEvent) {
      var oArgs = oEvent.getParameter("arguments");
      var sStoreId = oArgs.SStoreId;
      if (sStoreId) {
        var oModel = this.getOwnerComponent().getModel("mainModel");
       // var oJsonModel = new sap.ui.model.json.JSONModel();
        var oJsonModel = this.getView().getModel("BrandStoreModel");
        var oBusyDialog = new BusyDialog({
          title: "Loading Brands",
          text: "Please wait...."
        });
        oBusyDialog.open();
        var oFilter = new Filter("StoreId", FilterOperator.EQ, sStoreId);
        var that = this;
        oModel.read("/BrandSet", {
          filters: [oFilter],
          success: function (response) {
            oBusyDialog.close();
            oJsonModel.setData(response.results);
            that.getView().setModel(oJsonModel, "BrandStoreModel");
            
        
          },
          error: function (error) {
            oBusyDialog.close();
          }
        });
      } else {
        console.error("Store ID is not available.");
      }
    },

    onAddButtonPress: function (oEvent) {
      var oModel = this.getView().getModel("SelectedBrandName");
var oSelectedBrand = oEvent.getSource().getBindingContext("BrandStoreModel").getObject();
var sBrandId = oSelectedBrand.BrandId;
var sBrandName = oSelectedBrand.BrandDesc;

var aSelectedBrands = oModel.getProperty("/selectedBrandNames") || [];

var exists = aSelectedBrands.some(function(brand) {
  return brand.Brand_Id === sBrandId; // Check based on Brand_Id
});

if (exists) {
  // Show error message as the item is already selected
  sap.m.MessageToast.show("Brand already selected.");
} else {
  // Add the item to selected brands if it doesn't exist
  aSelectedBrands.push({ Brand_Id: sBrandId, value: sBrandName });
  oModel.setProperty("/selectedBrandNames", aSelectedBrands);

  // Save the updated selected brands to local storage
  localStorage.setItem("selectedBrands", JSON.stringify(aSelectedBrands));
}
    },
    
    

    // Login: function () {
    //   var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
    //   var oModel = this.getView().getModel("myData");

    //   // Ensure the model and the property containing selected brands are defined
    //   if (oModel && oModel.getProperty("/selectedBrandNames")) {
    //     var aSelectedBrands = oModel.getProperty("/selectedBrandNames");

    //     if (Array.isArray(aSelectedBrands) && aSelectedBrands.length > 0) {
    //       var aBrandIds = aSelectedBrands.map(function (brand) {
    //         return brand.id;
    //       });

    //       oRouter.navTo("mainmenu", { brandIds: aBrandIds });
    //     } else {
    //       console.error("No brands selected.");

    //     }
    //   } else {
    //     console.error("Model or selected brands property not found.");

    //   }
    // }
    Login: function() {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      var oModel = this.getView().getModel("SelectedBrandName");
      var aSelectedBrands = oModel.getProperty("/selectedBrandNames");
    
      if (!aSelectedBrands || aSelectedBrands.length === 0) {
        // Show an error message if no brands are selected
        sap.m.MessageToast.show("Please select brands.");
      } else {
        // Navigate to "mainmenu" route and pass the selected brands as parameters
        oRouter.navTo("mainmenu", {
          selectedBrands: aSelectedBrands
        });
      }
    },
    onDeletePress: function(oEvent) {
      var oButton = oEvent.getSource();
      var oListItem = oButton.getParent().getParent(); // Adjust the level according to your structure
      var oBindingContext = oListItem.getBindingContext("SelectedBrandName");
      var sPath = oBindingContext.getPath();
      var iIndex = parseInt(sPath.split("/")[sPath.split("/").length - 1]);
  
      var oModel = this.getView().getModel("SelectedBrandName");
      var aSelectedBrands = oModel.getProperty("/selectedBrandNames");
  
      aSelectedBrands.splice(iIndex, 1); // Remove the item from the array
  
      oModel.setProperty("/selectedBrandNames", aSelectedBrands);
      localStorage.setItem("selectedBrands", JSON.stringify(aSelectedBrands)); // Update local storage
  }
  });
});
