package com.example.salvageparts.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val DarkColorScheme = darkColorScheme(
    primary = PrecisionCyan400,
    onPrimary = SlateNavy950,
    primaryContainer = PrecisionCyan600,
    onPrimaryContainer = Color.White,
    secondary = IndustrialAmber500,
    onSecondary = SlateNavy950,
    secondaryContainer = IndustrialAmber600,
    onSecondaryContainer = Color.White,
    tertiary = ConditionNewGreen,
    background = SlateNavy950,
    onBackground = OnSurfaceDark,
    surface = SurfaceDark,
    onSurface = OnSurfaceDark,
    surfaceVariant = SurfaceCardDark,
    onSurfaceVariant = OnSurfaceVariantDark,
    error = ConditionBrokenRed
)

private val LightColorScheme = lightColorScheme(
    primary = PrecisionCyan600,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE0F2FE),
    onPrimaryContainer = SlateNavy900,
    secondary = IndustrialAmber600,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFFEF3C7),
    onSecondaryContainer = SlateNavy900,
    tertiary = ConditionNewGreen,
    background = SurfaceLight,
    onBackground = OnSurfaceLight,
    surface = SurfaceCardLight,
    onSurface = OnSurfaceLight,
    surfaceVariant = Color(0xFFF1F5F9),
    onSurfaceVariant = OnSurfaceVariantLight,
    error = ConditionBrokenRed
)

val AppShapes = Shapes(
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(12.dp),
    large = RoundedCornerShape(16.dp)
)

@Composable
fun SalvagePartsTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        shapes = AppShapes,
        content = content
    )
}
