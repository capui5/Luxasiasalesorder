sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ndc/BarcodeScanner",
      "com/luxasia/salesorder/util/formatter",
      "sap/ui/model/Filter",
      "sap/ui/model/FilterOperator",
    ],
    function (BaseController, BarcodeScanner, formatter,Filter, FilterOperator) {
      "use strict";
  
      return BaseController.extend("com.luxasia.salesorder.controller.StockInventoryList", {
        formatter:formatter,
        onInit:function(){
          if(!this.StockListProductSearch){
            this.StockListProductSearch = new sap.ui.xmlfragment("com.luxasia.salesorder.view.StockListProductSearch",this);
            this.getView().addDependent(this.StockListProductSearch);
          }
          var oRouter = this.getOwnerComponent().getRouter();   
          oRouter.getRoute("StockInventoryList").attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched:function() {
          var inventoryStockItems = new sap.ui.model.json.JSONModel([]);
          this.getView().setModel(inventoryStockItems,"inventoryStockItems");
          this.getView().byId("storageLocation").setSelectedKey(null);
        },
        onCancelStockInventory:function(){
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("StockList");
        },

        onAfterRendering: function () {
          var that = this;
          var storeType = this.getView().getModel("StoreModel").getProperty("/selectedStoreType");
          var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
          var sStoreId = oStoreModel.getProperty("/selectedStoreId");
          this.sStoreId = sStoreId;
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
          this.StockListProductSearch.getContent()[0].getBinding("items").filter(filters);
          this.getView().getModel("inventoryStockItems").oData = [];
          this.getView().getModel("inventoryStockItems").updateBindings(true);
        },
        onAddInventoryStock:function(){
          if(!this.StockList){
            this.StockList = new sap.ui.xmlfragment("com.luxasia.salesorder.view.StockList",this);
            this.getView().addDependent(this.StockList);
          }
          if(this.getView().byId("storageLocation").getSelectedKey().length == 0){
              sap.m.MessageBox.error("Please select Storage location before adding an item");
          }else{
           
            this.StockList.open();
            this.onScanBarcode();
          }
          
        },
        onCloseFragment:function(){
          this.StockList.close();
        },
        onSearchInventoryStock:function(){
          var filter1 = new sap.ui.model.Filter("StoreId", "EQ", this.sStoreId);
          var filter2 = new sap.ui.model.Filter("StorageLoc", "EQ", this.getView().byId("storageLocation").getSelectedKey());
          var filter3 = new sap.ui.model.Filter("Action", "EQ", "NEW");
          var filters = new sap.ui.model.Filter([filter1, filter2, filter3], true);
          this.StockListProductSearch.getContent()[0].getHeaderToolbar().getContent()[1].setValue();
          this.StockListProductSearch.getContent()[0].getBinding("items").filter(filters);
            this.StockListProductSearch.open();
        },
        onCancelInventoryStock:function(){
          this.StockListProductSearch.close();
        },
        closeSearchProd:function(){
          this.StockListProductSearch.close();
        },
        onAddToStockPress:function(){
          var selectedItems = this.StockListProductSearch.getContent()[0].getSelectedItems();
          var inventoryStockItems = this.getView().getModel("inventoryStockItems").getData();
          for(var m=0;m<selectedItems.length;m++){
            var insertFlag = true;
              for(var b=0;b<inventoryStockItems.length;b++){
                if(selectedItems[m].getBindingContext("mainModel").getObject().Barcode == inventoryStockItems[b].Barcode){
                  inventoryStockItems[b].countQty +=  1;
                  insertFlag = false;
                  break;
                }
              }
              if(insertFlag){
                this.getView().getModel("inventoryStockItems").getData().push({
                  "Action" : selectedItems[m].getBindingContext("mainModel").getObject().Action,
                  "ArticleDesc" : selectedItems[m].getBindingContext("mainModel").getObject().ArticleDesc,
                  "ArticleNo" : selectedItems[m].getBindingContext("mainModel").getObject().ArticleNo,
                  "ArticleType" : selectedItems[m].getBindingContext("mainModel").getObject().ArticleType,
                  "AvailableQty" : selectedItems[m].getBindingContext("mainModel").getObject().AvailableQty,
                  "AveragePrice" : selectedItems[m].getBindingContext("mainModel").getObject().AveragePrice,
                  "Barcode" : selectedItems[m].getBindingContext("mainModel").getObject().Barcode,
                  "StockQty" : selectedItems[m].getBindingContext("mainModel").getObject().StockQty,
                  "StorageLoc" : selectedItems[m].getBindingContext("mainModel").getObject().StorageLoc,
                  "StoreId" : selectedItems[m].getBindingContext("mainModel").getObject().StoreId,
                  "UOM" : selectedItems[m].getBindingContext("mainModel").getObject().UOM,
                  "countQty" : 1
                });
              }
              // else{
              //   inventoryStockItems[b].countQty += 1;
              // }
          }
          this.getView().getModel("inventoryStockItems").updateBindings(true);
          this.StockList.close();
          this.StockListProductSearch.close();
          this.StockListProductSearch.getContent()[0].removeSelections(false);
        },
        onScanBarcode: function () {
          var that = this;
          if (sap.ndc && sap.ndc.BarcodeScanner) {
            sap.ndc.BarcodeScanner.scan(
              function (mResult) {
                var filter1 = new sap.ui.model.Filter("StoreId", "EQ", that.sStoreId);
                var filter2 = new sap.ui.model.Filter("StorageLoc", "EQ", that.getView().byId("storageLocation").getSelectedKey());
                var filter3 = new sap.ui.model.Filter("Action", "EQ", "NEW");
               // var filter4 = new sap.ui.model.Filter("Barcode", "EQ", mResult.text);
                var filters = new sap.ui.model.Filter([filter1, filter2, filter3], true);
                that.getView().setBusy(true);
                that.getOwnerComponent().getModel("mainModel").read("/InventoryDetailSet",{
                  filters:[filters],
                  urlParameters : {
                    search: mResult.text
                  },
                  success:function(oData,oResponse){
                    that.getView().setBusy(false);
                    var sText = mResult.text;    
                    if (isValidBarcode(sText)) {
                      var selectedItems = sText;
                      var inventoryStockItems = oData.results;
                     for(var m=0;m<inventoryStockItems.length;m++){
                      if(inventoryStockItems[m].Barcode == sText){
                        var barCodeObject = {
                          "Action" : inventoryStockItems[m].Action,
                          "ArticleDesc" : inventoryStockItems[m].ArticleDesc,
                          "ArticleNo" : inventoryStockItems[m].ArticleNo,
                          "ArticleType" : inventoryStockItems[m].ArticleType,
                          "AvailableQty" : inventoryStockItems[m].AvailableQty,
                          "AveragePrice" : inventoryStockItems[m].AveragePrice,
                          "Barcode" : inventoryStockItems[m].Barcode,
                          "StockQty" : inventoryStockItems[m].StockQty,
                          "StorageLoc" : inventoryStockItems[m].StorageLoc,
                          "StoreId" : inventoryStockItems[m].StoreId,
                          "UOM" : inventoryStockItems[m].UOM,
                          "countQty" : 1
                        };
                        break;
                      }
                     }
                     if(barCodeObject == undefined){
                        sap.m.MessageBox.error("Bar code is not present");
                        return;
                     }
                     //insert an item into an table
                     var inventoryStockItems = that.getView().getModel("inventoryStockItems").getData();
                     if(inventoryStockItems.length == 0){
                      that.getView().getModel("inventoryStockItems").getData().push(barCodeObject);
                      that.StockList.close();
                      that.getView().getModel("inventoryStockItems").updateBindings(true);
                     }else{
                      var barCodeInsertFlag = true;
                      for(var b=0;b<inventoryStockItems.length;b++){
                          if(inventoryStockItems[b].Barcode == sText){
                            inventoryStockItems[b]["countQty"] = inventoryStockItems[b]["countQty"] + 1;
                            barCodeInsertFlag = false;
                            break;
                          }
                      }
                      if(barCodeInsertFlag) 
                      inventoryStockItems.push(barCodeObject);
                      that.StockList.close();
                      that.getView().getModel("inventoryStockItems").updateBindings(true);
                     }
                    } else {
                      sap.m.MessageBox.error("Invalid barcode: " + sText);
                    }
                  },
                  error:function(oData,oResponse){
                    that.getView().setBusy(false);
                  }
                });


                
              },
              function (Error) {
                // Handle errors when scanning fails
                sap.m.MessageBox.error("Scanning failed: " + Error);
              }
            );
          } else {
            console.error("BarcodeScanner is not defined in sap.ndc");
          }
    
          function isValidBarcode(barcode) {
            return barcode.trim().length > 0;
          }
    
        },
        onSearch: function (oEvent) {           
          var sQuery = oEvent.getParameter("query");            
          var oTable = this.StockListProductSearch.getContent()[0];
          var oBinding = oTable.getBinding("items");
          if (sQuery && sQuery.length > 0) {
              // var aFilters = [
              //     new sap.ui.model.Filter("ArticleDesc", "EQ", sQuery),
              //     new sap.ui.model.Filter("ArticleNo", "EQ", sQuery),
              //     new sap.ui.model.Filter("Barcode", "EQ", sQuery)
              // ];
              var filter1 = new sap.ui.model.Filter("StoreId", "EQ", this.sStoreId);
              var filter2 = new sap.ui.model.Filter("StorageLoc", "EQ", this.getView().byId("storageLocation").getSelectedKey());
              var filter3 = new sap.ui.model.Filter("Action", "EQ", "NEW");
              var filters = new sap.ui.model.Filter([filter1, filter2, filter3], true);
              oBinding.sCustomParams = "search=" + sQuery;
              oBinding.filter(new Filter(filters, false));
          } else {
            var filter1 = new sap.ui.model.Filter("StoreId", "EQ", this.sStoreId);
            var filter2 = new sap.ui.model.Filter("StorageLoc", "EQ", this.getView().byId("storageLocation").getSelectedKey());
            var filter3 = new sap.ui.model.Filter("Action", "EQ", "NEW");
            var filters = new sap.ui.model.Filter([filter1, filter2, filter3], true);
              oBinding.filter(filters);
          }
      },
        onSubmitStockInventory:function(){
          var that = this;
          var errorText = this.validateMandatFields();
          if(errorText.length > 0){
            sap.m.MessageBox.error(errorText);
          }else{
            var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
          var sStoreId = oStoreModel.getProperty("/selectedStoreId");
          var selectedDate = new Date();
          var milliseconds = selectedDate.getTime();
          var formattedDate = '/Date(' + milliseconds + ')/';
          var salesEmp = this.getOwnerComponent().getModel("SalesEmployeeModel").oData.results[0].Pernr;
          var salesEmpEmail = this.getOwnerComponent().getModel("SalesEmployeeModel").oData.results[0].Email;
          var storageLoc = this.getView().byId("storageLocation").getSelectedKey();
          var payload = {
            "StockCountNo": "",
            //"Status": "S",
            //"StatusDesc": "",
            "CreationDateTime": formattedDate,
            "Status": "",
            "StatusDesc": "",
            "SalesEmp": salesEmp,
            "StoreId": sStoreId,
            "StorageLoc": storageLoc,
            "CreatedByEmail" :salesEmpEmail,
            "to_inventory_detail": []
          }
          var inventoryStockItems = this.getView().getModel("inventoryStockItems").getData();
          for(var m=0;m<inventoryStockItems.length;m++){
            payload.to_inventory_detail.push({
              "StockCountNo": "",
              "ArticleNo": inventoryStockItems[m].ArticleNo,
              "ArticleDesc": inventoryStockItems[m].ArticleDesc,
              "ArticleType":inventoryStockItems[m].ArticleType,
              "Barcode": inventoryStockItems[m].Barcode,
              "AvailableQty": inventoryStockItems[m].AvailableQty,
              "AveragePrice": inventoryStockItems[m].AveragePrice,
              "StockQty": inventoryStockItems[m].countQty + "",
              "StoreId": sStoreId,
              "StorageLoc": storageLoc,
              "UOM" : inventoryStockItems[m].UOM,
              "Action": ""
            });
          }
          var oBusyDialog = new sap.m.BusyDialog({
            title: "Creating Inventory Stock",
            text: "Please wait...."
          });
          this.getOwnerComponent().getModel("mainModel").create("/InventoryHeadSet",payload,{
            success:function(oData,oResponse){
                oBusyDialog.close();  
                sap.m.MessageBox.success("Inventory Order created successfully. Stock Count No: " + oData.StockCountNo, {
                    onClose: function () {
                var oModel = that.getView().getModel("inventoryStockItems");
                oModel.setData([]);
                oModel.updateBindings(true);
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("StockList");
                    }
                  });
            },
            error:function(error,oResponse){
                oBusyDialog.close();
                var errorDetails = error.responseText ? JSON.parse(error.responseText).error.innererror.errordetails : [];

                var errorMessage = "An error occurred. Details:\n";
                errorDetails.forEach(function (detail) {
                    errorMessage += "- " + detail.message + "\n";
                });

                // Show the error message in a message box or dialog
                sap.m.MessageBox.error(errorMessage, {
                    title: "Error"
                });
                            }
        });
          }
          
        },
        validateMandatFields:function(){
            var errorText = "";
            var inventoryStockItems = this.getView().getModel("inventoryStockItems").getData();
            if(this.getView().byId("storageLocation").getSelectedKey().length == 0){
              errorText += "Please select the storage location\n";
            }
            if(inventoryStockItems.length == 0){
              errorText += "Please add atleast an item to create the Stock Inventory";
            }
            return errorText;
        },
        onDeleteItem:function(evt){
            var that = this;
            var inventoryStockItems = that.getView().getModel("inventoryStockItems").getData();
            var selectedPath = evt.getSource().getBindingContext("inventoryStockItems").getPath().split("/")[0];
            sap.m.MessageBox.confirm("Are you sure you want to delete this product?",{
              onClose:function(oEvent){
                  if(oEvent == "OK"){
                    that.getView().getModel("inventoryStockItems").getData().splice(selectedPath,1);
                    that.getView().getModel("inventoryStockItems").updateBindings(true);
                  }
              }
            });
        }
        
      });
    }
  );
  