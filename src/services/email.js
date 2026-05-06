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
          <div style="font-size:28px;font-weight:700;color:#fff;margin-bottom:8px;">
            ansa<span style="color:#3b82f6;">.</span>
          </div>
          <p style="font-size:13px;color:#555;margin:0 0 32px 0;">${month} Monthly Summary</p>

          <h1 style="font-size:20px;font-weight:600;color:#fff;margin:0 0 8px 0;">Here's what Ansa did for ${businessName} this month.</h1>
          <p style="font-size:14px;color:#888;margin:0 0 32px 0;">Every missed call is a potential job. Here's how many we caught for you.</p>

          <div style="display:flex;gap:12px;margin-bottom:32px;">
            <div style="flex:1;background:#141414;border:1px solid #222;border-radius:12px;padding:20px;text-align:center;">
              <div style="font-size:36px;font-weight:700;color:#3b82f6;margin-bottom:4px;">${missedCallsHandled}</div>
              <div style="font-size:13px;color:#888;">Missed calls handled</div>
            </div>
            <div style="flex:1;background:#141414;border:1px solid #222;border-radius:12px;padding:20px;text-align:center;">
              <div style="font-size:36px;font-weight:700;color:#22c55e;margin-bottom:4px;">${appointmentsBooked}</div>
              <div style="font-size:13px;color:#888;">Appointments booked</div>
            </div>
            <div style="flex:1;background:#141414;border:1px solid #222;border-radius:12px;padding:20px;text-align:center;">
              <div style="font-size:36px;font-weight:700;color:#a78bfa;margin-bottom:4px;">${conversationsClosed}</div>
              <div style="font-size:13px;color:#888;">Conversations closed</div>
            </div>
          </div>

          <a href="https://www.ansaco.ai/#/dashboard" style="display:block;text-align:center;padding:14px;background:#3b82f6;color:#fff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;margin-bottom:24px;">
            View full dashboard
          </a>

          <p style="font-size:13px;color:#555;text-align:center;margin:0;">
            Ansa is working in the background so you don't have to.<br/>
            <a href="https://www.ansaco.ai" style="color:#3b82f6;text-decoration:none;">ansaco.ai</a>
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

module.exports = { sendWelcomeEmail, sendCancellationEmail, sendMonthlyReportEmail };
