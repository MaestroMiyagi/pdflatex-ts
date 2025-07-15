export interface ConversionOptions {
  output?: string
  timeout?: number
  debug?: boolean
  cleanupAuxFiles?: boolean
}

export interface ConversionResult {
  success: boolean
  outputPath?: string
  error?: string
  executionTime: number
}

export type ConversionCallback = (
  error: Error | null,
  result?: ConversionResult
) => void