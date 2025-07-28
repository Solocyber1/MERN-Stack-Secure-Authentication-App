const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  console.log("SMTP config =>", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
});

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT == 465, // true only for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const emailOptions = {
    from: `NodeAuth <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(emailOptions);
    console.log("Email sent: ", info.messageId);
  } catch (err) {
    console.error("Error sending email: ", err);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
