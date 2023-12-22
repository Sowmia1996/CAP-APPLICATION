sap.ui.define(["sap/m/MessageBox", "sap/ui/core/Fragment", "sap/ui/model/Filter"], function (MessageBox, Fragment, Filter) {
    "use strict";

    return {
        onChange: function (oEvent) {
            
            // Try to store the quantity information in the odata model itself like below
            // oEvent.getSource().getBindingContext().setproperty() --> Note that odata can only be accessed using: sap.ui.model.odata.v4.Context
            // Then later you can access this in the createorder function for each book that is selected
        },

        createOrder: async function() {
            const oBooksListPage = sap.ui.getCore().byId("browseBooks::BooksList")
            if(!this.oCartItemsDialog) {
                this.oCartItemsDialogId = `${oBooksListPage.getId()}-CartItemsDialog`;
                this.oCartItemsDialog = await Fragment.load({
                    id: this.oCartItemsDialogId,
                    name: "browseBooks.custom.CartItemsDialog"
                });
                oBooksListPage.addDependent(this.oCartItemsDialog)
                this.oCartItemsDialog.setModel(this.getModel(), 'mine')
            }

            this.oCartItemsDialog.attachBeforeOpen(() => {
                const oList = Fragment.byId(this.oCartItemsDialogId, "cartItems");
                const aSelectedBooksId = this.getSelectedContexts().map((oContext)=> oContext.getProperty('ID'))
                const aListFilter = [];
                aSelectedBooksId.forEach((id) => aListFilter.push(new Filter('ID', 'EQ', id)))
                oList.bindAggregation('items', {
                    path: 'mine>/Books', 
                    model: 'mine', 
                    template: oList.removeItem(0),
                    filters: new Filter({filters: aListFilter, and: false})
                });
            });

            this.oCartItemsDialog.open();

            // ----------------------To be moved to a different handler ------------------------------------//
            // const aSelectedBooksContext = this.getSelectedContexts()
            // const aPayloadItems = aSelectedBooksContext.map(oBook=> {
            //     return {
            //         bookId: oBook.getProperty('ID'),
            //         quantity: 2
            //     }
            // })
            // // Call the unbound action with these payloads
            // const oModel = this.getModel();
            // const oActionODataContextBinding = oModel.bindContext("/createOrder(...)");
            // oActionODataContextBinding.setParameter("items", aPayloadItems);
            // oActionODataContextBinding.setParameter("address", "Hard-Coded Address For testing");
            // oActionODataContextBinding.execute().then(
            //     function() {
            //         const oActionContext = oActionODataContextBinding.getBoundContext();
            //         console.table(oActionContext.getObject().value);
            //     }.bind(this)
            // );
        },

        submit: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        cancel: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        onPress: function (oEvent) {
            MessageBox.show("Hi, this isn't implemented yet!");
            //const sBookId = oEvent.getSource().getParent().getParent().getBindingContext().getProperty('ID')
        }
    };
});