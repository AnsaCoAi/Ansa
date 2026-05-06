const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail({ to, ownerName, businessName }) {
  await resend.emails.send({
    from: 'Ansa <hello@ansaco.ai>',
    to,
    subject: `Welcome to Ansa, ${ownerName}! Your 30-day trial has started.`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="max-width:560px;margin:40px auto;padding:40px;background:#111111;border-radius:16px;border:1px solid #222;">
          <div style="font-size:28px;font-weight:700;color:#fff;margin-bottom:32px;">
            ansa<span style="color:#3b82f6;">.</span>
          </div>

          <h1 style="font-size:22px;font-weight:600;color:#fff;margin:0 0 12px 0;">
            Welcome to Ansa, ${ownerName}!
          </h1>
          <p style="font-size:15px;color:#888;line-height:1.6;margin:0 0 24px 0;">
            Your 30-day free trial is now active for <strong style="color:#fff;">${businessName}</strong>.
            Ansa is ready to handle your missed calls, text back your customers, and book appointments — automatically.
          </p>

          <div style="background:#141414;border-radius:12px;border:1px solid #222;padding:24px;margin-bottom:24px;">
            <p style="font-size:13px;font-weight:600;color:#3b82f6;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.5px;">What happens next</p>
            <ul style="margin:0;padding:0 0 0 16px;color:#aaa;font-size:14px;line-height:2;">
              <li>Missed calls to your number trigger an automatic text-back</li>
              <li>Your AI assistant handles replies and books appointments</li>
              <li>You'll see every conversation in your Ansa dashboard</li>
            </ul>
          </div>

          <a href="https://www.ansaco.ai/#/dashboard" style="display:block;text-align:center;padding:14px;background:#3b82f6;color:#fff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;margin-bottom:24px;">
            Go to your dashboard
          </a>

          <p style="font-size:13px;color:#555;text-align:center;margin:0;">
            Questions? Reply to this email — we're here to help.<br/>
            <a href="https://www.ansaco.ai" style="color:#3b82f6;text-decoration:none;">ansaco.ai</a>
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

async function sendCancellationEmail({ to, ownerName, businessName }) {
  await resend.emails.send({
    from: 'Ansa <hello@ansaco.ai>',
    to,
    subject: `Your Ansa subscription has been cancelled`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="max-width:560px;margin:40px auto;padding:40px;background:#111111;border-radius:16px;border:1px solid #222;">
          <div style="font-size:28px;font-weight:700;color:#fff;margin-bottom:32px;">
            ansa<span style="color:#3b82f6;">.</span>
          </div>

          <h1 style="font-size:22px;font-weight:600;color:#fff;margin:0 0 12px 0;">
            We're sorry to see you go, ${ownerName}.
          </h1>
          <p style="font-size:15px;color:#888;line-height:1.6;margin:0 0 24px 0;">
            Your Ansa subscription for <strong style="color:#fff;">${businessName}</strong> has been cancelled. You won't be charged going forward.
          </p>
          <p style="font-size:15px;color:#888;line-height:1.6;margin:0 0 24px 0;">
            If this was a mistake or you'd like to come back, you can reactivate anytime — your settings and history will still be there.
          </p>

          <a href="https://www.ansaco.ai/#/billing" style="display:block;text-align:center;padding:14px;background:#3b82f6;color:#fff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;margin-bottom:24px;">
            Reactivate my account
          </a>

          <p style="font-size:13px;color:#555;text-align:center;margin:0;">
            Questions? Reply to this email — we'd love to hear your feedback.<br/>
            <a href="https://www.ansaco.ai" style="color:#3b82f6;text-decoration:none;">ansaco.ai</a>
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

async function sendMonthlyReportEmail({ to, ownerName, businessName, month, missedCallsHandled, appointmentsBooked, conversationsClosed }) {
  await resend.emails.send({
    from: 'Ansa <hello@ansaco.ai>',
    to,
    subject: `Your ${month} summary — ${businessName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px;border:1px solid #222;"><tr><td style="padding:40px;">

          <!-- Logo -->
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:6px;">
            <div style="font-size:28px;font-weight:700;color:#fff;">ansa<span style="color:#3b82f6;">.</span></div>
          </td></tr><tr><td align="center" style="padding-bottom:32px;">
            <div style="font-size:12px;font-weight:700;color:#aaa;letter-spacing:1px;text-transform:uppercase;">${month} Summary</div>
          </td></tr></table>

          <!-- Heading -->
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:8px;">
            <div style="font-size:22px;font-weight:700;color:#fff;text-align:center;">Here's what Ansa did for ${businessName} this month.</div>
          </td></tr><tr><td align="center" style="padding-bottom:28px;">
            <div style="font-size:14px;color:#777;text-align:center;">Every missed call is a potential job. Here's how many we caught for you.</div>
          </td></tr></table>

          <!-- Stat boxes — fixed width, equal size -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr>
            <td width="140" align="center" style="padding:0 4px;">
              <table width="140" cellpadding="0" cellspacing="0" style="background:#141414;border:2px solid #3b82f6;border-radius:12px;"><tr><td align="center" style="padding:20px 8px;">
                <div style="font-size:42px;font-weight:800;color:#3b82f6;line-height:1;margin-bottom:8px;">${missedCallsHandled}</div>
                <div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Calls Handled</div>
              </td></tr></table>
            </td>
            <td width="140" align="center" style="padding:0 4px;">
              <table width="140" cellpadding="0" cellspacing="0" style="background:#141414;border:2px solid #22c55e;border-radius:12px;"><tr><td align="center" style="padding:20px 8px;">
                <div style="font-size:42px;font-weight:800;color:#22c55e;line-height:1;margin-bottom:8px;">${appointmentsBooked}</div>
                <div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Jobs Booked</div>
              </td></tr></table>
            </td>
            <td width="140" align="center" style="padding:0 4px;">
              <table width="140" cellpadding="0" cellspacing="0" style="background:#141414;border:2px solid #a78bfa;border-radius:12px;"><tr><td align="center" style="padding:20px 8px;">
                <div style="font-size:42px;font-weight:800;color:#a78bfa;line-height:1;margin-bottom:8px;">${conversationsClosed}</div>
                <div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Resolved</div>
              </td></tr></table>
            </td>
          </tr></table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td align="center">
            <a href="https://www.ansaco.ai/#/dashboard" style="display:block;text-align:center;padding:14px 24px;background:#3b82f6;color:#fff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;">
              View full dashboard →
            </a>
          </td></tr></table>

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="border-top:1px solid #1f1f1f;padding-top:20px;">
            <div style="font-size:13px;color:#444;margin-bottom:6px;">Ansa handled your missed calls so you could stay on the job.</div>
            <a href="https://www.ansaco.ai" style="font-size:13px;color:#3b82f6;text-decoration:none;">ansaco.ai</a>
          </td></tr></table>

        </td></tr></table>
        </td></tr></table>
      </body>
      </html>
    `,
  });
}

module.exports = { sendWelcomeEmail, sendCancellationEmail, sendMonthlyReportEmail };
