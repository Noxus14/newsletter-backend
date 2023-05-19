const { response } = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../database/config');
const { generateJWT } = require('../helpers/jwt');
const User = require('../models/User');

const createUser = async (req, res = response) => {

    const { idRole, name, email, password } = req.body;

    try{
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if( result.rowCount >= 1 ) {
            return res.status(400).json({
                msg: 'The user already exist'
            });
        }

        const user = new User();
        const salt = bcrypt.genSaltSync();

        user.idRole = idRole;
        user.name = name;
        user.email = email;
        user.password = bcrypt.hashSync( password, salt );
    
        pool.query('INSERT INTO users (id_role, name, email, password, issubcribe) VALUES ($1, $2, $3, $4, $5) RETURNING *', [user.idRole, user.name,  user.email,  user.password, false], (error, results) =>{
            if (error) {
                throw error;
            }
            return res.status(201).send(`User added with ID: ${results.rows[0].id}`);
        });

    }catch (error) {
        return res.status(500).json({
            msg: 'Go with the admin'
        });
    }
    
}


const loginUser = async (req, res = response) => {

    const { email, password } = req.body;
    
    try{

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    if( result.rowCount === 0 ) {
        return res.status(404).json({
            msg: 'User no found'
        });
    }

    const user = new User();

    user.id = result.rows[result.rowCount-1].id;
    user.idRole = result.rows[result.rowCount-1].id_role;
    user.name = result.rows[result.rowCount-1].name;
    user.password = result.rows[result.rowCount-1].password;

    const validPassword = bcrypt.compareSync( password, user.password );

    if ( !validPassword ) {
        return res.status(400).json({
            msg: 'Password incorrect'
        });
    }

    const token = await generateJWT( user.id , user.idRole );

    
    return res.status(200).json({
        id: user.id ,
        displayName: user.name,
        token
    })


    }catch (error){
        console.log(error);
        return res.status(500).json({
            msg: 'Go with the admin'
        });
    }
}

const createSubcription = async (req, res = response) => {
    const { idRole, name, email } = req.body;

    try{
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if( result.rowCount >= 1 ) {
            return res.status(400).json({
                msg: 'Ya estas en la subcripción'
            });
        }

        const user = new User();
        user.idRole = idRole;
        user.name = name;
        user.email = email;

        pool.query('INSERT INTO users (id_role, name, email, password, issubcribe) VALUES ($1, $2, $3, $4, $5) RETURNING *', [user.idRole, user.name,  user.email,  null, true], (error, results) =>{
            if (error) {
                throw error;
            }
            return res.status(201).send(`User added with email: ${results.rows[0].email}`);
        });

    }catch(error) {
        return res.status(500).json({
            msg: 'Go with the admin'
        });
    }
}


module.exports = {
    createUser,
    createSubcription,
    loginUser
}