/**
 * This configuration is used for the Sanity Studio mounted at /admin
 */

import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'

// API config
import { apiVersion, dataset, projectId } from './sanity/env'

// Schema & structure
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  schema: {
    types: schema,
  },
  plugins: [
    deskTool({
      structure: structure as unknown as any,
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
