import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, MessageSquareOff, DollarSign, Phone, MessageCircle, CalendarCheck, Zap, Check, ChevronDown, Star, ArrowRight, Menu, X, CheckCircle, XCircle } from 'lucide-react';

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
    .ansa-btn-blue{background:${PRIMARY};color:#fff!important;box-shadow:0 0 20px rgba(79,110,247,.3)}
    .ansa-btn-blue:hover{background:${PRIMARY_HOVER};box-shadow:0 0 32px rgba(79,110,247,.45);transform:translateY(-1px)}
    .ansa-btn-outline{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.15)}
    .ansa-btn-outline:hover{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.04);transform:translateY(-1px)}

    /* Trust line under CTAs */
    .ansa-trust-line{font-size:12px;color:#52525b;margin-top:12px;text-align:center;letter-spacing:.2px}

    /* Hero */
    .ansa-hero{position:relative;padding:160px 24px 80px;text-align:center;overflow:hidden}
    .ansa-hero-glow{position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:720px;height:720px;border-radius:50%;background:radial-gradient(circle,rgba(79,110,247,.15) 0%,transparent 70%);pointer-events:none;animation:ansa-pulse 6s ease-in-out infinite}
    .ansa-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:999px;font-size:13px;font-weight:600;background:rgba(79,110,247,.1);border:1px solid rgba(79,110,247,.25);color:${PRIMARY_LIGHT};margin-bottom:16px;animation:ansa-fadeUp .7s ease both}
    .ansa-hero-announce{display:inline-flex;align-items:center;gap:7px;padding:6px 14px 6px 10px;border-radius:999px;font-size:13px;font-weight:500;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#a1a1aa;text-decoration:none;margin-bottom:28px;animation:ansa-fadeUp .8s ease .1s both;transition:border-color .2s,color .2s}
    .ansa-hero-announce:hover{border-color:rgba(79,110,247,.5);color:#fff}
    .ansa-hero-announce-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0;box-shadow:0 0 6px #22c55e}
    .ansa-hero h1{font-size:clamp(36px,5.5vw,64px);font-weight:900;line-height:1.08;max-width:820px;margin:0 auto 24px;letter-spacing:-1.5px;animation:ansa-fadeUp .7s ease .1s both}
    .ansa-hero-sub{font-size:clamp(16px,2vw,19px);color:#a1a1aa;max-width:620px;margin:0 auto 40px;line-height:1.65;animation:ansa-fadeUp .7s ease .2s both}
    .ansa-hero-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;animation:ansa-fadeUp .7s ease .3s both}
    .ansa-phone-wrap{margin:64px auto 0;max-width:380px;animation:ansa-fadeUp .8s ease .5s both}
    .ansa-phone{background:#141414;border:1px solid #2a2a2a;border-radius:28px;padding:20px 18px;position:relative;box-shadow:0 24px 80px rgba(0,0,0,.5),0 0 60px rgba(79,110,247,.08);animation:ansa-float 6s ease-in-out infinite}
    .ansa-phone-notch{width:120px;height:6px;background:#222;border-radius:99px;margin:0 auto 20px}
    .ansa-phone-header{font-size:13px;color:#a1a1aa;text-align:center;margin-bottom:18px;font-weight:500}
    .ansa-chat-bubble{padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.5;margin-bottom:10px;max-width:85%}
    .ansa-chat-incoming{background:#1e293b;color:#e2e8f0;border-bottom-left-radius:6px;margin-right:auto}
    .ansa-chat-outgoing{background:${PRIMARY};color:#fff;border-bottom-right-radius:6px;margin-left:auto}
    .ansa-chat-typing{display:flex;gap:4px;padding:12px 16px;max-width:70px;background:#1e293b;border-radius:18px;border-bottom-left-radius:6px;margin-right:auto}
    .ansa-chat-typing span{width:7px;height:7px;background:#64748b;border-radius:50%;animation:ansa-typing 1.4s infinite}
    .ansa-chat-typing span:nth-child(2){animation-delay:.2s}
    .ansa-chat-typing span:nth-child(3){animation-delay:.4s}
    .ansa-booked-banner{display:flex;align-items:center;gap:10px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);border-radius:12px;padding:12px 14px;margin-top:14px}
    .ansa-booked-banner-dot{width:8px;height:8px;border-radius:50%;background:#10b981;flex-shrink:0}
    .ansa-booked-banner-text{font-size:12px;color:#6ee7b7;line-height:1.4}

    /* Social proof strip */
    .ansa-proof-strip{border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;padding:20px 0;overflow:hidden;position:relative}
    .ansa-proof-strip::before,.ansa-proof-strip::after{content:'';position:absolute;top:0;bottom:0;width:80px;z-index:2;pointer-events:none}
    .ansa-proof-strip::before{left:0;background:linear-gradient(to right,#0a0a0a,transparent)}
    .ansa-proof-strip::after{right:0;background:linear-gradient(to left,#0a0a0a,transparent)}
    .ansa-proof-track{display:flex;animation:ansa-marquee 28s linear infinite;white-space:nowrap}
    .ansa-proof-item{display:inline-flex;align-items:center;gap:8px;padding:0 32px;font-size:13px;color:#71717a;font-weight:500;flex-shrink:0}
    .ansa-proof-dot{width:4px;height:4px;border-radius:50%;background:#3f3f46;flex-shrink:0}
    .ansa-proof-stats{display:flex;justify-content:center;gap:48px;padding:28px 24px;max-width:800px;margin:0 auto}
    .ansa-proof-stat{text-align:center}
    .ansa-proof-stat-num{font-size:28px;font-weight:800;letter-spacing:-1px;color:#fff}
    .ansa-proof-stat-label{font-size:12px;color:#71717a;margin-top:2px}

    /* Sections */
    .ansa-section{max-width:1200px;margin:0 auto;padding:100px 24px}
    .ansa-section-label{font-size:13px;font-weight:600;color:${PRIMARY};text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;text-align:center}
    .ansa-section-title{font-size:clamp(28px,4vw,44px);font-weight:800;text-align:center;max-width:700px;margin:0 auto 16px;letter-spacing:-1px;line-height:1.15}
    .ansa-section-sub{font-size:17px;color:#a1a1aa;text-align:center;max-width:560px;margin:0 auto 56px;line-height:1.6}

    /* Problem cards */
    .ansa-problem-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .ansa-problem-card{background:#141414;border:1px solid #222;border-radius:20px;padding:36px 28px;text-align:center;transition:border-color .3s,transform .3s}
    .ansa-problem-card:hover{border-color:#333;transform:translateY(-4px)}
    .ansa-problem-icon{width:56px;height:56px;border-radius:16px;background:rgba(79,110,247,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:${PRIMARY}}
    .ansa-problem-stat{font-size:32px;font-weight:800;margin-bottom:8px;letter-spacing:-.5px;transition:all .3s}
    .ansa-problem-desc{font-size:15px;color:#a1a1aa;line-height:1.5}

    /* Testimonials */
    .ansa-testimonials{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .ansa-testimonial-card{background:#141414;border:1px solid #1e1e1e;border-radius:20px;padding:32px 28px;transition:border-color .3s}
    .ansa-testimonial-card:hover{border-color:#333}
    .ansa-testimonial-stars{display:flex;gap:3px;margin-bottom:16px;color:#facc15}
    .ansa-testimonial-text{font-size:15px;color:#d1d5db;line-height:1.65;margin-bottom:20px}
    .ansa-testimonial-author{display:flex;align-items:center;gap:12px}
    .ansa-testimonial-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0}
    .ansa-testimonial-avatar-initials{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;color:#fff;flex-shrink:0}
    .ansa-testimonial-name{font-size:14px;font-weight:600}
    .ansa-testimonial-biz{font-size:13px;color:#71717a}

    /* Steps */
    .ansa-steps{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:0;align-items:flex-start}
    .ansa-step-card{background:#141414;border:1px solid #222;border-radius:20px;padding:36px 24px;text-align:center;position:relative;transition:border-color .3s,transform .3s}
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

    /* Chess features layout */
    .ansa-chess{display:flex;flex-direction:column;gap:64px}
    .ansa-chess-row{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
    .ansa-chess-row.flip{direction:rtl}
    .ansa-chess-row.flip > *{direction:ltr}
    .ansa-chess-text{}
    .ansa-chess-eyebrow{font-size:12px;font-weight:600;color:${PRIMARY};text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
    .ansa-chess-title{font-size:clamp(22px,3vw,30px);font-weight:800;letter-spacing:-.5px;line-height:1.2;margin-bottom:16px}
    .ansa-chess-body{font-size:16px;color:#a1a1aa;line-height:1.7;margin-bottom:24px}
    .ansa-chess-points{list-style:none;padding:0;display:flex;flex-direction:column;gap:10px}
    .ansa-chess-points li{display:flex;align-items:center;gap:10px;font-size:14px;color:#d1d5db}
    .ansa-chess-visual{background:#141414;border:1px solid #222;border-radius:20px;padding:28px;min-height:240px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
    .ansa-chess-visual::before{content:'';position:absolute;top:-60px;right:-60px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(79,110,247,.08) 0%,transparent 70%);pointer-events:none}

    /* Integrations */
    .ansa-integrations{display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap}
    .ansa-integration-pill{display:flex;align-items:center;gap:10px;background:#141414;border:1px solid #222;border-radius:14px;padding:14px 22px;font-size:14px;font-weight:500;color:#d1d5db;transition:border-color .2s}
    .ansa-integration-pill:hover{border-color:#333}
    .ansa-integration-icon{width:32px;height:32px;border-radius:8px;background:#1a1a1a;border:1px solid #2a2a2a;display:flex;align-items:center;justify-content:center;color:#a1a1aa;flex-shrink:0}
    .ansa-integration-plus{font-size:18px;color:#3f3f46;font-weight:300}

    /* Pricing */
    .ansa-pricing-grid{display:grid;grid-template-columns:1fr;gap:24px;max-width:480px;margin:0 auto}
    .ansa-pricing-card{background:#141414;border:1px solid ${PRIMARY};border-radius:22px;padding:40px 32px;position:relative;transition:border-color .3s,transform .3s}
    .ansa-pricing-card:hover{transform:translateY(-4px)}
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
    .ansa-pricing-cta-primary{background:${PRIMARY};color:#fff;border:none;box-shadow:0 0 20px rgba(79,110,247,.25)}
    .ansa-pricing-cta-primary:hover{background:${PRIMARY_HOVER}}

    /* FAQ */
    .ansa-faq-list{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
    .ansa-faq-item{background:#141414;border:1px solid #1e1e1e;border-radius:16px;overflow:hidden;transition:border-color .3s}
    .ansa-faq-item:hover{border-color:#333}
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
    .ansa-showcase-wrap{border-radius:16px;overflow:hidden;border:1px solid #222;background:#0d0d0d;box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 80px rgba(79,110,247,.07)}
    .ansa-showcase-chrome{background:#141414;border-bottom:1px solid #1a1a1a;padding:11px 16px;display:flex;align-items:center;gap:12px}
    .ansa-showcase-dots{display:flex;gap:6px}
    .ansa-showcase-dots span{width:11px;height:11px;border-radius:50%}
    .ansa-showcase-dots span:nth-child(1){background:#ef4444}
    .ansa-showcase-dots span:nth-child(2){background:#f59e0b}
    .ansa-showcase-dots span:nth-child(3){background:#22c55e}
    .ansa-showcase-url{flex:1;background:#0a0a0a;border:1px solid #1e1e1e;border-radius:6px;padding:4px 12px;font-size:12px;color:#888;text-align:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;align-items:center;justify-content:center;gap:5px}
    .ansa-showcase-url svg{color:#22c55e;flex-shrink:0}
    .ansa-showcase-url span{color:#aaa;font-weight:500}.ansa-showcase-url em{color:#555;font-style:normal}
    .ansa-showcase-app{display:flex;height:500px;overflow:hidden}
    .ansa-showcase-sidebar{width:196px;flex-shrink:0;background:#0d0d0d;border-right:1px solid #1a1a1a;padding:0;display:flex;flex-direction:column}
    .ansa-showcase-logo{padding:16px;font-size:17px;font-weight:800;color:#fff;border-bottom:1px solid #1a1a1a;margin-bottom:6px;letter-spacing:-.3px}
    .ansa-showcase-logo span{color:#4F6EF7}
    .ansa-showcase-nav-item{display:flex;align-items:center;gap:9px;padding:9px 16px;font-size:12.5px;font-weight:500;color:#555;transition:all .15s}
    .ansa-showcase-nav-item.active{color:#fff;background:rgba(255,255,255,.04);border-right:2px solid #4F6EF7}
    .ansa-showcase-main{flex:1;overflow:hidden;background:#0a0a0a;position:relative}
    .ansa-showcase-view{position:absolute;inset:0;overflow-y:auto;padding:20px;opacity:0;transition:opacity .35s ease;pointer-events:none}
    .ansa-showcase-view.active{opacity:1;pointer-events:auto}
    .ansa-showcase-tabs-row{display:flex;justify-content:center;gap:8px;margin-top:16px}
    .ansa-showcase-tab-btn{padding:7px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid #222;background:transparent;color:#71717a;transition:all .2s;font-family:inherit}
    .ansa-showcase-tab-btn:hover{border-color:#333;color:#ccc}
    .ansa-showcase-tab-btn.active{background:#4F6EF7;color:#fff;border-color:#4F6EF7}
    .ansa-showcase-progress{height:2px;background:#1a1a1a;border-radius:1px;margin:10px auto 0;overflow:hidden;max-width:220px}
    .ansa-showcase-progress-bar{height:100%;background:#4F6EF7;border-radius:1px}
    .ansa-mini-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px}
    .ansa-mini-stat{background:#141414;border:1px solid #1e1e1e;border-radius:9px;padding:12px 14px;display:flex;align-items:center;gap:10px}
    .ansa-mini-stat-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
    .ansa-mini-stat-val{font-size:20px;font-weight:700;color:#fff;line-height:1}
    .ansa-mini-stat-label{font-size:10.5px;color:#71717a;margin-top:2px}
    .ansa-mini-chart{background:#141414;border:1px solid #1e1e1e;border-radius:9px;padding:14px;margin-bottom:10px}
    .ansa-mini-chart-title{font-size:12px;font-weight:600;color:#fff;margin-bottom:10px}
    .ansa-mini-bars{display:flex;align-items:flex-end;gap:5px;height:72px}
    .ansa-mini-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px}
    .ansa-mini-bar{width:100%;border-radius:2px 2px 0 0}
    .ansa-mini-bar-label{font-size:9.5px;color:#3f3f46}
    .ansa-mini-conv{display:flex;align-items:center;justify-content:space-between;padding:9px 12px;background:#141414;border:1px solid #1e1e1e;border-radius:8px;margin-bottom:5px}
    .ansa-mini-conv-phone{font-size:12.5px;font-weight:600;color:#fff;margin-bottom:2px}
    .ansa-mini-conv-last{font-size:11px;color:#71717a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}
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
      <div style={{ fontSize:11,color:'#52525b',marginBottom:12,fontWeight:600,textTransform:'uppercase',letterSpacing:'1px' }}>Conversation · AI Handling</div>
      <div className="ansa-chat-bubble ansa-chat-outgoing" style={{ fontSize:13,marginLeft:'auto' }}>Do you guys do water heater installs?</div>
      <div className="ansa-chat-bubble ansa-chat-incoming" style={{ fontSize:13 }}>Yes! We install gas and tankless units. Labor starts at $325. Want to book a free estimate?</div>
      <div className="ansa-chat-bubble ansa-chat-outgoing" style={{ fontSize:13,marginLeft:'auto' }}>Yes please, tomorrow afternoon works</div>
      <div className="ansa-chat-bubble ansa-chat-incoming" style={{ fontSize:13 }}>Perfect — I've got 1:00 PM or 3:00 PM open tomorrow. Which works best?</div>
      <div className="ansa-chat-typing"><span /><span /><span /></div>
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
        <div className="ansa-booked-banner-text">🎉 Job booked automatically while you were on-site. No calls needed.</div>
      </div>
    </div>
  );
}

const CHESS_FEATURES = [
  {
    eyebrow: 'Response Speed',
    title: 'Texts back in under 15 seconds — before they call someone else',
    body: 'The window between a missed call and a lost customer is about 30 seconds. Ansa fires a text the instant a call goes unanswered. Your competitors are still letting it ring.',
    points: ['Texts back in 10–15 seconds', 'Personalised with your business name', 'Works 24/7, including after-hours'],
    Visual: VisualTextBack,
  },
  {
    eyebrow: 'AI Conversations',
    title: 'Answers questions like you would — without you lifting a finger',
    body: 'Your AI is trained on your exact services, pricing, service area, and FAQs. It handles the back-and-forth so customers are ready to book before you even know they called.',
    points: ['Trained on your services & pricing', 'Natural, two-way texting', 'You can jump in anytime from your dashboard'],
    Visual: VisualConversation,
    flip: true,
  },
  {
    eyebrow: 'Smart Booking',
    title: 'Books the job into your calendar — automatically',
    body: 'No phone tag. No back-and-forth. Ansa checks your real availability, confirms the appointment, and sends you a notification. The customer gets a confirmation text. Done.',
    points: ['Syncs with Google Calendar', 'Real-time availability checking', 'Instant confirmation to customer & you'],
    Visual: VisualBooking,
  },
];

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
  { phone:'(949) 555-0182', last:'Yes, 2:00 PM works perfectly!', status:'booked', time:'12m ago' },
  { phone:'(714) 555-0347', last:'Do you do tankless water heaters?', status:'active', time:'34m ago' },
  { phone:'(562) 555-0901', last:'Thanks, we got it sorted.', status:'closed', time:'2h ago' },
  { phone:'(310) 555-0264', last:'What areas do you service?', status:'active', time:'3h ago' },
  { phone:'(949) 555-0773', last:'Appointment confirmed for tomorrow!', status:'booked', time:'5h ago' },
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

const SC = {
  booked:    { color:'#22c55e', bg:'rgba(34,197,94,0.15)' },
  active:    { color:'#4F6EF7', bg:'rgba(79,110,247,0.15)' },
  closed:    { color:'#6b7280', bg:'rgba(107,114,128,0.15)' },
  confirmed: { color:'#22c55e', bg:'rgba(34,197,94,0.15)' },
  pending:   { color:'#f59e0b', bg:'rgba(245,158,11,0.15)' },
};

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

function MiniStat({ color, val, label }) {
  return (
    <div className="ansa-mini-stat">
      <div className="ansa-mini-stat-dot" style={{ background:color }}/>
      <div>
        <div className="ansa-mini-stat-val">{val}</div>
        <div className="ansa-mini-stat-label">{label}</div>
      </div>
    </div>
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

function ShowcaseOverview() {
  return (
    <div>
      <div style={{ fontSize:15,fontWeight:700,color:'#fff',marginBottom:1 }}>Good afternoon, John</div>
      <div style={{ fontSize:11,color:'#555',marginBottom:12 }}>Here's what happened while you were on the job.</div>
      <div className="ansa-mini-grid" style={{ marginBottom:10 }}>
        <MiniStat color="#4F6EF7" val="3"    label="Missed Calls Today"/>
        <MiniStat color="#8b5cf6" val="100%" label="Response Rate"/>
        <MiniStat color="#22c55e" val="67%"  label="Booking Rate"/>
        <MiniStat color="#f59e0b" val="8"    label="Jobs Booked"/>
      </div>
      <div className="ansa-mini-chart">
        <div className="ansa-mini-chart-title">This Week's Activity</div>
        <AreaChart data={MOCK_WEEKLY} series={[
          { key:'calls',     color:'#4F6EF7' },
          { key:'responses', color:'#8b5cf6' },
          { key:'bookings',  color:'#22c55e' },
        ]}/>
        <div style={{ display:'flex',gap:12,marginTop:6 }}>
          {[['#4F6EF7','Missed Calls'],['#8b5cf6','Responses'],['#22c55e','Bookings']].map(([c,l]) => (
            <span key={l} style={{ fontSize:9,color:'#555',display:'flex',alignItems:'center',gap:3 }}>
              <span style={{ width:7,height:7,borderRadius:2,background:c,display:'inline-block' }}/>{l}
            </span>
          ))}
        </div>
      </div>
      <div className="ansa-mini-chart" style={{ marginBottom:0 }}>
        <div className="ansa-mini-chart-title">Recent Activity</div>
        {MOCK_CONVS.slice(0,3).map((c,i) => (
          <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:i<2?'1px solid #1a1a1a':'none' }}>
            <div>
              <div style={{ fontSize:12,fontWeight:600,color:'#fff' }}>{c.phone}</div>
              <div style={{ fontSize:10,color:'#555' }}>{c.time}</div>
            </div>
            <span className="ansa-mini-badge" style={{ color:SC[c.status].color,background:SC[c.status].bg }}>{c.status}</span>
          </div>
        ))}
      </div>
      <div className="ansa-mini-chart" style={{ marginBottom:0,marginTop:8 }}>
        <div className="ansa-mini-chart-title">Your Text Notifications</div>
        {[
          { emoji:'🔔', text:'Missed call from +1 (714) 555-0182. AI is handling it.', time:'2:14 PM' },
          { emoji:'✅', text:'Appointment booked! Thu Jun 12 at 10:00 AM — Leaking faucet. Customer: +1 (714) 555-0182', time:'2:17 PM' },
          { emoji:'⏳', text:'Pending approval needed. Fri Jun 13 at 3:00 PM — HVAC inspection. Confirm in dashboard.', time:'4:02 PM' },
        ].map((n,i) => (
          <div key={i} style={{ display:'flex',gap:8,padding:'6px 0',borderBottom:i<2?'1px solid #1a1a1a':'none',alignItems:'flex-start' }}>
            <span style={{ fontSize:13,flexShrink:0 }}>{n.emoji}</span>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:10,color:'#ccc',lineHeight:1.4 }}>{n.text}</div>
              <div style={{ fontSize:9,color:'#555',marginTop:2 }}>Ansa · {n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShowcaseMissedCalls() {
  return (
    <div>
      <div style={{ fontSize:15,fontWeight:700,color:'#fff',marginBottom:12 }}>Missed Calls</div>
      {MOCK_CALLS.map((c,i) => (
        <div key={i} className="ansa-mini-conv">
          <div style={{ display:'flex',alignItems:'center',gap:10,minWidth:0 }}>
            <div style={{ width:32,height:32,borderRadius:'50%',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <span style={{ fontSize:13 }}>📞</span>
            </div>
            <div style={{ minWidth:0 }}>
              <div className="ansa-mini-conv-phone">{c.phone}</div>
              <div style={{ fontSize:10,color:'#555' }}>{c.time}</div>
            </div>
          </div>
          <span className="ansa-mini-badge" style={{ color:SC[c.status].color,background:SC[c.status].bg,flexShrink:0 }}>{c.status}</span>
        </div>
      ))}
    </div>
  );
}

function ShowcaseConversations() {
  const [tab, setTab] = useState('all');
  const filtered = tab === 'all' ? MOCK_CONVS : MOCK_CONVS.filter(c => c.status === tab);
  return (
    <div>
      <div style={{ fontSize:15,fontWeight:700,color:'#fff',marginBottom:10 }}>Conversations</div>
      <div style={{ display:'flex',gap:3,marginBottom:10,background:'#141414',borderRadius:7,padding:3,width:'fit-content' }}>
        {['all','active','booked','closed'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'4px 10px',borderRadius:5,fontSize:10.5,fontWeight:500,cursor:'pointer',
              background:tab===t?'#222':'transparent',color:tab===t?'#fff':'#666',border:'none',
              fontFamily:'inherit',textTransform:'capitalize' }}>
            {t}
          </button>
        ))}
      </div>
      {filtered.map((c,i) => (
        <div key={i} className="ansa-mini-conv">
          <div style={{ minWidth:0 }}>
            <div className="ansa-mini-conv-phone">{c.phone}</div>
            <div className="ansa-mini-conv-last">{c.last}</div>
          </div>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3,flexShrink:0,marginLeft:8 }}>
            <span className="ansa-mini-badge" style={{ color:SC[c.status].color,background:SC[c.status].bg }}>{c.status}</span>
            <span style={{ fontSize:10,color:'#555' }}>{c.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShowcaseAppointments() {
  return (
    <div>
      <div style={{ fontSize:15,fontWeight:700,color:'#fff',marginBottom:12 }}>Appointments</div>
      {MOCK_APPTS.map((a,i) => (
        <div key={i} className="ansa-mini-conv" style={{ alignItems:'flex-start' }}>
          <div style={{ minWidth:0 }}>
            <div className="ansa-mini-conv-phone">{a.customer}</div>
            <div style={{ fontSize:11,color:'#a1a1aa',marginTop:1 }}>{a.service}</div>
            <div style={{ fontSize:10,color:'#555',marginTop:2 }}>{a.time}</div>
          </div>
          <span className="ansa-mini-badge" style={{ color:SC[a.status].color,background:SC[a.status].bg,flexShrink:0,marginLeft:8,marginTop:2 }}>{a.status}</span>
        </div>
      ))}
    </div>
  );
}

function ShowcaseAnalytics() {
  return (
    <div>
      <div style={{ fontSize:15,fontWeight:700,color:'#fff',marginBottom:10 }}>Analytics</div>
      <div className="ansa-mini-grid" style={{ marginBottom:10 }}>
        <MiniStat color="#4F6EF7" val="31"   label="Total Calls"/>
        <MiniStat color="#8b5cf6" val="100%" label="Response Rate"/>
        <MiniStat color="#22c55e" val="45%"  label="Booking Rate"/>
        <MiniStat color="#f59e0b" val="14"   label="Jobs Booked"/>
      </div>
      <div className="ansa-mini-chart">
        <div className="ansa-mini-chart-title">Calls vs Responses vs Bookings</div>
        <AreaChart data={MOCK_WEEKLY} series={[
          { key:'calls',     color:'#4F6EF7' },
          { key:'responses', color:'#8b5cf6' },
          { key:'bookings',  color:'#22c55e' },
        ]}/>
      </div>
      <div className="ansa-mini-chart" style={{ marginBottom:0 }}>
        <div className="ansa-mini-chart-title">Conversion Funnel</div>
        <Funnel rows={[
          { label:'Missed Calls',      val:31, pct:100, color:'#4F6EF7' },
          { label:'SMS Sent',          val:31, pct:100, color:'#8b5cf6' },
          { label:'Customer Replied',  val:24, pct:77,  color:'#f59e0b' },
          { label:'Booked',            val:14, pct:45,  color:'#22c55e' },
        ]}/>
      </div>
    </div>
  );
}

function ShowcaseSettings() {
  return (
    <div>
      <div style={{ fontSize:15,fontWeight:700,color:'#fff',marginBottom:12 }}>Settings</div>
      <div className="ansa-mini-chart" style={{ marginBottom:10 }}>
        <div className="ansa-mini-chart-title">Business Info</div>
        {[
          { label:'Business Name',  val:'Johns Contracting' },
          { label:'Phone Number',   val:'+1 (424) 622-5851' },
          { label:'Trade',          val:'General Contractor' },
          { label:'Service Area',   val:'Newport Beach, CA' },
        ].map((f,i) => (
          <div key={i} style={{ marginBottom:8 }}>
            <div style={{ fontSize:9.5,color:'#555',marginBottom:2,textTransform:'uppercase',letterSpacing:'0.5px' }}>{f.label}</div>
            <div style={{ background:'#1a1a1a',border:'1px solid #222',borderRadius:5,padding:'6px 9px',fontSize:11.5,color:'#d1d5db' }}>{f.val}</div>
          </div>
        ))}
      </div>
      <div className="ansa-mini-chart" style={{ marginBottom:0 }}>
        <div className="ansa-mini-chart-title">AI Greeting</div>
        <div style={{ background:'#1a1a1a',border:'1px solid #222',borderRadius:5,padding:'8px 10px',fontSize:11.5,color:'#d1d5db',lineHeight:1.5,marginBottom:8 }}>
          Hey! Thanks for calling Johns Contracting — sorry we missed you. How can we help?
        </div>
        <div style={{ display:'flex',gap:5 }}>
          {['Professional','Friendly','Casual'].map((t,i) => (
            <div key={t} style={{ padding:'3px 9px',borderRadius:5,fontSize:10,fontWeight:600,
              background:i===0?'rgba(79,110,247,.15)':'transparent',
              color:i===0?'#818CF8':'#555',
              border:`1px solid ${i===0?'rgba(79,110,247,.3)':'#222'}` }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SIDEBAR_NAV = [
  { label:'Overview',      idx:0 },
  { label:'Missed Calls',  idx:1 },
  { label:'Conversations', idx:2 },
  { label:'Appointments',  idx:3 },
  { label:'Analytics',     idx:4 },
  { label:'Settings',      idx:5 },
];
const PAGE_TITLES = ['Overview','Missed Calls','Conversations','Appointments','Analytics','Settings'];
const SHOWCASE_VIEWS = [ShowcaseOverview, ShowcaseMissedCalls, ShowcaseConversations, ShowcaseAppointments, ShowcaseAnalytics, ShowcaseSettings];
const SHOWCASE_DURATION = 5000;

function DashboardShowcase() {
  const [view, setView] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = null;
    let raf;
    const animate = ts => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min((elapsed / SHOWCASE_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed < SHOWCASE_DURATION) {
        raf = requestAnimationFrame(animate);
      } else {
        setView(v => (v + 1) % SHOWCASE_VIEWS.length);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [view]);

  const handleNav = i => { setView(i); setProgress(0); };
  const ActiveView = SHOWCASE_VIEWS[view];

  return (
    <div>
      <div className="ansa-showcase-wrap">
        {/* Browser chrome */}
        <div className="ansa-showcase-chrome">
          <div className="ansa-showcase-dots"><span/><span/><span/></div>
          <div className="ansa-showcase-url">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>ansaco.ai</span>
          </div>
        </div>
        <div className="ansa-showcase-app">
          {/* Sidebar */}
          <div className="ansa-showcase-sidebar">
            <div className="ansa-showcase-logo">ansa<span>.</span></div>
            <div style={{ flex:1,padding:'8px 0' }}>
              {SIDEBAR_NAV.map(item => (
                <div key={item.idx} onClick={() => handleNav(item.idx)}
                  className={`ansa-showcase-nav-item${view===item.idx?' active':''}`}
                  style={{ cursor:'pointer' }}>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            {/* Bottom: business card + links */}
            <div style={{ borderTop:'1px solid #1a1a1a',padding:'12px 14px' }}>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                <div style={{ width:30,height:30,borderRadius:7,background:'#4F6EF7',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12,flexShrink:0 }}>J</div>
                <div style={{ overflow:'hidden' }}>
                  <div style={{ fontSize:11.5,fontWeight:600,color:'#e5e5e5',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>Johns Contracting</div>
                  <div style={{ fontSize:10,color:'#555' }}>Pro plan</div>
                </div>
              </div>
              <div style={{ fontSize:11,color:'#555',padding:'4px 0',cursor:'pointer' }}>📞 Contact support</div>
              <div style={{ fontSize:11,color:'#555',padding:'4px 0',cursor:'pointer' }}>↩ Log out</div>
            </div>
          </div>
          {/* Main area */}
          <div className="ansa-showcase-main" style={{ display:'flex',flexDirection:'column' }}>
            {/* Top bar */}
            <div style={{ height:48,borderBottom:'1px solid #1a1a1a',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 18px',flexShrink:0 }}>
              <div style={{ fontSize:14,fontWeight:600,color:'#fff' }}>{PAGE_TITLES[view]}</div>
              <div style={{ width:30,height:30,borderRadius:'50%',background:'#1e1e1e',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:'#888',border:'2px solid #2a2a2a' }}>JL</div>
            </div>
            {/* Content */}
            <div style={{ flex:1,overflowY:'auto',padding:16,position:'relative' }}>
              <ActiveView key={view}/>
            </div>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="ansa-showcase-progress">
        <div className="ansa-showcase-progress-bar" style={{ width:`${progress}%`,transition:progress===0?'none':'width .1s linear' }}/>
      </div>
      <div style={{ textAlign:'center',marginTop:8,fontSize:12,color:'#3f3f46' }}>Click any section in the sidebar to explore ↑</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

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
          Built for contractors, plumbers, roofers, and HVAC pros — Ansa texts back within 15 seconds of a missed call, answers their questions with AI, and books the appointment. While you're still on the job.
        </p>
        <div className="ansa-hero-ctas">
          <a href="#/signup" className="ansa-btn ansa-btn-blue">Start Free Trial <ArrowRight size={16} /></a>
          <a href="#how-it-works" className="ansa-btn ansa-btn-outline" onClick={scrollTo('how-it-works')}>See How It Works</a>
        </div>
        <div className="ansa-trust-line">No credit card required &nbsp;·&nbsp; Setup in 5 minutes &nbsp;·&nbsp; Cancel anytime</div>
        <div className="ansa-phone-wrap">
          <div className="ansa-phone">
            <div className="ansa-phone-notch" />
            <div className="ansa-phone-header"><strong>Ansa</strong> · Text Conversation</div>
            <div className="ansa-chat-bubble ansa-chat-incoming">Hey! Thanks for calling Mike's Plumbing — sorry we missed you. How can we help? 🔧</div>
            <div className="ansa-chat-bubble ansa-chat-outgoing">Hi! I have a leaking faucet. Can someone come today?</div>
            <div className="ansa-chat-bubble ansa-chat-incoming">Absolutely! We have a 2:00 PM slot open today. Want me to lock that in for you?</div>
            <div className="ansa-chat-bubble ansa-chat-outgoing">Yes, perfect!</div>
            <div className="ansa-chat-bubble ansa-chat-incoming">You're all set ✅ Confirmed today at 2:00 PM. We'll text when we're on the way!</div>
            <div className="ansa-booked-banner">
              <div className="ansa-booked-banner-dot" />
              <div className="ansa-booked-banner-text">💼 New job booked: Leaking faucet · Marcus T. · Today 2:00 PM · Est. $280</div>
            </div>
          </div>
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
      <div style={{ borderBottom:'1px solid #1a1a1a' }}>
        <div className="ansa-proof-stats ansa-reveal">
          <div className="ansa-proof-stat">
            <div className="ansa-proof-stat-num">15s</div>
            <div className="ansa-proof-stat-label">Average text-back time</div>
          </div>
          <div className="ansa-proof-stat">
            <div className="ansa-proof-stat-num">30 days</div>
            <div className="ansa-proof-stat-label">Free trial — no card needed</div>
          </div>
          <div className="ansa-proof-stat">
            <div className="ansa-proof-stat-num">24/7</div>
            <div className="ansa-proof-stat-label">Always on, even after hours</div>
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

      {/* Testimonials — moved up, right after problem */}
      <div className="ansa-divider" />
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

      <div className="ansa-divider" />

      {/* How It Works */}
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

      {/* Before / After */}
      <div className="ansa-divider" />
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
              "Phone rings while you're on a job",
              "Call goes to voicemail — or just rings out",
              "Customer Googles the next plumber/HVAC/roofer",
              "You find out hours later, if at all",
              "Job goes to a competitor",
              "You lose $1,200+ in revenue",
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
              "Phone rings while you're on a job",
              "Ansa detects the missed call in seconds",
              "Customer gets a friendly text from your number",
              "AI answers questions and books the appointment",
              "You get a notification: new job confirmed",
              "You earn $1,200+ without picking up the phone",
            ].map((row,i) => (
              <div className="ansa-compare-row" key={i}>
                <CheckCircle size={15} className="ansa-compare-icon-good" />
                {row}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — chess layout */}
      <div className="ansa-divider" />
      <section className="ansa-section" id="features">
        <div className="ansa-reveal">
          <p className="ansa-section-label">Features</p>
          <h2 className="ansa-section-title">Everything Built to Capture Every Lead</h2>
          <p className="ansa-section-sub">Three things Ansa does better than any person with a phone.</p>
        </div>
        <div className="ansa-chess">
          {CHESS_FEATURES.map((f, i) => (
            <div key={i} className={`ansa-chess-row ansa-reveal${f.flip?' flip':''}`}>
              <div className="ansa-chess-text">
                <div className="ansa-chess-eyebrow">{f.eyebrow}</div>
                <h3 className="ansa-chess-title">{f.title}</h3>
                <p className="ansa-chess-body">{f.body}</p>
                <ul className="ansa-chess-points">
                  {f.points.map((p,j) => (
                    <li key={j}><Check size={15} color={PRIMARY} />{p}</li>
                  ))}
                </ul>
              </div>
              <f.Visual />
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Showcase */}
      <div className="ansa-divider" />
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

      {/* Integrations */}
      <div className="ansa-divider" />
      <section className="ansa-section">
        <div className="ansa-reveal">
          <p className="ansa-section-label">Integrations</p>
          <h2 className="ansa-section-title">Works With the Tools You Already Use</h2>
          <p className="ansa-section-sub">No new software to learn. Ansa plugs into your existing workflow in minutes.</p>
        </div>
        <div className="ansa-integrations ansa-reveal">
          {[
            { icon:<CalendarCheck size={16}/>, label:'Google Calendar', sub:'Syncs your real availability' },
            { icon:<Phone size={16}/>, label:'Your Phone Number', sub:'Texts from your existing number' },
            { icon:<MessageCircle size={16}/>, label:'SMS / Text', sub:'Native, carrier-grade messaging' },
            { icon:<Zap size={16}/>, label:'Claude AI', sub:'Powered by Anthropic AI' },
          ].map((int,i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="ansa-integration-plus">+</div>}
              <div className="ansa-integration-pill">
                <div className="ansa-integration-icon">{int.icon}</div>
                <div>
                  <div style={{ fontWeight:600,fontSize:13 }}>{int.label}</div>
                  <div style={{ fontSize:11,color:'#71717a',marginTop:1 }}>{int.sub}</div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      <div className="ansa-divider" />

      {/* Owner Notifications */}
      <section className="ansa-section">
        <div className="ansa-reveal">
          <p className="ansa-section-label">You Stay In The Loop</p>
          <h2 className="ansa-section-title">You'll Know the Second Anything Happens</h2>
          <p className="ansa-section-sub">Ansa texts you instantly — whether it's a missed call, a booked job, or a customer who needs a callback.</p>
        </div>
        <div className="ansa-reveal" style={{ display:'flex',justifyContent:'center',marginTop:40 }}>
          <div style={{ background:'#141414',border:'1px solid #2a2a2a',borderRadius:36,padding:'28px 20px',width:340,boxShadow:'0 24px 80px rgba(0,0,0,.5),0 0 60px rgba(79,110,247,.08)' }}>
            {/* Lock screen header */}
            <div style={{ width:80,height:5,background:'#2a2a2a',borderRadius:99,margin:'0 auto 24px' }} />
            <div style={{ textAlign:'center',marginBottom:28 }}>
              <div style={{ fontSize:13,color:'#555',marginBottom:4 }}>Monday, June 9</div>
              <div style={{ fontSize:42,fontWeight:700,color:'#fff',letterSpacing:-1,lineHeight:1 }}>2:14 PM</div>
            </div>
            {/* Notifications */}
            {[
              {
                title:'🔔 Missed Call',
                body:'(714) 555-0182 just called. AI is handling it — response sent in 12 seconds.',
                time:'2:14 PM',
              },
              {
                title:'✅ Appointment Booked',
                body:'Marcus T. booked a leaking faucet repair for Thu Jun 12 at 10:00 AM. Est. $280.',
                time:'2:17 PM',
              },
              {
                title:'📲 Callback Requested',
                body:'(949) 555-0391 says: "I\'d rather just talk to someone — can you call me back?" Tap to view.',
                time:'3:44 PM',
              },
            ].map((n,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:16,padding:'12px 14px',marginBottom:i<2?10:0 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5 }}>
                  <span style={{ fontSize:12,fontWeight:700,color:'#fff' }}>{n.title}</span>
                  <span style={{ fontSize:10,color:'#555' }}>{n.time}</span>
                </div>
                <div style={{ fontSize:11.5,color:'#a1a1aa',lineHeight:1.5 }}>{n.body}</div>
              </div>
            ))}
            <div style={{ width:120,height:4,background:'#2a2a2a',borderRadius:99,margin:'24px auto 0' }} />
          </div>
        </div>
      </section>

      <div className="ansa-divider" />

      {/* Pricing */}
      <section className="ansa-section" id="pricing">
        <div className="ansa-reveal">
          <p className="ansa-section-label">Pricing</p>
          <h2 className="ansa-section-title">Simple Pricing, Serious ROI</h2>
          <p className="ansa-section-sub">One missed call recovered pays for an entire month. No contracts, cancel anytime.</p>
        </div>
        <div className="ansa-pricing-grid ansa-reveal">
          <div className="ansa-pricing-card">
            <div className="ansa-pricing-popular-badge">Most Popular</div>
            <div className="ansa-pricing-roi">
              Home service businesses recover an average of <strong>$2,400/month</strong> in missed revenue with Ansa. That's 8× your investment.
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

      <div className="ansa-divider" />

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
