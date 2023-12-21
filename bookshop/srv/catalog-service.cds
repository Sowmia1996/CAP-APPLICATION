using sap.capire.bookshop as bs from '../db/schema';
using sap.capire.customTypes as ct from './commons';

@path : 'browse'
service BooksCatalog {
    entity Books as projection on bs.Books;
    entity Authors as projection on bs.Authors;
    action createOrder (items: array of ct.createCancelOrderReq, address: String) returns ct.createCancelOrderRet;
}