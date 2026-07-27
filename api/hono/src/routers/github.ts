import { GoogleGenAI, Type } from "@google/genai"
import { sValidator } from "@hono/standard-validator"
import { env } from "@packages/env/api-hono"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { z } from "zod"

import { ApiError, validationErrorResponses } from "@/lib/error"

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
})

function getGitHubHeaders(token?: string) {
  const headers: Record<string, string> = {
    "User-Agent": "GitCraft-AI-App",
    Accept: "application/vnd.github.v3+json",
  }
  if (token) {
    headers["Authorization"] = `token ${token}`
  }
  return headers
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#ffac45",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  SCSS: "#c6538c",
}

const analyzeQuerySchema = z.object({
  username: z.string().trim().min(1),
  token: z.string().trim().optional(),
})

const chatBodySchema = z.object({
  username: z.string().trim().min(1),
  userSummary: z.any(),
  repos: z.array(z.any()),
  question: z.string().trim().min(1),
  history: z.array(z.any()).optional(),
})

export const githubRouter = new Hono()
  .get(
    "/analyze",
    describeRoute({
      tags: ["GitHub"],
      description: "Analyze a GitHub profile and generate AI insights",
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: resolver(z.object({ data: z.any() })),
            },
          },
        },
        ...validationErrorResponses,
      },
    }),
    sValidator("query", analyzeQuerySchema, (result) => {
      if (!result.success) {
        throw new ApiError(400, "VALIDATION_ERROR", "Invalid input", { issues: result.error })
      }
    }),
    async (c) => {
      const { username, token } = c.req.valid("query")
      const cleanUsername = username.replace(/^@/, "")

      // 1. Fetch User Data
      const userRes = await fetch(`https://api.github.com/users/${cleanUsername}`, {
        headers: getGitHubHeaders(token),
      })

      if (userRes.status === 404) {
        throw new ApiError(404, "NOT_FOUND", `GitHub user "${cleanUsername}" was not found.`)
      }

      if (!userRes.ok) {
        const errData = await userRes.json().catch(() => ({}))
        if (userRes.status === 403 && errData.message?.includes("rate limit")) {
          throw new ApiError(
            429,
            "TOO_MANY_REQUESTS",
            "GitHub API rate limit reached. Please provide an optional GitHub Personal Access Token or try again in a few minutes.",
          )
        }
        throw new ApiError(500, "ERROR", errData.message || "Failed to fetch GitHub profile.")
      }

      const userData = await userRes.json()

      // 2. Fetch User Repositories
      const reposRes = await fetch(
        `https://api.github.com/users/${cleanUsername}/repos?per_page=100&sort=pushed`,
        { headers: getGitHubHeaders(token) },
      )
      const reposData = reposRes.ok ? await reposRes.json() : []

      // 3. Fetch User Public Events
      const eventsRes = await fetch(
        `https://api.github.com/users/${cleanUsername}/events?per_page=100`,
        { headers: getGitHubHeaders(token) },
      )
      const eventsData = eventsRes.ok ? await eventsRes.json() : []

      // 4. Calculate stats
      let totalStars = 0
      let totalForks = 0
      const langCounts: Record<string, number> = {}

      const formattedRepos = reposData.map((repo: any) => {
        totalStars += repo.stargazers_count || 0
        totalForks += repo.forks_count || 0

        if (repo.language) {
          langCounts[repo.language] = (langCounts[repo.language] || 0) + 1
        }

        return {
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          homepage: repo.homepage,
          stargazers_count: repo.stargazers_count,
          watchers_count: repo.watchers_count,
          forks_count: repo.forks_count,
          open_issues_count: repo.open_issues_count,
          language: repo.language,
          fork: repo.fork,
          topics: repo.topics || [],
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          pushed_at: repo.pushed_at,
          size: repo.size,
          default_branch: repo.default_branch,
        }
      })

      const totalLangs = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1

      const languagesList = Object.entries(langCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalLangs) * 100),
          color: LANGUAGE_COLORS[name] || "#6e7681",
        }))

      const accountCreatedYear = new Date(userData.created_at).getFullYear()
      const currentYear = new Date().getFullYear()
      const accountAgeYears = Math.max(1, currentYear - accountCreatedYear)

      const stats = {
        totalStars,
        totalForks,
        primaryLanguage: languagesList[0]?.name || "N/A",
        accountAgeYears,
      }

      // 5. Generate AI Analysis
      let aiAnalysis = null
      try {
        const topReposSummary = formattedRepos
          .slice(0, 12)
          .map(
            (r: any) =>
              `- ${r.name}: ${r.stargazers_count} stars, ${r.language || "Unknown language"}, topics: [${r.topics.join(", ")}], description: "${r.description || ""}"`,
          )
          .join("\n")

        const prompt = `You are a world-class Technical Recruiter & Principal Software Architect analyzing a developer's GitHub profile.

Developer Profile:
Name: ${userData.name || userData.login} (@${userData.login})
Bio: ${userData.bio || "No bio provided"}
Company: ${userData.company || "Independent"}
Location: ${userData.location || "Not specified"}
Public Repos: ${userData.public_repos}
Followers: ${userData.followers} | Following: ${userData.following}
Account Created: ${userData.created_at}
Total Stars Across Repos: ${totalStars} | Total Forks: ${totalForks}
Top Languages: ${languagesList.map((l) => `${l.name} (${l.percentage}%)`).join(", ")}

Top Repositories:
${topReposSummary}

Analyze this developer thoroughly and provide a structured assessment:
1. developerArchetype: A high-impact title describing their engineer profile.
2. overallScore: Overall developer index score from 50 to 99 based on impact, breadth, and repository quality.
3. executiveSummary: A sleek 2-3 sentence executive bio summarizing their engineering background, strengths, and expertise.
4. elevatorPitch: A compelling 1-2 sentence pitch suitable for a resume heading or LinkedIn headline.
5. skillDomains: Assessment of 6 domains with scores (0-100), level ("Expert" | "Proficient" | "Developing"), and brief summary:
   - Frontend Architecture
   - Backend & API Engineering
   - System Design & Databases
   - DevOps, Cloud & Tooling
   - Code Quality & Documentation
   - Open Source & Community Engagement
6. topSkills: 6-8 granular technologies/frameworks detected with estimated proficiency score (0-100), category, and key repos used.
7. repoAnalyses: AI analysis of up to 6 key repositories with complexity score (1-10), standout highlight, technical keypoints, category, and suggested improvement.
8. keyStrengths: 4 standout technical or professional strengths.
9. recommendedRoles: 3-4 ideal target job roles.
10. recruiterNotes: Recruiter commentary on why a company should hire this developer.
11. growthRoadmap: 3 actionable growth recommendations to further enhance their portfolio.
12. activityMetrics: Estimated metrics on coding consistency, workload type, and collaboration.`

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                developerArchetype: { type: Type.STRING },
                overallScore: { type: Type.INTEGER },
                executiveSummary: { type: Type.STRING },
                elevatorPitch: { type: Type.STRING },
                skillDomains: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      domain: { type: Type.STRING },
                      score: { type: Type.INTEGER },
                      level: { type: Type.STRING },
                      summary: { type: Type.STRING },
                    },
                    required: ["domain", "score", "level", "summary"],
                  },
                },
                topSkills: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: { type: Type.STRING },
                      proficiency: { type: Type.INTEGER },
                      reposUsed: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ["name", "category", "proficiency", "reposUsed"],
                  },
                },
                repoAnalyses: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      repoName: { type: Type.STRING },
                      complexityScore: { type: Type.INTEGER },
                      highlight: { type: Type.STRING },
                      technicalKeypoints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      suggestedImprovement: { type: Type.STRING },
                      category: { type: Type.STRING },
                    },
                    required: [
                      "repoName",
                      "complexityScore",
                      "highlight",
                      "technicalKeypoints",
                      "suggestedImprovement",
                      "category",
                    ],
                  },
                },
                keyStrengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recommendedRoles: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recruiterNotes: { type: Type.STRING },
                growthRoadmap: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      priority: { type: Type.STRING },
                    },
                    required: ["title", "description", "priority"],
                  },
                },
                activityMetrics: {
                  type: Type.OBJECT,
                  properties: {
                    consistencyRating: { type: Type.STRING },
                    estimatedMonthlyCommits: { type: Type.INTEGER },
                    primaryWorkloadType: { type: Type.STRING },
                    collaborationLevel: { type: Type.STRING },
                  },
                  required: [
                    "consistencyRating",
                    "estimatedMonthlyCommits",
                    "primaryWorkloadType",
                    "collaborationLevel",
                  ],
                },
              },
              required: [
                "developerArchetype",
                "overallScore",
                "executiveSummary",
                "elevatorPitch",
                "skillDomains",
                "topSkills",
                "repoAnalyses",
                "keyStrengths",
                "recommendedRoles",
                "recruiterNotes",
                "growthRoadmap",
                "activityMetrics",
              ],
            },
          },
        })

        if (geminiResponse.text) {
          aiAnalysis = JSON.parse(geminiResponse.text)
        }
      } catch (aiError) {
        console.error("Gemini AI analysis error:", aiError)
        aiAnalysis = {
          developerArchetype: "Full-Stack Software Engineer",
          overallScore: Math.min(
            98,
            Math.max(65, Math.floor(userData.public_repos * 1.5 + totalStars * 0.5 + 70)),
          ),
          executiveSummary: `${userData.name || userData.login} is an active developer on GitHub with ${userData.public_repos} public repositories and ${totalStars} stars across projects. Primary focus in ${languagesList[0]?.name || "software development"}.`,
          elevatorPitch: `Versatile developer specializing in ${
            languagesList
              .slice(0, 3)
              .map((l) => l.name)
              .join(", ") || "modern web technologies"
          }.`,
          skillDomains: [],
          topSkills: [],
          repoAnalyses: [],
          keyStrengths: [],
          recommendedRoles: [],
          recruiterNotes: "Strong candidate with verifiable code history.",
          growthRoadmap: [],
          activityMetrics: {
            consistencyRating: "High Activity",
            estimatedMonthlyCommits: Math.max(15, eventsData.length * 2),
            primaryWorkloadType: "Full Stack Development",
            collaborationLevel: "Individual & Team Contributor",
          },
        }
      }

      return c.json({
        data: {
          user: {
            login: userData.login,
            id: userData.id,
            avatar_url: userData.avatar_url,
            name: userData.name,
            company: userData.company,
            blog: userData.blog,
            location: userData.location,
            email: userData.email,
            hireable: userData.hireable,
            bio: userData.bio,
            twitter_username: userData.twitter_username,
            public_repos: userData.public_repos,
            public_gists: userData.public_gists,
            followers: userData.followers,
            following: userData.following,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
            html_url: userData.html_url,
          },
          repos: formattedRepos,
          events: eventsData.slice(0, 30),
          languages: languagesList,
          stats,
          aiAnalysis,
        },
      })
    },
  )
  .post(
    "/chat",
    describeRoute({
      tags: ["GitHub"],
      description: "Chat with the AI Talent Scout",
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: resolver(z.object({ data: z.object({ answer: z.string() }) })),
            },
          },
        },
        ...validationErrorResponses,
      },
    }),
    sValidator("json", chatBodySchema, (result) => {
      if (!result.success) {
        throw new ApiError(400, "VALIDATION_ERROR", "Invalid input", { issues: result.error })
      }
    }),
    async (c) => {
      const { username, userSummary, repos, question } = c.req.valid("json")

      const contextPrompt = `You are an AI Talent Scout and Senior Engineering Lead discussing the candidate @${username}.

Candidate Summary:
${JSON.stringify(userSummary, null, 2)}

Top Repositories Overview:
${(repos || [])
  .slice(0, 8)
  .map(
    (r: any) =>
      `- ${r.name}: ${r.stargazers_count} stars, ${r.language || "N/A"}. ${r.description || ""}`,
  )
  .join("\n")}

User / Recruiter Question: "${question}"

Provide a direct, insightful, professional answer in concise markdown with clear headings or bullet points where relevant.`

      try {
        const chatResponse = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: contextPrompt,
        })
        return c.json({ data: { answer: chatResponse.text } })
      } catch (err: any) {
        console.error("Chat API error:", err)
        throw new ApiError(500, "ERROR", err.message || "Failed to process AI chat query.")
      }
    },
  )
