const EFFECTIVE_DATE = 'May 4, 2026';
const COMPANY = 'Ansa Co LLC';
const EMAIL = 'legal@ansaco.ai';
const ADDRESS = '2158 Loggia, Newport Beach, CA 92660';

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5', fontFamily: "'Inter', -apple-system, sans-serif", padding: '60px 24px' },
  inner: { maxWidth: 780, margin: '0 auto' },
  logo: { fontSize: 28, fontWeight: 800, color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em', display: 'inline-block', marginBottom: 48 },
  logoDot: { color: '#3b82f6' },
  h1: { fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' },
  meta: { fontSize: 14, color: '#666', marginBottom: 48 },
  h2: { fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 48, marginBottom: 12 },
  p: { fontSize: 15, color: '#a1a1aa', lineHeight: 1.8, marginBottom: 16 },
  ul: { paddingLeft: 24, marginBottom: 16 },
  li: { fontSize: 15, color: '#a1a1aa', lineHeight: 1.8, marginBottom: 6 },
  footer: { fontSize: 13, color: '#555', marginTop: 64, paddingTop: 32, borderTop: '1px solid #1e1e1e' },
};

export default function PrivacyPage() {
  return (
    <div style={s.page}>
      <div style={s.inner}>
        <a href="#/" style={s.logo}>ansa<span style={s.logoDot}>.</span></a>
        <h1 style={s.h1}>Privacy Policy</h1>
        <p style={s.meta}>Effective Date: {EFFECTIVE_DATE} · {COMPANY}</p>

        <p style={s.p}>{COMPANY} ("Ansa," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our platform and services ("Service"). Please read this policy carefully. By using the Service, you consent to the practices described herein.</p>

        <h2 style={s.h2}>1. Information We Collect</h2>
        <p style={s.p}><strong style={{ color: '#ddd' }}>Information you provide directly:</strong></p>
        <ul style={s.ul}>
          <li style={s.li}>Account registration data: name, email address, password, business name, business phone number, and business type.</li>
          <li style={s.li}>Business configuration data: business hours, services offered, AI greeting messages, and FAQ content.</li>
          <li style={s.li}>Payment information: processed and stored by Stripe. We do not store full credit card numbers.</li>
          <li style={s.li}>Communications: messages you send us via email or support channels.</li>
        </ul>
        <p style={s.p}><strong style={{ color: '#ddd' }}>Information collected automatically:</strong></p>
        <ul style={s.ul}>
          <li style={s.li}>Usage data: pages visited, features used, timestamps, and session duration.</li>
          <li style={s.li}>Device and technical data: IP address, browser type, operating system, and referring URLs.</li>
          <li style={s.li}>Log data: server logs, error reports, and API request data.</li>
        </ul>
        <p style={s.p}><strong style={{ color: '#ddd' }}>Information collected from your customers (End User Data):</strong></p>
        <ul style={s.ul}>
          <li style={s.li}>Phone numbers of individuals who called your business and were sent an automated text-back.</li>
          <li style={s.li}>SMS conversation content between the AI and your customers.</li>
          <li style={s.li}>Appointment details: customer name, requested service, and scheduled time.</li>
        </ul>
        <p style={s.p}>You are the data controller for End User Data. We process it solely on your behalf to provide the Service.</p>

        <h2 style={s.h2}>2. How We Use Your Information</h2>
        <p style={s.p}>We use the information we collect to:</p>
        <ul style={s.ul}>
          <li style={s.li}>Provide, operate, maintain, and improve the Service.</li>
          <li style={s.li}>Process transactions and manage your subscription.</li>
          <li style={s.li}>Send AI-generated SMS responses on your behalf to your customers.</li>
          <li style={s.li}>Send transactional communications such as account confirmations, billing receipts, and service updates.</li>
          <li style={s.li}>Respond to your support requests and inquiries.</li>
          <li style={s.li}>Monitor and analyze usage patterns to improve user experience.</li>
          <li style={s.li}>Detect, prevent, and address fraud, security incidents, and technical issues.</li>
          <li style={s.li}>Comply with legal obligations.</li>
        </ul>
        <p style={s.p}>We do not sell, rent, or trade your personal information or your customers' information to third parties for marketing purposes.</p>

        <h2 style={s.h2}>3. How We Share Information</h2>
        <p style={s.p}>We may share your information with:</p>
        <ul style={s.ul}>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Service providers:</strong> Third-party vendors who assist in operating the Service, including Twilio (SMS delivery), Stripe (payment processing), Supabase (database hosting), Google (calendar integration), and Anthropic (AI processing). These providers are contractually obligated to protect your information and use it only to provide services to us.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Legal compliance:</strong> We may disclose information if required by law, subpoena, court order, or governmental authority, or if we believe disclosure is necessary to protect the rights, property, or safety of Ansa, our users, or the public.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Business transfers:</strong> In the event of a merger, acquisition, or sale of all or substantially all assets, your information may be transferred. We will provide notice before your information becomes subject to a different privacy policy.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>With your consent:</strong> We may share information for other purposes with your explicit consent.</li>
        </ul>

        <h2 style={s.h2}>4. SMS Data and TCPA</h2>
        <p style={s.p}>Ansa transmits SMS messages on behalf of our business customers. End User phone numbers and conversation data are processed solely to provide the missed call text-back and booking service. We do not use End User phone numbers for our own marketing purposes. All SMS data is processed in accordance with applicable law including the Telephone Consumer Protection Act (TCPA).</p>
        <p style={s.p}>Our business customers are responsible for ensuring they have the legal basis to communicate with their customers via SMS. Ansa is a technology platform and is not responsible for the content or legality of messages sent by our customers.</p>

        <h2 style={s.h2}>5. Data Retention</h2>
        <p style={s.p}>We retain your account data for as long as your account is active or as needed to provide the Service. We retain End User Data (customer phone numbers and conversation records) for up to 12 months after the last interaction, unless you request earlier deletion. Upon account termination, we will delete your data within 90 days, except where retention is required by law.</p>

        <h2 style={s.h2}>6. Data Security</h2>
        <p style={s.p}>We implement industry-standard technical and organizational security measures including encryption in transit (TLS), encrypted storage, access controls, and regular security reviews. However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security and encourage you to use a strong, unique password for your account.</p>

        <h2 style={s.h2}>7. California Residents — CCPA/CPRA Rights</h2>
        <p style={s.p}>If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):</p>
        <ul style={s.ul}>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Right to Know:</strong> You may request disclosure of the categories and specific pieces of personal information we collect, use, disclose, and sell.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Right to Delete:</strong> You may request deletion of personal information we have collected, subject to certain exceptions.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Right to Correct:</strong> You may request correction of inaccurate personal information.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Right to Opt-Out:</strong> We do not sell personal information. We do not share personal information for cross-context behavioral advertising.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA/CPRA rights.</li>
        </ul>
        <p style={s.p}>To exercise these rights, contact us at {EMAIL}. We will respond within 45 days.</p>

        <h2 style={s.h2}>8. Virginia, Colorado, Connecticut, and Other State Privacy Laws</h2>
        <p style={s.p}>Residents of Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), Texas (TDPSA), and other states with comprehensive privacy laws may have similar rights to access, correct, delete, and opt out of certain processing of their personal data. To exercise these rights, contact us at {EMAIL}. We will respond within the timeframe required by your state's law (generally 45–60 days).</p>

        <h2 style={s.h2}>9. Children's Privacy</h2>
        <p style={s.p}>The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly. If you believe we have inadvertently collected such information, contact us at {EMAIL}.</p>

        <h2 style={s.h2}>10. International Users</h2>
        <p style={s.p}>The Service is operated in the United States. If you access the Service from outside the United States, your information will be transferred to and processed in the United States, where data protection laws may differ from those in your country. By using the Service, you consent to this transfer and processing.</p>

        <h2 style={s.h2}>11. Cookies and Tracking Technologies</h2>
        <p style={s.p}>We use essential cookies and similar technologies to operate the Service, maintain your session, and remember your preferences. We do not use third-party advertising cookies or cross-site tracking technologies. You may disable cookies in your browser settings, though this may affect Service functionality.</p>

        <h2 style={s.h2}>12. Third-Party Links</h2>
        <p style={s.p}>The Service may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any third-party sites you visit.</p>

        <h2 style={s.h2}>13. Changes to This Policy</h2>
        <p style={s.p}>We may update this Privacy Policy from time to time. We will notify you of material changes by updating the effective date and, where appropriate, by email. Your continued use of the Service after changes become effective constitutes acceptance of the revised policy.</p>

        <h2 style={s.h2}>14. Contact Us</h2>
        <p style={s.p}>For privacy-related questions, requests, or complaints, contact our privacy team at:<br />{COMPANY}<br />{ADDRESS}<br />{EMAIL}</p>
        <p style={s.p}>We will respond to all requests within the timeframe required by applicable law.</p>

        <div style={s.footer}>
          <p style={{ ...s.p, color: '#555', fontSize: 13 }}>© 2026 {COMPANY}. All rights reserved. · <a href="#/terms" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms of Service</a> · <a href="#/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Back to Home</a></p>
        </div>
      </div>
    </div>
  );
}
