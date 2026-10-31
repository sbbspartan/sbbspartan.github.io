# Desktop STM software

Teensy 3.6 firmware (`STM_Controller/`) and the Windows C# host GUI (`STM_GUI/Form1.cs`).
This code was originally listed inline on `stmproject.html`. It is kept here, unlinked, until the
software section of the page is rewritten.

Based heavily on Dan Berard's home-built STM firmware and GUI (https://dberard.com/home-built-stm/).

## Fixes applied (Oct 2026)

- **Image size bound.** The `IP` serial command is clamped to `MAX_IMAGE_PIXELS` (1024), so a larger
  value can no longer write past the end of the ping-pong buffers.
- **Line-rate change no longer hangs.** `LR` used to busy-wait for `pixelCounter == 0`, which never
  happens if scanning is paused mid-line. It now only waits while scanning, with a two-line timeout.
  Line rate is clamped to at least 0.01 Hz, and `samplesPerPixel` to at least 1.
- **Only the used bytes are sent per line.** Each line now sends `2 + 16 x image pixels` bytes instead
  of the full 16,386-byte buffer (half of it was unused at 512 px). The GUI reads the same length and
  now loops until the whole line has arrived (a single `SerialPort.Read` can return early).
- **Saturation workaround.** An ADC reading of exactly 0 is only treated as saturation if the previous
  reading was above 3/4 full scale, so a genuine "no current" 0 no longer looks like a crash.
  The real fix is still to keep the ADC input inside its range in hardware.
- **Integral gain units.** The default `KI` is now in the same units as the `KI` serial command
  (both multiplied by `dt`). The old default of 300000 raw is `KI 7500`.
- **Naming.** The second placeholder `IVCurve()` is now `IZCurve()`.

## Still open

- `retract()` / `engage()` do not reset the integrator (`iTerm`), so the Z output jumps back to its
  previous value on re-engage.
- The sigma-delta dither runs at 25 kHz with 4 extra bits, which can put tones near 6.25 kHz, close to
  the piezo disk resonance. Needs analog filtering after the DAC and a Z-loop bandwidth well below the
  loaded scanner resonance.
- Motorized coarse approach (`engageScanner()`, `stepMotor()`) is not implemented; approach is manual.
