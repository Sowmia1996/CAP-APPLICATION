using ManageOrders from '../../srv/orders-service';

// List report and Object Page annotations
annotate ManageOrders.Orders with @(UI : {
  HeaderInfo  : {
      TypeName : 'Order',
      TypeNamePlural : 'Orders',
      Title: {Value: orderNumber},
      Description: {Value: status}
  },
  Identification : [
      {Value : orderNumber}
  ],
  HeaderFacets : [
    {
        $Type : 'UI.ReferenceFacet',
        Target : '@UI.DataPoint#orderNo'
    },
    {
        $Type : 'UI.ReferenceFacet',
        Target : '@UI.DataPoint#status'
    }
  ],
  LineItem : [
    { 
      Value: orderNumber,
      ![@HTML5.CssDefaults] : {width: '15rem'}
    },
    { 
      Value: status,
      ![@HTML5.CssDefaults] : {width: '10rem'}
    },
    { 
      Value: orderItems.item.title,
      ![@HTML5.CssDefaults] : {width: '25rem'}
    },
    { 
      Value: total,
      ![@HTML5.CssDefaults] : {width: '10rem'}
    }
  ],
  SelectionFields : [
    orderNumber,
    status
  ],
  DataPoint #status : {
    Value : status,
    Title : 'Status'
  },
  DataPoint #orderNo : {
    Value : orderNumber,
    Title : 'Order Number'
  }
}){ ID  @UI.Hidden;
currency @UI.Hidden;
@Measures.ISOCurrency : currency.symbol
    total;
};