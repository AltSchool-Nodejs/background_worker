const emailProcessors = require('./email');

/** Combined map of job name → async (data) => void */
const processors = {
  ...emailProcessors,
};

module.exports = processors;
