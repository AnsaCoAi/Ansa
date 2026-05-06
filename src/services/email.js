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
        <div style="max-width:560px;margin:40px auto;padding:40px;background:#111111;border-radius:16px;border:1px solid #222;">

          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;">
            <div style="font-size:26px;font-weight:700;color:#fff;">ansa<span style="color:#3b82f6;">.</span></div>
            <div style="font-size:13px;font-weight:600;color:#aaa;letter-spacing:0.5px;text-transform:uppercase;">${month} Summary</div>
          </div>

          <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px 0;">Here's what Ansa did for ${businessName} this month.</h1>
          <p style="font-size:14px;color:#777;margin:0 0 28px 0;">Every missed call is a potential job. Here's how many we caught for you.</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td width="33%" style="padding-right:6px;">
                <div style="background:#141414;border:1px solid #3b82f6;border-radius:12px;padding:20px 12px;text-align:center;">
                  <div style="font-size:40px;font-weight:800;color:#3b82f6;line-height:1;margin-bottom:8px;">${missedCallsHandled}</div>
                  <div style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.4px;">Calls handled</div>
                </div>
              </td>
              <td width="33%" style="padding:0 3px;">
                <div style="background:#141414;border:1px solid #22c55e;border-radius:12px;padding:20px 12px;text-align:center;">
                  <div style="font-size:40px;font-weight:800;color:#22c55e;line-height:1;margin-bottom:8px;">${appointmentsBooked}</div>
                  <div style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.4px;">Jobs booked</div>
                </div>
              </td>
              <td width="33%" style="padding-left:6px;">
                <div style="background:#141414;border:1px solid #a78bfa;border-radius:12px;padding:20px 12px;text-align:center;">
                  <div style="font-size:40px;font-weight:800;color:#a78bfa;line-height:1;margin-bottom:8px;">${conversationsClosed}</div>
                  <div style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.4px;">Resolved</div>
                </div>
              </td>
            </tr>
          </table>

          <a href="https://www.ansaco.ai/#/dashboard" style="display:block;text-align:center;padding:14px;background:#3b82f6;color:#fff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;margin-bottom:28px;">
            View full dashboard →
          </a>

          <div style="border-top:1px solid #1f1f1f;padding-top:20px;text-align:center;">
            <p style="font-size:13px;color:#444;margin:0 0 6px 0;">Ansa handled your missed calls so you could stay on the job.</p>
            <a href="https://www.ansaco.ai" style="font-size:13px;color:#3b82f6;text-decoration:none;">ansaco.ai</a>
          </div>

        </div>
      </body>
      </html>
    `,
  });
}

module.exports = { sendWelcomeEmail, sendCancellationEmail, sendMonthlyReportEmail };
