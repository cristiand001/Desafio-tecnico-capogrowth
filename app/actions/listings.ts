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
    // 1. Get access token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("ml_access_token")?.value;

    console.log("=== Analyzing Listing ===");
    console.log("Item ID:", itemId);
    console.log("Has token:", !!token);

    if (!token) {
      throw new Error("Not authenticated with MercadoLibre");
    }

    // 2. Fetch data from MercadoLibre API
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

    // 2. Guardado en Supabase (Con UPSERT corregido)
    const supabase = getSupabaseClient();

    // Guardar publicación
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
        { onConflict: "item_id" } // Evita error de duplicado
      )
      .select()
      .single();

    if (listingError)
      throw new Error(`Error saving listing: ${listingError.message}`);

    const listingDbId = savedListing.id;

    // Guardar descripción (Agregado onConflict)
    const { error: descError } = await supabase
      .from("listing_descriptions")
      .upsert(
        {
          listing_id: listingDbId,
          plain_text: description.plain_text,
        },
        { onConflict: "listing_id" } // Clave para que el botón no se trabe
      );

    if (descError)
      throw new Error(`Error saving description: ${descError.message}`);

    // 3. IA y Recomendaciones
    const recommendations = await analyzePublication(listing, description);

    // 4. Guardar Análisis (CAMBIADO de insert a UPSERT)
    // Esto es lo que hacía que el botón no respondiera al segundo clic
    const { error: analysisError } = await supabase.from("ai_analyses").upsert(
      {
        listing_id: listingDbId,
        recommendations: recommendations,
      },
      { onConflict: "listing_id" }
    );

    if (analysisError)
      throw new Error(`Error saving analysis: ${analysisError.message}`);

    return {
      listing,
      description,
      analysis: recommendations,
    };
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
          // --- 2. INTENTO DE MEJORA ---
          const fullItem = await getItemDetails(item.id, token);
          return {
            ...baseData,
            price: fullItem.price ?? baseData.price,
            available_quantity:
              fullItem.available_quantity ?? baseData.available_quantity,
            sold_quantity: fullItem.sold_quantity ?? baseData.sold_quantity,
          };
        } catch (error) {
          console.warn(`Aviso: Usando datos de búsqueda para ${item.id}`);
          return baseData;
        }
      })
    );

    return listingsWithDetails;
  } catch (error) {
    console.error("Error en fetchUserListings:", error);
    throw error;
  }
}
