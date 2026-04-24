import nodemailer from "nodemailer";

interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  smtp: SmtpConfig;
}

export async function sendEmail({ to, subject, html, smtp }: SendEmailOptions) {
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
  });

  await transporter.sendMail({
    from: smtp.username,
    to,
    subject,
    html,
  });
}
