const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

// Encriptar password y respuesta antes de guardar
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified('answer')) {
    this.answer = await bcrypt.hash(this.answer, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
