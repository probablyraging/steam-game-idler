#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod requests;
pub mod mongodb;

use std::env;
use chrono::Local;
use std::path::PathBuf;
use std::os::windows::process::CommandExt;
use std::process::Stdio;
use std::fs::{OpenOptions, create_dir_all};
use std::io::{BufRead, BufReader, Write, Seek, SeekFrom};
use serde_json::Value;
use requests::*;
use mongodb::*;
use window_shadows::set_shadow;
use tauri::Manager;

fn main() {
    if cfg!(debug_assertions) {
        dotenv::from_filename(".env.dev").unwrap().load();
    }else{
        let prod_env = include_str!("../../.env.prod");
        let result = dotenv::from_read(prod_env.as_bytes()).unwrap();
        result.load();
    }
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            set_shadow(&window, true).unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_file_path, 
            check_status,
            start_idle,
            stop_idle,
            unlock_achievement,
            lock_achievement,
            update_stat,
            log_event,
            get_app_log_dir,
            check_steam_status,
            get_user_summary,
            get_games_list,
            get_achievement_data,
            get_achievement_unlocker_data,
            validate_session,
            get_drops_remaining,
            get_games_with_drops,
            get_game_details,
            open_file_explorer,
            db_update_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn get_user_summary(steam_id: String) -> Result<Value, String> {
    user_summary(steam_id).await
}

#[tauri::command]
async fn get_games_list(steam_id: String) -> Result<Value, String> {
    games_list(steam_id).await
}

#[tauri::command]
async fn get_achievement_data(steam_id: String, app_id: String) -> Result<Value, String> {
    achievement_data(steam_id, app_id).await
}

#[tauri::command]
async fn get_achievement_unlocker_data(steam_id: String, app_id: String) -> Result<Value, String> {
    achievement_unlocker_data(steam_id, app_id).await
}

#[tauri::command]
async fn validate_session(sid: String, sls: String) -> Result<Value, String> {
    validate(sid, sls).await
}

#[tauri::command]
async fn get_drops_remaining(sid: String, sls: String, steam_id: String, app_id: String) -> Result<Value, String> {
    drops_remaining(sid, sls, steam_id, app_id).await
}

#[tauri::command]
async fn get_games_with_drops(sid: String, sls: String, steam_id: String) -> Result<Value, String> {
    games_with_drops(sid, sls, steam_id).await
}

#[tauri::command]
async fn get_game_details(app_id: String) -> Result<Value, String> {
    game_details(app_id).await
}

#[tauri::command]
async fn db_update_stats(stat: String, count: i32) -> Result<Value, String> {
    update_stats(stat, count).await
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
fn check_steam_status(file_path: String) -> Result<String, String> {
    let output = std::process::Command::new(file_path)
        .arg("check_steam")
        .creation_flags(0x08000000)
        .output()
        .map_err(|e| e.to_string())?;
    let output_str = String::from_utf8_lossy(&output.stdout);
    if output_str.contains("Steam is not running") {
        Ok("not_running".to_string())
    } else {
        let steam_id = output_str
            .split("steamId ")
            .nth(1)
            .ok_or("Failed to parse Steam ID")?
            .trim();
        Ok(steam_id.to_string())
    }
}

#[tauri::command]
fn start_idle(file_path: String, app_id: String, quiet: String) -> Result<(), String> {
    std::process::Command::new(file_path)
        .args(&["idle", &app_id, &quiet])
        .creation_flags(0x08000000)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn stop_idle(app_id: String) -> Result<(), String> {
    let wmic_output = std::process::Command::new("wmic")
        .args(&["process", "get", "processid,commandline"])
        .creation_flags(0x08000000)
        .output()
        .expect("failed to get process");
    let wmic_stdout = String::from_utf8_lossy(&wmic_output.stdout);
    let pid = wmic_stdout.lines()
        .find(|line| line.contains(&app_id))
        .and_then(|line| line.split_whitespace().last())
        .ok_or_else(|| "No matching process found".to_string())?;
    std::process::Command::new("taskkill")
        .args(&["/F", "/PID", pid])
        .creation_flags(0x08000000)
        .output()
        .expect("failed to kill process");
    Ok(())
}

#[tauri::command]
fn unlock_achievement(file_path: String, app_id: String, achievement_id: String, unlock_all: bool) -> Result<(), String> {
    let unlock_all_arg = if unlock_all { "true" } else { "false" }.to_string();
    std::process::Command::new(file_path)
        .args(&["unlock", &app_id, &achievement_id, &unlock_all_arg])
        .output()
        .expect("failed to execute unlocker");
    Ok(())
}

#[tauri::command]
fn lock_achievement(file_path: String, app_id: String, achievement_id: String) -> Result<(), String> {
    std::process::Command::new(file_path)
        .args(&["lock_all", &app_id, &achievement_id])
        .output()
        .expect("failed to execute unlocker");
    Ok(())
}

#[tauri::command]
fn update_stat(file_path: String, app_id: String, stat_name: String, new_value: String) -> Result<(), String> {
    std::process::Command::new(file_path)
        .args(&["update_stat", &app_id, &stat_name, &new_value])
        .output()
        .expect("failed to execute stat updater");
    Ok(())
}

const APP_FOLDER_NAME: &str = "steam-game-idler";
const MAX_LINES: usize = 500;

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
    let mask_one = mask_sensitive_data(&message, "711B8063");
    let mask_two = mask_sensitive_data(&mask_one, "3DnyBUX");
    let new_log = format!("{} + {}", timestamp, mask_two);
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

#[tauri::command]
fn open_file_explorer(path: String) -> Result<(), String> {
        std::process::Command::new("explorer")
            .args(["/select,", &path])
            .creation_flags(0x08000000)
            .spawn()
            .map_err(|e| e.to_string())?;
    Ok(())
}

fn mask_sensitive_data(message: &str, sensitive_data: &str) -> String {
    if let Some(start_index) = message.find(sensitive_data) {
        let end_index = start_index + sensitive_data.len();
        let mask_start = start_index.saturating_sub(5);
        let mask_end = (end_index + 5).min(message.len());
        let mask_length = mask_end - mask_start;
        
        let mut masked_message = message.to_string();
        masked_message.replace_range(mask_start..mask_end, &"*".repeat(mask_length));
        masked_message
    } else {
        message.to_string()
    }
}