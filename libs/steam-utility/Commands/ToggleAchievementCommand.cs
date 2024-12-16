using System;
using System.Threading;
using System.Windows.Forms;
using Steamworks;

namespace SteamUtility.Commands
{
    public class ToggleAchievementCommand : ICommand
    {
        static bool statsReceived = false;
        static Callback<UserStatsReceived_t> statsReceivedCallback;

        public void Execute(string[] args)
        {
            if (args.Length < 2)
            {
                MessageBox.Show(
                    "Usage: SteamUtility.exe toggle_achievement <AppID> <AchievementID>",
                    "Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return;
            }

            uint appId;
            string achievementId = args[2];

            if (!uint.TryParse(args[1], out appId))
            {
                MessageBox.Show(
                    "Invalid AppID. Please provide a valid numeric AppID.",
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

            try
            {
                CSteamID steamId = SteamUser.GetSteamID();
                statsReceivedCallback = Callback<UserStatsReceived_t>.Create(OnUserStatsReceived);
                SteamAPICall_t apiCall = SteamUserStats.RequestUserStats(steamId);

                if (apiCall == SteamAPICall_t.Invalid)
                {
                    MessageBox.Show(
                        "Failed to request stats from Steam.",
                        "Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                DateTime startTime = DateTime.Now;
                while (!statsReceived)
                {
                    SteamAPI.RunCallbacks();
                    if ((DateTime.Now - startTime).TotalSeconds > 10)
                    {
                        MessageBox.Show(
                            "Timed out waiting for stats from Steam.",
                            "Error",
                            MessageBoxButtons.OK,
                            MessageBoxIcon.Error
                        );
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
                            MessageBox.Show(
                                "Failed to lock achievement.",
                                "Error",
                                MessageBoxButtons.OK,
                                MessageBoxIcon.Error
                            );
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
                            MessageBox.Show(
                                "Failed to unlock achievement.",
                                "Error",
                                MessageBoxButtons.OK,
                                MessageBoxIcon.Error
                            );
                        }
                    }
                }
                else
                {
                    MessageBox.Show(
                        "Failed to get achievement data. It might not exist.",
                        "Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"An error occurred: {ex.Message}",
                    "Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
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
                    MessageBox.Show(
                        $"Failed to receive stats from Steam. Error code: {pCallback.m_eResult}",
                        "Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                }
            }
        }
    }
}
