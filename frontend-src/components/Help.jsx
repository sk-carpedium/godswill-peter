import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  Rocket,
  Layout,
  Calendar,
  MessageSquare,
  BarChart3,
  Zap,
  Users,
  DollarSign,
  Settings,
  HelpCircle,
  Search,
  ChevronRight,
  BookOpen,
  Play,
  Check,
  ArrowRight,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    gradient: 'from-blue-500 to-cyan-500',
    subsections: [
      {
        title: 'Account Setup',
        content: [
          'Sign up easily with your email or social accounts',
          'Complete your profile by adding your name and setting a strong password'
        ]
      },
      {
        title: 'Workspace Creation',
        content: [
          'Upon first login, create your first workspace - your central hub for brands and social accounts',
          'Give your workspace a meaningful name (e.g., "My Marketing Agency" or "BrandX Digital")'
        ]
      },
      {
        title: 'Connecting Social Accounts',
        content: [
          'Navigate to "Settings" → "Connected Accounts" to link your profiles',
          'Follow on-screen prompts to authorize access securely'
        ]
      }
    ]
  },
  {
    id: 'onboarding',
    title: 'Onboarding Flow',
    icon: Play,
    gradient: 'from-violet-500 to-purple-500',
    subsections: [
      {
        title: 'Guided Tutorials',
        content: [
          'AI Content Generation: Craft engaging posts with AI assistance',
          'Advanced Analytics: Interpret AI-powered insights for better decisions',
          'Smart Inbox: Manage all customer interactions from one place',
          'Automations: Set up rules to automate repetitive tasks'
        ]
      },
      {
        title: 'Contextual Help',
        content: [
          'Look for ? icons throughout the app',
          'Hover or click for instant explanations and tips',
          'Always have help at your fingertips'
        ]
      }
    ]
  },
  {
    id: 'navigation',
    title: 'Navigation',
    icon: Layout,
    gradient: 'from-emerald-500 to-teal-500',
    subsections: [
      {
        title: 'Web App Sidebar',
        content: [
          'Dashboard: Central overview of metrics and activities',
          'Content: Content calendar, post composer, media library',
          'Inbox: Manage all social conversations',
          'Analytics: Detailed performance reports',
          'Automations: Configure automated workflows',
          'Settings: Profile, workspace, and account management'
        ]
      },
      {
        title: 'Mobile Navigation',
        content: [
          'Bottom bar: Quick access to Dashboard, Content, Inbox, Analytics',
          'Tap "More" to access all features in a slide-out drawer',
          'Quick access buttons for immediate actions'
        ]
      }
    ]
  },
  {
    id: 'content',
    title: 'Content Management',
    icon: Calendar,
    gradient: 'from-[#d4af37] to-[#f4cf47]',
    subsections: [
      {
        title: 'AI Content Generation',
        content: [
          'Provide a prompt and AI generates engaging copy, hashtags, and suggestions',
          'Content tailored to your chosen platforms and brand voice'
        ]
      },
      {
        title: 'Post Composer',
        content: [
          'Powerful editor to draft, edit, and preview posts',
          'Attach media, add links, mentions, and hashtags',
          'Customize content for different platforms in one interface'
        ]
      },
      {
        title: 'Content Calendar',
        content: [
          'Visually plan and schedule posts with interactive calendar',
          'Drag and drop to reschedule',
          'Filter by status: Draft, Scheduled, Published, Failed'
        ]
      },
      {
        title: 'Media Library',
        content: [
          'Store and organize images, videos, and media assets'
        ]
      }
    ]
  },
  {
    id: 'inbox',
    title: 'Inbox & Conversations',
    icon: MessageSquare,
    gradient: 'from-pink-500 to-rose-500',
    subsections: [
      {
        title: 'Unified Inbox',
        content: [
          'All interactions from connected accounts in one stream',
          'Messages, comments, and mentions centralized'
        ]
      },
      {
        title: 'AI-Suggested Replies',
        content: [
          'AI analyzes messages and suggests contextual replies',
          'Respond faster and more effectively'
        ]
      },
      {
        title: 'Priority Sorting',
        content: [
          'Automatically highlights important conversations',
          'Address critical interactions first'
        ]
      },
      {
        title: 'Conversation View',
        content: [
          'View full threads, respond, and assign to team members',
          'Change status: New, Open, Resolved'
        ]
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    gradient: 'from-orange-500 to-amber-500',
    subsections: [
      {
        title: 'Performance Tracking',
        content: [
          'Monitor reach, engagement, impressions, clicks, and conversions',
          'Track metrics across all platforms'
        ]
      },
      {
        title: 'Predictive Insights',
        content: [
          'AI forecasts future performance and identifies trends',
          'Recommends optimal posting times'
        ]
      },
      {
        title: 'Benchmarking',
        content: [
          'Compare performance against industry standards',
          'Identify areas for improvement'
        ]
      },
      {
        title: 'Audience Demographics',
        content: [
          'Understand who your audience is and their interests',
          'See how they interact with your content'
        ]
      },
      {
        title: 'Export Reports',
        content: [
          'Download custom reports for presentations and analysis'
        ]
      }
    ]
  },
  {
    id: 'automations',
    title: 'Automations',
    icon: Zap,
    gradient: 'from-indigo-500 to-blue-500',
    subsections: [
      {
        title: 'Auto-Posting',
        content: [
          'Schedule posts to publish automatically at optimal times'
        ]
      },
      {
        title: 'Smart Replies',
        content: [
          'Set up rules for AI to respond to common questions automatically'
        ]
      },
      {
        title: 'Workflow Automation',
        content: [
          'Create custom triggers and actions',
          'Example: "If mention contains \'crisis\', send alert to admin"'
        ]
      },
      {
        title: 'Content Recycling',
        content: [
          'Automatically repost evergreen content that performed well'
        ]
      }
    ]
  },
  {
    id: 'team',
    title: 'Team Collaboration',
    icon: Users,
    gradient: 'from-green-500 to-emerald-500',
    subsections: [
      {
        title: 'Roles & Permissions',
        content: [
          'Assign roles: Admin, Editor, Analyst',
          'Granular permissions to control feature access'
        ]
      },
      {
        title: 'Workflow Approvals',
        content: [
          'Implement approval flows for posts and campaigns',
          'Ensure brand consistency and compliance'
        ]
      },
      {
        title: 'Task Management',
        content: [
          'Assign tasks for content creation, moderation, or strategy',
          'Track progress and deadlines'
        ]
      },
      {
        title: 'Team Discussions',
        content: [
          'Collaborate on specific posts or campaigns within the platform'
        ]
      }
    ]
  },
  {
    id: 'monetization',
    title: 'Monetization & Creator Economy',
    icon: DollarSign,
    gradient: 'from-yellow-500 to-orange-500',
    subsections: [
      {
        title: 'Revenue Tracking',
        content: [
          'Monitor earnings from sponsored posts, affiliates, and brand deals',
          'Track ad revenue across platforms'
        ]
      },
      {
        title: 'Brand Deal Management',
        content: [
          'Track brand partnerships, deliverables, and payment structures'
        ]
      },
      {
        title: 'Profitability Analysis',
        content: [
          'AI predicts revenue potential of your content',
          'Suggests monetization strategies'
        ]
      },
      {
        title: 'ROI Calculator',
        content: [
          'Measure return on investment for campaigns'
        ]
      }
    ]
  },
  {
    id: 'settings',
    title: 'Settings & Customization',
    icon: Settings,
    gradient: 'from-slate-500 to-gray-500',
    subsections: [
      {
        title: 'Profile Settings',
        content: [
          'Update personal information, password, notifications'
        ]
      },
      {
        title: 'Workspace Settings',
        content: [
          'Configure brand colors, default language, timezones',
          'Workspace-wide preferences'
        ]
      },
      {
        title: 'Connected Accounts',
        content: [
          'Manage all linked social media profiles'
        ]
      },
      {
        title: 'Sidebar Customization',
        content: [
          'Reorder and hide navigation items',
          'Prioritize features you use most'
        ]
      },
      {
        title: 'Appearance',
        content: [
          'Switch between light and dark themes'
        ]
      }
    ]
  },
  {
    id: 'support',
    title: 'Help & Support',
    icon: HelpCircle,
    gradient: 'from-red-500 to-pink-500',
    subsections: [
      {
        title: 'Contextual Help',
        content: [
          'Hover or click ? icons for immediate assistance',
          'Feature-specific help on every screen'
        ]
      },
      {
        title: 'Help Center',
        content: [
          'Comprehensive knowledge base with articles and FAQs',
          'Video tutorials and guides'
        ]
      },
      {
        title: 'Customer Support',
        content: [
          'Reach out via "Customer Support" for personalized assistance',
          'Fast response times from our expert team'
        ]
      }
    ]
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState(sections[0].id);

  const filteredSections = sections.filter((section) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(query) ||
      section.subsections.some((sub) =>
        sub.title.toLowerCase().includes(query) ||
        sub.content.some((c) => c.toLowerCase().includes(query))
      )
    );
  });

  const currentSection = sections.find((s) => s.id === selectedSection);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-6 mb-8 rounded-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTZ2MkgyNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-6">
            <BookOpen className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-medium">Comprehensive Guide</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
            SocialHub User Guide
          </h1>
          <p className="text-lg text-slate-300 mb-8">
            Everything you need to master your social media management
          </p>
          
          {/* Search */}
          <div className="relative max-w-2xl mx-auto z-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search for topics, features, or help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-slate-400 rounded-xl text-lg relative z-10"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px,1fr] gap-6 lg:gap-8">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <nav className="space-y-1">
                  {filteredSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = selectedSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSection(section.id)}
                        type="button"
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer relative z-10",
                          isActive
                            ? "bg-gradient-to-r from-[#d4af37]/10 to-[#f4cf47]/10 text-[#d4af37] shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isActive && "text-[#d4af37]")} />
                        <span className="flex-1 text-left">{section.title}</span>
                        {isActive && <ChevronRight className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Mobile Section Selector */}
        <div className="lg:hidden">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-4">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                const isActive = selectedSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setSelectedSection(section.id)}
                    className={cn(
                      "flex-shrink-0 gap-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3",
                      isActive 
                        ? "bg-gradient-to-r from-[#d4af37] to-[#f4cf47] text-slate-950 shadow hover:from-[#c49f2f] hover:to-[#e4bf37]"
                        : "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {section.title}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {currentSection && (
            <>
              {/* Section Header */}
              <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200/50 overflow-hidden">
                <div className={cn(
                  "absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-10 rounded-full blur-3xl pointer-events-none",
                  `from-${currentSection.gradient.split('-')[1]} to-${currentSection.gradient.split('-')[3]}`
                )} />
                <CardHeader className="relative">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                      currentSection.gradient
                    )}>
                      <currentSection.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">{currentSection.title}</CardTitle>
                      <p className="text-slate-600 dark:text-slate-400">
                        {currentSection.subsections.length} topics
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Subsections */}
              <div className="space-y-4">
                {currentSection.subsections.map((subsection, idx) => (
                  <Card key={idx} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full bg-gradient-to-r",
                          currentSection.gradient
                        )} />
                        {subsection.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {subsection.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                            <Check className={cn(
                              "w-5 h-5 mt-0.5 flex-shrink-0",
                              currentSection.gradient.includes('d4af37') ? "text-[#d4af37]" : "text-green-500"
                            )} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Help Resources */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-[#d4af37] to-[#f4cf47] text-slate-950 border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTZ2MkgyNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30 pointer-events-none" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-950/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Live Support Chat</h3>
                        <p className="text-sm text-slate-800">Get instant help via WhatsApp</p>
                      </div>
                    </div>
                    <a href={`https://wa.me/1234567890?text=Hi, I need help with SocialHub`} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-slate-950 hover:bg-slate-800 text-white">
                        Chat on WhatsApp
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600 to-blue-500 text-white border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTZ2MkgyNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30 pointer-events-none" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Email Support</h3>
                        <p className="text-sm text-blue-100">Send us a detailed message</p>
                      </div>
                    </div>
                    <a href="mailto:support@socialhub.com?subject=Support Request&body=Hi, I need help with...">
                      <Button className="w-full bg-white hover:bg-blue-50 text-blue-600">
                        Send Email
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {filteredSections.length === 0 && (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-600">Try searching with different keywords</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}