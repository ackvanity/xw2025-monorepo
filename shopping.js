// ShopCart: An object-oriented demo of a simple shopping cart system.
// Copyright (C)  2025 Ackhava Adam Malonda (ackvanity)
// 
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

class Product {
    #_name = "Untitled";
    #_price = 0;
    #_stock = 0;

    constructor(name, price, stock){
        this.#_name=name;
        this.#_price=price;
        this.#_stock=stock;
    }

    get name(){
        return this.#_name;
    }

    get stock(){
        return this.#_stock;
    }

    get price() {
        return this.#_price;
    }

    // Takes items away. Returns false for a failed operation, and true for a successful operation.
    takeItems(qty){
        if(this.#_stock < qty) return false;
        this.#_stock -= qty;
        return true;
    }

    loadItems(qty) {
        this.#_stock += qty;
        return true;
    }

    getStockReport() {
        return `${this.name}\t${this.price}\tx${this.stock}`;
    }
}

class ShoppingCart {
    #_items; // {product: qty}

    constructor(){
        this.#_items = {};
    }

    // JavaScript objects currently does not support object keys properly, so we serialize the Product class here.
    #_getProductKey(product){
        return JSON.stringify({name: product.name, price: product.price});
    }

    get items() {
        return JSON.parse(JSON.stringify(this.#_items)); // we need toprotect rogue users from writing to the return value! This is the best cross-platform way for doing this, although all objects must be serializable
    }

    get price() {
        let price = 0;
        Object.keys(this.#_items).forEach((key)=>{
            price += JSON.parse(key).price * this.items[key];
        })
        return price;
    }

    get cartStr() {
        if(Object.keys(this.#_items).length === 0)return "Your cart is empty!";
        
        let str = "";
        Object.keys(this.#_items).forEach((key) => {
            str += `${JSON.parse(key).name} - $${JSON.parse(key).price}\tx${this.items[key]}\n`;
        }, {str})
        str += `Total Price: $${this.price}`;

        return str;
    }

    addProduct(product, qty){
        if(product.takeItems(qty)) {
            // Create the entry if needed
            if(this.#_items[this.#_getProductKey(product)] === undefined)
                this.#_items[this.#_getProductKey(product)] = 0;

            this.#_items[this.#_getProductKey(product)] += qty;
            return true;
        }
        return false;
    }
    
    removeProduct(product){
        if(this.#_items[this.#_getProductKey(product)] === undefined)
            return false;

        product.loadItems(this.#_items[this.#_getProductKey(product)]);

        this.#_items[this.#_getProductKey(product)] = undefined;

        return true;
    }

    doCheckout(){
        console.log(" ==== BILL ==== ");
        console.log(this.cartStr);
        console.log(`User Charged $${this.price}.`);

        this.#_items = {};
    }
}


const apple = new Product("Apple", 2, 10);
const banana = new Product("Banana", 1, 5);
const carrot = new Product("Carrot", 4, 3);

const cart = new ShoppingCart();
console.log(cart.addProduct(apple, 3)); 
console.log(cart.addProduct(apple, 3)); 
console.log(cart.addProduct(apple, 300)); 
console.log(cart.addProduct(banana, 2));
console.log(cart.cartStr);

cart.doCheckout();
console.log(cart.cartStr);

console.log("\n\n");
console.log(apple.getStockReport());
console.log(banana.getStockReport());
console.log(carrot.getStockReport());

apple.loadItems(30);
banana.loadItems(10);

console.log("Restock done. New stock data:")

console.log(apple.getStockReport());
console.log(banana.getStockReport());
console.log(carrot.getStockReport());

const cart2 = new ShoppingCart();
cart2.addProduct(apple, 34)
cart2.addProduct(banana, 13)
cart2.addProduct(carrot, 3)

cart2.removeProduct(apple);

cart2.doCheckout();

console.log(apple.getStockReport());
console.log(banana.getStockReport());
console.log(carrot.getStockReport());