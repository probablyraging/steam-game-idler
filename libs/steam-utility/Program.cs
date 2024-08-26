﻿using System;
using System.Threading;
using System.Windows.Forms;
using System.Diagnostics;
using System.IO;
using Steamworks;

namespace SteamUtility
{
    static class Program
    {
        static bool statsReceived = false;
        static Callback<UserStatsReceived_t> statsReceivedCallback;

        static void Main(string[] args)
        {
            if (args.Length == 0)
            {
                Console.WriteLine("Usage: SteamUtility.exe <command> [arguments]");
                Console.WriteLine("Commands:");
                Console.WriteLine("  check_steam");
                Console.WriteLine("  idle <AppID> <true|false>");
                Console.WriteLine("  unlock <AppID> <AchievementID> [UnlockAll]");
                return;
            }

            string command = args[0].ToLower();

            switch (command)
            {
                case "check_steam":
                    CheckSteamAndGetUserId();
                    break;
                case "idle":
                    HandleIdleCommand(args);
                    break;
                case "unlock":
                    HandleUnlockCommand(args);
                    break;
                case "lock_all":
                    HandleLockAllCommand(args);
                    break;
                default:
                    Console.WriteLine("Unknown command. Use 'check_steam', 'idle', or 'unlock'.");
                    break;
            }
        }

        static void CheckSteamAndGetUserId()
        {
            Environment.SetEnvironmentVariable("SteamAppId", "480");

            if (!SteamAPI.Init())
            {
                Console.WriteLine("Steam is not running");
                return;
            }

            CSteamID steamId = SteamUser.GetSteamID();
            Console.WriteLine($"steamId {steamId.m_SteamID}");

            SteamAPI.Shutdown();
        }

        static void HandleIdleCommand(string[] args)
        {
            if (args.Length < 3)
            {
                Console.WriteLine("Usage: SteamUtility.exe idle <AppID> <true|false>");
                return;
            }

            if (!uint.TryParse(args[1], out uint appId))
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

        static void HandleUnlockCommand(string[] args)
        {
            if (args.Length < 3)
            {
                Console.WriteLine("Usage: SteamUtility.exe unlock <AppID> <AchievementID> [UnlockAll]");
                return;
            }

            uint appId;
            if (!uint.TryParse(args[1], out appId))
            {
                Console.WriteLine("Invalid AppID. Please provide a valid numeric AppID.");
                return;
            }

            string achievementId = args[2];
            bool unlockAll = args.Length > 3 && bool.TryParse(args[3], out var result) && result;

            Environment.SetEnvironmentVariable("SteamAppId", appId.ToString());

            if (!SteamAPI.Init())
            {
                Console.WriteLine("Make sure Steam is running first.");
                return;
            }

            try
            {
                statsReceivedCallback = Callback<UserStatsReceived_t>.Create(OnUserStatsReceived);

                if (!SteamUserStats.RequestCurrentStats())
                {
                    Console.WriteLine("Failed to request stats from Steam.");
                    return;
                }

                DateTime startTime = DateTime.Now;
                while (!statsReceived)
                {
                    SteamAPI.RunCallbacks();
                    if ((DateTime.Now - startTime).TotalSeconds > 10)
                    {
                        Console.WriteLine("Timed out waiting for stats from Steam.");
                        return;
                    }
                    Thread.Sleep(100);
                }

                bool isAchieved;
                if (unlockAll)
                {
                    if (SteamUserStats.GetAchievement(achievementId, out isAchieved))
                    {
                        if (!isAchieved)
                        {
                            if (SteamUserStats.SetAchievement(achievementId))
                            {
                                SteamUserStats.StoreStats();
                                Console.WriteLine("Achievement unlocked successfully.");
                            }
                            else
                            {
                                Console.WriteLine("Failed to unlock achievement");
                            }
                        }
                        else
                        {
                            Console.WriteLine("Achievement already unlocked.");
                        }
                    }
                    else
                    {
                        Console.WriteLine("Failed to get achievement data. It might not exist.");
                    }
                }
                else
                {
                    if (SteamUserStats.GetAchievement(achievementId, out isAchieved))
                    {
                        if (isAchieved)
                        {
                            if (SteamUserStats.ClearAchievement(achievementId))
                            {
                                SteamUserStats.StoreStats();
                                Console.WriteLine("Achievement locked successfully.");
                            }
                            else
                            {
                                Console.WriteLine("Failed to lock achievement");
                            }
                        }
                        else
                        {
                            if (SteamUserStats.SetAchievement(achievementId))
                            {
                                SteamUserStats.StoreStats();
                                Console.WriteLine("Achievement unlocked successfully.");
                            }
                            else
                            {
                                Console.WriteLine("Failed to unlock achievement");
                            }
                        }
                    }
                    else
                    {
                        Console.WriteLine("Failed to get achievement data. It might not exist.");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
            }
            finally
            {
                SteamAPI.Shutdown();
            }
        }

        static void HandleLockAllCommand(string[] args)
        {
            if (args.Length < 3)
            {
                Console.WriteLine("Usage: SteamUtility.exe lock <AppID> <AchievementID> [LockAll]");
                return;
            }

            uint appId;
            if (!uint.TryParse(args[1], out appId))
            {
                Console.WriteLine("Invalid AppID. Please provide a valid numeric AppID.");
                return;
            }

            string achievementId = args[2];

            Environment.SetEnvironmentVariable("SteamAppId", appId.ToString());

            if (!SteamAPI.Init())
            {
                Console.WriteLine("Make sure Steam is running first.");
                return;
            }

            try
            {
                statsReceivedCallback = Callback<UserStatsReceived_t>.Create(OnUserStatsReceived);

                if (!SteamUserStats.RequestCurrentStats())
                {
                    Console.WriteLine("Failed to request stats from Steam.");
                    return;
                }

                DateTime startTime = DateTime.Now;
                while (!statsReceived)
                {
                    SteamAPI.RunCallbacks();
                    if ((DateTime.Now - startTime).TotalSeconds > 10)
                    {
                        Console.WriteLine("Timed out waiting for stats from Steam.");
                        return;
                    }
                    Thread.Sleep(100);
                }

                bool isAchieved;
                if (SteamUserStats.GetAchievement(achievementId, out isAchieved))
                    {
                        if (isAchieved)
                        {
                            if (SteamUserStats.ClearAchievement(achievementId))
                            {
                                SteamUserStats.StoreStats();
                                Console.WriteLine("Achievement locked successfully.");
                            }
                            else
                            {
                                Console.WriteLine("Failed to lock achievement");
                            }
                        }
                    }
                    else
                    {
                        Console.WriteLine("Failed to get achievement data. It might not exist.");
                    }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
            }
            finally
            {
                SteamAPI.Shutdown();
            }
        }

        static void OnUserStatsReceived(UserStatsReceived_t pCallback)
        {
            if (pCallback.m_nGameID == SteamUtils.GetAppID().m_AppId)
            {
                if (pCallback.m_eResult == EResult.k_EResultOK)
                {
                    statsReceived = true;
                }
                else
                {
                    Console.WriteLine($"Failed to receive stats from Steam. Error code: {pCallback.m_eResult}");
                }
            }
        }

        static bool IsProcessRunning(string processName)
        {
            return Process.GetProcessesByName(processName).Length > 0;
        }
    }
}