import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowRight, Check, Sparkles, Zap, BarChart3, Calendar, Users, Shield, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Landing() {
  const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'AI-powered content calendar that finds the perfect time to post'
  },
  {
    icon: Sparkles,
    title: 'AI Content Generation',
    description: 'Create engaging posts in seconds with advanced AI assistance'
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Track performance across all platforms with actionable insights'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with approval workflows'
  },
  {
    icon: Zap,
    title: 'Smart Automation',
    description: 'Automate repetitive tasks and save hours every week'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with SOC 2 compliance'
  }];


  const platforms = [
    {
      name: 'Instagram',
      category: 'Social',
      color: '#E1306C',
      features: ['Posts & Reels', 'Stories', 'DM Inbox', 'Analytics'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
    },
    {
      name: 'Facebook',
      category: 'Social',
      color: '#1877F2',
      features: ['Pages & Groups', 'Stories', 'Ads Manager', 'Insights'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    },
    {
      name: 'X (Twitter)',
      category: 'Social',
      color: '#000000',
      features: ['Tweets & Threads', 'Spaces', 'Analytics', 'DM Inbox'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    },
    {
      name: 'LinkedIn',
      category: 'Professional',
      color: '#0A66C2',
      features: ['Posts & Articles', 'Company Pages', 'Analytics', 'Messaging'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    },
    {
      name: 'TikTok',
      category: 'Video',
      color: '#010101',
      features: ['Short Videos', 'LIVE', 'Analytics', 'Comments'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
    },
    {
      name: 'YouTube',
      category: 'Video',
      color: '#FF0000',
      features: ['Videos & Shorts', 'Community Posts', 'Analytics', 'Comments'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    },
    {
      name: 'Pinterest',
      category: 'Visual',
      color: '#E60023',
      features: ['Pins & Boards', 'Idea Pins', 'Analytics', 'Shop'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>
    },
    {
      name: 'Threads',
      category: 'Social',
      color: '#000000',
      features: ['Text Posts', 'Replies', 'Reposts', 'Analytics'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.129-.73-1.818-1.857-1.818-3.336 0-1.501.697-2.748 1.98-3.549.932-.582 2.106-.873 3.408-.846.896.017 1.727.178 2.508.488v-.695c0-1.173-.394-2.02-1.174-2.522-.651-.418-1.527-.59-2.612-.518-1.256.085-2.29.423-3.074.998l-.546-1.938c.968-.684 2.297-1.134 3.952-1.243 1.443-.097 2.718.13 3.796.676 1.326.672 2.015 1.854 2.048 3.512v2.254c1.175.584 2.09 1.428 2.697 2.49.739 1.29.883 3.008-.235 4.855-1.26 2.082-3.5 3.136-6.848 3.213z"/></svg>
    },
    {
      name: 'Bluesky',
      category: 'Social',
      color: '#0085FF',
      features: ['Posts & Threads', 'Feeds', 'Analytics', 'Moderation'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.579 6.87-1.5 7.823-4.308.953 2.808 2.81 9.886 7.823 4.308 4.558-5.073 1.082-6.498-2.83-7.078-.14-.016-.277-.034-.415-.056.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/></svg>
    },
    {
      name: 'Google Business',
      category: 'Business',
      color: '#4285F4',
      features: ['Business Posts', 'Reviews', 'Q&A', 'Insights'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
    },
    {
      name: 'Twitch',
      category: 'Streaming',
      color: '#9146FF',
      features: ['Stream Schedule', 'Clips', 'Chat Moderation', 'Analytics'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
    },
    {
      name: 'Kick',
      category: 'Streaming',
      color: '#53FC18',
      features: ['Live Streams', 'VODs', 'Clips', 'Chat'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.45 3.73L12 11.63 4.55 7.91 12 4.18zM4 9.68l7 3.5v7.64l-7-3.5V9.68zm9 11.14v-7.64l7-3.5v7.64l-7 3.5z"/></svg>
    },
    {
      name: 'Rumble',
      category: 'Video',
      color: '#85C742',
      features: ['Videos', 'LIVE', 'Monetization', 'Analytics'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
    },
    {
      name: 'Truth Social',
      category: 'Social',
      color: '#5448EE',
      features: ['Truths', 'Re-Truths', 'Trending', 'Analytics'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm3.5 5.5l-3 3-3-3-1.5 1.5 3 3-3 3 1.5 1.5 3-3 3 3 1.5-1.5-3-3 3-3-1.5-1.5z"/></svg>
    },
    {
      name: 'Shopify',
      category: 'E-commerce',
      color: '#96BF48',
      features: ['Product Posts', 'Shop Analytics', 'Orders', 'Social Commerce'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M15.337 23.979l7.216-1.561S19.884 6.48 19.866 6.34c-.019-.141-.14-.221-.243-.231-.103-.009-2.244-.159-2.244-.159s-1.489-1.46-1.655-1.627v-.009l-.946 19.665zM12.571 7.026s-.984-.291-2.187-.291c-1.762 0-1.853 1.106-1.853 1.384 0 1.518 3.965 2.1 3.965 5.656 0 2.797-1.772 4.597-4.163 4.597-2.869 0-4.332-1.784-4.332-1.784l.766-2.531s1.509 1.297 2.784 1.297c.832 0 1.169-.656 1.169-1.134 0-1.985-3.253-2.072-3.253-5.337 0-2.747 1.969-5.406 5.934-5.406 1.528 0 2.284.438 2.284.438l-.914 3.111z"/></svg>
    },
    {
      name: 'Spotify',
      category: 'Audio',
      color: '#1DB954',
      features: ['Podcast Posts', 'Episode Links', 'Audience', 'Analytics'],
      svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
    },
  ];


  const stats = [
  { value: 'Thousands', label: 'Active Users' },
  { value: 'Millions', label: 'Scheduled Posts' },
  { value: '12+', label: 'Platforms Connected' },
  { value: '99.9%', label: 'Uptime' }];


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-800 to-[#d4af37]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/90 backdrop-blur-md border-b border-[#d4af37]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69630c5321dd411923f5e524/120b4afa8_logo.png"
              alt="Nexus Social"
              className="w-10 h-10 rounded-xl object-contain" />

            <span className="text-xl font-bold text-white">Nexus Social</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" className="text-white hover:text-[#d4af37] hover:bg-white/10">Sign In</Button>
            </Link>
            <Link to={createPageUrl('Dashboard')}>
              <Button className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a] font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Social media management<br />made <span className="text-[#d4af37]">simple</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Plan, collaborate, and publish content across all your social channels with AI-powered tools that save you time.
          </p>

          <style>{`
            @media (max-width: 640px) {
              h1 { font-size: 2.25rem; line-height: 1.1; }
              .text-6xl { font-size: 1.875rem; }
            }
          `}</style>

          <div className="flex items-center justify-center gap-4 mb-20">
            <Link to={createPageUrl('Dashboard')}>
              <Button size="lg" className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a] font-semibold text-base px-8 h-12 rounded-lg">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Platform Logos Strip */}
          <div className="flex flex-wrap items-center justify-center gap-5 max-w-3xl mx-auto opacity-50">
            {platforms.map((platform, i) => (
              <div key={i} style={{ color: '#d4af37' }}>
                {platform.svg}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/30 mb-4">
              18 Platforms & Counting
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Every platform. One dashboard.
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Connect all your social media accounts and manage everything from a single, powerful workspace.
            </p>
          </div>

          {/* Category filters */}
          {['Social', 'Video', 'Streaming', 'Professional', 'Visual', 'Business', 'E-commerce', 'Audio'].map(cat => {
            const count = platforms.filter(p => p.category === cat).length;
            return count > 0 ? null : null;
          })}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((platform, i) => (
              <div
                key={i}
                className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-[#d4af37]/40 rounded-2xl p-5 transition-all duration-300 cursor-default overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${platform.color}, transparent 70%)` }}
                />

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${platform.color}22`, color: platform.color }}
                  >
                    {platform.svg}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{platform.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                      {platform.category}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-1.5">
                  {platform.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: platform.color }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Connect badge */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <span className="text-xs text-[#d4af37] font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready to connect
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-24 px-6 bg-black/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/30 mb-4">
              Why Choose Nexus Social
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What sets us apart
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Advanced features that give you the competitive edge
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/5 backdrop-blur-sm border-[#d4af37]/30 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Advanced AI Assistant</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Our AI doesn't just generate content—it understands your brand voice, analyzes performance data, 
                    and provides strategic recommendations in real-time. Control everything with natural language commands.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-[#d4af37]/30 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Predictive Revenue Engine</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Know which posts will drive revenue before you publish. Our AI predicts profitability, 
                    optimal monetization strategies, and conversion potential with 94% accuracy.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-[#d4af37]/30 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Autonomous Optimization</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Set it and forget it. Our system automatically optimizes posting times, content formats, 
                    and engagement strategies based on continuous learning from your audience behavior.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-[#d4af37]/30 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-6 h-6 text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Real-Time Social Listening</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Track brand mentions, competitor activity, and trending topics across all platforms. 
                    Get instant alerts and AI-powered insights to capitalize on viral moments.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-black/30 backdrop-blur-sm border-y border-[#d4af37]/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Built for teams of all sizes
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage social media at scale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, i) =>
            <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#d4af37] flex items-center justify-center mb-6 mx-auto">
                  <feature.icon className="w-7 h-7 text-[#1a1a1a]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Trusted by creators and brands worldwide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            {stats.map((stat, i) =>
            <div key={i}>
                <p className="text-3xl font-bold text-[#d4af37] mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            )}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-32 px-6 bg-black/30 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start publishing today
          </h2>
          <p className="text-xl text-gray-400 mb-10">Join thousands of creators and teams using Nexus Social

          </p>
          <Link to={createPageUrl('Dashboard')}>
            <Button size="lg" className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a] text-base px-8 h-12 rounded-lg font-semibold">
              Get Started Free
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">Free 14-day trial • No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black/50 backdrop-blur-sm border-t border-[#d4af37]/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69630c5321dd411923f5e524/120b4afa8_logo.png"
              alt="Nexus Social"
              className="w-8 h-8 rounded-lg object-contain" />

            <span className="font-semibold text-white">Nexus Social</span>
          </div>
          <p className="text-sm text-gray-500">© 2026 Nexus Social. All rights reserved.</p>
        </div>
      </footer>
    </div>);

}