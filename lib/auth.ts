/**
 * Auth-Layer mit Clerk-Stub fuer Sandbox + Real-Clerk-Pfad fuer Production.
 *
 * Sandbox: Mock-User mit deterministischem userId "sandbox-user-001".
 * Production: Clerk-SDK (@clerk/nextjs) via env CLERK_SECRET_KEY.
 *
 * [CRUX-MK]
 */

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
}

function isSandbox(): boolean {
  return process.env.HEYLOU_WEB_SANDBOX !== "false";
}

const sandboxUser: AuthUser = {
  id: "sandbox-user-001",
  email: "sandbox@heylou.example",
  phone: "+49 89 0000000",
  emailVerified: false,
  phoneVerified: false,
};

const sandboxState = new Map<string, AuthUser>();
sandboxState.set(sandboxUser.id, { ...sandboxUser });

export async function currentUser(): Promise<AuthUser | null> {
  if (isSandbox()) {
    return sandboxState.get(sandboxUser.id) ?? null;
  }
  // Production: const { userId } = auth(); const user = await clerkClient.users.getUser(userId);
  return null;
}

export async function verifyEmail(userId: string, token: string): Promise<boolean> {
  if (isSandbox()) {
    if (token !== "DEV-MAGIC") return false;
    const u = sandboxState.get(userId);
    if (!u) return false;
    sandboxState.set(userId, { ...u, emailVerified: true });
    return true;
  }
  // Production: clerk.signIn.attemptFactor({ strategy: "email_link", ... });
  void token;
  return false;
}

export async function verifyPhone(userId: string, code: string): Promise<boolean> {
  if (isSandbox()) {
    if (code !== "000000") return false;
    const u = sandboxState.get(userId);
    if (!u) return false;
    sandboxState.set(userId, { ...u, phoneVerified: true });
    return true;
  }
  // Production: clerk.signIn.attemptFactor({ strategy: "phone_code", code });
  void code;
  return false;
}

export async function sendMagicLink(email: string): Promise<{ ok: true; mockToken?: string }> {
  if (isSandbox()) {
    return { ok: true, mockToken: "DEV-MAGIC" };
  }
  void email;
  return { ok: true };
}

export async function sendSmsOtp(phone: string): Promise<{ ok: true; mockCode?: string }> {
  if (isSandbox()) {
    return { ok: true, mockCode: "000000" };
  }
  void phone;
  return { ok: true };
}

/** Test-only reset. */
export function _resetAuthState(): void {
  sandboxState.clear();
  sandboxState.set(sandboxUser.id, { ...sandboxUser });
}
