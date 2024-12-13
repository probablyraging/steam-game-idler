use std::os::windows::process::CommandExt;
use std::process::Child;
use std::sync::{Arc, Mutex};

lazy_static::lazy_static! {
    pub static ref SPAWNED_PROCESSES: Arc<Mutex<Vec<Child>>> = Arc::new(Mutex::new(Vec::new()));
}

#[tauri::command]
pub fn start_idle(file_path: String, app_id: String, quiet: String) -> Result<(), String> {
    let child = std::process::Command::new(&file_path)
        .args(&["idle", &app_id, &quiet])
        .creation_flags(0x08000000)
        .spawn()
        .map_err(|e| e.to_string())?;
    
    SPAWNED_PROCESSES.lock().unwrap().push(child);
    Ok(())
}

#[tauri::command]
pub async fn stop_idle(app_id: String) -> Result<(), String> {
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
pub fn unlock_achievement(file_path: String, app_id: String, achievement_id: String, unlock_all: bool) -> Result<(), String> {
    let unlock_all_arg = if unlock_all { "true" } else { "false" }.to_string();
    std::process::Command::new(file_path)
        .args(&["unlock", &app_id, &achievement_id, &unlock_all_arg])
        .output()
        .expect("failed to execute unlocker");
    Ok(())
}

#[tauri::command]
pub fn lock_achievement(file_path: String, app_id: String, achievement_id: String) -> Result<(), String> {
    std::process::Command::new(file_path)
        .args(&["lock_all", &app_id, &achievement_id])
        .output()
        .expect("failed to execute unlocker");
    Ok(())
}

#[tauri::command]
pub fn update_stat(file_path: String, app_id: String, stat_name: String, new_value: String) -> Result<(), String> {
    std::process::Command::new(file_path)
        .args(&["update_stat", &app_id, &stat_name, &new_value])
        .output()
        .expect("failed to execute stat updater");
    Ok(())
}

#[tauri::command]
pub fn start_mobile_server(file_path: String, local: String, port: String) -> Result<i32, String> {
    let child = std::process::Command::new(&file_path)
        .args(&[&local, &port])
        // .creation_flags(0x08000000)
        .creation_flags(0x00000010)
        .spawn()
        .map_err(|e| e.to_string())?;

    let pid = child.id() as i32;
    
    SPAWNED_PROCESSES.lock().unwrap().push(child);

    Ok(pid)
}

#[tauri::command]
pub fn is_mobile_server_running(pid: i32) -> bool {
    let output = std::process::Command::new("tasklist")
        .arg("/FI")
        .arg(format!("PID eq {}", pid))
        .output();

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            stdout.contains(&pid.to_string())
        }
        Err(_) => false
    }
}