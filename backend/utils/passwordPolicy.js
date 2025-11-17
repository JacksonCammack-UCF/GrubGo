// backend/utils/passwordPolicy.js
export const validatePasswordStrength = (password) => {
    const passwordTrimmed = (password || "").trim();
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(passwordTrimmed);
    const hasLowerCase = /[a-z]/.test(passwordTrimmed);
    const hasNumbers = /\d/.test(passwordTrimmed);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-]/.test(passwordTrimmed);

    if (passwordTrimmed.length < minLength) {
        return `Password must be at least ${minLength} characters long.`;
    }

    if (!hasUpperCase) {
        return "Password must contain at least one uppercase letter.";
    }

    if (!hasLowerCase) {
        return "Password must contain at least one lowercase letter.";
    }

    if (!hasNumbers) {
        return "Password must contain at least one number.";
    }

    if (!hasSpecialChar) {
        return "Password must contain at least one special character.";
    }

    return null; // Valid password
};
