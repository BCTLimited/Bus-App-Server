import generateEmail from "./generateEmail.js";
import sendEmail from "./sendEmail.js";

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

export default sendOTPByEmail;
