# Google Play 內部測試準備

用戶已授權上傳至內部測試；未授權公開上架。現時尚未上傳：此工作階段沒有 Play Console 工具、已就緒的 Play 發佈身分或上傳金鑰。

目前 applicationId 為 `com.midnightcheckin.monsterhotel`，版本名稱 1.3，預設 versionCode 4。必須先核對擁有者的 Play 應用及最高已用 versionCode；既有應用不可任意更換 applicationId 或 upload key。

## 已準備

- `npm run android:bundle:check`：建置 release AAB，明確標示 unsigned、不可上傳。不使用 debug key。
- `npm run android:aab`：要求擁有者的上傳金鑰，以正式 release 組態建立並驗證簽署 AAB。缺少金鑰即停止，不會自動產生或替換金鑰。
- 中英內部測試更新說明。
- 不會建立 Play 編輯、修改測試者或推送正式渠道。

## 簽署設定

透過安全的執行環境或 CI secrets 設定以下變數，勿提交金鑰、憑證或密碼到 Git，亦勿貼在對話：

- `MONSTER_UPLOAD_STORE_FILE`：擁有者 keystore 的絕對路徑。
- `MONSTER_UPLOAD_STORE_PASSWORD`
- `MONSTER_UPLOAD_KEY_ALIAS`
- `MONSTER_UPLOAD_KEY_PASSWORD`
- `MONSTER_VERSION_CODE`：可選，必須高於 Play 已用版本碼。
- `MONSTER_VERSION_NAME`：可選，預設 1.3。

執行 `npm run android:aab`，取得 `artifacts/monster-hotel-internal-release.aab` 及校驗碼。上傳前須確認憑證符合該 Play 應用登記的 upload certificate。

## 待擁有者提供／完成

1. Play Console 中遊戲的應用程式頁面連結；如未建立，先以擁有者帳戶建立遊戲。
2. 是否已有 upload keystore，以及可用的安全簽署方式。新應用可使用 Play App Signing；不能把現有 debug APK 當作正式 bundle。
3. 可操作該應用內部測試渠道的安全存取。Google Drive 連線不等於 Play Console 存取；不要提供 Google 密碼。
4. 在 Console 設定指定測試者的電郵名單或 Google 群組及必要的帳戶／應用資料。商店聲明、目標受眾及內容評級等需要由擁有者核實，不能捏造。

首次建立應用與其設定通常需要 Play Console 操作。本環境目前也沒有已就緒的 Android Publisher API 身分，因此未執行上傳或發佈。連線與簽署到位後，才可將已驗證 AAB 上傳到該應用的 **Internal testing**，選取測試者並取得 opt-in 連結。這裡未產生任何 Play 安裝連結。

歷史驗證（1.1 準備版本，非本次 1.3）：unsigned release AAB 已成功編譯（23,337,853 bytes），已核對 bundle 結構及遊戲資源，確認未帶簽署；缺少金鑰時的拒絕建置檢查通過，原有 debug APK 亦成功重新編譯。未驗證 owner-signed AAB，因擁有者尚未建立 upload key。當前 targetSdk 為 35；首次實際上傳前仍需按 Console 當時要求核對目標 API 等條件。
