const User = require("../model/user");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const { EMAIL, PASSWORD } = require("../env.js");

const jwt = require("jsonwebtoken");
// Importer le module bcrypt pour le hachage des mots de passe
const bcrypt = require("bcryptjs");
const { google } = require("googleapis");

const passwordContoller = {
  //lehna staamalet facke real account bel ethereal.email //mailtrap.io
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      // Vérifier si l'e-mail existe dans la base de données
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "L'utilisateur avec cet e-mail n'existe pas." });
      }

      // Créer un token pour la réinitialisation du mot de passe
      const token = jwt.sign({ userId: user._id }, "your-secret-key", {
        expiresIn: "1h",
      });

      //testing account
      let testAccount = await nodemailer.createTestAccount();
      // Envoyer un e-mail à l'utilisateur avec le lien de réinitialisation de mot de passe
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: "maddison53@ethereal.email",
          pass: "jn7jnAPss4f63QBp6D",
        },
      });

      const resetLink = `http://localhost:3000/resetPassword/${token}`;

      // Envoi de l'e-mail
      const info = await transporter.sendMail({
        from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
        to: email,
        subject: "Réinitialisation de mot de passe",
        html: `
                    <p>Bonjour ${user.firstname},</p>
                    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                    <a href="${resetLink}">Réinitialiser le mot de passe</a>
                    <p>Le lien expirera dans 1 heure.</p>
                `,
      });

      res
        .status(200)
        .json({
          message:
            "Un e-mail de réinitialisation de mot de passe a été envoyé.",
          info: info.messageId,
          preview: nodemailer.getTestMessageUrl(info),
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  },
  //msg l youselni al l'email
  getbill: async (req, res) => {
    const { email } = req.body;

    // Vérifier si l'e-mail existe dans la base de données
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "L'utilisateur avec cet e-mail n'existe pas." });
    }

    // Créer un token pour la réinitialisation du mot de passe
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    let config = {
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      },
    };

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
      theme: {
        color: "#007bff",
        fontFamily: "Arial, sans-serif",
        emailBackground: "#f4f4f4",
        emailFooter: {
          color: "#999999",
          fontSize: "14px",
          lineHeight: "1.5",
          textAlign: "center",
        },
      },
      product: {
        name: "Solution de Suivi pour Personnes en Situation de Handicap ♿",
        link: "http://localhost:4200/#/login",
      },
    });
    const resetLink = `http://localhost:4200/#/reset-Password?token=${token}`;
    let response = {
      body: {
        name: `Chers utilisateurs ${user.firstname}`,
        outro: `<div style="margin-top: 20px;">
                    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                    <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Réinitialiser le mot de passe</a>
                </div>
    
                <p style="margin-top: 20px;">Le lien expirera dans 1 heure.</p>
            `,
      },
    };

    let mail = MailGenerator.generate(response);
    let message = {
      from: EMAIL,
      to: email,
      subject: "Réinitialisation de mot de passe",
      html: mail,
    };

    transporter
      .sendMail(message)
      .then(() => {
        return res.status(201).json({
          msg: "you should receive an email",
        });
      })
      .catch((error) => {
        return res.status(500).json({ error });
      });
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      // Vérifier si le jeton est valide
      jwt.verify(token, "your-secret-key", async (err, decodedToken) => {
        if (err) {
          return res.status(400).json({ message: "Invalid or expired token." });
        }

        // Vérifier si l'utilisateur existe dans la base de données
        const user = await User.findById(decodedToken.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        // Hash du nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe de l'utilisateur
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully." });
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }
  },

};

module.exports = passwordContoller;
