require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production' // Only allow self-signed certs in dev
  }
});

// Middleware for input validation
const validateInput = (requiredFields) => (req, res, next) => {
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }
  
  next();
};

// Generate secure codes
const generateSecureCode = (bytes = 3) => {
  return crypto.randomBytes(bytes).toString('hex').toUpperCase();
};

// Password reset endpoint
app.post('/send-reset', validateInput(['email', 'userId']), async (req, res) => {
  const { email, userId } = req.body;
  const rawResetKey = generateSecureCode(32);
  const code = generateSecureCode();
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawResetKey}&id=${userId}&code=${code}`;

  try {
    await transporter.sendMail({
      from: `"AHIBRI-HTAM" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: generateResetEmailTemplate(resetLink)
    });

    console.log(`✅ Password reset email sent to ${email}`);
    
    // In a real app, store the reset token and code in your database with an expiration time
    
    res.json({ 
      success: true, 
      message: "Password reset email sent successfully",
      // Remove code in production - only for debugging
      code: process.env.NODE_ENV === 'development' ? code : undefined
    });

  } catch (error) {
    console.error("❌ Send error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send email",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Email verification endpoint
app.post('/send-mail', validateInput(['email', 'token']), async (req, res) => {
  const { email, token } = req.body;
  const verifyUrl = `${process.env.BASE_URL}/re_log/auth/verify_mail.php?token=${encodeURIComponent(token)}`;
  const expiration_minutes = 15;

  try {
    await transporter.sendMail({
      from: `"AHIBRI-HTAM" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Vérification de votre adresse e-mail",
      html: generateVerificationEmailTemplate(verifyUrl, expiration_minutes)
    });

    console.log(`✅ Verification email sent to ${email}`);
    res.json({ success: true, message: "Verification email sent" });

  } catch (error) {
    console.error("❌ Send error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send verification email",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Email template generators
function generateResetEmailTemplate(resetLink) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe</title>
  <style>
    /* Your CSS styles here */
  </style>
</head>
<body>
  <div class="container">
    <h1>AHIBRI-HTAM</h1>
    <h2>Réinitialisation de votre mot de passe</h2>
    <p>Bonjour,</p>
    <p>Vous avez demandé une réinitialisation de mot de passe.</p>
    <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
    <p>Ce lien expirera dans 1 heure.</p>
    <div class="footer">
      <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    </div>
  </div>
</body>
</html>`;
}

function generateVerificationEmailTemplate(verifyUrl, expiration) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification d'email</title>
  <style>
    /* Your CSS styles here */
  </style>
</head>
<body>
  <div class="container">
    <h1>AHIBRI-HTAM</h1>
    <p>Merci de vous être inscrit. Veuillez confirmer votre email :</p>
    <a href="${verifyUrl}" class="button">Vérifier mon email</a>
    <p>Ce lien expirera dans ${expiration} minutes.</p>
  </div>
</body>
</html>`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});