"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthURL } from "@/lib/mercadolibre";
import { analyzeListing } from "@/app/actions/listings";
import { MLListing, AnalysisRecommendations } from "@/types";
import { ProductGrid } from "@/app/components/ProductGrid";
import { AnimatedBackground } from "@/app/components/AnimatedBackground";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { FeatureCard } from "@/app/components/FeatureCard";

interface AnalysisResult {
  listing: MLListing;
  description: { listing_id: string; plain_text: string };
  analysis: AnalysisRecommendations;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-xl shadow-xl mb-4"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
        </motion.div>
        <motion.p
          className="text-slate-700 font-semibold"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </motion.div>
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
      <div className="min-h-screen py-12 px-4 relative overflow-hidden">
        <AnimatedBackground />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <ScrollReveal delay={0.1}>
            <motion.div className="text-center mb-12 pt-8">
              <motion.h1
                className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                style={{ backgroundSize: "200%" }}
              >
                RataLibre
              </motion.h1>
              <motion.p
                className="text-lg text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                AI-Powered insights to optimize your listings
              </motion.p>
            </motion.div>
          </ScrollReveal>

          {/* Hero Card */}
          <ScrollReveal delay={0.3}>
            <motion.div
              className="bg-white/40 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/50 p-8 max-w-md mx-auto mb-12"
              whileHover={{ y: -5 }}
            >
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-50/80 backdrop-blur-xl border border-red-200"
                  >
                    <p className="text-red-700 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center">
                <motion.button
                  onClick={handleConnect}
                  className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-semibold rounded-xl shadow-lg transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Connect with MercadoLibre
                </motion.button>
                <p className="mt-4 text-slate-500 text-xs">
                  🔒 Secure OAuth2 • Your data stays private
                </p>
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Features */}
          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
                title="Instant Analysis"
                description="Get AI recommendations in seconds"
                delay={0.1}
                gradient="bg-gradient-to-br from-violet-500 to-violet-600"
              />
              <FeatureCard
                icon={
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                title="Actionable Insights"
                description="Clear steps to improve conversions"
                delay={0.2}
                gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              />
              <FeatureCard
                icon={
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                }
                title="Boost Sales"
                description="Optimize for maximum revenue"
                delay={0.3}
                gradient="bg-gradient-to-br from-fuchsia-500 to-fuchsia-600"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 py-6 px-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Compact Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-xl border border-white/50 mb-3">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-green-500"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-green-700 text-xs font-semibold">
              Connected
            </span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            My Listings
          </h1>
        </motion.div>

        {/* Product Grid */}
        <ProductGrid
          onAnalysisStart={(itemId) => {
            setItemId(itemId);
            setLoading(true);
            setResult(null);
            setError("");
          }}
          onAnalysisComplete={(itemId) => {}}
        />

        {/* Compact Input */}
        <motion.div
          className="bg-white/40 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/50 p-4 mb-6 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="MLA123456789"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              onKeyDown={(e) =>
                e.key === "Enter" && !loading && handleAnalyze()
              }
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !itemId.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-semibold rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing</span>
                </>
              ) : (
                "Analyze"
              )}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-50/80 backdrop-blur-xl border border-red-200"
            >
              <p className="text-red-700 text-sm">{error}</p>
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
              className="text-center py-16 bg-white/40 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/50"
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 mb-4"
                animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity },
                  scale: { duration: 2, repeat: Infinity },
                }}
              >
                <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-800">Analyzing...</h3>
              <p className="text-slate-600 text-sm mt-1">Running AI analysis</p>
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
              className="space-y-4"
            >
              {/* Publication Info */}
              <motion.div className="bg-white/40 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/50 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  {result.listing.title}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <motion.div
                    className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 backdrop-blur-xl rounded-xl p-3 border border-emerald-200/50"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <p className="text-xs font-medium text-emerald-700 mb-0.5">
                      Price
                    </p>
                    <p className="text-xl font-bold text-emerald-700">
                      ${result.listing.price.toLocaleString()}
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 backdrop-blur-xl rounded-xl p-3 border border-blue-200/50"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <p className="text-xs font-medium text-blue-700 mb-0.5">
                      Stock
                    </p>
                    <p className="text-xl font-bold text-blue-700">
                      {result.listing.available_quantity}
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-br from-purple-50/80 to-purple-100/80 backdrop-blur-xl rounded-xl p-3 border border-purple-200/50"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <p className="text-xs font-medium text-purple-700 mb-0.5">
                      Sold
                    </p>
                    <p className="text-xl font-bold text-purple-700">
                      {result.listing.sold_quantity}
                    </p>
                  </motion.div>

                  <motion.div
                    className={`bg-gradient-to-br ${
                      result.listing.status === "active"
                        ? "from-green-50/80 to-green-100/80 border-green-200/50"
                        : "from-yellow-50/80 to-yellow-100/80 border-yellow-200/50"
                    } backdrop-blur-xl rounded-xl p-3 border`}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <p
                      className={`text-xs font-medium ${
                        result.listing.status === "active"
                          ? "text-green-700"
                          : "text-yellow-700"
                      } mb-0.5`}
                    >
                      Status
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        result.listing.status === "active"
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {result.listing.status}
                    </span>
                  </motion.div>
                </div>
              </motion.div>

              {/* AI Recommendations */}
              <motion.div className="bg-white/40 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/50 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  AI Recommendations
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Title */}
                  <div className="p-4 rounded-xl bg-blue-50/60 backdrop-blur-xl border border-blue-200/50">
                    <h3 className="font-bold text-blue-700 mb-2 flex items-center gap-1.5 text-sm">
                      <span>💡</span> Title
                    </h3>
                    <ul className="space-y-1.5">
                      {result.analysis.title_improvements.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-slate-700 text-xs"
                        >
                          <span className="text-blue-500 text-sm">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-xl bg-red-50/60 backdrop-blur-xl border border-red-200/50">
                    <h3 className="font-bold text-red-700 mb-2 flex items-center gap-1.5 text-sm">
                      <span>⚠️</span> Description
                    </h3>
                    <ul className="space-y-1.5">
                      {result.analysis.description_issues.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-slate-700 text-xs"
                        >
                          <span className="text-red-500 text-sm">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="p-4 rounded-xl bg-green-50/60 backdrop-blur-xl border border-green-200/50">
                    <h3 className="font-bold text-green-700 mb-2 flex items-center gap-1.5 text-sm">
                      <span>📈</span> Opportunities
                    </h3>
                    <ul className="space-y-1.5">
                      {result.analysis.conversion_opportunities.map(
                        (item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-slate-700 text-xs"
                          >
                            <span className="text-green-500 text-sm">•</span>
                            <span>{item}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div className="p-4 rounded-xl bg-orange-50/60 backdrop-blur-xl border border-orange-200/50">
                    <h3 className="font-bold text-orange-700 mb-2 flex items-center gap-1.5 text-sm">
                      <span>🚨</span> Risks
                    </h3>
                    <ul className="space-y-1.5">
                      {result.analysis.commercial_risks.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-slate-700 text-xs"
                        >
                          <span className="text-orange-500 text-sm">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Analyze Another */}
              <motion.div className="text-center pt-2">
                <motion.button
                  onClick={() => {
                    setResult(null);
                    setItemId("");
                  }}
                  className="px-6 py-2.5 bg-white/50 backdrop-blur-xl border border-white/80 text-slate-700 font-semibold rounded-xl shadow-md hover:bg-white/70 transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Analyze Another
                </motion.button>
              </motion.div>
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
