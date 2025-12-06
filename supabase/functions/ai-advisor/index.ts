import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are AlphaCard AI, an expert financial assistant specializing in credit card optimization and rewards maximization. Your role is to:

1. **Analyze Spending Patterns**: Review user's transaction history to identify trends, habits, and opportunities for optimization.

2. **Maximize Rewards**: Recommend which card to use for specific purchases based on reward rates, active offers, and category bonuses.

3. **Monitor Points & Rewards**: Track reward balances across cards and suggest the best redemption strategies.

4. **Optimize Card Portfolio**: Advise on card utilization, annual fee value, and whether cards are earning their keep.

5. **Financial Guidance**: Provide tips on credit health, utilization ratios, and strategic spending.

**Communication Style:**
- Be concise but thorough
- Use specific numbers when available
- Prioritize actionable insights
- Be friendly but professional
- Format responses with clear sections when appropriate

**Context**: You have access to the user's card portfolio, transactions, and rewards data which will be provided with each query. Use this data to give personalized, data-driven advice.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, cards, transactions, recentSpending } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from user's financial data
    let dataContext = "";
    
    if (cards && cards.length > 0) {
      dataContext += "\n\n**USER'S CARD PORTFOLIO:**\n";
      cards.forEach((card: any) => {
        const rewardRates = card.reward_rates || {};
        const ratesStr = Object.entries(rewardRates)
          .map(([cat, rate]) => `${cat}: ${rate}%`)
          .join(", ");
        
        dataContext += `- ${card.name} (${card.issuer}): Balance $${card.balance || 0}/${card.credit_limit || 0} limit, Annual Fee $${card.annual_fee || 0}, Rewards: ${card.reward_balance || 0} ${card.reward_type || 'points'}`;
        if (ratesStr) dataContext += `, Rates: ${ratesStr}`;
        dataContext += "\n";
      });
    }

    if (transactions && transactions.length > 0) {
      dataContext += "\n**RECENT TRANSACTIONS (last 10):**\n";
      transactions.slice(0, 10).forEach((tx: any) => {
        dataContext += `- ${tx.merchant}: $${tx.amount} (${tx.category}) on ${tx.transaction_date}\n`;
      });
    }

    if (recentSpending) {
      dataContext += `\n**SPENDING SUMMARY:**\n`;
      Object.entries(recentSpending).forEach(([category, amount]) => {
        dataContext += `- ${category}: $${amount}\n`;
      });
    }

    const userMessage = message + (dataContext ? dataContext : "");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI advisor error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
