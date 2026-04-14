import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  PenSquare,
  Calendar,
  Upload,
  Sparkles,
  Link2,
  FileText,
  Video,
  Image } from
'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
{
  icon: PenSquare,
  label: 'Create Post',
  description: 'Write a new post',
  href: 'Content',
  color: 'from-[#d4af37] to-[#d4af37]',
  iconBg: 'bg-[#d4af37]/20',
  iconColor: 'text-[#d4af37]'
},
{
  icon: Sparkles,
  label: 'AI Generate',
  description: 'Create with AI',
  href: 'AIAssistant',
  color: 'from-[#d4af37] to-[#d4af37]',
  iconBg: 'bg-[#d4af37]/20',
  iconColor: 'text-[#d4af37]'
},
{
  icon: Calendar,
  label: 'Schedule',
  description: 'Plan ahead',
  href: 'Content',
  color: 'from-[#d4af37] to-[#d4af37]',
  iconBg: 'bg-[#d4af37]/20',
  iconColor: 'text-[#d4af37]'
},
{
  icon: Upload,
  label: 'Upload Media',
  description: 'Add to library',
  href: 'MediaLibrary',
  color: 'from-[#d4af37] to-[#d4af37]',
  iconBg: 'bg-[#d4af37]/20',
  iconColor: 'text-[#d4af37]'
}];


export default function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="bg-transparent text-lg font-semibold tracking-tight">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) =>
          <Link key={action.label} to={createPageUrl(action.href)}>
              <div className="group p-4 rounded-xl border border-slate-200 hover:border-[#d4af37] hover:shadow-md transition-all bg-white cursor-pointer">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", action.iconBg)}>
                  <action.icon className={cn("w-5 h-5", action.iconColor)} />
                </div>
                <p className="font-medium text-sm text-slate-800 group-hover:text-[#d4af37] transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {action.description}
                </p>
              </div>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>);

}