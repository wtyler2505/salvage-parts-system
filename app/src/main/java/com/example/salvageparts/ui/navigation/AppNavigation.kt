package com.example.salvageparts.ui.navigation

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Redo
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.ViewInAr
import androidx.compose.material.icons.outlined.Analytics
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material.icons.outlined.ViewInAr
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.salvageparts.R
import com.example.salvageparts.data.model.SalvagePart
import com.example.salvageparts.ui.screens.EditorMode
import com.example.salvageparts.ui.screens.InspectorScreen
import com.example.salvageparts.ui.screens.PartEditorSheet
import com.example.salvageparts.ui.screens.PartsInventoryScreen
import com.example.salvageparts.ui.screens.StatisticsScreen
import com.example.salvageparts.ui.screens.Viewer3DScreen
import com.example.salvageparts.ui.viewmodel.SalvageViewModel
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

@Serializable
enum class AppDestination(
    val route: String,
    val labelRes: Int,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val tag: String
) {
    PARTS(
        route = "parts_inventory",
        labelRes = R.string.nav_parts_manager,
        selectedIcon = Icons.Filled.Inventory2,
        unselectedIcon = Icons.Outlined.Inventory2,
        tag = "nav_parts_tab"
    ),
    VIEWER_3D(
        route = "viewer_3d",
        labelRes = R.string.nav_viewer_3d,
        selectedIcon = Icons.Filled.ViewInAr,
        unselectedIcon = Icons.Outlined.ViewInAr,
        tag = "nav_viewer_tab"
    ),
    STATISTICS(
        route = "statistics",
        labelRes = R.string.nav_statistics,
        selectedIcon = Icons.Filled.Analytics,
        unselectedIcon = Icons.Outlined.Analytics,
        tag = "nav_statistics_tab"
    ),
    INSPECTOR(
        route = "inspector",
        labelRes = R.string.nav_inspector,
        selectedIcon = Icons.Filled.Tune,
        unselectedIcon = Icons.Outlined.Tune,
        tag = "nav_inspector_tab"
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SalvagePartsApp(viewModel: SalvageViewModel) {
    var currentDestination by rememberSaveable { mutableStateOf(AppDestination.PARTS) }
    var editorPart by remember { mutableStateOf<SalvagePart?>(null) }
    var editorMode by remember { mutableStateOf<EditorMode?>(null) }

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    val allParts by viewModel.allParts.collectAsStateWithLifecycle()
    val selectedPart by viewModel.selectedPart.collectAsStateWithLifecycle()
    val canUndo by viewModel.canUndo.collectAsStateWithLifecycle()
    val canRedo by viewModel.canRedo.collectAsStateWithLifecycle()

    if (currentDestination != AppDestination.PARTS) {
        BackHandler {
            currentDestination = AppDestination.PARTS
        }
    }

    BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
        val isExpanded = maxWidth >= 840.dp
        val isMedium = maxWidth >= 600.dp

        Scaffold(
            modifier = Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.safeDrawing),
            snackbarHost = { SnackbarHost(snackbarHostState) },
            topBar = {
                TopAppBar(
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface,
                        titleContentColor = MaterialTheme.colorScheme.onSurface
                    ),
                    title = {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(MaterialTheme.colorScheme.primaryContainer),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Build,
                                    contentDescription = stringResource(R.string.app_name),
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = stringResource(R.string.app_name),
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = selectedPart?.let { "${it.manufacturer} • ${it.name}" }
                                        ?: stringResource(R.string.header_subtitle),
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    },
                    actions = {
                        IconButton(
                            onClick = {
                                viewModel.undo()
                                scope.launch { snackbarHostState.showSnackbar("Undid last inventory change") }
                            },
                            enabled = canUndo,
                            modifier = Modifier.testTag("undo_button")
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Undo,
                                contentDescription = stringResource(R.string.action_undo)
                            )
                        }
                        IconButton(
                            onClick = {
                                viewModel.redo()
                                scope.launch { snackbarHostState.showSnackbar("Redid inventory change") }
                            },
                            enabled = canRedo,
                            modifier = Modifier.testTag("redo_button")
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Redo,
                                contentDescription = stringResource(R.string.action_redo)
                            )
                        }
                        FilledTonalIconButton(
                            onClick = {
                                editorPart = null
                                editorMode = EditorMode.CREATE
                            },
                            modifier = Modifier
                                .padding(end = 8.dp)
                                .testTag("top_add_part_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = stringResource(R.string.action_add_part)
                            )
                        }
                    }
                )
            },
            bottomBar = {
                if (!isMedium) {
                    NavigationBar(
                        modifier = Modifier
                            .windowInsetsPadding(WindowInsets.navigationBars)
                            .testTag("bottom_navigation_bar")
                    ) {
                        AppDestination.entries.forEach { dest ->
                            val selected = currentDestination == dest
                            NavigationBarItem(
                                selected = selected,
                                onClick = { currentDestination = dest },
                                modifier = Modifier.testTag(dest.tag),
                                icon = {
                                    BadgedBox(
                                        badge = {
                                            if (dest == AppDestination.PARTS && allParts.isNotEmpty()) {
                                                Badge { Text(allParts.size.toString()) }
                                            }
                                        }
                                    ) {
                                        Icon(
                                            imageVector = if (selected) dest.selectedIcon else dest.unselectedIcon,
                                            contentDescription = stringResource(dest.labelRes)
                                        )
                                    }
                                },
                                label = {
                                    Text(
                                        text = stringResource(dest.labelRes),
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            )
                        }
                    }
                }
            }
        ) { innerPadding ->
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                if (isMedium) {
                    NavigationRail(
                        modifier = Modifier
                            .fillMaxHeight()
                            .testTag("side_navigation_rail")
                    ) {
                        Spacer(modifier = Modifier.height(12.dp))
                        AppDestination.entries.forEach { dest ->
                            val selected = currentDestination == dest
                            NavigationRailItem(
                                selected = selected,
                                onClick = { currentDestination = dest },
                                modifier = Modifier.testTag(dest.tag),
                                icon = {
                                    Icon(
                                        imageVector = if (selected) dest.selectedIcon else dest.unselectedIcon,
                                        contentDescription = stringResource(dest.labelRes)
                                    )
                                },
                                label = { Text(stringResource(dest.labelRes)) }
                            )
                        }
                    }
                }

                // Main Content Area
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                ) {
                    when (currentDestination) {
                        AppDestination.PARTS -> {
                            PartsInventoryScreen(
                                viewModel = viewModel,
                                onAddPart = {
                                    editorPart = null
                                    editorMode = EditorMode.CREATE
                                },
                                onEditPart = { part ->
                                    editorPart = part
                                    editorMode = EditorMode.EDIT
                                },
                                onViewPartDetails = { part ->
                                    editorPart = part
                                    editorMode = EditorMode.VIEW
                                },
                                onOpenIn3DViewer = { part ->
                                    viewModel.selectPart(part.id)
                                    currentDestination = AppDestination.VIEWER_3D
                                }
                            )
                        }
                        AppDestination.VIEWER_3D -> {
                            Viewer3DScreen(
                                viewModel = viewModel,
                                onOpenInspector = {
                                    currentDestination = AppDestination.INSPECTOR
                                }
                            )
                        }
                        AppDestination.STATISTICS -> {
                            StatisticsScreen(viewModel = viewModel)
                        }
                        AppDestination.INSPECTOR -> {
                            InspectorScreen(
                                viewModel = viewModel,
                                onEditFullPart = { part ->
                                    editorPart = part
                                    editorMode = EditorMode.EDIT
                                }
                            )
                        }
                    }
                }

                // Supporting Inspector Pane on Expanded Screens (Tablets / Foldables)
                if (isExpanded && currentDestination != AppDestination.INSPECTOR) {
                    Surface(
                        modifier = Modifier
                            .width(340.dp)
                            .fillMaxHeight(),
                        tonalElevation = 2.dp
                    ) {
                        InspectorScreen(
                            viewModel = viewModel,
                            onEditFullPart = { part ->
                                editorPart = part
                                editorMode = EditorMode.EDIT
                            }
                        )
                    }
                }
            }
        }

        // Full Part Editor / Viewer Modal Sheet
        editorMode?.let { mode ->
            PartEditorSheet(
                part = editorPart,
                mode = mode,
                onDismiss = { editorMode = null },
                onSave = { savedPart ->
                    viewModel.savePart(savedPart)
                    editorMode = null
                    scope.launch {
                        snackbarHostState.showSnackbar("Saved '${savedPart.name}'")
                    }
                },
                onDuplicate = { partToCopy ->
                    viewModel.duplicatePart(partToCopy)
                    editorMode = null
                    scope.launch {
                        snackbarHostState.showSnackbar("Duplicated '${partToCopy.name}'")
                    }
                }
            )
        }
    }
}
