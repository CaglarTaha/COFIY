# COFIY - Açık Kaynak Firma ve Belge Yönetim Sistemi
<img width="1024" height="1024" alt="icon" src="https://github.com/user-attachments/assets/b3e324d4-74f8-4306-bb00-ed7f7813af76" />

![COFIY](https://img.shields.io/badge/COFIY-Open%20Source-blue?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-27.2.3-47848F?style=for-the-badge&logo=electron)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**COFIY**, Vite + Electron ile geliştirilmiş, tamamen açık kaynak modern masaüstü firma yönetim uygulamasıdır. Firmalarınızı, belgelerinizi ve notlarınızı kolayca yönetin.

## 🌟 Neden Açık Kaynak?

COFIY, topluluk destekli bir açık kaynak projesidir. Bunun anlamı:

- 🔓 **Tam erişilebilirlik**: Kaynak koduna herkes erişebilir
- 🤝 **Topluluk katkıları**: Geliştiriciler katkıda bulunabilir
- 🐛 **Şeffaf geliştirme**: Hatalar hızlıca tespit edilir ve düzeltilir
- 🆓 **Ücretsiz**: Sonsuza kadar ücretsiz kalacaktır
- 🔧 **Özelleştirilebilir**: İhtiyaçlarınıza göre uyarlayabilirsiniz

## ✨ Öne Çıkan Özellikler

- ✅ **Kapsamlı Firma Yönetimi**: Tam kapsamlı firma kaydı ve düzenleme
- ✅ **Gelişmiş Belge Yönetimi**: Çoklu belge türü desteği ve dosya yolu kaydetme
- ✅ **Not Sistemi**: Her firma için ayrıntılı notlar ve arama özelliği
- ✅ **Veri Transferi**: JSON ve ZIP formatlarında export/import
- ✅ **Modern Arayüz**: Kullanıcı dostu, hızlı ve responsive tasarım
- ✅ **Yerel Dosya Entegrasyonu**: Belgeler orijinal konumlarından açılır

## 🚀 Hızlı Başlangıç

### Ön Koşullar
- Node.js 16+ 
- npm veya yarn

### Kurulum
```bash
# Depoyu klonlayın
git clone https://github.com/[kullanici-adi]/cofiy.git
cd cofiy

# Bağımlılıkları yükleyin
npm install

# Geliştirme modunda çalıştırın
npm run electron:dev
```

## 🛠️ Geliştirmeye Katkıda Bulunun

COFIY açık kaynak bir projedir ve katkılarınızı bekliyoruz!

### Katkı Süreci
1. Depoyu fork edin
2. Özellik/fix branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inize push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Geliştirme Kurulumu
```bash
# Geliştirme ortamını kurun
npm install

# Geliştirme sunucusunu başlatın
npm run electron:dev

# Build işlemi
npm run build

# Testleri çalıştırın
npm test
```

## 📦 Proje Yapısı

```
cofiy/
├── electron/                 # Electron ana süreç dosyaları
│   ├── main.js              # Electron ana süreç
│   └── preload.js           # Güvenli API köprüsü
├── src/
│   ├── components/          # React bileşenleri
│   ├── App.jsx              # Ana uygulama bileşeni
│   ├── main.jsx             # React giriş noktası
│   └── index.css            # Global stiller
├── data/                    # Veri dosyaları (otomatik oluşur)
├── dist/                    # Build çıktısı
└── docs/                    # Proje 

## 📜 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## ❓ SSS

**S: COFIY'ı ticari projelerimde kullanabilir miyim?**
C: Evet, MIT lisansı ticari kullanıma izin verir.

**S: Nasıl katkıda bulunabilirim?**
C: Hata düzeltmeleri, özellik eklemeleri, dokümantasyon veya çeviriler ile katkıda bulunabilirsiniz.

**S: Sorun veya özellik isteği nasıl bildirilir?**
C: GitHub Issues sayfasında yeni bir konu açabilirsiniz.

## 📞 İletişim

- GitHub Issues: [Sorun Bildir](https://github.com/[kullanici-adi]/cofiy/issues)
- E-posta: codeativ@gmail.com

## 🌍 Çeviriler

COFIY'ı farklı dillere çevirmemize yardım edin! Çeviri katkılarınızı bekliyoruz.

---

**COFIY** - Açık kaynak firma yönetim çözümünüz. Katkıda bulunun, geliştirin, paylaşın!
