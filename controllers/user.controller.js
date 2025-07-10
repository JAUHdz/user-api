const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Crear usuario
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'Usuario creado', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -answer'); // no mostrar datos sensibles
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener usuario por nombre
exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -answer');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//login
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

    res.json({ message: 'Login exitoso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//recuperar/ pregunta
exports.getQuestionByUsername = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ question: user.question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//verificar respuesta y cambiar contraseña
exports.verifyAnswerAndResetPassword = async (req, res) => {
  const { username, answer, newPassword } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(answer, user.answer);
    if (!isMatch) return res.status(401).json({ error: 'Respuesta incorrecta' });

    user.password = newPassword; // será encriptada automáticamente
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//actualizar usuario

exports.updateUser = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Actualiza campos solo si se proporcionan
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.question) {
      user.question = req.body.question;
    }
    if (req.body.answer) {
      user.answer = req.body.answer;
    }

    await user.save();
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
