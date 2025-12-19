"use server";

import Groq from "groq-sdk";
import {
  MLListing,
  ListingDescription,
  AnalysisRecommendations,
} from "@/types";

export async function analyzePublication(
  listing: MLListing,
  description: ListingDescription
): Promise<AnalysisRecommendations> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured");
  }

  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an e-commerce optimization expert for MercadoLibre. Analyze listings and provide actionable recommendations in JSON format with these exact fields: title_improvements, description_issues, conversion_opportunities, commercial_risks. Each field must be an array of strings.",
        },
        {
          role: "user",
          content: `Analyze this MercadoLibre listing:

Title: ${listing.title}
Price: $${listing.price}
Status: ${listing.status}
Available: ${listing.available_quantity} units
Sold: ${listing.sold_quantity} units
Category: ${listing.category_id || "Not specified"}

Description:
${description.plain_text}

Provide recommendations in JSON format.`,
        },
      ],
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error("Groq returned an empty response");
    }

    try {
      const recommendations = JSON.parse(content) as AnalysisRecommendations;
      return recommendations;
    } catch (parseError) {
      throw new Error(
        `Failed to parse Groq response as JSON: ${
          parseError instanceof Error
            ? parseError.message
            : "Unknown parsing error"
        }`
      );
    }
  } catch (error) {
    if (error instanceof Groq.APIError) {
      throw new Error(`Groq API error: ${error.message}`);
    }
    throw error;
  }
}
