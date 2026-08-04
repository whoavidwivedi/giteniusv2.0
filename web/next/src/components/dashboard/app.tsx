"use client"

import {
  RiDashboardLine,
  RiCodeBoxLine,
  RiPulseLine,
  RiRobot2Line,
  RiErrorWarningLine,
} from "@remixicon/react"
import React, { useState, useEffect, useCallback } from "react"

import { ActivityTab } from "@/components/dashboard/activity-tab"
import { AssistantTab } from "@/components/dashboard/assistant-tab"
import { ExportPdfModal } from "@/components/dashboard/export-pdf-modal"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { ProfileHeader } from "@/components/dashboard/profile-header"
import { RepositoriesTab } from "@/components/dashboard/repositories-tab"
import { SearchSection } from "@/components/dashboard/search-section"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AnalysisResponse } from "@/lib/types"

export default function App() {
  const [username, setUsername] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gitcraft_last_user") || "shadcn"
    }
    return "shadcn"
  })
  const [githubToken, setGithubToken] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gitcraft_token") || ""
    }
    return ""
  })

  const [data, setData] = useState<AnalysisResponse | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [error, setError] = useState<{ message: string; isRateLimit?: boolean } | null>(null)

  const [activeTab, setActiveTab] = useState<
    "overview" | "repositories" | "activity" | "assistant"
  >("overview")
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false)

  // Fetch and analyze profile
  const analyzeProfile = useCallback(
    async (targetUsername: string) => {
      if (!targetUsername.trim()) return

      setIsAnalyzing(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams({ username: targetUsername.trim() })
        const headers: Record<string, string> = {}
        if (githubToken) {
          headers["Authorization"] = `Bearer ${githubToken.trim()}`
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/github/analyze?${queryParams.toString()}`,
          { headers },
        )
        const result = await res.json()

        if (!res.ok) {
          const errBody = result.error || {}
          throw {
            message: errBody.message || "Failed to analyze profile.",
            isRateLimit: errBody.code === "TOO_MANY_REQUESTS",
          }
        }

        setData(result.data)
        setUsername(targetUsername.trim())
        localStorage.setItem("gitcraft_last_user", targetUsername.trim())


      } catch (err: any) {
        console.error("Analysis Error:", err)
        setError({
          message: err.message || "An unexpected error occurred while analyzing the profile.",
          isRateLimit: err.isRateLimit,
        })
      } finally {
        setIsAnalyzing(false)
      }
    },
    [githubToken],
  )

  return (
    <div className="min-h-svh bg-slate-50 pt-14 font-sans text-slate-900 transition-colors duration-200 selection:bg-indigo-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
      {/* Top Navbar, offset below the fixed site navbar in the root layout */}
      <Navbar
        githubToken={githubToken}
        onSaveToken={handleSaveToken}
        onExportPdf={() => setShowPdfModal(true)}
        hasData={!!data}
        isAnalyzing={isAnalyzing}
        onRefresh={() => analyzeProfile(username)}
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Hero Box */}
        <SearchSection
          onSearch={analyzeProfile}
          isAnalyzing={isAnalyzing}
          currentUsername={username}
        />

        {/* Error State Banner */}
        {error && (
          <Card className="border-rose-200 bg-rose-50/80 p-6 dark:border-rose-900/50 dark:bg-rose-950/30">
            <div className="flex items-start gap-3">
              <RiErrorWarningLine className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 space-y-1.5">
                <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Profile Analysis Unsuccessful
                </h4>
                <p className="text-xs leading-relaxed text-rose-700 dark:text-rose-300">
                  {error.message}
                </p>

                {error.isRateLimit && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                      Tip: Add a GitHub Personal Access Token in the top navigation bar to unlock
                      5,000 API requests/hour.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Loading Skeleton */}
        {isAnalyzing && !data && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        )}

        {/* Main Content Dashboard */}
        {data && (
          <div className="animate-in fade-in space-y-8 duration-300">
            {/* Header Hero Card */}
            <ProfileHeader user={data.user} stats={data.stats} aiAnalysis={data.aiAnalysis} />

            {/* Dashboard Tabs Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2 dark:border-slate-800">
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                    activeTab === "overview"
                      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <RiDashboardLine className="h-4 w-4" />
                  <span>Overview & Skills</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("repositories")}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                    activeTab === "repositories"
                      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <RiCodeBoxLine className="h-4 w-4" />
                  <span>Repository Intelligence ({data.repos.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("activity")}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                    activeTab === "activity"
                      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <RiPulseLine className="h-4 w-4" />
                  <span>Coding Activity & Trends</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("assistant")}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                    activeTab === "assistant"
                      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <RiRobot2Line className="h-4 w-4" />
                  <span>Assistant</span>
                </button>
              </div>
            </div>

            {/* Active Tab View */}
            {activeTab === "overview" && <OverviewTab aiAnalysis={data.aiAnalysis} />}

            {activeTab === "repositories" && (
              <RepositoriesTab repos={data.repos} aiAnalysis={data.aiAnalysis} />
            )}

            {activeTab === "activity" && (
              <ActivityTab
                languages={data.languages}
                events={data.events}
                aiAnalysis={data.aiAnalysis}
              />
            )}

            {activeTab === "assistant" && (
              <AssistantTab user={data.user} repos={data.repos} aiAnalysis={data.aiAnalysis} />
            )}
          </div>
        )}
      </main>

      {/* Exportable PDF Modal */}
      {showPdfModal && data && (
        <ExportPdfModal
          user={data.user}
          repos={data.repos}
          stats={data.stats}
          aiAnalysis={data.aiAnalysis}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  )
}
