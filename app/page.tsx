"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl mb-4">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">Loading...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Animated Header */}
          <div className="text-center mb-16 pt-12">
            <div className="inline-block mb-6 relative">
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 animate-pulse"></div>
              <h1 className="relative text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                RataLibre
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              AI-Powered insights to{" "}
              <span className="font-semibold text-blue-600">
                optimize your listings
              </span>{" "}
              and boost sales
            </p>
          </div>

          {/* Hero Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 p-12 max-w-lg mx-auto">
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleConnect}
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Connect with MercadoLibre</span>
              </button>

              <p className="mt-6 text-slate-500 text-sm">
                🔒 Secure OAuth2 • Your data stays private
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-blue-600"
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
              </div>
              <h3 className="font-bold text-slate-800 mb-2">
                Instant Analysis
              </h3>
              <p className="text-slate-600 text-sm">
                Get AI recommendations in seconds
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-purple-600"
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
              </div>
              <h3 className="font-bold text-slate-800 mb-2">
                Actionable Insights
              </h3>
              <p className="text-slate-600 text-sm">
                Clear steps to improve conversions
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-green-600"
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
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Boost Sales</h3>
              <p className="text-slate-600 text-sm">
                Optimize for maximum revenue
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-700 text-sm font-semibold">
              Connected
            </span>
          </div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Listing Analyzer
          </h1>
          <p className="text-slate-600">Powered by AI</p>
        </div>

        {/* Modern Input Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                placeholder="MLA123456789"
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-lg font-medium"
                onKeyDown={(e) =>
                  e.key === "Enter" && !loading && handleAnalyze()
                }
                disabled={loading}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg
                  className="w-6 h-6 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || !itemId.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-w-[160px]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Analyzing</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-5 rounded-2xl bg-red-50 border-2 border-red-100 shadow-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6 animate-pulse">
              <svg
                className="animate-spin h-10 w-10 text-blue-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Analyzing...
            </h3>
            <p className="text-slate-600">
              Fetching data and running AI analysis
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Publication Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                Publication Details
              </h2>

              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-2 font-medium">Title</p>
                <p className="text-xl font-semibold text-slate-900">
                  {result.listing.title}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <p className="text-sm font-medium text-green-700 mb-1">
                    Price
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${result.listing.price.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    Stock
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.listing.available_quantity}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    Sold
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {result.listing.sold_quantity}
                  </p>
                </div>

                <div
                  className={`rounded-2xl p-4 border ${
                    result.listing.status === "active"
                      ? "bg-green-50 border-green-100"
                      : "bg-yellow-50 border-yellow-100"
                  }`}
                >
                  <p
                    className={`text-sm font-medium mb-1 ${
                      result.listing.status === "active"
                        ? "text-green-700"
                        : "text-yellow-700"
                    }`}
                  >
                    Status
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                      result.listing.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {result.listing.status}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                AI Recommendations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title Improvements */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
                  <h3 className="font-bold text-blue-600 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-2xl">💡</span>
                    Title Improvements
                  </h3>
                  <ul className="space-y-2">
                    {result.analysis.title_improvements.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-slate-700 text-sm"
                      >
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Description Issues */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-100">
                  <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-2xl">⚠️</span>
                    Description Issues
                  </h3>
                  <ul className="space-y-2">
                    {result.analysis.description_issues.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-slate-700 text-sm"
                      >
                        <span className="text-red-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Conversion Opportunities */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100">
                  <h3 className="font-bold text-green-600 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-2xl">📈</span>
                    Opportunities
                  </h3>
                  <ul className="space-y-2">
                    {result.analysis.conversion_opportunities.map(
                      (item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-slate-700 text-sm"
                        >
                          <span className="text-green-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Commercial Risks */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-100">
                  <h3 className="font-bold text-orange-600 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-2xl">🚨</span>
                    Risks
                  </h3>
                  <ul className="space-y-2">
                    {result.analysis.commercial_risks.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-slate-700 text-sm"
                      >
                        <span className="text-orange-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Analyze Another */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setResult(null);
                  setItemId("");
                }}
                className="px-8 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-white hover:border-slate-300 shadow-lg hover:shadow-xl transition-all"
              >
                Analyze Another Listing
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 mt-12 text-slate-500 text-sm">
          <p className="font-medium">
            Powered by <span className="text-blue-600">Groq AI</span> • Built
            with <span className="text-purple-600">Next.js</span> &{" "}
            <span className="text-green-600">Supabase</span>
          </p>
        </footer>
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
