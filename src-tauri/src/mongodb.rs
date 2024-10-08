use lazy_static::lazy_static;
use mongodb::{bson::{doc, Document}, Client, Collection};
use serde_json::Value;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

lazy_static! {
    static ref MONGO_CLIENT: Arc<Mutex<Option<Client>>> = Arc::new(Mutex::new(None));
}

#[derive(Deserialize)]
pub struct UpdateStatsInput {
    pub stat: String,
    pub count: i32,
}

#[derive(Serialize)]
pub struct UpdateStatsOutput {
    pub result: Document,
}

async fn get_client() -> Result<Client, String> {
    let mut client_option = MONGO_CLIENT.lock().await;
    if let Some(client) = client_option.as_ref() {
        Ok(client.clone())
    } else {
        let mongo_srv = std::env::var("MONGO_SRV").map_err(|e| e.to_string())?;
        let new_client = Client::with_uri_str(&mongo_srv).await.map_err(|e| e.to_string())?;
        *client_option = Some(new_client.clone());
        Ok(new_client)
    }
}

#[tauri::command]
pub async fn db_update_stats(stat: String, count: i32) -> Result<Value, String> {
    let client = get_client().await?;
    let db = client.database("chromeext");
    let collection: Collection<Document> = db.collection("sgistatistics");
    let filter = doc! {};
    let update = doc! { "$inc": { stat: count } }; 
    let result = collection
        .update_one(filter, update)
        .await
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({ "result": result }))
}