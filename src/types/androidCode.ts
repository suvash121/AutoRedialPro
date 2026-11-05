export interface AndroidFile {
  path: string;
  filename: string;
  language: 'xml' | 'kotlin' | 'gradle' | 'markdown';
  category: 'manifest' | 'layout' | 'kotlin' | 'config' | 'docs';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'Updated AndroidManifest with Contact Picker, Call Log, Audio Manager speaker control, and Foreground Services.',
    content: `<?xml version="1.0" encoding="utf-8"?>
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

    <!-- Telephony Hardware Feature Check -->
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
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AutoRedialPro"
        tools:targetApi="34">

        <!-- Main Dashboard Activity -->
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

        <!-- Audio Monitoring, VAD, Speaker Switching & Redial Service -->
        <service
            android:name=".service.CallAudioMonitoringService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="phoneCall|microphone" />

        <!-- Android InCallService: Enables Programmatic Instant Disconnect (<5ms) -->
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

        <!-- Accessibility Service: Fallback for Instant Hangup on Non-Default Dialers -->
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

</manifest>`
  },
  {
    path: 'app/src/main/res/layout/activity_main.xml',
    filename: 'activity_main.xml',
    language: 'xml',
    category: 'layout',
    description: 'Updated single-screen dashboard with in-app Dialpad trigger, Contact Picker button, Saved Doctor Hotlines, Auto Speaker switch, Mute Rapid Redials switch, and 0-2000ms delay slider.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/colorBackground"
    tools:context=".MainActivity">

    <!-- Top App Bar -->
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

    <!-- Main Scrollable Content -->
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

            <!-- Target Phone Input Field with Dialpad & Contact Buttons -->
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

                <!-- In-App Dialpad Trigger Button -->
                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnOpenDialpad"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="54dp"
                    android:layout_height="56dp"
                    android:layout_marginStart="8dp"
                    android:insetLeft="0dp"
                    android:insetTop="0dp"
                    android:insetRight="0dp"
                    android:insetBottom="0dp"
                    android:padding="0dp"
                    app:cornerRadius="16dp"
                    app:icon="@drawable/ic_dialpad"
                    app:iconGravity="textStart"
                    app:iconPadding="0dp"
                    app:iconSize="22dp"
                    app:iconTint="@color/colorAccentCyan" />

                <!-- Contact Picker Button -->
                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnPickContact"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="54dp"
                    android:layout_height="56dp"
                    android:layout_marginStart="8dp"
                    android:insetLeft="0dp"
                    android:insetTop="0dp"
                    android:insetRight="0dp"
                    android:insetBottom="0dp"
                    android:padding="0dp"
                    app:cornerRadius="16dp"
                    app:icon="@drawable/ic_contacts"
                    app:iconGravity="textStart"
                    app:iconPadding="0dp"
                    app:iconSize="22dp"
                    app:iconTint="@color/colorPrimary" />
            </LinearLayout>

            <!-- Saved Hotlines & Doctor Appointments Section -->
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

                <!-- Horizontal Scroll for Quick Hotline Chips -->
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
                            app:chipIcon="@drawable/ic_hospital"
                            app:chipIconTint="@color/colorSuccess"
                            android:text="Dr. Clinic (+1 555-0192)" />

                        <com.google.android.material.chip.Chip
                            android:id="@+id/chipEmergency"
                            style="@style/Widget.Material3.Chip.Assist"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:layout_marginEnd="8dp"
                            app:chipIcon="@drawable/ic_ambulance"
                            app:chipIconTint="@color/colorDestructive"
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

            <!-- Live Status Card (Idle, Dialing, VAD Audio, Ringing, Connected) -->
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

                    <!-- Live Audio Energy VAD Progress -->
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

                    <!-- Real-Time Metrics -->
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
                                android:text="FILTER ON"
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

            <!-- Audio & Speaker Control Enhancements Card -->
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

                    <!-- Auto Speaker on Ringing / Connected Switch -->
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

                    <!-- Mute Rapid Redials Switch -->
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

            <!-- Speed & Delay Controller (0 ms to 2000 ms) -->
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

                    <div
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content">
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
                    </div>

                    <!-- 0 to 2000 ms Fine-Tuned Slider -->
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

                    <!-- Quick Preset Delay Buttons -->
                    <LinearLayout
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="2dp"
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

            <!-- Prominent Primary Action Button: Start Auto-Redial -->
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

    <!-- Floating Emergency Stop Redial Button -->
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

</androidx.coordinatorlayout.widget.CoordinatorLayout>`
  },
  {
    path: 'app/src/main/res/layout/bottom_sheet_dialpad.xml',
    filename: 'bottom_sheet_dialpad.xml',
    language: 'xml',
    category: 'layout',
    description: 'Modern glassmorphism bottom-sheet dialpad layout with DTMF keys (0-9, *, #), letters (ABC, DEF), backspace, and quick call button.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:background="@drawable/bg_bottom_sheet"
    android:orientation="vertical"
    android:padding="20dp">

    <!-- Bottom sheet drag handle -->
    <View
        android:layout_width="40dp"
        android:layout_height="4dp"
        android:layout_gravity="center_horizontal"
        android:layout_marginBottom="16dp"
        android:background="@drawable/bg_drag_handle" />

    <!-- Current Dialed Number Display with Backspace -->
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

    <!-- 3x4 Dialpad Grid -->
    <TableLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:stretchColumns="*">

        <!-- Row 1: 1, 2 (ABC), 3 (DEF) -->
        <TableRow android:layout_marginBottom="12dp">
            <include layout="@layout/item_dialpad_key" android:id="@+id/key1" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key2" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key3" />
        </TableRow>

        <!-- Row 2: 4 (GHI), 5 (JKL), 6 (MNO) -->
        <TableRow android:layout_marginBottom="12dp">
            <include layout="@layout/item_dialpad_key" android:id="@+id/key4" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key5" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key6" />
        </TableRow>

        <!-- Row 3: 7 (PQRS), 8 (TUV), 9 (WXYZ) -->
        <TableRow android:layout_marginBottom="12dp">
            <include layout="@layout/item_dialpad_key" android:id="@+id/key7" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key8" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key9" />
        </TableRow>

        <!-- Row 4: *, 0 (+), # -->
        <TableRow android:layout_marginBottom="16dp">
            <include layout="@layout/item_dialpad_key" android:id="@+id/keyStar" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/key0" />
            <include layout="@layout/item_dialpad_key" android:id="@+id/keyHash" />
        </TableRow>
    </TableLayout>

    <!-- Dial Action Row -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:gravity="center"
        android:orientation="horizontal"
        android:paddingTop="8dp">

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

</LinearLayout>`
  },
  {
    path: 'app/src/main/java/com/autoredial/pro/MainActivity.kt',
    filename: 'MainActivity.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Updated MainActivity with In-App Dialpad BottomSheet, Contact Picker launcher, Saved Hotlines manager, Auto Speaker toggle, Redial Mute toggle, and 0-2000ms fine-tuned delay controller.',
    content: `package com.autoredial.pro

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

    // Broadcast receiver to communicate with background Audio VAD service in real-time
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

    // Modern Android Contact Picker Result Launcher
    private val contactPickerLauncher = registerForActivityResult(
        ActivityResultContracts.PickContact()
    ) { contactUri: Uri? ->
        contactUri?.let { uri ->
            retrievePhoneNumberFromContact(uri)
        }
    }

    // Modern Android 14+ Permission Request Launcher
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

    // Role Manager Launcher for Telecom InCallService
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
        // Start & Stop buttons
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

        // In-App Dialpad Trigger
        binding.btnOpenDialpad.setOnClickListener {
            showDialpadBottomSheet()
        }

        // Contact Picker Trigger
        binding.btnPickContact.setOnClickListener {
            contactPickerLauncher.launch(null)
        }

        // Add Custom Doctor / Hotline
        binding.tvAddHotline.setOnClickListener {
            showAddHotlineDialog()
        }

        // Saved Hotlines Chips
        binding.chipDoctorClinic.setOnClickListener {
            binding.etPhoneNumber.setText("+1 (555) 019-2834")
        }
        binding.chipEmergency.setOnClickListener {
            binding.etPhoneNumber.setText("+880 1711 000000")
        }
        binding.chipSupport.setOnClickListener {
            binding.etPhoneNumber.setText("333")
        }

        // 0 to 2000 ms Fine-Tuned Slider
        binding.sliderRedialDelay.addOnChangeListener { _, value, _ ->
            val ms = value.toInt()
            binding.tvDelayValue.text = if (ms == 0) "0 ms (Instant Cut)" else "$ms ms"
            prefs.edit().putInt("redial_delay_ms", ms).apply()
        }

        // Quick Preset Delay Buttons
        binding.btnDelay0ms.setOnClickListener { binding.sliderRedialDelay.value = 0f }
        binding.btnDelay50ms.setOnClickListener { binding.sliderRedialDelay.value = 50f }
        binding.btnDelay250ms.setOnClickListener { binding.sliderRedialDelay.value = 250f }
        binding.btnDelay1000ms.setOnClickListener { binding.sliderRedialDelay.value = 1000f }

        // Audio & Speaker Switch Listeners
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

    /**
     * Extracts phone number from selected Contact Uri
     */
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
                            "\${ContactsContract.CommonDataKinds.Phone.CONTACT_ID} = ?",
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

    /**
     * Shows the modern in-app bottom-sheet dialpad with tactile sound and DTMF
     */
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

        // Map key layouts to DTMF tones
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

        // Long press on 0 for '+'
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

    /**
     * Dialog to quickly save a Doctor or Emergency Hotline chip
     */
    private fun showAddHotlineDialog() {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_add_hotline, null)
        val etName = dialogView.findViewById<EditText>(R.id.etHotlineName)
        val etNumber = dialogView.findViewById<EditText>(R.id.etHotlineNumber)

        // Pre-fill with current input if available
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
        binding.tvVadThresholdValue.text = "\${(progressInt * 0.6).toInt()} dB"

        when (state) {
            "DIALING...", "DETECTING AUDIO..." -> {
                binding.viewPulseHalo.visibility = View.VISIBLE
            }
            "RINGING..." -> {
                binding.viewPulseHalo.visibility = View.VISIBLE
                if (binding.switchAutoSpeaker.isChecked) {
                    binding.tvStateDetail.text = "Ringing (Speaker On - Handsfree Active)"
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
}`
  },
  {
    path: 'app/src/main/java/com/autoredial/pro/service/CallAudioMonitoringService.kt',
    filename: 'CallAudioMonitoringService.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Updated background service with Auto Speakerphone control (Android 12+ AudioDeviceInfo), Redial Stream Muting, and millisecond VAD.',
    content: `package com.autoredial.pro.service

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
    private var originalRingerMode: Int = AudioManager.RINGER_MODE_NORMAL
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

        // Store original audio configuration
        originalRingerMode = audioManager?.ringerMode ?: AudioManager.RINGER_MODE_NORMAL

        serviceScope.launch {
            while (isRunning.get()) {
                attemptCount++
                val dialStartTime = System.currentTimeMillis()

                // If Mute Redials is enabled, silence audio streams during rapid dialing attempts
                if (isMuteRedialsEnabled) {
                    silenceDialingAudio(true)
                }

                broadcastState(
                    state = "DIALING...",
                    detail = "Placing attempt #$attemptCount to $targetPhoneNumber",
                    attempts = attemptCount
                )

                // 1. Initiate Outgoing Call
                initiateOutgoingCall(targetPhoneNumber)

                // 2. Fast 120ms audio codec stabilization delay
                delay(120)

                // 3. Audio stream monitoring (<20ms VAD chunks)
                val result = monitorCallAudioUntilCutOrConnected(dialStartTime)

                if (result == CallResult.CONNECTED) {
                    // Restore audio and turn on Speakerphone if enabled!
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
                    detail = "Instant cut executed. Redialing in \${redialDelayMs}ms...",
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
            val voiceThresholdRms = 280.0 // Ultra-high sensitivity for instant millisecond cut

            val maxCallWaitTimeoutMs = 45000L
            val callStartEpoch = System.currentTimeMillis()

            while (isRunning.get() && isAudioSampling) {
                if (System.currentTimeMillis() - callStartEpoch > maxCallWaitTimeoutMs) {
                    disconnectCallInstantly()
                    return@withContext CallResult.DISCONNECTED_TIMEOUT
                }

                // Check if remote recipient answered (Active Call state)
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
                        // Legitimate Ringing Tone detected!
                        // Unmute audio and activate speaker if user enabled Auto Speaker on Ringing
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
                            detail = "Busy / Congestion tone detected. Disconnected in \${cutSpeedMs}ms!",
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
                                    detail = "IVR voice prompt cut in \${cutSpeedMs}ms! Redialing...",
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
                if (mute) {
                    am.adjustStreamVolume(AudioManager.STREAM_VOICE_CALL, AudioManager.ADJUST_MUTE, 0)
                } else {
                    am.adjustStreamVolume(AudioManager.STREAM_VOICE_CALL, AudioManager.ADJUST_UNMUTE, 0)
                }
            }
        } catch (_: Exception) {}
    }

    private fun restoreAudioStreams() {
        silenceDialingAudio(false)
    }

    private fun initiateOutgoingCall(phoneNumber: String) {
        try {
            val callIntent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:\${Uri.encode(phoneNumber)}")
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
}`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    filename: 'strings.xml',
    language: 'xml',
    category: 'layout',
    description: 'Updated strings with Dialpad, Contacts, Saved Hotlines, and Speaker Control strings.',
    content: `<?xml version="1.0" encoding="utf-8"?>
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
</resources>`
  },
  {
    path: 'app/src/main/res/layout/dialog_add_hotline.xml',
    filename: 'dialog_add_hotline.xml',
    language: 'xml',
    category: 'layout',
    description: 'Dialog layout to enter name and phone number for frequently dialed doctors, hotlines, or clinics.',
    content: `<?xml version="1.0" encoding="utf-8"?>
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

</LinearLayout>`
  },
  {
    path: 'app/src/main/res/layout/item_dialpad_key.xml',
    filename: 'item_dialpad_key.xml',
    language: 'xml',
    category: 'layout',
    description: 'Reusable dialpad key component with large number and sub-letter labels (e.g. 2 ABC).',
    content: `<?xml version="1.0" encoding="utf-8"?>
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
        android:textSize="10sp"
        android:visibility="visible" />
</LinearLayout>`
  },
  {
    path: '.github/workflows/build-apk.yml',
    filename: 'build-apk.yml',
    language: 'markdown',
    category: 'config',
    description: 'Automated CI/CD GitHub Actions workflow that executes ./gradlew assembleDebug and automatically outputs downloadable app-debug.apk.',
    content: `name: Build Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    name: Assemble Debug APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Grant Execute Permission to Gradlew
        run: chmod +x gradlew

      - name: Run Build Command
        run: |
          ./gradlew assembleDebug
          cp app/build/outputs/apk/debug/app-debug.apk ./app-debug.apk
          echo "APK_READY"

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: AutoRedialPro-app-debug.apk
          path: ./app-debug.apk
          retention-days: 14`
  }
];
