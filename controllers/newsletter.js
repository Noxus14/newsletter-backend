const { response } = require('express');
const { pool } = require('../database/config');
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendNewsletter = async (req, res = response) => {

    const { category, fromUser, toUser, subject, text, html } = req.body;
    const client = await pool.connect();
    const message = {
        from: fromUser,
        to: toUser,
        subject: subject,
        text: text,
        html: html
    };

    try{
           
    pool.query('INSERT INTO newslettersubs (category, from_user, to_user, subject, text_body, html) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [category, fromUser, toUser, subject, text, html], async(error, results) =>{
            if (error) {
                throw error;
            }

            await client.query('INSERT INTO user_to_newsletter(id_user, id_newslettersubs) VALUES($1, $2)', [req.id, results.rows[0].id])
            const transporter = nodemailer.createTransport({
                host: `${process.env.SMTP_HOST}`,
                port: `${process.env.SMTP_PORT}`,
                secure: `${process.env.SMTP_SECURITY}`,
                auth: {
                    user: `${process.env.SMTP_USER}`,
                    pass: `${process.env.SMTP_SECRET_GMAIL}`
                }
            });

            transporter.sendMail(message, (error) => {
                if (error) {
                    return;
                } 
            });
        

            return res.status(201).send(`Email enviado a ${ toUser }`);
        });
    }catch(error){
        return res.status(500).json({
            msg: 'Go with the admin'
        });
    }

}

const listUserNewsletter = async (req, res = response) => {
    const client = await pool.connect();

    try {
        const newsletterList = await client.query(`SELECT name, email, issubcribe FROM users WHERE issubcribe != ${false}`);
    
        return res.status(200).json(newsletterList.rows);
    }catch( error){
        return res.status(500).json({
            msg: 'Go with the admin'
        });
    }
   
} 

module.exports = {
    sendNewsletter, 
    listUserNewsletter
}