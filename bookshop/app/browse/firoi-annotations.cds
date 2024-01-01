using BooksCatalog from '../../srv/catalog-service';

// List report and Object Page annotations
annotate BooksCatalog.Books with @(UI : {
  HeaderInfo  : {
      TypeName : 'Book',
      TypeNamePlural : 'Books',
      Title: {Value: title},
      Description: {Value: author.name}
  },
  Identification : [
      {Value : title}
  ],
  HeaderFacets : [
    {
        $Type : 'UI.ReferenceFacet',
        Target : '@UI.DataPoint#rating'
    },
    {
        $Type : 'UI.ReferenceFacet',
        Target : '@UI.DataPoint#price'
    }
  ],
  LineItem : [
    { 
      Value: title,
      ![@HTML5.CssDefaults] : {width: '15rem'}
    },
    { 
      Value: author.name,
      ![@HTML5.CssDefaults] : {width: '10rem'}
    },
    { 
      Value: genre,
      ![@HTML5.CssDefaults] : {width: '7rem'}
    },
    {
      $Type  : 'UI.DataFieldForAnnotation',
      Target : '@UI.DataPoint#rating',
       ![@HTML5.CssDefaults] : {width: '15rem'}
    },
    { 
      Value: price,
      ![@HTML5.CssDefaults] : {width: '10rem'}
    },
    {
      Value: descr,
      ![@UI.Hidden]
    }
  ],
  SelectionFields : [
    author.name,
    genre
  ],
  DataPoint #rating : {
    Value : ratings,
    Visualization : #Rating,
    MinimumValue : 0,
    MaximumValue : 5
  },
  DataPoint #price : {
    Value : price,
    Title : 'Price'
  }
}){ ID  @UI.Hidden;
    author_ID @UI.Hidden;
    currency @UI.Hidden;
    @Measures.ISOCurrency : currency.symbol
    price;
    @UI.HiddenFilter
    descr;
};