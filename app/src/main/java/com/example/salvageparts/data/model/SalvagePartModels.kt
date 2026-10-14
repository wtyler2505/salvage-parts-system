package com.example.salvageparts.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
enum class PartCondition(val label: String) {
    NEW("new"),
    USED("used"),
    SALVAGED("salvaged"),
    BROKEN("broken");

    companion object {
        fun fromString(value: String): PartCondition {
            return entries.firstOrNull { it.label.equals(value, ignoreCase = true) } ?: USED
        }
    }
}

@Serializable
enum class CollisionShape(val label: String) {
    BOX("box"),
    SPHERE("sphere"),
    CYLINDER("cylinder"),
    MESH("mesh");

    companion object {
        fun fromString(value: String): CollisionShape {
            return entries.firstOrNull { it.label.equals(value, ignoreCase = true) } ?: BOX
        }
    }
}

@Serializable
enum class ViewerRenderMode(val id: String, val title: String, val description: String) {
    NORMAL("normal", "Normal", "Standard PBR shaded rendering"),
    WIREFRAME("wireframe", "Wireframe", "Show CAD mesh topology structure"),
    XRAY("xray", "X-Ray", "Semi-transparent internal inspection"),
    EXPLODED("exploded", "Exploded", "Separated sub-assembly components")
}

@Serializable
data class Dimensions3D(
    val x: Float = 100f,
    val y: Float = 100f,
    val z: Float = 100f
)

@Serializable
data class ElectricalSpec(
    val voltage: String = "",
    val current: String = "",
    val power: String = "",
    val resistance: Float = 0f,
    val capacitance: Float = 0f,
    val inductance: Float = 0f,
    val frequency: String = ""
)

@Serializable
data class MechanicalSpec(
    val dimensions: Dimensions3D = Dimensions3D(),
    val weightKg: Float = 1f,
    val material: String = "Steel",
    val torque: String = "",
    val rpm: Int = 0,
    val force: String = "",
    val pressure: String = ""
)

@Serializable
data class ThermalSpec(
    val minTempC: Float = -20f,
    val maxTempC: Float = 120f,
    val thermalResistance: Float = 0.5f,
    val heatDissipationW: Float = 15f
)

@Serializable
data class PhysicsSimProps(
    val massKg: Float = 10f,
    val densityKgM3: Float = 2700f,
    val friction: Float = 0.5f,
    val restitution: Float = 0.25f,
    val collisionShape: CollisionShape = CollisionShape.BOX
)

@Serializable
data class ElectricalSimProps(
    val conductivity: Float = 5.8e7f,
    val resistivity: Float = 1.68e-8f,
    val dielectric: Float = 1.0f,
    val breakdownVoltage: Float = 30000f
)

@Serializable
data class ThermalSimProps(
    val conductivityWmK: Float = 50f,
    val heatCapacityJkgK: Float = 450f,
    val expansionCoeff: Float = 12e-6f,
    val emissivity: Float = 0.8f
)

@Serializable
data class PartDocument(
    val id: String,
    val name: String,
    val type: String, // pdf, schematic, manual, image
    val sizeKb: Int
)

@Serializable
data class SalvagePart(
    val id: String,
    val name: String,
    val manufacturer: String,
    val model: String,
    val partNumbers: List<String> = emptyList(),
    val categories: List<String> = emptyList(),
    val tags: List<String> = emptyList(),
    val dateAddedEpochMs: Long = System.currentTimeMillis(),
    val lastModifiedEpochMs: Long = System.currentTimeMillis(),
    val notes: String = "",
    val condition: PartCondition = PartCondition.USED,
    val quantity: Int = 1,
    val location: String = "Warehouse A",
    val valueUsd: Double = 0.0,
    val source: String = "Salvage Yard",
    val isFavorite: Boolean = false,
    val modelFormat: String = "GLTF",
    val electricalSpec: ElectricalSpec = ElectricalSpec(),
    val mechanicalSpec: MechanicalSpec = MechanicalSpec(),
    val thermalSpec: ThermalSpec = ThermalSpec(),
    val customSpecs: Map<String, String> = emptyMap(),
    val physicsSim: PhysicsSimProps = PhysicsSimProps(),
    val electricalSim: ElectricalSimProps = ElectricalSimProps(),
    val thermalSim: ThermalSimProps = ThermalSimProps(),
    val documents: List<PartDocument> = emptyList()
)

@Entity(tableName = "salvage_parts")
data class PartEntity(
    @PrimaryKey val id: String,
    val name: String,
    val manufacturer: String,
    val model: String,
    val condition: String,
    val quantity: Int,
    val location: String,
    val valueUsd: Double,
    val source: String,
    val isFavorite: Boolean,
    val dateAddedEpochMs: Long,
    val lastModifiedEpochMs: Long,
    val serializedPayload: String
)

@Serializable
data class Vec3(
    val x: Float,
    val y: Float,
    val z: Float
) {
    fun distanceTo(other: Vec3): Float {
        val dx = x - other.x
        val dy = y - other.y
        val dz = z - other.z
        return kotlin.math.sqrt(dx * dx + dy * dy + dz * dz)
    }
}

@Serializable
data class Annotation3D(
    val id: String,
    val partId: String,
    val position: Vec3,
    val text: String,
    val author: String = "Lead Inspector",
    val createdAtEpochMs: Long = System.currentTimeMillis(),
    val colorHex: Long = 0xFF38BDF8
)

@Serializable
data class Measurement3D(
    val id: String,
    val partId: String,
    val startPoint: Vec3,
    val endPoint: Vec3,
    val distanceMm: Float,
    val label: String
)

@Serializable
data class KeyframeItem(
    val id: String,
    val timeSec: Float,
    val propertyName: String,
    val valueLabel: String
)

@Serializable
data class AnimationTrackItem(
    val id: String,
    val name: String,
    val partId: String,
    val visible: Boolean = true,
    val muted: Boolean = false,
    val colorHex: Long = 0xFFF59E0B,
    val keyframes: List<KeyframeItem> = emptyList()
)

@Serializable
data class SimulationSettingsState(
    val physicsEnabled: Boolean = false,
    val showPhysicsDebug: Boolean = false,
    val gravityY: Float = -9.81f,
    val electricalEnabled: Boolean = false,
    val showCurrentFlow: Boolean = true,
    val supplyVoltage: Float = 12f,
    val thermalEnabled: Boolean = false,
    val ambientTemperatureC: Float = 22f,
    val showHeatMap: Boolean = true,
    val postProcessingEnabled: Boolean = true,
    val ambientOcclusionMode: String = "N8AO"
)

data class SearchFilterState(
    val query: String = "",
    val selectedCategory: String? = null,
    val selectedConditions: Set<PartCondition> = emptySet(),
    val onlyFavorites: Boolean = false,
    val minValueUsd: Double? = null,
    val maxValueUsd: Double? = null
)

data class PartStatisticsSummary(
    val totalParts: Int = 0,
    val totalQuantity: Int = 0,
    val totalValueUsd: Double = 0.0,
    val averageValueUsd: Double = 0.0,
    val partsByCondition: Map<PartCondition, Int> = emptyMap(),
    val partsByCategory: Map<String, Int> = emptyMap(),
    val highValueCount: Int = 0,   // > $1000
    val mediumValueCount: Int = 0, // $100 - $1000
    val lowValueCount: Int = 0     // < $100
)
