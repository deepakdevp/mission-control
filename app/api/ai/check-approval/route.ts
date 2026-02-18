import { NextRequest, NextResponse } from 'next/server'
import { checkApprovalRequired } from '@/lib/clawdbot'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { action, context } = await request.json()

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Check with Clawdbot if approval is required
    const decision = await checkApprovalRequired(action, context || {})

    // If approval is required, create an approval entry in the database
    if (decision.requiresApproval) {
      const approval = await prisma.approval.create({
        data: {
          title: action,
          description: decision.reason,
          requestedBy: 'mission-control',
          metadata: JSON.stringify({
            context,
            riskLevel: decision.riskLevel,
            category: decision.category
          })
        }
      })

      return NextResponse.json({
        ...decision,
        approvalId: approval.id
      })
    }

    return NextResponse.json(decision)
  } catch (error) {
    console.error('Approval check error:', error)
    return NextResponse.json(
      { error: 'Failed to check approval requirements' },
      { status: 500 }
    )
  }
}
