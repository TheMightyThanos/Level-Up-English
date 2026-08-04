import { TestResults, UserData } from '@/types/toefl';
import { generateRecommendations, MICROSKILL_TO_MACROSKILL } from '@/data/scoring';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function downloadResultsPDF(userData: UserData, results: TestResults) {
  const raw = results.section3.raw;
  const total = results.section3.total;
  const pct = results.percentage;
  const scaled = results.section3.scaled;
  const elapsed = formatElapsed(results.completionSeconds);

  // ---- Wrong items ----
  const wrongItems = results.analysis.wrongQuestions;
  const wrongHtml = wrongItems.length > 0 ? `
    <h2 style="color:#4338ca;margin-top:25px;margin-bottom:8px;font-size:14px;">Review of Wrong Answers (${wrongItems.length})</h2>
    <table style="width:100%;border-collapse:collapse;font-size:10px;">
      <thead><tr style="background-color:#4338ca;color:white;">
        <th style="border:1px solid #ccc;padding:5px;width:5%;">#</th>
        <th style="border:1px solid #ccc;padding:5px;">Question</th>
        <th style="border:1px solid #ccc;padding:5px;width:18%;">Your Answer</th>
        <th style="border:1px solid #ccc;padding:5px;width:18%;">Correct Answer</th>
      </tr></thead>
      <tbody>
        ${wrongItems.map(q => `<tr style="background-color:#fef2f2;">
          <td style="border:1px solid #ccc;padding:5px;text-align:center;">${q.number}</td>
          <td style="border:1px solid #ccc;padding:5px;font-size:9px;">${escapeHtml(q.question)}</td>
          <td style="border:1px solid #ccc;padding:5px;font-weight:bold;color:#dc2626;font-size:9px;">${escapeHtml(q.userAnswer)}</td>
          <td style="border:1px solid #ccc;padding:5px;font-weight:bold;color:#16a34a;font-size:9px;">${escapeHtml(q.correctAnswer)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<p style="text-align:center;color:#16a34a;font-weight:bold;margin:20px 0;">All answers correct — perfect score!</p>';

  const html = `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <title>Level-Up English Full Simulation Result — ${escapeHtml(userData.name)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
    h1 { color: #4338ca; text-align: center; margin: 0 0 4px 0; font-size: 22px; }
    .subtitle { text-align: center; font-size: 11px; color: #666; margin-bottom: 20px; }
    .identity { background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 18px; }
    .identity table { width: 100%; font-size: 11px; }
    .identity td { padding: 3px 8px; }
    .identity td:first-child { font-weight: bold; width: 28%; color: #555; }
    .score-hero { display: flex; gap: 12px; margin-bottom: 20px; }
    .score-hero .main { flex: 1.4; background: linear-gradient(135deg, #4338ca, #6366f1); color: white; border-radius: 12px; padding: 22px; text-align: center; }
    .score-hero .main .raw { font-size: 52px; font-weight: 900; line-height: 1; }
    .score-hero .main .raw small { font-size: 24px; opacity: 0.7; }
    .score-hero .main .label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.85; margin-top: 6px; }
    .score-hero .side { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .kpi { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; text-align: center; flex: 1; }
    .kpi .val { font-size: 22px; font-weight: 900; color: #4338ca; line-height: 1.1; }
    .kpi .label { font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: #666; margin-top: 3px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th, td { border: 1px solid #ccc; padding: 5px; vertical-align: top; }
    thead tr { background-color: #4338ca; color: white; }
    h2 { color: #4338ca; }
    .note { font-size: 9px; color: #888; margin-top: 4px; }
    @media print { body { padding: 12px; } .score-hero .main { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <h1>Level-Up English Full Simulation Result</h1>
  <div class="subtitle">Level-Up English</div>

  <div class="identity">
    <table>
      <tr><td>Student Name</td><td>${escapeHtml(userData.name)}</td></tr>
      <tr><td>Email</td><td>${escapeHtml(userData.email)}</td></tr>
      <tr><td>WhatsApp</td><td>${escapeHtml(userData.phone)}</td></tr>
      <tr><td>Date of Test</td><td>${dateStr} ${timeStr}</td></tr>
      <tr><td>Completion Time</td><td>${elapsed}</td></tr>
    </table>
  </div>

  <div class="score-hero">
    <div class="main">
      <div class="raw">${raw}<small>/${total}</small></div>
      <div class="label">Raw Reading Score</div>
    </div>
    <div class="side">
      <div class="kpi"><div class="val">${pct}%</div><div class="label">Percentage</div></div>
      <div class="kpi"><div class="val">${scaled}</div><div class="label">EPT Reading Scaled (31–67)</div></div>
    </div>
  </div>

  ${wrongHtml}

  <div style="margin-top:25px;padding-top:12px;border-top:2px solid #4338ca;font-size:8px;color:#666;text-align:center;line-height:1.7;">
    <p>Your data is securely processed in our platform.</p>
    <p>Developed by <strong>Level-Up English Team</strong></p>
    <p style="font-style:italic;">Content adapted from CLIFFS TOEFL Preparation Guide. For educational use only.</p>
    <p style="margin-top:6px;color:#999;">Generated by Level-Up English | ${dateStr} ${timeStr}</p>
  </div>
</body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
    setTimeout(() => { try { printWindow.print(); } catch {} }, 500);
  }
}
