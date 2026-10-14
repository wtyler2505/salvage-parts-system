package com.example.salvageparts.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.salvageparts.data.model.AnimationTrackItem
import com.example.salvageparts.data.model.Annotation3D
import com.example.salvageparts.data.model.KeyframeItem
import com.example.salvageparts.data.model.Measurement3D
import com.example.salvageparts.data.model.PartCondition
import com.example.salvageparts.data.model.PartStatisticsSummary
import com.example.salvageparts.data.model.SalvagePart
import com.example.salvageparts.data.model.SearchFilterState
import com.example.salvageparts.data.model.SimulationSettingsState
import com.example.salvageparts.data.model.Vec3
import com.example.salvageparts.data.model.ViewerRenderMode
import com.example.salvageparts.data.repository.PartRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID

class SalvageViewModel(private val repository: PartRepository) : ViewModel() {

    private val _filterState = MutableStateFlow(SearchFilterState())
    val filterState: StateFlow<SearchFilterState> = _filterState.asStateFlow()

    private val _selectedPartId = MutableStateFlow<String?>("part-v8-coyote")
    val selectedPartId: StateFlow<String?> = _selectedPartId.asStateFlow()

    private val _isGridView = MutableStateFlow(true)
    val isGridView: StateFlow<Boolean> = _isGridView.asStateFlow()

    // 3D Viewer & CAD Controls
    private val _renderMode = MutableStateFlow(ViewerRenderMode.NORMAL)
    val renderMode: StateFlow<ViewerRenderMode> = _renderMode.asStateFlow()

    private val _showGrid = MutableStateFlow(true)
    val showGrid: StateFlow<Boolean> = _showGrid.asStateFlow()

    private val _showWireframeOverlay = MutableStateFlow(false)
    val showWireframeOverlay: StateFlow<Boolean> = _showWireframeOverlay.asStateFlow()

    private val _explodedView = MutableStateFlow(false)
    val explodedView: StateFlow<Boolean> = _explodedView.asStateFlow()

    private val _explodeFactor = MutableStateFlow(0.8f)
    val explodeFactor: StateFlow<Float> = _explodeFactor.asStateFlow()

    private val _simulationSettings = MutableStateFlow(SimulationSettingsState())
    val simulationSettings: StateFlow<SimulationSettingsState> = _simulationSettings.asStateFlow()

    // Measurements & Annotations
    private val _isMeasuring = MutableStateFlow(false)
    val isMeasuring: StateFlow<Boolean> = _isMeasuring.asStateFlow()

    private val _showMeasurements = MutableStateFlow(true)
    val showMeasurements: StateFlow<Boolean> = _showMeasurements.asStateFlow()

    private val _pendingMeasurePoint = MutableStateFlow<Vec3?>(null)
    val pendingMeasurePoint: StateFlow<Vec3?> = _pendingMeasurePoint.asStateFlow()

    private val _measurements = MutableStateFlow<List<Measurement3D>>(
        listOf(
            Measurement3D(
                id = "meas-1",
                partId = "part-v8-coyote",
                startPoint = Vec3(-180f, 90f, 0f),
                endPoint = Vec3(180f, 90f, 0f),
                distanceMm = 360f,
                label = "Cylinder Bank Bore Span: 360.0 mm"
            ),
            Measurement3D(
                id = "meas-2",
                partId = "part-v8-coyote",
                startPoint = Vec3(0f, -140f, -80f),
                endPoint = Vec3(0f, 140f, -80f),
                distanceMm = 280f,
                label = "Deck Height Clearance: 280.0 mm"
            )
        )
    )
    val measurements: StateFlow<List<Measurement3D>> = _measurements.asStateFlow()

    private val _isAddingAnnotation = MutableStateFlow(false)
    val isAddingAnnotation: StateFlow<Boolean> = _isAddingAnnotation.asStateFlow()

    private val _annotations = MutableStateFlow<List<Annotation3D>>(
        listOf(
            Annotation3D(
                id = "ann-1",
                partId = "part-v8-coyote",
                position = Vec3(85f, 110f, 40f),
                text = "Cylinder #3 deck surface honed — zero micro-cracks detected.",
                author = "Lead Inspector",
                colorHex = 0xFF38BDF8
            ),
            Annotation3D(
                id = "ann-2",
                partId = "part-v8-coyote",
                position = Vec3(-95f, -70f, 20f),
                text = "Main bearing cap #2 torque verified at 65 lb-ft.",
                author = "QA Bench",
                colorHex = 0xFFF59E0B
            )
        )
    )
    val annotations: StateFlow<List<Annotation3D>> = _annotations.asStateFlow()

    // Keyframe Timeline State
    private val _timelinePlaying = MutableStateFlow(false)
    val timelinePlaying: StateFlow<Boolean> = _timelinePlaying.asStateFlow()

    private val _timelineTimeSec = MutableStateFlow(0f)
    val timelineTimeSec: StateFlow<Float> = _timelineTimeSec.asStateFlow()

    private val _timelineTracks = MutableStateFlow<List<AnimationTrackItem>>(
        listOf(
            AnimationTrackItem(
                id = "track-explode",
                name = "Sub-Assembly Explode",
                partId = "part-v8-coyote",
                visible = true,
                muted = false,
                colorHex = 0xFFF59E0B,
                keyframes = listOf(
                    KeyframeItem("kf-1", 0f, "explode", "0.0x"),
                    KeyframeItem("kf-2", 4.5f, "explode", "1.4x"),
                    KeyframeItem("kf-3", 9.0f, "explode", "0.0x")
                )
            ),
            AnimationTrackItem(
                id = "track-turntable",
                name = "Turntable Yaw",
                partId = "part-v8-coyote",
                visible = true,
                muted = false,
                colorHex = 0xFF38BDF8,
                keyframes = listOf(
                    KeyframeItem("kf-4", 0f, "yaw", "0°"),
                    KeyframeItem("kf-5", 5.0f, "yaw", "180°"),
                    KeyframeItem("kf-6", 10.0f, "yaw", "360°")
                )
            )
        )
    )
    val timelineTracks: StateFlow<List<AnimationTrackItem>> = _timelineTracks.asStateFlow()

    // Undo / Redo Snapshot Stack
    private val undoStack = ArrayDeque<List<SalvagePart>>()
    private val redoStack = ArrayDeque<List<SalvagePart>>()
    private val _canUndo = MutableStateFlow(false)
    val canUndo: StateFlow<Boolean> = _canUndo.asStateFlow()
    private val _canRedo = MutableStateFlow(false)
    val canRedo: StateFlow<Boolean> = _canRedo.asStateFlow()

    val allParts: StateFlow<List<SalvagePart>> = repository.allParts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val filteredParts: StateFlow<List<SalvagePart>> = combine(allParts, _filterState) { parts, filter ->
        repository.filterParts(parts, filter)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val selectedPart: StateFlow<SalvagePart?> = combine(allParts, _selectedPartId) { parts, id ->
        parts.firstOrNull { it.id == id } ?: parts.firstOrNull()
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val statistics: StateFlow<PartStatisticsSummary> = combine(allParts, _filterState) { parts, _ ->
        repository.computeStatistics(parts)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), PartStatisticsSummary())

    val availableCategories: StateFlow<List<String>> = combine(allParts, _filterState) { parts, _ ->
        parts.flatMap { it.categories }.distinct().sorted()
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        viewModelScope.launch {
            repository.ensureSampleDataSeeded()
        }
    }

    private fun recordUndoSnapshot() {
        val current = allParts.value
        if (current.isNotEmpty()) {
            undoStack.addLast(current)
            if (undoStack.size > 20) undoStack.removeFirst()
            redoStack.clear()
            _canUndo.value = undoStack.isNotEmpty()
            _canRedo.value = false
        }
    }

    fun undo() {
        val snapshot = undoStack.removeLastOrNull() ?: return
        val current = allParts.value
        redoStack.addLast(current)
        _canUndo.value = undoStack.isNotEmpty()
        _canRedo.value = redoStack.isNotEmpty()
        viewModelScope.launch {
            val currentIds = current.map { it.id }
            repository.deleteParts(currentIds)
            snapshot.forEach { repository.upsertPart(it) }
        }
    }

    fun redo() {
        val snapshot = redoStack.removeLastOrNull() ?: return
        val current = allParts.value
        undoStack.addLast(current)
        _canUndo.value = undoStack.isNotEmpty()
        _canRedo.value = redoStack.isNotEmpty()
        viewModelScope.launch {
            val currentIds = current.map { it.id }
            repository.deleteParts(currentIds)
            snapshot.forEach { repository.upsertPart(it) }
        }
    }

    fun updateSearchQuery(query: String) {
        _filterState.update { it.copy(query = query) }
    }

    fun selectCategoryFilter(category: String?) {
        _filterState.update {
            it.copy(selectedCategory = if (it.selectedCategory == category) null else category)
        }
    }

    fun toggleConditionFilter(condition: PartCondition) {
        _filterState.update { state ->
            val next = state.selectedConditions.toMutableSet()
            if (!next.add(condition)) next.remove(condition)
            state.copy(selectedConditions = next)
        }
    }

    fun toggleOnlyFavorites() {
        _filterState.update { it.copy(onlyFavorites = !it.onlyFavorites) }
    }

    fun clearFilters() {
        _filterState.value = SearchFilterState()
    }

    fun toggleGridViewMode() {
        _isGridView.update { !it }
    }

    fun selectPart(partId: String) {
        _selectedPartId.value = partId
    }

    fun savePart(part: SalvagePart) {
        recordUndoSnapshot()
        viewModelScope.launch {
            repository.upsertPart(part)
            _selectedPartId.value = part.id
        }
    }

    fun toggleFavorite(part: SalvagePart) {
        viewModelScope.launch {
            repository.upsertPart(part.copy(isFavorite = !part.isFavorite))
        }
    }

    fun duplicatePart(part: SalvagePart) {
        recordUndoSnapshot()
        viewModelScope.launch {
            val copy = repository.duplicatePart(part)
            _selectedPartId.value = copy.id
        }
    }

    fun deletePart(partId: String) {
        recordUndoSnapshot()
        viewModelScope.launch {
            repository.deletePart(partId)
        }
    }

    // 3D Viewer Actions
    fun setRenderMode(mode: ViewerRenderMode) {
        _renderMode.value = mode
        _showWireframeOverlay.value = (mode == ViewerRenderMode.WIREFRAME)
        _explodedView.value = (mode == ViewerRenderMode.EXPLODED)
    }

    fun toggleGrid() {
        _showGrid.update { !it }
    }

    fun toggleWireframeOverlay() {
        _showWireframeOverlay.update { !it }
    }

    fun setExplodedView(enabled: Boolean, factor: Float = _explodeFactor.value) {
        _explodedView.value = enabled
        _explodeFactor.value = factor.coerceIn(0f, 2f)
        if (enabled && _renderMode.value != ViewerRenderMode.EXPLODED) {
            _renderMode.value = ViewerRenderMode.EXPLODED
        } else if (!enabled && _renderMode.value == ViewerRenderMode.EXPLODED) {
            _renderMode.value = ViewerRenderMode.NORMAL
        }
    }

    fun updateSimulationSettings(transform: (SimulationSettingsState) -> SimulationSettingsState) {
        _simulationSettings.update(transform)
    }

    fun toggleMeasurementMode() {
        _isMeasuring.update { !it }
        _pendingMeasurePoint.value = null
        if (_isMeasuring.value) {
            _isAddingAnnotation.value = false
        }
    }

    fun toggleShowMeasurements() {
        _showMeasurements.update { !it }
    }

    fun recordViewportPoint(point: Vec3, customAnnotationText: String? = null) {
        val currentPartId = selectedPart.value?.id ?: "part-v8-coyote"
        if (_isAddingAnnotation.value) {
            val newAnn = Annotation3D(
                id = "ann-${UUID.randomUUID().toString().take(6)}",
                partId = currentPartId,
                position = point,
                text = customAnnotationText?.takeIf { it.isNotBlank() }
                    ?: "Surface inspection pin at (${point.x.toInt()}, ${point.y.toInt()}, ${point.z.toInt()}) mm",
                author = "Inspector"
            )
            _annotations.update { listOf(newAnn) + it }
            _isAddingAnnotation.value = false
        } else if (_isMeasuring.value) {
            val first = _pendingMeasurePoint.value
            if (first == null) {
                _pendingMeasurePoint.value = point
            } else {
                val dist = first.distanceTo(point)
                val meas = Measurement3D(
                    id = "meas-${UUID.randomUUID().toString().take(6)}",
                    partId = currentPartId,
                    startPoint = first,
                    endPoint = point,
                    distanceMm = dist,
                    label = "Span: ${"%.1f".format(dist)} mm"
                )
                _measurements.update { listOf(meas) + it }
                _pendingMeasurePoint.value = null
                _showMeasurements.value = true
            }
        }
    }

    fun clearMeasurements() {
        _measurements.value = emptyList()
        _pendingMeasurePoint.value = null
    }

    fun toggleAnnotationMode() {
        _isAddingAnnotation.update { !it }
        if (_isAddingAnnotation.value) {
            _isMeasuring.value = false
            _pendingMeasurePoint.value = null
        }
    }

    fun addAnnotationText(text: String, author: String = "Inspector") {
        if (text.isBlank()) return
        val currentPartId = selectedPart.value?.id ?: "part-v8-coyote"
        val newAnn = Annotation3D(
            id = "ann-${UUID.randomUUID().toString().take(6)}",
            partId = currentPartId,
            position = Vec3(
                x = (-100..100).random().toFloat(),
                y = (-80..80).random().toFloat(),
                z = (-40..40).random().toFloat()
            ),
            text = text.trim(),
            author = author.ifBlank { "Inspector" }
        )
        _annotations.update { listOf(newAnn) + it }
    }

    fun updateAnnotation(id: String, newText: String) {
        _annotations.update { list ->
            list.map { if (it.id == id) it.copy(text = newText) else it }
        }
    }

    fun deleteAnnotation(id: String) {
        _annotations.update { list -> list.filterNot { it.id == id } }
    }

    // Timeline Controls
    fun setTimelinePlaying(playing: Boolean) {
        _timelinePlaying.value = playing
    }

    fun setTimelineTime(seconds: Float) {
        val clamped = seconds.coerceIn(0f, 10f)
        _timelineTimeSec.value = clamped
        // Drive explode factor smoothly if exploded view or timeline is scrubbed
        val normalized = if (clamped <= 5f) (clamped / 5f) * 1.4f else ((10f - clamped) / 5f) * 1.4f
        if (_timelinePlaying.value || _explodedView.value) {
            _explodeFactor.value = normalized.coerceIn(0f, 2f)
        }
    }

    fun addTimelineTrack(name: String) {
        val partId = selectedPart.value?.id ?: "part-v8-coyote"
        val track = AnimationTrackItem(
            id = "track-${UUID.randomUUID().toString().take(6)}",
            name = name.ifBlank { "Track ${_timelineTracks.value.size + 1}" },
            partId = partId,
            keyframes = listOf(
                KeyframeItem("kf-${UUID.randomUUID().toString().take(4)}", 0f, "transform", "Start"),
                KeyframeItem("kf-${UUID.randomUUID().toString().take(4)}", 5f, "transform", "Peak"),
                KeyframeItem("kf-${UUID.randomUUID().toString().take(4)}", 10f, "transform", "End")
            )
        )
        _timelineTracks.update { it + track }
    }

    fun toggleTrackVisibility(trackId: String) {
        _timelineTracks.update { list ->
            list.map { if (it.id == trackId) it.copy(visible = !it.visible) else it }
        }
    }

    class Factory(private val repository: PartRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return SalvageViewModel(repository) as T
        }
    }
}
