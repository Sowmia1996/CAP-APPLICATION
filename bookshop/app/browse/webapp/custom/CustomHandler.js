sap.ui.define(["sap/m/MessageBox", "sap/ui/core/Fragment", "sap/ui/model/Filter", "sap/ui/model/json/JSONModel"], function (MessageBox, Fragment, Filter, JSONModel) {
    "use strict";

    return {
        onChangeQuantity: function (oEvent) {
            const sBookId = oEvent.getSource().getParent().getParent().getBindingContext('mine').getProperty('ID');
            const iQuantity = oEvent.getParameters().value;
            this.getModel('bookFormatCode').getData().payload.items.find(oItem => oItem.bookId === sBookId).quantity = iQuantity;
        },

        onChangeFormat: function (oEvent) {
            const sBookId = oEvent.getSource().getParent().getParent().getBindingContext('mine').getProperty('ID');
            const sFormat = oEvent.getParameters().selectedItem.getText();
            this.getModel('bookFormatCode').getData().payload.items.find(oItem => oItem.bookId === sBookId).format = sFormat;
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
                const oModel = new JSONModel({
                    formats: [
                        {
                            type: 'pb',
                            text: 'Paper Back'
                        },
                        {
                            type: 'hc',
                            text: 'Hard Cover'
                        },
                        {
                            type: 'audio',
                            text: 'AudiBook'
                        },
                        {
                            type: 'kv',
                            text: 'Kindle Version'
                        },
                        {
                            type: 'sc',
                            text: 'Soft Cover'
                        }
                    ]
                  })
                  this.oCartItemsDialog.setModel(oModel, 'bookFormatCode')
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
                const oCreateOrderPayload = {
                    items: [],
                    address: ""
                }
                aSelectedBooksId.forEach(sId => oCreateOrderPayload.items.push({bookId: sId, quantity: 1, format: "Paper Back"}))
                this.oCartItemsDialog.getModel('bookFormatCode').setProperty('/payload', oCreateOrderPayload)
            });

            this.oCartItemsDialog.open();
        },

        submit: function (oEvent) {
            oEvent.getSource().getParent().setBusy(true);
            const sAddress = sap.ui.getCore().byId('browseBooks::BooksList-CartItemsDialog--AddressTextInput').getValue();
            const oPayload = this.getModel('bookFormatCode').getData().payload;
            oPayload.address = sAddress;
            // Call the unbound action with thespayload
            const oModel = this.getModel();
            const oActionODataContextBinding = oModel.bindContext("/createOrder(...)");
            oActionODataContextBinding.setParameter("items", oPayload.items);
            oActionODataContextBinding.setParameter("address", oPayload.address);
            oActionODataContextBinding.execute().then(()=> {});
            oEvent.getSource().getParent().setBusy(false);
            oEvent.getSource().getParent().close();
            //Show a message box with the orderId information
            //IF failed, show a messagebox with exact failure reason
        },

        cancel: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        onAddReviewPress: function (oEvent) {
            MessageBox.show("Hi, this isn't implemented yet!");
        }
    };
});