﻿using System;
using System.Windows.Forms;
using Steamworks;

namespace Idler
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            if (args.Length == 0)
            {
                Console.WriteLine("No Steam app ID was provided.");
                return;
            }

            long appId;
            if (!long.TryParse(args[0], out appId))
            {
                Console.WriteLine("Please provide a valid ID (e.g. 221100).");
                return;
            }

            Environment.SetEnvironmentVariable("SteamAppId", appId.ToString());

            if (!SteamAPI.Init())
            {
                Console.WriteLine("Failed to initialize Steam API.");
                return;
            }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new FormIdler(appId));
        }
    }
}