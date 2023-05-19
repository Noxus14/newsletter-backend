const  { Router } = require('express');
const { sendNewsletter, listUserNewsletter } = require('../controllers/newsletter');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();
router.use( validateJWT );
router.post('/send', sendNewsletter);
router.get('/listUserNewsLetter', listUserNewsletter)

module.exports = router;