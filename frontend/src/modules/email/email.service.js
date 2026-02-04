async function sendEmail({ to, subject, body}) {
    console.log("Sending Email To:", to);
    console.log("Subject:", subject);
    console.log("Body:", body);

    //Later: replace with Nodemailer / SendGrid
    return true;
}

module.exports = {
    sendEmail
};