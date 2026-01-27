
import { GoogleGenAI } from "@google/genai";
import { Sale, Product } from "../types";

export const getBusinessInsights = async (sales: Sale[], products: Product[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare a summary for AI
  const recentSales = sales.slice(-20);
  const salesSummary = recentSales.map(s => ({
    total: s.total,
    items: s.items.map(i => i.name).join(', '),
    date: new Date(s.timestamp).toLocaleDateString()
  }));

  const prompt = `
    As a retail business consultant, analyze these recent sales data and provide 3 short, actionable business insights:
    Data: ${JSON.stringify(salesSummary)}
    Total Inventory Value: ${products.reduce((acc, p) => acc + (p.price * p.stock), 0)}
    
    Return the response as a simple list of 3 bullet points. Be concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Focus on high-margin items. Monitor stock levels closely. Promote bundles for slow-moving categories.";
  }
};
