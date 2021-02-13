const { Router } = require('express');
const User = require('../models/user')
const authMiddleware = require('../middleware/auth')
const { sendWelcomeEmail } = require('../emails/account')

const router = new Router()

router.post('/auth/register', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save()
        sendWelcomeEmail(user)

        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()

        res.send({ user, token })
    } catch (e) {
        res.status(401).send({ message: e.message })
    }
})

router.post('/auth/logout', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()

        res.send({ message: 'Successfully logged out' })
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

router.post('/auth/logoutAll', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save()

        res.send({ messsage: "Successfully logged out of all sessions." })
    } catch (e) {
        res.status(500).send({ message: e.message })
    }
})

module.exports = router;