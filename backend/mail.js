const nodemailer = require("nodemailer")

const transporter =  nodemailer.createTransport({
    host:"smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      // type: 'login',
      user: "vpollsupport@aismartuallearning.com",
      pass: "vpgr betd twcc vvwz"
    },
     tls: {
       rejectUnauthorized: false
   },
  logger: true,
  debug: true
  });

transporter.sendMail({
    from: "vpollsupport@aismartuallearning.com",
    to: "anzobnjmn@gmail.com",
    subject: "Test email",
    text: "Hello World"
})
