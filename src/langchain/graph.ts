import { StateGraph, START, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ResearchState } from './state';
import { researchAgentTools } from './tools';
import { 
  callAgent, 
  fetchFinancials, 
  synthesizeReport 
} from './nodes';

// Initialize the tool execution node
const toolNode = new ToolNode(researchAgentTools);

// Router function to determine if the agent should continue tool execution or proceed to financial extraction
function shouldContinue(state: typeof ResearchState.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage && (lastMessage as any).tool_calls && (lastMessage as any).tool_calls.length > 0) {
    return 'tools';
  }
  return 'financial_extraction';
}

// Compile the state graph
const workflow = new StateGraph(ResearchState)
  .addNode('agent', callAgent)
  .addNode('tools', toolNode)
  .addNode('financial_extraction', fetchFinancials)
  .addNode('synthesis', synthesizeReport)

  // Configure edges
  .addEdge(START, 'agent')
  
  // Conditional router edge: Loop back to tools or move forward to financial extraction
  .addConditionalEdges('agent', shouldContinue, {
    tools: 'tools',
    financial_extraction: 'financial_extraction'
  })
  
  // Edges returning from tools go back to the agent for evaluation
  .addEdge('tools', 'agent')
  
  // Financial analysis transitions directly to report synthesis
  .addEdge('financial_extraction', 'synthesis')
  .addEdge('synthesis', END);

// Compile the graph
export const graph = workflow.compile();
export type GraphType = typeof graph;
