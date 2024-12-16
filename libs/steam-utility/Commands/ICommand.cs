using System;

namespace SteamUtility.Commands
{
    public interface ICommand
    {
        void Execute(string[] args);
    }
}
