# GrubGo Authentication & OTP Module

This backend module adds secure authentication and email-based OTP flows to the GrubGo project.  
It is built with **Node.js**, **Express**, **MongoDB/Mongoose**, **bcrypt**, **Mailjet**, and **JWT**.

## Features

- **Secure signup**
  - Input validation (email, phone, password length).
  - Unique email + username checks.
  - Passwords hashed with **bcrypt** (no plain-text).
  - Sends an **email verification OTP** (`EMAIL_VERIFICATION`).

- **Flexible login + 2FA**
  - Login using **email**, **username**, or a generic `identifier` (“email or username” field).
  - Verifies password with bcrypt.
  - If email is **not verified**:
    - Sends a fresh `EMAIL_VERIFICATION` OTP.
  - If email **is verified**:
    - Sends a **2FA OTP** (`TWO_FACTOR_AUTH`) to the user’s email.
  - 2FA verification returns the user object **without the password**.

- **Password reset flow**
  - Request reset via email → sends `PASSWORD_RESET` OTP.
  - Verify OTP → returns a short-lived `password_reset_token` (JWT).
  - Reset password using that token (new password is hashed with bcrypt).

## Main Endpoints

Base URL (dev): `http://localhost:5050/api`

### User routes (`/api/users`)

- `POST /api/users/signup`  
  Create a new user and send an email verification OTP.

- `POST /api/users/login`  
  Login with `email`, `username`, or `identifier` + `password`.  
  - If email unverified → sends verification OTP.  
  - If email verified → sends 2FA OTP.

### Auth routes (`/api/auth`)

- `POST /api/auth/verify-email-otp`  
  Verify the email OTP and set `isEmailVerified = true`.

- `POST /api/auth/verify-2fa-otp`  
  Verify 2FA OTP and return the user (password omitted).

- `POST /api/auth/request-password-reset-otp`  
  Send a password reset OTP to the given email.

- `POST /api/auth/verify-password-reset-otp`  
  Verify reset OTP and return a `password_reset_token` (JWT).

- `POST /api/auth/reset-password`  
  Use `password_reset_token` + `newPassword` to update the password.

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Auth & Security:** bcrypt, JWT, OTP codes (Mailjet)
- **Email:** Mailjet API
