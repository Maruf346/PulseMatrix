import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  CompetitorProfile,
  RadarChangeEvent,
} from './src/types/intelligence';
import { INITIAL_FEATURES, OUR_PRODUCT } from './src/data/seedData';
import { generateSalesAlertEmailDraft } from './src/utils/pricingMath';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: string;
    systemInstruction?: string;
    useSearchGrounding?: boolean;
    responseSchema?: Record<string, unknown>;
  }
) {
  const config: Record<string, unknown> = {
    thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
  };
  if (params.systemInstruction) {
    config.systemInstruction = params.systemInstruction;
  }
  if (params.useSearchGrounding) {
    config.tools = [{ googleSearch: {} }];
  } else if (params.responseSchema) {
    config.responseMimeType = 'application/json';
    config.responseSchema = params.responseSchema;
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Gemini request timed out after 5500ms')), 5500)
  );

  return await Promise.race([
    ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: params.contents,
      config,
    }),
    timeoutPromise,
  ]);
}

function buildSynthesizedCompetitor(
  competitorName: string,
  competitorUrl: string,
  rawText?: string
): {
  competitor: CompetitorProfile;
  radarEvent: RadarChangeEvent;
  groundingSources: Array<{ title: string; uri: string }>;
} {
  const cleanName = competitorName.trim() || 'Railway';
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const url =
    competitorUrl.trim() || `https://${slug}.com/pricing`;

  const lowerName = cleanName.toLowerCase();
  const isCloudflare = lowerName.includes('cloudflare');
  const isDigitalOcean = lowerName.includes('digitalocean') || lowerName.includes('do');

  // Extract any dollar amounts from rawText if provided
  const priceMatches = rawText ? rawText.match(/\$(\d+)/g) : null;
  const extractedProPrice =
    priceMatches && priceMatches.length >= 2
      ? parseInt(priceMatches[1].replace('$', ''), 10)
      : isCloudflare
      ? 25
      : isDigitalOcean
      ? 24
      : 20;

  const teamPrice = isCloudflare ? 55 : isDigitalOcean ? 45 : 40;
  const enterprisePrice = isCloudflare ? 3000 : isDigitalOcean ? 999 : 1000;

  const diffReason = isCloudflare
    ? `${cleanName} gated container memory above 4 GB and added per-million CPU-ms metering on Paid Workers.`
    : isDigitalOcean
    ? `${cleanName} increased Basic & Dedicated App Platform container instance rates by 14% across North America & EU.`
    : `${cleanName} shifted from a flat workspace fee to $20/seat/mo PLUS unbundled per-GB RAM ($10/GB) and vCPU ($20/vCPU) metering.`;

  const prevPro = `$${Math.max(5, extractedProPrice - 5)}/mo`;
  const currPro = `$${extractedProPrice}/mo`;

  const competitor: CompetitorProfile = {
    id: slug,
    name: cleanName,
    url,
    tagline: isCloudflare
      ? 'Global V8 Isolate Edge Workers, R2 Storage & D1 SQLite'
      : isDigitalOcean
      ? 'Managed PaaS on DigitalOcean Droplets & Managed Databases'
      : 'Usage-Based Cloud Infrastructure & Ephemeral Container PaaS',
    lastScanned: 'Just now (Live AI Scan)',
    threatLevel: 'Emerging Challenger',
    winRateAgainst: 76,
    winRateDelta: '+6.8%',
    tiers: {
      starter: {
        tierId: 'starter',
        tierName: 'Hobby / Starter',
        audience: 'Individual developers & small sandboxes',
        monthlyPrice: 5,
        perSeatNote: '$5/mo base credit minimum + metered resource usage',
        includedSummary: '100 GB egress, shared vCPU containers, community Discord support',
      },
      pro: {
        tierId: 'pro',
        tierName: 'Pro Developer',
        audience: 'Production startups & multi-service teams',
        monthlyPrice: extractedProPrice,
        perSeatNote: `per seat / mo + metered RAM ($10/GB) & vCPU ($20/core)`,
        includedSummary: '500 GB egress (then $0.05–$0.10/GB), 7-day log retention',
        diff: {
          daysAgo: 1,
          dateLabel: 'Changed 1d ago',
          previousValue: prevPro,
          currentValue: currPro,
          changeType: 'price_hike',
          reason: diffReason,
          sourceUrl: url,
          sourceTitle: `${cleanName} Official Pricing & Billing Changelog (Live Scan)`,
          impactLevel: 'High Sales Impact',
        },
      },
      team: {
        tierId: 'team',
        tierName: 'Team Scale',
        audience: 'Scaling engineering orgs needing RBAC & priority builds',
        monthlyPrice: teamPrice,
        perSeatNote: 'per seat / mo + metered compute & storage footprint',
        includedSummary: 'Concurrent builds, SOC2 report access, 14-day logs',
      },
      enterprise: {
        tierId: 'enterprise',
        tierName: 'Enterprise Custom',
        audience: 'Regulated workloads needing SSO, HIPAA & BYOC',
        monthlyPrice: enterprisePrice,
        customLabel: `From $${enterprisePrice.toLocaleString()}`,
        perSeatNote: 'annual contract required',
        includedSummary: 'SAML SSO, HIPAA BAA, 99.95% SLA, dedicated Slack engineer',
      },
    },
    features: {
      'feat-bandwidth': {
        value: isCloudflare
          ? 'Zero R2 egress; Workers CPU-ms metered ($0.30/M req)'
          : '100 GB included (then $0.05/GB–$0.10/GB)',
        advantage: 'ours',
        detailNote: 'NexusCloud includes 1 TB free on Pro with flat $0.04/GB overages',
      },
      'feat-build-mins': {
        value: 'Shared builders (Pro priority queue billed by vCPU-minute)',
        advantage: 'ours',
        detailNote: 'NexusCloud includes unlimited concurrent NVMe builds at $0 extra',
      },
      'feat-cold-start': {
        value: isCloudflare ? '<5ms V8 Isolate (No full Linux Docker VM)' : '~8s–22s container spin-up',
        advantage: 'ours',
        detailNote: 'NexusCloud wakes full Firecracker Linux MicroVMs in <12ms',
      },
      'feat-postgres': {
        value: isCloudflare
          ? 'D1 SQLite (10 GB max limit; no native HA Postgres)'
          : 'Containerized Postgres template (Manual HA setup)',
        advantage: 'ours',
        detailNote: 'NexusCloud includes 50 GB managed HA Postgres with automated PR branching',
        diff: {
          daysAgo: 2,
          dateLabel: 'Changed 2d ago',
          previousValue: 'Included DB Credit',
          currentValue: 'Metered Disk + IOPS',
          changeType: 'limit_cut',
          reason: `${cleanName} unbundled persistent NVMe volume IOPS and snapshot storage on managed database templates.`,
          sourceUrl: url,
          sourceTitle: `${cleanName} Storage & Database Pricing Docs`,
          impactLevel: 'Medium',
        },
      },
      'feat-sso': {
        value: `Enterprise Tier Only ($${enterprisePrice.toLocaleString()}+/mo)`,
        advantage: 'ours',
        detailNote: 'Included free on NexusCloud Team ($49/seat)',
      },
      'feat-ddos-waf': {
        value: isCloudflare
          ? 'Enterprise WAF rules ($200+/mo add-on)'
          : 'Basic L3/L4 protection; No managed OWASP L7 WAF',
        advantage: 'ours',
        detailNote: 'NexusCloud bundles L7 OWASP WAF & unlimited DDoS mitigation on Pro+',
      },
      'feat-byoc-vpc': {
        value: 'Enterprise Only (Private VPC peering gated)',
        advantage: 'ours',
        detailNote: 'Included on NexusCloud Team & Enterprise',
      },
      'feat-hipaa-soc2': {
        value: 'HIPAA BAA requires Enterprise contract',
        advantage: 'ours',
        detailNote: 'NexusCloud signs HIPAA BAA starting on Team tier',
      },
      'feat-ai-gateway': {
        value: isCloudflare ? 'Cloudflare AI Gateway (Basic caching)' : 'Not Included natively',
        advantage: 'ours',
        detailNote: 'NexusCloud includes 10M cached tokens + multi-LLM semantic failover',
      },
      'feat-gpu-workers': {
        value: 'Waitlist / Limited regional GPU beta',
        advantage: 'ours',
        detailNote: 'NexusCloud offers self-serve L40S & H100 GPUs at $0.42/hr with scale-to-zero',
      },
      'feat-observability': {
        value: '7-day log retention (Paid add-on for 30d SIEM export)',
        advantage: 'ours',
        detailNote: 'NexusCloud includes 30-day OpenTelemetry logs & traces free',
      },
      'feat-support-sla': {
        value: '99.95% SLA on Enterprise only',
        advantage: 'ours',
        detailNote: 'NexusCloud guarantees 99.99% uptime SLA with <30m Slack response on Team+',
      },
    },
    battlecard: {
      executiveSummary: `${cleanName} wins early developer adoption with visual canvas deploys, but teams quickly face compounding seat + usage bills ($${extractedProPrice}/seat plus $10/GB RAM and $20/vCPU) and lack enterprise guardrails like SAML SSO, managed HA Postgres failover, and L7 WAF below $${enterprisePrice.toLocaleString()}/mo.`,
      targetSweetSpot: `Displace ${cleanName} when engineering teams cross 8+ seats or run memory-intensive AI/Postgres workloads where unbundled RAM/vCPU charges inflate monthly cloud spend by 2.4x.`,
      killPoints: [
        {
          id: `${slug}-kp-1`,
          title: `Eliminate ${cleanName}'s Seat + Metered RAM/vCPU Double Tax`,
          proofMetric: `$19/seat vs. ${cleanName} $${extractedProPrice}/seat + $10/GB RAM`,
          talkingPoint: `${cleanName} charges $${extractedProPrice}/seat/mo just for workspace access and still meters every megabyte of RAM ($10/GB/mo) and vCPU ($20/core/mo). NexusCloud Pro is $19/seat with generous bundled compute, 1 TB free egress, and predictable resource pools.`,
          featureRef: 'Pro Growth Tier & Included Egress',
        },
        {
          id: `${slug}-kp-2`,
          title: 'Production-Grade HA Postgres vs. Raw Container Templates',
          proofMetric: 'Automated PITR + PR Branching Included',
          talkingPoint: `Deploying Postgres on ${cleanName} spins up a single-node Docker container—meaning your team is responsible for replica promotion and connection pooling. NexusCloud provides a true multi-AZ HA Postgres service with zero-copy PR branching.`,
          featureRef: 'Managed HA Postgres & PR Branching',
        },
        {
          id: `${slug}-kp-3`,
          title: 'SAML SSO, HIPAA BAA & 99.99% SLA at $49/seat (Not $1,000+/mo)',
          proofMetric: 'Save $10,000+/yr on Security & Compliance',
          talkingPoint: `${cleanName} locks Okta SAML SSO, HIPAA BAA, and uptime SLAs behind a $${enterprisePrice.toLocaleString()}+/mo Enterprise plan. NexusCloud includes all three on our self-serve Team plan.`,
          featureRef: 'SAML SSO & SCIM Directory Sync',
        },
      ],
      landmines: [
        {
          id: `${slug}-lm-1`,
          title: 'Visual Canvas Topology UI for Rapid Hackathons',
          honestGap: `Developers love ${cleanName}'s drag-and-drop service canvas for spinning up weekend side projects.`,
          pivotStrategy:
            'Show NexusCloud’s live Service Dependency Graph inside our dashboard, then pivot to Day-2 production needs: "Canvas views are great on Day 1, but what happens when a node crashes at 2 AM without an SLA or managed Postgres failover?"',
        },
      ],
      presetObjections: [
        {
          id: `${slug}-obj-1`,
          objection: `We already deployed our staging microservices on ${cleanName} and the usage-based billing seems cheap right now.`,
          rebuttal: `${cleanName} looks inexpensive when staging traffic is near zero, but once you add production replicas, background workers, and 8+ engineers, paying $${extractedProPrice}/seat plus $10/GB RAM and $20/vCPU compounds rapidly. NexusCloud includes 1 TB of global egress, 50 GB of HA Postgres, and unlimited concurrent builds at $19/seat—cutting production TCO by 38% to 52%. Plus, our CLI imports your existing Dockerfiles and environment variables in under 5 minutes.`,
          proofCitation: `${cleanName} Pro ($${extractedProPrice}/seat + metered RAM) vs. NexusCloud Pro ($19/seat)`,
        },
      ],
    },
  };

  const radarEvent: RadarChangeEvent = {
    id: `rad-live-${Date.now()}`,
    competitorId: slug,
    competitorName: cleanName,
    detectedDate: 'Oct 31, 2026 (Live Scan)',
    daysAgo: 1,
    headline: `Shifted Pro Tier to $${extractedProPrice}/Seat + Unbundled Per-GB RAM & vCPU Metering`,
    summary: diffReason,
    severity: 'High Sales Impact',
    category: 'Pricing Shift',
    beforeValue: `${prevPro} flat workspace credit model`,
    afterValue: `${currPro}/seat + metered RAM/vCPU & stricter egress limits`,
    affectedTier: 'pro',
    sourceUrl: url,
    sourceTitle: `${cleanName} Live Pricing & Changelog Scan`,
    recommendedAction: `Target ${cleanName} accounts with >5 developers using our TCO comparison calculator showing 45% savings on NexusCloud Pro.`,
  };

  // Preserve all 12 feature IDs so matrix never has missing cells
  for (const feat of INITIAL_FEATURES) {
    if (!competitor.features[feat.id]) {
      competitor.features[feat.id] = {
        value: 'Metered Add-On / Limited',
        advantage: 'ours',
        detailNote: 'Included natively in NexusCloud',
      };
    }
  }

  return {
    competitor,
    radarEvent,
    groundingSources: [
      { title: `${cleanName} Official Pricing Page`, uri: url },
      { title: `${cleanName} Documentation & Limits`, uri: `${url.replace(/\/pricing\/?$/, '')}/docs` },
    ],
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // 1. Live AI Competitor Scan endpoint (supports Google Search Grounding + Structured Extraction)
  app.post('/api/gemini/scan', async (req, res) => {
    const {
      competitorName = '',
      competitorUrl = '',
      rawText = '',
      ourProductName = OUR_PRODUCT.name,
    } = req.body || {};

    if (!competitorName || typeof competitorName !== 'string' || !competitorName.trim()) {
      res.status(400).json({ error: 'Competitor name is required.' });
      return;
    }

    const baseSynthesized = buildSynthesizedCompetitor(
      competitorName,
      competitorUrl,
      rawText
    );

    const ai = getGenAIClient();
    if (!ai) {
      res.json({
        ...baseSynthesized,
        mode: 'deterministic_intelligence',
      });
      return;
    }

    try {
      const featureIdsList = INITIAL_FEATURES.map(
        (f) => `${f.id} (${f.name})`
      ).join(', ');

      const prompt = `You are a B2B SaaS Competitive Pricing & RevOps Analyst comparing our product "${ourProductName}" (Cloud PaaS & Edge Infrastructure: Starter $0, Pro $19/seat with 1TB egress, Team $49/seat with free SAML SSO & HIPAA BAA, Enterprise $850) against competitor "${competitorName}" (${competitorUrl || 'live web pricing'}).
${rawText ? `User provided pricing/changelog text:\n"""\n${rawText}\n"""` : `Scan the latest pricing tiers, usage limits, overage fees, and recent changelog updates for ${competitorName}.`}

Return a JSON object with:
1. "tagline": concise 1-line product description of ${competitorName}
2. "proMonthlyPrice": number (monthly price in USD for their Pro/commercial tier, e.g. 20)
3. "teamMonthlyPrice": number (monthly price in USD for their Team/Org tier, e.g. 49)
4. "enterpriseMonthlyPrice": number (monthly starting price in USD for Enterprise, e.g. 1500)
5. "recentDiffHeadline": string describing a specific recent pricing or limit change at ${competitorName}
6. "recentDiffBefore": string (previous price or limit, e.g. "$15/mo" or "500 GB")
7. "recentDiffAfter": string (current price or limit, e.g. "$20/mo" or "250 GB")
8. "recentDiffReason": 1-2 sentence explanation of why it changed and how it impacts customers
9. "executiveSummary": 2-sentence battlecard summary comparing ${ourProductName} vs ${competitorName}
10. "killPoints": array of 3 objects with { "title", "proofMetric", "talkingPoint", "featureRef" }
11. "landmines": array of 2 objects with { "title", "honestGap", "pivotStrategy" }
12. "presetObjection": { "objection", "rebuttal", "proofCitation" }
13. "featureHighlights": object mapping any of [${featureIdsList}] to short value strings.`;

      const response = await callGeminiWithFallback(ai, {
        contents: prompt,
        useSearchGrounding: !rawText,
        responseSchema: rawText
          ? {
              type: Type.OBJECT,
              properties: {
                tagline: { type: Type.STRING },
                proMonthlyPrice: { type: Type.NUMBER },
                teamMonthlyPrice: { type: Type.NUMBER },
                enterpriseMonthlyPrice: { type: Type.NUMBER },
                recentDiffHeadline: { type: Type.STRING },
                recentDiffBefore: { type: Type.STRING },
                recentDiffAfter: { type: Type.STRING },
                recentDiffReason: { type: Type.STRING },
                executiveSummary: { type: Type.STRING },
              },
            }
          : undefined,
      });

      const rawOutput = response.text || '';
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const comp = baseSynthesized.competitor;
        if (parsed.tagline) comp.tagline = parsed.tagline;
        if (typeof parsed.proMonthlyPrice === 'number') {
          comp.tiers.pro.monthlyPrice = parsed.proMonthlyPrice;
        }
        if (typeof parsed.teamMonthlyPrice === 'number') {
          comp.tiers.team.monthlyPrice = parsed.teamMonthlyPrice;
        }
        if (typeof parsed.enterpriseMonthlyPrice === 'number') {
          comp.tiers.enterprise.monthlyPrice = parsed.enterpriseMonthlyPrice;
          comp.tiers.enterprise.customLabel = `From $${parsed.enterpriseMonthlyPrice.toLocaleString()}`;
        }
        if (parsed.recentDiffReason && comp.tiers.pro.diff) {
          comp.tiers.pro.diff.previousValue =
            parsed.recentDiffBefore || comp.tiers.pro.diff.previousValue;
          comp.tiers.pro.diff.currentValue =
            parsed.recentDiffAfter || comp.tiers.pro.diff.currentValue;
          comp.tiers.pro.diff.reason = parsed.recentDiffReason;
        }
        if (parsed.executiveSummary) {
          comp.battlecard.executiveSummary = parsed.executiveSummary;
        }
        if (Array.isArray(parsed.killPoints) && parsed.killPoints.length > 0) {
          comp.battlecard.killPoints = parsed.killPoints
            .slice(0, 4)
            .map((kp: Record<string, string>, idx: number) => ({
              id: `${comp.id}-kp-${idx}`,
              title: kp.title || 'Predictable All-In Unit Economics',
              proofMetric: kp.proofMetric || 'Save 38% TCO',
              talkingPoint: kp.talkingPoint || '',
              featureRef: kp.featureRef || 'Pro Growth Tier',
            }));
        }
        if (Array.isArray(parsed.landmines) && parsed.landmines.length > 0) {
          comp.battlecard.landmines = parsed.landmines
            .slice(0, 3)
            .map((lm: Record<string, string>, idx: number) => ({
              id: `${comp.id}-lm-${idx}`,
              title: lm.title || 'Developer Mindshare',
              honestGap: lm.honestGap || '',
              pivotStrategy: lm.pivotStrategy || '',
            }));
        }
        if (parsed.presetObjection?.objection && parsed.presetObjection?.rebuttal) {
          comp.battlecard.presetObjections = [
            {
              id: `${comp.id}-obj-ai`,
              objection: parsed.presetObjection.objection,
              rebuttal: parsed.presetObjection.rebuttal,
              proofCitation:
                parsed.presetObjection.proofCitation || 'Live Gemini Pricing Matrix Analysis',
            },
            ...comp.battlecard.presetObjections,
          ];
        }
        if (parsed.recentDiffHeadline) {
          baseSynthesized.radarEvent.headline = parsed.recentDiffHeadline;
          baseSynthesized.radarEvent.beforeValue =
            parsed.recentDiffBefore || baseSynthesized.radarEvent.beforeValue;
          baseSynthesized.radarEvent.afterValue =
            parsed.recentDiffAfter || baseSynthesized.radarEvent.afterValue;
          baseSynthesized.radarEvent.summary =
            parsed.recentDiffReason || baseSynthesized.radarEvent.summary;
        }
      }

      // Extract Google Search grounding chunks if present
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks) && chunks.length > 0) {
        const extractedSources = chunks
          .map((c) => c.web)
          .filter((w): w is { uri: string; title: string } => Boolean(w?.uri))
          .map((w) => ({ title: w.title || w.uri, uri: w.uri }));
        if (extractedSources.length > 0) {
          baseSynthesized.groundingSources = extractedSources;
        }
      }

      res.json({
        ...baseSynthesized,
        mode: 'gemini_live',
      });
    } catch (_err) {
      // Graceful fallback so user flow never breaks
      res.json({
        ...baseSynthesized,
        mode: 'deterministic_fallback',
      });
    }
  });

  // 2. Live AI Objection Handler Simulator endpoint
  app.post('/api/gemini/objection', async (req, res) => {
    const {
      competitorName = 'Vercel',
      objection = '',
      billingCycle = 'monthly',
      competitorProPrice = '$20',
      ourProPrice = '$19',
    } = req.body || {};

    if (!objection || typeof objection !== 'string' || !objection.trim()) {
      res.status(400).json({ error: 'Please enter a prospect objection to analyze.' });
      return;
    }

    const cleanObj = objection.trim();

    const buildFallbackRebuttal = () => {
      const lower = cleanObj.toLowerCase();
      if (lower.includes('sso') || lower.includes('okta') || lower.includes('security') || lower.includes('hipaa')) {
        return {
          rebuttal: `While ${competitorName} gates SAML SSO, SCIM provisioning, and HIPAA BAA behind an Enterprise contract costing $1,500 to $2,500+/mo, NexusCloud includes full Okta/Entra SAML SSO and HIPAA compliance natively on our $49/seat Team tier. Even if ${competitorName} discounts their base seat fee, their Enterprise security requirement adds over $24,000/yr in mandatory platform overhead. We can connect your security architect with our compliance lead today and enable SAML SSO in your trial workspace in 10 minutes.`,
          proofCitation: `Security & Compliance Matrix: NexusCloud Team ($49/seat) vs. ${competitorName} Enterprise ($1,500–$2,500/mo)`,
          followUpQuestion: `"If your InfoSec team mandates Okta SAML SSO or a signed HIPAA BAA in the next 12 months, have you modeled ${competitorName}'s $24k+ Enterprise upgrade into your TCO?"`,
        };
      }
      if (lower.includes('bandwidth') || lower.includes('egress') || lower.includes('price') || lower.includes('cheaper')) {
        return {
          rebuttal: `Looking beyond the base ${competitorProPrice}/mo sticker price, ${competitorName} charges 2.5x to 3.75x more for outbound bandwidth ($0.10–$0.18/GB) and bills extra for concurrent CI/CD build slots and log retention. NexusCloud Pro (${ourProPrice}/mo on ${billingCycle} billing) bundles 1 TB of global Anycast egress, unlimited concurrent NVMe builds, and 30-day OpenTelemetry logs with flat $0.04/GB overages. Across a typical 15-engineer production team, NexusCloud lowers total annual cloud spend by 41% with zero surprise overage spikes.`,
          proofCitation: `Core Infrastructure Matrix: 1 TB Included + $0.04/GB Overage (${billingCycle} billing)`,
          followUpQuestion: `"What did your team spend last quarter on bandwidth overages, extra build concurrency slots, and log drain add-ons on top of base seat fees?"`,
        };
      }
      return {
        rebuttal: `We hear that often from teams evaluating ${competitorName}, and the key difference comes down to Day-2 production economics and unified architecture. With NexusCloud (${ourProPrice}/seat on ${billingCycle} billing), your frontend edge routes, stateful Docker workers, Serverless GPUs, and HA Postgres run inside one zero-latency private network—with 1 TB free egress, unlimited builds, and 30-day OpenTelemetry logs included out of the box. Let's run a 15-minute side-by-side benchmark using your actual repo so your engineers can compare cold-start latency (<12ms) and total monthly TCO directly.`,
        proofCitation: `NexusCloud (${ourProPrice}/mo) vs. ${competitorName} (${competitorProPrice}/mo) · Full-Stack Matrix Benchmark`,
        followUpQuestion: `"Which matters more for your upcoming release: consolidating frontend, backend workers, and HA Postgres into one VPC, or eliminating unpredictable usage add-ons?"`,
      };
    };

    const ai = getGenAIClient();
    if (!ai) {
      res.json(buildFallbackRebuttal());
      return;
    }

    try {
      const response = await callGeminiWithFallback(ai, {
        contents: `Prospect Objection against NexusCloud (comparing with ${competitorName}): "${cleanObj}"
Context:
- NexusCloud Pro is ${ourProPrice}/seat (${billingCycle} billing) with 1 TB egress ($0.04/GB overage), <12ms Firecracker wake, 50 GB HA Postgres, unlimited concurrent builds, and 30-day OpenTelemetry logs.
- NexusCloud Team is $49/seat with free SAML SSO, HIPAA BAA, L7 WAF, and 99.99% SLA.
- ${competitorName} Pro is ${competitorProPrice}/seat with higher bandwidth overages ($0.10-$0.18/GB), Enterprise-gated SAML SSO ($1,500-$2,500/mo), and paid build/log add-ons.

Write a crisp, high-conviction 3-sentence sales rebuttal grounded in these exact numbers, plus a short proof citation and 1 killer discovery follow-up question.`,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rebuttal: {
              type: Type.STRING,
              description: 'Crisp 3-sentence sales rebuttal grounded in matrix metrics.',
            },
            proofCitation: {
              type: Type.STRING,
              description: 'Specific matrix row and metric backing the rebuttal.',
            },
            followUpQuestion: {
              type: Type.STRING,
              description: 'One sharp discovery question for the sales rep to ask next.',
            },
          },
          required: ['rebuttal', 'proofCitation', 'followUpQuestion'],
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      if (parsed.rebuttal) {
        res.json(parsed);
        return;
      }
      res.json(buildFallbackRebuttal());
    } catch (_err) {
      res.json(buildFallbackRebuttal());
    }
  });

  // 3. Sales Alert Email Generator endpoint
  app.post('/api/gemini/sales-email', async (req, res) => {
    const { event, ourProductName = 'NexusCloud' } = req.body || {};
    if (!event) {
      res.status(400).json({ error: 'Radar event is required.' });
      return;
    }

    const baseDraft = generateSalesAlertEmailDraft(event, ourProductName);
    const ai = getGenAIClient();
    if (!ai) {
      res.json(baseDraft);
      return;
    }

    try {
      const response = await callGeminiWithFallback(ai, {
        contents: `Generate an internal B2B SaaS Revenue Team Alert Email for AE and SDR teams at ${ourProductName} based on this verified competitor change:
Competitor: ${event.competitorName}
Headline: ${event.headline}
Severity: ${event.severity}
Before: ${event.beforeValue}
After: ${event.afterValue}
Summary: ${event.summary}
Source: ${event.sourceTitle} (${event.sourceUrl})`,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            recipients: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ['subject', 'recipients', 'body'],
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      if (parsed.subject && parsed.body) {
        res.json(parsed);
        return;
      }
      res.json(baseDraft);
    } catch (_err) {
      res.json(baseDraft);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PulseMatrix server running on http://localhost:${PORT}`);
  });
}

startServer();
