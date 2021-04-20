import fs from 'fs';
import path from 'path';

import chai from 'chai';
import chaiHttp from 'chai-http';

import User from '../src/models/user.model';
import Set from '../src/models/set.model';
import server from '../src/server';
const { expect } = chai;

chai.use(chaiHttp);

describe('SETS', function () {
  before(async function () {
    await Set.deleteMany({});
  });

  after(async function () {
    await User.deleteMany({});
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

  let imageUrl;

  // POST /v1/sets/upload-image
  describe('POST /v1/sets/upload-image', function () {
    it('should response with image url', async function () {
      const resp = await chai
        .request(server)
        .post('/v1/sets/upload-image')
        .set({ Authorization: `Bearer ${token}` })
        .attach('image', fs.readFileSync(path.resolve(__dirname, './photo.jpeg')), 'photo.jpeg');

      expect(resp).to.have.status(201);
      expect(resp.body.data.imageUrl).to.be.a('string');
      imageUrl = resp.body.data.imageUrl;
    });
  });

  const set = {
    title: 'Business Communication Part 1',
    description: 'English words and phrases for business communication',
    isPublic: true,
    cards: [
      {
        term: 'term 1',
        definition: 'definition 1',
        imageUrl
      },
      {
        term: 'term 2',
        definition: 'definition 2',
        imageUrl
      },
      {
        term: 'term 3',
        definition: 'definition 3',
        imageUrl
      },
      {
        term: 'term 4',
        definition: 'definition 4',
        imageUrl
      }
    ]
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

  // GET /v1/sets/subject/:keyword
  describe('GET /v1/sets/subject/:keyword', function () {
    it('should response with sets matching subject', async function () {
      const resp = await chai.request(server).get('/v1/sets/subject/business');
      expect(resp).to.have.status(200);
      expect(resp.body.data.hasNextPage).to.be.a('boolean');
      expect(resp.body.data.setsCount).to.be.a('number');
      expect(resp.body.data.sets).to.be.a('array');
    });
  });

  // GET /v1/sets
  describe('GET /v1/sets', function () {
    it("should response with user's own sets", async function () {
      const resp = await chai
        .request(server)
        .get('/v1/sets')
        .set({ Authorization: `Bearer ${token}` });
      expect(resp).to.have.status(200);
      expect(resp.body.data.hasNextPage).to.be.a('boolean');
      expect(resp.body.data.setsCount).to.be.a('number');
      expect(resp.body.data.sets).to.be.a('array');
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
        isPublic: false,
        cards: [
          {
            term: 'term 1 updated',
            definition: 'definition 1 updated',
            imageUrl:
              'https://dictionary.cambridge.org/vi/images/thumb/dog_noun_001_04904.jpg?version=5.0.161'
          },
          {
            term: 'term 2',
            definition: 'definition 2 updated',
            imageUrl:
              'https://dictionary.cambridge.org/vi/images/thumb/dog_noun_001_04904.jpg?version=5.0.161'
          },
          {
            term: 'term 3 updated',
            definition: 'definition 3',
            imageUrl:
              'https://dictionary.cambridge.org/vi/images/thumb/dog_noun_001_04904.jpg?version=5.0.161'
          },
          {
            term: 'term 4',
            definition: 'definition 4 updated',
            imageUrl:
              'https://dictionary.cambridge.org/vi/images/thumb/dog_noun_001_04904.jpg?version=5.0.161'
          }
        ]
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
