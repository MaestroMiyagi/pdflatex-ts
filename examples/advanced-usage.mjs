import { LatexToPdfConverter } from '../dist/index.js'

const converter = new LatexToPdfConverter()

async function batchProcessing() {
  const files = ['document1.tex', 'document2.tex', 'document3.tex']

  for (const file of files) {
    try {
      const result = await converter.convertAsync(file, {
        output: `output/batch-${file.replace('.tex', '.pdf')}`,
        debug: false,
      })

      console.log(`✅ Converted: ${file} -> ${result.outputPath}`)
    } catch (error) {
      console.error(`❌ Error converting ${file}:`, error.message)
    }
  }
}

async function generateReport() {
  const reportData = {
    title: 'Monthly Sales Report',
    author: 'Automated System',
    date: new Date().toLocaleDateString('en-US'),
    sections: [
      'This month\'s sales have shown a 15% growth compared to the previous month.',
      'The best-selling products were laptops and smartphones.',
      'We recommend increasing the inventory of technology products.'
    ]
  }

  const latexContent = `
    \\documentclass[12pt]{article}
    \\usepackage[utf8]{inputenc}
    \\usepackage{geometry}
    \\geometry{margin=2cm}
    
    \\title{${reportData.title}}
    \\author{${reportData.author}}
    \\date{${reportData.date}}
    
    \\begin{document}
    \\maketitle
    
    ${reportData.sections.map((section, index) => `
      \\section{Analysis ${index + 1}}
      ${section}
    `).join('\n')}
    
    \\section{Conclusions}
    Based on the above data, it can be concluded that the business 
    is in a positive growth trend.
    
    \\end{document}
  `

  try {
    const result = await converter.convertFromContent(
      latexContent,
      `report-${Date.now()}`,
      { output: 'output/monthly-report.pdf' }
    )

    console.log('📊 Report generated successfully:', result.outputPath)
    return result.outputPath
  } catch (error) {
    console.error('❌ Error generating report:', error)
    throw error
  }
}

async function runAdvancedExamples() {
  console.log('=== Running advanced examples ===')
  
  try {
    await batchProcessing()
    await generateReport()
    console.log('✅ All examples completed successfully')
  } catch (error) {
    console.error('❌ Error in examples:', error)
  }
}

runAdvancedExamples()
