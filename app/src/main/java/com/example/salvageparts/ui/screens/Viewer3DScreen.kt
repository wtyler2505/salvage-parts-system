package com.example.salvageparts.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddComment
import androidx.compose.material.icons.filled.CenterFocusStrong
import androidx.compose.material.icons.filled.GridOn
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.OpenInFull
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Replay
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Straighten
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.salvageparts.data.model.Vec3
import com.example.salvageparts.data.model.ViewerRenderMode
import com.example.salvageparts.ui.theme.IndustrialAmber500
import com.example.salvageparts.ui.theme.PrecisionCyan400
import com.example.salvageparts.ui.theme.SlateNavy900
import com.example.salvageparts.ui.theme.SlateNavy950
import com.example.salvageparts.ui.viewmodel.SalvageViewModel
import kotlinx.coroutines.delay
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun Viewer3DScreen(
    viewModel: SalvageViewModel,
    onOpenInspector: () -> Unit
) {
    val selectedPart by viewModel.selectedPart.collectAsStateWithLifecycle()
    val renderMode by viewModel.renderMode.collectAsStateWithLifecycle()
    val showGrid by viewModel.showGrid.collectAsStateWithLifecycle()
    val explodedView by viewModel.explodedView.collectAsStateWithLifecycle()
    val explodeFactor by viewModel.explodeFactor.collectAsStateWithLifecycle()
    val simSettings by viewModel.simulationSettings.collectAsStateWithLifecycle()
    val isMeasuring by viewModel.isMeasuring.collectAsStateWithLifecycle()
    val showMeasurements by viewModel.showMeasurements.collectAsStateWithLifecycle()
    val measurements by viewModel.measurements.collectAsStateWithLifecycle()
    val isAddingAnnotation by viewModel.isAddingAnnotation.collectAsStateWithLifecycle()
    val annotations by viewModel.annotations.collectAsStateWithLifecycle()
    val timelinePlaying by viewModel.timelinePlaying.collectAsStateWithLifecycle()
    val timelineTime by viewModel.timelineTimeSec.collectAsStateWithLifecycle()

    var cameraYawDeg by remember { mutableFloatStateOf(38f) }
    var cameraPitchDeg by remember { mutableFloatStateOf(24f) }
    var cameraZoom by remember { mutableFloatStateOf(1.0f) }
    var physicsBounceOffset by remember { mutableFloatStateOf(0f) }
    var simTick by remember { mutableFloatStateOf(0f) }

    // Continuous animation loop for timeline playback & physics/electrical/thermal simulation
    LaunchedEffect(timelinePlaying, simSettings.physicsEnabled, simSettings.electricalEnabled, simSettings.thermalEnabled) {
        while (timelinePlaying || simSettings.physicsEnabled || simSettings.electricalEnabled || simSettings.thermalEnabled) {
            delay(32L)
            simTick += 0.08f
            if (timelinePlaying) {
                val nextTime = (timelineTime + 0.05f) % 10f
                viewModel.setTimelineTime(nextTime)
                cameraYawDeg = (cameraYawDeg + 1.2f) % 360f
            }
            if (simSettings.physicsEnabled) {
                val restitution = selectedPart?.physicsSim?.restitution ?: 0.25f
                physicsBounceOffset = kotlin.math.abs(sin(simTick * 2.2f)) * 38f * (0.4f + restitution)
            } else {
                physicsBounceOffset = 0f
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        // Top Viewport Control Bar
        Surface(
            tonalElevation = 2.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                ViewerRenderMode.entries.forEach { mode ->
                    FilterChip(
                        selected = renderMode == mode,
                        onClick = { viewModel.setRenderMode(mode) },
                        label = { Text(mode.title) },
                        modifier = Modifier.testTag("viewer_mode_${mode.id}")
                    )
                }

                FilterChip(
                    selected = showGrid,
                    onClick = viewModel::toggleGrid,
                    label = { Text("Grid") },
                    leadingIcon = { Icon(Icons.Default.GridOn, contentDescription = null, modifier = Modifier.size(16.dp)) },
                    modifier = Modifier.testTag("toggle_grid_chip")
                )

                FilterChip(
                    selected = isMeasuring,
                    onClick = viewModel::toggleMeasurementMode,
                    label = { Text("Measure") },
                    leadingIcon = { Icon(Icons.Default.Straighten, contentDescription = null, modifier = Modifier.size(16.dp)) },
                    modifier = Modifier.testTag("toggle_measure_chip")
                )

                FilterChip(
                    selected = isAddingAnnotation,
                    onClick = viewModel::toggleAnnotationMode,
                    label = { Text("Annotate") },
                    leadingIcon = { Icon(Icons.Default.AddComment, contentDescription = null, modifier = Modifier.size(16.dp)) },
                    modifier = Modifier.testTag("toggle_annotate_chip")
                )

                FilterChip(
                    selected = simSettings.physicsEnabled,
                    onClick = {
                        viewModel.updateSimulationSettings { it.copy(physicsEnabled = !it.physicsEnabled) }
                    },
                    label = { Text("Physics") },
                    leadingIcon = { Icon(Icons.Default.Science, contentDescription = null, modifier = Modifier.size(16.dp)) },
                    modifier = Modifier.testTag("toggle_physics_chip")
                )

                FilterChip(
                    selected = simSettings.electricalEnabled,
                    onClick = {
                        viewModel.updateSimulationSettings { it.copy(electricalEnabled = !it.electricalEnabled) }
                    },
                    label = { Text("Electrical") },
                    leadingIcon = { Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(16.dp)) }
                )

                FilterChip(
                    selected = simSettings.thermalEnabled,
                    onClick = {
                        viewModel.updateSimulationSettings { it.copy(thermalEnabled = !it.thermalEnabled) }
                    },
                    label = { Text("Thermal") },
                    leadingIcon = { Icon(Icons.Default.Thermostat, contentDescription = null, modifier = Modifier.size(16.dp)) }
                )

                AssistChip(
                    onClick = {
                        cameraYawDeg = 38f
                        cameraPitchDeg = 24f
                        cameraZoom = 1.0f
                    },
                    label = { Text("Reset Cam") },
                    leadingIcon = { Icon(Icons.Default.CenterFocusStrong, contentDescription = null, modifier = Modifier.size(16.dp)) }
                )
            }
        }

        // 3D Interactive Viewport Box
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .background(
                    Brush.radialGradient(
                        colors = listOf(SlateNavy900, SlateNavy950)
                    )
                )
        ) {
            Canvas(
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("cad_viewport_canvas")
                    .pointerInput(Unit) {
                        detectDragGestures { change, dragAmount ->
                            change.consume()
                            cameraYawDeg = (cameraYawDeg + dragAmount.x * 0.45f) % 360f
                            cameraPitchDeg = (cameraPitchDeg + dragAmount.y * 0.35f).coerceIn(-65f, 65f)
                        }
                    }
                    .pointerInput(isMeasuring, isAddingAnnotation) {
                        detectTapGestures { tapOffset ->
                            if (isMeasuring || isAddingAnnotation) {
                                val relX = ((tapOffset.x / size.width.coerceAtLeast(1f)) - 0.5f) * 400f
                                val relY = (0.5f - (tapOffset.y / size.height.coerceAtLeast(1f))) * 300f
                                viewModel.recordViewportPoint(Vec3(relX, relY, 25f))
                            }
                        }
                    }
            ) {
                val cx = size.width / 2f
                val cy = size.height / 2f
                val scale = (minOf(size.width, size.height) / 520f) * cameraZoom

                val yawRad = Math.toRadians(cameraYawDeg.toDouble()).toFloat()
                val pitchRad = Math.toRadians(cameraPitchDeg.toDouble()).toFloat()

                fun project3D(x: Float, y: Float, z: Float): Offset {
                    // Rotate around Y (yaw)
                    val rx = x * cos(yawRad) - z * sin(yawRad)
                    val rz = x * sin(yawRad) + z * cos(yawRad)
                    // Rotate around X (pitch)
                    val ry = y * cos(pitchRad) - rz * sin(pitchRad)
                    return Offset(
                        x = cx + rx * scale,
                        y = cy - (ry + physicsBounceOffset) * scale
                    )
                }

                // 1. Infinite Perspective CAD Floor Grid
                if (showGrid) {
                    val gridExtent = 260f
                    val step = 40f
                    var g = -gridExtent
                    while (g <= gridExtent) {
                        val p1 = project3D(g, -110f, -gridExtent)
                        val p2 = project3D(g, -110f, gridExtent)
                        val p3 = project3D(-gridExtent, -110f, g)
                        val p4 = project3D(gridExtent, -110f, g)
                        val isAxis = kotlin.math.abs(g) < 1f
                        drawLine(
                            color = if (isAxis) PrecisionCyan400.copy(alpha = 0.45f) else Color.White.copy(alpha = 0.10f),
                            start = p1,
                            end = p2,
                            strokeWidth = if (isAxis) 2.2f else 1f
                        )
                        drawLine(
                            color = if (isAxis) IndustrialAmber500.copy(alpha = 0.45f) else Color.White.copy(alpha = 0.10f),
                            start = p3,
                            end = p4,
                            strokeWidth = if (isAxis) 2.2f else 1f
                        )
                        g += step
                    }
                }

                // 2. Render 3D Sub-Assembly Cuboids for the active Salvage Part
                val explodeSpread = if (explodedView || renderMode == ViewerRenderMode.EXPLODED) {
                    explodeFactor * 55f
                } else {
                    0f
                }

                val baseColor = when {
                    simSettings.thermalEnabled -> Color(0xFFEF4444)
                    simSettings.electricalEnabled -> Color(0xFF38BDF8)
                    renderMode == ViewerRenderMode.XRAY -> PrecisionCyan400.copy(alpha = 0.35f)
                    else -> PrecisionCyan400
                }

                val subAssemblies = listOf(
                    // Main Block Core
                    Triple(Vec3(0f, 0f, 0f), Vec3(110f, 70f, 75f), baseColor),
                    // Left Cylinder Head / Sub-unit
                    Triple(Vec3(-75f - explodeSpread, 55f + explodeSpread * 0.6f, 0f), Vec3(45f, 35f, 68f), IndustrialAmber500),
                    // Right Cylinder Head / Sub-unit
                    Triple(Vec3(75f + explodeSpread, 55f + explodeSpread * 0.6f, 0f), Vec3(45f, 35f, 68f), IndustrialAmber500),
                    // Upper Intake / Controller Manifold
                    Triple(Vec3(0f, 88f + explodeSpread * 1.1f, 0f), Vec3(68f, 24f, 55f), Color(0xFF10B981)),
                    // Lower Sump / Base Assembly
                    Triple(Vec3(0f, -78f - explodeSpread * 0.8f, 0f), Vec3(90f, 20f, 65f), Color(0xFF94A3B8))
                )

                subAssemblies.forEach { (center, halfExtents, accentColor) ->
                    val hx = halfExtents.x
                    val hy = halfExtents.y
                    val hz = halfExtents.z
                    val vertices = listOf(
                        project3D(center.x - hx, center.y - hy, center.z - hz),
                        project3D(center.x + hx, center.y - hy, center.z - hz),
                        project3D(center.x + hx, center.y + hy, center.z - hz),
                        project3D(center.x - hx, center.y + hy, center.z - hz),
                        project3D(center.x - hx, center.y - hy, center.z + hz),
                        project3D(center.x + hx, center.y - hy, center.z + hz),
                        project3D(center.x + hx, center.y + hy, center.z + hz),
                        project3D(center.x - hx, center.y + hy, center.z + hz)
                    )

                    if (renderMode != ViewerRenderMode.WIREFRAME) {
                        val topFace = Path().apply {
                            moveTo(vertices[3].x, vertices[3].y)
                            lineTo(vertices[2].x, vertices[2].y)
                            lineTo(vertices[6].x, vertices[6].y)
                            lineTo(vertices[7].x, vertices[7].y)
                            close()
                        }
                        val frontFace = Path().apply {
                            moveTo(vertices[4].x, vertices[4].y)
                            lineTo(vertices[5].x, vertices[5].y)
                            lineTo(vertices[6].x, vertices[6].y)
                            lineTo(vertices[7].x, vertices[7].y)
                            close()
                        }
                        val fillAlpha = if (renderMode == ViewerRenderMode.XRAY) 0.16f else 0.34f
                        drawPath(topFace, color = accentColor.copy(alpha = fillAlpha + 0.08f))
                        drawPath(frontFace, color = accentColor.copy(alpha = fillAlpha))
                    }

                    val edges = listOf(
                        0 to 1, 1 to 2, 2 to 3, 3 to 0,
                        4 to 5, 5 to 6, 6 to 7, 7 to 4,
                        0 to 4, 1 to 5, 2 to 6, 3 to 7
                    )
                    edges.forEach { (i, j) ->
                        drawLine(
                            color = accentColor,
                            start = vertices[i],
                            end = vertices[j],
                            strokeWidth = if (renderMode == ViewerRenderMode.WIREFRAME) 2.6f else 1.8f
                        )
                    }
                }

                // 3. Electrical Current Pulse Particles if Electrical Simulation is active
                if (simSettings.electricalEnabled) {
                    for (idx in 0..7) {
                        val phase = ((simTick + idx * 0.4f) % 2f) - 1f
                        val p = project3D(phase * 130f, 30f * sin(phase * 3f), 0f)
                        drawCircle(
                            color = Color(0xFF38BDF8),
                            radius = 6f,
                            center = p
                        )
                    }
                }

                // 4. 3D Measurements Lines & Endpoints
                if (showMeasurements) {
                    measurements.forEach { m ->
                        val s = project3D(m.startPoint.x, m.startPoint.y, m.startPoint.z)
                        val e = project3D(m.endPoint.x, m.endPoint.y, m.endPoint.z)
                        drawLine(
                            color = Color(0xFF10B981),
                            start = s,
                            end = e,
                            strokeWidth = 3f,
                            pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f), 0f)
                        )
                        drawCircle(color = Color(0xFF10B981), radius = 6f, center = s)
                        drawCircle(color = Color(0xFF10B981), radius = 6f, center = e)
                    }
                }

                // 5. 3D Annotation Markers
                annotations.forEach { ann ->
                    val pt = project3D(ann.position.x, ann.position.y, ann.position.z)
                    drawCircle(
                        color = Color(ann.colorHex),
                        radius = 9f,
                        center = pt
                    )
                    drawCircle(
                        color = Color.White,
                        radius = 9f,
                        center = pt,
                        style = Stroke(width = 2f)
                    )
                }
            }

            // Top-Left Active Part & Telemetry HUD Overlay
            Card(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = SlateNavy900.copy(alpha = 0.86f)
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(Color(0xFF10B981), CircleShape)
                        )
                        Text(
                            text = selectedPart?.name ?: "Engine Block V8",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = "${selectedPart?.manufacturer ?: "Ford"} • ${selectedPart?.model ?: "Coyote"} • ${renderMode.title}",
                        style = MaterialTheme.typography.labelMedium,
                        color = Color(0xFF94A3B8)
                    )
                    if (isMeasuring) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "MEASURE MODE: Tap 2 points on the 3D assembly",
                            style = MaterialTheme.typography.labelMedium,
                            color = Color(0xFF10B981)
                        )
                    }
                    if (isAddingAnnotation) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "ANNOTATION MODE: Tap model to drop inspection pin",
                            style = MaterialTheme.typography.labelMedium,
                            color = PrecisionCyan400
                        )
                    }
                }
            }

            // Top-Right Quick Inspector Button & Zoom Controls
            Column(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                horizontalAlignment = Alignment.End
            ) {
                Surface(
                    onClick = onOpenInspector,
                    shape = RoundedCornerShape(10.dp),
                    color = SlateNavy900.copy(alpha = 0.88f),
                    modifier = Modifier.testTag("open_inspector_button")
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Tune,
                            contentDescription = "Inspector",
                            tint = PrecisionCyan400,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Properties (${annotations.size} Pins • ${measurements.size} Spans)",
                            style = MaterialTheme.typography.labelMedium,
                            color = Color.White
                        )
                    }
                }
            }

            // Bottom-Left Explode Factor Slider Overlay
            Card(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(12.dp)
                    .width(260.dp),
                colors = CardDefaults.cardColors(
                    containerColor = SlateNavy900.copy(alpha = 0.88f)
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.OpenInFull,
                                contentDescription = null,
                                tint = IndustrialAmber500,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "Explode Assembly",
                                style = MaterialTheme.typography.labelMedium,
                                color = Color.White
                            )
                        }
                        Text(
                            text = "${"%.1f".format(explodeFactor)}x",
                            style = MaterialTheme.typography.labelMedium,
                            color = IndustrialAmber500
                        )
                    }
                    Slider(
                        value = explodeFactor,
                        onValueChange = { viewModel.setExplodedView(it > 0.05f, it) },
                        valueRange = 0f..2f,
                        modifier = Modifier.testTag("explode_slider")
                    )
                }
            }
        }

        // Bottom Keyframe Animation Timeline Bar
        Surface(
            tonalElevation = 4.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    IconButton(
                        onClick = { viewModel.setTimelinePlaying(!timelinePlaying) },
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("timeline_play_pause_button")
                    ) {
                        Icon(
                            imageVector = if (timelinePlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = if (timelinePlaying) "Pause Timeline" else "Play Timeline",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }

                    IconButton(
                        onClick = {
                            viewModel.setTimelinePlaying(false)
                            viewModel.setTimelineTime(0f)
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Replay,
                            contentDescription = "Reset Timeline"
                        )
                    }

                    Slider(
                        value = timelineTime,
                        onValueChange = { viewModel.setTimelineTime(it) },
                        valueRange = 0f..10f,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("timeline_scrubber")
                    )

                    Text(
                        text = "${"%.1f".format(timelineTime)}s / 10.0s",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
