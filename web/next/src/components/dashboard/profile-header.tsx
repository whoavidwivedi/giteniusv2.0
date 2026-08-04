"use client"

import {
  RiMapPinLine,
  RiBuildingLine,
  RiLinksLine,
  RiGithubLine,
  RiCheckLine,
  RiStarLine,
  RiGitMergeLine,
  RiCalendarLine,
} from "@remixicon/react"
import React, { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GitHubUser, ProfileAiAnalysis } from "@/lib/types"

interface ProfileHeaderProps {
  user: GitHubUser
  stats: {
    totalStars: number
    totalForks: number
    primaryLanguage: string
    accountAgeYears: number
  }
  aiAnalysis: ProfileAiAnalysis
}

export function ProfileHeader({ user, stats, aiAnalysis }: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyPitch = () => {
    const textToCopy = `${aiAnalysis.developerArchetype}: ${aiAnalysis.elevatorPitch}\n\nTop Skills: ${aiAnalysis.topSkills
      .slice(0, 5)
      .map((s) => s.name)
      .join(", ")}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90)
      return "text-emerald-600 border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20"
    if (score >= 80)
      return "text-indigo-600 border-indigo-200 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-900/20"
    if (score >= 70)
      return "text-amber-600 border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20"
    return "text-slate-600 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left Column: Core Identity */}
      <Card className="flex flex-col justify-between overflow-hidden p-6 lg:col-span-2">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="h-24 w-24 rounded-3xl object-cover shadow-sm ring-4 ring-white sm:h-32 sm:w-32 dark:ring-slate-900"
            />
            {user.hireable && (
              <span className="absolute -right-2 -bottom-2 inline-flex items-center gap-1 rounded-full border border-white bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 shadow-sm dark:border-slate-900 dark:bg-emerald-900/50 dark:text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Available for Hire
              </span>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  {user.name || user.login}
                </h2>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                >
                  <RiGithubLine className="h-6 w-6" />
                </a>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                @{user.login}
              </p>
            </div>

            {/* Archetype Pill */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/50 bg-indigo-50/50 px-3 py-1 dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {aiAnalysis.developerArchetype}
              </span>
            </div>

            {user.bio && (
              <p className="text-sm leading-relaxed text-slate-700 sm:max-w-xl dark:text-slate-300">
                {user.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              {user.location && (
                <div className="flex items-center gap-1.5">
                  <RiMapPinLine className="h-4 w-4" />
                  {user.location}
                </div>
              )}
              {user.company && (
                <div className="flex items-center gap-1.5">
                  <RiBuildingLine className="h-4 w-4" />
                  {user.company}
                </div>
              )}
              {user.blog && (
                <div className="flex items-center gap-1.5">
                  <RiLinksLine className="h-4 w-4" />
                  <a
                    href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 hover:underline dark:hover:text-indigo-400"
                  >
                    Portfolio
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-100 pt-6 dark:border-slate-800">
          {aiAnalysis.topSkills.slice(0, 6).map((skill, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {skill.name}
            </Badge>
          ))}
          {aiAnalysis.topSkills.length > 6 && (
            <Badge
              variant="outline"
              className="border-slate-200 text-slate-500 dark:border-slate-800"
            >
              +{aiAnalysis.topSkills.length - 6} more
            </Badge>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        {/* Right Column: Dev Score Card */}
        <Card className="bg-slate-900 p-6 text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 dark:text-slate-600">Dev Score</h3>
            <div className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-md dark:bg-black/10">
              <span>Percentile: Top {Math.max(1, 100 - aiAnalysis.overallScore)}%</span>
            </div>
          </div>

          <div className="mt-4 flex items-end gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-2xl font-black shadow-sm ${getScoreColor(aiAnalysis.overallScore)}`}
            >
              {aiAnalysis.overallScore}
            </div>
            <div className="pb-1 text-xs font-medium text-slate-200 dark:text-slate-500">
              <p>Based on repository impact,</p>
              <p>consistency & code quality.</p>
            </div>
          </div>
        </Card>

        {/* Elevator Pitch Box */}
        <Card className="flex-1 border-indigo-100 bg-indigo-50/30 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold tracking-wider text-indigo-900 uppercase dark:text-indigo-300">
              Executive Bio & Summary
            </h4>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopyPitch}
              className="h-6 w-6 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
              title="Copy Pitch"
            >
              {copied ? (
                <RiCheckLine className="h-3.5 w-3.5" />
              ) : (
                <RiCheckLine className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed font-medium text-indigo-950 italic dark:text-indigo-200">
            "{aiAnalysis.elevatorPitch}"
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {aiAnalysis.executiveSummary}
          </p>
        </Card>
      </div>

      {/* GitHub Raw Stats Strip */}
      <div className="col-span-1 grid grid-cols-2 gap-4 lg:col-span-3 lg:grid-cols-5">
        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <RiGithubLine className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Repositories</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{user.public_repos}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <RiStarLine className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Total Stars</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalStars}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <RiGitMergeLine className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Total Forks</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalForks}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <RiCheckLine className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Top Language</p>
            <p className="truncate text-lg font-bold text-slate-900 dark:text-white">
              {stats.primaryLanguage}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4 max-lg:col-span-2">
          <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <RiCalendarLine className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">GitHub Age</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.accountAgeYears} {stats.accountAgeYears === 1 ? "Year" : "Years"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
