using System;
using System.Windows.Forms;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace Idler
{
    public partial class FormIdler : Form
    {
        private long appid;

        public FormIdler(long appid)
        {
            this.appid = appid;
            InitializeComponent();
            appHeader.Load($"https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header_292x136.jpg");
        }

        private async void FormIdler_Load(object sender, EventArgs e)
        {
            await GetAppName(appid);
        }

        private async Task GetAppName(long appid)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    var response = await client.GetAsync($"https://store.steampowered.com/api/appdetails?appids={appid}");
                    response.EnsureSuccessStatusCode();
                    var responseBody = await response.Content.ReadAsStringAsync();

                    // Parse the JSON response to get the app name
                    var jsonData = JsonConvert.DeserializeObject<Dictionary<string, JObject>>(responseBody);
                    var data = (JObject)jsonData[appid.ToString()];
                    var appName = (string)data["data"]["name"];
                    if (string.IsNullOrWhiteSpace(appName))
                    {
                        appName = "Unknown App";
                    }
                    this.Text = $"{appName} - Idling";
                }
            }
            catch (Exception)
            {
                this.Text = "Idling";
            }
        }
    }
}