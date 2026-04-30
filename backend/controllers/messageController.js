const Message = require('../models/Message');
const User = require('../models/User');

// @desc  Get conversation between current user and another user
// @route GET /api/messages?with=userId
const getMessages = async (req, res, next) => {
  try {
    const { with: otherId } = req.query;

    const query = otherId
      ? {
          $or: [
            { sender: req.user._id, receiver: otherId },
            { sender: otherId, receiver: req.user._id }
          ]
        }
      : { $or: [{ sender: req.user._id }, { receiver: req.user._id }] };

    const messages = await Message.find(query)
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .sort({ createdAt: 1 });

    // Auto-mark as read
    if (otherId) {
      await Message.updateMany(
        { sender: otherId, receiver: req.user._id, isRead: false },
        { isRead: true }
      );
    }

    res.json({ success: true, messages });
  } catch (error) { next(error); }
};

// @desc  Send a message
// @route POST /api/messages
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, subject, relatedTo, referenceId } = req.body;
    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'receiverId and content are required' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
      subject: subject || 'General',
      relatedTo: relatedTo || 'general',
      referenceId
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role');

    res.status(201).json({ success: true, message: populated });
  } catch (error) { next(error); }
};

// @desc  Mark message as read
// @route PUT /api/messages/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, receiver: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, message });
  } catch (error) { next(error); }
};

// @desc  Get contacts + unread counts per contact
// @route GET /api/messages/contacts
const getContacts = async (req, res, next) => {
  try {
    const roleToFind = req.user.role === 'student' ? 'teacher' : 'student';
    const contacts = await User.find({ role: roleToFind }).select('name avatar role email');

    // Get unread counts per contact
    const unreadCounts = await Message.aggregate([
      { $match: { receiver: req.user._id, isRead: false } },
      { $group: { _id: '$sender', count: { $sum: 1 } } }
    ]);
    const unreadMap = {};
    unreadCounts.forEach(u => { unreadMap[u._id.toString()] = u.count; });

    // Get latest message per contact
    const latestMessages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', req.user._id] }, '$receiver', '$sender']
          },
          lastMessage: { $first: '$content' },
          lastTime: { $first: '$createdAt' }
        }
      }
    ]);
    const latestMap = {};
    latestMessages.forEach(m => { latestMap[m._id.toString()] = { lastMessage: m.lastMessage, lastTime: m.lastTime }; });

    const enriched = contacts.map(c => ({
      ...c.toObject(),
      unread: unreadMap[c._id.toString()] || 0,
      lastMessage: latestMap[c._id.toString()]?.lastMessage || null,
      lastTime: latestMap[c._id.toString()]?.lastTime || null
    }));

    res.json({ success: true, contacts: enriched });
  } catch (error) { next(error); }
};

module.exports = { getMessages, sendMessage, markAsRead, getContacts };
