namespace sap.capire.customTypes;

type createCancelOrderRet {
    acknowledge: String enum { succeeded; failed; };
    message: String;
}
type createCancelOrderReq {
    bookId: String;
    quantity: Integer;
    format: String;
}