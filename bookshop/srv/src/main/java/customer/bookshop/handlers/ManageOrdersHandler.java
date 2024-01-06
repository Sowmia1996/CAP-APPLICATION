package customer.bookshop.handlers;

import org.springframework.stereotype.Component;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.persistence.PersistenceService;
import com.sap.cds.ql.cqn.CqnAnalyzer;
import com.sap.cds.reflect.CdsModel;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.Update;
import com.sap.cds.Result;

import cds.gen.manageorders.ManageOrders_;
import cds.gen.manageorders.Orders;
import cds.gen.manageorders.Orders_;
import cds.gen.manageorders.CancelOrderContext;
import cds.gen.sap.capire.customtypes.CreateCancelOrderRet;

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
    public void createOrder (CancelOrderContext context) {
        System.out.println("Hi there, cancel order handler is called");

        // Get the order ID
        CqnSelect select = context.getCqn();
        Integer orderId = (Integer)analyzer.analyze(select).targetKeys().get(Orders.ID);

        // Cancel the corresponding order
        Map<String, Object> data = Collections.singletonMap("status", "Cancelled");
        Result res = db.run(Update.entity(Orders_.CDS_NAME).data(data).byId(orderId));
        System.out.println(res);

        // Set result
        CreateCancelOrderRet result = CreateCancelOrderRet.create();
        result.setMessage("Success");
        result.setAcknowledge("Your Order has been Cancelled");
        context.setResult(result);
    }
}