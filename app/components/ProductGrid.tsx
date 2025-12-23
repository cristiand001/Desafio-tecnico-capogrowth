"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchUserListings, UserListing } from "@/app/actions/listings";
import { analyzeListing } from "@/app/actions/listings";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { Variants } from "framer-motion";

interface ProductGridProps {
  onAnalysisStart?: (itemId: string) => void;
  onAnalysisComplete?: (itemId: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const conditionOptions = ["new", "used", "refurbished"] as const;
type ConditionType = (typeof conditionOptions)[number];

export function ProductGrid({
  onAnalysisStart,
  onAnalysisComplete,
}: ProductGridProps) {
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(1000);
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserListings();
        setListings(data);

        // Set max price for filter
        if (data.length > 0) {
          const maxPrice = Math.max(...data.map((l) => l.price));
          setMaxPriceFilter(maxPrice);
        }
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

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(listings.map((l) => l.category_id).filter(Boolean));
    return Array.from(cats);
  }, [listings]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Search filter
      if (
        searchQuery &&
        !listing.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (
        selectedCategory !== "all" &&
        listing.category_id !== selectedCategory
      ) {
        return false;
      }

      // Price filter
      if (listing.price > maxPriceFilter) {
        return false;
      }

      // Condition filter
      if (
        selectedCondition !== "all" &&
        listing.condition !== selectedCondition
      ) {
        return false;
      }

      return true;
    });
  }, [
    listings,
    searchQuery,
    selectedCategory,
    maxPriceFilter,
    selectedCondition,
  ]);

  const handleQuickAnalysis = async (itemId: string) => {
    if (analyzingId) return; // Prevent multiple simultaneous analyses

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

  const maxPrice = useMemo(() => {
    return listings.length > 0
      ? Math.max(...listings.map((l) => l.price))
      : 1000;
  }, [listings]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full p-8 bg-red-50/80 backdrop-blur-md rounded-2xl border border-red-200/50"
      >
        <p className="text-red-600 font-medium">{error}</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl p-6 space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Condition
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            >
              <option value="all">All Conditions</option>
              {conditionOptions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond.charAt(0).toUpperCase() + cond.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Max Price: ${maxPriceFilter.toFixed(0)}
            </label>
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-full h-2 bg-white/50 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>$0</span>
              <span>${maxPrice.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-slate-600">
          Showing {filteredListings.length} of {listings.length} listings
        </div>
      </motion.div>

      {/* Product Grid */}
      {filteredListings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20"
        >
          <p className="text-slate-600 font-medium">
            No listings found matching your filters.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredListings.map((listing) => (
              <ProductCard
                key={listing.id}
                listing={listing}
                variants={cardVariants}
                onQuickAnalysis={handleQuickAnalysis}
                isAnalyzing={analyzingId === listing.id}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

interface ProductCardProps {
  listing: UserListing;
  variants: typeof cardVariants;
  onQuickAnalysis: (itemId: string) => void;
  isAnalyzing: boolean;
}

function ProductCard({
  listing,
  variants,
  onQuickAnalysis,
  isAnalyzing,
}: ProductCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency === "ARS" ? "ARS" : "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      variants={variants}
      layout
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {listing.thumbnail ? (
          <img
            src={listing.thumbnail}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
              listing.status === "active"
                ? "bg-green-500/80 text-white"
                : "bg-slate-500/80 text-white"
            }`}
          >
            {listing.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <h3 className="font-semibold text-slate-800 line-clamp-2 min-h-[3rem]">
          {listing.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(listing.price, listing.currency_id)}
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <span>{listing.available_quantity} available</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{listing.sold_quantity} sold</span>
          </div>
        </div>

        {/* Condition */}
        <div className="text-xs">
          <span className="px-2 py-1 bg-slate-100/80 rounded-md text-slate-600">
            {listing.condition.charAt(0).toUpperCase() +
              listing.condition.slice(1)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onQuickAnalysis(listing.id)}
            disabled={isAnalyzing}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Quick Analysis
              </>
            )}
          </button>
          {listing.permalink && (
            <a
              href={listing.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-white/60 backdrop-blur-sm border border-white/30 text-slate-700 rounded-xl font-medium hover:bg-white/80 transition-all duration-200 flex items-center justify-center"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
