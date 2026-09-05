import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assertAllowedUrl, buildCssUrl, extractUrls } from './fontOptimizer';

describe('buildCssUrl', () => {
    it('codifica la familia y los pesos', () => {
        assert.equal(
            buildCssUrl('Open Sans', [400, 700]),
            'https://fonts.googleapis.com/css2?family=Open%20Sans:wght@400;700&display=swap'
        );
    });

    it('añade ital cuando se pide cursiva', () => {
        assert.equal(
            buildCssUrl('Roboto', [400, 700], true),
            'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap'
        );
    });
});

describe('extractUrls', () => {
    it('extrae url, formato, peso y estilo', () => {
        const css = `
@font-face {
  font-family: 'Roboto';
  font-style: italic;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/roboto/v1/bold-italic.woff2) format('woff2');
}`;
        assert.deepEqual(extractUrls(css), [{
            url: 'https://fonts.gstatic.com/s/roboto/v1/bold-italic.woff2',
            format: 'woff2',
            weight: '700',
            style: 'italic',
        }]);
    });

    it('usa 400 y normal si faltan peso y estilo', () => {
        const css = `
@font-face {
  font-family: 'Roboto';
  src: url(https://fonts.gstatic.com/s/roboto/v1/regular.woff) format("woff");
}`;
        const [entry] = extractUrls(css);
        assert.equal(entry.weight, '400');
        assert.equal(entry.style, 'normal');
        assert.equal(entry.format, 'woff');
    });
});

describe('assertAllowedUrl', () => {
    it('acepta hosts de Google Fonts por HTTPS', () => {
        const parsed = assertAllowedUrl('https://fonts.gstatic.com/s/roboto/file.woff2');
        assert.equal(parsed.hostname, 'fonts.gstatic.com');
    });

    it('rechaza otro host', () => {
        assert.throws(() => assertAllowedUrl('https://evil.example/font.woff2'), /no permitido/);
    });

    it('rechaza HTTP', () => {
        assert.throws(() => assertAllowedUrl('http://fonts.googleapis.com/css2'), /HTTPS/);
    });
});
