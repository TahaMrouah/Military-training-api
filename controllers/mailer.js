import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Mailgen from "mailgen";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js/",
  },
});
export const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  const email = {
    body: {
      name: username,
      intro: text || "Welcome here!!",
      outro: "Need help? Just reply to this email, we'd love to help",
    },
  };
  var emailBody = MailGenerator.generate(email);
  const message = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: subject || "SignUp Successful!",
    html: emailBody,
  };

  try {
    await transporter.sendMail(message);
    return res.status(200).send({ msg: "You should receive an email from us" });
  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).send({ error: "Error sending email" });
  }
};
