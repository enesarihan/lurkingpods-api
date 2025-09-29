# Vercel Deployment Guide

## 📋 Ön Hazırlık

### 1. Vercel CLI Kurulumu
```bash
npm install -g vercel
```

### 2. Vercel'a Giriş
```bash
vercel login
```

## 🚀 Deployment Adımları

### 1. İlk Deployment
```bash
cd api
vercel
```

Sorulacak sorulara cevaplar:
- Set up and deploy? **Y**
- Which scope? **Kendi hesabınızı seçin**
- Link to existing project? **N**
- Project name: **lurkingpods-api**
- In which directory is your code located? **.**

### 2. Environment Variables Ekleme

Vercel Dashboard'da (https://vercel.com/dashboard):
1. Projenizi seçin
2. **Settings** → **Environment Variables**
3. Şu değişkenleri ekleyin:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
NODE_ENV=production
```

### 3. Production Deployment
```bash
vercel --prod
```

## 🔧 Yapılandırma

### vercel.json
- **memory**: 1024 MB (AI işlemleri için yeterli)
- **maxDuration**: 30 saniye (Hobby plan için max)

### Önemli Notlar

1. **Serverless Limitations**:
   - Vercel Hobby plan: Max 10 saniye execution time
   - Pro plan: Max 60 saniye
   - AI operasyonları zaman alabilir

2. **Database**:
   - Supabase bağlantısı cloud'dan çalışır
   - Connection pooling önerilir

3. **Cron Jobs**:
   - Vercel Cron (Beta) kullanılabilir
   - Alternatif: External cron service (cron-job.org)

4. **Logs**:
   - Vercel Dashboard'da real-time logs
   - `vercel logs` komutu ile CLI'dan izlenebilir

## 🧪 Test

Deployment sonrası test:
```bash
curl https://your-project.vercel.app/health
```

Beklenen cevap:
```json
{
  "status": "OK",
  "timestamp": "2025-09-29T..."
}
```

## 🔄 Güncelleme

Her push ile otomatik deployment:
```bash
git add .
git commit -m "Update API"
git push
```

Manuel deployment:
```bash
vercel --prod
```

## 📊 Monitoring

1. **Vercel Dashboard**: 
   - Analytics
   - Logs
   - Performance metrics

2. **Health Check**:
   ```bash
   curl https://your-project.vercel.app/health
   ```

3. **Debug Endpoints** (production'da devre dışı bırakın):
   ```bash
   curl https://your-project.vercel.app/admin/debug/status
   ```

## ⚠️ Production Checklist

- [ ] Tüm environment variables ayarlandı
- [ ] API keys güvenli
- [ ] Rate limiting aktif
- [ ] CORS ayarları doğru
- [ ] Security headers eklendi
- [ ] Logs monitörleniyor
- [ ] Health check endpoint çalışıyor
- [ ] Debug endpoints kapatıldı veya güvenli hale getirildi

## 🐛 Troubleshooting

### 1. "Missing environment variables"
```bash
vercel env pull .env.production
```

### 2. "Function timeout"
- Pro plan'a yükseltin veya
- İşlemleri optimize edin

### 3. "Module not found"
```bash
# package.json'daki dependencies kontrol edin
npm install
vercel --prod
```

## 📚 Kaynaklar

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
