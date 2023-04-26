const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function isPriceValid(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (price > 0 && typeof price === 'number') {
        next();
    }
    res.status(400).send({
        error: `The price is not valid: $${price}`
    });
};

function isImgUrlValid(req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if (image_url) {
        next();
    }
    res.status(400).send({
        error: `The image_url is not valid `
    });
};

function isNameValid(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name) {
        next();
    }
    res.status(400).send({
        error: `The name is not valid `
    });
};

function isDescriptionValid(req, res, next) {
    const { data: { description } = {} } = req.body;
    if (description) {
        next();
    }
    res.status(400).send({
        error: `The description is not valid `
    });
};

function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: Number(price),
        image_url: image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
};

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    const { data = {} } = req.body;

    if (foundDish) {
        res.locals.dish = foundDish;
        res.locals.dishId = dishId;
        res.locals.reqBody = data;
        next();
    }

    next({
        status: 404,
        message: `Dish does not exist: ${dishId}.`,
    });
}
function reqBodyIdMatchesRouteId(req, res, next) {
    const dishId = res.locals.dishId;
    const data = res.locals.reqBody;

    // if data.id is falsy (null, empty or undefinded)
    // or data.id matches route id go to next (update)
    if (!data.id || data.id === dishId) {
        next();
    }

    // else throw error
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${data.id}, Route: ${dishId}`,
    });
}

function update(req, res) {

    const dish = res.locals.dish;
    const data = res.locals.reqBody;

    dish.name = data.name;
    dish.description = data.description;
    dish.price = data.price;
    dish.image_url = data.image_url;

    res.status(200).json({ data: dish });
}

function read(req, res) {
    const foundDish = res.locals.dish;
    res.json({ data: foundDish });
};

function list(req, res, next) {
    res.json({ data: dishes });
};

module.exports = {
    create: [
        isPriceValid,
        isImgUrlValid,
        isNameValid,
        isDescriptionValid,
        create
    ],
    update: [
        dishExists,
        isNameValid,
        isPriceValid,
        isDescriptionValid,
        isImgUrlValid,
        reqBodyIdMatchesRouteId,
        update
    ],
    read: [
        dishExists,
        read
    ],
    list
};

