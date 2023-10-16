const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res, next) {
    res.send({ data: dishes })
}

function postValidator(req, res, next) {
    const post = req.body.data
    if (!("name" in post)) {
        next({
            status: 400,
            message:"Dish must include a name"})
    }
    if (post.name === "") {
        next({
            status: 400,
            message:"Dish must include a name"})
    }
    if (!("description" in post)) {
        next({
            status: 400,
            message:"Dish must include a description"})
    }
    if (post.description === "") {
        next({
            status: 400,
            message:"Dish must include a description"})
    }
    if (!("image_url" in post)) {
        next({
            status: 400,
            message:"Dish must include a image_url"})
    }
    if (post.image_url === "") {
        next({
            status: 400,
            message:"Dish must include a image_url"})
    }
    if (!("price" in post)) {
        next({
            status: 400,
            message:"Dish must include a price"})
    }
    if (typeof post.price !== "number") {
        next({
            status: 400,
            message:"Dish must have a price that is an integer greater than 0"})
    }
    if (post.price <= 0) {
        next({
            status: 400,
            message:"Dish must have a price that is an integer greater than 0"})
    }
    else {
        next();
    }

}

function create(req, res, next) {
   const newDish = {
        "id" : nextId(),
        "name": req.body.data.name,
        "description": req.body.data.description,
        "price": req.body.data.price,
        "image_url": req.body.data.image_url
    }
    dishes.push(newDish);
    res.status(201).send({ data: newDish })
}
function read(req, res, next) {
    const foundDish = dishes.find(dish=>dish.id === req.params.dishId)
    
    if (foundDish !== undefined) {
        res.status(200).send({ data: foundDish })
    }
    else {
        next({
            status: 404,
            })

    }
}
function validateDishExists(request, response, next) {
    const { dishId } = request.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        response.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish id is not found: ${dishId}`,
    })
};
function validateDishId(request, response, next) {
    const { dishId } = request.params;
    const { data: { id } = {} } = request.body;
    if (!id || id === dishId ) {
        response.locals.dishId = dishId;
        return next();
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}. Route: ${dishId}.`
    });
};

function update(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    res.locals.dish = {
      id: res.locals.dishId,
      name: name,
      description: description,
      price: price,
      image_url: image_url,
    };
    res.json({ data: res.locals.dish });
  };

module.exports = {
    list,
    create : [postValidator, create],
    read,
    update: [validateDishExists, postValidator, validateDishId, update]
}