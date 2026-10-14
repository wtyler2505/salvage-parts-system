package com.example.salvageparts

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.salvageparts.data.local.SalvageDatabase
import com.example.salvageparts.data.repository.PartRepository
import com.example.salvageparts.ui.navigation.SalvagePartsApp
import com.example.salvageparts.ui.theme.SalvagePartsTheme
import com.example.salvageparts.ui.viewmodel.SalvageViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val database = SalvageDatabase.getDatabase(applicationContext)
        val repository = PartRepository(database.partDao())

        setContent {
            SalvagePartsTheme {
                val salvageViewModel: SalvageViewModel = viewModel(
                    factory = SalvageViewModel.Factory(repository)
                )
                SalvagePartsApp(viewModel = salvageViewModel)
            }
        }
    }
}
