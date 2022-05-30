const opentelemetry = require('@opentelemetry/sdk-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
import { Logger } from '@nestjs/common';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const logger = new Logger();

// import {
//   trace,
//   diag,
//   DiagConsoleLogger,
//   DiagLogLevel,
// } from '@opentelemetry/api';

// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const jaegerExporter = new JaegerExporter({
  host: process.env.OTEL_EXPORTER_HOST || 'localhost',
  port: process.env.OTEL_EXPORTER_PORT || 6832,
});

const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]:
      process.env.OTEL_EXPORTER_SERVICE_NAME || 'nest-example',
  }),
  // Optional - if omitted, the tracing SDK will not be initialized
  traceExporter: jaegerExporter,
  // Optional - you can use the metapackage or load each instrumentation individually
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk
  .start()
  .then(() => logger.debug('Tracing initialized'))
  .catch((error) => logger.warn('Error initializing tracing', error));

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => logger.debug('Tracing terminated'))
    .catch((error) => logger.warn('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
