import sgMail from '@sendgrid/mail';

import { SENDGRID_API_KEY } from './secrets';

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmailWithSendgrid = async (to, subject, text, html) => {
  const msg = {
    to,
    from: 'ndminh1307@gmail.com',
    subject,
    text,
    html
  };

  await sgMail.send(msg);
};

export const createHTMLTemplate = (title, label, link) => `
  <div>
    <p style="display: block; color: #444; font-size: 14px;">
      ${title}:
    </p>
    <a style="display: block; color: #fff; background-color: #13c2c2; text-decoration: none; font-weight: 600; padding: 10px 20px; text-align: center; border-radius: 5px;" href="${link}">
      ${label}
    </a>
  </div>
`;

export default sendEmailWithSendgrid;
