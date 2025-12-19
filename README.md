Analizador de Publicaciones con IA

Analiza publicaciones de MercadoLibre y obtén recomendaciones de IA para mejorar tus ventas.

🔗 **Demo:** https://desafio-tecnico-capogrowth.vercel.app/

---

## ⚡ Qué Hace

1. Te conectas con tu cuenta de MercadoLibre
2. Ingresas el ID de tu publicación
3. La app analiza tu listing con IA
4. Recibes recomendaciones para mejorar título, descripción, conversiones y reducir riesgos

---

## 🛠️ Stack

- **Framework:** Next.js 15 + TypeScript
- **Base de Datos:** Supabase (PostgreSQL)
- **Inteligencia Artificial:** Groq API (Llama 3.3)
- **OAuth:** MercadoLibre API
- **Deploy:** Vercel

---

## 🚀 Configuración Rápida

### 1. Instalar Dependencias

```bash
git clone https://github.com/cristiand001/Desafio-tecnico-capogrowth.git
cd Desafio-tecnico-capogrowth
npm install
```

### 2. Variables de Entorno

Crea `.env.local`:

```env
# MercadoLibre (https://developers.mercadolibre.com.ar)
ML_CLIENT_ID=tu_app_id
ML_CLIENT_SECRET=tu_secret
ML_REDIRECT_URI=http://localhost:3000/api/auth/mercadolibre/callback

# Supabase (https://supabase.com)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Groq (https://console.groq.com - Gratis)
GROQ_API_KEY=gsk_xxx
```

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve al SQL Editor
3. Ejecuta el contenido de `/supabase/schema.sql`

### 4. Crear App de MercadoLibre

1. Ve a [MercadoLibre Developers](https://developers.mercadolibre.com.ar)
2. Crea una aplicación
3. **Redirect URI:** `http://localhost:3000/api/auth/mercadolibre/callback`
4. **Permisos:**
   - ✅ Usuarios: Lectura y escritura
   - ✅ Publicación y sincronización: Lectura y escritura
5. Copia App ID y Secret

### 5. Obtener API Key de Groq

1. Crea cuenta en [Groq Console](https://console.groq.com) (gratis)
2. Crea una API Key
3. Cópiala (empieza con `gsk_...`)

### 6. Ejecutar

```bash
npm run dev
```

Abre http://localhost:3000

---

## 🌐 Deploy en Vercel

1. Conecta tu repo en [Vercel](https://vercel.com)
2. Agrega todas las variables de entorno
3. Cambia `ML_REDIRECT_URI` a `https://tu-app.vercel.app/api/auth/mercadolibre/callback`
4. Actualiza el Redirect URI en tu app de MercadoLibre

---

## ⚠️ Importante

**Solo puedes analizar TUS PROPIAS publicaciones.**

La API de MercadoLibre requiere que la publicación sea de tu cuenta. Para probar:

1. Crea una publicación en MercadoLibre
2. Usa ese Item ID (formato: `MLA1234567890`)

---

## 🧪 Cómo Probar

1. Click **"Connect with MercadoLibre"**
2. Autoriza la app
3. Ingresa tu Item ID
4. Click **"Analyze"**
5. Espera ~5-10 segundos
6. Revisa las recomendaciones

---

## 💡 ¿Por Qué Groq en Lugar de OpenAI?

- ✅ Gratis (OpenAI requiere créditos)
- ✅ Más rápido
- ✅ Misma funcionalidad
- ✅ Modelo potente (Llama 3.3 70B)

---

## 📁 Estructura

```
/app
  /actions          # Lógica de negocio
  /api             # OAuth callback
  page.tsx         # UI principal

/lib
  mercadolibre.ts  # API de MercadoLibre
  supabase.ts      # Cliente de DB
  openai.ts        # Análisis con IA

/supabase
  schema.sql       # Schema de base de datos
```

---

## 🐛 Problemas Comunes

**"Access forbidden"** → Estás intentando analizar una publicación que no es tuya

**"Not authenticated"** → Borra cookies y vuelve a hacer OAuth

---

## 👤 Autor

Cristian - [GitHub](https://github.com/cristiand001)

Desarrollado como desafío técnico para CapoGrowth
