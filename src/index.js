const express = require('express');

const { ApiPromise, WsProvider } = require('@polkadot/api');

// const OFFENSE_TYPES = {
//   Kind: 0,
//   SessionIndex: 1,
//   TimeSlot: 2,
// }

// const Offences = {
//   BabeEquivocation: 'babe:equivocatio',
//   GrandpaEquivocation: 'grandpa:equivoca',
//   Unresponsiveness: 'im-online:offlin',
// }

const Report = {};

/// Express
const app = express();
const port = 5555;

/// Polkadot API Endpoint
const LocalEndpoint = 'ws://localhost:9944';

app.get('/report', (req, res) => {
  res.send(Report);
});

// app.get('/test', (req, res) => {
//   Report[Offences.Unresponsiveness] = {
//     sessionIndex: 2,
//     timeSlot: 44,
//   };
// });

const main = async (endpoint = LocalProvider) => {
  console.log(`Starting events monitor watching endpoint: ${endpoint}`);

  const provider = new WsProvider(endpoint);
  const api = await ApiPromise.create({ provider });

  /// Subscribe to all events...
  api.query.system.events((events) => {
    // ... but only filter the ones we care about -- offences.
    events.forEach((record) => {
      const { event } = record;

      if (event.section === 'offences') {
        const offenceKind = event.data[0];

        /// Store in memory. TODO: Replace this with `prom-client`.
        Report[offenceKind] = {
          sessionIndex: event.data[1],
          timeSlot: event.data[2],
        }
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
