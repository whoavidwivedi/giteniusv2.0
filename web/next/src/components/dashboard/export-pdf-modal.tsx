"use client"

import {
  RiDownloadLine,
  RiBarChartBoxLine,
  RiCheckLine,
  RiCloseLine,
  RiFileCopyLine,
  RiFileTextLine,
  RiGitRepositoryLine,
  RiSparklingLine,
} from "@remixicon/react"
import React, { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { GitHubUser, GitHubRepo, ProfileAiAnalysis } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface ExportPdfModalProps {
  user: GitHubUser
  repos: GitHubRepo[]
  stats: {
    totalStars: number
    totalForks: number
    primaryLanguage: string
    accountAgeYears: number
  }
  aiAnalysis: ProfileAiAnalysis
  onClose: () => void
}

export function ExportPdfModal({ user, repos, stats, aiAnalysis, onClose }: ExportPdfModalProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [copiedMarkdown, setCopiedMarkdown] = useState(false)

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      // Dynamic import html2pdf.js
      const html2pdfModule: any = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default || html2pdfModule

      const element = reportRef.current
      if (!element) return

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${user.login}-GitCraft-Portfolio.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }

      await (html2pdf as any)().set(opt).from(element).save()
    } catch (err) {
      console.error("PDF Export error, falling back to window.print():", err)
      window.print()
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const readmeBadgeMarkdown = `<!-- GitCraft AI Portfolio Badge -->
<div align="center">
  <a href="${user.html_url}">
    <img src="https://img.shields.io/badge/GitCraft_AI_Index-${aiAnalysis.overallScore}%2F100-4f46e5?style=for-the-badge&logo=github&logoColor=white" alt="GitCraft AI Score" />
  </a>
  <p><strong>Archetype:</strong> ${aiAnalysis.developerArchetype}</p>
  <p><em>"${aiAnalysis.elevatorPitch}"</em></p>
</div>`

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(readmeBadgeMarkdown)
    setCopiedMarkdown(true)
    setTimeout(() => setCopiedMarkdown(false), 2000)
  }

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/80 p-2 backdrop-blur-md duration-200 sm:p-4">
      <div className="relative my-auto flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <RiFileTextLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Executive Portfolio Report & Export
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export professional PDF for recruiters, clients, and portfolio sharing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMarkdown}
              title="Copy GitHub README markdown badge"
            >
              {copiedMarkdown ? (
                <>
                  <RiCheckLine className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-medium text-emerald-600">Copied README Tag</span>
                </>
              ) : (
                <>
                  <RiFileCopyLine className="h-3.5 w-3.5" />
                  <span>Copy README Badge</span>
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <RiDownloadLine className="h-3.5 w-3.5" />
                  <span>Download PDF Report</span>
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <RiCloseLine className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Preview Canvas */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6 dark:bg-slate-950">
          <div
            ref={reportRef}
            className="mx-auto max-w-[800px] space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-lg print:border-none print:p-0 print:shadow-none"
            style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
          >
            {/* PDF Report Banner */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar_url}
                  alt={user.name || user.login}
                  className="h-16 w-16 rounded-xl object-cover ring-2 ring-slate-200"
                />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {user.name || user.login}
                  </h1>
                  <p className="text-sm font-semibold text-indigo-600">
                    {aiAnalysis.developerArchetype} • @{user.login}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user.location ? `${user.location} • ` : ""}
                    {user.company ? `${user.company} • ` : ""}
                    Joined {formatDate(user.created_at)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xl font-bold text-white">
                  {aiAnalysis.overallScore}
                </div>
                <p className="mt-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  GitCraft Dev Score
                </p>
              </div>
            </div>

            {/* Executive Bio */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                Executive Profile Summary
              </h4>
              <p className="text-xs leading-relaxed font-medium text-slate-800">
                "{aiAnalysis.elevatorPitch}"
              </p>
              <p className="mt-1 text-[11px] text-slate-600">{aiAnalysis.executiveSummary}</p>
            </div>

            {/* Core Stats Overview */}
            <div className="grid grid-cols-4 gap-3 border-y border-slate-200 py-3 text-center">
              <div>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase">
                  Total Stars
                </span>
                <span className="text-base font-bold text-slate-900">{stats.totalStars}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase">
                  Public Repos
                </span>
                <span className="text-base font-bold text-slate-900">{user.public_repos}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase">
                  Followers
                </span>
                <span className="text-base font-bold text-slate-900">{user.followers}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase">
                  Primary Lang
                </span>
                <span className="text-base font-bold text-indigo-600">{stats.primaryLanguage}</span>
              </div>
            </div>

            {/* Skill Domains & Top Technical Skills */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-900 uppercase">
                  <RiBarChartBoxLine className="h-4 w-4 text-indigo-600" />
                  Domain Competency Scores
                </h3>
                <div className="space-y-2">
                  {aiAnalysis.skillDomains.map((d, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>{d.domain}</span>
                        <span className="text-indigo-600">{d.score}/100</span>
                      </div>
                      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-600"
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-900 uppercase">
                  <RiSparklingLine className="h-4 w-4 text-indigo-600" />
                  Key Strengths & Role Fit
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {aiAnalysis.keyStrengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-600">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-slate-200 pt-2">
                  <span className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">
                    Target Roles:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {aiAnalysis.recommendedRoles.map((r, idx) => (
                      <span
                        key={idx}
                        className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Repositories Breakdown */}
            <div>
              <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-900 uppercase">
                <RiGitRepositoryLine className="h-4 w-4 text-indigo-600" />
                Featured Repository Intelligence
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {repos.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"
                  >
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="truncate">{r.name}</span>
                      <span className="shrink-0 text-amber-600">⭐ {r.stargazers_count}</span>
                    </div>
                    <p className="line-clamp-2 text-[11px] text-slate-600">
                      {r.description || "No description provided."}
                    </p>
                    <div className="pt-1 text-[10px] font-semibold text-indigo-600">
                      {r.language ? `Lang: ${r.language}` : "General Repo"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF Footer branding */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-[10px] text-slate-400">
              <span>Generated by GitCraft AI Profile Analyzer</span>
              <span>github.com/{user.login}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
