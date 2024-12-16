using System;
using System.Windows.Forms;
using Steamworks;

namespace SteamUtility.Commands
{
    public class CheckSteamCommand : ICommand
    {
        public void Execute(string[] args)
        {
            Environment.SetEnvironmentVariable("SteamAppId", "480");

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

            CSteamID steamId = SteamUser.GetSteamID();
            Console.WriteLine($"steamId {steamId.m_SteamID}");

            SteamAPI.Shutdown();
        }
    }
}
