import org.gradle.api.tasks.testing.Test

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val arcanumSourceCommit =
    providers.gradleProperty("arcanumSourceCommit").orElse("development-unbound")

android {
    namespace = "org.arcanum.nativehost"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.arcanum.nativehost"
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "0.1.1-cew04"
        buildConfigField(
            "String",
            "ARCANUM_SOURCE_COMMIT",
            "\"${arcanumSourceCommit.get()}\"",
        )
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    // Canonical geometry/projection registries remain source-owned at repo root.
    // Android consumes them directly as build assets; no copied expected geometry.
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
