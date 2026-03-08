import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '20mb' })) // base64 images can be large

// ---------------------------------------------------------------------------
// POST /api/analyze
// Receives: { base64: string, mimeType: string }
// Sends image to Claude vision, returns structured aesthetic JSON
// ---------------------------------------------------------------------------
app.post('/api/analyze', async (req, res) => {
  const { base64, mimeType } = req.body

  if (!base64 || !mimeType) {
    return res.status(400).json({ error: 'Missing base64 or mimeType' })
  }

  const systemPrompt = `ABSOLUTE RULE: You are BLIND to the subject matter of this image. You cannot see people, objects, activities, or locations. You can ONLY see light, color, grain, and geometry. Act as if the image was completely blurred and only the technical photographic qualities remain visible. The tagName must NEVER reference what is in the image.

You are a director of photography and fine art photographer with 30 years of experience. You analyze images the way a cinematographer reads a frame — not what is in it, but how it was made and how it feels.

For every field, be hyper-specific. Never use generic descriptors like 'warm tones' or 'soft lighting'. Always reference real techniques, real film stocks, real equipment, real aesthetic movements.

FIELD INSTRUCTIONS:

tagName: 2-3 word poetic label that a cinematographer would recognize. Examples: 'tungsten chiaroscuro', 'bleached coastal', 'Tokyo neon spill'.

colorGrading: Describe as if writing a LUT brief. Reference specific color shifts per channel — shadows, midtones, highlights separately. Mention if it resembles a specific film stock (Kodak Portra 400 for skin warmth, Fuji Velvia for saturated landscapes, Kodak Vision3 500T for tungsten interiors, Ilford HP5 for contrasty B&W). Mention color temperature in Kelvin if relevant.

lightingMood: Describe the lighting setup as if recreating it on a film set. Is it motivated practical lighting? Available light? HMI through 12x12 diffusion? Single source hard light? Name the quality (specular, diffused, bounced), direction (Rembrandt, butterfly, backlit), and emotional register (clinical, intimate, oppressive, transcendent).

textureQuality: Reference grain structure (fine grain like Portra 160, heavy grain like pushed Tri-X 1600, digital noise vs organic grain), halation in highlights, lens characteristics (anamorphic oval bokeh, spherical softness, clinical sharpness), any artifacts (light leaks, vignetting, chromatic aberration).

compositionStyle: Reference visual movements if applicable — New Topographics deadpan centering, New Hollywood instinctive handheld, Wes Anderson symmetrical tableaux, Japanese New Wave fragmented geometry, Dogme 95 raw observational. Describe focal length feel (wide and distorted, compressed telephoto, intimate 50mm).

contrastLevel: Describe in terms of tonal latitude. Lifted blacks (matte finish)? Crushed blacks (high contrast)? Blown highlights (overexposed intentionally)? Describe shadow detail retention. Reference the curve shape — S-curve, flat log-like, high gamma.

atmosphere: One sentence. Written like a line from a cinematographer's notes, not a poet's. Visceral and specific.

generationPrompt: STRICT STRUCTURE — follow this order exactly:
1. Lighting setup (e.g. 'golden hour practical backlight through practical windows')
2. Color grade (e.g. 'Kodak Vision3 500T color rendering, warm shadows, desaturated highlights')
3. Film stock or sensor feel (e.g. 'shot on 35mm with visible grain structure')
4. Lens characteristics (e.g. '85mm portrait lens, shallow depth of field, spherical bokeh')
5. Atmosphere (e.g. 'nostalgic and contemplative, suspended moment')
6. Technical quality (e.g. 'cinematic 2.39:1 aspect ratio, professional color grade')

CRITICAL RULE for generationPrompt: Never include ANY of the following:
- Subject matter, objects, people, or activities: no 'portrait', no 'skateboarding', no 'woman', no 'hands', no 'crowd'
- Genre references: no 'portraiture', no 'documentary', no 'editorial', no 'street photography'
- Location or place anchors: no 'California', no 'coastal', no 'urban', no 'rural', no 'Tokyo street', no 'desert'
- Content-describing composition phrases: not 'architectural leading lines' — instead say 'strong geometric leading lines'; not 'natural foliage framing' — instead say 'organic layered framing'
ONLY pure technical aesthetic descriptors are allowed: lighting technique, color grade, film stock, lens characteristics, mood as a feeling, movement style, technical quality. If you find yourself describing what is IN the image or WHERE it was taken, stop and remove it. Mood words are allowed (heroic, melancholic, tense, clinical). Movement references are allowed (handheld instinctive, locked-off static). Zero content or location anchors.

SELF-CHECK — after writing generationPrompt, you must silently ask yourself these two questions before finalizing:
1. 'If I replaced every subject in this image with a landscape, would this prompt still make perfect sense?' If not, rewrite it until it does.
2. 'Is this prompt valid for ALL of these subjects: a forest, a building, a bowl of fruit, an empty road?' If it only works for the actual subject in this image, it is wrong — rewrite it until it works for all four.

BAD example (never output this): 'warm tones, soft lighting, vintage feel, moody atmosphere'
BAD example (never output this): 'golden hour backlight, Kodak Portra 400, confident skateboarding portrait, professional grade'
GOOD example (always aim for this): 'motivated tungsten practical lighting, Kodak Portra 400 color rendering with lifted shadows and warm skin tones, 35mm fine grain, 85mm lens with shallow spherical bokeh, intimate and melancholic, cinematic 1.85:1 framing'
GOOD example (always aim for this): 'golden hour natural backlight with bounce fill, Kodak Portra 400 warm amber rendering, 35mm sharp spherical optics, confident and heroic mood, professional color grade'

Return ONLY a raw JSON object. No markdown. No backticks. No explanation.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VITE_ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64,
                },
              },
              {
                type: 'text',
                text: 'Analyze the aesthetic DNA of this image and return the JSON object as instructed.',
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude API error (analyze):', err)
      return res.status(response.status).json({ error: 'Claude API error', detail: err })
    }

    const data = await response.json()
    const raw = data.content[0].text.trim()

    // Parse and re-serialize to validate JSON before sending to client
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      console.error('Claude returned invalid JSON:', raw)
      return res.status(500).json({ error: 'Claude returned invalid JSON', raw })
    }

    res.json(parsed)
  } catch (err) {
    console.error('Server error (analyze):', err)
    res.status(500).json({ error: 'Internal server error', detail: err.message })
  }
})

// ---------------------------------------------------------------------------
// POST /api/compose
// Receives: { userPrompt: string, styleTags: StyleTag[] }
// Asks Claude to blend the style tags into a final image generation prompt
// Returns: { prompt: string }
// ---------------------------------------------------------------------------
app.post('/api/compose', async (req, res) => {
  const { userPrompt, styleTags, conflictingStyles } = req.body

  if (!styleTags || styleTags.length === 0) {
    return res.status(400).json({ error: 'At least one style tag is required' })
  }

  const tagDescriptions = styleTags
    .map(
      (tag) => `Style "${tag.tagName}":
  Color Grading: ${tag.colorGrading}
  Lighting Mood: ${tag.lightingMood}
  Texture Quality: ${tag.textureQuality}
  Composition Style: ${tag.compositionStyle}
  Contrast Level: ${tag.contrastLevel}
  Atmosphere: ${tag.atmosphere}
  Core style fragment: ${tag.generationPrompt}`
    )
    .join('\n\n')

  const blendInstruction = styleTags.length === 1
    ? `Apply this single style at full expression. Use its color grading, lighting, texture, and atmosphere at full strength.`
    : conflictingStyles
      ? `CONFLICT BLEND — these styles have visually opposing aesthetics. You must NOT make one style the base and sprinkle the other as an accent. Instead assign each aesthetic dimension to both styles: for example, let the color grading be a genuine synthesis of both palettes, let the composition reflect both structural tendencies, let the lighting quality merge both atmospheres. The result must feel intentionally hybrid — someone familiar with both source styles must unmistakably recognize both.`
      : `EQUAL BLEND — you are merging ${styleTags.length} styles. Do not let one style dominate. Treat each style as owning specific visual dimensions and weave them together: pull color palette from one, composition structure from another, lighting quality from both, texture from both. Every style's signature must be unmistakably present in the final prompt — not as an afterthought or subtle accent, but as a core visual element.`

  const systemPrompt = `You are an expert prompt engineer for AI image generation (FLUX, Stable Diffusion). You understand photographic aesthetics, color science, cinematography, and fine art at a technical level.

Your task: compose a single, maximally detailed image generation prompt from a user's subject and one or more aesthetic style references.

CRITICAL — how to use the style reference fields:
Every style tag provides: Color Grading, Lighting Mood, Texture Quality, Composition Style, Contrast Level, Atmosphere, and a Core style fragment.
You MUST incorporate ALL of these fields from ALL tags into the final prompt. Do not skip or summarize any field. Every field from every tag must appear as concrete visual language in the output.

CRITICAL — how to blend when merging multiple styles:
Do NOT pick one style as the base and sprinkle the others as accents. Instead, interleave the fields:
- Color Grading: synthesize all tags' color treatments into one described palette
- Lighting Mood: describe a lighting setup that carries qualities from every tag
- Texture Quality: layer all textural characteristics together
- Composition Style: find compositional rules that satisfy all tags simultaneously
- Contrast Level: describe the tonal range as a synthesis
- Atmosphere: fuse all atmospheric qualities into one mood
- Core fragments: weave all core style fragments into the prose, none omitted

Output rules:
- 300-400 words — this is a hard minimum, do not produce less
- Write in flowing, dense descriptive prose — no bullet points, no lists, no headers
- Lead with the subject and scene, then layer every aesthetic dimension in rich consecutive sentences
- Name actual specific colors by feel ("dusty rose", "electric cobalt", "amber tungsten", "crushed olive"), actual film stocks (Kodak Portra 400, Fuji Velvia 50, Ilford HP5, Kodak Tri-X), specific lens focal lengths and aperture rendering, tactile grain and texture descriptions
- Never name the source styles or say "blending X with Y"
- No filler: ban "beautiful", "stunning", "masterpiece", "high quality", "intricate details", "photorealistic", "epic"
- Return ONLY the final prompt string. No explanation, no preamble, no quotes.`

  const userMessage = `${blendInstruction}

${userPrompt ? `User's subject/concept: "${userPrompt}"` : 'No specific subject. Create a purely aesthetic prompt.'}

Style references:

${tagDescriptions}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VITE_ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude API error (compose):', err)
      return res.status(response.status).json({ error: 'Claude API error', detail: err })
    }

    const data = await response.json()
    const prompt = data.content[0].text.trim()

    res.json({ prompt })
  } catch (err) {
    console.error('Server error (compose):', err)
    res.status(500).json({ error: 'Internal server error', detail: err.message })
  }
})

// ---------------------------------------------------------------------------
// POST /api/generate
// Receives: { prompt: string }
// Sends prompt to Together AI FLUX model, returns image URL
// Returns: { url: string }
// ---------------------------------------------------------------------------
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' })
  }

  try {
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VITE_TOGETHER_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt,
        width: 1024,
        height: 1024,
        steps: 4,
        n: 1,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Together AI error:', err)
      return res.status(response.status).json({ error: 'Together AI error', detail: err })
    }

    const data = await response.json()
    const url = data.data?.[0]?.url

    if (!url) {
      return res.status(500).json({ error: 'No image URL in Together AI response', raw: data })
    }

    res.json({ url })
  } catch (err) {
    console.error('Server error (generate):', err)
    res.status(500).json({ error: 'Internal server error', detail: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`)
  const key = process.env.VITE_ANTHROPIC_KEY
  console.log(`Anthropic key: ${key ? key.slice(0, 20) + '...' + key.slice(-6) + ' (length: ' + key.length + ')' : 'MISSING'}`)
})
