import './utils/tracer'
import 'dotenv/config'
import * as Sentry from '@sentry/node'
import loop from './loop'

Sentry.init({
  environment: process.env.NODE_ENV,
})

loop()
