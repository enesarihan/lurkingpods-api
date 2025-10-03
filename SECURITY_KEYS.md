# Security Keys Guide

## 🔐 API Key ve JWT Secret Oluşturma

### Otomatik Oluşturma (Önerilen)

Script ile güvenli key'ler oluşturun:

```bash
cd api
node generate-secrets.js
```

Bu script şunları üretir:
- **API_KEY**: Admin endpoints için (64 karakter hex)
- **JWT_SECRET**: Token imzalama için (base64)
- **Short API_KEY**: Test için kısa versiyon (32 karakter)

### Manuel Oluşturma

#### Linux/Mac:
```bash
# API Key
openssl rand -hex 32

# JWT Secret
openssl rand -base64 64
```

#### Windows PowerShell:
```powershell
# API Key
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# JWT Secret
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### Node.js:
```javascript
const crypto = require('crypto');
console.log('API_KEY:', crypto.randomBytes(32).toString('hex'));
console.log('JWT_SECRET:', crypto.randomBytes(64).toString('base64'));
```

## 📝 Vercel'a Ekleme

### 1. Vercel Dashboard'a Gidin
https://vercel.com/enes-projects-e008073a/lurkingpods-api/settings/environment-variables

### 2. Environment Variables Ekleyin

**API_KEY** (Admin endpoints için):
```
Name: API_KEY
Value: [yukarıdaki scriptten kopyalayın]
Environment: Production, Preview, Development
```

**JWT_SECRET** (Token imzalama için):
```
Name: JWT_SECRET
Value: [yukarıdaki scriptten kopyalayın]
Environment: Production, Preview, Development
```

### 3. Redeploy Yapın
```bash
vercel --prod
```

## 🔒 Kullanım

### API Key ile Admin Endpoint'leri Kullanma

```bash
# Debug status endpoint
curl https://lurkingpods-api.vercel.app/admin/debug/status \
  -H "x-api-key: YOUR_API_KEY"

# Podcast generation
curl -X POST https://lurkingpods-api.vercel.app/admin/debug/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"category_id":"technology","language":"en"}'
```

### JWT Token Kullanımı (User Authentication)

```bash
# Login yaparak token alın
curl -X POST https://lurkingpods-api.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Token ile authenticated endpoint'leri kullanın
curl https://lurkingpods-api.vercel.app/user/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ⚠️ Güvenlik Kuralları

1. **Asla Git'e Commit Etmeyin**
   - `.env` dosyası `.gitignore`'da olmalı
   - Key'leri kod içinde hardcode etmeyin

2. **Düzenli Olarak Rotate Edin**
   - Her 3-6 ayda bir yeni key'ler oluşturun
   - Eski key'leri devre dışı bırakın

3. **Farklı Ortamlar İçin Farklı Key'ler**
   - Development, Staging, Production için ayrı key'ler
   - Test key'leri production'da kullanmayın

4. **Key'leri Güvenli Saklayın**
   - Password manager kullanın (1Password, LastPass, vb.)
   - Team'le paylaşmak için secure vault kullanın

5. **Rate Limiting**
   - API key başına istek limitleri koyun
   - Şüpheli aktiviteleri monitör edin

## 🔄 Key Rotation (Yenileme)

### Adımlar:

1. **Yeni Key Oluştur**:
   ```bash
   node generate-secrets.js
   ```

2. **Vercel'da Yeni Key Ekle**:
   - Önce yeni key'i ekleyin (eski key'i silmeyin)
   - İsim: `API_KEY_NEW`, `JWT_SECRET_NEW`

3. **Kodu Güncelle**:
   - Her iki key'i de kontrol edecek şekilde
   - Geçiş süresi tanımlayın (örn: 1 hafta)

4. **Eski Key'i Kaldır**:
   - Tüm sistemler yeni key'e geçtikten sonra
   - Eski key'i Vercel'dan silin

## 🆘 Key Sızdırma Durumunda

1. **Hemen Yeni Key Oluştur**
2. **Vercel'da Eski Key'i Sil**
3. **Tüm Sistemleri Güncelle**
4. **Logs'ları İncele**: Yetkisiz erişim var mı?
5. **Kullanıcıları Bilgilendir** (gerekirse)

## 📚 Kaynaklar

- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
