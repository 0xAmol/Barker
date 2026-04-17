// Mock data for development

import { ActivityEvent, Lead, AgentStats, DemandAlert, DraftedReply } from '../types/activity';

// Generate mock activity events
export const generateMockActivities = (): ActivityEvent[] => {
  const now = new Date();

  return [
    {
      id: '1',
      type: 'sms_sent',
      timestamp: new Date(now.getTime() - 5000),
      title: 'SMS sent to Dave',
      subtitle: 'New lead: Sarah M. needs kitchen sink repair',
      details: {
        to: '(832) 555-0147',
        leadName: 'Sarah M.',
        service: 'Kitchen sink leak',
      },
      expandable: true,
    },
    {
      id: '2',
      type: 'lead_captured',
      timestamp: new Date(now.getTime() - 12000),
      title: 'Lead captured — Sarah M.',
      subtitle: 'Katy TX • Kitchen sink leak • Needs it today',
      details: {
        name: 'Sarah M.',
        location: 'Katy, TX',
        service: 'Kitchen sink leak',
        urgency: 'today',
        source: 'Katy TX Homeowners',
      },
      expandable: true,
    },
    {
      id: '3',
      type: 'reply_posted',
      timestamp: new Date(now.getTime() - 25000),
      title: 'Reply posted to group',
      subtitle: 'Katy TX Homeowners',
      details: {
        group: 'Katy TX Homeowners',
        reply: "Hey! I'm Dave with Johnson Plumbing — kitchen sink leaks are our bread and butter. We're in Katy and can usually get out same day. Happy to take a look, free estimate: barker.app/q/johnson-plumbing",
      },
      expandable: true,
    },
    {
      id: '4',
      type: 'reply_drafted',
      timestamp: new Date(now.getTime() - 32000),
      title: 'Reply drafted for you to post',
      subtitle: '"Hey! I\'m Dave with Johnson Plumbing..."',
      expandable: false,
    },
    {
      id: '5',
      type: 'post_analyzed',
      timestamp: new Date(now.getTime() - 45000),
      title: 'Post analyzed — relevance 94%',
      subtitle: 'Intent: seeking service • Location: Katy',
      details: {
        relevance: 0.94,
        intent: 'seeking_service',
        locationHint: 'Katy',
        shouldEngage: true,
      },
      expandable: true,
    },
    {
      id: '6',
      type: 'demand_found',
      timestamp: new Date(now.getTime() - 60000),
      title: 'Demand signal found',
      subtitle: '"anyone know a good plumber? kitchen sink is leaking bad"',
      details: {
        postText: 'anyone know a good plumber? kitchen sink is leaking bad and I need someone today',
        author: 'Sarah M.',
        group: 'Katy TX Homeowners',
      },
      expandable: true,
    },
    {
      id: '7',
      type: 'group_scanned',
      timestamp: new Date(now.getTime() - 120000),
      title: 'Group scanned — Katy TX Homeowners',
      subtitle: '45K members • 23 new posts • 1 relevant',
      details: {
        groupName: 'Katy TX Homeowners',
        members: '45K',
        postsScanned: 23,
        relevantPosts: 1,
      },
      expandable: true,
    },
    {
      id: '8',
      type: 'group_scanned',
      timestamp: new Date(now.getTime() - 180000),
      title: 'Group scanned — Houston Home Owners',
      subtitle: '128K members • 67 new posts • 0 relevant',
      details: {
        groupName: 'Houston Home Owners',
        members: '128K',
        postsScanned: 67,
        relevantPosts: 0,
      },
      expandable: true,
    },
    {
      id: '9',
      type: 'agent_started',
      timestamp: new Date(now.getTime() - 240000),
      title: 'Barker started scanning',
      subtitle: 'Monitoring 5 Facebook groups',
      expandable: false,
    },
  ];
};

// Mock leads data
export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Sarah M.',
    phone: '(832) 555-0192',
    serviceNeeded: 'Kitchen sink leak',
    location: 'Katy, TX',
    urgency: 'today',
    source: 'Katy TX Homeowners',
    status: 'new',
    createdAt: new Date(Date.now() - 300000),
  },
  {
    id: '1a',
    name: 'James P.',
    phone: '(713) 555-0384',
    serviceNeeded: 'Water heater replacement',
    location: 'Heights, TX',
    urgency: 'this_week',
    source: 'Houston Home Owners',
    status: 'new',
    createdAt: new Date(Date.now() - 1320000), // 22m ago
  },
  {
    id: '1b',
    name: 'Angela R.',
    phone: '(832) 555-0729',
    serviceNeeded: 'Pipe burst emergency',
    location: 'Montrose, TX',
    urgency: 'today',
    source: 'West Houston Neighbors',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000), // 1h ago
  },
  {
    id: '2',
    name: 'Mike R.',
    phone: '(281) 555-0847',
    serviceNeeded: 'Water heater replacement',
    location: 'Sugar Land, TX',
    urgency: 'this_week',
    source: 'Sugar Land Recommendations',
    status: 'contacted',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    name: 'Jennifer L.',
    phone: '(713) 555-0293',
    serviceNeeded: 'Clogged drain',
    location: 'Houston Heights',
    urgency: 'today',
    source: 'Houston Home Owners',
    status: 'won',
    revenue: 285,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: '4',
    name: 'David K.',
    phone: '(832) 555-0471',
    serviceNeeded: 'Toilet repair',
    location: 'Katy, TX',
    urgency: 'this_week',
    source: 'Katy TX Homeowners',
    status: 'won',
    revenue: 175,
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: '5',
    name: 'Amanda T.',
    phone: '(281) 555-0628',
    serviceNeeded: 'Pipe leak in bathroom',
    location: 'Missouri City',
    urgency: 'this_month',
    source: 'West Houston Neighbors',
    status: 'lost',
    createdAt: new Date(Date.now() - 259200000),
    notes: 'Went with a cheaper quote',
  },
  {
    id: '6',
    name: 'Robert J.',
    phone: '(713) 555-0184',
    serviceNeeded: 'Garbage disposal install',
    location: 'Bellaire',
    urgency: 'flexible',
    source: 'Houston Home Owners',
    status: 'no_answer',
    createdAt: new Date(Date.now() - 345600000),
  },
];

// Mock stats
export const MOCK_STATS: AgentStats = {
  leadsThisWeek: 4,
  leadsThisMonth: 23,
  revenueThisWeek: 3400,
  revenueThisMonth: 5420,
  postsScanned: 847,
  repliesPosted: 12,
  conversionRate: 0.42,
  topSource: 'Katy TX Homeowners',
  agentStatus: 'active',
  lastRunAt: new Date(Date.now() - 120000),
  creditsRemaining: 47,
  wonThisWeek: 2,
};

// Mock demand alerts
export const MOCK_DEMAND_ALERTS: DemandAlert[] = [
  {
    id: 'da1',
    groupName: 'Katy TX Homeowners',
    postText: 'Anyone know a good plumber? My bathroom faucet is leaking pretty bad and I need someone who can come out today if possible.',
    authorName: 'Linda S.',
    suggestedReply: "Hey! I'm Dave with Johnson Plumbing — bathroom leaks are our bread and butter. We're in Katy and can usually get out same day. Happy to take a look, free estimate: barker.app/q/johnson-plumbing",
    timestamp: new Date(Date.now() - 300000),
    status: 'pending',
  },
  {
    id: 'da2',
    groupName: 'Sugar Land Recommendations',
    postText: 'Rec needed for plumber. Water heater is making weird noises and I want someone to check it before it dies on me.',
    authorName: 'Tom B.',
    suggestedReply: "Hey! I'm Dave with Johnson Plumbing — water heaters acting up can definitely be stressful. We service Sugar Land and can diagnose what's going on. Here's our page for a free estimate: barker.app/q/johnson-plumbing",
    timestamp: new Date(Date.now() - 1800000),
    status: 'pending',
  },
  {
    id: 'da3',
    groupName: 'Houston Home Owners',
    postText: 'Need plumber ASAP! Toilet is clogged and my plunger isn\'t working. Any recommendations for someone available today?',
    authorName: 'Chris M.',
    suggestedReply: "Hey! I'm Dave with Johnson Plumbing — clogged toilets that won't budge usually mean something's stuck deeper in the line. We can usually get out same day in the Houston area. Free estimate here: barker.app/q/johnson-plumbing",
    timestamp: new Date(Date.now() - 7200000),
    status: 'pending',
  },
];

// Mock credit transactions
export interface CreditTransaction {
  id: string;
  type: 'lead_charge' | 'top_up';
  description: string;
  amount: number; // positive for top-up, negative for charge
  timestamp: Date;
  leadName?: string;
  service?: string;
}

export const MOCK_CREDIT_BALANCE = 73.0;
export const MOCK_LAST_TOP_UP = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000); // 4 days ago

export const MOCK_CREDIT_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'ct1',
    type: 'lead_charge',
    description: 'Lead: Sarah M.',
    amount: -15,
    timestamp: new Date(Date.now() - 300000),
    leadName: 'Sarah M.',
    service: 'Kitchen sink leak',
  },
  {
    id: 'ct2',
    type: 'lead_charge',
    description: 'Lead: James P.',
    amount: -20,
    timestamp: new Date(Date.now() - 1320000),
    leadName: 'James P.',
    service: 'Water heater',
  },
  {
    id: 'ct3',
    type: 'top_up',
    description: 'Top up',
    amount: 100,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ct4',
    type: 'lead_charge',
    description: 'Lead: Mike R.',
    amount: -25,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    leadName: 'Mike R.',
    service: 'Pipe burst',
  },
  {
    id: 'ct5',
    type: 'lead_charge',
    description: 'Lead: Jennifer L.',
    amount: -15,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    leadName: 'Jennifer L.',
    service: 'Clogged drain',
  },
];

// Mock drafted replies
export const MOCK_DRAFTED_REPLIES: DraftedReply[] = [
  {
    id: 'dr1',
    demandAlertId: 'da1',
    groupName: 'Katy TX Homeowners',
    originalPost: 'Anyone know a good plumber? My bathroom faucet is leaking...',
    replyText: "Hey! I'm Dave with Johnson Plumbing — bathroom leaks are our bread and butter. We're in Katy and can usually get out same day. Happy to take a look, free estimate: barker.app/q/johnson-plumbing",
    status: 'pending',
    createdAt: new Date(Date.now() - 300000),
  },
  {
    id: 'dr2',
    demandAlertId: 'da2',
    groupName: 'Sugar Land Recommendations',
    originalPost: 'Rec needed for plumber. Water heater is making weird noises...',
    replyText: "Hey! I'm Dave with Johnson Plumbing — water heaters acting up can definitely be stressful. We service Sugar Land and can diagnose what's going on. Here's our page for a free estimate: barker.app/q/johnson-plumbing",
    status: 'pending',
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: 'dr3',
    demandAlertId: 'da3',
    groupName: 'Houston Home Owners',
    originalPost: 'Need plumber ASAP! Toilet is clogged...',
    replyText: "Hey! I'm Dave with Johnson Plumbing — clogged toilets that won't budge usually mean something's stuck deeper in the line. We can usually get out same day in the Houston area. Free estimate here: barker.app/q/johnson-plumbing",
    status: 'copied',
    createdAt: new Date(Date.now() - 7200000),
  },
];

// Generate a new activity event (for simulating live feed)
export const generateNewActivity = (): ActivityEvent => {
  const types: Array<{
    type: ActivityEvent['type'];
    title: string;
    subtitle: string;
  }> = [
    {
      type: 'group_scanned',
      title: 'Group scanned — Sugar Land Recommendations',
      subtitle: '32K members • 18 new posts • 0 relevant',
    },
    {
      type: 'group_scanned',
      title: 'Group scanned — West Houston Neighbors',
      subtitle: '67K members • 31 new posts • 0 relevant',
    },
    {
      type: 'demand_found',
      title: 'Demand signal found',
      subtitle: '"need a plumber ASAP, toilet is overflowing"',
    },
    {
      type: 'post_analyzed',
      title: 'Post analyzed — relevance 87%',
      subtitle: 'Intent: seeking service • Location: Houston',
    },
  ];

  const randomType = types[Math.floor(Math.random() * types.length)];

  return {
    id: Math.random().toString(36).substr(2, 9),
    type: randomType.type,
    timestamp: new Date(),
    title: randomType.title,
    subtitle: randomType.subtitle,
    expandable: true,
  };
};
