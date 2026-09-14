package org.arcanum.nativehost.architect

import android.view.View
import android.widget.EditText
import android.widget.TextView

object ArchitectObservationPrivacy {
    const val PRIVATE_TEXT_TAG: String = "arcanum:architect-private-text:v1"

    fun markPrivateText(view: View) {
        view.tag = PRIVATE_TEXT_TAG
    }

    fun isPrivateText(view: View): Boolean =
        view is EditText || view.tag == PRIVATE_TEXT_TAG

    fun shouldMaskPixels(view: View): Boolean {
        if (!isPrivateText(view) || view.visibility != View.VISIBLE) {
            return false
        }
        return when (view) {
            is EditText -> view.text.isNotEmpty()
            is TextView -> view.text.isNotEmpty()
            else -> true
        }
    }

    fun textForObservation(view: TextView): String =
        if (isPrivateText(view)) {
            ArchitectObservationContract.REDACTED_TEXT
        } else {
            view.text?.toString().orEmpty()
        }
}
