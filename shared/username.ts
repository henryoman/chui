export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_PATTERN = /^[a-z0-9]+$/;
export const USERNAME_RULES_TEXT = `${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} letters/numbers, case insensitive`;

declare const usernameBrand: unique symbol;
export type Username = string & { readonly [usernameBrand]: true };

export const normalizeUsername = (raw: string): string => raw.trim().toLowerCase();

export const isValidUsername = (value: string): value is Username => {
  return (
    value.length >= USERNAME_MIN_LENGTH
    && value.length <= USERNAME_MAX_LENGTH
    && USERNAME_PATTERN.test(value)
  );
};

export const parseUsername = (raw: string): Username | null => {
  const normalized = normalizeUsername(raw);
  return isValidUsername(normalized) ? normalized : null;
};

export const parseUsernameOrThrow = (
  raw: string,
  errorMessage: string = `Username: ${USERNAME_RULES_TEXT}`,
): Username => {
  const parsed = parseUsername(raw);
  if (!parsed) {
    throw new Error(errorMessage);
  }
  return parsed;
};
