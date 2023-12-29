sap.ui.define(
    [
      "sap/ui/core/mvc/Controller"
    ],
    function (BaseController) {
      "use strict";
  
      return BaseController.extend("com.luxasia.salesorder.controller.StockInventoryList", {
        onAfterRendering: function () {
          var that = this;
          var storeType = this.getView().getModel("StoreModel").getProperty("/selectedStoreType");
          var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
          var sStoreId = oStoreModel.getProperty("/selectedStoreId");
          var oModel = this.getOwnerComponent().getModel("mainModel");
          var oBusyDialog = new sap.m.BusyDialog({
            title: "Please wait....",
            //text: "Please wait...."
          });
          //this.getView().setBusy(true);
          var oUrlParams = {
            StoreId: "'" + sStoreId + "'",
            Type: "'STORAGE_LOC'"
          };
          oBusyDialog.open();
          oModel.read("/PODetails", {
            urlParameters: oUrlParams,
            success: function (response) {
              oBusyDialog.close();
              var model = new sap.ui.model.json.JSONModel(response.results);
              model.setSizeLimit(100000000);
              that.getView().setModel(model, "storageLocModel");
              //that.getView().byId("storageLocation").setSelectedKey("0001");
            },
            error: function (error) {
              oBusyDialog.close();
              //that.getView().setBusy(false);
            }
          });
        },
        handleStorageLocation: function (evt) {
          var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
          var sStoreId = oStoreModel.getProperty("/selectedStoreId");
          var filter1 = new sap.ui.model.Filter("StoreId", "EQ", sStoreId);
          var filter2 = new sap.ui.model.Filter("StorageLoc", "EQ", evt.getSource().getSelectedKey());
          var filter3 = new sap.ui.model.Filter("Action", "EQ", "NEW");
          var filters = new sap.ui.model.Filter([filter1, filter2, filter3], true);
          this.getView().byId("inventoryStockTable").getBinding("items").filter(filters);
        },
        onAddInventoryStock:function(){
          if(!this.StockList){
            this.StockList = new sap.ui.xmlfragment("com.luxasia.salesorder.view.StockList",this);
            this.getView().addDependent(this.StockList);
          }
          this.StockList.open();
        },
        onCloseFragment:function(){
          this.StockList.close();
        }
      
      });
    }
  );
  