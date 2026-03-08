/**
 * Detects visual incompatibilities between selected style tags.
 * Checks the most defining fields: colorGrading and generationPrompt.
 */

const CONFLICT_GROUPS = [
  {
    reason: 'monochrome vs. vivid color',
    groupA: {
      label: 'monochrome/desaturated',
      keywords: ['black and white', 'b&w', 'monochrome', 'grayscale', 'greyscale',
        'desaturated', 'silver gelatin', 'orthochromatic', 'achromatic', 'colorless',
        'no color', 'bleached', 'sepia'],
    },
    groupB: {
      label: 'vivid/neon color',
      keywords: ['neon', 'vivid', 'saturated', 'vibrant', 'electric', 'fluorescent',
        'technicolor', 'velvia', 'bold color', 'rich color', 'hypercolor', 'chromatic',
        'magenta', 'cyan pop', 'color bleed'],
    },
  },
  {
    reason: 'high-key brightness vs. low-key darkness',
    groupA: {
      label: 'high-key/bright',
      keywords: ['high-key', 'overexposed', 'blown highlights', 'light-flooded',
        'airy', 'ethereal light', 'white balance pushed', 'luminous'],
    },
    groupB: {
      label: 'low-key/dark',
      keywords: ['low-key', 'crushed blacks', 'underlit', 'noir darkness',
        'oppressive shadow', 'near-black', 'pitch black', 'extreme shadow'],
    },
  },
  {
    reason: 'hyper-sharp/clinical vs. soft/dreamy',
    groupA: {
      label: 'hyper-sharp/clinical',
      keywords: ['hyper-sharp', 'clinical sharpness', 'razor sharp', 'technical precision',
        'studio-clean', 'f/16', 'zero aberration'],
    },
    groupB: {
      label: 'soft/dreamy',
      keywords: ['soft focus', 'dreamy', 'heavy diffusion', 'misty', 'fog filter',
        'extreme halation', 'bloom', 'smeared highlights'],
    },
  },
]

/**
 * @param {Object[]} tags - Selected style tag objects
 * @returns {{ conflicting: boolean, reason: string | null, labelA: string | null, labelB: string | null }}
 */
export function detectStyleConflict(tags) {
  if (tags.length < 2) return { conflicting: false, reason: null, labelA: null, labelB: null }

  // Fields to scan per tag (most visually defining)
  const getSearchText = (tag) =>
    [tag.colorGrading, tag.generationPrompt, tag.atmosphere].join(' ').toLowerCase()

  for (const { reason, groupA, groupB } of CONFLICT_GROUPS) {
    const matchesA = tags.filter(t => groupA.keywords.some(kw => getSearchText(t).includes(kw)))
    const matchesB = tags.filter(t => groupB.keywords.some(kw => getSearchText(t).includes(kw)))

    // Only count tags that exclusively match one group — a tag matching both is ambiguous, not conflicting
    const onlyInA = matchesA.filter(t => !matchesB.includes(t))
    const onlyInB = matchesB.filter(t => !matchesA.includes(t))

    if (onlyInA.length > 0 && onlyInB.length > 0) {
      return {
        conflicting: true,
        reason,
        labelA: groupA.label,
        labelB: groupB.label,
        tagNamesA: onlyInA.map(t => t.tagName),
        tagNamesB: onlyInB.map(t => t.tagName),
      }
    }
  }

  return { conflicting: false, reason: null, labelA: null, labelB: null }
}
