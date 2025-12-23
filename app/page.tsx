"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthURL } from "@/lib/mercadolibre";
import { analyzeListing } from "@/app/actions/listings";
import { MLListing, AnalysisRecommendations } from "@/types";
import { ParticleBackground } from "@/app/components/ParticleBackground";
import { GlassCard } from "@/app/components/GlassCard";
import { NeonButton } from "@/app/components/NeonButton";
import { ProductGrid } from "./components/ProductGrid";

interface AnalysisResult {
  listing: MLListing;
  description: { listing_id: string; plain_text: string };
  analysis: AnalysisRecommendations;
}

function LoadingFallback() {
  return (
    <div className="relative min-h-screen bg-background">
      <ParticleBackground />
      <div className="relative z-10 flex justify-center px-4 py-12">
        <div className="w-full max-w-5xl" />
        <p className="text-foreground">Loading...</p>
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        <ParticleBackground />
        <div className="max-w-lg relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1
              className="text-6xl font-bold mb-3"
              style={{
                background:
                  "linear-gradient(135deg, #00f5ff 0%, #a855f7 50%, #ff00ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 40px rgba(0, 245, 255, 0.5)",
              }}
            >
              Desafio CampoGrowth
            </h1>
          </motion.div>

          <GlassCard glow delay={0.2} className="mb-6">
            {error && (
              <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}

            <NeonButton onClick={handleConnect} className="w-full py-3">
              Conectar con MercadoLibre
            </NeonButton>

            <p className="text-center text-xs text-foreground/50 mt-3">
              🔒 Autenticación segura OAuth2
            </p>
          </GlassCard>

          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: "⚡", text: "Instantáneo" },
              { emoji: "🎯", text: "Preciso" },
              { emoji: "📊", text: "Resultados" },
            ].map((item, idx) => (
              <GlassCard
                key={idx}
                delay={0.3 + idx * 0.1}
                className="text-center py-4"
              >
                <div className="text-2xl mb-1">{item.emoji}</div>
                <p className="text-xs text-foreground/80">{item.text}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated view
  // Authenticated view
  return (
    <div className="min-h-screen bg-background p-4 relative overflow-auto">
      <ParticleBackground />

      <div className="max-w-6xl mx-auto py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-strong rounded-full mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">
              Conectado
            </span>
          </div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              background:
                "linear-gradient(135deg, #00f5ff 0%, #a855f7 50%, #ff00ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            RataLibre
          </h1>
          <p className="text-foreground/70">Analiza tus publicaciones</p>
        </div>

        {/* Product Grid - Tus publicaciones */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Mis Publicaciones
          </h2>
          <ProductGrid
            onAnalysisStart={(itemId) => {
              setItemId(itemId);
              setLoading(true);
              setResult(null);
              setError("");
            }}
            onAnalysisComplete={(itemId) => {}}
          />
        </div>

        {/* Input de búsqueda manual */}
        <GlassCard glow className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Buscar por código
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="MLA123456789"
              className="flex-1 px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              onKeyDown={(e) =>
                e.key === "Enter" && !loading && handleAnalyze()
              }
              disabled={loading}
            />
            <NeonButton
              onClick={handleAnalyze}
              disabled={loading || !itemId.trim()}
              className="px-8"
            >
              {loading ? "Analizando..." : "Analizar"}
            </NeonButton>
          </div>
        </GlassCard>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="glass-strong border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
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
            >
              <GlassCard glow className="text-center py-12">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Analizando...
                </h3>
                <p className="text-foreground/60">Obteniendo insights con IA</p>
              </GlassCard>
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
              <GlassCard glow>
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  {result.listing.title}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-strong rounded-xl p-4 border-glow">
                    <p className="text-xs text-secondary font-medium mb-1">
                      Precio
                    </p>
                    <p className="text-2xl font-bold text-secondary">
                      ${result.listing.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="glass-strong rounded-xl p-4">
                    <p className="text-xs text-foreground/60 font-medium mb-1">
                      Stock
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {result.listing.available_quantity}
                    </p>
                  </div>

                  <div className="glass-strong rounded-xl p-4">
                    <p className="text-xs text-foreground/60 font-medium mb-1">
                      Vendidos
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {result.listing.sold_quantity}
                    </p>
                  </div>

                  <div className="glass-strong rounded-xl p-4">
                    <p className="text-xs text-foreground/60 font-medium mb-1">
                      Estado
                    </p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        result.listing.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {result.listing.status}
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* AI Recommendations */}
              <GlassCard glow>
                <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="text-3xl">✨</span>
                  Recomendaciones IA
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass-strong rounded-xl p-5 border border-primary/30">
                    <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                      <span>💡</span> Mejoras del Título
                    </h3>
                    <ul className="space-y-2">
                      {result.analysis.title_improvements.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-foreground/80 flex items-start gap-2"
                        >
                          <span className="text-primary mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-strong rounded-xl p-5 border border-red-500/30">
                    <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <span>⚠️</span> Problemas de Descripción
                    </h3>
                    <ul className="space-y-2">
                      {result.analysis.description_issues.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-foreground/80 flex items-start gap-2"
                        >
                          <span className="text-red-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-strong rounded-xl p-5 border border-green-500/30">
                    <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <span>📈</span> Oportunidades
                    </h3>
                    <ul className="space-y-2">
                      {result.analysis.conversion_opportunities.map(
                        (item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-foreground/80 flex items-start gap-2"
                          >
                            <span className="text-green-400 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="glass-strong rounded-xl p-5 border border-orange-500/30">
                    <h3 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                      <span>🚨</span> Riesgos
                    </h3>
                    <ul className="space-y-2">
                      {result.analysis.commercial_risks.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-foreground/80 flex items-start gap-2"
                        >
                          <span className="text-orange-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlassCard>

              <div className="text-center">
                <NeonButton
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setItemId("");
                  }}
                  className="px-8"
                >
                  Analizar Otro Listado
                </NeonButton>
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
