# 📧 SendMail - Service Node.js pour envoi d'e-mails sécurisés

SendMail est une API légère et sécurisée permettant d’envoyer des e-mails de **vérification** et de **réinitialisation de mot de passe**, pensée pour être utilisée par des applications web externes, notamment des sites en PHP.

---

## 🚀 Fonctionnalités

- ✅ Envoi d’e-mail de **vérification** avec lien de confirmation
- 🔐 Génération de lien sécurisé pour **réinitialisation de mot de passe**
- 🛡️ Sécurisé avec **token unique**, gestion d’expiration, et **Nodemailer**
- ⚙️ Compatible avec les sites PHP via requêtes HTTP POST
- 🧪 Mode développement avec affichage du code de vérification

---

## 🔧 Configuration

```env
# Configuration SMTP pour l’envoi d’e-mails
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your@email.com
SMTP_PASS=your_password

# Clé secrète pour générer les tokens
TOKEN_SECRET=some_long_random_string

# URL de base de ton application
APP_URL=https://ton-site.com
```

## 📦 Installation

```bash
git clone https://github.com/Liodanp/ahibri-mail-system.git
cd ahibri-mail-system
npm install
