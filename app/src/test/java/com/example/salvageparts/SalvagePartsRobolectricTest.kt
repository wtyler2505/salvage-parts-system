package com.example.salvageparts

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class SalvagePartsRobolectricTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun appLaunches_andDisplaysSamplePartsAndTabs() {
        composeTestRule.waitForIdle()
        composeTestRule.onNodeWithText("Salvage Parts System").assertIsDisplayed()
        composeTestRule.onNodeWithTag("search_parts_input").assertIsDisplayed()

        // Navigate to 3D Viewer tab
        composeTestRule.onNodeWithTag("nav_viewer_tab").performClick()
        composeTestRule.waitForIdle()
        composeTestRule.onNodeWithTag("cad_viewport_canvas").assertIsDisplayed()

        // Navigate to Statistics tab
        composeTestRule.onNodeWithTag("nav_statistics_tab").performClick()
        composeTestRule.waitForIdle()
        composeTestRule.onNodeWithTag("statistics_screen").assertIsDisplayed()
    }
}
