import nodemailer from 'nodemailer';

import {EMAIL_ID, EMAIL_PASSWORD} from './constant.js';

//======================================

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_ID,
    pass: EMAIL_PASSWORD,
  },
});

export async function sendEmail(email, action, build, project) {
  let actionName = 'process request';

  if (action === 'proceed') {
    actionName = 'approval';
  }

  if (action === 'abort') {
    actionName = 'denial';
  }

  // Create the email message
  const mailOptions = {
    from: EMAIL_ID,
    to: email,
    subject: `Jenkins ${actionName} failed for ${build}:${project}`,
    text: `Could not process ${actionName} request for #${build}: ${project}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

//======================================

export function toBase64(str) {
  return Buffer.from(str).toString('base64');
}
