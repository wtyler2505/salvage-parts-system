package com.example.salvageparts.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Straighten
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.salvageparts.data.model.SalvagePart
import com.example.salvageparts.ui.viewmodel.SalvageViewModel

@Composable
fun InspectorScreen(
    viewModel: SalvageViewModel,
    onEditFullPart: (SalvagePart) -> Unit
) {
    val selectedPart by viewModel.selectedPart.collectAsStateWithLifecycle()
    val simSettings by viewModel.simulationSettings.collectAsStateWithLifecycle()
    val annotations by viewModel.annotations.collectAsStateWithLifecycle()
    val measurements by viewModel.measurements.collectAsStateWithLifecycle()

    var newAnnotationText by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .testTag("inspector_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Selected Part Property Card
        selectedPart?.let { part ->
            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = part.name,
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${part.manufacturer} • ${part.model}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Button(
                            onClick = { onEditFullPart(part) },
                            modifier = Modifier.testTag("inspector_edit_part_button")
                        ) {
                            Icon(Icons.Default.Edit, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Edit")
                        }
                    }

                    HorizontalDivider()

                    PropertyRow("Condition", part.condition.label.uppercase())
                    PropertyRow("Location", part.location)
                    PropertyRow("Dimensions", "${part.mechanicalSpec.dimensions.x.toInt()} × ${part.mechanicalSpec.dimensions.y.toInt()} × ${part.mechanicalSpec.dimensions.z.toInt()} mm")
                    PropertyRow("Weight / Mass", "${part.mechanicalSpec.weightKg} kg")
                    PropertyRow("Material", part.mechanicalSpec.material)
                    PropertyRow("Collision Shape", part.physicsSim.collisionShape.label.uppercase())
                    PropertyRow("Friction / Restitution", "${part.physicsSim.friction} / ${part.physicsSim.restitution}")

                    if (part.customSpecs.isNotEmpty()) {
                        HorizontalDivider()
                        Text(
                            text = "Custom OEM Specifications",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        part.customSpecs.forEach { (k, v) ->
                            PropertyRow(k, v)
                        }
                    }
                }
            }
        }

        // Simulation Controls Panel
        ElevatedCard(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Multi-Physics Simulation Engine",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                SimToggleRow(
                    label = "Rigid-Body Gravity & Collisions",
                    checked = simSettings.physicsEnabled,
                    onCheckedChange = { enabled ->
                        viewModel.updateSimulationSettings { it.copy(physicsEnabled = enabled) }
                    }
                )
                SimToggleRow(
                    label = "Electrical Current Flow Analysis",
                    checked = simSettings.electricalEnabled,
                    onCheckedChange = { enabled ->
                        viewModel.updateSimulationSettings { it.copy(electricalEnabled = enabled) }
                    }
                )
                SimToggleRow(
                    label = "Thermal Dissipation Heatmap",
                    checked = simSettings.thermalEnabled,
                    onCheckedChange = { enabled ->
                        viewModel.updateSimulationSettings { it.copy(thermalEnabled = enabled) }
                    }
                )
            }
        }

        // 3D Annotations Panel
        ElevatedCard(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "3D Inspection Annotations (${annotations.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = newAnnotationText,
                        onValueChange = { newAnnotationText = it },
                        placeholder = { Text("Add inspection note…") },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("new_annotation_input"),
                        singleLine = true
                    )
                    IconButton(
                        onClick = {
                            if (newAnnotationText.isNotBlank()) {
                                viewModel.addAnnotationText(newAnnotationText)
                                newAnnotationText = ""
                            }
                        },
                        modifier = Modifier.testTag("add_annotation_button")
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Add Annotation")
                    }
                }

                annotations.forEach { ann ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = ann.text,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium
                                )
                                Text(
                                    text = "${ann.author} • Pin (${ann.position.x.toInt()}, ${ann.position.y.toInt()}, ${ann.position.z.toInt()})",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            IconButton(onClick = { viewModel.deleteAnnotation(ann.id) }) {
                                Icon(
                                    imageVector = Icons.Default.DeleteOutline,
                                    contentDescription = "Delete Annotation",
                                    tint = MaterialTheme.colorScheme.error
                                )
                            }
                        }
                    }
                }
            }
        }

        // 3D Measurements Panel
        ElevatedCard(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Point-to-Point Measurements (${measurements.size})",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    if (measurements.isNotEmpty()) {
                        OutlinedButton(onClick = viewModel::clearMeasurements) {
                            Text("Clear")
                        }
                    }
                }

                measurements.forEach { m ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Straighten,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Text(text = m.label, style = MaterialTheme.typography.bodyMedium)
                        }
                        Text(
                            text = "${"%.1f".format(m.distanceMm)} mm",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun PropertyRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
private fun SimToggleRow(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f)
        )
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}
