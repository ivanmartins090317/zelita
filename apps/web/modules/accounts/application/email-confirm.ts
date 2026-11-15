const EMAIL_CONFIRM_TYPES = {
  email: "email",
  magiclink: "magiclink",
  signup: "signup",
} as const;

const TOKEN_HASH_MAX_LENGTH = 512;
const AUTH_CODE_PATTERN = /^[A-Za-z0-9._~-]{8,512}$/;
const UNSAFE_TOKEN = /[\s<>"'`\\]/;

export type EmailConfirmType =
  (typeof EMAIL_CONFIRM_TYPES)[keyof typeof EMAIL_CONFIRM_TYPES];

export interface EmailConfirmParams {
  tokenHash: string;
  type: EmailConfirmType;
}

const AUTH_REDIRECT_PATHS = ["/familia", "/cadastro", "/entrar"] as const;

/** Aceita só o token do e-mail de acesso. Outros tipos (recuperação, convite) ficam de fora. */
export function parseEmailConfirmParams(input: {
  tokenHash: string | null;
  type: string | null;
}): EmailConfirmParams | null {
  const tokenHash = input.tokenHash?.trim() ?? "";
  if (!tokenHash || tokenHash.length > TOKEN_HASH_MAX_LENGTH) return null;
  if (UNSAFE_TOKEN.test(tokenHash)) return null;

  if (
    input.type !== EMAIL_CONFIRM_TYPES.email &&
    input.type !== EMAIL_CONFIRM_TYPES.magiclink &&
    input.type !== EMAIL_CONFIRM_TYPES.signup
  ) {
    return null;
  }

  return { tokenHash, type: input.type };
}

/** Destinos que o login por e-mail pode abrir. Qualquer outro caminho cai em /entrar. */
export function isAuthRedirectPath(path: string): boolean {
  return (AUTH_REDIRECT_PATHS as readonly string[]).includes(path);
}

/**
 * Se a home receber o retorno do Supabase na query, manda para a rota que cria a sessão.
 * O caminho é sempre nosso — o parâmetro não vira URL.
 */
export function buildAuthLinkForwardPath(input: {
  code: string | null;
  tokenHash: string | null;
  type: string | null;
}): string | null {
  const parsed = parseEmailConfirmParams({
    tokenHash: input.tokenHash,
    type: input.type,
  });
  if (parsed) {
    const tokenHash = encodeURIComponent(parsed.tokenHash);
    const type = encodeURIComponent(parsed.type);
    return `/auth/confirm?token_hash=${tokenHash}&type=${type}`;
  }

  const code = input.code?.trim() ?? "";
  if (!AUTH_CODE_PATTERN.test(code)) return null;
  return `/auth/callback?code=${encodeURIComponent(code)}`;
}
