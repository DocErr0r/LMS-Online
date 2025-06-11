import nodemailer, { Transporter } from 'nodemailer';
import 'dotenv/config';
import ejs from 'ejs';

interface emailinterface {
    user: string;
    subject: string;
    data: { [key: string]: any };
    template: string;
}

const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const SendMail = async ({ user, subject, data,template }: emailinterface): Promise<void> => {
    const html = await ejs.renderFile(`./src/Templates/${template}`, data);
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: user,
        subject: subject,
        html: html,
    };
    await transporter.sendMail(mailOptions);
};
