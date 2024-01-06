using { sap.capire.bookshop as bs } from '../db/schema';

annotate bs.Books with {
  title @title : 'Title';
  price  @title : 'Price/Unit';
  stock @title: 'Stock';
  descr @title: 'Description';
  isbn @title: 'ISBN';
  genre @title: 'Genre';
  ratings @title: 'Ratings';
}

annotate  bs.Authors with {
  name @title: 'Author';
  about @title: 'About Author';
}

annotate bs.Orders with {
  orderNumber @title: 'Order Number';
  status @title: 'Status';
  total @title: 'Order Total';
  shippingAddress @title: 'Deliver To:';
};

