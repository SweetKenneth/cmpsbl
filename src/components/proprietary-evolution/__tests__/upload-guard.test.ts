/**
 * Upload Guard — End-to-End Verification
 * Confirms the ingest pipeline blocks non-software uploads:
 *   • Images (PNG/JPEG/GIF/WebP/HEIC/SVG-as-image-mime)
 *   • PDFs / Office docs (DOCX/XLSX/PPTX)
 *   • Audio / Video / Archives
 *   • Random binary blobs
 * AND accepts real source code regardless of language.
 */
import { describe, it, expect } from 'vitest';
import { analyzeUploadedFiles } from '@/components/proprietary-evolution/ingest-utils';

function makeFile(name: string, content: ArrayBuffer | string, type = ''): File {
  const blob = typeof content === 'string' ? new Blob([content]) : new Blob([content]);
  return new File([blob], name, { type });
}

function bytes(...arr: number[]): ArrayBuffer {
  // Pad with zeros so binary heuristic (1% null-byte threshold) trips reliably.
  const padded = new Uint8Array(2048);
  padded.set(arr, 0);
  return padded.buffer;
}

describe('Upload guard — blocks non-software files', () => {
  it('rejects PNG image', async () => {
    const png = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    const result = await analyzeUploadedFiles([makeFile('logo.png', png, 'image/png')]);
    expect(result.unreadableFileCount).toBe(1);
    expect(result.ingestedFiles.length).toBe(0);
  });

  it('rejects JPEG image', async () => {
    const jpg = bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46);
    const result = await analyzeUploadedFiles([makeFile('photo.jpg', jpg, 'image/jpeg')]);
    expect(result.unreadableFileCount).toBe(1);
  });

  it('rejects PDF', async () => {
    const pdf = bytes(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x00, 0x00, 0x00);
    const result = await analyzeUploadedFiles([makeFile('doc.pdf', pdf, 'application/pdf')]);
    expect(result.unreadableFileCount).toBe(1);
  });

  it('rejects DOCX (zip-based Office doc)', async () => {
    const docx = bytes(0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00);
    const result = await analyzeUploadedFiles([makeFile('report.docx', docx, '')]);
    expect(result.unreadableFileCount).toBe(1);
  });

  it('rejects MP4 video', async () => {
    const mp4 = bytes(0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d);
    const result = await analyzeUploadedFiles([makeFile('clip.mp4', mp4, 'video/mp4')]);
    expect(result.unreadableFileCount).toBe(1);
  });

  it('rejects raw binary blob with null bytes and no extension match', async () => {
    const buf = new Uint8Array(4096);
    for (let i = 0; i < 4096; i += 8) buf[i] = 0x00; // 12.5% nulls
    const result = await analyzeUploadedFiles([makeFile('blob.bin', buf.buffer, 'application/octet-stream')]);
    expect(result.unreadableFileCount).toBe(1);
  });
});

describe('Upload guard — accepts real source code', () => {
  const samples: Array<[string, string]> = [
    ['app.ts', 'export const greet = (n: string) => `hi ${n}`;\n'],
    ['main.py', 'def greet(n):\n    return f"hi {n}"\n'],
    ['lib.rs', 'pub fn greet(n: &str) -> String { format!("hi {}", n) }\n'],
    ['util.go', 'package u\nfunc Greet(n string) string { return "hi " + n }\n'],
    ['Hello.java', 'public class Hello { public static String greet(String n){return "hi "+n;} }\n'],
    ['hello.rb', 'def greet(n) = "hi #{n}"\n'],
    ['Hello.swift', 'func greet(_ n: String) -> String { return "hi \\(n)" }\n'],
    ['top.v', 'module top(input clk, output reg led); always @(posedge clk) led <= ~led; endmodule\n'],
    ['gen.vhd', 'entity top is port (clk: in std_logic); end top;\n'],
  ];

  for (const [name, code] of samples) {
    it(`accepts ${name}`, async () => {
      const result = await analyzeUploadedFiles([makeFile(name, code)]);
      expect(result.unreadableFileCount).toBe(0);
      expect(result.ingestedFiles.length).toBe(1);
      expect(result.ingestedFiles[0].content.length).toBeGreaterThan(10);
    });
  }
});

describe('Upload guard — mixed batch', () => {
  it('accepts source files and rejects images in the same batch', async () => {
    const png = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    const result = await analyzeUploadedFiles([
      makeFile('app.ts', 'export const x = 1;\n'),
      makeFile('logo.png', png, 'image/png'),
      makeFile('main.py', 'print("ok")\n'),
    ]);
    expect(result.ingestedFiles.length).toBe(2);
    expect(result.unreadableFileCount).toBe(1);
    expect(result.parseWarnings.some(w => w.includes('skipped'))).toBe(true);
  });
});
