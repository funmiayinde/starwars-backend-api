import chai from 'chai';
import supertest from 'supertest';
import { after, before, beforeEach, describe } from 'mocha';
import app from '../../../src/app';
import { COMMENT_URL, MOVIES_CHARACTER, MOVIES } from '../routes';
import { CREATED, OK } from '../../../src/utils/codes';
import { getCommentsPayload } from '../../_seeds/comment.seeds';

const should = chai.should();
// const expect = chai.expect;
let server: any;

describe('Set For Comment Test', () => {
  before(async () => {
    server = supertest(await app);
  });

  
  describe('Comment GET Endpoint Test /movies', () => {
    it('Should successfully fetch to movies ', async () => {
      const response = await server
        .get(`${MOVIES}`)
        .expect('Content-type', 'application/json; charset=utf-8')
        .expect(OK);

      console.log('response:', response.body.should);

      response.body.should.be.instanceOf(Object);
      response.body.should.have.property('_meta');
      response.body._meta.should.have.property('status_code');
      response.body._meta.should.have.property('pagination');
      response.body.should.have.property('data');
      response.body.data.should.be.instanceOf(Array);
    });
  });
});
