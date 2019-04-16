const baseUtils = require('./shared/story_utils');

const subscribeHook = (z, bundle) => {
  return baseUtils.subscribe(
    z,
    bundle.targetUrl,
    bundle.authData.api_key,
    "awaiting_review",
    bundle.meta.zap.id
  )
};

const getFallbackRealStory = (z, bundle) => {
  const options = {
    url: '{{process.env.SUBDOMAIN}}/api/v1/sample_story',
    params: {
      include: 'steps'
    }
  };

  return z.request(options)
    .then(response => JSON.parse(response.content))
};

const AwaitingReview = {
  key: 'storyReview',
  noun: 'Story Awaiting Review',
  display: {
    label: 'Story Awaiting Review',
    description: 'Trigger when a story step is awaiting review.'
  },
  operation: {...baseUtils.baseOperation}
};

AwaitingReview.operation.performSubscribe = subscribeHook;
AwaitingReview.operation.performList = getFallbackRealStory;

module.exports = AwaitingReview;
