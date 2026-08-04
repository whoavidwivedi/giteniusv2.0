import {
  RiGitCommitLine,
  RiGitPullRequestLine,
  RiInformationLine,
  RiLineChartLine,
} from "@remixicon/react"
import React, { useMemo } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { LanguageDistribution, GitHubEvent, ProfileAiAnalysis } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface ActivityTabProps {
  languages: LanguageDistribution[]
  events: GitHubEvent[]
  aiAnalysis: ProfileAiAnalysis
}

export function ActivityTab({ languages, events, aiAnalysis }: ActivityTabProps) {
  // Aggregate recent events by type
  const eventCounts = useMemo(() => {
    const counts: Record<string, number> = {
      PushEvent: 0,
      PullRequestEvent: 0,
      IssuesEvent: 0,
      WatchEvent: 0,
      CreateEvent: 0,
    }

    events.forEach((e) => {
      if (counts[e.type] !== undefined) {
        counts[e.type]++
      } else {
        counts[e.type] = 1
      }
    })

    return [
      { type: "Code Commits", count: counts.PushEvent || 0, icon: RiGitCommitLine },
      { type: "Pull Requests", count: counts.PullRequestEvent || 0, icon: RiGitPullRequestLine },
      { type: "Issues & Discussions", count: counts.IssuesEvent || 0, icon: RiLineChartLine },
      { type: "Starred & Forked", count: counts.WatchEvent || 0, icon: RiInformationLine },
    ]
  }, [events])

  // Aggregate event timeline trend by date
  const timelineData = useMemo(() => {
    if (!events.length) return []
    const dateMap: Record<string, number> = {}

    events.forEach((e) => {
      const dateKey = formatDate(e.created_at)
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1
    })

    return Object.entries(dateMap)
      .map(([date, count]) => ({ date, activity: count }))
      .reverse()
  }, [events])

  return (
    <div className="space-y-6">
      {/* Velocity Stats Header */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <RiGitCommitLine className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Est. Monthly Commits</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              ~{aiAnalysis.activityMetrics?.estimatedMonthlyCommits || 30}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <RiLineChartLine className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Activity Rating</div>
            <div className="truncate text-lg font-bold text-slate-900 dark:text-white">
              {aiAnalysis.activityMetrics?.consistencyRating || "Active"}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <RiLineChartLine className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Primary Workload</div>
            <div className="max-w-[140px] truncate text-sm font-bold text-slate-900 dark:text-white">
              {aiAnalysis.activityMetrics?.primaryWorkloadType || "Full-Stack"}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <RiLineChartLine className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Collaboration Style</div>
            <div className="max-w-[140px] truncate text-sm font-bold text-slate-900 dark:text-white">
              {aiAnalysis.activityMetrics?.collaborationLevel || "Autonomous & Team"}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Language Breakdown Pie / Donut Chart */}
        <Card className="flex flex-col justify-between lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <RiLineChartLine className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Language Share Distribution</span>
              </CardTitle>
              <Badge variant="outline">{languages.length} Languages</Badge>
            </div>
            <CardDescription>
              Primary language usage share across public repositories.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languages}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {languages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as LanguageDistribution
                        return (
                          <div className="space-y-0.5 rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-lg dark:border-slate-800 dark:bg-slate-900">
                            <p className="font-bold text-slate-900 dark:text-white">{data.name}</p>
                            <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {data.percentage}% ({data.count} repos)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Language Legend */}
            <div className="mt-2 grid w-full grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
              {languages.slice(0, 6).map((lang) => (
                <div
                  key={lang.name}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 dark:bg-slate-800/50"
                >
                  <span className="flex items-center gap-1.5 truncate font-medium text-slate-700 dark:text-slate-300">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: lang.color }}
                    />
                    <span className="truncate">{lang.name}</span>
                  </span>
                  <span className="shrink-0 font-bold text-slate-900 dark:text-white">
                    {lang.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Events Timeline */}
        <Card className="flex flex-col justify-between lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <RiLineChartLine className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Recent Event Velocity Trend</span>
              </CardTitle>
              <Badge variant="secondary">Public Stream</Badge>
            </div>
            <CardDescription>
              Volume of recent public contributions and activity events over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timelineData.length > 0 ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-lg dark:border-slate-800 dark:bg-slate-900">
                              <p className="font-bold text-slate-900 dark:text-white">
                                {data.date}
                              </p>
                              <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {data.activity} events
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="activity"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorActivity)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-xs text-slate-400">
                No recent public event data available.
              </p>
            )}

            {/* Event Type Cards */}
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-4 dark:border-slate-800">
              {eventCounts.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <Icon className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="truncate">{item.type}</span>
                    </div>
                    <span className="mt-1 block text-base font-bold text-slate-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
