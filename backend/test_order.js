require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

async function testOrder() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  try {
    const order = await Order.create({
      customerId: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
      subcategoryId: new mongoose.Types.ObjectId(),
      location: { lat: 28, lng: 77, address: "Test" },
      timeline: [{ status: 'requested', note: 'Order created', by: new mongoose.Types.ObjectId() }]
    });
    console.log('Order created successfully:', order._id);
  } catch (err) {
    console.error('ERROR CREATING ORDER:', err);
  } finally {
    mongoose.disconnect();
  }
}

testOrder();
