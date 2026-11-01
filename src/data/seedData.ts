import {
  CompetitorProfile,
  FeatureDefinition,
  RadarChangeEvent,
  WorkspaceConfig,
} from '../types/intelligence';

export const WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'ws-nexus-cloud',
    name: 'NexusCloud · Cloud PaaS & Edge',
    ourProductName: 'NexusCloud',
    ourProductUrl: 'https://nexuscloud.dev/pricing',
    segment: 'Cloud PaaS, Serverless Compute & Edge Runtime',
    lastSyncedLabel: 'Last Synced: 2 hours ago',
  },
  {
    id: 'ws-nexus-enterprise',
    name: 'NexusCloud · Enterprise Security',
    ourProductName: 'NexusCloud Enterprise',
    ourProductUrl: 'https://nexuscloud.dev/enterprise',
    segment: 'SOC2 / HIPAA Regulated Cloud Infrastructure',
    lastSyncedLabel: 'Last Synced: 42 mins ago',
  },
];

export const OUR_PRODUCT: CompetitorProfile = {
  id: 'nexuscloud',
  name: 'NexusCloud',
  url: 'https://nexuscloud.dev/pricing',
  tagline: 'Zero-markup global cloud compute, edge functions & managed Postgres',
  lastScanned: '2 hours ago',
  threatLevel: 'Primary Threat',
  winRateAgainst: 100,
  winRateDelta: '+4.8%',
  tiers: {
    starter: {
      tierId: 'starter',
      tierName: 'Starter Hobby',
      audience: 'For solo builders & prototypes',
      monthlyPrice: 0,
      perSeatNote: '$0/mo · Up to 3 builders included',
      includedSummary: '150 GB egress, 2 GB RAM micro-VMs, 10 GB NVMe Postgres',
    },
    pro: {
      tierId: 'pro',
      tierName: 'Pro Growth',
      audience: 'For production startups & high-velocity teams',
      monthlyPrice: 19,
      perSeatNote: 'per seat / mo · 5 free viewer seats',
      includedSummary: '1 TB global egress, autoscaling GPU/CPU workers, preview branches',
      diff: {
        daysAgo: 4,
        dateLabel: 'Changed 4d ago',
        previousValue: '500 GB egress',
        currentValue: '1 TB egress ($19/mo)',
        changeType: 'new_feature',
        reason: 'NexusCloud doubled included Pro bandwidth from 500 GB to 1 TB at no extra seat cost to widen our TCO advantage against Vercel Pro.',
        sourceUrl: 'https://nexuscloud.dev/changelog/2026-10-bandwidth-expansion',
        sourceTitle: 'NexusCloud Oct 2026 Changelog: 2x Included Bandwidth',
        impactLevel: 'High Sales Impact',
      },
    },
    team: {
      tierId: 'team',
      tierName: 'Team Scale',
      audience: 'For multi-service engineering orgs',
      monthlyPrice: 49,
      perSeatNote: 'per seat / mo · SAML SSO included free',
      includedSummary: '5 TB egress, SOC2 artifacts, private VPC peering, 99.99% SLA',
    },
    enterprise: {
      tierId: 'enterprise',
      tierName: 'Enterprise Custom',
      audience: 'For regulated global workloads & BYOC',
      monthlyPrice: 850,
      customLabel: 'From $850',
      perSeatNote: 'flat platform base · Unlimited seats',
      includedSummary: 'BYOC AWS/GCP deployment, HIPAA BAA, dedicated TAM, 15-min SLA',
    },
  },
  pricingHistory: [
    { month: 'May 26', starter: 0, pro: 19, team: 49, enterprise: 850 },
    { month: 'Jun 26', starter: 0, pro: 19, team: 49, enterprise: 850 },
    { month: 'Jul 26', starter: 0, pro: 19, team: 49, enterprise: 850 },
    { month: 'Aug 26', starter: 0, pro: 19, team: 49, enterprise: 850 },
    { month: 'Sep 26', starter: 0, pro: 19, team: 49, enterprise: 850 },
    { month: 'Oct 26', starter: 0, pro: 19, team: 49, enterprise: 850, note: 'Doubled Pro egress to 1 TB at $19/seat' },
  ],
  features: {
    'feat-bandwidth': {
      value: '1 TB included (then $0.04/GB)',
      advantage: 'ours',
      detailNote: 'Lowest overage rate in category; zero regional egress tax',
    },
    'feat-build-mins': {
      value: 'Unlimited concurrent NVMe builds',
      advantage: 'ours',
      detailNote: 'Up to 32 vCPU ephemeral build runners included on Pro+',
    },
    'feat-cold-start': {
      value: '< 12ms Firecracker MicroVM wake',
      advantage: 'ours',
      detailNote: 'Memory snapshot restore across 38 global edge regions',
    },
    'feat-postgres': {
      value: '50 GB HA Postgres + Point-in-Time Restore',
      advantage: 'ours',
      detailNote: 'Automated branching per PR with zero storage duplication',
    },
    'feat-sso': {
      value: 'Included free on Team ($0 add-on)',
      advantage: 'ours',
      detailNote: 'Okta, Azure AD, Google Workspace SAML + SCIM provisioning',
    },
    'feat-ddos-waf': {
      value: 'L7 Managed WAF + Unlimited DDoS Shield',
      advantage: 'ours',
      detailNote: 'Custom OWASP rulesets included on Pro & Team without per-request fees',
    },
    'feat-byoc-vpc': {
      value: 'Included on Team & Enterprise',
      advantage: 'ours',
      detailNote: 'AWS PrivateLink, Tailscale mesh & GCP VPC peering out of the box',
    },
    'feat-hipaa-soc2': {
      value: 'SOC2 Type II + HIPAA BAA on Team+',
      advantage: 'ours',
      detailNote: 'No $25k annual enterprise contract required for BAA signing',
    },
    'feat-ai-gateway': {
      value: '10M tokens/mo cached + Semantic Router',
      advantage: 'ours',
      detailNote: 'Zero-latency failover across Gemini, OpenAI & Anthropic endpoints',
    },
    'feat-gpu-workers': {
      value: 'L40S & H100 Serverless GPUs ($0.42/hr)',
      advantage: 'ours',
      detailNote: 'Per-second billing with scale-to-zero after 15s idle',
    },
    'feat-observability': {
      value: '30-day OpenTelemetry Log & Trace Retention',
      advantage: 'ours',
      detailNote: 'Built-in Prometheus/Grafana export at zero ingestion cost',
    },
    'feat-support-sla': {
      value: '99.99% Uptime SLA + <30m Slack Response',
      advantage: 'ours',
      detailNote: 'Dedicated shared Slack channel starting on Team tier',
    },
  },
  battlecard: {
    executiveSummary: 'Our benchmark baseline across Cloud PaaS & Edge infrastructure.',
    targetSweetSpot: 'Full-stack SaaS & AI teams with 5–250 engineers.',
    killPoints: [],
    landmines: [],
    presetObjections: [],
  },
};

export const INITIAL_FEATURES: FeatureDefinition[] = [
  {
    id: 'feat-bandwidth',
    name: 'Included Pro Egress & Overage Rate',
    category: 'Core Infrastructure',
    description: 'Monthly outbound data transfer included on Pro tier and per-GB overage pricing.',
    tierApplicability: ['starter', 'pro', 'team', 'enterprise'],
    ourValue: OUR_PRODUCT.features['feat-bandwidth'],
  },
  {
    id: 'feat-build-mins',
    name: 'CI/CD Build Concurrency & Minutes',
    category: 'Core Infrastructure',
    description: 'Parallel build pipelines and monthly build execution quotas.',
    tierApplicability: ['starter', 'pro', 'team'],
    ourValue: OUR_PRODUCT.features['feat-build-mins'],
  },
  {
    id: 'feat-cold-start',
    name: 'Edge & Container Cold Start Latency',
    category: 'Core Infrastructure',
    description: 'P95 wake time from scale-to-zero for serverless functions and containers.',
    tierApplicability: ['pro', 'team', 'enterprise'],
    ourValue: OUR_PRODUCT.features['feat-cold-start'],
  },
  {
    id: 'feat-postgres',
    name: 'Managed HA Postgres & PR Branching',
    category: 'Core Infrastructure',
    description: 'Included storage, read replicas, and ephemeral database branching per pull request.',
    tierApplicability: ['starter', 'pro', 'team', 'enterprise'],
    ourValue: OUR_PRODUCT.features['feat-postgres'],
  },
  {
    id: 'feat-sso',
    name: 'SAML SSO & SCIM Directory Sync',
    category: 'Security & Compliance',
    description: 'Enterprise identity provider integration (Okta, Entra ID) and automated seat provisioning.',
    tierApplicability: ['team', 'enterprise'],
    ourValue: OUR_PRODUCT.features['feat-sso'],
  },
  {
    id: 'feat-ddos-waf',
    name: 'Managed L7 WAF & DDoS Mitigation',
    category: 'Security & Compliance',
    description: 'Custom firewall rules, rate limiting, and volumetric attack absorption.',
    tierApplicability: ['pro', 'team', 'enterprise'],
    ourValue: OUR_PRODUCT.features['feat-ddos-waf'],
  },
  {
    id: 'feat-byoc-vpc',
    name: 'Private VPC Peering & AWS PrivateLink',
    category: 'Security & Compliance',
    description: 'Isolated private network peering with existing cloud data stores.',
    tierApplicability: ['team', 'enterprise'],
    ourValue: OUR_PRODUCT.features['feat-byoc-vpc'],
  },
  {
    id: 'feat-hipaa-soc2',
    name: 'SOC2 Type II & HIPAA BAA Eligibility',
    category: 'Security & Compliance',
    description: 'Compliance attestation access and Business Associate Agreement minimum tier.',
    tierApplicability: ['team', 'enterprise'],
    ourValue: OUR_PRODUCT.features['feat-hipaa-soc2'],
  },
  {
    id: 'feat-ai-gateway',
    name: 'AI Model Gateway & Semantic Caching',
    category: 'AI & Usage Limits',
    description: 'Integrated LLM rate-limiting, prompt caching, and multi-provider fallback.',
    tierApplicability: ['starter', 'pro', 'team', 'enterprise'],
    ourValue: OUR_PRODUCT.features['feat-ai-gateway'],
  },
  {
    id: 'feat-gpu-workers',
    name: 'Serverless GPU Inference Workers',
    category: 'AI & Usage Limits',
    description: 'On-demand GPU compute availability and scale-to-zero billing granularity.',
    tierApplicability: ['pro', 'team', 'enterprise'],
    ourValue: OUR_PRODUCT.features['feat-gpu-workers'],
  },
  {
    id: 'feat-observability',
    name: 'Log Retention & OpenTelemetry Export',
    category: 'Support & SLA',
    description: 'Historical runtime log retention window and external SIEM/OTel sink pricing.',
    tierApplicability: ['pro', 'team', 'enterprise'],
    ourValue: OUR_PRODUCT.features['feat-observability'],
  },
  {
    id: 'feat-support-sla',
    name: 'Uptime SLA & Dedicated Engineering Slack',
    category: 'Support & SLA',
    description: 'Financially backed uptime commitment and direct engineer response SLA.',
    tierApplicability: ['team', 'enterprise'],
    ourValue: OUR_PRODUCT.features['feat-support-sla'],
  },
];

export const INITIAL_COMPETITORS: CompetitorProfile[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    url: 'https://vercel.com/pricing',
    tagline: 'Frontend Cloud & Next.js Serverless Deployment Platform',
    lastScanned: '1 hour ago',
    threatLevel: 'Primary Threat',
    winRateAgainst: 68,
    winRateDelta: '+7.4%',
    tiers: {
      starter: {
        tierId: 'starter',
        tierName: 'Hobby',
        audience: 'Non-commercial personal projects only',
        monthlyPrice: 0,
        perSeatNote: 'Single user · Non-commercial license restriction',
        includedSummary: '100 GB Fast Data Transfer, 100k Edge middleware invocations',
      },
      pro: {
        tierId: 'pro',
        tierName: 'Pro',
        audience: 'Small frontend & full-stack teams',
        monthlyPrice: 20,
        perSeatNote: 'per seat / mo + $10/seat Preview Deployment add-on',
        includedSummary: '1 TB Fast Data Transfer, then $0.15/GB overage in North America',
      },
      team: {
        tierId: 'team',
        tierName: 'Pro + Speed & Security Add-ons',
        audience: 'Scaling engineering teams needing WAF & observability',
        monthlyPrice: 65,
        perSeatNote: 'effective per seat / mo with Monitoring & WAF add-ons',
        includedSummary: 'Requires paid add-ons for Log Drains ($60/mo) & Advanced WAF',
        diff: {
          daysAgo: 2,
          dateLabel: 'Changed 2d ago',
          previousValue: '$50/mo',
          currentValue: '$65/mo',
          changeType: 'price_hike',
          reason: 'Vercel unbundled Drains & Observability Plus into separate metered add-ons, raising effective per-seat spend for multi-repo teams by ~30%.',
          sourceUrl: 'https://vercel.com/docs/pricing/manage-and-optimize-usage',
          sourceTitle: 'Vercel Billing Documentation: Observability & Drain Metering Update',
          impactLevel: 'High Sales Impact',
        },
      },
      enterprise: {
        tierId: 'enterprise',
        tierName: 'Enterprise',
        audience: 'Large organizations needing SSO & SLA',
        monthlyPrice: 2500,
        customLabel: 'From $2,500',
        perSeatNote: 'annual contract required ($30k+/yr floor)',
        includedSummary: 'SAML SSO, 99.99% SLA, Secure Compute VPC, custom WAF rules',
      },
    },
    pricingHistory: [
      { month: 'May 26', starter: 0, pro: 18, team: 50, enterprise: 2500 },
      { month: 'Jun 26', starter: 0, pro: 18, team: 50, enterprise: 2500 },
      { month: 'Jul 26', starter: 0, pro: 20, team: 50, enterprise: 2500 },
      { month: 'Aug 26', starter: 0, pro: 20, team: 50, enterprise: 2500 },
      { month: 'Sep 26', starter: 0, pro: 20, team: 55, enterprise: 2500 },
      { month: 'Oct 26', starter: 0, pro: 20, team: 65, enterprise: 2500, note: 'Unbundled Log Drains & Observability Plus (+30% effective Team spend)' },
    ],
    features: {
      'feat-bandwidth': {
        value: '1 TB included (then $0.15/GB+)',
        advantage: 'ours',
        detailNote: '3.75x higher overage rate ($150 per extra TB vs $40 on NexusCloud)',
        diff: {
          daysAgo: 5,
          dateLabel: 'Changed 5d ago',
          previousValue: '$0.12/GB APAC',
          currentValue: '$0.18/GB APAC',
          changeType: 'price_hike',
          reason: 'Regional Fast Data Transfer multipliers increased for APAC & South America edge PoPs.',
          sourceUrl: 'https://vercel.com/pricing',
          sourceTitle: 'Vercel Regional Data Transfer Pricing Schedule',
          impactLevel: 'High Sales Impact',
        },
      },
      'feat-build-mins': {
        value: '1 concurrent build ($40/mo per extra slot)',
        advantage: 'ours',
        detailNote: 'Teams with >10 engineers hit build queues without $40/slot add-ons',
      },
      'feat-cold-start': {
        value: '~45ms Fluid Compute (Node.js runtime)',
        advantage: 'ours',
        detailNote: 'Fast on V8 isolates, but cannot run persistent Docker/TCP daemons',
      },
      'feat-postgres': {
        value: 'Marketplace third-party integration (Neon/Supabase)',
        advantage: 'ours',
        detailNote: 'No native first-party Postgres; billed separately via marketplace vendor',
      },
      'feat-sso': {
        value: 'Enterprise Tier Only ($30k/yr minimum)',
        advantage: 'ours',
        detailNote: 'Classic SSO tax—cannot buy SAML Okta SSO on Pro without Enterprise upgrade',
      },
      'feat-ddos-waf': {
        value: 'Basic DDoS free; Managed OWASP rules Enterprise-only',
        advantage: 'ours',
        detailNote: 'Pro plan charges per-million WAF inspected requests above quota',
      },
      'feat-byoc-vpc': {
        value: 'Secure Compute add-on (Enterprise + $6.5k/yr)',
        advantage: 'ours',
        detailNote: 'Dedicated IP & VPC peering gated behind Enterprise contract',
      },
      'feat-hipaa-soc2': {
        value: 'Enterprise Contract Required for BAA',
        advantage: 'ours',
        detailNote: 'Series A healthcare startups forced into $30k+ annual tier',
      },
      'feat-ai-gateway': {
        value: 'Vercel AI SDK + AI Gateway (1M tokens free)',
        advantage: 'theirs',
        detailNote: 'Best-in-class React/Next.js streaming hooks & UI component ecosystem',
      },
      'feat-gpu-workers': {
        value: 'Not Supported (No native GPU containers)',
        advantage: 'ours',
        detailNote: 'Cannot host long-running PyTorch/vLLM containers natively',
      },
      'feat-observability': {
        value: '1-day Pro log retention ($60/mo Log Drains add-on)',
        advantage: 'ours',
        detailNote: 'Real-time log export requires paid Observability Plus subscription',
        diff: {
          daysAgo: 2,
          dateLabel: 'Changed 2d ago',
          previousValue: 'Bundled Drains',
          currentValue: '+$60/mo Log Drains',
          changeType: 'price_hike',
          reason: 'Vercel separated Log Drains and 30-day Observability Plus retention into paid add-ons for Pro teams.',
          sourceUrl: 'https://vercel.com/docs/pricing/manage-and-optimize-usage',
          sourceTitle: 'Vercel Observability & Log Drain Pricing',
          impactLevel: 'High Sales Impact',
        },
      },
      'feat-support-sla': {
        value: 'Email support on Pro; 99.99% SLA Enterprise-only',
        advantage: 'ours',
        detailNote: 'No dedicated Slack channel or uptime SLA below $2,500/mo',
      },
    },
    battlecard: {
      executiveSummary:
        'Vercel dominates developer mindshare for Next.js frontends, but suffers from steep seat + bandwidth multipliers once a team crosses 10 engineers or adds backend microservices, WebSockets, and AI workers.',
      targetSweetSpot:
        'Displace Vercel when prospects complain about surprise $0.15/GB bandwidth bills, $40/slot build queues, or being forced into a $30,000/yr Enterprise contract just to unlock Okta SAML SSO or HIPAA BAA.',
      killPoints: [
        {
          id: 'vk-1',
          title: 'Eliminate the $30,000/yr Okta SSO & HIPAA Tax',
          proofMetric: 'Save $24,000+/yr on Team Security',
          talkingPoint:
            'Vercel gates SAML SSO, SCIM, and HIPAA BAA behind a $2,500/mo Enterprise contract. NexusCloud includes SAML SSO and SOC2/HIPAA compliance natively on our $49/seat Team plan.',
          featureRef: 'SAML SSO & SCIM Directory Sync',
        },
        {
          id: 'vk-2',
          title: '73% Lower Bandwidth Overages & Zero Build Slot Fees',
          proofMetric: '$0.04/GB vs. Vercel $0.15/GB',
          talkingPoint:
            'Vercel charges $150 per extra TB of bandwidth and $40/mo for each extra concurrent build slot. NexusCloud includes 1 TB free, charges just $40/TB thereafter, and provides unlimited concurrent NVMe builds.',
          featureRef: 'Included Pro Egress & Overage Rate',
        },
        {
          id: 'vk-3',
          title: 'Full-Stack Containers + GPU Workers in One VPC',
          proofMetric: 'Stateful Docker + Serverless GPUs',
          talkingPoint:
            'Vercel is built around short-lived serverless functions—forcing teams to run a second cloud (AWS/Render) for background queues, WebSockets, and Python AI workers. NexusCloud runs Next.js frontends AND stateful GPU/CPU containers in one unified VPC.',
          featureRef: 'Serverless GPU Inference Workers',
        },
        {
          id: 'vk-4',
          title: '30-Day OpenTelemetry Logs Included (No $60/mo Drain Tax)',
          proofMetric: '30d retention vs. 1d on Vercel Pro',
          talkingPoint:
            'Vercel Pro retains runtime logs for only 24 hours unless you pay for Observability Plus and Log Drains. NexusCloud includes 30-day OpenTelemetry traces and zero-cost Datadog/Grafana export.',
          featureRef: 'Log Retention & OpenTelemetry Export',
        },
      ],
      landmines: [
        {
          id: 'vl-1',
          title: 'Zero-Config Next.js ISR & React Server Components DX',
          honestGap:
            'Vercel builds Next.js and ships experimental App Router caching primitives weeks before open-source adapters catch up.',
          pivotStrategy:
            'Acknowledge Vercel’s frontend DX pedigree, then ask: "What percentage of your cloud bill and engineering friction comes from the Next.js UI versus your Python AI workers, databases, and egress?"',
        },
        {
          id: 'vl-2',
          title: 'Vercel AI SDK & v0 Frontend Prototyping Ecosystem',
          honestGap:
            'Frontend engineers love Vercel AI SDK hooks and v0 UI generation.',
          pivotStrategy:
            'Clarify that the Vercel AI SDK is 100% open-source and runs identically on NexusCloud—while our built-in Semantic AI Gateway saves 35% on LLM token spend via automatic prompt caching.',
        },
      ],
      presetObjections: [
        {
          id: 'vo-1',
          objection: 'Our frontend team already uses Next.js and says only Vercel supports all App Router features natively.',
          rebuttal:
            'NexusCloud maintains a verified OpenNext runtime engine that supports 100% of Next.js 15/16 App Router features—including Partial Prerendering, Server Actions, and tag-based ISR cache invalidation—with sub-12ms global edge latency. Better yet, your Next.js app runs inside the same private network as your Postgres database and Python backend, eliminating cross-cloud latency. We can deploy your production repo into a live NexusCloud preview branch in under 8 minutes so your lead engineer can verify parity firsthand.',
          proofCitation: 'Edge & Container Cold Start Latency (<12ms Firecracker MicroVM)',
        },
        {
          id: 'vo-2',
          objection: 'Vercel Pro is also $20/seat, so the base seat price looks almost identical to NexusCloud.',
          rebuttal:
            'While the $20 sticker price looks similar, Vercel unbundles essential team infrastructure into steep add-ons: $40/mo per concurrent build slot, $60/mo for log drains, $0.15/GB for bandwidth overages, and $2,500/mo if you need Okta SSO. On a 15-engineer team, those add-ons push effective spend to $65+/seat—over 3x higher than NexusCloud Pro at $19/seat with unlimited builds and 30-day logs included.',
          proofCitation: 'Vercel Pro + Add-ons ($65/mo effective) vs. NexusCloud Pro ($19/mo)',
        },
      ],
    },
  },
  {
    id: 'render',
    name: 'Render',
    url: 'https://render.com/pricing',
    tagline: 'Unified Cloud PaaS for Web Services, Cron Jobs & Managed Postgres',
    lastScanned: '2 hours ago',
    threatLevel: 'Primary Threat',
    winRateAgainst: 74,
    winRateDelta: '+5.1%',
    tiers: {
      starter: {
        tierId: 'starter',
        tierName: 'Individual',
        audience: 'Hobby projects & early experiments',
        monthlyPrice: 0,
        perSeatNote: '$0 seat fee + instance compute charges',
        includedSummary: '100 GB bandwidth, free instances spin down after 15m inactivity',
      },
      pro: {
        tierId: 'pro',
        tierName: 'Professional',
        audience: 'Growing teams deploying web apps & APIs',
        monthlyPrice: 25,
        perSeatNote: 'per user / mo + separate per-instance RAM/CPU bill',
        includedSummary: '500 GB bandwidth (then $0.10/GB), 10 team members max',
        diff: {
          daysAgo: 3,
          dateLabel: 'Changed 3d ago',
          previousValue: '$19/mo',
          currentValue: '$25/mo',
          changeType: 'price_hike',
          reason: 'Render increased its Professional per-user seat fee from $19/mo to $25/mo (+31.5%) while keeping instance compute billed separately on top of seat fees.',
          sourceUrl: 'https://render.com/pricing',
          sourceTitle: 'Render Pricing Update: Professional Workspace Seat Adjustment',
          impactLevel: 'High Sales Impact',
        },
      },
      team: {
        tierId: 'team',
        tierName: 'Organization',
        audience: 'Teams requiring SOC2 reports & preview environments',
        monthlyPrice: 39,
        perSeatNote: 'per user / mo + instance compute billed extra',
        includedSummary: '1 TB bandwidth, SOC2 report access, 14-day log retention',
        diff: {
          daysAgo: 3,
          dateLabel: 'Changed 3d ago',
          previousValue: '$29/mo',
          currentValue: '$39/mo',
          changeType: 'price_hike',
          reason: 'Organization tier seat price increased from $29 to $39/user/mo (+34%) alongside stricter compute autoscaling thresholds.',
          sourceUrl: 'https://render.com/pricing',
          sourceTitle: 'Render Organization Plan Pricing Schedule',
          impactLevel: 'High Sales Impact',
        },
      },
      enterprise: {
        tierId: 'enterprise',
        tierName: 'Enterprise',
        audience: 'Organizations needing SAML SSO, HIPAA & custom SLA',
        monthlyPrice: 1500,
        customLabel: 'From $1,500',
        perSeatNote: 'custom annual contract',
        includedSummary: 'SAML SSO, HIPAA BAA, 99.95% SLA, dedicated support engineer',
      },
    },
    pricingHistory: [
      { month: 'May 26', starter: 0, pro: 19, team: 29, enterprise: 1500 },
      { month: 'Jun 26', starter: 0, pro: 19, team: 29, enterprise: 1500 },
      { month: 'Jul 26', starter: 0, pro: 19, team: 29, enterprise: 1500 },
      { month: 'Aug 26', starter: 0, pro: 19, team: 29, enterprise: 1500 },
      { month: 'Sep 26', starter: 0, pro: 19, team: 29, enterprise: 1500 },
      { month: 'Oct 26', starter: 0, pro: 25, team: 39, enterprise: 1500, note: 'Hiked Pro seats $19→$25 (+31.5%) and Org seats $29→$39 (+34%)' },
    ],
    features: {
      'feat-bandwidth': {
        value: '500 GB included on Pro (then $0.10/GB)',
        advantage: 'ours',
        detailNote: 'Half the included bandwidth of NexusCloud Pro; 2.5x higher overage rate',
        diff: {
          daysAgo: 6,
          dateLabel: 'Changed 6d ago',
          previousValue: '$0.15/GB overage',
          currentValue: '$0.10/GB overage',
          changeType: 'price_drop',
          reason: 'Render lowered bandwidth overages from $0.15/GB to $0.10/GB to soften backlash from the $25/user seat price hike.',
          sourceUrl: 'https://render.com/changelog',
          sourceTitle: 'Render Changelog: Reduced Bandwidth Overage Rate',
          impactLevel: 'Medium',
        },
      },
      'feat-build-mins': {
        value: '500 build mins/mo included ($10 per extra 500m)',
        advantage: 'ours',
        detailNote: 'Slow shared CPU builders; frequent monorepo deploys burn quota in days',
      },
      'feat-cold-start': {
        value: '18s–45s container boot on scale-up',
        advantage: 'ours',
        detailNote: 'Standard Docker VM provisioning causes sluggish autoscaling under traffic spikes',
      },
      'feat-postgres': {
        value: 'Managed Postgres ($19/mo+ extra for HA & PITR)',
        advantage: 'ours',
        detailNote: 'Free DB expires after 30 days; Read Replicas require Pro DB instance tier',
      },
      'feat-sso': {
        value: 'Enterprise Tier Only (Not in $39/seat Org tier)',
        advantage: 'ours',
        detailNote: 'Even paying $39/seat on Organization does not unlock Okta SAML SSO',
      },
      'feat-ddos-waf': {
        value: 'Cloudflare L3/L4 DDoS; No custom L7 OWASP WAF',
        advantage: 'ours',
        detailNote: 'Customers must proxy traffic through their own Cloudflare Pro/Biz account',
      },
      'feat-byoc-vpc': {
        value: 'Render Private Network (AWS PrivateLink Enterprise-only)',
        advantage: 'ours',
        detailNote: 'Cannot peer with external AWS RDS/Redshift without Enterprise plan',
      },
      'feat-hipaa-soc2': {
        value: 'SOC2 on Org ($39/seat); HIPAA BAA Enterprise-only',
        advantage: 'ours',
        detailNote: 'Healthcare startups must upgrade to Enterprise for BAA execution',
      },
      'feat-ai-gateway': {
        value: 'Not Included (Manual third-party proxy required)',
        advantage: 'ours',
        detailNote: 'Zero built-in LLM semantic caching or model fallback routing',
      },
      'feat-gpu-workers': {
        value: 'Limited Private Beta (Fixed monthly instance pricing)',
        advantage: 'ours',
        detailNote: 'No per-second scale-to-zero GPU billing; pays 24/7 for idle GPUs',
      },
      'feat-observability': {
        value: '7-day Pro / 14-day Org log retention',
        advantage: 'ours',
        detailNote: 'Half the log retention window of NexusCloud',
      },
      'feat-support-sla': {
        value: '99.95% Enterprise SLA (No SLA on Pro/Org)',
        advantage: 'ours',
        detailNote: '5x more permitted annual downtime than NexusCloud 99.99% SLA',
      },
    },
    battlecard: {
      executiveSummary:
        'Render is the most common Heroku-replacement PaaS in mid-market deals. However, Render charges a "double tax": high per-seat fees ($25–$39/user/mo) PLUS unbundled per-instance compute fees, slow 30-second autoscaling boots, and no SAML SSO below Enterprise.',
      targetSweetSpot:
        'Target 10–60 person engineering teams irritated by Render’s recent 31%–34% seat price hike, slow CI/CD build minutes quota, and lack of multi-region active-active edge routing.',
      killPoints: [
        {
          id: 'rk-1',
          title: 'Capitalize on Render’s 31%–34% Seat Price Hike This Week',
          proofMetric: '$19/seat vs. Render $25–$39/seat',
          talkingPoint:
            'Render just raised Professional seats from $19 to $25/mo and Organization seats from $29 to $39/mo—and still charges extra for every single web service instance and build minute. NexusCloud Pro is $19/seat with 2x the bandwidth (1 TB) and unlimited build minutes.',
          featureRef: 'Pro Growth & Team Scale Pricing',
        },
        {
          id: 'rk-2',
          title: '1,500x Faster Autoscaling (<12ms vs. 18–45 Seconds)',
          proofMetric: '<12ms MicroVM wake vs. 30s Docker boot',
          talkingPoint:
            'When traffic spikes on Render, spinning up a new container instance takes 20 to 45 seconds—causing 502 timeouts during product launches. NexusCloud uses Firecracker memory snapshots to wake instances in under 12 milliseconds across 38 regions.',
          featureRef: 'Edge & Container Cold Start Latency',
        },
        {
          id: 'rk-3',
          title: 'SAML SSO & HIPAA BAA Without an Enterprise Contract',
          proofMetric: 'Included at $49/seat vs. $1,500+/mo on Render',
          talkingPoint:
            'Even if a customer pays Render $39/user/mo on their Organization plan, they still don’t get Okta SAML SSO, AWS PrivateLink, or a HIPAA BAA. NexusCloud includes all three on our Team tier.',
          featureRef: 'SOC2 Type II & HIPAA BAA Eligibility',
        },
      ],
      landmines: [
        {
          id: 'rl-1',
          title: 'Familiar `render.yaml` Blueprint Simplicity for Ex-Heroku Teams',
          honestGap:
            'Render’s dashboard feels very familiar to legacy Heroku users who want simple fixed-size sliders.',
          pivotStrategy:
            'Show our 1-click `render.yaml` Blueprint Importer that converts every Render web service, cron job, and Postgres database into NexusCloud in under 60 seconds with zero config rewrite.',
        },
        {
          id: 'rl-2',
          title: 'Recent Bandwidth Overage Drop ($0.15/GB -> $0.10/GB)',
          honestGap:
            'Render reps will claim they just cut bandwidth overages by 33% to $0.10/GB.',
          pivotStrategy:
            'Point out the math: Render still only includes 500 GB on Pro (vs. our 1 TB) and their new $0.10/GB rate is still 2.5x more expensive than NexusCloud’s $0.04/GB.',
        },
      ],
      presetObjections: [
        {
          id: 'ro-1',
          objection: 'Render just lowered their bandwidth overages to $0.10/GB and our backend is already defined in a render.yaml file.',
          rebuttal:
            'Even after Render’s reduction to $0.10/GB, they only include 500 GB on Pro and their overage rate is still 2.5x higher than NexusCloud’s $0.04/GB (with 1 TB included free). More importantly, Render offset that change by hiking seat prices by over 31%—to $25/user on Pro and $39/user on Organization—while capping build minutes at 500/mo. Our native Blueprint Importer reads your existing `render.yaml` directly, so you can cut your monthly bill by ~40% with zero YAML rewrites.',
          proofCitation: 'Render Pro Seat Hike ($19 -> $25/mo) & Bandwidth Matrix Row',
        },
      ],
    },
  },
  {
    id: 'flyio',
    name: 'Fly.io',
    url: 'https://fly.io/docs/about/pricing/',
    tagline: 'Global Anycast MicroVM Compute & Distributed Container Cloud',
    lastScanned: '3 hours ago',
    threatLevel: 'Emerging Challenger',
    winRateAgainst: 79,
    winRateDelta: '+9.2%',
    tiers: {
      starter: {
        tierId: 'starter',
        tierName: 'Pay As You Go',
        audience: 'Tinkerers & CLI-first infrastructure engineers',
        monthlyPrice: 5,
        perSeatNote: '$5/mo credit card minimum + metered VM/IPv4 fees',
        includedSummary: '$2/mo per dedicated IPv4, metered regional egress ($0.02–$0.12/GB)',
      },
      pro: {
        tierId: 'pro',
        tierName: 'Launch',
        audience: 'Production apps needing email support',
        monthlyPrice: 29,
        perSeatNote: 'flat plan fee + 100% metered compute/RAM/volume costs',
        includedSummary: 'Includes $29 compute credit, standard email support (no uptime SLA)',
      },
      team: {
        tierId: 'team',
        tierName: 'Scale',
        audience: 'High-traffic apps needing SOC2 & faster support',
        monthlyPrice: 199,
        perSeatNote: 'base platform fee + metered compute & $50/mo per SOC2 artifact',
        includedSummary: 'Priority email support, HIPAA BAA available, 5-day log retention',
        diff: {
          daysAgo: 5,
          dateLabel: 'Changed 5d ago',
          previousValue: 'Free GPU Reservations',
          currentValue: 'GPU Regions Sunset / Restricted',
          changeType: 'limit_cut',
          reason: 'Fly.io scaled back self-serve serverless GPU availability across secondary regions, requiring manual capacity commitments for A100/L40S workloads.',
          sourceUrl: 'https://fly.io/docs/gpus/',
          sourceTitle: 'Fly.io GPU Documentation & Regional Availability Notice',
          impactLevel: 'Medium',
        },
      },
      enterprise: {
        tierId: 'enterprise',
        tierName: 'Enterprise',
        audience: 'Custom volume commitments',
        monthlyPrice: 2000,
        customLabel: 'From $2,000',
        perSeatNote: 'annual minimum spend commitment',
        includedSummary: '99.99% SLA, SAML SSO, dedicated Slack channel',
      },
    },
    pricingHistory: [
      { month: 'May 26', starter: 5, pro: 24, team: 149, enterprise: 2000 },
      { month: 'Jun 26', starter: 5, pro: 24, team: 149, enterprise: 2000 },
      { month: 'Jul 26', starter: 5, pro: 24, team: 149, enterprise: 2000 },
      { month: 'Aug 26', starter: 5, pro: 29, team: 199, enterprise: 2000 },
      { month: 'Sep 26', starter: 5, pro: 29, team: 199, enterprise: 2000 },
      { month: 'Oct 26', starter: 5, pro: 29, team: 199, enterprise: 2000, note: 'Launch ($29) & Scale ($199) base plans + GPU reservations restricted' },
    ],
    features: {
      'feat-bandwidth': {
        value: '0 GB included ($0.02/GB NA/EU, $0.12/GB APAC/IN)',
        advantage: 'ours',
        detailNote: 'Every single byte of outbound traffic is metered from GB #1',
      },
      'feat-build-mins': {
        value: 'Remote Docker Builder VM (50 GB limit, frequent cache evictions)',
        advantage: 'ours',
        detailNote: 'No full Git-native PR preview workflow with automatic status checks',
      },
      'feat-cold-start': {
        value: '~15ms Firecracker Machine wake',
        advantage: 'neutral',
        detailNote: 'Strong bare-metal Firecracker architecture comparable to NexusCloud',
      },
      'feat-postgres': {
        value: 'Unmanaged Fly Postgres (Self-managed Stolon/Repmgr app)',
        advantage: 'ours',
        detailNote: 'Fly explicitly warns their Postgres is NOT a managed database—no automated failover SLA',
        diff: {
          daysAgo: 6,
          dateLabel: 'Changed 6d ago',
          previousValue: 'Supabase Preview Default',
          currentValue: 'Unmanaged Fly PG / 3rd Party',
          changeType: 'limit_cut',
          reason: 'Fly.io reiterated in docs that Fly Postgres requires customer-managed backups and recovery during host hardware failures.',
          sourceUrl: 'https://fly.io/docs/postgres/',
          sourceTitle: 'Fly.io Docs: "What Fly Postgres Is Not"',
          impactLevel: 'High Sales Impact',
        },
      },
      'feat-sso': {
        value: 'Enterprise Custom Contract Only',
        advantage: 'ours',
        detailNote: 'Only Google/GitHub OAuth on Launch ($29) and Scale ($199) plans',
      },
      'feat-ddos-waf': {
        value: 'Anycast L3/L4 DDoS; No Managed L7 OWASP WAF',
        advantage: 'ours',
        detailNote: 'Requires placing Cloudflare or Fastly in front of Fly Anycast IPs',
      },
      'feat-byoc-vpc': {
        value: '6PN WireGuard Mesh (AWS PrivateLink Enterprise-only)',
        advantage: 'ours',
        detailNote: 'WireGuard tunnels require manual key rotation and routing maintenance',
      },
      'feat-hipaa-soc2': {
        value: 'Available on Scale ($199/mo base)',
        advantage: 'neutral',
        detailNote: 'Good compliance posture for mid-tier plans, though lacks Okta SCIM',
      },
      'feat-ai-gateway': {
        value: 'Not Included',
        advantage: 'ours',
        detailNote: 'Pure compute primitive—no application-layer LLM gateway or token caching',
      },
      'feat-gpu-workers': {
        value: 'Restricted Regional Capacity (ORD/IAD only)',
        advantage: 'ours',
        detailNote: 'Self-serve L40S/A100 pools frequently exhausted or deprecated',
      },
      'feat-observability': {
        value: '2-day Quicksearch Logs (Managed Grafana limited)',
        advantage: 'ours',
        detailNote: 'Teams must run their own Vector/Logstash shipper VM to retain logs >48h',
      },
      'feat-support-sla': {
        value: 'No Uptime SLA on Launch ($29) or Scale ($199)',
        advantage: 'ours',
        detailNote: 'Financially backed SLA requires $2,000+/mo Enterprise tier',
      },
    },
    battlecard: {
      executiveSummary:
        'Fly.io appeals to systems-minded developers who love Firecracker MicroVMs and CLI control (`flyctl`). However, VP Engineering and CTO buyers frequently churn off Fly.io due to unmanaged Postgres outages, host hardware incidents without automated volume migration, and bare-bones team RBAC/WAF.',
      targetSweetSpot:
        'Win against Fly.io whenever the buyer needs a truly managed HA Postgres database, predictable team governance (Okta SSO, L7 WAF, 30-day logs), and financially backed 99.99% uptime SLA.',
      killPoints: [
        {
          id: 'fk-1',
          title: 'Truly Managed HA Postgres vs. Fly’s "Do-It-Yourself" Postgres',
          proofMetric: 'Automated Failover + PITR Included',
          talkingPoint:
            'Fly.io’s own documentation warns that "Fly Postgres is NOT a managed database"—if a physical NVMe host dies, your engineering team has to manually rebuild replicas from snapshots at 3 AM. NexusCloud provides fully managed HA Postgres with zero-downtime failover and point-in-time recovery.',
          featureRef: 'Managed HA Postgres & PR Branching',
        },
        {
          id: 'fk-2',
          title: 'Same <12ms Firecracker Speed—With Enterprise Guardrails',
          proofMetric: '<12ms Wake + 99.99% SLA + L7 WAF',
          talkingPoint:
            'Engineers choose Fly.io for Firecracker MicroVMs, and NexusCloud uses the exact same Firecracker isolation under the hood—meaning zero sacrifice on <12ms cold starts, while adding managed L7 WAF, 30-day OpenTelemetry retention, and a 99.99% SLA.',
          featureRef: 'Edge & Container Cold Start Latency',
        },
        {
          id: 'fk-3',
          title: '1 TB Included Bandwidth vs. Metered From Byte #1',
          proofMetric: '1 TB Included vs. 0 GB on Fly.io',
          talkingPoint:
            'Fly.io includes 0 GB of free bandwidth and charges $2/mo per dedicated IPv4 address plus up to $0.12/GB in APAC. NexusCloud Pro includes 1 TB of global Anycast bandwidth and free dedicated endpoints.',
          featureRef: 'Included Pro Egress & Overage Rate',
        },
      ],
      landmines: [
        {
          id: 'fl-1',
          title: 'Low $5–$29 Entry Price for Tiny Side Projects',
          honestGap:
            'Solo hackers running a single 256MB Go binary can pay ~$5/mo on Fly.io Pay-As-You-Go.',
          pivotStrategy:
            'Remind the prospect that NexusCloud Starter is $0/mo (with 150 GB free bandwidth and no $2/mo IPv4 fee), and for commercial teams, engineer on-call hours spent babysitting unmanaged Fly volumes dwarf a $19 seat fee.',
        },
        {
          id: 'fl-2',
          title: 'Deep WireGuard 6PN Mesh Customization',
          honestGap:
            'Systems engineers enjoy tinkering with raw IPv6 WireGuard peerings via `flyctl`.',
          pivotStrategy:
            'Highlight that NexusCloud also exposes a native WireGuard & Tailscale mesh CLI (`nexus tunnel`), plus one-click AWS PrivateLink so DevOps doesn’t have to rotate peer keys manually.',
        },
      ],
      presetObjections: [
        {
          id: 'fo-1',
          objection: 'Our backend engineers love Fly.io Machines because we can place Docker containers close to users in 30+ regions.',
          rebuttal:
            'NexusCloud runs on the exact same Firecracker MicroVM hypervisor architecture across 38 global Anycast edge locations, delivering <12ms wake times and full Dockerfile compatibility. Where teams hit a wall with Fly.io is Day-2 operations: Fly’s local NVMe volumes don’t automatically migrate when a physical host fails, and their Postgres is self-managed. With NexusCloud, your engineers keep the instant global MicroVM developer experience while gaining automated cross-host volume replication, managed HA Postgres, and a 99.99% SLA.',
          proofCitation: 'Managed HA Postgres & 99.99% Uptime SLA rows',
        },
      ],
    },
  },
];

export const INITIAL_RADAR_EVENTS: RadarChangeEvent[] = [
  {
    id: 'rad-1',
    competitorId: 'vercel',
    competitorName: 'Vercel',
    detectedDate: 'Oct 29, 2026',
    daysAgo: 2,
    headline: 'Unbundled Observability Plus & Log Drains, Raising Effective Team Seat Cost by 30%',
    summary:
      'Vercel updated its Pro/Team packaging so real-time Log Drains ($60/mo per project group) and 30-day Observability Plus queries are metered separately, pushing typical multi-service team spend from $50/seat to $65/seat.',
    severity: 'High Sales Impact',
    category: 'Packaging Change',
    beforeValue: '$50/seat effective (Drains bundled in Team pack)',
    afterValue: '$65/seat effective (+$60/mo Log Drains + per-M event metering)',
    affectedTier: 'team',
    sourceUrl: 'https://vercel.com/docs/pricing/manage-and-optimize-usage',
    sourceTitle: 'Vercel Billing Docs: Observability & Drain Metering',
    recommendedAction:
      'Filter CRM for all open Vercel displacement deals >10 seats and send the 30-Day Free OpenTelemetry Log Retention comparison sheet.',
  },
  {
    id: 'rad-2',
    competitorId: 'render',
    competitorName: 'Render',
    detectedDate: 'Oct 28, 2026',
    daysAgo: 3,
    headline: 'Hiked Professional ($19 -> $25) & Organization ($29 -> $39) Per-User Seat Prices by up to 34%',
    summary:
      'Render increased workspace seat fees across both self-serve commercial tiers without increasing the 500 build-minute monthly quota or bundling instance compute.',
    severity: 'High Sales Impact',
    category: 'Pricing Shift',
    beforeValue: 'Pro $19/user/mo · Organization $29/user/mo',
    afterValue: 'Pro $25/user/mo (+31.5%) · Organization $39/user/mo (+34.4%)',
    affectedTier: 'pro',
    sourceUrl: 'https://render.com/pricing',
    sourceTitle: 'Render Official Pricing Page (Oct 2026 Snapshot)',
    recommendedAction:
      'Launch outbound sequence to Series A/B CTOs on Render offering 6 months of price-locked NexusCloud Pro at $19/seat + free `render.yaml` migration.',
  },
  {
    id: 'rad-3',
    competitorId: 'nexuscloud',
    competitorName: 'NexusCloud (Our Product)',
    detectedDate: 'Oct 27, 2026',
    daysAgo: 4,
    headline: 'Doubled Included Pro Bandwidth from 500 GB to 1 TB at $19/seat',
    summary:
      'We expanded our baseline Pro tier transfer allowance to 1 TB/mo with $0.04/GB overages, matching Vercel’s 1 TB base while beating their overage rate by 73% and doubling Render’s 500 GB quota.',
    severity: 'High Sales Impact',
    category: 'Feature Launch',
    beforeValue: '500 GB included egress ($19/seat)',
    afterValue: '1 TB included egress ($19/seat) + $0.04/GB overages',
    affectedTier: 'pro',
    sourceUrl: 'https://nexuscloud.dev/changelog/2026-10-bandwidth-expansion',
    sourceTitle: 'NexusCloud Oct 2026 Product Release Notes',
    recommendedAction:
      'Update all active ROI calculators and attach the new 1 TB Pro baseline to Q4 renewal proposals.',
  },
  {
    id: 'rad-4',
    competitorId: 'vercel',
    competitorName: 'Vercel',
    detectedDate: 'Oct 26, 2026',
    daysAgo: 5,
    headline: 'Increased APAC & South America Edge Data Transfer Multipliers to $0.18/GB',
    summary:
      'Vercel adjusted regional Fast Data Transfer rates outside North America/Europe, increasing egress costs for globally distributed SaaS and e-commerce applications serving Singapore, Tokyo, Sydney, and São Paulo.',
    severity: 'High Sales Impact',
    category: 'Pricing Shift',
    beforeValue: '$0.12/GB APAC regional overage',
    afterValue: '$0.18/GB APAC regional overage (+50%)',
    affectedTier: 'pro',
    sourceUrl: 'https://vercel.com/pricing',
    sourceTitle: 'Vercel Regional Edge Network Pricing Schedule',
    recommendedAction:
      'Highlight NexusCloud’s flat $0.04/GB global Anycast rate (zero APAC/LATAM regional surcharge) in international opportunities.',
  },
  {
    id: 'rad-5',
    competitorId: 'flyio',
    competitorName: 'Fly.io',
    detectedDate: 'Oct 25, 2026',
    daysAgo: 6,
    headline: 'Restricted Self-Serve Serverless GPU Regions & Updated Unmanaged Postgres Advisory',
    summary:
      'Fly.io consolidated on-demand GPU pools into limited US hubs and updated its Postgres documentation to emphasize that customers must manage their own backup and failover automation.',
    severity: 'Medium',
    category: 'Limit Reduction',
    beforeValue: 'Multi-region self-serve GPU pools & bundled PG defaults',
    afterValue: 'Restricted GPU availability + explicit unmanaged PG disclaimer',
    affectedTier: 'team',
    sourceUrl: 'https://fly.io/docs/postgres/',
    sourceTitle: 'Fly.io Documentation: GPU & Postgres Operational Notice',
    recommendedAction:
      'Position NexusCloud Serverless L40S/H100 GPUs and fully managed HA Postgres with automated failover to AI engineering prospects.',
  },
  {
    id: 'rad-6',
    competitorId: 'render',
    competitorName: 'Render',
    detectedDate: 'Oct 18, 2026',
    daysAgo: 13,
    headline: 'Reduced Bandwidth Overage Rate from $0.15/GB to $0.10/GB Across Commercial Plans',
    summary:
      'Ahead of its seat price hike, Render lowered per-GB bandwidth overages above 500 GB from $0.15/GB to $0.10/GB.',
    severity: 'Medium',
    category: 'Pricing Shift',
    beforeValue: '$0.15/GB ($15 per 100 GB block)',
    afterValue: '$0.10/GB ($10 per 100 GB block)',
    affectedTier: 'pro',
    sourceUrl: 'https://render.com/changelog',
    sourceTitle: 'Render Pricing Changelog: Bandwidth Overage Update',
    recommendedAction:
      'Pre-empt Render reps by showing that NexusCloud includes 1 TB (vs Render’s 500 GB) and charges $0.04/GB (still 60% cheaper than Render’s new rate).',
  },
  {
    id: 'rad-7',
    competitorId: 'vercel',
    competitorName: 'Vercel',
    detectedDate: 'Oct 09, 2026',
    daysAgo: 22,
    headline: 'Enforced $10/Seat Monthly Add-On for Comment-Only Preview Deployment Reviewers',
    summary:
      'Product managers, QA testers, and designers commenting on preview URLs above the free threshold now require paid viewer/reviewer seats on Pro teams.',
    severity: 'Low',
    category: 'Packaging Change',
    beforeValue: 'Unlimited preview toolbar collaborators in grace period',
    afterValue: '$10/seat/mo enforced for additional Preview Reviewers',
    affectedTier: 'pro',
    sourceUrl: 'https://vercel.com/pricing',
    sourceTitle: 'Vercel Team Seats & Preview Access Policy',
    recommendedAction:
      'Remind prospects that NexusCloud includes unlimited free Read & Preview Reviewer seats for PMs and designers.',
  },
];

export interface ScanPreset {
  name: string;
  url: string;
  tagline: string;
  rawSnippet: string;
}

export const SCAN_PRESETS: ScanPreset[] = [
  {
    name: 'Railway',
    url: 'https://railway.com/pricing',
    tagline: 'Instant Cloud Infrastructure & Usage-Based Container PaaS',
    rawSnippet: `Railway Pricing (Oct 2026):
- Hobby Plan: $5/mo (includes $5 usage credit, single developer, 8 GB RAM / 8 vCPU per service limit).
- Pro Plan: $20/seat/mo (recently shifted from flat team credit to $20/seat + metered usage: $10/GB RAM/mo, $20/vCPU/mo, $0.05/GB egress).
- Enterprise Plan: Custom from $1,000/mo (includes SAML SSO, HIPAA BAA, 99.95% SLA, dedicated support, BYOC).
- Changelog: Tightened fair-use egress throttling and removed legacy execution fee waiver for multi-seat workspaces.`,
  },
  {
    name: 'Cloudflare Workers & Pages',
    url: 'https://workers.cloudflare.com',
    tagline: 'Global V8 Isolate Edge Network, D1 SQLite & R2 Object Storage',
    rawSnippet: `Cloudflare Workers Paid Plan (Oct 2026):
- Free Tier: $0/mo (100k req/day, 10ms CPU limit per invocation, no traditional Docker containers).
- Workers Paid: $5/mo base + usage ($0.30 per million requests, $0.02 per million CPU-ms, zero egress fees on R2).
- Enterprise Edge: $3,000+/mo custom contract (SAML SSO, Bot Management, 100% uptime SLA, Enterprise Logpush).
- Changelog: Containers on Cloudflare entered gated beta with regional memory limits; D1 database size capped at 10 GB per SQLite instance.`,
  },
  {
    name: 'DigitalOcean App Platform',
    url: 'https://www.digitalocean.com/pricing/app-platform',
    tagline: 'Managed PaaS on DigitalOcean Droplets & Managed Databases',
    rawSnippet: `DigitalOcean App Platform (Oct 2026):
- Starter Tier: $0/mo (3 static sites only; dynamic containers start at $5–$12/mo per basic instance).
- Professional Tier: $12 to $39/mo per container instance + $15/mo Managed Postgres base (100 GB bandwidth per app, $0.01–$0.02/GB overage).
- Enterprise / Premium Support: $999+/mo (99.95% SLA, dedicated TAM, no native SAML SCIM on standard teams).
- Changelog: Increased Basic & Dedicated CPU Droplet/App container rates by 14% across North America & EU regions.`,
  },
];
