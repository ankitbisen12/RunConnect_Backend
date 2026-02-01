import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Runconnect <ankitbisen751@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested to reset your password. Click the button below to set a new password:</p>
      
      <a href="${options.resetURL}" 
         style="
           display: inline-block;
           padding: 10px 20px;
           margin: 10px 0;
           background-color: #4CAF50;
           color: white;
           text-decoration: none;
           border-radius: 5px;
         ">
         Reset Password
      </a>

      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 10 minutes for security reasons.</p>

      <br />
      <p>Thanks,<br/>Runconnect Team</p>
    </div>`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
