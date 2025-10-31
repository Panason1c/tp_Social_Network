const express = require('express');
const router = express.Router();
const Group = require('../models/group'); 
const User = require('../models/user');   


router.get('/', async (req, res) => {
  try {
    const filter = req.query.name
      ? { name: { $regex: req.query.name, $options: 'i' } } 
      : {};

    const groups = await Group.find(filter)
      .populate('admins', 'name email')  
      .populate('members', 'name email'); 

    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('admins', 'name email')
      .populate('members', 'name email');

    if (!group) return res.status(404).json({ message: 'Groupe non trouvé' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      icon,
      coverPhoto,
      type,
      allowMembersToPost,
      allowMembersToCreateEvents,
      admins,
      members,
    } = req.body;

    // Vérifier la présence du nom obligatoire
    if (!name) return res.status(400).json({ message: 'Le nom du groupe est requis.' });

    // Créer le groupe
    const newGroup = new Group({
      name,
      description,
      icon,
      coverPhoto,
      type,
      allowMembersToPost,
      allowMembersToCreateEvents,
      admins,
      members,
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('admins', 'name email')
      .populate('members', 'name email');

    if (!updatedGroup)
      return res.status(404).json({ message: 'Groupe non trouvé' });

    res.json(updatedGroup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deletedGroup = await Group.findByIdAndDelete(req.params.id);
    if (!deletedGroup)
      return res.status(404).json({ message: 'Groupe non trouvé' });
    res.json({ message: 'Groupe supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/:id/members/:userid', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const user = await User.findById(req.params.userid);

    if (!group) return res.status(404).json({ message: 'Groupe non trouvé' });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });


    if (group.members.includes(user._id))
      return res.status(400).json({ message: 'Utilisateur déjà membre du groupe.' });

    group.members.push(user._id);
    await group.save();

    res.status(200).json({ message: 'Utilisateur ajouté au groupe', group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:id/members/:userid', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Groupe non trouvé' });

    group.members.pull(req.params.userid);
    await group.save();

    res.status(200).json({ message: 'Membre retiré du groupe', group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
