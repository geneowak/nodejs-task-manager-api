const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = ({ email, name }) => {
    return sgMail.send({
        to: email,
        from: 'app@watsina.io',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}.\nLet me know how you get along with the app.`
    })
}

const sendCancellationEmail = ({ email, name }) => {
    return sgMail.send({
        to: email,
        from: 'app@watsina.io',
        subject: 'Sad to see you leave :(',
        text: `We are sorry to see you leave ${name}. How could we have served you better?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}