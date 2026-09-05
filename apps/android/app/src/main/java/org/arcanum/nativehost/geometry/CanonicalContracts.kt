package org.arcanum.nativehost.geometry

import android.content.res.AssetManager
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.sqrt

data class Vec3(val x: Double, val y: Double, val z: Double) {
    operator fun plus(other: Vec3) = Vec3(x + other.x, y + other.y, z + other.z)
    operator fun minus(other: Vec3) = Vec3(x - other.x, y - other.y, z - other.z)
    operator fun times(scale: Double) = Vec3(x * scale, y * scale, z * scale)

    fun dot(other: Vec3): Double = x * other.x + y * other.y + z * other.z

    fun cross(other: Vec3): Vec3 =
        Vec3(
            y * other.z - z * other.y,
            z * other.x - x * other.z,
            x * other.y - y * other.x,
        )

    fun norm(): Double = sqrt(dot(this))

    fun normalized(): Vec3 {
        val length = norm()
        require(length > 0.0) { "degenerate vector" }
        return this * (1.0 / length)
    }
}

data class Mat3(val rows: List<Vec3>) {
    init {
        require(rows.size == 3) { "3x3 rotation matrix required" }
    }

    fun apply(value: Vec3): Vec3 =
        Vec3(
            rows[0].dot(value),
            rows[1].dot(value),
            rows[2].dot(value),
        )
}

data class ModelSpec(
    val translation: Vec3,
    val scale: Double,
    val rotation: Mat3,
)

data class CameraSpec(
    val eye: Vec3,
    val target: Vec3,
    val upReference: Vec3,
)

data class PerspectiveSpec(
    val fovYDegrees: Double,
    val near: Double,
    val far: Double,
)

data class ViewportSpec(
    val x0: Double,
    val y0: Double,
    val width: Double,
    val height: Double,
)

data class ProjectionProfile(
    val model: ModelSpec,
    val camera: CameraSpec,
    val perspective: PerspectiveSpec,
    val referenceViewport: ViewportSpec,
)

data class GeometryPoint(
    val id: String,
    val q: Vec3,
)

data class GeometryGroup(
    val id: String,
    val edgeLength: Double,
    val points: List<GeometryPoint>,
)

data class ReferenceSample(
    val id: String,
    val q: Vec3,
    val screenX: Double,
    val screenY: Double,
    val viewDepth: Double,
)

data class CanonicalContracts(
    val sourceFrameId: String,
    val profile: ProjectionProfile,
    val origin: GeometryPoint,
    val groups: List<GeometryGroup>,
    val referenceSamples: List<ReferenceSample>,
    val tolerance: Double,
    val geometryFreeEquivalentRequired: Boolean,
    val authorityEffect: String,
) {
    fun verifyReferenceVectors(): Boolean {
        if (authorityEffect != "none" || !geometryFreeEquivalentRequired) {
            return false
        }
        val engine = ProjectionEngine(profile)
        return referenceSamples.all { sample ->
            val observed = engine.project(sample.q, profile.referenceViewport) ?: return@all false
            close(observed.screenX, sample.screenX, tolerance) &&
                close(observed.screenY, sample.screenY, tolerance) &&
                close(observed.viewDepth, sample.viewDepth, tolerance)
        }
    }

    companion object {
        const val SOURCE_ASSET = "arcnet-coordinate-frame.v0.1.json"
        const val PROJECTION_ASSET = "arcnet-screen-projection.v0.1.json"
        const val VECTOR_ASSET = "arcnet-screen-projection.vectors.v0.1.json"

        fun fromAssets(assetManager: AssetManager): CanonicalContracts =
            parse(
                sourceJson = assetManager.readUtf8(SOURCE_ASSET),
                projectionJson = assetManager.readUtf8(PROJECTION_ASSET),
                vectorJson = assetManager.readUtf8(VECTOR_ASSET),
            )

        fun parse(
            sourceJson: String,
            projectionJson: String,
            vectorJson: String,
        ): CanonicalContracts {
            val source = JSONObject(sourceJson)
            val projection = JSONObject(projectionJson)
            val vectors = JSONObject(vectorJson)

            val sourceFrame = projection.getJSONObject("sourceFrame")
            val sourceFrameId = source.getString("frameId")
            require(sourceFrameId == sourceFrame.getString("frameId")) {
                "projection source frame does not match canonical geometry"
            }
            require(!sourceFrame.getBoolean("sourceCoordinatesMutable")) {
                "native host may not mutate canonical source coordinates"
            }
            require(projection.getString("authorityEffect") == "none") {
                "projection authorityEffect must remain none"
            }
            require(projection.getBoolean("geometryFreeEquivalentRequired")) {
                "geometry-free equivalent is required"
            }
            require(vectors.getString("registry") == "./arcnet-screen-projection.v0.1.json") {
                "projection vectors are not bound to the ratified registry"
            }

            val reference = projection.getJSONObject("referenceProfile")
            val modelJson = reference.getJSONObject("model")
            val cameraJson = reference.getJSONObject("camera")
            val perspectiveJson = reference.getJSONObject("perspective")
            val viewportJson = reference.getJSONObject("viewport")

            val model =
                ModelSpec(
                    translation = modelJson.getJSONArray("translation").toVec3(),
                    scale = modelJson.getDouble("scale"),
                    rotation = modelJson.getJSONArray("compositeMatrix").toMat3(),
                )
            require(model.scale > 0.0) { "model scale must be positive" }

            val profile =
                ProjectionProfile(
                    model = model,
                    camera =
                        CameraSpec(
                            eye = cameraJson.getJSONArray("eye").toVec3(),
                            target = cameraJson.getJSONArray("target").toVec3(),
                            upReference = cameraJson.getJSONArray("upReference").toVec3(),
                        ),
                    perspective =
                        PerspectiveSpec(
                            fovYDegrees = perspectiveJson.getDouble("fovYDegrees"),
                            near = perspectiveJson.getDouble("near"),
                            far = perspectiveJson.getDouble("far"),
                        ),
                    referenceViewport =
                        ViewportSpec(
                            x0 = viewportJson.getDouble("x0"),
                            y0 = viewportJson.getDouble("y0"),
                            width = viewportJson.getDouble("width"),
                            height = viewportJson.getDouble("height"),
                        ),
                )

            val originJson = source.getJSONObject("origin")
            val origin = GeometryPoint(originJson.getString("id"), originJson.getJSONArray("q").toVec3())
            val groups =
                listOf(
                    source.getJSONObject("outerCube").toGeometryGroup("outerCube"),
                    source.getJSONObject("innerOctahedron").toGeometryGroup("innerOctahedron"),
                )

            val samplesJson =
                vectors
                    .getJSONObject("expectations")
                    .getJSONObject("F25")
                    .getJSONArray("samples")
            val samples =
                buildList {
                    for (index in 0 until samplesJson.length()) {
                        val sample = samplesJson.getJSONObject(index)
                        val screen = sample.getJSONArray("screen")
                        add(
                            ReferenceSample(
                                id = sample.getString("id"),
                                q = sample.getJSONArray("q").toVec3(),
                                screenX = screen.getDouble(0),
                                screenY = screen.getDouble(1),
                                viewDepth = sample.getDouble("viewDepth"),
                            ),
                        )
                    }
                }

            return CanonicalContracts(
                sourceFrameId = sourceFrameId,
                profile = profile,
                origin = origin,
                groups = groups,
                referenceSamples = samples,
                tolerance = vectors.getDouble("tolerance"),
                geometryFreeEquivalentRequired = projection.getBoolean("geometryFreeEquivalentRequired"),
                authorityEffect = projection.getString("authorityEffect"),
            )
        }

        private fun close(a: Double, b: Double, tolerance: Double): Boolean =
            abs(a - b) <= tolerance * maxOf(1.0, abs(a), abs(b))
    }
}

private fun AssetManager.readUtf8(name: String): String =
    open(name).bufferedReader(Charsets.UTF_8).use { it.readText() }

private fun JSONArray.toVec3(): Vec3 {
    require(length() == 3) { "3-vector required" }
    return Vec3(getDouble(0), getDouble(1), getDouble(2))
}

private fun JSONArray.toMat3(): Mat3 {
    require(length() == 3) { "3x3 matrix required" }
    return Mat3(
        listOf(
            getJSONArray(0).toVec3(),
            getJSONArray(1).toVec3(),
            getJSONArray(2).toVec3(),
        ),
    )
}

private fun JSONObject.toGeometryGroup(id: String): GeometryGroup {
    val vertices = getJSONArray("vertices")
    val points =
        buildList {
            for (index in 0 until vertices.length()) {
                val vertex = vertices.getJSONObject(index)
                add(GeometryPoint(vertex.getString("id"), vertex.getJSONArray("q").toVec3()))
            }
        }
    return GeometryGroup(
        id = id,
        edgeLength = getJSONObject("edge").getDouble("decimal"),
        points = points,
    )
}
