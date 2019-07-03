const baseSubscribeHook = (z, targetUrl, eventType, zapID, pubIds) => {
  // targetUrl has the Hook URL this app should call when a story is submitted.
  const data = {
    url: targetUrl,
    event_type: eventType,
    zap_id: zapID,
    publication_ids: pubIds
  };

  const options = {
    url: '{{process.env.BASE_URL}}/api/v1/zapier_hooks',
    headers: {
      'Content-type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  };

  return z.request(options)
    .then((response) => {
      return JSON.parse(response.content)
    });
};

const unsubscribeHook = (z, bundle) => {
  const contently_zapier_webhook_id = bundle.subscribeData.id;
  const data = {
    access_token: bundle.authData.access_token
  }
  const options = {
    url: `{{process.env.BASE_URL}}/api/v1/zapier_hooks/${contently_zapier_webhook_id}`,
    headers: {
      'Content-type': 'application/json'
    },
    method: 'DELETE',
    body: JSON.stringify(data)
  };

  // You may return a promise or a normal data structure from any perform method.
  return z.request(options)
    .then((response) => JSON.parse(response.content));
};

const getStory = (z, bundle) => {
  return [bundle.cleanedRequest];
};

const getFallbackRealStory = (z) => {
  const options = {
    url: '{{process.env.BASE_URL}}/api/v1/sample_story',
  };

  return z.request(options)
    .then(response => JSON.parse(response.content))
};

module.exports = {
  baseOperation: {
    inputFields: [
      { key: 'publication_ids', label:'Publications', dynamic: 'publication.id.name', list: true },
    ],
    type: 'hook',
    performUnsubscribe: unsubscribeHook,
    perform: getStory,
    performList: getFallbackRealStory,

    outputFields: [
      {key: 'publication_id', label: 'Publication ID'}
    ]
  },
  subscribe: baseSubscribeHook,
};
