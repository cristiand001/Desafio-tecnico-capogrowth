// Mercado Libre Listing (from ML API / database)
export interface MLListing {
  item_id: string;
  title: string;
  price: number;
  status: string;
  available_quantity: number;
  sold_quantity: number;
  category_id: string | null;
  permalink: string | null;
}

// Listing Description (stored separately)
export interface ListingDescription {
  listing_id: string;
  plain_text: string;
}

// AI Analysis Recommendations structure
export interface AnalysisRecommendations {
  title_improvements: string[];
  description_issues: string[];
  conversion_opportunities: string[];
  commercial_risks: string[];
}

// AI Analysis result
export interface AIAnalysis {
  listing_id: string;
  recommendations: AnalysisRecommendations;
}
