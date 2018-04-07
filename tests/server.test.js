'use strict';

const server = require('../server.js');

require('dotenv').config();

const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const SERVER_URL = 'http://localhost:' + PORT;
const SIGNUP_URL = SERVER_URL + '/api/signup';
const SIGNIN_URL = SERVER_URL + '/api/signin';

describe('All Auth Tests', () => {
  beforeAll(server.start);
  afterAll(server.stop);

  describe('Media Sunny Day Requests', () => {

    it('should return 200 for a get request for all media resources', done => {
      //sign Up
      let signUpUrl = `http://localhost:${process.env.PORT}/api/signup`;
      let signUpBody = {
        username: `randomUserTest${Math.random()}`,
        password: `randomPasswordTest${Math.random()}`,
        email: `${Math.random()}@email.com`
      };
      console.log('signing up');
      superagent.post(signUpUrl)
        .send(signUpBody)
        .end((err, res) => {
          console.log('signed up');
          if (err) {
            console.log('sign up error:', err);
          }

          let userId = res.body._id;
          //Sign In
          let signInUrl = `http://localhost:${process.env.PORT}/api/signin`;
          console.log('signing in');
          superagent.get(signInUrl)
            .auth(signUpBody.username, signUpBody.password)
            .end((err, res) => {
              console.log('signed in');
              let token = res.body.token;
              let mediaLocation = './uploads/kidMusic.png';
              let newMedia = {
                title: `Test Title: ${Math.random()}`,
                description: `Test Description: ${Math.random()}`,
                category: `Test Category: ${Math.random()}`,
                type: `Test Type: ${Math.random()}`,
                userId: userId,
                public: false
              };
              // post new media
              let requestUrl = `http://localhost:${process.env.PORT}/api/media`;
              console.log('posting');
              superagent.post(requestUrl)
                .field('title', newMedia.title)
                .field('description', newMedia.description)
                .field('category', newMedia.category)
                .field('type', newMedia.type)
                .field('userId', userId)
                .set('Authorization', 'Bearer ' + token)
                .attach('media', mediaLocation)
                .end((err, res) => {
                  console.log('posted');
                  let getUrl = `http://localhost:${process.env.PORT}/api/media`;
                  superagent.get(getUrl)
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                      console.log('finished bearer auth');
                      console.log('err', err);
                      console.log('res', res.body);
                      let isAnArray = Array.isArray(res.body);
                      expect(isAnArray).toBe(true);
                      done();
                    });
                });
            });
        });
    });

    it('should return 200 for a get request for one media resource', done => {
      //sign Up
      let signUpUrl = `http://localhost:${process.env.PORT}/api/signup`;
      let signUpBody = {
        username: `randomUserTest${Math.random()}`,
        password: `randomPasswordTest${Math.random()}`,
        email: `${Math.random()}@email.com`
      };
      console.log('signing up');
      superagent.post(signUpUrl)
        .send(signUpBody)
        .end((err, res) => {
          console.log('signed up');
          if (err) {
            console.log('sign up error:', err);
          }

          let userId = res.body._id;
          //Sign In
          let signInUrl = `http://localhost:${process.env.PORT}/api/signin`;
          console.log('signing in');
          superagent.get(signInUrl)
            .auth(signUpBody.username, signUpBody.password)
            .end((err, res) => {
              console.log('signed in');
              let token = res.body.token;
              let mediaLocation = './uploads/kidMusic.png';
              let newMedia = {
                title: `Test Title: ${Math.random()}`,
                description: `Test Description: ${Math.random()}`,
                category: `Test Category: ${Math.random()}`,
                type: `Test Type: ${Math.random()}`,
                userId: userId,
                public: false
              };
              // post new media
              let requestUrl = `http://localhost:${process.env.PORT}/api/media`;
              console.log('posting');
              superagent.post(requestUrl)
                .field('title', newMedia.title)
                .field('description', newMedia.description)
                .field('category', newMedia.category)
                .field('type', newMedia.type)
                .field('userId', userId)
                .set('Authorization', 'Bearer ' + token)
                .attach('media', mediaLocation)
                .end((err, res) => {
                  console.log('posted');
                  let amazonUrl = res.body.mediaUrl;
                  let getUrl = `http://localhost:${process.env.PORT}/api/media?id=${res.body._id}`;
                  superagent.get(getUrl)
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                      console.log('finished bearer auth');
                      console.log('err', err);
                      console.log('res', res.body);
                      let fetchedAmazonUrl = res.body.mediaUrl;
                      expect(fetchedAmazonUrl).toBe(amazonUrl);
                      expect(res.status).toBe(200);
                      done();
                    });
                });
            });
        });
    });

    it('should return 200 for uploading a media resource and include proper AWS url', done => {
      //sign Up
      let signUpUrl = `http://localhost:${process.env.PORT}/api/signup`;
      let signUpBody = {
        username: `randomUserTest${Math.random()}`,
        password: `randomPasswordTest${Math.random()}`,
        email: `${Math.random()}@email.com`
      };
      superagent.post(signUpUrl)
        .auth(signUpBody.username, signUpBody.password)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(signUpBody))
        .end((err, res) => {
          let userId = res.body._id;
          //Sign In
          let signInUrl = `http://localhost:${process.env.PORT}/api/signin`;
          superagent.get(signInUrl)
            .auth(signUpBody.username, signUpBody.password)
            .end((err, res) => {
              let token = res.body.token;
              let mediaLocation = './uploads/kidMusic.png';
              let newMedia = {
                title: `Test Title: ${Math.random()}`,
                description: `Test Description: ${Math.random()}`,
                category: `Test Category: ${Math.random()}`,
                type: `Test Type: ${Math.random()}`,
                userId: userId,
                public: false
              };
              // post new media
              let uploadUrl = `http://localhost:${process.env.PORT}/api/media`;
              superagent.post(uploadUrl)
                .field('title', newMedia.title)
                .field('description', newMedia.description)
                .field('category', newMedia.category)
                .field('type', newMedia.type)
                .field('userId', userId)
                .set('Authorization', 'Bearer ' + token)
                .attach('media', mediaLocation)
                .end((err, res) => {
                  let amazonUrl = 'amazonaws.com';
                  let isAmazonUrl = res.body.mediaUrl.includes(amazonUrl);
                  expect(isAmazonUrl).toBe(true);
                  expect(res.status).toBe(200);
                  done();
                });
            });
        });
    });

  });

  //make sure that test are testing data lines and functions vs response's
  //
  function getUserParams() {
    return {
      username: `bill${Math.random()}`,
      email: `bill${Math.random()}@microsoft.com`,
      password: 'windows95'
    };
  };

  describe('/api/signup', () => {
    it('should return status 400 if missing username', (done) => {
      let params = getUserParams();
      delete params['username'];

      superagent.post(SIGNUP_URL)
        .set('Content-Type', 'application/json')
        .send(params)
        .catch(err => {
          expect(err.status).toEqual(400);
          done();
        });
    });

    it('should return status 400 if missing email', (done) => {
      let params = getUserParams();
      delete params['email'];

      superagent.post(SIGNUP_URL)
        .set('Content-Type', 'application/json')
        .send(params)
        .catch(err => {
          expect(err.status).toEqual(400);
          done();
        });
    });

    it('should return status 400 if missing password', (done) => {
      let params = getUserParams();
      delete params['password'];

      superagent.post(SIGNUP_URL)
        .set('Content-Type', 'application/json')
        .send(params)
        .catch(err => {
          expect(err.status).toEqual(400);
          done();
        });
    });

    it('should return status 200 with successful request', (done) => {
      let params = getUserParams();

      superagent.post(SIGNUP_URL)
        .auth(params.username, params.password)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(params))
        .then(res => {
          expect(res.status).toEqual(200);
          done();
        });
    });
  });

  describe('/api/signin', () => {
    it('should return 401 unauthorized if password is incorrect', (done) => {
      let params = getUserParams();

      superagent.post(SIGNUP_URL)
        .set('Content-Type', 'application/json')
        .send(params)
        .then(res => {
          expect(res.status).toEqual(200);

          // intentionally set the password as a wrong password
          let payload = params['username'] + ':' + 'wrongpassword';
          let encoded = btoa(payload);

          return superagent.get(SIGNIN_URL)
            .set('Authorization', 'Basic ' + encoded);
        })
        .catch(err => {
          expect(err.status).toEqual(401);
          done();
        });
    });

    it('should return 200 if username and password are', (done) => {
      let params = getUserParams();

      superagent.post(SIGNUP_URL)
        .set('Content-Type', 'application/json')
        .send(params)
        .then(res => {
          expect(res.status).toEqual(200);

          let payload = params['username'] + ':' + params['password'];
          let encoded = btoa(payload);

          return superagent.get(SIGNIN_URL)
            .set('Authorization', 'Basic ' + encoded);
        })
        .then(res => {
          expect(res.status).toEqual(200);
          done();
        });
    });
  });

});