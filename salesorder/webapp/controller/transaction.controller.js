sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/odata/v2/ODataModel",
  "sap/m/MessageBox",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ndc/BarcodeScanner"
], function (Controller, JSONModel, MessageBox, Filter, FilterOperator
) {
  "use strict";

  return Controller.extend("com.luxasia.salesorder.controller.transaction", {
    onInit: function () {
      var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
      var currentDate = new Date();
      var formattedDate = oDateFormat.format(currentDate);

      var oModel = new JSONModel({
        currentDate: currentDate
      });

      this.getView().setModel(oModel, "viewModel");

      var oModel = this.getOwnerComponent().getModel("SalesEmployeeModel");

      var rModel = this.getOwnerComponent().getModel("ResponseModel")
      this.getView().setModel(rModel, "ResponseModel")
      var oInput = this.getView().byId("firstNameInput");
      oInput.bindValue("CustomerNoModel>/Firstnames/0");
      var that = this;
      var aModel = that.getOwnerComponent().getModel("CampaignModel");
      this.getView().setModel(aModel, "CampaignModel");
      var oModel = this.getOwnerComponent().getModel("mainModel");
      var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
      var oBrandModel = this.getOwnerComponent().getModel("SelectedBrandName");

      if (oBrandModel) {
        var oBrandData = oBrandModel.getProperty("/selectedBrandNames");

        if (Array.isArray(oBrandData) && oBrandData.length > 0) {
          var aBrandIds = oBrandData.map(function (brand) {
            return brand.Brand_Id;
          });

          var sStoreId = oStoreModel.getProperty("/selectedStoreId");
          var filterCampaignCat = new sap.ui.model.Filter({
            path: "CampaignCat",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: "I"
          });

          var filterPlant = new sap.ui.model.Filter({
            path: "Plant",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: sStoreId
          });
          var filterBrandId = aBrandIds.map(function (brandId) {
            return new sap.ui.model.Filter(
              "BrandId",
              sap.ui.model.FilterOperator.EQ,
              brandId)
          });
          var combinedFilter = new sap.ui.model.Filter({
            filters: filterBrandId,
            and: false // Set to 'false' for OR logic between filters
          });

          var filterDocDate = new sap.ui.model.Filter({
            path: "DocDate",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: "2023-12-23T00:00:00"
          });

          var aFilters = [filterCampaignCat, filterPlant, combinedFilter, filterDocDate];
          oModel.read("/CampaignSet", {
            filters: aFilters,
            success: function (response) {
              var oNewModel = that.getView().getModel("CampaignModel");
              oNewModel.setData(response.results);
            },
            error: function (error) {
              console.error("Error fetching data:", error);
            }
          });
        }
      }



      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("transaction").attachPatternMatched(this._onRouteMatched, this);

      var oCartModel = new JSONModel();
      this.getView().setModel(oCartModel, "cartModel");

      var oQuantityModel = new JSONModel();
      this.getView().setModel(oQuantityModel, "quantityModel");

      var oModel = new JSONModel({
        "SalesProducts": {
          "Products": [
            {
              "Name": "Product 1",
              "BarId": "123456",
              "Price": "25",
              "CurrencyCode": "USD",
              "Quantity": 0
            },
            {
              "Name": "Product 2",
              "BarId": "789012",
              "Price": "30",
              "CurrencyCode": "USD",
              "Quantity": 0
            }
          ]
        }
      });
      this.getView().setModel(oModel);

      // this.calculateTotalPrice();

      var oCSRFModel = new JSONModel({
        csrfToken: ""
      });
      this.getView().setModel(oCSRFModel, "csrfModel");

      this.fetchCsrfToken();

      var oModel = this.getOwnerComponent().getModel("mainModel"); 

      // Get or create a JSON model
      var oJsonModel = this.getView().getModel("SalesEmployeeModel");
      if (!oJsonModel) {
        oJsonModel = new sap.ui.model.json.JSONModel(); // Initialize a new JSON model if it doesn't exist
        this.getView().setModel(oJsonModel, "SalesEmployeeModel"); // Set the model to the view
      }
      
      // Read data from the model using the provided URL
      oModel.read("/SalesEmployees", {
        urlParameters: {
          StoreId: "'" + sStoreId + "'",
        },
        success: function (data) {
          // Handle the fetched data
          console.log("Data fetched successfully:", data);
          oJsonModel.setData(data.results);
          // You can process the data here
        },
        error: function (error) {
          // Handle errors during the fetch
          console.error("Error fetching data:", error);
        }
      });
      

    },
    updateCurrentDate: function (oDateFormat) {
      var currentDate = new Date();
      var formattedDate = oDateFormat.format(currentDate);

      // Set the current date in the model
      var oModel = this.getView().getModel("CurrentDate");

      if (!oModel) {
        // Create a new model if it doesn't exist
        oModel = new JSONModel({ currentDate: formattedDate });
        this.getView().setModel(oModel, "CurrentDate");
      } else {
        // Update the existing model
        oModel.setProperty("/currentDate", formattedDate);
      }
    },

    // _onRouteMatched: function (oEvent) {
    //     var oArgs = oEvent.getParameter("arguments");

    //     // Set selectedQuantity as a property
    //     var selectedQuantity = oArgs.selectedQuantity;

    //     // Handle selected quantity
    //     if (selectedQuantity) {
    //         var oQuantityModel = new JSONModel({
    //             selectedQuantity: selectedQuantity
    //         });
    //         this.getView().setModel(oQuantityModel, "quantityModel"); // Set model for selected quantity
    //     } else {
    //         console.error("Selected quantity parameter is undefined in Cart view.");
    //     }

    //     // Retrieve selected items parameter
    //     var selectedItemsParam = oArgs.selectedItems;

    //     if (selectedItemsParam) {
    //         var selectedItems = JSON.parse(decodeURIComponent(selectedItemsParam));

    //         var oCartModel = this.getView().getModel("cartModel");
    //         oCartModel.setProperty("/selectedItems", selectedItems);
    //     } else {
    //         console.error("Selected items parameter is undefined in Cart view.");
    //     }
    // },

    onClick: function (oEvent) {
      if (oEvent.getParameter("selected")) {
        this.getView().byId("orderreason").setVisible(true);
      } else {
        this.getView().byId("orderreason").setVisible(false);
      }

    },

    onAddProduct: function () {
      this.pDialog ??= this.loadFragment({
        name: "com.luxasia.salesorder.view.scanandadd"
      });
      this.pDialog.then(function (dialog) {
        dialog.open();
      });
    },

    onCloseFragment: function () {
      if (this.pDialog) {
        this.pDialog.then(function (dialog) {
          dialog.close();
          dialog.destroy();
        });
        this.pDialog = null;
      }
    },
    ProductSearch: function () {
      var oBrandModel = this.getOwnerComponent().getModel("SelectedBrandName");

      if (oBrandModel) {
        var oBrandData = oBrandModel.getProperty("/selectedBrandNames");

        if (Array.isArray(oBrandData) && oBrandData.length > 0) {
          var aBrandIds = oBrandData.map(function (brand) {
            return brand.Brand_Id;
          });

          var aBrandFilters = aBrandIds.map(function (brandId) {
            return new sap.ui.model.Filter("Brand_Id", sap.ui.model.FilterOperator.EQ, brandId);
          });

          var oCombinedBrandFilters = new sap.ui.model.Filter({
            filters: aBrandFilters,
            and: false // Change this based on your logic, whether it's 'AND' or 'OR'
          });

          var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
          if (oStoreModel) {
            var sStoreId = oStoreModel.getProperty("/selectedStoreId");

            var oStoreFilter = new sap.ui.model.Filter("StoreId", sap.ui.model.FilterOperator.EQ, sStoreId);

            var oModel = this.getOwnerComponent().getModel("mainModel");

            var oFinalFilter = new sap.ui.model.Filter({
              filters: [oCombinedBrandFilters, oStoreFilter],
              and: true
            });

            if (oModel) {
              var oJsonModel = new sap.ui.model.json.JSONModel();
              var oBusyDialog = new sap.m.BusyDialog({
                title: "Loading Products",
                text: "Please wait...."
              });
              oBusyDialog.open();

              var that = this;
              oModel.read("/ProductSet", {
                filters: [oFinalFilter],
                success: function (response) {
                  oBusyDialog.close();
                  oJsonModel.setData(response.results);
                  oJsonModel.setSizeLimit(10000000000000);
                  that.getView().setModel(oJsonModel, "ProductSetModel");

                  that.aDialog ??= that.loadFragment({ name: "com.luxasia.salesorder.view.Product" });
                  that.aDialog.then(function (dialog) {
                    dialog.open();
                  });
                },
                error: function (error) {
                  oBusyDialog.close();
                }
              });
            } else {
              console.error("mainModel not found.");
            }
          } else {
            console.error("StoreModel not found.");
          }
        } else {
          console.error("SelectedBrandName model's selectedBrandNames property is empty or not an array.");
        }
      } else {
        console.error("SelectedBrandName model not found or undefined.");
      }



    },
    onItemSelect: function (oEvent) {
      var aListItems = oEvent.getParameter("listItems");
      var oModel = this.getView().getModel("mainModel");
      var aSelectedItems = [];

      aListItems.forEach(function (oListItem) {
        var oBindingContext = oListItem.getBindingContext("mainModel");
        var oSelectedItem = oBindingContext.getObject();
        var sPath = oBindingContext.getPath();


        if (oListItem.getSelected()) {

          aSelectedItems.push(oSelectedItem);
        } else {
          aSelectedItems = aSelectedItems.filter(function (item) {
            return item !== oSelectedItem;
          });
        }
      });


    },
    onAddToSaleProducts: function () {
      var aSelectedItems = [];
      var oStepInput = this.getView().byId("CurrentValue");
      var selectedQuantity = oStepInput.getValue();
      var oTable = this.getView().byId("producttable");
      var aListItems = oTable.getSelectedItems();

      aListItems.forEach(function (oListItem) {
        var oBindingContext = oListItem.getBindingContext("ProductSetModel");
        if (oBindingContext) {
          var oSelectedItem = oBindingContext.getObject();
          var itemQuantity = oSelectedItem.quantity;
          if (itemQuantity > 0) {
            aSelectedItems.push(oSelectedItem);
          } else {
            console.error("Selected item quantity should be greater than 0.");
          }
        } else {
          console.error("BindingContext is undefined for the selected item.");
        }
      });
      // Access the existing "SelectedItems" model and update the selected items
      var oModel = this.getView().getModel("SelectedItems");
      if (oModel) {
        var oData = oModel.getData();

        // Assign incremental ItmNumber to each item in selectedItems array
        aSelectedItems.forEach(function (item, index) {
          // Incremental padding for ItemNumber (e.g., 0010, 0020, etc.)
          var paddedIndex = (index + 1) * 10; // Increase by 10 for every index

          // Format the paddedIndex to a 4-digit string (e.g., 0010, 0020)
          var formattedIndex = ('000000' + paddedIndex).slice(-6);

          // Assign the formatted ItmNumber to each item
          item.ItmNumber = formattedIndex;
        });

        // Add the modified selected items back to the model data
        oData.selectedItems = aSelectedItems;

        // Update the model with the modified data
        oModel.setData(oData);
      } else {
        console.error("Model 'SelectedItems' not found.");
      }

      // Optionally, you can navigate to the next page here
      // ...

      // Navigate to cart view and pass selected items

      var oDialog = this.getView().byId("producttablepage");
      oDialog.close();

    },

    onScanBarcode: function () {
      var that = this;

      if (sap.ndc && sap.ndc.BarcodeScanner) {
        sap.ndc.BarcodeScanner.scan(
          function (mResult) {
            var sText = mResult.text;

            if (isValidBarcode(sText)) {
              // Access the ProductSetModel from the view
              var oModel = that.getView().getModel("ProductSetModel");

              if (!oModel) {
                console.error("ProductSetModel not found.");
                return;
              }

              // Retrieve the array of objects from the model
              var oModelData = oModel.getData();

              // Check if oModelData is an array
              if (Array.isArray(oModelData)) {
                // Use Array.find() to search for the object with the matching Barcode
                var oFoundItem = oModelData.find(function (item) {
                  return item.Barcode === sText;
                });

                // 'oFoundItem' will contain the object with the matching Barcode if found
                if (oFoundItem) {
                  console.log("Found Item:", oFoundItem);

                  // Access the SelectedItems model from the view
                  var oJsonModel = that.getView().getModel("SelectedItems");

                  // Ensure that the selectedItems property exists in the model
                  if (!oJsonModel.getProperty("/selectedItems")) {
                    oJsonModel.setProperty("/selectedItems", []);
                  }

                  // Get the array of selected items from the model
                  var aSelectedItems = oJsonModel.getProperty("/selectedItems");

                  // Push the found item into the array
                  aSelectedItems.push(oFoundItem);

                  // Set the updated array back to the model
                  oJsonModel.setProperty("/selectedItems", aSelectedItems);

                  if (oModel) {
                    var oData = oModel.getData();

                    // Assign incremental ItmNumber to each item in selectedItems array
                    aSelectedItems.forEach(function (item, index) {
                      // Incremental padding for ItemNumber (e.g., 0010, 0020, etc.)
                      var paddedIndex = (index + 1) * 10; // Increase by 10 for every index

                      // Format the paddedIndex to a 4-digit string (e.g., 0010, 0020)
                      var formattedIndex = ('000000' + paddedIndex).slice(-6);

                      // Assign the formatted ItmNumber to each item
                      item.ItmNumber = formattedIndex;
                    });

                    // Add the modified selected items back to the model data
                    oData.selectedItems = aSelectedItems;

                    // Update the model with the modified data
                    oModel.setData(oData);
                  } else {
                    console.error("Model 'SelectedItems' not found.");
                  }


                  // Navigate to the transaction page and pass the selected items
                  that.getOwnerComponent().getRouter().navTo("transaction", {
                    selectedItems: encodeURIComponent(JSON.stringify(aSelectedItems)),
                  });
                } else {
                  // Show an error message if barcode is not found
                  sap.m.MessageBox.error("Barcode not found: " + sText);
                }
              }
            } else {
              sap.m.MessageBox.error("Invalid barcode: " + sText);
            }
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

    CloseSearchProduct: function () {
      var oDialog = this.getView().byId("producttablepage");
      oDialog.close();
    },

    // calculateTotalPrice: function () {
    //   var oTable = this.getView().byId("transactiontable");
    //   var oModel = this.getOwnerComponent().getModel("SelectedItems");
    //   var aItems = oModel.getProperty("/selectedItems");

    //   var totalPrice = aItems.reduce(function (total, item) {
    //     return total + parseFloat(item.RetailPrice || 0); // Assuming 'RetailPrice' holds the price information
    //   }, 0);

    //   var oDefaultModel = this.getView().getModel();
    //   oDefaultModel.setProperty("/TotalAmount", totalPrice.toFixed(2)); // Update the TotalAmount property in the model

    //   var oFooter = this.getView().byId("otFooter");
    //   if (oFooter) {
    //     oFooter.getBindingContext()?.refresh(); // Check for the existence of the footer before calling getBindingContext()
    //   }
    // },

    onQuantityChange: function (oEvent) {
      var newQuantity = oEvent.getParameter("value");
      var oQuantityModel = this.getView().getModel("quantityModel");

      // Update the selectedQuantity property in the model
      oQuantityModel.setProperty("/selectedQuantity", newQuantity);

      // Recalculate total price or perform any other necessary actions
      this.calculateTotalPrice();
    },


    fetchCsrfToken: function () {
      var that = this;
      $.ajax({
        type: "GET",
        url: "./sap/opu/odata/sap/ZSDGW_CE_APP_SRV/",
        headers: {
          "X-CSRF-Token": "fetch"
        },
        success: function (data, textStatus, request) {
          var csrfToken = request.getResponseHeader("X-CSRF-Token");
          that.getView().getModel("csrfModel").setProperty("/csrfToken", csrfToken);
        },
        error: function (error) {
          console.error("Error fetching CSRF token:", error);
        }
      });
    },

    onAddPromotion: function () {
      var that = this;
      var datePicker = this.getView().byId("DP2");
      var selectedDate = datePicker.getDateValue();

      if (!selectedDate) {
        MessageBox.error("Please select a valid date.");
        return;
      }

      var milliseconds = selectedDate.getTime();
      var formattedDate = '/Date(' + milliseconds + ')/';
      var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
      var sStoreId = oStoreModel.getProperty("/selectedStoreId");

      if (!sStoreId) {
        MessageBox.error("Please select a store.");
        return;
      }

      var oCartModel = this.getView().getModel("SelectedItems");
      var selectedItems = oCartModel.getProperty("/selectedItems");
      console.log("Selected Items:", selectedItems);


      if (!selectedItems || selectedItems.length === 0) {
        MessageBox.error("Please select items for the promotion.");
        return;
      }

      var oTable = this.byId("transactiontable");
      var aColumns = oTable.getColumns();

      // Set the visibility of the first two columns to true
      aColumns[6].setVisible(true);
      aColumns[7].setVisible(true);

      var hasZeroQuantity = selectedItems.some(function (item) {
        return item.quantity === 0;
      });

      if (hasZeroQuantity) {
        MessageBox.error("Please select a quantity greater than 0 for each item.");
        return;
      }

      var aModelData = this.getOwnerComponent().getModel("CampaignModel").getData();
      console.log("CampaignModel Data during onAddPromotion:", aModelData);

      // Check if there is at least one CampaignId in aModelData
      var selectedCampaignId = (aModelData.length) ? aModelData[0].CampaignId : "";
      var salesOrderItems = selectedItems.map(function (item) {
        console.log("Item CampaignId:", item.CampaignId);
        var isItemSelected = item.IsSelected === true || item.IsSelected === 'true';
        // Ensure item.CampaignId is an array
        var campaignIdForItem = Array.isArray(item.CampaignId) ? item.CampaignId : [];

        return {
          "FreeItem": isItemSelected,
          "Zcampaign": campaignIdForItem.join(','), // Join array elements into a string
          "SalesorderNo": "",
          "ItmNumber": item.ItmNumber.toString(),
          "Material": item.ArticleNo.toString(),
          "Plant": sStoreId,
          "TargetQty": item.quantity.toString(),
          "TargetQu": "PC",
          "ItemCateg": "",
          "ShortText": "",
          "ConditionType": "ZPW1"
        };
      });

      var salesOrderPayload = {
        "Action": "NORMAL",
        "DocDate": formattedDate,
        "Plant": sStoreId,
        "OrdReason": "",
        "SalesEmp": "50000302",
        "SalesorderNo": "",
        "SoldTo": this.getView().byId("firstNameInput").getValue(),
        "ZCampaign": "",  // No need to set ZCampaign at this level
        "PointConsumed": "0.00",
        "CampType": "",
        "PointBalance": "0.00",
        "SaveDocument": "",
        "to_items": salesOrderItems
      };

      console.log("Request Payload:", JSON.stringify(salesOrderPayload));


      var csrfToken = that.getView().getModel("csrfModel").getProperty("/csrfToken");

      $.ajax({
        type: "POST",
        url: "./sap/opu/odata/sap/ZSDGW_CE_APP_SRV/SalesOrderHeadSet",
        data: JSON.stringify(salesOrderPayload),
        contentType: "application/json",
        dataType: 'json',
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        success: function (response) {
          console.log("Success Callback Executed");
          console.log("Success Response:", response);

          var oExistingModel = that.getView().getModel("SelectedItems");

          // Get the current data from the model
          var oData = oExistingModel.getProperty("/selectedItems");

          // Merge the new data into the existing data
          var responseData = response.d.to_items.results; // Adjust this based on the actual path in your response

          // Find matching items based on ItmNumber
          oData.forEach(function (existingItem) {
            var newItem = responseData.find(function (newItem) {
              return existingItem.ItmNumber === newItem.ItmNumber;
            });

            if (newItem) {
              Object.assign(existingItem, newItem);
            }
          });

          // Update the property with the updated array
          oExistingModel.setProperty("/selectedItems", oData);
          sap.m.MessageBox.success("Promotion Applied Successfully,", {
            onClose: function () {

            }
          });
        },

        error: function (error) {
          console.error("Error:", error);

          var errorMessage = "Error creating record";
          if (error && error.responseXML) {
            var xmlDoc = error.responseXML;
            var errorMessageNode = xmlDoc.querySelector("message");
            if (errorMessageNode) {
              errorMessage = errorMessageNode.textContent;
            }
          }

          MessageToast.show(errorMessage);
        }
      });
    },
    //     OnAddPromotion: function () {
    //       var that = this;
    //       var datePicker = this.getView().byId("DP2");
    //       var selectedDate = datePicker.getDateValue();
    //       var milliseconds = selectedDate.getTime();
    //       var formattedDate = '/Date(' + milliseconds + ')/';
    //       var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
    //       var sStoreId = oStoreModel.getProperty("/selectedStoreId");
    //       var oCartModel = this.getView().getModel("SelectedItems");
    //       var selectedItems = oCartModel.getProperty("/selectedItems");
    //       console.log("Selected Items:", selectedItems);
    // // Assuming "multiComboBox" is the ID of your multi-combobox
    // // var selectedCountryKey = this.getView().byId("Icampaign").getSelectedKey();



    //       var hasZeroQuantity = selectedItems.some(function (item) {
    //         return item.quantity === 0;
    //       });

    //       if (hasZeroQuantity) {

    //         MessageBox.error("Please select a quantity greater than 0 for each item.");
    //         return;
    //       }
    //       var oTable = this.byId("transactiontable");
    //       var aColumns = oTable.getColumns();

    //       // Set the visibility of the first two columns to true
    //       aColumns[6].setVisible(true);
    //       aColumns[7].setVisible(true);

    //       var salesOrderItems = [];

    //       selectedItems.forEach(function (item, index) {
    //         var salesOrderItem = {
    //           "FreeItem": false,
    //           "Zcampaign": "",
    //           "SalesorderNo": "",
    //           "ItmNumber": item.ItmNumber.toString(),
    //           "Material": item.ArticleNo.toString(),
    //           "Plant": sStoreId,
    //           "TargetQty": item.quantity.toString(),
    //           "TargetQu": "PC",
    //           "ItemCateg": "",
    //           "ShortText": "",
    //           "ConditionType": "ZPW1"
    //         };

    //         salesOrderItems.push(salesOrderItem);
    //       });

    //       var salesOrderPayload = {
    //         "Action": "NORMAL",
    //         "DocDate": formattedDate,
    //         "Plant": sStoreId,
    //         "OrdReason": "",
    //         "SalesEmp": "50000302",
    //         "SalesorderNo": "",
    //         "SoldTo": this.getView().byId("firstNameInput").getValue(),
    //         "ZCampaign": "",
    //         "PointConsumed": "0.00",
    //         "CampType": "",
    //         "PointBalance": "0.00",
    //         "SaveDocument": "",
    //         "to_items": salesOrderItems
    //       };
    //   //   var salesOrderPayload = {
    //   //     "Action": "",
    //   //     "DocDate": "/Date(1700733808000)/",
    //   //     "Plant": "7018",
    //   //     "OrdReason": "",
    //   //     "SalesEmp": "50000302",
    //   //     "SalesorderNo": "",
    //   //     "SoldTo": "2014730",
    //   //     "ZCampaign": "",
    //   //     "PointConsumed": "0.00",
    //   //     "CampType": "",
    //   //     "PointBalance": "0.00",
    //   //     "SaveDocument": "",
    //   //     "to_items": [{


    //   // // Define the number of items you want to add

    //   //         "FreeItem": false,
    //   //         "Zcampaign": selectedCountryKey,
    //   //         "SalesorderNo": "",
    //   //         "ItmNumber":"" ,
    //   //         "Material": item.ArticleNo.toString(), // Generate Material based on the last number
    //   //         "Plant": sStoreId,
    //   //         "TargetQty": item.quantity.toString(),
    //   //         "TargetQu": "PC",
    //   //         "ItemCateg": "",
    //   //         "ShortText": "",
    //   //         "ConditionType": "ZPW1"
    //   //     }
    //   //   ]
    //   // }
    //       console.log("Request Payload:", JSON.stringify(salesOrderPayload));

    //       var csrfToken = this.getView().getModel("csrfModel").getProperty("/csrfToken");

    //       $.ajax({
    //         type: "POST",
    //         url: "./sap/opu/odata/sap/ZSDGW_CE_APP_SRV/SalesOrderHeadSet",
    //         data: JSON.stringify(salesOrderPayload),
    //         contentType: "application/json",
    //         dataType: 'json',
    //         headers: {
    //           "X-CSRF-Token": csrfToken,
    //         },
    //         success: function (response) {
    //           console.log("Success Callback Executed");
    //           console.log("Success Response:", response);

    //           var oExistingModel = that.getView().getModel("SelectedItems");

    //           // Get the current data from the model
    //           var oData = oExistingModel.getProperty("/selectedItems");

    //           // Merge the new data into the existing data
    //           var responseData = response.d.to_items.results; // Adjust this based on the actual path in your response

    //           // Find matching items based on ArticleNo and Material
    //           var matchingItems = [];
    //           oData.forEach(function (existingItem) {
    //               responseData.forEach(function (newItem) {
    //                   if (existingItem.ItmNumber === newItem.ItmNumber) {
    //                       matchingItems.push({ existingItem, newItem });
    //                   }
    //               });
    //           });

    //           // Object assign for matching items
    //           matchingItems.forEach(function (matchingItem) {
    //               Object.assign(matchingItem.existingItem, matchingItem.newItem);
    //           });

    //           // Update the property with the updated array
    //           oExistingModel.setProperty("/selectedItems", oData);
    //         },

    //         error: function (xhr, status, error) {
    //           console.error("AJAX Request Error:", error);
    //           console.log("XHR Status:", xhr.status);
    //           console.log("XHR Response Text:", xhr.responseText);

    //           var sapGatewayError = xhr.getResponseHeader("sap-message");
    //           var errorMessage = "An unknown error occurred.";

    //           if (sapGatewayError) {
    //             console.error("SAP Gateway Error:", sapGatewayError);
    //             errorMessage = sapGatewayError; // Use the SAP Gateway error message
    //           }

    //           // Show error message using MessageBox
    //           MessageBox.error(errorMessage, {
    //             onClose: function () {
    //               // Optionally, add actions upon closing the error message box
    //             }
    //           });
    //         },
    //         complete: function (xhr) {
    //           console.log("AJAX Request Complete. Status:", xhr.status);
    //           // Optionally, handle completion actions here
    //         }
    //       });
    // },
    onSavePress: function () {
      var that = this;
      console.log("Save Sale button clicked");
      var datePicker = this.getView().byId("DP2");
      var selectedDate = datePicker.getDateValue();
      var milliseconds = selectedDate.getTime();
      var formattedDate = '/Date(' + milliseconds + ')/';
      var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
      var sStoreId = oStoreModel.getProperty("/selectedStoreId");
      var oCartModel = this.getView().getModel("SelectedItems");
      var selectedItems = oCartModel.getProperty("/selectedItems");
      console.log("Selected Items:", selectedItems);
      var hasZeroQuantity = selectedItems.some(function (item) {
        return item.quantity === 0;
      });

      if (hasZeroQuantity) {

        MessageBox.error("Please select a quantity greater than 0 for each item.");
        return;
      }

      var salesOrderItems = [];


      selectedItems.forEach(function (item, index) {
        var salesOrderItem = {
          "FreeItem": false,
          "Zcampaign": "",
          "SalesorderNo": "",
          "ItmNumber": item.ItmNumber.toString(),
          "Material": item.ArticleNo.toString(),
          "Plant": sStoreId,
          "TargetQty": item.quantity.toString(),
          "TargetQu": "PC",
          "ItemCateg": "",
          "ShortText": "",
        };

        salesOrderItems.push(salesOrderItem);
      });

      var salesOrderPayload = {
        "Action": "",
        "DocDate": formattedDate,
        "Plant": sStoreId,
        "OrdReason": "R02",
        "SalesEmp": "50000302",
        "SalesorderNo": "",
        "SoldTo": this.getView().byId("firstNameInput").getValue(),
        "ZCampaign": "",
        "PointConsumed": "0.00",
        "CampType": "",
        "PointBalance": "0.00",
        "SaveDocument": "X",
        "to_items": salesOrderItems
      };
      var bIsChecked = this.byId("salesorderreason").getSelected(); // Replace 'yourCheckBoxId' with the actual ID

      // Update the 'Action' property based on checkbox state
      if (bIsChecked) {
        salesOrderPayload.Action = "RETURN";
      } else {
        salesOrderPayload.Action = "NORMAL";
      }
      var salesOrderItems = [];

      console.log("Request Payload:", JSON.stringify(salesOrderPayload));

      var csrfToken = this.getView().getModel("csrfModel").getProperty("/csrfToken");

      $.ajax({
        type: "POST",
        url: "./sap/opu/odata/sap/ZSDGW_CE_APP_SRV/SalesOrderHeadSet",
        data: JSON.stringify(salesOrderPayload),
        contentType: "application/json",
        dataType: 'json',
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        success: function (response) {
          var salesOrderNo = response.d.SalesorderNo; // Replace 'SalesorderNo' with the actual property name from your response

          sap.m.MessageBox.success("Sales Order created successfully. Sales Order No: " + salesOrderNo, {
            onClose: function () {

            }
          });
        },

        error: function (error) {
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

    // Assume 'onSalesOrderResponse' is triggered after receiving the sales order response





    // onSavePress: function () {
    //     console.log("Save Sale button clicked");

    // var oStoreModel = this.getOwnerComponent().getModel("StoreModel");
    // var sStoreId = oStoreModel.getProperty("/selectedStoreId");
    // var oCartModel = this.getView().getModel("cartModel");
    // var selectedItems = oCartModel.getProperty("/selectedItems");
    // console.log("Selected Items:", selectedItems);
    // var salesOrderCreation = {
    //   "Action": "NORMAL",
    //   "DocDate": "/Date(1700733808000)/",
    //   "Plant": "7018",
    //   "OrdReason": "",
    //   "SalesEmp": "50000302",
    //   "SalesorderNo": "",
    //   "SoldTo": "2014730",
    //   "ZCampaign": "",
    //   "PointConsumed": "0.00",
    //   "CampType": "",
    //   "PointBalance": "0.00",
    //   "SaveDocument" : "X",
    //   "to_items": [
    //     {
    //       "FreeItem": false,
    //       "Zcampaign": "C-0020000342",
    //       "SalesorderNo": "",
    //       "ItmNumber": "10",
    //       "Material": "51212",
    //       "Plant": "7018",
    //       "TargetQty": "1.000",
    //       "TargetQu": "PC",
    //       "ItemCateg": "",
    //       "ShortText": ""
    //     }
    //   ]
    // }
    //     console.log("Request Payload:", JSON.stringify(salesOrderCreation));
    //     var csrfToken = this.getView().getModel("csrfModel").getProperty("/csrfToken");
    //     $.ajax({
    //         type: "POST",
    //         url: "/sap/opu/odata/sap/ZSDGW_CE_APP_SRV/SalesOrderHeadSet",
    //         data: JSON.stringify(salesOrderCreation),
    //         contentType: "application/json",
    //         headers: {
    //             "X-CSRF-Token": csrfToken,
    //         },
    //         success: function (data) {
    //             console.log("Success:", data);

    //         },

    //     });
    // },
  });
});
