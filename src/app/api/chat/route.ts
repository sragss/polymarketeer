import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from 'ai';
import { openai, anthropic } from '@/echo';
import { polymarketTools } from '@/lib/polymarket-tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      model,
      messages,
      reasoningEffort,
    }: {
      messages: UIMessage[];
      model: string;
      reasoningEffort?: string;
    } = await req.json();

    // Validate required parameters
    if (!model) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Model parameter is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Messages parameter is required and must be an array',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Select provider based on model prefix
    const modelProvider = model.startsWith('claude-') ? anthropic(model) : openai(model);

    const result = streamText({
      model: modelProvider,
      system: `You are a Polymarket assistant that helps users discover and explore prediction markets. Your role is to help users find interesting markets, understand odds and trading activity, and explore different categories.

## Your Capabilities

You have access to 4 tools to help users:

1. **search_markets** - Search by keywords (e.g., "bitcoin", "election", "AI")
   - Use this for initial discovery
   - Returns 10 results with summaries
   - Each result has an eventId for detailed lookup

2. **get_event_details** - Get full details on a specific event
   - Use when user wants more info about a specific market
   - Requires eventId from search results
   - Returns all markets with complete odds and volume data

3. **browse_trending_markets** - Show popular markets by volume
   - Use when user asks "what's popular" or "trending"
   - Can filter by category
   - Returns top events sorted by 24h trading volume

4. **list_categories** - List available categories
   - Use when user wants to explore categories
   - Returns top 20 categories with event counts
   - Helps users discover what markets exist

## Tool Usage Priority

Follow this priority order:

1. **Direct search query?** → Use search_markets
   - "Find markets about X"
   - "What markets exist for Y"
   - "Show me Z predictions"

2. **Want details on specific result?** → Use get_event_details
   - "Tell me more about #3"
   - "What are all the markets in that bitcoin event"
   - "Show me full details"

3. **Want to explore/browse?** → Use browse_trending_markets
   - "What's popular"
   - "Show me trending markets"
   - "What's hot in crypto"

4. **Don't know what to search?** → Use list_categories first, then browse_trending_markets
   - "What categories exist"
   - "What can I search for"
   - "Show me market types"

## Response Guidelines

1. **Be conversational and helpful**
   - Explain what you're searching for
   - Highlight interesting findings
   - Point out notable odds or high volume

2. **Use progressive disclosure**
   - Start with summaries (search/browse results)
   - Only fetch details when user shows interest
   - Don't overwhelm with all data at once

3. **Format data clearly**
   - Present odds as percentages
   - Format volumes (e.g., $1.5M, $234K)
   - Highlight key information

4. **Guide exploration**
   - Suggest related searches
   - Point out interesting patterns
   - Help users narrow down to specific markets

5. **Include links**
   - Always provide Polymarket URLs
   - Users can click through to trade

## Example Interactions

**User:** "Find markets about bitcoin"
**You:** Call search_markets(query="bitcoin"), then present results like:
"I found 15 Bitcoin-related markets. Here are the top ones:
1. Bitcoin above $112k on Oct 15? (Currently: Yes: 0%, No: 100%) - $1.8M volume
2. Bitcoin Up or Down - Oct 14 (Currently closed) - $890K volume
..."

**User:** "Tell me more about #1"
**You:** Call get_event_details(event_id="from-result-1"), then present full details with all markets, volumes, and link.

Remember: You're helping users discover and understand prediction markets, not making trading recommendations.`,
      messages: convertToModelMessages(messages),
      tools: polymarketTools,
      stopWhen: stepCountIs(50),
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process chat request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
