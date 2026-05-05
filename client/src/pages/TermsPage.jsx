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
  divider: { height: 1, background: '#1e1e1e', margin: '48px 0' },
  footer: { fontSize: 13, color: '#555', marginTop: 64, paddingTop: 32, borderTop: '1px solid #1e1e1e' },
};

export default function TermsPage() {
  return (
    <div style={s.page}>
      <div style={s.inner}>
        <a href="#/" style={s.logo}>ansa<span style={s.logoDot}>.</span></a>
        <h1 style={s.h1}>Terms of Service</h1>
        <p style={s.meta}>Effective Date: {EFFECTIVE_DATE} · {COMPANY}</p>

        <p style={s.p}>Please read these Terms of Service ("Terms") carefully before using the Ansa platform ("Service") operated by {COMPANY} ("Ansa," "we," "us," or "our"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>

        <h2 style={s.h2}>1. Description of Service</h2>
        <p style={s.p}>Ansa provides an AI-powered missed call text-back and appointment booking platform for home service businesses. The Service automatically sends SMS messages to callers who reach a business's phone number, engages them via AI-driven conversation, and facilitates appointment scheduling.</p>

        <h2 style={s.h2}>2. Eligibility</h2>
        <p style={s.p}>You must be at least 18 years old and legally authorized to operate a business in your jurisdiction to use the Service. By using Ansa, you represent and warrant that you meet these requirements.</p>

        <h2 style={s.h2}>3. Account Registration</h2>
        <p style={s.p}>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use at {EMAIL}. We are not liable for losses arising from unauthorized account access caused by your failure to secure your credentials.</p>

        <h2 style={s.h2}>4. SMS Messaging and TCPA Compliance</h2>
        <p style={s.p}>By using Ansa, you acknowledge and agree to the following:</p>
        <ul style={s.ul}>
          <li style={s.li}><strong style={{ color: '#ddd' }}>You are the "sender" of all SMS messages.</strong> Ansa acts solely as a technology platform transmitting messages on your behalf. You are solely responsible for ensuring all SMS communications comply with the Telephone Consumer Protection Act (TCPA), the CAN-SPAM Act, and all applicable federal, state, and local laws and regulations governing electronic communications.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Consent.</strong> You represent and warrant that you have obtained all necessary consents from recipients to receive SMS messages, or that your use qualifies under an applicable exemption. Missed call text-backs to individuals who called your business number are generally considered transactional communications under applicable law, but you remain solely responsible for verifying compliance in your jurisdiction.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Opt-out compliance.</strong> You agree to honor all opt-out requests promptly. Ansa may automatically process opt-out keywords (STOP, UNSUBSCRIBE, CANCEL, END, QUIT) but you remain responsible for maintaining opt-out records.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>No liability for TCPA violations.</strong> Ansa is not responsible for any TCPA or other regulatory violations arising from your use of the Service. You agree to indemnify and hold Ansa harmless from any claims, fines, or penalties arising from your SMS communications.</li>
        </ul>

        <h2 style={s.h2}>5. AI-Generated Content</h2>
        <p style={s.p}>Ansa uses artificial intelligence to generate SMS responses on your behalf. You acknowledge that:</p>
        <ul style={s.ul}>
          <li style={s.li}>AI-generated responses may contain errors, inaccuracies, or inappropriate content.</li>
          <li style={s.li}>You are solely responsible for reviewing and supervising all AI-generated communications sent to your customers.</li>
          <li style={s.li}>Ansa makes no warranty that AI responses will be accurate, appropriate, or suitable for your specific business needs.</li>
          <li style={s.li}>You will not use the Service to send deceptive, misleading, or fraudulent communications.</li>
        </ul>

        <h2 style={s.h2}>6. Acceptable Use</h2>
        <p style={s.p}>You agree not to use the Service to:</p>
        <ul style={s.ul}>
          <li style={s.li}>Send spam, unsolicited messages, or communications to individuals who have not contacted your business.</li>
          <li style={s.li}>Violate any applicable law, regulation, or third-party rights.</li>
          <li style={s.li}>Impersonate any person or entity or misrepresent your affiliation.</li>
          <li style={s.li}>Transmit harmful, offensive, threatening, defamatory, or illegal content.</li>
          <li style={s.li}>Interfere with or disrupt the integrity or performance of the Service.</li>
          <li style={s.li}>Attempt to gain unauthorized access to any part of the Service or its related systems.</li>
          <li style={s.li}>Resell or sublicense the Service without written authorization from Ansa.</li>
        </ul>
        <p style={s.p}>We reserve the right to suspend or terminate your account immediately for violations of this section without refund.</p>

        <h2 style={s.h2}>7. Subscription, Payment, and Refunds</h2>
        <p style={s.p}>Ansa offers a 30-day free trial followed by a paid subscription plan. By providing payment information, you authorize us to charge your payment method on a recurring monthly basis.</p>
        <ul style={s.ul}>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Free trial.</strong> Your free trial begins on the date of account creation and lasts 30 days. No credit card is required during the trial period.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Billing.</strong> Subscriptions are billed monthly in advance. Prices are subject to change with 30 days' notice.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Cancellation.</strong> You may cancel at any time through your account settings. Cancellation takes effect at the end of the current billing period. No partial refunds are issued.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>No refunds.</strong> All fees are non-refundable except as required by applicable law.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Failed payments.</strong> If payment fails, we may suspend your account until payment is resolved.</li>
        </ul>

        <h2 style={s.h2}>8. Third-Party Services</h2>
        <p style={s.p}>Ansa integrates with third-party services including Twilio (SMS), Stripe (payments), Google Calendar, and Supabase (data storage). Your use of these services is subject to their respective terms of service and privacy policies. Ansa is not responsible for the availability, accuracy, or actions of third-party services.</p>

        <h2 style={s.h2}>9. Intellectual Property</h2>
        <p style={s.p}>All content, features, and functionality of the Service — including but not limited to software, text, graphics, logos, and AI models — are owned by {COMPANY} and protected by applicable intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service solely for your internal business purposes.</p>
        <p style={s.p}>You retain ownership of all content and data you provide to Ansa. By using the Service, you grant Ansa a limited license to process your data solely to provide the Service.</p>

        <h2 style={s.h2}>10. Confidentiality and Data Security</h2>
        <p style={s.p}>We implement reasonable technical and organizational measures to protect your data. However, no method of transmission or storage is 100% secure. You acknowledge that you provide data at your own risk. In the event of a data breach affecting your account, we will notify you as required by applicable law.</p>

        <h2 style={s.h2}>11. Disclaimer of Warranties</h2>
        <p style={s.p}>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED OPERATION. ANSA DOES NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE WILL MEET YOUR REQUIREMENTS. USE OF THE SERVICE IS AT YOUR SOLE RISK.</p>

        <h2 style={s.h2}>12. Limitation of Liability</h2>
        <p style={s.p}>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ANSA CO LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUE, DATA, BUSINESS, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
        <p style={s.p}>IN NO EVENT SHALL ANSA'S TOTAL CUMULATIVE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE EXCEED THE GREATER OF (A) THE TOTAL FEES PAID BY YOU TO ANSA IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).</p>

        <h2 style={s.h2}>13. Indemnification</h2>
        <p style={s.p}>You agree to defend, indemnify, and hold harmless {COMPANY}, its officers, directors, employees, agents, licensors, and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any applicable law or regulation, including TCPA; (d) any SMS messages sent through the Service; (e) your violation of any third-party rights; or (f) any content or data you submit to the Service.</p>

        <h2 style={s.h2}>14. Termination</h2>
        <p style={s.p}>We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service ceases immediately. We may retain your data for up to 90 days after termination, after which it may be deleted.</p>

        <h2 style={s.h2}>15. Governing Law and Dispute Resolution</h2>
        <p style={s.p}>These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any dispute arising out of or relating to these Terms or the Service shall be resolved exclusively through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules, with proceedings conducted in Orange County, California.</p>
        <p style={s.p}><strong style={{ color: '#ddd' }}>CLASS ACTION WAIVER.</strong> You agree that any arbitration or proceeding shall be limited to the dispute between you and Ansa individually. You waive any right to participate in a class action lawsuit or class-wide arbitration.</p>
        <p style={s.p}>Notwithstanding the above, either party may seek injunctive or equitable relief in a court of competent jurisdiction in Orange County, California to prevent irreparable harm.</p>

        <h2 style={s.h2}>16. Changes to Terms</h2>
        <p style={s.p}>We reserve the right to modify these Terms at any time. We will provide notice of material changes by updating the effective date and, where appropriate, notifying you by email. Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.</p>

        <h2 style={s.h2}>17. Miscellaneous</h2>
        <ul style={s.ul}>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Entire Agreement.</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Ansa regarding the Service.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Severability.</strong> If any provision of these Terms is found invalid or unenforceable, the remaining provisions shall remain in full force and effect.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Waiver.</strong> Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Assignment.</strong> You may not assign these Terms without our prior written consent. We may assign these Terms freely.</li>
          <li style={s.li}><strong style={{ color: '#ddd' }}>Force Majeure.</strong> Ansa shall not be liable for any failure or delay in performance resulting from causes beyond our reasonable control.</li>
        </ul>

        <h2 style={s.h2}>18. Contact</h2>
        <p style={s.p}>For questions about these Terms, contact us at:<br />{COMPANY}<br />{ADDRESS}<br />{EMAIL}</p>

        <div style={s.footer}>
          <p style={{ ...s.p, color: '#555', fontSize: 13 }}>© 2026 {COMPANY}. All rights reserved. · <a href="#/privacy" style={{ color: '#3b82f6', textDecoration: 'none' }}>Privacy Policy</a> · <a href="#/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Back to Home</a></p>
        </div>
      </div>
    </div>
  );
}
