const promClient = require('prom-client');
const { register } = promClient;

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
  name: 'offences_monitor_babe_equivocations_total',
  help: 'The number of babe equivocations and when.'
});

const grandpaEquivocations = new promClient.Counter({
  name: 'offences_monitor_grandpa_equivocations_total',
  help: 'The number of grandpa equivocations and when.'
});

const unresponsivenessReports = new promClient.Counter({
  name: 'offences_monitor_unresponsiveness_report_total',
  help: 'The number of unresponsiveness reports and when.'
});

module.exports = {
  startCollection,
  injectMetricsRoute,
  babeEquivocations,
  grandpaEquivocations,
  unresponsivenessReports,
};
