const baseSubscribeHook = (z, targetUrl, apiKey, eventType, zapID) => {
  // targetUrl has the Hook URL this app should call when a story is submitted.
  const data = {
    url: targetUrl,
    api_key: apiKey,
    event_type: eventType,
    zap_id: zapID
  };

  const options = {
    url: '{{process.env.SUBDOMAIN}}/api/v1/zapier_hooks',
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

  const options = {
    url: `{{process.env.SUBDOMAIN}}/api/v1/zapier_hooks/${contently_zapier_webhook_id}`,
    headers: {
      'Content-type': 'application/json'
    },
    method: 'DELETE'
  };

  // You may return a promise or a normal data structure from any perform method.
  return z.request(options)
    .then((response) => JSON.parse(response.content));
};

const getStory = (z, bundle) => {
  return [bundle.cleanedRequest];
};

const getFallbackRealStory = (z, bundle) => {
  const options = {
    url: '{{process.env.SUBDOMAIN}}/api/v1/sample_story',
  };

  return z.request(options)
    .then(response => JSON.parse(response.content))
};

module.exports = {
  baseOperation: {
    inputFields: [
      {
        key: 'customize_publication_selection',
        type: 'boolean',
        helpText: 'Allow me select which publications I want this zap to activate for (by deault all publications you are staffed on will be included in this zap)',
        altersDynamicFields: true
      },
      function(z, bundle) {
        if (bundle.inputData.customize_publication_selection === 'true') {
          return [
            { key: 'publication_id', label:'Publications', dynamic: 'publication.id.name', list: true },
          ];
        }
        return [];
      }
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
