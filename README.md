# PDFLaTeX-TS

[![npm version](https://badge.fury.io/js/pdflatex-ts.svg)](https://badge.fury.io/js/pdflatex-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/MaestroMiyagi/pdflatex-ts/workflows/CI/badge.svg)](https://github.com/MaestroMiyagi/pdflatex-ts/actions)

A modern TypeScript library for converting LaTeX files to PDF using `pdflatex`. Supports both file conversion and dynamic content generation.

## Features

- LaTeX file to PDF conversion
- Dynamic PDF generation from LaTeX content
- Asynchronous API with Promise and callback support
- Flexible configuration options
- Automatic cleanup of auxiliary files
- Customizable timeout support
- Debug mode for troubleshooting
- Full TypeScript support with included types

## System Requirements

- **Node.js**: >= 14.0.0 (Server-side only)
- **pdflatex**: Must be installed and available in system PATH

> ⚠️ **Important**: This library is designed for **server-side use only** (Node.js). It cannot be used in web browsers or client-side applications due to its dependency on Node.js modules like `child_process`, `fs`, and the requirement for `pdflatex` to be installed on the system.

### Use Cases

✅ **Supported environments:**

- Node.js applications
- Express.js servers
- Next.js API routes (`/api` folder)
- Serverless functions (with LaTeX installed)
- Desktop applications (Electron)

❌ **Not supported:**

- Web browsers
- React/Vue/Angular client components
- Progressive Web Apps (PWAs)
- Any client-side JavaScript

### Installing pdflatex

#### Windows

```bash
# Install MiKTeX or TeX Live
# Download from: https://miktex.org/download or https://www.tug.org/texlive/
```

#### macOS

```bash
# Using Homebrew
brew install --cask mactex

# Or install BasicTeX (lightweight version)
brew install --cask basictex
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-latex-extra
```

## Installation

```bash
npm install pdflatex-ts
```

## Basic Usage

### Import

```typescript
// Named import (recommended)
import { LatexToPdfConverter } from 'pdflatex-ts'

// Default import (uses a pre-instantiated converter)
import converter from 'pdflatex-ts'

// CommonJS (if using Node.js without ES modules)
const { LatexToPdfConverter } = require('pdflatex-ts')

// TypeScript types
import type { ConversionOptions, ConversionResult } from 'pdflatex-ts'
```

### File Conversion

#### Using Callbacks

```typescript
import { LatexToPdfConverter } from 'pdflatex-ts'

const converter = new LatexToPdfConverter()

converter.convert(
  'input.tex',
  {
    output: 'output/document.pdf',
    timeout: 30000,
    debug: true,
  },
  (error, result) => {
    if (error) {
      console.error('Conversion error:', error)
      return
    }

    console.log('Conversion successful:', result)
    // result.outputPath contains the path to the generated PDF
  }
)
```

#### Using Promises/Async-Await

```typescript
import { LatexToPdfConverter } from 'pdflatex-ts'

const converter = new LatexToPdfConverter()

async function convertFile() {
  try {
    const result = await converter.convertAsync('input.tex', {
      output: 'output/document.pdf',
      debug: true,
    })

    console.log('Conversion successful:', result)
    console.log('PDF generated at:', result.outputPath)
  } catch (error) {
    console.error('Conversion error:', error)
  }
}

convertFile()
```

### Dynamic PDF Generation

```typescript
import { LatexToPdfConverter } from 'pdflatex-ts'

const converter = new LatexToPdfConverter()

async function generateDynamicPDF() {
  const latexContent = `
    \\documentclass{article}
    \\usepackage[utf8]{inputenc}
    \\title{Dynamically Generated Document}
    \\author{Automated System}
    \\date{\\today}
    
    \\begin{document}
    \\maketitle
    
    \\section{Introduction}
    This document was generated dynamically using pdflatex-ts.
    
    \\section{Content}
    You can add any valid LaTeX content here.
    
    \\subsection{Example List}
    \\begin{itemize}
      \\item First item
      \\item Second item
      \\item Third item
    \\end{itemize}
    
    \\end{document}
  `

  try {
    const result = await converter.convertFromContent(
      latexContent,
      'dynamic-document',
      {
        output: 'output/dynamic.pdf',
        debug: true,
      }
    )

    console.log('PDF generated successfully:', result.outputPath)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}

generateDynamicPDF()
```

## API

### LatexToPdfConverter

#### Constructor

```typescript
const converter = new LatexToPdfConverter()
```

#### Methods

##### `convert(input, options?, callback)`

Converts a LaTeX file to PDF using callbacks.

**Parameters:**

- `input` (string): Path to the input .tex file
- `options` (ConversionOptions): Conversion options (optional)
- `callback` (ConversionCallback): Callback function

##### `convertAsync(input, options?)`

Asynchronous version of conversion that returns a Promise.

**Parameters:**

- `input` (string): Path to the input .tex file
- `options` (ConversionOptions): Conversion options (optional)

**Returns:** `Promise<ConversionResult>`

##### `convertFromContent(latexContent, filename, options?)`

Generates a PDF from LaTeX content in memory.

**Parameters:**

- `latexContent` (string): LaTeX content as string
- `filename` (string): Base name for the temporary file
- `options` (ConversionOptions): Conversion options (optional)

**Returns:** `Promise<ConversionResult>`

### TypeScript Interfaces

#### ConversionOptions

```typescript
interface ConversionOptions {
  output?: string // Output PDF path (default: output/[name].pdf)
  timeout?: number // Timeout in milliseconds (default: 60000)
  debug?: boolean // Enable debug mode (default: false)
  cleanupAuxFiles?: boolean // Clean auxiliary files (default: true)
}
```

#### ConversionResult

```typescript
interface ConversionResult {
  success: boolean // Indicates if conversion was successful
  outputPath?: string // Path to generated PDF file (if successful)
  error?: string // Error message (if failed)
  executionTime: number // Execution time in milliseconds
}
```

#### ConversionCallback

```typescript
type ConversionCallback = (
  error: Error | null,
  result?: ConversionResult
) => void
```

## Advanced Examples

### Batch Processing

```typescript
import { LatexToPdfConverter } from 'pdflatex-ts'
import * as path from 'path'
import * as fs from 'fs'

const converter = new LatexToPdfConverter()

async function batchConvert(directory: string) {
  const files = fs
    .readdirSync(directory)
    .filter((file) => file.endsWith('.tex'))

  for (const file of files) {
    const fullPath = path.join(directory, file)
    const outputName = path.basename(file, '.tex')

    try {
      const result = await converter.convertAsync(fullPath, {
        output: `output/${outputName}.pdf`,
        debug: false,
      })

      console.log(` Converted: ${file} -> ${result.outputPath}`)
    } catch (error) {
      console.error(`❌ Error converting ${file}:`, error)
    }
  }
}

batchConvert('./documents')
```

### Report Generation

```typescript
import { LatexToPdfConverter } from 'pdflatex-ts'

const converter = new LatexToPdfConverter()

interface ReportData {
  title: string
  author: string
  date: string
  content: string[]
}

async function generateReport(data: ReportData) {
  const latexContent = `
    \\documentclass[12pt]{article}
    \\usepackage[utf8]{inputenc}
    \\usepackage{geometry}
    \\geometry{margin=2cm}
    
    \\title{${data.title}}
    \\author{${data.author}}
    \\date{${data.date}}
    
    \\begin{document}
    \\maketitle
    
    ${data.content
      .map(
        (section, index) => `
      \\section{Section ${index + 1}}
      ${section}
    `
      )
      .join('\n')}
    
    \\end{document}
  `

  try {
    const result = await converter.convertFromContent(
      latexContent,
      `report-${Date.now()}`,
      { output: 'reports/report.pdf' }
    )

    return result.outputPath
  } catch (error) {
    throw new Error(`Error generating report: ${error}`)
  }
}

// Usage
generateReport({
  title: 'Monthly Sales Report',
  author: 'Automated System',
  date: new Date().toLocaleDateString(),
  content: [
    'This is the content of the first section.',
    'Here goes the content of the second section.',
    'And this is the third section of the report.',
  ],
})
  .then((path) => {
    console.log('Report generated at:', path)
  })
  .catch((error) => {
    console.error('Error:', error)
  })
```

## Error Handling

The library can throw different types of errors:

```typescript
import { LatexToPdfConverter } from 'pdflatex-ts'

const converter = new LatexToPdfConverter()

async function handleErrors() {
  try {
    const result = await converter.convertAsync('non-existent-file.tex')
  } catch (error) {
    if (error.message.includes('does not exist')) {
      console.error('File does not exist')
    } else if (error.message.includes('timeout')) {
      console.error('Conversion took too long')
    } else if (error.message.includes('pdflatex failed')) {
      console.error('LaTeX compilation error')
    } else {
      console.error('Unknown error:', error)
    }
  }
}
```

## Debugging

To enable debug mode and see detailed pdflatex output:

```typescript
const result = await converter.convertAsync('input.tex', {
  debug: true,
})
```

This will display all pdflatex output in the console, useful for diagnosing compilation issues.

## Troubleshooting

### Common Issues

#### "Module not found: Can't resolve 'child_process'" in Next.js

This error occurs when trying to use `pdflatex-ts` in a **client component**. The library requires Node.js modules that are not available in browsers.

**❌ Incorrect usage (Client Component):**

```typescript
'use client' // ← This makes it a client component
import { LatexToPdfConverter } from 'pdflatex-ts' // ← Will fail

export default function MyComponent() {
  const converter = new LatexToPdfConverter() // ← Error!
  // ...
}
```

**✅ Correct usage (API Route):**

```typescript
// app/api/generate-pdf/route.ts
import { LatexToPdfConverter } from 'pdflatex-ts' // ← Works fine

export async function POST(request) {
  const converter = new LatexToPdfConverter() // ← Works!
  // ...
}
```

**Solution**: Move the PDF generation logic to an API route and call it from your client component.

#### "Export default doesn't exist in target module"

This error occurs when there's a mismatch between ES modules and CommonJS. Try these solutions:

**✅ Solution 1: Use named import (recommended)**

```typescript
import { LatexToPdfConverter } from 'pdflatex-ts'
const converter = new LatexToPdfConverter()
```

**✅ Solution 2: Use default import**

```typescript
import converter from 'pdflatex-ts'
// converter is already instantiated
```

**✅ Solution 3: For CommonJS projects**

```typescript
const { LatexToPdfConverter } = require('pdflatex-ts')
```

### Library Usage in Different Environments

| Environment                | Support       | Notes                       |
| -------------------------- | ------------- | --------------------------- |
| ✅ Node.js Server          | Full support  | Recommended                 |
| ✅ Next.js API Routes      | Full support  | Use `/api` routes           |
| ✅ Express.js              | Full support  | Backend only                |
| ✅ Serverless Functions    | Limited       | Requires LaTeX installation |
| ❌ React Client Components | Not supported | Use API routes instead      |
| ❌ Browser/Frontend        | Not supported | Server-side only            |

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

MIT © [Iyari Maldonado](https://github.com/MaestroMiyagi)

## Support

If you encounter any issues or have questions:

- 🐛 [Report a bug](https://github.com/MaestroMiyagi/pdflatex-ts/issues)
- 💬 [Ask a question](https://github.com/MaestroMiyagi/pdflatex-ts/discussions)

## Framework Integration

### Next.js Integration

Since this library requires Node.js modules, it must be used in **API routes** or **server components** only.

#### API Route Example (`/app/api/generate-pdf/route.ts`)

```typescript
import { LatexToPdfConverter } from 'pdflatex-ts'
import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const converter = new LatexToPdfConverter()

export async function POST(request: NextRequest) {
  try {
    const { latexContent, filename = 'document' } = await request.json()

    const result = await converter.convertFromContent(latexContent, filename, {
      output: `output/${filename}.pdf`,
      debug: false,
    })

    // Read the generated PDF file
    const pdfBuffer = await fs.readFile(result.outputPath!)

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
      },
    })
  } catch (error) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 })
  }
}
```
