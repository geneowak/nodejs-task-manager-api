const { Router } = require('express')
const Task = require('../models/task')
const authMiddleware = require('../middleware/auth')
const router = new Router()

router.post('/tasks', authMiddleware, async (req, res) => {
    const task = new Task({ ...req.body, owner: req.user._id });
    try {
        await task.save()
        res.status(201).send({ task })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

router.get('/tasks', authMiddleware, async (req, res) => {
    const { completed, limit, skip, sortBy } = req.query;
    const match = {}
    const sort = {}
    if (completed) {
        match.completed = completed === 'true'
    }
    if (sortBy) {
        const parts = sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        // const tasks = await Task.find({ owner: req.user._id })
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(limit),
                skip: parseInt(skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/tasks/:id', authMiddleware, async (req, res) => {
    const { id: _id } = req.params
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send({ message: 'Task not found.' })
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(422).send("Unknown updates.")
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(400).send({ message: 'Task not found' })
        }

        updates.forEach(update => task[update] = req.body[update])
        await task.save()

        return res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send({ message: "Task not found" })
        }

        res.status(204).send()
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router