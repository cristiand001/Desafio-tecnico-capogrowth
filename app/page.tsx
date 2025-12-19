'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAuthURL } from '@/lib/mercadolibre'
import { analyzeListing } from '@/app/actions/listings'
import { MLListing, AnalysisRecommendations } from '@/types'

interface AnalysisResult {
  listing: MLListing
  description: { listing_id: string; plain_text: string }
  analysis: AnalysisRecommendations
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-6">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  )
}

function PageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [itemId, setItemId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const success = searchParams.get('success')
    const errorParam = searchParams.get('error')

    if (success === 'true') {
      setIsAuthenticated(true)
      router.replace('/', { scroll: false })
    }

    if (errorParam) {
      setError(errorParam === 'auth_failed' 
        ? 'Authentication failed. Please try again.' 
        : `Error: ${errorParam}`)
      router.replace('/', { scroll: false })
    }
  }, [searchParams, router])

  const handleConnect = async () => {
    try {
      const authUrl = await getAuthURL()
      window.location.href = authUrl
    } catch (err) {
      setError('Failed to get authentication URL')
    }
  }

  const handleAnalyze = async () => {
    if (!itemId.trim()) {
      setError('Please enter a valid Item ID')
      return
    }

    setError('')
    setLoading(true)
    setResult(null)

    try {
      const analysisResult = await analyzeListing(itemId.trim())
      setResult(analysisResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <div className="inline-block mb-6">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                MercadoLibre Analyzer
              </h1>
            </div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Analyze your MercadoLibre listings with AI-powered recommendations to boost conversions and maximize sales performance.
            </p>
          </div>

          {/* Hero Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12 max-w-2xl mx-auto">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-2xl">🔐</span>
                <span>Connect with MercadoLibre</span>
              </button>
            </div>

            <p className="text-center text-slate-500 text-sm">
              Secure OAuth2 authentication. We never store your password.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-700 text-sm font-medium">Connected to MercadoLibre</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Listing Analyzer
          </h1>
          <p className="text-lg text-slate-600">Enter a listing ID to get AI-powered insights</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            MercadoLibre Item ID
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="Enter Item ID (e.g., MLA123456789)"
              className="flex-1 px-5 py-4 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !itemId.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-w-[160px]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analyzing<span className="animate-pulse">...</span></span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Analyze Publication
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-5 rounded-xl bg-red-50 border-2 border-red-200 shadow-md">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6 animate-pulse">
              <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing your listing<span className="animate-pulse">...</span></h3>
            <p className="text-slate-600">This may take a few seconds while we fetch data and run AI analysis.</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Publication Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                Publication Information
              </h2>
              
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-2">Title</p>
                <p className="text-xl font-semibold text-slate-900">{result.listing.title}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Price */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-green-700">Price</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">${result.listing.price.toLocaleString()}</p>
                </div>

                {/* Status */}
                <div className={`rounded-xl p-5 border hover:shadow-md transition-shadow ${
                  result.listing.status === 'active' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className={`w-5 h-5 ${result.listing.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className={`text-sm font-medium ${result.listing.status === 'active' ? 'text-green-700' : 'text-yellow-700'}`}>Status</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    result.listing.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {result.listing.status}
                  </span>
                </div>

                {/* Stock */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-sm font-medium text-blue-700">Available Stock</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{result.listing.available_quantity}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sold */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <p className="text-sm font-medium text-purple-700">Sold Quantity</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">{result.listing.sold_quantity}</p>
                </div>

                {/* Category */}
                {result.listing.category_id && (
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <p className="text-sm font-medium text-slate-700">Category ID</p>
                    </div>
                    <p className="text-lg font-mono font-semibold text-slate-800">{result.listing.category_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                AI Recommendations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title Improvements */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-lg transition-all duration-200">
                  <h3 className="font-bold text-blue-600 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-2xl">💡</span>
                    Title Improvements
                  </h3>
                  <ul className="space-y-3">
                    {result.analysis.title_improvements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Description Issues */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 hover:shadow-lg transition-all duration-200">
                  <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-2xl">⚠️</span>
                    Description Issues
                  </h3>
                  <ul className="space-y-3">
                    {result.analysis.description_issues.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Conversion Opportunities */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-lg transition-all duration-200">
                  <h3 className="font-bold text-green-600 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-2xl">📈</span>
                    Conversion Opportunities
                  </h3>
                  <ul className="space-y-3">
                    {result.analysis.conversion_opportunities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Commercial Risks */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 hover:shadow-lg transition-all duration-200">
                  <h3 className="font-bold text-orange-600 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-2xl">🚨</span>
                    Commercial Risks
                  </h3>
                  <ul className="space-y-3">
                    {result.analysis.commercial_risks.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Analyze Another Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setResult(null)
                  setItemId('')
                }}
                className="px-8 py-3 bg-white border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Analyze Another Listing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PageContent />
    </Suspense>
  )
}
