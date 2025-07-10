const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/user.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB Atlas');
   app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

  })
  .catch(err => console.error('Error de conexión:', err));
