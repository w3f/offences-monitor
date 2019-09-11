const { ApiPromise, WsProvider } = require('@polkadot/api');
const express = require('express');
const prom = require('./promClient');

String.prototype.hexEncode = function(){
  let result = '';

  for (let i = 0; i < this.length; i++) {
    result += this.charCodeAt(i).toString(16);
  }

  return result;
}

const Offences = {
  BabeEquivocation: 'babe:equivocatio'.hexEncode(),
  GrandpaEquivocation: 'grandpa:equivoca'.hexEncode(),
  Unresponsiveness: 'im-online:offlin'.hexEncode(),
}

/// Express
const app = express();
const port = 5555;

/// Polkadot API Endpoint
const LocalEndpoint = 'ws://localhost:9944';

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
    events.forEach(async (record) => {
      const { event } = record;

      if (event.section === 'offences') {
        const [offenceKind, timeSlot] = event.data;

        const reportsByKind = await api.query.offences.reportsByKindIndex(offenceKind);

        // FIXME: Do actual SCALE decoding. Since reportByKind currently gives us one large string.
        const beginIndex = reportsByKind.toString().indexOf('00');
        const reports = reportsByKind.toString().slice(beginIndex).match(/.{1,72}/g)
        const currentReports = reports.filter((reportDetails) => reportDetails.startsWith(timeSlot.toString().slice(2)));
        currentReports.forEach(async (reportId) => {
          reportId = reportId.slice(timeSlot.toString().length-2)
          const reportInfo = await api.query.offences.reports('0x' + reportId);
          const { offender/*, reporters*/ } = reportInfo.raw;
          const [offenderAddress/*, offenderDeets*/] = offender;
          
          switch (offenceKind.toString().slice(2)) {
            case Offences.BabeEquivocation: 
              prom.babeEquivocations.inc({ offenderAddress });
              break;
            case Offences.GrandpaEquivocation:
              prom.grandpaEquivocations.inc({ offenderAddress });
              break;
            case Offences.Unresponsiveness:
              prom.unresponsivenessReports.inc({ offenderAddress });
              break;
          }
        });
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
