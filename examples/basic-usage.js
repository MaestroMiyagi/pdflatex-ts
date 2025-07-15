import { LatexToPdfConverter } from '../dist/index.js'

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
    console.log('PDF generated at:', result.outputPath)
    console.log('Execution time:', result.executionTime, 'ms')
  }
)

async function convertWithAsync() {
  try {
    const result = await converter.convertAsync('input.tex', {
      output: 'output/document.pdf',
      debug: true,
    })

    console.log('Conversion successful:', result)
  } catch (error) {
    console.error('Conversion error:', error)
  }
}

async function generateFromContent() {
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
    \\end{document}
  `

  try {
    const result = await converter.convertFromContent(
      latexContent,
      'dynamic-document',
      { output: 'output/dynamic.pdf' }
    )

    console.log('PDF generated successfully:', result.outputPath)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}

async function runExamples() {
  console.log('=== Running examples ===')

  await convertWithAsync()
  await generateFromContent()

  console.log('=== Examples completed ===')
}

runExamples()
