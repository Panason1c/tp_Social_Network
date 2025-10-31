const express = require('express');
const router = express.Router({ mergeParams: true });
const { body, validationResult } = require('express-validator');
const Post = require('../models/post');
const Event = require('../models/event');
const Group = require('../models/group');
const User = require('../models/user');

router.get('/events/:eventId/posts', async (req, res) => {
  try {
    const posts = await Post.find({ event: req.params.eventId })
      .populate('author', 'name email')
      .populate('comments.author', 'name email');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/groups/:groupId/posts', async (req, res) => {
  try {
    const posts = await Post.find({ group: req.params.groupId })
      .populate('author', 'name email')
      .populate('comments.author', 'name email');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post(
  '/events/:eventId/posts',
  [body('content').notEmpty().withMessage('Le contenu est requis'), body('author').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const event = await Event.findById(req.params.eventId);
      if (!event) return res.status(404).json({ message: 'Événement non trouvé' });

      const post = new Post({ ...req.body, event: event._id });
      await post.save();
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


router.post(
  '/groups/:groupId/posts',
  [body('content').notEmpty().withMessage('Le contenu est requis'), body('author').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const group = await Group.findById(req.params.groupId);
      if (!group) return res.status(404).json({ message: 'Groupe non trouvé' });

      const post = new Post({ ...req.body, group: group._id });
      await post.save();
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


router.put('/:postId', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.postId, req.body, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ message: 'Post non trouvé' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete('/:postId', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post non trouvé' });
    res.json({ message: 'Post supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post(
  '/:postId/comments',
  [body('content').notEmpty(), body('author').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: 'Post non trouvé' });

      post.comments.push({ content: req.body.content, author: req.body.author });
      await post.save();
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
