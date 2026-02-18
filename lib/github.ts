/**
 * GitHub Integration Service
 * Uses gh CLI for fetching repository data
 */

import { execSync } from 'child_process'

export interface GitHubRepo {
  name: string
  description: string | null
  url: string
  stargazerCount: number
  forkCount: number
  primaryLanguage: string | null
  pushedAt: string
  isPrivate: boolean
}

export interface GitHubIssue {
  number: number
  title: string
  state: string
  labels: string[]
  author: string
  createdAt: string
  url: string
}

export interface GitHubPR {
  number: number
  title: string
  state: string
  author: string
  reviewDecision: string | null
  createdAt: string
  url: string
}

export interface GitHubCommit {
  message: string
  author: string
  date: string
  sha: string
}

export interface GitHubContributor {
  login: string
  avatarUrl: string
  contributions: number
}

export async function listRepos(): Promise<GitHubRepo[]> {
  try {
    const output = execSync(
      'gh repo list --json name,description,url,stargazerCount,forkCount,primaryLanguage,pushedAt,isPrivate --limit 100',
      { encoding: 'utf-8' }
    )
    const repos = JSON.parse(output)
    
    // Normalize the data - GitHub CLI returns primaryLanguage as {name: "TypeScript"}
    return repos.map((repo: any) => ({
      ...repo,
      primaryLanguage: repo.primaryLanguage?.name || null
    }))
  } catch (error) {
    console.error('Failed to fetch repos:', error)
    return []
  }
}

export async function getRepoIssues(owner: string, repo: string, limit = 10): Promise<GitHubIssue[]> {
  try {
    const output = execSync(
      `gh issue list --repo ${owner}/${repo} --json number,title,state,labels,author,createdAt,url --limit ${limit}`,
      { encoding: 'utf-8' }
    )
    const issues = JSON.parse(output)
    return issues.map((issue: any) => ({
      ...issue,
      author: issue.author?.login || 'unknown',
      labels: issue.labels?.map((l: any) => l.name) || []
    }))
  } catch (error) {
    console.error(`Failed to fetch issues for ${owner}/${repo}:`, error)
    return []
  }
}

export async function getRepoPRs(owner: string, repo: string, limit = 10): Promise<GitHubPR[]> {
  try {
    const output = execSync(
      `gh pr list --repo ${owner}/${repo} --json number,title,state,author,reviewDecision,createdAt,url --limit ${limit}`,
      { encoding: 'utf-8' }
    )
    const prs = JSON.parse(output)
    return prs.map((pr: any) => ({
      ...pr,
      author: pr.author?.login || 'unknown'
    }))
  } catch (error) {
    console.error(`Failed to fetch PRs for ${owner}/${repo}:`, error)
    return []
  }
}

export async function getRepoCommits(owner: string, repo: string, limit = 10): Promise<GitHubCommit[]> {
  try {
    const output = execSync(
      `gh api repos/${owner}/${repo}/commits --jq '.[0:${limit}] | .[] | {message: .commit.message, author: .commit.author.name, date: .commit.author.date, sha: .sha}'`,
      { encoding: 'utf-8' }
    )
    
    // Parse line-by-line JSON objects
    const commits = output.trim().split('\n').filter(Boolean).map(line => JSON.parse(line))
    return commits
  } catch (error) {
    console.error(`Failed to fetch commits for ${owner}/${repo}:`, error)
    return []
  }
}

export async function getRepoContributors(owner: string, repo: string, limit = 10): Promise<GitHubContributor[]> {
  try {
    const output = execSync(
      `gh api repos/${owner}/${repo}/contributors --jq '.[0:${limit}] | .[] | {login: .login, avatarUrl: .avatar_url, contributions: .contributions}'`,
      { encoding: 'utf-8' }
    )
    
    const contributors = output.trim().split('\n').filter(Boolean).map(line => JSON.parse(line))
    return contributors
  } catch (error) {
    console.error(`Failed to fetch contributors for ${owner}/${repo}:`, error)
    return []
  }
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  // Parse GitHub URL to extract owner and repo
  // https://github.com/owner/repo or git@github.com:owner/repo.git
  const match = url.match(/github\.com[/:]([^/]+)\/([^/]+?)(\.git)?$/)
  if (!match) return null
  
  return {
    owner: match[1],
    repo: match[2]
  }
}
