#![deny(unsafe_attr_outside_unsafe)]
#![deny(unsafe_op_in_unsafe_fn)]

use std::path::Path;
use std::ptr;

use arcanum_android_lifecycle::{
    capture_persist_system_clock, lifecycle_abi_version, lifecycle_capability_mask,
    recover_tempus_anchor, LifecycleError,
};
use jni::objects::{JObject, JString};
use jni::sys::{jint, jlong, jstring};
use jni::JNIEnv;

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_runtime_TempusLifecycleBridge_nativeLifecycleAbiVersion(
    _env: JNIEnv<'_>,
    _instance: JObject<'_>,
) -> jint {
    lifecycle_abi_version()
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_runtime_TempusLifecycleBridge_nativeLifecycleCapabilityMask(
    _env: JNIEnv<'_>,
    _instance: JObject<'_>,
) -> jlong {
    lifecycle_capability_mask()
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_runtime_TempusLifecycleBridge_nativeCapturePersist(
    mut env: JNIEnv<'_>,
    _instance: JObject<'_>,
    root_path: JString<'_>,
    anchor_id: JString<'_>,
) -> jstring {
    let output = match (
        read_java_string(&mut env, root_path),
        read_java_string(&mut env, anchor_id),
    ) {
        (Some(root_path), Some(anchor_id)) => {
            match capture_persist_system_clock(Path::new(&root_path), &anchor_id) {
                Ok(presentation) => presentation.presentation_line(),
                Err(error) => error.presentation_line(),
            }
        }
        _ => LifecycleError::InvalidInput.presentation_line(),
    };
    write_java_string(&mut env, output)
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_runtime_TempusLifecycleBridge_nativeRecover(
    mut env: JNIEnv<'_>,
    _instance: JObject<'_>,
    root_path: JString<'_>,
    anchor_id: JString<'_>,
) -> jstring {
    let output = match (
        read_java_string(&mut env, root_path),
        read_java_string(&mut env, anchor_id),
    ) {
        (Some(root_path), Some(anchor_id)) => {
            match recover_tempus_anchor(Path::new(&root_path), &anchor_id) {
                Ok(presentation) => presentation.presentation_line(),
                Err(error) => error.presentation_line(),
            }
        }
        _ => LifecycleError::InvalidInput.presentation_line(),
    };
    write_java_string(&mut env, output)
}

fn read_java_string(env: &mut JNIEnv<'_>, value: JString<'_>) -> Option<String> {
    env.get_string(&value).ok().map(Into::into)
}

fn write_java_string(env: &mut JNIEnv<'_>, value: String) -> jstring {
    match env.new_string(value) {
        Ok(value) => value.into_raw(),
        Err(_) => ptr::null_mut(),
    }
}
