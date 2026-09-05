#![deny(unsafe_attr_outside_unsafe)]
#![deny(unsafe_op_in_unsafe_fn)]

use std::ffi::c_void;

use arcanum_android_bridge::{
    bridge_abi_version,
    bridge_capability_mask,
    tempus_system_clock_probe,
};

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeAbiVersion(
    _env: *mut c_void,
    _instance: *mut c_void,
) -> i32 {
    bridge_abi_version()
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeCapabilityMask(
    _env: *mut c_void,
    _instance: *mut c_void,
) -> i64 {
    bridge_capability_mask()
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_runtime_NativeRuntimeBridge_nativeTempusClockProbe(
    _env: *mut c_void,
    _instance: *mut c_void,
) -> i32 {
    tempus_system_clock_probe()
}
