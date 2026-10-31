# GitHub 自動打包與下載

工作流程檔案：`.github/workflows/android-debug.yml`，名稱 **Android test APK**。

任何分支收到推送後都會自動建置該分支最新版本。手動的 **Run workflow** 按鈕，要等工作流程存在於倉庫的預設分支後才可使用。GitHub Actions 必須在倉庫中啟用。

## 打包內容

Ubuntu 24.04 runner 會準備 Node.js 24、Temurin JDK 21、主機預載的 Android SDK（安裝平台 35 及 Build-Tools 34/35），執行 `npm ci`、`npm test`、`npm run android:apk`。然後驗證 APK 簽章，產生 APK、SHA-256、版本資訊及中文安裝說明，透過 GitHub Actions Artifact 提供下載。

工作流程只要求 `contents: read`；不建立 Release、不發佈網站、不上架應用程式，也不需要提供 Google Drive 或商店簽章秘密。相同分支的新推送會取消尚未完成的舊建置。測試包保留 14 日。

## 下載位置

登入 GitHub 後開啟：

https://github.com/oneday1fact-boop/monster-hotel/actions/workflows/android-debug.yml

選擇最新綠色成功的建置，向下找到 **Artifacts → MonsterHotel-Android-Test-編號**。下載 ZIP 後解壓，按 APK 安裝。建置摘要亦有該次下載包的連結。

若未見工作流程，代表設定尚未推送到 GitHub。若建置尚未成功，下載包亦不會出現；不能把工作流程入口當成已存在的 APK 下載連結。

## 本地驗證

已準備 Android 工具鏈的環境可執行：

```sh
npm ci
npm test
npm run android:apk
bash scripts/package-android-artifact.sh
```

`package-android-artifact.sh` 會驗證現有 APK 的簽章，建立與 CI 相同的下載內容。GitHub runner 上的實際下載授權、Actions 是否啟用及雲端建置是否成功，仍須在推送後確認。

手機逐步操作見 [安裝說明](android-install.zh-Hant.md)。
