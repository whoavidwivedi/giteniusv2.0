import {
  RiCheckboxCircleLine,
  RiBriefcaseLine,
  RiLineChartLine,
  RiSparklingLine,
  RiFlashlightLine,
  RiFocus2Line,
  RiChatQuoteLine,
} from "@remixicon/react"
import React from "react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ProfileAiAnalysis } from "@/lib/types"

interface OverviewTabProps {
  aiAnalysis: ProfileAiAnalysis
}

export function OverviewTab({ aiAnalysis }: OverviewTabProps) {
  const radarData = aiAnalysis.skillDomains.map((domain) => ({
    subject: domain.domain.replace("& API Engineering", "& APIs").replace("Architecture", ""),
    score: domain.score,
    fullDomain: domain.domain,
    summary: domain.summary,
  }))

  const getPriorityBadge = (priority: string) => {
    if (priority === "High") return <Badge variant="destructive">High Priority</Badge>
    if (priority === "Medium") return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="secondary">Optional</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Top Row: Radar Chart + Skill Proficiency Scores */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Interactive Skill Radar Chart */}
        <Card className="flex flex-col justify-between lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <RiSparklingLine className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>AI Skill Radar Matrix</span>
              </CardTitle>
              <Badge variant="secondary">6 Core Domains</Badge>
            </div>
            <CardDescription>
              Comprehensive technical competency score derived from repository analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-[300px] flex-1 flex-col justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                />
                <Radar
                  name="Proficiency"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.45}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-lg dark:border-slate-800 dark:bg-slate-900">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {data.fullDomain}
                          </p>
                          <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                            Proficiency Score: {data.score}/100
                          </p>
                          <p className="max-w-xs text-slate-500 dark:text-slate-400">
                            {data.summary}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right: Granular Skill Proficiency Scores */}
        <Card className="flex flex-col justify-between lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <RiLineChartLine className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Detected Skill Proficiency Scores</span>
              </CardTitle>
              <Badge variant="secondary">{aiAnalysis.topSkills.length} Core Technologies</Badge>
            </div>
            <CardDescription>
              AI-evaluated technology mastery based on code complexity and usage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiAnalysis.topSkills.map((skill, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {skill.name}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-400 dark:bg-slate-800">
                      {skill.category}
                    </span>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {skill.proficiency}%
                  </span>
                </div>
                <Progress value={skill.proficiency} />
                {skill.reposUsed && skill.reposUsed.length > 0 && (
                  <p className="truncate text-[11px] text-slate-400">
                    Found in:{" "}
                    <span className="text-slate-600 dark:text-slate-300">
                      {skill.reposUsed.join(", ")}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Key Strengths & Target Roles */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Key Technical Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiFlashlightLine className="h-4 w-4 text-amber-500" />
              <span>Standout Technical Strengths</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiAnalysis.keyStrengths.map((strength, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-slate-800/40"
                >
                  <RiCheckboxCircleLine className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-xs leading-relaxed font-medium text-slate-700 dark:text-slate-300">
                    {strength}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Roles & Recruiter Assessment */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiBriefcaseLine className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Target Engineering Roles & Recruiter Pitch</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="mb-2 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Best-Fit Roles:
                </span>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.recommendedRoles.map((role, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1 text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/50">
                <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <RiChatQuoteLine className="h-3.5 w-3.5 text-indigo-500" />
                  Recruiter Takeaway:
                </span>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  "{aiAnalysis.recruiterNotes}"
                </p>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Bottom Row: AI Growth Roadmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <RiFocus2Line className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>AI Portfolio Action Plan & Growth Roadmap</span>
            </CardTitle>
            <Badge variant="outline">Actionable Insights</Badge>
          </div>
          <CardDescription>
            Targeted recommendations to elevate profile impact for top-tier hiring managers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {aiAnalysis.growthRoadmap.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between space-y-2 rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    0{idx + 1}. {item.title}
                  </span>
                  {getPriorityBadge(item.priority)}
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
