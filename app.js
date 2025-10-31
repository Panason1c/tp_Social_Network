const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const groupRoutes = require('./routes/groupRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.json()); // Obligatoire pour parser le JSON du body

// Connexion MongoDB
mongoose.connect('mongodb+srv://12345:12345@cluster0.9vistoh.mongodb.net/NetworkDB?retryWrites=true&w=majority')
  .then(() => console.log("MongoDB connecté !"))
  .catch(err => console.error(err));

// Routes principales
app.use('/group', groupRoutes);
app.use('/users', userRoutes);
app.use('/groups/:groupId/events', eventRoutes);
app.use('/', postRoutes); // posts peuvent être liés aux événements ou groupes


app.get('/', (req, res) => {
  res.send('network fonctionne !');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));