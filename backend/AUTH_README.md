# GrubGo Authentication & OTP Module

This backend module adds secure authentication and email-based OTP flows to the GrubGo project.  
It is built with **Node.js, Express, MongoDB/Mongoose, bcrypt, Mailjet, and JWT**.

---

## Features

### Secure signup

- Validates:
  - Email format
  - Phone format
  - Password length (min 8 characters)
- Enforces unique **email** and **username**
- Stores passwords **hashed with bcrypt** (no plain-text)
- Sends an **email verification OTP** with purpose: `EMAIL_VERIFICATION`
- Marks `isEmailVerified = true` after OTP is successfully verified

---

### Flexible login + 2FA

- Login supports:
  - `email`
  - `username`
  - `identifier` (for “email or username” style inputs)
- Verifies password using **bcrypt**
- Behaviors:
  - If email **not verified**  
    → Sends a **new EMAIL_VERIFICATION OTP**  
    → Returns `status: "PENDING"` and a message telling the user to verify
  - If email **verified**  
    → Sends a **2FA OTP** with purpose: `TWO_FACTOR_AUTH`  
    → Returns `status: "PENDING"` and tells the frontend to prompt for OTP
- On successful 2FA verification:
  - Returns the user object **without** the `password` field

---

### Email verification flow

- OTP is:
  - 6 digits
  - Hashed with bcrypt before storing
  - Stored in a `UserOTPVerification` collection with:
    - `userId`
    - `otp` (hashed)
    - `createdAt`
    - `expiresAt`
    - `purpose`
    - `attempts` counter
- For `/api/auth/verify-email-otp`:
  - If OTP is valid → email is marked verified (`isEmailVerified = true`)
  - If OTP is **expired** → old records are deleted and a **new OTP is sent**
  - If there are **too many wrong attempts** → old records are deleted and a **new OTP is sent**
  - The controller may return:
    - Normal success: `{ message: "Email OTP verified successfully!" }`
    - Or a resend response: `{ status: "RESEND", message: "...", data: { userId, email, purpose } }`

---

### Password reset flow

1. **Request reset** – `POST /api/auth/request-password-reset-otp`
   - Input: `{ "email": "user@example.com" }`
   - If the email exists:
     - Sends a `PASSWORD_RESET` OTP to that email
   - If the email does *not* exist:
     - Does **not** reveal that fact (prevents user enumeration)
   - In both cases, returns a generic message:
     - `"If an account with that email exists, a password reset code has been sent."`

2. **Verify reset OTP** – `POST /api/auth/verify-password-reset-otp`
   - Input: `{ "userId": "...", "otp": "123456" }`
   - If OTP is valid and not expired:
     - Returns a short-lived **`password_reset_token` (JWT, 10 minutes)**
   - If OTP is expired or attempts exceeded:
     - Old records are deleted
     - A **new OTP** is sent
     - Returns:  
       `{ status: "RESEND", message: "...", data: { userId, email, purpose } }`

3. **Reset password** – `POST /api/auth/reset-password`
   - Input: `{ "password_reset_token": "...", "newPassword": "NewPass123!" }`
   - Verifies and decodes the token using `JWT_SECRET`
   - Hashes the new password with bcrypt
   - Updates the user’s password in the database

---

### Security extras

- **Password hashing**: All stored passwords are bcrypt-hashed.
- **OTP hashing**: OTP codes are also stored hashed.
- **Rate limiting for OTP requests**:
  - Max **3 OTPs per user per purpose** per **10 minutes**
- **Brute-force protection on OTPs**:
  - Tracks `attempts` per OTP record
  - Max **5 incorrect attempts** before that OTP is invalidated
- **No user enumeration**:
  - Password reset requests always return a generic message, regardless of whether the email exists.
- **Environment safety**:
  - Requires `JWT_SECRET`, `MJ_APIKEY_PUBLIC`, `MJ_APIKEY_PRIVATE`, and `MJ_SENDER_EMAIL` in `.env`
  - Throws clear errors if these are missing
- **Email content**:
  - Includes a security notice:  
    _“Never share this code with anyone. GrubGo will never ask for this code.”_

---

## Main Endpoints

Base URL (dev): `http://localhost:5050/api`

### User routes (`/api/users`)

- `POST /api/users/signup`  
  Create a new user and send an **email verification OTP**.

- `POST /api/users/login`  
  Login with `email`, `username`, or `identifier` + `password`.

  Responses:
  - Unverified email → sends EMAIL_VERIFICATION OTP → `status: "PENDING"`
  - Verified email → sends 2FA OTP → `status: "PENDING"`

---

### Auth routes (`/api/auth`)

- `POST /api/auth/verify-email-otp`  
  Verify the email OTP. If needed, may resend and return `status: "RESEND"`.

- `POST /api/auth/verify-2fa-otp`  
  Verify 2FA OTP and return the user (without password). May also return `status: "RESEND"` if a new code is sent.

- `POST /api/auth/request-password-reset-otp`  
  Request password reset OTP by email.  
  Always returns a generic success-style message.

- `POST /api/auth/verify-password-reset-otp`  
  Verify reset OTP and return `password_reset_token` (or `status: "RESEND"` if a new code is sent).

- `POST /api/auth/reset-password`  
  Reset password using `password_reset_token` + `newPassword`.

---
