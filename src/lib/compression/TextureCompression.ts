import * as THREE from 'three';

export interface CompressionOptions {
  format: 'BC7' | 'ETC2' | 'ASTC' | 'DXT5';
  quality: 'low' | 'medium' | 'high';
  generateMipmaps: boolean;
  maxSize: number;
}

export class TextureCompression {
  private renderer: THREE.WebGLRenderer;
  private supportedFormats: Set<string> = new Set();

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    this.detectSupportedFormats();
  }

  private detectSupportedFormats(): void {
    const gl = this.renderer.getContext();
    
    // Check for compressed texture extensions
    const extensions = [
      'WEBGL_compressed_texture_s3tc',
      'WEBGL_compressed_texture_etc',
      'WEBGL_compressed_texture_astc',
      'WEBGL_compressed_texture_etc1',
      'WEBGL_compressed_texture_pvrtc'
    ];

    extensions.forEach(ext => {
      if (gl.getExtension(ext)) {
        this.supportedFormats.add(ext);
      }
    });
  }

  public async compressTexture(
    texture: THREE.Texture,
    options: CompressionOptions
  ): Promise<THREE.CompressedTexture> {
    // Get the best supported format
    const format = this.getBestFormat(options.format);
    
    if (!format) {
      console.warn('No supported compression format found, returning original texture');
      return texture as THREE.CompressedTexture;
    }

    // Create canvas for processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Resize if needed
    const { width, height } = this.getOptimalSize(texture.image, options.maxSize);
    canvas.width = width;
    canvas.height = height;
    
    // Draw image to canvas
    ctx.drawImage(texture.image, 0, 0, width, height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    
    // Compress based on format
    const compressedData = await this.compressImageData(imageData, format, options);
    
    // Create compressed texture
    const compressedTexture = new THREE.CompressedTexture(
      compressedData.mipmaps,
      width,
      height,
      format,
      THREE.UnsignedByteType
    );
    
    // Copy texture properties
    compressedTexture.wrapS = texture.wrapS;
    compressedTexture.wrapT = texture.wrapT;
    compressedTexture.magFilter = texture.magFilter;
    compressedTexture.minFilter = texture.minFilter;
    compressedTexture.generateMipmaps = options.generateMipmaps;
    
    return compressedTexture;
  }

  private getBestFormat(preferredFormat: string): number | null {
    const gl = this.renderer.getContext();
    
    switch (preferredFormat) {
      case 'BC7':
        if (this.supportedFormats.has('WEBGL_compressed_texture_s3tc')) {
          return gl.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        }
        break;
      case 'ETC2':
        if (this.supportedFormats.has('WEBGL_compressed_texture_etc')) {
          return gl.COMPRESSED_RGBA8_ETC2_EAC;
        }
        break;
      case 'ASTC':
        if (this.supportedFormats.has('WEBGL_compressed_texture_astc')) {
          return gl.COMPRESSED_RGBA_ASTC_4x4_KHR;
        }
        break;
      case 'DXT5':
        if (this.supportedFormats.has('WEBGL_compressed_texture_s3tc')) {
          return gl.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        }
        break;
    }
    
    // Fallback to any supported format
    if (this.supportedFormats.has('WEBGL_compressed_texture_s3tc')) {
      return gl.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    }
    if (this.supportedFormats.has('WEBGL_compressed_texture_etc')) {
      return gl.COMPRESSED_RGBA8_ETC2_EAC;
    }
    
    return null;
  }

  private getOptimalSize(image: HTMLImageElement | HTMLCanvasElement, maxSize: number): { width: number; height: number } {
    let { width, height } = image;
    
    // Ensure power of 2
    width = this.nearestPowerOfTwo(width);
    height = this.nearestPowerOfTwo(height);
    
    // Clamp to max size
    if (width > maxSize || height > maxSize) {
      const scale = maxSize / Math.max(width, height);
      width = this.nearestPowerOfTwo(width * scale);
      height = this.nearestPowerOfTwo(height * scale);
    }
    
    return { width, height };
  }

  private nearestPowerOfTwo(value: number): number {
    return Math.pow(2, Math.round(Math.log2(value)));
  }

  private async compressImageData(
    imageData: ImageData,
    format: number,
    options: CompressionOptions
  ): Promise<{ mipmaps: any[] }> {
    // This is a simplified implementation
    // In a real application, you would use a proper compression library
    
    const mipmaps = [];
    let currentWidth = imageData.width;
    let currentHeight = imageData.height;
    let currentData = imageData.data;
    
    // Generate mipmaps if requested
    do {
      const compressedData = this.compressLevel(currentData, currentWidth, currentHeight, format, options);
      
      mipmaps.push({
        data: compressedData,
        width: currentWidth,
        height: currentHeight
      });
      
      if (!options.generateMipmaps) break;
      
      // Generate next mipmap level
      currentWidth = Math.max(1, currentWidth / 2);
      currentHeight = Math.max(1, currentHeight / 2);
      currentData = this.generateMipmap(currentData, currentWidth * 2, currentHeight * 2);
      
    } while (currentWidth > 1 || currentHeight > 1);
    
    return { mipmaps };
  }

  private compressLevel(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    format: number,
    options: CompressionOptions
  ): Uint8Array {
    // Simplified compression - in reality, this would use proper compression algorithms
    const blockSize = this.getBlockSize(format);
    const blocksX = Math.ceil(width / blockSize);
    const blocksY = Math.ceil(height / blockSize);
    const bytesPerBlock = this.getBytesPerBlock(format);
    
    const compressedData = new Uint8Array(blocksX * blocksY * bytesPerBlock);
    
    // Simple block-based compression simulation
    for (let y = 0; y < blocksY; y++) {
      for (let x = 0; x < blocksX; x++) {
        const blockIndex = y * blocksX + x;
        const blockData = this.extractBlock(data, x, y, blockSize, width, height);
        const compressed = this.compressBlock(blockData, format, options);
        
        compressedData.set(compressed, blockIndex * bytesPerBlock);
      }
    }
    
    return compressedData;
  }

  private getBlockSize(format: number): number {
    // Most compressed formats use 4x4 blocks
    return 4;
  }

  private getBytesPerBlock(format: number): number {
    const gl = this.renderer.getContext();
    
    switch (format) {
      case gl.COMPRESSED_RGBA_S3TC_DXT5_EXT:
        return 16;
      case gl.COMPRESSED_RGBA8_ETC2_EAC:
        return 16;
      default:
        return 8;
    }
  }

  private extractBlock(
    data: Uint8ClampedArray,
    blockX: number,
    blockY: number,
    blockSize: number,
    imageWidth: number,
    imageHeight: number
  ): Uint8Array {
    const block = new Uint8Array(blockSize * blockSize * 4);
    
    for (let y = 0; y < blockSize; y++) {
      for (let x = 0; x < blockSize; x++) {
        const pixelX = Math.min(blockX * blockSize + x, imageWidth - 1);
        const pixelY = Math.min(blockY * blockSize + y, imageHeight - 1);
        const sourceIndex = (pixelY * imageWidth + pixelX) * 4;
        const targetIndex = (y * blockSize + x) * 4;
        
        block[targetIndex] = data[sourceIndex];
        block[targetIndex + 1] = data[sourceIndex + 1];
        block[targetIndex + 2] = data[sourceIndex + 2];
        block[targetIndex + 3] = data[sourceIndex + 3];
      }
    }
    
    return block;
  }

  private compressBlock(blockData: Uint8Array, format: number, options: CompressionOptions): Uint8Array {
    // Simplified compression - just return a reduced representation
    const bytesPerBlock = this.getBytesPerBlock(format);
    const compressed = new Uint8Array(bytesPerBlock);
    
    // Simple average-based compression
    let r = 0, g = 0, b = 0, a = 0;
    const pixelCount = blockData.length / 4;
    
    for (let i = 0; i < blockData.length; i += 4) {
      r += blockData[i];
      g += blockData[i + 1];
      b += blockData[i + 2];
      a += blockData[i + 3];
    }
    
    compressed[0] = r / pixelCount;
    compressed[1] = g / pixelCount;
    compressed[2] = b / pixelCount;
    compressed[3] = a / pixelCount;
    
    return compressed;
  }

  private generateMipmap(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const newWidth = width / 2;
    const newHeight = height / 2;
    const newData = new Uint8ClampedArray(newWidth * newHeight * 4);
    
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const targetIndex = (y * newWidth + x) * 4;
        
        // Sample 2x2 block
        const x2 = x * 2;
        const y2 = y * 2;
        
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;
        
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const sx = x2 + dx;
            const sy = y2 + dy;
            
            if (sx < width && sy < height) {
              const sourceIndex = (sy * width + sx) * 4;
              r += data[sourceIndex];
              g += data[sourceIndex + 1];
              b += data[sourceIndex + 2];
              a += data[sourceIndex + 3];
              count++;
            }
          }
        }
        
        newData[targetIndex] = r / count;
        newData[targetIndex + 1] = g / count;
        newData[targetIndex + 2] = b / count;
        newData[targetIndex + 3] = a / count;
      }
    }
    
    return newData;
  }

  public getSupportedFormats(): string[] {
    return Array.from(this.supportedFormats);
  }
}