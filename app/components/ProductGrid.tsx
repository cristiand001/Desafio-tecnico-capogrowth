"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchUserListings,
  UserListing,
  analyzeListing,
} from "@/app/actions/listings";
import { GlassCard } from "./GlassCard";

interface ProductGridProps {
  onAnalysisStart?: (itemId: string) => void;
  onAnalysisComplete?: (itemId: string) => void;
}

export function ProductGrid({
  onAnalysisStart,
  onAnalysisComplete,
}: ProductGridProps) {
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserListings();
        console.log("Listings loaded:", data); // Debug
        setListings(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load listings"
        );
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (
        searchQuery &&
        !listing.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !listing.id.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [listings, searchQuery]);

  const handleQuickAnalysis = async (itemId: string) => {
    if (analyzingId) return;

    try {
      setAnalyzingId(itemId);
      onAnalysisStart?.(itemId);
      await analyzeListing(itemId);
      onAnalysisComplete?.(itemId);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <GlassCard key={i} className="h-80 animate-pulse">
            <div className="w-full h-full bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl"></div>
          </GlassCard>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <p className="text-red-400 text-sm text-center">{error}</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <input
        type="text"
        placeholder="Buscar por título o código MLA..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
      />

      {/* Results Count */}
      <div className="text-sm text-foreground/60 text-center">
        {filteredListings.length} de {listings.length} publicaciones
      </div>

      {/* Grid */}
      {filteredListings.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-foreground/60">No se encontraron publicaciones</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredListings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <GlassCard
                  className={`overflow-hidden hover:border-glow transition-all duration-300 h-full cursor-pointer ${
                    analyzingId === listing.id ? "opacity-50" : ""
                  }`}
                  onClick={() => handleQuickAnalysis(listing.id)}
                >
                  <div className="flex flex-col h-full">
                    {/* Image */}
                    <div className="relative w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                      {listing.thumbnail ? (
                        <img
                          src={listing.thumbnail}
                          alt={listing.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-foreground/20 text-4xl">📦</div>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                            listing.status === "active"
                              ? "bg-green-500/90 text-white"
                              : "bg-slate-500/90 text-white"
                          }`}
                        >
                          {listing.status}
                        </span>
                      </div>

                      {/* Analyzing Overlay */}
                      {analyzingId === listing.id && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-white text-sm font-semibold">
                              Analizando...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                      {/* Código MLA */}
                      <div className="text-xs font-mono text-primary/80 font-semibold">
                        {listing.id}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-foreground line-clamp-2 min-h-[3rem] text-sm leading-snug">
                        {listing.title}
                      </h3>

                      {/* Price */}
                      <div
                        className="text-2xl font-bold"
                        style={{
                          background:
                            "linear-gradient(135deg, #00f5ff 0%, #a855f7 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {listing.currency_id} $
                        {listing.price?.toLocaleString() || "0"}
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 text-xs text-foreground/60 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <span>📦</span>
                          <span>{listing.available_quantity || 0} stock</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>✓</span>
                          <span>{listing.sold_quantity || 0} vendidos</span>
                        </div>
                      </div>

                      {/* Hint */}
                      <div className="text-xs text-center text-foreground/40 pt-2 border-t border-white/5">
                        Click para analizar
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
