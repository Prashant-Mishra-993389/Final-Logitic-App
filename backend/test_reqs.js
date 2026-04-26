const mongoose = require('mongoose');
const RequirementFieldTemplate = require('./models/RequirementFieldTemplate');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const reqs = await RequirementFieldTemplate.find();
  console.log('Requirements found:', reqs.length);
  if (reqs.length > 0) {
    console.log(JSON.stringify(reqs, null, 2));
  }
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
