using ManageOrders from '../../srv/orders-service';

// List report and Object Page annotations
annotate ManageOrders.Orders with @(UI : {
  DeleteHidden : true,
  HeaderInfo  : {
      TypeName : 'Order',
      TypeNamePlural : 'Orders',
      Title: {Value: orderNumber}
  },
  Identification : [
      {Value : orderNumber}
  ],
  HeaderFacets : [
    {
        $Type : 'UI.ReferenceFacet',
        Target : '@UI.DataPoint#total'
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
        $Type  : 'UI.ReferenceFacet',
        Label  : 'Order Items',
        Target : 'orderItems/@UI.LineItem'
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
  DataPoint #total : {
    Value : total,
    Title : 'Order Total'
  },
  FieldGroup #shippingAddress:  {Data : [
    {Value : shippingAddress}
  ]}
}){ ID  @UI.Hidden;
currency @UI.Hidden;
@Measures.ISOCurrency : currency.symbol
    total;
};


annotate ManageOrders.OrderItems with @(
    UI : {
        HeaderInfo : {
            $Type          : 'UI.HeaderInfoType',
            TypeName       : 'Order Item',
            TypeNamePlural : 'Order Items'
        },
        LineItem   : [
            {
              Value: item.title,
              ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
              Value: item.price,
              ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
              Value: format,
              ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                Value : quantity,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
        ]
    }
);