import express from 'express';
import { sendMail } from './index.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

app.post('/send-mail', async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    await sendMail(email, subject, message);
    res.json({ success: true, message: "E-mail envoyé !" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
