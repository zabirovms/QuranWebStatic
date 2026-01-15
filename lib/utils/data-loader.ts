import { readFileSync, promises as fs } from 'fs';
import { join } from 'path';
import { gunzipSync } from 'zlib';

/**
 * Load and decompress a gzip-compressed JSON file
 * Works at build time for static generation
 */
export async function loadCompressedJson<T = any>(filePath: string): Promise<T> {
  try {
    // During build, files are in public/data
    // During dev, they should also be in public/data
    // Remove 'data/' prefix if present since we're already in public/data
    const cleanPath = filePath.startsWith('data/') ? filePath.substring(5) : filePath;
    const fullPath = join(process.cwd(), 'public', 'data', cleanPath);
    
    const compressedBuffer = await fs.readFile(fullPath);
    const decompressedBuffer = gunzipSync(compressedBuffer);
    const jsonString = decompressedBuffer.toString('utf-8');
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error(`Failed to load compressed JSON from ${filePath}:`, error);
    throw new Error(
      `Failed to load compressed JSON from ${filePath}. ` +
      `Tried: ${join(process.cwd(), 'public', 'data', filePath)}. ` +
      `Error: ${error}`
    );
  }
}

/**
 * Load a regular JSON file
 */
export async function loadJson<T = any>(filePath: string): Promise<T> {
  try {
    const cleanPath = filePath.startsWith('data/') ? filePath.substring(5) : filePath;
    const fullPath = join(process.cwd(), 'public', 'data', cleanPath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(fileContent) as T;
  } catch (error) {
    console.error(`Failed to load JSON from ${filePath}:`, error);
    throw new Error(`Failed to load JSON from ${filePath}: ${error}`);
  }
}

