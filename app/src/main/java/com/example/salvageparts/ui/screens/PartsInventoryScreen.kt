package com.example.salvageparts.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ViewInAr
import androidx.compose.material.icons.filled.ViewList
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.salvageparts.R
import com.example.salvageparts.data.model.PartCondition
import com.example.salvageparts.data.model.SalvagePart
import com.example.salvageparts.ui.theme.ConditionBrokenRed
import com.example.salvageparts.ui.theme.ConditionNewGreen
import com.example.salvageparts.ui.theme.ConditionSalvagedAmber
import com.example.salvageparts.ui.theme.ConditionUsedBlue
import com.example.salvageparts.ui.viewmodel.SalvageViewModel
import java.text.NumberFormat
import java.util.Locale

@Composable
fun PartsInventoryScreen(
    viewModel: SalvageViewModel,
    onAddPart: () -> Unit,
    onEditPart: (SalvagePart) -> Unit,
    onViewPartDetails: (SalvagePart) -> Unit,
    onOpenIn3DViewer: (SalvagePart) -> Unit
) {
    val parts by viewModel.filteredParts.collectAsStateWithLifecycle()
    val filterState by viewModel.filterState.collectAsStateWithLifecycle()
    val categories by viewModel.availableCategories.collectAsStateWithLifecycle()
    val isGridView by viewModel.isGridView.collectAsStateWithLifecycle()
    val selectedPart by viewModel.selectedPart.collectAsStateWithLifecycle()

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onAddPart,
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text(stringResource(R.string.action_add_part)) },
                modifier = Modifier.testTag("fab_add_part")
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            // Search and View Mode Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = filterState.query,
                    onValueChange = viewModel::updateSearchQuery,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("search_parts_input"),
                    placeholder = { Text(stringResource(R.string.search_parts_hint)) },
                    leadingIcon = {
                        Icon(Icons.Default.Search, contentDescription = "Search")
                    },
                    trailingIcon = {
                        if (filterState.query.isNotEmpty()) {
                            IconButton(onClick = { viewModel.updateSearchQuery("") }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear search")
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    IconButton(
                        onClick = viewModel::toggleGridViewMode,
                        modifier = Modifier.testTag("toggle_view_mode_button")
                    ) {
                        Icon(
                            imageVector = if (isGridView) Icons.Default.ViewList else Icons.Default.GridView,
                            contentDescription = "Toggle Grid or List View"
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Filter Chips Row (Favorites, Conditions, Categories)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                FilterChip(
                    selected = filterState.onlyFavorites,
                    onClick = viewModel::toggleOnlyFavorites,
                    label = { Text("Favorites") },
                    leadingIcon = {
                        Icon(
                            imageVector = if (filterState.onlyFavorites) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                    },
                    modifier = Modifier.testTag("filter_favorites_chip")
                )

                PartCondition.entries.forEach { condition ->
                    val selected = filterState.selectedConditions.contains(condition)
                    FilterChip(
                        selected = selected,
                        onClick = { viewModel.toggleConditionFilter(condition) },
                        label = { Text(condition.label.replaceFirstChar { it.uppercase() }) },
                        modifier = Modifier.testTag("filter_condition_${condition.label}")
                    )
                }

                categories.forEach { category ->
                    val selected = filterState.selectedCategory == category
                    FilterChip(
                        selected = selected,
                        onClick = { viewModel.selectCategoryFilter(category) },
                        label = { Text(category) }
                    )
                }

                if (filterState.query.isNotEmpty() ||
                    filterState.selectedCategory != null ||
                    filterState.selectedConditions.isNotEmpty() ||
                    filterState.onlyFavorites
                ) {
                    AssistChip(
                        onClick = viewModel::clearFilters,
                        label = { Text("Reset") },
                        leadingIcon = {
                            Icon(Icons.Default.Clear, contentDescription = null, modifier = Modifier.size(16.dp))
                        },
                        modifier = Modifier.testTag("reset_filters_chip")
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Parts Count Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Showing ${parts.size} component${if (parts.size == 1) "" else "s"}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                selectedPart?.let { active ->
                    Text(
                        text = "Active: ${active.name}",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (parts.isEmpty()) {
                EmptyPartsPlaceholder(
                    onResetFilters = viewModel::clearFilters,
                    onAddPart = onAddPart
                )
            } else if (isGridView) {
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 260.dp),
                    contentPadding = PaddingValues(bottom = 88.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier
                        .fillMaxSize()
                        .testTag("parts_grid")
                ) {
                    items(parts, key = { it.id }) { part ->
                        PartGridCard(
                            part = part,
                            isSelected = selectedPart?.id == part.id,
                            onSelect = { viewModel.selectPart(part.id) },
                            onInspect3D = { onOpenIn3DViewer(part) },
                            onViewDetails = { onViewPartDetails(part) },
                            onEdit = { onEditPart(part) },
                            onDuplicate = { viewModel.duplicatePart(part) },
                            onDelete = { viewModel.deletePart(part.id) },
                            onToggleFavorite = { viewModel.toggleFavorite(part) }
                        )
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(bottom = 88.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier
                        .fillMaxSize()
                        .testTag("parts_list")
                ) {
                    items(parts, key = { it.id }) { part ->
                        PartListRow(
                            part = part,
                            isSelected = selectedPart?.id == part.id,
                            onSelect = { viewModel.selectPart(part.id) },
                            onInspect3D = { onOpenIn3DViewer(part) },
                            onEdit = { onEditPart(part) },
                            onDuplicate = { viewModel.duplicatePart(part) },
                            onDelete = { viewModel.deletePart(part.id) },
                            onToggleFavorite = { viewModel.toggleFavorite(part) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PartGridCard(
    part: SalvagePart,
    isSelected: Boolean,
    onSelect: () -> Unit,
    onInspect3D: () -> Unit,
    onViewDetails: () -> Unit,
    onEdit: () -> Unit,
    onDuplicate: () -> Unit,
    onDelete: () -> Unit,
    onToggleFavorite: () -> Unit
) {
    var menuExpanded by remember { mutableStateOf(false) }
    val currencyFormatter = remember { NumberFormat.getCurrencyInstance(Locale.US) }

    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelect() }
            .testTag("part_card_${part.id}"),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.elevatedCardElevation(
            defaultElevation = if (isSelected) 6.dp else 2.dp
        )
    ) {
        Column {
            // CAD Preview Banner with gradient & metadata badges
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(116.dp)
                    .background(
                        Brush.linearGradient(
                            colors = listOf(
                                MaterialTheme.colorScheme.surfaceVariant,
                                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.55f)
                            )
                        )
                    )
                    .padding(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    ConditionBadge(condition = part.condition)

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = onToggleFavorite,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = if (part.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "Favorite",
                                tint = if (part.isFavorite) Color(0xFFF43F5E) else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Box {
                            IconButton(
                                onClick = { menuExpanded = true },
                                modifier = Modifier
                                    .size(32.dp)
                                    .testTag("part_menu_${part.id}")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.MoreVert,
                                    contentDescription = "Part Actions",
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                            DropdownMenu(
                                expanded = menuExpanded,
                                onDismissRequest = { menuExpanded = false }
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Inspect in 3D") },
                                    leadingIcon = { Icon(Icons.Default.ViewInAr, contentDescription = null) },
                                    onClick = {
                                        menuExpanded = false
                                        onInspect3D()
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("View Specs") },
                                    leadingIcon = { Icon(Icons.Default.Inventory2, contentDescription = null) },
                                    onClick = {
                                        menuExpanded = false
                                        onViewDetails()
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Edit Part") },
                                    leadingIcon = { Icon(Icons.Default.Edit, contentDescription = null) },
                                    onClick = {
                                        menuExpanded = false
                                        onEdit()
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Duplicate") },
                                    leadingIcon = { Icon(Icons.Default.ContentCopy, contentDescription = null) },
                                    onClick = {
                                        menuExpanded = false
                                        onDuplicate()
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Delete", color = MaterialTheme.colorScheme.error) },
                                    leadingIcon = {
                                        Icon(
                                            Icons.Default.DeleteOutline,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.error
                                        )
                                    },
                                    onClick = {
                                        menuExpanded = false
                                        onDelete()
                                    }
                                )
                            }
                        }
                    }
                }

                // Center CAD Icon & 3D Dimensions
                Column(
                    modifier = Modifier.align(Alignment.BottomStart)
                ) {
                    Text(
                        text = "${part.modelFormat} • ${part.mechanicalSpec.dimensions.x.toInt()}×${part.mechanicalSpec.dimensions.y.toInt()}×${part.mechanicalSpec.dimensions.z.toInt()} mm",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Surface(
                    onClick = onInspect3D,
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .testTag("inspect_3d_${part.id}")
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ViewInAr,
                            contentDescription = "Inspect in 3D",
                            tint = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = "3D",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onPrimary,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Part Metadata Body
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = part.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "${part.manufacturer} • ${part.model}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = "Qty ${part.quantity} • ${part.location}",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    Text(
                        text = currencyFormatter.format(part.valueUsd),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                if (part.categories.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        part.categories.take(2).forEach { category ->
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant
                            ) {
                                Text(
                                    text = category,
                                    style = MaterialTheme.typography.labelMedium,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PartListRow(
    part: SalvagePart,
    isSelected: Boolean,
    onSelect: () -> Unit,
    onInspect3D: () -> Unit,
    onEdit: () -> Unit,
    onDuplicate: () -> Unit,
    onDelete: () -> Unit,
    onToggleFavorite: () -> Unit
) {
    val currencyFormatter = remember { NumberFormat.getCurrencyInstance(Locale.US) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelect() }
            .testTag("part_row_${part.id}"),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) {
                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.25f)
            } else {
                MaterialTheme.colorScheme.surface
            }
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Inventory2,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = part.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = false)
                    )
                    ConditionBadge(condition = part.condition)
                }
                Text(
                    text = "${part.manufacturer} • ${part.model} • Qty: ${part.quantity}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "${part.location} • ${currencyFormatter.format(part.valueUsd)}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onInspect3D) {
                    Icon(Icons.Default.ViewInAr, contentDescription = "Inspect in 3D")
                }
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit")
                }
                IconButton(onClick = onDuplicate) {
                    Icon(Icons.Default.ContentCopy, contentDescription = "Duplicate")
                }
                IconButton(onClick = onToggleFavorite) {
                    Icon(
                        imageVector = if (part.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Favorite",
                        tint = if (part.isFavorite) Color(0xFFF43F5E) else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Default.DeleteOutline,
                        contentDescription = "Delete",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

@Composable
fun ConditionBadge(condition: PartCondition) {
    val (bgColor, textColor) = when (condition) {
        PartCondition.NEW -> ConditionNewGreen.copy(alpha = 0.18f) to ConditionNewGreen
        PartCondition.USED -> ConditionUsedBlue.copy(alpha = 0.18f) to ConditionUsedBlue
        PartCondition.SALVAGED -> ConditionSalvagedAmber.copy(alpha = 0.18f) to ConditionSalvagedAmber
        PartCondition.BROKEN -> ConditionBrokenRed.copy(alpha = 0.18f) to ConditionBrokenRed
    }
    Surface(
        shape = RoundedCornerShape(50),
        color = bgColor
    ) {
        Text(
            text = condition.label.uppercase(),
            style = MaterialTheme.typography.labelMedium,
            color = textColor,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        )
    }
}

@Composable
private fun EmptyPartsPlaceholder(
    onResetFilters: () -> Unit,
    onAddPart: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.Inventory2,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
            modifier = Modifier.size(64.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = stringResource(R.string.empty_parts_title),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = stringResource(R.string.empty_parts_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(20.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedButton(onClick = onResetFilters) {
                Text("Reset Filters")
            }
            OutlinedButton(onClick = onAddPart) {
                Icon(Icons.Default.Add, contentDescription = null)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Create Part")
            }
        }
    }
}
