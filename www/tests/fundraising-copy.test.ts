import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const read = (rel: string) =>
  readFileSync(path.join(__dirname, '..', rel), 'utf8')

const page = read('app/fundraising/page.tsx')
const layout = read('app/fundraising/layout.tsx')

describe('fundraising page copy contract', () => {
  it('has no dateline', () => {
    expect(page).not.toMatch(/August · September/)
  })

  it('is titled Investor Preview (mailto subject may still say Investor Memo)', () => {
    expect(page).toContain('Investor Preview')
    // Plain-text "Investor Memo" (with a space) is gone; the mailto subject
    // uses "Investor%20Memo", which this regex cannot match.
    expect(page).not.toMatch(/Investor Memo/)
  })

  it('has no $25M or raise range anywhere', () => {
    expect(page).not.toMatch(/25M/)
    expect(layout).not.toMatch(/25M/)
  })

  it('hero contains no raise ask', () => {
    const hero = page.slice(page.indexOf('<header'), page.indexOf('</header>'))
    expect(hero).not.toMatch(/raising/i)
    expect(hero).not.toMatch(/\$1?5M/)
  })
})
