sap.ui.define(["sap/m/MessageBox", "sap/ui/model/json/JSONModel"], function (MessageBox, JSONModel) {
    "use strict";

    return {
        onChange: function (oEvent) {
            const sBookId = oEvent.getSource().getParent().getParent().getBindingContext().getProperty('ID')
            const iQuantity = oEvent.getParameters().value
            MessageBox.show(`Book id: ${sBookId} and quantity: ${iQuantity}}`)
            // Try to store the quantity information in the odata model itself like below
            // oEvent.getSource().getBindingContext().setproperty() --> Note that odata can only be accessed using: sap.ui.model.odata.v4.Context
            // Then later you can access this in the createorder function for each book that is selected
        },

        createOrder: async function() {
            const aSelectedBooksContext = this.getSelectedContexts()
            const aPayloadItems = aSelectedBooksContext.map(oBook=> {
                return {
                    bookId: oBook.getProperty('ID'),
                    quantity: 2
                }
            })
            // Call the unbound action with these payloads
            const oModel = this.getModel();
            const oActionODataContextBinding = oModel.bindContext("/createOrder(...)");
            oActionODataContextBinding.setParameter("items", aPayloadItems);
            oActionODataContextBinding.setParameter("address", "Hard-Coded Address For testing");
            oActionODataContextBinding.execute().then(
                function() {
                    const oActionContext = oActionODataContextBinding.getBoundContext();
                    console.table(oActionContext.getObject().value);
                }.bind(this)
            );
        },

        onPress: function () {
            MessageBox.show("Hi, this isn't implemented yet!");
            //const sBookId = oEvent.getSource().getParent().getParent().getBindingContext().getProperty('ID')
        }
    };
});