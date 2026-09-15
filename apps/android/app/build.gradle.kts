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

    defaultConfig {
        applicationId = "org.arcanum.nativehost"
        minSdk = 26
        targetSdk = 35
        versionCode = 13
        versionName = "0.1.12-cew04-a11"
        buildConfigField(
            "String",
            "ARCANUM_SOURCE_COMMIT",
            "\"${arcanumSourceCommit.get()}\"",
        )
        buildConfigField(
            "String",
            "ARCANUM_IMPLEMENTATION_ARC",
            "\"CE-W04-A11\"",
        )
        // Predecessor provenance retained for A10 verifier continuity: CE-W04-A10.
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
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.json:json:20240303")
}
