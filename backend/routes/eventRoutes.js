const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middlewares/auth');
const upload = require('../utils/multer');

router.get('/search',eventController.searchAlgo);
router.post('/', auth, upload.single('image'), eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);
router.patch('/:id', auth, upload.single('image'), eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);
router.post('/:id/attend', auth, eventController.attendEvent);
router.post('/:id/leave', auth, eventController.leaveEvent);


module.exports = router;