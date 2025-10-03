# Production Setup Guide

## 🌐 Production URL
**https://lurkingpods-api.vercel.app**

## ✅ Deployment Başarılı!

### Şimdi Yapılması Gerekenler:

## 1️⃣ Environment Variables Ekleme

Vercel Dashboard'a gidin: https://vercel.com/enes-projects-e008073a/lurkingpods-api/settings/environment-variables

Aşağıdaki değişkenleri ekleyin:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Server
NODE_ENV=production

# Security (Opsiyonel - admin endpoints için)
API_KEY=your_secure_api_key
JWT_SECRET=your_jwt_secret
```

## 2️⃣ Test Endpoints

### Health Check
```bash
curl https://lurkingpods-api.vercel.app/health
```

Beklenen yanıt:
```json
{
  "status": "OK",
  "timestamp": "2025-09-29T..."
}
```

### Service Status (Environment variables ekledikten sonra)
```bash
curl https://lurkingpods-api.vercel.app/admin/debug/status
```

Beklenen yanıt:
```json
{
  "gemini_initialized": true,
  "elevenlabs_initialized": true,
  "env": {
    "GEMINI_API_KEY": true,
    "ELEVENLABS_API_KEY": true
  }
}
```

### Podcast Generation Test
```bash
curl -X POST https://lurkingpods-api.vercel.app/admin/debug/generate \
  -H "Content-Type: application/json" \
  -d '{"category_id":"technology","language":"en"}'
```

## 3️⃣ Güncelleme Yapma

Her değişiklikten sonra:

```bash
git add .
git commit -m "Update: açıklama"
git push
```

Vercel otomatik olarak yeni deployment yapacak.

Manuel deployment:
```bash
vercel --prod
```

## 4️⃣ Monitoring

### Logs Görüntüleme
```bash
vercel logs https://lurkingpods-api.vercel.app
```

### Vercel Dashboard
- Analytics: https://vercel.com/enes-projects-e008073a/lurkingpods-api/analytics
- Logs: https://vercel.com/enes-projects-e008073a/lurkingpods-api/logs

## 5️⃣ Mobile App Entegrasyonu

Mobile uygulamanızda API URL'i güncelleyin:

```typescript
// mobile/src/config/api.ts
export const API_URL = 'https://lurkingpods-api.vercel.app';
```

## 🔒 Security Checklist

- [x] CORS ayarları yapıldı (Vercel URL eklendi)
- [ ] Environment variables Vercel'a eklendi
- [ ] API_KEY production için güçlendirildi
- [ ] JWT_SECRET güvenli bir değer ile ayarlandı
- [ ] Rate limiting aktif
- [ ] Debug endpoints production'da kapatıldı veya güvenli hale getirildi

## ⚠️ Önemli Notlar

1. **Serverless Limitations**:
   - Vercel Hobby plan: 10 saniye timeout
   - AI işlemleri uzun sürebilir, optimize edin

2. **Database**:
   - Supabase connection pooling kullanın
   - Row Level Security (RLS) politikalarını kontrol edin

3. **Cron Jobs**:
   - Günlük podcast üretimi için external cron service kullanın
   - Örnek: cron-job.org, easycron.com

4. **Logs**:
   - Production'da hassas bilgiler loglamayın
   - Error tracking için Sentry entegrasyonu düşünün

## 📱 Next Steps

1. ✅ API deployed
2. ⏳ Environment variables ekle
3. ⏳ Test endpoints
4. ⏳ Mobile app'i production API'ye bağla
5. ⏳ Cron job setup
6. ⏳ Monitoring setup

## 🆘 Troubleshooting

### "Missing environment variables" hatası
```bash
# Vercel dashboard'da tüm env variables'ları kontrol edin
# Sonra redeploy yapın:
vercel --prod
```

### Timeout errors
- İşlemleri optimize edin
- Pro plan'a yükseltin (60 saniye timeout)

### CORS errors
- Mobile app origin'ini CORS whitelist'e ekleyin
- Vercel Dashboard → Settings → Environment Variables → API_URL
