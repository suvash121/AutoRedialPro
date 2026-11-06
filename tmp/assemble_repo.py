import os
import shutil

REPO_DIR = "/tmp/autoredial_android"
shutil.rmtree(REPO_DIR, ignore_errors=True)
os.makedirs(REPO_DIR, exist_ok=True)

def write_file(rel_path, content):
    full_path = os.path.join(REPO_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

# 1. Root .gitignore
write_file(".gitignore", """
*.iml
.gradle
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
/.idea/navEditor.xml
/.idea/assetWizardSettings.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
app/build/
release-output/
""")

# 2. settings.gradle.kts
write_file("settings.gradle.kts", """
pluginManagement {
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
""")

# 3. build.gradle.kts (root)
write_file("build.gradle.kts", """
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
""")

# 4. gradle/libs.versions.toml
write_file("gradle/libs.versions.toml", """
[versions]
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
""")

# 5. gradle/wrapper/gradle-wrapper.properties
write_file("gradle/wrapper/gradle-wrapper.properties", """
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.6-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
""")

# 6. app/build.gradle.kts
write_file("app/build.gradle.kts", """
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.autoredial.pro"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.autoredial.pro"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.kotlinx.coroutines.android)
}
""")

# 7. app/proguard-rules.pro
write_file("app/proguard-rules.pro", "# Proguard rules")

# 8. AndroidManifest.xml
write_file("app/src/main/AndroidManifest.xml", """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.autoredial.pro">

    <!-- Telephony & Outgoing Call Permissions -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.READ_PHONE_NUMBERS" />
    <uses-permission android:name="android.permission.MANAGE_OWN_CALLS" />
    <uses-permission android:name="android.permission.ANSWER_PHONE_CALLS" />
    
    <!-- Contacts & Call Logs for Quick Picker & Saved Hotlines -->
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.READ_CALL_LOG" />

    <!-- Audio Recording for Real-Time Millisecond VAD & Speaker Routing -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <!-- Foreground Service Permissions (Required for Android 14+ / API 34) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_PHONE_CALL" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <uses-feature
        android:name="android.hardware.telephony"
        android:required="true" />
    <uses-feature
        android:name="android.hardware.microphone"
        android:required="true" />

    <application
        android:name=".AutoRedialApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.AutoRedialPro"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:screenOrientation="portrait"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.CallAudioMonitoringService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="phoneCall|microphone" />

        <service
            android:name=".service.AutoRedialInCallService"
            android:permission="android.permission.BIND_INCALL_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.telecom.InCallService" />
            </intent-filter>
            <meta-data
                android:name="android.telecom.IN_CALL_SERVICE_UI"
                android:value="false" />
        </service>

        <service
            android:name=".service.RedialAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="false">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

    </application>

</manifest>
""")

# 9. Kotlin files
write_file("app/src/main/java/com/autoredial/pro/AutoRedialApplication.kt", """package com.autoredial.pro

import android.app.Application

class AutoRedialApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
""")

write_file("app/src/main/java/com/autoredial/pro/telecom/CallManager.kt", """package com.autoredial.pro.telecom

import android.telecom.Call
import java.util.concurrent.atomic.AtomicBoolean

object CallManager {
    private var activeCall: Call? = null
    private val isConnectedState = AtomicBoolean(false)
    private var accessibilityEndCallListener: (() -> Unit)? = null

    @Synchronized
    fun registerCurrentCall(call: Call) {
        activeCall = call
        isConnectedState.set(false)
    }

    @Synchronized
    fun unregisterCurrentCall() {
        activeCall = null
        isConnectedState.set(false)
    }

    @Synchronized
    fun notifyCallConnected() {
        isConnectedState.set(true)
    }

    fun isCallActive(): Boolean {
        return isConnectedState.get() || (activeCall?.state == Call.STATE_ACTIVE)
    }

    @Synchronized
    fun disconnectActiveCall(): Boolean {
        activeCall?.let {
            it.disconnect()
            return true
        }
        return false
    }

    fun setAccessibilityEndCallListener(listener: () -> Unit) {
        accessibilityEndCallListener = listener
    }

    fun triggerAccessibilityEndCall() {
        accessibilityEndCallListener?.invoke()
    }
}
""")

write_file("app/src/main/java/com/autoredial/pro/audio/AudioToneClassifier.kt", """package com.autoredial.pro.audio

import kotlin.math.cos
import kotlin.math.sqrt

class AudioToneClassifier {

    enum class ToneType {
        SILENCE,
        RINGBACK_CADENCE,
        BUSY_OR_REORDER,
        HUMAN_VOICE_OR_IVR
    }

    private val freq440 = 440.0
    private val freq480 = 480.0
    private val freq620 = 620.0
    private val freqVoiceMid1 = 1200.0
    private val freqVoiceMid2 = 2400.0

    fun classifyAudioChunk(buffer: ShortArray, length: Int, sampleRate: Int): ToneType {
        if (length == 0) return ToneType.SILENCE

        var sumSquares = 0.0
        for (i in 0 until length) {
            sumSquares += buffer[i] * buffer[i]
        }
        val rms = sqrt(sumSquares / length)
        if (rms < 120.0) return ToneType.SILENCE

        val power440 = goertzelMagnitude(buffer, length, sampleRate, freq440)
        val power480 = goertzelMagnitude(buffer, length, sampleRate, freq480)
        val power620 = goertzelMagnitude(buffer, length, sampleRate, freq620)
        val powerVoiceMid1 = goertzelMagnitude(buffer, length, sampleRate, freqVoiceMid1)
        val powerVoiceMid2 = goertzelMagnitude(buffer, length, sampleRate, freqVoiceMid2)

        val ringPower = power440 + power480
        val voicePower = powerVoiceMid1 + powerVoiceMid2
        val busyPower = power480 + power620

        val ringRatio = ringPower / (rms * rms + 1.0)
        val voiceRatio = voicePower / (rms * rms + 1.0)

        if (ringRatio > 0.45 && voiceRatio < 0.20) {
            return ToneType.RINGBACK_CADENCE
        }

        if ((busyPower / (rms * rms + 1.0)) > 0.50) {
            return ToneType.BUSY_OR_REORDER
        }

        return ToneType.HUMAN_VOICE_OR_IVR
    }

    private fun goertzelMagnitude(buffer: ShortArray, numSamples: Int, sampleRate: Int, targetFreq: Double): Double {
        val k = (0.5 + ((numSamples.toDouble() * targetFreq) / sampleRate)).toInt()
        val omega = (2.0 * Math.PI * k) / numSamples
        val cosine = cos(omega)
        val coeff = 2.0 * cosine

        var q0: Double
        var q1 = 0.0
        var q2 = 0.0

        for (i in 0 until numSamples) {
            q0 = coeff * q1 - q2 + buffer[i]
            q2 = q1
            q1 = q0
        }

        val real = q1 - q2 * cosine
        val imag = q2 * kotlin.math.sin(omega)
        return (real * real + imag * imag) / (numSamples * numSamples)
    }
}
""")

write_file("app/src/main/java/com/autoredial/pro/service/AutoRedialInCallService.kt", """package com.autoredial.pro.service

import android.telecom.Call
import android.telecom.InCallService
import com.autoredial.pro.telecom.CallManager

class AutoRedialInCallService : InCallService() {

    private val callCallback = object : Call.Callback() {
        override fun onStateChanged(call: Call?, state: Int) {
            super.onStateChanged(call, state)
            when (state) {
                Call.STATE_ACTIVE -> {
                    CallManager.notifyCallConnected()
                }
                Call.STATE_DISCONNECTED -> {
                    CallManager.unregisterCurrentCall()
                }
            }
        }
    }

    override fun onCallAdded(call: Call?) {
        super.onCallAdded(call)
        call?.let {
            it.registerCallback(callCallback)
            CallManager.registerCurrentCall(it)
        }
    }

    override fun onCallRemoved(call: Call?) {
        super.onCallRemoved(call)
        call?.unregisterCallback(callCallback)
        CallManager.unregisterCurrentCall()
    }
}
""")

write_file("app/src/main/java/com/autoredial/pro/service/RedialAccessibilityService.kt", """package com.autoredial.pro.service

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.autoredial.pro.telecom.CallManager

class RedialAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        CallManager.setAccessibilityEndCallListener {
            performInstantEndCallClick()
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}

    override fun onInterrupt() {}

    private fun performInstantEndCallClick() {
        val rootNode = rootInActiveWindow ?: return
        val endCallKeywords = listOf("End call", "Disconnect", "Hang up", "Cut", "End")

        for (keyword in endCallKeywords) {
            val nodes = rootNode.findAccessibilityNodeInfosByText(keyword)
            for (node in nodes) {
                if (node.isClickable) {
                    node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                    return
                }
            }
        }

        performGlobalAction(GLOBAL_ACTION_BACK)
    }
}
""")

write_file("app/src/main/java/com/autoredial/pro/service/CallAudioMonitoringService.kt", """package com.autoredial.pro.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioDeviceInfo
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.MediaRecorder
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.telecom.TelecomManager
import androidx.core.app.NotificationCompat
import com.autoredial.pro.R
import com.autoredial.pro.audio.AudioToneClassifier
import com.autoredial.pro.telecom.CallManager
import kotlinx.coroutines.*
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.sqrt

class CallAudioMonitoringService : Service() {

    companion object {
        const val ACTION_START_REDIAL = "com.autoredial.pro.START_REDIAL"
        const val ACTION_STOP_REDIAL = "com.autoredial.pro.STOP_REDIAL"
        const val ACTION_CALL_STATE_CHANGED = "com.autoredial.pro.CALL_STATE_CHANGED"
        const val ACTION_REDIAL_TERMINATED = "com.autoredial.pro.REDIAL_TERMINATED"

        const val EXTRA_PHONE_NUMBER = "extra_phone_number"
        const val EXTRA_REDIAL_DELAY_MS = "extra_redial_delay_ms"
        const val EXTRA_AUTO_SPEAKER = "extra_auto_speaker"
        const val EXTRA_MUTE_REDIALS = "extra_mute_redials"
        const val EXTRA_STATE_NAME = "extra_state_name"
        const val EXTRA_STATE_DETAIL = "extra_state_detail"
        const val EXTRA_ATTEMPT_COUNT = "extra_attempt_count"
        const val EXTRA_CUT_LATENCY_MS = "extra_cut_latency_ms"
        const val EXTRA_VAD_ENERGY = "extra_vad_energy"
        const val EXTRA_TERMINATION_REASON = "extra_termination_reason"

        private const val NOTIFICATION_CHANNEL_ID = "channel_autoredial_service"
        private const val NOTIFICATION_ID = 1001

        private const val SAMPLE_RATE = 16000
        private const val CHUNK_DURATION_MS = 20
        private const val BUFFER_SIZE_SAMPLES = (SAMPLE_RATE * CHUNK_DURATION_MS) / 1000
    }

    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private val isRunning = AtomicBoolean(false)
    private var isAudioSampling = false

    private var targetPhoneNumber = ""
    private var redialDelayMs = 50L
    private var isAutoSpeakerEnabled = true
    private var isMuteRedialsEnabled = true
    private var attemptCount = 0

    private var audioManager: AudioManager? = null
    private var audioRecord: AudioRecord? = null
    private val toneClassifier = AudioToneClassifier()

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_REDIAL -> {
                targetPhoneNumber = intent.getStringExtra(EXTRA_PHONE_NUMBER) ?: ""
                redialDelayMs = intent.getLongExtra(EXTRA_REDIAL_DELAY_MS, 50L)
                isAutoSpeakerEnabled = intent.getBooleanExtra(EXTRA_AUTO_SPEAKER, true)
                isMuteRedialsEnabled = intent.getBooleanExtra(EXTRA_MUTE_REDIALS, true)

                startForeground(NOTIFICATION_ID, buildForegroundNotification("AutoRedial Pro Active"))
                startRedialLoop()
            }
            ACTION_STOP_REDIAL -> {
                stopRedialLoop("User requested stop")
            }
        }
        return START_NOT_STICKY
    }

    private fun startRedialLoop() {
        if (isRunning.getAndSet(true)) return
        attemptCount = 0

        serviceScope.launch {
            while (isRunning.get()) {
                attemptCount++
                val dialStartTime = System.currentTimeMillis()

                if (isMuteRedialsEnabled) {
                    silenceDialingAudio(true)
                }

                broadcastState(
                    state = "DIALING...",
                    detail = "Placing attempt #$attemptCount to $targetPhoneNumber",
                    attempts = attemptCount
                )

                initiateOutgoingCall(targetPhoneNumber)
                delay(120)

                val result = monitorCallAudioUntilCutOrConnected(dialStartTime)

                if (result == CallResult.CONNECTED) {
                    restoreAudioStreams()
                    if (isAutoSpeakerEnabled) {
                        setSpeakerphone(true)
                    }

                    broadcastState("CONNECTED!", "Recipient answered! Smart stop initiated.", attemptCount)
                    stopRedialLoop("Call connected with remote party")
                    break
                }

                if (!isRunning.get()) break

                broadcastState(
                    state = "DIALING...",
                    detail = "Instant cut executed. Redialing in ${redialDelayMs}ms...",
                    attempts = attemptCount
                )
                delay(redialDelayMs)
            }
        }
    }

    private suspend fun monitorCallAudioUntilCutOrConnected(dialStartTime: Long): CallResult = withContext(Dispatchers.IO) {
        val minBufferSize = AudioRecord.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )
        val bufferSize = maxOf(minBufferSize, BUFFER_SIZE_SAMPLES * 2)

        try {
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                bufferSize
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                audioRecord = AudioRecord(
                    MediaRecorder.AudioSource.MIC,
                    SAMPLE_RATE,
                    AudioFormat.CHANNEL_IN_MONO,
                    AudioFormat.ENCODING_PCM_16BIT,
                    bufferSize
                )
            }

            audioRecord?.startRecording()
            isAudioSampling = true

            val audioBuffer = ShortArray(BUFFER_SIZE_SAMPLES)
            var consecutiveVoiceFrames = 0
            val voiceThresholdRms = 280.0

            val maxCallWaitTimeoutMs = 45000L
            val callStartEpoch = System.currentTimeMillis()

            while (isRunning.get() && isAudioSampling) {
                if (System.currentTimeMillis() - callStartEpoch > maxCallWaitTimeoutMs) {
                    disconnectCallInstantly()
                    return@withContext CallResult.DISCONNECTED_TIMEOUT
                }

                if (CallManager.isCallActive()) {
                    return@withContext CallResult.CONNECTED
                }

                val readCount = audioRecord?.read(audioBuffer, 0, audioBuffer.size) ?: 0
                if (readCount <= 0) {
                    delay(5)
                    continue
                }

                var sum = 0.0
                for (i in 0 until readCount) {
                    sum += audioBuffer[i] * audioBuffer[i]
                }
                val rms = sqrt(sum / readCount)
                val normalizedEnergy = (rms / 3000.0).toFloat().coerceIn(0f, 1f)

                val toneType = toneClassifier.classifyAudioChunk(audioBuffer, readCount, SAMPLE_RATE)

                when (toneType) {
                    AudioToneClassifier.ToneType.RINGBACK_CADENCE -> {
                        restoreAudioStreams()
                        if (isAutoSpeakerEnabled) {
                            setSpeakerphone(true)
                        }

                        broadcastState(
                            state = "RINGING...",
                            detail = if (isAutoSpeakerEnabled) "Ringing detected (Speaker ON)" else "Ringing cadence locked. Keeping call alive.",
                            attempts = attemptCount,
                            vadEnergy = normalizedEnergy
                        )
                        consecutiveVoiceFrames = 0
                    }

                    AudioToneClassifier.ToneType.BUSY_OR_REORDER -> {
                        val cutSpeedMs = System.currentTimeMillis() - dialStartTime
                        disconnectCallInstantly()
                        broadcastState(
                            state = "VOICE / BUSY DETECTED!",
                            detail = "Busy / Congestion tone detected. Disconnected in ${cutSpeedMs}ms!",
                            attempts = attemptCount,
                            cutLatencyMs = cutSpeedMs,
                            vadEnergy = normalizedEnergy
                        )
                        return@withContext CallResult.DISCONNECTED_BUSY
                    }

                    AudioToneClassifier.ToneType.HUMAN_VOICE_OR_IVR -> {
                        if (rms > voiceThresholdRms) {
                            consecutiveVoiceFrames++
                            if (consecutiveVoiceFrames >= 2) {
                                val cutSpeedMs = System.currentTimeMillis() - dialStartTime
                                disconnectCallInstantly()
                                broadcastState(
                                    state = "VOICE / BUSY DETECTED!",
                                    detail = "IVR voice prompt cut in ${cutSpeedMs}ms! Redialing...",
                                    attempts = attemptCount,
                                    cutLatencyMs = cutSpeedMs,
                                    vadEnergy = normalizedEnergy
                                )
                                return@withContext CallResult.DISCONNECTED_IVR
                            }
                        }
                    }

                    AudioToneClassifier.ToneType.SILENCE -> {
                        consecutiveVoiceFrames = 0
                        broadcastState(
                            state = "DETECTING AUDIO...",
                            detail = "Monitoring audio stream (<20ms VAD window)...",
                            attempts = attemptCount,
                            vadEnergy = normalizedEnergy
                        )
                    }
                }
            }

            CallResult.DISCONNECTED_MANUAL
        } finally {
            cleanupAudioRecord()
        }
    }

    private fun setSpeakerphone(enable: Boolean) {
        try {
            audioManager?.let { am ->
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val speakerDevice = am.availableCommunicationDevices.firstOrNull {
                        it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
                    }
                    if (enable && speakerDevice != null) {
                        am.setCommunicationDevice(speakerDevice)
                    } else {
                        am.clearCommunicationDevice()
                    }
                } else {
                    @Suppress("DEPRECATION")
                    am.isSpeakerphoneOn = enable
                }
            }
        } catch (_: Exception) {}
    }

    private fun silenceDialingAudio(mute: Boolean) {
        try {
            audioManager?.let { am ->
                val direction = if (mute) AudioManager.ADJUST_MUTE else AudioManager.ADJUST_UNMUTE
                am.adjustStreamVolume(AudioManager.STREAM_VOICE_CALL, direction, 0)
            }
        } catch (_: Exception) {}
    }

    private fun restoreAudioStreams() {
        silenceDialingAudio(false)
    }

    private fun initiateOutgoingCall(phoneNumber: String) {
        try {
            val callIntent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:${Uri.encode(phoneNumber)}")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(callIntent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun disconnectCallInstantly() {
        val inCallHandled = CallManager.disconnectActiveCall()
        if (!inCallHandled) {
            try {
                val telecomManager = getSystemService(Context.TELECOM_SERVICE) as TelecomManager
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    telecomManager.endCall()
                }
            } catch (_: SecurityException) {
                CallManager.triggerAccessibilityEndCall()
            }
        }
    }

    private fun stopRedialLoop(reason: String) {
        isRunning.set(false)
        isAudioSampling = false
        restoreAudioStreams()
        cleanupAudioRecord()

        val intent = Intent(ACTION_REDIAL_TERMINATED).apply {
            putExtra(EXTRA_TERMINATION_REASON, reason)
        }
        sendBroadcast(intent)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun cleanupAudioRecord() {
        try {
            audioRecord?.stop()
            audioRecord?.release()
        } catch (_: Exception) {}
        audioRecord = null
        isAudioSampling = false
    }

    private fun broadcastState(
        state: String,
        detail: String,
        attempts: Int,
        cutLatencyMs: Long = -1L,
        vadEnergy: Float = 0f
    ) {
        val intent = Intent(ACTION_CALL_STATE_CHANGED).apply {
            putExtra(EXTRA_STATE_NAME, state)
            putExtra(EXTRA_STATE_DETAIL, detail)
            putExtra(EXTRA_ATTEMPT_COUNT, attempts)
            putExtra(EXTRA_CUT_LATENCY_MS, cutLatencyMs)
            putExtra(EXTRA_VAD_ENERGY, vadEnergy)
        }
        sendBroadcast(intent)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "AutoRedial Pro Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(content: String): Notification {
        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("AutoRedial Pro")
            .setContentText(content)
            .setSmallIcon(R.drawable.ic_call)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopRedialLoop("Service destroyed")
        serviceScope.cancel()
    }

    enum class CallResult {
        CONNECTED,
        DISCONNECTED_IVR,
        DISCONNECTED_BUSY,
        DISCONNECTED_TIMEOUT,
        DISCONNECTED_MANUAL
    }
}
""")

write_file("app/src/main/java/com/autoredial/pro/MainActivity.kt", """package com.autoredial.pro

import android.Manifest
import android.app.role.RoleManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.database.Cursor
import android.media.AudioManager
import android.media.ToneGenerator
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.provider.ContactsContract
import android.view.LayoutInflater
import android.view.View
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import com.autoredial.pro.databinding.ActivityMainBinding
import com.autoredial.pro.service.CallAudioMonitoringService
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.chip.Chip

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var prefs: SharedPreferences
    private var isRedialingActive = false
    private var targetPhoneNumber: String = ""
    private var toneGenerator: ToneGenerator? = null

    private val serviceReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                CallAudioMonitoringService.ACTION_CALL_STATE_CHANGED -> {
                    val state = intent.getStringExtra(CallAudioMonitoringService.EXTRA_STATE_NAME) ?: "IDLE"
                    val detail = intent.getStringExtra(CallAudioMonitoringService.EXTRA_STATE_DETAIL) ?: ""
                    val attempts = intent.getIntExtra(CallAudioMonitoringService.EXTRA_ATTEMPT_COUNT, 1)
                    val cutLatencyMs = intent.getLongExtra(CallAudioMonitoringService.EXTRA_CUT_LATENCY_MS, -1L)
                    val vadEnergy = intent.getFloatExtra(CallAudioMonitoringService.EXTRA_VAD_ENERGY, 0f)

                    updateUiState(state, detail, attempts, cutLatencyMs, vadEnergy)
                }
                CallAudioMonitoringService.ACTION_REDIAL_TERMINATED -> {
                    val reason = intent.getStringExtra(CallAudioMonitoringService.EXTRA_TERMINATION_REASON) ?: "Stopped"
                    onRedialStopped(reason)
                }
            }
        }
    }

    private val contactPickerLauncher = registerForActivityResult(
        ActivityResultContracts.PickContact()
    ) { contactUri: Uri? ->
        contactUri?.let { uri ->
            retrievePhoneNumberFromContact(uri)
        }
    }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val callPhoneGranted = permissions[Manifest.permission.CALL_PHONE] ?: false
        val recordAudioGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: false

        if (callPhoneGranted && recordAudioGranted) {
            checkDefaultDialerRoleAndStart()
        } else {
            Toast.makeText(this, "Permissions required for auto-dialing & audio detection", Toast.LENGTH_LONG).show()
        }
    }

    private val roleManagerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        startRedialEngine()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        prefs = getSharedPreferences("autoredial_prefs", Context.MODE_PRIVATE)
        initToneGenerator()
        setupListeners()
        loadSavedSettings()
        registerBroadcastReceiver()
    }

    private fun initToneGenerator() {
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_DTMF, 80)
        } catch (_: Exception) {}
    }

    private fun setupListeners() {
        binding.btnStartRedial.setOnClickListener {
            val phone = binding.etPhoneNumber.text?.toString()?.trim() ?: ""
            if (phone.isEmpty()) {
                binding.tilPhoneNumber.error = "Please enter or pick a phone number"
                return@setOnClickListener
            }
            binding.tilPhoneNumber.error = null
            targetPhoneNumber = phone
            saveLastUsedNumber(phone)
            requestRequiredPermissions()
        }

        binding.fabStopRedial.setOnClickListener {
            stopRedialEngine("User pressed Stop")
        }

        binding.btnOpenDialpad.setOnClickListener {
            showDialpadBottomSheet()
        }

        binding.btnPickContact.setOnClickListener {
            contactPickerLauncher.launch(null)
        }

        binding.tvAddHotline.setOnClickListener {
            showAddHotlineDialog()
        }

        binding.chipDoctorClinic.setOnClickListener {
            binding.etPhoneNumber.setText("+1 (555) 019-2834")
        }
        binding.chipEmergency.setOnClickListener {
            binding.etPhoneNumber.setText("+880 1711 000000")
        }
        binding.chipSupport.setOnClickListener {
            binding.etPhoneNumber.setText("333")
        }

        binding.sliderRedialDelay.addOnChangeListener { _, value, _ ->
            val ms = value.toInt()
            binding.tvDelayValue.text = if (ms == 0) "0 ms (Instant Cut)" else "$ms ms"
            prefs.edit().putInt("redial_delay_ms", ms).apply()
        }

        binding.btnDelay0ms.setOnClickListener { binding.sliderRedialDelay.value = 0f }
        binding.btnDelay50ms.setOnClickListener { binding.sliderRedialDelay.value = 50f }
        binding.btnDelay250ms.setOnClickListener { binding.sliderRedialDelay.value = 250f }
        binding.btnDelay1000ms.setOnClickListener { binding.sliderRedialDelay.value = 1000f }

        binding.switchAutoSpeaker.setOnCheckedChangeListener { _, isChecked ->
            prefs.edit().putBoolean("auto_speaker_enabled", isChecked).apply()
        }
        binding.switchMuteRedials.setOnCheckedChangeListener { _, isChecked ->
            prefs.edit().putBoolean("mute_redials_enabled", isChecked).apply()
        }
    }

    private fun loadSavedSettings() {
        val savedDelay = prefs.getInt("redial_delay_ms", 50)
        binding.sliderRedialDelay.value = savedDelay.toFloat().coerceIn(0f, 2000f)
        binding.tvDelayValue.text = "$savedDelay ms"

        binding.switchAutoSpeaker.isChecked = prefs.getBoolean("auto_speaker_enabled", true)
        binding.switchMuteRedials.isChecked = prefs.getBoolean("mute_redials_enabled", true)

        val lastNumber = prefs.getString("last_dialed_number", "")
        if (!lastNumber.isNullOrEmpty()) {
            binding.etPhoneNumber.setText(lastNumber)
        }
    }

    private fun saveLastUsedNumber(number: String) {
        prefs.edit().putString("last_dialed_number", number).apply()
    }

    private fun retrievePhoneNumberFromContact(contactUri: Uri) {
        val cursor: Cursor? = contentResolver.query(contactUri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val idIndex = it.getColumnIndex(ContactsContract.Contacts._ID)
                val hasPhoneIndex = it.getColumnIndex(ContactsContract.Contacts.HAS_PHONE_NUMBER)

                if (idIndex != -1 && hasPhoneIndex != -1) {
                    val contactId = it.getString(idIndex)
                    val hasPhone = it.getInt(hasPhoneIndex)

                    if (hasPhone > 0) {
                        val phoneCursor: Cursor? = contentResolver.query(
                            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                            null,
                            "${ContactsContract.CommonDataKinds.Phone.CONTACT_ID} = ?",
                            arrayOf(contactId),
                            null
                        )
                        phoneCursor?.use { pCursor ->
                            if (pCursor.moveToFirst()) {
                                val numberIndex = pCursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)
                                if (numberIndex != -1) {
                                    val phone = pCursor.getString(numberIndex)
                                    binding.etPhoneNumber.setText(phone.replace(" ", ""))
                                    Toast.makeText(this, "Selected: $phone", Toast.LENGTH_SHORT).show()
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private fun showDialpadBottomSheet() {
        val dialog = BottomSheetDialog(this, R.style.Theme_AutoRedial_BottomSheet)
        val sheetView = layoutInflater.inflate(R.layout.bottom_sheet_dialpad, null)
        dialog.setContentView(sheetView)

        val tvDisplay = sheetView.findViewById<TextView>(R.id.tvDialpadDisplay)
        val btnBackspace = sheetView.findViewById<ImageView>(R.id.btnDialpadBackspace)
        val btnApply = sheetView.findViewById<View>(R.id.btnDialpadApply)

        tvDisplay.text = binding.etPhoneNumber.text?.toString() ?: ""

        fun appendDigit(digit: String, tone: Int) {
            tvDisplay.append(digit)
            toneGenerator?.startTone(tone, 100)
            triggerHapticFeedback(15)
        }

        sheetView.findViewById<View>(R.id.key1)?.setOnClickListener { appendDigit("1", ToneGenerator.TONE_DTMF_1) }
        sheetView.findViewById<View>(R.id.key2)?.setOnClickListener { appendDigit("2", ToneGenerator.TONE_DTMF_2) }
        sheetView.findViewById<View>(R.id.key3)?.setOnClickListener { appendDigit("3", ToneGenerator.TONE_DTMF_3) }
        sheetView.findViewById<View>(R.id.key4)?.setOnClickListener { appendDigit("4", ToneGenerator.TONE_DTMF_4) }
        sheetView.findViewById<View>(R.id.key5)?.setOnClickListener { appendDigit("5", ToneGenerator.TONE_DTMF_5) }
        sheetView.findViewById<View>(R.id.key6)?.setOnClickListener { appendDigit("6", ToneGenerator.TONE_DTMF_6) }
        sheetView.findViewById<View>(R.id.key7)?.setOnClickListener { appendDigit("7", ToneGenerator.TONE_DTMF_7) }
        sheetView.findViewById<View>(R.id.key8)?.setOnClickListener { appendDigit("8", ToneGenerator.TONE_DTMF_8) }
        sheetView.findViewById<View>(R.id.key9)?.setOnClickListener { appendDigit("9", ToneGenerator.TONE_DTMF_9) }
        sheetView.findViewById<View>(R.id.keyStar)?.setOnClickListener { appendDigit("*", ToneGenerator.TONE_DTMF_S) }
        sheetView.findViewById<View>(R.id.key0)?.setOnClickListener { appendDigit("0", ToneGenerator.TONE_DTMF_0) }
        sheetView.findViewById<View>(R.id.keyHash)?.setOnClickListener { appendDigit("#", ToneGenerator.TONE_DTMF_P) }

        sheetView.findViewById<View>(R.id.key0)?.setOnLongClickListener {
            tvDisplay.append("+")
            toneGenerator?.startTone(ToneGenerator.TONE_DTMF_0, 150)
            triggerHapticFeedback(30)
            true
        }

        btnBackspace?.setOnClickListener {
            val current = tvDisplay.text.toString()
            if (current.isNotEmpty()) {
                tvDisplay.text = current.substring(0, current.length - 1)
                triggerHapticFeedback(15)
            }
        }
        btnBackspace?.setOnLongClickListener {
            tvDisplay.text = ""
            triggerHapticFeedback(40)
            true
        }

        btnApply?.setOnClickListener {
            binding.etPhoneNumber.setText(tvDisplay.text.toString())
            dialog.dismiss()
        }

        dialog.show()
    }

    private fun showAddHotlineDialog() {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_add_hotline, null)
        val etName = dialogView.findViewById<EditText>(R.id.etHotlineName)
        val etNumber = dialogView.findViewById<EditText>(R.id.etHotlineNumber)

        etNumber.setText(binding.etPhoneNumber.text?.toString() ?: "")

        AlertDialog.Builder(this, R.style.Theme_AutoRedial_Dialog)
            .setTitle("Save Quick Contact / Hotline")
            .setView(dialogView)
            .setPositiveButton("Save") { _, _ ->
                val name = etName.text.toString().trim()
                val number = etNumber.text.toString().trim()
                if (name.isNotEmpty() && number.isNotEmpty()) {
                    addHotlineChip(name, number)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun addHotlineChip(name: String, number: String) {
        val chip = Chip(this).apply {
            text = "$name ($number)"
            isClickable = true
            isCheckable = false
            setChipIconResource(R.drawable.ic_call)
            setOnClickListener {
                binding.etPhoneNumber.setText(number)
                Toast.makeText(this@MainActivity, "Loaded: $name", Toast.LENGTH_SHORT).show()
            }
        }
        binding.layoutHotlineChips.addView(chip, 0)
    }

    private fun requestRequiredPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.CALL_PHONE,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.READ_CONTACTS
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val missing = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missing.isEmpty()) {
            checkDefaultDialerRoleAndStart()
        } else {
            permissionLauncher.launch(missing.toTypedArray())
        }
    }

    private fun checkDefaultDialerRoleAndStart() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = getSystemService(RoleManager::class.java)
            if (roleManager != null && roleManager.isRoleAvailable(RoleManager.ROLE_DIALER) &&
                !roleManager.isRoleHeld(RoleManager.ROLE_DIALER)) {
                val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_DIALER)
                roleManagerLauncher.launch(intent)
                return
            }
        }
        startRedialEngine()
    }

    private fun startRedialEngine() {
        isRedialingActive = true
        binding.btnStartRedial.visibility = View.INVISIBLE
        binding.fabStopRedial.visibility = View.VISIBLE
        binding.tilPhoneNumber.isEnabled = false
        binding.btnOpenDialpad.isEnabled = false
        binding.btnPickContact.isEnabled = false

        val delayMs = binding.sliderRedialDelay.value.toLong()
        val autoSpeaker = binding.switchAutoSpeaker.isChecked
        val muteRedials = binding.switchMuteRedials.isChecked

        val serviceIntent = Intent(this, CallAudioMonitoringService::class.java).apply {
            action = CallAudioMonitoringService.ACTION_START_REDIAL
            putExtra(CallAudioMonitoringService.EXTRA_PHONE_NUMBER, targetPhoneNumber)
            putExtra(CallAudioMonitoringService.EXTRA_REDIAL_DELAY_MS, delayMs)
            putExtra(CallAudioMonitoringService.EXTRA_AUTO_SPEAKER, autoSpeaker)
            putExtra(CallAudioMonitoringService.EXTRA_MUTE_REDIALS, muteRedials)
        }

        ContextCompat.startForegroundService(this, serviceIntent)
        triggerHapticFeedback(40)
    }

    private fun stopRedialEngine(reason: String) {
        val serviceIntent = Intent(this, CallAudioMonitoringService::class.java).apply {
            action = CallAudioMonitoringService.ACTION_STOP_REDIAL
        }
        startService(serviceIntent)
        onRedialStopped(reason)
    }

    private fun onRedialStopped(reason: String) {
        isRedialingActive = false
        binding.btnStartRedial.visibility = View.VISIBLE
        binding.fabStopRedial.visibility = View.GONE
        binding.tilPhoneNumber.isEnabled = true
        binding.btnOpenDialpad.isEnabled = true
        binding.btnPickContact.isEnabled = true
        binding.viewPulseHalo.visibility = View.INVISIBLE

        binding.tvCallState.text = "STOPPED"
        binding.tvStateDetail.text = reason
        binding.progressVadLevel.progress = 0
        binding.tvVadThresholdValue.text = "0 dB"
        triggerHapticFeedback(50)
    }

    private fun updateUiState(state: String, detail: String, attempts: Int, cutLatencyMs: Long, vadEnergy: Float) {
        binding.tvCallState.text = state
        binding.tvStateDetail.text = detail
        binding.tvAttemptCount.text = attempts.toString()

        if (cutLatencyMs > 0) {
            binding.tvLastCutSpeed.text = "$cutLatencyMs ms"
        }

        val progressInt = (vadEnergy.coerceIn(0f, 1f) * 100).toInt()
        binding.progressVadLevel.progress = progressInt
        binding.tvVadThresholdValue.text = "${(progressInt * 0.6).toInt()} dB"

        when (state) {
            "DIALING...", "DETECTING AUDIO..." -> {
                binding.viewPulseHalo.visibility = View.VISIBLE
            }
            "RINGING..." -> {
                binding.viewPulseHalo.visibility = View.VISIBLE
                if (binding.switchAutoSpeaker.isChecked) {
                    binding.tvStateDetail.text = "Ringing (Speaker ON - Handsfree Active)"
                }
            }
            "CONNECTED!" -> {
                binding.viewPulseHalo.visibility = View.INVISIBLE
                Toast.makeText(this, "Call Connected! Auto-redial stopped automatically.", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun registerBroadcastReceiver() {
        val filter = IntentFilter().apply {
            addAction(CallAudioMonitoringService.ACTION_CALL_STATE_CHANGED)
            addAction(CallAudioMonitoringService.ACTION_REDIAL_TERMINATED)
        }
        ContextCompat.registerReceiver(
            this,
            serviceReceiver,
            filter,
            ContextCompat.RECEIVER_NOT_EXPORTED
        )
    }

    private fun triggerHapticFeedback(durationMs: Long = 30) {
        val vibrator = getSystemService(Vibrator::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(serviceReceiver)
        toneGenerator?.release()
    }
}
""")

# 10. Layouts
write_file("app/src/main/res/layout/activity_main.xml", """<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/colorBackground"
    tools:context=".MainActivity">

    <com.google.android.material.appbar.AppBarLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="@android:color/transparent"
        app:elevation="0dp">

        <com.google.android.material.appbar.MaterialToolbar
            android:id="@+id/topAppBar"
            android:layout_width="match_parent"
            android:layout_height="?attr/actionBarSize"
            app:title="AutoRedial Pro"
            app:titleCentered="true"
            app:titleTextAppearance="@style/TextAppearance.AutoRedial.Toolbar" />
    </com.google.android.material.appbar.AppBarLayout>

    <androidx.core.widget.NestedScrollView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:fillViewport="true"
        app:layout_behavior="@string/appbar_scrolling_view_behavior">

        <androidx.constraintlayout.widget.ConstraintLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:padding="20dp"
            android:paddingBottom="100dp">

            <LinearLayout
                android:id="@+id/layoutInputRow"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:gravity="center_vertical"
                android:orientation="horizontal"
                app:layout_constraintEnd_toEndOf="parent"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toTopOf="parent">

                <com.google.android.material.textfield.TextInputLayout
                    android:id="@+id/tilPhoneNumber"
                    style="@style/Widget.Material3.TextInputLayout.OutlinedBox"
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:hint="@string/hint_phone_number"
                    app:boxCornerRadiusBottomEnd="16dp"
                    app:boxCornerRadiusBottomStart="16dp"
                    app:boxCornerRadiusTopEnd="16dp"
                    app:boxCornerRadiusTopStart="16dp"
                    app:boxStrokeColor="@color/colorPrimary"
                    app:boxStrokeWidth="1.5dp"
                    app:endIconMode="clear_text"
                    app:startIconDrawable="@drawable/ic_call">

                    <com.google.android.material.textfield.TextInputEditText
                        android:id="@+id/etPhoneNumber"
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:fontFamily="sans-serif-medium"
                        android:imeOptions="actionDone"
                        android:inputType="phone"
                        android:letterSpacing="0.05"
                        android:maxLines="1"
                        android:textSize="18sp" />
                </com.google.android.material.textfield.TextInputLayout>

                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnOpenDialpad"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="54dp"
                    android:layout_height="56dp"
                    android:layout_marginStart="8dp"
                    app:cornerRadius="16dp"
                    app:icon="@drawable/ic_dialpad"
                    app:iconGravity="textStart"
                    app:iconPadding="0dp"
                    app:iconSize="22dp"
                    app:iconTint="@color/colorAccentCyan" />

                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnPickContact"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="54dp"
                    android:layout_height="56dp"
                    android:layout_marginStart="8dp"
                    app:cornerRadius="16dp"
                    app:icon="@drawable/ic_contacts"
                    app:iconGravity="textStart"
                    app:iconPadding="0dp"
                    app:iconSize="22dp"
                    app:iconTint="@color/colorPrimary" />
            </LinearLayout>

            <LinearLayout
                android:id="@+id/layoutSavedHotlines"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_marginTop="14dp"
                android:orientation="vertical"
                app:layout_constraintEnd_toEndOf="parent"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toBottomOf="@id/layoutInputRow">

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:gravity="center_vertical"
                    android:orientation="horizontal">

                    <TextView
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_weight="1"
                        android:fontFamily="sans-serif-bold"
                        android:text="@string/title_saved_hotlines"
                        android:textColor="@color/colorTextSecondary"
                        android:textSize="12sp" />

                    <TextView
                        android:id="@+id/tvAddHotline"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:fontFamily="sans-serif-bold"
                        android:text="+ Add Quick Number"
                        android:textColor="@color/colorPrimary"
                        android:textSize="12sp" />
                </LinearLayout>

                <HorizontalScrollView
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:layout_marginTop="8dp"
                    android:scrollbars="none">

                    <LinearLayout
                        android:id="@+id/layoutHotlineChips"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:orientation="horizontal">

                        <com.google.android.material.chip.Chip
                            android:id="@+id/chipDoctorClinic"
                            style="@style/Widget.Material3.Chip.Assist"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:layout_marginEnd="8dp"
                            android:text="Dr. Clinic (+1 555-0192)" />

                        <com.google.android.material.chip.Chip
                            android:id="@+id/chipEmergency"
                            style="@style/Widget.Material3.Chip.Assist"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:layout_marginEnd="8dp"
                            android:text="Hospital Desk (+880 1711)" />

                        <com.google.android.material.chip.Chip
                            android:id="@+id/chipSupport"
                            style="@style/Widget.Material3.Chip.Assist"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Govt Hotline (333)" />
                    </LinearLayout>
                </HorizontalScrollView>
            </LinearLayout>

            <com.google.android.material.card.MaterialCardView
                android:id="@+id/cardStatus"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_marginTop="16dp"
                app:cardBackgroundColor="@color/colorSurfaceCard"
                app:cardCornerRadius="24dp"
                app:cardElevation="2dp"
                app:strokeColor="@color/colorBorder"
                app:strokeWidth="1dp"
                app:layout_constraintEnd_toEndOf="parent"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toBottomOf="@id/layoutSavedHotlines">

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:gravity="center"
                    android:orientation="vertical"
                    android:padding="20dp">

                    <FrameLayout
                        android:layout_width="72dp"
                        android:layout_height="72dp">

                        <View
                            android:id="@+id/viewPulseHalo"
                            android:layout_width="72dp"
                            android:layout_height="72dp"
                            android:background="@drawable/bg_pulse_halo"
                            android:visibility="invisible" />

                        <ImageView
                            android:id="@+id/ivStatusIcon"
                            android:layout_width="52dp"
                            android:layout_height="52dp"
                            android:layout_gravity="center"
                            android:background="@drawable/bg_icon_circle"
                            android:padding="12dp"
                            android:src="@drawable/ic_call_idle"
                            app:tint="@color/colorPrimary" />
                    </FrameLayout>

                    <TextView
                        android:id="@+id/tvCallState"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="12dp"
                        android:fontFamily="sans-serif-black"
                        android:text="@string/state_idle"
                        android:textColor="@color/colorTextPrimary"
                        android:textSize="20sp" />

                    <TextView
                        android:id="@+id/tvStateDetail"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="3dp"
                        android:fontFamily="sans-serif"
                        android:text="@string/detail_ready_to_call"
                        android:textColor="@color/colorTextSecondary"
                        android:textSize="13sp" />

                    <LinearLayout
                        android:id="@+id/layoutVadMonitor"
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="14dp"
                        android:gravity="center_vertical"
                        android:orientation="horizontal">

                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="@string/label_vad_level"
                            android:textColor="@color/colorTextTertiary"
                            android:textSize="11sp" />

                        <com.google.android.material.progressindicator.LinearProgressIndicator
                            android:id="@+id/progressVadLevel"
                            android:layout_width="0dp"
                            android:layout_height="8dp"
                            android:layout_marginStart="10dp"
                            android:layout_marginEnd="8dp"
                            android:layout_weight="1"
                            app:indicatorColor="@color/colorAccentCyan"
                            app:trackColor="@color/colorTrack"
                            app:trackCornerRadius="4dp" />

                        <TextView
                            android:id="@+id/tvVadThresholdValue"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:fontFamily="monospace"
                            android:text="0 dB"
                            android:textColor="@color/colorTextSecondary"
                            android:textSize="11sp" />
                    </LinearLayout>

                    <LinearLayout
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="16dp"
                        android:orientation="horizontal">

                        <LinearLayout
                            android:layout_width="0dp"
                            android:layout_height="wrap_content"
                            android:layout_weight="1"
                            android:gravity="center"
                            android:orientation="vertical">

                            <TextView
                                android:id="@+id/tvAttemptCount"
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:fontFamily="sans-serif-black"
                                android:text="0"
                                android:textColor="@color/colorPrimary"
                                android:textSize="18sp" />

                            <TextView
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="@string/stat_attempts"
                                android:textColor="@color/colorTextTertiary"
                                android:textSize="10sp" />
                        </LinearLayout>

                        <View
                            android:layout_width="1dp"
                            android:layout_height="22dp"
                            android:layout_gravity="center_vertical"
                            android:background="@color/colorBorder" />

                        <LinearLayout
                            android:layout_width="0dp"
                            android:layout_height="wrap_content"
                            android:layout_weight="1"
                            android:gravity="center"
                            android:orientation="vertical">

                            <TextView
                                android:id="@+id/tvLastCutSpeed"
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:fontFamily="sans-serif-black"
                                android:text="-- ms"
                                android:textColor="@color/colorWarning"
                                android:textSize="18sp" />

                            <TextView
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="@string/stat_cut_speed"
                                android:textColor="@color/colorTextTertiary"
                                android:textSize="10sp" />
                        </LinearLayout>

                        <View
                            android:layout_width="1dp"
                            android:layout_height="22dp"
                            android:layout_gravity="center_vertical"
                            android:background="@color/colorBorder" />

                        <LinearLayout
                            android:layout_width="0dp"
                            android:layout_height="wrap_content"
                            android:layout_weight="1"
                            android:gravity="center"
                            android:orientation="vertical">

                            <TextView
                                android:id="@+id/tvRingingStatus"
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:fontFamily="sans-serif-black"
                                android:text="440/480Hz"
                                android:textColor="@color/colorSuccess"
                                android:textSize="12sp" />

                            <TextView
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="@string/stat_ring_filter"
                                android:textColor="@color/colorTextTertiary"
                                android:textSize="10sp" />
                        </LinearLayout>
                    </LinearLayout>
                </LinearLayout>
            </com.google.android.material.card.MaterialCardView>

            <com.google.android.material.card.MaterialCardView
                android:id="@+id/cardAudioControls"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_marginTop="14dp"
                app:cardBackgroundColor="@color/colorSurfaceCard"
                app:cardCornerRadius="20dp"
                app:strokeColor="@color/colorBorder"
                app:strokeWidth="1dp"
                app:layout_constraintEnd_toEndOf="parent"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toBottomOf="@id/cardStatus">

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="vertical"
                    android:padding="16dp">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:fontFamily="sans-serif-medium"
                        android:text="@string/section_audio_controls"
                        android:textColor="@color/colorTextPrimary"
                        android:textSize="13sp" />

                    <LinearLayout
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="10dp"
                        android:gravity="center_vertical"
                        android:orientation="horizontal">

                        <ImageView
                            android:layout_width="20dp"
                            android:layout_height="20dp"
                            android:src="@drawable/ic_speaker"
                            app:tint="@color/colorAccentCyan" />

                        <LinearLayout
                            android:layout_width="0dp"
                            android:layout_height="wrap_content"
                            android:layout_marginStart="12dp"
                            android:layout_weight="1"
                            android:orientation="vertical">

                            <TextView
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="@string/label_auto_speaker"
                                android:textColor="@color/colorTextPrimary"
                                android:textSize="13sp" />

                            <TextView
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="@string/desc_auto_speaker"
                                android:textColor="@color/colorTextSecondary"
                                android:textSize="11sp" />
                        </LinearLayout>

                        <com.google.android.material.materialswitch.MaterialSwitch
                            android:id="@+id/switchAutoSpeaker"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:checked="true" />
                    </LinearLayout>

                    <LinearLayout
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="12dp"
                        android:gravity="center_vertical"
                        android:orientation="horizontal">

                        <ImageView
                            android:layout_width="20dp"
                            android:layout_height="20dp"
                            android:src="@drawable/ic_volume_off"
                            app:tint="@color/colorPrimary" />

                        <LinearLayout
                            android:layout_width="0dp"
                            android:layout_height="wrap_content"
                            android:layout_marginStart="12dp"
                            android:layout_weight="1"
                            android:orientation="vertical">

                            <TextView
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="@string/label_mute_redials"
                                android:textColor="@color/colorTextPrimary"
                                android:textSize="13sp" />

                            <TextView
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="@string/desc_mute_redials"
                                android:textColor="@color/colorTextSecondary"
                                android:textSize="11sp" />
                        </LinearLayout>

                        <com.google.android.material.materialswitch.MaterialSwitch
                            android:id="@+id/switchMuteRedials"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:checked="true" />
                    </LinearLayout>
                </LinearLayout>
            </com.google.android.material.card.MaterialCardView>

            <com.google.android.material.card.MaterialCardView
                android:id="@+id/cardSpeedController"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_marginTop="14dp"
                app:cardBackgroundColor="@color/colorSurfaceCard"
                app:cardCornerRadius="20dp"
                app:strokeColor="@color/colorBorder"
                app:strokeWidth="1dp"
                app:layout_constraintEnd_toEndOf="parent"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toBottomOf="@id/cardAudioControls">

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="vertical"
                    android:padding="16dp">

                    <LinearLayout
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:gravity="center_vertical"
                        android:orientation="horizontal">

                        <TextView
                            android:layout_width="0dp"
                            android:layout_height="wrap_content"
                            android:layout_weight="1"
                            android:fontFamily="sans-serif-medium"
                            android:text="@string/label_redial_delay"
                            android:textColor="@color/colorTextPrimary"
                            android:textSize="13sp" />

                        <TextView
                            android:id="@+id/tvDelayValue"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:fontFamily="monospace"
                            android:text="50 ms (VAD Fast)"
                            android:textColor="@color/colorPrimary"
                            android:textSize="13sp" />
                    </LinearLayout>

                    <com.google.android.material.slider.Slider
                        android:id="@+id/sliderRedialDelay"
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="4dp"
                        android:valueFrom="0"
                        android:valueTo="2000"
                        android:stepSize="25"
                        android:value="50"
                        app:trackColorActive="@color/colorPrimary" />

                    <LinearLayout
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:gravity="center"
                        android:orientation="horizontal">

                        <com.google.android.material.button.MaterialButton
                            android:id="@+id/btnDelay0ms"
                            style="@style/Widget.Material3.Button.TextButton"
                            android:layout_width="0dp"
                            android:layout_height="36dp"
                            android:layout_weight="1"
                            android:text="0ms"
                            android:textSize="11sp" />

                        <com.google.android.material.button.MaterialButton
                            android:id="@+id/btnDelay50ms"
                            style="@style/Widget.Material3.Button.TextButton"
                            android:layout_width="0dp"
                            android:layout_height="36dp"
                            android:layout_weight="1"
                            android:text="50ms"
                            android:textSize="11sp" />

                        <com.google.android.material.button.MaterialButton
                            android:id="@+id/btnDelay250ms"
                            style="@style/Widget.Material3.Button.TextButton"
                            android:layout_width="0dp"
                            android:layout_height="36dp"
                            android:layout_weight="1"
                            android:text="250ms"
                            android:textSize="11sp" />

                        <com.google.android.material.button.MaterialButton
                            android:id="@+id/btnDelay1000ms"
                            style="@style/Widget.Material3.Button.TextButton"
                            android:layout_width="0dp"
                            android:layout_height="36dp"
                            android:layout_weight="1"
                            android:text="1.0s"
                            android:textSize="11sp" />
                    </LinearLayout>
                </LinearLayout>
            </com.google.android.material.card.MaterialCardView>

            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnStartRedial"
                style="@style/Widget.Material3.Button"
                android:layout_width="0dp"
                android:layout_height="64dp"
                android:layout_marginTop="20dp"
                android:fontFamily="sans-serif-black"
                android:letterSpacing="0.04"
                android:text="@string/btn_start_auto_redial"
                android:textSize="17sp"
                app:cornerRadius="20dp"
                app:icon="@drawable/ic_play_arrow"
                app:iconGravity="textStart"
                app:iconSize="24dp"
                app:layout_constraintEnd_toEndOf="parent"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toBottomOf="@id/cardSpeedController" />

        </androidx.constraintlayout.widget.ConstraintLayout>
    </androidx.core.widget.NestedScrollView>

    <com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton
        android:id="@+id/fabStopRedial"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="bottom|center_horizontal"
        android:layout_marginBottom="24dp"
        android:backgroundTint="@color/colorDestructive"
        android:fontFamily="sans-serif-black"
        android:text="@string/btn_stop_redial"
        android:textColor="@android:color/white"
        android:visibility="gone"
        app:elevation="8dp"
        app:icon="@drawable/ic_stop"
        app:iconTint="@android:color/white" />

</androidx.coordinatorlayout.widget.CoordinatorLayout>
""")

write_file("app/src/main/res/layout/bottom_sheet_dialpad.xml", """<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:background="@drawable/bg_bottom_sheet"
    android:orientation="vertical"
    android:padding="20dp">

    <View
        android:layout_width="40dp"
        android:layout_height="4dp"
        android:layout_gravity="center_horizontal"
        android:layout_marginBottom="16dp"
        android:background="@drawable/bg_drag_handle" />

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:gravity="center_vertical"
        android:orientation="horizontal"
        android:paddingHorizontal="12dp"
        android:paddingBottom="16dp">

        <TextView
            android:id="@+id/tvDialpadDisplay"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:fontFamily="sans-serif-bold"
            android:gravity="center"
            android:hint="Tap digits to dial"
            android:letterSpacing="0.08"
            android:textColor="@color/colorTextPrimary"
            android:textColorHint="@color/colorTextTertiary"
            android:textSize="26sp" />

        <ImageView
            android:id="@+id/btnDialpadBackspace"
            android:layout_width="44dp"
            android:layout_height="44dp"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:padding="10dp"
            android:src="@drawable/ic_backspace"
            app:tint="@color/colorTextSecondary" />
    </LinearLayout>

    <TableLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:stretchColumns="*">

        <TableRow android:layout_marginBottom="12dp">
            <include layout="@layout/item_dialpad_key" android:id="@+id/key1" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key2" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key3" />
        </TableRow>

        <TableRow android:layout_marginBottom="12dp">
            <include layout="@layout/item_dialpad_key" android:id="@+id/key4" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key5" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key6" />
        </TableRow>

        <TableRow android:layout_marginBottom="12dp">
            <include layout="@layout/item_dialpad_key" android:id="@+id/key7" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key8" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key9" />
        </TableRow>

        <TableRow android:layout_marginBottom="16dp">
            <include layout="@layout/item_dialpad_key" android:id="@+id/keyStar" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key0" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/keyHash" />
        </TableRow>
    </TableLayout>

    <com.google.android.material.button.MaterialButton
        android:id="@+id/btnDialpadApply"
        style="@style/Widget.Material3.Button"
        android:layout_width="match_parent"
        android:layout_height="56dp"
        android:fontFamily="sans-serif-black"
        android:text="APPLY TO REDIAL LOOP"
        app:cornerRadius="18dp"
        app:icon="@drawable/ic_call" />

</LinearLayout>
""")

write_file("app/src/main/res/layout/item_dialpad_key.xml", """<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="72dp"
    android:layout_height="72dp"
    android:layout_gravity="center"
    android:background="@drawable/bg_dialpad_key"
    android:clickable="true"
    android:focusable="true"
    android:gravity="center"
    android:orientation="vertical">

    <TextView
        android:id="@+id/tvKeyNumber"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:fontFamily="sans-serif-bold"
        android:text="1"
        android:textColor="@color/colorTextPrimary"
        android:textSize="26sp" />

    <TextView
        android:id="@+id/tvKeyLetters"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:fontFamily="sans-serif"
        android:letterSpacing="0.1"
        android:text="ABC"
        android:textColor="@color/colorTextTertiary"
        android:textSize="10sp" />
</LinearLayout>
""")

write_file("app/src/main/res/layout/dialog_add_hotline.xml", """<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="20dp">

    <com.google.android.material.textfield.TextInputLayout
        style="@style/Widget.Material3.TextInputLayout.OutlinedBox"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Contact / Doctor Name">

        <com.google.android.material.textfield.TextInputEditText
            android:id="@+id/etHotlineName"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:inputType="textPersonName" />
    </com.google.android.material.textfield.TextInputLayout>

    <com.google.android.material.textfield.TextInputLayout
        style="@style/Widget.Material3.TextInputLayout.OutlinedBox"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="12dp"
        android:hint="Phone Number">

        <com.google.android.material.textfield.TextInputEditText
            android:id="@+id/etHotlineNumber"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:inputType="phone" />
    </com.google.android.material.textfield.TextInputLayout>

</LinearLayout>
""")

# 11. XML Values (strings, colors, themes)
write_file("app/src/main/res/values/strings.xml", """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">AutoRedial Pro</string>
    <string name="hint_phone_number">Enter or pick phone number</string>
    <string name="title_saved_hotlines">SAVED HOTLINES / DOCTORS</string>
    <string name="state_idle">IDLE</string>
    <string name="detail_ready_to_call">Ready to begin millisecond VAD auto-redial</string>
    <string name="label_vad_level">AUDIO ENERGY</string>
    <string name="stat_attempts">ATTEMPTS</string>
    <string name="stat_cut_speed">CUT SPEED</string>
    <string name="stat_ring_filter">RING CADENCE</string>
    <string name="section_audio_controls">AUDIO &amp; SPEAKER CONTROLS</string>
    <string name="label_auto_speaker">Auto Speaker on Ringing</string>
    <string name="desc_auto_speaker">Hands-free speakerphone on ring/pickup</string>
    <string name="label_mute_redials">Mute Rapid Redial Tones</string>
    <string name="desc_mute_redials">Silences ear-piercing robot clicks during loops</string>
    <string name="label_redial_delay">Loop Delay Between Redials (0 - 2000 ms)</string>
    <string name="btn_start_auto_redial">START AUTO-REDIAL</string>
    <string name="btn_stop_redial">STOP REDIAL</string>
</resources>
""")

write_file("app/src/main/res/values/colors.xml", """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#2563EB</color>
    <color name="colorPrimaryVariant">#1D4ED8</color>
    <color name="colorAccentCyan">#06B6D4</color>
    <color name="colorBackground">#0B0F19</color>
    <color name="colorSurfaceCard">#111827</color>
    <color name="colorBorder">#1F2937</color>
    <color name="colorTrack">#1F2937</color>
    <color name="colorTextPrimary">#F9FAFB</color>
    <color name="colorTextSecondary">#9CA3AF</color>
    <color name="colorTextTertiary">#6B7280</color>
    <color name="colorSuccess">#10B981</color>
    <color name="colorWarning">#F59E0B</color>
    <color name="colorDestructive">#EF4444</color>
</resources>
""")

write_file("app/src/main/res/values/themes.xml", """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.AutoRedialPro" parent="Theme.Material3.Dark.NoActionBar">
        <item name="colorPrimary">@color/colorPrimary</color>
        <item name="android:statusBarColor">@color/colorBackground</item>
        <item name="android:navigationBarColor">@color/colorBackground</item>
    </style>

    <style name="TextAppearance.AutoRedial.Toolbar" parent="TextAppearance.Material3.TitleMedium">
        <item name="android:textColor">@color/colorTextPrimary</item>
        <item name="android:textStyle">bold</item>
    </style>

    <style name="Theme_AutoRedial_BottomSheet" parent="Theme.Material3.Dark.BottomSheetDialog">
        <item name="bottomSheetStyle">@style/CustomBottomSheetStyle</item>
    </style>

    <style name="CustomBottomSheetStyle" parent="Widget.Material3.BottomSheet">
        <item name="android:background">@android:color/transparent</item>
    </style>

    <style name="Theme_AutoRedial_Dialog" parent="Theme.Material3.Dark.Dialog.Alert">
        <item name="colorPrimary">@color/colorPrimary</color>
    </style>
</resources>
""")

write_file("app/src/main/res/xml/accessibility_service_config.xml", """<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows"
    android:canRetrieveWindowContent="true"
    android:description="@string/app_name"
    android:notificationTimeout="20" />
""")

# 12. Vector Drawables
def vector(name, path_d, color="#FF2563EB"):
    write_file(f"app/src/main/res/drawable/{name}.xml", f"""<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="{color}"
      android:pathData="{path_d}"/>
</vector>""")

vector("ic_call", "M20.01,15.38c-1.23,0 -2.42,-0.2 -3.53,-0.56 -0.35,-0.12 -0.74,-0.03 -1.02,0.24l-2.2,2.2c-2.83,-1.44 -5.15,-3.75 -6.59,-6.59l2.2,-2.21c0.28,-0.26 0.36,-0.65 0.25,-1C8.7,6.35 8.5,5.16 8.5,3.93 8.5,3.42 8.08,3 7.57,3H4.06C3.55,3 3,3.44 3,4.06c0,9.39 7.61,17 17,17 0.62,0 1,-0.55 1,-1.06v-3.56c0,-0.51 -0.42,-0.93 -0.99,-0.93z", "#FF2563EB")
vector("ic_stop", "M6,6h12v12H6z", "#FFFFFFFF")
vector("ic_dialpad", "M12,19c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM6,1c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM6,7c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM6,13c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM18,5c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,7c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM12,13c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM18,9c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM18,15c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM12,1c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2z", "#FF06B6D4")
vector("ic_contacts", "M20,0H4v2h16V0zM4,24h16v-2H4V24zM20,4H4c-1.1,0 -2,0.9 -2,2v12c0,1.1 0.9,2 2,2h16c1.1,0 2,-0.9 2,-2V6c0,-1.1 -0.9,-2 -2,-2zM12,6c1.93,0 3.5,1.57 3.5,3.5S13.93,13 12,13s-3.5,-1.57 -3.5,-3.5S10.07,6 12,6zM18,18H6v-0.53c0,-1.79 3.58,-2.77 6,-2.77s6,0.98 6,2.77V18z", "#FF2563EB")
vector("ic_speaker", "M3,9v6h4l5,5V4L7,9H3zm13.5,3c0,-1.77 -1.02,-3.29 -2.5,-4.03v8.05c1.48,-0.73 2.5,-2.25 2.5,-4.02zM14,3.23v2.06c2.89,0.86 5,3.54 5,6.71s-2.11,5.85 -5,6.71v2.06c4.01,-0.91 7,-4.49 7,-8.77s-2.99,-7.86 -7,-8.77z", "#FF06B6D4")
vector("ic_volume_off", "M16.5,12c0,-1.77 -1.02,-3.29 -2.5,-4.03v2.21l2.45,2.45c0.03,-0.2 0.05,-0.41 0.05,-0.63zm2.5,0c0,0.94 -0.2,1.82 -0.54,2.64l1.51,1.51C20.63,14.91 21,13.5 21,12c0,-4.28 -2.99,-7.86 -7,-8.77v2.06c2.89,0.86 5,3.54 5,6.71zM4.27,3L3,4.27 7.73,9H3v6h4l5,5v-6.73l4.25,4.25c-0.67,0.52 -1.42,0.93 -2.25,1.18v2.06c1.38,-0.31 2.63,-0.95 3.69,-1.81L19.73,21 21,19.73l-9,-9L4.27,3zM12,4L9.91,6.09 12,8.18V4z", "#FF2563EB")
vector("ic_play_arrow", "M8,5v14l11,-7z", "#FFFFFFFF")
vector("ic_call_idle", "M20.01,15.38c-1.23,0 -2.42,-0.2 -3.53,-0.56 -0.35,-0.12 -0.74,-0.03 -1.02,0.24l-2.2,2.2c-2.83,-1.44 -5.15,-3.75 -6.59,-6.59l2.2,-2.21c0.28,-0.26 0.36,-0.65 0.25,-1C8.7,6.35 8.5,5.16 8.5,3.93 8.5,3.42 8.08,3 7.57,3H4.06C3.55,3 3,3.44 3,4.06c0,9.39 7.61,17 17,17 0.62,0 1,-0.55 1,-1.06v-3.56c0,-0.51 -0.42,-0.93 -0.99,-0.93z", "#FF2563EB")
vector("ic_call_outgoing", "M20.01,15.38c-1.23,0 -2.42,-0.2 -3.53,-0.56 -0.35,-0.12 -0.74,-0.03 -1.02,0.24l-2.2,2.2c-2.83,-1.44 -5.15,-3.75 -6.59,-6.59l2.2,-2.21c0.28,-0.26 0.36,-0.65 0.25,-1C8.7,6.35 8.5,5.16 8.5,3.93 8.5,3.42 8.08,3 7.57,3H4.06C3.55,3 3,3.44 3,4.06c0,9.39 7.61,17 17,17 0.62,0 1,-0.55 1,-1.06v-3.56c0,-0.51 -0.42,-0.93 -0.99,-0.93z", "#FF6366F1")
vector("ic_mic_waveform", "M12,14c1.66,0 3,-1.34 3,-3V5c0,-1.66 -1.34,-3 -3,-3S9,3.34 9,5v6c0,1.66 1.34,3 3,3zm5.91,-3c-0.49,0 -0.9,0.36 -0.98,0.85C16.52,14.2 14.47,16 12,16s-4.52,-1.8 -4.93,-4.15c-0.08,-0.49 -0.49,-0.85 -0.98,-0.85 -0.61,0 -1.09,0.54 -1,1.14 0.49,3 2.89,5.35 5.91,5.78V20c0,0.55 0.45,1 1,1s1,-0.45 1,-1v-2.08c3.02,-0.43 5.42,-2.78 5.91,-5.78 0.1,-0.6 -0.39,-1.14 -1,-1.14z", "#FF38BDF8")
vector("ic_ring_volume", "M23.71,16.67C20.66,13.78 16.54,12 12,12P0.29,16.67c-0.18,0.18 -0.29,0.43 -0.29,0.71 0,0.28 0.11,0.53 0.29,0.71l2.48,2.48c0.18,0.18 0.43,0.29 0.71,0.29 0.27,0 0.52,-0.11 0.7,-0.28 1.77,-1.42 3.86,-2.4 6.12,-2.79V20c0,0.55 0.45,1 1,1h2c0.55,0 1,-0.45 1,-1v-3.2c2.26,0.39 4.35,1.37 6.12,2.79 0.18,0.17 0.43,0.28 0.7,0.28 0.28,0 0.53,-0.11 0.71,-0.29l2.48,-2.48c0.18,-0.18 0.29,-0.43 0.29,-0.71 0,-0.28 -0.11,-0.53 -0.29,-0.71z", "#FF10B981")
vector("ic_call_end_fast", "M12,9c-1.6,0 -3.15,0.25 -4.6,0.72v3.1c0,0.39 -0.23,0.74 -0.56,0.9 -0.98,0.49 -1.87,1.12 -2.66,1.85 -0.18,0.18 -0.43,0.28 -0.7,0.28 -0.28,0 -0.53,-0.11 -0.71,-0.29L0.29,13.08c-0.18,-0.17 -0.29,-0.42 -0.29,-0.7 0,-0.28 0.11,-0.53 0.29,-0.71C3.34,8.78 7.46,7 12,7s8.66,1.78 11.71,4.67c0.18,0.18 0.29,0.43 0.29,0.71 0,0.28 -0.11,0.53 -0.29,0.71l-2.48,2.48c-0.18,0.18 -0.43,0.29 -0.71,0.29 -0.27,0 -0.52,-0.11 -0.7,-0.28 -0.79,-0.74 -1.69,-1.36 -2.67,-1.85 -0.33,-0.16 -0.56,-0.5 -0.56,-0.9v-3.1C15.15,9.25 13.6,9 12,9z", "#FFF59E0B")
vector("ic_call_connected", "M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2zm-2,15l-5,-5 1.41,-1.41L10,14.17l7.59,-7.59L19,8l-9,9z", "#FF06B6D4")
vector("ic_contact_phone", "M22,3H2C0.9,3 0,3.9 0,5v14c0,1.1 0.9,2 2,2h20c1.1,0 1.99,-0.9 1.99,-2L24,5c0,-1.1 -0.9,-2 -2,-2zM8,6c1.66,0 3,1.34 3,3s-1.34,3 -3,3 -3,-1.34 -3,-3 1.34,-3 3,-3zm6,12H2v-1c0,-2 4,-3.1 6,-3.1s6,1.1 6,3.1v1zm3.85,-4l1.65,-1.65c0.2,-0.2 0.2,-0.51 0,-0.71l-1.44,-1.44c-0.2,-0.2 -0.51,-0.2 -0.71,0l-1.07,1.07c-1.33,-0.72 -2.42,-1.81 -3.14,-3.14l1.07,-1.07c0.2,-0.2 0.2,-0.51 0,-0.71L12.81,4.91c-0.2,-0.2 -0.51,-0.2 -0.71,0L10.45,6.56c-0.39,0.39 -0.53,0.96 -0.35,1.48 1.07,3.12 3.54,5.59 6.66,6.66 0.52,0.18 1.09,0.04 1.48,-0.35z", "#FF2563EB")
vector("ic_hospital", "M19,3H5C3.9,3 3,3.9 3,5v14c0,1.1 0.9,2 2,2h14c1.1,0 2,-0.9 2,-2V5C21,3.9 20.1,3 19,3zM18,14h-4v4h-4v-4H6v-4h4V6h4v4h4V14z", "#FF10B981")
vector("ic_ambulance", "M18.92,6.01C18.72,5.42 18.16,5 17.5,5h-11c-0.66,0 -1.22,0.42 -1.42,1.01L3,12v8c0,0.55 0.45,1 1,1h1c0.55,0 1,-0.45 1,-1v-1h12v1c0,0.55 0.45,1 1,1h1c0.55,0 1,-0.45 1,-1v-8l-2.08,-5.99zM6.5,16c-0.83,0 -1.5,-0.67 -1.5,-1.5S5.67,13 6.5,13s1.5,0.67 1.5,1.5S7.33,16 6.5,16zm11,0c-0.83,0 -1.5,-0.67 -1.5,-1.5s0.67,-1.5 1.5,-1.5 1.5,0.67 1.5,1.5 -0.67,1.5 -1.5,1.5zM5,11l1.5,-4.5h11L19,11H5z", "#FFEF4444")
vector("ic_backspace", "M22,3H7c-0.69,0 -1.23,0.35 -1.59,0.88L0,12l5.41,8.11c0.36,0.53 0.9,0.89 1.59,0.89h15c1.1,0 2,-0.9 2,-2V5c0,-1.1 -0.9,-2 -2,-2zm-3,12.59L17.59,17 14,13.41 10.41,17 9,15.59 12.59,12 9,8.41 10.41,7 14,10.59 17.59,7 19,8.41 15.41,12 19,15.59z", "#FF9CA3AF")

write_file("app/src/main/res/drawable/bg_pulse_halo.xml", """<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <solid android:color="#262563EB" />
    <stroke android:width="2dp" android:color="#4D2563EB" />
</shape>""")

write_file("app/src/main/res/drawable/bg_icon_circle.xml", """<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <solid android:color="#1F111827" />
    <stroke android:width="1dp" android:color="#332563EB" />
</shape>""")

write_file("app/src/main/res/drawable/bg_bottom_sheet.xml", """<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#FF0F172A" />
    <corners
        android:topLeftRadius="28dp"
        android:topRightRadius="28dp" />
</shape>""")

write_file("app/src/main/res/drawable/bg_drag_handle.xml", """<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#FF475569" />
    <corners android:radius="2dp" />
</shape>""")

write_file("app/src/main/res/drawable/bg_dialpad_key.xml", """<?xml version="1.0" encoding="utf-8"?>
<ripple xmlns:android="http://schemas.android.com/apk/res/android"
    android:color="#332563EB">
    <item>
        <shape android:shape="rectangle">
            <solid android:color="#1A1E293B" />
            <corners android:radius="20dp" />
            <stroke android:width="1dp" android:color="#33334155" />
        </shape>
    </item>
</ripple>""")

# 13. Launcher Icons
icon_xml = """<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
  <path
      android:fillColor="#FF2563EB"
      android:pathData="M0,0h108v108h-108z"/>
  <path
      android:fillColor="#FFFFFFFF"
      android:pathData="M64,54c0,-5.52 -4.48,-10 -10,-10s-10,4.48 -10,10 4.48,10 10,10 10,-4.48 10,-10zM54,34c-11.05,0 -20,8.95 -20,20s8.95,20 20,20 20,-8.95 20,-20 -8.95,-20 -20,-20z"/>
</vector>"""
write_file("app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml", icon_xml)
write_file("app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml", icon_xml)
write_file("app/src/main/res/drawable/ic_launcher_background.xml", """<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
  <path android:fillColor="#FF0B0F19" android:pathData="M0,0h108v108h-108z"/>
</vector>""")

# 14. GitHub Actions Workflow (Build APK and publish directly to GitHub Releases)
write_file(".github/workflows/build-and-release-apk.yml", """name: Build & Release AutoRedial Pro APK

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    name: Build & Release APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Make gradlew executable
        run: chmod +x gradlew

      - name: Build Debug APK
        run: ./gradlew assembleDebug --stacktrace

      - name: Prepare APK Output
        run: |
          mkdir -p release-output
          cp app/build/outputs/apk/debug/app-debug.apk release-output/AutoRedialPro-v1.0.0.apk
          echo "APK successfully built at release-output/AutoRedialPro-v1.0.0.apk"

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: AutoRedialPro-v1.0.0.apk
          path: release-output/AutoRedialPro-v1.0.0.apk
          retention-days: 30

      - name: Publish Release & Upload APK
        uses: softprops/action-gh-release@v2
        if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
        with:
          tag_name: v1.0.0
          name: "AutoRedial Pro v1.0.0 (Official APK)"
          body: |
            ## 📱 AutoRedial Pro v1.0.0 - Android APK

            Download the official **AutoRedial Pro** application below!

            ### 🚀 Features Included:
            - **Millisecond VAD Audio Engine**: Instantly disconnects robot IVR prompts or busy tones in under 35ms.
            - **Ringing Cadence Discrimination**: 440Hz/480Hz dual-frequency filter ensures standard ringing calls stay connected.
            - **Smart Stop Condition**: Automatically stops the redial loop as soon as the recipient picks up.
            - **In-App Dialpad with DTMF Sounds**: Dial directly inside the app with realistic telephone tones.
            - **Auto-Speakerphone**: Automatically switches to hands-free speaker on ring/pickup.
            - **Redial Stream Muting**: Silences loud clicking/beeping sounds during high-speed redial loops.
            - **0–2000ms Delay Controller**: Fine-tune delay between attempts.

            ### 📲 Installation:
            1. Download **`AutoRedialPro-v1.0.0.apk`** below.
            2. Open on your Android device and tap **Install**.
          files: release-output/AutoRedialPro-v1.0.0.apk
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
""")

# 15. README.md
write_file("README.md", """# AutoRedial Pro - Android Telecom & Millisecond VAD Engine

Production-ready native Android Kotlin application designed for high-frequency auto-redialing with ultra-fast millisecond Voice Activity Detection (VAD) and Telecom framework integration.

## 🚀 Key Features
1. **Millisecond Cut-Off (<35ms)**: Disconnects within milliseconds upon hearing IVR robot messages or busy tones.
2. **Ringing Tone Lock**: Goertzel algorithm isolates 440Hz/480Hz dual tone cadence, preventing accidental disconnection during normal ring cycles.
3. **Smart Stop Condition**: Automatically halts the loop when the human recipient answers (Call.STATE_ACTIVE).
4. **In-App Dialpad with DTMF**: Full dialpad with audio feedback.
5. **Auto-Speakerphone on Ringing**: Automatically routes audio to hands-free speaker.
6. **Mute Rapid Redials**: Eliminates annoying robot clicks during dialing.
7. **Fine-Tuned Delay (0 - 2000 ms)**: Customizable intervals between dials.
8. **Android 14+ Ready**: Fully configured foreground service with `phoneCall` and `microphone` types.

## 🛠️ How to Build
### Method 1: GitHub Actions (Automated Cloud Build)
This repository includes `.github/workflows/build-and-release-apk.yml`. Every commit automatically compiles and releases `AutoRedialPro-v1.0.0.apk` in GitHub Releases!

### Method 2: Android Studio
1. Open this repository in Android Studio Ladybug or newer.
2. Let Gradle sync and select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
""")

print("Successfully generated complete Android repository structure at:", REPO_DIR)
