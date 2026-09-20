import { type ReactNode, useEffect, useState } from "react"
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  type ViewStyle,
  View,
} from "react-native"

type KeyboardBehavior = "padding" | "height" | "position"

type KeyboardAvoiderProps = {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  behavior?: KeyboardBehavior
  keyboardVerticalOffset?: number
  enabled?: boolean
}

/**
 * Drop-in replacement for React Native's KeyboardAvoidingView.
 *
 * On Android 11+ React Native derives the avoidance distance from the
 * keyboard event's `screenY`, which it takes from the still-unresized window's
 * visible frame unless the activity uses SOFT_INPUT_ADJUST_NOTHING. Expo SDK 54
 * forces edge-to-edge display (the window is never resized for the IME even
 * with adjustResize), so `screenY` ends up at the full screen bottom and the
 * computed padding collapses to 0 — the composer stays hidden behind the
 * keyboard. The IME inset reported as `endCoordinates.height` is reliable
 * under edge-to-edge, so on Android we apply it directly as bottom padding.
 */
export function KeyboardAvoider({
  children,
  style,
  behavior = "padding",
  keyboardVerticalOffset = 0,
  enabled = true,
}: KeyboardAvoiderProps) {
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0)

  useEffect(() => {
    if (Platform.OS !== "android") return

    const show = Keyboard.addListener("keyboardDidShow", (event) => {
      setAndroidKeyboardHeight(event.endCoordinates?.height ?? 0)
    })
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setAndroidKeyboardHeight(0)
    })

    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  if (Platform.OS === "android") {
    const inset = enabled ? androidKeyboardHeight : 0
    const adjustment: ViewStyle =
      behavior === "height" ? { marginBottom: inset } : { paddingBottom: inset }
    return <View style={[style, adjustment]}>{children}</View>
  }

  return (
    <KeyboardAvoidingView
      style={style}
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      enabled={enabled}
    >
      {children}
    </KeyboardAvoidingView>
  )
}
