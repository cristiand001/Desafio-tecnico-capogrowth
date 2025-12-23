"use server";

import { cookies } from "next/headers";
import {
  getItemDetails,
  getItemDescription,
  getUserListings,
  MLItemResponse,
  MLDescriptionResponse,
} from "@/lib/mercadolibre";
import getSupabaseClient from "@/lib/supabase";
import { analyzePublication } from "@/lib/openai";
import {
  MLListing,
  ListingDescription,
  AnalysisRecommendations,
} from "@/types";

export interface UserListing {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  status: string;
  available_quantity: number;
  sold_quantity: number;
  category_id: string;
  permalink: string;
  thumbnail: string;
  condition: string;
}

interface AnalyzeListingResult {
  listing: MLListing;
  description: ListingDescription;
  analysis: AnalysisRecommendations;
}

export async function analyzeListing(
  itemId: string
): Promise<AnalyzeListingResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ml_access_token")?.value;
    if (!token) throw new Error("Not authenticated with MercadoLibre");

    const itemData: MLItemResponse = await getItemDetails(itemId, token);
    const descData: MLDescriptionResponse = await getItemDescription(
      itemId,
      token
    );

    const listing: MLListing = {
      item_id: itemData.id,
      title: itemData.title,
      price: itemData.price,
      status: itemData.status,
      available_quantity: itemData.available_quantity,
      sold_quantity: itemData.sold_quantity,
      category_id: itemData.category_id || null,
      permalink: itemData.permalink || null,
    };

    const description: ListingDescription = {
      listing_id: itemId,
      plain_text:
        descData.plain_text || descData.text || "Sin descripción disponible.",
    };

    const supabase = getSupabaseClient();

    const { data: savedListing, error: listingError } = await supabase
      .from("listings")
      .upsert(
        {
          item_id: listing.item_id,
          title: listing.title,
          price: listing.price,
          status: listing.status,
          available_quantity: listing.available_quantity,
          sold_quantity: listing.sold_quantity,
          category_id: listing.category_id,
          permalink: listing.permalink,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "item_id" }
      )
      .select()
      .single();

    if (listingError)
      throw new Error(`Failed to save listing: ${listingError.message}`);

    const listingDbId = savedListing.id;

    // IMPORTANTE: Agregamos onConflict aquí para que el botón no se trabe
    await supabase
      .from("listing_descriptions")
      .upsert(
        { listing_id: listingDbId, plain_text: description.plain_text },
        { onConflict: "listing_id" }
      );

    const recommendations = await analyzePublication(listing, description);

    // IMPORTANTE: Cambiamos a upsert aquí también
    await supabase
      .from("ai_analyses")
      .upsert(
        { listing_id: listingDbId, recommendations: recommendations },
        { onConflict: "listing_id" }
      );

    return { listing, description, analysis: recommendations };
  } catch (error: any) {
    console.error("Error in analyzeListing:", error);
    throw new Error(`Listing analysis failed: ${error.message}`);
  }
}

export async function fetchUserListings(): Promise<UserListing[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ml_access_token")?.value;
    const userId = cookieStore.get("ml_user_id")?.value;

    if (!token || !userId) throw new Error("No autenticado");

    const searchResponse = await getUserListings(userId, token, 0, 50);

    const listingsWithDetails = await Promise.all(
      searchResponse.results.map(async (item) => {
        // DATOS BASE: Si falla el detalle, esto salva el precio
        const baseData = {
          id: item.id,
          title: item.title,
          price: (item as any).price ?? (item as any).sale_price ?? 0,
          currency_id: item.currency_id || "ARS",
          status: item.status,
          available_quantity: item.available_quantity || 0,
          sold_quantity: item.sold_quantity || 0,
          category_id: item.category_id,
          permalink: item.permalink,
          thumbnail: item.thumbnail,
          condition: item.condition,
        };

        try {
          const fullItem = await getItemDetails(item.id, token);
          return {
            ...baseData,
            price: fullItem.price ?? baseData.price,
            available_quantity:
              fullItem.available_quantity ?? baseData.available_quantity,
            sold_quantity: fullItem.sold_quantity ?? baseData.sold_quantity,
          };
        } catch (error) {
          return baseData; // Si falla el detalle individual, devolvemos la base
        }
      })
    );

    return listingsWithDetails;
  } catch (error) {
    console.error("Error en fetchUserListings:", error);
    return []; // No tiramos error para que no se rompa la pantalla
  }
}
