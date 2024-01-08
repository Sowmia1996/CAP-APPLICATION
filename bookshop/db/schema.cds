namespace sap.capire.bookshop;
using { Currency, managed } from '@sap/cds/common';
using { sap.capire.reviews as reviews} from './reviews';

type Genre : String enum {
  Crime; Mystery; Paranormal; Philosophy; Psychology; Travel; Classics; Art; CookBooks; History; Poetry; Sports; SciFi; Religion; Biography; Business;
}

type Status : String enum {
  Confirmed; Shipped; Delivered; Cancelled;
}

entity Books {
  key ID : String;
  title  : String(111);
  descr  : String(1111);
  stock  : Integer;
  price  : Decimal(9,2);
  currency: Currency;
  isbn: String(13);
  genre: Genre;
  ratings   : Decimal(2, 1)@assert.range : [ 0.0, 5.0 ];
  author_ID : type of Authors:ID;
  author : Association to Authors on author.ID = author_ID;
  orders : Composition of  many OrderItems on orders.item_ID = ID;
  reviews: Association to many reviews.Reviews on reviews.book = $self;
}

entity Authors {
  key ID : String;
  name   : String(111);
  about : String(1111);
  books  : Association to many Books on books.author_ID = ID;
}

entity Orders {
  key ID : Integer;
  orderNumber : String(10);
  status : Status;
  total : Decimal(10,2);
  shippingAddress : String(1111);
  currency: Currency;
  orderItems : Composition of  many OrderItems on orderItems.order_ID = ID;
}

entity OrderItems {
  key order_ID: type of Orders:ID;
  key item_ID : type of Books:ID;
  order: Association to Orders on order.ID = order_ID;
  item: Association to  Books on item.ID = item_ID;
  quantity : Integer;
  format: String(111);
}