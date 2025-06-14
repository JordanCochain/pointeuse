const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔐 VAPID keys (remplace par les tiennes)
const publicVapidKey = 'BLLm1M5a6mbosdP6muqeRZEgfLO_freUQz7klFcyiTtRGRLRxUtvlyxS6gxx6Knl324mu6kaL9wiv2WWTYUMcxE';
const privateVapidKey = 'M_CT-4zo0ioDjRS13DWhupxCHyJgJn3DuMPe_ZW1QYQ';

webpush.setVapidDetails(
  'mailto:tonemail@example.com',
  publicVapidKey,
  privateVapidKey
);

// 🗂 Stockage temporaire des abonnements (à remplacer par BDD si besoin)
let subscriptions = [];

// ✅ Route pour s’abonner aux notifications
app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  subscriptions.push(subscription);
  res.status(201).json({ message: 'Abonnement enregistré.' });
});

// ✅ Route pour envoyer une notif test à tous les abonnés
app.post('/send', (req, res) => {
  const payload = JSON.stringify({
    title: req.body.title || "Rappel",
    body: req.body.message || "Vous avez un événement à venir."
  });

  let sent = 0;
  let failed = 0;

  subscriptions.forEach((sub, index) => {
    webpush.sendNotification(sub, payload)
      .then(() => {
        console.log("✅ Notification envoyée à :", sub.endpoint);
        sent++;
      })
      .catch(err => {
        console.error("❌ Erreur d'envoi à :", sub.endpoint, "\n", err);
        subscriptions.splice(index, 1); // Supprime le mauvais abonné
        failed++;
      });
  });

  res.status(200).json({
    message: `Notifications envoyées. OK: ${sent}, Échecs: ${failed}`
  });
});
// 🚀 Lancement serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur notifications démarré sur http://localhost:${port}`);
});
