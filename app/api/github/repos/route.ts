import { NextRequest, NextResponse } from 'next/server'
import { 
  listRepos, 
  parseRepoUrl,
  getRepoIssues,
  getRepoPRs,
  getRepoCommits,
  getRepoContributors
} from '@/lib/github'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'

    const repos = await listRepos()

    if (!detailed) {
      return NextResponse.json(repos)
    }

    // Fetch detailed data for each repo
    const detailedRepos = await Promise.all(
      repos.map(async (repo) => {
        const parsed = parseRepoUrl(repo.url)
        if (!parsed) return repo

        const [issues, prs, commits, contributors] = await Promise.all([
          getRepoIssues(parsed.owner, parsed.repo, 10),
          getRepoPRs(parsed.owner, parsed.repo, 10),
          getRepoCommits(parsed.owner, parsed.repo, 10),
          getRepoContributors(parsed.owner, parsed.repo, 10)
        ])

        return {
          ...repo,
          issues,
          prs,
          commits,
          contributors
        }
      })
    )

    return NextResponse.json(detailedRepos)
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub repositories' },
      { status: 500 }
    )
  }
}
