import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: process.env.BREVO_EMAIL,
      pass: process.env.BREVO_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "Dev@gmail.com",
    to: to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);

  return info;
};

// Generate Email With Mail Gen
const generateEmail = (intro, name, otp) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "Bus Booking App",
      link: "https://mailgen.js/",
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });

  const email = {
    body: {
      name: name,
      intro: intro,
      action: {
        instructions:
          "Please use the verification code below to continue in the App",
        button: {
          color: "#22BC66", // Optional action button color
          text: `${otp}`,
          //   link: "https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010",
        },
      },
      outro: "If you didn't request this, you can ignore this email.",
    },
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  return { emailBody, emailText };
};

// Function to send OTP by email
const sendOTPByEmail = async (email, userName, otp) => {
  const subject = "OTP Request";
  const intro =
    "You received this email because you registered on Bus Booking App";
  const { emailBody, emailText } = generateEmail(intro, userName, otp);
  return sendEmail({
    to: email,
    subject,
    text: emailText,
    html: emailBody,
  });
};

export default { sendEmail, generateEmail, sendOTPByEmail };
