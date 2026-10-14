package com.example.salvageparts.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.salvageparts.data.model.PartEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PartDao {
    @Query("SELECT * FROM salvage_parts ORDER BY lastModifiedEpochMs DESC")
    fun observeAllParts(): Flow<List<PartEntity>>

    @Query("SELECT COUNT(*) FROM salvage_parts")
    suspend fun getPartCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPart(part: PartEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertParts(parts: List<PartEntity>)

    @Update
    suspend fun updatePart(part: PartEntity)

    @Query("DELETE FROM salvage_parts WHERE id = :id")
    suspend fun deletePartById(id: String)

    @Query("DELETE FROM salvage_parts WHERE id IN (:ids)")
    suspend fun deletePartsByIds(ids: List<String>)
}
