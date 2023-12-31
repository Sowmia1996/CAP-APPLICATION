package customer.bookshop.handlers;

import org.springframework.stereotype.Component;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.persistence.PersistenceService;

import cds.gen.bookscatalog.BooksCatalog_;
import cds.gen.bookscatalog.CreateOrderContext;
import cds.gen.sap.capire.customtypes.CreateCancelOrderReq;
import cds.gen.sap.capire.customtypes.CreateCancelOrderRet;
import cds.gen.manageorders.Orders_;
import cds.gen.manageorders.Orders;
import cds.gen.bookscatalog.Books_;
import cds.gen.bookscatalog.Books;

import java.util.*;
import java.math.BigDecimal;

import com.sap.cds.Result;
import com.sap.cds.ql.Insert;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.CQL.*;
import com.sap.cds.Row;


@Component
@ServiceName(BooksCatalog_.CDS_NAME)
public class BooksCatalogHandler implements EventHandler {

    private final PersistenceService db;

    BooksCatalogHandler(PersistenceService db) {
        this.db = db;
    }

    @On(event = CreateOrderContext.CDS_NAME)
    public void createOrder (CreateOrderContext context) {
        System.out.println("Hi there! custom action is triggered!!");
        Random rand = new Random();
        Integer orderId = rand.nextInt(1000);
        String orderNo = "ONOX" + Integer.toString(orderId);
        List<Map<String, Object>> orderItems = new ArrayList<>();
        BigDecimal cartTotal = BigDecimal.ZERO;
        Integer reqQuantity;
        Object stock, price, title;
        Optional<Row> book;
        Map<String, Object> tempMap;
        for(CreateCancelOrderReq item : context.getItems()) {
            Integer bookId = item.getBookId();
            Result res =  db.run(Select.from(Books_.CDS_NAME).columns("stock", "price", "title").where(b -> b.get("ID").eq(bookId)));
            book = res.first();
            price = book.get().get("price");
            reqQuantity = item.getQuantity();
            stock = book.get().get("stock");
            title = book.get().get("title");
            if ((Integer)stock >= reqQuantity) {
                tempMap  = new HashMap<String, Object>();
                tempMap.put("order_ID", orderId);
                tempMap.put("item_ID", bookId);
                tempMap.put("quantity", reqQuantity);
                tempMap.put("format", item.getFormat());
                orderItems.add(tempMap);
                cartTotal = cartTotal.add(BigDecimal.valueOf(reqQuantity).multiply((BigDecimal)price));
            }
        }
        Orders myOrder = Orders.create(orderId);
        myOrder.setOrderNumber(orderNo);
        myOrder.setStatus("AwaitingConfirmation");
        myOrder.setShippingAddress(context.getAddress());
        myOrder.setOrderItems(orderItems);
        myOrder.setTotal(cartTotal);
        
        // Now insert this into the orders table
        db.run(Insert.into(Orders_.CDS_NAME).entry(myOrder));

        // Update the stock after taking into account the current order
        

        CreateCancelOrderRet response = CreateCancelOrderRet.create();
        response.setMessage("Order Placed"); // Other two types are partially ordered and Order Failed
        response.setAcknowledge("Your request has been submitted successfully. Your order ID is: " + orderNo);
        
        context.setResult(response);
    }
}