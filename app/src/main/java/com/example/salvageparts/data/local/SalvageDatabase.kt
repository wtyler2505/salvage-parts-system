package com.example.salvageparts.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.salvageparts.data.model.CollisionShape
import com.example.salvageparts.data.model.Dimensions3D
import com.example.salvageparts.data.model.ElectricalSimProps
import com.example.salvageparts.data.model.ElectricalSpec
import com.example.salvageparts.data.model.MechanicalSpec
import com.example.salvageparts.data.model.PartCondition
import com.example.salvageparts.data.model.PartDocument
import com.example.salvageparts.data.model.PartEntity
import com.example.salvageparts.data.model.PhysicsSimProps
import com.example.salvageparts.data.model.SalvagePart
import com.example.salvageparts.data.model.ThermalSimProps
import com.example.salvageparts.data.model.ThermalSpec
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Database(
    entities = [PartEntity::class],
    version = 1,
    exportSchema = false
)
abstract class SalvageDatabase : RoomDatabase() {
    abstract fun partDao(): PartDao

    companion object {
        @Volatile
        private var INSTANCE: SalvageDatabase? = null

        val json = Json {
            ignoreUnknownKeys = true
            encodeDefaults = true
        }

        fun getDatabase(context: Context): SalvageDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    SalvageDatabase::class.java,
                    "salvage_parts_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }

        fun createSampleParts(): List<SalvagePart> {
            val now = System.currentTimeMillis()
            return listOf(
                SalvagePart(
                    id = "part-v8-coyote",
                    name = "Engine Block V8",
                    manufacturer = "Ford",
                    model = "Coyote 5.0L",
                    partNumbers = listOf("FR3E-6015-AA", "M-6010-M504V"),
                    categories = listOf("Engine Components", "Engine Blocks"),
                    tags = listOf("engine", "v8", "block", "ford", "coyote"),
                    dateAddedEpochMs = now - 86_400_000L * 5,
                    lastModifiedEpochMs = now - 3_600_000L * 4,
                    notes = "Ford Mustang GT 5.0L Coyote V8 bare engine block, deck surface inspected and pressure tested.",
                    condition = PartCondition.USED,
                    quantity = 1,
                    location = "Warehouse A - Bay 12",
                    valueUsd = 2500.0,
                    source = "Salvage Yard",
                    isFavorite = true,
                    modelFormat = "GLTF",
                    electricalSpec = ElectricalSpec(voltage = "12V Ground", current = "0A", power = "0W"),
                    mechanicalSpec = MechanicalSpec(
                        dimensions = Dimensions3D(600f, 500f, 400f),
                        weightKg = 150f,
                        material = "Cast Iron / Aluminum",
                        torque = "420 lb-ft",
                        rpm = 7500,
                        force = "38 kN",
                        pressure = "120 PSI"
                    ),
                    thermalSpec = ThermalSpec(
                        minTempC = -30f,
                        maxTempC = 240f,
                        thermalResistance = 0.18f,
                        heatDissipationW = 4500f
                    ),
                    customSpecs = mapOf(
                        "Displacement" to "5.0L (4951 cc)",
                        "Cylinders" to "8 (90° V)",
                        "Bore x Stroke" to "93.0 mm x 92.7 mm",
                        "Compression Ratio" to "12.0:1"
                    ),
                    physicsSim = PhysicsSimProps(
                        massKg = 150f,
                        densityKgM3 = 7200f,
                        friction = 0.55f,
                        restitution = 0.15f,
                        collisionShape = CollisionShape.BOX
                    ),
                    electricalSim = ElectricalSimProps(conductivity = 1.0e7f, resistivity = 1.0e-7f),
                    thermalSim = ThermalSimProps(
                        conductivityWmK = 50f,
                        heatCapacityJkgK = 450f,
                        expansionCoeff = 12e-6f,
                        emissivity = 0.82f
                    ),
                    documents = listOf(
                        PartDocument("doc-1", "Coyote_Gen3_Block_Blueprint.pdf", "pdf", 2480),
                        PartDocument("doc-2", "Bore_Tolerance_Inspection.pdf", "manual", 640)
                    )
                ),
                SalvagePart(
                    id = "part-zf-trans",
                    name = "Transmission Assembly",
                    manufacturer = "ZF",
                    model = "Manual 6-Speed S6-53",
                    partNumbers = listOf("ZF-6S-850", "1068-401-265"),
                    categories = listOf("Drivetrain", "Transmissions"),
                    tags = listOf("transmission", "manual", "6-speed", "zf", "gearbox"),
                    dateAddedEpochMs = now - 86_400_000L * 4,
                    lastModifiedEpochMs = now - 3_600_000L * 3,
                    notes = "Manual 6-speed transmission assembly in clean working order. Synchros tested on bench.",
                    condition = PartCondition.USED,
                    quantity = 1,
                    location = "Warehouse A - Rack 4",
                    valueUsd = 1800.0,
                    source = "Salvage Yard",
                    isFavorite = true,
                    modelFormat = "GLTF",
                    electricalSpec = ElectricalSpec(voltage = "12V Sensor", current = "0.4A", power = "5W"),
                    mechanicalSpec = MechanicalSpec(
                        dimensions = Dimensions3D(800f, 400f, 300f),
                        weightKg = 85f,
                        material = "Die-Cast Aluminum, Hardened Steel",
                        torque = "350 lb-ft",
                        rpm = 6800,
                        force = "22 kN",
                        pressure = "85 PSI"
                    ),
                    thermalSpec = ThermalSpec(
                        minTempC = -25f,
                        maxTempC = 145f,
                        thermalResistance = 0.35f,
                        heatDissipationW = 850f
                    ),
                    customSpecs = mapOf(
                        "Type" to "Manual Synchronized",
                        "Gears" to "6 Forward + 1 Reverse",
                        "Torque Rating" to "350 lb-ft (475 Nm)",
                        "Fluid Capacity" to "2.4L MTF-LT-3"
                    ),
                    physicsSim = PhysicsSimProps(
                        massKg = 85f,
                        densityKgM3 = 2700f,
                        friction = 0.35f,
                        restitution = 0.22f,
                        collisionShape = CollisionShape.CYLINDER
                    ),
                    electricalSim = ElectricalSimProps(conductivity = 3.5e7f, resistivity = 2.8e-8f),
                    thermalSim = ThermalSimProps(
                        conductivityWmK = 160f,
                        heatCapacityJkgK = 890f,
                        expansionCoeff = 23e-6f,
                        emissivity = 0.75f
                    ),
                    documents = listOf(
                        PartDocument("doc-3", "ZF_6Speed_Service_Manual.pdf", "manual", 4120),
                        PartDocument("doc-4", "Gear_Ratio_Chart.pdf", "datasheet", 310)
                    )
                ),
                SalvagePart(
                    id = "part-bosch-ecu",
                    name = "ECU Control Module",
                    manufacturer = "Bosch",
                    model = "ECU-X1 Motronic",
                    partNumbers = listOf("ECU-X1-2023", "0-261-S09-412"),
                    categories = listOf("Electronics", "Control Units"),
                    tags = listOf("ecu", "electronics", "control", "module", "bosch"),
                    dateAddedEpochMs = now - 86_400_000L * 3,
                    lastModifiedEpochMs = now - 3_600_000L * 2,
                    notes = "Engine Control Unit for modern fuel-injected powertrains. Factory sealed housing.",
                    condition = PartCondition.NEW,
                    quantity = 2,
                    location = "Quality Control Vault",
                    valueUsd = 450.0,
                    source = "Manufacturer",
                    isFavorite = false,
                    modelFormat = "STEP",
                    electricalSpec = ElectricalSpec(
                        voltage = "12V DC",
                        current = "2.5A",
                        power = "30W",
                        resistance = 4.8f,
                        capacitance = 0.0022f,
                        inductance = 0.0015f,
                        frequency = "180 MHz"
                    ),
                    mechanicalSpec = MechanicalSpec(
                        dimensions = Dimensions3D(150f, 100f, 50f),
                        weightKg = 0.8f,
                        material = "Anodized Aluminum, Silicon, Copper",
                        torque = "4 Nm mounting",
                        rpm = 0
                    ),
                    thermalSpec = ThermalSpec(
                        minTempC = -40f,
                        maxTempC = 105f,
                        thermalResistance = 1.2f,
                        heatDissipationW = 30f
                    ),
                    customSpecs = mapOf(
                        "Type" to "Engine Control Unit",
                        "Voltage" to "12V Nominal (9V-16V)",
                        "Processor" to "ARM Cortex-M4 32-bit",
                        "Memory" to "2MB ECC Flash",
                        "CAN Bus" to "Dual High-Speed CAN-FD"
                    ),
                    physicsSim = PhysicsSimProps(
                        massKg = 0.8f,
                        densityKgM3 = 1200f,
                        friction = 0.5f,
                        restitution = 0.2f,
                        collisionShape = CollisionShape.BOX
                    ),
                    electricalSim = ElectricalSimProps(
                        conductivity = 5.8e7f,
                        resistivity = 1.68e-8f,
                        dielectric = 3.9f,
                        breakdownVoltage = 30e6f
                    ),
                    thermalSim = ThermalSimProps(
                        conductivityWmK = 0.2f,
                        heatCapacityJkgK = 1500f,
                        expansionCoeff = 70e-6f,
                        emissivity = 0.9f
                    ),
                    documents = listOf(
                        PartDocument("doc-5", "Bosch_ECU_X1_Pinout_Schematic.pdf", "schematic", 1890)
                    )
                ),
                SalvagePart(
                    id = "part-garrett-turbo",
                    name = "Twin-Scroll Turbocharger",
                    manufacturer = "Garrett",
                    model = "GT2860RS",
                    partNumbers = listOf("836026-5004S", "GRT-T28-RS"),
                    categories = listOf("Engine Components", "Forced Induction"),
                    tags = listOf("turbo", "garrett", "boost", "impeller", "salvaged"),
                    dateAddedEpochMs = now - 86_400_000L * 2,
                    lastModifiedEpochMs = now - 3_600_000L,
                    notes = "Dual ball-bearing turbocharger salvaged from track build. Zero axial shaft play.",
                    condition = PartCondition.SALVAGED,
                    quantity = 1,
                    location = "Warehouse B - Shelf 9",
                    valueUsd = 920.0,
                    source = "Motorsport Salvage",
                    isFavorite = true,
                    modelFormat = "OBJ",
                    electricalSpec = ElectricalSpec(voltage = "5V PWM Wastegate", current = "1.2A", power = "6W"),
                    mechanicalSpec = MechanicalSpec(
                        dimensions = Dimensions3D(240f, 220f, 195f),
                        weightKg = 7.4f,
                        material = "Inconel 713C / Forged Billet Aluminum",
                        torque = "N/A",
                        rpm = 145000,
                        pressure = "28 PSI Peak"
                    ),
                    thermalSpec = ThermalSpec(
                        minTempC = -20f,
                        maxTempC = 950f,
                        thermalResistance = 0.09f,
                        heatDissipationW = 2800f
                    ),
                    customSpecs = mapOf(
                        "Compressor Inducer" to "47.2 mm",
                        "Turbine A/R" to "0.86",
                        "Bearing Type" to "Dual Ceramic Ball Bearing",
                        "Cooling" to "Oil & Water Cooled"
                    ),
                    physicsSim = PhysicsSimProps(
                        massKg = 7.4f,
                        densityKgM3 = 4800f,
                        friction = 0.4f,
                        restitution = 0.3f,
                        collisionShape = CollisionShape.SPHERE
                    ),
                    electricalSim = ElectricalSimProps(),
                    thermalSim = ThermalSimProps(
                        conductivityWmK = 85f,
                        heatCapacityJkgK = 520f,
                        expansionCoeff = 14e-6f,
                        emissivity = 0.88f
                    ),
                    documents = listOf(
                        PartDocument("doc-6", "GT2860RS_Compressor_Map.pdf", "datasheet", 950)
                    )
                ),
                SalvagePart(
                    id = "part-denso-alt",
                    name = "High-Output Alternator 180A",
                    manufacturer = "Denso",
                    model = "Hairpin SC-180",
                    partNumbers = listOf("104210-4920", "DNS-180A-OEM"),
                    categories = listOf("Electrical", "Charging Systems"),
                    tags = listOf("alternator", "denso", "12v", "charging", "copper"),
                    dateAddedEpochMs = now - 86_400_000L,
                    lastModifiedEpochMs = now - 1_800_000L,
                    notes = "Stator winding has open circuit on phase B; housing and pulley intact for rebuild core.",
                    condition = PartCondition.BROKEN,
                    quantity = 3,
                    location = "Rebuild Bench 2",
                    valueUsd = 85.0,
                    source = "Fleet Decommission",
                    isFavorite = false,
                    modelFormat = "STL",
                    electricalSpec = ElectricalSpec(
                        voltage = "14.4V Regulated",
                        current = "180A",
                        power = "2590W",
                        resistance = 0.08f,
                        inductance = 0.0042f,
                        frequency = "400 Hz"
                    ),
                    mechanicalSpec = MechanicalSpec(
                        dimensions = Dimensions3D(185f, 160f, 155f),
                        weightKg = 6.2f,
                        material = "Die-Cast Aluminum, Copper Winding",
                        rpm = 18000
                    ),
                    thermalSpec = ThermalSpec(
                        minTempC = -30f,
                        maxTempC = 165f,
                        thermalResistance = 0.42f,
                        heatDissipationW = 340f
                    ),
                    customSpecs = mapOf(
                        "Pulley Type" to "6-Rib Overrunning Clutch",
                        "Regulator" to "LIN-Bus Smart Internal",
                        "Core Status" to "Rebuildable Stator"
                    ),
                    physicsSim = PhysicsSimProps(
                        massKg = 6.2f,
                        densityKgM3 = 3400f,
                        friction = 0.45f,
                        restitution = 0.25f,
                        collisionShape = CollisionShape.CYLINDER
                    ),
                    electricalSim = ElectricalSimProps(),
                    thermalSim = ThermalSimProps()
                )
            )
        }

        fun SalvagePart.toEntity(): PartEntity {
            return PartEntity(
                id = id,
                name = name,
                manufacturer = manufacturer,
                model = model,
                condition = condition.label,
                quantity = quantity,
                location = location,
                valueUsd = valueUsd,
                source = source,
                isFavorite = isFavorite,
                dateAddedEpochMs = dateAddedEpochMs,
                lastModifiedEpochMs = lastModifiedEpochMs,
                serializedPayload = json.encodeToString(this)
            )
        }

        fun PartEntity.toDomain(): SalvagePart {
            return runCatching {
                json.decodeFromString<SalvagePart>(serializedPayload)
            }.getOrElse {
                SalvagePart(
                    id = id,
                    name = name,
                    manufacturer = manufacturer,
                    model = model,
                    condition = PartCondition.fromString(condition),
                    quantity = quantity,
                    location = location,
                    valueUsd = valueUsd,
                    source = source,
                    isFavorite = isFavorite,
                    dateAddedEpochMs = dateAddedEpochMs,
                    lastModifiedEpochMs = lastModifiedEpochMs
                )
            }
        }
    }
}
