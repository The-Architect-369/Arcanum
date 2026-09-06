package org.arcanum.nativehost.geometry

import android.content.res.AssetManager
import org.json.JSONObject
import kotlin.math.abs

data class OverlayPoint(val id: String, val x: Double, val y: Double)

data class HopeSeedOverlay(
    val id: String,
    val type: String,
    val relationToOctahedron: String,
    val exactMappingSpecified: Boolean,
    val mathematicalIdentityClaimed: Boolean,
    val authorityEffect: String,
    val unitRadiusFractionOfMinViewport: Double,
    val centers: List<OverlayPoint>,
    val geometryFreeEquivalentRequired: Boolean,
) {
    init {
        require(type == "symbolic-presentation-overlay")
        require(!exactMappingSpecified)
        require(!mathematicalIdentityClaimed)
        require(authorityEffect == "none")
        require(unitRadiusFractionOfMinViewport > 0.0)
        require(centers.size == 7)
        require(geometryFreeEquivalentRequired)
    }

    fun mapToScreen(
        originX: Double,
        originY: Double,
        viewportWidth: Double,
        viewportHeight: Double,
    ): List<OverlayCircle> {
        val radius = minOf(viewportWidth, viewportHeight) * unitRadiusFractionOfMinViewport
        return centers.map { center ->
            OverlayCircle(
                id = center.id,
                centerX = originX + center.x * radius,
                centerY = originY - center.y * radius,
                radius = radius,
            )
        }
    }

    fun verifyReferenceVectors(vectorJson: String): Boolean {
        val vectors = JSONObject(vectorJson)
        if (vectors.getString("registry") != "./hope-seed-overlay.v0.1.json") return false
        val viewport = vectors.getJSONObject("referenceViewport")
        val origin = vectors.getJSONArray("referenceOrigin")
        val expected = vectors.getJSONArray("samples")
        val tolerance = vectors.getDouble("tolerance")
        val mapped =
            mapToScreen(
                origin.getDouble(0),
                origin.getDouble(1),
                viewport.getDouble("width"),
                viewport.getDouble("height"),
            ).associateBy { it.id }
        if (mapped.size != expected.length()) return false
        for (index in 0 until expected.length()) {
            val sample = expected.getJSONObject(index)
            val circle = mapped[sample.getString("id")] ?: return false
            val screen = sample.getJSONArray("screen")
            if (!close(circle.centerX, screen.getDouble(0), tolerance)) return false
            if (!close(circle.centerY, screen.getDouble(1), tolerance)) return false
            if (!close(circle.radius, sample.getDouble("radius"), tolerance)) return false
        }
        return true
    }

    companion object {
        const val ASSET = "hope-seed-overlay.v0.1.json"
        const val VECTOR_ASSET = "hope-seed-overlay.vectors.v0.1.json"

        fun fromAssets(assetManager: AssetManager): HopeSeedOverlay =
            parse(assetManager.open(ASSET).bufferedReader().use { it.readText() })

        fun parse(json: String): HopeSeedOverlay {
            val root = JSONObject(json)
            val source = root.getJSONObject("source")
            require(source.getString("frameId") == "arcnet-coordinate-frame")
            require(source.getString("innerRole") == "hope-centered-inner-rendering")
            require(!source.getBoolean("sourceCoordinatesMutable"))

            val overlay = root.getJSONObject("overlay")
            val centersJson = overlay.getJSONArray("centers")
            val centers = buildList {
                for (index in 0 until centersJson.length()) {
                    val entry = centersJson.getJSONObject(index)
                    val p = entry.getJSONArray("p")
                    add(OverlayPoint(entry.getString("id"), p.getDouble(0), p.getDouble(1)))
                }
            }
            val scale = root.getJSONObject("presentationScale")
            require(scale.getString("type") == "viewport-relative-presentation-only")
            require(scale.getString("centerAnchor") == "projected-identity-origin")
            require(scale.getString("derivationClaim") == "none")
            return HopeSeedOverlay(
                id = overlay.getString("id"),
                type = overlay.getString("type"),
                relationToOctahedron = overlay.getString("relationToOctahedron"),
                exactMappingSpecified = overlay.getBoolean("exactMappingSpecified"),
                mathematicalIdentityClaimed = overlay.getBoolean("mathematicalIdentityClaimed"),
                authorityEffect = overlay.getString("authorityEffect"),
                unitRadiusFractionOfMinViewport = scale.getDouble("unitRadiusFractionOfMinViewport"),
                centers = centers,
                geometryFreeEquivalentRequired = root.getJSONObject("geometryFreeEquivalent").getBoolean("required"),
            )
        }

        private fun close(a: Double, b: Double, tolerance: Double): Boolean =
            abs(a - b) <= tolerance * maxOf(1.0, abs(a), abs(b))
    }
}

data class OverlayCircle(
    val id: String,
    val centerX: Double,
    val centerY: Double,
    val radius: Double,
)
