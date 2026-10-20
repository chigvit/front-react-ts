// User-facing messages for the guest sign-up / SMS-code flow.
export function guestFlowErrorMessage(err: any, fallback: string): string {
  const status = err?.response?.status
  if (status === 409) {
    return 'An account with this email already exists. Please log in instead (use "Forgot password" if you never set one).'
  }
  if (status === 429) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }
  return fallback
}
