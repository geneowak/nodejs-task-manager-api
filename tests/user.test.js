const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user');
const { userOneId, userOneToken, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should get profile for user', async () => {
    await request(app)
        .get('/auth/user')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/auth/user')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/auth/user')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send()
        .expect(204)

    const user = await User.findById(userOneId)

    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/auth/user')
        .send()
        .expect(401)

    const user = await User.findById(userOneId)

    expect(user).toBeDefined()
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/auth/user/avatar')
        .set('Authorization', `Bearer ${userOneToken}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/auth/user')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({
            name: 'His Majesty',
            email: 'king@kingdom.io'
        })
        .expect(200)

    const updatedUser = await User.findById(userOneId)
    expect(updatedUser).toMatchObject({
        name: 'His Majesty',
        email: 'king@kingdom.io'
    })
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/auth/user')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({
            location: "some awesome place"
        })
        .expect(400)

})