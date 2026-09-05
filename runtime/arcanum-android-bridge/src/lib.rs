#![forbid(unsafe_code)]

use std::ffi::c_void;

use arcanum_runtime::{
    tempus::{capture_tempus_anchor, SystemClockProvider, TEMPUS_ANCHOR_SCHEMA_VERSION},
    ARCANUM_RUNTIME_VERSION,
};

pub const BRIDGE_ABI_VERSION: i32 = 1;
pub const STATUS_OK: i32 = 0;
pub const STATUS_CAPTURE_ERROR: i32 = 1;
pub const STATUS_CONTRACT_ERROR: i32 = 2;

pub const CAP_TEMPUS_SYSTEM_CLOCK_PROBE: i64 = 1 << 0;
pub const BRIDGE_CAPABILITY_MASK: i64 = CAP_TEMPUS_SYSTEM_CLOCK_PROBE;

pub fn bridge_abi_version() -> i32 {
    BRIDGE_ABI_VERSION
}

pub fn bridge_capability_mask() -> i64 {
    BRIDGE_CAPABILITY_MASK
}

pub fn tempus_system_clock_probe() -> i32 {
    match capture_tempus_anchor(
        &SystemClockProvider,
        "ce-w02-native-bridge-probe",
        ARCANUM_RUNTIME_VERSION,
    ) {
        Ok(anchor)
            if anchor.schema_version == TEMPUS_ANCHOR_SCHEMA_VERSION
                && anchor.source.kind.is_clock()
                && anchor.observer.is_none()
                && anchor.frame.is_none()
                && anchor.observation.kind == "clock"
                && anchor.interpretation.is_none() =>
        {
            STATUS_OK
        }
        Ok(_) => STATUS_CONTRACT_ERROR,
        Err(_) => STATUS_CAPTURE_ERROR,
    }
}

#[no_mangle]
pub extern "system" fn Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeAbiVersion(
    _env: *mut c_void,
    _instance: *mut c_void,
) -> i32 {
    bridge_abi_version()
}

#[no_mangle]
pub extern "system" fn Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeCapabilityMask(
    _env: *mut c_void,
    _instance: *mut c_void,
) -> i64 {
    bridge_capability_mask()
}

#[no_mangle]
pub extern "system" fn Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeTempusClockProbe(
    _env: *mut c_void,
    _instance: *mut c_void,
) -> i32 {
    tempus_system_clock_probe()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bridge_contract_is_narrow_and_versioned() {
        assert_eq!(bridge_abi_version(), 1);
        assert_eq!(bridge_capability_mask(), CAP_TEMPUS_SYSTEM_CLOCK_PROBE);
        assert_eq!(bridge_capability_mask() & !CAP_TEMPUS_SYSTEM_CLOCK_PROBE, 0);
    }

    #[test]
    fn tempus_probe_crosses_the_runtime_clock_boundary() {
        assert_eq!(tempus_system_clock_probe(), STATUS_OK);
    }
}
