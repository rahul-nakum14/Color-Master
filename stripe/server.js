require('dotenv').config();

const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

app.use(express.static('public'));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: 1000, // $10
          product_data: {
            name: 'Design Services',
          },
        },
        quantity: 1,
      }],
      customer_email: 'john@example.com', // Optional
      shipping_address_collection: {
        allowed_countries: ['US', 'IN'],
      },
      success_url: 'http://localhost:4242/success.html',
      cancel_url: 'http://localhost:4242/cancel.html',
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () => console.log('✅ Server running at http://localhost:4242'));

// require('dotenv').config();

// const express = require('express');
// const app = express();
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const path = require('path');

// app.use(express.static('public'));
// app.use(express.json());

// app.post('/create-payment-intent', async (req, res) => {
//   try {
//     const customer = await stripe.customers.create({
//       name: 'John Doe',
//       email: 'john@example.com',
//       address: {
//         line1: '123 Export Street',
//         city: 'New York',
//         postal_code: '10001',
//         country: 'US',
//       },
//     });

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: 1000,
//       currency: 'usd',
//       description: 'Design services - July 2025',
//       customer: customer.id,
//       automatic_payment_methods: {
//         enabled: true,
//       },
//     });

//     res.send({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error("❌ Error creating PaymentIntent:", error.message);
//     res.status(500).send({ error: error.message });
//   }
// });

// app.listen(4242, () => console.log("✅ Server running at http://localhost:4242"));
