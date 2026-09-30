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

    it('groups heading-based project items into atomic column-item containers to prevent column cropping', () => {
      const root = renderPreview(`::col-2::
### SAC/SAP Pilot: Productivity Browser Extension
Zero-trust client-side browser extension with 15+ utilities.
[View Details](https://sac-pilot.rohitchouhan.com)

### AI Intelligent Workflow System
Deployed an NLP assistant in SAP Analytics Cloud.
[View Details](https://community.sap.com)

::height-80::
::end-col::`)
      expect(root.querySelector('.columns-2')).toBeInTheDocument()
      const items = root.querySelectorAll('.columns-2 .column-item')
      expect(items).toHaveLength(2)
      expect(items[0].querySelector('h3')?.textContent).toContain('SAC/SAP Pilot')
      expect(items[0].querySelector('a')?.textContent).toContain('View Details')
      expect(items[1].querySelector('h3')?.textContent).toContain('AI Intelligent Workflow System')
      expect(items[1].querySelector('a')?.textContent).toContain('View Details')
      expectNoLeakedDirectives(root)
    })

    it('does not wrap lists in column-item so list items can naturally flow across columns', () => {
      const root = renderPreview(`::col-2::
- Item 1
- Item 2
- Item 3
- Item 4
::end-col::`)
      expect(root.querySelector('.columns-2')).toBeInTheDocument()
      expect(root.querySelector('.columns-2 .column-item')).toBeNull()
      expect(root.querySelectorAll('.columns-2 li')).toHaveLength(4)
      expectNoLeakedDirectives(root)
    })

    it('correctly handles the user 7-project multi-column layout without leaking or breaking items', () => {
      const root = renderPreview(`## Projects

::col-2::

### SAC/SAP Pilot: Productivity Browser Extension
Zero-trust client-side browser extension with 15+ utilities including 100k+ rows/sec fact data streaming, multi-tenant master data diffing, and dimension hierarchy exploration.
[View Details](https://sac-pilot.rohitchouhan.com)

### AI Intelligent Workflow System

Deployed an NLP assistant in SAP Analytics Cloud, improving adoption and reducing support dependency from 50% to 30% of total support time.

[View Details](https://community.sap.com/t5/technology-blog-posts-by-members/askbot-ai-the-ultimate-ai-powered-bot-for-sap-analytics-cloud/ba-p/14354194)

### LLM (AI) System

Designed a customizable AI chat widget for SAP Analytics Cloud with configurable API integration, model selection, max tokens, temperature, and completion settings, serving 400+ daily active users.

[View Details](https://community.sap.com/t5/technology-blog-posts-by-members/chatgpt-meets-sap-analytics-cloud-a-developer-s-guide-to-chatgpt-custom/ba-p/14149503)

### Advanced Configurable Form Framework

Created an adaptive form builder widget for SAP Analytics Cloud, reducing form creation time by 85% and supporting 300+ daily active users.

[View Details](https://community.sap.com/t5/technology-blog-posts-by-members/introducing-formflex-the-ultimate-dynamic-form-builder-for-sap-analytics/ba-p/14333443)

### SAP Analytics Cloud Code Generation Engine

React tool that turns natural-language input into SAC scripting code, used by 1k+ non-technical users.

[Try It Live](https://sacgencode.js.org)

### WhatsApp SDK: Business API Integration Framework

Cross-platform Flutter SDK for WhatsApp Business API integration.

[View Details](https://pub.dev/packages/whatsapp)

### 15+ Reusable SAP Custom Widgets

Library of reusable widgets for scalable SAP analytics UI development.

[View Collection](https://sap-custom-widget.rohitchouhan.com/)

::height-80::
::end-col::`)

      expect(root.querySelector('h2')?.textContent).toContain('Projects')
      const colContainer = root.querySelector('.columns-2')
      expect(colContainer).toBeInTheDocument()

      const items = colContainer?.querySelectorAll('.column-item')
      expect(items).toHaveLength(7)

      // Ensure item 4 (Advanced Configurable Form Framework) is encapsulated as a single item with its link
      expect(items?.[3].querySelector('h3')?.textContent).toContain('Advanced Configurable Form Framework')
      expect(items?.[3].textContent).toContain('supporting 300+ daily active users.')
      expect(items?.[3].querySelector('a')?.textContent).toContain('View Details')

      // Ensure item 7 (15+ Reusable SAP Custom Widgets) is encapsulated as a single item with its link
      expect(items?.[6].querySelector('h3')?.textContent).toContain('15+ Reusable SAP Custom Widgets')
      expect(items?.[6].querySelector('a')?.textContent).toContain('View Collection')

      // Ensure spacer exists and is placed inside colContainer outside the item
      const spacer = colContainer?.querySelector('div[style*="height: 80px"], div[style*="height:80px"]')
      expect(spacer).toBeInTheDocument()

      expectNoLeakedDirectives(root)
    })
  })

  describe('::no-icon::', () => {
    const renderWithIcons = (markdown: string) => {
      const { container } = render(
        <Preview markdown={markdown} listColumns={1} template="classic" showLinkIcons={true} hideLinkUnderline />
      )
      return container.querySelector('.resume-preview-content') as HTMLElement
    }

    it('suppresses icon for a link inside a heading without leaking directive symbol', () => {
      const root = renderWithIcons(`### ::no-icon::[WhatsApp SDK: Business API Integration Framework](https://pub.dev/packages/whatsapp)`)
      const heading = root.querySelector('h3')
      expect(heading).toBeInTheDocument()
      expect(heading?.textContent).toBe('WhatsApp SDK: Business API Integration Framework')
      expect(heading?.textContent).not.toContain('::no-icon::')

      const link = heading?.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://pub.dev/packages/whatsapp')
      expect(link?.querySelector('svg')).toBeNull()
      expectNoLeakedDirectives(root)
    })

    it('suppresses icon only for the specified link while retaining icons on other links', () => {
      const root = renderWithIcons(`::no-icon::[Clean Link](https://example.com)

[GitHub Link](https://github.com/rohit)`)

      const links = root.querySelectorAll('a')
      expect(links).toHaveLength(2)

      // First link (with ::no-icon::) has no svg icon
      expect(links[0].textContent).toBe('Clean Link')
      expect(links[0].querySelector('svg')).toBeNull()

      // Second link (normal) has an svg icon (GitHub icon)
      expect(links[1].textContent).toBe('GitHub Link')
      expect(links[1].querySelector('svg')).not.toBeNull()
      expectNoLeakedDirectives(root)
    })

    it('handles ::no-icon:: placed inside link text [::no-icon::Title](url)', () => {
      const root = renderWithIcons(`[::no-icon::WhatsApp SDK](https://pub.dev/packages/whatsapp)`)
      const link = root.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link?.textContent).toBe('WhatsApp SDK')
      expect(link?.querySelector('svg')).toBeNull()
      expectNoLeakedDirectives(root)
    })

    it('handles ::no-icon:: on a standalone line before a link', () => {
      const root = renderWithIcons(`::no-icon::
[View Details](https://sac-pilot.rohitchouhan.com)`)
      const link = root.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link?.textContent).toBe('View Details')
      expect(link?.querySelector('svg')).toBeNull()
      expectNoLeakedDirectives(root)
    })

    it('works inside multi-column ::col-2:: layouts', () => {
      const root = renderWithIcons(`::col-2::
### ::no-icon::[WhatsApp SDK](https://pub.dev/packages/whatsapp)
Cross-platform Flutter SDK.
::end-col::`)
      const col = root.querySelector('.columns-2')
      expect(col).toBeInTheDocument()
      const link = col?.querySelector('h3 a')
      expect(link).toBeInTheDocument()
      expect(link?.textContent).toBe('WhatsApp SDK')
      expect(link?.querySelector('svg')).toBeNull()
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
      expect(align).toHaveClass('resume-align', 'resume-align-right')
      expectNoLeakedDirectives(root)
    })

    it('aligns content center without leaking symbols', () => {
      const root = renderPreview(`::align-center::
Centered
::end-align::`)
      const align = root.querySelector('[style*="text-align: center"], [style*="text-align:center"]')
      expect(align).toBeInTheDocument()
      expect(align).toHaveClass('resume-align', 'resume-align-center')
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

    it('renders col-2 with no-bullets and inverted end tags properly', () => {
      const markdown = `
## Skills

::col-2::
::no-bullets::
- **Languages**: JavaScript (ES2023), TypeScript, Python, Java, SQL, PHP
- **Backend**: Node.js, Express.js, REST APIs, GraphQL, Microservices
- **Frontend**: React 18, Next.js, Angular, HTML5, CSS3, SCSS
- **Databases**: PostgreSQL, MySQL, MongoDB, SQL
- **Cloud & DevOps**: GitHub Actions, CI/CD, GCP, Azure, Firebase
- **AI & Machine Learning**: OpenAI API, LLM Integration
- **Software Engineering**: Distributed Systems, System Design
::end-col::
::end-no-bullets::

## Projects

::col-2::

### ::no-icon::[SAC/SAP Pilot: Productivity Browser Extension](https://sac-pilot.rohitchouhan.com)
Zero-trust client-side browser extension.

### [AI Intelligent Workflow System](https://community.sap.com/example)
Deployed an NLP assistant.
::end-col::
      `
      const root = renderPreview(markdown)
      expectNoLeakedDirectives(root)

      const columns = root.querySelectorAll('.columns-2')
      expect(columns.length).toBe(2)

      // First column section (Skills): has merged resume-no-bullets
      const skillsCol = columns[0]
      expect(skillsCol).toHaveClass('resume-no-bullets')
      const ul = skillsCol.querySelector('ul')
      expect(ul).toBeInTheDocument()
      expect(skillsCol.querySelectorAll('li').length).toBe(7)

      // Second column section (Projects): grouped into column-items
      const projectsCol = columns[1]
      const items = projectsCol.querySelectorAll('.column-item')
      expect(items.length).toBe(2)

      // First link has no-icon applied
      const firstLink = items[0].querySelector('a')
      expect(firstLink).toBeInTheDocument()
      expect(firstLink?.getAttribute('data-no-icon')).toBe('true')
      expect(firstLink?.querySelector('svg')).toBeNull()

      // Second link retains icon
      const secondLink = items[1].querySelector('a')
      expect(secondLink).toBeInTheDocument()
      expect(secondLink?.getAttribute('data-no-icon')).toBeNull()
    })

    it('unwraps nested modifiers like col-2 > compact > no-bullets', () => {
      const root = renderPreview(`
::col-2::
::compact::
::no-bullets::
- Item 1
- Item 2
::end-no-bullets::
::end-compact::
::end-col::
      `)
      expectNoLeakedDirectives(root)
      const col = root.querySelector('.columns-2')
      expect(col).toBeInTheDocument()
      expect(col).toHaveClass('resume-compact')
      expect(col).toHaveClass('resume-no-bullets')
      expect(col?.querySelectorAll('li').length).toBe(2)
    })
  })
})
