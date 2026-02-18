/**
 * Clawdbot Integration Helper
 * Provides functions to interact with Clawdbot CLI from Mission Control
 */

import { execSync } from 'child_process'

export interface ClawdbotResponse {
  runId: string
  status: string
  summary: string
  result: {
    payloads: Array<{
      text: string
      mediaUrl?: string
    }>
    meta?: any
  }
}

export interface ClawdbotError {
  type: 'not_running' | 'timeout' | 'parse_error' | 'unknown'
  message: string
  originalError?: any
}

/**
 * Call Clawdbot agent with a message and return the response
 */
export async function callClawdbot(
  instruction: string,
  options: {
    sessionId?: string
    timeout?: number
    json?: boolean
  } = {}
): Promise<ClawdbotResponse> {
  const {
    sessionId = 'mission-control',
    timeout = 30,
    json = true
  } = options

  try {
    // Escape double quotes in the instruction
    const escapedInstruction = instruction.replace(/"/g, '\\"')
    
    // Build the command
    const args = [
      'clawdbot',
      'agent',
      `--message "${escapedInstruction}"`,
      `--session-id ${sessionId}`,
      `--timeout ${timeout}`
    ]
    
    if (json) {
      args.push('--json')
    }
    
    const command = args.join(' ')
    
    // Execute the command
    const output = execSync(command, {
      encoding: 'utf-8',
      timeout: (timeout + 5) * 1000, // Add 5 seconds buffer
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    })
    
    // Parse the JSON response
    const response = JSON.parse(output) as ClawdbotResponse
    
    // Validate response
    if (!response.result || !response.result.payloads || response.result.payloads.length === 0) {
      throw new Error('No payloads in Clawdbot response')
    }
    
    return response
    
  } catch (error: any) {
    throw handleClawdbotError(error)
  }
}

/**
 * Extract JSON from Clawdbot response
 * Handles new response format with payloads
 */
export function extractJSON<T = any>(response: ClawdbotResponse | string): T {
  let content: string
  
  // If response is the full ClawdbotResponse object, extract the text
  if (typeof response === 'object' && 'result' in response) {
    if (!response.result?.payloads?.[0]?.text) {
      throw new Error('Empty response content')
    }
    content = response.result.payloads[0].text
  } else if (typeof response === 'string') {
    content = response
  } else {
    throw new Error('Invalid response format')
  }
  
  if (!content) {
    throw new Error('Empty response content')
  }
  
  // Try to extract JSON from markdown code block
  const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1])
    } catch (e) {
      throw new Error(`Failed to parse JSON from code block: ${e}`)
    }
  }
  
  // Try to find JSON object directly
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch (e) {
      throw new Error(`Failed to parse JSON from content: ${e}`)
    }
  }
  
  // If content itself is valid JSON
  try {
    return JSON.parse(content)
  } catch (e) {
    throw new Error('No valid JSON found in response')
  }
}

/**
 * Handle and classify Clawdbot errors
 */
export function handleClawdbotError(error: any): ClawdbotError {
  const message = error?.message || String(error)
  
  // Clawdbot gateway not running
  if (
    message.includes('ECONNREFUSED') ||
    message.includes('connect ECONNREFUSED') ||
    message.includes('gateway is not running') ||
    message.includes('command not found: clawdbot')
  ) {
    return {
      type: 'not_running',
      message: 'Clawdbot gateway is not running. Start it with: clawdbot gateway start',
      originalError: error
    }
  }
  
  // Timeout
  if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
    return {
      type: 'timeout',
      message: 'Request to Clawdbot timed out. Try again or simplify your request.',
      originalError: error
    }
  }
  
  // JSON parsing error
  if (message.includes('JSON') || message.includes('parse')) {
    return {
      type: 'parse_error',
      message: 'Could not parse Clawdbot response. Please try again.',
      originalError: error
    }
  }
  
  // Unknown error
  return {
    type: 'unknown',
    message: `Clawdbot error: ${message}`,
    originalError: error
  }
}

/**
 * Check if Clawdbot is running and accessible
 */
export async function checkClawdbotStatus(): Promise<boolean> {
  try {
    execSync('clawdbot gateway status', {
      encoding: 'utf-8',
      timeout: 5000
    })
    return true
  } catch {
    return false
  }
}

/**
 * Parse a task creation prompt using Clawdbot
 */
export async function parseTaskWithClawdbot(prompt: string): Promise<any> {
  const today = new Date().toISOString().split('T')[0]
  
  const instruction = `Parse this task creation request into structured JSON.

User request: "${prompt}"

Return ONLY a JSON object with these fields:
{
  "title": "task title (required)",
  "description": "optional description",
  "priority": "low|medium|high|urgent (default: medium)",
  "dueDate": "YYYY-MM-DD or null",
  "tags": ["tag1", "tag2"],
  "assignedTo": "agent|user|specific name|null",
  "projectId": "project name or null"
}

Important:
- Today is ${today}
- Handle relative dates: "tomorrow", "next friday", "in 3 days"
- Extract tags from context (e.g., "bug fix" → ["bug", "fix"])
- If priority not mentioned, default to "medium"
- Keep title concise, details in description

Return ONLY the JSON object, no additional text.`

  const response = await callClawdbot(instruction)
  const taskData = extractJSON(response)
  
  return taskData
}

/**
 * Parse a calendar event prompt using Clawdbot
 */
export async function parseEventWithClawdbot(prompt: string): Promise<any> {
  const now = new Date().toISOString()
  
  const instruction = `Parse this calendar event request into structured JSON.

User request: "${prompt}"

Return ONLY a JSON object with these fields:
{
  "title": "event title (required)",
  "description": "optional description",
  "startTime": "YYYY-MM-DDTHH:MM:SS (required)",
  "endTime": "YYYY-MM-DDTHH:MM:SS (required)",
  "location": "optional location",
  "attendees": ["person@email.com"]
}

Important:
- Current time is ${now}
- Handle relative dates/times: "tomorrow at 2pm", "next Monday morning"
- Default duration is 1 hour if not specified
- Parse time formats flexibly: "2pm", "14:00", "2:30 PM"
- Round times to nearest 15 minutes

Return ONLY the JSON object, no additional text.`

  const response = await callClawdbot(instruction)
  const eventData = extractJSON(response)
  
  return eventData
}

/**
 * Check if an action requires approval via Clawdbot
 */
export async function checkApprovalRequired(
  action: string,
  context: any
): Promise<{
  requiresApproval: boolean
  reason: string
  riskLevel: 'low' | 'medium' | 'high'
  category: string
}> {
  const instruction = `Analyze if this action requires approval.

Action: ${action}
Context: ${JSON.stringify(context, null, 2)}

Consider:
- Risk level (file deletion, API calls, deployments)
- Sensitivity of data
- Reversibility of action
- User preferences in approval-rules skill (if available)

Return ONLY a JSON object:
{
  "requiresApproval": true|false,
  "reason": "why it requires approval or why not",
  "riskLevel": "low|medium|high",
  "category": "file_delete|api_call|deployment|data_change|custom"
}

Return ONLY the JSON object, no additional text.`

  const response = await callClawdbot(instruction)
  const approvalDecision = extractJSON(response)
  
  return approvalDecision
}
