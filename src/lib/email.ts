import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM_ADDRESS = "FlowSphere <onboarding@resend.dev>";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

/**
 * No-ops (logging instead) when Resend isn't configured yet, so invite and
 * notification flows keep working end-to-end before real credentials exist.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[email] RESEND_API_KEY not set — skipping send. Would have emailed "${subject}" to ${to}.`);
    }
    return { success: true };
  }

  const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
