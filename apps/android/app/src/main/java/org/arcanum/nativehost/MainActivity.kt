package org.arcanum.nativehost

import android.app.Activity
import android.os.Bundle
import org.arcanum.nativehost.geometry.ArcnetRendererView

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(ArcnetRendererView(this))
    }
}
