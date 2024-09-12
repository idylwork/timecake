// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
/// ファイル書き込み
#[tauri::command]
fn write_file(path: &str, data: &str) -> bool {
    path != "" && data != ""
}

/// ファイル読み込み
#[tauri::command]
fn read_file(path: &str) -> String {
    format!("file data {}", path)
}

/// ファイルをOS標準のファイルマネージャで開く
#[tauri::command]
fn reveal_file(path: &str) {
  #[cfg(target_os = "windows")]
  {
    Command::new("explorer")
        .args(["/select,", &path])
        .spawn()
        .unwrap();
  }

  #[cfg(target_os = "linux")]
  {
    if path.contains(",") {
      let new_path = match metadata(&path).unwrap().is_dir() {
        true => path,
        false => {
          let mut path2 = PathBuf::from(path);
          path2.pop();
          path2.into_os_string().into_string().unwrap()
        }
      };
      Command::new("xdg-open")
          .arg(&new_path)
          .spawn()
          .unwrap();
    } else {
      if let Ok(Fork::Child) = daemon(false, false) {
        Command::new("dbus-send")
            .args(["--session", "--dest=org.freedesktop.FileManager1", "--type=method_call",
                  "/org/freedesktop/FileManager1", "org.freedesktop.FileManager1.ShowItems",
                  format!("array:string:\"file://{path}\"").as_str(), "string:\"\""])
            .spawn()
            .unwrap();
      }
    }
  }

  #[cfg(target_os = "macos")]
  {
    if path.ends_with("/") {
      Command::new("open")
          .arg(&path)
          .spawn()
          .unwrap();
    } else {
      Command::new("open")
      .args(["-R", &path])
      .spawn()
      .unwrap();
    }
  }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![write_file, read_file, reveal_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
