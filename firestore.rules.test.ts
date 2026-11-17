// Security TDD Specification Verification for firestore.rules
// Maps each of the "Dirty Dozen" adversarial payloads to the enforcing rule invariant.

export interface SecurityTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid?: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const dirtyDozenTests: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Product Create',
    collection: 'products/p1',
    operation: 'create',
    auth: null,
    payload: { id: 'p1', name: 'Test', price: 10 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Non-Admin Authenticated Product Create',
    collection: 'products/p1',
    operation: 'create',
    auth: { uid: 'u2', email: 'attacker@example.com', email_verified: true },
    payload: { id: 'p1', name: 'Test', price: 10 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Admin Email Spoof',
    collection: 'products/p1',
    operation: 'create',
    auth: { uid: 'u3', email: 'trkumikoshop@gmail.com', email_verified: false },
    payload: { id: 'p1', name: 'Test', price: 10 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Product',
    collection: 'products/p1',
    operation: 'create',
    auth: { uid: 'admin', email: 'trkumikoshop@gmail.com', email_verified: true },
    payload: { id: 'p1', name: 'Test', isFeaturedHack: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'ID Poisoning on Product Path',
    collection: 'products/bad$id',
    operation: 'create',
    auth: { uid: 'admin', email: 'trkumikoshop@gmail.com', email_verified: true },
    payload: { id: 'bad$id', name: 'Test' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Document ID Mismatch',
    collection: 'products/prod-1',
    operation: 'create',
    auth: { uid: 'admin', email: 'trkumikoshop@gmail.com', email_verified: true },
    payload: { id: 'prod-2', name: 'Test' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Negative Price / Type Poisoning',
    collection: 'products/prod-1',
    operation: 'update',
    auth: { uid: 'admin', email: 'trkumikoshop@gmail.com', email_verified: true },
    payload: { price: -50 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Oversized String Resource Poisoning',
    collection: 'products/prod-1',
    operation: 'update',
    auth: { uid: 'admin', email: 'trkumikoshop@gmail.com', email_verified: true },
    payload: { name: 'x'.repeat(500) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unbounded Image Array Attack',
    collection: 'products/prod-1',
    operation: 'update',
    auth: { uid: 'admin', email: 'trkumikoshop@gmail.com', email_verified: true },
    payload: { imageUrls: new Array(15).fill('https://example.com/a.jpg') },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Forged Timestamp or UpdatedBy Spoof',
    collection: 'products/prod-1',
    operation: 'update',
    auth: { uid: 'admin', email: 'trkumikoshop@gmail.com', email_verified: true },
    payload: { updatedBy: 'someone-else' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Admin Self-Privilege Escalation',
    collection: 'admins/u2',
    operation: 'create',
    auth: { uid: 'u2', email: 'attacker@example.com', email_verified: true },
    payload: { email: 'attacker@example.com', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Site Settings List Scraping / Unknown Collection Write',
    collection: 'site_settings',
    operation: 'list',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
];
