# [ADR-0011] Marketing Web Character-Guided Motion-Path Scrollytelling Architecture

> **Date**: 2026-09-10  
> **Status**: Accepted  
> **Deciders**: Enterprise Architecture Team & SSR IT INDUSTRY Leadership

## Context & Problem Statement
The previous public marketing web application (`apps/marketing-web`) relied on a 7 pinned-act scroll-jacking structure where content animated within a fixed viewport. While functional, it remained a standard vertical pinned scroll experience rather than a memorable, immersive journey through the SSR One AI ecosystem. 

The requirement was to supersede this scroll-jack model with a game-like "scrollytelling" motion-path journey where an illustrated business owner travels along a visible, curving emerald road through the SSR One AI world, while preserving the daylight warm paper palette (`hsl(40, 20%, 97%)`, `#103B2B`), ₹12,000/year flat enterprise pricing model, and live PostgreSQL lead ingestion pipeline.

## Decision Drivers
- **Cinematic Narrative Journey**: Transform passive scrolling into an active adventure across 7 structured story beats (Arrival, Invitation Portal, The 4 Vertical Districts Tour, Neural Connection, Reward Loop, and Customer Landing).
- **Visible Path & Traveler Scrollytelling**: An actual SVG road curve (`#journeyPath`) traversed by a business owner vector illustration using GSAP's `MotionPathPlugin` with auto-rotation.
- **Fast Travel & Accessibility**: Interactive district jump tabs and road wayfinding indicators to let users instantly navigate to specific verticals via `ScrollToPlugin`.
- **Zero-Failure Lead Pipeline**: Strict 10-digit mobile sanitization, AbortController timeout, and multi-URL fallback shield (`/api/v1/marketing/leads`) with direct WhatsApp handoff.
- **Mobile & Reduced-Motion Resilience**: Clean responsive vertical stacked fallback on touch devices (`< 768px`) and `prefers-reduced-motion`.

## Considered Options
1. **Full 3D WebGL / Three.js World**: Visually rich but high GPU overhead, slow initial load, and poor mobile battery performance.
2. **Pinned-Panel Scroll Jacking (Previous Build)**: Simple but felt like standard slides without a cohesive world feeling.
3. **SVG Motion Path + GSAP MotionPathPlugin + Daylight Vector Illustration (Chosen Option)**: 60fps hardware-accelerated Bezier path alignment, lightweight vector assets, zero heavy 3D assets, pure CSS responsive design, and 100% accessible fallbacks.

## Decision Outcome
Chosen Option: **Option 3 (SVG Motion Path + GSAP MotionPathPlugin)**.

### Architecture Highlights:
1. **GSAP MotionPath Scrubber**:
   - Registered `MotionPathPlugin` with `ScrollTrigger` and `Lenis`.
   - Bound `#traveler` to `#journeyPath` with `autoRotate: 90` and `scrub: 1.2`.
2. **7 Story Beats**:
   - `Stage1Arrival`: SSR IT INDUSTRY gate facade and road origin.
   - `Stage2Invitation`: Glowing doorway portal where road begins eastward curve.
   - `Stage3TourDistricts`: The 4 specialized verticals (Restaurant, Hotel, PG, Retail) with shopfront signs, metrics, and jump-nav.
   - `Stage5Connection`: Central neural tower convergence with personal shop icon connecting via animated laser beam and simulated terminal typewriter.
   - `Stage6Reward`: Celebratory circular loop flourish, golden key, and ₹12,000/yr flat license receipt card.
   - `Stage7Landing`: Customer plaza, founder Sumit Singh contact details, direct WhatsApp link, and live PostgreSQL form.
3. **Road Wayfinding**:
   - `RoadWayfinding` component providing a mini winding road progress track with clickable stops and tooltips.

### Positive Consequences
- Distinctive, world-class interactive storytelling that wows visitors.
- Retains 100% of the light enterprise daylight palette and eliminates neon glows.
- Smooth performance across both desktop and mobile viewports with zero console errors.
- Lead submissions remain directly tied to the backend PostgreSQL `lead_inquiries` table.
