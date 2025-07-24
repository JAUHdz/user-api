const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


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
  const secretKey = process.env.CRYPTO_SECRET; // clave para cifrar

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const data = JSON.stringify({ name: user.username });

    const iv = crypto.randomBytes(16);


    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv); // iv debe ser fijo o guardado
let encrypted = cipher.update(data, 'utf8', 'hex');
encrypted += cipher.final('hex');

    // 🔑 Access Token (1 minuto)
    const token = jwt.sign(
      {  data: encrypted },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1m'  // ⏱️ Cambiado a 1 minuto
      }
    );

    // 🔄 Refresh Token (5 minutos)
    const refreshToken = jwt.sign(
      { name: user.username },
      process.env.JWT_SECRET2,
      {
        algorithm: 'HS256',
        expiresIn: '5m'  // ⏱️ Cambiado a 5 minutos
      }
    );

    // 🍪 Guardar el refreshToken en una cookie HttpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // ✅ En local pon esto en false si no usas HTTPS
      sameSite: 'None',
      maxAge: 5 * 60 * 1000 // ⏱️ 5 minutos en milisegundos (para testing)
    });

    // Enviar el accessToken al frontend
    res.json({ message: 'Login exitoso', token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;

  console.log("Token recibido en la cookie:", token); // ✅ para depurar

  // ✅ Validación básica
  if (!token) return res.status(401).json({ error: "No hay token de refresco" });

  try {
    // ✅ Verifica el token con la CLAVE correcta del refresh
    const decoded = jwt.verify(token, process.env.JWT_SECRET2); // ⛔ antes usabas REFRESH_SECRET, asegúrate de usar la misma que en el login

    // ✅ Generar nuevo accessToken
    const newAccessToken = jwt.sign(
      { name: decoded.name },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1m' // mantenemos igual que el original
      }
    );

    // ✅ Devuelve el nuevo token
    return res.json({ token: newAccessToken });

  } catch (err) {
    console.error("Refresh token inválido", err);
    return res.status(403).json({ error: "Token inválido o expirado" });
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
