package com.example.salvageparts.data.repository

import com.example.salvageparts.data.local.PartDao
import com.example.salvageparts.data.local.SalvageDatabase.Companion.createSampleParts
import com.example.salvageparts.data.local.SalvageDatabase.Companion.toDomain
import com.example.salvageparts.data.local.SalvageDatabase.Companion.toEntity
import com.example.salvageparts.data.model.PartCondition
import com.example.salvageparts.data.model.PartStatisticsSummary
import com.example.salvageparts.data.model.SalvagePart
import com.example.salvageparts.data.model.SearchFilterState
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.UUID

class PartRepository(private val partDao: PartDao) {

    val allParts: Flow<List<SalvagePart>> = partDao.observeAllParts()
        .map { entities -> entities.map { it.toDomain() } }

    suspend fun ensureSampleDataSeeded() {
        if (partDao.getPartCount() == 0) {
            val samples = createSampleParts().map { it.toEntity() }
            partDao.insertParts(samples)
        }
    }

    suspend fun upsertPart(part: SalvagePart) {
        val updated = part.copy(lastModifiedEpochMs = System.currentTimeMillis())
        partDao.insertPart(updated.toEntity())
    }

    suspend fun duplicatePart(original: SalvagePart): SalvagePart {
        val now = System.currentTimeMillis()
        val copy = original.copy(
            id = "part-${UUID.randomUUID().toString().take(8)}",
            name = "${original.name} (Copy)",
            partNumbers = original.partNumbers.map { "$it-COPY" },
            dateAddedEpochMs = now,
            lastModifiedEpochMs = now
        )
        partDao.insertPart(copy.toEntity())
        return copy
    }

    suspend fun deletePart(id: String) {
        partDao.deletePartById(id)
    }

    suspend fun deleteParts(ids: List<String>) {
        partDao.deletePartsByIds(ids)
    }

    fun filterParts(parts: List<SalvagePart>, filter: SearchFilterState): List<SalvagePart> {
        return parts.filter { part ->
            val matchesQuery = if (filter.query.isBlank()) {
                true
            } else {
                val q = filter.query.trim().lowercase()
                part.name.lowercase().contains(q) ||
                    part.manufacturer.lowercase().contains(q) ||
                    part.model.lowercase().contains(q) ||
                    part.location.lowercase().contains(q) ||
                    part.partNumbers.any { it.lowercase().contains(q) } ||
                    part.tags.any { it.lowercase().contains(q) } ||
                    part.categories.any { it.lowercase().contains(q) }
            }

            val matchesCategory = filter.selectedCategory == null ||
                part.categories.any { it.equals(filter.selectedCategory, ignoreCase = true) }

            val matchesCondition = filter.selectedConditions.isEmpty() ||
                filter.selectedConditions.contains(part.condition)

            val matchesFavorite = !filter.onlyFavorites || part.isFavorite

            val matchesMinVal = filter.minValueUsd == null || part.valueUsd >= filter.minValueUsd
            val matchesMaxVal = filter.maxValueUsd == null || part.valueUsd <= filter.maxValueUsd

            matchesQuery && matchesCategory && matchesCondition &&
                matchesFavorite && matchesMinVal && matchesMaxVal
        }
    }

    fun computeStatistics(parts: List<SalvagePart>): PartStatisticsSummary {
        if (parts.isEmpty()) {
            return PartStatisticsSummary(
                partsByCondition = PartCondition.entries.associateWith { 0 }
            )
        }
        val totalParts = parts.size
        val totalQuantity = parts.sumOf { it.quantity }
        val totalValue = parts.sumOf { it.valueUsd * it.quantity }
        val avgValue = totalValue / totalParts.coerceAtLeast(1)

        val byCondition = PartCondition.entries.associateWith { cond ->
            parts.count { it.condition == cond }
        }

        val byCategory = mutableMapOf<String, Int>()
        parts.forEach { part ->
            part.categories.forEach { category ->
                byCategory[category] = (byCategory[category] ?: 0) + 1
            }
        }

        val highVal = parts.count { it.valueUsd > 1000.0 }
        val medVal = parts.count { it.valueUsd in 100.0..1000.0 }
        val lowVal = parts.count { it.valueUsd < 100.0 }

        return PartStatisticsSummary(
            totalParts = totalParts,
            totalQuantity = totalQuantity,
            totalValueUsd = totalValue,
            averageValueUsd = avgValue,
            partsByCondition = byCondition,
            partsByCategory = byCategory,
            highValueCount = highVal,
            mediumValueCount = medVal,
            lowValueCount = lowVal
        )
    }
}
