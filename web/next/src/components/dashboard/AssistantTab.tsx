"use client"

import {
  RiSendPlaneLine,
  RiSparklingLine,
  RiUser3Line,
  RiRobot2Line,
  RiQuestionLine,
  RiFlashlightLine,
  RiFileCopyLine,
  RiCheckLine,
} from "@remixicon/react"
import React, { useState, useRef, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { GitHubUser, GitHubRepo, ProfileAiAnalysis, ChatMessage } from "@/lib/types"

interface AssistantTabProps {
  user: GitHubUser
  repos: GitHubRepo[]
  aiAnalysis: ProfileAiAnalysis
}

const PRESET_QUESTIONS = [
  "Assess this developer's readiness for a Senior Engineering role.",
  "Generate 3 project-specific technical interview questions.",
  "Write a personalized candidate outreach email highlighting their top repos.",
  "What are this developer's biggest architectural strengths and potential blind spots?",
]

export function AssistantTab({ user, repos, aiAnalysis }: AssistantTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I am your AI Talent Scout assistant for **${
        user.name || user.login
      }** (@${user.login}). I have full context on their repositories, skill scores, and code history. Ask me anything or select a prompt below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [inputQuery, setInputQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputQuery
    if (!question.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: question.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputQuery("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/github/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.login,
          userSummary: {
            name: user.name,
            bio: user.bio,
            archetype: aiAnalysis.developerArchetype,
            score: aiAnalysis.overallScore,
            summary: aiAnalysis.executiveSummary,
            skills: aiAnalysis.topSkills,
            strengths: aiAnalysis.keyStrengths,
          },
          repos: repos.slice(0, 10).map((r) => ({
            name: r.name,
            stargazers_count: r.stargazers_count,
            language: r.language,
            description: r.description,
          })),
          question: question.trim(),
        }),
      })

      const data = await response.json()

      if (data.answer) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, assistantMsg])
      } else {
        throw new Error(data.error || "Failed to generate AI response.")
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Sorry, I encountered an issue: ${err.message || "Failed to process query."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Card className="flex h-[600px] flex-col overflow-hidden border-slate-200/90 p-0 dark:border-slate-800">
      <CardHeader className="border-b border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <RiSparklingLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Recruiter & Talent Scout Assistant</span>
          </CardTitle>
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 text-slate-500 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            Grounded on @{user.login}
          </span>
        </div>
        <CardDescription>
          Ask questions, evaluate fit for roles, generate interview questions, or craft personalized
          outreach.
        </CardDescription>
      </CardHeader>

      {/* Preset Suggested Prompts */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-slate-200/60 bg-slate-100/60 px-4 py-2.5 dark:border-slate-800/60 dark:bg-slate-800/40">
        <RiFlashlightLine className="h-3.5 w-3.5 shrink-0 text-amber-500" />
        <span className="shrink-0 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Prompts:
        </span>
        <div className="flex items-center gap-1.5">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs whitespace-nowrap text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-950"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Chat List */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold shadow-sm select-none ${
                msg.role === "user"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-indigo-600 text-white dark:bg-indigo-500"
              }`}
            >
              {msg.role === "user" ? (
                <RiUser3Line className="h-4 w-4" />
              ) : (
                <RiRobot2Line className="h-4 w-4" />
              )}
            </div>

            <div
              className={`group relative max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed sm:text-sm ${
                msg.role === "user"
                  ? "rounded-tr-none bg-indigo-600 text-white"
                  : "rounded-tl-none border border-slate-200/60 bg-slate-100 text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-100"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              <div className="mt-2 flex items-center justify-between border-t border-slate-200/40 pt-1.5 text-[10px] text-slate-400 dark:border-slate-700/40">
                <span>{msg.timestamp}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyMessage(msg.id, msg.content)}
                  className="flex h-auto items-center gap-1 p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-transparent hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {copiedId === msg.id ? (
                    <RiCheckLine className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <RiFileCopyLine className="h-3 w-3" />
                  )}
                  <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <RiRobot2Line className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-none bg-slate-100 p-4 text-xs text-slate-500 dark:bg-slate-800">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <span>Analyzing portfolio context & formulating response...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        className="flex gap-2 border-t border-slate-200/80 bg-white p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <input
          type="text"
          placeholder={`Ask anything about @${user.login}'s experience, repos, or fit...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <Button
          type="submit"
          variant="secondary"
          size="default"
          disabled={isLoading || !inputQuery.trim()}
        >
          <RiSendPlaneLine className="h-4 w-4" />
          <span className="hidden sm:inline">Ask AI</span>
        </Button>
      </form>
    </Card>
  )
}
