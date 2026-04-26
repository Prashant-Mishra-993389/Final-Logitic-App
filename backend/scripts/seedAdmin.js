require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await User.findOne({ role: 'admin' });

  if (exists) {
    console.log('Admin already exists');
    process.exit();
  }

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: '123456',
    phone: '9999999999',
    role: 'admin',
  });

  console.log('Admin created:', admin.email);
  process.exit();
};

seedAdmin();