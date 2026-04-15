import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

const PLATFORM_COLORS = {
  instagram:  '#E1306C',
  facebook:   '#1877F2',
  twitter:    '#000000',
  linkedin:   '#0A66C2',
  youtube:    '#FF0000',
  tiktok:     '#010101',
  threads:    '#000000',
  pinterest:  '#E60023',
};

const STATUS_DOT = {
  draft:     'bg-slate-300',
  scheduled: 'bg-blue-400',
  published: 'bg-emerald-400',
  failed:    'bg-red-400',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ContentCalendar({ posts = [], onPostClick, onCreatePost }) {
  const [currentDate, setCurrentDate] = useState(moment());
  const [view, setView] = useState('month');

  // ── Build calendar grid ───────────────────────────────────────────────────
  const daysInMonth = currentDate.daysInMonth();
  const firstDay = moment(currentDate).startOf('month').day();
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push({ date: moment(currentDate).startOf('month').subtract(firstDay - i, 'days'), isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: moment(currentDate).date(i), isCurrentMonth: true });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: moment(currentDate).endOf('month').add(i, 'days'), isCurrentMonth: false });
  }

  const getPostsForDay = (date) =>
    posts.filter((p) => p && moment(p.schedule?.scheduled_at || p.created_date).isSame(date, 'day'));

  const isToday = (date) => moment().isSame(date, 'day');
  const navigate = (dir) => setCurrentDate((prev) => moment(prev).add(dir, 'month'));

  // ── Week view data ────────────────────────────────────────────────────────
  const weekStart = moment(currentDate).startOf('week');
  const weekDays = Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, 'days'));

  // ── Upcoming list ─────────────────────────────────────────────────────────
  const upcomingPosts = [...posts]
    .filter((p) => p?.schedule?.scheduled_at)
    .sort((a, b) => moment(a.schedule.scheduled_at).diff(moment(b.schedule.scheduled_at)));

  return (
    <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-semibold text-slate-900 min-w-[150px] text-center">
            {currentDate.format('MMMM YYYY')}
          </span>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(moment())}
            className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all"
          >
            Today
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
          {[
            { id: 'month', Icon: LayoutGrid, label: 'Month' },
            { id: 'week',  Icon: CalendarIcon, label: 'Week' },
            { id: 'list',  Icon: List, label: 'List' },
          ].map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                view === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Month view ── */}
      {view === 'month' && (
        <div>
          {/* Day labels */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
            {DAYS.map((d) => (
              <div key={d} className="py-2.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {days.map((day, idx) => {
              const dayPosts = getPostsForDay(day.date);
              const today = isToday(day.date);
              return (
                <div
                  key={idx}
                  onClick={() => onCreatePost?.(day.date)}
                  className={cn(
                    "min-h-[110px] p-2 cursor-pointer group transition-colors",
                    !day.isCurrentMonth && "bg-slate-50/60",
                    today && "bg-[#d4af37]/4",
                    "hover:bg-slate-50"
                  )}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                      today
                        ? "bg-[#d4af37] text-slate-950 font-bold"
                        : day.isCurrentMonth ? "text-slate-700" : "text-slate-300"
                    )}>
                      {day.date.date()}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onCreatePost?.(day.date); }}
                      className="w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Posts */}
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post, i) => (
                      <div
                        key={post.id || i}
                        onClick={(e) => { e.stopPropagation(); onPostClick?.(post); }}
                        className="flex items-center gap-1.5 px-1.5 py-1 rounded-md bg-white border border-slate-100 hover:border-[#d4af37]/40 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", STATUS_DOT[post.status] || 'bg-slate-300')} />
                        <div className="flex -space-x-0.5 flex-shrink-0">
                          {post.platforms?.slice(0, 2).map((p, j) => (
                            <span
                              key={j}
                              className="w-3 h-3 rounded-full ring-1 ring-white flex items-center justify-center text-[6px] text-white font-bold"
                              style={{ backgroundColor: PLATFORM_COLORS[p.platform] || '#94a3b8' }}
                            >
                              {p.platform?.[0]?.toUpperCase()}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-600 truncate leading-tight">
                          {post.title || post.content?.text?.slice(0, 18)}
                        </span>
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <span className="text-[10px] text-slate-400 pl-1">+{dayPosts.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Week view ── */}
      {view === 'week' && (
        <div>
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
            {weekDays.map((d) => (
              <div key={d.toString()} className={cn(
                "py-3 text-center",
                isToday(d) && "bg-[#d4af37]/8"
              )}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{d.format('ddd')}</p>
                <p className={cn(
                  "w-7 h-7 rounded-full mx-auto mt-0.5 flex items-center justify-center text-sm font-semibold",
                  isToday(d) ? "bg-[#d4af37] text-slate-950" : "text-slate-700"
                )}>
                  {d.date()}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[360px]">
            {weekDays.map((d) => {
              const dayPosts = getPostsForDay(d);
              return (
                <div
                  key={d.toString()}
                  onClick={() => onCreatePost?.(d)}
                  className={cn(
                    "p-2 cursor-pointer group hover:bg-slate-50 transition-colors",
                    isToday(d) && "bg-[#d4af37]/4"
                  )}
                >
                  <div className="space-y-1.5">
                    {dayPosts.map((post, i) => (
                      <div
                        key={post.id || i}
                        onClick={(e) => { e.stopPropagation(); onPostClick?.(post); }}
                        className="p-2 rounded-lg border border-slate-100 bg-white hover:border-[#d4af37]/40 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[post.status] || 'bg-slate-300')} />
                          <span className="text-[10px] text-slate-400">
                            {post.schedule?.scheduled_at ? moment(post.schedule.scheduled_at).format('h:mm a') : '—'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 line-clamp-2 leading-tight">
                          {post.title || post.content?.text?.slice(0, 40)}
                        </p>
                      </div>
                    ))}
                    {dayPosts.length === 0 && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-2 flex justify-center">
                        <span className="text-xs text-slate-300 flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── List view ── */}
      {view === 'list' && (
        <div className="divide-y divide-slate-100">
          {upcomingPosts.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No scheduled posts</div>
          ) : (
            upcomingPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onPostClick?.(post)}
                className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="text-right shrink-0 w-20">
                  <p className="text-xs font-medium text-slate-700">{moment(post.schedule.scheduled_at).format('MMM D')}</p>
                  <p className="text-[11px] text-slate-400">{moment(post.schedule.scheduled_at).format('h:mm a')}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[post.status] || 'bg-slate-300')} />
                    <span className="text-xs font-medium text-slate-500 capitalize">{post.status}</span>
                    <div className="flex gap-0.5 ml-auto">
                      {post.platforms?.slice(0, 4).map((p, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-full text-white text-[7px] font-bold flex items-center justify-center"
                          style={{ backgroundColor: PLATFORM_COLORS[p.platform] || '#94a3b8' }}
                        >
                          {p.platform?.[0]?.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 truncate">
                    {post.title || post.content?.text?.slice(0, 60) || <span className="italic text-slate-400">No content</span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}