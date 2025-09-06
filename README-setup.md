# COFIY - Firma Yönetim Uygulaması

Bu uygulama hem macOS hem de Windows platformlarında çalışacak şekilde yapılandırılmıştır.

## Kurulum

### 1. Bağımlılıkları Yükleyin

Her iki platformda da aynı komutları çalıştırın:

```bash
npm install
```

### 2. Geliştirme Ortamı

#### Windows
- `start.bat` - Vite dev server + Electron (önerilen)
- `start-simple.bat` - Sadece electron:dev komutu

#### macOS
- `./start.sh` - Vite dev server + Electron (önerilen)
- `./start-simple.sh` - Sadece electron:dev komutu

**Not:** macOS scriptlerini ilk kez çalıştırırken executable yapın:
```bash
chmod +x start.sh start-simple.sh
```

### 3. Üretim Yapısı Oluşturma

#### Windows için
```bash
npm run dist
```
Bu komut `release/` klasöründe Windows installer (.exe) oluşturur.

#### macOS için
```bash
npm run dist
```
Bu komut `release/` klasöründe macOS DMG dosyası oluşturur.

#### Her İki Platform için
```bash
npm run electron:build
```

## Proje Yapısı

- `src/` - React bileşenleri
- `electron/` - Electron ana process ve preload scriptleri
- `data/` - Uygulama verileri
- `assets/` - İkonlar ve diğer varlıklar

## Geliştirme Komutları

- `npm run dev` - Vite dev server
- `npm run build` - Üretim yapısı
- `npm run electron` - Electron uygulaması
- `npm run electron:dev` - Geliştirme modu
- `npm run electron:build` - Platform için yapı

## İkon Dosyaları

Uygulamanın düzgün çalışması için aşağıdaki ikon dosyalarına ihtiyacınız var:

### Windows
- `assets/icon.ico` - Windows için ICO formatı

### macOS
- `assets/icon.icns` - macOS için ICNS formatı
- `assets/icon.png` - Kaynak PNG dosyası

**Not:** PNG dosyasından ICNS oluşturmak için:
```bash
# macOS'ta
sips -s format icns icon.png --out icon.icns
```

## Sorun Giderme

### Windows'ta
- Node.js ve npm'in yüklü olduğundan emin olun
- PowerShell'i yönetici olarak çalıştırın
- Antivirus programının engellemediğini kontrol edin

### macOS'ta
- Xcode Command Line Tools yüklü olmalı
- `npm install` sırasında hata alırsanız, `sudo npm install` deneyin
- DMG oluştururken sorun yaşarsanız, electron-builder dokümantasyonuna bakın

## Teknik Detaylar

- **Frontend:** React + Vite
- **Backend:** Electron
- **Build Tool:** electron-builder
- **Package Manager:** npm

Uygulama hazır! 🚀


