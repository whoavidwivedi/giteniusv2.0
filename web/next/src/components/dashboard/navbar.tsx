"use client"

import {
  RiSparklingLine,
  RiCheckLine,
  RiKeyLine,
  RiShareLine,
  RiRefreshLine,
} from "@remixicon/react"
import React, { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  githubToken: string
  onSaveToken: (token: string) => void
  onExportPdf: () => void
  hasData: boolean
  isAnalyzing: boolean
  onRefresh: () => void
}

export function Navbar({
  githubToken,
  onSaveToken,
  onExportPdf,
  hasData,
  isAnalyzing,
  onRefresh,
}: NavbarProps) {
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [tokenInput, setTokenInput] = useState(githubToken)
  const [copiedLink, setCopiedLink] = useState(false)

  const handleSaveToken = () => {
    onSaveToken(tokenInput.trim())
    setShowTokenModal(false)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <>
      <header className="sticky top-14 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
              <RiSparklingLine className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  GitCraft <span className="text-indigo-600 dark:text-indigo-400">AI</span>
                </span>
                <Badge variant="secondary" className="hidden text-[10px] sm:inline-flex">
                  Gemini 3.6 Flash
                </Badge>
              </div>
              <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
                GitHub Intelligence & Skill Profiler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {hasData && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isAnalyzing}
                  className="hidden sm:inline-flex"
                >
                  <RiRefreshLine className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                  Re-Analyze
                </Button>

                <Button variant="secondary" size="sm" onClick={onExportPdf}>
                  <RiSparklingLine className="h-3.5 w-3.5" />
                  <span className="xs:inline hidden">Export PDF</span>
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={handleShare} title="Share portfolio URL">
              {copiedLink ? (
                <>
                  <RiCheckLine className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden text-emerald-600 sm:inline dark:text-emerald-400">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <RiShareLine className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </Button>

            <Button
              variant={githubToken ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowTokenModal(true)}
              title="GitHub Token Settings"
            >
              <RiKeyLine
                className={`h-3.5 w-3.5 ${githubToken ? "text-indigo-600 dark:text-indigo-400" : ""}`}
              />
              <span className="hidden md:inline">{githubToken ? "PAT Active" : "Add Token"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* GitHub Token Modal */}
      {showTokenModal && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <RiKeyLine className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  GitHub Personal Access Token
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Optional: Avoid GitHub API rate limits (60 req/hr unauth vs 5000 req/hr auth).
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Personal Access Token (classic or fine-grained with read-only scope)
              </label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Your token is stored in this browser's local storage and sent to the Gitenius API
                only to authenticate GitHub requests on your behalf.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowTokenModal(false)}>
                Cancel
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSaveToken}>
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
