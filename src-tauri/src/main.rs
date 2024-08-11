#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::path::PathBuf;
use std::os::windows::process::CommandExt;
use std::process::Stdio;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_file_path,
            check_status,
            idle_game,
            unlock_achievement
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_file_path() -> Result<PathBuf, String> {
    match std::env::current_exe() {
        Ok(path) => return Ok(path),
        Err(error) => return Err(format!("{error}")),
    }
}

#[tauri::command]
fn check_status() -> bool {
    let output = std::process::Command::new("tasklist")
        .args(&["/FI", "IMAGENAME eq steam.exe"])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .creation_flags(0x08000000)
        .output()
        .expect("Failed to execute tasklist command");

    let output_str = String::from_utf8_lossy(&output.stdout);

    output_str.contains("steam.exe")
}

#[tauri::command]
fn idle_game(file_path: String, argument: String) -> Result<(), String> {
    std::process::Command::new(file_path)
        .arg(argument)
        .spawn()
        .expect("failed to launch");
    Ok(())
}

#[tauri::command]
fn unlock_achievement(file_path: String, app_id: String, achievement_id: String, unlock_all: bool) -> Result<(), String> {
    let unlock_all_arg = if unlock_all { "true" } else { "false" }.to_string();
    std::process::Command::new(file_path)
        .args(&[app_id, achievement_id, unlock_all_arg])
        .output()
        .expect("failed to execute unlocker");
    Ok(())
}