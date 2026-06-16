import { useState, useEffect, useRef } from 'react';
import { PhoneOff, MessageSquareOff, DollarSign, Phone, MessageCircle, CalendarCheck, Zap, Check, ChevronDown, Star, ArrowRight, Menu, X, CheckCircle, XCircle, LayoutDashboard, PhoneMissed, MessageSquare, BarChart3, Settings, LogOut, HeadphonesIcon } from 'lucide-react';

const STYLE_ID = 'ansa-landing-styles';
const PRIMARY = '#4F6EF7';
const PRIMARY_HOVER = '#3D55E8';
const PRIMARY_LIGHT = '#818CF8';

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
    @keyframes ansa-marquee { from{transform:translateX(0)}to{transform:translateX(-50%)} }
    @keyframes ansa-count { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
    .ansa-reveal{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease}
    .ansa-reveal.visible{opacity:1;transform:translateY(0)}

    /* Nav */
    .ansa-nav{position:fixed;top:0;left:0;right:0;z-index:100;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);background:rgba(10,10,10,.7);border-bottom:1px solid rgba(255,255,255,.06);transition:background .3s}
    .ansa-nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:16px 24px}
    .ansa-logo{font-weight:800;font-size:24px;letter-spacing:-.5px;color:#fff;text-decoration:none}
    .ansa-logo span{color:${PRIMARY}}
    .ansa-nav-links{display:flex;align-items:center;gap:32px}
    .ansa-nav-links a{color:#a1a1aa;text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
    .ansa-nav-links a:hover{color:#fff}
    .ansa-nav-mobile-toggle{display:none;background:none;border:none;color:#fff;cursor:pointer}
    .ansa-nav-mobile-menu{display:none;flex-direction:column;gap:16px;position:absolute;top:64px;left:0;right:0;background:rgba(10,10,10,.97);padding:24px;border-bottom:1px solid #222}
    .ansa-nav-mobile-menu a{color:#a1a1aa;text-decoration:none;font-size:15px;font-weight:500}

    /* Buttons */
    .ansa-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:all .25s;text-decoration:none;border:none;font-family:inherit}
    .ansa-btn-blue{background:${PRIMARY};color:#fff!important;box-shadow:0 0 0 1px rgba(79,110,247,.3),0 4px 16px rgba(79,110,247,.4)}
    .ansa-btn-blue:hover{background:${PRIMARY_HOVER};box-shadow:0 0 0 1px rgba(79,110,247,.4),0 8px 24px rgba(79,110,247,.55);transform:translateY(-1px)}
    .ansa-btn-outline{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.12)}
    .ansa-btn-outline:hover{border-color:rgba(255,255,255,.25);background:rgba(255,255,255,.04);transform:translateY(-1px)}

    /* Trust line under CTAs */
    .ansa-trust-line{font-size:12px;color:#888;margin-top:12px;text-align:center;letter-spacing:.2px}

    /* Hero */
    .ansa-hero{position:relative;padding:140px 24px 60px;text-align:center;overflow:hidden}
    .ansa-hero-glow{position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:900px;height:900px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(79,110,247,.18) 0%,transparent 70%);pointer-events:none;animation:ansa-pulse 6s ease-in-out infinite}
    .ansa-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:999px;font-size:13px;font-weight:600;background:rgba(79,110,247,.1);border:1px solid rgba(79,110,247,.25);color:${PRIMARY_LIGHT};margin-bottom:16px;animation:ansa-fadeUp .7s ease both}
    .ansa-hero-announce{display:inline-flex;align-items:center;gap:7px;padding:6px 14px 6px 10px;border-radius:999px;font-size:13px;font-weight:500;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#a1a1aa;text-decoration:none;margin-bottom:28px;animation:ansa-fadeUp .8s ease .1s both;transition:border-color .2s,color .2s}
    .ansa-hero-announce:hover{border-color:rgba(79,110,247,.5);color:#fff}
    .ansa-hero-announce-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0;box-shadow:0 0 6px #22c55e}
    .ansa-hero h1{font-size:clamp(36px,5.5vw,64px);font-weight:900;line-height:1.05;max-width:820px;margin:0 auto 24px;letter-spacing:-.035em;animation:ansa-fadeUp .7s ease .1s both}
    .ansa-hero-sub{font-size:clamp(16px,2vw,19px);color:#a1a1aa;max-width:620px;margin:0 auto 40px;line-height:1.65;animation:ansa-fadeUp .7s ease .2s both}
    .ansa-hero-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;animation:ansa-fadeUp .7s ease .3s both}
    .ansa-phone-wrap{margin:64px auto 0;max-width:380px;animation:ansa-fadeUp .8s ease .5s both}
    .ansa-phones-row{display:flex;justify-content:center;align-items:center;gap:16px;margin:64px auto 0;max-width:1060px;padding:0 24px}
    .ansa-phone-slot{transition:opacity .3s ease,transform .3s ease,flex-basis .3s ease;transform-origin:center}
    .ansa-phone-slot.is-center{flex:0 0 340px;opacity:1;transform:scale(1)}
    .ansa-phone-slot.is-side{flex:0 0 300px;opacity:.78;transform:scale(.9);cursor:pointer}
    .ansa-phone-slot.is-side:hover{opacity:.9;transform:scale(.92)}
    .ansa-phone-slot.is-side .ansa-phone{filter:brightness(.75)}
    .ansa-phone-slot.is-side:hover .ansa-phone{filter:brightness(.9)}
    .ansa-phone-slot.is-side:hover .ansa-phone{border-color:#4F6EF7;box-shadow:0 0 0 1px #4F6EF7,0 32px 80px rgba(0,0,0,.6)}
    @media(max-width:820px){.ansa-phone-slot.is-side{display:none!important}.ansa-phones-row{justify-content:center}}
    .ansa-phone{background:#1c1c1e;border:1px solid #2c2c2e;border-radius:36px;padding:20px 16px 24px;position:relative;box-shadow:0 32px 80px rgba(0,0,0,.6),0 0 60px rgba(79,110,247,.07);height:600px;display:flex;flex-direction:column;overflow:hidden}
    .ansa-chat-area{display:flex;flex-direction:column;gap:10px;align-items:flex-start;text-align:left;flex:1;overflow-y:auto;padding-right:2px}
    .ansa-chat-area::-webkit-scrollbar{width:3px}
    .ansa-chat-area::-webkit-scrollbar-track{background:transparent}
    .ansa-chat-area::-webkit-scrollbar-thumb{background:#3a3a3c;border-radius:99px}
    .ansa-phone-slot.is-center .ansa-phone{animation:ansa-float 6s ease-in-out infinite;border-color:rgba(79,110,247,.5);box-shadow:0 0 0 1px rgba(79,110,247,.3),0 32px 80px rgba(0,0,0,.6),0 0 40px rgba(79,110,247,.12)}
    .ansa-phone-notch{width:100px;height:5px;background:#2c2c2e;border-radius:99px;margin:0 auto 18px}
    .ansa-phone-status{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding:0 2px}
    .ansa-phone-biz{font-size:12px;font-weight:600;color:#fff;letter-spacing:-.1px}
    .ansa-phone-time{font-size:11px;color:#999}
    .ansa-chat-outgoing{align-self:flex-end}
    .ansa-chat-bubble{padding:10px 14px;border-radius:20px;font-size:12.5px;line-height:1.55;max-width:82%;word-break:break-word}
    .ansa-chat-incoming{background:#2c2c2e;color:#e5e5ea;border-bottom-left-radius:5px;margin-right:auto}
    .ansa-chat-outgoing{background:${PRIMARY};color:#fff;border-bottom-right-radius:5px;margin-left:auto}
    .ansa-chat-ts{font-size:10px;color:#48484a;text-align:center;margin:4px 0 2px}
    .ansa-chat-typing{display:flex;gap:4px;padding:10px 14px;background:#2c2c2e;border-radius:20px;border-bottom-left-radius:5px;width:fit-content}
    .ansa-chat-typing span{width:6px;height:6px;background:#636366;border-radius:50%;animation:ansa-typing 1.4s infinite}
    .ansa-chat-typing span:nth-child(2){animation-delay:.2s}
    .ansa-chat-typing span:nth-child(3){animation-delay:.4s}
    .ansa-booked-banner{display:flex;align-items:center;gap:8px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:12px;padding:10px 12px;margin-top:10px}
    .ansa-booked-banner-dot{width:7px;height:7px;border-radius:50%;background:#10b981;flex-shrink:0}
    .ansa-booked-banner-text{font-size:11px;color:#6ee7b7;line-height:1.45}
    .ansa-phone-hint{text-align:center;font-size:11px;color:#aaa;margin-top:12px;letter-spacing:.2px}

    /* Social proof strip */
    .ansa-proof-strip{border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);padding:16px 0;overflow:hidden;position:relative}
    .ansa-proof-strip::before,.ansa-proof-strip::after{content:'';position:absolute;top:0;bottom:0;width:80px;z-index:2;pointer-events:none}
    .ansa-proof-strip::before{left:0;background:linear-gradient(to right,#0a0a0a,transparent)}
    .ansa-proof-strip::after{right:0;background:linear-gradient(to left,#0a0a0a,transparent)}
    .ansa-proof-track{display:flex;animation:ansa-marquee 28s linear infinite;white-space:nowrap}
    .ansa-proof-item{display:inline-flex;align-items:center;gap:8px;padding:0 32px;font-size:12.5px;color:#52525b;font-weight:500;flex-shrink:0}
    .ansa-proof-dot{width:3px;height:3px;border-radius:50%;background:#3f3f46;flex-shrink:0}

    /* Big stats band */
    .ansa-stats-band{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.06);border-radius:20px;overflow:hidden}
    .ansa-stats-band-cell{background:#0f0f0f;padding:40px 32px;text-align:center}
    .ansa-stats-band-num{font-size:56px;font-weight:700;letter-spacing:-.02em;line-height:1;color:#fff;margin-bottom:10px;font-variant-numeric:tabular-nums}
    .ansa-stats-band-label{font-size:13px;color:#52525b;font-weight:400;line-height:1.55;max-width:160px;margin:0 auto}

    /* legacy - keep for any leftover usages */
    .ansa-proof-stats{display:flex;justify-content:center;gap:48px;padding:28px 24px;max-width:800px;margin:0 auto}
    .ansa-proof-stat{text-align:center}
    .ansa-proof-stat-num{font-size:28px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,#fff 30%,#818CF8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .ansa-proof-stat-label{font-size:12px;color:#71717a;margin-top:2px}

    /* Sections */
    .ansa-section{max-width:1200px;margin:0 auto;padding:72px 24px}
    .ansa-section-label{font-size:12px;font-weight:700;color:${PRIMARY};text-transform:uppercase;letter-spacing:2.5px;margin-bottom:12px;text-align:center}
    .ansa-section-title{font-size:clamp(26px,3.8vw,42px);font-weight:800;text-align:center;max-width:700px;margin:0 auto 16px;letter-spacing:-.035em;line-height:1.1}
    .ansa-section-sub{font-size:16px;color:#71717a;text-align:center;max-width:520px;margin:0 auto 48px;line-height:1.6}

    /* Section wrappers with background treatments */
    .ansa-section-wrap-tinted{position:relative;background:#0d0d0d}
    .ansa-section-wrap-tinted::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.035) 1px,transparent 1px);background-size:28px 28px;pointer-events:none;z-index:0}
    .ansa-section-wrap-tinted .ansa-section{position:relative;z-index:1}
    .ansa-section-wrap-blue{position:relative;background:linear-gradient(180deg,#0a0a0a 0%,#07101f 40%,#07101f 60%,#0a0a0a 100%)}
    .ansa-section-wrap-blue::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 800px 400px at 50% 50%,rgba(79,110,247,.08) 0%,transparent 70%);pointer-events:none}
    .ansa-section-wrap-blue .ansa-section{position:relative;z-index:1}

    /* Problem cards */
    .ansa-problem-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
    .ansa-problem-card{background:#141414;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:32px 24px;text-align:center;transition:border-color .3s,transform .3s;position:relative;overflow:hidden}
    .ansa-problem-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(79,110,247,.3),transparent);opacity:0;transition:opacity .3s}
    .ansa-problem-card:hover{border-color:rgba(79,110,247,.3);transform:translateY(-3px)}
    .ansa-problem-card:hover::after{opacity:1}
    .ansa-problem-icon{width:48px;height:48px;border-radius:14px;background:rgba(79,110,247,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:${PRIMARY}}
    .ansa-problem-stat{font-size:clamp(28px,3.5vw,40px);font-weight:700;margin-bottom:8px;letter-spacing:-.03em;transition:all .3s;color:#fff;line-height:1}
    .ansa-problem-desc{font-size:14px;color:#71717a;line-height:1.55}

    /* Testimonials */
    .ansa-testimonials{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .ansa-testimonial-card{background:#141414;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:32px 28px;transition:border-color .3s;position:relative;overflow:hidden}
    .ansa-testimonial-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(79,110,247,.4),transparent)}
    .ansa-testimonial-card:hover{border-color:rgba(79,110,247,.25)}
    .ansa-testimonial-stars{display:flex;gap:3px;margin-bottom:16px;color:#facc15}
    .ansa-testimonial-text{font-size:15px;color:#d1d5db;line-height:1.65;margin-bottom:20px}
    .ansa-testimonial-author{display:flex;align-items:center;gap:12px}
    .ansa-testimonial-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0}
    .ansa-testimonial-avatar-initials{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;color:#fff;flex-shrink:0}
    .ansa-testimonial-name{font-size:14px;font-weight:600}
    .ansa-testimonial-biz{font-size:13px;color:#71717a}

    /* Steps */
    .ansa-steps{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:0;align-items:flex-start}
    .ansa-step-card{background:#141414;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:36px 24px;text-align:center;position:relative;transition:border-color .3s,transform .3s}
    .ansa-step-card:hover{border-color:${PRIMARY};transform:translateY(-4px)}
    .ansa-step-num{position:absolute;top:-14px;left:50%;transform:translateX(-50%);width:28px;height:28px;border-radius:50%;background:${PRIMARY};color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}
    .ansa-step-icon{width:52px;height:52px;border-radius:14px;background:rgba(79,110,247,.1);display:flex;align-items:center;justify-content:center;margin:8px auto 18px;color:${PRIMARY}}
    .ansa-step-title{font-size:18px;font-weight:700;margin-bottom:10px}
    .ansa-step-desc{font-size:14px;color:#a1a1aa;line-height:1.6}
    .ansa-step-arrow{display:flex;align-items:center;justify-content:center;color:${PRIMARY};padding-top:60px;font-size:24px;opacity:.5}

    /* Before/After */
    .ansa-compare{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:860px;margin:0 auto}
    .ansa-compare-col{border-radius:20px;padding:32px 28px}
    .ansa-compare-col-bad{background:#1a0e0e;border:1px solid #3a1a1a}
    .ansa-compare-col-good{background:#0e1a12;border:1px solid #1a3a20}
    .ansa-compare-col-title{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;margin-bottom:20px}
    .ansa-compare-row{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:14px;color:#d1d5db;line-height:1.5}
    .ansa-compare-row:last-child{border-bottom:none}
    .ansa-compare-icon-bad{color:#ef4444;flex-shrink:0;margin-top:1px}
    .ansa-compare-icon-good{color:#10b981;flex-shrink:0;margin-top:1px}

    /* Chess features layout (legacy, kept for fallback) */
    .ansa-chess{display:flex;flex-direction:column;gap:64px}
    .ansa-chess-row{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
    .ansa-chess-row.flip{direction:rtl}
    .ansa-chess-row.flip > *{direction:ltr}
    .ansa-chess-eyebrow{font-size:12px;font-weight:600;color:${PRIMARY};text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
    .ansa-chess-title{font-size:clamp(22px,3vw,30px);font-weight:800;letter-spacing:-.5px;line-height:1.2;margin-bottom:16px}
    .ansa-chess-body{font-size:15px;color:#71717a;line-height:1.7;margin-bottom:24px}
    .ansa-chess-points{list-style:none;padding:0;display:flex;flex-direction:column;gap:10px}
    .ansa-chess-points li{display:flex;align-items:center;gap:10px;font-size:14px;color:#d1d5db}
    .ansa-chess-visual{background:#141414;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:28px;min-height:240px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;transition:border-color .3s}
    .ansa-chess-visual:hover{border-color:rgba(79,110,247,.25)}
    .ansa-chess-visual::before{content:'';position:absolute;top:-60px;right:-60px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(79,110,247,.08) 0%,transparent 70%);pointer-events:none}

    /* Bento grid layout */
    .ansa-bento{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
    .ansa-bento-card{background:#141414;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:28px;position:relative;overflow:hidden;transition:border-color .3s,transform .25s}
    .ansa-bento-card:hover{border-color:rgba(79,110,247,.3);transform:translateY(-2px)}
    .ansa-bento-card::before{content:'';position:absolute;top:-80px;right:-80px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(79,110,247,.06) 0%,transparent 70%);pointer-events:none}
    .ansa-bento-wide{grid-column:span 2}
    .ansa-bento-full{grid-column:span 3}
    .ansa-bento-accent{background:linear-gradient(135deg,rgba(79,110,247,.1) 0%,#141414 100%);border-color:rgba(79,110,247,.2)}
    .ansa-bento-accent:hover{border-color:rgba(79,110,247,.4)}
    .ansa-bento-num{font-size:clamp(44px,5vw,64px);font-weight:700;letter-spacing:-.03em;line-height:1;color:#fff;margin-bottom:8px;text-align:center}
    .ansa-bento-num-label{font-size:14px;color:#71717a;line-height:1.5;text-align:center}
    .ansa-bento-eyebrow{font-size:11px;font-weight:700;color:${PRIMARY};text-transform:uppercase;letter-spacing:2px;margin-bottom:10px}
    .ansa-bento-title{font-size:clamp(18px,2vw,22px);font-weight:800;letter-spacing:-.03em;line-height:1.25;margin-bottom:12px;color:#fff}
    .ansa-bento-body{font-size:14px;color:#71717a;line-height:1.65;margin-bottom:16px}
    .ansa-bento-points{list-style:none;padding:0;display:flex;flex-direction:column;gap:8px;margin-top:auto}
    .ansa-bento-points li{display:flex;align-items:center;gap:8px;font-size:13px;color:#a1a1aa}
    @media(max-width:900px){.ansa-bento{grid-template-columns:1fr 1fr}.ansa-bento-wide,.ansa-bento-full{grid-column:span 2}.ansa-bento-accent:not(.ansa-bento-wide){grid-column:span 1}}
    @media(max-width:600px){.ansa-bento{grid-template-columns:1fr}.ansa-bento-wide,.ansa-bento-full,.ansa-bento-accent{grid-column:span 1}}

    /* Integrations */
    .ansa-integrations{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:520px;margin:0 auto}
    .ansa-integration-pill{display:flex;align-items:center;gap:12px;background:#141414;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px 20px;font-size:14px;font-weight:500;color:#d1d5db;transition:border-color .2s,transform .2s}
    .ansa-integration-pill:hover{border-color:rgba(79,110,247,.3);transform:translateY(-2px)}
    .ansa-integration-icon{width:36px;height:36px;border-radius:10px;background:rgba(79,110,247,.1);border:1px solid rgba(79,110,247,.15);display:flex;align-items:center;justify-content:center;color:${PRIMARY};flex-shrink:0}
    .ansa-integration-plus{display:none}

    /* Split section: integrations left + notifications right */
    .ansa-split-section{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;max-width:1200px;margin:0 auto;padding:72px 24px}
    .ansa-split-label{font-size:11px;font-weight:700;color:${PRIMARY};text-transform:uppercase;letter-spacing:2.5px;margin-bottom:10px}
    .ansa-split-title{font-size:clamp(22px,2.8vw,32px);font-weight:800;letter-spacing:-.03em;line-height:1.15;margin-bottom:14px;color:#fff}
    .ansa-split-body{font-size:15px;color:#71717a;line-height:1.65;margin-bottom:28px}
    @media(max-width:768px){.ansa-split-section{grid-template-columns:1fr;gap:40px}}

    /* Pricing */
    .ansa-pricing-grid{display:grid;grid-template-columns:1fr;gap:24px;max-width:480px;margin:0 auto}
    .ansa-pricing-card{background:#141414;border:1px solid ${PRIMARY};border-radius:22px;padding:40px 32px;position:relative;transition:border-color .3s,transform .3s;box-shadow:0 0 0 1px rgba(79,110,247,.15),0 20px 60px rgba(79,110,247,.15)}
    .ansa-pricing-card:hover{transform:translateY(-4px);box-shadow:0 0 0 1px rgba(79,110,247,.3),0 24px 80px rgba(79,110,247,.25)}
    .ansa-pricing-roi{font-size:13px;color:#a1a1aa;text-align:center;margin-bottom:20px;padding:10px 14px;background:rgba(79,110,247,.06);border-radius:10px;border:1px solid rgba(79,110,247,.15)}
    .ansa-pricing-roi strong{color:${PRIMARY_LIGHT}}
    .ansa-pricing-popular-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:${PRIMARY};color:#fff;font-size:12px;font-weight:700;padding:4px 16px;border-radius:999px;text-transform:uppercase;letter-spacing:.5px}
    .ansa-pricing-tier{font-size:18px;font-weight:700;margin-bottom:6px}
    .ansa-pricing-price{font-size:48px;font-weight:900;letter-spacing:-2px;margin-bottom:4px}
    .ansa-pricing-price span{font-size:18px;font-weight:500;color:#71717a;letter-spacing:0}
    .ansa-pricing-subtitle{font-size:14px;color:#71717a;margin-bottom:28px}
    .ansa-pricing-features{list-style:none;padding:0;margin-bottom:32px}
    .ansa-pricing-features li{display:flex;align-items:center;gap:10px;font-size:14px;color:#d1d5db;padding:8px 0}
    .ansa-pricing-cta{display:block;width:100%;text-align:center;padding:14px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;font-family:inherit;transition:all .25s}
    .ansa-pricing-cta-primary{background:${PRIMARY};color:#fff;border:none;box-shadow:0 0 0 1px rgba(79,110,247,.3),0 4px 16px rgba(79,110,247,.4)}
    .ansa-pricing-cta-primary:hover{background:${PRIMARY_HOVER}}

    /* FAQ */
    .ansa-faq-list{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
    .ansa-faq-item{background:#141414;border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;transition:border-color .3s}
    .ansa-faq-item:hover{border-color:rgba(79,110,247,.25)}
    .ansa-faq-q{width:100%;background:none;border:none;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:20px 24px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;text-align:left}
    .ansa-faq-q svg{flex-shrink:0;transition:transform .3s;color:#71717a}
    .ansa-faq-q.open svg{transform:rotate(180deg)}
    .ansa-faq-a{max-height:0;overflow:hidden;transition:max-height .35s ease}
    .ansa-faq-a.open{max-height:300px}
    .ansa-faq-a-inner{padding:0 24px 20px;font-size:14px;color:#a1a1aa;line-height:1.7}

    /* Final CTA */
    .ansa-final-cta{max-width:1200px;margin:0 auto 80px;padding:0 24px}
    .ansa-final-cta-inner{background:linear-gradient(135deg,#1a1a4e 0%,#2D3DB0 40%,${PRIMARY} 100%);border-radius:28px;padding:72px 40px;text-align:center;position:relative;overflow:hidden;background-size:200% 200%;animation:ansa-gradient 8s ease infinite}
    .ansa-final-cta h2{font-size:clamp(28px,4vw,40px);font-weight:800;margin-bottom:16px;letter-spacing:-.5px;position:relative}
    .ansa-final-cta p{font-size:17px;color:rgba(255,255,255,.8);margin-bottom:36px;position:relative}

    /* Footer */
    .ansa-footer{border-top:1px solid #1a1a1a;padding:40px 24px;max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
    .ansa-footer-links{display:flex;gap:24px}
    .ansa-footer-links a{color:#71717a;text-decoration:none;font-size:13px;transition:color .2s}
    .ansa-footer-links a:hover{color:#fff}
    .ansa-footer-copy{font-size:13px;color:#52525b}

    /* Divider */
    .ansa-divider{height:1px;max-width:1200px;margin:0 auto;background:linear-gradient(90deg,transparent,#222 50%,transparent)}

    /* Sticky mobile CTA */
    .ansa-sticky-cta{display:none;position:fixed;bottom:0;left:0;right:0;padding:12px 16px 20px;background:rgba(10,10,10,.96);border-top:1px solid #1e1e1e;z-index:98;backdrop-filter:blur(12px)}
    .ansa-sticky-cta a{display:flex;align-items:center;justify-content:center;gap:8px;background:${PRIMARY};color:#fff;font-size:15px;font-weight:700;padding:14px;border-radius:12px;text-decoration:none;box-shadow:0 0 24px rgba(79,110,247,.4)}

    /* Dashboard Showcase */
    .ansa-showcase-wrap{border-radius:16px;overflow:hidden;border:1px solid #3b82f6;background:#111111;box-shadow:0 0 0 4px rgba(59,130,246,.15),0 40px 100px rgba(0,0,0,.8),0 0 80px rgba(59,130,246,.2)}
    .ansa-showcase-chrome{background:#111111;border-bottom:1px solid #1e1e1e;padding:11px 16px;display:flex;align-items:center;gap:12px}
    .ansa-showcase-dots{display:flex;gap:6px}
    .ansa-showcase-dots span{width:11px;height:11px;border-radius:50%}
    .ansa-showcase-dots span:nth-child(1){background:#ef4444}
    .ansa-showcase-dots span:nth-child(2){background:#f59e0b}
    .ansa-showcase-dots span:nth-child(3){background:#22c55e}
    .ansa-showcase-url{flex:1;background:#0a0a0a;border:1px solid #1e1e1e;border-radius:6px;padding:4px 12px;font-size:12px;color:#888;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;align-items:center;justify-content:center;gap:5px}
    .ansa-showcase-url svg{color:#22c55e;flex-shrink:0}
    .ansa-showcase-url span{color:#bbb;font-weight:500}
    .ansa-showcase-app{display:flex;height:520px;overflow:hidden}
    .ansa-showcase-sidebar{width:210px;flex-shrink:0;background:#111111;border-right:1px solid #1e1e1e;display:flex;flex-direction:column}
    .ansa-showcase-logo{padding:18px;font-size:18px;font-weight:800;color:#fff;border-bottom:1px solid #1e1e1e;letter-spacing:-.3px}
    .ansa-showcase-logo span{color:#3b82f6}
    .ansa-showcase-nav-section{flex:1;padding:8px 0}
    .ansa-showcase-nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;margin:1px 8px;border-radius:8px;font-size:13px;font-weight:500;color:#999;transition:all .15s;cursor:pointer}
    .ansa-showcase-nav-item svg{color:#888;flex-shrink:0;transition:color .15s}
    .ansa-showcase-nav-item:hover{color:#ccc;background:rgba(255,255,255,.04)}
    .ansa-showcase-nav-item:hover svg{color:#aaa}
    .ansa-showcase-nav-item.active{color:#3b82f6;background:rgba(59,130,246,.1)}
    .ansa-showcase-nav-item.active svg{color:#3b82f6}
    .ansa-showcase-sidebar-footer{border-top:1px solid #1e1e1e;padding:14px}
    .ansa-showcase-main{flex:1;overflow:hidden;background:#0a0a0a;display:flex;flex-direction:column}
    .ansa-showcase-topbar{height:56px;border-bottom:1px solid #1e1e1e;display:flex;align-items:center;justify-content:space-between;padding:0 20px;flex-shrink:0;background:#0a0a0a}
    .ansa-showcase-content{flex:1;overflow-y:auto;padding:20px}
    .ansa-showcase-progress{height:2px;background:#1e1e1e;border-radius:1px;margin:10px auto 0;overflow:hidden;max-width:220px}
    .ansa-showcase-progress-bar{height:100%;background:#3b82f6;border-radius:1px}
    .ansa-sc-statgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
    .ansa-sc-stat{background:#141414;border:1px solid #1e1e1e;border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:10px}
    .ansa-sc-stat-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .ansa-sc-stat-val{font-size:20px;font-weight:700;color:#fff;line-height:1}
    .ansa-sc-stat-label{font-size:10px;color:#888;margin-top:2px}
    .ansa-sc-card{background:#141414;border:1px solid #1e1e1e;border-radius:12px;padding:14px;margin-bottom:10px}
    .ansa-sc-card-title{font-size:12px;font-weight:600;color:#fff;margin-bottom:10px}
    .ansa-sc-row{background:#141414;border:1px solid #1e1e1e;border-radius:10px;padding:12px 14px;margin-bottom:7px;display:flex;align-items:center;gap:10px;transition:background .15s}
    .ansa-sc-row:hover{background:#1a1a1a;border-color:#2a2a2a}
    .ansa-sc-avatar{width:36px;height:36px;border-radius:50%;background:#1e1e1e;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#888}
    .ansa-sc-badge{font-size:10.5px;font-weight:600;padding:3px 10px;border-radius:20px;white-space:nowrap}
    .ansa-mini-chart{background:#141414;border:1px solid #1e1e1e;border-radius:9px;padding:14px;margin-bottom:10px}
    .ansa-mini-chart-title{font-size:12px;font-weight:600;color:#fff;margin-bottom:10px}
    .ansa-mini-conv-phone{font-size:13px;font-weight:600;color:#fff;margin-bottom:2px}
    .ansa-mini-conv-last{font-size:11.5px;color:#888;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}
    .ansa-mini-badge{font-size:10px;font-weight:600;padding:3px 8px;border-radius:999px;white-space:nowrap}
    .ansa-funnel-row{margin-bottom:9px}
    .ansa-funnel-bar-outer{width:100%;height:20px;background:#1a1a1a;border-radius:5px;overflow:hidden}
    .ansa-funnel-bar-inner{height:100%;border-radius:5px}
    @media(max-width:768px){
      .ansa-problem-grid,.ansa-testimonials{grid-template-columns:1fr}
      .ansa-chess-row,.ansa-chess-row.flip{grid-template-columns:1fr;direction:ltr}
      .ansa-compare{grid-template-columns:1fr}
      .ansa-steps{grid-template-columns:1fr;gap:20px}
      .ansa-step-arrow{display:none}
      .ansa-nav-links{display:none!important}
      .ansa-nav-mobile-toggle{display:block!important}
      .ansa-nav-mobile-menu.open{display:flex!important}
      .ansa-proof-stats{gap:24px;flex-wrap:wrap}
      .ansa-sticky-cta{display:block}
      .ansa-final-cta-inner{padding:48px 24px}
      .ansa-showcase-sidebar{display:none}
      .ansa-showcase-app{height:380px}
      .ansa-mini-grid{grid-template-columns:repeat(2,1fr)}
    }
  `;
  document.head.appendChild(style);
};

const HERO_PHONES = [
  {
    biz: "FloorRight Co.",
    time: '2:11 PM',
    messages: [
      { from:'ai',   text:"Hey! FloorRight here — sorry we missed you. What can we help with?" },
      { from:'user', text:"How much would it cost to do hardwood floors in my living room? It's about 320 sq ft" },
      { from:'ai',   text:"Great question. Hardwood install runs $6–$11/sq ft for labor. At 320 sq ft that's roughly $1,920–$3,520 depending on the wood. Want to book a free estimate to get you an exact number?" },
      { from:'user', text:"Yeah that works, when can you come?" },
      { from:'ai',   text:"We have Thursday at 10:00 AM or Friday at 2:00 PM — which works?" },
      { from:'user', text:"Thursday morning" },
      { from:'ai',   text:"Locked in! Free estimate with FloorRight is confirmed for Thursday at 10:00 AM. See you then." },
    ],
    banner: 'Estimate booked: Hardwood floors · Thu 10:00 AM',
  },
  {
    biz: "Bright Side Electric",
    time: '4:38 PM',
    messages: [
      { from:'ai',   text:"Hi, Bright Side Electric here — we missed your call. What's going on?" },
      { from:'user', text:"A few outlets in my kitchen stopped working, just want to get it looked at" },
      { from:'ai',   text:"Sounds like it could be a tripped breaker or a GFCI issue — pretty common fix. We have a spot tomorrow at 1:00 PM. Want me to book it?" },
      { from:'user', text:"Yes please" },
      { from:'ai',   text:"Done! Your appointment with Bright Side Electric is confirmed for tomorrow at 1:00 PM. We'll see you then." },
    ],
    banner: 'Job booked: Outlet repair · Tomorrow 1:00 PM',
  },
  {
    biz: "Summit Roofing",
    time: '11:05 AM',
    messages: [
      { from:'ai',   text:"Hey, this is Summit Roofing — sorry we missed you. How can we help?" },
      { from:'user', text:"I noticed some shingles came off after the storm, wanted to get someone to take a look" },
      { from:'ai',   text:"Totally understand — better to catch it early. Our guys are all on jobs today but I can have someone call you back this afternoon to set up an inspection. Would that work?" },
      { from:'user', text:"That's fine, I'm around after 3" },
      { from:'ai',   text:"Perfect. I'll have someone from Summit give you a call after 3:00 PM. Thanks for reaching out!" },
    ],
    banner: null,
    callbackBanner: 'Callback scheduled · Owner notified · After 3:00 PM',
  },
];

const FAQ_DATA = [
  { q:'How does Ansa connect to my phone?', a:"Ansa works with call forwarding on your existing business number — no new hardware, no app to install. When a call goes unanswered, our system detects it instantly and fires the text-back within 15 seconds. Setup takes under 5 minutes." },
  { q:"Will callers know they're texting with AI?", a:"Your AI is trained to match your business tone, services, and FAQs — so conversations feel natural and on-brand. You can customize everything: the AI's name, personality, responses, and even its opening message." },
  { q:"What happens after the 30-day free trial?", a:"After your trial, billing starts at $297/month, no contract required. You can cancel anytime before your trial ends and you won't be charged. We'll send you a reminder before the trial expires." },
  { q:"How fast does Ansa respond?", a:"The first text-back fires within 10–15 seconds of a missed call. Speed matters — research shows the first business to respond wins the job over 70% of the time. Ansa beats every competitor on response time." },
  { q:"Can I jump into a conversation?", a:"Yes — open your dashboard, tap any active conversation, and take over instantly. The AI steps back the moment you reply. You stay in full control at all times." },
  { q:"Is there a setup fee or long-term contract?", a:"No setup fee, no contracts. Ansa is month-to-month. Start your 30-day free trial today, and if it's not the best decision you've made for your business, cancel with one click — no questions asked." },
  { q:"Can I approve bookings before they're confirmed?", a:"Yes — turn on 'Require approval before confirming' in Settings. When it's on, the AI holds appointments as pending and texts the customer that you'll confirm shortly. You'll see a Confirm button in your Appointments dashboard. One tap confirms it, sends the customer a confirmation text, and adds the job to your Google Calendar." },
];

const TESTIMONIALS = [
  { text:"I was skeptical at first, but Ansa booked 14 jobs in its first month. That's over $18,000 in revenue I would have lost. This thing pays for itself ten times over.", name:'Mike Rodriguez', biz:"Rodriguez Plumbing Co.", initials:'MR', color:'#4F6EF7' },
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

// Animated counter on scroll
function AnimatedStat({ prefix='', value, suffix='', decimals=0 }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef(null);
  const ran = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !ran.current) {
        ran.current = true;
        const duration = 1800;
        const start = performance.now();
        const step = ts => {
          const progress = Math.min((ts - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * value;
          setDisplay(decimals ? current.toFixed(decimals) : Math.floor(current).toLocaleString());
          if (progress < 1) requestAnimationFrame(step);
          else setDisplay(value.toLocaleString());
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.6 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, decimals]);
  return <div className="ansa-problem-stat" ref={ref}>{prefix}{display}{suffix}</div>;
}

// Chess feature visuals
function VisualTextBack() {
  return (
    <div className="ansa-chess-visual">
      <div style={{ fontSize:11,color:'#52525b',marginBottom:12,fontWeight:600,textTransform:'uppercase',letterSpacing:'1px' }}>Ansa · Live</div>
      <div style={{ display:'flex',alignItems:'center',gap:8,background:'#0e1a12',border:'1px solid rgba(16,185,129,.2)',borderRadius:10,padding:'10px 14px',marginBottom:12 }}>
        <div style={{ width:7,height:7,borderRadius:'50%',background:'#10b981',animation:'ansa-pulse 2s infinite' }} />
        <span style={{ fontSize:12,color:'#6ee7b7',fontWeight:600 }}>Missed call detected — texting back</span>
      </div>
      <div style={{ fontSize:12,color:'#52525b',marginBottom:8 }}>⚡ Response sent in 11 seconds</div>
      <div className="ansa-chat-bubble ansa-chat-incoming" style={{ fontSize:13 }}>
        Hey! This is Jake from Jake's Plumbing — sorry we missed you. How can we help? 🔧
      </div>
      <div style={{ fontSize:11,color:'#3f3f46',marginTop:4 }}>Delivered · 11s after missed call</div>
    </div>
  );
}

function VisualConversation() {
  return (
    <div className="ansa-chess-visual">
      <div style={{ fontSize:11,color:'#52525b',marginBottom:14,fontWeight:600,textTransform:'uppercase',letterSpacing:'1px' }}>Conversation · AI Handling</div>
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        <div className="ansa-chat-bubble ansa-chat-outgoing" style={{ fontSize:13,marginLeft:'auto' }}>Do you guys do water heater installs?</div>
        <div className="ansa-chat-bubble ansa-chat-incoming" style={{ fontSize:13 }}>Yes! We install gas and tankless units. Labor starts at $325. Want to book a free estimate?</div>
        <div className="ansa-chat-bubble ansa-chat-outgoing" style={{ fontSize:13,marginLeft:'auto' }}>Yes please, tomorrow afternoon works</div>
        <div className="ansa-chat-bubble ansa-chat-incoming" style={{ fontSize:13 }}>Perfect — I've got 1:00 PM or 3:00 PM open tomorrow. Which works best?</div>
        <div className="ansa-chat-typing"><span /><span /><span /></div>
      </div>
    </div>
  );
}

function VisualBooking() {
  return (
    <div className="ansa-chess-visual">
      <div style={{ fontSize:11,color:'#52525b',marginBottom:12,fontWeight:600,textTransform:'uppercase',letterSpacing:'1px' }}>Dashboard · New Booking</div>
      <div style={{ background:'rgba(79,110,247,.08)',border:'1px solid rgba(79,110,247,.2)',borderRadius:14,padding:'16px 18px',marginBottom:12 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
          <div>
            <div style={{ fontSize:14,fontWeight:700,color:'#fff' }}>Water Heater Install</div>
            <div style={{ fontSize:12,color:'#818CF8',marginTop:2 }}>Marcus T. · Tomorrow 1:00 PM</div>
          </div>
          <div style={{ background:'rgba(16,185,129,.15)',color:'#10b981',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:999 }}>CONFIRMED</div>
        </div>
        <div style={{ fontSize:12,color:'#71717a' }}>📍 147 Elm Street, Newport Beach · Est. $325</div>
      </div>
      <div className="ansa-booked-banner">
        <div className="ansa-booked-banner-dot" />
        <div className="ansa-booked-banner-text">Job booked automatically while you were on-site. No calls needed.</div>
      </div>
    </div>
  );
}


const PROOF_ITEMS = [
  'Plumbers', 'HVAC Techs', 'Roofers', 'Electricians', 'Landscapers',
  'General Contractors', 'Painters', 'Pest Control', 'Pool Service', 'Garage Door Pros',
];

// ─── Dashboard Showcase ───────────────────────────────────────────────────────

const MOCK_WEEKLY = [
  { day:'Mon', calls:4, responses:4, bookings:2 },
  { day:'Tue', calls:3, responses:3, bookings:1 },
  { day:'Wed', calls:7, responses:7, bookings:4 },
  { day:'Thu', calls:2, responses:2, bookings:1 },
  { day:'Fri', calls:8, responses:8, bookings:5 },
  { day:'Sat', calls:5, responses:5, bookings:3 },
  { day:'Sun', calls:3, responses:3, bookings:2 },
];

const MOCK_CONVS = [
  { name:'Marcus T.', phone:'(949) 555-0182', last:'Yes, 2:00 PM works perfectly!', status:'booked', time:'12m ago' },
  { name:'Sarah K.', phone:'(714) 555-0347', last:'Do you do tankless water heaters?', status:'active', time:'34m ago' },
  { phone:'(562) 555-0901', last:'Thanks, we got it sorted.', status:'closed', time:'2h ago' },
  { phone:'(310) 555-0264', last:'What areas do you service?', status:'active', time:'3h ago' },
  { name:'David R.', phone:'(949) 555-0773', last:'Appointment confirmed for tomorrow!', status:'booked', time:'5h ago' },
  { phone:'(818) 555-0412', last:'Ok sounds good, what time works?', status:'active', manual_mode:true, time:'8m ago' },
];

const MOCK_CALLS = [
  { phone:'(949) 555-0182', time:'12m ago', status:'booked' },
  { phone:'(714) 555-0347', time:'34m ago', status:'active' },
  { phone:'(562) 555-0901', time:'2h ago', status:'closed' },
  { phone:'(310) 555-0264', time:'3h ago', status:'active' },
  { phone:'(949) 555-0773', time:'5h ago', status:'booked' },
  { phone:'(213) 555-0128', time:'Yesterday', status:'closed' },
];

const MOCK_APPTS = [
  { customer:'Marcus T.', service:'Leaking faucet repair', time:'Today · 2:00 PM', status:'confirmed' },
  { customer:'Sarah K.', service:'Water heater installation', time:'Tomorrow · 1:00 PM', status:'confirmed' },
  { customer:'David R.', service:'HVAC annual tune-up', time:'Thu · 10:00 AM', status:'pending' },
  { customer:'Lisa M.', service:'Bathroom remodel estimate', time:'Fri · 3:00 PM', status:'confirmed' },
];


// SVG area chart — pixel-accurate replica of the real Recharts chart
function AreaChart({ data, series }) {
  const W = 320, H = 100, PL = 6, PR = 6, PT = 8, PB = 20;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxVal = Math.max(...data.flatMap(d => series.map(s => d[s.key])), 1);
  const x = i => PL + (i / (data.length - 1)) * cW;
  const y = v => PT + cH - (v / maxVal) * cH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:100, display:'block' }}>
      <defs>
        {series.map((s,si) => (
          <linearGradient key={si} id={`sg${si}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity={0.25}/>
            <stop offset="100%" stopColor={s.color} stopOpacity={0}/>
          </linearGradient>
        ))}
      </defs>
      {[0.33,0.66,1].map(f => (
        <line key={f} x1={PL} x2={PL+cW} y1={PT+cH*(1-f)} y2={PT+cH*(1-f)} stroke="#1e1e1e" strokeWidth={1}/>
      ))}
      {series.map((s,si) => {
        const pts = data.map((d,i) => [x(i), y(d[s.key])]);
        const line = pts.map((p,i) => `${i?'L':'M'}${p[0]},${p[1]}`).join(' ');
        const area = line + ` L${pts[pts.length-1][0]},${PT+cH} L${pts[0][0]},${PT+cH} Z`;
        return (
          <g key={si}>
            <path d={area} fill={`url(#sg${si})`}/>
            <path d={line} fill="none" stroke={s.color} strokeWidth={1.5}/>
          </g>
        );
      })}
      {data.map((d,i) => (
        <text key={i} x={x(i)} y={H-4} textAnchor="middle" fontSize={8.5} fill="#3f3f46">{d.day}</text>
      ))}
    </svg>
  );
}


function Funnel({ rows }) {
  return rows.map((f,i) => (
    <div key={i} className="ansa-funnel-row">
      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
        <span style={{ fontSize:11,color:'#a1a1aa',fontWeight:500 }}>{f.label}</span>
        <span style={{ fontSize:11,color:'#555' }}>{f.val}</span>
      </div>
      <div className="ansa-funnel-bar-outer">
        <div className="ansa-funnel-bar-inner" style={{ width:`${f.pct}%`,background:f.color }}/>
      </div>
    </div>
  ));
}

const SC_REAL = {
  booked:    { color:'#3b82f6', bg:'rgba(59,130,246,0.15)' },
  active:    { color:'#3b82f6', bg:'rgba(59,130,246,0.15)' },
  closed:    { color:'#6b7280', bg:'rgba(107,114,128,0.15)' },
  confirmed: { color:'#22c55e', bg:'rgba(34,197,94,0.15)' },
  pending:   { color:'#f59e0b', bg:'rgba(245,158,11,0.15)' },
  cancelled: { color:'#ef4444', bg:'rgba(239,68,68,0.15)' },
};

function ShowcaseOverview() {
  return (
    <div>
      <div style={{ fontSize:18,fontWeight:700,color:'#fff',marginBottom:3 }}>Overview</div>
      <div style={{ fontSize:13,color:'#888',marginBottom:14 }}>Here's what happened while you were on the job.</div>
      <div className="ansa-sc-statgrid">
        {[
          { icon:<PhoneMissed size={16}/>, color:'#3b82f6', val:'3',    label:'Missed Calls Today' },
          { icon:<MessageSquare size={16}/>, color:'#8b5cf6', val:'100%', label:'Response Rate' },
          { icon:<CalendarCheck size={16}/>, color:'#22c55e', val:'67%',  label:'Booking Rate' },
          { icon:<DollarSign size={16}/>, color:'#f59e0b', val:'$3,200', label:'Revenue Recovered', sub:'8 jobs booked' },
        ].map((s,i) => (
          <div key={i} className="ansa-sc-stat">
            <div className="ansa-sc-stat-icon" style={{ background:`${s.color}18` }}><span style={{ color:s.color }}>{s.icon}</span></div>
            <div><div className="ansa-sc-stat-val">{s.val}</div><div className="ansa-sc-stat-label">{s.label}</div>{s.sub && <div style={{ fontSize:9,color:'#555',marginTop:1 }}>{s.sub}</div>}</div>
          </div>
        ))}
      </div>
      <div className="ansa-sc-card">
        <div className="ansa-sc-card-title">This Week's Activity</div>
        <AreaChart data={MOCK_WEEKLY} series={[
          { key:'calls',     color:'#3b82f6' },
          { key:'responses', color:'#8b5cf6' },
          { key:'bookings',  color:'#22c55e' },
        ]}/>
        <div style={{ display:'flex',gap:12,marginTop:6 }}>
          {[['#3b82f6','Missed Calls'],['#8b5cf6','Responses'],['#22c55e','Bookings']].map(([c,l]) => (
            <span key={l} style={{ fontSize:9,color:'#888',display:'flex',alignItems:'center',gap:3 }}>
              <span style={{ width:7,height:7,borderRadius:2,background:c,display:'inline-block' }}/>{l}
            </span>
          ))}
        </div>
      </div>
      <div className="ansa-sc-card" style={{ marginBottom:0 }}>
        <div className="ansa-sc-card-title">Recent Activity</div>
        {MOCK_CONVS.slice(0,3).map((c,i) => (
          <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<2?'1px solid #1e1e1e':'none' }}>
            <div>
              <div style={{ fontSize:13,fontWeight:600,color:'#fff' }}>{c.name || c.phone}</div>
              {c.name && <div style={{ fontSize:10,color:'#555' }}>{c.phone}</div>}
              <div style={{ fontSize:11,color:'#666' }}>{c.time}</div>
            </div>
            <span className="ansa-sc-badge" style={{ color:SC_REAL[c.status].color,background:SC_REAL[c.status].bg }}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShowcaseMissedCalls() {
  return (
    <div>
      <div style={{ fontSize:18,fontWeight:700,color:'#fff',marginBottom:4 }}>Missed Calls</div>
      <div style={{ fontSize:13,color:'#888',marginBottom:14 }}>Every missed call, captured and followed up automatically.</div>
      {MOCK_CALLS.map((c,i) => (
        <div key={i} className="ansa-sc-row">
          <div className="ansa-sc-avatar"><PhoneMissed size={15}/></div>
          <div style={{ flex:1,minWidth:0 }}>
            <div className="ansa-mini-conv-phone">{c.phone}</div>
            <div style={{ fontSize:11,color:'#666' }}>{c.time}</div>
          </div>
          <span className="ansa-sc-badge" style={{ color:SC_REAL[c.status].color,background:SC_REAL[c.status].bg }}>{c.status}</span>
        </div>
      ))}
    </div>
  );
}

const SC_TABS = [
  { key:'all',        label:'All',         dot:null },
  { key:'ai-active',  label:'AI Active',   dot:'#3b82f6' },
  { key:'needs-reply',label:'Needs Reply', dot:'#f59e0b' },
  { key:'booked',     label:'Booked',      dot:'#22c55e' },
  { key:'closed',     label:'Closed',      dot:'#6b7280' },
];

function ShowcaseConversations() {
  const [tab, setTab] = useState('all');
  const filtered = tab === 'all' ? MOCK_CONVS
    : tab === 'ai-active' ? MOCK_CONVS.filter(c => c.status === 'active' && !c.manual_mode)
    : tab === 'needs-reply' ? MOCK_CONVS.filter(c => c.manual_mode)
    : MOCK_CONVS.filter(c => c.status === tab);
  return (
    <div>
      <div style={{ fontSize:18,fontWeight:700,color:'#fff',marginBottom:10 }}>Conversations</div>
      <div style={{ display:'flex',gap:2,marginBottom:12,background:'#141414',borderRadius:10,padding:4,width:'fit-content',border:'1px solid #1e1e1e' }}>
        {SC_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display:'flex',alignItems:'center',gap:4,padding:'6px 10px',borderRadius:7,fontSize:10,fontWeight:500,cursor:'pointer',
              background:tab===t.key?'#222':'transparent',color:tab===t.key?'#fff':'#888',border:'none',
              fontFamily:'inherit',transition:'all .15s' }}>
            {t.dot && <span style={{ width:6,height:6,borderRadius:'50%',background:t.dot,flexShrink:0 }}/>}
            {t.label}
          </button>
        ))}
      </div>
      {filtered.map((c,i) => (
        <div key={i} className="ansa-sc-row" style={{ border:`1px solid ${c.manual_mode ? '#f59e0b33' : '#1e1e1e'}`, borderRadius:8, marginBottom:4 }}>
          <div className="ansa-sc-avatar"><MessageSquare size={15}/></div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:'flex',alignItems:'center',gap:5 }}>
              {c.manual_mode && <span style={{ width:6,height:6,borderRadius:'50%',background:'#f59e0b',flexShrink:0 }}/>}
              <div className="ansa-mini-conv-phone">{c.name || c.phone}</div>
            </div>
            {c.name && <div style={{ fontSize:10,color:'#555',marginBottom:1 }}>{c.phone}</div>}
            <div className="ansa-mini-conv-last">{c.last}</div>
          </div>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0,marginLeft:8 }}>
            <span className="ansa-sc-badge" style={{ color: c.manual_mode ? '#f59e0b' : SC_REAL[c.status].color, background: c.manual_mode ? 'rgba(245,158,11,0.12)' : SC_REAL[c.status].bg }}>{c.manual_mode ? 'Needs Reply' : c.status}</span>
            <span style={{ fontSize:10,color:'#666' }}>{c.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShowcaseAppointments() {
  return (
    <div>
      <div style={{ fontSize:18,fontWeight:700,color:'#fff',marginBottom:14 }}>Appointments</div>
      {MOCK_APPTS.map((a,i) => (
        <div key={i} className="ansa-sc-row" style={{ alignItems:'flex-start' }}>
          <div className="ansa-sc-avatar" style={{ marginTop:2 }}><CalendarCheck size={15}/></div>
          <div style={{ flex:1,minWidth:0 }}>
            <div className="ansa-mini-conv-phone">{a.customer}</div>
            <div style={{ fontSize:11.5,color:'#aaa',marginTop:2 }}>{a.service}</div>
            <div style={{ fontSize:11,color:'#666',marginTop:2 }}>{a.time}</div>
          </div>
          <span className="ansa-sc-badge" style={{ color:SC_REAL[a.status].color,background:SC_REAL[a.status].bg,flexShrink:0,marginLeft:8,marginTop:2 }}>{a.status}</span>
        </div>
      ))}
    </div>
  );
}

function ShowcaseAnalytics() {
  return (
    <div>
      <div style={{ fontSize:18,fontWeight:700,color:'#fff',marginBottom:14 }}>Analytics</div>
      <div className="ansa-sc-statgrid">
        {[
          { icon:<PhoneMissed size={16}/>, color:'#3b82f6', val:'31',   label:'Total Calls' },
          { icon:<MessageSquare size={16}/>, color:'#8b5cf6', val:'100%', label:'Response Rate' },
          { icon:<CalendarCheck size={16}/>, color:'#22c55e', val:'45%',  label:'Booking Rate' },
          { icon:<DollarSign size={16}/>, color:'#f59e0b', val:'$5,600', label:'Revenue Recovered' },
        ].map((s,i) => (
          <div key={i} className="ansa-sc-stat">
            <div className="ansa-sc-stat-icon" style={{ background:`${s.color}18` }}><span style={{ color:s.color }}>{s.icon}</span></div>
            <div><div className="ansa-sc-stat-val">{s.val}</div><div className="ansa-sc-stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="ansa-sc-card">
        <div className="ansa-sc-card-title">Calls vs Responses vs Bookings</div>
        <AreaChart data={MOCK_WEEKLY} series={[
          { key:'calls',     color:'#3b82f6' },
          { key:'responses', color:'#8b5cf6' },
          { key:'bookings',  color:'#22c55e' },
        ]}/>
      </div>
      <div className="ansa-sc-card" style={{ marginBottom:0 }}>
        <div className="ansa-sc-card-title">Conversion Funnel</div>
        <Funnel rows={[
          { label:'Missed Calls',     val:31, pct:100, color:'#3b82f6' },
          { label:'SMS Sent',         val:31, pct:100, color:'#8b5cf6' },
          { label:'Customer Replied', val:24, pct:77,  color:'#f59e0b' },
          { label:'Booked',           val:14, pct:45,  color:'#22c55e' },
        ]}/>
      </div>
    </div>
  );
}

function ShowcaseSettings() {
  return (
    <div>
      <div style={{ fontSize:18,fontWeight:700,color:'#fff',marginBottom:14 }}>Settings</div>
      <div className="ansa-sc-card" style={{ marginBottom:10 }}>
        <div className="ansa-sc-card-title">Business Info</div>
        {[
          { label:'Business Name', val:'Johns Contracting' },
          { label:'Phone Number',  val:'+1 (424) 622-5851' },
          { label:'Trade',         val:'General Contractor' },
          { label:'Service Area',  val:'Newport Beach, CA' },
        ].map((f,i) => (
          <div key={i} style={{ marginBottom:10 }}>
            <div style={{ fontSize:10,color:'#666',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.5px',fontWeight:600 }}>{f.label}</div>
            <div style={{ background:'#1a1a1a',border:'1px solid #1e1e1e',borderRadius:8,padding:'8px 12px',fontSize:12.5,color:'#ccc' }}>{f.val}</div>
          </div>
        ))}
      </div>
      <div className="ansa-sc-card" style={{ marginBottom:0 }}>
        <div className="ansa-sc-card-title">AI Greeting</div>
        <div style={{ background:'#1a1a1a',border:'1px solid #1e1e1e',borderRadius:8,padding:'10px 12px',fontSize:12,color:'#ccc',lineHeight:1.6,marginBottom:10 }}>
          Hey! Thanks for calling Johns Contracting — sorry we missed you. How can we help?
        </div>
        <div style={{ display:'flex',gap:6 }}>
          {['Professional','Friendly','Casual'].map((t,i) => (
            <div key={t} style={{ padding:'4px 10px',borderRadius:6,fontSize:11,fontWeight:600,
              background:i===1?'rgba(59,130,246,.15)':'transparent',
              color:i===1?'#93c5fd':'#666',
              border:`1px solid ${i===1?'rgba(59,130,246,.3)':'#1e1e1e'}` }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SIDEBAR_NAV = [
  { label:'Overview',      idx:0, icon:<LayoutDashboard size={15}/> },
  { label:'Missed Calls',  idx:1, icon:<PhoneMissed size={15}/> },
  { label:'Conversations', idx:2, icon:<MessageSquare size={15}/> },
  { label:'Appointments',  idx:3, icon:<CalendarCheck size={15}/> },
  { label:'Analytics',     idx:4, icon:<BarChart3 size={15}/> },
  { label:'Settings',      idx:5, icon:<Settings size={15}/> },
];
const PAGE_TITLES = ['Overview','Missed Calls','Conversations','Appointments','Analytics','Settings'];
const SHOWCASE_VIEWS = [ShowcaseOverview, ShowcaseMissedCalls, ShowcaseConversations, ShowcaseAppointments, ShowcaseAnalytics, ShowcaseSettings];
function DashboardShowcase() {
  const [view, setView] = useState(0);

  const prev = () => setView(v => (v - 1 + SHOWCASE_VIEWS.length) % SHOWCASE_VIEWS.length);
  const next = () => setView(v => (v + 1) % SHOWCASE_VIEWS.length);
  const ActiveView = SHOWCASE_VIEWS[view];

  const ArrowBtn = ({ onClick, children }) => (
    <button onClick={onClick} style={{
      width:40, height:40, borderRadius:'50%', border:'1px solid #1e1e1e',
      background:'#111', color:'#888', display:'flex', alignItems:'center',
      justifyContent:'center', cursor:'pointer', flexShrink:0,
      transition:'all .15s', fontFamily:'inherit',
    }}
    onMouseEnter={e => { e.currentTarget.style.background='#1e1e1e'; e.currentTarget.style.color='#fff'; }}
    onMouseLeave={e => { e.currentTarget.style.background='#111'; e.currentTarget.style.color='#888'; }}
    >{children}</button>
  );

  return (
    <div style={{ display:'flex', alignItems:'center', gap:16 }}>
      <ArrowBtn onClick={prev}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </ArrowBtn>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="ansa-showcase-wrap">
          <div className="ansa-showcase-chrome">
            <div className="ansa-showcase-dots"><span/><span/><span/></div>
            <div className="ansa-showcase-url">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>ansaco.ai</span>
            </div>
          </div>
          <div className="ansa-showcase-app">
            <div className="ansa-showcase-sidebar">
              <div className="ansa-showcase-logo">ansa<span>.</span></div>
              <div className="ansa-showcase-nav-section">
                {SIDEBAR_NAV.map(item => (
                  <div key={item.idx} onClick={() => setView(item.idx)}
                    className={`ansa-showcase-nav-item${view===item.idx?' active':''}`}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="ansa-showcase-sidebar-footer">
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
                  <div style={{ width:34,height:34,borderRadius:8,background:'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13,flexShrink:0 }}>J</div>
                  <div style={{ overflow:'hidden' }}>
                    <div style={{ fontSize:12,fontWeight:600,color:'#e5e5e5',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>Johns Contracting</div>
                    <div style={{ fontSize:10.5,color:'#666' }}>Pro Plan</div>
                  </div>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#666',padding:'5px 0',cursor:'pointer' }}><HeadphonesIcon size={13}/> Contact support</div>
                <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#666',padding:'5px 0',cursor:'pointer' }}><LogOut size={13}/> Log out</div>
              </div>
            </div>
            <div className="ansa-showcase-main">
              <div className="ansa-showcase-topbar">
                <div style={{ fontSize:16,fontWeight:600,color:'#fff' }}>{PAGE_TITLES[view]}</div>
                <div style={{ width:34,height:34,borderRadius:'50%',background:'#1e1e1e',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600,color:'#999',border:'2px solid #333' }}>JL</div>
              </div>
              <div className="ansa-showcase-content">
                <ActiveView key={view}/>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display:'flex',justifyContent:'center',gap:6,marginTop:10 }}>
          {SHOWCASE_VIEWS.map((_,i) => (
            <button key={i} onClick={() => setView(i)} style={{
              width: i===view ? 20 : 6, height:6, borderRadius:3, border:'none',
              background: i===view ? '#3b82f6' : '#1e1e1e',
              cursor:'pointer', padding:0, transition:'all .2s',
            }}/>
          ))}
        </div>
        <div style={{ textAlign:'center',marginTop:6,fontSize:12,color:'#666' }}>Click any section in the sidebar to explore</div>
      </div>
      <ArrowBtn onClick={next}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </ArrowBtn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePhone, setActivePhone] = useState(0);
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

  // Doubled for seamless marquee loop
  const marqueeItems = [...PROOF_ITEMS, ...PROOF_ITEMS];

  return (
    <div className="ansa-landing">

      {/* Nav */}
      <nav className="ansa-nav">
        <div className="ansa-nav-inner">
          <a href="#/" className="ansa-logo">ansa<span>.</span></a>
          <div className="ansa-nav-links">
            <a href="#how-it-works" onClick={scrollTo('how-it-works')}>How It Works</a>
            <a href="#product" onClick={scrollTo('product')}>See the Dashboard</a>
            <a href="#pricing" onClick={scrollTo('pricing')}>Pro Plan</a>
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
          <a href="#product" onClick={scrollTo('product')}>See the Dashboard</a>
          <a href="#pricing" onClick={scrollTo('pricing')}>Pro Plan</a>
          <a href="#faq" onClick={scrollTo('faq')}>FAQ</a>
          <a href="#/login" style={{ color:'#a1a1aa',textDecoration:'none',fontSize:'15px',fontWeight:'500' }}>Log In</a>
          <a href="#/signup" className="ansa-btn ansa-btn-blue" style={{ padding:'10px 22px',fontSize:14,textAlign:'center',color:'#fff' }}>Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="ansa-hero">
        <div className="ansa-hero-glow" />
        <div className="ansa-hero-badge"><Zap size={14} /> Built for Home Service Pros</div>
        <h1>Every Missed Call Is a Job You Didn't Book</h1>
        <p className="ansa-hero-sub">
          When you miss a call, Ansa texts back in under 15 seconds, answers their questions with AI, and books the appointment — all before they call your competitor. No receptionist. No voicemail. No lost jobs.
        </p>
        <div className="ansa-hero-ctas">
          <a href="#/signup" className="ansa-btn ansa-btn-blue">Start Free Trial <ArrowRight size={16} /></a>
          <a href="#how-it-works" className="ansa-btn ansa-btn-outline" onClick={scrollTo('how-it-works')}>See How It Works</a>
        </div>
        <div className="ansa-trust-line">No credit card required &nbsp;·&nbsp; Setup in 5 minutes &nbsp;·&nbsp; Cancel anytime</div>
        <div className="ansa-phones-row">
          {HERO_PHONES.map((p, idx) => {
            const isCenter = idx === activePhone;
            return (
              <div
                key={idx}
                className={`ansa-phone-slot ${isCenter ? 'is-center' : 'is-side'}`}
                onClick={isCenter ? undefined : () => setActivePhone(idx)}
              >
                <div className="ansa-phone">
                  <div className="ansa-phone-notch" />
                  <div className="ansa-phone-status">
                    <span className="ansa-phone-biz">{p.biz}</span>
                    <span className="ansa-phone-time">{p.time}</span>
                  </div>
                  <div className="ansa-chat-area" style={{ flex:1,overflowY:'auto' }}>
                    {p.messages.map((m, i) => (
                      <div key={i} className={`ansa-chat-bubble ${m.from === 'ai' ? 'ansa-chat-incoming' : 'ansa-chat-outgoing'}`}>
                        {m.text}
                      </div>
                    ))}
                    {p.banner && (
                      <div className="ansa-booked-banner">
                        <div className="ansa-booked-banner-dot" />
                        <div className="ansa-booked-banner-text">{p.banner}</div>
                      </div>
                    )}
                    {p.callbackBanner && (
                      <div className="ansa-booked-banner" style={{ background:'rgba(79,110,247,.08)',borderColor:'rgba(79,110,247,.2)' }}>
                        <div className="ansa-booked-banner-dot" style={{ background:'#4F6EF7' }} />
                        <div className="ansa-booked-banner-text" style={{ color:'#818cf8' }}>{p.callbackBanner}</div>
                      </div>
                    )}
                  </div>
                </div>
                {!isCenter && <div className="ansa-phone-hint">tap to expand</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Social proof strip */}
      <div className="ansa-proof-strip">
        <div className="ansa-proof-track">
          {marqueeItems.map((item, i) => (
            <span className="ansa-proof-item" key={i}>
              <span className="ansa-proof-dot" />
              {item}
            </span>
          ))}
        </div>
      </div>
      <div style={{ padding:'40px 24px' }}>
        <div className="ansa-stats-band ansa-reveal">
          <div className="ansa-stats-band-cell">
            <div className="ansa-stats-band-num">15s</div>
            <div className="ansa-stats-band-label">Text-back time after a missed call</div>
          </div>
          <div className="ansa-stats-band-cell">
            <div className="ansa-stats-band-num">30</div>
            <div className="ansa-stats-band-label">Day free trial — no credit card required</div>
          </div>
          <div className="ansa-stats-band-cell">
            <div className="ansa-stats-band-num">24/7</div>
            <div className="ansa-stats-band-label">Always on — nights, weekends, holidays</div>
          </div>
        </div>
      </div>

      {/* Problem */}
      <section className="ansa-section" id="problem">
        <div className="ansa-reveal">
          <p className="ansa-section-label">The Problem</p>
          <h2 className="ansa-section-title">You're Losing Money Every Time You Miss a Call</h2>
          <p className="ansa-section-sub">When you can't pick up, your next customer calls the competition instead.</p>
        </div>
        <div className="ansa-problem-grid ansa-reveal">
          {[
            { icon:<PhoneOff size={26}/>, value:62, suffix:'%', desc:"of calls to home service businesses go unanswered during work hours" },
            { icon:<MessageSquareOff size={26}/>, value:85, suffix:'%', desc:"of callers won't leave a voicemail — they just call the next company" },
            { icon:<DollarSign size={26}/>, prefix:'$', value:1200, suffix:'', desc:"average revenue lost per missed call for home service businesses" },
          ].map((item,i) => (
            <div className="ansa-problem-card" key={i}>
              <div className="ansa-problem-icon">{item.icon}</div>
              <AnimatedStat prefix={item.prefix||''} value={item.value} suffix={item.suffix} />
              <div className="ansa-problem-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <div className="ansa-section-wrap-tinted">
      <section className="ansa-section" id="testimonials">
        <div className="ansa-reveal">
          <p className="ansa-section-label">Real Results</p>
          <h2 className="ansa-section-title">Home Service Pros Who Stopped Losing Leads</h2>
          <p className="ansa-section-sub">What happens when you stop letting missed calls go to voicemail.</p>
        </div>
        <div className="ansa-testimonials ansa-reveal">
          {TESTIMONIALS.map((t,i) => (
            <div className="ansa-testimonial-card" key={i}>
              <div className="ansa-testimonial-stars">{[...Array(5)].map((_,j) => <Star key={j} size={16} fill="#facc15" stroke="#facc15"/>)}</div>
              <div className="ansa-testimonial-text">"{t.text}"</div>
              <div className="ansa-testimonial-author">
                <div className="ansa-testimonial-avatar-initials" style={{ background:t.color }}>{t.initials}</div>
                <div><div className="ansa-testimonial-name">{t.name}</div><div className="ansa-testimonial-biz">{t.biz}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </div>

      {/* How It Works */}
      <div className="ansa-section-wrap-tinted">
      <section className="ansa-section" id="how-it-works">
        <div className="ansa-reveal">
          <p className="ansa-section-label">How It Works</p>
          <h2 className="ansa-section-title">Three Steps Between a Missed Call and a Booked Job</h2>
          <p className="ansa-section-sub">Automatic, instant, and done before you finish the job you're on.</p>
        </div>
        <div className="ansa-steps ansa-reveal">
          <div className="ansa-step-card"><div className="ansa-step-num">1</div><div className="ansa-step-icon"><Phone size={24}/></div><div className="ansa-step-title">Miss a Call</div><div className="ansa-step-desc">You're on the job. A customer calls. You can't answer. Ansa detects it instantly.</div></div>
          <div className="ansa-step-arrow"><ArrowRight size={28}/></div>
          <div className="ansa-step-card"><div className="ansa-step-num">2</div><div className="ansa-step-icon"><MessageCircle size={24}/></div><div className="ansa-step-title">Ansa Texts Back</div><div className="ansa-step-desc">Within 15 seconds, a personalized text goes out from your number. No app, no action needed.</div></div>
          <div className="ansa-step-arrow"><ArrowRight size={28}/></div>
          <div className="ansa-step-card"><div className="ansa-step-num">3</div><div className="ansa-step-icon"><CalendarCheck size={24}/></div><div className="ansa-step-title">Job Booked</div><div className="ansa-step-desc">AI handles the conversation and locks in the appointment. You get a notification.</div></div>
        </div>
      </section>
      </div>

      {/* Before / After */}
      <section className="ansa-section">
        <div className="ansa-reveal">
          <p className="ansa-section-label">The Difference</p>
          <h2 className="ansa-section-title">What Changes When You Have Ansa</h2>
          <p className="ansa-section-sub">Every missed call used to mean a lost job. Not anymore.</p>
        </div>
        <div className="ansa-compare ansa-reveal">
          <div className="ansa-compare-col ansa-compare-col-bad">
            <div className="ansa-compare-col-title">
              <XCircle size={18} color="#ef4444" />
              <span style={{ color:'#fca5a5' }}>Without Ansa</span>
            </div>
            {[
              "Phone rings while you're on the job",
              "Missed call — goes to voicemail or rings out",
              "Customer Googles the next contractor",
              "They call someone else and book with them",
              "You find out hours later, if at all",
              "You lose a $400–$2,000 job. Again.",
            ].map((row,i) => (
              <div className="ansa-compare-row" key={i}>
                <XCircle size={15} className="ansa-compare-icon-bad" />
                {row}
              </div>
            ))}
          </div>
          <div className="ansa-compare-col ansa-compare-col-good">
            <div className="ansa-compare-col-title">
              <CheckCircle size={18} color="#10b981" />
              <span style={{ color:'#6ee7b7' }}>With Ansa</span>
            </div>
            {[
              "Phone rings while you're on the job",
              "Ansa detects the missed call in seconds",
              "Customer gets a text from your number in 15s",
              "AI answers questions, handles objections, books it",
              "You get a notification: new job booked",
              "You just made $400–$2,000 without touching your phone.",
            ].map((row,i) => (
              <div className="ansa-compare-row" key={i}>
                <CheckCircle size={15} className="ansa-compare-icon-good" />
                {row}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — bento grid */}
      <div className="ansa-section-wrap-tinted">
        <section className="ansa-section" id="features">
          <div className="ansa-reveal">
            <p className="ansa-section-label">Features</p>
            <h2 className="ansa-section-title">Everything Built to Capture Every Lead</h2>
            <p className="ansa-section-sub">Three things Ansa does better than any person with a phone.</p>
          </div>
          <div className="ansa-bento ansa-reveal">
            {/* Row 1: Speed (wide) + stat card */}
            <div className="ansa-bento-card ansa-bento-wide" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <VisualTextBack />
              <div>
                <div className="ansa-bento-eyebrow">Response Speed</div>
                <h3 className="ansa-bento-title">Texts back in under 15 seconds — before they call someone else</h3>
                <p className="ansa-bento-body">The window between a missed call and a lost customer is about 30 seconds. Ansa fires a text the instant a call goes unanswered.</p>
                <ul className="ansa-bento-points">
                  {['Texts back in 10–15 seconds','Works 24/7, including after-hours','Personalised with your business name'].map((p,j) => (
                    <li key={j}><Check size={14} color={PRIMARY}/>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="ansa-bento-card ansa-bento-accent" style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', minHeight:200 }}>
              <div className="ansa-bento-num">62%</div>
              <div className="ansa-bento-num-label">of home service calls go unanswered during work hours</div>
            </div>

            {/* Row 2: stat card + AI (wide) */}
            <div className="ansa-bento-card ansa-bento-accent" style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', minHeight:200 }}>
              <div className="ansa-bento-num">85%</div>
              <div className="ansa-bento-num-label">of callers won't leave a voicemail — they call the next business</div>
            </div>
            <div className="ansa-bento-card ansa-bento-wide" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <VisualConversation />
              <div>
                <div className="ansa-bento-eyebrow">AI Conversations</div>
                <h3 className="ansa-bento-title">Answers questions like you would — without you lifting a finger</h3>
                <p className="ansa-bento-body">Trained on your exact services, pricing, and FAQs. It handles the back-and-forth so customers are ready to book before you even know they called.</p>
                <ul className="ansa-bento-points">
                  {['Trained on your services & pricing','Natural, two-way texting','Jump in anytime from your dashboard'].map((p,j) => (
                    <li key={j}><Check size={14} color={PRIMARY}/>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Row 3: Booking — full width horizontal */}
            <div className="ansa-bento-card ansa-bento-full">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'center' }}>
                <div>
                  <div className="ansa-bento-eyebrow">Smart Booking</div>
                  <h3 className="ansa-bento-title">Books the job into your calendar — automatically</h3>
                  <p className="ansa-bento-body">No phone tag. No back-and-forth. Ansa checks your real availability, confirms the appointment, and sends you a notification. Done.</p>
                  <ul className="ansa-bento-points">
                    {['Syncs with Google Calendar','Real-time availability checking','Instant confirmation to customer & you'].map((p,j) => (
                      <li key={j}><Check size={14} color={PRIMARY}/>{p}</li>
                    ))}
                  </ul>
                </div>
                <VisualBooking />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Dashboard Showcase */}
      <section className="ansa-section" id="product">
        <div className="ansa-reveal">
          <p className="ansa-section-label">The Product</p>
          <h2 className="ansa-section-title">Your Command Center for Every Lead</h2>
          <p className="ansa-section-sub">Real-time dashboard. Every missed call, every conversation, every booked job — the moment it happens.</p>
        </div>
        <div className="ansa-reveal">
          <DashboardShowcase />
        </div>
      </section>

      {/* Integrations + Notifications — combined split section */}
      <div className="ansa-section-wrap-tinted">
        <div className="ansa-split-section ansa-reveal">
          {/* Left: integrations */}
          <div>
            <div className="ansa-split-label">Works With Your World</div>
            <h2 className="ansa-split-title">Plugs into the tools you already use</h2>
            <p className="ansa-split-body">No new software, no complicated setup. Ansa connects to your calendar, texts from your existing number, and uses the same AI that powers the biggest companies in the world.</p>
            <div className="ansa-integrations">
              {[
                { icon:<CalendarCheck size={17}/>, label:'Google Calendar', sub:'Your real availability, synced' },
                { icon:<Phone size={17}/>, label:'Your Phone Number', sub:'Texts go out from your number' },
                { icon:<MessageCircle size={17}/>, label:'SMS / Text', sub:'Native carrier-grade messaging' },
                { icon:<Zap size={17}/>, label:'Claude AI', sub:'Powered by Anthropic' },
              ].map((int,i) => (
                <div key={i} className="ansa-integration-pill">
                  <div className="ansa-integration-icon">{int.icon}</div>
                  <div>
                    <div style={{ fontWeight:600,fontSize:13,color:'#e5e5e5' }}>{int.label}</div>
                    <div style={{ fontSize:11,color:'#555',marginTop:1 }}>{int.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: phone notifications */}
          <div style={{ display:'flex',justifyContent:'center' }}>
            <div style={{ background:'#141414',border:'1px solid rgba(255,255,255,.08)',borderRadius:32,padding:'24px 18px',width:320,boxShadow:'0 24px 80px rgba(0,0,0,.5),0 0 60px rgba(79,110,247,.08)' }}>
              <div style={{ width:70,height:4,background:'#2a2a2a',borderRadius:99,margin:'0 auto 20px' }} />
              <div style={{ textAlign:'center',marginBottom:22 }}>
                <div style={{ fontSize:12,color:'#444',marginBottom:3 }}>Monday, June 9</div>
                <div style={{ fontSize:38,fontWeight:700,color:'#fff',letterSpacing:-1,lineHeight:1 }}>2:14 PM</div>
              </div>
              <div style={{ fontSize:11,fontWeight:600,color:'#555',textTransform:'uppercase',letterSpacing:'1px',marginBottom:10,paddingLeft:2 }}>Notifications</div>
              {[
                { title:'Missed Call', body:'(714) 555-0182 just called. AI response sent in 12 seconds.', time:'2:14 PM', color:'#3b82f6' },
                { title:'Appointment Booked', body:'Marcus T. booked a leaking faucet repair · Thu Jun 12, 10:00 AM', time:'2:17 PM', color:'#22c55e' },
                { title:'Callback Requested', body:'(949) 555-0391: "I\'d rather just talk — can you call me back?"', time:'3:44 PM', color:'#f59e0b' },
              ].map((n,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'11px 13px',marginBottom:i<2?8:0 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                      <span style={{ width:7,height:7,borderRadius:'50%',background:n.color,display:'inline-block',flexShrink:0 }}/>
                      <span style={{ fontSize:11.5,fontWeight:700,color:'#e5e5e5' }}>{n.title}</span>
                    </div>
                    <span style={{ fontSize:10,color:'#444' }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize:11,color:'#71717a',lineHeight:1.5 }}>{n.body}</div>
                </div>
              ))}
              <div style={{ width:100,height:3,background:'#222',borderRadius:99,margin:'20px auto 0' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="ansa-section-wrap-blue">
      <section className="ansa-section" id="pricing">
        <div className="ansa-reveal">
          <p className="ansa-section-label">Pricing</p>
          <h2 className="ansa-section-title">One Recovered Job Pays for the Year</h2>
          <p className="ansa-section-sub">The average contractor loses $2,400/month to missed calls. Ansa costs $297. Do the math.</p>
        </div>
        <div className="ansa-pricing-grid ansa-reveal">
          <div className="ansa-pricing-card">
            <div className="ansa-pricing-roi">
              If Ansa books just <strong>1 job per month</strong>, it pays for itself. Most customers recover <strong>$2,400+/month</strong>. That's 8× ROI on day one.
            </div>
            <div className="ansa-pricing-tier">Pro</div>
            <div className="ansa-pricing-price">$297<span>/mo</span></div>
            <div className="ansa-pricing-subtitle">Everything you need to never lose another lead</div>
            <ul className="ansa-pricing-features">
              {[
                'Unlimited missed calls',
                'Full AI conversation engine',
                'Direct calendar booking',
                'Advanced analytics dashboard',
                'Priority support',
                'Custom AI voice & training',
                '30-day free trial included',
              ].map(f => <li key={f}><Check size={16} color={PRIMARY}/>{f}</li>)}
            </ul>
            <a href="#/signup" className="ansa-pricing-cta ansa-pricing-cta-primary">Start Free Trial — 30 Days Free</a>
            <div className="ansa-trust-line" style={{ marginTop:14 }}>No credit card required &nbsp;·&nbsp; Cancel anytime</div>
          </div>
        </div>
      </section>
      </div>

      {/* FAQ */}
      <section className="ansa-section" id="faq">
        <div className="ansa-reveal">
          <p className="ansa-section-label">FAQ</p>
          <h2 className="ansa-section-title">Frequently Asked Questions</h2>
          <p className="ansa-section-sub">Everything you need to know before getting started.</p>
        </div>
        <div className="ansa-faq-list ansa-reveal">
          {FAQ_DATA.map((item,i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* Final CTA */}
      <section className="ansa-final-cta">
        <div className="ansa-final-cta-inner ansa-reveal">
          <h2>Stop Losing Jobs to Voicemail.</h2>
          <p>Every day without Ansa is another 3–5 calls going unanswered. Start your free trial in 5 minutes.</p>
          <a href="#/signup" className="ansa-btn" style={{ background:'#fff',color:'#1e3a5f',fontWeight:700,boxShadow:'0 0 30px rgba(255,255,255,.2)' }}>
            Start Your Free Trial <ArrowRight size={16}/>
          </a>
          <div className="ansa-trust-line" style={{ color:'rgba(255,255,255,.4)',marginTop:16 }}>No credit card required &nbsp;·&nbsp; Setup in 5 minutes &nbsp;·&nbsp; Cancel anytime</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ansa-footer">
        <div style={{ display:'flex',alignItems:'center',gap:24 }}>
          <a href="#/" className="ansa-logo" style={{ fontSize:20 }}>ansa<span>.</span></a>
          <span className="ansa-footer-copy">© 2026 Ansa Co LLC. All rights reserved.</span>
        </div>
        <div className="ansa-footer-links">
          <a href="mailto:hello@ansaco.ai">Contact</a>
          <a href="#/terms">Terms</a>
          <a href="#/privacy">Privacy</a>
          <a href="#/login">Log In</a>
          <a href="#/signup">Sign Up</a>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="ansa-sticky-cta">
        <a href="#/signup">Start Free Trial — 30 Days Free <ArrowRight size={15} /></a>
      </div>

    </div>
  );
}
