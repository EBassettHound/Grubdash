const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function validateOrderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
      res.locals.order = foundOrder;
      return next();
    }
    next({
      status: 404,
      message: `Order id does not exist: ${orderId}`,
    });
}

function validateOrderBody(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;   
    if (!deliverTo || deliverTo === "") next({ status: 400, message: "Order must include a deliverTo" });
    if (!mobileNumber || mobileNumber === "") next({ status: 400, message: "Order must include a mobileNumber" }); 
    if (!dishes) next({ status: 400, message: "Order must include at least one dish" });
    if (!Array.isArray(dishes) || dishes.length === 0) {
      return next({
        status: 400,
        message: "Order must include at least one dish",
      });
    }

    dishes.map((dish, index) => {
      if (
          !dish.quantity ||
          !Number.isInteger(dish.quantity) ||
          !dish.quantity > 0
        ) {
        return next({
          status: 400,
          message: `Dish ${index} must have a quantity that is an integer greater than 0.`,
        });
      }
    });
    res.locals.order = req.body.data;
    next();
}

function validateDestroy(req, res, next) {
    if(res.locals.order.status !== "pending") {
        return next({
            status: 400,
            message: "An order cannot be deleted unless it is pending",
        });
    }
    next();
};

function validateStatus(req, res, next) {
    const { orderId } = req.params;
      const { data: { id, status } = {} } = req.body;
  
      if(id && id !== orderId) {
      return next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
      })
    }
      else if(!status || status === "" || (status !== "pending" && status !== "preparing" && status !== "out-for-delivery")) {
      return next({
        status: 400,
        message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
      })
    }		

      else if(status === "delivered"){
      return next({
        status: 400,
        message: "A delivered order cannot be changed"
      })
    }
    next();
};


/* Middleware */
function list(req, res) {
    res.json({ data: orders });
}

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes} = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
};

function read(req, res) {
    res.json({ data: res.locals.order });
}

function update(req, res) {
    const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
    res.locals.order = {
        id: res.locals.order.id,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        dishes: dishes,
        status: status,
    };
    res.json({ data: res.locals.order });
};
  

function destroy(req, res) {
    const index = orders.indexOf(res.locals.order);
    orders.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
    list,
    create: [validateOrderBody, create],
    read: [validateOrderExists, read],
    update: [validateOrderBody, validateOrderExists, validateStatus, update],
    delete: [validateOrderExists, validateDestroy, destroy],
};