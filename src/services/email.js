const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function emailWrapper(content) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
  <table width="520" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px;border:1px solid #222;"><tr><td style="padding:40px;">

    <!-- Logo -->
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:32px;">
      <div style="font-size:28px;font-weight:700;color:#fff;">ansa<span style="color:#3b82f6;">.</span></div>
    </td></tr></table>

    ${content}

    <!-- Footer -->
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="border-top:1px solid #1f1f1f;padding-top:20px;">
      <div style="font-size:13px;color:#999;margin-bottom:6px;">Questions? Reply to this email — we're here to help.</div>
      <a href="https://www.ansaco.ai" style="font-size:13px;color:#3b82f6;text-decoration:none;">ansaco.ai</a>
    </td></tr></table>

  </td></tr></table>
  </td></tr></table>
</body>
</html>`;
}

async function sendWelcomeEmail({ to, ownerName, businessName }) {
  await resend.emails.send({
    from: 'Ansa <hello@ansaco.ai>',
    to,
    subject: `Welcome to Ansa, ${ownerName}! Your 30-day trial has started.`,
    html: emailWrapper(`
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:8px;">
        <div style="font-size:22px;font-weight:700;color:#fff;text-align:center;">Welcome to Ansa, ${ownerName}!</div>
      </td></tr><tr><td align="center" style="padding-bottom:28px;">
        <div style="font-size:14px;color:#bbb;text-align:center;line-height:1.7;">
          Your 30-day free trial is now active for <strong style="color:#fff;">${businessName}</strong>.<br/>
          Ansa is ready to handle your missed calls, text back your customers,<br/>and book appointments — automatically.
        </div>
      </td></tr></table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td style="background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:24px;">
        <div style="font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">What happens next</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;font-size:14px;color:#ccc;">Missed calls trigger an automatic text-back</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#ccc;">Your AI assistant handles replies and books appointments</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#ccc;">Every conversation appears in your Ansa dashboard</td></tr>
        </table>
      </td></tr></table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td align="center">
        <a href="https://www.ansaco.ai/#/dashboard" style="display:block;text-align:center;padding:14px 24px;background:#3b82f6;color:#fff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;">
          Go to your dashboard →
        </a>
      </td></tr></table>
    `),
  });
}

async function sendCancellationEmail({ to, ownerName, businessName }) {
  await resend.emails.send({
    from: 'Ansa <hello@ansaco.ai>',
    to,
    subject: `Your Ansa subscription has been cancelled`,
    html: emailWrapper(`
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:8px;">
        <div style="font-size:22px;font-weight:700;color:#fff;text-align:center;">We're sorry to see you go, ${ownerName}.</div>
      </td></tr><tr><td align="center" style="padding-bottom:28px;">
        <div style="font-size:14px;color:#bbb;text-align:center;line-height:1.7;">
          Your Ansa subscription for <strong style="color:#fff;">${businessName}</strong> has been cancelled.<br/>
          You won't be charged going forward.
        </div>
      </td></tr></table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td style="background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:24px;">
        <div style="font-size:14px;color:#ccc;line-height:1.7;text-align:center;">
          If this was a mistake or you'd like to come back, you can reactivate anytime —<br/>
          your settings and history will still be there.
        </div>
      </td></tr></table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td align="center">
        <a href="https://www.ansaco.ai/#/billing" style="display:block;text-align:center;padding:14px 24px;background:#3b82f6;color:#fff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;">
          Reactivate my account →
        </a>
      </td></tr></table>
    `),
  });
}

async function sendMonthlyReportEmail({ to, ownerName, businessName, month, missedCallsHandled, appointmentsBooked, conversationsClosed }) {
  await resend.emails.send({
    from: 'Ansa <hello@ansaco.ai>',
    to,
    subject: `Your ${month} summary — ${businessName}`,
    headers: {
      'List-Unsubscribe': '<mailto:hello@ansaco.ai?subject=unsubscribe>',
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    html: emailWrapper(`
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:4px;">
        <div style="font-size:11px;font-weight:700;color:#999;letter-spacing:1px;text-transform:uppercase;">${month} Summary</div>
      </td></tr><tr><td align="center" style="padding-bottom:8px;">
        <div style="font-size:22px;font-weight:700;color:#fff;text-align:center;">Here's what Ansa did for ${businessName} this month.</div>
      </td></tr><tr><td align="center" style="padding-bottom:28px;">
        <div style="font-size:14px;color:#bbb;text-align:center;">Every missed call is a potential job. Here's how many we caught for you.</div>
      </td></tr></table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr>
        <td width="140" align="center" style="padding:0 4px;">
          <table width="140" cellpadding="0" cellspacing="0" style="background:#141414;border:2px solid #3b82f6;border-radius:12px;"><tr><td align="center" style="padding:20px 8px;">
            <div style="font-size:42px;font-weight:800;color:#3b82f6;line-height:1;margin-bottom:8px;">${missedCallsHandled}</div>
            <div style="font-size:11px;font-weight:700;color:#bbb;text-transform:uppercase;letter-spacing:0.5px;">Calls Handled</div>
          </td></tr></table>
        </td>
        <td width="140" align="center" style="padding:0 4px;">
          <table width="140" cellpadding="0" cellspacing="0" style="background:#141414;border:2px solid #22c55e;border-radius:12px;"><tr><td align="center" style="padding:20px 8px;">
            <div style="font-size:42px;font-weight:800;color:#22c55e;line-height:1;margin-bottom:8px;">${appointmentsBooked}</div>
            <div style="font-size:11px;font-weight:700;color:#bbb;text-transform:uppercase;letter-spacing:0.5px;">Jobs Booked</div>
          </td></tr></table>
        </td>
        <td width="140" align="center" style="padding:0 4px;">
          <table width="140" cellpadding="0" cellspacing="0" style="background:#141414;border:2px solid #a78bfa;border-radius:12px;"><tr><td align="center" style="padding:20px 8px;">
            <div style="font-size:42px;font-weight:800;color:#a78bfa;line-height:1;margin-bottom:8px;">${conversationsClosed}</div>
            <div style="font-size:11px;font-weight:700;color:#bbb;text-transform:uppercase;letter-spacing:0.5px;">Questions Answered</div>
          </td></tr></table>
        </td>
      </tr></table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td align="center">
        <a href="https://www.ansaco.ai/#/dashboard" style="display:block;text-align:center;padding:14px 24px;background:#3b82f6;color:#fff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;">
          View full dashboard →
        </a>
      </td></tr></table>
    `),
  });
}

module.exports = { sendWelcomeEmail, sendCancellationEmail, sendMonthlyReportEmail };
