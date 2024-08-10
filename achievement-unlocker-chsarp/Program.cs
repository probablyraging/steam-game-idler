﻿using System;
using System.Windows.Forms;
using Steamworks;
using System.Threading;

namespace AchievementUnlocker
{
    class Program
    {
        static bool statsReceived = false;
        static Callback<UserStatsReceived_t> statsReceivedCallback;

        static void Main(string[] args)
        {
            if (args.Length < 2)
            {
                MessageBox.Show("Usage: AchievementUnlocker.exe <AppID> <AchievementID>", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            uint appId;
            if (!uint.TryParse(args[0], out appId))
            {
                MessageBox.Show("Invalid AppID. Please provide a valid numeric AppID.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            string achievementId = args[1];

            Environment.SetEnvironmentVariable("SteamAppId", appId.ToString());

            if (!SteamAPI.Init())
            {
                MessageBox.Show("Make sure Steam is running first.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            try
            {
                statsReceivedCallback = Callback<UserStatsReceived_t>.Create(OnUserStatsReceived);

                if (!SteamUserStats.RequestCurrentStats())
                {
                    MessageBox.Show("Failed to request stats from Steam.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                DateTime startTime = DateTime.Now;
                while (!statsReceived)
                {
                    SteamAPI.RunCallbacks();
                    if ((DateTime.Now - startTime).TotalSeconds > 10)
                    {
                        MessageBox.Show("Timed out waiting for stats from Steam.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                        }
                        else
                        {
                            MessageBox.Show("Failed to lock achievement", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        }
                    }
                    else
                    {
                        if (SteamUserStats.SetAchievement(achievementId))
                        {
                            SteamUserStats.StoreStats();
                        }
                        else
                        {
                            MessageBox.Show("Failed to unlock achievement", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        }
                    }
                }
                else
                {
                    MessageBox.Show("Failed to get achievement data. It might not exist.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"An error occurred: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                    MessageBox.Show($"Failed to receive stats from Steam. Error code: {pCallback.m_eResult}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }
    }
}