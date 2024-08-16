#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use chrono::Local;
use std::path::PathBuf;
use std::os::windows::process::CommandExt;
use std::process::Stdio;
use std::fs::{OpenOptions, create_dir_all};
use std::io::{BufRead, BufReader, Write, Seek, SeekFrom};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_file_path,
            check_status,
            start_idle,
            stop_idle,
            unlock_achievement,
            log_event,
            get_app_log_dir
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
fn start_idle(file_path: String, app_id: String, quiet: String) -> Result<(), String> {
    std::process::Command::new(file_path)
        .args(&[&app_id, &quiet])
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn stop_idle(app_id: String) -> Result<(), String> {
    let wmic_output = std::process::Command::new("wmic")
        .args(&["process", "get", "processid,commandline"])
        .output()
        .expect("failed to get process");
    let wmic_stdout = String::from_utf8_lossy(&wmic_output.stdout);
    let pid = wmic_stdout.lines()
        .find(|line| line.contains(&app_id))
        .and_then(|line| line.split_whitespace().last())
        .ok_or_else(|| "No matching process found".to_string())?;
    std::process::Command::new("taskkill")
        .args(&["/F", "/PID", pid])
        .output()
        .expect("failed to kill process");
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

const APP_FOLDER_NAME: &str = "steam-game-idler";
const MAX_LINES: usize = 150;

#[tauri::command]
fn log_event(message: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    let app_data_dir = app_handle.path_resolver().app_data_dir()
        .ok_or("Failed to get app data directory")?;
    let app_specific_dir = app_data_dir.parent().unwrap_or(&app_data_dir).join(APP_FOLDER_NAME);
    create_dir_all(&app_specific_dir)
        .map_err(|e| format!("Failed to create app directory: {}", e))?;
    let log_file_path = app_specific_dir.join("log.txt");
    let mut file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(&log_file_path)
        .map_err(|e| format!("Failed to open log file: {}", e))?;
    let reader = BufReader::new(&file);
    let mut lines: Vec<String> = reader.lines()
        .map(|line| line.unwrap_or_default())
        .collect();
    let timestamp = Local::now().format("%b %d %H:%M:%S%.3f").to_string();
    let new_log = format!("{} + {}", timestamp, message);
    lines.insert(0, new_log);
    if lines.len() > MAX_LINES {
        lines.truncate(MAX_LINES);
    }
    file.seek(SeekFrom::Start(0))
        .map_err(|e| format!("Failed to seek to start of file: {}", e))?;
    file.set_len(0)
        .map_err(|e| format!("Failed to truncate file: {}", e))?;
    for line in lines {
        writeln!(file, "{}", line)
            .map_err(|e| format!("Failed to write to log file: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
fn get_app_log_dir(app_handle: tauri::AppHandle) -> Result<String, String> {
    let app_data_dir = app_handle.path_resolver().app_data_dir()
        .ok_or("Failed to get app data directory")?;
    let app_specific_dir = app_data_dir.parent().unwrap_or(&app_data_dir).join(APP_FOLDER_NAME);
    app_specific_dir.to_str()
        .ok_or("Failed to convert path to string".to_string())
        .map(|s| s.to_string())
}