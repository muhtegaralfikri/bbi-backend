import { Injectable, Logger } from '@nestjs/common';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';

type TranslateFormat = 'text' | 'html';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;

  constructor() {
    this.baseUrl =
      process.env.TRANSLATE_API_URL?.replace(/\/+$/, '') ??
      'https://translate.argosopentech.com';
    this.apiKey = process.env.TRANSLATE_API_KEY;
  }

  async translateText(
    text: string,
    targetLang: string = 'en',
    format: TranslateFormat = 'text',
  ): Promise<string> {
    const trimmed = text?.trim();
    if (!trimmed) {
      return text;
    }

    try {
      const translated = await this.translateViaLibre({
        q: trimmed,
        source: 'auto',
        target: targetLang,
        format,
      });

      if (translated && translated.trim().length > 0) {
        return translated;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.warn(`Primary translation failed: ${message}`);
    }

    try {
      const translated = await this.translateViaGoogle(trimmed, targetLang);
      if (translated && translated.trim().length > 0) {
        return translated;
      }
    } catch (fallbackError) {
      const message =
        fallbackError instanceof Error
          ? fallbackError.message
          : JSON.stringify(fallbackError);
      this.logger.warn(`Fallback translation failed: ${message}`);
    }

    return text;
  }

  private translateViaLibre(body: Record<string, unknown>): Promise<string> {
    return new Promise((resolve, reject) => {
      const endpoint = new URL(`${this.baseUrl}/translate`);
      const payload = JSON.stringify({
        ...body,
        ...(this.apiKey ? { api_key: this.apiKey } : {}),
      });
      const isHttps = endpoint.protocol === 'https:';

      const requestFn = isHttps ? httpsRequest : httpRequest;
      const req = requestFn(
        {
          method: 'POST',
          hostname: endpoint.hostname,
          path: `${endpoint.pathname}${endpoint.search}`,
          port: endpoint.port ? Number(endpoint.port) : undefined,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 400) {
              reject(
                new Error(
                  `Translate API responded with status ${res.statusCode}`,
                ),
              );
              return;
            }

            try {
              const parsed = JSON.parse(data);
              resolve(
                typeof parsed?.translatedText === 'string'
                  ? parsed.translatedText
                  : '',
              );
            } catch (error) {
              reject(error);
            }
          });
        },
      );

      req.on('error', reject);
      req.setTimeout(8000, () => {
        req.destroy(new Error('Translate API request timed out'));
      });

      req.write(payload);
      req.end();
    });
  }

  private translateViaGoogle(text: string, targetLang: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = new URL(
        'https://translate.googleapis.com/translate_a/single',
      );
      url.searchParams.set('client', 'gtx');
      url.searchParams.set('sl', 'auto');
      url.searchParams.set('tl', targetLang);
      url.searchParams.set('dt', 't');
      url.searchParams.set('q', text);

      const req = httpsRequest(
        {
          method: 'GET',
          hostname: url.hostname,
          path: `${url.pathname}${url.search}`,
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 400) {
              reject(
                new Error(
                  `Google translate responded with status ${res.statusCode}`,
                ),
              );
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const segments = Array.isArray(parsed?.[0]) ? parsed[0] : [];
              const translated = segments
                .map((segment: any[]) => segment?.[0] ?? '')
                .join('');
              resolve(translated);
            } catch (error) {
              reject(error);
            }
          });
        },
      );

      req.on('error', reject);
      req.setTimeout(8000, () => {
        req.destroy(new Error('Google translate request timed out'));
      });
      req.end();
    });
  }
}
