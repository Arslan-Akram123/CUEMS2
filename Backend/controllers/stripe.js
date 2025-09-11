const paymentSchema = require('../models/payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(req, res) {
     console.log("Creating payment intent with body:", req.body);
      try {
       
    const { amount, currency,metadata } = req.body;
    console.log("Amount:", amount, "Currency:", currency, "Metadata:", metadata);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, 
      currency: currency || 'usd',
      description:metadata.eventName
    });

    
     res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAllPayments(req,res){
  try{
    const getallpayments=await paymentSchema.find().populate('user').populate('event').sort({ createdAt: -1 });
   
        res.status(200).json(getallpayments);
  }catch(error){
     res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createPaymentIntent,getAllPayments
};