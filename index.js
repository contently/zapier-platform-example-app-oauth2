const storySubmitted = require('./triggers/story_submitted');
const pubTrigger = require('./triggers/publication');

// You'll want to set these with either `CLIENT_ID=abc zapier test` or `zapier env 1.0.0 CLIENT_ID abc`
process.env.BASE_URL = process.env.BASE_URL || 'https://auth-json-server.zapier.ninja';
process.env.CLIENT_ID = process.env.CLIENT_ID || '1234';
process.env.CLIENT_SECRET = process.env.CLIENT_SECRET || 'asdf';

const authentication = require('./authentication');

const includeBearerToken = (request, z, bundle) => {
  if (bundle.authData.access_token) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }
  return request;
};

const App = {
  // This is just shorthand to reference the installed dependencies you have. Zapier will
  // need to know these before we can upload
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication: authentication,

  beforeRequest: [
    includeBearerToken
  ],

  afterResponse: [
  ],

  resources: {
  },

  // If you want your trigger to show up, you better include it here!
  triggers: {
    [pubTrigger.key]: pubTrigger,
    [storySubmitted.key]: storySubmitted
  },

  // If you want your searches to show up, you better include it here!
  searches: {
  },

  // If you want your creates to show up, you better include it here!
  creates: {
  }
};

// Finally, export the app.
module.exports = App;
