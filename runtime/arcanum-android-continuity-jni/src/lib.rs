#![deny(unsafe_attr_outside_unsafe)]
#![deny(unsafe_op_in_unsafe_fn)]
use arcanum_runtime::{continuity_native as native, continuity_store::StoreError};
use jni::{
    objects::{JByteArray, JClass, JString},
    sys::{jboolean, jbyteArray, jint, jlong},
    JNIEnv,
};
use std::{
    panic::{catch_unwind, AssertUnwindSafe},
    path::Path,
    ptr,
};

fn string(env: &mut JNIEnv<'_>, input: JString<'_>, limit: usize) -> Result<String, StoreError> {
    let length = env
        .call_method(&input, "length", "()I", &[])
        .and_then(|value| value.i())
        .map_err(|_| StoreError::InvalidInput("JNI string"))?;
    if length < 0 || length as usize > limit {
        return Err(StoreError::InvalidInput("JNI string bound"));
    }
    let value: String = env
        .get_string(&input)
        .map_err(|_| StoreError::InvalidInput("JNI string"))?
        .into();
    if value.len() > limit {
        return Err(StoreError::InvalidInput("JNI UTF-8 bound"));
    }
    Ok(value)
}
fn bytes(env: &JNIEnv<'_>, input: JByteArray<'_>, limit: usize) -> Result<Vec<u8>, StoreError> {
    let length = env
        .get_array_length(&input)
        .map_err(|_| StoreError::InvalidInput("JNI array"))?;
    if length < 0 || length as usize > limit {
        return Err(StoreError::InvalidInput("JNI array bound"));
    }
    env.convert_byte_array(input)
        .map_err(|_| StoreError::InvalidInput("JNI array"))
}
fn failure(env: &mut JNIEnv<'_>, error: StoreError) {
    let _ = env.throw_new("java/lang/IllegalStateException", error.to_string());
}
fn boundary<F>(env: &mut JNIEnv<'_>, action: F) -> jbyteArray
where
    F: FnOnce(&mut JNIEnv<'_>) -> Result<Vec<u8>, StoreError>,
{
    match catch_unwind(AssertUnwindSafe(|| action(env))) {
        Ok(Ok(value)) => match env.byte_array_from_slice(&value) {
            Ok(result) => result.into_raw(),
            Err(_) => {
                failure(env, StoreError::Corrupt("JNI result unavailable"));
                ptr::null_mut()
            }
        },
        Ok(Err(error)) => {
            failure(env, error);
            ptr::null_mut()
        }
        Err(_) => {
            failure(
                env,
                StoreError::Corrupt("JNI operation interrupted; reconcile"),
            );
            ptr::null_mut()
        }
    }
}
#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_continuity_ContinuityNativeBridge_nativeWireVersion(
    _env: JNIEnv<'_>,
    _class: JClass<'_>,
) -> jint {
    native::NATIVE_WIRE_VERSION
}
#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_continuity_ContinuityNativeBridge_nativePrepare(
    mut env: JNIEnv<'_>,
    _class: JClass<'_>,
    root: JString<'_>,
    id: JString<'_>,
    fingerprint: JByteArray<'_>,
    generation: JByteArray<'_>,
    time: jlong,
    adoption: jboolean,
) -> jbyteArray {
    boundary(&mut env, |env| {
        let root = string(env, root, 4096)?;
        let id = string(env, id, 32)?;
        let fingerprint = bytes(env, fingerprint, 32)?
            .try_into()
            .map_err(|_| StoreError::InvalidInput("fingerprint size"))?;
        let generation = bytes(env, generation, 16)?
            .try_into()
            .map_err(|_| StoreError::InvalidInput("generation size"))?;
        if adoption > 1 {
            return Err(StoreError::InvalidInput("adoption flag"));
        }
        native::packet(&native::prepare(
            Path::new(&root),
            &id,
            fingerprint,
            generation,
            time,
            adoption == 1,
        )?)
    })
}
#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_continuity_ContinuityNativeBridge_nativeInspect(
    mut env: JNIEnv<'_>,
    _class: JClass<'_>,
    root: JString<'_>,
    id: JString<'_>,
) -> jint {
    let result = catch_unwind(AssertUnwindSafe(|| {
        let root = string(&mut env, root, 4096)?;
        let id = string(&mut env, id, 32)?;
        native::inspect(Path::new(&root), &id).map(native::phase_code)
    }));
    match result {
        Ok(Ok(value)) => value,
        Ok(Err(error)) => {
            failure(&mut env, error);
            -1
        }
        Err(_) => {
            failure(&mut env, StoreError::Corrupt("JNI inspection interrupted"));
            -1
        }
    }
}
#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_continuity_ContinuityNativeBridge_nativeCommit(
    mut env: JNIEnv<'_>,
    _class: JClass<'_>,
    root: JString<'_>,
    id: JString<'_>,
    message: JByteArray<'_>,
    public_key: JByteArray<'_>,
    signature: JByteArray<'_>,
) -> jbyteArray {
    boundary(&mut env, |env| {
        let root = string(env, root, 4096)?;
        let id = string(env, id, 32)?;
        let message = bytes(env, message, 64 * 1024)?;
        let key = bytes(env, public_key, 65)?
            .try_into()
            .map_err(|_| StoreError::InvalidInput("public key size"))?;
        let signature = bytes(env, signature, 72)?;
        native::packet(&native::commit(
            Path::new(&root),
            &id,
            message,
            key,
            signature,
        )?)
    })
}
#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_continuity_ContinuityNativeBridge_nativeRecover(
    mut env: JNIEnv<'_>,
    _class: JClass<'_>,
    root: JString<'_>,
    id: JString<'_>,
) -> jbyteArray {
    boundary(&mut env, |env| {
        let root = string(env, root, 4096)?;
        let id = string(env, id, 32)?;
        native::packet(&native::recover(Path::new(&root), &id)?)
    })
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_arcanum_nativehost_continuity_ContinuityNativeBridge_nativePublish(
    mut env: JNIEnv<'_>,
    _class: JClass<'_>,
    root: JString<'_>,
    id: JString<'_>,
    wrapper: JByteArray<'_>,
) -> jbyteArray {
    boundary(&mut env, |env| {
        let root = string(env, root, 4096)?;
        let id = string(env, id, 32)?;
        let wrapper = bytes(env, wrapper, 66 * 1024)?;
        native::packet(&native::publish(Path::new(&root), &id, &wrapper)?)
    })
}
