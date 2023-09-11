// Import mongoose para el mongoose.connect:
import mongoose from "mongoose";

// Import del modelo de carritos:
import {
    cartModel
} from "./models/carts.model.js";

import {
    ticketModel
} from "./models/ticket.model.js";
// Import de variables de entorno:
import {
    envMongoURL
} from "../../config.js";

// Clase para el DAO de carritos:
export default class CartsDAO {

    // Conexión Mongoose:
    connection = mongoose.connect(envMongoURL);

    // Crear un carrito - DAO:
    async createCart() {
        let response = {};
        try {
            const result = await cartModel.create({
                products: [],
                tickets: []
            });
            response.status = "success";
            response.result = result;
        } catch (error) {
            response.status = "error";
            response.message = "Error al crear el carrito - DAO: " + error.message;
        };
        return response;
    };

    // Traer un carrito por su ID - DAO:
    async getCartById(cid) {
        let response = {};
        try {
            const result = await cartModel.findOne({
                _id: cid
            }).populate(['products.product', 'tickets.ticketsRef']);
            if (result === null) {
                response.status = "not found cart";
            } else {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener el carrito por ID - DAO: " + error.message;
        };
        return response;
    };

    // Traer todos los carritos - DAO: 
    async getAllCarts() {
        let response = {};
        try {
            const result = await cartModel.find();
            if (result.length === 0) {
                response.status = "not found carts";
            } else {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener todos los carritos - DAO: " + error.message;
        };
        return response;
    };

    // Agregar un producto a un carrito:
    async addProductToCart(cid, product, quantity) {
        let response = {};
        try {
            const cart = await this.getCartById(cid);
            if (cart.result === null) {
                response.status = "not found cart";
            } else {
                const productID = product._id.toString();
                const existingProductIndex = cart.result.products.findIndex(p => p.product._id.toString() === productID);
                if (existingProductIndex !== -1) {
                    // Si el producto ya está en el carrito, solo se actualiza el quantity.
                    cart.result.products[existingProductIndex].quantity += parseInt(quantity, 10);
                    await cart.result.save();
                    response.status = "success";
                    response.result = cart;
                } else {
                    // Si el producto no está en el carrito, se lo agregar con el quantity proporcionado.
                    cart.result.products.push({
                        product: product,
                        quantity: quantity
                    });
                    await cart.result.save();
                    response.status = "success";
                    response.result = cart;
                };
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al agregar el producto al carrito - DAO: " + error.message;
        };
        return response;
    };

    // Agregar un ticket a un carrito - DAO:
    async addTicketToCart(cid, ticketID) {
        let response = {};
        try {
            const cart = await this.getCartById(cid);
            if (cart.result === null) {
                response.status = "not found cart";
            } else {
                cart.result.tickets.push({ ticketsRef: ticketID });
                await cart.result.save();
                response.status = "success";
                response.result = cart;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al agregar el ticket al carrito - DAO: " + error.message;
        };
        return response;
    };

    // Borrar un producto de un carrito: 
    async deleteProductFromCart(cid, pid) {
        let response = {};
        try {
            const cart = await this.getCartById(cid);
            if (cart.result === null) {
                response.status = "not found cart";
            } else {
                const product = cart.result.products.find((p) => p._id.toString() === pid);
                if (product === undefined) {
                    response.status = "not found product";
                } else {
                    cart.result.products.pull(pid);
                    await cart.result.save();
                    response.status = "success";
                    response.result = cart;
                };
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al borrar el producto en carrito - DAO: " + error.message;
        };
        return response;
    };

    // Eliminar todos los productos de un carrito: 
    async deleteAllProductsFromCart(cid) {
        let response = {};
        try {
            const cart = await this.getCartById(cid);
            if (cart.result === null) {
                response.status = "not found cart";
            } else if (cart.status === "success") {
                cart.products = [];
                await cart.result.save();
                response.status = "success";
                response.result = cart;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al eliminar todos los productos del carrito - DAO: " + error.message;
        };
        return response;
    };

    // Actualizar un carrito - DAO:
    async updateCart(cid, updatedCartFields) {
        let response = {};
        try {
            let cart = await cartModel.updateOne({
                _id: cid
            }, {
                $set: updatedCartFields
            });
            if (result.matchedCount === 0) {
                response.status = "not found cart";
            } else if (result.matchedCount === 1) {
                await cart.result.save();
                response.status = "success";
                response.result = cart;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al actualizar el carrito - DAO: " + error.message;
        };
        return response;
    };

    // Actualizar la cantidad de un produco en carrito - DAO: 
    async updateProductInCart(cid, pid, quantity) {
        let response = {};
        try {
            const cart = await this.getCartById(cid);
            if (cart.result === null) {
                response.status = "not found cart";
            } else {
                const product = cart.result.products.find((p) => p._id.toString() === pid);
                if (product === undefined) {
                    response.status = "not found product";
                } else {
                    product.quantity = quantity;
                    await cart.result.save();
                    response.status = "success";
                    response.result = cart;
                };
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al actualizar producto en carrito - DAO: " + error.message;
        };
        return response;
    };

};