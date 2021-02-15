const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
    userOneId,
    userOneToken,
    taskOne,
    userTwoToken,
    setupDatabase,
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({
            description: 'Greet your neighbour'
        })
        .expect(201)

    const { task } = response.body

    const dbTask = await Task.findById(task._id)
    expect(dbTask).toBeDefined()
    expect(dbTask).toMatchObject({
        description: 'Greet your neighbour',
        completed: false,
        owner: userOneId
    })
})

test('Should get the correct tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(2)
})

test('User should not be able to delete tasks they dont own', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwoToken}`)
        .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks