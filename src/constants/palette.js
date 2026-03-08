// ---------------------------------------------------------------------------
// Gradient palette for style tag cards
// Tags are assigned a gradient by: palette[tagIndex % palette.length]
// Each entry has `from` and `to` Tailwind color classes + a text color
// for legibility on that background.
// ---------------------------------------------------------------------------

export const GRADIENT_PALETTE = [
  { from: 'from-rose-400',    to: 'to-orange-300',   text: 'text-rose-950'   }, // warm amber
  { from: 'from-violet-500',  to: 'to-purple-300',   text: 'text-violet-950' }, // deep violet
  { from: 'from-cyan-400',    to: 'to-blue-300',     text: 'text-cyan-950'   }, // cold cyan
  { from: 'from-emerald-400', to: 'to-teal-300',     text: 'text-emerald-950'}, // forest green
  { from: 'from-amber-400',   to: 'to-yellow-200',   text: 'text-amber-950'  }, // golden hour
  { from: 'from-pink-500',    to: 'to-rose-300',     text: 'text-pink-950'   }, // neon rose
  { from: 'from-slate-600',   to: 'to-slate-400',    text: 'text-slate-100'  }, // charcoal
  { from: 'from-indigo-500',  to: 'to-sky-300',      text: 'text-indigo-950' }, // dusk indigo
  { from: 'from-orange-500',  to: 'to-amber-300',    text: 'text-orange-950' }, // burnt sienna
  { from: 'from-fuchsia-500', to: 'to-pink-300',     text: 'text-fuchsia-950'}, // magenta mist
  { from: 'from-teal-500',    to: 'to-emerald-300',  text: 'text-teal-950'   }, // deep teal
  { from: 'from-sky-500',     to: 'to-cyan-300',     text: 'text-sky-950'    }, // overcast blue
]
