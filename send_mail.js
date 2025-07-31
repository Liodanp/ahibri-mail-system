require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuration du transporteur mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Route d'envoi de l'email de vérification
app.post('/send-mail', async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ success: false, message: "Email ou token manquant" });
  }

  const verifyUrl = `${process.env.BASE_URL}/re_log/auth/verify_mail.php?token=${encodeURIComponent(token)}`;
  const expiration_minutes = 15;

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification de votre adresse e-mail</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333; }
    .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    h1 { color: #05376a; }
    a.button {
      display: inline-block;
      padding: 12px 20px;
      background-color: #F5F5DC;
      color: #05376a;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }
    .footer { font-size: 12px; color: #888; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>AHIBRI-HTAM</h1>
    <p>Merci de vous être inscrit. Veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous :</p>
    <p><a href="${verifyUrl}" class="button">Vérifier mon e-mail</a></p>
    <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
    <p><code>${verifyUrl}</code></p>
    <p>Ce lien expirera dans ${expiration_minutes} minutes.</p>
    <div class="footer">
      <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.</p>
    </div>
  </div>
</body>
</html>
`;

  try {
    const info = await transporter.sendMail({
      from: `"AHIBRI-HTAM" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Vérification de votre adresse e-mail",
      html: htmlContent
    });

    console.log("✅ Email de vérification envoyé à :", email);
    res.json({ success: true, message: "Email de vérification envoyé", messageId: info.messageId });

  } catch (error) {
    console.error("❌ Erreur d'envoi :", error.message);
    res.status(500).json({ success: false, message: "Erreur lors de l'envoi de l'e-mail" });
  }
});

app.listen(3000, () => {
  console.log("Serveur de vérification mail en ligne sur http://localhost:3000");
});
