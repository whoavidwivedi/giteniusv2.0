"use client"

import { RiSearchLine, RiUser3Line, RiLineChartLine } from "@remixicon/react"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"

interface SearchSectionProps {
  onSearch: (username: string) => void
  isAnalyzing: boolean
  currentUsername?: string
}

const FEATURED_DEVS = [
  { username: "gaearon", label: "Dan Abramov", title: "React Co-Creator" },
  { username: "yyx990803", label: "Evan You", title: "Vue.js Creator" },
  { username: "shadcn", label: "Shadcn", title: "UI System Pioneer" },
  { username: "sindresorhus", label: "Sindre Sorhus", title: "Open Source Titan" },
  { username: "torvalds", label: "Linus Torvalds", title: "Linux & Git Creator" },
]

export function SearchSection({ onSearch, isAnalyzing, currentUsername }: SearchSectionProps) {
  const [inputUsername, setInputUsername] = useState(currentUsername || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputUsername.trim()) {
      onSearch(inputUsername.trim())
    }
  }

  const handleSelectPreset = (username: string) => {
    setInputUsername(username)
    onSearch(username)
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-6 text-white shadow-xl sm:p-10 dark:border-slate-800">
      {/* Background glow effects */}

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="hidden">

          <span>AI-Powered GitHub Talent Intelligence</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Analyze Any GitHub Profile <br className="hidden sm:inline" />
          <span className="text-slate-900 dark:text-slate-100">
            Instantly with AI
          </span>
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
          Deep repository analysis, skill proficiency scoring, developer archetypes, activity
          metrics, and 1-click exportable portfolio report.
        </p>

        {/* Search Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <RiUser3Line className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Enter GitHub username (e.g. gaearon, torvalds)..."
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              disabled={isAnalyzing}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900/90 py-3.5 pr-4 pl-10 text-sm text-white placeholder-slate-400 transition-all outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            disabled={isAnalyzing || !inputUsername.trim()}
            className="h-12 w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Analyzing Profile...</span>
              </>
            ) : (
              <>
                <span>Analyze Profile</span>
                <RiSearchLine className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Preset Sample Profiles */}
        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="mb-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <RiLineChartLine className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>Try analyzing sample developer profiles:</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {FEATURED_DEVS.map((dev) => (
              <button
                key={dev.username}
                type="button"
                onClick={() => handleSelectPreset(dev.username)}
                disabled={isAnalyzing}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all hover:border-indigo-500/50 hover:bg-indigo-950/40 hover:text-white"
              >
                <span className="font-semibold font-semibold">@{dev.username}</span>
                <span className="xs:inline hidden text-[11px] text-slate-400">• {dev.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
