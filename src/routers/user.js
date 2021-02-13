const { Router } = require('express');
const multer = require('multer');
const sharp = require('sharp');
const authMiddleware = require('../middleware/auth');
const User = require('../models/user');
const { sendCancellationEmail } = require('../emails/account')

const router = new Router()

router.get('/auth/user', authMiddleware, async (req, res) => {
    await req.user.populate('tasks').execPopulate()
    res.send(req.user)
})

router.patch('/auth/user', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates." })
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save();

        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/auth/user', authMiddleware, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user)

        res.status(204).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image.'))
        }
        cb(null, true)
    }
})

router.post('/auth/user/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send({ message: "Avatar was uploaded successfully" })
}, (error, req, res, next) => {
    res.status(400).send({ message: error.message })
})

router.delete('/auth/user/avatar', authMiddleware, async (req, res) => {
    req.user.avatar = undefined;
    try {
        await req.user.save()

        res.status(204).send()
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send({ "message": "Avatar not found" })
    }
})


module.exports = router;