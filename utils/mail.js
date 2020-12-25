const dotenv = require("dotenv");
const API_KEY = process.env.MAILGUN_KEY;
const DOMAIN = process.env.DOMAIN;
const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });

function loginNotification(username, ip, time, email) {
  const data = {
    from: "Security <support@andreiswebpage.engineer.com>",
    to: email,
    subject: "Login from a new location",
    html: `<h1>New Login notification</h1>
          <p>Hello ${username} You have logged in from a new ip address ${ip} at ${time}, If this was not you can safely ignore this email otherwise reset your password.</p>
      
      `,
  };
  mailgun.messages().send(data, (error, body) => {
    console.log(body);
  });
}

module.exports = loginNotification;
