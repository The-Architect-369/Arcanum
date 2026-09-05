#![deny(unsafe_attr_outside_unsafe)]
#![deny(unsafe_op_in_unsafe_fn)]

use std::ptr;

use arcanum_android_tempus_lifecycle::{
    capture_and_persist, recover_anchor, TempusLifecycleError, TempusLifecyclePresentation,
};
use jni::objects::{JClass, JString};
use jni::sys::jstring;
use jni::JNIEnv;

fn read_string(env: &mut JNIEnv<'_>, value: &JString<'_>) -> Result<String, String> {
    env.get_string(value)
        .map(Into::into)
        .map_err(|error| error.to_string())
}

fn throw_and_null(env: &mut JNIEnv<'_>, class_name: &str, message: String) -> jstring {
    let _ = env.throw_new(class_name, message);
    ptr::null_mut()
}

fn return_presentation(
    env: &mut JNIEnv<'_>,
    result: Result<TempusLifecyclePresentation, TempusLifecycleError>,
) -> jstring {
    match result {
        Ok(presentation) => match env.new_string(presentation.to_json()) {
            Ok(value) => value.into_raw(),
            Err(error) => throw_and_null(env, "java/lang/IllegalStateException", error.to_string()),
        },
        Err(error) => throw_and_null(env, "java/lang/IllegalStateException", error.to_string()),
    }
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_tempus_TempusLifecycleBridge_nativeCapturePersist(
    mut env: JNIEnv<'_>,
    _class: JClass<'_>,
    storage_root: JString<'_>,
) -> jstring {
    let storage_root = match read_string(&mut env, &storage_root) {
        Ok(value) => value,
        Err(error) => {
            return throw_and_null(&mut env, "java/lang/IllegalArgumentException", error);
        }
    };

    return_presentation(&mut env, capture_and_persist(storage_root))
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_tempus_TempusLifecycleBridge_nativeRecover(
    mut env: JNIEnv<'_>,
    _class: JClass<'_>,
    storage_root: JString<'_>,
    anchor_id: JString<'_>,
) -> jstring {
    let storage_root = match read_string(&mut env, &storage_root) {
        Ok(value) => value,
        Err(error) => {
            return throw_and_null(&mut env, "java/lang/IllegalArgumentException", error);
        }
    };
    let anchor_id = match read_string(&mut env, &anchor_id) {
        Ok(value) => value,
        Err(error) => {
            return throw_and_null(&mut env, "java/lang/IllegalArgumentException", error);
        }
    };

    return_presentation(&mut env, recover_anchor(storage_root, &anchor_id))
}
