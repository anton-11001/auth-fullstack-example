const nodemailer = require("nodemailer");

const sendActivationEmail = async (to, link) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: `Verify your ${process.env.APP_NAME} account`,
    text: "",
    html: `
      <div>
        <h1>To activate your account, click the link below:</h1>
        <a href="${link}">${link}</a>
      </div>
    `,
  });
};

module.exports = sendActivationEmail;
