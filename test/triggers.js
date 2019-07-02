require('should');

const zapier = require('zapier-platform-core');
const nock = require('nock');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('triggers', () => {
  beforeEach(() => {
    process.env.BASE_URL = 'https://example.test';
  });
  afterEach(() => {
    delete process.env.BASE_URL;
  });

  describe('story submitted trigger', () => {
    it('should load story from fake hook', (done) => {
      const bundle = {
        cleanedRequest: {
          title: 'dodgers win'
        }
      };

      appTester(App.triggers.storySubmit.operation.perform, bundle)
        .then(results => {
          results.length.should.eql(1);

          const firstStory = results[0];
          firstStory.title.should.eql('dodgers win');
          done();
        })
        .catch(done);
    });

    it('should hit sample story endpoint and return results', (done) => {
      const response = [{title: 'giants win'}];
      // The access-token is included in beforeRequest function
      nock('https://example.test')
      .get('/api/v1/sample_story')
      .reply(200, response)

      const bundle = {
        meta: {
          frontend: true
        },
        authData: {
          access_token: 'a_token'
        }
      };

      appTester(App.triggers.storySubmit.operation.performList, bundle)
        .then(results => {
          results.length.should.eql(1);

          const firstStory = results[0];
          firstStory.title.should.eql('giants win');

          done();
        })
        .catch(done);
    });

    it('should hit subscribe endpoint', (done) => {
      const response = {message: 'success'};
      nock('https://example.test')
      .post('/api/v1/zapier_hooks',
        {
          url: 'http://foo.bar',
          access_token: 'a_token',
          event_type: 'story_submitted',
          zap_id: 'zap_id',
          publication_ids: [1, 2, 3]
        }
      )
      .reply(200, response)

      const bundle = {
        targetUrl: 'http://foo.bar',
        authData: {
          access_token: 'a_token'
        },
        inputData: {
          publication_ids: [1, 2, 3]
        },
        meta: {
          zap: {
            id: "zap_id"
          }
        }
      };

      appTester(App.triggers.storySubmit.operation.performSubscribe, bundle)
        .then(result => {
          result.should.eql({message: 'success'});
          done();
        })
        .catch(done);
    });

  //   it('should hit unsubscribe endpoint', (done) => {
  //     const response = {message: 'success'};
  //     nock('https://example.test',
  //       {
  //         reqheaders: {
  //           'contently-api-key': 'abc123'
  //         }
  //       }
  //     )
  //     .delete('/api/v1/zapier_hooks/1')
  //     .reply(200, response)

  //     const bundle = {
  //       subscribeData: {
  //         id: 1
  //       },
  //       authData: {
  //         api_key: 'abc123'
  //       }
  //     };

  //     appTester(App.triggers.storySubmit.operation.performUnsubscribe, bundle)
  //       .then(result => {
  //         result.should.eql({message: 'success'});
  //         done();
  //       })
  //       .catch(done);
  //   });
  // });

  // describe('awaiting review trigger', () => {
  //   it('should load story from fake hook', (done) => {
  //     const bundle = {
  //       cleanedRequest: {
  //         title: 'dodgers win'
  //       }
  //     };

  //     appTester(App.triggers.storyReview.operation.perform, bundle)
  //       .then(results => {
  //         results.length.should.eql(1);

  //         const firstStory = results[0];
  //         firstStory.title.should.eql('dodgers win');
  //         done();
  //       })
  //       .catch(done);
  //   });

  //   it('should hit sample story endpoint with param and return results', (done) => {
  //     const response = [{title: 'giants win'}];
  //     nock('https://example.test',
  //       {
  //         reqheaders: {
  //           'contently-api-key': 'abc123'
  //         }
  //       }
  //     )
  //     .get('/api/v1/sample_story?include=steps')
  //     .reply(200, response)

  //     const bundle = {
  //       meta: {
  //         frontend: true
  //       },
  //       authData: {
  //         api_key: 'abc123'
  //       }
  //     };

  //     appTester(App.triggers.storyReview.operation.performList, bundle)
  //       .then(results => {
  //         results.length.should.eql(1);

  //         const firstStory = results[0];
  //         firstStory.title.should.eql('giants win');

  //         done();
  //       })
  //       .catch(done);
  //   });

  //   it('should hit subscribe endpoint', (done) => {
  //     const response = {message: 'success'};
  //     nock('https://example.test',
  //       {
  //         reqheaders: {
  //           'contently-api-key': '123abc'
  //         }
  //       }
  //     )
  //     .post('/api/v1/zapier_hooks',
  //       {
  //         url: 'http://foo.bar',
  //         api_key: '123abc',
  //         event_type: 'awaiting_review',
  //         zap_id: "zap_id"
  //       }
  //     )
  //     .reply(200, response)

  //     const bundle = {
  //       targetUrl: 'http://foo.bar',
  //       authData: {
  //         api_key: '123abc'
  //       },
  //       meta: {
  //         zap: {
  //           id: "zap_id"
  //         }
  //       }
  //     };

  //     appTester(App.triggers.storyReview.operation.performSubscribe, bundle)
  //       .then(result => {
  //         result.should.eql({message: 'success'});
  //         done();
  //       })
  //       .catch(done);
  //   });

  //   it('should hit unsubscribe endpoint', (done) => {
  //     const response = {message: 'success'};
  //     nock('https://example.test',
  //       {
  //         reqheaders: {
  //           'contently-api-key': 'abc123'
  //         }
  //       }
  //     )
  //     .delete('/api/v1/zapier_hooks/1')
  //     .reply(200, response)

  //     const bundle = {
  //       subscribeData: {
  //         id: 1
  //       },
  //       authData: {
  //         api_key: 'abc123'
  //       }
  //     };

  //     appTester(App.triggers.storyReview.operation.performUnsubscribe, bundle)
  //       .then(result => {
  //         result.should.eql({message: 'success'});
  //         done();
  //       })
  //       .catch(done);
  //   });
  });
});
