sap.ui.define([
    "sap/m/MessageBox", 
    "sap/ui/core/Fragment", 
    "sap/ui/model/Filter", 
    "sap/ui/model/json/JSONModel",
    "./createAddReviewFormContainer"
], 
function (MessageBox, Fragment, Filter, JSONModel, createAddReviewFormContainer) {
    "use strict";

    const beforeOpenDialog = (oEvent, oParams) => {
        const oErrorModel = new JSONModel({
            get hasErrors () {
                return Object.values(this.inputErrors).some(error => error);
            },
            inputErrors: {}
        });
        oEvent.getSource().setModel(oErrorModel, "formErrors");
        const {sBindingPath, sDialogId} = oParams;
        const oAddReviewForm = Fragment.byId(sDialogId, "addReviewForm");
        oAddReviewForm.bindAggregation("formContainers", {
            path: `${sBindingPath}/reviews`,
            template: createAddReviewFormContainer(),
            length: 1,
            parameters: {
                $$updateGroupId: "reviews"
            }
        });

        const oReviewBinding = oAddReviewForm.getBinding("formContainers");
        oReviewBinding.create({
            rating: 0,
            title: "",
            text: ""
        });
    }

    const setInputError = function (oInputElement, bHasError) {
        const oErrorModel = oInputElement.getModel("formErrors");
        const oInputErrors = { ...oErrorModel.getProperty("/inputErrors")};
        oInputErrors[oInputElement.getId()] = bHasError;
        oErrorModel.setProperty("/inputErrors", oInputErrors);
    }

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
                this.oTemplate = Fragment.byId(this.oCartItemsDialogId, "cartItems").removeItem(0);
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
                    template: this.oTemplate,
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

        submit: async function (oEvent) {
            const sAddress = sap.ui.getCore().byId('browseBooks::BooksList-CartItemsDialog--AddressTextInput').getValue();
            const oPayload = this.getModel('bookFormatCode').getData().payload;
            oPayload.address = sAddress;
            // Call the unbound action with the payload
            const oModel = this.getModel();
            const oActionODataContextBinding = oModel.bindContext("/createOrder(...)");
            oActionODataContextBinding.setParameter("items", oPayload.items);
            oActionODataContextBinding.setParameter("address", oPayload.address);
            await oActionODataContextBinding.execute();
            const {acknowledge, message} = oActionODataContextBinding.getBoundContext().getObject();
            const icon = (message === "Order Successful") ? MessageBox.Icon.SUCCESS : (message === "Partially Ordered") ? MessageBox.Icon.INFORMATION : MessageBox.Icon.ERROR;
            MessageBox.show(
                acknowledge, {
                    icon: icon,
                    title: message
                }
            );
            oEvent.getSource().getParent().close();
            oEvent.getSource().getParent().getParent().getModel().refresh();
        },

        cancel: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        onAddReviewPress: async function (oEvent) {
            const oBooksListPage = sap.ui.getCore().byId("browseBooks::BooksList");
            if (!this.oAddReviewDialog) {
                this.oAddReviewDialogId = `${oBooksListPage.getId()}-BookReviewDialog`;
                this.oAddReviewDialog = await Fragment.load({
                    id: this.oAddReviewDialogId,
                    name: "browseBooks.custom.BookReviewDialog"
                });
                oBooksListPage.addDependent(this.oAddReviewDialog);
            }

            const sBindingPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
            const oParams = {
                sBindingPath,
                sDialogId: this.oAddReviewDialogId
            } 

            this.oAddReviewDialog.attachBeforeOpen(oParams, beforeOpenDialog);
            this.oAddReviewDialog.open();
            this.oAddReviewDialog.detachBeforeOpen(beforeOpenDialog);
        },

        submitReview: async function (oEvent) {
            const oAddReviewDialog = oEvent.getSource().getParent();
            oAddReviewDialog.setBusy(true);
            try {
                await oAddReviewDialog.getModel().submitBatch("reviews");
                MessageBox.show("Review Submitted Successfully");
                oAddReviewDialog.close();
            } catch (error) {
                MessageBox.show(error.message);
            } finally {
                oAddReviewDialog.setBusy(false);
            }
        },

        cancelReview: function (oEvent) {
            const oAddReviewDialog = oEvent.getSource().getParent();
            const oBooksListPage = sap.ui.getCore().byId("browseBooks::BooksList");
            const oAddReviewDialogId = `${oBooksListPage.getId()}-BookReviewDialog`;
            const oAddReviewForm = Fragment.byId( oAddReviewDialogId, "addReviewForm");
            const oReviewBinding = oAddReviewForm.getBinding("formContainers");
            oReviewBinding.resetChanges();
            oAddReviewDialog.close();
        },

        onValidationError: function (oEvent) {
            const oInputElement = oEvent.getParameter("element");
            setInputError(oInputElement, true);
        },

        onValidationSuccess: function (oEvent) {
            const oInputElement = oEvent.getParameter("element");
            setInputError(oInputElement, false);
        }
    };
});