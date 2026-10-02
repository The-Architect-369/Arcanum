#![forbid(unsafe_code)]

pub const ARCANUM_RUNTIME_VERSION: &str = env!("CARGO_PKG_VERSION");

pub mod continuity_receipt;
pub mod persistence;
pub mod receipt;
pub mod tempus;
