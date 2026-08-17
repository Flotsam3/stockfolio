export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 80;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_BYTES = 72;
export const MAX_EMAIL_LENGTH = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ValidRegistration = {
   success: true;
   data: {
      name: string;
      email: string;
      password: string;
   };
};

type InvalidRegistration = {
   success: false;
   error: string;
};

export function normalizeEmail(email: string) {
   return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
   return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}

export function getPasswordValidationError(password: string) {
   if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
   }

   if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
      return `Password must not exceed ${MAX_PASSWORD_BYTES} bytes`;
   }

   return null;
}

export function validateRegistrationInput(input: unknown): ValidRegistration | InvalidRegistration {
   if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return { success: false, error: "Invalid registration data" };
   }

   const body = input as Record<string, unknown>;
   if (typeof body.name !== "string" || typeof body.email !== "string" || typeof body.password !== "string") {
      return { success: false, error: "Name, email and password must be strings" };
   }

   const name = body.name.trim();
   const email = normalizeEmail(body.email);
   const password = body.password;

   if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
      return {
         success: false,
         error: `Name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters`,
      };
   }

   if (!isValidEmail(email)) {
      return { success: false, error: "A valid email address is required" };
   }

   const passwordError = getPasswordValidationError(password);
   if (passwordError) {
      return { success: false, error: passwordError };
   }

   return { success: true, data: { name, email, password } };
}
