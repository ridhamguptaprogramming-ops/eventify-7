# Firestore Security Specification

## Data Invariants
1. `UserProfile`: Each user must have a unique profile corresponding to their Auth UID. The `role` can only be set initially or by an admin.
2. `Event`: Only admins can create or update events.
3. `Registration`: A registration must link a valid user to a valid event. Users can only register themselves.
4. `TeamMember`: Only admins can manage the core team list.
5. `Tournaments/Matches`: Controlled by admins and moderators.

## The Dirty Dozen Payloads (Identity & Integrity Attack Vectors)
1. **Identity Spoofing**: Attempting to create a user profile with a different UID.
2. **Privilege Escalation**: Attempting to update own `role` to 'admin'.
3. **Shadow Fields**: Adding an `isAdmin: true` field to a UserProfile.
4. **Orphaned Registration**: Creating a registration for an event that doesn't exist.
5. **Unauthorized Event Creation**: Non-admin attempting to create an event.
6. **Cross-User Registration**: User A trying to register User B for an event.
7. **Bypassing Invariants**: Attempting to set `registeredCount` to a negative number.
8. **ID Poisoning**: Using a 2KB string as a document ID to bloat indexed metadata.
9. **Recursive Cost Attack**: Forcing deep lookups in a list query.
10. **State Skipping**: Updating a match result without being an admin or moderator.
11. **PII Leak**: Authenticated user trying to scrape emails from all profiles.
12. **Immutable Violation**: Trying to change `createdAt` on an existing profile.

## Test Cases
- `test('Deny Identity Spoofing')`: Expect `setDoc(doc(db, 'users', 'other-uid'), { ... })` to fail for `auth.uid == 'my-uid'`.
- `test('Deny Role Update')`: User attempting to change their own role should fail `affectedKeys().hasOnly()`.
- ... (Additional tests will be in firestore.rules.test.ts)
