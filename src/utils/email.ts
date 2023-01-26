import nodemailer from "nodemailer"
import pug from "pug"
import  {htmlToText}  from "html-to-text"


export class Email{
    to: string
    firstName: string
    url: string
    from: string
    constructor(user:any[],url:string){
        this.to = user[0].email
        this.firstName = user[0].full_name.split(' ')[0]
        this.url = url,
        this.from = "kunal Usapakar<k@gmail.com>"
    }
    

    newTransport(){
        if(process.env.NODE_ENV === "PRODUCTION"){
            // sendgrid config
        }
        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:parseInt(process.env.EMAIL_PORT),
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
        })
    }

    
    async send(template:any,subject:string){
        // 1) Render base on templates
            const html = pug.renderFile(`${__dirname}/../views/${template}.pug`,{
                firstName: this.firstName,
                url: this.url,
                subject
            })
        // 2) define emailoptions
        const mailOptions = {
            from:this.from,
            to:this.to,
            subject,
            html,
            text:htmlToText(html, {
                wordwrap: 130
            })
        }

        // 3) create transport send email
        
        await this.newTransport().sendMail(mailOptions)

    }

    async sendWelcome(){
        await this.send('welcome','Welcome to the family')
    }

    async userConfirmation(){
        await this.send('user_confirmation','Please confirm your email first to join our family')
    }
    
    async sendResetPasswordLink(){
        await this.send('reset_password','Reset Password Link')
    }
} 

// export const sendEmail = async (options: { email: string; subject: string; message: string }) =>{
//     // Create a transporter
//     // const transporter = nodemailer.createTransport({
//     //     host:process.env.EMAIL_HOST,
//     //     port:parseInt(process.env.EMAIL_PORT),
//     //     auth:{
//     //         user:process.env.EMAIL_USERNAME,
//     //         pass:process.env.EMAIL_PASSWORD
//     //     }
//     // })

//     // Define the email options
//     // const mailOptions = {
//     //     from:'Kunal Usapkar <hello@kunal.com>',
//     //     to:options.email,
//     //     subject:options.subject,
//     //     text:options.message
//     //     // html:
//     // }


//     // Actually send the email
//     await transporter.sendMail(mailOptions)
// }

