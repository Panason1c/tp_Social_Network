const express = require('express');
const router = express.Router({ mergeParams: true }); 
const { body, validationResult } = require('express-validator');
const Event = require('../models/event');
const Group = require('../models/group');
const User = require('../models/user');


router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ group: req.params.groupId })
      .populate('organizers', 'name email')
      .populate('participants', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:eventId', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, group: req.params.groupId })
      .populate('organizers', 'name email')
      .populate('participants', 'name email');
    if (!event) return res.status(404).json({ message: 'Événement non trouvé' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('startDate').notEmpty().withMessage('Date de début requise'),
    body('endDate').notEmpty().withMessage('Date de fin requise')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const group = await Group.findById(req.params.groupId);
      if (!group) return res.status(404).json({ message: 'Groupe non trouvé' });

      const event = new Event({ ...req.body, group: group._id });
      await event.save();
      res.status(201).json(event);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


router.put('/:eventId', async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.eventId, group: req.params.groupId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: 'Événement non trouvé' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete('/:eventId', async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.eventId, group: req.params.groupId });
    if (!event) return res.status(404).json({ message: 'Événement non trouvé' });
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/:eventId/participants/:userid', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, group: req.params.groupId });
    const user = await User.findById(req.params.userid);
    if (!event) return res.status(404).json({ message: 'Événement non trouvé' });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (!event.participants.includes(user._id)) event.participants.push(user._id);
    await event.save();

    res.json({ message: 'Participant ajouté', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:eventId/participants/:userid', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, group: req.params.groupId });
    if (!event) return res.status(404).json({ message: 'Événement non trouvé' });

    event.participants.pull(req.params.userid);
    await event.save();

    res.json({ message: 'Participant retiré', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
