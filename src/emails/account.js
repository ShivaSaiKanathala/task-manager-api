const sgMail = require('@sendgrid/mail')



sgMail.setApiKey(process.env.SENDGRID_API_KEY)



const sendWelcomeEmail = (email, name)=>{
    sgMail.send({
        to:email,
        from:'shiva.kanathala@gmail.com',
        subject:'Welcome to task app',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`        
    })
}

const sendCancelEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'shiva.kanathala@gmail.com',
        subject:'Good bye',
        text: `Hai ${name}. Is there anything we could have done better ${email} send us a reply  `  
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}