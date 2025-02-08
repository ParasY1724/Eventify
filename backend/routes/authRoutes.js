const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../utils/multer');
const auth = require('../middlewares/auth');

router.post('/register', upload.single('avatar'), authController.register);
router.post('/login', authController.login);
router.get('/user',auth,authController.getUser);
router.put('/user', auth, upload.single('avatar'), authController.updateUser);

module.exports = router;