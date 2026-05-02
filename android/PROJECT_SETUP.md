// 安卓端项目说明
// 项目结构：
// light-cloud-disk/android/
// ├── app/
// │   ├── build.gradle                 // 模块构建配置
// │   ├── src/main/
// │   │   ├── java/com/example/lightclouddisk/
// │   │   │   ├── MainActivity.kt     // 主界面
// │   │   │   ├── FileUploadService.kt // 上传服务
// │   │   │   └── api/
// │   │   │       └── ApiService.kt   // API接口
// │   │   ├── res/
// │   │   │   ├── layout/
// │   │   │   │   └── activity_main.xml
// │   │   │   └── values/
// │   │   │       └── strings.xml
// │   │   └── AndroidManifest.xml
// ├── build.gradle                     // 项目构建配置
// └── settings.gradle                 // 项目设置

// 注意：这是一个简化的项目结构，实际项目中还需要更多配置和文件
// 你可以将此项目导入 Android Studio 进行完整开发

===============================================================================
文件：android/build.gradle (项目级构建文件)
===============================================================================

// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id 'com.android.application' version '8.1.0' apply false
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

===============================================================================
文件：android/settings.gradle
===============================================================================

pluginManagement {
    repositories {
        google()
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

rootProject.name = "LightCloudDisk"
include ':app'

===============================================================================
文件：android/app/build.gradle (模块构建文件)
===============================================================================

plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android' version '1.9.0'
}

android {
    namespace 'com.example.lightclouddisk'
    compileSdk 34

    defaultConfig {
        applicationId "com.example.lightclouddisk"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"

        // 配置服务器地址和API密钥（实际项目中应从安全的配置源读取）
        buildConfigField "String", "DEFAULT_SERVER_URL", "\"http://10.0.2.2:3000\""
        buildConfigField "String", "DEFAULT_API_KEY", "\"light-cloud-disk-2026\""
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = '1.8'
    }

    buildFeatures {
        buildConfig true
        viewBinding true
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.10.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'

    // Retrofit for HTTP requests
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'

    // Kotlin Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'

    // Glide for image loading
    implementation 'com.github.bumptech.glide:glide:4.16.0'
    annotationProcessor 'com.github.bumptech.glide:compiler:4.16.0'

    // ViewModel and LiveData
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.7.0'
}
