import org.gradle.api.tasks.testing.Test

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val arcanumSourceCommit =
    providers.gradleProperty("arcanumSourceCommit").orElse("development-unbound")

val arcanumDevKeystorePath = providers.gradleProperty("arcanumDevKeystorePath")
val arcanumDevStorePassword = providers.gradleProperty("arcanumDevStorePassword")
val arcanumDevKeyAlias = providers.gradleProperty("arcanumDevKeyAlias")
val arcanumDevKeyPassword = providers.gradleProperty("arcanumDevKeyPassword")
val arcanumDevSigningConfigured =
    listOf(
        arcanumDevKeystorePath,
        arcanumDevStorePassword,
        arcanumDevKeyAlias,
        arcanumDevKeyPassword,
    ).all { it.isPresent }

android {
    namespace = "org.arcanum.nativehost"
    compileSdk = 35
    testBuildType = "qualification"

    defaultConfig {
        applicationId = "org.arcanum.nativehost"
        minSdk = 26
        targetSdk = 35
        versionCode = 26
        providers.gradleProperty("arcanumQualificationVersionCode").orNull?.let { value ->
            versionCode = value.toInt().also { require(it == 26 || it == 27) }
        }
        versionName = "0.1.16-cew04-a16"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField(
            "String",
            "ARCANUM_SOURCE_COMMIT",
            "\"${arcanumSourceCommit.get()}\"",
        )
        buildConfigField(
            "String",
            "ARCANUM_IMPLEMENTATION_ARC",
            "\"CE-W04-A16\"",
        )
    }

    buildFeatures {
        buildConfig = true
    }

    signingConfigs {
        if (arcanumDevSigningConfigured) {
            create("arcanumDev") {
                storeFile = file(arcanumDevKeystorePath.get())
                storePassword = arcanumDevStorePassword.get()
                keyAlias = arcanumDevKeyAlias.get()
                keyPassword = arcanumDevKeyPassword.get()
            }
        }
    }

    buildTypes {
        create("qualification") {
            initWith(getByName("debug"))
            applicationIdSuffix = ".a16qualification"
            versionNameSuffix = "-qualification"
            isDebuggable = true
            signingConfig = signingConfigs.getByName("debug")
        }
        getByName("debug") {
            if (arcanumDevSigningConfigured) {
                signingConfig = signingConfigs.getByName("arcanumDev")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    sourceSets["main"].assets.srcDir(file("../../../docs/specs/geometry"))
}

tasks.withType<Test>().configureEach {
    systemProperty(
        "arcanum.repoRoot",
        rootProject.projectDir.resolve("../..").canonicalPath,
    )
}

dependencies {
    implementation("com.android.tools.build:apksig:8.7.3")
    androidTestImplementation("androidx.test:runner:1.6.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.json:json:20240303")
}
