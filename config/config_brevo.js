const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Ganesh Idol Booking" <santoshbhaskal2127@gmail.com>`, // Use verified sender
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

module.exports = sendEmail;
