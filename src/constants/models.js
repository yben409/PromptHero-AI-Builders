// ---------------------------------------------------------------------------
// API model identifiers and endpoint paths
// All API calls should import from here — never hardcode these strings elsewhere
// ---------------------------------------------------------------------------

// Claude model used for both image analysis and prompt composition
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

// Together AI model for image generation
export const FLUX_MODEL = 'black-forest-labs/FLUX.1-schnell'

// Express proxy endpoint paths (Vite proxies these to localhost:3001)
export const API_ENDPOINTS = {
  analyze: '/api/analyze',   // POST { base64, mimeType } → aesthetic JSON
  compose: '/api/compose',   // POST { userPrompt, styleTags } → { prompt }
  generate: '/api/generate', // POST { prompt } → { url }
}

// Together AI image generation settings
export const IMAGE_CONFIG = {
  width: 1024,
  height: 1024,
  steps: 4,
  n: 1,
}
