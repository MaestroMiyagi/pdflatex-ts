import * as fs from 'fs'
import * as path from 'path'

export class FileUtils {
  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  static safeDelete(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { force: true })
      }
    } catch (error) {
      console.warn(`Warning: Could not delete file ${filePath}:`, error)
    }
  }

  static validateInputFile(inputPath: string): void {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file does not exist: ${inputPath}`)
    }

    const stats = fs.statSync(inputPath)
    if (!stats.isFile()) {
      throw new Error(`Input path is not a file: ${inputPath}`)
    }

    const ext = path.extname(inputPath).toLowerCase()
    if (ext !== '.tex') {
      throw new Error(`Invalid file extension. Expected .tex, got: ${ext}`)
    }
  }
}
