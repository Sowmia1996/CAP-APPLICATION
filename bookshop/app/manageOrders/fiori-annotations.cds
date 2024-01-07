using ManageOrders from '../../srv/orders-service';

// List report and Object Page annotations
annotate ManageOrders.Orders with @(UI : {
  DeleteHidden : true,
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
  Facets : [
    {
        $Type : 'UI.ReferenceFacet',
        Label : 'Shipping Address',
        Target : '@UI.FieldGroup#shippingAddress'
    },
    {
        $Type : 'UI.ReferenceFacet',
        Label : 'Order Items',
        Target : '@UI.FieldGroup#items'
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
  },
  FieldGroup #shippingAddress:  {Data : [
    {Value : shippingAddress}
  ]},
  FieldGroup #items:  {Data : [
    {Value : orderItems.item.title}
  ]}
}){ ID  @UI.Hidden;
currency @UI.Hidden;
@Measures.ISOCurrency : currency.symbol
    total;
};