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
    subject: `Jenkins ${actionName} failed for ${project}:${build}`,
    html: `
      <p>Could not process ${actionName} request for ${project}:${build}</p>
      <p>Please visit: 
      <a href="https://jenkins.joshsoftware.com/job/${project}/${build}/input/">https://jenkins.joshsoftware.com/job/${project}/${build}/input/</a>    
      to approve/deny the build.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendAlreadyDoneEmail(email, action, build, project) {
  let actionName = 'process request';

  if (action === 'proceed') {
    actionName = 'approved';
  }

  if (action === 'abort') {
    actionName = 'denied';
  }

  // Create the email message
  const mailOptions = {
    from: EMAIL_ID,
    to: email,
    subject: `Jenkins ${project}:${build} already ${actionName}`,
    text: `Build ${build} of ${project} was already ${actionName}`,
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
