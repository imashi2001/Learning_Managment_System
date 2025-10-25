import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendMail = async (to, subject, text) => {
  await transporter.sendMail({
    from: '"LMS System" <no-reply@lms.com>',
    to,
    subject,
    text,
  });
};
