import nodemailer from 'nodemailer';

interface VerificationMailOptions {
  link: string;
  to: string;
}

var transport = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_TEST_USER,
    pass: process.env.MAILTRAP_TEST_PASS,
  },
});

const mail = {
  async sendVerificationMail(options: VerificationMailOptions) {
    await transport.sendMail({
      to: options.to,
      from: process.env.VERIFICATION_MAIL,
      subject: 'Link para loguearse en Letras Viajeras',
      html: `
      <div>
      <p>Por Favor, haz click <a href="${options.link}">en este link</a> para loguearte en tu cuenta.</p>
      </div>
      `,
    });
  },
};

export default mail;
