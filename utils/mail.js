const dotenv = require("dotenv");
const API_KEY = process.env.MAILGUN_KEY;
const DOMAIN = process.env.DOMAIN;
const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });
const supportEmail = process.env.SUPPORT_EMAIL;

exports.loginNotification = (username, ip, time, email) => {
  const data = {
    from: `Security <${supportEmail}>`,
    to: email,
    subject: "Login from a new location",
    html: `<h1>New Login notification</h1>
          <p>Hello ${username} You have logged in from a new ip address ${ip} at ${time}, If this was not you can safely ignore this email otherwise reset your password.</p>
      
      `,
  };
  mailgun.messages().send(data, (error, body) => {
    console.log(body);
  });
};

exports.passwordResetEmail = (username, email, link) => {
  const data = {
    from: `Account management <${supportEmail}>`,
    to: email,
    subject: "Password reset request",
    html: `
      <h1>
        Password Reset request
      </h1>
      <p>
        Hello ${username} this is your password reset request. It will expire in 10 minutes.
        ${link}
      </p>
    `,
  };
  mailgun.messages().send(data, (error, body) => {
    console.log(body);
  });
};

exports.passwordResetNotification = (username, time, email) => {
  const data = {
    from: `Account management <${supportEmail}>`,
    to: email,
    subject: "Password succesfully changed",
    html: `
      <h1> Your password has been changed </h1>
      <p>
        Hello ${username}, Your password was succesfully reset at ${time}.
      </p>
    
    `,
  };
};
