sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "com/luxasia/salesorder/util/formatter",
    "sap/ui/core/routing/History",
  ],
  function (BaseController,formatter,History) {
    "use strict";

    return BaseController.extend("com.luxasia.salesorder.controller.StockList", {
      formatter:formatter,
      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("StockList").attachPatternMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function (evt) {
        this.handleInventorySet();
        this.selectFirstItem = true;
        if(this.getView().getModel("storageLocationModel"))
        this.getView().byId("storageLocation").setSelectedKey("0001");
      },
      
      handleInventorySet: function () {
        var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
        var sStoreId = oStoreModel.getProperty("/selectedStoreId");
        var email = this.getView().getModel("SalesEmployeeModel" ).oData.results[0].Email;
        var filter1 = new sap.ui.model.Filter("StoreId", "EQ", sStoreId);
        var filter2 = new sap.ui.model.Filter("StorageLoc", "EQ", "0001");
        var filter3 = new sap.ui.model.Filter("CreatedByEmail", "EQ", email);
        var filters = new sap.ui.model.Filter([filter1, filter2,filter3], true);
        this.getView().byId("inventory").getBinding("items").filter(filters);
      },
      onAfterRendering: function () {
        var that = this;
        this.handleInventorySet();
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
            that.getView().setModel(model, "storageLocationModel");
            //that.getView().byId("storageLocation").setSelectedKey("0001");
          },
          error: function (error) {
            oBusyDialog.close();
            //that.getView().setBusy(false);
          }
        });
      },
      onInventoryPress: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("StockInventoryList");
      },
      onListUpdateFinished:function(){
        if(this.getView().byId("inventory").getItems().length == 0 && window.location.hash.indexOf("StockList") != (-1)){
          sap.m.MessageBox.information("There are no record exists. Please click of Stock Inventory button to initiate the creation");
          this.getView().getModel("InventoryDetails").oData = [];
          this.getView().getModel("InventoryDetails").updateBindings(true);
        }else if(this.selectFirstItem)
        this.onListItemPress(this.getView().byId("inventory").getItems()[0],true);
      },
      onListItemPress: function (oEvent,flag) {
        var that = this;
        this.getView().setBusy(true);
        if(flag)
        var oSelectedItem = oEvent.getBindingContext("mainModel").getObject();
        else
        var oSelectedItem = oEvent.getParameter("listItem").getBindingContext("mainModel").getObject();
        this.oSelectedItem =  oSelectedItem;
        var headerModel = new sap.ui.model.json.JSONModel(this.oSelectedItem);
        this.getView().setModel(headerModel,"headerModel");
        this.getOwnerComponent().getModel("mainModel").read("/InventoryDetailSet",{
            filters : [new sap.ui.model.Filter("StockCountNo","EQ",oSelectedItem.StockCountNo)],
            success:function(oData,oResponse){
              that.getView().setBusy(false);
              var InventoryDetails = new sap.ui.model.json.JSONModel(oData.results);
              that.getView().setModel(InventoryDetails,"InventoryDetails");
              that.getView().getModel("InventoryDetails").updateBindings(true);
              that.onVisibleFields(oData.results);
              if(flag != true){
                var oSplitContainer = that.byId("splitStockContainer");
                oSplitContainer.toMaster(that.createId("stockListDetail"));
              }
              
            },
            error:function(oData,oResponse){
              that.getView().setBusy(false);
            }
          });       
      },
      onDetailNavBack:function(){
        var oSplitContainer = this.byId("splitStockContainer");
        oSplitContainer.toMaster(this.createId("stockListMaster"));
      },
      onVisibleFields:function(itemLength,status){
          if(itemLength.length == 0 || this.oSelectedItem.Status == "P" || this.oSelectedItem.Status == "D"){
            this.getView().byId("postAdjustment").setVisible(false);
            this.getView().byId("recount").setVisible(false);
            this.getView().byId("submit").setVisible(false);
            this.getView().byId("Cancel").setVisible(false);
          }else{
              if(this.oSelectedItem.Status == "S"){
                this.getView().byId("postAdjustment").setVisible(true);
                this.getView().byId("recount").setVisible(true);
                this.getView().byId("submit").setVisible(false);
                this.getView().byId("Cancel").setVisible(true);
              }
              if(this.oSelectedItem.Status == "R"){
                this.getView().byId("postAdjustment").setVisible(false);
                this.getView().byId("recount").setVisible(false);
                this.getView().byId("submit").setVisible(true);
                this.getView().byId("Cancel").setVisible(true);
              }
          }
      },
      onShowFilters: function () {
        var oFiltersContainer = this.getView().byId("filtersContainer");
        oFiltersContainer.setVisible(!oFiltersContainer.getVisible());
        var stockCountNumber = this.getView().byId("stockCountNo").getValue();
        var startDate = this.getView().byId("stockCountNo").getValue();
        var endDate = this.getView().byId("stockCountNo").getValue();
        var storageLocation = this.getView().byId("stockCountNo").getValue();

    },
    onGoButtonPress: function (evt) {
      var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
        var sStoreId = oStoreModel.getProperty("/selectedStoreId");
        var email = this.getView().getModel("SalesEmployeeModel" ).oData.results[0].Email;
      var filter1 = new sap.ui.model.Filter("StoreId", "EQ", sStoreId);
      var filterEmail = new sap.ui.model.Filter("CreatedByEmail", "EQ", email);
      var beginDate = this.getView().byId("startDatePicker").getValue();
      var endDate = this.getView().byId("endDatePicker").getValue();
      var stockCountNo = this.getView().byId("stockCountNo").getValue();
      var storageLocation = this.getView().byId("storageLocation").getSelectedKey();
      var filters=[filter1,filterEmail];
      
         if (stockCountNo.length > 0) {         
          var filter3 = new sap.ui.model.Filter("StockCountNo", "EQ", stockCountNo);
          filters.push(filter3);
      } else if (beginDate.length > 0 && endDate.length > 0) {
        var formattedBeginDate = new Date(new Date(beginDate).toString().split("GMT ")[0] + " UTC ").toISOString();
        var formattedEndDate = new Date(new Date(endDate).toString().split("GMT ")[0] + " UTC ").toISOString();
        var filter2 = new sap.ui.model.Filter("CreationDateTime", "BT", formattedBeginDate, formattedEndDate);
        filters.push(filter2);
      }
      if (storageLocation.length > 0) {         
        var filter4 = new sap.ui.model.Filter("StorageLoc", "EQ", storageLocation);
        filters.push(filter4);
    } 
    if (beginDate.length == 0 && endDate.length > 0) {
          sap.m.MessageToast.show("Please enter the Begin date");
          return;
      } 
      if (beginDate.length > 0 &&endDate.length == 0) {
          sap.m.MessageToast.show("Please enter the End date");
          return;
      }
 
      var filterParam = new sap.ui.model.Filter(filters, true);
      this.getView().byId("inventory").getBinding("items").filter(filterParam);
  },
  
    onNavBack: function () {
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
          window.history.go(-1);
      } else {
          this.getRouter().navTo("mainmenu", {}, true);
      }
  },
  onPostAdjustmentPress:function(evt){
    var that = this;
    var SModel = this.getOwnerComponent().getModel("SalesEmployeeModel");
    var UserEmail = SModel.getProperty("/results/0/Email");
    var selectedDate = new Date();
    var milliseconds = selectedDate.getTime();
    var formattedDate = '/Date(' + milliseconds + ')/';
    var payload = {
      "StockCountNo": this.oSelectedItem.StockCountNo,
      "CreationDateTime": formattedDate,
      "Status": "P",
      "StatusDesc": "",
      "SalesEmp": this.oSelectedItem.SalesEmp,
      "StoreId": this.oSelectedItem.StoreId,
      "StorageLoc": this.oSelectedItem.StorageLoc,
      "CreatedByEmail" :UserEmail,
      "Action" : "GR-POST",

      "to_inventory_detail": []
    };
    var stockLineItems = that.getView().getModel("InventoryDetails").getData();
    for(var m=0;m<stockLineItems.length;m++){
      payload.to_inventory_detail.push({
        "StockCountNo": stockLineItems[m].StockCountNo,
        "ArticleNo":stockLineItems[m].ArticleNo,
        "ArticleDesc": stockLineItems[m].ArticleDesc,
        "ArticleType": stockLineItems[m].ArticleType,
        "Barcode": stockLineItems[m].Barcode,
        "AvailableQty": stockLineItems[m].AvailableQty,
        "AveragePrice": stockLineItems[m].AveragePrice,
        "StockQty": this.getView().byId("inventoryStockTableDetail").getItems()[m].getCells()[5].getValue() + "",
        "StoreId": this.oSelectedItem.StoreId,
        //"StorageLoc": stockLineItems[m].StorageLoc,
        "StorageLoc": this.oSelectedItem.StorageLoc,

        //"UOM" : stockLineItems[m].UOM,
        "UOM" : "ST",
        "Action": ""
      });
    }
    
    this.getOwnerComponent().getModel("mainModel").create("/InventoryHeadSet",payload,{
      success:function(oData,oResponse){
          sap.m.MessageBox.success("Post Adjustment is successful");
          that.selectFirstItem = false;
          that.getOwnerComponent().getModel("mainModel").refresh(true);
          that.oSelectedItem.Status = "P";
          that.getView().getModel("headerModel").setProperty("/Status","P");
          that.onVisibleFields([1,2],"P");
      },
      error:function(error,oResponse){
        //sap.m.MessageBox.error(JSON.parse(oData.responseText).error.message.value);
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
  },
  onRecountPress:function(){
    this.onUpdateStatus("R");
  },
  onCancelPress:function(){
    this.onUpdateStatus("D");
  },   
  onUpdateStatus:function(status){
      var that = this;
      var selectedDate = new Date();
    var milliseconds = selectedDate.getTime();
    var formattedDate = '/Date(' + milliseconds + ')/';
      var payload = {
        "StockCountNo": this.oSelectedItem.StockCountNo,
        "CreationDateTime": formattedDate,
        "Status": status,
        "StatusDesc": "",
        "SalesEmp": this.oSelectedItem.SalesEmp,
        "StoreId": this.oSelectedItem.StoreId,
        "StorageLoc": this.oSelectedItem.StorageLoc,
        "Action" : ""
      }
      this.getOwnerComponent().getModel("mainModel").sDefaultUpdateMethod = sap.ui.model.odata.UpdateMethod.Put;
      this.getOwnerComponent().getModel("mainModel").update("/InventoryHeadSet(StockCountNo='" + this.oSelectedItem.StockCountNo + "')",payload,{
        success:function(oData,oResponse){ 
          if(status == "R")
            sap.m.MessageBox.success("Inventory Stock Status is changed to Recounted");
          else
          sap.m.MessageBox.success("Inventory Stock Status is changed to Cancelled");
          that.oSelectedItem.Status = status;
          that.getView().getModel("headerModel").setProperty("/Status",status);
          that.onVisibleFields([1,2],status);
          that.selectFirstItem = false;
            that.getOwnerComponent().getModel("mainModel").refresh(true);
        },
        error:function(oData,oResponse){
          sap.m.MessageBox.error(JSON.parse(oData.responseText).error.message.value);
        }
      });
    },
    onSubmitRecountedRequest : function(){
        var that = this;
        var selectedDate = new Date();
    var milliseconds = selectedDate.getTime();
    var formattedDate = '/Date(' + milliseconds + ')/';
    var payload = {
      "StockCountNo": this.oSelectedItem.StockCountNo,
      "CreationDateTime": formattedDate,
      "Status": "S",
      "StatusDesc": "",
      "SalesEmp": this.oSelectedItem.SalesEmp,
      "StoreId": this.oSelectedItem.StoreId,
      "StorageLoc": this.oSelectedItem.StorageLoc,
      "Action" : "UPDATE",
      "to_inventory_detail": []
    };
    var stockLineItems = that.getView().getModel("InventoryDetails").getData();
    for(var m=0;m<stockLineItems.length;m++){
      payload.to_inventory_detail.push({
        "StockCountNo": stockLineItems[m].StockCountNo,
        "ArticleNo":stockLineItems[m].ArticleNo,
        "ArticleDesc": stockLineItems[m].ArticleDesc,
        "ArticleType": stockLineItems[m].ArticleType,
        "Barcode": stockLineItems[m].Barcode,
        "AvailableQty": stockLineItems[m].AvailableQty,
        "AveragePrice": stockLineItems[m].AveragePrice,
        "StockQty": this.getView().byId("inventoryStockTableDetail").getItems()[m].getCells()[5].getValue() + "",
        "StoreId": this.oSelectedItem.StoreId,
        //"StorageLoc": stockLineItems[m].StorageLoc,
        "StorageLoc": this.oSelectedItem.StorageLoc,
        //"UOM" : stockLineItems[m].UOM,
        "UOM" : "ST",
        "Action": ""
      });
    }
    
    this.getOwnerComponent().getModel("mainModel").create("/InventoryHeadSet",payload,{
      success:function(oData,oResponse){
          sap.m.MessageBox.success("Inventory stock is submitted successfully");
          that.selectFirstItem = false;
          that.getOwnerComponent().getModel("mainModel").refresh(true);
          that.oSelectedItem.Status = "S";
          that.getView().getModel("headerModel").setProperty("/Status","S");
          that.onVisibleFields([1,2],"S");
      },
      error:function(oData,oResponse){
        sap.m.MessageBox.error(JSON.parse(oData.responseText).error.message.value);
      }
    });
    }
    
    });
  }
);
