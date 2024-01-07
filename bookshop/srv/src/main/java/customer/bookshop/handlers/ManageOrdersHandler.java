package customer.bookshop.handlers;

import org.springframework.stereotype.Component;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.persistence.PersistenceService;
import com.sap.cds.ql.cqn.CqnAnalyzer;
import com.sap.cds.reflect.CdsModel;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.Select;
import com.sap.cds.Result;

import cds.gen.manageorders.ManageOrders_;
import cds.gen.manageorders.Orders;
import cds.gen.manageorders.Orders_;
import cds.gen.manageorders.OrderItems;
import cds.gen.manageorders.CancelOrderContext;
import cds.gen.manageorders.OrderCancelledContext;
import cds.gen.manageorders.OrderCancelled;
import cds.gen.sap.capire.customtypes.CreateCancelOrderRet;
import cds.gen.sap.capire.customtypes.CreateCancelOrderReq;

import java.util.*;

@Component
@ServiceName(ManageOrders_.CDS_NAME)
public class ManageOrdersHandler implements EventHandler {
    private final PersistenceService db;
    private final CqnAnalyzer analyzer;

    ManageOrdersHandler(PersistenceService db, CdsModel model) {
        this.db = db;
        this.analyzer = CqnAnalyzer.create(model);
    }

    @On(event = CancelOrderContext.CDS_NAME)
    public void onCancelOrder (CancelOrderContext context) {
        System.out.println("Hi there, cancel order On handler is called");

        // Get the order ID
        CqnSelect select = context.getCqn();
        Integer orderId = (Integer)analyzer.analyze(select).targetKeys().get(Orders.ID);
        context.put("orderId", orderId);

        // Cancel the corresponding order
        Map<String, Object> data = Collections.singletonMap("status", "Cancelled");
        Result res = db.run(Update.entity(Orders_.CDS_NAME).data(data).byId(orderId));

        // Set result
        CreateCancelOrderRet result = CreateCancelOrderRet.create();
        result.setMessage("Success");
        result.setAcknowledge("Your Order has been Cancelled");
        context.setResult(result);
    }

    @After(event = CancelOrderContext.CDS_NAME)
    public void afterCancelOrder (CancelOrderContext context) {
        System.out.println("Hi there, cancel order After handler is called");
        Integer orderId = (Integer) context.get("orderId");
        List<CreateCancelOrderReq> cancelledItems  = new ArrayList<>();;

        Orders order =  db.run(Select.from(Orders_.class).columns(c -> c.orderItems().expand()).where(b -> b.ID().eq(orderId))).single(Orders.class);
        for (OrderItems item: order.getOrderItems()) {
            CreateCancelOrderReq cancelledItem = CreateCancelOrderReq.create();
            cancelledItem.setBookId(item.getItemId());
            cancelledItem.setQuantity(item.getQuantity());
            cancelledItem.setFormat(item.getFormat());
            cancelledItems.add(cancelledItem);
        }

        //emit the event to itself
        OrderCancelled payload = OrderCancelled.create();
        payload.setItems(cancelledItems);
        OrderCancelledContext orderCancelledEvtCtxt = OrderCancelledContext.create();
        orderCancelledEvtCtxt.setData(payload);
        context.getService().emit(orderCancelledEvtCtxt);
    }
}