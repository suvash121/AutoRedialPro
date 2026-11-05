import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../types/androidCode';

export async function downloadAndroidProjectZip() {
  const zip = new JSZip();

  // Root project files
  zip.file('settings.gradle.kts', `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "AutoRedialPro"
include(":app")
`);

  zip.file('build.gradle.kts', `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`);

  zip.file('gradle/libs.versions.toml', `[versions]
agp = "8.4.1"
kotlin = "1.9.23"
coreKtx = "1.13.1"
appcompat = "1.7.0"
material = "1.12.0"
constraintlayout = "2.1.4"
lifecycleRuntimeKtx = "2.8.2"
kotlinxCoroutines = "1.8.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
material = { group = "com.google.android.material", name = "material", version.ref = "material" }
androidx-constraintlayout = { group = "androidx.constraintlayout", name = "constraintlayout", version.ref = "constraintlayout" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "kotlinxCoroutines" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`);

  // Add the application files from ANDROID_PROJECT_FILES
  ANDROID_PROJECT_FILES.forEach(file => {
    zip.file(file.path, file.content);
  });

  // Add Application class
  zip.file('app/src/main/java/com/autoredial/pro/AutoRedialApplication.kt', `package com.autoredial.pro

import android.app.Application

class AutoRedialApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
`);

  // Add accessibility service xml
  zip.file('app/src/main/res/xml/accessibility_service_config.xml', `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows"
    android:canRetrieveWindowContent="true"
    android:description="@string/app_name"
    android:notificationTimeout="20" />
`);

  // Add drawables & vector icons
  zip.file('app/src/main/res/drawable/ic_call.xml', `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FF2563EB"
      android:pathData="M20.01,15.38c-1.23,0 -2.42,-0.2 -3.53,-0.56 -0.35,-0.12 -0.74,-0.03 -1.02,0.24l-2.2,2.2c-2.83,-1.44 -5.15,-3.75 -6.59,-6.59l2.2,-2.21c0.28,-0.26 0.36,-0.65 0.25,-1C8.7,6.35 8.5,5.16 8.5,3.93 8.5,3.42 8.08,3 7.57,3H4.06C3.55,3 3,3.44 3,4.06c0,9.39 7.61,17 17,17 0.62,0 1,-0.55 1,-1.06v-3.56c0,-0.51 -0.42,-0.93 -0.99,-0.93z"/>
</vector>`);

  zip.file('app/src/main/res/drawable/ic_stop.xml', `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FFFFFFFF"
      android:pathData="M6,6h12v12H6z"/>
</vector>`);

  zip.file('app/src/main/res/drawable/ic_dialpad.xml', `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FF06B6D4"
      android:pathData="M12,19c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM6,1c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM6,7c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM6,13c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM18,5c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,7c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM12,13c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM18,9c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM18,15c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM12,1c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2z"/>
</vector>`);

  zip.file('app/src/main/res/drawable/ic_contacts.xml', `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FF2563EB"
      android:pathData="M20,0H4v2h16V0zM4,24h16v-2H4V24zM20,4H4c-1.1,0 -2,0.9 -2,2v12c0,1.1 0.9,2 2,2h16c1.1,0 2,-0.9 2,-2V6c0,-1.1 -0.9,-2 -2,-2zM12,6c1.93,0 3.5,1.57 3.5,3.5S13.93,13 12,13s-3.5,-1.57 -3.5,-3.5S10.07,6 12,6zM18,18H6v-0.53c0,-1.79 3.58,-2.77 6,-2.77s6,0.98 6,2.77V18z"/>
</vector>`);

  zip.file('app/src/main/res/drawable/ic_speaker.xml', `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FF06B6D4"
      android:pathData="M3,9v6h4l5,5V4L7,9H3zm13.5,3c0,-1.77 -1.02,-3.29 -2.5,-4.03v8.05c1.48,-0.73 2.5,-2.25 2.5,-4.02zM14,3.23v2.06c2.89,0.86 5,3.54 5,6.71s-2.11,5.85 -5,6.71v2.06c4.01,-0.91 7,-4.49 7,-8.77s-2.99,-7.86 -7,-8.77z"/>
</vector>`);

  zip.file('app/src/main/res/drawable/ic_volume_off.xml', `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FF2563EB"
      android:pathData="M16.5,12c0,-1.77 -1.02,-3.29 -2.5,-4.03v2.21l2.45,2.45c0.03,-0.2 0.05,-0.41 0.05,-0.63zm2.5,0c0,0.94 -0.2,1.82 -0.54,2.64l1.51,1.51C20.63,14.91 21,13.5 21,12c0,-4.28 -2.99,-7.86 -7,-8.77v2.06c2.89,0.86 5,3.54 5,6.71zM4.27,3L3,4.27 7.73,9H3v6h4l5,5v-6.73l4.25,4.25c-0.67,0.52 -1.42,0.93 -2.25,1.18v2.06c1.38,-0.31 2.63,-0.95 3.69,-1.81L19.73,21 21,19.73l-9,-9L4.27,3zM12,4L9.91,6.09 12,8.18V4z"/>
</vector>`);

  zip.file('app/src/main/res/drawable/bg_bottom_sheet.xml', `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#FF0F172A" />
    <corners
        android:topLeftRadius="28dp"
        android:topRightRadius="28dp" />
</shape>`);

  zip.file('app/src/main/res/drawable/bg_dialpad_key.xml', `<?xml version="1.0" encoding="utf-8"?>
<ripple xmlns:android="http://schemas.android.com/apk/res/android"
    android:color="#332563EB">
    <item>
        <shape android:shape="rectangle">
            <solid android:color="#1A1E293B" />
            <corners android:radius="20dp" />
            <stroke android:width="1dp" android:color="#33334155" />
        </shape>
    </item>
</ripple>`);

  // Add README
  zip.file('README.md', `# AutoRedial Pro - Android Telecom & Millisecond VAD Engine

Production-ready native Android Kotlin application designed for high-frequency auto-redialing with ultra-fast millisecond Voice Activity Detection (VAD) and Telecom framework integration.

## Key Architecture & Features:
1. **Millisecond Cut-Off**: Disconnects within 20–40ms upon hearing IVR robot announcements or busy tones.
2. **Ringing Tone Lock**: Goertzel algorithm isolates 440Hz/480Hz dual tone cadence, preventing accidental disconnection during normal ring cycles.
3. **Smart Stop Condition**: Automatically halts the loop when the human recipient answers (Call.STATE_ACTIVE).
4. **Android 14+ Ready**: Fully configured foreground service with \`phoneCall\` and \`microphone\` types.

## How to Build:
1. Open Android Studio (Ladybug or newer).
2. Select **Open** and choose this unzipped folder.
3. Let Gradle sync and run on a physical Android device or emulator with telephony enabled.
`);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AutoRedialPro-Android-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
