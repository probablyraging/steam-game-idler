﻿using System;
using System.Threading;
using System.Windows.Forms;
using System.Diagnostics;
using Steamworks;

namespace Idler
{
    static class Program
    {
        static void Main(string[] args)
        {
            if (args.Length < 2)
            {
                Console.WriteLine("Usage: Idler.exe <SteamAppId> <true|false>");
                return;
            }

            if (!long.TryParse(args[0], out long appId))
            {
                Console.WriteLine("Please provide a valid Steam App ID (e.g. 221100).");
                return;
            }

            Environment.SetEnvironmentVariable("SteamAppId", appId.ToString());

            if (!SteamAPI.Init())
            {
                Console.WriteLine("Failed to initialize Steam API.");
                return;
            }

            bool quietMode = args[1].ToLower() == "true";

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