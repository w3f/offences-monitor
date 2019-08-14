const promClient = require('prom-client');

const startCollection = () => {
  console.log('Starting the collection of metrics, the metrics are available on /metrics');
  promClient.collectDefaultMetrics();
}

const injectMetricsRoute = (app) => {
  app.get('/metrics', (_, res) => {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
  });
}

const babeEquivocations = new promClient.Counter({
  name: 'babe_equivocations',
  help: 'The number of babe equivocations and when.'
});

const grandpaEquivocations = new promClient.Counter({
  name: 'grandpa_equivocations',
  help: 'The number of grandpa equivocations and when.'
});

const unresponsivenessReports = new promClient.Counter({
  name: 'unresponsiveness_report',
  help: 'The number of unresponsiveness reports and when.'
});

module.exports = {
  startCollection,
  injectMetricsRoute,
  babeEquivocations,
  grandpaEquivocations,
  unresponsiveness,
};
