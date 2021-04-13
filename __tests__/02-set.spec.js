import chai from 'chai';
import chaiHttp from 'chai-http';

import Set from '../src/models/set.model';
import server from '../src/server';
const { expect } = chai;

chai.use(chaiHttp);

describe('SETS', function () {
  before(async function () {
    await Set.deleteMany({});
  });

  // Create a new user and sign in before testing set
  describe('POST /v1/users/signup', function () {
    it('should create a new user', async function () {
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
  describe('POST /v1/users/signin', function () {
    it('should sign in with email and password', async function () {
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

  const set = {
    title: 'Business Communication Part 1',
    description: 'English words and phrases for business communication',
    isPublic: true
  };

  // POST /v1/sets
  describe('POST /v1/sets', function () {
    it('should create a new set', async function () {
      const resp = await chai
        .request(server)
        .post('/v1/sets')
        .set({ Authorization: `Bearer ${token}` })
        .send(set);
      expect(resp).to.have.status(201);
      expect(resp.body.data.set.title).to.be.equal(set.title);
      expect(resp.body.data.set.description).to.be.equal(set.description);
      expect(resp.body.data.set.isPublic).to.be.equal(set.isPublic);
      set._id = resp.body.data.set._id;
    });
  });

  // GET /v1/sets/:setId
  describe('GET /v1/sets/:setId', function () {
    it('should response a set that its "isPublic" is true', async function () {
      const resp = await chai.request(server).get(`/v1/sets/${set._id}`);
      expect(resp).to.have.status(200);
    });
  });

  // PUT /v1/sets/:setId
  describe('PUT /v1/sets/:setId', function () {
    it('should response with an updated set', async function () {
      const updatedSet = {
        title: 'Business Communication Updated',
        description: 'Description updated',
        isPublic: false
      };

      const resp = await chai
        .request(server)
        .put(`/v1/sets/${set._id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send(updatedSet);
      expect(resp).to.have.status(200);
      expect(resp.body.data.set.title).to.be.equal(updatedSet.title);
      expect(resp.body.data.set.description).to.be.equal(updatedSet.description);
      expect(resp.body.data.set.isPublic).to.be.equal(updatedSet.isPublic);
    });
  });
});
