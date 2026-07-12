import { NextResponse } from 'next/server';
import { graph } from '@/langchain/graph';
import { normalizeReportState } from '@/lib/mapping';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { company, strategy } = await request.json();

    if (!company || !company.symbol) {
      return NextResponse.json({ error: 'Verified company object with symbol is required' }, { status: 400 });
    }

    const ticker = company.symbol;
    const companyName = company.name;

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        // Helper to send JSON events
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          sendEvent('log', { text: `[Agent Node] Initializing auditing graph for ${companyName} (${ticker})...`, progress: 10 });
          await new Promise(r => setTimeout(r, 600));

          sendEvent('log', { text: `[Agent Node] Spinning search tools for competitor analysis and products...`, progress: 20 });
          
          // Invoke the compiled graph stream with the verified company details
          const eventStream = await graph.stream({
            ticker,
            company,
            strategy: strategy || 'Growth Focus',
            messages: []
          }, { streamMode: 'values' });

          let lastState: any = null;

          for await (const update of eventStream) {
            lastState = update;
            
            // Check completed node traces inside current message log
            if (update.messages && update.messages.length > 0) {
              const lastMsg = update.messages[update.messages.length - 1];
              if (lastMsg.tool_calls && lastMsg.tool_calls.length > 0) {
                for (const call of lastMsg.tool_calls) {
                  sendEvent('log', { 
                    text: `[Agent Search Tool] Invoking tool: "${call.name}" with args: ${JSON.stringify(call.args)}`,
                    progress: 35 
                  });
                  await new Promise(r => setTimeout(r, 800));
                }
              } else if (lastMsg._getType() === 'ai') {
                sendEvent('log', { text: `[Agent Node] Completed web search research. Processing fundamentals...`, progress: 50 });
                await new Promise(r => setTimeout(r, 600));
              }
            }
            
            if (update.financials) {
              const priceText = update.financials.price !== null ? `$${update.financials.price}` : 'N/A';
              const peText = update.financials.peRatio !== null ? `${update.financials.peRatio}x` : 'N/A';
              const marginText = update.financials.profitMargin !== null ? `${update.financials.profitMargin}%` : 'N/A';

              sendEvent('log', { 
                text: `[Financials Extraction Node] Extracted: Price: ${priceText}, P/E: ${peText}, Margin: ${marginText}`, 
                progress: 75 
              });
              await new Promise(r => setTimeout(r, 800));
            }
          }

          // Complete synthesis phase
          sendEvent('log', { text: `[Synthesis Node] Investment committee reviewing SWOT, risks, and scoring...`, progress: 90 });
          await new Promise(r => setTimeout(r, 1000));

          // Map state keys for response client alignment
          const finalResult = normalizeReportState(ticker, lastState || {}, strategy || 'Growth Focus');

          sendEvent('log', { text: `[Finished] Porting data payload...`, progress: 100 });
          sendEvent('finish', finalResult);
          controller.close();

        } catch (e: any) {
          sendEvent('error', { message: e.message || 'Stream processing failed.' });
          controller.close();
        }
      }
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: any) {
    console.error('[Stream API Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
