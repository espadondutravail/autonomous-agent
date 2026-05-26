import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ACE_API_BASE = "https://api.acedata.cloud/v1";

// Create an axios instance that routes through the Synapse RPC if needed
// For AceDataCloud, we typically pass the API key or rely on x402. 
// We will pass the API key to demonstrate usage, while the Synapse RPC handles the underlying routing.
const getAceClient = () => {
  const apiKey = process.env.ACE_DATA_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error("ACE_DATA_CLOUD_API_KEY is not set in .env");
  }
  
  // If we need to route through Synapse RPC for execution, we would configure the proxy here.
  // For now, we will make direct calls to Ace Data Cloud, which supports x402 facilitator natively.
  return axios.create({
    baseURL: ACE_API_BASE,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Add x402 specific headers if required by the sdk
      "x-payment-protocol": "x402"
    }
  });
};

export async function runTextGeneration(prompt: string) {
  const client = getAceClient();
  console.log(`[AceDataCloud] Requesting text generation for: "${prompt}"`);
  try {
    // Example endpoint for text generation
    const response = await client.post("/completions", {
      model: "gpt-3.5-turbo", // example model
      messages: [{ role: "user", content: prompt }]
    });
    return response.data;
  } catch (error: any) {
    console.error("[AceDataCloud] Text Generation Error:", error.response?.data || error.message);
    return null;
  }
}

export async function runVisionAnalysis(imageUrl: string) {
  const client = getAceClient();
  console.log(`[AceDataCloud] Requesting vision analysis for image: ${imageUrl}`);
  try {
    // Example endpoint for vision
    const response = await client.post("/vision/analyze", {
      image_url: imageUrl,
      features: ["tags", "description"]
    });
    return response.data;
  } catch (error: any) {
    console.error("[AceDataCloud] Vision Analysis Error:", error.response?.data || error.message);
    return null;
  }
}

export async function runTranslation(text: string, targetLanguage: string) {
  const client = getAceClient();
  console.log(`[AceDataCloud] Requesting translation to ${targetLanguage} for: "${text}"`);
  try {
    // Example endpoint for translation
    const response = await client.post("/translate", {
      text: text,
      target_lang: targetLanguage
    });
    return response.data;
  } catch (error: any) {
    console.error("[AceDataCloud] Translation Error:", error.response?.data || error.message);
    return null;
  }
}
