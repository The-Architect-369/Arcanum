#![deny(unsafe_attr_outside_unsafe)]
#![deny(unsafe_op_in_unsafe_fn)]

use std::ptr;

use arcanum_hope_runtime::{
    canonical_reflection, contract_json, HopeReflectionInput, HopeTempusProvenance,
};
use jni::objects::{JClass, JString};
use jni::sys::jstring;
use jni::JNIEnv;

fn read_string(env: &mut JNIEnv<'_>, value: &JString<'_>) -> Result<String, String> {
    env.get_string(value)
        .map(Into::into)
        .map_err(|error| error.to_string())
}

fn read_optional(env: &mut JNIEnv<'_>, value: &JString<'_>) -> Result<Option<String>, String> {
    let value = read_string(env, value)?;
    if value.trim().is_empty() {
        Ok(None)
    } else {
        Ok(Some(value))
    }
}

fn throw_and_null(env: &mut JNIEnv<'_>, class_name: &str, message: String) -> jstring {
    let _ = env.throw_new(class_name, message);
    ptr::null_mut()
}

fn return_string(env: &mut JNIEnv<'_>, value: String) -> jstring {
    match env.new_string(value) {
        Ok(value) => value.into_raw(),
        Err(error) => throw_and_null(env, "java/lang/IllegalStateException", error.to_string()),
    }
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_hope_HopeRuntimeBridge_nativeContract(
    mut env: JNIEnv<'_>,
    _class: JClass<'_>,
) -> jstring {
    return_string(&mut env, contract_json())
}

#[allow(clippy::too_many_arguments)]
#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_hope_HopeRuntimeBridge_nativeBuildReflection(
    mut env: JNIEnv<'_>,
    _class: JClass<'_>,
    id: JString<'_>,
    created_at: JString<'_>,
    prompt: JString<'_>,
    user_text: JString<'_>,
    hope_text: JString<'_>,
    tempus_anchor_id: JString<'_>,
    tempus_captured_at: JString<'_>,
    tempus_source_kind: JString<'_>,
) -> jstring {
    let id = match read_string(&mut env, &id) {
        Ok(value) => value,
        Err(error) => return throw_and_null(&mut env, "java/lang/IllegalArgumentException", error),
    };
    let created_at = match read_string(&mut env, &created_at) {
        Ok(value) => value,
        Err(error) => return throw_and_null(&mut env, "java/lang/IllegalArgumentException", error),
    };
    let prompt = match read_optional(&mut env, &prompt) {
        Ok(value) => value,
        Err(error) => return throw_and_null(&mut env, "java/lang/IllegalArgumentException", error),
    };
    let user_text = match read_string(&mut env, &user_text) {
        Ok(value) => value,
        Err(error) => return throw_and_null(&mut env, "java/lang/IllegalArgumentException", error),
    };
    let hope_text = match read_optional(&mut env, &hope_text) {
        Ok(value) => value,
        Err(error) => return throw_and_null(&mut env, "java/lang/IllegalArgumentException", error),
    };
    let tempus_anchor_id = match read_optional(&mut env, &tempus_anchor_id) {
        Ok(value) => value,
        Err(error) => return throw_and_null(&mut env, "java/lang/IllegalArgumentException", error),
    };
    let tempus_captured_at = match read_optional(&mut env, &tempus_captured_at) {
        Ok(value) => value,
        Err(error) => return throw_and_null(&mut env, "java/lang/IllegalArgumentException", error),
    };
    let tempus_source_kind = match read_optional(&mut env, &tempus_source_kind) {
        Ok(value) => value,
        Err(error) => return throw_and_null(&mut env, "java/lang/IllegalArgumentException", error),
    };

    let tempus = match (&tempus_anchor_id, &tempus_captured_at, &tempus_source_kind) {
        (None, None, None) => None,
        (Some(anchor_id), Some(captured_at), Some(source_kind)) => Some(HopeTempusProvenance {
            anchor_id,
            captured_at,
            source_kind,
        }),
        _ => {
            return throw_and_null(
                &mut env,
                "java/lang/IllegalArgumentException",
                "Tempus provenance must be complete or absent".to_owned(),
            );
        }
    };

    match canonical_reflection(HopeReflectionInput {
        id: &id,
        created_at: &created_at,
        prompt: prompt.as_deref(),
        user_text: &user_text,
        hope_text: hope_text.as_deref(),
        tempus,
    }) {
        Ok(record) => return_string(&mut env, record),
        Err(error) => throw_and_null(
            &mut env,
            "java/lang/IllegalArgumentException",
            error.to_string(),
        ),
    }
}
