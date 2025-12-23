"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthURL } from "@/lib/mercadolibre";
import { analyzeListing } from "@/app/actions/listings";
import { MLListing, AnalysisRecommendations } from "@/types";

interface AnalysisResult {
  listing: MLListing;
  description: { listing_id: string; plain_text: string };
  analysis: AnalysisRecommendations;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  );
}

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [itemId, setItemId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const success = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (success === "true") {
      setIsAuthenticated(true);
      router.replace("/", { scroll: false });
    }

    if (errorParam) {
      setError(
        errorParam === "auth_failed"
          ? "Authentication failed. Please try again."
          : `Error: ${errorParam}`
      );
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  const handleConnect = async () => {
    try {
      const authUrl = await getAuthURL();
      window.location.href = authUrl;
    } catch (err) {
      setError("Failed to get authentication URL");
    }
  };

  const handleAnalyze = async () => {
    if (!itemId.trim()) {
      setError("Please enter a valid Item ID");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const analysisResult = await analyzeListing(itemId.trim());
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              RataLibre
            </h1>
            <p className="text-slate-600">AI-powered listing optimization</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleConnect}
              className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
            >
              Connect with MercadoLibre
            </button>

            <p className="text-center text-xs text-slate-500 mt-4">
              🔒 Secure OAuth2 authentication
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { emoji: "⚡", text: "Instant" },
              { emoji: "🎯", text: "Accurate" },
              { emoji: "📈", text: "Results" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white rounded-xl p-4 text-center shadow-sm"
              >
                <div className="text-2xl mb-1">{item.emoji}</div>
                <p className="text-sm text-slate-600">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 text-sm font-medium">
              Connected
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Analyze Your Listing
          </h1>
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="Enter listing ID (e.g., MLA123456789)"
              className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              onKeyDown={(e) =>
                e.key === "Enter" && !loading && handleAnalyze()
              }
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !itemId.trim()}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>Analyze</>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Analyzing...
              </h3>
              <p className="text-slate-600 text-sm">Getting AI insights</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Listing Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  {result.listing.title}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                    <p className="text-xs text-green-600 font-medium mb-1">
                      Price
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      ${result.listing.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                    <p className="text-xs text-blue-600 font-medium mb-1">
                      Stock
                    </p>
                    <p className="text-2xl font-bold text-blue-700">
                      {result.listing.available_quantity}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4">
                    <p className="text-xs text-purple-600 font-medium mb-1">
                      Sold
                    </p>
                    <p className="text-2xl font-bold text-purple-700">
                      {result.listing.sold_quantity}
                    </p>
                  </div>

                  <div
                    className={`bg-gradient-to-br ${
                      result.listing.status === "active"
                        ? "from-green-50 to-emerald-50"
                        : "from-yellow-50 to-amber-50"
                    } rounded-xl p-4`}
                  >
                    <p
                      className={`text-xs font-medium mb-1 ${
                        result.listing.status === "active"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      Status
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        result.listing.status === "active"
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {result.listing.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                  AI Recommendations
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <span>💡</span> Title Improvements
                    </h3>
                    <ul className="space-y-2">
                      {result.analysis.title_improvements.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-slate-700 flex items-start gap-2"
                        >
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Description */}
                  <div className="bg-red-50 rounded-xl p-4">
                    <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <span>⚠️</span> Description Issues
                    </h3>
                    <ul className="space-y-2">
                      {result.analysis.description_issues.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-slate-700 flex items-start gap-2"
                        >
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <span>📈</span> Opportunities
                    </h3>
                    <ul className="space-y-2">
                      {result.analysis.conversion_opportunities.map(
                        (item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-slate-700 flex items-start gap-2"
                          >
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div className="bg-orange-50 rounded-xl p-4">
                    <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                      <span>🚨</span> Risks
                    </h3>
                    <ul className="space-y-2">
                      {result.analysis.commercial_risks.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-slate-700 flex items-start gap-2"
                        >
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setResult(null);
                    setItemId("");
                  }}
                  className="px-8 py-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  Analyze Another Listing
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PageContent />
    </Suspense>
  );
}
