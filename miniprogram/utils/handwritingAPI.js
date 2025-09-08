/**
 * Handwriting recognition API client (JavaScript runtime version)
 * Configure HANDWRITING_API_URL to your backend endpoint.
 * Expected response shape: { word: string, confidence?: number }
 */

const HANDWRITING_API_URL = 'https://ai.fenzhidao.com/handwriting/recognize';

function recognizeHandwriting(imageBase64) {
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
          resolve(res.data || {});
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

module.exports = { recognizeHandwriting };

