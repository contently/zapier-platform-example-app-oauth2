# "OAuth2" Example App For Zapier Platform

[![Build Status](https://travis-ci.org/zapier/zapier-platform-example-app-oauth2.svg?branch=master)](https://travis-ci.org/zapier/zapier-platform-example-app-oauth2)

A barebones app that has OAuth2 setup to interact with Contently!

## Overview of Oauth:

Note: We'll be dealing with Oauth2 only

OAuth is a standard that applications can use to provide client applications with “secure delegated access”.

It works over HTTP and authorizes Devices, APIs, Servers and Applications with access tokens rather than credentials

It allows users to use applications like Facebook, Twitter etc. to securely login to other applications and/or access their resources

![Example flow](oauth2flow.png)
source: https://www.youtube.com/watch?v=bzGKgC3N7SY

## Current Oauth2 Flow:

For the official Zapier Oauth2 documentation, visit: https://github.com/zapier/zapier-platform-cli#oauth2

For the WIP Contently branch with models and endpoints:
https://github.com/contently/contently/pull/17030/files

The Zapier app code for authentication can be found in `/authentication.js` and the flow is as follows:

- `authorizeUrl` calls Contently's `/authorize` enpoint, passing various params including:
  -  `state` used by Zapier for verification purposes
  - `redirect_uri` endpoint generated by Zapier

```js 
// ...

module.exports = {
  type: 'oauth2',
  oauth2Config: {
    authorizeUrl: {
      // Contently authorize endpoint, must return `code`
      url: `${process.env.BASE_URL}/oauth2/authorize`,
      params: {
        client_id: '{{process.env.CLIENT_ID}}',
        state: '{{bundle.inputData.state}}',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        response_type: 'code'
      }
    },

// ...
```

- User is directed to Contently's login view, as route is secured

- the `/authorize` controller creates a `TempCode` instance with attributes:
  - `user` the contently user whose credentials were verified by login
  - `code` a string generated on the model instance on save

- After the `TempCode` instance is saved, controller redirects to the Zapier `redirect_uri`, sending back the `code` attribute value and the `state` param

- Zapier app calls the `getAccessToken` function, hitting the `/access_token` endpoint at Contently with params including:
  - `code` the string attribute generated by Contently's `/authorize` controller, automatically saved by Zapier in `bundle.inputData`

```js
const getAccessToken = (z, bundle) => {
  const promise = z.request(`${process.env.BASE_URL}/oauth2/access_token`, {
    method: 'POST',
    body: {
      accountDomain: bundle.cleanedRequest.querystring.accountDomain,
      code: bundle.inputData.code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code'
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  });
// function continues..
```

- The `/access_token` controller finds the `TempCode` instance with matching `code` attribute and creates a `UserIntegration` instance with attributes:
  - `access_token` a NEW string to serve as the permament token
  - `user` the user originally associated with the `TempCode`

- the `TempCode` instance is destroyed and the `access_code` attribute is returned as JSON

- JSON is recieved via `promise` in `getAccessToken` back in Zapier app, which sets the `access_token` in `bundle.authData` (this setting is not explicit, it happens from `access_token` being the final return value of the function)

```js
// see above snippet for beginning of getAccessToken function

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
```

- The `testAuth` function is called immediate after, hitting the `/test_auth` endpoint in Contently. It will validate if there is a `UserIntegration` instance that matches the `access_token` (Note: this is also the function that runs when you click the 'test' button in Zapier)

```js
const testAuth = (z, bundle) => {
  // Normally you want to make a request to an endpoint that is either specifically designed to test auth, or one that
  // every user will have access to, such as an account or profile endpoint like /me.
  const promise = z.request(`${process.env.BASE_URL}/oauth2/test_auth`, {
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
```

You now can use the token in the `SubscribeHook` function for triggers (see `story_submitted.js`) by calling `bundle.authData.access_token`. You will need to pass it to Contently to find the correct `UserIntegration` and create the appropriate webhook.

Woot woot!!!

## Outstanding issues to address (including Contently platform):

- This version of the Zapier CLI app should support multi-pub select as an option, as this is no longer something we would handle on the Integrations page (see `publication.js` for current implementation)
  - A uniqueness validation has to be put on the pub dropdowns, solution TBD
  - pub IDs selected should be passed to `SubscribeHook` so they can be incorporated into `UserIntegration` model

- Zapier CLI App TESTING :P

- `TempCode` and `UserIntegration` models to be re-written(?) Right now they're only one-off models created for proof of concept, can they be folded into existing functionality?

- If `UserIntegration` is kept, it must be able store multiple pub IDs

- Contently controllers `oauth2_controller` and `eligible_pubs`, same issue as ^, can they be re-worked into exsisting controllers?

- Double-check security for all routes

- re-work ZapierWebhook trigger to handle new functionality

- re-work controllers that handle current ZapierWebhooks to ensure they can handle new functionality


## Doorkeeper walkthroughs and documentation:

- https://doorkeeper-provider.herokuapp.com/
- https://github.com/doorkeeper-gem/doorkeeper (Github)
- https://www.sitepoint.com/getting-started-with-doorkeeper-and-oauth-2-0/
- https://jetrockets.pro/blog/protocol-oauth2-let-s-play-with-doorkeeper-omniauth-oauth2
- http://railscasts.com/episodes/353-oauth-with-doorkeeper?autoplay=true (very old, from 2012 but nice overview of doorkeeper)

## Explanation of client ID and secret:
- https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/