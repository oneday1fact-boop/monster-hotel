#!/usr/bin/env python3
"""Prepare an honest local handoff report; does not log in, upload, or publish."""
import hashlib,json,pathlib,subprocess,zipfile
root=pathlib.Path(__file__).resolve().parent.parent
folder=root/'artifacts/play-closed'
folder.mkdir(parents=True,exist_ok=True)
source=root/'artifacts/monster-hotel-release.aab'
if not source.exists():source=root/'artifacts/monster-hotel-UNSIGNED-NOT-FOR-UPLOAD.aab'
if not source.exists():raise SystemExit('Build a release AAB first: npm run android:bundle:check or npm run android:aab.')
with zipfile.ZipFile(source) as z:
 names=z.namelist()
 assert 'base/assets/public/index.html' in names,'Missing game assets'
 signed=any(n.startswith('META-INF/') and n.endswith(('.RSA','.EC','.DSA')) for n in names)
 files=[p for p in (root/'dist').rglob('*') if p.is_file()]
 mismatches=[str(p.relative_to(root/'dist')) for p in files if z.read('base/assets/public/'+str(p.relative_to(root/'dist')))!=p.read_bytes()]
 assert not mismatches,'AAB assets differ from current dist: '+str(mismatches)
 if 'UNSIGNED' in source.name:assert not signed,'Compile-check artifact unexpectedly has a signature'
listing=json.loads((root/'docs/play-closed/store-listing.json').read_text())
for locale in ['zh-Hant','en-US']:
 assert len(listing[locale]['title'])<=30
 assert len(listing[locale]['shortDescription'])<=80
 assert len((root/f'docs/play-closed/release-notes.{locale}.txt').read_text().strip())<=500
report={'packageName':listing['packageName'],'versionName':listing['versionName'],'versionCode':listing['versionCode'],'targetSdkVersion':listing['targetSdkVersion'],'channel':'closed testing','sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'bundle':source.name,'bytes':source.stat().st_size,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'signaturePresent':signed,'assetFilesVerified':len(files),'uploaded':False,'playInstallLink':None,'blockedBy':['No connected Play Console/Publisher identity','No owner upload key currently supplied','Console connection returned proxy HTTP 403','Actual Play app and closed track not yet verified'],'ownerFields':listing['ownerFieldsNotInvented']}
(folder/'build-readiness.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
