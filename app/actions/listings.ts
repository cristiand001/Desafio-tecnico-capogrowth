'use server'

import { cookies } from 'next/headers'
import {
  getItemDetails,
  getItemDescription,
  MLItemResponse,
  MLDescriptionResponse,
} from '@/lib/mercadolibre'
import getSupabaseClient from '@/lib/supabase'
import { analyzePublication } from '@/lib/openai'
import { MLListing, ListingDescription, AnalysisRecommendations } from '@/types'

interface AnalyzeListingResult {
  listing: MLListing
  description: ListingDescription
  analysis: AnalysisRecommendations
}

export async function analyzeListing(itemId: string): Promise<AnalyzeListingResult> {
  try {
    // 1. Get access token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('ml_access_token')?.value

    if (!token) {
      throw new Error('Not authenticated with MercadoLibre')
    }

    // 2. Fetch data from MercadoLibre API
    console.log(`Fetching item details for ${itemId}...`)
    const itemData: MLItemResponse = await getItemDetails(itemId, token)

    console.log(`Fetching description for ${itemId}...`)
    const descData: MLDescriptionResponse = await getItemDescription(itemId, token)

    // 3. Transform to database format
    const listing: MLListing = {
      item_id: itemData.id,
      title: itemData.title,
      price: itemData.price,
      status: itemData.status,
      available_quantity: itemData.available_quantity,
      sold_quantity: itemData.sold_quantity,
      category_id: itemData.category_id || null,
      permalink: itemData.permalink || null,
    }

    const description: ListingDescription = {
      listing_id: itemId, // Will be updated with actual DB ID
      plain_text: descData.plain_text || descData.text || '',
    }

    // 4. Save to Supabase
    const supabase = getSupabaseClient()

    // Upsert listing
    console.log(`Saving listing to database...`)
    const { data: savedListing, error: listingError } = await supabase
      .from('listings')
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
        { onConflict: 'item_id' }
      )
      .select()
      .single()

    if (listingError) {
      console.error('Error saving listing:', listingError)
      throw new Error(`Failed to save listing: ${listingError.message}`)
    }

    const listingDbId = savedListing.id

    // Insert description
    console.log(`Saving description to database...`)
    const { error: descError } = await supabase
      .from('listing_descriptions')
      .insert({
        listing_id: listingDbId,
        plain_text: description.plain_text,
      })

    if (descError) {
      console.error('Error saving description:', descError)
      throw new Error(`Failed to save description: ${descError.message}`)
    }

    // Update description with actual listing ID
    description.listing_id = listingDbId

    // 5. Analyze with AI
    console.log(`Analyzing listing with AI...`)
    const recommendations = await analyzePublication(listing, description)

    // 6. Save analysis to database
    console.log(`Saving AI analysis to database...`)
    const { error: analysisError } = await supabase
      .from('ai_analyses')
      .insert({
        listing_id: listingDbId,
        recommendations: recommendations,
      })

    if (analysisError) {
      console.error('Error saving analysis:', analysisError)
      throw new Error(`Failed to save analysis: ${analysisError.message}`)
    }

    console.log(`Analysis complete for ${itemId}`)

    return {
      listing,
      description,
      analysis: recommendations,
    }
  } catch (error) {
    console.error('Error in analyzeListing:', error)

    if (error instanceof Error) {
      throw new Error(`Listing analysis failed: ${error.message}`)
    }

    throw new Error('Listing analysis failed: Unknown error')
  }
}

