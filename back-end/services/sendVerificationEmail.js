const nodemailer = require("nodemailer");
const fs = require("fs/promises");
const path = require("path");

const templatePath = path.join(__dirname, "../html/verify-email-message.html");

const renderTemplate = async (variables) => {
  const template = await fs.readFile(templatePath, "utf8");

  return Object.entries(variables).reduce((html, [key, value]) => {
    return html.replace(new RegExp(`{{${key}}}`, "g"), value);
  }, template);
};

const sendVerificationEmail = async (to, link) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const appName = process.env.APP_NAME;

  const html = await renderTemplate({
    APP_NAME: appName,
    VERIFY_LINK: link,
    CURRENT_YEAR: new Date().getFullYear().toString(),
  });

  return await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: `Verify your ${appName} account`,
    html,
  });
};

module.exports = sendVerificationEmail;
