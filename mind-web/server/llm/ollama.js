// Ollama LLM client for local AI inference
const http = require('http');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'localhost';
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

class OllamaClient {
  constructor() {
    this.host = OLLAMA_HOST;
    this.port = OLLAMA_PORT;
    this.defaultModel = DEFAULT_MODEL;
  }

  // Check if Ollama is available
  async isAvailable() {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: this.host,
        port: this.port,
        path: '/api/tags',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        resolve(res.statusCode === 200);
      });
      
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  }

  // List available models
  async listModels() {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: this.host,
        port: this.port,
        path: '/api/tags',
        method: 'GET',
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.models || []);
          } catch (e) {
            reject(new Error('Failed to parse models response'));
          }
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });
  }

  // Generate text from prompt
  async generate(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || 2000;

    const requestBody = {
      model,
      prompt,
      stream: false,
      options: {
        temperature,
        num_predict: maxTokens
      }
    };

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(requestBody);
      
      const req = http.request({
        hostname: this.host,
        port: this.port,
        path: '/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 120000 // 2 minute timeout for generation
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              reject(new Error(parsed.error));
            } else {
              resolve(parsed.response || '');
            }
          } catch (e) {
            reject(new Error('Failed to parse generation response'));
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Ollama connection error: ${err.message}`));
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Generation request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  // Chat completion with message history
  async chat(messages, options = {}) {
    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 0.7;

    const requestBody = {
      model,
      messages,
      stream: false,
      options: {
        temperature
      }
    };

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(requestBody);
      
      const req = http.request({
        hostname: this.host,
        port: this.port,
        path: '/api/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 120000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              reject(new Error(parsed.error));
            } else {
              resolve(parsed.message?.content || '');
            }
          } catch (e) {
            reject(new Error('Failed to parse chat response'));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Chat request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  // Get status info
  async getStatus() {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return { available: false, message: 'Ollama is not running' };
      }
      
      const models = await this.listModels();
      return {
        available: true,
        host: `${this.host}:${this.port}`,
        defaultModel: this.defaultModel,
        models: models.map(m => m.name),
        modelCount: models.length
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
}

module.exports = new OllamaClient();