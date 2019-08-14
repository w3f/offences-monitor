const { ApiPromise, WsProvider } = require('@polkadot/api');
const express = require('express');
const prom = require('./promClient');

const Offences = {
  BabeEquivocation: 'babe:equivocatio',
  GrandpaEquivocation: 'grandpa:equivoca',
  Unresponsiveness: 'im-online:offlin',
}

const Report = {};

/// Express
const app = express();
const port = 5555;

/// Polkadot API Endpoint
const LocalEndpoint = 'ws://localhost:9944';

app.get('/report', (req, res) => {
  res.send(Report);
});

const main = async (endpoint = LocalEndpoint) => {
  prom.injectMetricsRoute(app);
  prom.startCollection();

  // FIXME: Pull the following monitoring code to its own file.
  console.log(`Starting events monitor watching endpoint: ${endpoint}`);

  const provider = new WsProvider(endpoint);
  const api = await ApiPromise.create({ provider });

  /// Subscribe to all events...
  api.query.system.events((events) => {
    // ... but only filter the ones we care about -- offences.
    events.forEach((record) => {
      const { event } = record;

      if (event.section === 'offences') {
        const [offenceKind, sessionIndex, timeSlot] = event.data;

        /// Store in memory. Useful for JSON dumps ¯\_(ツ)_/¯.
        Report[offenceKind] = {
          sessionIndex,
          timeSlot,
        }

        switch (offenceKind) {
          case Offences.BabeEquivocation: 
            prom.babeEquivocations.inc(1, new Date());
            break;
          case Offences.GrandpaEquivocation:
            prom.grandpaEquivocations.inc(1, new Date());
            break;
          case Offences.Unresponsiveness:
            prom.unresponsivenessReports.inc(1, new Date());
            break;
        }

        /// Observe the session index has had an offence reported.
        prom.sessionIndex.observe(sessionIndex);
      }
    })
  });

  app.listen(port, () => console.log(`Offences monitor running on port ${port}`));

}

try {
  const endpoint = process.argv[2] ?
    (process.argv[2].startsWith('ws://')  || process.argv[2].startsWith('wss://') ? process.argv[2]: LocalEndpoint) : LocalEndpoint;
  main(endpoint);
} catch (ERR) { console.error(ERR); }
