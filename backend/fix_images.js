require('dotenv').config();
const mongoose = require('mongoose');
const Medicine = require('./models/Medicine');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const meds = await Medicine.find({});
  for (let m of meds) {
    if (m.image && m.image.includes('source.unsplash.com')) {
      const text = encodeURIComponent(m.name.split(' ')[0] || 'Med');
      // Use placehold.co to generate a nice looking placeholder since unsplash source API is dead
      m.image = `https://placehold.co/400x300/007BFF/FFFFFF?text=${text}`;
      await m.save();
    }
  }
  console.log('Replaced all broken Unsplash links!');
  process.exit(0);
}).catch(console.error);