"use client"

import {
  RiStarLine,
  RiGitBranchLine,
  RiLightbulbLine,
  RiExternalLinkLine,
  RiSearchLine,
  RiCodeSSlashLine,
  RiArrowUpDownLine,
  RiSparklingLine,
  RiCodeBoxLine,
} from "@remixicon/react"
import React, { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { GitHubRepo, ProfileAiAnalysis } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface RepositoriesTabProps {
  repos: GitHubRepo[]
  aiAnalysis: ProfileAiAnalysis
}

export function RepositoriesTab({ repos, aiAnalysis }: RepositoriesTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All")
  const [sortBy, setSortBy] = useState<"stars" | "forks" | "updated">("stars")

  // Get list of unique primary languages
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>()
    repos.forEach((r) => {
      if (r.language) langs.add(r.language)
    })
    return ["All", ...Array.from(langs)]
  }, [repos])

  // AI repo analyses lookup map
  const repoAiMap = useMemo(() => {
    const map = new Map<string, (typeof aiAnalysis.repoAnalyses)[0]>()
    aiAnalysis.repoAnalyses.forEach((item) => {
      map.set(item.repoName.toLowerCase(), item)
    })
    return map
  }, [aiAnalysis])

  // Filtered and sorted repositories
  const filteredRepos = useMemo(() => {
    return repos
      .filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesLang = selectedLanguage === "All" || r.language === selectedLanguage
        return matchesSearch && matchesLang
      })
      .sort((a, b) => {
        if (sortBy === "stars") return b.stargazers_count - a.stargazers_count
        if (sortBy === "forks") return b.forks_count - a.forks_count
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      })
  }, [repos, searchQuery, selectedLanguage, sortBy])

  // Top 8 repos for star distribution chart
  const starChartData = useMemo(() => {
    return [...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 8)
      .map((r) => ({
        name: r.name.length > 14 ? r.name.slice(0, 12) + "..." : r.name,
        fullName: r.name,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language || "Other",
      }))
  }, [repos])

  return (
    <div className="space-y-6">
      {/* Top Chart: Repository Stars Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <RiStarLine className="h-4 w-4 text-amber-500" />
              <span>Top Repository Impact & Star Distribution</span>
            </CardTitle>
            <Badge variant="outline">Impact Analytics</Badge>
          </div>
          <CardDescription>
            Comparison of stargazers across candidate's most popular projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={starChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-lg dark:border-slate-800 dark:bg-slate-900">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {data.fullName}
                          </p>
                          <p className="font-semibold text-amber-500">⭐ {data.stars} stars</p>
                          <p className="text-slate-500 dark:text-slate-400">
                            🍴 {data.forks} forks • {data.language}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="stars" radius={[6, 6, 0, 0]}>
                  {starChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? "#4f46e5" : index < 3 ? "#6366f1" : "#a5b4fc"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Search Bar */}
      <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <RiSearchLine className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search repositories by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <RiCodeSSlashLine className="h-3.5 w-3.5" />
            <span>Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <RiArrowUpDownLine className="h-3.5 w-3.5" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="stars">Most Stars</option>
              <option value="forks">Most Forks</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredRepos.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <RiCodeBoxLine className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No matching repositories found.
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or language filter.
            </p>
          </div>
        ) : (
          filteredRepos.map((repo) => {
            const aiRepo = repoAiMap.get(repo.name.toLowerCase())

            return (
              <Card
                key={repo.id}
                className="flex flex-col justify-between transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
              >
                <div>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-1.5 truncate text-base font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                    >
                      <span className="truncate">{repo.name}</span>
                      <RiExternalLinkLine className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>

                    {aiRepo && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        Complexity: {aiRepo.complexityScore}/10
                      </Badge>
                    )}
                  </div>

                  <p className="mb-3 line-clamp-2 min-h-[32px] text-xs text-slate-600 dark:text-slate-400">
                    {repo.description || "No description provided."}
                  </p>

                  {/* AI Repository Highlight Box */}
                  {aiRepo && (
                    <div className="mb-3 space-y-1 rounded-xl border border-indigo-100 bg-indigo-50/70 p-2.5 text-xs dark:border-indigo-900/40 dark:bg-indigo-950/40">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-900 dark:text-indigo-300">
                        <RiSparklingLine className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                        AI Highlight:
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {aiRepo.highlight}
                      </p>
                      {aiRepo.suggestedImprovement && (
                        <div className="flex items-start gap-1 border-t border-indigo-100/60 pt-1 text-[11px] text-amber-700 dark:border-indigo-900/30 dark:text-amber-300">
                          <RiLightbulbLine className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>Suggest: {aiRepo.suggestedImprovement}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Topics Pills */}
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {repo.topics.slice(0, 4).map((topic) => (
                        <span
                          key={topic}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Metrics */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <span className="h-2 w-2 rounded-full bg-indigo-500" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <RiStarLine className="h-3.5 w-3.5 text-amber-500" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <RiGitBranchLine className="h-3.5 w-3.5 text-slate-400" />
                      {repo.forks_count}
                    </span>
                  </div>

                  <span className="text-[11px]">Pushed {formatDate(repo.pushed_at)}</span>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
