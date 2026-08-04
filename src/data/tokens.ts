// Access tokens for test security
// These tokens control who can access the test
// Add/remove tokens as needed for each test session

const VALID_TOKENS: string[] = [
  'ADINGANTENG',
  'MOCHIMOCHIJELEK',
  'UNRAM2025',
  'EPT-SKRIPSI-01',
  'PBINGGRIS-S8',
  'TOEFL-TEST-2025',
  'LEVELUP-001',
];

export function validateToken(token: string): boolean {
  return VALID_TOKENS.includes(token.trim().toUpperCase());
}

export function getTokenCount(): number {
  return VALID_TOKENS.length;
}
