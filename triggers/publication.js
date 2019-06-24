const sample = require('./sample_pub_list');

const triggerPublication = (z, bundle) => {
  const options = {
    url: '{{process.env.BASE_URL}}/api/v1/zapier_resources/eligible_pubs',
    headers: {
      'Content-type': 'application/json'
    },
    params: {
      access_token: bundle.authData.access_token
    }
  };

  return z.request(options)
    .then(response => JSON.parse(response.content));
};

module.exports = {
  key: 'publication',
  noun: 'Publication',

  display: {
    label: 'Get Publication',
    hidden: true,
    description: 'The only purpose of this trigger is to populate the dropdown list of pubs in the UI, thus, it\'s hidden.'
  },

  operation: {
    inputFields: [

    ],
    perform: triggerPublication,
    sample: sample
  }
};