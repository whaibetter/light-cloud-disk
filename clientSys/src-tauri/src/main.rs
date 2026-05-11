// 轻量云盘 - Tauri 2.0 桌面端入口
// Windows / macOS / Linux 桌面应用入口点

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    light_cloud_disk_lib::run()
}
