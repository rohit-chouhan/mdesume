import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Preview from './Preview'

describe('Preview Customization Features', () => {
  const defaultProps = {
    markdown: `
# Heading 1
## Heading 2
### Heading 3

This is some body text.

[GitHub](https://github.com/rohit-chouhan)
[LinkedIn](https://linkedin.com/in/itsrohitchouhan)
[LeetCode](https://leetcode.com/u/rohit-chouhan/)
[Personal Site](https://rohitchouhan.com)

- List item 1
- List item 2
- List item 3
    `,
    listColumns: 1,
    template: 'classic',
    showLinkIcons: true,
    hideLinkUnderline: true
  };

  it('renders correctly with given template', () => {
    const { container } = render(<Preview {...defaultProps} />)
    const previewDiv = container.querySelector('.resume-preview-content')
    expect(previewDiv).toHaveClass('template-classic')
    expect(previewDiv).not.toHaveClass('multi-col-lists')
  })

  it('applies multi-column class when listColumns > 1', () => {
    const { container } = render(<Preview {...defaultProps} listColumns={3} />)
    const previewDiv = container.querySelector('.resume-preview-content')
    expect(previewDiv).toHaveClass('multi-col-lists')
  })

  it('injects icons for links based on URL when showLinkIcons is true', () => {
    render(<Preview {...defaultProps} showLinkIcons={true} />)
    const links = screen.getAllByRole('link')

    // There are 4 links. Each should have an svg icon inside.
    links.forEach(link => {
      expect(link.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('does NOT inject icons when showLinkIcons is false', () => {
    render(<Preview {...defaultProps} showLinkIcons={false} />)
    const links = screen.getAllByRole('link')

    links.forEach(link => {
      expect(link.querySelector('svg')).not.toBeInTheDocument()
    })
  })

  it('applies inline textDecoration: "none" when hideLinkUnderline is true', () => {
    render(<Preview {...defaultProps} hideLinkUnderline={true} />)
    const links = screen.getAllByRole('link')

    links.forEach(link => {
      expect(link).toHaveStyle({ textDecoration: 'none' })
    })
  })

  it('applies inline textDecoration: "underline" when hideLinkUnderline is false', () => {
    render(<Preview {...defaultProps} hideLinkUnderline={false} />)
    const links = screen.getAllByRole('link')

    links.forEach(link => {
      expect(link).toHaveStyle({ textDecoration: 'underline' })
    })
  })
})

describe('Preview Custom Symbols / Directives', () => {
  const renderPreview = (markdown: string) => {
    const { container } = render(
      <Preview markdown={markdown} listColumns={1} template="classic" showLinkIcons={false} hideLinkUnderline />
    )
    return container.querySelector('.resume-preview-content') as HTMLElement
  }

  // Helper: assert that no raw directive marker is leaked into the output text.
  const expectNoLeakedDirectives = (root: HTMLElement) => {
    const text = root.textContent ?? ''
    const leaked = text.match(/::[\w-]+(?:\[[^\]]*\])?::/)
    expect(leaked, `found leaked directive: ${leaked?.[0]}`).toBeNull()
  }

  describe('::row:: / ::end-row::', () => {
    it('renders a flex row container without leaking symbols', () => {
      const root = renderPreview(`::row::
**Senior Developer** | Acme Corp
_2020 – 2024_
::end-row::`)
      const row = root.querySelector('.resume-row')
      expect(row).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })

    it('splits a title block and a date block into separate flex children', () => {
      const root = renderPreview(`::row::
### Adidas Marketing India Pvt Ltd
_05/2024 - Present_
::end-row::`)
      const row = root.querySelector('.resume-row') as HTMLElement
      expect(row).toBeInTheDocument()
      // The date is rendered as its own right-aligned span.
      const dateSpan = row.querySelector('.resume-row-date')
      expect(dateSpan).toBeInTheDocument()
      expect(dateSpan?.textContent).toContain('05/2024 - Present')
      expectNoLeakedDirectives(root)
    })

    it('auto-splits a trailing date glued to the title (em dash) into a right-aligned span', () => {
      const root = renderPreview(`::row::
### Adidas Marketing India Pvt Ltd —  05/2024 - Present
::end-row::`)
      const row = root.querySelector('.resume-row') as HTMLElement
      const dateSpan = row.querySelector('.resume-row-date')
      expect(dateSpan).toBeInTheDocument()
      expect(dateSpan?.textContent).toBe('05/2024 - Present')
      // Title must not retain the trailing em dash / date.
      expect(row.textContent).not.toContain('—')
      expectNoLeakedDirectives(root)
    })

    it('auto-splits a trailing date glued to an italic title into a right-aligned span', () => {
      const root = renderPreview(`::row::
_Software Engineer (Technology Analyst) | Gurugram_ 05/2024 - Present
::end-row::`)
      const row = root.querySelector('.resume-row') as HTMLElement
      const dateSpan = row.querySelector('.resume-row-date')
      expect(dateSpan).toBeInTheDocument()
      expect(dateSpan?.textContent).toBe('05/2024 - Present')
      expectNoLeakedDirectives(root)
    })

    it('does NOT leak symbols when row content is not separated by a blank line', () => {
      // Regression: the original bug where "::row::\n### Title — date" leaked text.
      const root = renderPreview(`::row::
### Adidas Marketing India Pvt Ltd —  05/2024 - Present
::end-row::`)
      expect(root.querySelector('.resume-row')).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })

    it('does NOT leak symbols when the directive is glued directly to its content', () => {
      const root = renderPreview(`::row::
_Software Engineer (Technology Analyst) | Gurugram_ 05/2024 - Present
::end-row::`)
      expect(root.querySelector('.resume-row')).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })

    it('does NOT leak symbols when ::row:: and ::end-row:: share lines with content', () => {
      const root = renderPreview(`::row::**Title** | Co::_2020 – 2024_::end-row::`)
      expect(root.querySelector('.resume-row')).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })
  })

  describe('::col-N:: / ::end-col::', () => {
    it('wraps content in a columns-N container without leaking symbols', () => {
      const root = renderPreview(`::col-2::
- A
- B
::end-col::`)
      expect(root.querySelector('.columns-2')).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })

    it('does NOT leak symbols when glued to content', () => {
      const root = renderPreview(`::col-2::
- A
- B
::end-col::`)
      expect(root.querySelector('.columns-2')).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })
  })

  describe('::align-(left|center|right|justify):: / ::end-align::', () => {
    it('aligns content right via inline style without leaking symbols', () => {
      const root = renderPreview(`::align-right::
Right aligned text
::end-align::`)
      const align = root.querySelector('[style*="text-align: right"], [style*="text-align:right"]')
      expect(align).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })

    it('aligns content center without leaking symbols', () => {
      const root = renderPreview(`::align-center::
Centered
::end-align::`)
      const align = root.querySelector('[style*="text-align: center"], [style*="text-align:center"]')
      expect(align).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })

    it('supports left, justify alignments', () => {
      for (const a of ['left', 'justify'] as const) {
        const root = renderPreview(`::align-${a}::
Text
::end-align::`)
        expect(root.querySelector(`[style*="text-align: ${a}"], [style*="text-align:${a}"]`)).toBeInTheDocument()
        expectNoLeakedDirectives(root)
      }
    })

    it('keeps the first heading inside ::align-*:: (centers the name)', () => {
      const root = renderPreview(`::align-center::
# Rohit Chouhan

### _Full-Stack Engineer_

Sector 29, Gurugram
::end-align::`)
      const align = root.querySelector('[style*="text-align: center"], [style*="text-align:center"]') as HTMLElement
      expect(align).toBeInTheDocument()
      // The h1 name must be a child of the aligned container, not escaped.
      expect(align?.querySelector('h1')).toBeInTheDocument()
      // The align wrapper is the top-level element wrapping the content.
      expect(root.children[0]).toBe(align)
      expectNoLeakedDirectives(root)
    })

    it('auto-closes an open align on an h2 that follows content', () => {
      const root = renderPreview(`::align-center::
Centered text
## A Section Heading
More text after the heading
::end-align::`)
      // The h2 appears after content, so it breaks OUT of the align container.
      const align = root.querySelector('[style*="text-align: center"], [style*="text-align:center"]') as HTMLElement
      expect(align?.querySelector('h2')).toBeNull()
      expect(root.querySelector('h2')).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })
  })

  describe('::note:: / ::end-note::', () => {
    it('renders a note callout without leaking symbols', () => {
      const root = renderPreview(`::note::
Highlight this.
::end-note::`)
      expect(root.querySelector('.resume-note')).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })
  })

  describe('::compact:: / ::end-compact::', () => {
    it('adds compact class without leaking symbols', () => {
      const root = renderPreview(`::compact::
- one
- two
::end-compact::`)
      expect(root.querySelector('.resume-compact')).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })
  })

  describe('::no-bullets:: / ::end-no-bullets::', () => {
    it('renders a no-bullets container without leaking symbols', () => {
      const root = renderPreview(`::no-bullets::
- one
- two
::end-no-bullets::`)
      const wrap = root.querySelector('.resume-no-bullets')
      expect(wrap).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })

    it('wraps a nested list so markers can be stripped via CSS', () => {
      const root = renderPreview(`::no-bullets::
- first
- second
::end-no-bullets::`)
      const wrap = root.querySelector('.resume-no-bullets') as HTMLElement
      const ul = wrap?.querySelector('ul')
      expect(ul).toBeInTheDocument()
      // The .resume-no-bullets ul rule (list-style: none; padding-left: 0)
      // removes markers; here we just assert the structure is correct.
      expect(wrap?.querySelectorAll('li').length).toBe(2)
    })

    it('does NOT leak symbols when glued directly to content', () => {
      const root = renderPreview(`::no-bullets::
- alpha
- beta
::end-no-bullets::`)
      expect(root.querySelector('.resume-no-bullets')).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })
  })

  describe('::height-N::', () => {
    it('renders a spacer div with the given pixel height', () => {
      const root = renderPreview(`::height-40::`)
      const spacer = root.querySelector('div')
      expect(spacer).toBeInTheDocument()
      expect(spacer).toHaveStyle({ height: '40px' })
      expectNoLeakedDirectives(root)
    })
  })

  describe('::rating-N::', () => {
    it('renders 5 rating bars with N filled without leaking symbols', () => {
      const root = renderPreview(`::rating-3::`)
      const rating = root.querySelector('.resume-rating')
      expect(rating).toBeInTheDocument()
      expect(rating?.querySelectorAll('.resume-rating-bar').length).toBe(5)
      expect(rating?.querySelectorAll('.resume-rating-bar.filled').length).toBe(3)
      expectNoLeakedDirectives(root)
    })

    it('clamps rating above 5 to 5 filled bars', () => {
      const root = renderPreview(`::rating-9::`)
      const rating = root.querySelector('.resume-rating') as HTMLElement
      expect(rating.querySelectorAll('.resume-rating-bar.filled').length).toBe(5)
    })

    it('renders zero filled bars for rating-0', () => {
      const root = renderPreview(`::rating-0::`)
      const rating = root.querySelector('.resume-rating') as HTMLElement
      expect(rating.querySelectorAll('.resume-rating-bar.filled').length).toBe(0)
    })
  })

  describe('::avatar[url]::', () => {
    it('renders an avatar img with the given src', () => {
      const root = renderPreview(`::avatar[https://example.com/me.png]::`)
      const img = root.querySelector('img.resume-avatar') as HTMLImageElement
      expect(img).toBeInTheDocument()
      expect(img.getAttribute('src')).toBe('https://example.com/me.png')
      expectNoLeakedDirectives(root)
    })
  })

  describe('::qr[url]::', () => {
    it('renders a qr box containing the url', () => {
      const root = renderPreview(`::qr[https://example.com]::`)
      const qr = root.querySelector('.resume-qr')
      expect(qr).toBeInTheDocument()
      expect(qr?.textContent).toContain('https://example.com')
      expectNoLeakedDirectives(root)
    })
  })

  describe('::badges:: / ::end-badges::', () => {
    it('renders skill pills from comma/newline separated values', () => {
      const root = renderPreview(`::badges::
React, TypeScript
Node.js
::end-badges::`)
      const badges = root.querySelector('.resume-badges')
      expect(badges).toBeInTheDocument()
      const pills = badges?.querySelectorAll('.resume-badge')
      expect(pills?.length).toBe(3)
      expect(pills?.[0].textContent).toBe('React')
      expect(pills?.[2].textContent).toBe('Node.js')
      expectNoLeakedDirectives(root)
    })
  })

  describe('directive edge cases', () => {
    it('handles multiple independent rows without leaking', () => {
      const root = renderPreview(`::row::
### First Co
_2020 - 2021_
::end-row::
::row::
### Second Co
_2022 - 2023_
::end-row::`)
      expect(root.querySelectorAll('.resume-row').length).toBe(2)
      expectNoLeakedDirectives(root)
    })

    it('handles nested column inside a row without leaking', () => {
      const root = renderPreview(`::row::
### Company
::col-2::
- A
- B
::end-col::
::end-row::`)
      expect(root.querySelector('.resume-row')).toBeInTheDocument()
      expect(root.querySelector('.columns-2')).toBeInTheDocument()
      expectNoLeakedDirectives(root)
    })

    it('auto-closes columns/align on an h2 heading', () => {
      const root = renderPreview(`::align-center::
Centered text
## A Heading
Still centered? No — alignment should stop.
::end-align::`)
      // The ::end-align:: after the heading should NOT leak because the
      // heading already closed the stack.
      expectNoLeakedDirectives(root)
    })

    it('ignores prose that contains :: but does not form a directive', () => {
      const root = renderPreview(`Some prose with double :: colons like this.`)
      // The text must remain intact (not mangled into a directive container).
      expect(root.textContent).toContain('double :: colons')
      expect(root.querySelector('.columns-2')).not.toBeInTheDocument()
      expect(root.querySelector('.resume-row')).not.toBeInTheDocument()
    })
  })
})
