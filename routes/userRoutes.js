const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const { body, validationResult } = require("express-validator");


router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post(
  '/',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
  ],
  async (req, res) => {
    // Vérification des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      // Vérifier que l'email n'est pas déjà utilisé
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser)
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);



router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, 
      runValidators: true, 
    });
    if (!updatedUser)
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
