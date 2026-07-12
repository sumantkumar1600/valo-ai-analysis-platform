import { NextResponse } from 'next/server';
import { graph } from '@/langchain/graph';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Parse and validate payload
    const body = await request.json();
    const { company } = body;

    if (!company || typeof company !== 'string' || !company.trim()) {
      return NextResponse.json(
        { error: 'Bad Request: "company" name parameter is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    console.log(`[API Analyze] Initializing LangGraph workflow for company: "${company}"`);

    const result = await graph.invoke({
      ticker: company,
      strategy: 'Growth Focus', // Default strategy
      messages: [],
    });

    // 3. Map LangGraph output state to requested JSON response format
    const responsePayload = {
      decision: result.decision || 'PASS',
      score: result.investmentScore || 70,
      confidence: result.confidenceScore || 80,
      strengths: result.swot?.strengths || [],
      weaknesses: result.swot?.weaknesses || [],
      opportunities: result.opportunities || [],
      threats: result.swot?.threats || [],
      news: result.news || [],
      financials: result.financials || {},
      summary: result.reasoning || '',
      markdownReport: result.markdownReport || '',
    };

    // 4. Return success response
    return NextResponse.json(responsePayload, { status: 200 });

  } catch (e: any) {
    console.error('[API Analyze Error]:', e);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: e.message || 'An unexpected error occurred during LangGraph orchestration.' 
      },
      { status: 500 }
    );
  }
}
