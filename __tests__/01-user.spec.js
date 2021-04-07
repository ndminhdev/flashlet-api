import fs from 'fs';
import path from 'path';

import chai from 'chai';
import chaiHttp from 'chai-http';

import User from '../src/models/user.model';
import server from '../src/server';
const { expect } = chai;

chai.use(chaiHttp);

describe('Users', function () {
  before(async function () {
    await User.deleteMany({});
  });

  // POST /v1/users/signup
  describe('POST api/users/signup', function () {
    it('It should create a new user', async function () {
      const user = {
        email: 'ndminhdev@gmail.com',
        name: 'Dang Minh',
        password: '@6991hniM'
      };

      const resp = await chai.request(server).post('/v1/users/signup').send(user);
      expect(resp).to.have.status(201);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.data.user.email).to.be.equal(user.email);
    });
  });

  let token = '';

  // POST /v1/users/signin
  describe('POST api/users/signin', function () {
    it('It should sign in with email and password', async function () {
      const user = {
        email: 'ndminhdev@gmail.com',
        password: '@6991hniM'
      };

      const resp = await chai.request(server).post('/v1/users/signin').send(user);
      expect(resp).to.have.status(200);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.data.token).not.to.be.empty;
      expect(resp.body.data.user.email).to.be.equal(user.email);
      token = resp.body.data.token;
    });
  });

  let resetToken = '';

  // POST /v1/users/password/forgot
  describe('POST api/users/password/forgot', function () {
    it('It should response with a reset password token', async function () {
      const formData = {
        email: 'ndminhdev@gmail.com'
      };

      const resp = await chai.request(server).post('/v1/users/password/forgot').send(formData);
      expect(resp).to.have.status(200);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.data.token).not.to.be.empty;
      resetToken = resp.body.data.token;
    });
  });

  // POST /v1/users/password/reset
  describe('POST api/users/password/reset', function () {
    it('It should return a success message', async function () {
      const formData = {
        password: '@6991hniM',
        password2: '@6991hniM'
      };

      const resp = await chai.request(server).post(`/v1/users/password/reset?token=${resetToken}`).send(formData);
      expect(resp).to.have.status(200);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.message).not.to.be.empty;
    });
  });

  // POST /v1/users/password/change
  describe('POST /v1/users/password/change', function () {
    it('It should return a success message', async function () {
      const formData = {
        oldPassword: '@6991hniM',
        password: '@6991hnim',
        password2: '@6991hnim'
      };

      const resp = await chai.request(server)
        .post('/v1/users/password/change').set({ 'Authorization': `Bearer ${token}` })
        .send(formData);
      expect(resp).to.have.status(200);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.message).not.to.be.empty;
    });
  });

  // PATCH /v1/users/me
  describe('PATCH /v1/users/me', function () {
    it('It should return user profile', async function () {
      const formData = {
        email: 'ndminh1307@gmail.com',
        name: 'Dang Minh Ngo'
      };

      const resp = await chai.request(server)
        .patch('/v1/users/me')
        .set({ 'Authorization': `Bearer ${token}` })
        .field('email', formData.email)
        .field('name', formData.name)
        .attach('profileImage', fs.readFileSync(path.resolve(__dirname, './photo.jpeg')), 'photo.jpeg');

      expect(resp).to.have.status(200);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.data.user.email).to.be.equal(formData.email);
      expect(resp.body.data.user.name).to.be.equal(formData.name);
      expect(resp.body.data.user.profileImage).not.to.be.empty;
    });
  });

  // DELETE /v1/users/me
  describe('DELETE /v1/users/me', function () {
    it('It should return a success message', async function () {
      const resp = await chai.request(server).del('/v1/users/me').set({ 'Authorization': `Bearer ${token}` });

      expect(resp).to.have.status(200);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.message).not.to.be.empty;
    });
  });
});