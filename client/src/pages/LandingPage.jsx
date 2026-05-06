import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, MessageSquareOff, DollarSign, Phone, MessageCircle, CalendarCheck, Zap, Bot, Calendar, LayoutDashboard, Mic, Clock, Check, ChevronDown, Star, ArrowRight, Menu, X } from 'lucide-react';

const STYLE_ID = 'ansa-landing-styles';

const injectStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .ansa-landing { font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:#0a0a0a;color:#fff;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased; }
    @keyframes ansa-fadeUp { from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)} }
    @keyframes ansa-pulse { 0%,100%{opacity:.55}50%{opacity:1} }
    @keyframes ansa-float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)} }
    @keyframes ansa-typing { 0%{opacity:.2}20%{opacity:1}100%{opacity:.2} }
    @keyframes ansa-gradient { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }
    .ansa-reveal{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease}
    .ansa-reveal.visible{opacity:1;transform:translateY(0)}
    .ansa-nav{position:fixed;top:0;left:0;right:0;z-index:100;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);background:rgba(10,10,10,.7);border-bottom:1px solid rgba(255,255,255,.06);transition:background .3s}
    .ansa-nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:16px 24px}
    .ansa-logo{font-weight:800;font-size:24px;letter-spacing:-.5px;color:#fff;text-decoration:none}
    .ansa-logo span{color:#3b82f6}
    .ansa-nav-links{display:flex;align-items:center;gap:32px}
    .ansa-nav-links a{color:#a1a1aa;text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
    .ansa-nav-links a:hover{color:#fff}
    .ansa-nav-mobile-toggle{display:none;background:none;border:none;color:#fff;cursor:pointer}
    .ansa-nav-mobile-menu{display:none;flex-direction:column;gap:16px;position:absolute;top:64px;left:0;right:0;background:rgba(10,10,10,.97);padding:24px;border-bottom:1px solid #222}
    .ansa-nav-mobile-menu a{color:#a1a1aa;text-decoration:none;font-size:15px;font-weight:500}
    .ansa-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:all .25s;text-decoration:none;border:none;font-family:inherit}
    .ansa-btn-blue{background:#3b82f6;color:#fff!important;box-shadow:0 0 20px rgba(59,130,246,.3)}
    .ansa-btn-blue:hover{background:#2563eb;box-shadow:0 0 32px rgba(59,130,246,.45);transform:translateY(-1px)}
    .ansa-btn-outline{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.15)}
    .ansa-btn-outline:hover{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.04);transform:translateY(-1px)}
    .ansa-hero{position:relative;padding:160px 24px 80px;text-align:center;overflow:hidden}
    .ansa-hero-glow{position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:720px;height:720px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.15) 0%,transparent 70%);pointer-events:none;animation:ansa-pulse 6s ease-in-out infinite}
    .ansa-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:999px;font-size:13px;font-weight:600;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.25);color:#60a5fa;margin-bottom:28px;animation:ansa-fadeUp .7s ease both}
    .ansa-hero h1{font-size:clamp(36px,5.5vw,64px);font-weight:900;line-height:1.08;max-width:820px;margin:0 auto 24px;letter-spacing:-1.5px;animation:ansa-fadeUp .7s ease .1s both}
    .ansa-hero-sub{font-size:clamp(16px,2vw,19px);color:#a1a1aa;max-width:620px;margin:0 auto 40px;line-height:1.65;animation:ansa-fadeUp .7s ease .2s both}
    .ansa-hero-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;animation:ansa-fadeUp .7s ease .3s both}
    .ansa-phone-wrap{margin:64px auto 0;max-width:380px;animation:ansa-fadeUp .8s ease .5s both}
    .ansa-phone{background:#141414;border:1px solid #2a2a2a;border-radius:28px;padding:20px 18px;position:relative;box-shadow:0 24px 80px rgba(0,0,0,.5),0 0 60px rgba(59,130,246,.08);animation:ansa-float 6s ease-in-out infinite}
    .ansa-phone-notch{width:120px;height:6px;background:#222;border-radius:99px;margin:0 auto 20px}
    .ansa-phone-header{font-size:13px;color:#a1a1aa;text-align:center;margin-bottom:18px;font-weight:500}
    .ansa-chat-bubble{padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.5;margin-bottom:10px;max-width:85%}
    .ansa-chat-incoming{background:#1e293b;color:#e2e8f0;border-bottom-left-radius:6px;margin-right:auto}
    .ansa-chat-outgoing{background:#3b82f6;color:#fff;border-bottom-right-radius:6px;margin-left:auto}
    .ansa-chat-typing{display:flex;gap:4px;padding:12px 16px;max-width:70px;background:#1e293b;border-radius:18px;border-bottom-left-radius:6px;margin-right:auto}
    .ansa-chat-typing span{width:7px;height:7px;background:#64748b;border-radius:50%;animation:ansa-typing 1.4s infinite}
    .ansa-chat-typing span:nth-child(2){animation-delay:.2s}
    .ansa-chat-typing span:nth-child(3){animation-delay:.4s}
    .ansa-section{max-width:1200px;margin:0 auto;padding:100px 24px}
    .ansa-section-label{font-size:13px;font-weight:600;color:#3b82f6;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;text-align:center}
    .ansa-section-title{font-size:clamp(28px,4vw,44px);font-weight:800;text-align:center;max-width:700px;margin:0 auto 16px;letter-spacing:-1px;line-height:1.15}
    .ansa-section-sub{font-size:17px;color:#a1a1aa;text-align:center;max-width:560px;margin:0 auto 56px;line-height:1.6}
    .ansa-problem-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .ansa-problem-card{background:#141414;border:1px solid #222;border-radius:20px;padding:36px 28px;text-align:center;transition:border-color .3s,transform .3s}
    .ansa-problem-card:hover{border-color:#333;transform:translateY(-4px)}
    .ansa-problem-icon{width:56px;height:56px;border-radius:16px;background:rgba(59,130,246,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:#3b82f6}
    .ansa-problem-stat{font-size:32px;font-weight:800;margin-bottom:8px;letter-spacing:-.5px}
    .ansa-problem-desc{font-size:15px;color:#a1a1aa;line-height:1.5}
    .ansa-steps{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:0;align-items:flex-start}
    .ansa-step-card{background:#141414;border:1px solid #222;border-radius:20px;padding:36px 24px;text-align:center;position:relative;transition:border-color .3s,transform .3s}
    .ansa-step-card:hover{border-color:#3b82f6;transform:translateY(-4px)}
    .ansa-step-num{position:absolute;top:-14px;left:50%;transform:translateX(-50%);width:28px;height:28px;border-radius:50%;background:#3b82f6;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}
    .ansa-step-icon{width:52px;height:52px;border-radius:14px;background:rgba(59,130,246,.1);display:flex;align-items:center;justify-content:center;margin:8px auto 18px;color:#3b82f6}
    .ansa-step-title{font-size:18px;font-weight:700;margin-bottom:10px}
    .ansa-step-desc{font-size:14px;color:#a1a1aa;line-height:1.6}
    .ansa-step-arrow{display:flex;align-items:center;justify-content:center;color:#3b82f6;padding-top:60px;font-size:24px;opacity:.5}
    .ansa-features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
    .ansa-feature-card{background:#141414;border:1px solid #1e1e1e;border-radius:18px;padding:32px 26px;transition:border-color .3s,transform .3s}
    .ansa-feature-card:hover{border-color:#333;transform:translateY(-3px)}
    .ansa-feature-icon{width:46px;height:46px;border-radius:12px;background:rgba(59,130,246,.08);display:flex;align-items:center;justify-content:center;margin-bottom:18px;color:#3b82f6}
    .ansa-feature-title{font-size:16px;font-weight:700;margin-bottom:8px}
    .ansa-feature-desc{font-size:14px;color:#a1a1aa;line-height:1.6}
    .ansa-testimonials{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .ansa-testimonial-card{background:#141414;border:1px solid #1e1e1e;border-radius:20px;padding:32px 28px;transition:border-color .3s}
    .ansa-testimonial-card:hover{border-color:#333}
    .ansa-testimonial-stars{display:flex;gap:3px;margin-bottom:16px;color:#facc15}
    .ansa-testimonial-text{font-size:15px;color:#d1d5db;line-height:1.65;margin-bottom:20px}
    .ansa-testimonial-author{display:flex;align-items:center;gap:12px}
    .ansa-testimonial-avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;color:#fff}
    .ansa-testimonial-name{font-size:14px;font-weight:600}
    .ansa-testimonial-biz{font-size:13px;color:#71717a}
    .ansa-pricing-grid{display:grid;grid-template-columns:1fr;gap:24px;max-width:480px;margin:0 auto}
    .ansa-pricing-card{background:#141414;border:1px solid #222;border-radius:22px;padding:40px 32px;position:relative;transition:border-color .3s,transform .3s}
    .ansa-pricing-card:hover{transform:translateY(-4px)}
    .ansa-pricing-card.popular{border-color:#3b82f6}
    .ansa-pricing-popular-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:#3b82f6;color:#fff;font-size:12px;font-weight:700;padding:4px 16px;border-radius:999px;text-transform:uppercase;letter-spacing:.5px}
    .ansa-pricing-tier{font-size:18px;font-weight:700;margin-bottom:6px}
    .ansa-pricing-price{font-size:48px;font-weight:900;letter-spacing:-2px;margin-bottom:4px}
    .ansa-pricing-price span{font-size:18px;font-weight:500;color:#71717a;letter-spacing:0}
    .ansa-pricing-subtitle{font-size:14px;color:#71717a;margin-bottom:28px}
    .ansa-pricing-features{list-style:none;padding:0;margin-bottom:32px}
    .ansa-pricing-features li{display:flex;align-items:center;gap:10px;font-size:14px;color:#d1d5db;padding:8px 0}
    .ansa-pricing-cta{display:block;width:100%;text-align:center;padding:14px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;font-family:inherit;transition:all .25s}
    .ansa-pricing-cta-primary{background:#3b82f6;color:#fff;border:none;box-shadow:0 0 20px rgba(59,130,246,.25)}
    .ansa-pricing-cta-primary:hover{background:#2563eb}
    .ansa-pricing-cta-secondary{background:transparent;color:#fff;border:1px solid #333}
    .ansa-pricing-cta-secondary:hover{border-color:#555}
    .ansa-faq-list{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
    .ansa-faq-item{background:#141414;border:1px solid #1e1e1e;border-radius:16px;overflow:hidden;transition:border-color .3s}
    .ansa-faq-item:hover{border-color:#333}
    .ansa-faq-q{width:100%;background:none;border:none;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:20px 24px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;text-align:left}
    .ansa-faq-q svg{flex-shrink:0;transition:transform .3s;color:#71717a}
    .ansa-faq-q.open svg{transform:rotate(180deg)}
    .ansa-faq-a{max-height:0;overflow:hidden;transition:max-height .35s ease}
    .ansa-faq-a.open{max-height:300px}
    .ansa-faq-a-inner{padding:0 24px 20px;font-size:14px;color:#a1a1aa;line-height:1.7}
    .ansa-final-cta{max-width:1200px;margin:0 auto 80px;padding:0 24px}
    .ansa-final-cta-inner{background:linear-gradient(135deg,#1e3a5f 0%,#1e40af 40%,#3b82f6 100%);border-radius:28px;padding:72px 40px;text-align:center;position:relative;overflow:hidden;background-size:200% 200%;animation:ansa-gradient 8s ease infinite}
    .ansa-final-cta h2{font-size:clamp(28px,4vw,40px);font-weight:800;margin-bottom:16px;letter-spacing:-.5px;position:relative}
    .ansa-final-cta p{font-size:17px;color:rgba(255,255,255,.8);margin-bottom:36px;position:relative}
    .ansa-footer{border-top:1px solid #1a1a1a;padding:40px 24px;max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
    .ansa-footer-links{display:flex;gap:24px}
    .ansa-footer-links a{color:#71717a;text-decoration:none;font-size:13px;transition:color .2s}
    .ansa-footer-links a:hover{color:#fff}
    .ansa-footer-copy{font-size:13px;color:#52525b}
    .ansa-divider{height:1px;max-width:1200px;margin:0 auto;background:linear-gradient(90deg,transparent,#222 50%,transparent)}
    @media(max-width:768px){
      .ansa-problem-grid,.ansa-testimonials{grid-template-columns:1fr}
      .ansa-features-grid{grid-template-columns:1fr}
      .ansa-steps{grid-template-columns:1fr;gap:20px}
      .ansa-step-arrow{display:none}
      .ansa-nav-links{display:none!important}
      .ansa-nav-mobile-toggle{display:block!important}
      .ansa-nav-mobile-menu.open{display:flex!important}
    }
  `;
  document.head.appendChild(style);
};

const FAQ_DATA = [
  { q:'How does Ansa connect to my phone?', a:"Ansa integrates with your existing business phone number through simple call-forwarding. When a call goes unanswered, our system detects it instantly and triggers the text-back within seconds. Setup takes less than 5 minutes with no hardware required." },
  { q:"Will callers know they're texting with AI?", a:"Our AI is trained to match your business tone and style, so conversations feel natural and human. Most customers won't notice the difference. You can customize the AI's personality, responses, and even its name to match your brand." },
  { q:"What if I want to take over a conversation?", a:"You can jump into any conversation at any time from your dashboard. The AI will seamlessly hand off to you, and the customer will never know the difference. You stay in control." },
  { q:"How fast does Ansa respond?", a:"Ansa sends the first text-back within 10-15 seconds of a missed call. Speed matters — the faster you respond, the more likely you are to win the job. Our response time beats 99% of businesses." },
  { q:"Can I customize the messages?", a:"Absolutely. You can customize the initial text-back message, train the AI on your specific services, pricing, FAQs, and service area. The AI learns from your business details to give accurate, helpful responses." },
  { q:"Is there a contract?", a:"No long-term contracts. Ansa is month-to-month, and you can cancel anytime. We believe in earning your business every month." },
];

const TESTIMONIALS = [
  { text:"I was skeptical at first, but Ansa booked 14 jobs in its first month. That's over $18,000 in revenue I would have lost. This thing pays for itself ten times over.", name:'Mike Rodriguez', biz:"Rodriguez Plumbing Co.", initials:'MR', color:'#3b82f6' },
  { text:"We're a two-man crew. We can't answer the phone when we're on a roof. Ansa catches every single call and the customers love how fast we respond. Game changer.", name:'Travis Johnson', biz:'Peak Roofing Solutions', initials:'TJ', color:'#8b5cf6' },
  { text:"My wife and I run our HVAC business together. Ansa lets us focus on the work instead of constantly checking our phones. We've grown 40% since we started using it.", name:'Sarah Chen', biz:"Chen's Heating & Air", initials:'SC', color:'#10b981' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ansa-faq-item">
      <button className={`ansa-faq-q${open?' open':''}`} onClick={() => setOpen(!open)}>{q}<ChevronDown size={18} /></button>
      <div className={`ansa-faq-a${open?' open':''}`}><div className="ansa-faq-a-inner">{a}</div></div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const revealRef = useRef(null);

  useEffect(() => {
    injectStyles();
    const timer = setTimeout(() => {
      const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.12 });
      document.querySelectorAll('.ansa-reveal').forEach(el => obs.observe(el));
      revealRef.current = obs;
    }, 100);
    return () => { clearTimeout(timer); revealRef.current?.disconnect(); };
  }, []);

  const scrollTo = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); setMobileOpen(false); };

  return (
    <div className="ansa-landing">
      <nav className="ansa-nav">
        <div className="ansa-nav-inner">
          <a href="#/" className="ansa-logo">ansa<span>.</span></a>
          <div className="ansa-nav-links">
            <a href="#how-it-works" onClick={scrollTo('how-it-works')}>How It Works</a>
            <a href="#pricing" onClick={scrollTo('pricing')}>Pricing</a>
            <a href="#faq" onClick={scrollTo('faq')}>FAQ</a>
            <a href="#/login" style={{ color:'#a1a1aa',textDecoration:'none',fontSize:'14px',fontWeight:'500' }}>Log In</a>
            <a href="#/signup" className="ansa-btn ansa-btn-blue" style={{ padding:'10px 22px',fontSize:14,color:'#fff' }}>Get Started</a>
          </div>
          <button className="ansa-nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className={`ansa-nav-mobile-menu${mobileOpen?' open':''}`}>
          <a href="#how-it-works" onClick={scrollTo('how-it-works')}>How It Works</a>
          <a href="#pricing" onClick={scrollTo('pricing')}>Pricing</a>
          <a href="#faq" onClick={scrollTo('faq')}>FAQ</a>
          <a href="#/login" style={{ color:'#a1a1aa',textDecoration:'none',fontSize:'15px',fontWeight:'500' }}>Log In</a>
          <a href="#/signup" className="ansa-btn ansa-btn-blue" style={{ padding:'10px 22px',fontSize:14,textAlign:'center',color:'#fff' }}>Get Started</a>
        </div>
      </nav>

      <section className="ansa-hero">
        <div className="ansa-hero-glow" />
        <div className="ansa-hero-badge"><Zap size={14} /> Built for Home Service Pros</div>
        <h1>Never Lose Another Customer to a Missed Call</h1>
        <p className="ansa-hero-sub">Ansa automatically texts back missed callers, answers their questions with AI, and books appointments — so you never lose a job again.</p>
        <div className="ansa-hero-ctas">
          <a href="#/signup" className="ansa-btn ansa-btn-blue">Start Free Trial <ArrowRight size={16} /></a>
          <a href="#how-it-works" className="ansa-btn ansa-btn-outline" onClick={scrollTo('how-it-works')}>See How It Works</a>
        </div>
        <div className="ansa-phone-wrap">
          <div className="ansa-phone">
            <div className="ansa-phone-notch" />
            <div className="ansa-phone-header"><strong>Ansa</strong> · Text Conversation</div>
            <div className="ansa-chat-bubble ansa-chat-incoming">Hey! Thanks for calling Mike's Plumbing. We missed your call — how can we help? 🔧</div>
            <div className="ansa-chat-bubble ansa-chat-outgoing">Hi! I have a leaking faucet in my kitchen. Can someone come out today?</div>
            <div className="ansa-chat-bubble ansa-chat-incoming">Absolutely! We have a 2:00 PM slot available today. Want me to book that for you?</div>
            <div className="ansa-chat-bubble ansa-chat-outgoing">Yes, that works perfectly!</div>
            <div className="ansa-chat-bubble ansa-chat-incoming">You're all set! ✅ Confirmed for today at 2:00 PM. We'll text you when we're on the way.</div>
            <div className="ansa-chat-typing"><span /><span /><span /></div>
          </div>
        </div>
      </section>

      <div className="ansa-divider" />

      <section className="ansa-section" id="problem">
        <div className="ansa-reveal">
          <p className="ansa-section-label">The Problem</p>
          <h2 className="ansa-section-title">You're Losing Money Every Time You Miss a Call</h2>
          <p className="ansa-section-sub">When you can't pick up the phone, your next customer calls the competition instead.</p>
        </div>
        <div className="ansa-problem-grid ansa-reveal">
          {[
            { icon:<PhoneOff size={26}/>, stat:'62%', desc:"of calls to home service businesses go unanswered during work hours" },
            { icon:<MessageSquareOff size={26}/>, stat:'85%', desc:"of callers won't leave a voicemail — they just call the next company" },
            { icon:<DollarSign size={26}/>, stat:'$1,200', desc:"average revenue lost per missed call for home service businesses" },
          ].map((item,i) => (
            <div className="ansa-problem-card" key={i}>
              <div className="ansa-problem-icon">{item.icon}</div>
              <div className="ansa-problem-stat">{item.stat}</div>
              <div className="ansa-problem-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="ansa-divider" />

      <section className="ansa-section" id="how-it-works">
        <div className="ansa-reveal">
          <p className="ansa-section-label">How It Works</p>
          <h2 className="ansa-section-title">Three Steps Between a Missed Call and a Booked Job</h2>
          <p className="ansa-section-sub">Simple, automatic, and done before you finish the job you're on.</p>
        </div>
        <div className="ansa-steps ansa-reveal">
          <div className="ansa-step-card"><div className="ansa-step-num">1</div><div className="ansa-step-icon"><Phone size={24}/></div><div className="ansa-step-title">Miss a Call</div><div className="ansa-step-desc">You're on the job. A customer calls. You can't answer.</div></div>
          <div className="ansa-step-arrow"><ArrowRight size={28}/></div>
          <div className="ansa-step-card"><div className="ansa-step-num">2</div><div className="ansa-step-icon"><MessageCircle size={24}/></div><div className="ansa-step-title">Ansa Texts Back</div><div className="ansa-step-desc">Within seconds, Ansa sends a friendly text from your business number.</div></div>
          <div className="ansa-step-arrow"><ArrowRight size={28}/></div>
          <div className="ansa-step-card"><div className="ansa-step-num">3</div><div className="ansa-step-icon"><CalendarCheck size={24}/></div><div className="ansa-step-title">Appointment Booked</div><div className="ansa-step-desc">AI handles the conversation and books the appointment into your calendar.</div></div>
        </div>
      </section>

      <div className="ansa-divider" />

      <section className="ansa-section" id="features">
        <div className="ansa-reveal">
          <p className="ansa-section-label">Features</p>
          <h2 className="ansa-section-title">Everything You Need to Capture Every Lead</h2>
          <p className="ansa-section-sub">Powerful tools designed specifically for home service businesses.</p>
        </div>
        <div className="ansa-features-grid ansa-reveal">
          {[
            { icon:<Zap size={22}/>, title:'Instant Text-Back', desc:"Responds to missed calls in under 15 seconds — before they call a competitor." },
            { icon:<Bot size={22}/>, title:'AI Conversations', desc:"Natural, two-way texting that feels human. Answers questions and gathers info." },
            { icon:<Calendar size={22}/>, title:'Smart Booking', desc:"Books appointments directly into your calendar based on your real availability." },
            { icon:<LayoutDashboard size={22}/>, title:'Owner Dashboard', desc:"See every call, conversation, and booking in one clean, real-time dashboard." },
            { icon:<Mic size={22}/>, title:'Custom AI Voice', desc:"AI trained on your business, services, pricing, and FAQs. Sounds like you." },
            { icon:<Clock size={22}/>, title:'Works 24/7', desc:"Never miss an after-hours opportunity. Ansa is always on, even when you're not." },
          ].map((f,i) => (
            <div className="ansa-feature-card" key={i}>
              <div className="ansa-feature-icon">{f.icon}</div>
              <div className="ansa-feature-title">{f.title}</div>
              <div className="ansa-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="ansa-divider" />

      <section className="ansa-section" id="testimonials">
        <div className="ansa-reveal">
          <p className="ansa-section-label">Testimonials</p>
          <h2 className="ansa-section-title">Trusted by Home Service Pros</h2>
          <p className="ansa-section-sub">Real results from real business owners who stopped losing leads.</p>
        </div>
        <div className="ansa-testimonials ansa-reveal">
          {TESTIMONIALS.map((t,i) => (
            <div className="ansa-testimonial-card" key={i}>
              <div className="ansa-testimonial-stars">{[...Array(5)].map((_,j) => <Star key={j} size={16} fill="#facc15" stroke="#facc15"/>)}</div>
              <div className="ansa-testimonial-text">"{t.text}"</div>
              <div className="ansa-testimonial-author">
                <div className="ansa-testimonial-avatar" style={{ background:t.color }}>{t.initials}</div>
                <div><div className="ansa-testimonial-name">{t.name}</div><div className="ansa-testimonial-biz">{t.biz}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="ansa-divider" />

      <section className="ansa-section" id="pricing">
        <div className="ansa-reveal">
          <p className="ansa-section-label">Pricing</p>
          <h2 className="ansa-section-title">Simple Pricing, Serious ROI</h2>
          <p className="ansa-section-sub">One missed call recovered pays for an entire month. No contracts, cancel anytime.</p>
        </div>
        <div className="ansa-pricing-grid ansa-reveal">
          <div className="ansa-pricing-card popular">
            <div className="ansa-pricing-tier">Pro</div>
            <div className="ansa-pricing-price">$297<span>/mo</span></div>
            <div className="ansa-pricing-subtitle">Everything you need to never lose another lead</div>
            <ul className="ansa-pricing-features">
              {['Unlimited missed calls','Full AI conversation engine','Direct calendar booking','Advanced analytics','Priority support','Custom AI voice & training'].map(f => <li key={f}><Check size={16} color="#3b82f6"/>{f}</li>)}
            </ul>
            <a href="#/signup" className="ansa-pricing-cta ansa-pricing-cta-primary">Start Free Trial — 30 Days Free</a>
          </div>
        </div>
      </section>

      <div className="ansa-divider" />

      <section className="ansa-section" id="faq">
        <div className="ansa-reveal">
          <p className="ansa-section-label">FAQ</p>
          <h2 className="ansa-section-title">Frequently Asked Questions</h2>
          <p className="ansa-section-sub">Everything you need to know about getting started with Ansa.</p>
        </div>
        <div className="ansa-faq-list ansa-reveal">
          {FAQ_DATA.map((item,i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      <section className="ansa-final-cta">
        <div className="ansa-final-cta-inner ansa-reveal">
          <h2>Stop Losing Jobs. Start Closing More.</h2>
          <p>Join hundreds of home service pros who never miss another lead.</p>
          <a href="#/signup" className="ansa-btn ansa-btn-blue" style={{ background:'#fff',color:'#1e3a5f',fontWeight:700,boxShadow:'0 0 30px rgba(255,255,255,.2)' }}>
            Start Your Free Trial <ArrowRight size={16}/>
          </a>
        </div>
      </section>

      <footer className="ansa-footer">
        <div style={{ display:'flex',alignItems:'center',gap:24 }}>
          <a href="#/" className="ansa-logo" style={{ fontSize:20 }}>ansa<span>.</span></a>
          <span className="ansa-footer-copy">© 2026 Ansa. All rights reserved.</span>
        </div>
        <div className="ansa-footer-links">
          <a href="mailto:tyler@ansaco.ai">Contact</a>
          <a href="#/terms">Terms</a>
          <a href="#/privacy">Privacy</a>
          <a href="#/login">Log In</a>
          <a href="#/signup">Sign Up</a>
        </div>
      </footer>
    </div>
  );
}
