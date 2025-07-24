const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');

// CRUD
router.post('/', userCtrl.createUser);
router.get('/', userCtrl.getAllUsers);
router.get('/:username', userCtrl.getUserByUsername);
router.put('/:username', userCtrl.updateUser);
router.delete('/:username', userCtrl.deleteUser);

// Auth
router.post('/login', userCtrl.loginUser);
router.post("/refresh", userCtrl.refreshToken);

// Recuperación
router.post('/recover/question', userCtrl.getQuestionByUsername);
router.post('/recover/answer', userCtrl.verifyAnswerAndResetPassword);

module.exports = router;
