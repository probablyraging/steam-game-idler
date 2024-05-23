import fs from 'fs/promises';
import path from 'path';

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function updateConfig(updates) {
    const configPath = path.join(process.cwd(), '/config.json');
    try {
        const data = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(data);
        Object.assign(config, updates);
        const updatedConfig = JSON.stringify(config, null, 4);
        await fs.writeFile(configPath, updatedConfig);
    } catch (error) {
        console.error('Error updating config:', error);
    }
}