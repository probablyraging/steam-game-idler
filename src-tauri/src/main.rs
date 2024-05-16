#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::path::PathBuf;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_file_path,
            check_status,
            idle_game
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
