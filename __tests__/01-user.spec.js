import fs from 'fs';
import path from 'path';

import chai from 'chai';
import chaiHttp from 'chai-http';

import User from '../src/models/user.model';
import server from '../src/server';
const { expect } = chai;

chai.use(chaiHttp);

describe('USERS', function () {
  before(async function () {
    await User.deleteMany({});
  });

  after(async function () {
    await User.deleteMany({});
  });

  const user = {
    email: 'ndminhdev@gmail.com',
    name: 'Dang Minh',
    password: '@6991hniM'
  };

  // POST /v1/users/signup
  describe('POST /v1/users/signup', function () {
    it('should create a new user', async function () {
      const resp = await chai.request(server).post('/v1/users/signup').send(user);
      expect(resp).to.have.status(201);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.data.user.email).to.be.equal(user.email);
    });
  });

  let token = '';

  // POST /v1/users/signin
  describe('POST /v1/users/signin', function () {
    const { email, password } = user;
    it('should sign in with email and password', async function () {
      const resp = await chai.request(server).post('/v1/users/signin').send({
        email,
        password
      });
      expect(resp).to.have.status(200);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.data.token).not.to.be.empty;
      expect(resp.body.data.user.email).to.be.equal(user.email);
      token = resp.body.data.token;
      user.username = resp.body.data.user.username;
    });
  });

  // DEL /v1/users/signout
  describe('DEL /v1/users/signout', function () {
    it('should signed out', async function () {
      const resp = await chai
        .request(server)
        .del('/v1/users/signout')
        .set({ Authorization: `Bearer ${token}` });
      expect(resp).to.have.status(200);
    });
  });

  // DEL /v1/users/signout/all
  describe('DEL /v1/users/signout/all', function () {
    it('should signed out from all devices', async function () {
      const resp = await chai
        .request(server)
        .del('/v1/users/signout/all')
        .set({ Authorization: `Bearer ${token}` });
      expect(resp).to.have.status(200);
    });
  });

  // GET /v1/users/:username
  describe('GET /v1/users/:username', function () {
    it('should response with user profile and his/her own public sets', async function () {
      const resp = await chai.request(server).get(`/v1/users/${user.username}`);
      expect(resp).to.have.status(200);
      expect(resp.body.data.user.email).to.be.equal(user.email);
      expect(resp.body.data.user.username).to.be.equal(user.username);
      expect(resp.body.data.sets).to.be.a('array');
    });
  });

  let resetToken = '';

  // POST /v1/users/password/forgot
  describe('POST /v1/users/password/forgot', function () {
    it('should response with a reset password token', async function () {
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
  describe('POST /v1/users/password/reset', function () {
    it('should return a success message', async function () {
      const formData = {
        password: '@6991hniM',
        password2: '@6991hniM'
      };

      const resp = await chai
        .request(server)
        .post(`/v1/users/password/reset?token=${resetToken}`)
        .send(formData);
      expect(resp).to.have.status(200);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.message).not.to.be.empty;
    });
  });

  // POST /v1/users/password/change
  describe('POST /v1/users/password/change', function () {
    it('should return a success message', async function () {
      const formData = {
        oldPassword: '@6991hniM',
        password: '@6991hnim',
        password2: '@6991hnim'
      };

      const resp = await chai
        .request(server)
        .post('/v1/users/password/change')
        .set({ Authorization: `Bearer ${token}` })
        .send(formData);
      expect(resp).to.have.status(200);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.message).not.to.be.empty;
    });
  });

  // PATCH /v1/users/me
  describe('PATCH /v1/users/me', function () {
    it('should return user profile', async function () {
      const formData = {
        email: 'ndminh1307@gmail.com',
        name: 'Dang Minh Ngo'
      };

      const resp = await chai
        .request(server)
        .patch('/v1/users/me')
        .set({ Authorization: `Bearer ${token}` })
        .field('email', formData.email)
        .field('name', formData.name)
        .attach(
          'profileImage',
          fs.readFileSync(path.resolve(__dirname, './photo.jpeg')),
          'photo.jpeg'
        );

      expect(resp).to.have.status(200);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.data.user.email).to.be.equal(formData.email);
      expect(resp.body.data.user.name).to.be.equal(formData.name);
      expect(resp.body.data.user.profileImage).not.to.be.empty;
    });
  });

  // DELETE /v1/users/me
  describe('DELETE /v1/users/me', function () {
    it('should return a success message', async function () {
      const resp = await chai
        .request(server)
        .del('/v1/users/me')
        .set({ Authorization: `Bearer ${token}` });

      expect(resp).to.have.status(200);
      expect(resp.body.message).to.be.a('string');
      expect(resp.body.message).not.to.be.empty;
    });
  });
});
