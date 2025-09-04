// This is your secure backend serverless function.
// It will run on Vercel's servers, not in the user's browser.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // We only want to handle POST requests to this endpoint.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Create a new Checkout Session with Stripe.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      // These are the URLs Stripe will redirect to after payment.
      // Make sure to use your real domain.
      success_url: `https://esperia.live/#shop?success=true`,
      cancel_url: `https://esperia.live/#shop?canceled=true`,
    });

    // Send the session URL back to the frontend.
    res.status(200).json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
