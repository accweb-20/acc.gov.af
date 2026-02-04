'use client'

/**
 * This configuration is used for the Sanity Studio mounted at /admin
 */

import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'

// API config
import { apiVersion, dataset, projectId } from './sanity/env'

// Correct import from schemaTypes
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
    // deskTool replaces structureTool in v3
    deskTool({
      structure, // pass your custom structure here
    }),
    // Vision tool for querying GROQ
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
