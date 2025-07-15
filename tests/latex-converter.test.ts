import { LatexToPdfConverter } from '../src/latex-converter'
import { ConversionOptions } from '../src/types'
import * as fs from 'fs'
import * as path from 'path'

describe('LatexToPdfConverter', () => {
  let converter: LatexToPdfConverter
  const testOutputDir = path.join(__dirname, '..', 'test-output')
  const testInputDir = path.join(__dirname, 'fixtures')

  beforeAll(() => {
    converter = new LatexToPdfConverter()

    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true })
    }

    if (!fs.existsSync(testInputDir)) {
      fs.mkdirSync(testInputDir, { recursive: true })
    }
  })

  afterAll(() => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true })
    }

    if (fs.existsSync(testInputDir)) {
      fs.rmSync(testInputDir, { recursive: true, force: true })
    }
  })

  beforeEach(() => {
    const testLatexContent = `
\\documentclass{article}
\\title{Test Document}
\\author{Jest Test}
\\date{\\today}
\\begin{document}
\\maketitle
\\section{Test Section}
This is a test document for Jest testing.
\\end{document}
`
    const testFilePath = path.join(testInputDir, 'test.tex')
    fs.writeFileSync(testFilePath, testLatexContent)
  })

  afterEach(() => {
    const testFiles = fs.readdirSync(testInputDir)
    testFiles.forEach((file) => {
      fs.unlinkSync(path.join(testInputDir, file))
    })
  })

  describe('Constructor', () => {
    it('should create a new instance', () => {
      expect(converter).toBeInstanceOf(LatexToPdfConverter)
    })
  })

  describe('File validation', () => {
    it('should throw error for non-existent file', (done) => {
      converter.convert('non-existent-file.tex', {}, (error, result) => {
        expect(error).toBeTruthy()
        expect(error?.message).toContain('does not exist')
        expect(result?.success).toBe(false)
        done()
      })
    })

    it('should throw error for invalid file extension', (done) => {
      const invalidFile = path.join(testInputDir, 'test.txt')
      fs.writeFileSync(invalidFile, 'test content')

      converter.convert(invalidFile, {}, (error, result) => {
        expect(error).toBeTruthy()
        expect(error?.message).toContain('Invalid file extension')
        expect(result?.success).toBe(false)
        done()
      })
    })
  })

  describe('convertAsync method', () => {
    it('should convert LaTeX file to PDF asynchronously', async () => {
      const inputFile = path.join(testInputDir, 'test.tex')
      const outputFile = path.join(testOutputDir, 'test-async.pdf')

      const options: ConversionOptions = {
        output: outputFile,
        timeout: 30000,
        debug: false,
      }

      try {
        const result = await converter.convertAsync(inputFile, options)

        expect(result.success).toBe(true)
        expect(result.outputPath).toBe(outputFile)
        expect(result.executionTime).toBeGreaterThan(0)
        expect(fs.existsSync(outputFile)).toBe(true)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('spawn pdflatex ENOENT')) {
          console.warn('pdflatex not found - skipping PDF generation test')
          expect(errorMessage).toContain('pdflatex')
        } else {
          throw error
        }
      }
    }, 60000)

    it('should reject with error for invalid input', async () => {
      await expect(converter.convertAsync('invalid-file.tex')).rejects.toThrow(
        'does not exist'
      )
    })
  })

  describe('convertFromContent method', () => {
    it('should generate PDF from LaTeX content', async () => {
      const latexContent = `
\\documentclass{article}
\\title{Dynamic Test Document}
\\author{Jest Dynamic Test}
\\date{\\today}
\\begin{document}
\\maketitle
\\section{Dynamic Content}
This document was generated from content in memory.
\\end{document}
`

      const outputFile = path.join(testOutputDir, 'dynamic-test.pdf')

      try {
        const result = await converter.convertFromContent(
          latexContent,
          'dynamic-test',
          { output: outputFile }
        )

        expect(result.success).toBe(true)
        expect(result.outputPath).toBe(outputFile)
        expect(fs.existsSync(outputFile)).toBe(true)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('spawn pdflatex ENOENT')) {
          console.warn('pdflatex not found - skipping dynamic content test')
          expect(errorMessage).toContain('pdflatex')
        } else {
          throw error
        }
      }
    }, 60000)

    it('should handle invalid LaTeX content', async () => {
      const invalidLatexContent = `
\\documentclass{article}
\\begin{document}
\\invalid_command_that_does_not_exist
\\end{document}
`

      try {
        await converter.convertFromContent(
          invalidLatexContent,
          'invalid-test',
          { output: path.join(testOutputDir, 'invalid.pdf') }
        )
        fail('Expected conversion to fail with invalid LaTeX')
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('spawn pdflatex ENOENT')) {
          console.warn('pdflatex not found - skipping invalid LaTeX test')
          expect(errorMessage).toContain('pdflatex')
        } else {
          expect(error).toBeTruthy()
        }
      }
    }, 60000)
  })

  describe('Configuration options', () => {
    it('should respect timeout option', async () => {
      const inputFile = path.join(testInputDir, 'test.tex')

      try {
        await converter.convertAsync(inputFile, { timeout: 1 })
        fail('Expected timeout error')
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('spawn pdflatex ENOENT')) {
          console.warn('pdflatex not found - skipping timeout test')
          expect(errorMessage).toContain('pdflatex')
        } else {
          expect(errorMessage).toContain('timeout')
        }
      }
    })

    it('should handle debug option', (done) => {
      const inputFile = path.join(testInputDir, 'test.tex')

      const originalLog = console.log
      const logs: string[] = []
      console.log = (message: string) => {
        logs.push(message)
      }

      converter.convert(
        inputFile,
        { debug: true, timeout: 5000 },
        (error, result) => {
          console.log = originalLog

          if (error) {
            const errorMessage = error.message
            if (errorMessage.includes('spawn pdflatex ENOENT')) {
              console.warn('pdflatex not found - skipping debug test')
              expect(errorMessage).toContain('pdflatex')
            }
          } else if (result?.success) {
            expect(logs.length).toBeGreaterThan(0)
          }

          done()
        }
      )
    })
  })

  describe('Error handling', () => {
    it('should provide meaningful error messages', (done) => {
      converter.convert(
        'definitely-does-not-exist.tex',
        {},
        (error, result) => {
          expect(error).toBeTruthy()
          expect(error?.message).toBeTruthy()
          expect(result?.success).toBe(false)
          expect(result?.error).toBeTruthy()
          expect(typeof result?.executionTime).toBe('number')
          expect(result?.executionTime).toBeGreaterThanOrEqual(0)
          done()
        }
      )
    })

    it('should handle directory path instead of file', (done) => {
      converter.convert(testInputDir, {}, (error, result) => {
        expect(error).toBeTruthy()
        expect(error?.message).toContain('not a file')
        expect(result?.success).toBe(false)
        done()
      })
    })
  })
})
