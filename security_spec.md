# Security Specification — TR-KUMIKO Storefront & Admin CMS

## 1. Data Invariants
1. **Admin-Only Mutations:** Only an authenticated user with `email_verified == true` and either the bootstrapped admin email (`trkumikoshop@gmail.com`) or an existing `/admins/{uid}` document can create, update, or delete `site_settings`, `products`, or `blog_posts`.
2. **Public Catalog Read:** `site_settings/main`, `products/{productId}`, and `blog_posts/{postId}` are intentionally public storefront content; `site_settings` disallows arbitrary collection listing (`allow list: if false` — only `get` on `'main'`).
3. **Strict Schema & Key Allowlisting:** All writes must contain exact required keys and zero shadow/ghost fields (`keys().hasAll(...) && keys().hasOnly(...)`).
4. **Path ID & Value Integrity:** All document IDs (`productId`, `postId`, `adminId`) must match `^[a-zA-Z0-9_\-]+$` and length `<= 128`. `incoming().id == productId` / `postId` must hold on writes.
5. **Temporal & Author Integrity:** `updatedAt` must equal `request.time` and `updatedBy` must equal `request.auth.uid` on every create/update.
6. **Bounded Arrays & Strings:** `imageUrls` max size 10, `categories` max size 50, `categoryFamilies` max size 50, and all strings strictly bounded to prevent resource exhaustion / 1MB document poisoning.
7. **Self-Privilege Prevention:** `/admins/{adminId}` is never writable from any client SDK (`allow create, update, delete: if false`).

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Product Create:** Unauthenticated client attempts `setDoc(doc(db, 'products', 'p1'), validProduct)` -> DENIED (not admin).
2. **Non-Admin Authenticated Product Create:** Signed-in user (`attacker@gmail.com`, `email_verified: true`) attempts `setDoc(doc(db, 'products', 'p1'), validProduct)` -> DENIED (not admin).
3. **Unverified Admin Email Spoof:** User with `email: 'trkumikoshop@gmail.com'` and `email_verified: false` attempts write -> DENIED (`email_verified == true` check).
4. **Shadow Field Injection on Product:** Admin sends valid product payload + `{ isFeaturedHack: true }` -> DENIED (`hasOnly` check fails).
5. **ID Poisoning on Product Path:** Admin writes to `products/bad$id..hack` -> DENIED (`isValidId` regex fails).
6. **ID Mismatch:** Admin writes to `products/prod-1` with `{ id: 'prod-2', ... }` -> DENIED (`incoming().id == productId` fails).
7. **Negative Price / Type Poisoning:** Admin sends `{ price: -50 }` or `{ price: "free" }` -> DENIED (`price is number && price >= 0`).
8. **Oversized String / Resource Poisoning:** Admin sends `name` of 5,000 characters -> DENIED (`name.size() <= 200`).
9. **Unbounded Image Array Attack:** Admin sends `imageUrls` with 15 elements -> DENIED (`imageUrls.size() <= 10`).
10. **Forged Timestamp / Author:** Admin sends `updatedAt` from client clock or `updatedBy: 'other-uid'` -> DENIED (`updatedAt == request.time && updatedBy == request.auth.uid`).
11. **Admin Privilege Escalation:** Authenticated user writes to `/admins/{theirUid}` -> DENIED (`allow write: if false`).
12. **Arbitrary Collection Write / Site Settings List:** Client attempts write to `/unknown/doc` or `list` on `/site_settings` -> DENIED (default deny + `allow list: if false`).
