"use client"

import { RiMapPinLine, RiBuildingLine, RiLinksLine, RiTwitterXLine, RiGithubLine, RiCheckLine, RiStarLine, RiGitMergeLine, RiCalendarLine } from "@remixicon/react"
import React, { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GitHubUser, ProfileAiAnalysis } from "@/lib/types"
import { formatDate, formatNumber } from "@/lib/utils"

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
  const [copiedPitch, setCopiedPitch] = useState(false)

  const handleCopyPitch = () => {
    const textToCopy = `${aiAnalysis.developerArchetype}: ${aiAnalysis.elevatorPitch}\n\nTop Skills: ${aiAnalysis.topSkills
      .slice(0, 5)
      .map((s) => s.name)
      .join(", ")}`
    navigator.clipboard.writeText(textToCopy)
    setCopiedPitch(true)
    setTimeout(() => setCopiedPitch(false), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90)
      return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800"
    if (score >= 80)
      return "text-slate-900 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/80 dark:text-slate-100 dark:border-indigo-800"
    if (score >= 70)
      return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/80 dark:text-blue-400 dark:border-blue-800"
    return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800"
  }

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row">
        {/* Left Column: Avatar & Basic Info */}
        <div className="flex w-full flex-1 flex-col items-start gap-5 sm:flex-row">
          <div className="group relative">
            <img
              src={user.avatar_url}
              alt={user.name || user.login}
              className="h-24 w-24 rounded-2xl object-cover shadow-md ring-4 ring-slate-100 sm:h-28 sm:w-28 dark:ring-slate-800"
            />
            {user.hireable && (
              <span
                className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white dark:ring-slate-900"
                title="Hireable Developer"
              >
                <RiBriefcaseLine className="h-3.5 w-3.5" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {user.name || user.login}
              </h2>
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-indigo-400"
              >
                @{user.login}
                <RiExternalLinkLine className="h-3.5 w-3.5" />
              </a>
              {user.hireable && (
                <Badge variant="secondary" className="text-xs">
                  Available for Hire
                </Badge>
              )}
            </div>

            {/* AI Archetype Pill */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">

                {aiAnalysis.developerArchetype}
              </Badge>
            </div>

            {/* User Metadata info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
              {user.company && (
                <span className="inline-flex items-center gap-1">
                  <RiBuilding4Line className="h-3.5 w-3.5 text-slate-400" />
                  {user.company}
                </span>
              )}
              {user.location && (
                <span className="inline-flex items-center gap-1">
                  <RiMapPinLine className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" />
                  {user.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <RiCalendarLine className="h-3.5 w-3.5 text-slate-400" />
                Joined {formatDate(user.created_at)} ({stats.accountAgeYears}y exp)
              </span>
              {user.blog && (
                <a
                  href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-[200px] items-center gap-1 truncate text-slate-900 hover:underline dark:text-slate-100"
                >
                  <RiLinksLine className="mr-1 h-3.5 w-3.5" />
                  {user.blog.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Dev Score Card */}
        <div className="flex w-full min-w-[220px] items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50 p-4 lg:w-auto lg:flex-col lg:justify-center dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-2xl font-black shadow-sm ${getScoreColor(aiAnalysis.overallScore)}`}
            >
              {aiAnalysis.overallScore}
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Dev Impact Score
              </div>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Percentile:{" "}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Top {Math.max(1, 100 - aiAnalysis.overallScore)}%
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyPitch}
            className="mt-0 w-auto text-xs lg:mt-3 lg:w-full"
          >
            {copiedPitch ? (
              <>
                <RiCheckLine className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-medium text-emerald-600">Copied Bio</span>
              </>
            ) : (
              <>
                <RiFileCopyLine className="h-3.5 w-3.5" />
                <span>Copy Bio Pitch</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Elevator Pitch Box */}
      <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <div className="mb-1 flex items-center gap-2">

          <h4 className="text-xs font-bold tracking-wider text-indigo-900 uppercase dark:text-indigo-300">
            Executive Bio & Summary
          </h4>
        </div>
        <p className="text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-300">
          "{aiAnalysis.elevatorPitch}"
        </p>
        <p className="mt-2 border-t border-indigo-100/80 pt-2 text-xs text-slate-600 dark:border-indigo-900/30 dark:text-slate-400">
          {aiAnalysis.executiveSummary}
        </p>
      </div>

      {/* Quick Metrics Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-200/80 pt-5 sm:grid-cols-5 dark:border-slate-800">
        <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <RiStarLine className="h-3.5 w-3.5 text-amber-500" />
            <span>Total Stars</span>
          </div>
          <span className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {formatNumber(stats.totalStars)}
          </span>
        </div>

        <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <RiGitRepositoryLine className="h-3.5 w-3.5 text-indigo-500" />
            <span>Repositories</span>
          </div>
          <span className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {user.public_repos}
          </span>
        </div>

        <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <RiGitBranchLine className="h-3.5 w-3.5 text-emerald-500" />
            <span>Forks Earned</span>
          </div>
          <span className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {formatNumber(stats.totalForks)}
          </span>
        </div>

        <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <RiTeamLine className="h-3.5 w-3.5 text-blue-500" />
            <span>Followers</span>
          </div>
          <span className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {formatNumber(user.followers)}
          </span>
        </div>

        <div className="col-span-2 flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-3 sm:col-span-1 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <RiCodeSSlashLine className="h-3.5 w-3.5 text-violet-500" />
            <span>Top Language</span>
          </div>
          <span className="mt-1 truncate text-lg font-bold text-slate-900 dark:text-white">
            {stats.primaryLanguage}
          </span>
        </div>
      </div>
    </Card>
  )
}
