import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

interface DisruptionInput {
  type: string;
  severity: string;
  title: string;
  description?: string;
  vessel_info?: {
    vessel_id?: string;
    current_lat?: number;
    current_lng?: number;
  };
}

interface GeminiAnalysisResult {
  summary: string;
  recommendation: string;
  estimatedCost: number;
  riskLevel: string;
  actions: string[];
}

const MOCK_RESPONSE: GeminiAnalysisResult = {
  summary: 'Disruption detected. Immediate assessment required.',
  recommendation: 'Monitor situation closely and prepare contingency plans.',
  estimatedCost: 50000,
  riskLevel: 'MEDIUM',
  actions: ['Notify relevant stakeholders', 'Assess alternative routes', 'Update ETA'],
};

export async function generateDisruptionAnalysis(input: DisruptionInput): Promise<GeminiAnalysisResult> {
  if (!env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set, returning mock response');
    return MOCK_RESPONSE;
  }

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a maritime supply chain AI assistant. Analyze this disruption and provide a JSON response.

Disruption Details:
- Type: ${input.type}
- Severity: ${input.severity}
- Title: ${input.title}
- Description: ${input.description || 'No additional description'}
- Location: ${input.vessel_info?.current_lat || 'Unknown'}, ${input.vessel_info?.current_lng || 'Unknown'}

Respond with ONLY valid JSON in this exact format:
{
  "summary": "Brief summary of the disruption and its impact",
  "recommendation": "Specific action recommendation",
  "estimatedCost": <number in USD>,
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "actions": ["action1", "action2", "action3"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return MOCK_RESPONSE;
    return JSON.parse(jsonMatch[0]) as GeminiAnalysisResult;
  } catch (err) {
    console.error('Gemini API error:', err);
    return MOCK_RESPONSE;
  }
}

export async function generateRouteRecommendation(shipmentDetails: {
  origin: string;
  destination: string;
  disruption: string;
  currentPosition?: { lat: number; lng: number };
}): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    return `Based on the disruption "${shipmentDetails.disruption}", consider alternative routing options to minimize delay and cost impact. Evaluate rerouting via alternative maritime corridors.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `As a maritime routing expert, provide a brief recommendation for this scenario:
Origin: ${shipmentDetails.origin}
Destination: ${shipmentDetails.destination}
Active Disruption: ${shipmentDetails.disruption}
Current Position: ${shipmentDetails.currentPosition?.lat || 'Unknown'}, ${shipmentDetails.currentPosition?.lng || 'Unknown'}

Provide a 2-3 sentence routing recommendation.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('Gemini API error:', err);
    return `Recommend evaluating alternative routing options due to: ${shipmentDetails.disruption}`;
  }
}
