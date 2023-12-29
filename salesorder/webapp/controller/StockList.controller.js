sap.ui.define(
  [
    "sap/ui/core/mvc/Controller"
  ],
  function (BaseController) {
    "use strict";

    return BaseController.extend("com.luxasia.salesorder.controller.StockList", {
      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("transaction").attachPatternMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function (evt) {
        this.handleInventorySet();
      },
      
      handleInventorySet: function () {
        var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
        var sStoreId = oStoreModel.getProperty("/selectedStoreId");
        var filter1 = new sap.ui.model.Filter("StoreId", "EQ", sStoreId);
        var filter2 = new sap.ui.model.Filter("StorageLoc", "EQ", "0001");
        var filter3 = new sap.ui.model.Filter([filter1, filter2], true);
        this.getView().byId("inventory").getBinding("items").filter(filter3);
      },
      onAfterRendering: function () {
        var that = this;
        this.handleInventorySet();
        var storeType = this.getView().getModel("StoreModel").getProperty("/selectedStoreType");
        var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
        var sStoreId = oStoreModel.getProperty("/selectedStoreId");
        var oModel = this.getOwnerComponent().getModel("mainModel");
        
      },
      onInventoryPress: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("StockInventoryList");
      }

      

    
    });
  }
);
