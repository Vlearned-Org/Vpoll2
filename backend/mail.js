const nodemailer = require("nodemailer")

const transporter =  nodemailer.createTransport({
    host:"mail.vpoll.com.my",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      // type: 'login',
      user: "mailer@vpoll.com.my",
      pass: "seUzcPEqokf8bt9"
    },
     tls: {
       rejectUnauthorized: false
   },
  logger: true,
  debug: true
  });

transporter.sendMail({
    from: "mailer@vpoll.com.my",
    to: "low@getnada.com",
    subject: "Test email",
    text: "Hello World"
})
