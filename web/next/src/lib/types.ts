export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  hireable: boolean | null
  bio: string | null
  twitter_username: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  html_url: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  fork: boolean
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  default_branch: string
}

export interface GitHubEvent {
  id: string
  type: string
  actor: {
    login: string
  }
  repo: {
    name: string
  }
  payload: any
  created_at: string
}

export interface LanguageDistribution {
  name: string
  percentage: number
  count: number
  color: string
}

export interface SkillDomain {
  domain: string // e.g., "Frontend Architecture", "Backend & APIs", "System Design", "DevOps & Cloud", "Code Quality", "Community & OSS"
  score: number // 0 to 100
  level: string // e.g., "Expert", "Proficient", "Developing"
  summary: string
}

export interface SpecificSkill {
  name: string
  category: string
  proficiency: number // 0 - 100
  reposUsed: string[]
}

export interface RepoAnalysis {
  repoName: string
  complexityScore: number // 1 - 10
  highlight: string
  technicalKeypoints: string[]
  suggestedImprovement: string
  category: string
}

export interface ProfileAiAnalysis {
  developerArchetype: string
  overallScore: number // 0 - 100
  executiveSummary: string
  elevatorPitch: string
  skillDomains: SkillDomain[]
  topSkills: SpecificSkill[]
  repoAnalyses: RepoAnalysis[]
  keyStrengths: string[]
  recommendedRoles: string[]
  recruiterNotes: string
  growthRoadmap: {
    title: string
    description: string
    priority: "High" | "Medium" | "Low"
  }[]
  activityMetrics: {
    consistencyRating: string
    estimatedMonthlyCommits: number
    primaryWorkloadType: string
    collaborationLevel: string
  }
}

export interface AnalysisResponse {
  user: GitHubUser
  repos: GitHubRepo[]
  events: GitHubEvent[]
  languages: LanguageDistribution[]
  stats: {
    totalStars: number
    totalForks: number
    primaryLanguage: string
    accountAgeYears: number
  }
  aiAnalysis: ProfileAiAnalysis
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}
