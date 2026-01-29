// sanity.config.ts
'use client'

/**
 * This configuration is used for the Sanity Studio mounted at /admin
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

// API config
import { apiVersion, dataset, projectId } from './sanity/env'

// Correct import from schemaTypes
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  // Pass schemaTypes inside the `types` property
  schema: {
    types: schema,
  },
  plugins: [
    structureTool({ structure }),
    // Vision tool for querying GROQ
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
