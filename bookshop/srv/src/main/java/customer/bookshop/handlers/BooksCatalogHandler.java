package customer.bookshop.handlers;

import org.springframework.stereotype.Component;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.persistence.PersistenceService;

import cds.gen.bookscatalog.BooksCatalog_;
import cds.gen.manageorders.ManageOrders_;
import cds.gen.bookscatalog.CreateOrderContext;
import cds.gen.sap.capire.customtypes.CreateCancelOrderReq;
import cds.gen.sap.capire.customtypes.CreateCancelOrderRet;
import cds.gen.manageorders.OrderCancelledContext;
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

    /**
        1. Perform Book availability check
        2. Calculate Cart total excluding those that are out of stock
     */
    @Before(event = CreateOrderContext.CDS_NAME)
    public void beforeCreateOrder (CreateOrderContext context) {
        Random rand = new Random();
        Integer orderId = rand.nextInt(1000), reqQuantity, stock;
        String orderNo = "ONOX" + Integer.toString(orderId);
        List<Map<String, Object>> orderItems = new ArrayList<>();
        BigDecimal cartTotal = BigDecimal.ZERO, price;
        Map<String, Object> tempMap;
        for(CreateCancelOrderReq item : context.getItems()) {
            String bookId = item.getBookId();
            Result res =  db.run(Select.from(Books_.CDS_NAME).columns("stock", "price").where(b -> b.get("ID").eq(bookId)));
            price = (BigDecimal)res.first().get().get("price");
            reqQuantity = item.getQuantity();
            stock = (Integer)res.first().get().get("stock");
            if (stock >= reqQuantity) {
                tempMap  = new HashMap<String, Object>();
                tempMap.put("order_ID", orderId);
                tempMap.put("item_ID", bookId);
                tempMap.put("quantity", reqQuantity);
                tempMap.put("format", item.getFormat());
                orderItems.add(tempMap);
                cartTotal = cartTotal.add(BigDecimal.valueOf(reqQuantity).multiply(price));
            }
        }
        Orders myOrder = Orders.create(orderId);
        myOrder.setOrderNumber(orderNo);
        myOrder.setStatus("AwaitingConfirmation");
        myOrder.setShippingAddress(context.getAddress());
        myOrder.setOrderItems(orderItems);
        myOrder.setTotal(cartTotal);
        myOrder.setCurrencyCode("EUR");
        context.put("order", myOrder);
        context.put("orderItems", orderItems);
    }

    @On(event = CreateOrderContext.CDS_NAME)
    public void onCreateOrder (CreateOrderContext context) {
        Orders myOrder = (Orders)context.get("order");
        List<Map<String, Object>> orderItems = (List<Map<String, Object>>) context.get("orderItems");
        String orderNo = myOrder.getOrderNumber();
        
        // insert this into the Orders table
        if (orderItems.size() > 0) {
            db.run(Insert.into(Orders_.CDS_NAME).entry(myOrder));
        }

        // Set Process Completed
        String responseMsg, acknowledgeMsg;
        if (orderItems.size() == 0) {
            responseMsg = "Order Creation Failed";
            acknowledgeMsg = "Your Order failed as all items are out of stock currently";
        } else if (orderItems.size() < context.getItems().size()) {
            responseMsg = "Partially Ordered";
            acknowledgeMsg = "Your order has been partially palced as few items are out of stock. Your order ID is:" + orderNo;
        } else {
            responseMsg = "Order Successful";
            acknowledgeMsg = "Your Order has been placed successfully. Your order ID is: " + orderNo;
        }
        CreateCancelOrderRet response = CreateCancelOrderRet.create();
        response.setMessage(responseMsg);
        response.setAcknowledge(acknowledgeMsg);
        
        context.setResult(response);
    }

    // Update the stock for each ordered Book
    @After(event = CreateOrderContext.CDS_NAME)
    public void afterCreateOrder (CreateOrderContext context) {
        List<Map<String, Object>> orderItems = (List<Map<String, Object>>) context.get("orderItems");
        for (Map<String, Object> item: orderItems) {
            Integer currentStock = (Integer) db.run(Select.from(Books_.CDS_NAME).columns("stock").where(b -> b.get("ID").eq(item.get("item_ID")))).first().get().get("stock");
            db.run(Update.entity(Books_.CDS_NAME).byId(item.get("item_ID")).data("stock", currentStock - (Integer)item.get("quantity")));
        }
    }

    /** 
        1. Listener for the orderCancelled event emitted from the OrdersService
        2. Updates the stock of those books that were cancelled
    */
    @On(event = OrderCancelledContext.CDS_NAME, service = ManageOrders_.CDS_NAME)
    public void updateStocksForCancelledItems (OrderCancelledContext context) {
        System.out.println("Hi there, cancelled order event handler executed");
        Integer cancelledQuantity, currentStock;
        for (CreateCancelOrderReq item: context.getData().getItems()) {
            String bookId = item.getBookId();
            cancelledQuantity = item.getQuantity();
            currentStock = (Integer) db.run(Select.from(Books_.CDS_NAME).columns("stock").where(b -> b.get("ID").eq(bookId))).first().get().get("stock");
            db.run(Update.entity(Books_.CDS_NAME).byId(bookId).data("stock", currentStock + cancelledQuantity));
        }
    }
}