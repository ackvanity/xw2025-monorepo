// BookDB: An object-oriented demo of a simple library system, with interactive console and JSON import/export support
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

// Note: we use an IIFE to get await and require in one package.
// Note: a starting dataset can be found in books-data.json
(async () => {
    class Book {
        #title
        #author
        #description
        #isAvailable
        #renter

        constructor(title, author, description = null) {
            this.#title = title;
            this.#author = author;
            this.#isAvailable = true;
            this.#description = description;
            this.#renter = null;
        }

        get title() {
            return this.#title;
        }

        get author() {
            return this.#author;
        }

        get description() {
            return this.#description;
        }

        get renter() {
            return this.#renter;
        }

        get isAvailable() {
            return this.#isAvailable;
        }

        get json() {
            return JSON.stringify({
                title: this.#title,
                author: this.#author,
                description: this.#description,
                isAvailable: this.#isAvailable,
                renter: this.#renter,
            })
        }

        set json(data) {
            ({title: this.#title, author: this.#author, description: this.#description, isAvailable: this.#isAvailable, renter: this.#renter} = JSON.parse(data));
        }

        borrow(renter = null) {
            if(!this.#isAvailable)return false;
            this.#isAvailable = false;
            this.#renter = renter;
            return true;
        }

        return(renter = null) {
            if(this.#isAvailable)return true;
            if(this.#renter != renter) return false;
            this.#isAvailable = true;
            this.#renter = null;
            return true;
        }

        bookDetail() {
            console.log(`${this.title}`);
            console.log(`A book by ${this.author}.`);
            console.log(`${this.description || "No description was added."}`)
            console.log(`${this.#isAvailable ? "Book available for rent" : `Book rented by ${this.renter}`}`)
        }
    }

    class Library {
        #books = {}

        constructor() { }

        get json() {
            return JSON.stringify(Object.values(this.#books).map(book => {return book.json}))
        }

        set json(data) {
            this.#books = JSON.parse(data).map(book => {
                let loaded = new Book();
                loaded.json = book;
                return loaded;
            });
        }

        addBook(book) {
            if(this.#books[book.title]) return false;
            this.#books[book.title] = book;
            return true;
        }

        findBookByTitle(title) {
            return this.#books[title];
        }

        borrowBook(title, renter = null) {
            if(!this.#books[title])return false;
            if(!this.#books[title].isAvailable)return false;
            return this.#books[title].borrow(renter);
        }

        returnBook(title, renter = null) {
            if(!this.#books[title])return false;
            if(this.#books[title].isAvailable)return false;
            return this.#books[title].return(renter);
        }

        listAvailableBooks() {
            console.log("== Available Books to Rent ==")
            Object.values(this.#books).filter(book => book.isAvailable).forEach((book) => {
                console.log(`${book.title} by ${book.author}`);
            })
        }

        listAllBooks() {
            console.log("== Available Books to Rent ==")
            Object.values(this.#books).filter(book => book.isAvailable).forEach((book) => {
                console.log(`${book.title} by ${book.author}`);
            })
            console.log("==  Unavailable/Rented Books ==")
            Object.values(this.#books).filter(book => !book.isAvailable).forEach((book) => {
                console.log(`${book.title} by ${book.author}: Rented by ${book.renter}`);
            })
        }
    }

    // The following code is an interactive driver code for testing. Note that the system supports different usernames
    // and renters are automatically logged. This simulates a real multi-user environment. However, this code is only
    // for unit testing, and comes with no integrations, authentication, persistent storage, nor validation! It is
    // the user's responsibility to ensure proper usage and deployment.

    const input = require("prompt-sync")();
    const clipboardy = (await import('clipboardy')).default;

    let running = true;
    let username = null;

    const library = new Library();

    while(running) {
        if(username === null) {
            username = input({ ask: "Enter account username: "});
            console.log(`Welcome, ${username}!`);
        }
        console.log("=== MENU ===");
        console.log("1. Management: Add Book");
        console.log("2. User: List Available Books");
        console.log("3. User: List All Books");
        console.log("4. User: Find/rent/return a book");
        console.log("5. User: Log out.");
        console.log("6. Management: Export Data");
        console.log("7. Management: Import Data");
        console.log("8. Management: Terminate App.");

        let option = input({ ask: "Select Action: "});
        if(option === "1") {
            let title = input({ ask: "Set title: "});
            let author = input({ ask: "Set author: "});
            let description = input({ ask: "Set description (use empty string for none): "});
            
            if(description === "")description = null;

            let book = new Book(title, author, description);
            if(library.addBook(book)){
                console.log("Book added!");
            } else {
                console.log("Book already exists! Pick another title.")
            }
        } else if(option === "2"){
            library.listAvailableBooks();
        } else if(option === "3"){
            library.listAllBooks();
        } else if(option === "4"){
            const title = input({ ask: "Search title: "});
            const book = library.findBookByTitle(title);

            if(!book){
                console.log("Book not found!");
                continue;
            }

            book.bookDetail();

            console.log("=== MENU ===");
            console.log("1. Rent");
            console.log("2. Return");
            console.log("3. Back");

            const action = input({ ask: "Select action: "});
            if(action === "1") {
                if(library.borrowBook(book.title, username)){
                    console.log("Book rented!");
                } else {
                    console.log("Cannot rent book! It is most likely rented by another person.")
                }
            } else if(action === "2"){
                if(library.returnBook(book.title, username)){
                    console.log("Book returned!");
                } else {
                    console.log("Cannot return book! Did you borrow it? You may need to log in as another user.")
                }
            } else if(action === "3"){
                console.log("Returning to menu.")
            } else {
                console.log("Invalid action! Automatically returning to main menu.")
            }
        } else if(option === "5"){
            console.log(`Bye, ${username}`);
            username = null;
        } else if(option === "6"){
            console.log("Processing Export...");
            const result = library.json;
            console.debug(result);
            clipboardy.writeSync(result);
            console.log(`Export copied to clipboard! For reference, here is the output:\n${result}\nThis is valid JSON, so any whitespaces and editor formatting is fine provided you do not alter the generated structure.`)
        } else if(option === "7"){
            let data = input({ ask: "Enter database (tip: a valid JSON generated by this app, use \"COPY\" without the quotes to auto-paste from clipboard): " });
            if(data === "COPY")data = clipboardy.readSync();
            library.json = data;
            console.log("Import successful!")
        } else if(option === "8") {
            const confirm = input({ ask: "Are you sure you want to terminate? All unsaved data will be lost! Type the letter Y in capital to confirm and anything else to abort: "});
            if(confirm === "Y"){
                console.log("Farewell");
                running = false;
            } else {
                console.log("Whew, another accidental data loss averted!")
            }
        } else {
            console.log("Enter a number from 1-8!");
    }
}
})()