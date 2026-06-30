# Product Requirements Document
## AstroVeda — Astrology & Horoscope Platform
**Version:** 1.0  
**Date:** June 2026  
**Author:** Product Team  
**Status:** Draft

---

## 1. Executive Summary

AstroVeda is a comprehensive astrology and Vedic horoscope platform targeting Indian and South Asian users. The platform will provide personalized horoscopes, kundli generation, matchmaking (kundli milan), numerology, tarot, panchang, and live astrologer consultations — rivaling AstroSage in depth while surpassing it in mobile UX, personalization, and AI-enhanced predictions.

---

## 2. Problem Statement

Existing platforms like AstroSage have loyal userbases but suffer from:
- Outdated, cluttered UI/UX
- Limited personalization beyond basic sun-sign horoscopes
- Poor mobile experience
- No AI-driven insight layer
- Fragmented features across multiple pages

**Opportunity:** Build a modern, fast, deeply personalized astrology super-app that combines traditional Vedic astrology with an intelligent, intuitive experience.

---

## 3. Target Users

| Segment | Description |
|---|---|
| Primary | Indian users aged 18–45, interested in Vedic astrology and daily guidance |
| Secondary | NRI/diaspora seeking matchmaking (kundli milan) tools |
| Tertiary | Astrology enthusiasts globally; students of Jyotish |

---

## 4. Core Features (MVP)

### 4.1 User Onboarding & Profile
- Sign up via phone/email/Google
- Birth details capture: date, time, place of birth
- Auto-detect city via geolocation or searchable city database
- Multiple profiles per account (for family members)
- Profile picture and basic preferences

### 4.2 Kundli (Birth Chart) Generation
- Lagna (Ascendant) chart
- Moon chart, Navamsa chart, and all 16 Varga charts
- Planetary positions table (Rashi, Nakshatra, House, Degree)
- Planetary aspects and conjunctions
- Ashtakavarga charts
- KP (Krishnamurti Paddhati) system support
- Chart style options: North Indian, South Indian, East Indian
- Downloadable/shareable Kundli PDF

### 4.3 Daily / Weekly / Monthly / Yearly Horoscopes
- All 12 Rashis (Vedic) + 12 Western sun signs
- Personalized horoscope (based on Moon sign, not just Sun sign)
- Categories: Career, Love, Finance, Health, Family
- Lucky number, color, direction, time for the day
- Planetary transit alerts (e.g., "Saturn enters your 7th house today")

### 4.4 Kundli Milan (Matchmaking)
- Gun Milan (36 Gunas compatibility)
- Mangal Dosha check
- Dosha cancellation analysis
- Detailed compatibility report across 8 Kootas
- Love vs arranged marriage compatibility score
- Downloadable matching report

### 4.5 Panchang (Hindu Calendar)
- Daily Panchang: Tithi, Vara, Nakshatra, Yoga, Karana
- Muhurta (auspicious time) finder for:
  - Marriage, Griha Pravesh, Mundan, Namkaran, Business launch
- Festival and Vrat calendar
- Choghadiya and Hora
- Location-based sunrise/sunset/Rahu Kaal

### 4.6 Numerology
- Life Path Number, Destiny Number, Soul Urge Number
- Name numerology analysis
- Lucky numbers and compatibility

### 4.7 Tarot
- Daily tarot card draw (with meaning)
- 3-card and 10-card Celtic Cross spread
- Yes/No tarot
- Love, career, and general readings

### 4.8 Dasha & Transit Analysis
- Vimshottari Dasha timeline (Mahadasha, Antardasha, Pratyantar)
- Current dasha period with effect prediction
- Gochar (Transit) analysis — all 9 planets
- Personal transit calendar

### 4.9 Ask an Astrologer (Consultation)
- Marketplace of verified astrologers
- Chat, voice, and video consultations
- Astrologer profiles: specialization, language, reviews, pricing
- In-app wallet and payment gateway
- Post-consultation report and follow-up
- Astrologer rating and review system

### 4.10 Remedies
- Gemstone recommendations based on Kundli
- Rudraksha recommendations
- Mantra suggestions per planet
- Yantra, Fasting, and Charity remedies
- Disclaimer and expert review flag

---

## 5. Extended Features (Phase 2)

| Feature | Description |
|---|---|
| AI Kundli Insights | LLM-powered plain-English explanation of birth chart |
| Vastu Shastra | Room-by-room Vastu analysis tool |
| Dream Interpreter | User inputs dream; AI gives astrological interpretation |
| Weekly Prediction Video | Short-form video by astrologers per Rashi |
| Astrology Community | Forums, Q&A, user posts |
| Baby Name Suggester | Nakshatra-based name suggestions post-birth |
| Prashna Kundali | Horary chart for a specific question |
| Annual Horoscope Report | Detailed PDF report (premium, Rs. 199–499) |

---

## 6. Technical Requirements

### 6.1 Platform
- Mobile App: Android (primary), iOS (secondary)
- Web App: Responsive PWA
- Backend: REST API (Node.js / Python FastAPI)
- Database: PostgreSQL (user data), Redis (caching), MongoDB (content)

### 6.2 Astrology Engine
- Build or integrate a Vedic astrology calculation library
  - Options: Swiss Ephemeris (open source, high accuracy)
  - Custom wrapper for Lagna, Navamsa, Varga charts, Dasha, Ashtakavarga
- All calculations must support timezone and DST handling
- City/coordinates database: 50,000+ Indian cities minimum

### 6.3 AI Layer
- Use LLM API (e.g., Claude or GPT) for:
  - Plain-language Kundli interpretation
  - Personalized daily insight generation
  - Remedies explanation
- Prompt engineering guardrails to prevent harmful predictions (health/legal)

### 6.4 Astrologer Marketplace Backend
- Availability scheduling (calendar integration)
- Real-time chat (WebSocket)
- Video SDK integration (e.g., Agora, Twilio)
- Payment gateway: Razorpay (India-first)

### 6.5 Performance Targets
- Kundli generation: < 2 seconds
- Daily horoscope load: < 1 second
- App size: < 30 MB (Android APK)
- Uptime SLA: 99.9%

---

## 7. Monetization

| Revenue Stream | Model |
|---|---|
| Astrologer consultations | Platform commission 20–30% per session |
| Premium reports | One-time purchase (Kundli PDF, Annual report) Rs. 99–499 |
| Subscription (AstroVeda Pro) | Rs. 99/month or Rs. 799/year — unlimited reports, ad-free, priority access |
| Gemstone/Rudraksha store | E-commerce with certified products |
| Display advertising | Free tier users (Google AdMob) |
| White-label API | B2B licensing to matrimonial apps |

---

## 8. Non-Functional Requirements

- **Localization:** Hindi, English, Tamil, Telugu, Bengali, Gujarati (Phase 1); Marathi, Kannada (Phase 2)
- **Accessibility:** WCAG 2.1 AA compliance for web
- **Privacy:** DPDP Act (India) compliance; no selling of birth data to third parties
- **Security:** Encrypted storage of birth details (PII); OAuth 2.0 auth
- **Offline support:** Cached daily horoscope and panchang available offline

---

## 9. Design Principles

- Mobile-first, thumb-friendly navigation
- Clean, spiritual aesthetic — deep navy/gold/saffron palette inspired by Vedic manuscripts
- Minimal clutter; one primary action per screen
- Avoid superstitious or fear-based language in UI copy
- Predictive disclaimers on all astrological content

---

## 10. Success Metrics (12-Month Targets)

| KPI | Target |
|---|---|
| Registered Users | 500,000 |
| DAU/MAU Ratio | ≥ 25% |
| Avg. Session Duration | ≥ 4 minutes |
| Paid Consultations (monthly) | 10,000+ sessions |
| Premium Subscribers | 20,000 |
| App Store Rating | ≥ 4.3 |
| Revenue (ARR) | ₹2–3 Crore by Month 12 |

---

## 11. Competitive Differentiation vs AstroSage

| Area | AstroSage | AstroVeda (Ours) |
|---|---|---|
| UI/UX | Dated, ad-heavy | Modern, clean, intuitive |
| Personalization | Sun/Moon sign only | Full Kundli-based, AI-driven |
| AI insights | None | LLM-powered chart explanations |
| Mobile app | Average experience | Native mobile-first design |
| Consultations | Available | Improved marketplace + video |
| Languages | Hindi + English | 6 Indian languages at launch |
| Offline access | No | Yes (cached content) |
| White-label API | No | Yes (B2B) |

---

## 12. Development Phases

### Phase 1 — MVP (Months 1–4)
Kundli generation, daily horoscopes, Panchang, Kundli Milan, user profiles, astrologer chat marketplace

### Phase 2 — Growth (Months 5–8)
AI insights layer, tarot, numerology, video consultations, premium reports, Hindi + 2 regional languages

### Phase 3 — Scale (Months 9–12)
Vastu, community forum, baby name tool, annual reports, B2B API, e-commerce store

---

## 13. Open Questions

1. Build vs buy the Vedic astrology engine? (Swiss Ephemeris integration recommended)
2. Astrologer onboarding and verification process — who certifies them?
3. Regulatory stance on astrological predictions — legal disclaimer strategy?
4. Regional content partnerships (regional astrologers, panchangs)?
5. Marketing strategy: influencer partnerships vs SEO-first vs app store optimization?

---

*This document is a living PRD and will be updated as discovery progresses.*
