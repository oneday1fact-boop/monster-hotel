# Android 測試版安裝

此下載包包含：

- monster-hotel-midnight-check-in-debug.apk：Android 手機測試版。
- build-info.json：建置版本及 SHA-256。
- SHA256SUMS.txt：可供檢查下載完整性的雜湊。

## 手機安裝

1. 使用 Android 手機的 Chrome 開啟 GitHub，登入有權查看此倉庫的帳戶。
2. 開啟倉庫的 Actions → Android test APK，選擇最新一次綠色成功的建置。
3. 在該次建置頁面下方的 Artifacts，下載 MonsterHotel-Android-Test-編號。
4. 用手機檔案管理員解壓下載的 ZIP。
5. 點 monster-hotel-midnight-check-in-debug.apk。
6. 若 Android 要求，允許剛才使用的瀏覽器或檔案管理員「安裝未知應用程式」，再繼續安裝。
7. 開啟 Monster Hotel，橫向進入大廳，再按「住客故事簿」。故事依序解鎖；「20 晚解謎挑戰」第一關另有互動教學。

已有測試版時，請以「更新」方式安裝，以保留本機進度。

如果 GitHub 手機 App 沒顯示 Artifacts，改用 Chrome 開啟建置頁面，並切換「電腦版網站」。

## 下載與版本

下載包只會在成功建置後出現，保留 14 日。過期時重新執行工作流程即可；重新打包不會發佈到 Google Play。

此檔案適用於 Android 6.0（API 23）或更新版本，不能安裝到 iPhone／iPad。它是 debug 測試版，仍需實機確認觸控、音效及效能。

CI 會盡量重用快取中的 debug 簽章。如果快取被清除，簽章可能改變；若系統提示與舊版簽章不符，請先保留舊版，避免直接卸載而清除本機進度。工作流程沒有使用商店正式簽章。
