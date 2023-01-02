[![CircleCI](https://circleci.com/gh/w3f/offences-monitor.svg?style=svg)](https://circleci.com/gh/w3f/offences-monitor)

# Offences Monitor

Monitors slashable offences that are registered through the Offences module on a Substrate based chain.

## Running

Clone the repository to the desired environment, install dependencies and run via `yarn`.

```zsh
$ git clone https://github.com/w3f/offences-monitor.git
$ cd offences-monitor
$ yarn
$ yarn start
```

The monitor will use the endpoint of a locally running chain at `ws://localhost:9944` by default. To point it to a different endpoint provide an argument to `yarn start` like so:

```zsh
$ yarn start wss://kusama-rpc.polkadot.io
```
test
