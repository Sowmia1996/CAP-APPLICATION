package customer.bookshop.handlers;

import org.springframework.stereotype.Component;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.persistence.PersistenceService;

import cds.gen.bookscatalog.BooksCatalog_;
import cds.gen.bookscatalog.CreateOrderContext;
import cds.gen.bookscatalog.CreateCancelOrderReq;
import cds.gen.bookscatalog.CreateCancelOrderRet;
import cds.gen.bookscatalog.Orders_;
import cds.gen.bookscatalog.Orders;

import java.util.*;

import com.sap.cds.Result;
import com.sap.cds.ql.Insert;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;


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
        Integer orderId = 117;

        List<Map<String, Integer>> orderItems = new ArrayList<>();
        // for each item in the context, fill up the above list
        for(CreateCancelOrderReq item : context.getItems()) {
            Map<String, Integer> tempMap  = new HashMap<String, Integer>(); 
            tempMap.put("order_ID", orderId);
            tempMap.put("item_ID", item.getBookId());
            tempMap.put("quantity", item.getQuantity());
            orderItems.add(tempMap);
        }
        Orders myOrder = Orders.create(orderId);
        myOrder.setOrderNumber("ONO1234");
        myOrder.setStatus("AwaitingConfirmation");
        myOrder.setShippingAddress(context.getAddress());
        myOrder.setOrderItems(orderItems);
        
        // Now insert this into the orders table
        db.run(Insert.into(Orders_.CDS_NAME).entry(myOrder));
        CreateCancelOrderRet response = CreateCancelOrderRet.create();
        response.setMessage("success");
        response.setAcknowledge("Your request submitted successfully");
        
        context.setResult(response);
    }
}