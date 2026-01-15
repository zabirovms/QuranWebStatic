/**
 * Client-side data loader for browser environment
 * Uses fetch API to load and decompress JSON files
 */
import pako from 'pako';

export async function loadCompressedJson<T = any>(filePath: string): Promise<T> {
  try {
    // Remove 'data/' prefix if present since we're fetching from public/data
    const cleanPath = filePath.startsWith('data/') ? filePath.substring(5) : filePath;
    const url = `/data/${cleanPath}`;
    console.log(`[DataLoader] Fetching compressed JSON from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/gzip, application/json, */*',
      },
    });
    
    console.log(`[DataLoader] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error(`[DataLoader] Failed to fetch ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 200),
      });
      throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}. URL: ${url}`);
    }
    
    console.log(`[DataLoader] Successfully fetched ${url}, size: ${response.headers.get('content-length') || 'unknown'} bytes`);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log(`[DataLoader] ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);
    
    // Decompress using pako
    console.log(`[DataLoader] Decompressing with pako...`);
    let decompressedBytes: Uint8Array;
    try {
      decompressedBytes = pako.ungzip(uint8Array);
      console.log(`[DataLoader] Decompressed size: ${decompressedBytes.length} bytes`);
    } catch (decompressError) {
      console.error(`[DataLoader] Decompression failed:`, decompressError);
      throw new Error(`Failed to decompress ${filePath}: ${decompressError instanceof Error ? decompressError.message : String(decompressError)}`);
    }
    
    const jsonString = new TextDecoder('utf-8').decode(decompressedBytes);
    console.log(`[DataLoader] Decoded JSON string length: ${jsonString.length} characters`);
    
    console.log(`[DataLoader] Parsing JSON...`);
    const parsed = JSON.parse(jsonString) as T;
    console.log(`[DataLoader] Successfully parsed ${url}`);
    return parsed;
  } catch (error) {
    console.error(`[DataLoader] Failed to load compressed JSON from ${filePath}:`, error);
    if (error instanceof Error) {
      console.error('[DataLoader] Error message:', error.message);
      console.error('[DataLoader] Error stack:', error.stack);
    }
    throw error;
  }
}

// Alias for backward compatibility
export async function loadCompressedJsonClient<T = any>(filePath: string): Promise<T> {
  return loadCompressedJson<T>(filePath);
}

export async function loadJson<T = any>(filePath: string): Promise<T> {
  try {
    const cleanPath = filePath.startsWith('data/') ? filePath.substring(5) : filePath;
    const response = await fetch(`/data/${cleanPath}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`Failed to load JSON from ${filePath}:`, error);
    throw new Error(`Failed to load JSON from ${filePath}: ${error}`);
  }
}


