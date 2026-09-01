# FitSathi Security Specification

## 1. Data Invariants
1. **User Data Ownership**: All user metrics, logs, foods, and diet plans must match `request.auth.uid == resource.data.user_id` (or `request.auth.uid == userId` for `/profiles/{userId}`).
2. **Profile Isolation**: Profiles can only be read or modified by their verified owner (`request.auth.uid == userId`).
3. **Food Log Integrity**: Food logs must specify a valid meal type (`breakfast`, `lunch`, `dinner`, `evening_snack`, `late_snack`, `post_workout`) and non-negative numeric calories and macros.
4. **Hydration Integrity**: Water logs must contain non-negative amount in milliliters and a valid log date.
5. **Sleep & Activity Boundary**: Sleep logs and activity metrics cannot inject arbitrary untyped payloads or exceed realistic physical boundaries.
6. **No Client Query Delegation**: List queries must be guarded with `resource.data.user_id == request.auth.uid`.

## 2. The Dirty Dozen Malicious Payloads (Designed to Fail)
1. **P1 (Identity Spoofing)**: `POST /profiles/victim-user` with `auth.uid = attacker-user` -> **PERMISSION_DENIED**.
2. **P2 (Ghost Write / Overwrite)**: `PUT /food_logs/log-123` where `resource.data.user_id = userA` by `userB` -> **PERMISSION_DENIED**.
3. **P3 (PII Blanket Query)**: `GET /profiles` listing all user emails -> **PERMISSION_DENIED**.
4. **P4 (Negative Calorie Injection)**: `POST /food_logs` with `calories: -5000` -> **PERMISSION_DENIED**.
5. **P5 (Gigantic String Payload Exhaustion)**: `POST /activity_logs` with 2MB junk text in `notes` -> **PERMISSION_DENIED**.
6. **P6 (Missing User ID in Sub-Record)**: `POST /water_logs` without `user_id` -> **PERMISSION_DENIED**.
7. **P7 (Foreign User Food Record Query)**: `GET /custom_foods` querying records belonging to another UID -> **PERMISSION_DENIED**.
8. **P8 (Unauthenticated Mutation)**: `POST /sleep_logs` with `auth = null` -> **PERMISSION_DENIED**.
9. **P9 (Altering Immutable User ID)**: `UPDATE /profiles/userA` changing `id` to `userB` -> **PERMISSION_DENIED**.
10. **P10 (Invalid Diet Plan Goal Injection)**: `POST /diet_plans` with script tags in `name` exceeding 128 chars -> **PERMISSION_DENIED**.
11. **P11 (Weight Log Bypass)**: `POST /weight_logs` with `weight_kg: "invalid_string"` -> **PERMISSION_DENIED**.
12. **P12 (Orphan Log Creation)**: `POST /food_logs` attempting to set `user_id` of a non-existent account -> **PERMISSION_DENIED**.
