using sap.capire.bookshop as bs from '../db/schema';
using sap.capire.customTypes as ct from './commons';

@path : 'orders'
service ManageOrders {
    entity Orders as projection on bs.Orders
    actions {
        action cancelOrder (orderID: Integer) returns ct.createCancelOrderRet;
    };
}