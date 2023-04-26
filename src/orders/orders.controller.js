const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function validateDishes(req, res, next) {
    const { data: { dishes, mobileNumber, deliverTo } = {} } = req.body;

    if (!Array.isArray(dishes)) {
        res.status(400).send({
            error: `dishes needs to be an array`
        });
    }

    if (dishes.length === 0) {
        res.status(400).send({
            error: `there are no dishes in the order`
        });
    }

    for (let i in dishes) {
        if (dishes[i].quantity == 0) {
            res.status(400).send({
                error: `dish quantity can't be 0`
            });
        }
        if (!dishes[i].quantity) {
            res.status(400).send({
                error: `dish quantity must be at least 1`
            });
        }
        if (typeof dishes[i].quantity !== 'number') {
            res.status(400).send({
                error: `invalid dish quantity: ${dishes[i].quantity}. It must be 2 number`
            });
        }
    }

    if (!mobileNumber) {
        res.status(400).send({
            error: `invalid mobileNumber`
        });
    }

    if (!deliverTo) {
        res.status(400).send({
            error: `invalid deliverTo`
        });
    }

    next();
}

function read(req, res) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    if (!foundOrder) {
        res.status(404).send({
            error: `order not found`
        });
    }


    res.json({ data: foundOrder });
};

function list(req, res) {
    res.json({ data: orders });
};

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        description: mobileNumber,
        status: status,
        dishes: dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
};

function validateStatus(req, res, next) {
    const { data: { status } = {} } = req.body;
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);


    if (!foundOrder) {
        res.status(404).send({
            error: `order ${orderId} not found`
        });
    }


    if (!status || status === 'invalid') {
        res.status(400).send({
            error: `invalid status`
        });
    }

    next();
}

function reqBodyIdMatchesRouteId(req, res, next) {

    const { orderId } = req.params;
    const { data = {} } = req.body;

    // if data.id is falsy (null, empty or undefinded)
    // or data.id matches route id go to next (update)
    if (!data.id || data.id === orderId) {
        next();
    }

    // else throw error
    next({
        status: 400,
        message: `Order id does not match route id. Dish: ${data.id}, Route: ${orderId}`,
    });
}

function update(req, res) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    const { data = {} } = req.body;

    foundOrder.deliverTo = data.deliverTo;
    foundOrder.mobileNumber = data.mobileNumber;
    foundOrder.status = data.status;
    foundOrder.dishes = data.dishes;

    res.status(200).json({ data: foundOrder });
}

function remove(req, res) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    if (!foundOrder) {
        res.status(404).send({
            error: `order ${orderId} not found`
        });
    }

    if (foundOrder.status !== 'pending') {
        res.status(400).send({
            error: `order ${orderId} status is not pending`
        });
    }

    if (foundOrder) {

        const indxOfFoundOrder = orders.findIndex(order => {
            return order.id === foundOrder.id;
        });

        orders.splice(indxOfFoundOrder, 1);

        res.status(204).send({
            message: `order ${orderId} is deleted`
        });
    }

}

module.exports = {
    read,
    list,
    create: [
        validateDishes,
        create
    ],
    update: [
        validateStatus,
        validateDishes,
        reqBodyIdMatchesRouteId,
        update
    ],
    remove
};
