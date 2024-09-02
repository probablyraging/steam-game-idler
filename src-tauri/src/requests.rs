use reqwest::Client;
use serde_json::{json, Value};
use serde::{Deserialize, Serialize};
use tokio::try_join;
use regex::Regex;
use scraper::{Html, Selector};
use select::document::Document;
use select::predicate::{Class};

pub async fn user_summary(steam_id: String) -> Result<Value, String> {
    let key = std::env::var("KEY").unwrap();
    let url = format!(
        "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key={}&steamids={}",
        key, steam_id
    );

    let client = Client::new();

    match client.get(&url).send().await {
        Ok(response) => {
            let body: Value = response.json().await.map_err(|e| e.to_string())?;
            Ok(body)
        },
        Err(err) => Err(err.to_string()),
    }
}

pub async fn games_list(steam_id: String) -> Result<Value, String> {
    let key = std::env::var("KEY").unwrap();
    let url = format!(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={}&steamid={}&include_appinfo=true&include_played_free_games=true&include_free_sub=true&skip_unvetted_apps=false",
        key, steam_id
    );

    let client = Client::new();

    match client.get(&url).send().await {
        Ok(response) => {
            let body: Value = response.json().await.map_err(|e| e.to_string())?;
            Ok(body)
        },
        Err(err) => Err(err.to_string()),
    }
}

pub async fn game_details(app_id: String) -> Result<Value, String> { 
    let url = format!(
        "https://store.steampowered.com/api/appdetails/?appids={}&l=english", app_id
    );

    let client = Client::new();

    match client.get(&url).send().await {
        Ok(response) => {
            let body: Value = response.json().await.map_err(|e| e.to_string())?;
            Ok(body)
        },
        Err(err) => Err(err.to_string()),
    }
}

pub async fn achievement_data(steam_id: String, app_id: String) -> Result<Value, String> {
    let key = std::env::var("KEY").unwrap();
    let url_one = format!(
        "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key={}&appid={}",
        key, app_id
    );
    let url_two = format!(
        "https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key={}&appid={}&steamid={}",
        key, app_id, steam_id
    );
    let url_three = format!(
        "https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid={}",
        app_id
    );

    let client = Client::new();

    let (res_one, res_two, res_three) = try_join!(
        client.get(&url_one).send(),
        client.get(&url_two).send(),
        client.get(&url_three).send()
    ).map_err(|err| err.to_string())?;

    let body_one: Value = res_one.json().await.map_err(|e| e.to_string())?;
    let body_two: Value = res_two.json().await.map_err(|e| e.to_string())?;
    let body_three: Value = res_three.json().await.map_err(|e| e.to_string())?;

    let combined_response = json!({
        "schema": body_one,
        "userStats": body_two,
        "percentages": body_three,
    });

    Ok(combined_response)
}

pub async fn achievement_unlocker_data(steam_id: String, app_id: String) -> Result<Value, String> {
    let key = std::env::var("KEY").unwrap();
    let url_one = format!(
        "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key={}&appid={}",
        key, app_id
    );
    let url_two = format!(
        "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key={}&appid={}&steamid={}",
        key, app_id, steam_id
    );
    let url_three = format!(
        "https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid={}",
        app_id
    );

    let client = Client::new();

    let (res_one, res_two, res_three) = try_join!(
        client.get(&url_one).send(),
        client.get(&url_two).send(),
        client.get(&url_three).send()
    ).map_err(|err| err.to_string())?;

    let body_one: Value = res_one.json().await.map_err(|e| e.to_string())?;
    let body_two: Value = res_two.json().await.map_err(|e| e.to_string())?;
    let body_three: Value = res_three.json().await.map_err(|e| e.to_string())?;

    let combined_response = json!({
        "schema": body_one,
        "userAchievements": body_two,
        "percentages": body_three,
    });

    Ok(combined_response)
}

pub async fn validate(sid: String, sls: String) -> Result<Value, String> {
    let client = Client::new();
    let response = client
        .get("https://steamcommunity.com/")
        .header("Content-Type", "application/json")
        .header("Cookie", format!("sessionid={}; steamLoginSecure={}", sid, sls))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let html = response.text().await.map_err(|e| e.to_string())?;
    let regex = Regex::new(r"Sign out").map_err(|e| e.to_string())?;
    let regex_two = Regex::new(r#"<a\s+href="https://steamcommunity\.com/(id|profiles)/[^"]*"\s+data-miniprofile="\d+">([^<]+)</a>"#)
        .map_err(|e| e.to_string())?;

    if let Some(_m) = regex.find(&html) {
        if let Some(captures) = regex_two.captures(&html) {
            Ok(serde_json::json!({ "user": captures[2].to_string() }))
        } else {
            Ok(serde_json::json!({ "error": "Not logged in" }))
        }
    } else {
        Ok(serde_json::json!({ "error": "Not logged in" }))
    }
}

pub async fn drops_remaining(sid: String, sls: String, steam_id: String, app_id: String) -> Result<Value, String> {
    let client = Client::new();
    let response = client
        .get(&format!("https://steamcommunity.com/profiles/{}/gamecards/{}", steam_id, app_id))
        .header("Content-Type", "application/json")
        .header("Cookie", format!("sessionid={}; steamLoginSecure={}", sid, sls))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let html = response.text().await.map_err(|e| e.to_string())?;
    let document = Html::parse_document(&html);
    let progress_info_bold = Selector::parse(".progress_info_bold").map_err(|e| e.to_string())?;

    if let Some(element) = document.select(&progress_info_bold).next() {
        let text = element.text().collect::<Vec<_>>().join("");
        if text.contains("No card drops remaining") {
            return Ok(serde_json::json!({ "remaining": 0 }));
        }

        let regex = Regex::new(r"(\d+)\s+card\s+drop(?:s)?\s+remaining").map_err(|e| e.to_string())?;
        if let Some(captures) = regex.captures(&text) {
            let card_drops_remaining = captures[1].parse::<i32>().map_err(|e| e.to_string())?;
            return Ok(serde_json::json!({ "remaining": card_drops_remaining }));
        } else {
            return Ok(serde_json::json!({ "error": "Card drops data not found" }));
        }
    } else {
        return Ok(serde_json::json!({ "error": "Card drops data not found" }));
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct Game {
    name: String,
    id: String,
    remaining: u32,
}

pub async fn games_with_drops(sid: String, sls: String, steam_id: String) -> Result<Value, String> {
    let client = Client::new();
    let mut page = 1;
    let mut games_with_drops = Vec::new();

    loop {
        let url = format!("https://steamcommunity.com/profiles/{}/badges/?sort=p&p={}", steam_id, page);
        let response = client.get(&url)
            .header("Cookie", format!("sessionid={}; steamLoginSecure={}", sid, sls))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let html = response.text().await.map_err(|e| e.to_string())?; 
        let document = Document::from(html.as_str());

        for badge_row in document.find(Class("badge_row")) {
            if let Some(progress_info) = badge_row.find(Class("progress_info_bold")).next() {
                let text = progress_info.text();
                if let Some(captures) = Regex::new(r"(\d+)\s+card\s+drop(?:s)?\s+remaining").unwrap().captures(&text) {
                    let game_name = badge_row.find(Class("badge_title")).next()
                        .map(|e| e.text().trim().to_string())
                        .unwrap_or_default();

                    let app_id = badge_row.find(Class("btn_green_white_innerfade")).next()
                        .and_then(|e| e.attr("href"))
                        .and_then(|href| href.strip_prefix("steam://run/"))
                        .unwrap_or_default();

                    if !app_id.is_empty() {
                        let card_drops_remaining = captures[1].parse().unwrap_or(0);
                        let game_name = game_name.replace("View details", "").trim().to_string();
                        games_with_drops.push(Game {
                            name: game_name,
                            id: app_id.to_string(),
                            remaining: card_drops_remaining,
                        });
                    }
                }
            }
        }

        if let Some(paging_info) = document.find(Class("profile_paging")).next() {
            let paging_text = paging_info.text();
            if let Some(captures) = Regex::new(r"Showing (\d+)-(\d+) of (\d+)").unwrap().captures(&paging_text) {
                if captures[2] == captures[3] {
                    break;
                }
            } else {
                break;
            }
        } else {
            break;
        }

        page += 1;
    }

    Ok(serde_json::json!({ "gamesWithDrops": games_with_drops }))
}


















// pub async fn all_games_with_drops(sid: String, sls: String, steam_id: String) -> Result<Value, String> {
//     let mut page = 1;
//     let mut games_with_drops = Vec::new();

//     loop {
//         let client = Client::new();
//         let response = client
//             .get(&format!("https://steamcommunity.com/profiles/{}/badges/?sort=p&p={}", steam_id, page))
//             .header("Content-Type", "application/json")
//             .header("Cookie", format!("sessionid={}; steamLoginSecure={}", sid, sls))
//             .send()
//             .await
//             .map_err(|e| e.to_string())?;

//         let html = response.text().await.map_err(|e| e.to_string())?;
//         let document = Html::parse_document(&html);
//         let progress_info_bold = Selector::parse(".progress_info_bold").map_err(|e| e.to_string())?;
//         let badge_title = Selector::parse(".badge_title").map_err(|e| e.to_string())?;
//         let btn_green_white_innerfade = Selector::parse(".btn_green_white_innerfade.btn_small_thin").map_err(|e| e.to_string())?;

//         let mut badge_titles = document.select(&badge_title).collect::<Vec<_>>();
//         let mut btn_green_white_innerfade_elements = document.select(&btn_green_white_innerfade).collect::<Vec<_>>();

//         for progress_info_bold_element in document.select(&progress_info_bold) {
//             let text = progress_info_bold_element.text().collect::<Vec<_>>().join("");
//             let regex = Regex::new(r"(\d+)\s+card\s+drop(?:s)?\s+remaining").map_err(|e| e.to_string())?;
//             if let Some(captures) = regex.captures(&text) {
//                 let card_drops_remaining = captures[1].parse::<i32>().map_err(|e| e.to_string())?;

//                 if card_drops_remaining > 0 {
//                     let game_name = badge_titles
//                         .first()
//                         .map(|e| e.text().collect::<Vec<_>>().join(""))
//                         .unwrap_or_default();

//                     let app_id = btn_green_white_innerfade_elements
//                         .first()
//                         .and_then(|e| e.value().attr("href"))
//                         .map(|href| href.replace("steam://run/", ""))
//                         .unwrap_or_default();

//                     println!("{}", app_id);
//                     println!("{}", card_drops_remaining);

//                     let game_info = serde_json::json!({
//                         "name": game_name,
//                         "id": app_id,
//                         "remaining": card_drops_remaining
//                     });

//                     games_with_drops.push(game_info);
//                 }

//                 badge_titles.remove(0);
//                 btn_green_white_innerfade_elements.remove(0);
//             }
//         }

//         let paging_info = document
//             .select(&Selector::parse(".profile_paging").map_err(|e| e.to_string())?)
//             .next()
//             .map(|e| e.text().collect::<Vec<_>>().join(""));

//         let regex = Regex::new(r"Showing (\d+)-(\d+) of (\d+)").map_err(|e| e.to_string())?;
//         if let Some(captures) = regex.captures(&paging_info.unwrap_or_default()) {
//             if captures[2] == captures[3] {
//                 break;
//             }
//         }

//         page += 1;
//     }

//     Ok(serde_json::json!({ "games": games_with_drops }))
// }






// pub async fn all_games_with_drops(sid: String, sls: String, steam_id: String) -> Result<Value, String> {
//     let mut page = 1;
//     let mut games_with_drops = Vec::new();

//     loop {
//         let client = Client::new();
//         let response = client
//             .get(&format!("https://steamcommunity.com/profiles/{}/badges/?sort=p&p={}", steam_id, page))
//             .header("Content-Type", "application/json")
//             .header("Cookie", format!("sessionid={}; steamLoginSecure={}", sid, sls))
//             .send()
//             .await
//             .map_err(|e| e.to_string())?;

//         let html = response.text().await.map_err(|e| e.to_string())?;
//         let document = Html::parse_document(&html);
//         let progress_info_bold = Selector::parse(".progress_info_bold").map_err(|e| e.to_string())?;
//         let badge_title = Selector::parse(".badge_title").map_err(|e| e.to_string())?;
//         let btn_green_white_innerfade = Selector::parse(".btn_green_white_innerfade.btn_small_thin").map_err(|e| e.to_string())?;

//         for element in document.select(&progress_info_bold) {
//             let text = element.text().collect::<Vec<_>>().join("");
//             let regex = Regex::new(r"(\d+)\s+card\s+drop(?:s)?\s+remaining").map_err(|e| e.to_string())?;
//             if let Some(captures) = regex.captures(&text) {
//                 let card_drops_remaining = captures[1].parse::<i32>().map_err(|e| e.to_string())?;

//                 println!("{}", card_drops_remaining);

//                 let game_name = document
//                     .select(&badge_title)
//                     .next()
//                     .map(|e| e.text().collect::<Vec<_>>().join(""))
//                     .unwrap_or_default();

//                 let app_id = document
//                     .select(&btn_green_white_innerfade)
//                     .next()
//                     .and_then(|e| e.value().attr("href"))
//                     .map(|href| href.replace("steam://run/", ""))
//                     .unwrap_or_default();

//                 println!("{}", app_id);

//                 let game_info = serde_json::json!({
//                     "name": game_name,
//                     "id": app_id,
//                     "remaining": card_drops_remaining
//                 });

//                 games_with_drops.push(game_info);
//             }
//         }

//         let paging_info = document
//             .select(&Selector::parse(".profile_paging").map_err(|e| e.to_string())?)
//             .next()
//             .map(|e| e.text().collect::<Vec<_>>().join(""));

//         let regex = Regex::new(r"Showing (\d+)-(\d+) of (\d+)").map_err(|e| e.to_string())?;
//         if let Some(captures) = regex.captures(&paging_info.unwrap_or_default()) {
//             if captures[2] == captures[3] {
//                 break;
//             }
//         }

//         page += 1;
//     }

//     Ok(serde_json::json!({ "games": games_with_drops }))
// }