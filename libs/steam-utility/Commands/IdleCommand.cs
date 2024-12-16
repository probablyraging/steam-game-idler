using System;
using System.Diagnostics;
using System.Threading;
using System.Windows.Forms;
using Steamworks;

namespace SteamUtility.Commands
{
    public class IdleCommand : ICommand
    {
        public void Execute(string[] args)
        {
            if (args.Length < 3)
            {
                MessageBox.Show(
                    "Usage: SteamUtility.exe idle <AppID> <true|false>",
                    "Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return;
            }

            if (!uint.TryParse(args[1], out uint appId))
            {
                MessageBox.Show(
                    "Invalid AppID. Please provide a valid Steam AppID (e.g. 221100).",
                    "Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return;
            }

            Environment.SetEnvironmentVariable("SteamAppId", appId.ToString());

            if (!SteamAPI.Init())
            {
                MessageBox.Show(
                    "Failed to initialize the Steam API. Is Steam running?",
                    "Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return;
            }

            bool quietMode = args[2].ToLower() == "true";

            if (!quietMode)
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new FormIdler(appId));
            }
            else
            {
                while (true)
                {
                    SteamAPI.RunCallbacks();

                    if (!IsProcessRunning("Steam Game Idler"))
                    {
                        Console.WriteLine("Steam Game Idler.exe process not found. Exiting.");
                        break;
                    }

                    Thread.Sleep(5000);
                }
            }

            SteamAPI.Shutdown();
        }

        static bool IsProcessRunning(string processName)
        {
            return Process.GetProcessesByName(processName).Length > 0;
        }
    }
}
