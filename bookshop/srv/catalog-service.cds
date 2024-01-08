using sap.capire.bookshop as bs from '../db/schema';
using sap.capire.customTypes as ct from './commons';
using sap.capire.reviews as rs from '../db/reviews';

@path : 'browse'
service BooksCatalog {
    entity Books as projection on bs.Books
        actions {
            action addReview(rating: rs.Rating, title: String(100), text: String(1000)) returns Reviews;
        };
    @readonly
    entity Authors as projection on bs.Authors;
    entity Reviews as projection on rs.Reviews;
    action createOrder (items: array of ct.createCancelOrderReq, address: String) returns ct.createCancelOrderRet;
}