/* eslint-disable no-undef */
const ejs = require('ejs');
const path = require('path');

const nodemailer = require('nodemailer');

const sendEmail = async ({ viewFileName, data, to, subject }) => {
  try {
    const transport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const templatePath = path.join(
      __dirname,
      '/../views',
      `${viewFileName}.ejs`
    );
    const dataString = await ejs.renderFile(templatePath, data);
    const info = await transport.sendMail({
      from: process.env.EMAIL_USERNAME,
      to, // list of receivers
      subject, // Subject line
      html: dataString, // html body
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = sendEmail;
