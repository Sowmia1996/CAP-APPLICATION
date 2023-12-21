using sap.capire.bookshop as bs from '../db/schema';

@path : 'browse'
service BooksCatalog {
    entity Books as projection on bs.Books;
    entity Authors as projection on bs.Authors;
    entity Orders as projection on bs.Orders;
    type createCancelOrderRet {
        acknowledge: String enum { succeeded; failed; };
        message: String;
    }
    type createCancelOrderReq {
        bookId: Integer;
        quantity: Integer;
    }
    action createOrder (items: array of createCancelOrderReq, address: String) returns createCancelOrderRet;
    action cancelOrder (orderID: Integer) returns createCancelOrderRet;
}