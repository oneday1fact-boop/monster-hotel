# Google Play 封閉測試準備：1.26

本次用戶授權的是 **Closed testing／封閉測試**，取代早前只做 Internal testing 的渠道方向；沒有公開正式上架授權。實際尚未上傳，也未產生 Play 測試安裝連結。

- 程式識別碼：`com.midnightcheckin.monsterhotel`
- 本機版本：1.26／versionCode 27。上傳前必須高於該 Play app 已用的版本碼。
- 目標 API：已更新 compileSdk／targetSdk 為 36，並更新 Android Gradle Plugin 至 8.9.1；未取得 Console 當時要求，不宣稱已符合所有當期上架條件。
- 現況：用戶回覆未有 upload key。工作階段沒有 Play 發佈身分或共享桌面控制工具，Play Console HTTP 存取亦回傳 proxy 403。原始配置沒有允許 `play.google.com`；沒有繞過限制或使用別人的帳戶。

## 已完成的可檢視材料

- 連通旅館、依次觸發的小雷／蜜寶入住事件、兩個小雷新挑戰、委託、兼容存檔及測試。偵探遊戲已移除。
- `release-notes.zh-Hant.txt` 與 `release-notes.en-US.txt`。
- `store-listing.json` 中英文商店文案草稿，名稱不超過 30 字元。
- `privacy-policy-draft.zh-Hant.md` 的實際離線資料處理說明，仍需正式聯絡方式及公開網址。
- `npm run android:bundle:check`：release AAB 編譯檢查，檔名清楚標示 **UNSIGNED-NOT-FOR-UPLOAD**。
- `npm run android:aab`：只在提供 owner upload key 時建立並驗證正式簽署 AAB，否則停止。沒有用 debug key 代替上傳金鑰。
- `python scripts/prepare-play-closed.py`：從實際 AAB 產生含雜湊、版本、簽署狀態與未完成項目的本機交付清單。

## 還需要的實際帳戶操作

1. 擁有者在 Play Console 建立或選取這個 package 的 app，提供應用頁面連結；首次應用建立不能只靠 Android Publisher 的 AAB 上傳完成。
2. 在可操作的安全環境連接該 app 的 Play 發佈權限，或由擁有者使用自己的 Console；Google Drive 連線並不提供 Play 權限。需要新增網路允許規則時，經環境設定審核處理。
3. 新 app 的 upload key 可由擁有者執行 `scripts/create-upload-key.sh` 建立，存放於自己的安全位置並備份；密碼只在安全終端或環境設定輸入。既有 app 必須使用登記的 upload certificate，不可任意換鑰。
4. 使用安全環境變數 `MONSTER_UPLOAD_STORE_FILE`、`MONSTER_UPLOAD_STORE_PASSWORD`、`MONSTER_UPLOAD_KEY_ALIAS`、`MONSTER_UPLOAD_KEY_PASSWORD` 建立簽署 AAB。可覆寫 `MONSTER_VERSION_CODE`，勿提交任何金鑰或密碼到 Git。
5. 在 Console 完成開發者聯絡、私隱政策網址、資料安全、目標受眾、內容評級、商店圖像、國家及測試者設定；不能替擁有者猜答案。核對當期 target API、裝置相容性及帳戶的封閉測試要求。
6. Testing → Closed testing 建立／選擇封閉軌道及指定測試者，建立 release、上傳已簽署 AAB、加入中英更新說明。檢查預發布報告及 Console 警告後送審／發布至該封閉軌道。審查和處理完成後才取得實際 opt-in 安裝連結，沒有移往 production。

現階段沒有廣告 SDK，所以不會因廣告位置草稿而假報「已接廣告」。加入供應商後需重新核實上述聲明。

## 本機建置證據

API 36／AGP 8.9.1 的 `assembleDebug bundleRelease` 已實際成功。APK 已核對 versionName 1.26、versionCode 27、targetSdk 36 及 debug 簽章；release AAB 明確沒有簽署。兩者的 48 個 production 網頁檔案已比對，沒有原生 `.so` 被打包入 debug APK。這些是本機建置結果，不是 Play Console 接受或發布證明；沒有使用虛構帳戶、上傳成功訊息或測試安裝網址。
