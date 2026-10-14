package com.example.salvageparts.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.InputChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.salvageparts.data.model.CollisionShape
import com.example.salvageparts.data.model.Dimensions3D
import com.example.salvageparts.data.model.ElectricalSpec
import com.example.salvageparts.data.model.MechanicalSpec
import com.example.salvageparts.data.model.PartCondition
import com.example.salvageparts.data.model.PartDocument
import com.example.salvageparts.data.model.PhysicsSimProps
import com.example.salvageparts.data.model.SalvagePart
import com.example.salvageparts.data.model.ThermalSpec
import java.util.UUID

enum class EditorMode {
    CREATE, EDIT, VIEW
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun PartEditorSheet(
    part: SalvagePart?,
    mode: EditorMode,
    onDismiss: () -> Unit,
    onSave: (SalvagePart) -> Unit,
    onDuplicate: (SalvagePart) -> Unit
) {
    val readOnly = mode == EditorMode.VIEW
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var name by remember(part) { mutableStateOf(part?.name ?: "") }
    var manufacturer by remember(part) { mutableStateOf(part?.manufacturer ?: "") }
    var model by remember(part) { mutableStateOf(part?.model ?: "") }
    var condition by remember(part) { mutableStateOf(part?.condition ?: PartCondition.USED) }
    var quantity by remember(part) { mutableStateOf((part?.quantity ?: 1).toString()) }
    var valueUsd by remember(part) { mutableStateOf((part?.valueUsd ?: 0.0).toString()) }
    var location by remember(part) { mutableStateOf(part?.location ?: "Warehouse A") }
    var source by remember(part) { mutableStateOf(part?.source ?: "Salvage Yard") }
    var notes by remember(part) { mutableStateOf(part?.notes ?: "") }
    var categories by remember(part) { mutableStateOf(part?.categories ?: listOf("Engine Components")) }
    var tags by remember(part) { mutableStateOf(part?.tags ?: listOf("salvage")) }
    var partNumbers by remember(part) { mutableStateOf(part?.partNumbers ?: emptyList()) }

    // Specs
    var voltage by remember(part) { mutableStateOf(part?.electricalSpec?.voltage ?: "12V") }
    var current by remember(part) { mutableStateOf(part?.electricalSpec?.current ?: "") }
    var power by remember(part) { mutableStateOf(part?.electricalSpec?.power ?: "") }

    var dimX by remember(part) { mutableStateOf((part?.mechanicalSpec?.dimensions?.x ?: 250f).toString()) }
    var dimY by remember(part) { mutableStateOf((part?.mechanicalSpec?.dimensions?.y ?: 200f).toString()) }
    var dimZ by remember(part) { mutableStateOf((part?.mechanicalSpec?.dimensions?.z ?: 150f).toString()) }
    var weightKg by remember(part) { mutableStateOf((part?.mechanicalSpec?.weightKg ?: 12f).toString()) }
    var material by remember(part) { mutableStateOf(part?.mechanicalSpec?.material ?: "Aluminum / Steel") }
    var torque by remember(part) { mutableStateOf(part?.mechanicalSpec?.torque ?: "") }

    var minTemp by remember(part) { mutableStateOf((part?.thermalSpec?.minTempC ?: -20f).toString()) }
    var maxTemp by remember(part) { mutableStateOf((part?.thermalSpec?.maxTempC ?: 150f).toString()) }
    var heatDiss by remember(part) { mutableStateOf((part?.thermalSpec?.heatDissipationW ?: 100f).toString()) }

    // 3D & Physics
    var modelFormat by remember(part) { mutableStateOf(part?.modelFormat ?: "GLTF") }
    var collisionShape by remember(part) { mutableStateOf(part?.physicsSim?.collisionShape ?: CollisionShape.BOX) }
    var massKg by remember(part) { mutableStateOf((part?.physicsSim?.massKg ?: 12f).toString()) }
    var friction by remember(part) { mutableStateOf((part?.physicsSim?.friction ?: 0.5f).toString()) }
    var restitution by remember(part) { mutableStateOf((part?.physicsSim?.restitution ?: 0.2f).toString()) }
    var documents by remember(part) { mutableStateOf(part?.documents ?: emptyList()) }

    var activeTabIndex by remember { mutableIntStateOf(0) }
    val tabs = listOf("Metadata", "Specifications", "3D Model", "Documentation", "Simulation")

    var newCategoryText by remember { mutableStateOf("") }
    var newTagText by remember { mutableStateOf("") }
    var newPartNumberText by remember { mutableStateOf("") }
    var newDocName by remember { mutableStateOf("") }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        modifier = Modifier.testTag("part_editor_sheet")
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp)
        ) {
            // Sheet Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = when (mode) {
                            EditorMode.CREATE -> "Create Salvage Part"
                            EditorMode.EDIT -> "Edit Salvage Part"
                            EditorMode.VIEW -> "Part Specifications"
                        },
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    if (name.isNotBlank()) {
                        Text(
                            text = name,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (part != null && mode != EditorMode.CREATE) {
                        OutlinedButton(
                            onClick = { onDuplicate(part) },
                            modifier = Modifier.testTag("editor_duplicate_button")
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Copy")
                        }
                    }

                    if (!readOnly) {
                        Button(
                            onClick = {
                                val resolvedName = name.trim().ifBlank { "Unnamed Salvage Component" }
                                val builtPart = SalvagePart(
                                    id = part?.id ?: "part-${UUID.randomUUID().toString().take(8)}",
                                    name = resolvedName,
                                    manufacturer = manufacturer.trim().ifBlank { "OEM" },
                                    model = model.trim().ifBlank { "Standard" },
                                    partNumbers = partNumbers,
                                    categories = categories.ifEmpty { listOf("General Salvage") },
                                    tags = tags,
                                    dateAddedEpochMs = part?.dateAddedEpochMs ?: System.currentTimeMillis(),
                                    lastModifiedEpochMs = System.currentTimeMillis(),
                                    notes = notes.trim(),
                                    condition = condition,
                                    quantity = quantity.toIntOrNull()?.coerceAtLeast(1) ?: 1,
                                    location = location.trim().ifBlank { "Warehouse A" },
                                    valueUsd = valueUsd.toDoubleOrNull()?.coerceAtLeast(0.0) ?: 0.0,
                                    source = source.trim().ifBlank { "Salvage Yard" },
                                    isFavorite = part?.isFavorite ?: false,
                                    modelFormat = modelFormat,
                                    electricalSpec = ElectricalSpec(
                                        voltage = voltage,
                                        current = current,
                                        power = power
                                    ),
                                    mechanicalSpec = MechanicalSpec(
                                        dimensions = Dimensions3D(
                                            x = dimX.toFloatOrNull() ?: 250f,
                                            y = dimY.toFloatOrNull() ?: 200f,
                                            z = dimZ.toFloatOrNull() ?: 150f
                                        ),
                                        weightKg = weightKg.toFloatOrNull() ?: 10f,
                                        material = material,
                                        torque = torque
                                    ),
                                    thermalSpec = ThermalSpec(
                                        minTempC = minTemp.toFloatOrNull() ?: -20f,
                                        maxTempC = maxTemp.toFloatOrNull() ?: 120f,
                                        heatDissipationW = heatDiss.toFloatOrNull() ?: 50f
                                    ),
                                    customSpecs = part?.customSpecs ?: emptyMap(),
                                    physicsSim = PhysicsSimProps(
                                        massKg = massKg.toFloatOrNull() ?: 10f,
                                        friction = friction.toFloatOrNull() ?: 0.5f,
                                        restitution = restitution.toFloatOrNull() ?: 0.2f,
                                        collisionShape = collisionShape
                                    ),
                                    documents = documents
                                )
                                onSave(builtPart)
                            },
                            modifier = Modifier.testTag("editor_save_button")
                        ) {
                            Icon(Icons.Default.Save, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Save")
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            ScrollableTabRow(
                selectedTabIndex = activeTabIndex,
                edgePadding = 0.dp
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = activeTabIndex == index,
                        onClick = { activeTabIndex = index },
                        text = { Text(title) },
                        modifier = Modifier.testTag("editor_tab_$index")
                    )
                }
            }

            HorizontalDivider()

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                when (activeTabIndex) {
                    0 -> {
                        // Metadata Tab
                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("Part Name *") },
                            readOnly = readOnly,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("input_part_name"),
                            singleLine = true
                        )

                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            OutlinedTextField(
                                value = manufacturer,
                                onValueChange = { manufacturer = it },
                                label = { Text("Manufacturer") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = model,
                                onValueChange = { model = it },
                                label = { Text("Model") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        Text("Condition", style = MaterialTheme.typography.labelMedium)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            PartCondition.entries.forEach { cond ->
                                FilterChip(
                                    selected = condition == cond,
                                    onClick = { if (!readOnly) condition = cond },
                                    label = { Text(cond.label.replaceFirstChar { it.uppercase() }) }
                                )
                            }
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            OutlinedTextField(
                                value = quantity,
                                onValueChange = { quantity = it },
                                label = { Text("Quantity") },
                                readOnly = readOnly,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = valueUsd,
                                onValueChange = { valueUsd = it },
                                label = { Text("Value ($ USD)") },
                                readOnly = readOnly,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            OutlinedTextField(
                                value = location,
                                onValueChange = { location = it },
                                label = { Text("Storage Location") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = source,
                                onValueChange = { source = it },
                                label = { Text("Salvage Source") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        // OEM Part Numbers
                        Text("OEM Part Numbers", style = MaterialTheme.typography.titleMedium)
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            partNumbers.forEach { pn ->
                                InputChip(
                                    selected = false,
                                    onClick = {
                                        if (!readOnly) partNumbers = partNumbers - pn
                                    },
                                    label = { Text(pn) },
                                    trailingIcon = if (!readOnly) {
                                        { Icon(Icons.Default.Close, contentDescription = "Remove") }
                                    } else null
                                )
                            }
                        }
                        if (!readOnly) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedTextField(
                                    value = newPartNumberText,
                                    onValueChange = { newPartNumberText = it },
                                    label = { Text("Add OEM Part Number") },
                                    modifier = Modifier.weight(1f),
                                    singleLine = true
                                )
                                IconButton(
                                    onClick = {
                                        if (newPartNumberText.isNotBlank()) {
                                            partNumbers = partNumbers + newPartNumberText.trim()
                                            newPartNumberText = ""
                                        }
                                    }
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = "Add Part Number")
                                }
                            }
                        }

                        // Categories
                        Text("Categories", style = MaterialTheme.typography.titleMedium)
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            categories.forEach { cat ->
                                InputChip(
                                    selected = true,
                                    onClick = {
                                        if (!readOnly) categories = categories - cat
                                    },
                                    label = { Text(cat) },
                                    trailingIcon = if (!readOnly) {
                                        { Icon(Icons.Default.Close, contentDescription = "Remove") }
                                    } else null
                                )
                            }
                        }
                        if (!readOnly) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedTextField(
                                    value = newCategoryText,
                                    onValueChange = { newCategoryText = it },
                                    label = { Text("Add Category") },
                                    modifier = Modifier.weight(1f),
                                    singleLine = true
                                )
                                IconButton(
                                    onClick = {
                                        if (newCategoryText.isNotBlank()) {
                                            categories = (categories + newCategoryText.trim()).distinct()
                                            newCategoryText = ""
                                        }
                                    }
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = "Add Category")
                                }
                            }
                        }

                        // Tags
                        Text("Tags", style = MaterialTheme.typography.titleMedium)
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            tags.forEach { tag ->
                                InputChip(
                                    selected = false,
                                    onClick = {
                                        if (!readOnly) tags = tags - tag
                                    },
                                    label = { Text("#$tag") },
                                    trailingIcon = if (!readOnly) {
                                        { Icon(Icons.Default.Close, contentDescription = "Remove") }
                                    } else null
                                )
                            }
                        }
                        if (!readOnly) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedTextField(
                                    value = newTagText,
                                    onValueChange = { newTagText = it },
                                    label = { Text("Add Tag") },
                                    modifier = Modifier.weight(1f),
                                    singleLine = true
                                )
                                IconButton(
                                    onClick = {
                                        if (newTagText.isNotBlank()) {
                                            tags = (tags + newTagText.trim().lowercase()).distinct()
                                            newTagText = ""
                                        }
                                    }
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = "Add Tag")
                                }
                            }
                        }

                        OutlinedTextField(
                            value = notes,
                            onValueChange = { notes = it },
                            label = { Text("Inspection Notes") },
                            readOnly = readOnly,
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 3
                        )
                    }

                    1 -> {
                        // Specifications Tab
                        Text("Mechanical Specifications", style = MaterialTheme.typography.titleMedium)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = dimX,
                                onValueChange = { dimX = it },
                                label = { Text("Length X (mm)") },
                                readOnly = readOnly,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = dimY,
                                onValueChange = { dimY = it },
                                label = { Text("Width Y (mm)") },
                                readOnly = readOnly,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = dimZ,
                                onValueChange = { dimZ = it },
                                label = { Text("Height Z (mm)") },
                                readOnly = readOnly,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f)
                            )
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            OutlinedTextField(
                                value = weightKg,
                                onValueChange = { weightKg = it },
                                label = { Text("Weight (kg)") },
                                readOnly = readOnly,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = torque,
                                onValueChange = { torque = it },
                                label = { Text("Torque Rating") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f)
                            )
                        }
                        OutlinedTextField(
                            value = material,
                            onValueChange = { material = it },
                            label = { Text("Primary Material Alloy") },
                            readOnly = readOnly,
                            modifier = Modifier.fillMaxWidth()
                        )

                        HorizontalDivider()
                        Text("Electrical Specifications", style = MaterialTheme.typography.titleMedium)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = voltage,
                                onValueChange = { voltage = it },
                                label = { Text("Voltage") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = current,
                                onValueChange = { current = it },
                                label = { Text("Current") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = power,
                                onValueChange = { power = it },
                                label = { Text("Power") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        HorizontalDivider()
                        Text("Thermal Specifications", style = MaterialTheme.typography.titleMedium)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = minTemp,
                                onValueChange = { minTemp = it },
                                label = { Text("Min Temp (°C)") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = maxTemp,
                                onValueChange = { maxTemp = it },
                                label = { Text("Max Temp (°C)") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = heatDiss,
                                onValueChange = { heatDiss = it },
                                label = { Text("Dissipation (W)") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    2 -> {
                        // 3D Model Tab
                        Text("Primary CAD Mesh Format", style = MaterialTheme.typography.titleMedium)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("GLTF", "STEP", "OBJ", "STL").forEach { fmt ->
                                FilterChip(
                                    selected = modelFormat == fmt,
                                    onClick = { if (!readOnly) modelFormat = fmt },
                                    label = { Text(fmt) }
                                )
                            }
                        }

                        Text("Collision Primitive", style = MaterialTheme.typography.titleMedium)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            CollisionShape.entries.forEach { shape ->
                                FilterChip(
                                    selected = collisionShape == shape,
                                    onClick = { if (!readOnly) collisionShape = shape },
                                    label = { Text(shape.label.uppercase()) }
                                )
                            }
                        }
                    }

                    3 -> {
                        // Documentation Tab
                        Text("Attached Datasheets & Schematics", style = MaterialTheme.typography.titleMedium)
                        documents.forEach { doc ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(doc.name, fontWeight = FontWeight.Medium)
                                    Text(
                                        "${doc.type.uppercase()} • ${doc.sizeKb} KB",
                                        style = MaterialTheme.typography.labelMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                if (!readOnly) {
                                    IconButton(onClick = { documents = documents - doc }) {
                                        Icon(Icons.Default.DeleteOutline, contentDescription = "Remove Document")
                                    }
                                }
                            }
                        }
                        if (!readOnly) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedTextField(
                                    value = newDocName,
                                    onValueChange = { newDocName = it },
                                    label = { Text("Add Datasheet / Manual filename") },
                                    modifier = Modifier.weight(1f),
                                    singleLine = true
                                )
                                IconButton(
                                    onClick = {
                                        if (newDocName.isNotBlank()) {
                                            documents = documents + PartDocument(
                                                id = "doc-${UUID.randomUUID().toString().take(5)}",
                                                name = newDocName.trim(),
                                                type = "pdf",
                                                sizeKb = 512
                                            )
                                            newDocName = ""
                                        }
                                    }
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = "Add Document")
                                }
                            }
                        }
                    }

                    4 -> {
                        // Simulation Tab
                        Text("Rigid-Body Physics Parameters", style = MaterialTheme.typography.titleMedium)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = massKg,
                                onValueChange = { massKg = it },
                                label = { Text("Mass (kg)") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = friction,
                                onValueChange = { friction = it },
                                label = { Text("Friction (0-1)") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = restitution,
                                onValueChange = { restitution = it },
                                label = { Text("Restitution") },
                                readOnly = readOnly,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(36.dp))
            }
        }
    }
}
