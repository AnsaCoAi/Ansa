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

module.exports = { sendWelcomeEmail };
