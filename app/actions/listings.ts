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
    if (!token) throw new Error("No autenticado con MercadoLibre");

    // 1. Obtener datos (Manual o desde botón)
    const itemData = await getItemDetails(itemId, token);
    const descData = await getItemDescription(itemId, token);

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

    // 2. Guardar con UPSERT (Evita que el botón se trabe si ya existe el ID)
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

    if (listingError) throw listingError;

    const listingDbId = savedListing.id;

    // Guardar descripción
    await supabase.from("listing_descriptions").upsert(
      {
        listing_id: listingDbId,
        plain_text: description.plain_text,
      },
      { onConflict: "listing_id" }
    );

    // 3. IA
    const recommendations = await analyzePublication(listing, description);

    // Guardar análisis
    await supabase.from("ai_analyses").upsert(
      {
        listing_id: listingDbId,
        recommendations: recommendations,
      },
      { onConflict: "listing_id" }
    );

    return { listing, description, analysis: recommendations };
  } catch (error: any) {
    console.error("Error en analyzeListing:", error);
    throw new Error(error.message || "Error al analizar");
  }
}

export async function fetchUserListings(): Promise<UserListing[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ml_access_token")?.value;
    const userId = cookieStore.get("ml_user_id")?.value;

    if (!token || !userId) throw new Error("Sesión expirada");

    const searchResponse = await getUserListings(userId, token, 0, 50);

    // LA CLAVE: No pedimos getItemDetails para 50 items a la vez.
    // Usamos los datos que ya trae el searchResponse para que la lista cargue rápido y con PRECIO.
    return searchResponse.results.map((item: any) => ({
      id: item.id,
      title: item.title,
      price: Number(item.price || 0), // Asegura que no sea 0 si la API lo manda
      currency_id: item.currency_id || "ARS",
      status: item.status,
      available_quantity: Number(item.available_quantity || 0),
      sold_quantity: Number(item.sold_quantity || 0),
      category_id: item.category_id,
      permalink: item.permalink,
      thumbnail: item.thumbnail,
      condition: item.condition,
    }));
  } catch (error) {
    console.error("Error en fetchUserListings:", error);
    return [];
  }
}
