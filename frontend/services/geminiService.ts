// frontend/services/geminiService.ts
export interface ImageAnalysisResult {
  success: boolean;
  analysis: string;
  filename: string;
  size: number;
}

export interface MultipleImagesResult {
  success: boolean;
  results: ImageAnalysisResult[];
  totalImages: number;
}

class GeminiService {
  private baseUrl: string;

  constructor() {
    // Replace with your backend URL
    this.baseUrl = 'https://b947b14c6700.ngrok-free.app';
  }

  async analyzeImage(imageUri: string, prompt?: string): Promise<ImageAnalysisResult> {
    try {
      const formData = new FormData();
      
      // For React Native, you need to format the file object properly
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `image_${Date.now()}.jpg`,
      } as any);

      if (prompt) {
        formData.append('prompt', prompt);
      }

      const response = await fetch(`${this.baseUrl}/api/analyze-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  async analyzeMultipleImages(imageUris: string[], prompt?: string): Promise<MultipleImagesResult> {
    try {
      const formData = new FormData();
      
      imageUris.forEach((uri, index) => {
        formData.append('images', {
          uri: uri,
          type: 'image/jpeg',
          name: `image_${index}_${Date.now()}.jpg`,
        } as any);
      });

      if (prompt) {
        formData.append('prompt', prompt);
      }

      const response = await fetch(`${this.baseUrl}/api/analyze-images`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing images:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();