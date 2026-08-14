import { LayoutGrid, MoveRight, Palette, CalendarClock, Users, Zap } from "lucide-react";
export const FEATURES = [
  {
    icon: LayoutGrid,
    accent: '#4C5FD5',
    title: 'Workspaces',
    desc: 'Group boards by team, client, or project so nothing gets lost in a single messy list.',
  },
  {
    icon: MoveRight,
    accent: '#17C3B2',
    title: 'Drag, don\u2019t retype',
    desc: 'Move a card between lists with one drag. The board updates instantly \u2014 no save button, no refresh.',
  },
  {
    icon: Palette,
    accent: '#E8A33D',
    title: 'Color-coded lists',
    desc: 'Give every stage of your workflow its own color, so status is visible before you read a single word.',
  },
  {
    icon: CalendarClock,
    accent: '#C4453D',
    title: 'Due dates that nudge',
    desc: 'Cards flag themselves as they approach their due date, so nothing quietly slips.',
  },
  {
    icon: Users,
    accent: '#8A5CF6',
    title: 'Invite your team',
    desc: 'Bring collaborators into a workspace in seconds. Everyone sees the same board, updated live.',
  },
  {
    icon: Zap,
    accent: '#4C5FD5',
    title: 'Built for speed',
    desc: 'Every action \u2014 add, move, rename, delete \u2014 happens in place. No page loads between thoughts.',
  },
];

export const STEPS = [
  {
    n: '01',
    title: 'Capture',
    desc: 'The moment a task comes up, add a card. No context switching to another app first.',
  },
  {
    n: '02',
    title: 'Organize',
    desc: 'Drag it into the list where it belongs. Rename lists, recolor them, reorder as your workflow shifts.',
  },
  {
    n: '03',
    title: 'Ship',
    desc: 'Watch the board clear as work gets done \u2014 and see exactly what\u2019s next without asking anyone.',
  },
];

export const TESTIMONIALS = [
  {
    quote:
      'We used to lose a full standup just figuring out what everyone was working on. Now the board answers that before we even sit down.',
    name: 'Priya N.',
    role: 'Engineering Manager',
  },
  {
    quote:
      'I run four client projects solo. Separate workspaces for each one is the difference between organized and underwater.',
    name: 'Marcus O.',
    role: 'Freelance Designer',
  },
  {
    quote:
      'The color-coded lists sound small until you\u2019re scanning a board at a glance and just \u2014 know. It changed how fast we move.',
    name: 'Sana K.',
    role: 'Operations Lead',
  },
];

export const FAQS = [
  {
    q: 'Do I need a credit card to start?',
    a: 'No. The free plan is free to use for as long as you want \u2014 no card required, no trial countdown.',
  },
  {
    q: 'Can I invite people who aren\u2019t on my team yet?',
    a: 'Yes. Send an invite to any email address and they\u2019ll get access to that workspace as soon as they accept.',
  },
  {
    q: 'What happens to my boards if I downgrade?',
    a: 'Nothing gets deleted. Boards and cards stay exactly as they are \u2014 some team features just become read-only.',
  },
  {
    q: 'Is there a limit to how many boards I can create?',
    a: 'Not on any plan. Create as many boards and lists as your work actually needs.',
  },
];