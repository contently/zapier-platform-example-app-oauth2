const baseUtils = require('./shared/story_utils');

const subscribeHook = (z, bundle) => {
  return baseUtils.subscribe(
    z,
    bundle.targetUrl,
    "story_submitted",
    bundle.meta.zap.id,
    [...new Set(bundle.inputData.publication_ids)]
  )
};

const StorySubmitted = {
  key: 'storySubmit',
  noun: 'Completed Story',
  display: {
    label: 'Story Submitted',
    description: 'Trigger when a stories final step has been submitted.'
  },
  operation: {...baseUtils.baseOperation}
};

StorySubmitted.operation.performSubscribe = subscribeHook;

module.exports = StorySubmitted;
