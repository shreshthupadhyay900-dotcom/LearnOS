const express = require('express');
const { getMessages, sendMessage, markAsRead, getContacts } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getMessages);
router.post('/', sendMessage);
router.get('/contacts', getContacts);
router.put('/:id/read', markAsRead);

module.exports = router;
