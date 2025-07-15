import * as fs from 'fs'
import * as path from 'path'
import { spawn, ChildProcess } from 'child_process'
import { FileUtils } from './utils/file-utils'
import {
  ConversionOptions,
  ConversionResult,
  ConversionCallback,
} from './types'
import process from 'process'

interface ConversionConfig {
  outputDir: string
  outputFile: string
  timeout: number
  debug: boolean
  cleanupAuxFiles: boolean
}

export class LatexToPdfConverter {
  private static readonly DEFAULT_TIMEOUT = 60000
  private static readonly DEFAULT_OUTPUT_DIR = 'output'

  /**
   * Converts a LaTeX file to PDF
   * @param input The path to the input .tex file
   * @param options Conversion options
   * @param callback Callback function to be executed upon completion
   */
  public convert(
    input: string,
    options: ConversionOptions = {},
    callback: ConversionCallback
  ): void {
    const startTime = Date.now()

    try {
      FileUtils.validateInputFile(input)
      const config = this.setupConfiguration(input, options)
      FileUtils.ensureDirectoryExists(config.outputDir)
      this.executeConversion(input, config, startTime, callback)
    } catch (error) {
      const executionTime = Date.now() - startTime
      callback(error as Error, {
        success: false,
        error: (error as Error).message,
        executionTime,
      })
    }
  }

  /**
   * Promises-based version of the conversion
   * @param {string} input The path to the input .tex file
   * @param {ConversionOptions} options Conversion options
   * @returns {Promise<ConversionResult>} A promise that resolves with the conversion result
   */
  public convertAsync(
    input: string,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    return new Promise((resolve, reject) => {
      this.convert(input, options, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result!)
        }
      })
    })
  }

  /**
   * Generates a PDF from LaTeX content
   * @param {string} latexContent The LaTeX content to convert
   * @param {string} filename The name of the file to save the LaTeX content as
   * @param {ConversionOptions} options Conversion options
   * @returns {Promise<ConversionResult>} A promise that resolves with the conversion result
   */
  public async convertFromContent(
    latexContent: string,
    filename: string,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    const tempDir = path.join(process.cwd(), 'temp')
    const tempFile = path.join(tempDir, `${filename}.tex`)

    try {
      FileUtils.ensureDirectoryExists(tempDir)
      fs.writeFileSync(tempFile, latexContent, 'utf8')
      const result = await this.convertAsync(tempFile, options)
      FileUtils.safeDelete(tempFile)
      return result
    } catch (error) {
      FileUtils.safeDelete(tempFile)
      throw error
    }
  }

  /**
   * Sets up the configuration for the conversion
   * @param {string} input The path to the input .tex file
   * @param {ConversionOptions} options Conversion options
   * @returns {object} The configuration object
   */
  private setupConfiguration(input: string, options: ConversionOptions) {
    const inputParsed = path.parse(input)
    const outputDir = options.output
      ? path.parse(options.output).dir
      : LatexToPdfConverter.DEFAULT_OUTPUT_DIR

    const outputFile = options.output
      ? path.parse(options.output).name
      : inputParsed.name

    return {
      outputDir,
      outputFile,
      timeout: options.timeout ?? LatexToPdfConverter.DEFAULT_TIMEOUT,
      debug: options.debug ?? false,
      cleanupAuxFiles: options.cleanupAuxFiles ?? true,
    }
  }

  /**
   * Executes the conversion process using pdflatex
   * @param {string} input The path to the input .tex file
   * @param {object} config The configuration object
   * @param {number} startTime The start time of the conversion
   * @param {ConversionCallback} callback The callback function
   * @returns {void}
   */
  private executeConversion(
    input: string,
    config: ConversionConfig,
    startTime: number,
    callback: ConversionCallback
  ): void {
    let processKilled = false
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let outputBuffer = ''
    let errorBuffer = ''

    const pdflatexProcess: ChildProcess = spawn('pdflatex', [
      '--jobname',
      config.outputFile,
      '-output-directory',
      config.outputDir,
      input,
    ])

    pdflatexProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString()
      outputBuffer += output

      if (config.debug) {
        console.log('STDOUT:', output)
      }
    })

    pdflatexProcess.stderr?.on('data', (data: Buffer) => {
      const error = data.toString()
      errorBuffer += error

      if (config.debug) {
        console.error('STDERR:', error)
      }
    })

    pdflatexProcess.on('exit', (code: number | null) => {
      const executionTime = Date.now() - startTime

      if (config.cleanupAuxFiles) {
        this.cleanupAuxiliaryFiles(config.outputDir, config.outputFile)
      }

      if (processKilled) {
        callback(new Error('Conversion timeout'), {
          success: false,
          error: 'Process timed out',
          executionTime,
        })
        return
      }

      if (code === 0) {
        const outputPath = path.join(
          config.outputDir,
          `${config.outputFile}.pdf`
        )

        if (fs.existsSync(outputPath)) {
          callback(null, {
            success: true,
            outputPath,
            executionTime,
          })
        } else {
          callback(new Error('PDF file was not created'), {
            success: false,
            error: 'PDF file was not created',
            executionTime,
          })
        }
      } else {
        callback(new Error(`pdflatex failed with code ${code}`), {
          success: false,
          error: `pdflatex failed with code ${code}. Error: ${errorBuffer}`,
          executionTime,
        })
      }
    })

    pdflatexProcess.on('error', (error: Error) => {
      const executionTime = Date.now() - startTime
      callback(error, {
        success: false,
        error: `Process error: ${error.message}`,
        executionTime,
      })
    })

    const timeoutId = setTimeout(() => {
      processKilled = true
      pdflatexProcess.kill('SIGTERM')

      setTimeout(() => {
        if (!pdflatexProcess.killed) {
          pdflatexProcess.kill('SIGKILL')
        }
      }, 5000)
    }, config.timeout)

    pdflatexProcess.on('exit', () => {
      clearTimeout(timeoutId)
    })
  }

  /**
   * Cleans up auxiliary files generated during the conversion
   * @param {string} outputDir The output directory
   * @param {string} outputFile The base name of the output file (without extension)
   * @returns {void}
   */
  private cleanupAuxiliaryFiles(outputDir: string, outputFile: string): void {
    const auxiliaryExtensions = ['.aux', '.log', '.out', '.toc', '.nav', '.snm']

    auxiliaryExtensions.forEach((ext) => {
      const filePath = path.join(outputDir, `${outputFile}${ext}`)
      FileUtils.safeDelete(filePath)
    })
  }
}
