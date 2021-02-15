const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app)
        .post('/auth/register')
        .send({
            name: "Owak",
            email: "geneowak@watsina.io",
            password: 'Hello21#'
        })
        .expect(201)

    const { user, token } = response.body;
    const dbUser = await User.findById(user._id)
    expect(dbUser).not.toBeNull()

    expect(dbUser).toMatchObject({
        name: "Owak",
        email: "geneowak@watsina.io",
    })
    expect(user.password).not.toBe('Hello21#')
    expect(token).toBe(dbUser.tokens[0].token)
})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/auth/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)

    const { token } = response.body;
    const user = await User.findById(userOneId);

    expect(user.tokens[1].token).toBe(token)
})

test('Should not login nonexistent user', async () => {
    await request(app)
        .post('/auth/login')
        .send({
            email: 'hacker@tech.io',
            password: 'password23'
        })
        .expect(401)
})

//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated
