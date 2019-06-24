const getAccessToken = (z, bundle) => {
  const promise = z.request(`${process.env.BASE_URL}/oauth/token`, {
    method: 'POST',
    params: {
      // accountDomain: bundle.cleanedRequest.querystring.accountDomain,
      code: bundle.inputData.code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      state: bundle.inputData.state,
      redirect_uri: bundle.inputData.redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  });

  // Needs to return at minimum, `access_token`, and if your app also does refresh, then `refresh_token` too
  return promise.then((response) => {
    if (response.status !== 200) {
      throw new Error('Unable to fetch access token: ' + response.content);
    }

    const result = JSON.parse(response.content);
    return {
      access_token: result.access_token
    };
  });
};


const testAuth = (z, bundle) => {
  // Normally you want to make a request to an endpoint that is either specifically designed to test auth, or one that
  // every user will have access to, such as an account or profile endpoint like /me.
  const promise = z.request(`${process.env.BASE_URL}/api/v1/zapier_resources/me`, {
    method: 'GET',
    params: {
      access_token: bundle.authData.access_token
    }
  });

  // This method can return any truthy value to indicate the credentials are valid.
  // Raise an error to show
  return promise.then((response) => {
    if (response.status === 401) {
      throw new Error('The access token you supplied is not valid');
    }
    return z.JSON.parse(response.content);
  });
};

module.exports = {
  type: 'oauth2',
  oauth2Config: {
    authorizeUrl: {
      // Contently authorize endpoint, must return `code`
      url: `${process.env.BASE_URL}/oauth/authorize`,
      params: {
        client_id: '{{process.env.CLIENT_ID}}',
        client_secret: '{{process.env.CLIENT_SECRET}}',
        state: '{{bundle.inputData.state}}',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        response_type: 'code'
      }
    },
    // Step 2 of the OAuth flow; Exchange a code for an access token.
    // This could also use the request shorthand.
    getAccessToken: getAccessToken,
    autoRefresh: false
  },
  // The test method allows Zapier to verify that the access token is valid. We'll execute this
  // method after the OAuth flow is complete to ensure everything is setup properly.
  test: testAuth,
  // assuming "username" is a key returned from the test
  connectionLabel: '{{username}}'
};
