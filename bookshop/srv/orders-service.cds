using sap.capire.bookshop as bs from '../db/schema';
using sap.capire.customTypes as ct from './commons';

@path : 'orders'
service ManageOrders {
    entity Orders as projection on bs.Orders
    actions {
        action cancelOrder () returns ct.createCancelOrderRet;
    };
    @readonly
    entity Books as projection on bs.Books;

    event orderCancelled : {
        items: array of ct.createCancelOrderReq;
    }
}