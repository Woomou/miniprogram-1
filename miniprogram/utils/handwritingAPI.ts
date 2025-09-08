/**
 * Handwriting recognition API client
 * Configure HANDWRITING_API_URL to your backend endpoint.
 * Expected response shape: { word: string, confidence?: number }
 */

const HANDWRITING_API_URL = 'https://ai.fenzhidao.com/handwriting/recognize';

interface RecognizeResponse {
  word?: string;
  confidence?: number;
  [key: string]: any;
}

export async function recognizeHandwriting(imageBase64: string): Promise<RecognizeResponse> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: HANDWRITING_API_URL,
      method: 'POST',
      header: {
        'content-type': 'application/json',
      },
      data: { imageBase64 },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve((res.data as RecognizeResponse) || {});
        } else {
          reject(new Error(`Handwriting API error ${res.statusCode}`));
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

