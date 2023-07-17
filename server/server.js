require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const cors = require("cors");

const app = express();

app.use(express.json());
// app.use(express.static("public"));       // used when all of client side code is hosted on same url as server in the public folder within the server
app.use(
    cors({          // enabling cors to allow client to interact with server
        origin: 'http://localhost:8000' || 'http://127.0.0.1:8000',
    })
);

// store item db
const storeItems = new Map([
    [1, { priceInCents: 99000, name: "PS5" }],
    [2, { priceInCents: 5500, name: "GeneAl Pod" }],
    [3, { priceInCents: 1500, name: "BLVK 35mg Strawberry Mango" }],
]);

// testing stripe api
app.post('/create-checkout-session', async (req, res) => {
    try {
        console.log("checkout session");
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: storeItem.name,
                        },
                        unit_amount: storeItem.priceInCents,
                    },
                    quantity: item.quantity,
                }
            }),
            success_url: `${process.env.CLIENT_URL}/success.html`,
            cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
        })
        // res.json({ url: "Hi" })
        res.json({ url: session.url })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

// api to test if server is functioning
app.get('/api/test', (req, res) => {
    res.send("Test succesful")
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});