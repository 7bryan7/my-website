// scripts/generate-assets.ts

import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

const assets = {
  'logo.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad)" stroke-width="4" />
      <circle cx="50" cy="50" r="12" fill="url(#grad)" />
      <line x1="50" y1="12" x2="50" y2="38" stroke="url(#grad)" stroke-width="3" stroke-dasharray="2,2" />
      <line x1="50" y1="62" x2="50" y2="88" stroke="url(#grad)" stroke-width="3" stroke-dasharray="2,2" />
      <line x1="12" y1="50" x2="38" y2="50" stroke="url(#grad)" stroke-width="3" stroke-dasharray="2,2" />
      <line x1="62" y1="50" x2="88" y2="50" stroke="url(#grad)" stroke-width="3" stroke-dasharray="2,2" />
      <circle cx="50" cy="12" r="4" fill="#3b82f6" />
      <circle cx="50" cy="88" r="4" fill="#3b82f6" />
      <circle cx="12" cy="50" r="4" fill="#3b82f6" />
      <circle cx="88" cy="50" r="4" fill="#3b82f6" />
    </svg>
  `,
  'gcp-architect.jpg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#0f172a" />
      <rect x="20" y="20" width="760" height="560" fill="none" stroke="#e2e8f0" stroke-width="2" />
      <rect x="30" y="30" width="740" height="540" fill="none" stroke="#3b82f6" stroke-width="4" />
      <text x="400" y="150" fill="#f8fafc" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">GOOGLE CLOUD CERTIFIED</text>
      <text x="400" y="220" fill="#94a3b8" font-family="sans-serif" font-size="18" text-anchor="middle">This is to verify that the technology professional has completed requirements for</text>
      <text x="400" y="300" fill="#3b82f6" font-family="sans-serif" font-size="36" font-weight="bold" text-anchor="middle">Professional Cloud Architect</text>
      <text x="400" y="380" fill="#94a3b8" font-family="sans-serif" font-size="16" text-anchor="middle">Google Cloud Platform Engineering, Scaling, and Architecture</text>
      <line x1="200" y1="450" x2="600" y2="450" stroke="#475569" stroke-width="1" />
      <text x="400" y="490" fill="#64748b" font-family="sans-serif" font-size="14" text-anchor="middle">CREDENTIAL ID: GCP-PCA-9834212</text>
    </svg>
  `,
  'tensorflow-cert.jpg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#0f172a" />
      <rect x="20" y="20" width="760" height="560" fill="none" stroke="#e2e8f0" stroke-width="2" />
      <rect x="30" y="30" width="740" height="540" fill="none" stroke="#f97316" stroke-width="4" />
      <text x="400" y="150" fill="#f8fafc" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">TENSORFLOW DEVELOPER CERTIFICATE</text>
      <text x="400" y="220" fill="#94a3b8" font-family="sans-serif" font-size="18" text-anchor="middle">This certificate is proudly presented to the candidate for completing</text>
      <text x="400" y="300" fill="#f97316" font-family="sans-serif" font-size="36" font-weight="bold" text-anchor="middle">TensorFlow Developer</text>
      <text x="400" y="380" fill="#94a3b8" font-family="sans-serif" font-size="16" text-anchor="middle">Proficiency in building neural networks, Deep Learning, CV and NLP</text>
      <line x1="200" y1="450" x2="600" y2="450" stroke="#475569" stroke-width="1" />
      <text x="400" y="490" fill="#64748b" font-family="sans-serif" font-size="14" text-anchor="middle">CREDENTIAL ID: TF-DEV-5541293</text>
    </svg>
  `,
  'proj-rag.jpg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
      <rect width="800" height="450" fill="#0b0f19" />
      <rect x="40" y="40" width="720" height="370" rx="10" fill="#111827" stroke="#1f2937" stroke-width="2" />
      <circle cx="70" cy="70" r="6" fill="#ef4444" />
      <circle cx="90" cy="70" r="6" fill="#f59e0b" />
      <circle cx="110" cy="70" r="6" fill="#10b981" />
      <rect x="60" y="110" width="220" height="260" rx="6" fill="#1f2937" />
      <rect x="300" y="110" width="440" height="60" rx="6" fill="#1f2937" />
      <rect x="300" y="190" width="440" height="180" rx="6" fill="#1f2937" />
      <text x="320" y="145" fill="#94a3b8" font-family="monospace" font-size="16">Query: "How do agentic workflows scale?"</text>
      <text x="320" y="230" fill="#10b981" font-family="monospace" font-size="14">Retrieve: 3 chunks from Vector DB</text>
      <text x="320" y="260" fill="#3b82f6" font-family="monospace" font-size="14">LLM Response: "Agentic workflows scale by..."</text>
      <circle cx="170" cy="240" r="30" fill="#3b82f6" opacity="0.8" />
      <text x="170" y="245" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">RAG</text>
    </svg>
  `,
  'proj-router.jpg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
      <rect width="800" height="450" fill="#0b0f19" />
      <rect x="40" y="40" width="720" height="370" rx="10" fill="#111827" stroke="#1f2937" stroke-width="2" />
      <circle cx="70" cy="70" r="6" fill="#ef4444" />
      <circle cx="90" cy="70" r="6" fill="#f59e0b" />
      <circle cx="110" cy="70" r="6" fill="#10b981" />
      
      {/* Visual node network */}
      <circle cx="150" cy="225" r="25" fill="#3b82f6" />
      <text x="150" y="230" fill="#ffffff" font-family="sans-serif" font-size="12" text-anchor="middle">Client</text>
      
      <rect x="300" y="165" width="160" height="120" rx="8" fill="#f97316" />
      <text x="380" y="230" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Router Proxy</text>
      
      <circle cx="620" cy="140" r="20" fill="#10b981" />
      <text x="620" y="145" fill="#ffffff" font-family="sans-serif" font-size="10" text-anchor="middle">OpenAI</text>
      
      <circle cx="620" cy="225" r="20" fill="#8b5cf6" />
      <text x="620" y="230" fill="#ffffff" font-family="sans-serif" font-size="10" text-anchor="middle">Anthropic</text>

      <circle cx="620" cy="310" r="20" fill="#3b82f6" />
      <text x="620" y="315" fill="#ffffff" font-family="sans-serif" font-size="10" text-anchor="middle">Gemini</text>
      
      <line x1="175" y1="225" x2="300" y2="225" stroke="#475569" stroke-width="2" />
      <line x1="460" y1="200" x2="600" y2="150" stroke="#475569" stroke-width="2" />
      <line x1="460" y1="225" x2="600" y2="225" stroke="#475569" stroke-width="2" />
      <line x1="460" y1="250" x2="600" y2="300" stroke="#475569" stroke-width="2" />
    </svg>
  `,
  'logo-neuralflow.png': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" fill="#312e81" rx="10" />
      <circle cx="30" cy="30" r="8" fill="#818cf8" />
      <circle cx="70" cy="30" r="8" fill="#818cf8" />
      <circle cx="50" cy="70" r="8" fill="#f43f5e" />
      <line x1="30" y1="30" x2="50" y2="70" stroke="#a5b4fc" stroke-width="2" />
      <line x1="70" y1="30" x2="50" y2="70" stroke="#a5b4fc" stroke-width="2" />
      <line x1="30" y1="30" x2="70" y2="30" stroke="#a5b4fc" stroke-width="2" />
    </svg>
  `,
  'logo-cloudscale.png': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" fill="#065f46" rx="10" />
      <path d="M25 65 C 25 50, 35 40, 45 40 C 48 30, 60 25, 70 35 C 80 40, 80 55, 75 65 Z" fill="#34d399" />
      <line x1="30" y1="65" x2="70" y2="65" stroke="#ffffff" stroke-width="3" />
    </svg>
  `,
  'srv-llm.jpg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#0b1329" />
      <rect x="50" y="50" width="700" height="400" rx="12" fill="#1c2541" />
      <text x="400" y="240" fill="#5bc0be" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">LLM &amp; AGENT WORKFLOWS</text>
      <text x="400" y="290" fill="#f8fafc" font-family="sans-serif" font-size="16" text-anchor="middle">Semantic Cache • Embeddings Fine-tuning • Hybrid RAG</text>
    </svg>
  `,
  'srv-infra.jpg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#0b1329" />
      <rect x="50" y="50" width="700" height="400" rx="12" fill="#1c2541" />
      <text x="400" y="240" fill="#3b82f6" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">CLOUD SCALING &amp; KUBERNETES</text>
      <text x="400" y="290" fill="#f8fafc" font-family="sans-serif" font-size="16" text-anchor="middle">Cost Audit • Serverless Inference • Model Quantization</text>
    </svg>
  `,
  'og-image.jpg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
      <rect width="1200" height="630" fill="#030712" />
      <circle cx="1000" cy="150" r="300" fill="#2563eb" opacity="0.15" filter="blur(80px)" />
      <circle cx="100" cy="500" r="250" fill="#60a5fa" opacity="0.1" filter="blur(65px)" />
      <text x="100" y="260" fill="#ffffff" font-family="sans-serif" font-size="54" font-weight="bold">AI Practitioner</text>
      <text x="100" y="330" fill="#3b82f6" font-family="sans-serif" font-size="32" font-weight="semibold">&amp; Technology Professional</text>
      <text x="100" y="420" fill="#94a3b8" font-family="sans-serif" font-size="20">Large Language Models • Agentic Workflows • Distributed ML Scaling</text>
      <rect x="100" y="480" width="220" height="50" rx="6" fill="#2563eb" />
      <text x="210" y="512" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">View Portfolio</text>
    </svg>
  `
};

async function main() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  console.log(`Ensured uploads directory at: ${UPLOADS_DIR}`);

  // Write all SVG mock graphics
  for (const [filename, content] of Object.entries(assets)) {
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filePath, content.trim(), 'utf-8');
    console.log(`Generated graphic asset: ${filename}`);
  }

  // Generate a mock PDF resume
  const pdfPath = path.join(UPLOADS_DIR, 'resume.pdf');
  const dummyPdfContent = `%PDF-1.4
1 0 obj
<< /Title (AI Practitioner Resume) /Author (Technology Professional) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length 120 >>
stream
BT
/F1 24 Tf
70 700 Td
(AI Practitioner & Technology Professional Resume) Tj
/F1 12 Tf
0 -40 Td
(Phone: +1 555-019-2834 | Email: hello@technologyprofessional.ai) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000085 00000 n 
0000000135 00000 n 
0000000199 00000 n 
0000000318 00000 n 
0000000388 00000 n 
trailer
<< /Size 7 /Root 2 0 R >>
startxref
559
%%EOF`;

  await fs.writeFile(pdfPath, dummyPdfContent, 'utf-8');
  console.log('Generated mock resume: resume.pdf');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
