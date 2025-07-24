const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const userRoutes = require('./routes/user.routes');

const app = express();
app.use(cors({
  origin: "https://spiffy-cheesecake-238a0d.netlify.app", // ✅ la URL exacta de tu frontend
  credentials: true               // ✅ permite enviar cookies, headers personalizados, etc.
}));
app.use(express.json());
app.use(cookieParser());

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
