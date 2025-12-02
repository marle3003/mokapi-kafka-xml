# mokapi-kafka-xml
This repository demonstrates how to build and test Kafka XML-to-JSON transformation workflows using Mokapi and Playwright.

This example simulates a legacy environment where:
- A legacy system produces XML messages
- A modern service consumes XML, converts it to JSON, and publishes to a normalized topic
- Tests verify the entire workflow without a real Kafka cluster

It uses:
- Mokapi – mocks a Kafka cluster using an AsyncAPI 3.0 specification
- Transformer Service (Node.js) – consumes XML, converts it to JSON, and publishes normalized output
- Playwright – drives end-to-end tests via Mokapi's HTTP Kafka API
- AsyncAPI – describes the two topics (user.created and user.transformed) and payload schemas

This setup is ideal for CI pipelines where running Kafka would be too heavy or slow.

## Architecture

The workflow under test:

1. A legacy system produces an XML message to the user.created.xml topic (simulated via Playwright calling Mokapi’s HTTP API).
2. The transformer service consumes the XML, converts it into a JSON domain event, and publishes it to the user.created.json topic.
3. Playwright verifies:
    - the XML message was accepted by the mock Kafka API,
    - the transformer produced the expected JSON event,
    - the output topic contains the correct normalized message.

Mokapi allows all of this to run in isolation — no real Kafka, schema registry, or broker setup required.

## Getting Started

### Prerequisites

- Node.js
- [Mokapi](https://mokapi.io/docs/guides/get-started/installation)


### 1. Install dependencies

```bash
npm install
```

### 2. Start Mokapi

From project root, run:

```bash
mokapi mocks
```

### 3. Start transformer server

In a new terminal:

```bash
node transformer
```

### 4. Run Playwright tests

In another terminal, run:

```bash
npx playwright test
```

## License

MIT License